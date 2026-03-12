"""Views отчётности ИС «АСУ»."""

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Q, F
from django.utils.translation import gettext_lazy as _

from apps.assets.models import WarehouseStock, AssetAssignment, StockMovement
from apps.assets.serializers import (
    WarehouseStockSerializer,
    AssetAssignmentSerializer,
    StockMovementSerializer,
)
from apps.documents.models import WriteOffAct
from apps.requests.models import AssetRequest
from apps.common.constants import ASSIGNMENT_ACTIVE


class TMZStockReportView(APIView):
    """Отчёт: остатки ТМЗ."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = WarehouseStock.objects.select_related('asset').filter(
            asset__asset_type='TMZ',
        )
        serializer = WarehouseStockSerializer(qs, many=True)
        return Response({'report': 'tmz_stock', 'data': serializer.data})


class OSBalanceReportView(APIView):
    """Отчёт: учёт ОС на балансе."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = AssetAssignment.objects.select_related(
            'asset', 'user',
        ).filter(
            asset__asset_type='OS',
            status=ASSIGNMENT_ACTIVE,
        )
        serializer = AssetAssignmentSerializer(qs, many=True)
        return Response({'report': 'os_balance', 'data': serializer.data})


class OSStockReportView(APIView):
    """Отчёт: остатки ОС."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = WarehouseStock.objects.select_related('asset').filter(
            asset__asset_type='OS',
        )
        serializer = WarehouseStockSerializer(qs, many=True)
        return Response({'report': 'os_stock', 'data': serializer.data})


class NMABalanceReportView(APIView):
    """Отчёт: учёт НМА на балансе."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = AssetAssignment.objects.select_related(
            'asset', 'user',
        ).filter(
            asset__asset_type='NMA',
            status=ASSIGNMENT_ACTIVE,
        )
        serializer = AssetAssignmentSerializer(qs, many=True)
        return Response({'report': 'nma_balance', 'data': serializer.data})


class MovementReportView(APIView):
    """Отчёт: движение активов."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        asset_type = request.query_params.get('asset_type')

        qs = StockMovement.objects.select_related(
            'asset', 'from_user', 'to_user', 'performed_by',
        )

        if date_from:
            qs = qs.filter(performed_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(performed_at__date__lte=date_to)
        if asset_type:
            qs = qs.filter(asset__asset_type=asset_type)

        serializer = StockMovementSerializer(qs, many=True)
        return Response({'report': 'movement', 'data': serializer.data})


class WriteOffsReportView(APIView):
    """Отчёт: акты списания."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')

        qs = WriteOffAct.objects.filter(status='SIGNED')

        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)

        from apps.documents.serializers import WriteOffActListSerializer
        serializer = WriteOffActListSerializer(qs, many=True)
        return Response({'report': 'write_offs', 'data': serializer.data})


class RequestJournalReportView(APIView):
    """Отчёт: журнал заявок."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')

        qs = AssetRequest.objects.select_related('request_type', 'initiator')

        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)

        from apps.requests.serializers import AssetRequestListSerializer
        serializer = AssetRequestListSerializer(qs, many=True)
        return Response({'report': 'request_journal', 'data': serializer.data})


class InventoryReportView(APIView):
    """Отчёт: инвентаризационная опись."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        asset_type = request.query_params.get('asset_type')
        department_id = request.query_params.get('department_id')

        qs = AssetAssignment.objects.select_related(
            'asset', 'asset__category', 'user', 'user__department',
        ).filter(status=ASSIGNMENT_ACTIVE)

        if asset_type:
            qs = qs.filter(asset__asset_type=asset_type)
        if department_id:
            qs = qs.filter(user__department_id=department_id)

        serializer = AssetAssignmentSerializer(qs, many=True)
        return Response({'report': 'inventory_report', 'data': serializer.data})
