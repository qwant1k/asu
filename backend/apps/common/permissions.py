"""Кастомные разрешения для API проекта ИС «АСУ»."""

from rest_framework.permissions import BasePermission

from apps.users.access import has_access, has_any_access


class IsAdmin(BasePermission):
    """Доступ только для администраторов."""
    message = 'Доступ разрешён только администраторам.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and has_access(request.user, 'system.admin')
        )


class IsAHSStaff(BasePermission):
    """Доступ для сотрудников АХС и администраторов."""
    message = 'Доступ разрешён только сотрудникам АХС.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and has_any_access(request.user, ('references.manage', 'requests.issue', 'requests.approve_ahs'))
        )


class IsAHSHead(BasePermission):
    """Доступ для руководителя АХС и администраторов."""
    message = 'Доступ разрешён только руководителю АХС.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and has_access(request.user, 'requests.approve_ahs')
        )


class IsMOLWarehouse(BasePermission):
    """Доступ для МОЛ по складу."""
    message = 'Доступ разрешён только МОЛ по складу.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and has_any_access(request.user, ('warehouse.upload', 'warehouse.view'))
        )


class IsMOLNMA(BasePermission):
    """Доступ для МОЛ по НМА."""
    message = 'Доступ разрешён только МОЛ по НМА.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and has_any_access(request.user, ('warehouse.upload', 'warehouse.view'))
        )


class IsCommissionMember(BasePermission):
    """Доступ для членов Рабочей комиссии."""
    message = 'Доступ разрешён только членам Рабочей комиссии.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and has_any_access(request.user, ('documents.manage', 'system.admin'))
        )


class IsDeptHead(BasePermission):
    """Доступ для руководителей подразделений."""
    message = 'Доступ разрешён только руководителям подразделений.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and has_access(request.user, 'requests.approve_department')
        )


class RoleBasedPermission(BasePermission):
    """
    Универсальный класс разрешений на основе ролей.

    Использование во ViewSet:
        permission_classes_by_action = {
            'list': ['ADMIN', 'AHS_WORKER', 'AHS_HEAD'],
            'create': ['ADMIN', 'AHS_WORKER'],
            'default': ['ADMIN'],
        }
    """
    message = 'Недостаточно прав для выполнения данного действия.'

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Администратор имеет полный доступ
        if has_access(request.user, 'system.admin'):
            return True

        # Получаем разрешённые роли для текущего действия
        permission_map = getattr(view, 'permission_classes_by_action', {})
        action = getattr(view, 'action', None)

        allowed_roles = permission_map.get(action, permission_map.get('default', []))

        return request.user.role in allowed_roles


class ReadOnlyOrAHSStaff(BasePermission):
    """
    Просмотр — все аутентифицированные.
    Создание/редактирование/удаление — ADMIN, AHS_WORKER, AHS_HEAD.
    """
    message = 'Редактирование доступно только сотрудникам АХС.'

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True

        return has_access(request.user, 'references.manage')
