"""URL-маршруты справочников ИС «АСУ»."""

from rest_framework.routers import DefaultRouter

from .views import (
    CounterpartyViewSet,
    LimitNormViewSet,
    RequestTypeViewSet,
    AssetCategoryViewSet,
    AssetViewSet,
)

app_name = 'references'

router = DefaultRouter()
router.register('counterparties', CounterpartyViewSet, basename='counterparties')
router.register('limit-norms', LimitNormViewSet, basename='limit-norms')
router.register('request-types', RequestTypeViewSet, basename='request-types')
router.register('asset-categories', AssetCategoryViewSet, basename='asset-categories')
router.register('assets', AssetViewSet, basename='assets')

urlpatterns = router.urls
