"""Report views."""

from decimal import Decimal

from django.db.models import Q, Sum
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.assets.models import AssetAssignment, StockMovement, WarehouseStock
from apps.assets.serializers import (
    AssetAssignmentSerializer,
    StockMovementSerializer,
    WarehouseStockSerializer,
)
from apps.common.constants import ASSIGNMENT_ACTIVE
from apps.common.excel import build_xlsx_response
from apps.documents.models import WriteOffAct
from apps.requests.models import AssetRequest
from apps.users.access import has_access


class CanViewReports(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and has_access(request.user, 'reports.view'))


STOCK_COLUMNS = [
    ('asset_code', 'Код'),
    ('asset_name', 'Наименование'),
    ('asset_type_display', 'Тип'),
    ('unit_of_measure', 'Ед. изм.'),
    ('unit_price', 'Цена'),
    ('quantity', 'Количество'),
    ('total_amount', 'Сумма'),
    ('balance_date', 'Дата остатка'),
    ('location', 'Склад'),
]

ASSIGNMENT_COLUMNS = [
    ('user_name', 'Сотрудник'),
    ('department_name', 'Подразделение'),
    ('asset_type_display', 'Тип'),
    ('asset_code', 'Код'),
    ('asset_name', 'Актив'),
    ('inventory_number', 'Инв. номер'),
    ('quantity', 'Количество'),
    ('assigned_at', 'Дата выдачи'),
    ('assigned_by_name', 'Выдал'),
    ('location', 'Местоположение'),
]

MOVEMENT_COLUMNS = [
    ('performed_at', 'Дата'),
    ('movement_type_display', 'Операция'),
    ('asset_code', 'Код'),
    ('asset_name', 'Актив'),
    ('quantity', 'Количество'),
    ('unit_price', 'Цена'),
    ('total_amount', 'Сумма'),
    ('from_user_name', 'От кого'),
    ('to_user_name', 'Кому'),
    ('performed_by_name', 'Выполнил'),
    ('comment', 'Комментарий'),
]

WRITE_OFF_COLUMNS = [
    ('number', 'Номер'),
    ('date', 'Дата'),
    ('status_display', 'Статус'),
    ('act_type_display', 'Тип акта'),
    ('total_amount', 'Сумма'),
    ('is_representative', 'Представительские'),
    ('created_at', 'Создано'),
]

REQUEST_COLUMNS = [
    ('number', 'Номер'),
    ('request_type_name', 'Вид заявки'),
    ('request_type_asset_type', 'Тип актива'),
    ('status_display', 'Статус'),
    ('initiator_name', 'Инициатор'),
    ('created_at', 'Создано'),
    ('updated_at', 'Обновлено'),
]


def wants_xlsx(request):
    return request.query_params.get('export') in ('xlsx', 'excel')


def total_decimal(qs, field='total_amount'):
    return qs.aggregate(total=Sum(field))['total'] or Decimal('0')


def report_response(request, report, title, columns, rows, summary=None):
    if wants_xlsx(request):
        return build_xlsx_response(
            filename=f'{report}.xlsx',
            title=title,
            columns=columns,
            rows=rows,
            summary=summary,
        )
    return Response({'report': report, 'title': title, 'data': rows, 'summary': dict(summary or [])})


def apply_asset_filters(qs, request, date_field=None):
    search = request.query_params.get('search', '').strip()
    asset_type = request.query_params.get('asset_type')
    category = request.query_params.get('category')
    group = request.query_params.get('group')
    date_from = request.query_params.get('date_from')
    date_to = request.query_params.get('date_to')

    if search:
        qs = qs.filter(
            Q(asset__name__icontains=search) |
            Q(asset__code__icontains=search) |
            Q(asset__inventory_number__icontains=search)
        )
    if asset_type:
        qs = qs.filter(asset__asset_type=asset_type)
    if category:
        qs = qs.filter(asset__category_id=category)
    if group:
        qs = qs.filter(asset__group_id=group)
    if date_field and date_from:
        qs = qs.filter(**{f'{date_field}__date__gte' if date_field.endswith('_at') else f'{date_field}__gte': date_from})
    if date_field and date_to:
        qs = qs.filter(**{f'{date_field}__date__lte' if date_field.endswith('_at') else f'{date_field}__lte': date_to})
    return qs


class TMZStockReportView(APIView):
    permission_classes = [CanViewReports]

    def get(self, request):
        qs = WarehouseStock.objects.select_related('asset', 'asset__category', 'asset__group').filter(asset__asset_type='TMZ')
        qs = apply_asset_filters(qs, request, 'balance_date')
        serializer = WarehouseStockSerializer(qs, many=True)
        return report_response(
            request,
            'tmz_stock',
            'Остатки ТМЗ',
            STOCK_COLUMNS,
            serializer.data,
            [('Количество позиций', qs.count()), ('Итого сумма', total_decimal(qs))],
        )


class OSBalanceReportView(APIView):
    permission_classes = [CanViewReports]

    def get(self, request):
        qs = AssetAssignment.objects.select_related(
            'asset', 'asset__category', 'asset__group', 'user', 'user__department', 'assigned_by',
        ).filter(asset__asset_type='OS', status=ASSIGNMENT_ACTIVE)
        qs = apply_asset_filters(qs, request, 'assigned_at')
        serializer = AssetAssignmentSerializer(qs, many=True)
        return report_response(
            request,
            'os_balance',
            'ОС на балансе сотрудников',
            ASSIGNMENT_COLUMNS,
            serializer.data,
            [('Количество карточек', qs.count())],
        )


class OSStockReportView(APIView):
    permission_classes = [CanViewReports]

    def get(self, request):
        qs = WarehouseStock.objects.select_related('asset', 'asset__category', 'asset__group').filter(asset__asset_type='OS')
        qs = apply_asset_filters(qs, request, 'balance_date')
        serializer = WarehouseStockSerializer(qs, many=True)
        return report_response(
            request,
            'os_stock',
            'Остатки ОС на складе',
            STOCK_COLUMNS,
            serializer.data,
            [('Количество позиций', qs.count()), ('Итого сумма', total_decimal(qs))],
        )


class NMABalanceReportView(APIView):
    permission_classes = [CanViewReports]

    def get(self, request):
        qs = AssetAssignment.objects.select_related(
            'asset', 'asset__category', 'asset__group', 'user', 'user__department', 'assigned_by',
        ).filter(asset__asset_type='NMA', status=ASSIGNMENT_ACTIVE)
        qs = apply_asset_filters(qs, request, 'assigned_at')
        serializer = AssetAssignmentSerializer(qs, many=True)
        return report_response(
            request,
            'nma_balance',
            'НМА на балансе сотрудников',
            ASSIGNMENT_COLUMNS,
            serializer.data,
            [('Количество карточек', qs.count())],
        )


class MovementReportView(APIView):
    permission_classes = [CanViewReports]

    def get(self, request):
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        asset_type = request.query_params.get('asset_type')
        movement_type = request.query_params.get('movement_type')

        qs = StockMovement.objects.select_related(
            'asset', 'asset__category', 'asset__group', 'from_user', 'to_user', 'performed_by',
        )

        if date_from:
            qs = qs.filter(performed_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(performed_at__date__lte=date_to)
        if asset_type:
            qs = qs.filter(asset__asset_type=asset_type)
        if movement_type:
            qs = qs.filter(movement_type=movement_type)
        qs = apply_asset_filters(qs, request)

        serializer = StockMovementSerializer(qs, many=True)
        return report_response(
            request,
            'movement',
            'Движение активов',
            MOVEMENT_COLUMNS,
            serializer.data,
            [('Количество операций', qs.count()), ('Итого сумма', total_decimal(qs))],
        )


class WriteOffsReportView(APIView):
    permission_classes = [CanViewReports]

    def get(self, request):
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        act_type = request.query_params.get('act_type')

        qs = WriteOffAct.objects.filter(status='SIGNED')

        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)
        if act_type:
            qs = qs.filter(act_type=act_type)

        from apps.documents.serializers import WriteOffActListSerializer
        serializer = WriteOffActListSerializer(qs, many=True)
        return report_response(
            request,
            'write_offs',
            'Акты списания',
            WRITE_OFF_COLUMNS,
            serializer.data,
            [('Количество актов', qs.count()), ('Итого сумма', total_decimal(qs))],
        )


class RequestJournalReportView(APIView):
    permission_classes = [CanViewReports]

    def get(self, request):
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        status = request.query_params.get('status')

        qs = AssetRequest.objects.select_related('request_type', 'initiator')

        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)
        if status:
            qs = qs.filter(status=status)

        from apps.requests.serializers import AssetRequestListSerializer
        serializer = AssetRequestListSerializer(qs, many=True, context={'request': request})
        return report_response(
            request,
            'request_journal',
            'Журнал заявок',
            REQUEST_COLUMNS,
            serializer.data,
            [('Количество заявок', qs.count())],
        )


class InventoryReportView(APIView):
    permission_classes = [CanViewReports]

    def get(self, request):
        asset_type = request.query_params.get('asset_type')
        department_id = request.query_params.get('department_id')

        qs = AssetAssignment.objects.select_related(
            'asset', 'asset__category', 'asset__group', 'user', 'user__department', 'assigned_by',
        ).filter(status=ASSIGNMENT_ACTIVE)
        qs = apply_asset_filters(qs, request)

        if asset_type:
            qs = qs.filter(asset__asset_type=asset_type)
        if department_id:
            qs = qs.filter(user__department_id=department_id)

        serializer = AssetAssignmentSerializer(qs, many=True)
        return report_response(
            request,
            'inventory_report',
            'Инвентаризационная опись',
            ASSIGNMENT_COLUMNS,
            serializer.data,
            [('Количество карточек', qs.count())],
        )
