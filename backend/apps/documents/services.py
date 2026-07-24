"""Сервис workflow документов ИС «АСУ»."""

from django.db import transaction
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from apps.common.constants import (
    DOCUMENT_DRAFT,
    DOCUMENT_PENDING_AHS_APPROVAL,
    DOCUMENT_PENDING_CHANGE_APPROVAL,
    DOCUMENT_PARTIALLY_SIGNED,
    DOCUMENT_REJECTED,
    DOCUMENT_SIGNED,
    DOCUMENT_SENT_FOR_REVISION,
    MOVEMENT_RECEIPT,
    NOTIFICATION_DOCUMENT_TO_SIGN,
    ROLE_AHS_HEAD,
)
from apps.notifications.services import NotificationService
from apps.users.access import has_access
from apps.users.models import User
from .models import DocumentSignature


class DocumentWorkflowService:
    """Сервис управления жизненным циклом документов."""

    @staticmethod
    def _get_signatures(document):
        """Получить все подписи для документа."""
        ct = ContentType.objects.get_for_model(document)
        return DocumentSignature.objects.filter(
            document_type=ct, document_id=document.pk,
        )

    @staticmethod
    def get_document_title(document):
        num = document.number or 'б/н'
        return f'{document._meta.verbose_name} №{num}'

    @staticmethod
    def get_ahs_approvers():
        return User.objects.filter(is_active=True, role=ROLE_AHS_HEAD)

    @staticmethod
    def can_approve_ahs(user):
        return bool(
            user
            and user.is_authenticated
            and (
                getattr(user, 'role', '') == ROLE_AHS_HEAD
                or has_access(user, 'requests.approve_ahs')
                or has_access(user, 'system.admin')
            )
        )

    @staticmethod
    def pending_my_approval(document, user):
        return (
            document.status in (DOCUMENT_PENDING_AHS_APPROVAL, DOCUMENT_PENDING_CHANGE_APPROVAL)
            and DocumentWorkflowService.can_approve_ahs(user)
        )

    @staticmethod
    @transaction.atomic
    def submit_for_ahs_approval(document, user):
        """Отправить документ руководителю АХС на согласование."""
        if document.status not in (DOCUMENT_DRAFT, DOCUMENT_SENT_FOR_REVISION):
            raise ValueError(_('Документ можно отправить только из черновика или доработки'))

        document.status = DOCUMENT_PENDING_AHS_APPROVAL
        document.save(update_fields=['status', 'updated_at'])

        ct = ContentType.objects.get_for_model(document)
        for approver in DocumentWorkflowService.get_ahs_approvers():
            DocumentSignature.objects.get_or_create(
                document_type=ct,
                document_id=document.pk,
                signer=approver,
                signed_at__isnull=True,
                defaults={'role_label': _('Руководитель АХС')},
            )
            NotificationService.send(
                recipient=approver,
                notification_type=NOTIFICATION_DOCUMENT_TO_SIGN,
                title=_('Документ на согласование АХС'),
                body=_('%(title)s ожидает согласования.') % {
                    'title': DocumentWorkflowService.get_document_title(document),
                },
                related_object=document,
            )

        return document

    @staticmethod
    @transaction.atomic
    def request_change(document, user, reason=''):
        """Запросить разрешение на изменение уже подписанного документа."""
        from apps.documents.models import IncomingInvoice

        if not isinstance(document, IncomingInvoice):
            raise ValueError(_('Запрос на изменение сейчас доступен для приходных накладных'))
        if document.status != DOCUMENT_SIGNED:
            raise ValueError(_('Запросить изменение можно только по подписанному документу'))

        ct = ContentType.objects.get_for_model(document)
        DocumentSignature.objects.create(
            document_type=ct,
            document_id=document.pk,
            signer=user,
            role_label=_('Запрос на изменение'),
            sent_for_revision_at=timezone.now(),
            revision_reason=reason,
        )

        for approver in DocumentWorkflowService.get_ahs_approvers():
            DocumentSignature.objects.get_or_create(
                document_type=ct,
                document_id=document.pk,
                signer=approver,
                signed_at__isnull=True,
                defaults={'role_label': _('Согласование изменения')},
            )
            NotificationService.send(
                recipient=approver,
                notification_type=NOTIFICATION_DOCUMENT_TO_SIGN,
                title=_('Запрос на изменение документа'),
                body=_('%(title)s ожидает решения по изменению. %(reason)s') % {
                    'title': DocumentWorkflowService.get_document_title(document),
                    'reason': reason or '',
                },
                related_object=document,
            )

        document.status = DOCUMENT_PENDING_CHANGE_APPROVAL
        document.save(update_fields=['status', 'updated_at'])
        return document

    @staticmethod
    @transaction.atomic
    def approve_change_request(document, approver, comment=''):
        """Разрешить изменение подписанного документа."""
        if document.status != DOCUMENT_PENDING_CHANGE_APPROVAL:
            raise ValueError(_('Документ не ожидает решения по изменению'))
        if not DocumentWorkflowService.can_approve_ahs(approver):
            raise ValueError(_('Недостаточно прав для согласования изменения'))

        ct = ContentType.objects.get_for_model(document)
        signature = DocumentSignature.objects.filter(
            document_type=ct,
            document_id=document.pk,
            signer=approver,
            signed_at__isnull=True,
        ).order_by('-id').first()
        if not signature:
            signature = DocumentSignature.objects.create(
                document_type=ct,
                document_id=document.pk,
                signer=approver,
                role_label=_('Согласование изменения'),
            )
        signature.role_label = signature.role_label or _('Согласование изменения')
        signature.revision_reason = comment or signature.revision_reason
        signature.signed_at = timezone.now()
        signature.save(update_fields=['role_label', 'revision_reason', 'signed_at'])

        document.status = DOCUMENT_SENT_FOR_REVISION
        document.save(update_fields=['status', 'updated_at'])
        return document

    @staticmethod
    @transaction.atomic
    def reject_change_request(document, approver, reason=''):
        """Отклонить запрос на изменение подписанного документа."""
        if document.status != DOCUMENT_PENDING_CHANGE_APPROVAL:
            raise ValueError(_('Документ не ожидает решения по изменению'))
        if not DocumentWorkflowService.can_approve_ahs(approver):
            raise ValueError(_('Недостаточно прав для отклонения изменения'))

        ct = ContentType.objects.get_for_model(document)
        signature = DocumentSignature.objects.filter(
            document_type=ct,
            document_id=document.pk,
            signer=approver,
            signed_at__isnull=True,
        ).order_by('-id').first()
        if not signature:
            signature = DocumentSignature.objects.create(
                document_type=ct,
                document_id=document.pk,
                signer=approver,
                role_label=_('Отклонение изменения'),
            )
        signature.sent_for_revision_at = timezone.now()
        signature.revision_reason = reason
        signature.save(update_fields=['sent_for_revision_at', 'revision_reason'])

        document.status = DOCUMENT_SIGNED
        document.save(update_fields=['status', 'updated_at'])
        return document

    @staticmethod
    @transaction.atomic
    def approve_ahs(document, approver, comment=''):
        """Согласовать документ руководителем АХС и финализировать документ."""
        if document.status != DOCUMENT_PENDING_AHS_APPROVAL:
            raise ValueError(_('Документ не ожидает согласования АХС'))
        if not DocumentWorkflowService.can_approve_ahs(approver):
            raise ValueError(_('Недостаточно прав для согласования документа'))

        ct = ContentType.objects.get_for_model(document)
        signature, created = DocumentSignature.objects.get_or_create(
            document_type=ct,
            document_id=document.pk,
            signer=approver,
            signed_at__isnull=True,
            defaults={'role_label': _('Руководитель АХС')},
        )
        signature.role_label = signature.role_label or _('Руководитель АХС')
        signature.revision_reason = comment or signature.revision_reason
        signature.signed_at = timezone.now()
        signature.save(update_fields=['role_label', 'revision_reason', 'signed_at'])

        document.status = DOCUMENT_SIGNED
        document.save(update_fields=['status', 'updated_at'])
        document.assign_number()
        DocumentWorkflowService._post_sign_actions(document)

        return document

    @staticmethod
    @transaction.atomic
    def reject_ahs(document, approver, reason=''):
        """Отклонить документ руководителем АХС."""
        if document.status != DOCUMENT_PENDING_AHS_APPROVAL:
            raise ValueError(_('Документ не ожидает согласования АХС'))
        if not DocumentWorkflowService.can_approve_ahs(approver):
            raise ValueError(_('Недостаточно прав для отклонения документа'))

        ct = ContentType.objects.get_for_model(document)
        signature, created = DocumentSignature.objects.get_or_create(
            document_type=ct,
            document_id=document.pk,
            signer=approver,
            signed_at__isnull=True,
            defaults={'role_label': _('Руководитель АХС')},
        )
        signature.sent_for_revision_at = timezone.now()
        signature.revision_reason = reason
        signature.save(update_fields=['sent_for_revision_at', 'revision_reason'])

        document.status = DOCUMENT_REJECTED
        document.save(update_fields=['status', 'updated_at'])

        return document

    @staticmethod
    @transaction.atomic
    def sign(document, signer, role_label='', is_acting_chairman=False):
        """Подписать документ текущим пользователем."""
        if document.status == DOCUMENT_SIGNED:
            raise ValueError(_('Документ уже подписан'))

        ct = ContentType.objects.get_for_model(document)
        signature = DocumentSignature.objects.filter(
            document_type=ct,
            document_id=document.pk,
            signer=signer,
            signed_at__isnull=True,
        ).order_by('-id').first()

        if not signature:
            signature = DocumentSignature.objects.create(
                document_type=ct,
                document_id=document.pk,
                signer=signer,
                role_label=role_label,
                is_acting_chairman=is_acting_chairman,
            )
        elif role_label or is_acting_chairman:
            signature.role_label = role_label or signature.role_label
            signature.is_acting_chairman = is_acting_chairman
            signature.save(update_fields=['role_label', 'is_acting_chairman'])

        signature.signed_at = timezone.now()
        signature.save(update_fields=['signed_at'])

        # Проверяем, все ли подписали
        DocumentWorkflowService._check_all_signed(document)

        return document

    @staticmethod
    @transaction.atomic
    def send_for_revision(document, signer, reason=''):
        """Отправить документ на доработку."""
        ct = ContentType.objects.get_for_model(document)
        signature = DocumentSignature.objects.filter(
            document_type=ct,
            document_id=document.pk,
            signer=signer,
            signed_at__isnull=True,
        ).order_by('-id').first()

        if signature:
            signature.sent_for_revision_at = timezone.now()
            signature.revision_reason = reason
            signature.save(update_fields=['sent_for_revision_at', 'revision_reason'])

        document.status = DOCUMENT_SENT_FOR_REVISION
        document.save(update_fields=['status', 'updated_at'])

        return document

    @staticmethod
    def _check_all_signed(document):
        """Проверить, все ли подписи собраны. Если да — финализировать."""
        signatures = DocumentWorkflowService._get_signatures(document)
        total = signatures.count()
        signed = signatures.filter(signed_at__isnull=False).count()

        if total == 0:
            return

        if signed == total:
            document.status = DOCUMENT_SIGNED
            document.save(update_fields=['status', 'updated_at'])
            document.assign_number()

            # Пересчёт остатков при подписании документов движения
            DocumentWorkflowService._post_sign_actions(document)
        elif signed > 0:
            document.status = DOCUMENT_PARTIALLY_SIGNED
            document.save(update_fields=['status', 'updated_at'])

    @staticmethod
    def _post_sign_actions(document):
        """Действия после финального подписания документа."""
        from apps.assets.services import StockService
        from apps.assets.models import StockMovement, WarehouseStock
        from apps.documents.models import (
            IncomingInvoice, WriteOffAct, InternalTransferInvoice,
        )

        if isinstance(document, IncomingInvoice):
            ct = ContentType.objects.get_for_model(document)
            previous_movements = StockMovement.objects.select_for_update().filter(
                document_type=ct,
                document_id=document.pk,
                movement_type=MOVEMENT_RECEIPT,
            )
            for movement in previous_movements:
                stock = WarehouseStock.objects.select_for_update().filter(asset=movement.asset).first()
                if not stock:
                    continue
                if stock.quantity < movement.quantity:
                    raise ValueError(
                        _('Нельзя перепровести документ: по %(asset)s остаток меньше ранее оприходованного количества') % {
                            'asset': movement.asset.name,
                        }
                    )
                stock.quantity -= movement.quantity
                stock.total_amount = stock.quantity * stock.asset.unit_price
                stock.save(update_fields=['quantity', 'total_amount', 'updated_at'])
            previous_movements.delete()

            for item in document.items.all():
                StockService.receive_stock(
                    asset=item.asset,
                    quantity=item.quantity,
                    price=item.unit_price,
                    document=document,
                    performed_by=document.created_by,
                    warehouse=document.warehouse,
                )

        elif isinstance(document, WriteOffAct):
            for item in document.items.all():
                StockService.write_off_stock(
                    asset=item.asset,
                    quantity=item.quantity,
                    document=document,
                    performed_by=document.created_by,
                )

            # Уведомление 1С (заглушка) для ОС/НМА
            if document.act_type in ('OS_NMA', 'DESTRUCTION'):
                from apps.integrations.one_c.client import one_c_client
                asset_ids = [
                    item.asset.source_1c_id
                    for item in document.items.all()
                    if item.asset.source_1c_id
                ]
                if asset_ids:
                    one_c_client.notify_writeoff_to_1c(asset_ids, document.number)

        elif isinstance(document, InternalTransferInvoice):
            for item in document.items.all():
                StockService.transfer_stock(
                    asset=item.asset,
                    quantity=item.quantity,
                    from_user=document.from_user,
                    to_user=document.to_user,
                    document=document,
                    performed_by=document.created_by,
                )
