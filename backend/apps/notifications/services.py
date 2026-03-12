"""Сервис уведомлений ИС «АСУ»."""

import logging
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.core.mail import send_mail
from django.utils.translation import gettext_lazy as _

from apps.common.constants import EMAIL_SENT, EMAIL_FAILED

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
        """Отправить email и записать в журнал."""
        email_status = EMAIL_SENT
        error_msg = ''

        try:
            send_mail(
                subject=f'[{settings.APP_NAME}] {subject}',
                message=body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient_email],
                fail_silently=False,
            )
        except Exception as e:
            email_status = EMAIL_FAILED
            error_msg = str(e)
            logger.error(f'Ошибка отправки email на {recipient_email}: {e}')

        EmailLog.objects.create(
            recipient_email=recipient_email,
            subject=subject,
            body_preview=body[:500],
            status=email_status,
            related_notification=notification,
            error_message=error_msg,
        )
