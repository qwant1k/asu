"""Views for inventory cards."""

from django.db.models import Q
from django.utils.translation import gettext_lazy as _
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.assets.models import AssetAssignment
from apps.assets.serializers import AssetAssignmentSerializer
from apps.common.constants import ASSIGNMENT_ACTIVE, ROLE_ADMIN, ROLE_AHS_HEAD, ROLE_AHS_WORKER
from apps.common.excel import build_xlsx_response
from apps.users.access import has_access


FULL_ACCESS_ROLES = (ROLE_ADMIN, ROLE_AHS_WORKER, ROLE_AHS_HEAD)


def get_inventory_queryset(request):
    user = request.user
    target_user_id = request.query_params.get('user_id')
    asset_type = request.query_params.get('asset_type')
    category = request.query_params.get('category')
    group = request.query_params.get('group')
    assigned_after = request.query_params.get('assigned_after')
    assigned_before = request.query_params.get('assigned_before')
    card_type = request.query_params.get('card_type', 'summary')
    search = request.query_params.get('search', '').strip()

    has_full_access = user.role in FULL_ACCESS_ROLES or has_access(user, 'inventory.view_all')

    if target_user_id and int(target_user_id) != user.id and not has_full_access:
        raise PermissionError

    qs = AssetAssignment.objects.select_related(
        'asset', 'asset__category', 'user', 'user__department', 'assigned_by',
    ).filter(status=ASSIGNMENT_ACTIVE)

    if target_user_id:
        qs = qs.filter(user_id=target_user_id)
    elif not has_full_access:
        qs = qs.filter(user=user)

    if card_type == 'os_tmz':
        qs = qs.filter(
            Q(asset__asset_type='OS') |
            Q(asset__asset_type='TMZ', asset__is_long_term_use=True)
        )
    elif card_type == 'nma':
        qs = qs.filter(asset__asset_type='NMA')

    if asset_type:
        qs = qs.filter(asset__asset_type=asset_type)
    if category:
        qs = qs.filter(asset__category_id=category)
    if group:
        qs = qs.filter(asset__group_id=group)
    if assigned_after:
        qs = qs.filter(assigned_at__date__gte=assigned_after)
    if assigned_before:
        qs = qs.filter(assigned_at__date__lte=assigned_before)

    if search:
        qs = qs.filter(
            Q(asset__name__icontains=search) |
            Q(asset__code__icontains=search) |
            Q(asset__inventory_number__icontains=search) |
            Q(user__first_name__icontains=search) |
            Q(user__last_name__icontains=search) |
            Q(user__department__name__icontains=search)
        )

    return qs, card_type


class InventoryCardView(APIView):
    """Inventory cards for current user or all users for AHS/admin roles."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            qs, card_type = get_inventory_queryset(request)
        except PermissionError:
            return Response(
                {'detail': _('Недостаточно прав для просмотра карт других сотрудников')},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = AssetAssignmentSerializer(qs, many=True)
        return Response({
            'card_type': card_type,
            'items': serializer.data,
            'total_count': qs.count(),
        })


class InventoryCardExportView(APIView):
    """Export inventory cards to XLSX."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            qs, card_type = get_inventory_queryset(request)
        except PermissionError:
            return Response(
                {'detail': _('Недостаточно прав для просмотра карт других сотрудников')},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = AssetAssignmentSerializer(qs, many=True)
        columns = [
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
        return build_xlsx_response(
            filename=f'inventory_{card_type}.xlsx',
            title='Инвентарные карточки',
            columns=columns,
            rows=serializer.data,
            summary=[('Всего записей', qs.count())],
        )
