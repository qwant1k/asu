import React from 'react';

export const C = {
  bg: '#E9EEF5',
  canvas: '#F4F7FB',
  white: '#FFFFFF',
  surface: 'rgba(255, 255, 255, 0.9)',
  surfaceSolid: '#FFFFFF',
  surfaceSoft: 'rgba(248, 250, 252, 0.86)',
  graphite: '#111827',
  graphiteSoft: '#1F2937',
  graphiteMuted: '#94A3B8',
  accent: '#2563EB',
  accentDark: '#1D4ED8',
  accentCyan: '#38BDF8',
  accentLight: '#EAF3FF',
  accentSubtle: '#F4F8FF',
  teal: '#0F766E',
  tealBg: '#E6FFFB',
  heading: '#0F172A',
  text: '#334155',
  secondary: '#64748B',
  muted: '#94A3B8',
  border: 'rgba(148, 163, 184, 0.28)',
  rowBorder: 'rgba(226, 232, 240, 0.76)',
  inputBorder: '#CBD5E1',
  hoverRow: 'rgba(241, 245, 249, 0.82)',
  thBg: 'rgba(248, 250, 252, 0.9)',
  danger: '#DC2626',
  dangerBg: '#FEF2F2',
  success: '#047857',
  successBg: '#ECFDF5',
  warning: '#B45309',
  warningBg: '#FFFBEB',
  info: '#2563EB',
  infoBg: '#EAF3FF',
  tagBg: '#EEF2F7',
  glass: 'rgba(255, 255, 255, 0.74)',
  glassStrong: 'rgba(255, 255, 255, 0.9)',
  shadow: '0 1px 1px rgba(15, 23, 42, 0.05), 0 18px 46px rgba(15, 23, 42, 0.12), 0 42px 90px rgba(15, 23, 42, 0.08)',
  shadowSoft: '0 1px 1px rgba(15, 23, 42, 0.04), 0 10px 26px rgba(15, 23, 42, 0.07)',
  shadowInset: 'inset 0 1px 0 rgba(255, 255, 255, 0.75)',
  radiusSm: 12,
  radiusMd: 18,
  radiusLg: 24,
  radiusXl: 30,
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
};

const statusColors: Record<string, { bg: string; color: string }> = {
  'В эксплуатации': { bg: C.successBg, color: C.success },
  'На ремонте': { bg: C.warningBg, color: C.warning },
  'Списано': { bg: C.tagBg, color: C.secondary },
  'Активна': { bg: C.successBg, color: C.success },
  'Активен': { bg: C.successBg, color: C.success },
  'Неактивен': { bg: C.tagBg, color: C.secondary },
  'Истекает': { bg: C.warningBg, color: C.warning },
  'На согласовании': { bg: C.infoBg, color: C.info },
  'Одобрена': { bg: C.successBg, color: C.success },
  'Выдано': { bg: C.tagBg, color: C.text },
  'Отклонена': { bg: C.dangerBg, color: C.danger },
  'Черновик': { bg: C.tagBg, color: C.secondary },
  'Исполнена': { bg: C.successBg, color: C.success },
  'Отменена': { bg: C.tagBg, color: C.secondary },
  'Действует': { bg: C.successBg, color: C.success },
  'Истёк': { bg: C.dangerBg, color: C.danger },
  DRAFT: { bg: C.tagBg, color: C.secondary },
  SENT_FOR_REVISION: { bg: C.warningBg, color: C.warning },
  PENDING_SUPERVISOR: { bg: C.infoBg, color: C.info },
  APPROVED_SUPERVISOR: { bg: C.infoBg, color: C.info },
  APPROVED_MOL: { bg: C.infoBg, color: C.info },
  APPROVED_AHS_HEAD: { bg: C.infoBg, color: C.info },
  APPROVED: { bg: C.successBg, color: C.success },
  EXECUTED: { bg: C.successBg, color: C.success },
  REJECTED: { bg: C.dangerBg, color: C.danger },
  CANCELLED: { bg: C.tagBg, color: C.secondary },
  ADMIN: { bg: C.dangerBg, color: C.danger },
  AHS_WORKER: { bg: C.infoBg, color: C.info },
  AHS_HEAD: { bg: '#F4F3FF', color: '#5925DC' },
  MOL_WAREHOUSE: { bg: C.successBg, color: C.success },
  MOL_NMA: { bg: C.tealBg, color: C.teal },
  FO_HEAD: { bg: C.warningBg, color: C.warning },
  DEPT_HEAD: { bg: C.infoBg, color: C.info },
  USER: { bg: C.tagBg, color: C.secondary },
  COMMISSION_MEMBER: { bg: '#FEF7C3', color: '#A15C07' },
  IRD_WORKER: { bg: '#FDF2FA', color: '#C11574' },
  PENDING_SIGNATURE: { bg: C.infoBg, color: C.info },
  PARTIALLY_SIGNED: { bg: C.warningBg, color: C.warning },
  SIGNED: { bg: C.successBg, color: C.success },
  ACTIVE: { bg: C.successBg, color: C.success },
  TRANSFERRED: { bg: C.infoBg, color: C.info },
  WRITTEN_OFF: { bg: C.tagBg, color: C.secondary },
  RECEIPT: { bg: C.successBg, color: C.success },
  ISSUE: { bg: C.infoBg, color: C.info },
  TRANSFER: { bg: C.warningBg, color: C.warning },
  WRITE_OFF: { bg: C.dangerBg, color: C.danger },
  INVENTORY_ADJUSTMENT: { bg: C.infoBg, color: C.info },
  TMZ: { bg: C.infoBg, color: C.info },
  OS: { bg: C.successBg, color: C.success },
  NMA: { bg: C.tealBg, color: C.teal },
  REPRESENTATIVE_TMZ: { bg: C.warningBg, color: C.warning },
  true: { bg: C.successBg, color: C.success },
  false: { bg: C.tagBg, color: C.secondary },
};

const statusLabels: Record<string, string> = {
  DRAFT: 'Черновик',
  SENT_FOR_REVISION: 'На корректировке',
  PENDING_SUPERVISOR: 'На согласовании у руководителя',
  APPROVED_SUPERVISOR: 'Согласована руководителем',
  APPROVED_MOL: 'Согласована МОЛ',
  APPROVED_AHS_HEAD: 'Утверждена руководителем АХС',
  APPROVED: 'Согласована',
  EXECUTED: 'Выдана',
  REJECTED: 'Отклонена',
  CANCELLED: 'Отменена',

  PENDING_SIGNATURE: 'На подписании',
  PARTIALLY_SIGNED: 'Частично подписан',
  SIGNED: 'Подписан',

  ACTIVE: 'Активно',
  TRANSFERRED: 'Передано',
  WRITTEN_OFF: 'Списано',

  RECEIPT: 'Оприходование',
  ISSUE: 'Выдача',
  TRANSFER: 'Перемещение',
  WRITE_OFF: 'Списание',
  INVENTORY_ADJUSTMENT: 'Корректировка',

  APPROVAL_APPROVED: 'Согласовано',
  APPROVAL_REJECTED: 'Отклонено',
  SUBMITTED: 'Отправлено на согласование',
  SENT_TO_REVISION: 'На доработку',
  WITHDRAWN: 'Отозвано инициатором',

  ADMIN: 'Администратор',
  AHS_WORKER: 'Работник АХС',
  AHS_HEAD: 'Руководитель АХС',
  MOL_WAREHOUSE: 'МОЛ по складу',
  MOL_NMA: 'МОЛ по НМА',
  FO_HEAD: 'Руководитель ФО',
  DEPT_HEAD: 'Руководитель подразделения',
  USER: 'Пользователь',
  COMMISSION_MEMBER: 'Член комиссии',
  IRD_WORKER: 'ИРД/ОСМР',

  TMZ: 'ТМЗ',
  OS: 'ОС',
  NMA: 'НМА',
  REPRESENTATIVE_TMZ: 'Представительские ТМЗ',

  MONTHLY: 'Ежемесячно',
  QUARTERLY: 'Ежеквартально',
  ANNUAL: 'Ежегодно',

  true: 'Да',
  false: 'Нет',
};

function getStatusLabel(status: string) {
  return statusLabels[status] || status;
}

function getStatusStyle(status: string) {
  if (statusColors[status]) return statusColors[status];
  const label = getStatusLabel(status);
  if (statusColors[label]) return statusColors[label];
  const normalized = status.toUpperCase();
  if (normalized.includes('FAILED') || normalized.includes('ERROR')) return { bg: C.dangerBg, color: C.danger };
  if (normalized.includes('SUCCESS') || normalized.includes('DONE')) return { bg: C.successBg, color: C.success };
  if (normalized.includes('PENDING') || normalized.includes('RUNNING')) return { bg: C.infoBg, color: C.info };
  return { bg: C.tagBg, color: C.text };
}

interface BadgeProps {
  status: string;
  style?: React.CSSProperties;
}

export function Badge({ status, style }: BadgeProps) {
  const s = getStatusStyle(status);
  const label = getStatusLabel(status);
  return (
    <span
      className="ui-badge"
      style={{
        background: s.bg,
        color: s.color,
        padding: '4px 9px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 650,
        lineHeight: 1.1,
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'center',
        maxWidth: '100%',
        ...style,
      }}
    >
      {label}
    </span>
  );
}

interface ThProps {
  children?: React.ReactNode;
  right?: boolean;
  style?: React.CSSProperties;
}

export function Th({ children, right, style }: ThProps) {
  return (
    <th
      style={{
        padding: '11px 14px',
        textAlign: right ? 'right' : 'left',
        fontWeight: 650,
        fontSize: 11,
        color: C.secondary,
        borderBottom: `1px solid ${C.border}`,
        whiteSpace: 'nowrap',
        background: C.thBg,
        textTransform: 'uppercase',
        letterSpacing: 0,
        ...style,
      }}
    >
      {children}
    </th>
  );
}

interface TdProps {
  children?: React.ReactNode;
  right?: boolean;
  muted?: boolean;
  bold?: boolean;
  style?: React.CSSProperties;
}

export function Td({ children, right, muted, bold, style }: TdProps) {
  return (
    <td
      style={{
        padding: '13px 14px',
        textAlign: right ? 'right' : 'left',
        fontSize: 13,
        color: muted ? C.muted : bold ? C.heading : C.text,
        borderBottom: `1px solid ${C.rowBorder}`,
        whiteSpace: 'nowrap',
        verticalAlign: 'middle',
        ...style,
      }}
    >
      {children}
    </td>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

export function StatCard({ label, value, sub, color }: StatCardProps) {
  return (
    <div
      className="ui-card ui-stat-card"
      style={{
        background: C.surface,
        borderRadius: C.radiusXl,
        border: `1px solid ${C.border}`,
        padding: '20px 20px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minHeight: 126,
        boxShadow: C.shadowSoft,
        backdropFilter: 'blur(18px) saturate(1.25)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.25)',
        transition: `transform 0.28s ${C.spring}, box-shadow 0.28s ${C.ease}`,
      }}
    >
      <div style={{ fontSize: 12, color: C.secondary, fontWeight: 750 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color: color || C.heading, lineHeight: 1.05 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.35 }}>{sub}</div>}
    </div>
  );
}

interface PanelProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  titleRight?: React.ReactNode;
  style?: React.CSSProperties;
  noPad?: boolean;
}

export function Panel({ children, title, subtitle, titleRight, style, noPad }: PanelProps) {
  return (
    <div
      className="ui-card ui-panel"
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: C.radiusLg,
        overflow: 'hidden',
        boxShadow: C.shadowSoft,
        backdropFilter: 'blur(18px) saturate(1.24)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.24)',
        ...style,
      }}
    >
      {title && (
        <div
          style={{
            padding: '17px 20px',
            borderBottom: `1px solid ${C.rowBorder}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            background: 'rgba(255, 255, 255, 0.64)',
            backdropFilter: 'blur(16px) saturate(1.18)',
            WebkitBackdropFilter: 'blur(16px) saturate(1.18)',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: C.heading }}>{title}</span>
            {subtitle && <div style={{ fontSize: 12, color: C.secondary, marginTop: 3, lineHeight: 1.35 }}>{subtitle}</div>}
          </div>
          {titleRight}
        </div>
      )}
      <div style={{ padding: noPad ? 0 : 20 }}>{children}</div>
    </div>
  );
}

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
}

export function Btn({ variant = 'primary', loading, children, style, disabled, className, ...rest }: BtnProps) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: `linear-gradient(135deg, ${C.accent}, #0EA5E9)`, color: '#fff', border: `1px solid ${C.accent}` },
    secondary: { background: C.surfaceSoft, color: C.text, border: `1px solid ${C.border}` },
    danger: { background: C.dangerBg, color: C.danger, border: `1px solid ${C.dangerBg}` },
    ghost: { background: 'transparent', color: C.secondary, border: `1px solid ${C.inputBorder}` },
  };
  return (
    <button
      className={`ui-button ui-button-${variant}${className ? ` ${className}` : ''}`}
      disabled={disabled || loading}
      style={{
        borderRadius: C.radiusSm,
        padding: '9px 15px',
        minHeight: 36,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        fontSize: 13,
        fontWeight: 650,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.58 : 1,
        transition: `transform 0.22s ${C.spring}, box-shadow 0.22s ${C.ease}, background 0.18s ${C.ease}, border-color 0.18s ${C.ease}, opacity 0.18s ${C.ease}`,
        boxShadow: variant === 'primary' ? '0 10px 24px rgba(37, 99, 235, 0.22)' : 'none',
        ...styles[variant],
        ...style,
      }}
      {...rest}
    >
      {loading ? 'Загрузка...' : children}
    </button>
  );
}

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, style, ...rest }, ref) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 650, color: C.heading }}>{label}</label>}
      <input
        ref={ref}
        className="ui-field"
        style={{
          padding: '9px 12px',
          border: `1px solid ${error ? C.danger : C.inputBorder}`,
          borderRadius: C.radiusSm,
          fontSize: 13,
          color: C.heading,
          background: 'rgba(255, 255, 255, 0.86)',
          boxShadow: C.shadowInset,
          outline: 'none',
          width: '100%',
          transition: `border-color 0.2s ${C.ease}, box-shadow 0.2s ${C.ease}, background 0.2s ${C.ease}`,
          ...style,
        }}
        {...rest}
      />
      {error && <span style={{ fontSize: 11, color: C.danger }}>{error}</span>}
    </div>
  )
);

InputField.displayName = 'InputField';

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string | number; label: string }[];
}

export function SelectField({ label, options, style, ...rest }: SelectFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 650, color: C.heading }}>{label}</label>}
      <select
        className="ui-field"
        style={{
          padding: '9px 12px',
          border: `1px solid ${C.inputBorder}`,
          borderRadius: C.radiusSm,
          fontSize: 13,
          color: C.text,
          background: 'rgba(255, 255, 255, 0.86)',
          boxShadow: C.shadowInset,
          cursor: 'pointer',
          outline: 'none',
          transition: `border-color 0.2s ${C.ease}, box-shadow 0.2s ${C.ease}`,
          ...style,
        }}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function TextAreaField({ label, style, ...rest }: TextAreaFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 650, color: C.heading }}>{label}</label>}
      <textarea
        className="ui-field"
        style={{
          padding: '9px 12px',
          border: `1px solid ${C.inputBorder}`,
          borderRadius: C.radiusSm,
          fontSize: 13,
          color: C.heading,
          background: 'rgba(255, 255, 255, 0.86)',
          outline: 'none',
          resize: 'vertical',
          minHeight: 88,
          transition: `border-color 0.2s ${C.ease}, box-shadow 0.2s ${C.ease}`,
          ...style,
        }}
        {...rest}
      />
    </div>
  );
}

export function hoverRow(e: React.MouseEvent<HTMLTableRowElement>, enter: boolean) {
  e.currentTarget.style.background = enter ? C.hoverRow : '';
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  width?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ open, onClose, title, width = 520, children, footer }: ModalProps) {
  if (!open) return null;
  return (
    <div
      className="ui-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.46)',
        backdropFilter: 'blur(14px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(14px) saturate(1.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 18,
      }}
    >
      <div
        className="ui-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(24px) saturate(1.35)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.35)',
          borderRadius: C.radiusXl,
          width,
          maxWidth: '100%',
          padding: 28,
          boxShadow: '0 1px 1px rgba(15,23,42,0.06), 0 34px 90px rgba(15, 23, 42, 0.28)',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: `1px solid ${C.border}`,
        }}
      >
        {title && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 750, color: C.heading }}>{title}</div>
            <button
              className="ui-icon-button"
              onClick={onClose}
              aria-label="Close"
              style={{ width: 30, height: 30, borderRadius: 999, background: C.surfaceSoft, border: `1px solid ${C.border}`, color: C.secondary, cursor: 'pointer' }}
            >
              x
            </button>
          </div>
        )}
        {children}
        {footer && <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end', flexWrap: 'wrap' }}>{footer}</div>}
      </div>
    </div>
  );
}

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  width?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Drawer({ open, onClose, title, width = 480, children, footer }: DrawerProps) {
  if (!open) return null;
  return (
    <div
      className="ui-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.42)',
        backdropFilter: 'blur(14px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(14px) saturate(1.2)',
        display: 'flex',
        justifyContent: 'flex-end',
        zIndex: 100,
      }}
    >
      <div
        className="ui-drawer"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(24px) saturate(1.35)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.35)',
          width,
          maxWidth: 'calc(100% - 24px)',
          height: 'calc(100% - 24px)',
          margin: 12,
          borderRadius: C.radiusXl,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 1px 1px rgba(15,23,42,0.06), 0 34px 80px rgba(15, 23, 42, 0.24)',
          border: `1px solid ${C.border}`,
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px 22px', borderBottom: `1px solid ${C.rowBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 750, color: C.heading }}>{title}</span>
          <button
            className="ui-icon-button"
            onClick={onClose}
            aria-label="Close"
            style={{ width: 30, height: 30, borderRadius: 999, background: C.surfaceSoft, border: `1px solid ${C.border}`, color: C.secondary, cursor: 'pointer' }}
          >
            x
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 22 }}>{children}</div>
        {footer && (
          <div style={{ padding: '16px 22px', borderTop: `1px solid ${C.rowBorder}`, display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

interface TabItem {
  key: string;
  label: string;
}

interface TabsProps {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  style?: React.CSSProperties;
}

export function Tabs({ items, activeKey, onChange, style }: TabsProps) {
  return (
    <div style={{ display: 'inline-flex', gap: 4, padding: 4, background: C.surfaceSoft, borderRadius: C.radiusMd, border: `1px solid ${C.border}`, boxShadow: C.shadowInset, ...style }}>
      {items.map((item) => (
        <button
          key={item.key}
          className="ui-tab"
          onClick={() => onChange(item.key)}
          style={{
            padding: '7px 14px',
            border: 'none',
            borderRadius: C.radiusSm,
            fontSize: 12,
            fontWeight: 650,
            background: activeKey === item.key ? C.white : 'transparent',
            color: activeKey === item.key ? C.heading : C.secondary,
            cursor: 'pointer',
            boxShadow: activeKey === item.key ? '0 1px 4px rgba(15, 23, 42, 0.1)' : 'none',
            transform: activeKey === item.key ? 'scale(1)' : 'scale(0.98)',
            transition: `background 0.22s ${C.spring}, color 0.18s ${C.ease}, box-shadow 0.22s ${C.ease}, transform 0.22s ${C.spring}`,
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function PageHeader({ title, subtitle, right }: PageHeaderProps) {
  return (
    <div
      className="ui-page-header"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 20,
        marginBottom: 22,
        padding: '20px 22px',
        borderRadius: C.radiusXl,
        border: `1px solid ${C.border}`,
        background: C.surface,
        boxShadow: C.shadowSoft,
        backdropFilter: 'blur(18px) saturate(1.25)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.25)',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: C.heading, marginBottom: 4, lineHeight: 1.15 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 13, color: C.secondary, lineHeight: 1.45 }}>{subtitle}</p>}
      </div>
      {right && <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>{right}</div>}
    </div>
  );
}

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function Surface({ children, style, className, ...rest }: SurfaceProps) {
  return (
    <div
      className={`ui-card ui-surface${className ? ` ${className}` : ''}`}
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: C.radiusXl,
        boxShadow: C.shadowSoft,
        overflow: 'hidden',
        backdropFilter: 'blur(18px) saturate(1.24)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.24)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export function FilterBar({ children, style }: SurfaceProps) {
  return (
    <div
      className="ui-filter-bar"
      style={{
        display: 'flex',
        gap: 10,
        marginBottom: 18,
        flexWrap: 'wrap',
        alignItems: 'center',
        padding: 12,
        border: `1px solid ${C.border}`,
        borderRadius: C.radiusLg,
        background: C.surface,
        boxShadow: C.shadowSoft,
        backdropFilter: 'blur(18px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.2)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

interface PopconfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  confirmText?: string;
  cancelText?: string;
}

export function Popconfirm({ open, onClose, onConfirm, title, confirmText = 'Да', cancelText = 'Отмена' }: PopconfirmProps) {
  if (!open) return null;
  return (
    <div
      className="ui-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.24)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 18,
      }}
    >
      <div
        className="ui-modal"
        onClick={(e) => e.stopPropagation()}
      style={{ background: 'rgba(255, 255, 255, 0.92)', backdropFilter: 'blur(24px) saturate(1.3)', WebkitBackdropFilter: 'blur(24px) saturate(1.3)', borderRadius: C.radiusXl, padding: '22px 24px', boxShadow: C.shadow, maxWidth: 380, border: `1px solid ${C.border}` }}
      >
        <div style={{ fontSize: 14, fontWeight: 650, color: C.heading, marginBottom: 18, lineHeight: 1.45 }}>{title}</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Btn variant="secondary" onClick={onClose}>{cancelText}</Btn>
          <Btn variant="primary" onClick={onConfirm}>{confirmText}</Btn>
        </div>
      </div>
    </div>
  );
}

export function Spinner({ size = 32 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 42 }}>
      <div
        style={{
          width: size,
          height: size,
          border: `3px solid ${C.rowBorder}`,
          borderTopColor: C.accent,
          borderRadius: '50%',
          animation: 'spin 0.72s linear infinite',
        }}
      />
    </div>
  );
}

export function EmptyState({ text = 'Нет данных' }: { text?: string }) {
  return (
    <div className="ui-empty-state" style={{ textAlign: 'center', padding: '42px 20px', color: C.muted, fontSize: 13 }}>
      {text}
    </div>
  );
}
