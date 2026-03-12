"""Административная панель Django для активов и склада."""

from django.contrib import admin
from .models import WarehouseStock, AssetAssignment, StockMovement


@admin.register(WarehouseStock)
class WarehouseStockAdmin(admin.ModelAdmin):
    list_display = ['asset', 'quantity', 'total_amount', 'location', 'updated_at']
    search_fields = ['asset__name', 'location']


@admin.register(AssetAssignment)
class AssetAssignmentAdmin(admin.ModelAdmin):
    list_display = ['asset', 'user', 'quantity', 'status', 'assigned_at']
    list_filter = ['status']
    search_fields = ['asset__name', 'user__last_name']


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ['asset', 'movement_type', 'quantity', 'total_amount', 'performed_at']
    list_filter = ['movement_type']
    search_fields = ['asset__name']
