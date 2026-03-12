from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class IntegrationsConfig(AppConfig):
    """Конфигурация приложения интеграций."""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.integrations'
    verbose_name = _('Интеграции')
