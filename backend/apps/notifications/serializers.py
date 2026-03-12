"""Сериализаторы уведомлений ИС «АСУ»."""

from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """Сериализатор уведомлений."""
    type_display = serializers.CharField(
        source='get_notification_type_display', read_only=True,
    )

    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'type_display',
            'title', 'body', 'is_read', 'created_at',
        ]
        read_only_fields = ['notification_type', 'title', 'body', 'created_at']
