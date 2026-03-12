"""Сервисы OTP и workflow заявок ИС «АСУ»."""

import hashlib
import random
import string
from datetime import timedelta
from decimal import Decimal

from django.db import transaction
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from apps.common.constants import (
    APPROVAL_APPROVED,
    APPROVAL_REJECTED,
    OTP_CODE_LENGTH,
    OTP_EXPIRY_MINUTES,
    REQUEST_APPROVED,
    REQUEST_APPROVED_AHS_HEAD,
    REQUEST_APPROVED_MOL,
    REQUEST_APPROVED_SUPERVISOR,
    REQUEST_CANCELLED,
    REQUEST_DRAFT,
    REQUEST_EXECUTED,
    REQUEST_PENDING_SUPERVISOR,
    REQUEST_REJECTED,
    ROLE_ADMIN,
    ROLE_AHS_HEAD,
    ROLE_AHS_WORKER,
    ROLE_DEPT_HEAD,
    ROLE_MOL_NMA,
    ROLE_MOL_WAREHOUSE,
)

from .models import AssetRequest, RequestApproval


class OTPService:
    """Сервис генерации и верификации OTP-кодов."""

    @staticmethod
    def generate_otp():
        code = ''.join(random.choices(string.digits, k=OTP_CODE_LENGTH))
        return code

    @staticmethod
    def hash_otp(code: str) -> str:
        return hashlib.sha256(code.encode('utf-8')).hexdigest()

    @staticmethod
    def verify_otp(stored_hash: str, code: str) -> bool:
        return OTPService.hash_otp(code) == stored_hash

    @staticmethod
    def get_expiry_time():
        return timezone.now() + timedelta(minutes=OTP_EXPIRY_MINUTES)

    @staticmethod
    def is_expired(expires_at) -> bool:
        if expires_at is None:
            return True
        return timezone.now() > expires_at


class RequestWorkflowService:
    """Сервис управления жизненным циклом заявки."""

    TRANSITION_MAP = {
        REQUEST_PENDING_SUPERVISOR: {
            'next': REQUEST_APPROVED_SUPERVISOR,
            'role': ROLE_DEPT_HEAD,
        },
        REQUEST_APPROVED_SUPERVISOR: {
            'next': REQUEST_APPROVED_MOL,
            'role': None,
        },
        REQUEST_APPROVED_MOL: {
            'next': REQUEST_APPROVED_AHS_HEAD,
            'role': ROLE_AHS_HEAD,
        },
        REQUEST_APPROVED_AHS_HEAD: {
            'next': REQUEST_APPROVED,
            'role': None,
        },
    }

    @staticmethod
    @transaction.atomic
    def submit(request_obj: AssetRequest):
        if request_obj.status != REQUEST_DRAFT:
            raise ValueError(_('Отправить на согласование можно только черновик'))

        if not request_obj.items.exists():
            raise ValueError(_('Заявка не содержит позиций'))

        if request_obj.items.filter(requested_group__isnull=True, asset__isnull=True).exists():
            raise ValueError(_('Каждая позиция заявки должна быть привязана к группе справочника'))

        request_obj.status = REQUEST_PENDING_SUPERVISOR
        request_obj.save(update_fields=['status', 'updated_at'])
        return request_obj

    @staticmethod
    @transaction.atomic
    def generate_otp_for_approval(request_obj: AssetRequest, approver):
        otp_code = OTPService.generate_otp()
        otp_hash = OTPService.hash_otp(otp_code)

        RequestApproval.objects.create(
            request=request_obj,
            approver=approver,
            role_at_approval=approver.role,
            action=APPROVAL_APPROVED,
            otp_code=otp_hash,
            otp_expires_at=OTPService.get_expiry_time(),
        )

        return otp_code

    @staticmethod
    @transaction.atomic
    def approve(request_obj: AssetRequest, approver, otp_code: str):
        approval = RequestApproval.objects.filter(
            request=request_obj,
            approver=approver,
            signed_at__isnull=True,
        ).order_by('-created_at').first()

        if not approval:
            raise ValueError(_('Запись согласования не найдена'))

        if OTPService.is_expired(approval.otp_expires_at):
            raise ValueError(_('Срок действия OTP-кода истёк'))

        if not OTPService.verify_otp(approval.otp_code, otp_code):
            raise ValueError(_('Неверный OTP-код'))

        approval.signed_at = timezone.now()
        approval.action = APPROVAL_APPROVED
        approval.save(update_fields=['signed_at', 'action'])

        transition = RequestWorkflowService.TRANSITION_MAP.get(request_obj.status)
        if transition:
            request_obj.status = transition['next']
            if request_obj.status == REQUEST_APPROVED_AHS_HEAD:
                request_obj.status = REQUEST_APPROVED
            request_obj.save(update_fields=['status', 'updated_at'])

        return request_obj

    @staticmethod
    @transaction.atomic
    def reject(request_obj: AssetRequest, approver, comment: str = ''):
        if request_obj.status in (
            REQUEST_DRAFT,
            REQUEST_EXECUTED,
            REQUEST_REJECTED,
            REQUEST_CANCELLED,
        ):
            raise ValueError(_('Невозможно отклонить заявку в текущем статусе'))

        RequestApproval.objects.create(
            request=request_obj,
            approver=approver,
            role_at_approval=approver.role,
            action=APPROVAL_REJECTED,
            signed_at=timezone.now(),
            comment=comment,
        )

        request_obj.status = REQUEST_REJECTED
        request_obj.save(update_fields=['status', 'updated_at'])
        return request_obj

    @staticmethod
    @transaction.atomic
    def cancel(request_obj: AssetRequest, user):
        if request_obj.status != REQUEST_DRAFT:
            raise ValueError(_('Отменить можно только черновик'))

        if request_obj.initiator != user:
            raise ValueError(_('Отменить заявку может только инициатор'))

        request_obj.status = REQUEST_CANCELLED
        request_obj.save(update_fields=['status', 'updated_at'])
        return request_obj

    @staticmethod
    @transaction.atomic
    def issue_items(request_obj: AssetRequest, user, items_data):
        if request_obj.status != REQUEST_APPROVED:
            raise ValueError(_('Выдача доступна только для утверждённой заявки'))

        if user.role not in (
            ROLE_ADMIN,
            ROLE_AHS_WORKER,
            ROLE_AHS_HEAD,
            ROLE_MOL_WAREHOUSE,
            ROLE_MOL_NMA,
        ):
            raise ValueError(_('У вас нет прав на выдачу активов по заявке'))

        if not items_data:
            raise ValueError(_('Не переданы позиции для выдачи'))

        from apps.assets.services import StockService
        from apps.references.models import Asset

        items_map = {
            item.id: item
            for item in request_obj.items.select_related('requested_group', 'issued_asset', 'asset')
        }
        recipient = request_obj.to_user or request_obj.initiator

        for row in items_data:
            item_id = row.get('id')
            issued_asset_id = row.get('issued_asset')
            quantity_issued = row.get('quantity_issued')

            if item_id not in items_map:
                raise ValueError(_('Позиция заявки не найдена'))

            request_item = items_map[item_id]
            if issued_asset_id in (None, '') or quantity_issued in (None, ''):
                raise ValueError(_('Для каждой позиции нужно указать выданный справочник и количество'))

            issued_asset = Asset.objects.select_related('group').filter(pk=issued_asset_id).first()
            if not issued_asset:
                raise ValueError(_('Выданный справочник не найден'))

            target_group = request_item.requested_group or issued_asset.group
            if target_group and issued_asset.group_id != target_group.id:
                raise ValueError(_('Выданный справочник должен принадлежать запрошенной группе'))

            quantity = Decimal(str(quantity_issued))
            if quantity <= 0:
                raise ValueError(_('Количество выдачи должно быть больше нуля'))

            if quantity > request_item.quantity_requested:
                raise ValueError(_('Количество выдачи не может превышать запрошенное'))

            if issued_asset.asset_type in ('OS', 'NMA') and quantity != Decimal('1'):
                raise ValueError(_('Для ОС и НМА выдача возможна только по одной единице на карточку'))

            StockService.issue_stock(
                asset=issued_asset,
                quantity=quantity,
                to_user=recipient,
                document=request_obj,
                performed_by=user,
            )

            request_item.issued_asset = issued_asset
            request_item.quantity_issued = quantity
            if request_item.asset_id is None:
                request_item.asset = issued_asset
            request_item.save(update_fields=['issued_asset', 'quantity_issued', 'asset'])

        if request_obj.items.filter(quantity_issued__isnull=True).exists():
            raise ValueError(_('Не все позиции заявки выданы'))

        request_obj.status = REQUEST_EXECUTED
        request_obj.save(update_fields=['status', 'updated_at'])
        return request_obj

    @staticmethod
    @transaction.atomic
    def confirm_receipt(request_obj: AssetRequest, user):
        if request_obj.status != REQUEST_EXECUTED:
            raise ValueError(_('Подтверждение возможно только после фактической выдачи по заявке'))

        if request_obj.initiator != user:
            raise ValueError(_('Подтвердить получение может только инициатор'))

        return request_obj
