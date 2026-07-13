"""Celery-задачи для интеграции с 1С и фоновых операций ИС «АСУ»."""

import logging
from celery import shared_task
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

logger = logging.getLogger(__name__)


@shared_task(name='sync_assets_from_1c')
def sync_assets_from_1c_task(asset_type: str = 'all'):
    """
    Плановая синхронизация активов из 1С.
    Запускается по расписанию: ежедневно в 03:00 по Алматы.
    ЗАГЛУШКА: см. OneCIntegrationClient.sync_assets()
    """
    from apps.integrations.one_c.client import one_c_client
    from apps.integrations.models import SyncLog

    log = SyncLog.objects.create(
        sync_type=f'assets_{asset_type}',
        status='RUNNING',
    )

    try:
        if asset_type == 'all':
            types = ['TMZ', 'OS', 'NMA']
        else:
            types = [asset_type]

        total_created = 0
        total_updated = 0

        for at in types:
            result = one_c_client.sync_assets(at)
            total_created += result.get('created', 0)
            total_updated += result.get('updated', 0)

        log.status = 'SUCCESS'
        log.created_count = total_created
        log.updated_count = total_updated
        log.is_stub = not one_c_client.enabled
        log.finished_at = timezone.now()
        log.save()

        logger.info(
            f'Синхронизация 1С завершена: создано={total_created}, '
            f'обновлено={total_updated}, stub={not one_c_client.enabled}'
        )

    except Exception as e:
        log.status = 'FAILED'
        log.error_message = str(e)
        log.finished_at = timezone.now()
        log.save()
        logger.error(f'Ошибка синхронизации 1С: {e}')
        raise


@shared_task(name='check_document_signing_reminders')
def check_document_signing_reminders_task():
    """
    Проверка документов, ожидающих подписи.
    Запускается каждые 4 часа.
    """
    from apps.documents.models import DocumentSignature
    from apps.notifications.services import NotificationService
    from apps.common.constants import NOTIFICATION_OVERDUE_TASK
    pending_signatures = DocumentSignature.objects.filter(
        signed_at__isnull=True,
        sent_for_revision_at__isnull=True,
    ).select_related('signer')

    for sig in pending_signatures:
        NotificationService.send(
            recipient=sig.signer,
            notification_type=NOTIFICATION_OVERDUE_TASK,
            title=_('Документ ожидает вашей подписи'),
            body=_('Документ находится на подписании более 72 часов. '
                   'Пожалуйста, подпишите или отправьте на доработку.'),
            related_object=sig.document,
        )

    logger.info(f'Напоминания о подписании: отправлено {pending_signatures.count()}')


@shared_task(name='check_asset_expiry')
def check_asset_expiry_task():
    """
    Ежедневная проверка истечения срока ОС/НМА.
    Если assigned_at + useful_life_months × 30 ≤ now() + 30 дней → уведомление МОЛ.
    """
    from apps.assets.models import AssetAssignment
    from apps.users.models import User
    from apps.notifications.services import NotificationService
    from apps.common.constants import (
        NOTIFICATION_ASSET_EXPIRY,
        ASSIGNMENT_ACTIVE,
        ROLE_MOL_WAREHOUSE,
        ROLE_MOL_NMA,
    )
    from datetime import timedelta
    from django.db.models import F, ExpressionWrapper, DateTimeField

    now = timezone.now()
    threshold = now + timedelta(days=30)

    expiring = AssetAssignment.objects.filter(
        status=ASSIGNMENT_ACTIVE,
        asset__useful_life_months__isnull=False,
    ).select_related('asset', 'user')

    notified = 0
    for assignment in expiring:
        months = assignment.asset.useful_life_months
        if months is None:
            continue

        expiry_date = assignment.assigned_at + timedelta(days=months * 30)
        if expiry_date <= threshold:
            # Уведомить МОЛ
            mol_roles = [ROLE_MOL_WAREHOUSE, ROLE_MOL_NMA]
            mol_users = User.objects.filter(role__in=mol_roles, is_active=True)
            for mol in mol_users:
                NotificationService.send(
                    recipient=mol,
                    notification_type=NOTIFICATION_ASSET_EXPIRY,
                    title=_('Истекает срок полезного использования актива'),
                    body=_(
                        'Актив "%(asset)s" (закреплён за %(user)s) — '
                        'срок истекает %(date)s.'
                    ) % {
                        'asset': assignment.asset.name,
                        'user': assignment.user.get_short_name(),
                        'date': expiry_date.strftime('%d.%m.%Y'),
                    },
                    related_object=assignment,
                )
                notified += 1

    logger.info(f'Проверка сроков активов: отправлено уведомлений {notified}')
