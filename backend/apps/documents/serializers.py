"""Сериализаторы документооборота ИС «АСУ»."""

from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers
from apps.common.constants import DOCUMENT_DRAFT, DOCUMENT_SENT_FOR_REVISION
from .services import DocumentWorkflowService
from .models import (
    IncomingInvoice, IncomingInvoiceItem,
    WriteOffAct, WriteOffActItem, CommissionMember,
    Petition, PetitionItem,
    CommissionProtocol, ProtocolItem,
    InternalTransferInvoice, InternalTransferItem,
    DocumentSignature,
)


def document_signatures(document):
    ct = ContentType.objects.get_for_model(document)
    return DocumentSignature.objects.filter(document_type=ct, document_id=document.pk)


class DocumentComputedFieldsMixin(serializers.Serializer):
    signatures = serializers.SerializerMethodField()
    pending_my_approval = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.get_short_name', read_only=True, default='')

    def get_signatures(self, obj):
        return DocumentSignatureSerializer(document_signatures(obj), many=True).data

    def get_pending_my_approval(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        return DocumentWorkflowService.pending_my_approval(obj, user)


def create_commission_members(document, members_data, relation_name):
    for member in members_data:
        user = member.get('user')
        if not user:
            continue
        CommissionMember.objects.create(
            user=user,
            role_label=member.get('role_label', ''),
            **{relation_name: document},
        )


class CommissionMemberWriteSerializer(serializers.Serializer):
    user = serializers.PrimaryKeyRelatedField(queryset=CommissionMember._meta.get_field('user').remote_field.model.objects.filter(is_active=True))
    role_label = serializers.CharField(required=False, allow_blank=True, default='')


# ========================================================================
# Подписи
# ========================================================================

class DocumentSignatureSerializer(serializers.ModelSerializer):
    """Сериализатор подписи документа."""
    signer_name = serializers.CharField(source='signer.get_full_name', read_only=True)
    signer_position = serializers.CharField(source='signer.position', read_only=True)

    class Meta:
        model = DocumentSignature
        fields = [
            'id', 'signer', 'signer_name', 'signer_position',
            'role_label', 'signed_at', 'is_acting_chairman',
            'sent_for_revision_at', 'revision_reason',
        ]


class CommissionMemberSerializer(serializers.ModelSerializer):
    """Сериализатор члена комиссии."""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_position = serializers.CharField(source='user.position', read_only=True)

    class Meta:
        model = CommissionMember
        fields = ['id', 'user', 'user_name', 'user_position', 'role_label']


# ========================================================================
# Приходная накладная
# ========================================================================

class IncomingInvoiceItemSerializer(serializers.ModelSerializer):
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    asset_code = serializers.CharField(source='asset.code', read_only=True)
    unit_of_measure = serializers.CharField(source='asset.unit_of_measure', read_only=True)

    class Meta:
        model = IncomingInvoiceItem
        fields = ['id', 'asset', 'asset_name', 'asset_code', 'unit_of_measure', 'quantity', 'unit_price', 'total']
        read_only_fields = ['total']


class IncomingInvoiceListSerializer(DocumentComputedFieldsMixin, serializers.ModelSerializer):
    counterparty_name = serializers.CharField(source='counterparty.name', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True, default='')
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    total_amount = serializers.SerializerMethodField()
    items_count = serializers.IntegerField(source='items.count', read_only=True)

    class Meta:
        model = IncomingInvoice
        fields = [
            'id', 'number', 'date', 'status', 'status_display',
            'asset_type', 'counterparty', 'counterparty_name',
            'warehouse', 'warehouse_name',
            'total_amount', 'items_count', 'pending_my_approval',
            'created_by_name', 'created_at',
        ]

    def get_total_amount(self, obj):
        return sum(item.total for item in obj.items.all())


class IncomingInvoiceDetailSerializer(DocumentComputedFieldsMixin, serializers.ModelSerializer):
    items = IncomingInvoiceItemSerializer(many=True, read_only=True)
    counterparty_name = serializers.CharField(source='counterparty.name', read_only=True)
    counterparty_bin = serializers.CharField(source='counterparty.bin', read_only=True, default='')
    counterparty_address = serializers.CharField(source='counterparty.address', read_only=True, default='')
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    mol_name = serializers.CharField(source='mol_warehouse.get_full_name', read_only=True, default='')
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True, default='')
    total_amount = serializers.SerializerMethodField()

    class Meta:
        model = IncomingInvoice
        fields = [
            'id', 'number', 'date', 'status', 'status_display',
            'asset_type', 'counterparty', 'counterparty_name',
            'counterparty_bin', 'counterparty_address',
            'mol_warehouse', 'mol_name', 'warehouse', 'warehouse_name',
            'items', 'total_amount', 'signatures', 'pending_my_approval',
            'created_by', 'created_by_name', 'created_at', 'updated_at',
        ]

    def get_total_amount(self, obj):
        return sum(item.total for item in obj.items.all())


class IncomingInvoiceCreateSerializer(serializers.ModelSerializer):
    items = IncomingInvoiceItemSerializer(many=True)

    class Meta:
        model = IncomingInvoice
        fields = ['id', 'asset_type', 'counterparty', 'mol_warehouse', 'warehouse', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        invoice = IncomingInvoice.objects.create(**validated_data)
        for item_data in items_data:
            IncomingInvoiceItem.objects.create(invoice=invoice, **item_data)
        return invoice

    def update(self, instance, validated_data):
        if instance.status not in (DOCUMENT_DRAFT, DOCUMENT_SENT_FOR_REVISION):
            raise serializers.ValidationError('Редактировать можно только черновик или документ на доработке')

        items_data = validated_data.pop('items', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                IncomingInvoiceItem.objects.create(invoice=instance, **item_data)

        return instance


# ========================================================================
# Акт на списание
# ========================================================================

class WriteOffActItemSerializer(serializers.ModelSerializer):
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    asset_code = serializers.CharField(source='asset.code', read_only=True)
    unit_of_measure = serializers.CharField(source='asset.unit_of_measure', read_only=True)

    class Meta:
        model = WriteOffActItem
        fields = ['id', 'asset', 'asset_name', 'asset_code', 'unit_of_measure', 'quantity', 'unit_price', 'total']
        read_only_fields = ['total']


class WriteOffActListSerializer(DocumentComputedFieldsMixin, serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    act_type_display = serializers.CharField(source='get_act_type_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_short_name', read_only=True, default='')
    items_count = serializers.IntegerField(source='items.count', read_only=True)

    class Meta:
        model = WriteOffAct
        fields = [
            'id', 'number', 'date', 'status', 'status_display',
            'act_type', 'act_type_display', 'total_amount',
            'is_representative', 'items_count', 'pending_my_approval',
            'created_by_name', 'created_at',
        ]


class WriteOffActDetailSerializer(DocumentComputedFieldsMixin, serializers.ModelSerializer):
    items = WriteOffActItemSerializer(many=True, read_only=True)
    commission_members = CommissionMemberSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    act_type_display = serializers.CharField(source='get_act_type_display', read_only=True)

    class Meta:
        model = WriteOffAct
        fields = [
            'id', 'number', 'date', 'status', 'status_display',
            'act_type', 'act_type_display',
            'commission_order_number', 'commission_order_date',
            'is_representative', 'total_amount',
            'items', 'commission_members',
            'signatures', 'pending_my_approval',
            'created_by', 'created_by_name', 'created_at', 'updated_at',
        ]


class WriteOffActCreateSerializer(serializers.ModelSerializer):
    items = WriteOffActItemSerializer(many=True)
    commission_members = CommissionMemberWriteSerializer(many=True, required=False, write_only=True)

    class Meta:
        model = WriteOffAct
        fields = [
            'id', 'act_type', 'commission_order_number',
            'commission_order_date', 'is_representative', 'items',
            'commission_members',
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        members_data = validated_data.pop('commission_members', [])
        act = WriteOffAct.objects.create(**validated_data)
        for item_data in items_data:
            WriteOffActItem.objects.create(act=act, **item_data)
        create_commission_members(act, members_data, 'write_off_act')
        act.recalculate_total()
        return act


# ========================================================================
# Ходатайство
# ========================================================================

class PetitionItemSerializer(serializers.ModelSerializer):
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    asset_code = serializers.CharField(source='asset.code', read_only=True)
    unit_of_measure = serializers.CharField(source='asset.unit_of_measure', read_only=True)

    class Meta:
        model = PetitionItem
        fields = ['id', 'asset', 'asset_name', 'asset_code', 'unit_of_measure', 'quantity', 'unit_price', 'total']
        read_only_fields = ['total']


class PetitionListSerializer(DocumentComputedFieldsMixin, serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_short_name', read_only=True, default='')
    total_amount = serializers.SerializerMethodField()
    items_count = serializers.IntegerField(source='items.count', read_only=True)

    class Meta:
        model = Petition
        fields = [
            'id', 'number', 'date', 'status', 'status_display',
            'total_amount', 'items_count', 'pending_my_approval',
            'created_by_name', 'created_at',
        ]

    def get_total_amount(self, obj):
        return sum(item.total for item in obj.items.all())


class PetitionDetailSerializer(DocumentComputedFieldsMixin, serializers.ModelSerializer):
    items = PetitionItemSerializer(many=True, read_only=True)
    commission_members = CommissionMemberSerializer(source='commission_members_set', many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    total_amount = serializers.SerializerMethodField()

    class Meta:
        model = Petition
        fields = [
            'id', 'number', 'date', 'status', 'status_display',
            'legal_basis', 'items', 'total_amount', 'commission_members',
            'signatures', 'pending_my_approval',
            'created_by', 'created_by_name', 'created_at', 'updated_at',
        ]

    def get_total_amount(self, obj):
        return sum(item.total for item in obj.items.all())


class PetitionCreateSerializer(serializers.ModelSerializer):
    items = PetitionItemSerializer(many=True)
    commission_members = CommissionMemberWriteSerializer(many=True, required=False, write_only=True)

    class Meta:
        model = Petition
        fields = ['id', 'legal_basis', 'items', 'commission_members']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        members_data = validated_data.pop('commission_members', [])
        petition = Petition.objects.create(**validated_data)
        for item_data in items_data:
            PetitionItem.objects.create(petition=petition, **item_data)
        create_commission_members(petition, members_data, 'petition')
        return petition


# ========================================================================
# Протокол
# ========================================================================

class ProtocolItemSerializer(serializers.ModelSerializer):
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    asset_code = serializers.CharField(source='asset.code', read_only=True)
    unit_of_measure = serializers.CharField(source='asset.unit_of_measure', read_only=True)

    class Meta:
        model = ProtocolItem
        fields = ['id', 'asset', 'asset_name', 'asset_code', 'unit_of_measure', 'quantity', 'unit_price', 'total']
        read_only_fields = ['total']


class ProtocolListSerializer(DocumentComputedFieldsMixin, serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_short_name', read_only=True, default='')
    total_amount = serializers.SerializerMethodField()
    items_count = serializers.IntegerField(source='attachment_items.count', read_only=True)

    class Meta:
        model = CommissionProtocol
        fields = [
            'id', 'number', 'date', 'status', 'status_display',
            'total_amount', 'items_count', 'pending_my_approval',
            'created_by_name', 'created_at',
        ]

    def get_total_amount(self, obj):
        return sum(item.total for item in obj.attachment_items.all())


class ProtocolDetailSerializer(DocumentComputedFieldsMixin, serializers.ModelSerializer):
    attachment_items = ProtocolItemSerializer(many=True, read_only=True)
    commission_members = CommissionMemberSerializer(source='commission_members_set', many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    petition_number = serializers.CharField(source='petition.number', read_only=True, default='')
    total_amount = serializers.SerializerMethodField()

    class Meta:
        model = CommissionProtocol
        fields = [
            'id', 'number', 'date', 'status', 'status_display',
            'petition', 'petition_number', 'agenda_item',
            'commission_order_number', 'commission_order_date',
            'decision_text', 'attachment_items', 'total_amount', 'commission_members',
            'signatures', 'pending_my_approval',
            'created_by', 'created_by_name', 'created_at', 'updated_at',
        ]

    def get_total_amount(self, obj):
        return sum(item.total for item in obj.attachment_items.all())


class ProtocolCreateSerializer(serializers.ModelSerializer):
    attachment_items = ProtocolItemSerializer(many=True)
    commission_members = CommissionMemberWriteSerializer(many=True, required=False, write_only=True)

    class Meta:
        model = CommissionProtocol
        fields = [
            'id', 'petition', 'agenda_item',
            'commission_order_number', 'commission_order_date',
            'decision_text', 'attachment_items', 'commission_members',
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('attachment_items')
        members_data = validated_data.pop('commission_members', [])
        protocol = CommissionProtocol.objects.create(**validated_data)
        for item_data in items_data:
            ProtocolItem.objects.create(protocol=protocol, **item_data)
        create_commission_members(protocol, members_data, 'protocol')
        return protocol


# ========================================================================
# Накладная на внутреннее перемещение
# ========================================================================

class InternalTransferItemSerializer(serializers.ModelSerializer):
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    asset_code = serializers.CharField(source='asset.code', read_only=True)
    unit_of_measure = serializers.CharField(source='asset.unit_of_measure', read_only=True)

    class Meta:
        model = InternalTransferItem
        fields = ['id', 'asset', 'asset_name', 'asset_code', 'unit_of_measure', 'quantity']


class InternalTransferListSerializer(DocumentComputedFieldsMixin, serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    from_user_name = serializers.CharField(source='from_user.get_short_name', read_only=True, default='')
    to_user_name = serializers.CharField(source='to_user.get_short_name', read_only=True, default='')
    created_by_name = serializers.CharField(source='created_by.get_short_name', read_only=True, default='')
    items_count = serializers.IntegerField(source='items.count', read_only=True)

    class Meta:
        model = InternalTransferInvoice
        fields = [
            'id', 'number', 'date', 'status', 'status_display',
            'asset_type', 'from_user_name', 'to_user_name',
            'items_count', 'pending_my_approval', 'created_by_name', 'created_at',
        ]


class InternalTransferDetailSerializer(DocumentComputedFieldsMixin, serializers.ModelSerializer):
    items = InternalTransferItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    from_user_name = serializers.CharField(source='from_user.get_full_name', read_only=True, default='')
    to_user_name = serializers.CharField(source='to_user.get_full_name', read_only=True, default='')

    class Meta:
        model = InternalTransferInvoice
        fields = [
            'id', 'number', 'date', 'status', 'status_display',
            'asset_type', 'from_user', 'from_user_name',
            'to_user', 'to_user_name', 'items',
            'signatures', 'pending_my_approval',
            'created_by', 'created_by_name', 'created_at', 'updated_at',
        ]


class InternalTransferCreateSerializer(serializers.ModelSerializer):
    items = InternalTransferItemSerializer(many=True)

    class Meta:
        model = InternalTransferInvoice
        fields = ['id', 'from_user', 'to_user', 'asset_type', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        invoice = InternalTransferInvoice.objects.create(**validated_data)
        for item_data in items_data:
            InternalTransferItem.objects.create(invoice=invoice, **item_data)
        return invoice
