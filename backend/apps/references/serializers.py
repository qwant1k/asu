import re

from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from apps.requests.models import ApprovalStep

from .codegen import (
    base_asset_type,
    code_prefix,
    ensure_unique_code,
    normalize_reference_code,
)
from .models import Asset, AssetCategory, Counterparty, LimitNorm, Position, RequestType, UnitOfMeasure, Warehouse


class CounterpartySerializer(serializers.ModelSerializer):
    class Meta:
        model = Counterparty
        fields = [
            'id', 'name', 'bin', 'address', 'contact_person',
            'phone', 'email', 'is_active', 'created_at', 'updated_at',
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
    asset_type_display = serializers.CharField(source='get_asset_type_display', read_only=True)
    stock_quantity = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True, default=0)

    class Meta:
        model = Asset
        fields = [
            'id', 'name', 'code', 'asset_type', 'asset_type_display',
            'category', 'category_name', 'group', 'group_name',
            'unit_of_measure', 'unit_price',
            'is_long_term_use', 'inventory_number', 'balance_date',
            'useful_life_months', 'depreciation_rate',
            'source_1c_id', 'last_sync_at', 'created_at', 'updated_at',
            'stock_quantity',
        ]
        read_only_fields = ['source_1c_id', 'last_sync_at', 'created_at', 'updated_at']
        extra_kwargs = {
            'code': {'required': False, 'allow_blank': True, 'validators': []},
        }

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
