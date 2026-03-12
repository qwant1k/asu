"""Административная панель Django для пользователей."""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import User, Department


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Настройка отображения пользователей в админке."""
    list_display = ['username', 'get_full_name', 'role', 'department', 'is_active']
    list_filter = ['role', 'is_active', 'department']
    search_fields = ['username', 'first_name', 'last_name', 'email']
    fieldsets = BaseUserAdmin.fieldsets + (
        (_('Дополнительная информация'), {
            'fields': ('patronymic', 'position', 'department', 'phone', 'role', 'supervisor'),
        }),
    )


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    """Настройка отображения подразделений в админке."""
    list_display = ['name', 'code', 'head', 'parent']
    search_fields = ['name', 'code']
    list_filter = ['parent']
