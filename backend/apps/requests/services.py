"""Сервисы workflow заявок ИС «АСУ»."""

from decimal import Decimal

from django.db import transaction
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from apps.common.constants import (
    APPROVAL_APPROVED,
    APPROVAL_REJECTED,
    APPROVAL_SENT_TO_REVISION,
    APPROVAL_SUBMITTED,
    APPROVAL_WITHDRAWN,
    NOTIFICATION_REQUEST_STATUS,
    NOTIFICATION_REQUEST_TO_APPROVE,
    NOTIFICATION_REQUEST_TO_ISSUE,
    REQUEST_APPROVED,
    REQUEST_APPROVED_AHS_HEAD,
    REQUEST_APPROVED_MOL,
    REQUEST_APPROVED_SUPERVISOR,
    REQUEST_CANCELLED,
    REQUEST_DRAFT,
    REQUEST_EXECUTED,
    REQUEST_PENDING_SUPERVISOR,
    REQUEST_REJECTED,
    REQUEST_SENT_FOR_REVISION,
    ROLE_ADMIN,
    ROLE_AHS_HEAD,
    ROLE_AHS_WORKER,
    ROLE_DEPT_HEAD,
)
from apps.users.access import APPROVER_ROLE_ACCESS, has_access

from .models import AssetRequest, RequestApproval


class RequestWorkflowService:
    """Сервис управления жизненным циклом заявки."""

    PENDING_STATUSES = (
        REQUEST_PENDING_SUPERVISOR,
        REQUEST_APPROVED_SUPERVISOR,
        REQUEST_APPROVED_MOL,
        REQUEST_APPROVED_AHS_HEAD,
    )
    EDITABLE_STATUSES = (REQUEST_DRAFT, REQUEST_SENT_FOR_REVISION)
    RESET_ACTIONS = (APPROVAL_SENT_TO_REVISION, APPROVAL_WITHDRAWN)
    ISSUE_ROLES = (ROLE_AHS_WORKER, ROLE_AHS_HEAD)

    @staticmethod
    @transaction.atomic
    def submit(request_obj: AssetRequest, user=None):
        if request_obj.status not in RequestWorkflowService.EDITABLE_STATUSES:
            raise ValueError(_('Отправить на согласование можно только черновик или заявку на корректировке'))

        if user and request_obj.initiator_id != user.id:
            raise ValueError(_('Отправить заявку может только инициатор'))

        if not request_obj.items.exists():
            raise ValueError(_('Заявка не содержит позиций'))

        if request_obj.items.filter(requested_group__isnull=True, asset__isnull=True).exists():
            raise ValueError(_('Каждая позиция заявки должна быть привязана к группе справочника'))

        step = RequestWorkflowService.get_current_step(request_obj)
        if step and step[1] and not RequestWorkflowService.get_supervisor_approver(request_obj):
            raise ValueError(_('Для инициатора не задан руководитель подразделения или непосредственный руководитель'))

        request_obj.status = RequestWorkflowService.status_for_completed_steps(request_obj)
        request_obj.save(update_fields=['status', 'updated_at'])

        RequestApproval.objects.create(
            request=request_obj,
            approver=user or request_obj.initiator,
            role_at_approval=(user or request_obj.initiator).role,
            action=APPROVAL_SUBMITTED,
            signed_at=timezone.now(),
        )
        RequestWorkflowService.notify_current_approvers(request_obj)
        return request_obj

    @staticmethod
    def get_approval_roles(request_obj: AssetRequest):
        """Упорядоченный маршрут согласования: список (роль, только_руководитель).

        Заявка сначала согласуется руководителем подразделения создателя,
        затем руководителем АХС, который назначает ответственного за выдачу.
        """
        return [
            (ROLE_DEPT_HEAD, True),
            (ROLE_AHS_HEAD, False),
        ]

    @staticmethod
    def current_cycle_started_at(request_obj: AssetRequest):
        """Return timestamp of the latest event that restarts approval progress."""
        event = request_obj.approvals.filter(
            action__in=RequestWorkflowService.RESET_ACTIONS,
        ).order_by('-created_at').first()
        return event.created_at if event else None

    @staticmethod
    def completed_step_count(request_obj: AssetRequest) -> int:
        """Количество уже пройденных (подписанных) этапов согласования."""
        qs = request_obj.approvals.filter(
            action=APPROVAL_APPROVED, signed_at__isnull=False,
        )
        cycle_started_at = RequestWorkflowService.current_cycle_started_at(request_obj)
        if cycle_started_at:
            qs = qs.filter(created_at__gt=cycle_started_at)
        return qs.count()

    @staticmethod
    def get_supervisor_approver(request_obj: AssetRequest):
        """Return direct approver from user.supervisor or department.head."""
        initiator = request_obj.initiator
        if getattr(initiator, 'supervisor_id', None):
            return initiator.supervisor
        department = getattr(initiator, 'department', None)
        if department and getattr(department, 'head_id', None):
            return department.head
        return None

    @staticmethod
    def status_for_completed_steps(request_obj: AssetRequest):
        roles = RequestWorkflowService.get_approval_roles(request_obj)
        completed = RequestWorkflowService.completed_step_count(request_obj)
        if completed >= len(roles):
            return REQUEST_APPROVED
        if completed == 0:
            return REQUEST_PENDING_SUPERVISOR
        return REQUEST_APPROVED_SUPERVISOR

    @staticmethod
    def get_current_step(request_obj: AssetRequest):
        """Текущий этап (роль, только_руководитель) или None, если согласование завершено."""
        roles = RequestWorkflowService.get_approval_roles(request_obj)
        idx = RequestWorkflowService.completed_step_count(request_obj)
        if idx >= len(roles):
            return None
        return roles[idx]

    @staticmethod
    def get_required_approver_role(request_obj: AssetRequest):
        """Роль, которая должна согласовать заявку на текущем этапе (None — не этап согласования)."""
        if request_obj.status not in RequestWorkflowService.PENDING_STATUSES:
            return None
        step = RequestWorkflowService.get_current_step(request_obj)
        return step[0] if step else None

    @staticmethod
    def check_can_approve(request_obj: AssetRequest, approver):
        """Проверяет право пользователя согласовать заявку на текущем этапе. Бросает ValueError, если нет прав."""
        if request_obj.status not in RequestWorkflowService.PENDING_STATUSES:
            raise ValueError(_('Заявка не находится на этапе согласования'))

        step = RequestWorkflowService.get_current_step(request_obj)
        if step is None:
            raise ValueError(_('Заявка не находится на этапе согласования'))

        required_role, requires_supervisor = step

        access_code = APPROVER_ROLE_ACCESS.get(required_role)

        if has_access(approver, 'system.admin'):
            return

        if approver.role != required_role and not (access_code and has_access(approver, access_code)):
            raise ValueError(_('У вас нет прав для согласования заявки на этом этапе'))

        if requires_supervisor:
            supervisor = RequestWorkflowService.get_supervisor_approver(request_obj)
            if not supervisor or supervisor.id != approver.id:
                raise ValueError(_('Согласовать заявку может только непосредственный руководитель инициатора'))

    @staticmethod
    def can_approve(request_obj: AssetRequest, user) -> bool:
        """Безопасная (не бросающая исключение) проверка права согласования — для сериализаторов/фильтров."""
        try:
            RequestWorkflowService.check_can_approve(request_obj, user)
            return True
        except ValueError:
            return False

    @staticmethod
    def get_current_approvers(request_obj: AssetRequest):
        """Users who should act on the current approval step."""
        step = RequestWorkflowService.get_current_step(request_obj)
        if not step:
            return []

        required_role, requires_supervisor = step
        if requires_supervisor:
            supervisor = RequestWorkflowService.get_supervisor_approver(request_obj)
            return [supervisor] if supervisor and supervisor.is_active else []

        from apps.users.models import User

        access_code = APPROVER_ROLE_ACCESS.get(required_role)
        users = list(User.objects.filter(is_active=True))
        return [
            user for user in users
            if user.role == required_role or (access_code and has_access(user, access_code))
        ]

    @staticmethod
    def notify_current_approvers(request_obj: AssetRequest):
        """Create approval task notifications for the users on the current step."""
        from apps.notifications.services import NotificationService

        recipients = {
            user.id: user
            for user in RequestWorkflowService.get_current_approvers(request_obj)
            if user and user.id != request_obj.initiator_id
        }
        for recipient in recipients.values():
            NotificationService.send(
                recipient=recipient,
                notification_type=NOTIFICATION_REQUEST_TO_APPROVE,
                title=_('Заявка №%(number)s ожидает согласования') % {'number': request_obj.number},
                body=_('%(initiator)s отправил(а) заявку на согласование.') % {
                    'initiator': request_obj.initiator.get_full_name() or request_obj.initiator.username,
                },
                related_object=request_obj,
            )

    @staticmethod
    def notify_initiator(request_obj: AssetRequest, title, body):
        from apps.notifications.services import NotificationService

        NotificationService.send(
            recipient=request_obj.initiator,
            notification_type=NOTIFICATION_REQUEST_STATUS,
            title=title,
            body=body,
            related_object=request_obj,
        )

    @staticmethod
    def assign_issue_responsibles(request_obj: AssetRequest, user_ids=None):
        """Assign active AHS users responsible for actual issue."""
        from apps.users.models import User

        if not user_ids:
            raise ValueError(_('Выберите ответственного за выдачу'))

        qs = User.objects.filter(is_active=True, id__in=user_ids)

        responsibles = [
            candidate for candidate in qs
            if candidate.role in RequestWorkflowService.ISSUE_ROLES or has_access(candidate, 'requests.issue')
        ]
        if not responsibles:
            raise ValueError(_('Выбранные ответственные за выдачу не найдены среди активных сотрудников АХС'))

        request_obj.issue_responsibles.set(responsibles)
        return responsibles

    @staticmethod
    def notify_issue_responsibles(request_obj: AssetRequest, responsibles):
        from apps.notifications.services import NotificationService

        for responsible in {user.id: user for user in responsibles}.values():
            NotificationService.send(
                recipient=responsible,
                notification_type=NOTIFICATION_REQUEST_TO_ISSUE,
                title=_('Заявка №%(number)s готова к выдаче') % {'number': request_obj.number},
                body=_('Заявка согласована. Необходимо выполнить выдачу товаров сотруднику %(recipient)s.') % {
                    'recipient': (request_obj.to_user or request_obj.initiator).get_full_name()
                    or (request_obj.to_user or request_obj.initiator).username,
                },
                related_object=request_obj,
            )

    @staticmethod
    def can_edit(request_obj: AssetRequest, user) -> bool:
        return request_obj.initiator_id == user.id and request_obj.status in RequestWorkflowService.EDITABLE_STATUSES

    @staticmethod
    def check_can_issue(request_obj: AssetRequest, user):
        if request_obj.status != REQUEST_APPROVED:
            raise ValueError(_('Выдача доступна только для согласованной заявки'))

        if has_access(user, 'system.admin'):
            return

        if user.role not in RequestWorkflowService.ISSUE_ROLES and not has_access(user, 'requests.issue'):
            raise ValueError(_('У вас нет прав на выдачу активов по заявке'))

        if request_obj.issue_responsibles.exists() and not request_obj.issue_responsibles.filter(id=user.id).exists():
            raise ValueError(_('Вы не назначены ответственным за выдачу по этой заявке'))

    @staticmethod
    def can_issue(request_obj: AssetRequest, user) -> bool:
        try:
            RequestWorkflowService.check_can_issue(request_obj, user)
            return True
        except ValueError:
            return False

    @staticmethod
    @transaction.atomic
    def approve(request_obj: AssetRequest, approver, issue_responsible_ids=None):
        RequestWorkflowService.check_can_approve(request_obj, approver)

        RequestApproval.objects.create(
            request=request_obj,
            approver=approver,
            role_at_approval=approver.role,
            action=APPROVAL_APPROVED,
            signed_at=timezone.now(),
        )

        request_obj.status = RequestWorkflowService.status_for_completed_steps(request_obj)
        request_obj.save(update_fields=['status', 'updated_at'])

        if request_obj.status == REQUEST_APPROVED:
            responsibles = RequestWorkflowService.assign_issue_responsibles(
                request_obj,
                issue_responsible_ids,
            )
            RequestWorkflowService.notify_issue_responsibles(request_obj, responsibles)
            RequestWorkflowService.notify_initiator(
                request_obj,
                _('Заявка №%(number)s согласована') % {'number': request_obj.number},
                _('Заявка согласована и передана ответственным АХС на выдачу.'),
            )
        else:
            RequestWorkflowService.notify_current_approvers(request_obj)

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

        RequestWorkflowService.check_can_approve(request_obj, approver)

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
        RequestWorkflowService.notify_initiator(
            request_obj,
            _('Заявка №%(number)s отклонена') % {'number': request_obj.number},
            comment or _('Заявка отклонена согласующим.'),
        )
        return request_obj

    @staticmethod
    @transaction.atomic
    def send_to_revision(request_obj: AssetRequest, approver, comment: str = ''):
        if request_obj.status in (
            REQUEST_DRAFT,
            REQUEST_SENT_FOR_REVISION,
            REQUEST_EXECUTED,
            REQUEST_REJECTED,
            REQUEST_CANCELLED,
        ):
            raise ValueError(_('Невозможно отправить заявку на корректировку в текущем статусе'))

        if not comment:
            raise ValueError(_('Укажите комментарий для корректировки'))

        RequestWorkflowService.check_can_approve(request_obj, approver)

        RequestApproval.objects.create(
            request=request_obj,
            approver=approver,
            role_at_approval=approver.role,
            action=APPROVAL_SENT_TO_REVISION,
            signed_at=timezone.now(),
            comment=comment,
        )

        request_obj.status = REQUEST_SENT_FOR_REVISION
        request_obj.save(update_fields=['status', 'updated_at'])
        request_obj.issue_responsibles.clear()

        RequestWorkflowService.notify_initiator(
            request_obj,
            _('Заявка №%(number)s отправлена на корректировку') % {'number': request_obj.number},
            comment,
        )
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
    def withdraw(request_obj: AssetRequest, user):
        if request_obj.initiator_id != user.id:
            raise ValueError(_('Отозвать заявку может только инициатор'))

        if request_obj.status not in RequestWorkflowService.PENDING_STATUSES:
            raise ValueError(_('Отозвать можно только заявку, отправленную на согласование'))

        if RequestWorkflowService.completed_step_count(request_obj) > 0:
            raise ValueError(_('Заявку уже начали согласовывать, отзыв недоступен'))

        RequestApproval.objects.create(
            request=request_obj,
            approver=user,
            role_at_approval=user.role,
            action=APPROVAL_WITHDRAWN,
            signed_at=timezone.now(),
        )

        request_obj.status = REQUEST_DRAFT
        request_obj.save(update_fields=['status', 'updated_at'])
        return request_obj

    @staticmethod
    @transaction.atomic
    def issue_items(request_obj: AssetRequest, user, items_data):
        RequestWorkflowService.check_can_issue(request_obj, user)

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
        RequestWorkflowService.notify_initiator(
            request_obj,
            _('Заявка №%(number)s выдана') % {'number': request_obj.number},
            _('Товары по заявке выданы ответственным сотрудником АХС.'),
        )
        return request_obj

    @staticmethod
    @transaction.atomic
    def confirm_receipt(request_obj: AssetRequest, user):
        if request_obj.status != REQUEST_EXECUTED:
            raise ValueError(_('Подтверждение возможно только после фактической выдачи по заявке'))

        if request_obj.initiator != user:
            raise ValueError(_('Подтвердить получение может только инициатор'))

        return request_obj
