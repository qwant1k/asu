"""URL-маршруты активов и склада ИС «АСУ»."""

from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    ActiveStockAlertView,
    StockUploadView,
    WarehouseStockViewSet,
    AssetAssignmentViewSet,
    StockMovementViewSet,
    StockAlertRuleViewSet,
)

app_name = 'assets'

router = DefaultRouter()
router.register('warehouse-stock', WarehouseStockViewSet, basename='warehouse-stock')
router.register('assignments', AssetAssignmentViewSet, basename='assignments')
router.register('movements', StockMovementViewSet, basename='movements')
router.register('stock-alert-rules', StockAlertRuleViewSet, basename='stock-alert-rules')

urlpatterns = [
    path('upload-stock/', StockUploadView.as_view(), name='upload-stock'),
    path('stock-alerts/active/', ActiveStockAlertView.as_view(), name='stock-alerts-active'),
] + router.urls
