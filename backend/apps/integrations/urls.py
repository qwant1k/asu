"""URL-маршруты интеграции с 1С ИС «АСУ»."""

from django.urls import path
from .views import SyncTriggerView, SyncStatusView

app_name = 'integrations'

urlpatterns = [
    path('one-c/sync/', SyncTriggerView.as_view(), name='one-c-sync'),
    path('one-c/sync-status/', SyncStatusView.as_view(), name='one-c-sync-status'),
]
