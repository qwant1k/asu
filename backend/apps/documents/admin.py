"""Административная панель Django для документов."""

from django.contrib import admin
from .models import (
    IncomingInvoice, IncomingInvoiceItem,
    WriteOffAct, WriteOffActItem, CommissionMember,
    Petition, PetitionItem,
    CommissionProtocol, ProtocolItem,
    InternalTransferInvoice, InternalTransferItem,
    DocumentSignature,
)


class IncomingInvoiceItemInline(admin.TabularInline):
    model = IncomingInvoiceItem
    extra = 0


@admin.register(IncomingInvoice)
class IncomingInvoiceAdmin(admin.ModelAdmin):
    list_display = ['number', 'date', 'status', 'asset_type', 'counterparty', 'warehouse', 'created_at']
    list_filter = ['status', 'asset_type']
    inlines = [IncomingInvoiceItemInline]


class WriteOffActItemInline(admin.TabularInline):
    model = WriteOffActItem
    extra = 0


@admin.register(WriteOffAct)
class WriteOffActAdmin(admin.ModelAdmin):
    list_display = ['number', 'date', 'status', 'act_type', 'total_amount', 'created_at']
    list_filter = ['status', 'act_type']
    inlines = [WriteOffActItemInline]


@admin.register(Petition)
class PetitionAdmin(admin.ModelAdmin):
    list_display = ['number', 'date', 'status', 'created_at']
    list_filter = ['status']


@admin.register(CommissionProtocol)
class CommissionProtocolAdmin(admin.ModelAdmin):
    list_display = ['number', 'date', 'status', 'petition', 'created_at']
    list_filter = ['status']


@admin.register(InternalTransferInvoice)
class InternalTransferInvoiceAdmin(admin.ModelAdmin):
    list_display = ['number', 'date', 'status', 'asset_type', 'from_user', 'to_user']
    list_filter = ['status', 'asset_type']


@admin.register(DocumentSignature)
class DocumentSignatureAdmin(admin.ModelAdmin):
    list_display = ['signer', 'role_label', 'signed_at', 'is_acting_chairman']
    list_filter = ['is_acting_chairman']


@admin.register(CommissionMember)
class CommissionMemberAdmin(admin.ModelAdmin):
    list_display = ['user', 'role_label']
