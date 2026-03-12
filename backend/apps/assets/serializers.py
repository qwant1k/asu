"""Сериализаторы активов и склада ИС «АСУ»."""

from rest_framework import serializers
from .models import WarehouseStock, AssetAssignment, StockMovement


class WarehouseStockSerializer(serializers.ModelSerializer):
    """Сериализатор остатков на складе."""
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    asset_code = serializers.CharField(source='asset.code', read_only=True)
    asset_type = serializers.CharField(source='asset.asset_type', read_only=True)
    asset_type_display = serializers.CharField(
        source='asset.get_asset_type_display', read_only=True,
    )
    unit_of_measure = serializers.CharField(source='asset.unit_of_measure', read_only=True)
    unit_price = serializers.DecimalField(
        source='asset.unit_price', max_digits=15, decimal_places=2, read_only=True,
    )

    class Meta:
        model = WarehouseStock
        fields = [
            'id', 'asset', 'asset_name', 'asset_code', 'asset_type',
            'asset_type_display', 'unit_of_measure', 'unit_price',
            'quantity', 'total_amount', 'location', 'updated_at',
        ]


class AssetAssignmentSerializer(serializers.ModelSerializer):
    """Сериализатор закреплений активов."""
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    asset_code = serializers.CharField(source='asset.code', read_only=True)
    asset_type = serializers.CharField(source='asset.asset_type', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    assigned_by_name = serializers.CharField(
        source='assigned_by.get_short_name', read_only=True, default='',
    )
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = AssetAssignment
        fields = [
            'id', 'asset', 'asset_name', 'asset_code', 'asset_type',
            'user', 'user_name', 'quantity', 'assigned_at',
            'assigned_by', 'assigned_by_name', 'location',
            'status', 'status_display',
        ]


class StockMovementSerializer(serializers.ModelSerializer):
    """Сериализатор журнала движения активов."""
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    asset_code = serializers.CharField(source='asset.code', read_only=True)
    movement_type_display = serializers.CharField(
        source='get_movement_type_display', read_only=True,
    )
    from_user_name = serializers.CharField(
        source='from_user.get_short_name', read_only=True, default='',
    )
    to_user_name = serializers.CharField(
        source='to_user.get_short_name', read_only=True, default='',
    )
    performed_by_name = serializers.CharField(
        source='performed_by.get_short_name', read_only=True, default='',
    )

    class Meta:
        model = StockMovement
        fields = [
            'id', 'asset', 'asset_name', 'asset_code',
            'movement_type', 'movement_type_display',
            'quantity', 'unit_price', 'total_amount',
            'from_user', 'from_user_name',
            'to_user', 'to_user_name',
            'performed_by', 'performed_by_name',
            'performed_at', 'comment',
        ]
