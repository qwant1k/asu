"""
Настройки Django для окружения разработки (development).
"""

from .base import *  # noqa: F401, F403

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

# Дополнительные приложения для разработки
INSTALLED_APPS += [  # noqa: F405
    'django_extensions',
]

# Email — вывод в консоль при разработке
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# CORS — разрешить всё при разработке
CORS_ALLOW_ALL_ORIGINS = True

# Логирование
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[{asctime}] {levelname} {name}: {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'apps': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}
