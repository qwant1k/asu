"""URL-маршруты справочников ИС «АСУ»."""

from rest_framework.routers import DefaultRouter

from .views import (
    ApprovalStepViewSet,
    AssetCategoryViewSet,
    AssetViewSet,
    CounterpartyViewSet,
    LimitNormViewSet,
    PositionViewSet,
    RequestTypeViewSet,
    UnitOfMeasureViewSet,
    WarehouseViewSet,
)

app_name = 'references'

router = DefaultRouter()
router.register('counterparties', CounterpartyViewSet, basename='counterparties')
router.register('limit-norms', LimitNormViewSet, basename='limit-norms')
router.register('request-types', RequestTypeViewSet, basename='request-types')
router.register('approval-steps', ApprovalStepViewSet, basename='approval-steps')
router.register('asset-categories', AssetCategoryViewSet, basename='asset-categories')
router.register('assets', AssetViewSet, basename='assets')
router.register('units-of-measure', UnitOfMeasureViewSet, basename='units-of-measure')
router.register('warehouses', WarehouseViewSet, basename='warehouses')
router.register('positions', PositionViewSet, basename='positions')

urlpatterns = router.urls
