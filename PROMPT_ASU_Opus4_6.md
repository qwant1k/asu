# ПРОМПТ ДЛЯ CLAUDE OPUS 4.6 (Extended Thinking)
## Создание ИС «АСУ» — Автоматизированный складской учёт | Django + React

---

> **Инструкция по использованию:**
> Скопируй весь текст ниже (раздел «СИСТЕМНЫЙ ПРОМПТ» + «ЗАДАНИЕ») и вставь в Claude Opus 4.6.
> Перед отправкой убедись, что включён режим **Extended Thinking** (бюджет мышления — максимальный).
> Отправляй по одному модулю за сессию, используя секцию «ФАЗЫ РАЗРАБОТКИ».

---

## ═══════════════════════════════════════════
## СИСТЕМНЫЙ ПРОМПТ (SYSTEM PROMPT)
## ═══════════════════════════════════════════

```
Ты — senior full-stack разработчик с глубокой экспертизой в Django REST Framework, React (TypeScript), 
PostgreSQL и проектировании корпоративных информационных систем. Ты пишешь production-ready код 
с полным покрытием всех требований ТЗ, следуя принципам SOLID, DRY, 12-factor app.

ПРАВИЛА РАБОТЫ:
1. Перед написанием кода — ДУМАЙ. Используй extended thinking для анализа архитектуры, 
   выявления зависимостей между модулями, предотвращения конфликтов на ранних этапах.
2. Каждый модуль сдаётся как ПОЛНОСТЬЮ рабочий код — никаких TODO без реализации, 
   кроме явно обозначенных заглушек интеграции с 1С.
3. Заглушки 1С оформляй строго по шаблону из раздела «СТАНДАРТ ЗАГЛУШЕК».
4. Структура файлов — строго по архитектуре из раздела «СТРУКТУРА ПРОЕКТА».
5. Весь пользовательский интерфейс и сообщения — на русском языке.
6. Комментарии в коде — на русском языке.
7. Документируй каждую публичную функцию/класс через docstring.
```

---

## ═══════════════════════════════════════════
## КОНТЕКСТ ПРОЕКТА
## ═══════════════════════════════════════════

**Заказчик:** АО «Казахстанский фонд гарантирования депозитов» (АО «КФГД»)
**Система:** ИС «АСУ» — Информационная система «Автоматизированный складской учёт»
**Назначение:** Автоматизация складского учёта ТМЗ (товарно-материальные запасы), 
ОС (основные средства) и НМА (нематериальные активы) с электронным документооборотом
и интеграцией с 1С:Бухгалтерия.

**Стек технологий:**
- **Backend:** Python 3.11+, Django 4.2+, Django REST Framework 3.14+, Celery + Redis (задачи/уведомления)
- **Frontend:** React 18+, TypeScript, Redux Toolkit, React Query, Ant Design 5
- **База данных:** PostgreSQL 15+
- **Генерация документов:** openpyxl (Excel), reportlab / weasyprint (PDF), python-docx (Word)
- **Email:** Django email backend (SMTP)
- **Аутентификация:** JWT (djangorestframework-simplejwt)
- **Деплой:** Docker + docker-compose

---

## ═══════════════════════════════════════════
## СТРУКТУРА ПРОЕКТА
## ═══════════════════════════════════════════

```
asu_project/
├── backend/
│   ├── config/                    # Django settings, urls, wsgi
│   │   ├── settings/
│   │   │   ├── base.py
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   ├── urls.py
│   │   └── celery.py
│   ├── apps/
│   │   ├── users/                 # Пользователи, роли, аутентификация
│   │   ├── references/            # Справочники (контрагенты, лимиты, номенклатура)
│   │   ├── assets/                # Модели ТМЗ, ОС, НМА
│   │   ├── requests/              # Заявки всех типов
│   │   ├── documents/             # Акты, накладные, протоколы, ходатайства
│   │   ├── inventory/             # Инвентарные карты
│   │   ├── reports/               # Отчётность, выгрузки
│   │   ├── notifications/         # Email-уведомления, in-app уведомления
│   │   └── integrations/          # ЗАГЛУШКИ интеграции с 1С
│   ├── requirements/
│   │   ├── base.txt
│   │   ├── development.txt
│   │   └── production.txt
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── api/                   # RTK Query / axios инстансы
│   │   ├── app/                   # Redux store, роутер
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── references/
│   │   │   ├── requests/
│   │   │   ├── documents/
│   │   │   ├── inventory/
│   │   │   ├── reports/
│   │   │   └── notifications/
│   │   ├── shared/
│   │   │   ├── components/        # Переиспользуемые UI-компоненты
│   │   │   ├── hooks/
│   │   │   ├── utils/
│   │   │   └── types/
│   │   └── styles/
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
├── docker-compose.prod.yml
└── .env.example
```

---

## ═══════════════════════════════════════════
## РОЛИ И ПРАВА ДОСТУПА
## ═══════════════════════════════════════════

| Роль | Код | Описание |
|------|-----|----------|
| Администратор | `ADMIN` | Полный доступ, управление пользователями |
| Работник АХС | `AHS_WORKER` | Создание/редактирование справочников, просмотр всех заявок |
| Руководитель АХС | `AHS_HEAD` | Утверждение документов, просмотр всех данных |
| МОЛ по складу | `MOL_WAREHOUSE` | Работа со складом ТМЗ и ОС, формирование актов |
| МОЛ по НМА | `MOL_NMA` | Работа с НМА, формирование документов |
| Руководитель ФО | `FO_HEAD` | Получение уведомлений о списании, подписание в 1С |
| Руководитель подразделения | `DEPT_HEAD` | Согласование заявок подчинённых |
| Рядовой пользователь | `USER` | Создание заявок, просмотр своих данных |
| Член Рабочей комиссии | `COMMISSION_MEMBER` | Подписание протоколов и актов |
| ИРД/ОСМР работник | `IRD_WORKER` | Доступ к представительским ТМЗ |

**Матрица доступа к модулям:**
- Справочники: просмотр — все; создание/редактирование — ADMIN, AHS_WORKER, AHS_HEAD
- Заявки: создание — все USER+; согласование — DEPT_HEAD; утверждение — MOL_WAREHOUSE, MOL_NMA, AHS_HEAD
- Документы (акты, протоколы): создание — MOL_WAREHOUSE, MOL_NMA; подписание — COMMISSION_MEMBER
- Отчёты: просмотр и выгрузка — MOL_WAREHOUSE, MOL_NMA, AHS_HEAD, ADMIN
- Инвентарная карта: своя карта — все; карты всех — AHS_WORKER, AHS_HEAD, ADMIN

---

## ═══════════════════════════════════════════
## МОДЕЛИ ДАННЫХ (ДЕТАЛЬНОЕ ТЗ)
## ═══════════════════════════════════════════

### 1. Пользователи (apps/users/)

```python
# Модель User — расширение AbstractUser
User:
  - username, email, password (стандартные)
  - first_name, last_name, patronymic (отчество)
  - position (должность)
  - department (ForeignKey → Department)
  - phone
  - role (choices: ADMIN, AHS_WORKER, AHS_HEAD, MOL_WAREHOUSE, MOL_NMA, 
          FO_HEAD, DEPT_HEAD, USER, COMMISSION_MEMBER, IRD_WORKER)
  - supervisor (ForeignKey → self, null=True)  # непосредственный руководитель
  - is_active, date_joined

Department:
  - name
  - code
  - head (ForeignKey → User, null=True)
  - parent (ForeignKey → self, null=True)  # иерархия подразделений
```

### 2. Справочники (apps/references/)

```python
Counterparty:  # Контрагенты/поставщики
  - name, bin (БИН), address, contact_person, phone, email
  - is_active

LimitNorm:  # Лимиты и нормативы
  - asset_type (choices: TMZ, OS, NMA)
  - category (наименование категории)
  - quantity_limit (decimal)
  - period (choices: MONTHLY, QUARTERLY, ANNUAL)
  - department (ForeignKey → Department, null=True — если на весь Фонд)
  - valid_from, valid_to
  - created_by, created_at

RequestType:  # Справочник видов заявок
  - name, code
  - asset_type (choices: TMZ, OS, NMA, REPRESENTATIVE_TMZ)
  - description
  - is_active
```

### 3. Активы (apps/assets/)

```python
AssetCategory:  # Категория/группа актива
  - name, code
  - asset_type (choices: TMZ, OS, NMA)
  - parent (ForeignKey → self, null=True)

Asset:  # Универсальная модель для ТМЗ/ОС/НМА
  - name (наименование)
  - code (код номенклатуры)
  - asset_type (choices: TMZ, OS, NMA, REPRESENTATIVE_TMZ)
  - category (ForeignKey → AssetCategory)
  - unit_of_measure (ед. изм.)
  - unit_price (decimal)
  - is_long_term_use (bool — ТМЗ длительного пользования)
  # Поля, синхронизируемые из 1С:
  - inventory_number (инвентарный номер, nullable)
  - balance_date (дата постановки на баланс, nullable)
  - useful_life_months (срок полезного использования)
  - depreciation_rate (nullable)
  - source_1c_id (ID в 1С, nullable)
  - last_sync_at (datetime, nullable)

WarehouseStock:  # Остатки на складе
  - asset (ForeignKey → Asset)
  - quantity (decimal)
  - total_amount (decimal, вычисляемое)
  - location (место хранения)
  - updated_at

AssetAssignment:  # Закрепление ОС/НМА/ТМЗ длит. польз. за сотрудником
  - asset (ForeignKey → Asset)
  - user (ForeignKey → User)
  - quantity (decimal)
  - assigned_at (дата выдачи)
  - assigned_by (ForeignKey → User)
  - location
  - status (choices: ACTIVE, TRANSFERRED, WRITTEN_OFF)

StockMovement:  # Журнал движения (все операции)
  - asset (ForeignKey → Asset)
  - movement_type (choices: RECEIPT, ISSUE, TRANSFER, WRITE_OFF, INVENTORY_ADJUSTMENT)
  - quantity (decimal)
  - unit_price (decimal)
  - total_amount (decimal)
  - from_user (ForeignKey → User, null=True)
  - to_user (ForeignKey → User, null=True)
  - document_ref (ссылка на документ-основание: GenericForeignKey)
  - performed_by (ForeignKey → User)
  - performed_at (datetime)
  - comment
```

### 4. Заявки (apps/requests/)

```python
AssetRequest:  # Заявка (базовая модель)
  - number (автоприсваиваемый уникальный номер)
  - request_type (ForeignKey → RequestType)
  - status (choices: DRAFT, PENDING_SUPERVISOR, APPROVED_SUPERVISOR, 
                     APPROVED_MOL, APPROVED_AHS_HEAD, APPROVED, 
                     EXECUTED, REJECTED, CANCELLED)
  - initiator (ForeignKey → User)
  - created_at, updated_at
  # Для заявок перемещения:
  - from_user (ForeignKey → User, null=True)
  - to_user (ForeignKey → User, null=True)
  - reason (причина/обоснование)

AssetRequestItem:  # Позиции заявки
  - request (ForeignKey → AssetRequest)
  - asset (ForeignKey → Asset)
  - quantity_requested (decimal)
  - quantity_issued (decimal, null=True — заполняется при исполнении)
  - comment

RequestApproval:  # Журнал согласований/подписаний
  - request (ForeignKey → AssetRequest)
  - approver (ForeignKey → User)
  - role_at_approval (роль на момент согласования)
  - action (choices: APPROVED, REJECTED, SENT_TO_REVISION)
  - otp_code (хэш OTP-кода для подписания)
  - otp_expires_at
  - signed_at (datetime, null=True)
  - comment
```

### 5. Документы (apps/documents/)

```python
BaseDocument (abstract):  # Базовый класс для всех документов
  - number (автоприсваиваемый после подписания)
  - date (автовыставляется после подписания)
  - status (choices: DRAFT, PENDING_SIGNATURE, PARTIALLY_SIGNED, 
                     SIGNED, SENT_FOR_REVISION, CANCELLED)
  - created_by (ForeignKey → User)
  - created_at, updated_at

IncomingInvoice(BaseDocument):  # Приходная накладная
  - asset_type (choices: TMZ, OS, NMA)
  - counterparty (ForeignKey → Counterparty)
  - items: [asset, quantity, unit_price, total]
  - mol_warehouse (ForeignKey → User)

WriteOffAct(BaseDocument):  # Акт на списание ТМЗ
  - act_type (choices: TMZ, REPRESENTATIVE_TMZ, OS_NMA, DESTRUCTION)
  - items: [asset, quantity, unit_price, total]
  - commission_order_number, commission_order_date
  - commission_members: M2M через CommissionMember
  - total_amount (вычисляемое)
  - is_representative (bool)

Petition(BaseDocument):  # Ходатайство на выбытие ОС/НМА
  - legal_basis (правовое основание)
  - items: [asset, quantity, unit_price, total]
  - commission_members: M2M через CommissionMember

CommissionProtocol(BaseDocument):  # Протокол заседания
  - petition (ForeignKey → Petition)
  - agenda_item (пункт повестки дня)
  - commission_order_number, commission_order_date
  - commission_members: M2M через CommissionMember
  - decision_text (текст решения)
  - attachment_items: M2M через ProtocolItem (Приложение 1)

InternalTransferInvoice(BaseDocument):  # Накладная на внутреннее перемещение
  - from_user (ForeignKey → User)
  - to_user (ForeignKey → User)
  - asset_type (choices: OS, NMA)
  - items: [asset, quantity]

DocumentSignature:  # Подписи к документам
  - document_type (ContentType)
  - document_id
  - signer (ForeignKey → User)
  - role_label (отображаемая роль при подписании)
  - otp_code_hash
  - otp_expires_at
  - signed_at (null=True до подписания)
  - is_acting_chairman (bool — И.о. Председателя)
  - sent_for_revision_at (null=True)
  - revision_reason (причина возврата)
```

### 6. Уведомления (apps/notifications/)

```python
Notification:
  - recipient (ForeignKey → User)
  - notification_type (choices: REQUEST_STATUS, DOCUMENT_TO_SIGN, 
                                 OVERDUE_TASK, ASSET_EXPIRY, REMINDER)
  - title, body
  - related_object (GenericForeignKey)
  - is_read (bool)
  - created_at

EmailLog:  # Журнал отправленных писем
  - recipient_email
  - subject
  - body_preview
  - status (choices: SENT, FAILED)
  - sent_at
  - related_notification (ForeignKey → Notification)
```

---

## ═══════════════════════════════════════════
## СТАНДАРТ ЗАГЛУШЕК ИНТЕГРАЦИИ С 1С
## ═══════════════════════════════════════════

Все методы интеграции с 1С размещаются в `apps/integrations/one_c/`.

**Обязательный шаблон заглушки:**

```python
# apps/integrations/one_c/client.py

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
        
        ЗАГЛУШКА: возвращает тестовые данные.
        TODO: реализовать через HTTP API или COM-объект 1С после 
              предоставления технических данных Заказчиком.
        """
        self._stub_warning('get_assets_from_1c')
        # Mock-данные для разработки
        return [
            OneCAsset(
                source_id='STUB-001',
                name=f'Тестовый актив {asset_type} 001',
                asset_type=asset_type,
                inventory_number='ИНВ-0001' if asset_type != 'TMZ' else None,
                unit_price=15000.00,
                quantity=5.0,
                balance_date='2024-01-01',
                useful_life_months=60 if asset_type != 'TMZ' else None,
            )
        ]

    def sync_assets(self, asset_type: str) -> dict:
        """
        Синхронизировать справочник активов из 1С в ИС «АСУ».
        Запускается по расписанию (Celery beat) и вручную.
        
        ЗАГЛУШКА: имитирует синхронизацию, не изменяя реальные данные.
        TODO: реализовать после настройки подключения к 1С.
        
        Returns:
            dict: {'created': int, 'updated': int, 'errors': list}
        """
        self._stub_warning('sync_assets')
        return {
            'created': 0,
            'updated': 0,
            'errors': [],
            'stub_mode': True,
            'message': 'Синхронизация в режиме заглушки. Данные не изменены.'
        }

    def notify_writeoff_to_1c(self, asset_ids: list[str], act_number: str) -> bool:
        """
        Уведомить 1С о необходимости списания ОС/НМА.
        Вызывается после подписания Протокола Рабочей комиссии.
        
        ЗАГЛУШКА: логирует событие, не отправляет данные в 1С.
        TODO: реализовать отправку в 1С после настройки интеграции.
        """
        self._stub_warning('notify_writeoff_to_1c')
        logger.info(
            f"[1С ЗАГЛУШКА] Уведомление о списании: акт={act_number}, "
            f"активы={asset_ids}. Реальная отправка в 1С не выполнена."
        )
        return True  # mock успех

    def get_balance_data(self, asset_type: str, date: str) -> list[dict]:
        """
        Получить данные об остатках на балансе из 1С на заданную дату.
        
        ЗАГЛУШКА: возвращает пустой список.
        TODO: реализовать запрос к 1С.
        """
        self._stub_warning('get_balance_data')
        return []


# Глобальный экземпляр клиента
one_c_client = OneCIntegrationClient()
```

**Celery-задачи для синхронизации:**
```python
# apps/integrations/tasks.py

@shared_task(name='sync_assets_from_1c')
def sync_assets_from_1c_task(asset_type: str = 'all'):
    """
    Плановая синхронизация активов из 1С.
    Запускается по расписанию: ежедневно в 03:00 по Алматы.
    ЗАГЛУШКА: см. OneCIntegrationClient.sync_assets()
    """
    ...
```

---

## ═══════════════════════════════════════════
## БИЗНЕС-ЛОГИКА: ПРОЦЕССЫ И WORKFLOW
## ═══════════════════════════════════════════

### Процесс 1: Жизненный цикл заявки

```
Пользователь создаёт заявку → статус: DRAFT
    ↓ (нажимает "Сохранить")
статус: PENDING_SUPERVISOR → email + in-app уведомление руководителю
    ↓ (руководитель: OTP-подтверждение → "Подписать")
статус: APPROVED_SUPERVISOR → уведомление МОЛ
    ↓ (МОЛ по складу/НМА: OTP → "Подписать")
статус: APPROVED_MOL → уведомление руководителю АХС
    ↓ (Рук. АХС: OTP → "Утвердить")
статус: APPROVED → уведомление инициатору
    ↓ (Инициатор получает ТМЗ/ОС/НМА, нажимает "Подтверждаю")
статус: EXECUTED → движение актива записывается в StockMovement
```

**OTP-логика подписания:**
- При нажатии "Согласовать" — генерируется 6-значный OTP
- OTP хэшируется (SHA-256) и сохраняется в RequestApproval.otp_code
- OTP действует 30 минут (otp_expires_at)
- На email подписанта отправляется письмо с кодом
- При вводе кода — верифицируется хэш, кнопка "Подписать" активируется
- После подписания статус заявки обновляется, следующий участник получает уведомление

### Процесс 2: Документооборот (Акты, Протоколы)

```
МОЛ создаёт документ → статус: DRAFT
    ↓ (сохраняет)
Система отправляет OTP на email МОЛ
МОЛ подписывает → статус: PENDING_SIGNATURE
    ↓
Система рассылает OTP членам Рабочей комиссии
Каждый член: OTP → "Подписать" или "Отправить на доработку"
    ↓ (если доработка)
Документ возвращается МОЛ → статус: SENT_FOR_REVISION + причина
    ↓ (если все подписали)
статус: SIGNED
→ Автоматический пересчёт остатков в WarehouseStock
→ Уведомление руководителю ФО (для ОС/НМА → 1С заглушка)
```

**Контроль сроков:**
- Celery Beat каждые 4 часа проверяет документы в статусе PENDING_SIGNATURE
- Если прошло > 72 рабочих часов без подписания → отправить reminder-уведомление

### Процесс 3: Уведомления об истечении срока ОС/НМА

```
Celery Beat (ежедневно):
→ Проверить AssetAssignment, где:
   assigned_at + useful_life_months × 30 ≤ now() + 30 дней
→ Отправить in-app + email уведомление МОЛ
```

---

## ═══════════════════════════════════════════
## ТРЕБОВАНИЯ К API (BACKEND)
## ═══════════════════════════════════════════

Все эндпоинты — под `/api/v1/`. Формат — JSON. Аутентификация — Bearer JWT.

**Обязательные группы эндпоинтов:**

```
/api/v1/auth/
  POST /login/                    → получить JWT токены
  POST /token/refresh/            → обновить access token
  POST /logout/                   → инвалидировать refresh token
  GET  /me/                       → данные текущего пользователя
  PATCH /me/                      → обновить профиль

/api/v1/users/                    → CRUD пользователей (ADMIN)
/api/v1/departments/              → CRUD подразделений

/api/v1/references/
  /counterparties/
  /limit-norms/
  /request-types/
  /asset-categories/

/api/v1/assets/
  GET  /assets/                   → список с фильтрацией (тип, категория, остатки)
  GET  /assets/{id}/
  GET  /warehouse-stock/          → остатки на складе
  GET  /assignments/              → закреплённые активы
  GET  /movements/                → журнал движения

/api/v1/requests/
  POST /                          → создать заявку
  GET  /                          → список (фильтр по роли пользователя)
  GET  /{id}/
  PATCH /{id}/                    → редактирование (только DRAFT)
  DELETE /{id}/                   → отмена (только DRAFT)
  POST /{id}/submit/              → отправить на согласование
  POST /{id}/generate-otp/        → генерировать OTP для подписания
  POST /{id}/approve/             → согласовать с OTP
  POST /{id}/reject/              → отклонить
  POST /{id}/confirm-receipt/     → подтвердить получение (инициатор)

/api/v1/documents/
  # Приходные накладные
  POST /incoming-invoices/
  GET  /incoming-invoices/
  GET  /incoming-invoices/{id}/
  POST /incoming-invoices/{id}/sign/

  # Акты списания
  POST /write-off-acts/
  GET  /write-off-acts/
  GET  /write-off-acts/{id}/
  POST /write-off-acts/{id}/generate-otp/
  POST /write-off-acts/{id}/sign/
  POST /write-off-acts/{id}/reject/

  # Ходатайства
  POST /petitions/
  GET  /petitions/
  GET  /petitions/{id}/
  POST /petitions/{id}/sign/

  # Протоколы
  POST /protocols/
  GET  /protocols/
  GET  /protocols/{id}/
  POST /protocols/{id}/create-attachment/
  POST /protocols/{id}/sign/
  POST /protocols/{id}/send-for-revision/

/api/v1/inventory/
  GET  /inventory-cards/          → инвентарные карточки (фильтр по сотруднику, типу)
  GET  /inventory-cards/export/   → выгрузить в PDF

/api/v1/reports/
  GET  /tmz-stock/                → остатки ТМЗ
  GET  /os-balance/               → учёт ОС на балансе
  GET  /os-stock/                 → остатки ОС
  GET  /nma-balance/              → учёт НМА на балансе
  GET  /movement/                 → отчёт по движению
  GET  /write-offs/               → акты списания
  GET  /request-journal/         → журнал заявок
  GET  /inventory-report/        → инвентаризационная опись
  # Параметры: ?format=excel|pdf|json&date_from=&date_to=&asset_type=&department_id=

/api/v1/notifications/
  GET  /                          → список уведомлений текущего пользователя
  PATCH /{id}/read/               → отметить прочитанным
  POST /read-all/                 → отметить все прочитанными
  GET  /unread-count/             → количество непрочитанных

/api/v1/integrations/
  POST /one-c/sync/               → ручной запуск синхронизации с 1С (ADMIN)
  GET  /one-c/sync-status/        → статус последней синхронизации
```

---

## ═══════════════════════════════════════════
## ТРЕБОВАНИЯ К FRONTEND
## ═══════════════════════════════════════════

### Структура страниц:

```
/ (root) → редирект на /dashboard или /login

/login                            → форма авторизации

/dashboard                        → главная страница
  - Виджеты: заявки на согласовании, остатки ТМЗ, уведомления
  - Быстрые ссылки по роли

/profile                          → личный кабинет
  - Профиль (редактирование)
  - Мои заявки (список + статусы)
  - Инвентарная карта
  - Уведомления

/references/                      → Справочники
  /users                          → Пользователи
  /counterparties                 → Контрагенты
  /limits                         → Лимиты
  /request-types                  → Виды заявок
  /assets/tmz                     → Справочник ТМЗ
  /assets/os                      → Справочник ОС
  /assets/nma                     → Справочник НМА

/requests/                        → Заявки
  /new                            → создать заявку (выбор вида)
  /new/:type                      → форма конкретного вида заявки
  /                               → журнал заявок
  /:id                            → карточка заявки + подписание

/documents/
  /incoming-invoices              → приходные накладные
  /incoming-invoices/new
  /incoming-invoices/:id
  /write-off-acts                 → акты списания
  /write-off-acts/new
  /write-off-acts/:id
  /petitions                      → ходатайства
  /petitions/:id
  /protocols                      → протоколы
  /protocols/new
  /protocols/:id

/inventory                        → инвентарные карты

/reports/                         → отчётность
  /tmz-stock
  /os-balance
  /os-stock
  /nma-balance
  /movement
  /write-offs
  /request-journal
  /inventory-report

/admin/                           → панель администратора (только ADMIN)
  /users
  /sync-1c
```

### Ключевые UI-требования:

1. **Адаптивный дизайн** — работает на десктопе, планшете
2. **Навигация** — боковое меню с иконками, сворачиваемое; вверху — уведомления с badge
3. **Таблицы** — Ant Design Table с пагинацией, сортировкой, фильтрацией на все списки активов, заявок, документов
4. **Форма подписания** — модальное окно: поле ввода OTP-кода + таймер 30 мин + кнопка "Запросить новый код"
5. **Статус-бейджи** — цветовая индикация статусов заявок/документов
6. **Экспорт** — кнопки выгрузки в Excel/PDF прямо в заголовке каждого отчёта
7. **Уведомления** — Bell-иконка с количеством непрочитанных + выпадающий список
8. **Защита роутов** — HOC/hook `useRequireRole`, блокирующий доступ по ролям

---

## ═══════════════════════════════════════════
## ТРЕБОВАНИЯ К ГЕНЕРАЦИИ ДОКУМЕНТОВ
## ═══════════════════════════════════════════

Все документы генерируются в PDF (основной формат) и Excel (для отчётов).

**Для каждого документа реализовать:**
- `generate_pdf(document_id)` → BytesIO (reportlab или weasyprint)
- `generate_excel(report_params)` → BytesIO (openpyxl)

**Автоподстановка полей:**
- Номер и дата документа — после финального подписания
- ФИО и должности — из справочника пользователей
- "И.о. Председателя" — когда флаг `is_acting_chairman=True` у подписанта

---

## ═══════════════════════════════════════════
## DOCKER И КОНФИГУРАЦИЯ
## ═══════════════════════════════════════════

**docker-compose.yml (dev):**
```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: asu_db
      POSTGRES_USER: asu_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    
  redis:
    image: redis:7-alpine
    
  backend:
    build: ./backend
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - ./backend:/app
    env_file: .env
    depends_on: [db, redis]
    ports:
      - "8000:8000"
    
  celery_worker:
    build: ./backend
    command: celery -A config worker -l info
    volumes:
      - ./backend:/app
    env_file: .env
    depends_on: [db, redis, backend]
    
  celery_beat:
    build: ./backend
    command: celery -A config beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
    volumes:
      - ./backend:/app
    env_file: .env
    depends_on: [db, redis, backend]
    
  frontend:
    build: ./frontend
    command: npm start
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    env_file: .env
```

**.env.example:**
```
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgresql://asu_user:password@db:5432/asu_db

# Redis / Celery
REDIS_URL=redis://redis:6379/0

# Email
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=asu@kfgd.kz
EMAIL_HOST_PASSWORD=

# JWT
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7

# 1С Интеграция (ЗАГЛУШКА — оставить пустыми до настройки)
ONE_C_INTEGRATION_ENABLED=False
ONE_C_BASE_URL=
ONE_C_USERNAME=
ONE_C_PASSWORD=

# Приложение
APP_NAME=ИС «АСУ»
APP_URL=http://localhost:3000
```

---

## ═══════════════════════════════════════════
## ФАЗЫ РАЗРАБОТКИ (ОТПРАВЛЯЙ ПО ОДНОЙ)
## ═══════════════════════════════════════════

Проект разбит на фазы. Каждую фазу отправляй как ОТДЕЛЬНЫЙ промпт в новую сессию Opus 4.6,
прикладывая этот документ как контекст.

---

### 📦 ФАЗА 0 — Инфраструктура и базовая конфигурация

```
Реализуй ФАЗУ 0 из ТЗ ИС «АСУ».

Создай полную инфраструктуру проекта:
1. Django: settings (base/dev/prod), URL-конфигурация, Celery
2. DRF: базовые serializers, permissions (IsAuthenticated + кастомные по ролям), pagination
3. JWT-аутентификация с refresh token rotation
4. Модели: User, Department (со всеми полями из ТЗ) + миграции
5. Docker-compose с сервисами: backend, frontend, db, redis, celery_worker, celery_beat
6. React: настройка проекта (TypeScript, Redux Toolkit, RTK Query, Ant Design, React Router)
7. Страница /login с формой авторизации, JWT хранение, защищённые роуты
8. Layout приложения: сайдбар с навигацией по ролям, header с уведомлениями

Заглушки 1С — по стандарту из ТЗ.
```

---

### 📦 ФАЗА 1 — Справочники

```
Реализуй ФАЗУ 1 из ТЗ ИС «АСУ» (инфраструктура ФАЗЫ 0 уже готова).

Создай модуль «Справочники»:
1. Django модели: Counterparty, LimitNorm, RequestType, AssetCategory, Asset + миграции
2. DRF ViewSets + сериализаторы для всех справочников
3. API: CRUD с пагинацией, поиском, фильтрацией
4. React: страницы /references/* со списками (Ant Design Table) и формами создания/редактирования
5. Доступы по ролям: просмотр — все; редактирование — ADMIN, AHS_WORKER, AHS_HEAD

Особое внимание: Asset должен поддерживать поля синхронизации из 1С (source_1c_id, last_sync_at).
```

---

### 📦 ФАЗА 2 — Активы и склад

```
Реализуй ФАЗУ 2 из ТЗ ИС «АСУ».

Создай модуль «Активы и складской учёт»:
1. Модели: WarehouseStock, AssetAssignment, StockMovement + миграции
2. API: эндпоинты для остатков, закреплений, журнала движения
3. Бизнес-логика: методы update_stock() при движении, валидация остатков при выдаче
4. React: отчёт по остаткам, просмотр закреплений за сотрудником
5. Заглушка 1С: синхронизация остатков (OneCIntegrationClient.sync_assets)
```

---

### 📦 ФАЗА 3 — Модуль заявок

```
Реализуй ФАЗУ 3 из ТЗ ИС «АСУ».

Создай модуль «Заявки» (полный workflow):
1. Модели: AssetRequest, AssetRequestItem, RequestApproval + миграции
2. Все 8 видов заявок из ТЗ с отдельными формами:
   - Заявка на выдачу ТМЗ со склада
   - Заявка на выдачу ТМЗ (представительские расходы) — только для IRD_WORKER/AHS
   - Заявка на выдачу ОС со склада
   - Заявка на перемещение ОС
   - Заявка на выдачу ОС новому/переводимому работнику
   - Заявка на перемещение ОС увольняющегося/переводящегося работника
   - Заявка на выдачу НМА со склада
   - Заявка на изменение пользователя НМА
3. OTP-система: генерация, хэширование SHA-256, отправка на email, верификация
4. Celery tasks: отправка email-уведомлений на каждом этапе workflow
5. API: все эндпоинты из ТЗ для заявок
6. React: 
   - Личный кабинет с блоками «Мои заявки», «Инвентарная карта», «Уведомления»
   - Страница создания заявки (выбор вида → форма)
   - Карточка заявки с историей согласований
   - Модальное окно подписания с OTP (таймер, повторная отправка)
```

---

### 📦 ФАЗА 4 — Документооборот

```
Реализуй ФАЗУ 4 из ТЗ ИС «АСУ».

Создай модуль «Документы»:
1. Все модели документов + DocumentSignature + миграции
2. Все формы документов по ТЗ:
   - Приходная накладная (ТМЗ, ОС, НМА)
   - АКТ на списание ТМЗ
   - АКТ на списание ТМЗ (представительские расходы)
   - Ходатайство на выбытие ОС/НМА
   - АКТ на выбытие и списание ОС/НМА
   - ПРОТОКОЛ заседания Рабочей комиссии + Приложение 1
   - АКТ об уничтожении ОС/НМА
   - Накладная на внутреннее перемещение
3. Workflow подписания: OTP → подписание → доработка → автопересчёт остатков
4. Celery: напоминания через 72 рабочих часа
5. Генерация PDF (weasyprint) для каждого документа с точным форматом по ТЗ
6. Заглушка 1С: уведомление о списании (OneCIntegrationClient.notify_writeoff_to_1c)
7. React: формы создания/просмотра документов, интерфейс подписания
```

---

### 📦 ФАЗА 5 — Инвентарная карта и отчётность

```
Реализуй ФАЗУ 5 из ТЗ ИС «АСУ».

Создай модули «Инвентарная карта» и «Отчётность»:
1. API для всех 12 отчётов из ТЗ с поддержкой фильтров
2. Генерация Excel (openpyxl) и PDF (weasyprint) для всех отчётов
3. Три формы инвентарных карточек:
   - По ОС и ТМЗ длительного пользования
   - По НМА
   - Сводная
4. Celery: ежедневная проверка истечения срока ОС/НМА → уведомление МОЛ
5. React:
   - Страницы всех отчётов с фильтрами (Ant Design Form + DatePicker + Select)
   - Кнопки экспорта Excel/PDF в каждом отчёте
   - Страница инвентарных карт с поиском по ФИО и фильтром по типу актива
```

---

### 📦 ФАЗА 6 — Интеграция 1С и финализация

```
Реализуй ФАЗУ 6 из ТЗ ИС «АСУ» — финализация.

1. Панель администратора:
   - Управление пользователями и ролями
   - Страница синхронизации с 1С (ручной запуск + статус последней синхронизации)
   - Журнал ошибок интеграции
2. Расширить заглушки 1С — добавить подробную документацию по реализации:
   - Описание ожидаемого формата API/COM 1С
   - Типовые запросы/ответы (в комментариях)
3. Матрица доступа: генерация/экспорт матрицы доступа в Excel
4. Покрытие тестами: pytest + pytest-django (unit + integration) для критичных модулей
5. README.md с инструкциями по развёртыванию, настройке и подключению 1С
```

---

## ═══════════════════════════════════════════
## ПРИМЕЧАНИЯ И СПЕЦИФИКА ПРОЕКТА
## ═══════════════════════════════════════════

1. **Контекст**: Казахстан. Формат дат: дд.мм.гггг. Валюта: тенге (₸). 
   Номера документов: порядковые в рамках года (напр. «001/2026»).

2. **И.о. Председателя**: Флаг на DocumentSignature. При активации — в шапке документа 
   должность автоматически меняется на «И.о. Председателя».

3. **Блокировка кнопки «Войти»**: На фронте — disabled пока поля пустые, active после заполнения.
   Аналогично для кнопки «Подписать» — disabled до ввода корректного OTP.

4. **Журнал заявок**: ИС не позволяет редактировать зарегистрированные заявки.
   Пользователи видят только свои заявки; АХС и Администратор — все.

5. **Представительские ТМЗ**: Категория доступна только ролям AHS_WORKER, IRD_WORKER, OSMIR_WORKER.

6. **Автоприсвоение номеров**: Номер и дата документа присваиваются ТОЛЬКО после финального 
   подписания — до этого поля отображаются как «№ ХХХ от ХХ.ХХ.ХХХХ г.».

7. **Пересчёт остатков**: Выполняется атомарно (transaction.atomic()) при подписании 
   документов о движении активов.

---

*Промпт сгенерирован на основе ТЗ «ИС АСУ» АО «КФГД» 2026 года.*
*Версия промпта: 1.0 | Дата: 2026-03-10*
