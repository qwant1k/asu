"""URL-маршруты отчётности ИС «АСУ»."""

from django.urls import path
from .views import (
    TMZStockReportView,
    OSBalanceReportView,
    OSStockReportView,
    NMABalanceReportView,
    MovementReportView,
    WriteOffsReportView,
    RequestJournalReportView,
    InventoryReportView,
)

app_name = 'reports'

urlpatterns = [
    path('tmz-stock/', TMZStockReportView.as_view(), name='tmz-stock'),
    path('os-balance/', OSBalanceReportView.as_view(), name='os-balance'),
    path('os-stock/', OSStockReportView.as_view(), name='os-stock'),
    path('nma-balance/', NMABalanceReportView.as_view(), name='nma-balance'),
    path('movement/', MovementReportView.as_view(), name='movement'),
    path('write-offs/', WriteOffsReportView.as_view(), name='write-offs'),
    path('request-journal/', RequestJournalReportView.as_view(), name='request-journal'),
    path('inventory-report/', InventoryReportView.as_view(), name='inventory-report'),
]
