# ПЛАН РАЗРАБОТКИ ИС «АСУ» — АО «КФГД»

> Версия плана: 1.0 | Дата: 2026-03-10  
> Каждый пункт — самостоятельный модуль, корректируется точечно.

---

## ФАЗА 0 — Инфраструктура и каркас проекта

### 0.1 — Инициализация backend (Django)
- [ ] Создать Django-проект `config/` со split-settings: `base.py`, `development.py`, `production.py`
- [ ] Настроить `INSTALLED_APPS`, `MIDDLEWARE`, `AUTH_USER_MODEL`
- [ ] `config/urls.py` — корневой роутер с namespace `/api/v1/`
- [ ] `config/celery.py` — конфигурация Celery + Redis broker
- [ ] `requirements/base.txt` — зависимости: Django 4.2+, DRF 3.14+, simplejwt, celery, redis, psycopg2, openpyxl, weasyprint, python-docx, django-filter, django-cors-headers

### 0.2 — Инициализация frontend (React + TypeScript)
- [ ] `npx create-react-app frontend --template typescript` или Vite
- [ ] Установить: `antd@5`, `@reduxjs/toolkit`, `react-redux`, `react-router-dom@6`, `axios`, `i18next`, `react-i18next`, `i18next-browser-languagedetector`, `i18next-http-backend`, `dayjs`
- [ ] Настроить `tsconfig.json` (paths aliases: `@/api`, `@/features`, `@/shared`)
- [ ] Настроить ESLint + Prettier

### 0.3 — i18n-архитектура (задел на будущее) ★
> **Принцип:** русский — язык по умолчанию и единственный активный сейчас. Казахский (`kk`) и английский (`en`) подключаются добавлением файлов перевода — без рефакторинга кода.

#### 0.3.1 — Backend i18n
- [ ] Включить `django.middleware.locale.LocaleMiddleware` в `MIDDLEWARE`
- [ ] Настроить в `base.py`:
  ```python
  LANGUAGE_CODE = 'ru'
  LANGUAGES = [
      ('ru', 'Русский'),
      ('kk', 'Қазақша'),
      ('en', 'English'),
  ]
  USE_I18N = True
  USE_L10N = True
  LOCALE_PATHS = [BASE_DIR / 'locale']
  ```
- [ ] Создать структуру каталогов:
  ```
  backend/locale/
  ├── ru/LC_MESSAGES/   ← заполняется сейчас
  ├── kk/LC_MESSAGES/   ← пустой, задел
  └── en/LC_MESSAGES/   ← пустой, задел
  ```
- [ ] Все строки пользовательского интерфейса в моделях (verbose_name, help_text), сериализаторах (error_messages), и бизнес-логике (сообщения) — оборачивать в `gettext_lazy` (`from django.utils.translation import gettext_lazy as _`)
- [ ] Валидационные и системные сообщения DRF — выносить в константы с `_()`:
  ```python
  # apps/common/messages.py
  from django.utils.translation import gettext_lazy as _
  
  MSG_NOT_FOUND = _("Объект не найден")
  MSG_PERMISSION_DENIED = _("Недостаточно прав")
  MSG_OTP_EXPIRED = _("Срок действия OTP-кода истёк")
  # ... и т.д.
  ```
- [ ] API-ответы: язык определяется по заголовку `Accept-Language` (Django стандарт)
- [ ] Генерация документов (PDF/Excel): язык передаётся параметром `lang`, по умолчанию `ru`. Шаблоны документов хранятся в папках по языку:
  ```
  backend/templates/documents/
  ├── ru/
  │   ├── write_off_act.html
  │   ├── petition.html
  │   └── ...
  ├── kk/   ← задел
  └── en/   ← задел
  ```

#### 0.3.2 — Frontend i18n
- [ ] Инициализация `i18next` в `src/i18n/index.ts`:
  ```typescript
  import i18n from 'i18next';
  import { initReactI18next } from 'react-i18next';
  import LanguageDetector from 'i18next-browser-languagedetector';
  import ru from './locales/ru.json';
  
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: { ru: { translation: ru } },
      fallbackLng: 'ru',
      supportedLngs: ['ru', 'kk', 'en'],
      interpolation: { escapeValue: false },
    });
  
  export default i18n;
  ```
- [ ] Структура файлов переводов (namespace-based):
  ```
  frontend/src/i18n/
  ├── index.ts
  └── locales/
      ├── ru.json          ← заполняется сейчас
      ├── kk.json          ← пустой/скелет, задел
      └── en.json          ← пустой/скелет, задел
  ```
- [ ] JSON-структура переводов — по модулям (плоский namespace):
  ```json
  {
    "common": {
      "save": "Сохранить",
      "cancel": "Отмена",
      "delete": "Удалить",
      "search": "Поиск",
      "loading": "Загрузка...",
      "actions": "Действия",
      "confirm": "Подтвердить",
      "currency": "₸"
    },
    "auth": {
      "login": "Войти",
      "logout": "Выйти",
      "username": "Имя пользователя",
      "password": "Пароль"
    },
    "nav": { ... },
    "requests": { ... },
    "documents": { ... },
    "reports": { ... },
    "notifications": { ... }
  }
  ```
- [ ] Все строки в JSX — через хук `useTranslation()`:
  ```tsx
  const { t } = useTranslation();
  <Button>{t('common.save')}</Button>
  ```
- [ ] Ant Design: подключить локаль `ru_RU` через `ConfigProvider`, с возможностью переключения:
  ```tsx
  import ruRU from 'antd/locale/ru_RU';
  <ConfigProvider locale={ruRU}>
  ```
- [ ] `dayjs` — подключить локаль `ru`, форматы дат через `dayjs.locale()`
- [ ] Компонент `LanguageSwitcher` — **создать, но скрыть** (`display: none` / feature flag). Когда появятся переводы на kk/en — убрать скрытие без рефакторинга.
- [ ] Все даты, числа, валюта — форматировать через `Intl.NumberFormat` / `Intl.DateTimeFormat` или dayjs с учётом текущей локали

#### 0.3.3 — Правила i18n для разработки (конвенции)
- [ ] Создать файл `CONTRIBUTING_I18N.md` с правилами:
  1. **Ни одной хардкод-строки** в JSX/шаблонах — всё через `t()` / `_()`
  2. Ключи переводов: `модуль.контекст.элемент` (напр. `requests.status.draft`)
  3. Новые строки добавляются **сначала** в `ru.json` / django `.po`-файл
  4. При добавлении нового модуля — создать секцию в JSON-переводах
  5. Pluralization: использовать ICU-формат i18next (`{count, plural, one {# заявка} few {# заявки} other {# заявок}}`)

### 0.4 — Docker и окружение
- [ ] `docker-compose.yml` — сервисы: `db` (postgres:15), `redis` (7-alpine), `backend`, `celery_worker`, `celery_beat`, `frontend`
- [ ] `docker-compose.prod.yml` — nginx, gunicorn, static files
- [ ] `backend/Dockerfile` — python:3.11-slim, зависимости для weasyprint
- [ ] `frontend/Dockerfile` — node:20-alpine, multi-stage build для prod
- [ ] `.env.example` — все переменные окружения (см. ТЗ)
- [ ] `.dockerignore`, `.gitignore`

### 0.5 — Модель User и Department
- [ ] Модель `User` — расширение `AbstractUser`: patronymic, position, department (FK), phone, role (choices), supervisor (FK→self), стандартные поля
- [ ] `verbose_name` всех полей — через `_()` (i18n-ready)
- [ ] Модель `Department` — name, code, head (FK→User), parent (FK→self)
- [ ] Миграции: `0001_initial.py`
- [ ] Management command `createsuperuser` с ролью ADMIN
- [ ] Fixtures / seed data: тестовые пользователи всех ролей

### 0.6 — Аутентификация (JWT)
- [ ] `simplejwt` — настройка в settings: access 60 мин, refresh 7 дней, rotation
- [ ] Эндпоинты: `POST /api/v1/auth/login/`, `POST /api/v1/auth/token/refresh/`, `POST /api/v1/auth/logout/`
- [ ] `GET /api/v1/auth/me/`, `PATCH /api/v1/auth/me/`
- [ ] Сериализаторы: `LoginSerializer`, `UserSerializer`, `UserProfileSerializer`

### 0.7 — Базовые permissions и pagination
- [ ] `apps/common/permissions.py`:
  - `IsAdmin` — только ADMIN
  - `IsAHSStaff` — AHS_WORKER, AHS_HEAD, ADMIN
  - `RoleBasedPermission` — универсальный класс с матрицей ролей
- [ ] `apps/common/pagination.py` — `StandardPagination` (page_size=20, max=100)
- [ ] `apps/common/mixins.py` — `AuditMixin` (created_by, created_at, updated_at)
- [ ] `apps/common/messages.py` — все системные сообщения через `_()`

### 0.8 — Frontend: каркас приложения
- [ ] Redux Store: `store.ts`, slice для auth (`authSlice.ts`)
- [ ] API layer: axios instance с interceptors (JWT inject, refresh, 401 redirect)
- [ ] React Router: публичные (`/login`) и защищённые роуты
- [ ] `useRequireRole` hook — блокировка доступа по роли
- [ ] Layout: `AppLayout.tsx` — Ant Design `Layout` + `Sider` (сворачиваемый сайдбар) + `Header` (bell-иконка уведомлений)
- [ ] Навигация сайдбара — динамическая по роли текущего пользователя
- [ ] Страница `/login` — форма авторизации, disabled кнопка до заполнения полей
- [ ] Страница `/dashboard` — заглушка с виджетами

---

## ФАЗА 1 — Справочники

### 1.1 — Backend: модели справочников
- [ ] `Counterparty` — name, bin (БИН), address, contact_person, phone, email, is_active
- [ ] `LimitNorm` — asset_type, category, quantity_limit, period, department (FK), valid_from, valid_to, created_by
- [ ] `RequestType` — name, code, asset_type, description, is_active
- [ ] `AssetCategory` — name, code, asset_type, parent (FK→self, иерархия)
- [ ] `Asset` — name, code, asset_type, category (FK), unit_of_measure, unit_price, is_long_term_use + поля синхронизации 1С (inventory_number, balance_date, useful_life_months, depreciation_rate, source_1c_id, last_sync_at)
- [ ] Все `verbose_name` — через `_()`
- [ ] Миграции

### 1.2 — Backend: API справочников
- [ ] `CounterpartyViewSet` — CRUD, поиск по name/bin
- [ ] `LimitNormViewSet` — CRUD, фильтрация по asset_type, period, department
- [ ] `RequestTypeViewSet` — CRUD, фильтрация по asset_type
- [ ] `AssetCategoryViewSet` — CRUD, дерево категорий (nested)
- [ ] `AssetViewSet` — CRUD, фильтрация по asset_type, category, is_long_term_use; поиск по name/code
- [ ] Permissions: просмотр — все аутентифицированные; CUD — ADMIN, AHS_WORKER, AHS_HEAD
- [ ] Сериализаторы с валидацией

### 1.3 — Frontend: страницы справочников
- [ ] `/references/counterparties` — таблица + форма создания/редактирования (Drawer или Modal)
- [ ] `/references/limits` — таблица лимитов с фильтрами
- [ ] `/references/request-types` — таблица видов заявок
- [ ] `/references/assets/tmz`, `/references/assets/os`, `/references/assets/nma` — справочники по типам
- [ ] Общий переиспользуемый компонент `ReferenceTable` с пагинацией, сортировкой, фильтрацией
- [ ] Все лейблы, заголовки, плейсхолдеры — через `t()` из `ru.json`

---

## ФАЗА 2 — Активы и складской учёт

### 2.1 — Backend: модели склада
- [ ] `WarehouseStock` — asset (FK), quantity, total_amount (computed), location, updated_at
- [ ] `AssetAssignment` — asset, user, quantity, assigned_at, assigned_by, location, status (ACTIVE/TRANSFERRED/WRITTEN_OFF)
- [ ] `StockMovement` — asset, movement_type, quantity, unit_price, total_amount, from_user, to_user, document_ref (GenericFK), performed_by, performed_at, comment
- [ ] Миграции

### 2.2 — Backend: бизнес-логика склада
- [ ] Сервис `StockService`:
  - `receive_stock(asset, qty, price, doc)` — оприходование
  - `issue_stock(asset, qty, user, doc)` — выдача (с валидацией остатков)
  - `transfer_stock(asset, qty, from_user, to_user, doc)` — перемещение
  - `write_off_stock(asset, qty, doc)` — списание
- [ ] Все операции — в `transaction.atomic()`
- [ ] Автоматическое обновление `WarehouseStock` при каждой операции
- [ ] Все сообщения об ошибках — через `_()`

### 2.3 — Backend: API склада
- [ ] `GET /api/v1/assets/warehouse-stock/` — остатки с фильтрацией
- [ ] `GET /api/v1/assets/assignments/` — закреплённые активы (фильтр по user, status, asset_type)
- [ ] `GET /api/v1/assets/movements/` — журнал движения (фильтр по дате, типу, активу)
- [ ] Permissions по ролям

### 2.4 — Frontend: страницы склада
- [ ] Страница остатков на складе — таблица с группировкой по типу
- [ ] Страница закреплений — фильтр по сотруднику
- [ ] Журнал движения — таблица с фильтрами по дате и типу операции
- [ ] Все строки — через i18n

---

## ФАЗА 3 — Модуль заявок

### 3.1 — Backend: модели заявок
- [ ] `AssetRequest` — number (auto), request_type (FK), status (workflow states), initiator (FK), from_user, to_user, reason, created_at, updated_at
- [ ] `AssetRequestItem` — request (FK), asset (FK), quantity_requested, quantity_issued, comment
- [ ] `RequestApproval` — request (FK), approver (FK), role_at_approval, action, otp_code (hash), otp_expires_at, signed_at, comment
- [ ] Автоприсваивание номера заявки: `{порядковый}/{год}` (напр. `001/2026`)
- [ ] Миграции

### 3.2 — Backend: OTP-система
- [ ] Сервис `OTPService`:
  - `generate_otp(user, target_object)` → 6 цифр, хэш SHA-256
  - `verify_otp(user, target_object, code)` → bool
  - Срок действия: 30 минут
- [ ] Celery task: отправка OTP на email
- [ ] Шаблон email — i18n-ready (`templates/emails/ru/otp_code.html`, задел kk/en)

### 3.3 — Backend: workflow заявок
- [ ] State machine переходов:
  ```
  DRAFT → PENDING_SUPERVISOR → APPROVED_SUPERVISOR → APPROVED_MOL → APPROVED_AHS_HEAD → APPROVED → EXECUTED
                ↘ REJECTED                ↘ REJECTED              ↘ REJECTED
  DRAFT → CANCELLED (отмена инициатором)
  ```
- [ ] Сервис `RequestWorkflowService`:
  - `submit(request)` — отправить на согласование
  - `approve(request, user, otp)` — согласовать
  - `reject(request, user, comment)` — отклонить
  - `confirm_receipt(request, user)` — подтвердить получение → StockMovement
- [ ] Уведомления на каждом переходе (email + in-app)
- [ ] Все 8 видов заявок с валидацией по типу:
  1. Выдача ТМЗ со склада
  2. Выдача ТМЗ (представительские) — только IRD_WORKER, AHS
  3. Выдача ОС со склада
  4. Перемещение ОС
  5. Выдача ОС новому/переводимому работнику
  6. Перемещение ОС увольняющегося/переводящегося
  7. Выдача НМА со склада
  8. Изменение пользователя НМА

### 3.4 — Backend: API заявок
- [ ] `POST /api/v1/requests/` — создать
- [ ] `GET /api/v1/requests/` — список (фильтр по роли: свои / на согласование / все)
- [ ] `GET /api/v1/requests/{id}/` — детали + история согласований
- [ ] `PATCH /api/v1/requests/{id}/` — редактирование (только DRAFT)
- [ ] `DELETE /api/v1/requests/{id}/` — отмена (только DRAFT)
- [ ] `POST /api/v1/requests/{id}/submit/`
- [ ] `POST /api/v1/requests/{id}/generate-otp/`
- [ ] `POST /api/v1/requests/{id}/approve/`
- [ ] `POST /api/v1/requests/{id}/reject/`
- [ ] `POST /api/v1/requests/{id}/confirm-receipt/`

### 3.5 — Frontend: личный кабинет
- [ ] `/profile` — профиль пользователя (редактирование)
- [ ] Блок «Мои заявки» — таблица со статус-бейджами
- [ ] Блок «Инвентарная карта» — закреплённые за пользователем активы
- [ ] Блок «Уведомления» — список непрочитанных

### 3.6 — Frontend: создание и просмотр заявок
- [ ] `/requests/new` — выбор вида заявки (карточки/список)
- [ ] `/requests/new/:type` — форма заявки (динамическая по типу)
- [ ] `/requests` — журнал заявок (таблица с фильтрами и статус-бейджами)
- [ ] `/requests/:id` — карточка заявки: детали + позиции + история согласований + кнопки действий по роли

### 3.7 — Frontend: модальное окно OTP-подписания
- [ ] Компонент `OTPSignModal`:
  - Поле ввода 6-значного кода
  - Таймер обратного отсчёта (30 мин)
  - Кнопка «Запросить новый код» (активна после истечения)
  - Кнопка «Подписать» — disabled до ввода корректного кода
- [ ] Переиспользуется для заявок и документов

---

## ФАЗА 4 — Документооборот

### 4.1 — Backend: модели документов
- [ ] `BaseDocument` (abstract) — number (auto), date (auto после подписания), status (DRAFT → SIGNED), created_by, timestamps
- [ ] `IncomingInvoice` — приходная накладная: asset_type, counterparty, mol_warehouse + items
- [ ] `WriteOffAct` — акт списания: act_type, commission_order_*, commission_members (M2M), is_representative + items
- [ ] `Petition` — ходатайство: legal_basis, commission_members + items
- [ ] `CommissionProtocol` — протокол: petition (FK), agenda_item, decision_text, commission_members + attachment_items
- [ ] `InternalTransferInvoice` — накладная перемещения: from_user, to_user, asset_type + items
- [ ] `DocumentSignature` — GenericFK к документу, signer, role_label, otp_code_hash, signed_at, is_acting_chairman, revision fields
- [ ] Inline-модели для items каждого документа
- [ ] Миграции

### 4.2 — Backend: workflow документов
- [ ] Сервис `DocumentWorkflowService`:
  - `sign(document, user, otp)` — подписание
  - `send_for_revision(document, user, reason)` — возврат на доработку
  - `check_all_signed(document)` → если все подписали → SIGNED
  - При SIGNED: вызов `StockService` для пересчёта остатков
  - При SIGNED (ОС/НМА): вызов `one_c_client.notify_writeoff_to_1c()` (заглушка)
- [ ] Celery task: reminder через 72 рабочих часа для неподписанных документов
- [ ] Автоприсвоение номера и даты после финального подписания

### 4.3 — Backend: генерация документов (PDF/Excel)
- [ ] Шаблоны PDF (weasyprint) для каждого типа документа:
  - Размещение: `templates/documents/ru/` (задел для `kk/`, `en/`)
  - Формат по ТЗ: шапка, таблицы, подписи
- [ ] Автоподстановка: номер, дата, ФИО, должности, «И.о. Председателя»
- [ ] `generate_pdf(document_id, lang='ru')` → BytesIO
- [ ] Генерация Excel (openpyxl) для приходных накладных и актов

### 4.4 — Backend: API документов
- [ ] CRUD + sign/reject для каждого типа документа (см. эндпоинты из ТЗ)
- [ ] `GET .../export/pdf/` — скачать PDF
- [ ] Permissions: создание — MOL_WAREHOUSE, MOL_NMA; подписание — COMMISSION_MEMBER

### 4.5 — Frontend: страницы документов
- [ ] `/documents/incoming-invoices` — список + `/new` + `/:id`
- [ ] `/documents/write-off-acts` — список + `/new` + `/:id`
- [ ] `/documents/petitions` — список + `/:id`
- [ ] `/documents/protocols` — список + `/new` + `/:id`
- [ ] Форма создания документа — динамическая по типу, добавление позиций, выбор комиссии
- [ ] Карточка документа — детали + позиции + подписи (кто подписал / ожидание) + кнопки

### 4.6 — Frontend: интерфейс подписания документов
- [ ] Переиспользование `OTPSignModal` из Фазы 3
- [ ] Отображение статуса подписей: таблица подписантов с индикацией
- [ ] Кнопка «Отправить на доработку» с полем причины
- [ ] Предпросмотр PDF в модальном окне

---

## ФАЗА 5 — Инвентарная карта и отчётность

### 5.1 — Backend: инвентарные карточки
- [ ] Три формата карточек:
  1. По ОС и ТМЗ длительного пользования
  2. По НМА
  3. Сводная
- [ ] API: `GET /api/v1/inventory/inventory-cards/` — фильтр по сотруднику, типу актива
- [ ] `GET /api/v1/inventory/inventory-cards/export/` — PDF-выгрузка (weasyprint)
- [ ] Шаблоны PDF — в `templates/documents/ru/`, задел для kk/en

### 5.2 — Backend: модуль отчётов
- [ ] 8 отчётов из ТЗ:
  1. `tmz-stock` — остатки ТМЗ
  2. `os-balance` — учёт ОС на балансе
  3. `os-stock` — остатки ОС
  4. `nma-balance` — учёт НМА на балансе
  5. `movement` — движение активов
  6. `write-offs` — акты списания
  7. `request-journal` — журнал заявок
  8. `inventory-report` — инвентаризационная опись
- [ ] Каждый отчёт: JSON-ответ + Excel (openpyxl) + PDF (weasyprint)
- [ ] Фильтры: date_from, date_to, asset_type, department_id
- [ ] Параметр `?format=json|excel|pdf`
- [ ] Заголовки Excel/PDF — i18n-ready (через `_()`)

### 5.3 — Backend: Celery — мониторинг сроков
- [ ] Celery Beat task (ежедневно, 06:00 Алматы):
  - Проверить `AssetAssignment` где assigned_at + useful_life_months × 30 ≤ now() + 30 дней
  - Отправить in-app + email уведомление МОЛ
- [ ] Шаблон email — i18n-ready

### 5.4 — Frontend: страницы отчётов
- [ ] `/reports/tmz-stock` … `/reports/inventory-report` — 8 страниц
- [ ] Общий компонент `ReportPage`:
  - Панель фильтров (Ant Design Form + DatePicker + Select)
  - Таблица результатов
  - Кнопки «Выгрузить в Excel» / «Выгрузить в PDF» в заголовке
- [ ] Все лейблы и заголовки — через `t()`

### 5.5 — Frontend: инвентарные карты
- [ ] `/inventory` — страница инвентарных карт
- [ ] Поиск по ФИО сотрудника
- [ ] Фильтр по типу актива (ТМЗ/ОС/НМА)
- [ ] Кнопка «Выгрузить PDF»

---

## ФАЗА 6 — Уведомления, админка, финализация

### 6.1 — Backend: модуль уведомлений
- [ ] Модели: `Notification`, `EmailLog` (см. ТЗ)
- [ ] API:
  - `GET /api/v1/notifications/` — список
  - `PATCH /api/v1/notifications/{id}/read/`
  - `POST /api/v1/notifications/read-all/`
  - `GET /api/v1/notifications/unread-count/`
- [ ] Сервис `NotificationService.send(recipient, type, title, body, related_object)`
- [ ] Email-отправка через Django email backend (SMTP) + логирование в `EmailLog`
- [ ] Шаблоны email — `templates/emails/ru/`, задел kk/en

### 6.2 — Frontend: уведомления
- [ ] Bell-иконка в Header с badge (количество непрочитанных)
- [ ] Dropdown-список последних уведомлений
- [ ] Полная страница уведомлений в профиле
- [ ] Polling каждые 30 сек или WebSocket (опционально)

### 6.3 — Backend: интеграция 1С (заглушки)
- [ ] `apps/integrations/one_c/client.py` — по стандарту из ТЗ
- [ ] `apps/integrations/tasks.py` — Celery task: `sync_assets_from_1c_task`
- [ ] Celery Beat: ежедневно в 03:00 Алматы
- [ ] API:
  - `POST /api/v1/integrations/one-c/sync/` — ручной запуск (ADMIN)
  - `GET /api/v1/integrations/one-c/sync-status/` — статус
- [ ] Документация: описание ожидаемого формата API 1С в комментариях

### 6.4 — Панель администратора
- [ ] `/admin/users` — управление пользователями и ролями (CRUD)
- [ ] `/admin/sync-1c` — ручной запуск синхронизации + статус
- [ ] Журнал ошибок интеграции
- [ ] Экспорт матрицы доступа в Excel

### 6.5 — Dashboard (виджеты)
- [ ] `/dashboard` — главная страница после входа:
  - Виджет «Заявки на согласовании» (для ролей-согласантов)
  - Виджет «Мои заявки» (для USER)
  - Виджет «Остатки ТМЗ» (для MOL, AHS)
  - Виджет «Уведомления» (последние 5)
  - Быстрые ссылки по роли
- [ ] Данные загружаются параллельно (React Query)

### 6.6 — Тестирование
- [ ] Backend: pytest + pytest-django
  - Unit-тесты: OTP-сервис, StockService, workflow
  - Integration-тесты: API endpoints, permissions
  - Factory Boy для fixture generation
- [ ] Frontend: Jest + React Testing Library
  - Тесты компонентов форм
  - Тесты роутинга по ролям

### 6.7 — Документация и деплой
- [ ] `README.md` — развёртывание, настройка, подключение 1С
- [ ] `CONTRIBUTING_I18N.md` — правила работы с i18n (из п. 0.3.3)
- [ ] Docker production config: nginx + gunicorn + static
- [ ] `.env.example` — все переменные

---

## СВОДНАЯ ТАБЛИЦА МОДУЛЕЙ

| # | Модуль | Зависит от | Backend | Frontend | i18n |
|---|--------|-----------|---------|----------|------|
| 0.1 | Django init | — | ✅ | — | — |
| 0.2 | React init | — | — | ✅ | — |
| 0.3 | i18n-архитектура | 0.1, 0.2 | ✅ | ✅ | ★ |
| 0.4 | Docker | 0.1, 0.2 | ✅ | ✅ | — |
| 0.5 | User/Department | 0.1, 0.3 | ✅ | — | ✅ |
| 0.6 | JWT Auth | 0.5 | ✅ | — | ✅ |
| 0.7 | Permissions | 0.5 | ✅ | — | ✅ |
| 0.8 | Frontend каркас | 0.2, 0.3, 0.6 | — | ✅ | ✅ |
| 1.x | Справочники | Фаза 0 | ✅ | ✅ | ✅ |
| 2.x | Склад | 1.x | ✅ | ✅ | ✅ |
| 3.x | Заявки | 2.x | ✅ | ✅ | ✅ |
| 4.x | Документооборот | 3.x, 2.x | ✅ | ✅ | ✅ |
| 5.x | Отчёты | 2.x, 4.x | ✅ | ✅ | ✅ |
| 6.x | Финализация | Все | ✅ | ✅ | ✅ |

---

## ПРИНЦИПЫ ПОДКЛЮЧЕНИЯ НОВОГО ЯЗЫКА (kk / en)

Когда потребуется добавить казахский или английский:

1. **Frontend:** создать `kk.json` / `en.json` по структуре `ru.json`, добавить import в `i18n/index.ts` → 1 строка кода
2. **Backend:** запустить `django-admin makemessages -l kk`, перевести `.po` файл, `compilemessages`
3. **PDF-шаблоны:** скопировать `templates/documents/ru/` → `kk/`, перевести HTML
4. **Email-шаблоны:** скопировать `templates/emails/ru/` → `kk/`, перевести
5. **Ant Design:** добавить `import kkKZ from 'antd/locale/kk_KZ'` в ConfigProvider
6. **Показать** `LanguageSwitcher` — убрать `display: none`

**Рефакторинг кода: 0 строк. Только контент.**

---

*План создан на основе ТЗ из файла `PROMPT_ASU_Opus4_6.md`*
