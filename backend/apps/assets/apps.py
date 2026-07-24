from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class AssetsConfig(AppConfig):
    """Конфигурация приложения активов и склада."""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.assets'
    verbose_name = _('Активы и склад')

    def ready(self):
        import apps.assets.signals  # noqa: F401
