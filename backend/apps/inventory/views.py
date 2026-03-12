"""Views инвентарных карт ИС «АСУ»."""

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Q
from django.utils.translation import gettext_lazy as _

from apps.assets.models import AssetAssignment
from apps.assets.serializers import AssetAssignmentSerializer
from apps.common.constants import ASSIGNMENT_ACTIVE, ROLE_ADMIN, ROLE_AHS_WORKER, ROLE_AHS_HEAD
from apps.users.models import User


class InventoryCardView(APIView):
    """
    Инвентарные карточки сотрудников.
    Фильтры: ?user_id=&asset_type=&card_type=os_tmz|nma|summary
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        target_user_id = request.query_params.get('user_id')
        asset_type = request.query_params.get('asset_type')
        card_type = request.query_params.get('card_type', 'summary')

        # Доступ: свою карту — все; карты всех — AHS_WORKER, AHS_HEAD, ADMIN
        if target_user_id and int(target_user_id) != user.id:
            if user.role not in (ROLE_ADMIN, ROLE_AHS_WORKER, ROLE_AHS_HEAD):
                return Response(
                    {'detail': _('Недостаточно прав для просмотра карт других сотрудников')},
                    status=status.HTTP_403_FORBIDDEN,
                )

        qs = AssetAssignment.objects.select_related(
            'asset', 'asset__category', 'user', 'assigned_by',
        ).filter(status=ASSIGNMENT_ACTIVE)

        if target_user_id:
            qs = qs.filter(user_id=target_user_id)
        else:
            qs = qs.filter(user=user)

        # Фильтрация по типу карточки
        if card_type == 'os_tmz':
            qs = qs.filter(
                Q(asset__asset_type='OS') |
                Q(asset__asset_type='TMZ', asset__is_long_term_use=True)
            )
        elif card_type == 'nma':
            qs = qs.filter(asset__asset_type='NMA')

        if asset_type:
            qs = qs.filter(asset__asset_type=asset_type)

        serializer = AssetAssignmentSerializer(qs, many=True)
        return Response({
            'card_type': card_type,
            'items': serializer.data,
            'total_count': qs.count(),
        })


class InventoryCardExportView(APIView):
    """Экспорт инвентарной карточки в PDF."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Заглушка — реализация генерации PDF в Фазе 5
        return Response(
            {'detail': _('Экспорт в PDF будет реализован в следующей фазе')},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )
