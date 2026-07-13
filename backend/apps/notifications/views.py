"""Views уведомлений ИС «АСУ»."""

from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils.translation import gettext_lazy as _

from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin,
                          viewsets.GenericViewSet):
    """Уведомления текущего пользователя."""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['is_read', 'notification_type']
    ordering_fields = ['created_at']

    def get_queryset(self):
        return Notification.objects.select_related('related_content_type').filter(recipient=self.request.user)

    @action(detail=True, methods=['patch'])
    def read(self, request, pk=None):
        """Отметить уведомление как прочитанное."""
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=['is_read'])
        return Response({'detail': _('Уведомление отмечено как прочитанное')})

    @action(detail=False, methods=['post'], url_path='read-all')
    def read_all(self, request):
        """Отметить все уведомления как прочитанные."""
        count = Notification.objects.filter(
            recipient=request.user, is_read=False,
        ).update(is_read=True)
        return Response({
            'detail': _('Все уведомления отмечены как прочитанные'),
            'count': count,
        })

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        """Alias for clients that use mark-all-read naming."""
        return self.read_all(request)

    @action(detail=False, methods=['get'], url_path='unread-count')
    def unread_count(self, request):
        """Количество непрочитанных уведомлений."""
        count = Notification.objects.filter(
            recipient=request.user, is_read=False,
        ).count()
        return Response({'count': count})
