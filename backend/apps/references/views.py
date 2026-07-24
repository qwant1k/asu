from django.db.models import Case, Count, DecimalField, F, Sum, Value, When
from django.db.models.functions import Coalesce
from decimal import Decimal, InvalidOperation
from django.db import transaction
from rest_framework.exceptions import ValidationError
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from apps.common.permissions import ReadOnlyOrAHSStaff

from apps.requests.models import ApprovalStep

from .filters import AssetFilter, ContractFilter, CounterpartyFilter, LimitNormFilter
from .models import Asset, AssetCategory, Contract, Counterparty, LimitNorm, Position, RequestType, UnitOfMeasure, Warehouse
from .serializers import (
    ApprovalStepSerializer,
    AssetCategorySerializer,
    AssetSerializer,
    ContractSerializer,
    CounterpartySerializer,
    LimitNormSerializer,
    PositionSerializer,
    RequestTypeSerializer,
    UnitOfMeasureSerializer,
    WarehouseSerializer,
)


class CounterpartyViewSet(viewsets.ModelViewSet):
    queryset = Counterparty.objects.annotate(contracts_count=Count('contracts'))
    serializer_class = CounterpartySerializer
    permission_classes = [ReadOnlyOrAHSStaff]
    search_fields = ['name', 'bin', 'contact_person', 'email']
    filterset_class = CounterpartyFilter
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class ContractViewSet(viewsets.ModelViewSet):
    queryset = Contract.objects.select_related('counterparty').all()
    serializer_class = ContractSerializer
    permission_classes = [ReadOnlyOrAHSStaff]
    filterset_class = ContractFilter
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    search_fields = ['name', 'counterparty__name', 'counterparty__bin']
    ordering_fields = ['name', 'contract_date', 'valid_until', 'created_at']
    ordering = ['-contract_date', 'name']


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
    search_fields = [
        'name', 'code', 'inventory_number', 'category__name', 'group__name',
        'unit_of_measure', 'unit_of_measure_ref__name',
        'warehouse_stock__warehouse__name', 'warehouse_stock__location',
    ]
    ordering_fields = [
        'name', 'code', 'unit_price', 'created_at',
        'category__name', 'group__name', 'unit_of_measure',
        'warehouse_stock__warehouse__name', 'warehouse_stock__quantity',
        'warehouse_stock__total_amount', 'warehouse_stock__balance_date',
    ]
    ordering = ['name']

    def get_queryset(self):
        return Asset.objects.select_related(
            'category', 'group', 'unit_of_measure_ref',
            'warehouse_stock', 'warehouse_stock__warehouse',
        ).annotate(
            stock_quantity=Coalesce(
                F('warehouse_stock__quantity'),
                Value(0),
                output_field=DecimalField(),
            ),
        )

    @action(detail=True, methods=['get', 'patch'])
    def card(self, request, pk=None):
        """Полная карточка позиции: реквизиты + движения + закрепления."""
        from apps.assets.models import AssetAssignment, StockMovement, WarehouseStock
        from apps.assets.serializers import (
            AssetAssignmentSerializer,
            StockMovementSerializer,
        )
        from apps.common.constants import ASSIGNMENT_WRITTEN_OFF

        asset = self.get_object()
        if request.method == 'PATCH':
            asset_fields = {
                'name', 'code', 'asset_type', 'category', 'group',
                'unit_of_measure', 'unit_of_measure_ref', 'unit_price',
                'is_long_term_use', 'inventory_number', 'balance_date',
                'useful_life_months', 'depreciation_rate',
            }
            asset_data = {
                key: value
                for key, value in request.data.items()
                if key in asset_fields
            }
            serializer = self.get_serializer(asset, data=asset_data, partial=True)
            serializer.is_valid(raise_exception=True)

            stock_fields = {'warehouse', 'stock_quantity', 'stock_balance_date', 'stock_location'}
            with transaction.atomic():
                asset = serializer.save()
                if any(field in request.data for field in stock_fields):
                    stock, _ = WarehouseStock.objects.get_or_create(
                        asset=asset,
                        defaults={'quantity': Decimal('0'), 'total_amount': Decimal('0')},
                    )
                    if 'warehouse' in request.data:
                        warehouse_id = request.data.get('warehouse') or None
                        stock.warehouse = Warehouse.objects.filter(pk=warehouse_id).first() if warehouse_id else None
                        if warehouse_id and stock.warehouse is None:
                            raise ValidationError({'warehouse': 'Склад не найден.'})
                    if 'stock_quantity' in request.data:
                        try:
                            stock.quantity = Decimal(str(request.data.get('stock_quantity') or '0'))
                        except (InvalidOperation, TypeError, ValueError):
                            raise ValidationError({'stock_quantity': 'Введите корректное количество.'})
                    if 'stock_balance_date' in request.data:
                        stock.balance_date = request.data.get('stock_balance_date') or None
                    if 'stock_location' in request.data:
                        stock.location = request.data.get('stock_location') or ''
                    stock.total_amount = stock.quantity * asset.unit_price
                    stock.save()
                asset = self.get_queryset().get(pk=asset.pk)

        movements = StockMovement.objects.select_related(
            'from_user', 'to_user', 'performed_by', 'warehouse',
        ).filter(asset=asset)[:25]
        assignments = AssetAssignment.objects.select_related(
            'user', 'assigned_by', 'user__department', 'warehouse',
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
