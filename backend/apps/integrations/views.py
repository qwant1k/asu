"""Views интеграции с 1С ИС «АСУ»."""

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils.translation import gettext_lazy as _

from apps.common.permissions import IsAdmin

from .models import SyncLog
from .tasks import sync_assets_from_1c_task


class SyncTriggerView(APIView):
    """Ручной запуск синхронизации с 1С (только ADMIN)."""
    permission_classes = [IsAdmin]

    def post(self, request):
        asset_type = request.data.get('asset_type', 'all')
        sync_assets_from_1c_task.delay(asset_type)
        return Response({
            'detail': _('Синхронизация с 1С запущена'),
            'asset_type': asset_type,
        })


class SyncStatusView(APIView):
    """Статус последней синхронизации с 1С."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        last_sync = SyncLog.objects.first()
        if not last_sync:
            return Response({
                'detail': _('Синхронизация ещё не выполнялась'),
                'last_sync': None,
            })

        return Response({
            'last_sync': {
                'id': last_sync.id,
                'sync_type': last_sync.sync_type,
                'status': last_sync.status,
                'started_at': last_sync.started_at,
                'finished_at': last_sync.finished_at,
                'created_count': last_sync.created_count,
                'updated_count': last_sync.updated_count,
                'is_stub': last_sync.is_stub,
                'error_message': last_sync.error_message,
            },
        })
