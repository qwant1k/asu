"""Application access rights and effective permission helpers."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

from apps.common.constants import (
    ROLE_ADMIN,
    ROLE_AHS_HEAD,
    ROLE_AHS_WORKER,
    ROLE_COMMISSION_MEMBER,
    ROLE_DEPT_HEAD,
    ROLE_FO_HEAD,
    ROLE_IRD_WORKER,
    ROLE_MOL_NMA,
    ROLE_MOL_WAREHOUSE,
    ROLE_USER,
)


@dataclass(frozen=True)
class AccessDefinition:
    code: str
    name: str
    category: str
    description: str = ''


ACCESS_DEFINITIONS = [
    AccessDefinition('system.admin', 'Администрирование системы', 'Система', 'Доступ к административному разделу приложения.'),
    AccessDefinition('users.manage', 'Управление сотрудниками', 'Сотрудники', 'Создание, изменение, блокировка пользователей и пароли.'),
    AccessDefinition('access.manage', 'Управление правами', 'Сотрудники', 'Настройка прав по должностям и индивидуальных исключений.'),
    AccessDefinition('references.manage', 'Редактирование справочников', 'Справочники', 'Создание и изменение справочных данных.'),
    AccessDefinition('requests.create', 'Создание заявок', 'Заявки', 'Создание и редактирование собственных заявок.'),
    AccessDefinition('requests.view_all', 'Просмотр всех заявок', 'Заявки', 'Просмотр общего журнала заявок.'),
    AccessDefinition('requests.approve_department', 'Согласование руководителем', 'Заявки', 'Согласование заявок на этапе руководителя подразделения.'),
    AccessDefinition('requests.approve_ahs', 'Согласование руководителем АХС', 'Заявки', 'Согласование АХС и выбор ответственных за выдачу.'),
    AccessDefinition('requests.issue', 'Выдача по заявкам', 'Заявки', 'Фактическая выдача товаров по согласованным заявкам.'),
    AccessDefinition('warehouse.view', 'Просмотр склада', 'Склад', 'Остатки, движения и закрепления активов.'),
    AccessDefinition('warehouse.upload', 'Импорт остатков склада', 'Склад', 'Загрузка остатков из Excel.'),
    AccessDefinition('inventory.view_all', 'Просмотр инвентарных карточек', 'Инвентаризация', 'Просмотр карточек сотрудников и активов.'),
    AccessDefinition('documents.manage', 'Работа с документами', 'Документы', 'Журналы документов, создание и подписание.'),
    AccessDefinition('reports.view', 'Просмотр отчетов', 'Отчеты', 'Доступ к отчетам и Excel-выгрузкам.'),
    AccessDefinition('integrations.sync', 'Синхронизация 1С', 'Интеграции', 'Запуск и просмотр статуса обмена с 1С.'),
]

ACCESS_DEFINITION_MAP = {item.code: item for item in ACCESS_DEFINITIONS}
ACCESS_PERMISSION_CHOICES = [(item.code, item.name) for item in ACCESS_DEFINITIONS]
ALL_ACCESS_CODES = tuple(item.code for item in ACCESS_DEFINITIONS)

ROLE_DEFAULT_ACCESS = {
    ROLE_ADMIN: set(ALL_ACCESS_CODES),
    ROLE_AHS_HEAD: {
        'system.admin',
        'references.manage',
        'requests.create',
        'requests.view_all',
        'requests.approve_ahs',
        'requests.issue',
        'warehouse.view',
        'inventory.view_all',
        'documents.manage',
        'reports.view',
    },
    ROLE_AHS_WORKER: {
        'references.manage',
        'requests.create',
        'requests.view_all',
        'requests.issue',
        'warehouse.view',
        'inventory.view_all',
        'documents.manage',
        'reports.view',
    },
    ROLE_MOL_WAREHOUSE: {
        'requests.create',
        'requests.view_all',
        'warehouse.view',
        'warehouse.upload',
        'inventory.view_all',
        'documents.manage',
        'reports.view',
    },
    ROLE_MOL_NMA: {
        'requests.create',
        'requests.view_all',
        'warehouse.view',
        'warehouse.upload',
        'inventory.view_all',
        'documents.manage',
        'reports.view',
    },
    ROLE_FO_HEAD: {'requests.create', 'requests.view_all', 'reports.view'},
    ROLE_DEPT_HEAD: {'requests.create', 'requests.approve_department'},
    ROLE_COMMISSION_MEMBER: {'requests.create', 'documents.manage'},
    ROLE_IRD_WORKER: {'requests.create'},
    ROLE_USER: {'requests.create'},
}

APPROVER_ROLE_ACCESS = {
    ROLE_DEPT_HEAD: 'requests.approve_department',
    ROLE_AHS_HEAD: 'requests.approve_ahs',
    ROLE_MOL_WAREHOUSE: 'warehouse.upload',
    ROLE_MOL_NMA: 'warehouse.upload',
    ROLE_FO_HEAD: 'reports.view',
}


def normalize_position(value: str | None) -> str:
    return ' '.join((value or '').strip().casefold().split())


def role_access_codes(user) -> set[str]:
    if not user or not getattr(user, 'is_authenticated', False):
        return set()
    if getattr(user, 'is_superuser', False):
        return set(ALL_ACCESS_CODES)
    return set(ROLE_DEFAULT_ACCESS.get(getattr(user, 'role', ROLE_USER), set()))


def effective_access_codes(user) -> set[str]:
    """Return permissions after role defaults, position rules, and user overrides."""
    if not user or not getattr(user, 'is_authenticated', False):
        return set()
    if getattr(user, 'is_superuser', False):
        return set(ALL_ACCESS_CODES)

    codes = role_access_codes(user)
    normalized_position = normalize_position(getattr(user, 'position', ''))

    if normalized_position:
        from .models import PositionAccessRule

        rules = PositionAccessRule.objects.filter(
            normalized_position=normalized_position,
            is_active=True,
        )
        for rule in rules:
            if rule.is_allowed:
                codes.add(rule.permission_code)
            else:
                codes.discard(rule.permission_code)

    from .models import UserAccessOverride

    overrides = UserAccessOverride.objects.filter(user=user)
    for override in overrides:
        if override.mode == UserAccessOverride.MODE_GRANT:
            codes.add(override.permission_code)
        else:
            codes.discard(override.permission_code)

    return codes


def has_access(user, code: str) -> bool:
    return code in effective_access_codes(user)


def has_any_access(user, codes: Iterable[str]) -> bool:
    effective = effective_access_codes(user)
    return any(code in effective for code in codes)


def effective_access_detail(user) -> dict:
    """Return effective permissions with their source for admin UI."""
    effective = effective_access_codes(user)
    role_codes = role_access_codes(user)
    normalized_position = normalize_position(getattr(user, 'position', ''))
    position_rules = {}
    user_overrides = {}

    if normalized_position:
        from .models import PositionAccessRule

        position_rules = {
            item.permission_code: item.is_allowed
            for item in PositionAccessRule.objects.filter(
                normalized_position=normalized_position,
                is_active=True,
            )
        }

    from .models import UserAccessOverride

    user_overrides = {
        item.permission_code: item.mode
        for item in UserAccessOverride.objects.filter(user=user)
    }

    items = []
    for definition in ACCESS_DEFINITIONS:
        code = definition.code
        source = 'none'
        if code in role_codes:
            source = 'role'
        if code in position_rules:
            source = 'position_allow' if position_rules[code] else 'position_deny'
        if code in user_overrides:
            source = 'user_grant' if user_overrides[code] == UserAccessOverride.MODE_GRANT else 'user_deny'
        items.append({
            'code': code,
            'name': definition.name,
            'category': definition.category,
            'description': definition.description,
            'allowed': code in effective,
            'source': source,
        })
    return {
        'user': user.id,
        'position': getattr(user, 'position', ''),
        'normalized_position': normalized_position,
        'permissions': items,
    }
