"""
Клиент для интеграции с ИС «1С: Бухгалтерия».

ЗАГЛУШКА — реальная интеграция реализуется отдельно после
предоставления API/COM-интерфейса 1С со стороны Заказчика.

Все методы возвращают mock-данные для разработки и тестирования.
Переключение на реальный режим: settings.ONE_C_INTEGRATION_ENABLED = True
"""

import logging
from typing import Optional
from dataclasses import dataclass
from django.conf import settings

logger = logging.getLogger(__name__)


@dataclass
class OneCAsset:
    """Структура актива из 1С."""
    source_id: str
    name: str
    asset_type: str  # TMZ / OS / NMA
    inventory_number: Optional[str]
    unit_price: float
    quantity: float
    balance_date: Optional[str]
    useful_life_months: Optional[int]


class OneCIntegrationClient:
    """
    Клиент для интеграции с ИС «1С: Бухгалтерия».

    ЗАГЛУШКА — реальная интеграция реализуется отдельно после
    предоставления API/COM-интерфейса 1С со стороны Заказчика.

    Все методы возвращают mock-данные для разработки и тестирования.
    Переключение на реальный режим: settings.ONE_C_INTEGRATION_ENABLED = True

    Ожидаемый формат API 1С (для будущей реализации):
    ─────────────────────────────────────────────────
    GET  /api/assets?type={TMZ|OS|NMA}
         → [{ id, name, type, inventory_number, unit_price, quantity,
               balance_date, useful_life_months }]

    POST /api/writeoff
         body: { asset_ids: [...], act_number: "001/2026" }
         → { success: true, message: "..." }

    GET  /api/balance?type={TMZ|OS|NMA}&date=YYYY-MM-DD
         → [{ asset_id, quantity, amount }]
    ─────────────────────────────────────────────────
    """

    def __init__(self):
        self.enabled = getattr(settings, 'ONE_C_INTEGRATION_ENABLED', False)
        self.base_url = getattr(settings, 'ONE_C_BASE_URL', '')
        self.username = getattr(settings, 'ONE_C_USERNAME', '')
        self.password = getattr(settings, 'ONE_C_PASSWORD', '')

    def _stub_warning(self, method_name: str) -> None:
        logger.warning(
            f"[1С ЗАГЛУШКА] Метод {method_name} работает в режиме mock. "
            f"Реальная интеграция с 1С не настроена."
        )

    def get_assets_from_1c(self, asset_type: str) -> list[OneCAsset]:
        """
        Получить список активов из 1С по типу (TMZ / OS / NMA).

        В отключённом режиме реальные и тестовые финансовые данные не возвращаются.
        TODO: реализовать через HTTP API или COM-объект 1С после
              предоставления технических данных Заказчиком.
        """
        if not self.enabled:
            raise RuntimeError('Интеграция с 1С не настроена')
        raise NotImplementedError('Технический контракт 1С ещё не реализован')

    def sync_assets(self, asset_type: str) -> dict:
        """
        Синхронизировать справочник активов из 1С в ИС «АСУ».
        Запускается по расписанию (Celery beat) и вручную.

        ЗАГЛУШКА: имитирует синхронизацию, не изменяя реальные данные.
        TODO: реализовать после настройки подключения к 1С.

        Returns:
            dict: {'created': int, 'updated': int, 'errors': list}
        """
        if self.enabled:
            raise NotImplementedError('Технический контракт 1С ещё не реализован')
        self._stub_warning('sync_assets')
        return {
            'created': 0,
            'updated': 0,
            'errors': [],
            'stub_mode': True,
            'message': 'Синхронизация в режиме заглушки. Данные не изменены.',
        }

    def notify_writeoff_to_1c(self, asset_ids: list[str], act_number: str) -> bool:
        """
        Уведомить 1С о необходимости списания ОС/НМА.
        Вызывается после подписания Протокола Рабочей комиссии.

        ЗАГЛУШКА: логирует событие, не отправляет данные в 1С.
        TODO: реализовать отправку в 1С после настройки интеграции.
        """
        if not self.enabled:
            self._stub_warning('notify_writeoff_to_1c')
            return False
        raise NotImplementedError('Технический контракт 1С ещё не реализован')

    def get_balance_data(self, asset_type: str, date: str) -> list[dict]:
        """
        Получить данные об остатках на балансе из 1С на заданную дату.

        ЗАГЛУШКА: возвращает пустой список.
        TODO: реализовать запрос к 1С.
        """
        if not self.enabled:
            raise RuntimeError('Интеграция с 1С не настроена')
        raise NotImplementedError('Технический контракт 1С ещё не реализован')


# Глобальный экземпляр клиента
one_c_client = OneCIntegrationClient()
