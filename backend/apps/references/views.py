from django.db.models import Case, Count, DecimalField, F, Sum, Value, When
from django.db.models.functions import Coalesce
from rest_framework import viewsets

from apps.common.permissions import ReadOnlyOrAHSStaff

from .filters import AssetFilter, CounterpartyFilter, LimitNormFilter
from .models import Asset, AssetCategory, Counterparty, LimitNorm, RequestType
from .serializers import (
    AssetCategorySerializer,
    AssetSerializer,
    CounterpartySerializer,
    LimitNormSerializer,
    RequestTypeSerializer,
)


class CounterpartyViewSet(viewsets.ModelViewSet):
    queryset = Counterparty.objects.all()
    serializer_class = CounterpartySerializer
    permission_classes = [ReadOnlyOrAHSStaff]
    search_fields = ['name', 'bin', 'contact_person', 'email']
    filterset_class = CounterpartyFilter
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class LimitNormViewSet(viewsets.ModelViewSet):
    queryset = LimitNorm.objects.select_related('department').all()
    serializer_class = LimitNormSerializer
    permission_classes = [ReadOnlyOrAHSStaff]
    filterset_class = LimitNormFilter
    search_fields = ['category']
    ordering_fields = ['valid_from', 'valid_to', 'created_at', 'quantity_limit']
    ordering = ['-valid_from']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class RequestTypeViewSet(viewsets.ModelViewSet):
    queryset = RequestType.objects.all()
    serializer_class = RequestTypeSerializer
    permission_classes = [ReadOnlyOrAHSStaff]
    filterset_fields = ['asset_type', 'is_active', 'requires_long_term_use']
    search_fields = ['name', 'code']
    ordering = ['name']


class AssetCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = AssetCategorySerializer
    permission_classes = [ReadOnlyOrAHSStaff]
    filterset_fields = ['asset_type', 'parent']
    search_fields = ['name', 'code']
    ordering = ['name']

    def get_queryset(self):
        return AssetCategory.objects.select_related('parent').annotate(
            asset_count=Count('grouped_assets', distinct=True),
            group_total_quantity=Coalesce(
                Sum(
                    Case(
                        When(
                            asset_type='TMZ',
                            then=F('grouped_assets__warehouse_stock__quantity'),
                        ),
                        default=Value(1),
                        output_field=DecimalField(max_digits=12, decimal_places=2),
                    )
                ),
                Value(0),
                output_field=DecimalField(max_digits=12, decimal_places=2),
            ),
        )


class AssetViewSet(viewsets.ModelViewSet):
    serializer_class = AssetSerializer
    permission_classes = [ReadOnlyOrAHSStaff]
    filterset_class = AssetFilter
    search_fields = ['name', 'code', 'inventory_number']
    ordering_fields = ['name', 'code', 'unit_price', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        return Asset.objects.select_related('category', 'group').annotate(
            stock_quantity=Coalesce(
                F('warehouse_stock__quantity'),
                Value(0),
                output_field=DecimalField(),
            ),
        )
