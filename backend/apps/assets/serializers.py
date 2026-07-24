"""Сериализаторы активов и склада ИС «АСУ»."""

from rest_framework import serializers
from apps.references.models import Asset, AssetCategory, Warehouse
from apps.users.models import User

from .models import (
    WarehouseStock,
    AssetAssignment,
    StockMovement,
    StockAlertRule,
    StockAlertState,
)


class WarehouseStockSerializer(serializers.ModelSerializer):
    """Сериализатор остатков на складе."""
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    asset_code = serializers.CharField(source='asset.code', read_only=True)
    asset_type = serializers.CharField(source='asset.asset_type', read_only=True)
    asset_type_display = serializers.CharField(
        source='asset.get_asset_type_display', read_only=True,
    )
    unit_of_measure = serializers.CharField(source='asset.unit_of_measure', read_only=True)
    category = serializers.IntegerField(source='asset.category_id', read_only=True)
    category_name = serializers.CharField(source='asset.category.name', read_only=True, default='')
    group = serializers.IntegerField(source='asset.group_id', read_only=True, allow_null=True)
    group_name = serializers.CharField(source='asset.group.name', read_only=True, default='')
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True, default='')
    unit_price = serializers.DecimalField(
        source='asset.unit_price', max_digits=15, decimal_places=2, read_only=True,
    )

    class Meta:
        model = WarehouseStock
        fields = [
            'id', 'asset', 'asset_name', 'asset_code', 'asset_type',
            'asset_type_display', 'category', 'category_name', 'group', 'group_name',
            'unit_of_measure', 'unit_price',
            'quantity', 'total_amount', 'balance_date', 'warehouse', 'warehouse_name',
            'location', 'updated_at',
        ]


class AssetAssignmentSerializer(serializers.ModelSerializer):
    """Сериализатор закреплений активов."""
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    asset_code = serializers.CharField(source='asset.code', read_only=True)
    asset_type = serializers.CharField(source='asset.asset_type', read_only=True)
    asset_type_display = serializers.CharField(
        source='asset.get_asset_type_display', read_only=True,
    )
    inventory_number = serializers.CharField(
        source='asset.inventory_number', read_only=True, default='',
    )
    category = serializers.IntegerField(source='asset.category_id', read_only=True)
    category_name = serializers.CharField(source='asset.category.name', read_only=True, default='')
    group = serializers.IntegerField(source='asset.group_id', read_only=True, allow_null=True)
    group_name = serializers.CharField(source='asset.group.name', read_only=True, default='')
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    department_name = serializers.CharField(
        source='user.department.name', read_only=True, default='',
    )
    assigned_by_name = serializers.CharField(
        source='assigned_by.get_short_name', read_only=True, default='',
    )
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True, default='')
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = AssetAssignment
        fields = [
            'id', 'asset', 'asset_name', 'asset_code', 'asset_type',
            'asset_type_display', 'inventory_number', 'category', 'category_name',
            'group', 'group_name', 'user', 'user_name', 'department_name',
            'quantity', 'assigned_at',
            'assigned_by', 'assigned_by_name', 'warehouse', 'warehouse_name', 'location',
            'status', 'status_display',
        ]


class StockMovementSerializer(serializers.ModelSerializer):
    """Сериализатор журнала движения активов."""
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    asset_code = serializers.CharField(source='asset.code', read_only=True)
    movement_type_display = serializers.CharField(
        source='get_movement_type_display', read_only=True,
    )
    category = serializers.IntegerField(source='asset.category_id', read_only=True)
    category_name = serializers.CharField(source='asset.category.name', read_only=True, default='')
    group = serializers.IntegerField(source='asset.group_id', read_only=True, allow_null=True)
    group_name = serializers.CharField(source='asset.group.name', read_only=True, default='')
    from_user_name = serializers.CharField(
        source='from_user.get_short_name', read_only=True, default='',
    )
    to_user_name = serializers.CharField(
        source='to_user.get_short_name', read_only=True, default='',
    )
    performed_by_name = serializers.CharField(
        source='performed_by.get_short_name', read_only=True, default='',
    )
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True, default='')

    class Meta:
        model = StockMovement
        fields = [
            'id', 'asset', 'asset_name', 'asset_code',
            'category', 'category_name', 'group', 'group_name',
            'movement_type', 'movement_type_display',
            'quantity', 'unit_price', 'total_amount',
            'from_user', 'from_user_name',
            'to_user', 'to_user_name',
            'performed_by', 'performed_by_name',
            'warehouse', 'warehouse_name',
            'performed_at', 'comment',
        ]


class StockAlertRuleSerializer(serializers.ModelSerializer):
    recipients = serializers.PrimaryKeyRelatedField(many=True, queryset=User.objects.filter(is_active=True))
    recipient_names = serializers.SerializerMethodField()
    groups = serializers.PrimaryKeyRelatedField(many=True, queryset=AssetCategory.objects.all(), required=False)
    group_names = serializers.SerializerMethodField()
    assets = serializers.PrimaryKeyRelatedField(many=True, queryset=Asset.objects.all(), required=False)
    asset_names = serializers.SerializerMethodField()
    warehouses = serializers.PrimaryKeyRelatedField(many=True, queryset=Warehouse.objects.all(), required=False)
    warehouse_names = serializers.SerializerMethodField()
    active_alert_count = serializers.SerializerMethodField()

    class Meta:
        model = StockAlertRule
        fields = [
            'id', 'name', 'is_active', 'threshold_quantity',
            'recipients', 'recipient_names',
            'groups', 'group_names',
            'assets', 'asset_names',
            'warehouses', 'warehouse_names',
            'message_template', 'active_alert_count',
            'created_at', 'updated_at',
        ]

    def get_recipient_names(self, obj):
        return [user.get_short_name() or user.username for user in obj.recipients.all()]

    def get_group_names(self, obj):
        return [group.name for group in obj.groups.all()]

    def get_asset_names(self, obj):
        return [asset.name for asset in obj.assets.all()]

    def get_warehouse_names(self, obj):
        return [warehouse.name for warehouse in obj.warehouses.all()]

    def get_active_alert_count(self, obj):
        return obj.states.filter(is_active=True).count()


class ActiveStockAlertSerializer(serializers.ModelSerializer):
    rule = serializers.IntegerField(source='rule_id', read_only=True)
    rule_name = serializers.CharField(source='rule.name', read_only=True)
    threshold_quantity = serializers.DecimalField(source='rule.threshold_quantity', max_digits=12, decimal_places=2, read_only=True)
    asset = serializers.IntegerField(source='stock.asset_id', read_only=True)
    asset_name = serializers.CharField(source='stock.asset.name', read_only=True)
    asset_code = serializers.CharField(source='stock.asset.code', read_only=True)
    asset_type = serializers.CharField(source='stock.asset.asset_type', read_only=True)
    unit_of_measure = serializers.CharField(source='stock.asset.unit_of_measure', read_only=True)
    warehouse = serializers.IntegerField(source='stock.warehouse_id', read_only=True, allow_null=True)
    warehouse_name = serializers.CharField(source='stock.warehouse.name', read_only=True, default='')
    action_url = serializers.SerializerMethodField()
    suggested_quantity = serializers.SerializerMethodField()

    class Meta:
        model = StockAlertState
        fields = [
            'id', 'rule', 'rule_name', 'asset', 'asset_name', 'asset_code',
            'asset_type', 'unit_of_measure', 'warehouse', 'warehouse_name',
            'current_quantity', 'threshold_quantity', 'message',
            'suggested_quantity', 'action_url', 'triggered_at',
        ]

    def get_suggested_quantity(self, obj):
        target = (obj.rule.threshold_quantity * 2) or obj.rule.threshold_quantity
        suggested = target - obj.current_quantity
        return str(suggested if suggested > 0 else 1)

    def get_action_url(self, obj):
        return (
            f'/documents/incoming-invoices/new?asset={obj.stock.asset_id}'
            f'&quantity={self.get_suggested_quantity(obj)}'
            f'&alert={obj.id}'
        )
