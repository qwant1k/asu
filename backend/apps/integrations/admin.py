"""Административная панель Django для интеграций."""

from django.contrib import admin
from .models import SyncLog


@admin.register(SyncLog)
class SyncLogAdmin(admin.ModelAdmin):
    list_display = ['sync_type', 'status', 'started_at', 'finished_at', 'is_stub',
                    'created_count', 'updated_count']
    list_filter = ['status', 'is_stub']
    readonly_fields = ['started_at']
