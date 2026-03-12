"""URL-маршруты заявок ИС «АСУ»."""

from rest_framework.routers import DefaultRouter

from .views import AssetRequestViewSet

app_name = 'requests'

router = DefaultRouter()
router.register('', AssetRequestViewSet, basename='requests')

urlpatterns = router.urls
