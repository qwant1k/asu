"""Views активов и склада ИС «АСУ»."""

from rest_framework import viewsets, mixins
from rest_framework.permissions import IsAuthenticated

from .models import WarehouseStock, AssetAssignment, StockMovement
from .serializers import (
    WarehouseStockSerializer,
    AssetAssignmentSerializer,
    StockMovementSerializer,
)


class WarehouseStockViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin,
                            viewsets.GenericViewSet):
    """Просмотр остатков на складе."""
    queryset = WarehouseStock.objects.select_related('asset', 'asset__category').all()
    serializer_class = WarehouseStockSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['asset__asset_type']
    search_fields = ['asset__name', 'asset__code', 'location']
    ordering_fields = ['quantity', 'total_amount', 'updated_at']


class AssetAssignmentViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin,
                             viewsets.GenericViewSet):
    """Просмотр закреплений активов."""
    queryset = AssetAssignment.objects.select_related(
        'asset', 'user', 'assigned_by',
    ).all()
    serializer_class = AssetAssignmentSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['user', 'status', 'asset__asset_type']
    search_fields = ['asset__name', 'user__last_name']
    ordering_fields = ['assigned_at', 'status']


class StockMovementViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin,
                           viewsets.GenericViewSet):
    """Просмотр журнала движения активов."""
    queryset = StockMovement.objects.select_related(
        'asset', 'from_user', 'to_user', 'performed_by',
    ).all()
    serializer_class = StockMovementSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['movement_type', 'asset__asset_type']
    search_fields = ['asset__name', 'comment']
    ordering_fields = ['performed_at', 'total_amount']
