"""Модели интеграций ИС «АСУ»."""

from django.db import models
from django.utils.translation import gettext_lazy as _


class SyncLog(models.Model):
    """Журнал синхронизации с 1С."""
    sync_type = models.CharField(_('Тип синхронизации'), max_length=50)
    started_at = models.DateTimeField(_('Начало'), auto_now_add=True)
    finished_at = models.DateTimeField(_('Окончание'), null=True, blank=True)
    status = models.CharField(
        _('Статус'), max_length=20,
        choices=[
            ('RUNNING', _('Выполняется')),
            ('SUCCESS', _('Успешно')),
            ('FAILED', _('Ошибка')),
        ],
        default='RUNNING',
    )
    created_count = models.IntegerField(_('Создано записей'), default=0)
    updated_count = models.IntegerField(_('Обновлено записей'), default=0)
    error_message = models.TextField(_('Текст ошибки'), blank=True, default='')
    is_stub = models.BooleanField(_('Режим заглушки'), default=True)

    class Meta:
        verbose_name = _('Журнал синхронизации')
        verbose_name_plural = _('Журнал синхронизации')
        ordering = ['-started_at']

    def __str__(self):
        return f'{self.sync_type} — {self.status} ({self.started_at})'
