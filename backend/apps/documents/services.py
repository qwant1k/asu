"""Сервис workflow документов ИС «АСУ»."""

from django.db import transaction
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from apps.common.constants import (
    DOCUMENT_PARTIALLY_SIGNED,
    DOCUMENT_SIGNED,
    DOCUMENT_SENT_FOR_REVISION,
)
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
        from apps.documents.models import (
            IncomingInvoice, WriteOffAct, InternalTransferInvoice,
        )

        if isinstance(document, IncomingInvoice):
            for item in document.items.all():
                StockService.receive_stock(
                    asset=item.asset,
                    quantity=item.quantity,
                    price=item.unit_price,
                    document=document,
                    performed_by=document.created_by,
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
