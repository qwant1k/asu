"""
Централизованные сообщения системы ИС «АСУ».
Все строки обёрнуты в gettext_lazy для поддержки i18n.
"""

from django.utils.translation import gettext_lazy as _

# --- Общие ---
MSG_NOT_FOUND = _("Объект не найден")
MSG_PERMISSION_DENIED = _("Недостаточно прав для выполнения данного действия")
MSG_INVALID_DATA = _("Некорректные данные")
MSG_SUCCESS = _("Операция выполнена успешно")
MSG_CREATED = _("Запись успешно создана")
MSG_UPDATED = _("Запись успешно обновлена")
MSG_DELETED = _("Запись успешно удалена")

# --- Аутентификация ---
MSG_LOGIN_SUCCESS = _("Вход выполнен успешно")
MSG_LOGIN_FAILED = _("Неверное имя пользователя или пароль")
MSG_LOGOUT_SUCCESS = _("Выход выполнен успешно")
MSG_TOKEN_INVALID = _("Недействительный токен")
MSG_TOKEN_EXPIRED = _("Срок действия токена истёк")
MSG_USER_INACTIVE = _("Учётная запись деактивирована")

# --- OTP ---
MSG_OTP_SENT = _("OTP-код отправлен на вашу электронную почту")
MSG_OTP_INVALID = _("Неверный OTP-код")
MSG_OTP_EXPIRED = _("Срок действия OTP-кода истёк")
MSG_OTP_ALREADY_USED = _("OTP-код уже был использован")

# --- Заявки ---
MSG_REQUEST_CREATED = _("Заявка успешно создана")
MSG_REQUEST_SUBMITTED = _("Заявка отправлена на согласование")
MSG_REQUEST_APPROVED = _("Заявка согласована")
MSG_REQUEST_REJECTED = _("Заявка отклонена")
MSG_REQUEST_CANCELLED = _("Заявка отменена")
MSG_REQUEST_EXECUTED = _("Заявка исполнена")
MSG_REQUEST_NOT_DRAFT = _("Редактирование возможно только для заявок в статусе «Черновик»")
MSG_REQUEST_CANNOT_APPROVE = _("Вы не можете согласовать данную заявку")

# --- Документы ---
MSG_DOCUMENT_CREATED = _("Документ успешно создан")
MSG_DOCUMENT_SIGNED = _("Документ подписан")
MSG_DOCUMENT_ALL_SIGNED = _("Все подписи получены. Документ утверждён")
MSG_DOCUMENT_SENT_FOR_REVISION = _("Документ отправлен на доработку")
MSG_DOCUMENT_CANNOT_SIGN = _("Вы не можете подписать данный документ")
MSG_DOCUMENT_ALREADY_SIGNED = _("Вы уже подписали данный документ")

# --- Склад ---
MSG_INSUFFICIENT_STOCK = _("Недостаточно остатков на складе")
MSG_STOCK_UPDATED = _("Остатки на складе обновлены")
MSG_ASSET_ASSIGNED = _("Актив закреплён за сотрудником")
MSG_ASSET_TRANSFERRED = _("Актив перемещён")
MSG_ASSET_WRITTEN_OFF = _("Актив списан")

# --- Уведомления ---
MSG_NOTIFICATION_MARKED_READ = _("Уведомление отмечено как прочитанное")
MSG_ALL_NOTIFICATIONS_READ = _("Все уведомления отмечены как прочитанные")

# --- Интеграция 1С ---
MSG_SYNC_STARTED = _("Синхронизация с 1С запущена")
MSG_SYNC_COMPLETED = _("Синхронизация с 1С завершена")
MSG_SYNC_STUB_MODE = _("Синхронизация в режиме заглушки. Данные не изменены")
