# Правила работы с i18n в проекте ИС «АСУ»

## Принцип

Русский — язык по умолчанию. Казахский (`kk`) и английский (`en`) подключаются **без рефакторинга кода** — только добавлением файлов перевода.

---

## Правила для разработчиков

### 1. Ни одной хардкод-строки в UI

**Backend (Django):**
```python
# ❌ Неправильно
raise ValueError("Недостаточно остатков")

# ✅ Правильно
from django.utils.translation import gettext_lazy as _
raise ValueError(_("Недостаточно остатков"))
```

Все `verbose_name`, `help_text`, `error_messages`, системные сообщения — через `_()`.

**Frontend (React):**
```tsx
// ❌ Неправильно
<Button>Сохранить</Button>

// ✅ Правильно
const { t } = useTranslation();
<Button>{t('common.save')}</Button>
```

### 2. Структура ключей перевода

Формат: `модуль.контекст.элемент`

```
common.save
requests.status.draft
documents.incomingInvoice
reports.tmzStock
nav.dashboard
```

### 3. Добавление новых строк

1. Добавить ключ в `frontend/src/i18n/locales/ru.json`
2. Использовать через `t('ключ')` в компоненте
3. Для backend — добавить в `apps/common/messages.py` или в `verbose_name` модели

### 4. Pluralization (множественное число)

Использовать ICU-формат i18next:
```json
{
  "requests.count": "{count, plural, one {# заявка} few {# заявки} other {# заявок}}"
}
```

### 5. Даты и числа

- Даты: через `dayjs` с учётом текущей локали
- Числа и валюта: через `Intl.NumberFormat`
```tsx
new Intl.NumberFormat('ru-KZ', { style: 'currency', currency: 'KZT' }).format(amount)
```

---

## Как подключить новый язык (kk / en)

### Frontend
1. Заполнить `frontend/src/i18n/locales/kk.json` (скопировать структуру из `ru.json`)
2. Импорт уже подключён в `i18n/index.ts` — ничего менять не нужно
3. Добавить локаль Ant Design: `import kkKZ from 'antd/locale/kk_KZ'` в `index.tsx`
4. Показать `LanguageSwitcher` — убрать `display: none` в компоненте

### Backend
1. `python manage.py makemessages -l kk`
2. Перевести строки в `backend/locale/kk/LC_MESSAGES/django.po`
3. `python manage.py compilemessages`

### PDF/Email шаблоны
1. Скопировать `backend/templates/documents/ru/` → `kk/`
2. Перевести HTML-содержимое
3. Аналогично для `backend/templates/emails/`

### Результат
**Рефакторинг кода: 0 строк. Только контент.**
