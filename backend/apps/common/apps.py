from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class CommonConfig(AppConfig):
    """Конфигурация приложения общих компонентов."""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.common'
    verbose_name = _('Общие компоненты')

    def ready(self):
        from apps.common.audit_signals import connect_audit_signals
        connect_audit_signals()
