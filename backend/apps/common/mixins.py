"""Общие миксины для моделей проекта ИС «АСУ»."""

from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class TimestampMixin(models.Model):
    """Миксин для автоматического отслеживания даты создания и обновления."""
    created_at = models.DateTimeField(
        _('Дата создания'),
        auto_now_add=True,
    )
    updated_at = models.DateTimeField(
        _('Дата обновления'),
        auto_now=True,
    )

    class Meta:
        abstract = True


class AuditMixin(TimestampMixin):
    """Миксин аудита: автор создания + временные метки."""
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='%(class)s_created',
        verbose_name=_('Создал'),
    )

    class Meta:
        abstract = True
