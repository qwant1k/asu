from django.db.models import Case, Count, DecimalField, F, Sum, Value, When
from django.db.models.functions import Coalesce
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.common.permissions import ReadOnlyOrAHSStaff

from apps.requests.models import ApprovalStep

from .filters import AssetFilter, CounterpartyFilter, LimitNormFilter
from .models import Asset, AssetCategory, Counterparty, LimitNorm, Position, RequestType, UnitOfMeasure, Warehouse
from .serializers import (
    ApprovalStepSerializer,
    AssetCategorySerializer,
    AssetSerializer,
    CounterpartySerializer,
    LimitNormSerializer,
    PositionSerializer,
    RequestTypeSerializer,
    UnitOfMeasureSerializer,
    WarehouseSerializer,
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
    queryset = RequestType.objects.prefetch_related('approval_steps').all()
    serializer_class = RequestTypeSerializer
    permission_classes = [ReadOnlyOrAHSStaff]
    filterset_fields = ['asset_type', 'is_active', 'requires_long_term_use']
    search_fields = ['name', 'code']
    ordering = ['name']


class ApprovalStepViewSet(viewsets.ModelViewSet):
    """CRUD настраиваемых этапов согласования."""
    queryset = ApprovalStep.objects.select_related('request_type').all()
    serializer_class = ApprovalStepSerializer
    permission_classes = [ReadOnlyOrAHSStaff]
    filterset_fields = ['request_type', 'approver_role', 'is_active']
    ordering = ['request_type', 'order']


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

    @action(detail=True, methods=['get'])
    def card(self, request, pk=None):
        """Полная карточка позиции: реквизиты + движения + закрепления."""
        from apps.assets.models import AssetAssignment, StockMovement
        from apps.assets.serializers import (
            AssetAssignmentSerializer,
            StockMovementSerializer,
        )
        from apps.common.constants import ASSIGNMENT_WRITTEN_OFF

        asset = self.get_object()
        movements = StockMovement.objects.select_related(
            'from_user', 'to_user', 'performed_by',
        ).filter(asset=asset)[:25]
        assignments = AssetAssignment.objects.select_related(
            'user', 'assigned_by', 'user__department',
        ).filter(asset=asset).exclude(status=ASSIGNMENT_WRITTEN_OFF)

        data = self.get_serializer(asset).data
        data['movements'] = StockMovementSerializer(movements, many=True).data
        data['assignments'] = AssetAssignmentSerializer(assignments, many=True).data
        return Response(data)


class UnitOfMeasureViewSet(viewsets.ModelViewSet):
    queryset = UnitOfMeasure.objects.all()
    serializer_class = UnitOfMeasureSerializer
    permission_classes = [ReadOnlyOrAHSStaff]
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'code']
    ordering = ['name']


class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.select_related('department').all()
    serializer_class = WarehouseSerializer
    permission_classes = [ReadOnlyOrAHSStaff]
    search_fields = ['name', 'code', 'address']
    filterset_fields = ['department', 'is_active']
    ordering_fields = ['name', 'code']
    ordering = ['name']


class PositionViewSet(viewsets.ModelViewSet):
    queryset = Position.objects.all()
    serializer_class = PositionSerializer
    permission_classes = [ReadOnlyOrAHSStaff]
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'code']
    ordering = ['name']
