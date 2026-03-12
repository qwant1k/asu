"""URL-маршруты активов и склада ИС «АСУ»."""

from rest_framework.routers import DefaultRouter

from .views import (
    WarehouseStockViewSet,
    AssetAssignmentViewSet,
    StockMovementViewSet,
)

app_name = 'assets'

router = DefaultRouter()
router.register('warehouse-stock', WarehouseStockViewSet, basename='warehouse-stock')
router.register('assignments', AssetAssignmentViewSet, basename='assignments')
router.register('movements', StockMovementViewSet, basename='movements')

urlpatterns = router.urls
