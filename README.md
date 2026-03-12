# ИС «АСУ» — Автоматизированный складской учёт

**Заказчик:** АО «Казахстанский фонд гарантирования депозитов» (АО «КФГД»)

Информационная система автоматизации складского учёта ТМЗ, ОС и НМА с электронным документооборотом и интеграцией с 1С:Бухгалтерия.

---

## Стек технологий

| Компонент | Технология |
|-----------|-----------|
| Backend | Python 3.11+, Django 4.2+, DRF 3.14+ |
| Frontend | React 18+, TypeScript, Redux Toolkit, Ant Design 5 |
| БД | PostgreSQL 15+ |
| Очередь | Celery + Redis |
| Документы | openpyxl, weasyprint, python-docx |
| Аутентификация | JWT (simplejwt) |
| Деплой | Docker + docker-compose |

---

## Быстрый старт

### 1. Клонирование и настройка

```bash
git clone <repo-url>
cd ASU_KDIF
cp .env.example .env
# Отредактировать .env при необходимости
```

### 2. Запуск через Docker

```bash
docker-compose up --build
```

Сервисы:
- **Backend API:** http://localhost:8000
- **Frontend:** http://localhost:3000
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

### 3. Локальная разработка (без Docker)

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Linux/Mac
pip install -r requirements/development.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

**Celery:**
```bash
cd backend
celery -A config worker -l info
celery -A config beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
```

### 4. Создание миграций

```bash
cd backend
python manage.py makemigrations users references assets requests documents notifications integrations
python manage.py migrate
```

---

## Структура проекта

```
ASU_KDIF/
├── backend/
│   ├── config/                    # Django settings, urls, celery
│   ├── apps/
│   │   ├── common/                # Константы, permissions, pagination, mixins, messages
│   │   ├── users/                 # Пользователи, роли, аутентификация
│   │   ├── references/            # Справочники (контрагенты, лимиты, активы)
│   │   ├── assets/                # Складской учёт (остатки, закрепления, движение)
│   │   ├── requests/              # Заявки + OTP + workflow
│   │   ├── documents/             # Документооборот (акты, протоколы, накладные)
│   │   ├── inventory/             # Инвентарные карты
│   │   ├── reports/               # Отчётность (8 видов отчётов)
│   │   ├── notifications/         # Email и in-app уведомления
│   │   └── integrations/          # Заглушки интеграции с 1С
│   ├── templates/                 # Email и PDF шаблоны (ru/kk/en)
│   ├── locale/                    # Файлы переводов Django (ru/kk/en)
│   └── requirements/
├── frontend/
│   ├── src/
│   │   ├── api/                   # Axios instance, API-клиенты
│   │   ├── app/                   # Redux store, hooks
│   │   ├── features/              # Страницы по модулям
│   │   ├── shared/                # Компоненты, хуки, типы, утилиты
│   │   ├── i18n/                  # i18next конфигурация + JSON-переводы
│   │   └── styles/
│   └── public/
├── docker-compose.yml
├── .env.example
├── PLAN.md                        # Детальный план разработки
├── CONTRIBUTING_I18N.md           # Правила работы с i18n
└── README.md
```

---

## Роли пользователей

| Роль | Код | Описание |
|------|-----|----------|
| Администратор | `ADMIN` | Полный доступ |
| Работник АХС | `AHS_WORKER` | Справочники, просмотр заявок |
| Руководитель АХС | `AHS_HEAD` | Утверждение документов |
| МОЛ по складу | `MOL_WAREHOUSE` | Склад ТМЗ и ОС |
| МОЛ по НМА | `MOL_NMA` | Работа с НМА |
| Руководитель ФО | `FO_HEAD` | Уведомления о списании |
| Руководитель подразделения | `DEPT_HEAD` | Согласование заявок |
| Рядовой пользователь | `USER` | Создание заявок |
| Член Рабочей комиссии | `COMMISSION_MEMBER` | Подписание протоколов |
| ИРД/ОСМР работник | `IRD_WORKER` | Представительские ТМЗ |

---

## API

Все эндпоинты: `/api/v1/`. Аутентификация: `Bearer JWT`.

Основные группы:
- `/api/v1/auth/` — авторизация, профиль
- `/api/v1/references/` — справочники
- `/api/v1/assets/` — склад, остатки, движение
- `/api/v1/requests/` — заявки + workflow
- `/api/v1/documents/` — документооборот
- `/api/v1/inventory/` — инвентарные карты
- `/api/v1/reports/` — отчётность
- `/api/v1/notifications/` — уведомления
- `/api/v1/integrations/` — синхронизация 1С

---

## Интернационализация (i18n)

- **Текущий язык:** русский (ru)
- **Задел:** казахский (kk), английский (en)
- **Подключение нового языка:** без рефакторинга кода — см. `CONTRIBUTING_I18N.md`

---

## Интеграция с 1С

Реализована в виде **заглушек** (`apps/integrations/one_c/client.py`). Все методы возвращают mock-данные. Для подключения реальной интеграции:

1. Установить `ONE_C_INTEGRATION_ENABLED=True` в `.env`
2. Указать `ONE_C_BASE_URL`, `ONE_C_USERNAME`, `ONE_C_PASSWORD`
3. Реализовать методы в `OneCIntegrationClient`

---

*Версия: 1.0 | Дата: 2026-03-10*
