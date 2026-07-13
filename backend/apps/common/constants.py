"""Константы проекта ИС «АСУ»."""

from django.utils.translation import gettext_lazy as _

# --- Роли пользователей ---
ROLE_ADMIN = 'ADMIN'
ROLE_AHS_WORKER = 'AHS_WORKER'
ROLE_AHS_HEAD = 'AHS_HEAD'
ROLE_MOL_WAREHOUSE = 'MOL_WAREHOUSE'
ROLE_MOL_NMA = 'MOL_NMA'
ROLE_FO_HEAD = 'FO_HEAD'
ROLE_DEPT_HEAD = 'DEPT_HEAD'
ROLE_USER = 'USER'
ROLE_COMMISSION_MEMBER = 'COMMISSION_MEMBER'
ROLE_IRD_WORKER = 'IRD_WORKER'

ROLE_CHOICES = [
    (ROLE_ADMIN, _('Администратор')),
    (ROLE_AHS_WORKER, _('Работник АХС')),
    (ROLE_AHS_HEAD, _('Руководитель АХС')),
    (ROLE_MOL_WAREHOUSE, _('МОЛ по складу')),
    (ROLE_MOL_NMA, _('МОЛ по НМА')),
    (ROLE_FO_HEAD, _('Руководитель ФО')),
    (ROLE_DEPT_HEAD, _('Руководитель подразделения')),
    (ROLE_USER, _('Рядовой пользователь')),
    (ROLE_COMMISSION_MEMBER, _('Член Рабочей комиссии')),
    (ROLE_IRD_WORKER, _('ИРД/ОСМР работник')),
]

# --- Типы активов ---
ASSET_TYPE_TMZ = 'TMZ'
ASSET_TYPE_OS = 'OS'
ASSET_TYPE_NMA = 'NMA'
ASSET_TYPE_REPRESENTATIVE_TMZ = 'REPRESENTATIVE_TMZ'

ASSET_TYPE_CHOICES = [
    (ASSET_TYPE_TMZ, _('ТМЗ')),
    (ASSET_TYPE_OS, _('ОС')),
    (ASSET_TYPE_NMA, _('НМА')),
    (ASSET_TYPE_REPRESENTATIVE_TMZ, _('Представительские ТМЗ')),
]

ASSET_TYPE_BASE_CHOICES = [
    (ASSET_TYPE_TMZ, _('ТМЗ')),
    (ASSET_TYPE_OS, _('ОС')),
    (ASSET_TYPE_NMA, _('НМА')),
]

# --- Периоды лимитов ---
PERIOD_MONTHLY = 'MONTHLY'
PERIOD_QUARTERLY = 'QUARTERLY'
PERIOD_ANNUAL = 'ANNUAL'

PERIOD_CHOICES = [
    (PERIOD_MONTHLY, _('Ежемесячно')),
    (PERIOD_QUARTERLY, _('Ежеквартально')),
    (PERIOD_ANNUAL, _('Ежегодно')),
]

# --- Статусы закрепления ---
ASSIGNMENT_ACTIVE = 'ACTIVE'
ASSIGNMENT_TRANSFERRED = 'TRANSFERRED'
ASSIGNMENT_WRITTEN_OFF = 'WRITTEN_OFF'

ASSIGNMENT_STATUS_CHOICES = [
    (ASSIGNMENT_ACTIVE, _('Активно')),
    (ASSIGNMENT_TRANSFERRED, _('Передано')),
    (ASSIGNMENT_WRITTEN_OFF, _('Списано')),
]

# --- Типы движения ---
MOVEMENT_RECEIPT = 'RECEIPT'
MOVEMENT_ISSUE = 'ISSUE'
MOVEMENT_TRANSFER = 'TRANSFER'
MOVEMENT_WRITE_OFF = 'WRITE_OFF'
MOVEMENT_INVENTORY_ADJUSTMENT = 'INVENTORY_ADJUSTMENT'

MOVEMENT_TYPE_CHOICES = [
    (MOVEMENT_RECEIPT, _('Оприходование')),
    (MOVEMENT_ISSUE, _('Выдача')),
    (MOVEMENT_TRANSFER, _('Перемещение')),
    (MOVEMENT_WRITE_OFF, _('Списание')),
    (MOVEMENT_INVENTORY_ADJUSTMENT, _('Корректировка по инвентаризации')),
]

# --- Статусы заявок ---
REQUEST_DRAFT = 'DRAFT'
REQUEST_SENT_FOR_REVISION = 'SENT_FOR_REVISION'
REQUEST_PENDING_SUPERVISOR = 'PENDING_SUPERVISOR'
REQUEST_APPROVED_SUPERVISOR = 'APPROVED_SUPERVISOR'
REQUEST_APPROVED_MOL = 'APPROVED_MOL'
REQUEST_APPROVED_AHS_HEAD = 'APPROVED_AHS_HEAD'
REQUEST_APPROVED = 'APPROVED'
REQUEST_EXECUTED = 'EXECUTED'
REQUEST_REJECTED = 'REJECTED'
REQUEST_CANCELLED = 'CANCELLED'

REQUEST_STATUS_CHOICES = [
    (REQUEST_DRAFT, _('Черновик')),
    (REQUEST_SENT_FOR_REVISION, _('На корректировке')),
    (REQUEST_PENDING_SUPERVISOR, _('На согласовании у руководителя')),
    (REQUEST_APPROVED_SUPERVISOR, _('Согласована руководителем')),
    (REQUEST_APPROVED_MOL, _('Согласована МОЛ')),
    (REQUEST_APPROVED_AHS_HEAD, _('Утверждена руководителем АХС')),
    (REQUEST_APPROVED, _('Согласована')),
    (REQUEST_EXECUTED, _('Выдана')),
    (REQUEST_REJECTED, _('Отклонена')),
    (REQUEST_CANCELLED, _('Отменена')),
]

# --- Действия согласования ---
APPROVAL_SUBMITTED = 'SUBMITTED'
APPROVAL_APPROVED = 'APPROVED'
APPROVAL_REJECTED = 'REJECTED'
APPROVAL_SENT_TO_REVISION = 'SENT_TO_REVISION'
APPROVAL_WITHDRAWN = 'WITHDRAWN'

APPROVAL_ACTION_CHOICES = [
    (APPROVAL_SUBMITTED, _('Отправлено на согласование')),
    (APPROVAL_APPROVED, _('Согласовано')),
    (APPROVAL_REJECTED, _('Отклонено')),
    (APPROVAL_SENT_TO_REVISION, _('Отправлено на доработку')),
    (APPROVAL_WITHDRAWN, _('Отозвано инициатором')),
]

# --- Статусы документов ---
DOCUMENT_DRAFT = 'DRAFT'
DOCUMENT_PENDING_SIGNATURE = 'PENDING_SIGNATURE'
DOCUMENT_PARTIALLY_SIGNED = 'PARTIALLY_SIGNED'
DOCUMENT_SIGNED = 'SIGNED'
DOCUMENT_SENT_FOR_REVISION = 'SENT_FOR_REVISION'
DOCUMENT_CANCELLED = 'CANCELLED'

DOCUMENT_STATUS_CHOICES = [
    (DOCUMENT_DRAFT, _('Черновик')),
    (DOCUMENT_PENDING_SIGNATURE, _('На подписании')),
    (DOCUMENT_PARTIALLY_SIGNED, _('Частично подписан')),
    (DOCUMENT_SIGNED, _('Подписан')),
    (DOCUMENT_SENT_FOR_REVISION, _('На доработке')),
    (DOCUMENT_CANCELLED, _('Аннулирован')),
]

# --- Типы актов списания ---
WRITE_OFF_TMZ = 'TMZ'
WRITE_OFF_REPRESENTATIVE_TMZ = 'REPRESENTATIVE_TMZ'
WRITE_OFF_OS_NMA = 'OS_NMA'
WRITE_OFF_DESTRUCTION = 'DESTRUCTION'

WRITE_OFF_TYPE_CHOICES = [
    (WRITE_OFF_TMZ, _('Списание ТМЗ')),
    (WRITE_OFF_REPRESENTATIVE_TMZ, _('Списание представительских ТМЗ')),
    (WRITE_OFF_OS_NMA, _('Списание ОС/НМА')),
    (WRITE_OFF_DESTRUCTION, _('Акт уничтожения')),
]

# --- Типы уведомлений ---
NOTIFICATION_REQUEST_STATUS = 'REQUEST_STATUS'
NOTIFICATION_REQUEST_TO_APPROVE = 'REQUEST_TO_APPROVE'
NOTIFICATION_REQUEST_TO_ISSUE = 'REQUEST_TO_ISSUE'
NOTIFICATION_DOCUMENT_TO_SIGN = 'DOCUMENT_TO_SIGN'
NOTIFICATION_OVERDUE_TASK = 'OVERDUE_TASK'
NOTIFICATION_ASSET_EXPIRY = 'ASSET_EXPIRY'
NOTIFICATION_REMINDER = 'REMINDER'

NOTIFICATION_TYPE_CHOICES = [
    (NOTIFICATION_REQUEST_STATUS, _('Изменение статуса заявки')),
    (NOTIFICATION_REQUEST_TO_APPROVE, _('Заявка на согласование')),
    (NOTIFICATION_REQUEST_TO_ISSUE, _('Заявка на выдачу')),
    (NOTIFICATION_DOCUMENT_TO_SIGN, _('Документ на подписание')),
    (NOTIFICATION_OVERDUE_TASK, _('Просроченная задача')),
    (NOTIFICATION_ASSET_EXPIRY, _('Истечение срока актива')),
    (NOTIFICATION_REMINDER, _('Напоминание')),
]

# --- Статусы email ---
EMAIL_SENT = 'SENT'
EMAIL_FAILED = 'FAILED'

EMAIL_STATUS_CHOICES = [
    (EMAIL_SENT, _('Отправлено')),
    (EMAIL_FAILED, _('Ошибка отправки')),
]
