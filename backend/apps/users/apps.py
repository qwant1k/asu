from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class UsersConfig(AppConfig):
    """Конфигурация приложения пользователей."""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users'
    verbose_name = _('Пользователи')

    def ready(self):
        from django.core.signals import request_finished
        from apps.users.access import clear_access_cache
        request_finished.connect(clear_access_cache)
