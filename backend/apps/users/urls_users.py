"""URL-маршруты управления пользователями ИС «АСУ»."""

from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    AccessDefinitionView,
    EffectiveUserAccessView,
    PositionAccessRuleViewSet,
    UserAccessOverrideViewSet,
    UserViewSet,
)

app_name = 'users'

router = DefaultRouter()
router.register('access/position-rules', PositionAccessRuleViewSet, basename='position-access-rules')
router.register('access/user-overrides', UserAccessOverrideViewSet, basename='user-access-overrides')
router.register('', UserViewSet, basename='users')

urlpatterns = [
    path('access/definitions/', AccessDefinitionView.as_view(), name='access-definitions'),
    path('access/effective/<int:user_id>/', EffectiveUserAccessView.as_view(), name='access-effective'),
] + router.urls
