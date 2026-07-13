"""Модели активов и складского учёта ИС «АСУ»."""

from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils.translation import gettext_lazy as _

from apps.common.constants import (
    ASSIGNMENT_STATUS_CHOICES,
    ASSIGNMENT_ACTIVE,
    MOVEMENT_TYPE_CHOICES,
)
from apps.common.mixins import TimestampMixin


class WarehouseStock(TimestampMixin):
    """Остатки на складе."""
    asset = models.OneToOneField(
        'references.Asset',
        on_delete=models.CASCADE,
        related_name='warehouse_stock',
        verbose_name=_('Актив'),
    )
    quantity = models.DecimalField(
        _('Количество'), max_digits=12, decimal_places=2, default=0,
    )
    total_amount = models.DecimalField(
        _('Общая сумма'), max_digits=15, decimal_places=2, default=0,
    )
    balance_date = models.DateField(
        _('Дата остатка'), blank=True, null=True,
    )
    location = models.CharField(
        _('Место хранения'), max_length=255, blank=True, default='',
    )

    class Meta:
        verbose_name = _('Остаток на складе')
        verbose_name_plural = _('Остатки на складе')

    def __str__(self):
        return f'{self.asset.name} — {self.quantity} {self.asset.unit_of_measure}'

    def recalculate_total(self):
        """Пересчёт общей суммы на основе количества и цены актива."""
        self.total_amount = self.quantity * self.asset.unit_price
        self.save(update_fields=['total_amount', 'updated_at'])


class AssetAssignment(models.Model):
    """Закрепление ОС/НМА/ТМЗ длительного пользования за сотрудником."""
    asset = models.ForeignKey(
        'references.Asset',
        on_delete=models.CASCADE,
        related_name='assignments',
        verbose_name=_('Актив'),
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='asset_assignments',
        verbose_name=_('Сотрудник'),
    )
    quantity = models.DecimalField(
        _('Количество'), max_digits=12, decimal_places=2, default=1,
    )
    assigned_at = models.DateTimeField(_('Дата выдачи'), auto_now_add=True)
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='assignments_issued',
        verbose_name=_('Выдал'),
    )
    location = models.CharField(
        _('Местоположение'), max_length=255, blank=True, default='',
    )
    status = models.CharField(
        _('Статус'),
        max_length=20,
        choices=ASSIGNMENT_STATUS_CHOICES,
        default=ASSIGNMENT_ACTIVE,
    )

    class Meta:
        verbose_name = _('Закрепление актива')
        verbose_name_plural = _('Закрепления активов')
        ordering = ['-assigned_at']

    def __str__(self):
        return f'{self.asset.name} → {self.user.get_short_name()}'


class StockMovement(models.Model):
    """Журнал движения активов (все операции)."""
    asset = models.ForeignKey(
        'references.Asset',
        on_delete=models.CASCADE,
        related_name='movements',
        verbose_name=_('Актив'),
    )
    movement_type = models.CharField(
        _('Тип операции'), max_length=30, choices=MOVEMENT_TYPE_CHOICES,
    )
    quantity = models.DecimalField(
        _('Количество'), max_digits=12, decimal_places=2,
    )
    unit_price = models.DecimalField(
        _('Цена за единицу'), max_digits=15, decimal_places=2,
    )
    total_amount = models.DecimalField(
        _('Сумма'), max_digits=15, decimal_places=2,
    )
    from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='movements_from',
        verbose_name=_('От кого'),
    )
    to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='movements_to',
        verbose_name=_('Кому'),
    )

    # GenericForeignKey для ссылки на документ-основание
    document_type = models.ForeignKey(
        ContentType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('Тип документа'),
    )
    document_id = models.PositiveIntegerField(
        _('ID документа'), null=True, blank=True,
    )
    document_ref = GenericForeignKey('document_type', 'document_id')

    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='performed_movements',
        verbose_name=_('Выполнил'),
    )
    performed_at = models.DateTimeField(_('Дата операции'), auto_now_add=True)
    comment = models.TextField(_('Комментарий'), blank=True, default='')

    class Meta:
        verbose_name = _('Движение актива')
        verbose_name_plural = _('Движения активов')
        ordering = ['-performed_at']

    def __str__(self):
        return (
            f'{self.get_movement_type_display()} — '
            f'{self.asset.name} × {self.quantity}'
        )

    def save(self, *args, **kwargs):
        """Автоматический расчёт суммы."""
        if not self.total_amount:
            self.total_amount = self.quantity * self.unit_price
        super().save(*args, **kwargs)
