"""Models for the common app."""

from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils.translation import gettext_lazy as _

from apps.common.audit import AuditLog


class NumberSequence(models.Model):
    """Concurrency-safe counter for business document numbers."""

    scope = models.CharField(_('Область нумерации'), max_length=100)
    year = models.PositiveSmallIntegerField(_('Год'))
    value = models.PositiveIntegerField(_('Текущее значение'), default=0)
    updated_at = models.DateTimeField(_('Обновлено'), auto_now=True)

    class Meta:
        verbose_name = _('Счётчик номеров')
        verbose_name_plural = _('Счётчики номеров')
        constraints = [
            models.UniqueConstraint(
                fields=['scope', 'year'],
                name='unique_number_sequence_scope_year',
            ),
        ]

    def __str__(self):
        return f'{self.scope}/{self.year}: {self.value}'


class TrashItem(models.Model):
    """Запись корзины для обратимого удаления произвольного объекта."""

    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        related_name='trash_items',
        verbose_name=_('Тип объекта'),
    )
    object_id = models.CharField(_('ID объекта'), max_length=255)
    content_object = GenericForeignKey('content_type', 'object_id')
    object_repr = models.CharField(_('Наименование'), max_length=255)
    model_label = models.CharField(_('Тип'), max_length=255)
    deleted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='trash_items_created',
        verbose_name=_('Удалил'),
    )
    deleted_at = models.DateTimeField(_('Удалено'), auto_now_add=True)
    reason = models.TextField(_('Причина'), blank=True, default='')
    metadata = models.JSONField(_('Служебные данные'), default=dict, blank=True)

    class Meta:
        verbose_name = _('Удалённый объект')
        verbose_name_plural = _('Удалённые объекты')
        ordering = ['-deleted_at']
        constraints = [
            models.UniqueConstraint(
                fields=['content_type', 'object_id'],
                name='unique_trashed_object',
            ),
        ]

    def __str__(self):
        return f'{self.model_label}: {self.object_repr}'


__all__ = ['AuditLog', 'NumberSequence', 'TrashItem']
