"""Сериализаторы документооборота ИС «АСУ»."""

from rest_framework import serializers
from .models import (
    IncomingInvoice, IncomingInvoiceItem,
    WriteOffAct, WriteOffActItem, CommissionMember,
    Petition, PetitionItem,
    CommissionProtocol, ProtocolItem,
    InternalTransferInvoice, InternalTransferItem,
    DocumentSignature,
)


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

    class Meta:
        model = IncomingInvoiceItem
        fields = ['id', 'asset', 'asset_name', 'asset_code', 'quantity', 'unit_price', 'total']
        read_only_fields = ['total']


class IncomingInvoiceListSerializer(serializers.ModelSerializer):
    counterparty_name = serializers.CharField(source='counterparty.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_short_name', read_only=True, default='')

    class Meta:
        model = IncomingInvoice
        fields = [
            'id', 'number', 'date', 'status', 'status_display',
            'asset_type', 'counterparty', 'counterparty_name',
            'created_by_name', 'created_at',
        ]


class IncomingInvoiceDetailSerializer(serializers.ModelSerializer):
    items = IncomingInvoiceItemSerializer(many=True, read_only=True)
    counterparty_name = serializers.CharField(source='counterparty.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    mol_name = serializers.CharField(source='mol_warehouse.get_full_name', read_only=True, default='')

    class Meta:
        model = IncomingInvoice
        fields = [
            'id', 'number', 'date', 'status', 'status_display',
            'asset_type', 'counterparty', 'counterparty_name',
            'mol_warehouse', 'mol_name',
            'items', 'created_by', 'created_at', 'updated_at',
        ]


class IncomingInvoiceCreateSerializer(serializers.ModelSerializer):
    items = IncomingInvoiceItemSerializer(many=True)

    class Meta:
        model = IncomingInvoice
        fields = ['id', 'asset_type', 'counterparty', 'mol_warehouse', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        invoice = IncomingInvoice.objects.create(**validated_data)
        for item_data in items_data:
            IncomingInvoiceItem.objects.create(invoice=invoice, **item_data)
        return invoice


# ========================================================================
# Акт на списание
# ========================================================================

class WriteOffActItemSerializer(serializers.ModelSerializer):
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    asset_code = serializers.CharField(source='asset.code', read_only=True)

    class Meta:
        model = WriteOffActItem
        fields = ['id', 'asset', 'asset_name', 'asset_code', 'quantity', 'unit_price', 'total']
        read_only_fields = ['total']


class WriteOffActListSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    act_type_display = serializers.CharField(source='get_act_type_display', read_only=True)

    class Meta:
        model = WriteOffAct
        fields = [
            'id', 'number', 'date', 'status', 'status_display',
            'act_type', 'act_type_display', 'total_amount',
            'is_representative', 'created_at',
        ]


class WriteOffActDetailSerializer(serializers.ModelSerializer):
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
            'created_by', 'created_at', 'updated_at',
        ]


class WriteOffActCreateSerializer(serializers.ModelSerializer):
    items = WriteOffActItemSerializer(many=True)

    class Meta:
        model = WriteOffAct
        fields = [
            'id', 'act_type', 'commission_order_number',
            'commission_order_date', 'is_representative', 'items',
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        act = WriteOffAct.objects.create(**validated_data)
        for item_data in items_data:
            WriteOffActItem.objects.create(act=act, **item_data)
        act.recalculate_total()
        return act


# ========================================================================
# Ходатайство
# ========================================================================

class PetitionItemSerializer(serializers.ModelSerializer):
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    asset_code = serializers.CharField(source='asset.code', read_only=True)

    class Meta:
        model = PetitionItem
        fields = ['id', 'asset', 'asset_name', 'asset_code', 'quantity', 'unit_price', 'total']
        read_only_fields = ['total']


class PetitionListSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Petition
        fields = ['id', 'number', 'date', 'status', 'status_display', 'created_at']


class PetitionDetailSerializer(serializers.ModelSerializer):
    items = PetitionItemSerializer(many=True, read_only=True)
    commission_members = CommissionMemberSerializer(source='commission_members_set', many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Petition
        fields = [
            'id', 'number', 'date', 'status', 'status_display',
            'legal_basis', 'items', 'commission_members',
            'created_by', 'created_at', 'updated_at',
        ]


# ========================================================================
# Протокол
# ========================================================================

class ProtocolItemSerializer(serializers.ModelSerializer):
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    asset_code = serializers.CharField(source='asset.code', read_only=True)

    class Meta:
        model = ProtocolItem
        fields = ['id', 'asset', 'asset_name', 'asset_code', 'quantity', 'unit_price', 'total']
        read_only_fields = ['total']


class ProtocolListSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = CommissionProtocol
        fields = ['id', 'number', 'date', 'status', 'status_display', 'created_at']


class ProtocolDetailSerializer(serializers.ModelSerializer):
    attachment_items = ProtocolItemSerializer(many=True, read_only=True)
    commission_members = CommissionMemberSerializer(source='commission_members_set', many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = CommissionProtocol
        fields = [
            'id', 'number', 'date', 'status', 'status_display',
            'petition', 'agenda_item',
            'commission_order_number', 'commission_order_date',
            'decision_text', 'attachment_items', 'commission_members',
            'created_by', 'created_at', 'updated_at',
        ]


# ========================================================================
# Накладная на внутреннее перемещение
# ========================================================================

class InternalTransferItemSerializer(serializers.ModelSerializer):
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    asset_code = serializers.CharField(source='asset.code', read_only=True)

    class Meta:
        model = InternalTransferItem
        fields = ['id', 'asset', 'asset_name', 'asset_code', 'quantity']


class InternalTransferListSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    from_user_name = serializers.CharField(source='from_user.get_short_name', read_only=True, default='')
    to_user_name = serializers.CharField(source='to_user.get_short_name', read_only=True, default='')

    class Meta:
        model = InternalTransferInvoice
        fields = [
            'id', 'number', 'date', 'status', 'status_display',
            'asset_type', 'from_user_name', 'to_user_name', 'created_at',
        ]


class InternalTransferDetailSerializer(serializers.ModelSerializer):
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
            'created_by', 'created_at', 'updated_at',
        ]
