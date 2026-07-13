from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.common.constants import (
    ASSET_TYPE_BASE_CHOICES,
    ASSET_TYPE_CHOICES,
    PERIOD_CHOICES,
)
from apps.common.mixins import TimestampMixin


class Counterparty(TimestampMixin):
    """Counterparty / supplier."""

    name = models.CharField(_('Наименование'), max_length=255)
    bin = models.CharField(_('БИН'), max_length=12, unique=True)
    address = models.TextField(_('Адрес'), blank=True, default='')
    contact_person = models.CharField(_('Контактное лицо'), max_length=255, blank=True, default='')
    phone = models.CharField(_('Телефон'), max_length=20, blank=True, default='')
    email = models.EmailField(_('Email'), blank=True, default='')
    is_active = models.BooleanField(_('Активен'), default=True)

    class Meta:
        verbose_name = _('Контрагент')
        verbose_name_plural = _('Контрагенты')
        ordering = ['name']

    def __str__(self):
        return f'{self.name} ({self.bin})'


class LimitNorm(TimestampMixin):
    """Limit norms."""

    asset_type = models.CharField(_('Тип актива'), max_length=20, choices=ASSET_TYPE_BASE_CHOICES)
    category = models.CharField(_('Категория'), max_length=255)
    quantity_limit = models.DecimalField(_('Лимит количества'), max_digits=12, decimal_places=2)
    period = models.CharField(_('Период'), max_length=20, choices=PERIOD_CHOICES)
    department = models.ForeignKey(
        'users.Department',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='limit_norms',
        verbose_name=_('Подразделение'),
        help_text=_('Если не указано — лимит на весь Фонд'),
    )
    valid_from = models.DateField(_('Действует с'))
    valid_to = models.DateField(_('Действует до'))
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_limits',
        verbose_name=_('Создал'),
    )

    class Meta:
        verbose_name = _('Лимит/норматив')
        verbose_name_plural = _('Лимиты и нормативы')
        ordering = ['-valid_from']

    def __str__(self):
        return f'{self.category} - {self.get_asset_type_display()} ({self.get_period_display()})'


class RequestType(models.Model):
    """Request type dictionary."""

    name = models.CharField(_('Наименование'), max_length=255)
    code = models.CharField(_('Код'), max_length=50, unique=True)
    asset_type = models.CharField(_('Тип актива'), max_length=20, choices=ASSET_TYPE_CHOICES)
    requires_long_term_use = models.BooleanField(
        _('Только длительного пользования'),
        default=False,
        help_text=_('Применяется для номенклатуры/TMZ.'),
    )
    description = models.TextField(_('Описание'), blank=True, default='')
    is_active = models.BooleanField(_('Активен'), default=True)

    class Meta:
        verbose_name = _('Вид заявки')
        verbose_name_plural = _('Виды заявок')
        ordering = ['name']

    def __str__(self):
        return self.name


class AssetCategory(models.Model):
    """Asset group/category."""

    name = models.CharField(_('Наименование'), max_length=255)
    code = models.CharField(_('Код'), max_length=50, unique=True)
    asset_type = models.CharField(_('Тип актива'), max_length=20, choices=ASSET_TYPE_BASE_CHOICES)
    parent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='children',
        verbose_name=_('Родительская категория'),
    )

    class Meta:
        verbose_name = _('Категория актива')
        verbose_name_plural = _('Категории активов')
        ordering = ['name']

    def __str__(self):
        return self.name


class Asset(TimestampMixin):
    """Universal asset model for TMZ / OS / NMA."""

    name = models.CharField(_('Наименование'), max_length=255)
    code = models.CharField(_('Код номенклатуры'), max_length=100, unique=True)
    asset_type = models.CharField(_('Тип актива'), max_length=20, choices=ASSET_TYPE_CHOICES)
    category = models.ForeignKey(
        AssetCategory,
        on_delete=models.PROTECT,
        related_name='assets',
        verbose_name=_('Категория'),
    )
    group = models.ForeignKey(
        AssetCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='grouped_assets',
        verbose_name=_('Группа'),
    )
    unit_of_measure = models.CharField(_('Единица измерения'), max_length=50)
    unit_price = models.DecimalField(_('Цена за единицу'), max_digits=15, decimal_places=2)
    is_long_term_use = models.BooleanField(_('ТМЗ длительного пользования'), default=False)
    inventory_number = models.CharField(_('Инвентарный номер'), max_length=100, blank=True, null=True)
    balance_date = models.DateField(_('Дата постановки на баланс'), blank=True, null=True)
    useful_life_months = models.PositiveIntegerField(_('Срок полезного использования (мес.)'), blank=True, null=True)
    depreciation_rate = models.DecimalField(_('Норма амортизации'), max_digits=5, decimal_places=2, blank=True, null=True)
    source_1c_id = models.CharField(_('ID в 1С'), max_length=100, blank=True, null=True, unique=True)
    last_sync_at = models.DateTimeField(_('Последняя синхронизация'), blank=True, null=True)

    class Meta:
        verbose_name = _('Актив')
        verbose_name_plural = _('Активы')
        ordering = ['name']

    def __str__(self):
        return f'{self.name} ({self.code})'


class UnitOfMeasure(TimestampMixin):
    """Unit of measure reference."""

    name = models.CharField(_('Наименование'), max_length=255, unique=True)
    code = models.CharField(_('Код'), max_length=50, unique=True, blank=True)
    is_active = models.BooleanField(_('Активен'), default=True)

    class Meta:
        verbose_name = _('Единица измерения')
        verbose_name_plural = _('Единицы измерения')
        ordering = ['name']

    def __str__(self):
        return self.name


class Warehouse(TimestampMixin):
    """Warehouse / storage location for assets and transfers."""

    name = models.CharField(_('Наименование'), max_length=255)
    code = models.CharField(_('Код'), max_length=50, unique=True, blank=True)
    department = models.ForeignKey(
        'users.Department',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='warehouses',
        verbose_name=_('Подразделение'),
    )
    address = models.CharField(_('Адрес'), max_length=255, blank=True, default='')
    is_active = models.BooleanField(_('Активен'), default=True)

    class Meta:
        verbose_name = _('Склад')
        verbose_name_plural = _('Склады')
        ordering = ['name']

    def __str__(self):
        return self.name


class Position(TimestampMixin):
    """Position / job title reference."""

    name = models.CharField(_('Наименование'), max_length=255, unique=True)
    code = models.CharField(_('Код'), max_length=50, unique=True, blank=True)
    is_active = models.BooleanField(_('Активна'), default=True)

    class Meta:
        verbose_name = _('Должность')
        verbose_name_plural = _('Должности')
        ordering = ['name']

    def __str__(self):
        return self.name
