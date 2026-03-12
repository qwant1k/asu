from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.common.constants import ROLE_CHOICES, ROLE_USER


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
