"""Views заявок ИС «АСУ»."""

from django.db.models import Q
from django.utils.translation import gettext_lazy as _
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.common.constants import (
    REQUEST_DRAFT,
    ROLE_ADMIN,
    ROLE_AHS_HEAD,
    ROLE_AHS_WORKER,
)
from apps.users.models import User
from apps.users.access import has_access
from apps.users.serializers import UserSerializer

from .filters import RequestFilter
from .models import AssetRequest
from .serializers import (
    AssetRequestCreateSerializer,
    AssetRequestDetailSerializer,
    AssetRequestListSerializer,
)
from .services import RequestWorkflowService


class AssetRequestViewSet(viewsets.ModelViewSet):
    """ViewSet заявок с полным workflow."""

    permission_classes = [IsAuthenticated]
    filterset_class = RequestFilter
    search_fields = ['number', 'reason']
    ordering_fields = ['created_at', 'updated_at', 'number']

    def get_queryset(self):
        user = self.request.user
        qs = AssetRequest.objects.select_related(
            'request_type', 'initiator', 'initiator__department',
            'initiator__department__head', 'initiator__supervisor',
            'from_user', 'to_user',
        ).prefetch_related(
            'items',
            'items__asset',
            'items__requested_group',
            'items__issued_asset',
            'issue_responsibles',
            'approvals',
            'approvals__approver',
        )

        # Администратор и АХС видят весь журнал заявок.
        if user.role in (ROLE_ADMIN, ROLE_AHS_WORKER, ROLE_AHS_HEAD) or has_access(user, 'requests.view_all'):
            return qs

        visibility_q = Q(initiator=user)
        if user.department_id:
            visibility_q |= Q(initiator__department_id=user.department_id)

        # Руководитель подразделения может быть задан явно в Department.head
        # или как непосредственный руководитель сотрудника.
        visibility_q |= Q(initiator__department__head=user)
        visibility_q |= Q(initiator__supervisor=user)

        return qs.filter(visibility_q).distinct()

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        if self.request.query_params.get('pending_my_approval') == 'true':
            user = self.request.user
            ids = [obj.id for obj in queryset if RequestWorkflowService.can_approve(obj, user)]
            queryset = queryset.filter(id__in=ids)
        if self.request.query_params.get('pending_my_issue') == 'true':
            user = self.request.user
            ids = [obj.id for obj in queryset if RequestWorkflowService.can_issue(obj, user)]
            queryset = queryset.filter(id__in=ids)
        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return AssetRequestListSerializer
        if self.action in ('create', 'update', 'partial_update'):
            return AssetRequestCreateSerializer
        return AssetRequestDetailSerializer

    def perform_create(self, serializer):
        serializer.save(initiator=self.request.user)

    def perform_update(self, serializer):
        instance = self.get_object()
        if not RequestWorkflowService.can_edit(instance, self.request.user):
            raise ValidationError({'detail': _('Редактирование возможно только для черновиков и заявок на корректировке')})
        serializer.save()

    def perform_destroy(self, instance):
        if instance.initiator_id != self.request.user.id:
            raise ValidationError({'detail': _('Удалить заявку может только инициатор')})
        if instance.status != REQUEST_DRAFT:
            raise ValidationError({'detail': _('Удалить можно только черновик')})
        instance.delete()

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        request_obj = self.get_object()
        try:
            RequestWorkflowService.submit(request_obj, request.user)
            return Response({'detail': _('Заявка отправлена на согласование')})
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        request_obj = self.get_object()

        try:
            issue_responsibles = request.data.get('issue_responsibles')
            if issue_responsibles is None:
                issue_responsibles = request.data.get('issue_responsible_ids')
            RequestWorkflowService.approve(request_obj, request.user, issue_responsibles)
            return Response({'detail': _('Заявка согласована')})
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        request_obj = self.get_object()
        comment = request.data.get('comment', '')

        try:
            RequestWorkflowService.reject(request_obj, request.user, comment)
            return Response({'detail': _('Заявка отклонена')})
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='send-to-revision')
    def send_to_revision(self, request, pk=None):
        request_obj = self.get_object()
        comment = request.data.get('comment', '')

        try:
            RequestWorkflowService.send_to_revision(request_obj, request.user, comment)
            return Response({'detail': _('Заявка отправлена на корректировку')})
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def withdraw(self, request, pk=None):
        request_obj = self.get_object()

        try:
            RequestWorkflowService.withdraw(request_obj, request.user)
            return Response({'detail': _('Отправка на согласование отменена')})
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        request_obj = self.get_object()

        try:
            RequestWorkflowService.cancel(request_obj, request.user)
            return Response({'detail': _('Заявка отменена')})
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='issue-items')
    def issue_items(self, request, pk=None):
        request_obj = self.get_object()

        try:
            RequestWorkflowService.issue_items(
                request_obj,
                request.user,
                request.data.get('items', []),
            )
            return Response({'detail': _('Выдача по заявке успешно выполнена')})
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='confirm-receipt')
    def confirm_receipt(self, request, pk=None):
        request_obj = self.get_object()

        try:
            RequestWorkflowService.confirm_receipt(request_obj, request.user)
            return Response({'detail': _('Получение уже подтверждено фактом выдачи')})
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='issue-responsible-candidates')
    def issue_responsible_candidates(self, request):
        if not (has_access(request.user, 'requests.approve_ahs') or has_access(request.user, 'system.admin')):
            return Response(
                {'detail': _('Список ответственных за выдачу доступен только руководителю АХС')},
                status=status.HTTP_403_FORBIDDEN,
            )

        users = [
            candidate for candidate in User.objects.select_related('department', 'supervisor').filter(is_active=True).order_by('last_name', 'first_name')
            if candidate.role in (ROLE_AHS_WORKER, ROLE_AHS_HEAD) or has_access(candidate, 'requests.issue')
        ]
        return Response(UserSerializer(users, many=True).data)
