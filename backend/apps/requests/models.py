"""Модели заявок ИС «АСУ»."""

from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from apps.common.constants import (
    APPROVAL_ACTION_CHOICES,
    REQUEST_DRAFT,
    REQUEST_STATUS_CHOICES,
)
from apps.common.mixins import TimestampMixin


class AssetRequest(TimestampMixin):
    """Заявка на выдачу/перемещение/изменение активов."""

    number = models.CharField(
        _('Номер заявки'), max_length=20, unique=True, blank=True,
    )
    request_type = models.ForeignKey(
        'references.RequestType',
        on_delete=models.PROTECT,
        related_name='requests',
        verbose_name=_('Вид заявки'),
    )
    status = models.CharField(
        _('Статус'),
        max_length=30,
        choices=REQUEST_STATUS_CHOICES,
        default=REQUEST_DRAFT,
    )
    initiator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='initiated_requests',
        verbose_name=_('Инициатор'),
    )
    from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='requests_from',
        verbose_name=_('От кого (перемещение)'),
    )
    to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='requests_to',
        verbose_name=_('Кому (перемещение)'),
    )
    reason = models.TextField(
        _('Причина / обоснование'), blank=True, default='',
    )

    class Meta:
        verbose_name = _('Заявка')
        verbose_name_plural = _('Заявки')
        ordering = ['-created_at']

    def __str__(self):
        return f'{_("Заявка")} №{self.number}'

    def save(self, *args, **kwargs):
        """Автоприсвоение номера при первом сохранении."""
        if not self.number:
            year = timezone.now().year
            last = AssetRequest.objects.filter(
                number__endswith=f'/{year}'
            ).order_by('-number').first()

            if last and last.number:
                try:
                    last_num = int(last.number.split('/')[0])
                except (ValueError, IndexError):
                    last_num = 0
            else:
                last_num = 0

            self.number = f'{last_num + 1:03d}/{year}'

        super().save(*args, **kwargs)


class AssetRequestItem(models.Model):
    """Позиция заявки."""

    request = models.ForeignKey(
        AssetRequest,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name=_('Заявка'),
    )
    requested_group = models.ForeignKey(
        'references.AssetCategory',
        on_delete=models.PROTECT,
        related_name='request_items',
        null=True,
        blank=True,
        verbose_name=_('Запрошенная группа'),
    )
    asset = models.ForeignKey(
        'references.Asset',
        on_delete=models.PROTECT,
        related_name='request_items',
        null=True,
        blank=True,
        verbose_name=_('Актив'),
    )
    issued_asset = models.ForeignKey(
        'references.Asset',
        on_delete=models.PROTECT,
        related_name='issued_request_items',
        null=True,
        blank=True,
        verbose_name=_('Выданный актив'),
    )
    quantity_requested = models.DecimalField(
        _('Запрошенное количество'), max_digits=12, decimal_places=2,
    )
    quantity_issued = models.DecimalField(
        _('Выданное количество'), max_digits=12, decimal_places=2,
        null=True, blank=True,
    )
    comment = models.TextField(_('Комментарий'), blank=True, default='')

    class Meta:
        verbose_name = _('Позиция заявки')
        verbose_name_plural = _('Позиции заявки')

    def __str__(self):
        title = self.requested_group.name if self.requested_group else self.asset.name
        return f'{title} × {self.quantity_requested}'


class RequestApproval(models.Model):
    """Журнал согласований / подписаний заявки."""

    request = models.ForeignKey(
        AssetRequest,
        on_delete=models.CASCADE,
        related_name='approvals',
        verbose_name=_('Заявка'),
    )
    approver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='approvals',
        verbose_name=_('Согласующий'),
    )
    role_at_approval = models.CharField(
        _('Роль на момент согласования'), max_length=30,
    )
    action = models.CharField(
        _('Действие'), max_length=20, choices=APPROVAL_ACTION_CHOICES,
    )
    otp_code = models.CharField(
        _('Хэш OTP-кода'), max_length=64, blank=True, default='',
    )
    otp_expires_at = models.DateTimeField(
        _('OTP действует до'), null=True, blank=True,
    )
    signed_at = models.DateTimeField(
        _('Подписано'), null=True, blank=True,
    )
    comment = models.TextField(
        _('Комментарий'), blank=True, default='',
    )
    created_at = models.DateTimeField(_('Создано'), auto_now_add=True)

    class Meta:
        verbose_name = _('Согласование заявки')
        verbose_name_plural = _('Согласования заявок')
        ordering = ['-created_at']

    def __str__(self):
        return (
            f'{self.approver.get_short_name()} — '
            f'{self.get_action_display()}'
        )
