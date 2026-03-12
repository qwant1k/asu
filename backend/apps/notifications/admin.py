"""Административная панель Django для уведомлений."""

from django.contrib import admin
from .models import Notification, EmailLog


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'recipient', 'notification_type', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read']
    search_fields = ['title', 'recipient__last_name']


@admin.register(EmailLog)
class EmailLogAdmin(admin.ModelAdmin):
    list_display = ['subject', 'recipient_email', 'status', 'sent_at']
    list_filter = ['status']
    search_fields = ['subject', 'recipient_email']
