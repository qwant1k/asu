import re

from django.core.exceptions import ObjectDoesNotExist
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from apps.requests.models import ApprovalStep

from .codegen import (
    base_asset_type,
    code_prefix,
    ensure_unique_code,
    normalize_reference_code,
)
from .models import Asset, AssetCategory, Contract, Counterparty, LimitNorm, Position, RequestType, UnitOfMeasure, Warehouse


class CounterpartySerializer(serializers.ModelSerializer):
    contracts_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Counterparty
        fields = [
            'id', 'name', 'bin', 'address', 'contact_person',
            'phone', 'email', 'is_active', 'created_at', 'updated_at',
            'contracts_count',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate_bin(self, value):
        if not re.match(r'^\d{12}$', value):
            raise serializers.ValidationError(_('БИН должен состоять из 12 цифр.'))
        qs = Counterparty.objects.filter(bin=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(_('Контрагент с таким БИН уже существует.'))
        return value


class ContractSerializer(serializers.ModelSerializer):
    counterparty_name = serializers.CharField(source='counterparty.name', read_only=True)
    counterparty_bin = serializers.CharField(source='counterparty.bin', read_only=True)

    class Meta:
        model = Contract
        fields = [
            'id', 'name', 'contract_date', 'valid_until',
            'counterparty', 'counterparty_name', 'counterparty_bin',
            'pdf_file', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate_pdf_file(self, value):
        if value and not value.name.lower().endswith('.pdf'):
            raise serializers.ValidationError(_('Загрузите файл в формате PDF.'))
        return value

    def validate(self, attrs):
        contract_date = attrs.get('contract_date') or (self.instance and self.instance.contract_date)
        valid_until = attrs.get('valid_until') or (self.instance and self.instance.valid_until)
        if contract_date and valid_until and valid_until < contract_date:
            raise serializers.ValidationError({'valid_until': _('Срок действия не может быть раньше даты договора.')})
        return attrs


class LimitNormSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True, default='')
    asset_type_display = serializers.CharField(source='get_asset_type_display', read_only=True)
    period_display = serializers.CharField(source='get_period_display', read_only=True)

    class Meta:
        model = LimitNorm
        fields = [
            'id', 'asset_type', 'asset_type_display', 'category',
            'quantity_limit', 'period', 'period_display',
            'department', 'department_name',
            'valid_from', 'valid_to', 'created_by', 'created_at',
        ]
        read_only_fields = ['created_by', 'created_at']

    def validate_quantity_limit(self, value):
        if value <= 0:
            raise serializers.ValidationError(_('Лимит должен быть больше нуля.'))
        return value

    def validate(self, attrs):
        valid_from = attrs.get('valid_from') or (self.instance and self.instance.valid_from)
        valid_to = attrs.get('valid_to') or (self.instance and self.instance.valid_to)
        if valid_from and valid_to and valid_to <= valid_from:
            raise serializers.ValidationError({'valid_to': _('Дата окончания должна быть позже даты начала.')})
        return attrs


class ApprovalStepSerializer(serializers.ModelSerializer):
    approver_role_display = serializers.CharField(source='get_approver_role_display', read_only=True)

    class Meta:
        model = ApprovalStep
        fields = [
            'id', 'request_type', 'order', 'approver_role', 'approver_role_display',
            'title', 'requires_supervisor', 'is_active',
        ]

    def validate(self, attrs):
        request_type = attrs.get('request_type') or (self.instance and self.instance.request_type)
        order = attrs.get('order') or (self.instance and self.instance.order)
        if request_type and order:
            qs = ApprovalStep.objects.filter(request_type=request_type, order=order)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError({'order': _('Этап с таким порядком уже существует для этого вида заявки.')})
        return attrs


class RequestTypeSerializer(serializers.ModelSerializer):
    asset_type_display = serializers.CharField(source='get_asset_type_display', read_only=True)
    approval_steps = ApprovalStepSerializer(many=True, read_only=True)

    class Meta:
        model = RequestType
        fields = [
            'id', 'name', 'code', 'asset_type', 'asset_type_display',
            'requires_long_term_use', 'description', 'is_active', 'approval_steps',
        ]
        extra_kwargs = {
            'code': {'required': False, 'allow_blank': True, 'validators': []},
        }

    def validate(self, attrs):
        asset_type = attrs.get('asset_type') or (self.instance and self.instance.asset_type)
        prefix = code_prefix(asset_type, 'REQ')
        code = normalize_reference_code(
            RequestType,
            attrs.get('code') if 'code' in attrs else getattr(self.instance, 'code', ''),
            prefix,
            self.instance,
        )
        if not ensure_unique_code(RequestType, code, self.instance):
            raise serializers.ValidationError({'code': _('Вид заявки с таким кодом уже существует.')})
        attrs['code'] = code
        return attrs


class AssetCategorySerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source='parent.name', read_only=True, default='')
    asset_type_display = serializers.CharField(source='get_asset_type_display', read_only=True)
    asset_count = serializers.IntegerField(read_only=True, default=0)
    group_total_quantity = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True, default=0)

    class Meta:
        model = AssetCategory
        fields = [
            'id', 'name', 'code', 'asset_type', 'asset_type_display',
            'parent', 'parent_name', 'asset_count', 'group_total_quantity',
        ]
        extra_kwargs = {
            'code': {'required': False, 'allow_blank': True, 'validators': []},
        }

    def validate(self, attrs):
        asset_type = attrs.get('asset_type') or (self.instance and self.instance.asset_type)
        parent = attrs.get('parent') if 'parent' in attrs else (self.instance and self.instance.parent)
        if parent and parent.asset_type != asset_type:
            raise serializers.ValidationError({'parent': _('Родительская группа должна соответствовать типу актива.')})

        prefix = code_prefix(asset_type, 'GRP')
        code = normalize_reference_code(
            AssetCategory,
            attrs.get('code') if 'code' in attrs else getattr(self.instance, 'code', ''),
            prefix,
            self.instance,
        )
        if not ensure_unique_code(AssetCategory, code, self.instance):
            raise serializers.ValidationError({'code': _('Группа с таким кодом уже существует.')})
        attrs['code'] = code
        return attrs


class AssetSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True, default='')
    unit_of_measure = serializers.CharField(required=False, allow_blank=True)
    unit_of_measure_ref_name = serializers.CharField(source='unit_of_measure_ref.name', read_only=True, default='')
    asset_type_display = serializers.CharField(source='get_asset_type_display', read_only=True)
    stock_quantity = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True, default=0)
    stock_total_amount = serializers.SerializerMethodField()
    stock_balance_date = serializers.SerializerMethodField()
    stock_location = serializers.SerializerMethodField()
    warehouse = serializers.SerializerMethodField()
    warehouse_name = serializers.SerializerMethodField()

    class Meta:
        model = Asset
        fields = [
            'id', 'name', 'code', 'asset_type', 'asset_type_display',
            'category', 'category_name', 'group', 'group_name',
            'unit_of_measure', 'unit_of_measure_ref', 'unit_of_measure_ref_name', 'unit_price',
            'is_long_term_use', 'inventory_number', 'balance_date',
            'useful_life_months', 'depreciation_rate',
            'source_1c_id', 'last_sync_at', 'created_at', 'updated_at',
            'stock_quantity', 'stock_total_amount', 'stock_balance_date',
            'stock_location', 'warehouse', 'warehouse_name',
        ]
        read_only_fields = ['source_1c_id', 'last_sync_at', 'created_at', 'updated_at']
        extra_kwargs = {
            'code': {'required': False, 'allow_blank': True, 'validators': []},
        }

    def _stock(self, obj):
        try:
            return obj.warehouse_stock
        except ObjectDoesNotExist:
            return None

    def get_stock_total_amount(self, obj):
        stock = self._stock(obj)
        return str(stock.total_amount) if stock else '0.00'

    def get_stock_balance_date(self, obj):
        stock = self._stock(obj)
        return stock.balance_date.isoformat() if stock and stock.balance_date else None

    def get_stock_location(self, obj):
        stock = self._stock(obj)
        return stock.location if stock else ''

    def get_warehouse(self, obj):
        stock = self._stock(obj)
        return stock.warehouse_id if stock else None

    def get_warehouse_name(self, obj):
        stock = self._stock(obj)
        return stock.warehouse.name if stock and stock.warehouse_id else ''

    def _sync_unit(self, attrs):
        if 'unit_of_measure_ref' in attrs:
            unit_ref = attrs.get('unit_of_measure_ref')
            attrs['unit_of_measure'] = unit_ref.name if unit_ref else ''
        elif attrs.get('unit_of_measure'):
            unit_name = attrs.get('unit_of_measure', '').strip()
            unit_ref = UnitOfMeasure.objects.filter(name__iexact=unit_name).first()
            if unit_ref:
                attrs['unit_of_measure_ref'] = unit_ref
                attrs['unit_of_measure'] = unit_ref.name
        return attrs

    def validate_inventory_number(self, value):
        if not value:
            return value
        qs = Asset.objects.filter(inventory_number=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(_('Актив с таким инвентарным номером уже существует.'))
        return value

    def validate(self, attrs):
        asset_type = attrs.get('asset_type') or (self.instance and self.instance.asset_type)
        inventory_number = attrs.get('inventory_number')
        category = attrs.get('category') if 'category' in attrs else (self.instance and self.instance.category)
        group = attrs.get('group') if 'group' in attrs else (self.instance and self.instance.group)
        if asset_type in ('OS', 'NMA') and not self.instance and not inventory_number:
            raise serializers.ValidationError({'inventory_number': _('Инвентарный номер обязателен для ОС и НМА.')})
        base_type = base_asset_type(asset_type)
        if category and category.asset_type != base_type:
            raise serializers.ValidationError({'category': _('Категория должна соответствовать типу актива.')})
        if group and group.asset_type != base_type:
            raise serializers.ValidationError({'group': _('Группа должна соответствовать типу актива.')})
        unit = attrs.get('unit_of_measure') or (self.instance and self.instance.unit_of_measure)
        unit_ref = attrs.get('unit_of_measure_ref') if 'unit_of_measure_ref' in attrs else (self.instance and self.instance.unit_of_measure_ref)
        if not unit and not unit_ref:
            raise serializers.ValidationError({'unit_of_measure_ref': _('Выберите единицу измерения.')})

        prefix = code_prefix(asset_type)
        code = normalize_reference_code(
            Asset,
            attrs.get('code') if 'code' in attrs else getattr(self.instance, 'code', ''),
            prefix,
            self.instance,
        )
        if not ensure_unique_code(Asset, code, self.instance):
            raise serializers.ValidationError({'code': _('Актив с таким кодом уже существует.')})
        attrs['code'] = code
        return attrs

    def create(self, validated_data):
        return super().create(self._sync_unit(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._sync_unit(validated_data))


class UnitOfMeasureSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnitOfMeasure
        fields = ['id', 'name', 'code', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, attrs):
        code = normalize_reference_code(
            UnitOfMeasure,
            attrs.get('code') if 'code' in attrs else getattr(self.instance, 'code', ''),
            'UOM',
            self.instance,
        )
        if not ensure_unique_code(UnitOfMeasure, code, self.instance):
            raise serializers.ValidationError({'code': _('Единица измерения с таким кодом уже существует.')})
        attrs['code'] = code
        return attrs


class WarehouseSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True, default='')

    class Meta:
        model = Warehouse
        fields = ['id', 'name', 'code', 'department', 'department_name', 'address', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, attrs):
        code = normalize_reference_code(
            Warehouse,
            attrs.get('code') if 'code' in attrs else getattr(self.instance, 'code', ''),
            'WH',
            self.instance,
        )
        if not ensure_unique_code(Warehouse, code, self.instance):
            raise serializers.ValidationError({'code': _('Склад с таким кодом уже существует.')})
        attrs['code'] = code
        return attrs


class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = ['id', 'name', 'code', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, attrs):
        code = normalize_reference_code(
            Position,
            attrs.get('code') if 'code' in attrs else getattr(self.instance, 'code', ''),
            'POS',
            self.instance,
        )
        if not ensure_unique_code(Position, code, self.instance):
            raise serializers.ValidationError({'code': _('Должность с таким кодом уже существует.')})
        attrs['code'] = code
        return attrs
