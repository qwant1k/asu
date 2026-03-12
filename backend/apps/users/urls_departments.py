"""URL-маршруты управления подразделениями ИС «АСУ»."""

from rest_framework.routers import DefaultRouter

from .views import DepartmentViewSet

app_name = 'departments'

router = DefaultRouter()
router.register('', DepartmentViewSet, basename='departments')

urlpatterns = router.urls
