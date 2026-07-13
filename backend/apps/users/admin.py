"""Административная панель Django для пользователей."""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import Department, PositionAccessRule, User, UserAccessOverride


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


@admin.register(PositionAccessRule)
class PositionAccessRuleAdmin(admin.ModelAdmin):
    list_display = ['position', 'permission_code', 'is_allowed', 'is_active']
    list_filter = ['permission_code', 'is_allowed', 'is_active']
    search_fields = ['position', 'permission_code', 'comment']
    readonly_fields = ['normalized_position', 'created_at', 'updated_at']


@admin.register(UserAccessOverride)
class UserAccessOverrideAdmin(admin.ModelAdmin):
    list_display = ['user', 'permission_code', 'mode']
    list_filter = ['permission_code', 'mode']
    search_fields = ['user__username', 'user__last_name', 'user__first_name', 'permission_code', 'comment']
    readonly_fields = ['created_at', 'updated_at']
