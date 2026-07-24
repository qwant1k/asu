"""Административная панель Django для активов и склада."""

from django.contrib import admin
from .models import WarehouseStock, AssetAssignment, StockMovement, StockAlertRule, StockAlertState


@admin.register(WarehouseStock)
class WarehouseStockAdmin(admin.ModelAdmin):
    list_display = ['asset', 'quantity', 'total_amount', 'warehouse', 'location', 'updated_at']
    list_filter = ['warehouse']
    search_fields = ['asset__name', 'location', 'warehouse__name']


@admin.register(AssetAssignment)
class AssetAssignmentAdmin(admin.ModelAdmin):
    list_display = ['asset', 'user', 'quantity', 'warehouse', 'status', 'assigned_at']
    list_filter = ['status', 'warehouse']
    search_fields = ['asset__name', 'user__last_name']


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ['asset', 'movement_type', 'quantity', 'total_amount', 'warehouse', 'performed_at']
    list_filter = ['movement_type', 'warehouse']
    search_fields = ['asset__name']


@admin.register(StockAlertRule)
class StockAlertRuleAdmin(admin.ModelAdmin):
    list_display = ['name', 'threshold_quantity', 'is_active', 'updated_at']
    list_filter = ['is_active', 'warehouses']
    search_fields = ['name', 'assets__name', 'groups__name']
    filter_horizontal = ['recipients', 'groups', 'assets', 'warehouses']


@admin.register(StockAlertState)
class StockAlertStateAdmin(admin.ModelAdmin):
    list_display = ['rule', 'stock', 'current_quantity', 'is_active', 'triggered_at', 'resolved_at']
    list_filter = ['is_active', 'rule']
    search_fields = ['rule__name', 'stock__asset__name']
