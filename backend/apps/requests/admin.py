"""Административная панель Django для заявок."""

from django.contrib import admin
from .models import ApprovalStep, AssetRequest, AssetRequestItem, RequestApproval


class AssetRequestItemInline(admin.TabularInline):
    model = AssetRequestItem
    extra = 0


class RequestApprovalInline(admin.TabularInline):
    model = RequestApproval
    extra = 0
    readonly_fields = ['signed_at']


@admin.register(AssetRequest)
class AssetRequestAdmin(admin.ModelAdmin):
    list_display = ['number', 'request_type', 'status', 'initiator', 'created_at']
    list_filter = ['status', 'request_type']
    search_fields = ['number', 'initiator__last_name']
    filter_horizontal = ['issue_responsibles']
    inlines = [AssetRequestItemInline, RequestApprovalInline]


@admin.register(ApprovalStep)
class ApprovalStepAdmin(admin.ModelAdmin):
    list_display = ['request_type', 'order', 'approver_role', 'requires_supervisor', 'is_active']
    list_filter = ['request_type', 'approver_role', 'is_active']
    ordering = ['request_type', 'order']
