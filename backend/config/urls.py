"""
Корневая URL-конфигурация проекта ИС «АСУ».
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # API v1
    path('api/v1/auth/', include('apps.users.urls', namespace='auth')),
    path('api/v1/users/', include('apps.users.urls_users', namespace='users')),
    path('api/v1/departments/', include('apps.users.urls_departments', namespace='departments')),
    path('api/v1/references/', include('apps.references.urls', namespace='references')),
    path('api/v1/assets/', include('apps.assets.urls', namespace='assets')),
    path('api/v1/requests/', include('apps.requests.urls', namespace='requests')),
    path('api/v1/documents/', include('apps.documents.urls', namespace='documents')),
    path('api/v1/inventory/', include('apps.inventory.urls', namespace='inventory')),
    path('api/v1/reports/', include('apps.reports.urls', namespace='reports')),
    path('api/v1/notifications/', include('apps.notifications.urls', namespace='notifications')),
    path('api/v1/integrations/', include('apps.integrations.urls', namespace='integrations')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
