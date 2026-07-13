"""URL-маршруты активов и склада ИС «АСУ»."""

from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    StockUploadView,
    WarehouseStockViewSet,
    AssetAssignmentViewSet,
    StockMovementViewSet,
)

app_name = 'assets'

router = DefaultRouter()
router.register('warehouse-stock', WarehouseStockViewSet, basename='warehouse-stock')
router.register('assignments', AssetAssignmentViewSet, basename='assignments')
router.register('movements', StockMovementViewSet, basename='movements')

urlpatterns = [
    path('upload-stock/', StockUploadView.as_view(), name='upload-stock'),
] + router.urls
