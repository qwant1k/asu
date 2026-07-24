from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.common.constants import ROLE_CHOICES, ROLE_USER
from .access import ACCESS_PERMISSION_CHOICES, normalize_position


class Department(models.Model):
    """Organization department."""

    name = models.CharField(_('Наименование'), max_length=255)
    code = models.CharField(_('Код подразделения'), max_length=50, unique=True)
    head = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='headed_departments',
        verbose_name=_('Руководитель'),
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='children',
        verbose_name=_('Родительское подразделение'),
    )

    class Meta:
        verbose_name = _('Подразделение')
        verbose_name_plural = _('Подразделения')
        ordering = ['name']

    def __str__(self):
        return self.name


class User(AbstractUser):
    """System user."""

    photo = models.ImageField(
        _('Фото'),
        upload_to='users/photos/',
        null=True,
        blank=True,
    )
    patronymic = models.CharField(_('Отчество'), max_length=150, blank=True, default='')
    position = models.CharField(_('Должность'), max_length=255, blank=True, default='')
    position_ref = models.ForeignKey(
        'references.Position',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users',
        verbose_name=_('Должность из справочника'),
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employees',
        verbose_name=_('Подразделение'),
    )
    phone = models.CharField(_('Телефон'), max_length=20, blank=True, default='')
    role = models.CharField(_('Роль'), max_length=30, choices=ROLE_CHOICES, default=ROLE_USER)
    supervisor = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subordinates',
        verbose_name=_('Непосредственный руководитель'),
    )

    class Meta:
        verbose_name = _('Пользователь')
        verbose_name_plural = _('Пользователи')
        ordering = ['last_name', 'first_name']

    def __str__(self):
        return self.get_full_name() or self.username

    def save(self, *args, **kwargs):
        if self.position_ref_id:
            self.position = self.position_ref.name
        super().save(*args, **kwargs)

    def get_full_name(self):
        parts = [self.last_name, self.first_name, self.patronymic]
        return ' '.join(part for part in parts if part)

    def get_short_name(self):
        parts = [self.last_name]
        if self.first_name:
            parts.append(f'{self.first_name[0]}.')
        if self.patronymic:
            parts.append(f'{self.patronymic[0]}.')
        return ' '.join(parts)


class PositionAccessRule(models.Model):
    """Permission rule applied to every user with the same position."""

    position = models.CharField(_('Должность'), max_length=255)
    normalized_position = models.CharField(_('Нормализованная должность'), max_length=255, db_index=True, editable=False)
    permission_code = models.CharField(_('Право'), max_length=80, choices=ACCESS_PERMISSION_CHOICES)
    is_allowed = models.BooleanField(_('Разрешено'), default=True)
    is_active = models.BooleanField(_('Активно'), default=True)
    comment = models.CharField(_('Комментарий'), max_length=255, blank=True, default='')
    created_at = models.DateTimeField(_('Создано'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Обновлено'), auto_now=True)

    class Meta:
        verbose_name = _('Право по должности')
        verbose_name_plural = _('Права по должностям')
        ordering = ['position', 'permission_code']
        constraints = [
            models.UniqueConstraint(
                fields=['normalized_position', 'permission_code'],
                name='unique_position_access_rule',
            ),
        ]

    def save(self, *args, **kwargs):
        self.normalized_position = normalize_position(self.position)
        super().save(*args, **kwargs)

    def __str__(self):
        sign = '+' if self.is_allowed else '-'
        return f'{self.position}: {sign}{self.permission_code}'


class UserAccessOverride(models.Model):
    """Personal permission grant or deny for one user."""

    MODE_GRANT = 'GRANT'
    MODE_DENY = 'DENY'
    MODE_CHOICES = [
        (MODE_GRANT, _('Разрешить')),
        (MODE_DENY, _('Запретить')),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='access_overrides',
        verbose_name=_('Пользователь'),
    )
    permission_code = models.CharField(_('Право'), max_length=80, choices=ACCESS_PERMISSION_CHOICES)
    mode = models.CharField(_('Режим'), max_length=10, choices=MODE_CHOICES, default=MODE_GRANT)
    comment = models.CharField(_('Комментарий'), max_length=255, blank=True, default='')
    created_at = models.DateTimeField(_('Создано'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Обновлено'), auto_now=True)

    class Meta:
        verbose_name = _('Индивидуальное право')
        verbose_name_plural = _('Индивидуальные права')
        ordering = ['user__last_name', 'user__first_name', 'permission_code']
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'permission_code'],
                name='unique_user_access_override',
            ),
        ]

    def __str__(self):
        return f'{self.user}: {self.mode} {self.permission_code}'
