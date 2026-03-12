import django_filters

from .models import Asset, Counterparty, LimitNorm


class AssetFilter(django_filters.FilterSet):
    """Asset filters."""

    type = django_filters.CharFilter(field_name='asset_type', lookup_expr='exact')
    in_stock = django_filters.BooleanFilter(method='filter_in_stock')
    grouped = django_filters.BooleanFilter(method='filter_grouped')

    class Meta:
        model = Asset
        fields = ['asset_type', 'category', 'group', 'is_long_term_use']

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


class CounterpartyFilter(django_filters.FilterSet):
    class Meta:
        model = Counterparty
        fields = ['is_active']


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
