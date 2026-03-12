"""URL-маршруты инвентарных карт ИС «АСУ»."""

from django.urls import path
from .views import InventoryCardView, InventoryCardExportView

app_name = 'inventory'

urlpatterns = [
    path('inventory-cards/', InventoryCardView.as_view(), name='inventory-cards'),
    path('inventory-cards/export/', InventoryCardExportView.as_view(), name='inventory-cards-export'),
]
