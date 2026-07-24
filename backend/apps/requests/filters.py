"""Фильтры списка заявок ИС «АСУ»."""

import django_filters

from .models import AssetRequest


class RequestFilter(django_filters.FilterSet):
    """Фильтры заявок: статус, вид, инициатор, тип актива и диапазон дат."""

    asset_type = django_filters.CharFilter(
        field_name='request_type__asset_type', lookup_expr='exact',
    )
    created_after = django_filters.DateFilter(
        field_name='created_at', lookup_expr='date__gte',
    )
    created_before = django_filters.DateFilter(
        field_name='created_at', lookup_expr='date__lte',
    )
    deletion_requested = django_filters.BooleanFilter(method='filter_deletion_requested')

    def filter_deletion_requested(self, queryset, name, value):
        if value is True:
            return queryset.filter(deletion_requested_at__isnull=False)
        if value is False:
            return queryset.filter(deletion_requested_at__isnull=True)
        return queryset

    class Meta:
        model = AssetRequest
        fields = [
            'status', 'request_type', 'initiator', 'asset_type',
            'created_after', 'created_before', 'deletion_requested',
        ]
