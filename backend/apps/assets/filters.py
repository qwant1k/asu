"""Фильтры складского учёта ИС «АСУ»."""

import django_filters
from django.db.models import Q

from .models import AssetAssignment, StockMovement, WarehouseStock


class WarehouseStockFilter(django_filters.FilterSet):
    """Фильтры остатков: тип актива, категория, группа."""

    asset_type = django_filters.CharFilter(field_name='asset__asset_type', lookup_expr='exact')
    category = django_filters.NumberFilter(field_name='asset__category')
    group = django_filters.NumberFilter(field_name='asset__group')

    class Meta:
        model = WarehouseStock
        fields = ['asset_type', 'category', 'group', 'warehouse']


class AssignmentFilter(django_filters.FilterSet):
    """Фильтры закреплений: сотрудник, статус, тип, категория, группа, дата."""

    asset_type = django_filters.CharFilter(field_name='asset__asset_type', lookup_expr='exact')
    category = django_filters.NumberFilter(field_name='asset__category')
    group = django_filters.NumberFilter(field_name='asset__group')
    assigned_after = django_filters.DateFilter(field_name='assigned_at', lookup_expr='date__gte')
    assigned_before = django_filters.DateFilter(field_name='assigned_at', lookup_expr='date__lte')
    mol_id = django_filters.NumberFilter(field_name='user_id')

    class Meta:
        model = AssetAssignment
        fields = [
            'user', 'mol_id', 'status', 'asset', 'asset_type',
            'category', 'group', 'assigned_after', 'assigned_before',
        ]


class MovementFilter(django_filters.FilterSet):
    """Фильтры движений: тип операции, актив, тип актива, категория, группа, дата."""

    asset_type = django_filters.CharFilter(field_name='asset__asset_type', lookup_expr='exact')
    category = django_filters.NumberFilter(field_name='asset__category')
    group = django_filters.NumberFilter(field_name='asset__group')
    performed_after = django_filters.DateFilter(field_name='performed_at', lookup_expr='date__gte')
    performed_before = django_filters.DateFilter(field_name='performed_at', lookup_expr='date__lte')
    mol_id = django_filters.NumberFilter(method='filter_mol')

    def filter_mol(self, queryset, name, value):
        return queryset.filter(Q(from_user_id=value) | Q(to_user_id=value))

    class Meta:
        model = StockMovement
        fields = [
            'movement_type', 'asset', 'asset_type', 'category', 'group',
            'warehouse', 'mol_id', 'performed_after', 'performed_before',
        ]
