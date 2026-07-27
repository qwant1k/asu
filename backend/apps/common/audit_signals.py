"""Сигналы аудита для автоматического логирования изменений моделей."""

import logging
from contextvars import ContextVar
from datetime import date, datetime
from decimal import Decimal

from django.db.models.signals import post_save, post_delete, pre_save

logger = logging.getLogger(__name__)

_AUDITED_MODELS = None
_REQUEST_CONTEXT = ContextVar('audit_request_context', default={})
_SENSITIVE_FIELDS = {'password', 'token', 'secret', 'otp_code'}


def _get_audited_models():
    """Return set of model class paths that should be audited."""
    global _AUDITED_MODELS
    if _AUDITED_MODELS is not None:
        return _AUDITED_MODELS

    _AUDITED_MODELS = {
        'apps.users.User',
        'apps.users.Department',
        'apps.references.Asset',
        'apps.references.AssetCategory',
        'apps.references.Warehouse',
        'apps.references.Counterparty',
        'apps.requests.AssetRequest',
        'apps.documents.IncomingInvoice',
        'apps.documents.WriteOffAct',
        'apps.documents.InternalTransferInvoice',
        'apps.documents.Petition',
        'apps.documents.CommissionProtocol',
        'apps.assets.WarehouseStock',
        'apps.assets.AssetAssignment',
        'apps.assets.StockAlertRule',
    }
    return _AUDITED_MODELS


def _log_action(instance, action, user=None, changes=None, ip_address=None):
    from apps.common.audit import AuditLog
    from django.contrib.contenttypes.models import ContentType

    ct = ContentType.objects.get_for_model(instance)
    AuditLog.objects.create(
        user=user,
        action=action,
        content_type=ct,
        object_id=str(instance.pk),
        object_repr=str(instance)[:255],
        changes=changes or {},
        ip_address=ip_address,
    )


def set_request_context(user=None, ip_address=None):
    authenticated_user = user if user and getattr(user, 'is_authenticated', False) else None
    return _REQUEST_CONTEXT.set({'user': authenticated_user, 'ip_address': ip_address})


def clear_request_context(token):
    _REQUEST_CONTEXT.reset(token)


def _serialize(value):
    if isinstance(value, (datetime, date, Decimal)):
        return str(value)
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    if hasattr(value, 'pk'):
        return value.pk
    return str(value)


def _snapshot(instance):
    values = {}
    for field in instance._meta.concrete_fields:
        name = field.name
        if name in _SENSITIVE_FIELDS:
            values[name] = '***'
        else:
            values[name] = _serialize(getattr(instance, field.attname, None))
    return values


def should_audit(sender):
    model_path = f'{sender._meta.app_label}.{sender.__name__}'
    app_label = sender._meta.app_label
    model_name = sender.__name__
    full_path = f'apps.{app_label}.{model_name}'
    return full_path in _get_audited_models()


def connect_audit_signals():
    """Connect audit signals for all audited models."""
    from django.apps import apps

    for model_path in _get_audited_models():
        parts = model_path.split('.')
        app_label = parts[1]
        model_name = parts[2]
        try:
            model = apps.get_model(app_label, model_name)
            pre_save.connect(_on_pre_save, sender=model, dispatch_uid=f'audit_pre_save_{model_path}')
            post_save.connect(_on_save, sender=model, dispatch_uid=f'audit_save_{model_path}')
            post_delete.connect(_on_delete, sender=model, dispatch_uid=f'audit_delete_{model_path}')
        except LookupError:
            logger.warning(f'Audit: model {model_path} not found')


def _on_pre_save(sender, instance, **kwargs):
    if not should_audit(sender) or not instance.pk:
        instance._audit_changes = {}
        return
    previous = sender.objects.filter(pk=instance.pk).first()
    if not previous:
        instance._audit_changes = {}
        return
    before = _snapshot(previous)
    after = _snapshot(instance)
    instance._audit_changes = {
        key: {'from': before[key], 'to': after[key]}
        for key in before
        if before[key] != after[key]
    }


def _on_save(sender, instance, created, **kwargs):
    if not should_audit(sender):
        return
    action = 'create' if created else 'update'
    context = _REQUEST_CONTEXT.get()
    changes = {'created': _snapshot(instance)} if created else getattr(instance, '_audit_changes', {})
    _log_action(
        instance,
        action,
        user=context.get('user'),
        ip_address=context.get('ip_address'),
        changes=changes,
    )


def _on_delete(sender, instance, **kwargs):
    if not should_audit(sender):
        return
    context = _REQUEST_CONTEXT.get()
    _log_action(
        instance,
        'delete',
        user=context.get('user'),
        ip_address=context.get('ip_address'),
        changes={'deleted': _snapshot(instance)},
    )
