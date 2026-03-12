"""Views заявок ИС «АСУ»."""

from django.utils.translation import gettext_lazy as _
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.common.constants import REQUEST_DRAFT, ROLE_ADMIN, ROLE_AHS_HEAD, ROLE_AHS_WORKER

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
    filterset_fields = ['status', 'request_type', 'initiator']
    search_fields = ['number', 'reason']
    ordering_fields = ['created_at', 'updated_at', 'number']

    def get_queryset(self):
        user = self.request.user
        qs = AssetRequest.objects.select_related(
            'request_type', 'initiator', 'from_user', 'to_user',
        ).prefetch_related(
            'items',
            'items__asset',
            'items__requested_group',
            'items__issued_asset',
            'approvals',
            'approvals__approver',
        )

        if user.role in (ROLE_ADMIN, ROLE_AHS_WORKER, ROLE_AHS_HEAD):
            return qs

        return qs.filter(initiator=user)

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
        if instance.status != REQUEST_DRAFT:
            return Response(
                {'detail': _('Редактирование возможно только для черновиков')},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer.save()

    def perform_destroy(self, instance):
        if instance.status != REQUEST_DRAFT:
            return Response(
                {'detail': _('Удалить можно только черновик')},
                status=status.HTTP_400_BAD_REQUEST,
            )
        instance.delete()

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        request_obj = self.get_object()
        try:
            RequestWorkflowService.submit(request_obj)
            return Response({'detail': _('Заявка отправлена на согласование')})
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='generate-otp')
    def generate_otp(self, request, pk=None):
        request_obj = self.get_object()
        try:
            otp_code = RequestWorkflowService.generate_otp_for_approval(
                request_obj, request.user,
            )
            return Response({
                'detail': _('OTP-код отправлен на вашу электронную почту'),
                'otp_debug': otp_code,
            })
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        request_obj = self.get_object()
        otp_code = request.data.get('otp_code', '')

        if not otp_code:
            return Response(
                {'detail': _('OTP-код обязателен')},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            RequestWorkflowService.approve(request_obj, request.user, otp_code)
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
