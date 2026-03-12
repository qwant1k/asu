"""Модели документооборота ИС «АСУ»."""

from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from apps.common.constants import (
    DOCUMENT_STATUS_CHOICES,
    DOCUMENT_DRAFT,
    ASSET_TYPE_BASE_CHOICES,
    ASSET_TYPE_CHOICES,
    WRITE_OFF_TYPE_CHOICES,
)
from apps.common.mixins import TimestampMixin


class BaseDocument(TimestampMixin):
    """Базовый абстрактный класс для всех документов."""
    number = models.CharField(
        _('Номер документа'), max_length=20, blank=True, default='',
        help_text=_('Присваивается автоматически после финального подписания'),
    )
    date = models.DateField(
        _('Дата документа'), null=True, blank=True,
        help_text=_('Выставляется автоматически после финального подписания'),
    )
    status = models.CharField(
        _('Статус'), max_length=30,
        choices=DOCUMENT_STATUS_CHOICES, default=DOCUMENT_DRAFT,
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='%(class)s_created',
        verbose_name=_('Создал'),
    )

    class Meta:
        abstract = True

    def assign_number(self):
        """Автоприсвоение номера и даты после финального подписания."""
        if not self.number:
            year = timezone.now().year
            model_class = type(self)
            last = model_class.objects.filter(
                number__endswith=f'/{year}'
            ).exclude(number='').order_by('-number').first()

            if last and last.number:
                try:
                    last_num = int(last.number.split('/')[0])
                except (ValueError, IndexError):
                    last_num = 0
            else:
                last_num = 0

            self.number = f'{last_num + 1:03d}/{year}'
            self.date = timezone.now().date()
            self.save(update_fields=['number', 'date'])


# ========================================================================
# Приходная накладная
# ========================================================================

class IncomingInvoice(BaseDocument):
    """Приходная накладная."""
    asset_type = models.CharField(
        _('Тип актива'), max_length=20, choices=ASSET_TYPE_BASE_CHOICES,
    )
    counterparty = models.ForeignKey(
        'references.Counterparty',
        on_delete=models.PROTECT,
        related_name='incoming_invoices',
        verbose_name=_('Контрагент'),
    )
    mol_warehouse = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='incoming_invoices_as_mol',
        verbose_name=_('МОЛ'),
    )

    class Meta:
        verbose_name = _('Приходная накладная')
        verbose_name_plural = _('Приходные накладные')
        ordering = ['-created_at']

    def __str__(self):
        num = self.number or _('б/н')
        return f'{_("Приходная накладная")} №{num}'


class IncomingInvoiceItem(models.Model):
    """Позиция приходной накладной."""
    invoice = models.ForeignKey(
        IncomingInvoice, on_delete=models.CASCADE,
        related_name='items', verbose_name=_('Накладная'),
    )
    asset = models.ForeignKey(
        'references.Asset', on_delete=models.PROTECT,
        related_name='incoming_items', verbose_name=_('Актив'),
    )
    quantity = models.DecimalField(_('Количество'), max_digits=12, decimal_places=2)
    unit_price = models.DecimalField(_('Цена за ед.'), max_digits=15, decimal_places=2)
    total = models.DecimalField(_('Сумма'), max_digits=15, decimal_places=2)

    class Meta:
        verbose_name = _('Позиция накладной')
        verbose_name_plural = _('Позиции накладной')

    def save(self, *args, **kwargs):
        self.total = self.quantity * self.unit_price
        super().save(*args, **kwargs)


# ========================================================================
# Акт на списание
# ========================================================================

class WriteOffAct(BaseDocument):
    """Акт на списание ТМЗ / ОС / НМА."""
    act_type = models.CharField(
        _('Тип акта'), max_length=30, choices=WRITE_OFF_TYPE_CHOICES,
    )
    commission_order_number = models.CharField(
        _('Номер приказа о комиссии'), max_length=50, blank=True, default='',
    )
    commission_order_date = models.DateField(
        _('Дата приказа о комиссии'), null=True, blank=True,
    )
    is_representative = models.BooleanField(
        _('Представительские расходы'), default=False,
    )
    total_amount = models.DecimalField(
        _('Итого сумма'), max_digits=15, decimal_places=2, default=0,
    )

    class Meta:
        verbose_name = _('Акт на списание')
        verbose_name_plural = _('Акты на списание')
        ordering = ['-created_at']

    def __str__(self):
        num = self.number or _('б/н')
        return f'{_("Акт на списание")} №{num}'

    def recalculate_total(self):
        """Пересчёт итоговой суммы по позициям."""
        from django.db.models import Sum
        result = self.items.aggregate(total=Sum('total'))
        self.total_amount = result['total'] or 0
        self.save(update_fields=['total_amount'])


class WriteOffActItem(models.Model):
    """Позиция акта на списание."""
    act = models.ForeignKey(
        WriteOffAct, on_delete=models.CASCADE,
        related_name='items', verbose_name=_('Акт'),
    )
    asset = models.ForeignKey(
        'references.Asset', on_delete=models.PROTECT,
        related_name='write_off_items', verbose_name=_('Актив'),
    )
    quantity = models.DecimalField(_('Количество'), max_digits=12, decimal_places=2)
    unit_price = models.DecimalField(_('Цена за ед.'), max_digits=15, decimal_places=2)
    total = models.DecimalField(_('Сумма'), max_digits=15, decimal_places=2)

    class Meta:
        verbose_name = _('Позиция акта списания')
        verbose_name_plural = _('Позиции акта списания')

    def save(self, *args, **kwargs):
        self.total = self.quantity * self.unit_price
        super().save(*args, **kwargs)


class CommissionMember(models.Model):
    """Член комиссии (связка M2M для документов)."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name=_('Пользователь'),
    )
    write_off_act = models.ForeignKey(
        WriteOffAct, on_delete=models.CASCADE, null=True, blank=True,
        related_name='commission_members', verbose_name=_('Акт списания'),
    )
    petition = models.ForeignKey(
        'Petition', on_delete=models.CASCADE, null=True, blank=True,
        related_name='commission_members_set', verbose_name=_('Ходатайство'),
    )
    protocol = models.ForeignKey(
        'CommissionProtocol', on_delete=models.CASCADE, null=True, blank=True,
        related_name='commission_members_set', verbose_name=_('Протокол'),
    )
    role_label = models.CharField(
        _('Роль в комиссии'), max_length=100, blank=True, default='',
    )

    class Meta:
        verbose_name = _('Член комиссии')
        verbose_name_plural = _('Члены комиссии')

    def __str__(self):
        return f'{self.user.get_short_name()} — {self.role_label}'


# ========================================================================
# Ходатайство на выбытие ОС/НМА
# ========================================================================

class Petition(BaseDocument):
    """Ходатайство на выбытие ОС/НМА."""
    legal_basis = models.TextField(
        _('Правовое основание'), blank=True, default='',
    )

    class Meta:
        verbose_name = _('Ходатайство')
        verbose_name_plural = _('Ходатайства')
        ordering = ['-created_at']

    def __str__(self):
        num = self.number or _('б/н')
        return f'{_("Ходатайство")} №{num}'


class PetitionItem(models.Model):
    """Позиция ходатайства."""
    petition = models.ForeignKey(
        Petition, on_delete=models.CASCADE,
        related_name='items', verbose_name=_('Ходатайство'),
    )
    asset = models.ForeignKey(
        'references.Asset', on_delete=models.PROTECT,
        related_name='petition_items', verbose_name=_('Актив'),
    )
    quantity = models.DecimalField(_('Количество'), max_digits=12, decimal_places=2)
    unit_price = models.DecimalField(_('Цена за ед.'), max_digits=15, decimal_places=2)
    total = models.DecimalField(_('Сумма'), max_digits=15, decimal_places=2)

    class Meta:
        verbose_name = _('Позиция ходатайства')
        verbose_name_plural = _('Позиции ходатайства')

    def save(self, *args, **kwargs):
        self.total = self.quantity * self.unit_price
        super().save(*args, **kwargs)


# ========================================================================
# Протокол заседания Рабочей комиссии
# ========================================================================

class CommissionProtocol(BaseDocument):
    """Протокол заседания Рабочей комиссии."""
    petition = models.ForeignKey(
        Petition, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='protocols', verbose_name=_('Ходатайство'),
    )
    agenda_item = models.TextField(
        _('Пункт повестки дня'), blank=True, default='',
    )
    commission_order_number = models.CharField(
        _('Номер приказа о комиссии'), max_length=50, blank=True, default='',
    )
    commission_order_date = models.DateField(
        _('Дата приказа о комиссии'), null=True, blank=True,
    )
    decision_text = models.TextField(
        _('Текст решения'), blank=True, default='',
    )

    class Meta:
        verbose_name = _('Протокол заседания')
        verbose_name_plural = _('Протоколы заседаний')
        ordering = ['-created_at']

    def __str__(self):
        num = self.number or _('б/н')
        return f'{_("Протокол")} №{num}'


class ProtocolItem(models.Model):
    """Позиция приложения к протоколу (Приложение 1)."""
    protocol = models.ForeignKey(
        CommissionProtocol, on_delete=models.CASCADE,
        related_name='attachment_items', verbose_name=_('Протокол'),
    )
    asset = models.ForeignKey(
        'references.Asset', on_delete=models.PROTECT,
        related_name='protocol_items', verbose_name=_('Актив'),
    )
    quantity = models.DecimalField(_('Количество'), max_digits=12, decimal_places=2)
    unit_price = models.DecimalField(_('Цена за ед.'), max_digits=15, decimal_places=2)
    total = models.DecimalField(_('Сумма'), max_digits=15, decimal_places=2)

    class Meta:
        verbose_name = _('Позиция приложения к протоколу')
        verbose_name_plural = _('Позиции приложения к протоколу')

    def save(self, *args, **kwargs):
        self.total = self.quantity * self.unit_price
        super().save(*args, **kwargs)


# ========================================================================
# Накладная на внутреннее перемещение
# ========================================================================

class InternalTransferInvoice(BaseDocument):
    """Накладная на внутреннее перемещение ОС/НМА."""
    from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,
        related_name='transfer_invoices_from', verbose_name=_('От кого'),
    )
    to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,
        related_name='transfer_invoices_to', verbose_name=_('Кому'),
    )
    asset_type = models.CharField(
        _('Тип актива'), max_length=20,
        choices=[('OS', _('ОС')), ('NMA', _('НМА'))],
    )

    class Meta:
        verbose_name = _('Накладная на внутреннее перемещение')
        verbose_name_plural = _('Накладные на внутреннее перемещение')
        ordering = ['-created_at']

    def __str__(self):
        num = self.number or _('б/н')
        return f'{_("Накладная перемещения")} №{num}'


class InternalTransferItem(models.Model):
    """Позиция накладной на внутреннее перемещение."""
    invoice = models.ForeignKey(
        InternalTransferInvoice, on_delete=models.CASCADE,
        related_name='items', verbose_name=_('Накладная'),
    )
    asset = models.ForeignKey(
        'references.Asset', on_delete=models.PROTECT,
        related_name='transfer_items', verbose_name=_('Актив'),
    )
    quantity = models.DecimalField(_('Количество'), max_digits=12, decimal_places=2)

    class Meta:
        verbose_name = _('Позиция накладной перемещения')
        verbose_name_plural = _('Позиции накладной перемещения')


# ========================================================================
# Подписи документов (универсальные через GenericFK)
# ========================================================================

class DocumentSignature(models.Model):
    """Подпись к документу (GenericForeignKey)."""
    document_type = models.ForeignKey(
        ContentType, on_delete=models.CASCADE,
        verbose_name=_('Тип документа'),
    )
    document_id = models.PositiveIntegerField(_('ID документа'))
    document = GenericForeignKey('document_type', 'document_id')

    signer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='document_signatures', verbose_name=_('Подписант'),
    )
    role_label = models.CharField(
        _('Роль при подписании'), max_length=100, blank=True, default='',
    )
    otp_code_hash = models.CharField(
        _('Хэш OTP-кода'), max_length=64, blank=True, default='',
    )
    otp_expires_at = models.DateTimeField(
        _('OTP действует до'), null=True, blank=True,
    )
    signed_at = models.DateTimeField(
        _('Подписано'), null=True, blank=True,
    )
    is_acting_chairman = models.BooleanField(
        _('И.о. Председателя'), default=False,
    )
    sent_for_revision_at = models.DateTimeField(
        _('Отправлено на доработку'), null=True, blank=True,
    )
    revision_reason = models.TextField(
        _('Причина возврата'), blank=True, default='',
    )

    class Meta:
        verbose_name = _('Подпись документа')
        verbose_name_plural = _('Подписи документов')
        ordering = ['-signed_at']

    def __str__(self):
        status = _('подписано') if self.signed_at else _('ожидание')
        return f'{self.signer.get_short_name()} — {status}'
