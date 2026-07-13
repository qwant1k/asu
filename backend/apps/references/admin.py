"""Административная панель Django для справочников."""

from django.contrib import admin
from .models import Asset, AssetCategory, Counterparty, LimitNorm, Position, RequestType, UnitOfMeasure, Warehouse


@admin.register(Counterparty)
class CounterpartyAdmin(admin.ModelAdmin):
    list_display = ['name', 'bin', 'contact_person', 'is_active']
    search_fields = ['name', 'bin']
    list_filter = ['is_active']


@admin.register(LimitNorm)
class LimitNormAdmin(admin.ModelAdmin):
    list_display = ['category', 'asset_type', 'quantity_limit', 'period', 'valid_from', 'valid_to']
    list_filter = ['asset_type', 'period']


@admin.register(RequestType)
class RequestTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'asset_type', 'is_active']
    list_filter = ['asset_type', 'is_active']


@admin.register(AssetCategory)
class AssetCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'asset_type', 'parent']
    list_filter = ['asset_type']


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'asset_type', 'category', 'unit_price', 'is_long_term_use']
    list_filter = ['asset_type', 'is_long_term_use', 'category']
    search_fields = ['name', 'code', 'inventory_number']


@admin.register(UnitOfMeasure)
class UnitOfMeasureAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'is_active']
    search_fields = ['name', 'code']
    list_filter = ['is_active']


@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'department', 'is_active']
    search_fields = ['name', 'code', 'address']
    list_filter = ['department', 'is_active']


@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'is_active']
    search_fields = ['name', 'code']
    list_filter = ['is_active']
