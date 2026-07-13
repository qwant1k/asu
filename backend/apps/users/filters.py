"""Filters for administrator user management."""

import django_filters

from .models import User


class UserFilter(django_filters.FilterSet):
    has_department = django_filters.BooleanFilter(method='filter_has_department')
    date_joined_after = django_filters.DateFilter(field_name='date_joined', lookup_expr='date__gte')
    date_joined_before = django_filters.DateFilter(field_name='date_joined', lookup_expr='date__lte')
    last_login_after = django_filters.DateFilter(field_name='last_login', lookup_expr='date__gte')
    last_login_before = django_filters.DateFilter(field_name='last_login', lookup_expr='date__lte')

    class Meta:
        model = User
        fields = [
            'role',
            'department',
            'supervisor',
            'is_active',
            'is_staff',
            'has_department',
            'date_joined_after',
            'date_joined_before',
            'last_login_after',
            'last_login_before',
        ]

    def filter_has_department(self, queryset, name, value):
        if value is True:
            return queryset.filter(department__isnull=False)
        if value is False:
            return queryset.filter(department__isnull=True)
        return queryset
