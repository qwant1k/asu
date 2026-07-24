import django_filters

from django.db.models import Q

from .models import Asset, Contract, Counterparty, LimitNorm


class AssetFilter(django_filters.FilterSet):
    """Asset filters."""

    type = django_filters.CharFilter(field_name='asset_type', lookup_expr='exact')
    in_stock = django_filters.BooleanFilter(method='filter_in_stock')
    has_stock = django_filters.BooleanFilter(method='filter_in_stock')
    grouped = django_filters.BooleanFilter(method='filter_grouped')
    group_empty = django_filters.BooleanFilter(method='filter_group_empty')
    warehouse_empty = django_filters.BooleanFilter(method='filter_warehouse_empty')
    unit_empty = django_filters.BooleanFilter(method='filter_unit_empty')
    warehouse = django_filters.NumberFilter(field_name='warehouse_stock__warehouse')
    warehouse_name = django_filters.CharFilter(field_name='warehouse_stock__warehouse__name', lookup_expr='icontains')
    stock_location = django_filters.CharFilter(field_name='warehouse_stock__location', lookup_expr='icontains')
    unit_of_measure_ref = django_filters.NumberFilter(field_name='unit_of_measure_ref')
    unit = django_filters.CharFilter(field_name='unit_of_measure', lookup_expr='icontains')
    quantity_min = django_filters.NumberFilter(field_name='warehouse_stock__quantity', lookup_expr='gte')
    quantity_max = django_filters.NumberFilter(field_name='warehouse_stock__quantity', lookup_expr='lte')
    price_min = django_filters.NumberFilter(field_name='unit_price', lookup_expr='gte')
    price_max = django_filters.NumberFilter(field_name='unit_price', lookup_expr='lte')
    balance_date_from = django_filters.DateFilter(field_name='warehouse_stock__balance_date', lookup_expr='gte')
    balance_date_to = django_filters.DateFilter(field_name='warehouse_stock__balance_date', lookup_expr='lte')

    class Meta:
        model = Asset
        fields = [
            'asset_type', 'category', 'group', 'is_long_term_use',
            'warehouse', 'unit_of_measure_ref',
        ]

    def filter_in_stock(self, queryset, name, value):
        if value is True:
            return queryset.filter(warehouse_stock__quantity__gt=0)
        if value is False:
            return queryset.exclude(warehouse_stock__quantity__gt=0)
        return queryset

    def filter_grouped(self, queryset, name, value):
        if value is True:
            return queryset.filter(group__isnull=False)
        if value is False:
            return queryset.filter(group__isnull=True)
        return queryset

    def filter_group_empty(self, queryset, name, value):
        if value is True:
            return queryset.filter(group__isnull=True)
        if value is False:
            return queryset.filter(group__isnull=False)
        return queryset

    def filter_warehouse_empty(self, queryset, name, value):
        if value is True:
            return queryset.filter(Q(warehouse_stock__isnull=True) | Q(warehouse_stock__warehouse__isnull=True))
        if value is False:
            return queryset.filter(warehouse_stock__warehouse__isnull=False)
        return queryset

    def filter_unit_empty(self, queryset, name, value):
        if value is True:
            return queryset.filter(Q(unit_of_measure_ref__isnull=True) | Q(unit_of_measure=''))
        if value is False:
            return queryset.filter(unit_of_measure_ref__isnull=False)
        return queryset


class CounterpartyFilter(django_filters.FilterSet):
    class Meta:
        model = Counterparty
        fields = ['is_active']


class ContractFilter(django_filters.FilterSet):
    contract_date_from = django_filters.DateFilter(field_name='contract_date', lookup_expr='gte')
    contract_date_to = django_filters.DateFilter(field_name='contract_date', lookup_expr='lte')
    valid_until_from = django_filters.DateFilter(field_name='valid_until', lookup_expr='gte')
    valid_until_to = django_filters.DateFilter(field_name='valid_until', lookup_expr='lte')

    class Meta:
        model = Contract
        fields = ['counterparty']


class LimitNormFilter(django_filters.FilterSet):
    is_active = django_filters.BooleanFilter(method='filter_is_active')

    class Meta:
        model = LimitNorm
        fields = ['asset_type', 'period', 'department']

    def filter_is_active(self, queryset, name, value):
        from django.utils import timezone

        today = timezone.now().date()
        if value is True:
            return queryset.filter(valid_from__lte=today, valid_to__gte=today)
        if value is False:
            return queryset.exclude(valid_from__lte=today, valid_to__gte=today)
        return queryset
