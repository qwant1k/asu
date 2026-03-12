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
    Проверка документов на подписании > 72 рабочих часов.
    Запускается каждые 4 часа.
    """
    from apps.documents.models import DocumentSignature
    from apps.notifications.services import NotificationService
    from apps.common.constants import NOTIFICATION_OVERDUE_TASK
    from datetime import timedelta

    threshold = timezone.now() - timedelta(hours=72)

    overdue_signatures = DocumentSignature.objects.filter(
        signed_at__isnull=True,
        sent_for_revision_at__isnull=True,
        otp_expires_at__lt=threshold,
    ).select_related('signer')

    for sig in overdue_signatures:
        NotificationService.send(
            recipient=sig.signer,
            notification_type=NOTIFICATION_OVERDUE_TASK,
            title=_('Документ ожидает вашей подписи'),
            body=_('Документ находится на подписании более 72 часов. '
                   'Пожалуйста, подпишите или отправьте на доработку.'),
            related_object=sig.document,
        )

    logger.info(f'Напоминания о подписании: отправлено {overdue_signatures.count()}')


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


@shared_task(name='send_otp_email')
def send_otp_email_task(user_id: int, otp_code: str, purpose: str = 'approval'):
    """
    Отправка OTP-кода на email пользователя.

    Args:
        user_id: ID пользователя
        otp_code: OTP-код (незахэшированный)
        purpose: назначение (approval / signing)
    """
    from apps.users.models import User
    from apps.notifications.services import NotificationService
    from apps.common.constants import NOTIFICATION_DOCUMENT_TO_SIGN
    from django.core.mail import send_mail
    from django.conf import settings

    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        logger.error(f'Пользователь {user_id} не найден')
        return

    if not user.email:
        logger.warning(f'У пользователя {user.get_short_name()} не указан email')
        return

    subject = f'[{settings.APP_NAME}] Код подтверждения OTP'
    body = (
        f'Здравствуйте, {user.get_full_name()}!\n\n'
        f'Ваш код подтверждения: {otp_code}\n'
        f'Код действителен 30 минут.\n\n'
        f'Если вы не запрашивали код, проигнорируйте это сообщение.'
    )

    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        logger.info(f'OTP-код отправлен на {user.email}')
    except Exception as e:
        logger.error(f'Ошибка отправки OTP на {user.email}: {e}')
