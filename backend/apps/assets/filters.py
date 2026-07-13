"""Фильтры складского учёта ИС «АСУ»."""

import django_filters

from .models import AssetAssignment, StockMovement, WarehouseStock


class WarehouseStockFilter(django_filters.FilterSet):
    """Фильтры остатков: тип актива, категория, группа."""

    asset_type = django_filters.CharFilter(field_name='asset__asset_type', lookup_expr='exact')
    category = django_filters.NumberFilter(field_name='asset__category')
    group = django_filters.NumberFilter(field_name='asset__group')

    class Meta:
        model = WarehouseStock
        fields = ['asset_type', 'category', 'group']


class AssignmentFilter(django_filters.FilterSet):
    """Фильтры закреплений: сотрудник, статус, тип, категория, группа, дата."""

    asset_type = django_filters.CharFilter(field_name='asset__asset_type', lookup_expr='exact')
    category = django_filters.NumberFilter(field_name='asset__category')
    group = django_filters.NumberFilter(field_name='asset__group')
    assigned_after = django_filters.DateFilter(field_name='assigned_at', lookup_expr='date__gte')
    assigned_before = django_filters.DateFilter(field_name='assigned_at', lookup_expr='date__lte')

    class Meta:
        model = AssetAssignment
        fields = ['user', 'status', 'asset', 'asset_type', 'category', 'group', 'assigned_after', 'assigned_before']


class MovementFilter(django_filters.FilterSet):
    """Фильтры движений: тип операции, актив, тип актива, категория, группа, дата."""

    asset_type = django_filters.CharFilter(field_name='asset__asset_type', lookup_expr='exact')
    category = django_filters.NumberFilter(field_name='asset__category')
    group = django_filters.NumberFilter(field_name='asset__group')
    performed_after = django_filters.DateFilter(field_name='performed_at', lookup_expr='date__gte')
    performed_before = django_filters.DateFilter(field_name='performed_at', lookup_expr='date__lte')

    class Meta:
        model = StockMovement
        fields = ['movement_type', 'asset', 'asset_type', 'category', 'group', 'performed_after', 'performed_before']
