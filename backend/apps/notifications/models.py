"""Модели уведомлений ИС «АСУ»."""

from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils.translation import gettext_lazy as _

from apps.common.constants import (
    NOTIFICATION_TYPE_CHOICES,
    EMAIL_STATUS_CHOICES,
)


class Notification(models.Model):
    """Уведомление пользователя (in-app)."""
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name=_('Получатель'),
    )
    notification_type = models.CharField(
        _('Тип уведомления'), max_length=30, choices=NOTIFICATION_TYPE_CHOICES,
    )
    title = models.CharField(_('Заголовок'), max_length=255)
    body = models.TextField(_('Текст'), blank=True, default='')

    # Связь с объектом (заявка, документ и т.д.)
    related_content_type = models.ForeignKey(
        ContentType, on_delete=models.SET_NULL, null=True, blank=True,
        verbose_name=_('Тип связанного объекта'),
    )
    related_object_id = models.PositiveIntegerField(
        _('ID связанного объекта'), null=True, blank=True,
    )
    related_object = GenericForeignKey('related_content_type', 'related_object_id')

    is_read = models.BooleanField(_('Прочитано'), default=False)
    created_at = models.DateTimeField(_('Создано'), auto_now_add=True)

    class Meta:
        verbose_name = _('Уведомление')
        verbose_name_plural = _('Уведомления')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} → {self.recipient.get_short_name()}'


class EmailLog(models.Model):
    """Журнал отправленных email-сообщений."""
    recipient_email = models.EmailField(_('Email получателя'))
    subject = models.CharField(_('Тема'), max_length=255)
    body_preview = models.TextField(_('Превью текста'), blank=True, default='')
    status = models.CharField(
        _('Статус'), max_length=10, choices=EMAIL_STATUS_CHOICES,
    )
    sent_at = models.DateTimeField(_('Отправлено'), auto_now_add=True)
    related_notification = models.ForeignKey(
        Notification, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='email_logs', verbose_name=_('Уведомление'),
    )
    error_message = models.TextField(
        _('Текст ошибки'), blank=True, default='',
    )

    class Meta:
        verbose_name = _('Журнал email')
        verbose_name_plural = _('Журнал email')
        ordering = ['-sent_at']

    def __str__(self):
        return f'{self.subject} → {self.recipient_email} ({self.status})'
