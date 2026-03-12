"""
Конфигурация Celery для проекта ИС «АСУ».
"""

import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

app = Celery('asu')

# Загрузка настроек из Django settings с префиксом CELERY_
app.config_from_object('django.conf:settings', namespace='CELERY')

# Автоматическое обнаружение задач во всех зарегистрированных приложениях
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Отладочная задача для проверки работоспособности Celery."""
    print(f'Запрос: {self.request!r}')
