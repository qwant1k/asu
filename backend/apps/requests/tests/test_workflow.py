"""Unit-тесты для RequestWorkflowService."""
import pytest
from django.test import TestCase
from django.utils import timezone
from decimal import Decimal

from apps.common.constants import (
    REQUEST_DRAFT,
    REQUEST_PENDING_SUPERVISOR,
    REQUEST_APPROVED_SUPERVISOR,
    REQUEST_APPROVED,
    REQUEST_REJECTED,
    REQUEST_SENT_FOR_REVISION,
    REQUEST_EXECUTED,
    REQUEST_PARTIALLY_ISSUED,
    APPROVAL_APPROVED,
    APPROVAL_REJECTED,
    APPROVAL_SUBMITTED,
    APPROVAL_WITHDRAWN,
    ROLE_USER,
    ROLE_DEPT_HEAD,
    ROLE_AHS_HEAD,
    ROLE_AHS_WORKER,
)
from apps.requests.services import RequestWorkflowService
from apps.requests.models import AssetRequest, AssetRequestItem, RequestApproval


@pytest.mark.django_db
class TestRequestWorkflowSubmit(TestCase):
    """Тесты отправки заявки на согласование."""

    def setUp(self):
        from apps.users.models import User, Department
        from apps.references.models import RequestType

        self.dept = Department.objects.create(name='Тестовый отдел')
        self.initiator = User.objects.create_user(
            username='initiator',
            password='test123',
            role=ROLE_USER,
            department=self.dept,
        )
        self.dept_head = User.objects.create_user(
            username='dept_head',
            password='test123',
            role=ROLE_DEPT_HEAD,
            department=self.dept,
        )
        self.dept.head = self.dept_head
        self.dept.save()

        self.ahs_head = User.objects.create_user(
            username='ahs_head',
            password='test123',
            role=ROLE_AHS_HEAD,
        )

        self.request_type = RequestType.objects.create(name='Тест')

        self.request = AssetRequest.objects.create(
            initiator=self.initiator,
            request_type=self.request_type,
            status=REQUEST_DRAFT,
        )

    def test_submit_draft_to_pending(self):
        """Отправка черновика переводит в статус ожидания согласования."""
        from apps.references.models import AssetCategory

        group = AssetCategory.objects.create(
            name='Тестовая группа',
            code='TEST-SUBMIT',
            asset_type='TMZ',
        )
        AssetRequestItem.objects.create(
            request=self.request,
            requested_group=group,
            quantity_requested=Decimal('1'),
        )
        RequestWorkflowService.submit(self.request, self.initiator)
        self.assertEqual(self.request.status, REQUEST_PENDING_SUPERVISOR)

    def test_submit_non_draft_raises(self):
        """Отправка не-черновика вызывает ошибку."""
        self.request.status = REQUEST_PENDING_SUPERVISOR
        self.request.save()
        with self.assertRaises(ValueError):
            RequestWorkflowService.submit(self.request, self.initiator)

    def test_submit_by_non_initiator_raises(self):
        """Отправка чужим пользователем вызывает ошибку."""
        with self.assertRaises(ValueError):
            RequestWorkflowService.submit(self.request, self.dept_head)

    def test_submit_empty_request_raises(self):
        """Отправка заявки без позиций вызывает ошибку."""
        with self.assertRaises(ValueError):
            RequestWorkflowService.submit(self.request, self.initiator)


@pytest.mark.django_db
class TestRequestWorkflowApprove(TestCase):
    """Тесты согласования заявки."""

    def setUp(self):
        from apps.users.models import User, Department
        from apps.references.models import RequestType

        self.dept = Department.objects.create(name='Тестовый отдел')
        self.initiator = User.objects.create_user(
            username='initiator2',
            password='test123',
            role=ROLE_USER,
            department=self.dept,
        )
        self.dept_head = User.objects.create_user(
            username='dept_head2',
            password='test123',
            role=ROLE_DEPT_HEAD,
            department=self.dept,
        )
        self.dept.head = self.dept_head
        self.dept.save()

        self.ahs_head = User.objects.create_user(
            username='ahs_head2',
            password='test123',
            role=ROLE_AHS_HEAD,
        )

        self.request_type = RequestType.objects.create(name='Тест2')
        self.request = AssetRequest.objects.create(
            initiator=self.initiator,
            request_type=self.request_type,
            status=REQUEST_PENDING_SUPERVISOR,
        )

    def test_approve_by_dept_head(self):
        """Согласование руководителем переводит к следующему этапу."""
        RequestWorkflowService.approve(self.request, self.dept_head)
        self.assertEqual(self.request.status, REQUEST_APPROVED_SUPERVISOR)

    def test_approve_by_ahs_head_final(self):
        """Финальное согласование АХС переводит в APPROVED."""
        self.request.status = REQUEST_APPROVED_SUPERVISOR
        self.request.save()
        RequestApproval.objects.create(
            request=self.request,
            approver=self.dept_head,
            role_at_approval=ROLE_DEPT_HEAD,
            action=APPROVAL_APPROVED,
            signed_at=timezone.now(),
        )
        RequestWorkflowService.approve(self.request, self.ahs_head, issue_responsible_ids=[self.ahs_head.id])
        self.assertEqual(self.request.status, REQUEST_APPROVED)

    def test_approve_by_wrong_role_raises(self):
        """Согласование неуполномоченным пользователем вызывает ошибку."""
        from apps.users.models import User
        random_user = User.objects.create_user(
            username='random',
            password='test123',
            role=ROLE_USER,
        )
        with self.assertRaises(ValueError):
            RequestWorkflowService.approve(self.request, random_user)


@pytest.mark.django_db
class TestRequestWorkflowReject(TestCase):
    """Тесты отклонения заявки."""

    def setUp(self):
        from apps.users.models import User, Department
        from apps.references.models import RequestType

        self.dept = Department.objects.create(name='Тест3')
        self.initiator = User.objects.create_user(
            username='init3', password='test123', role=ROLE_USER, department=self.dept,
        )
        self.dept_head = User.objects.create_user(
            username='dh3', password='test123', role=ROLE_DEPT_HEAD, department=self.dept,
        )
        self.dept.head = self.dept_head
        self.dept.save()

        self.request_type = RequestType.objects.create(name='Тест3')
        self.request = AssetRequest.objects.create(
            initiator=self.initiator,
            request_type=self.request_type,
            status=REQUEST_PENDING_SUPERVISOR,
        )

    def test_reject_sets_status(self):
        """Отклонение переводит в REJECTED."""
        RequestWorkflowService.reject(self.request, self.dept_head, comment='Нет')
        self.assertEqual(self.request.status, REQUEST_REJECTED)

    def test_reject_draft_raises(self):
        """Отклонение черновика вызывает ошибку."""
        self.request.status = REQUEST_DRAFT
        self.request.save()
        with self.assertRaises(ValueError):
            RequestWorkflowService.reject(self.request, self.dept_head)


@pytest.mark.django_db
class TestRequestWorkflowWithdraw(TestCase):
    """Тесты отзыва заявки."""

    def setUp(self):
        from apps.users.models import User, Department
        from apps.references.models import RequestType

        self.dept = Department.objects.create(name='Тест4')
        self.initiator = User.objects.create_user(
            username='init4', password='test123', role=ROLE_USER, department=self.dept,
        )
        self.dept_head = User.objects.create_user(
            username='dh4', password='test123', role=ROLE_DEPT_HEAD, department=self.dept,
        )
        self.dept.head = self.dept_head
        self.dept.save()

        self.request_type = RequestType.objects.create(name='Тест4')
        self.request = AssetRequest.objects.create(
            initiator=self.initiator,
            request_type=self.request_type,
            status=REQUEST_PENDING_SUPERVISOR,
        )

    def test_withdraw_pending_returns_to_draft(self):
        """Отзыв заявки на согласовании возвращает в черновик."""
        RequestWorkflowService.withdraw(self.request, self.initiator)
        self.assertEqual(self.request.status, REQUEST_DRAFT)

    def test_withdraw_after_approval_allowed(self):
        """Отзыв после первого согласования разрешён и уведомляет."""
        RequestApproval.objects.create(
            request=self.request,
            approver=self.dept_head,
            role_at_approval=ROLE_DEPT_HEAD,
            action=APPROVAL_APPROVED,
            signed_at=timezone.now(),
        )
        self.request.status = REQUEST_APPROVED_SUPERVISOR
        self.request.save()
        RequestWorkflowService.withdraw(self.request, self.initiator)
        self.assertEqual(self.request.status, REQUEST_DRAFT)

    def test_withdraw_by_non_initiator_raises(self):
        """Отзыв чужим пользователем вызывает ошибку."""
        with self.assertRaises(ValueError):
            RequestWorkflowService.withdraw(self.request, self.dept_head)


@pytest.mark.django_db
class TestRequestWorkflowConfirmReceipt(TestCase):
    """Тесты подтверждения получения."""

    def setUp(self):
        from apps.users.models import User
        from apps.references.models import RequestType

        self.initiator = User.objects.create_user(
            username='init5', password='test123', role=ROLE_USER,
        )
        self.request_type = RequestType.objects.create(name='Тест5')
        self.request = AssetRequest.objects.create(
            initiator=self.initiator,
            request_type=self.request_type,
            status=REQUEST_EXECUTED,
        )

    def test_confirm_receipt_sets_timestamp(self):
        """Подтверждение сохраняет timestamp."""
        RequestWorkflowService.confirm_receipt(self.request, self.initiator)
        self.assertIsNotNone(self.request.receipt_confirmed_at)

    def test_confirm_receipt_double_raises(self):
        """Повторное подтверждение вызывает ошибку."""
        RequestWorkflowService.confirm_receipt(self.request, self.initiator)
        with self.assertRaises(ValueError):
            RequestWorkflowService.confirm_receipt(self.request, self.initiator)

    def test_confirm_receipt_wrong_status_raises(self):
        """Подтверждение не-выданной заявки вызывает ошибку."""
        self.request.status = REQUEST_PENDING_SUPERVISOR
        self.request.save()
        with self.assertRaises(ValueError):
            RequestWorkflowService.confirm_receipt(self.request, self.initiator)
