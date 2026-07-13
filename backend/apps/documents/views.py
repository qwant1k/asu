"""Views документооборота ИС «АСУ»."""

from rest_framework import viewsets, status, mixins
from rest_framework.decorators import action
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from django.utils.translation import gettext_lazy as _
from apps.users.access import has_access

from .models import (
    IncomingInvoice, WriteOffAct, Petition,
    CommissionProtocol, InternalTransferInvoice,
)
from .serializers import (
    IncomingInvoiceListSerializer, IncomingInvoiceDetailSerializer,
    IncomingInvoiceCreateSerializer,
    WriteOffActListSerializer, WriteOffActDetailSerializer,
    WriteOffActCreateSerializer,
    PetitionListSerializer, PetitionDetailSerializer,
    ProtocolListSerializer, ProtocolDetailSerializer,
    InternalTransferListSerializer, InternalTransferDetailSerializer,
)
from .services import DocumentWorkflowService


class CanManageDocuments(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and has_access(request.user, 'documents.manage'))


class DocumentSignMixin:
    """Миксин для действий подписания документов."""

    @action(detail=True, methods=['post'])
    def sign(self, request, pk=None):
        """Подписать документ текущим пользователем."""
        document = self.get_object()
        role_label = request.data.get('role_label', '')
        is_acting = request.data.get('is_acting_chairman', False)
        try:
            DocumentWorkflowService.sign(document, request.user, role_label, is_acting)
            return Response({'detail': _('Документ подписан')})
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='send-for-revision')
    def send_for_revision(self, request, pk=None):
        """Отправить документ на доработку."""
        document = self.get_object()
        reason = request.data.get('reason', '')
        try:
            DocumentWorkflowService.send_for_revision(document, request.user, reason)
            return Response({'detail': _('Документ отправлен на доработку')})
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class DocumentDateFilterMixin:
    """Common date range filtering for document lists."""

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        date_after = self.request.query_params.get('date_after')
        date_before = self.request.query_params.get('date_before')
        if date_after:
            queryset = queryset.filter(date__gte=date_after)
        if date_before:
            queryset = queryset.filter(date__lte=date_before)
        return queryset


class IncomingInvoiceViewSet(DocumentDateFilterMixin, DocumentSignMixin, viewsets.ModelViewSet):
    """CRUD + подписание приходных накладных."""
    queryset = IncomingInvoice.objects.select_related(
        'counterparty', 'mol_warehouse', 'created_by',
    ).prefetch_related('items', 'items__asset').all()
    permission_classes = [CanManageDocuments]
    filterset_fields = ['status', 'asset_type']
    search_fields = ['number', 'counterparty__name']
    ordering_fields = ['created_at', 'date']

    def get_serializer_class(self):
        if self.action == 'list':
            return IncomingInvoiceListSerializer
        if self.action in ('create', 'update', 'partial_update'):
            return IncomingInvoiceCreateSerializer
        return IncomingInvoiceDetailSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class WriteOffActViewSet(DocumentDateFilterMixin, DocumentSignMixin, viewsets.ModelViewSet):
    """CRUD + подписание актов списания."""
    queryset = WriteOffAct.objects.prefetch_related(
        'items', 'items__asset', 'commission_members',
    ).all()
    permission_classes = [CanManageDocuments]
    filterset_fields = ['status', 'act_type', 'is_representative']
    search_fields = ['number', 'commission_order_number']
    ordering_fields = ['created_at', 'date', 'total_amount']

    def get_serializer_class(self):
        if self.action == 'list':
            return WriteOffActListSerializer
        if self.action in ('create', 'update', 'partial_update'):
            return WriteOffActCreateSerializer
        return WriteOffActDetailSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class PetitionViewSet(DocumentDateFilterMixin, DocumentSignMixin, viewsets.ModelViewSet):
    """CRUD + подписание ходатайств."""
    queryset = Petition.objects.prefetch_related(
        'items', 'items__asset', 'commission_members_set',
    ).all()
    permission_classes = [CanManageDocuments]
    filterset_fields = ['status']
    search_fields = ['number', 'legal_basis']
    ordering_fields = ['created_at', 'date']

    def get_serializer_class(self):
        if self.action == 'list':
            return PetitionListSerializer
        return PetitionDetailSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class CommissionProtocolViewSet(DocumentDateFilterMixin, DocumentSignMixin, viewsets.ModelViewSet):
    """CRUD + подписание протоколов заседаний."""
    queryset = CommissionProtocol.objects.select_related(
        'petition',
    ).prefetch_related(
        'attachment_items', 'attachment_items__asset', 'commission_members_set',
    ).all()
    permission_classes = [CanManageDocuments]
    filterset_fields = ['status']
    search_fields = ['number', 'agenda_item', 'decision_text']
    ordering_fields = ['created_at', 'date']

    def get_serializer_class(self):
        if self.action == 'list':
            return ProtocolListSerializer
        return ProtocolDetailSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class InternalTransferInvoiceViewSet(DocumentDateFilterMixin, DocumentSignMixin, viewsets.ModelViewSet):
    """CRUD + подписание накладных на внутреннее перемещение."""
    queryset = InternalTransferInvoice.objects.select_related(
        'from_user', 'to_user',
    ).prefetch_related('items', 'items__asset').all()
    permission_classes = [CanManageDocuments]
    filterset_fields = ['status', 'asset_type']
    search_fields = ['number', 'from_user__last_name', 'to_user__last_name']
    ordering_fields = ['created_at', 'date']

    def get_serializer_class(self):
        if self.action == 'list':
            return InternalTransferListSerializer
        return InternalTransferDetailSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
