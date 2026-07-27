"""Сервис уведомлений ИС «АСУ»."""

import logging
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.utils.translation import gettext_lazy as _


from .models import Notification, EmailLog

logger = logging.getLogger(__name__)


class NotificationService:
    """Сервис отправки in-app и email-уведомлений."""

    @staticmethod
    def send(recipient, notification_type, title, body='', related_object=None):
        """
        Создать in-app уведомление и отправить email.

        Args:
            recipient: пользователь-получатель
            notification_type: тип уведомления (из NOTIFICATION_TYPE_CHOICES)
            title: заголовок
            body: текст уведомления
            related_object: связанный объект (заявка, документ)
        """
        # In-app уведомление
        notification = Notification.objects.create(
            recipient=recipient,
            notification_type=notification_type,
            title=title,
            body=body,
        )

        if related_object:
            ct = ContentType.objects.get_for_model(related_object)
            notification.related_content_type = ct
            notification.related_object_id = related_object.pk
            notification.save(update_fields=['related_content_type', 'related_object_id'])

        # Email
        if recipient.email:
            NotificationService._send_email(
                recipient_email=recipient.email,
                subject=title,
                body=body,
                notification=notification,
            )

        return notification

    @staticmethod
    def _send_email(recipient_email, subject, body, notification=None):
        """Отправить email через Celery task (неблокирующий вызов)."""
        from apps.integrations.tasks import send_notification_email_task

        notification_id = notification.id if notification else None
        send_notification_email_task.delay(
            notification_id=notification_id,
            recipient_email=recipient_email,
            subject=subject,
            body=body,
        )
