"""Модель журнала аудита для отслеживания изменений в системе."""

from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.db import models
from django.utils.translation import gettext_lazy as _


class AuditLog(models.Model):
    """Журнал аудита действий пользователей."""

    ACTION_CREATE = 'create'
    ACTION_UPDATE = 'update'
    ACTION_DELETE = 'delete'
    ACTION_CHOICES = [
        (ACTION_CREATE, _('Создание')),
        (ACTION_UPDATE, _('Изменение')),
        (ACTION_DELETE, _('Удаление')),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs',
        verbose_name=_('Пользователь'),
    )
    action = models.CharField(
        _('Действие'),
        max_length=20,
        choices=ACTION_CHOICES,
    )
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        verbose_name=_('Тип объекта'),
    )
    object_id = models.CharField(
        _('ID объекта'),
        max_length=255,
    )
    content_object = GenericForeignKey('content_type', 'object_id')
    object_repr = models.CharField(
        _('Представление объекта'),
        max_length=255,
        blank=True,
        default='',
    )
    changes = models.JSONField(
        _('Изменения'),
        default=dict,
        blank=True,
    )
    ip_address = models.GenericIPAddressField(
        _('IP-адрес'),
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(
        _('Дата и время'),
        auto_now_add=True,
    )

    class Meta:
        verbose_name = _('Запись аудита')
        verbose_name_plural = _('Журнал аудита')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.get_action_display()} — {self.object_repr} ({self.created_at:%d.%m.%Y %H:%M})'
