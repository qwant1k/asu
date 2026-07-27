from rest_framework.routers import DefaultRouter

from apps.common.trash_views import TrashItemViewSet


router = DefaultRouter()
router.register('trash', TrashItemViewSet, basename='trash')

urlpatterns = router.urls
