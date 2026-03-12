import React from 'react';

/* ═══ Design tokens ═══ */
export const C = {
  bg: '#F7F8FA',
  white: '#FFFFFF',
  accent: '#1A56CC',
  accentLight: '#EEF4FF',
  heading: '#101828',
  text: '#344054',
  secondary: '#667085',
  muted: '#98A2B3',
  border: '#EAECF0',
  rowBorder: '#F2F4F7',
  inputBorder: '#D0D5DD',
  hoverRow: '#FAFBFC',
  thBg: '#FAFBFC',
  danger: '#C62828',
  dangerBg: '#FEECEC',
  success: '#2E7D32',
  successBg: '#EEF6EE',
  warning: '#E65100',
  warningBg: '#FFF3E0',
  infoBg: '#E8F0FE',
  tagBg: '#F2F4F7',
};

/* ═══ Status badge ═══ */
const statusColors: Record<string, { bg: string; color: string }> = {
  'В эксплуатации': { bg: '#EEF6EE', color: '#2E7D32' },
  'На ремонте': { bg: '#FFF3E0', color: '#E65100' },
  'Списано': { bg: '#FAFAFA', color: '#9E9E9E' },
  'Активна': { bg: '#EEF6EE', color: '#2E7D32' },
  'Активен': { bg: '#EEF6EE', color: '#2E7D32' },
  'Неактивен': { bg: '#FAFAFA', color: '#9E9E9E' },
  'Истекает': { bg: '#FFF3E0', color: '#E65100' },
  'На согласовании': { bg: '#E8F0FE', color: '#1A56CC' },
  'Одобрена': { bg: '#E8F5E9', color: '#2E7D32' },
  'Выдано': { bg: '#F3F3F3', color: '#616161' },
  'Отклонена': { bg: '#FEECEC', color: '#C62828' },
  'Черновик': { bg: '#F5F5F5', color: '#555' },
  'Исполнена': { bg: '#EEF6EE', color: '#2E7D32' },
  'Отменена': { bg: '#FAFAFA', color: '#9E9E9E' },
  'Действует': { bg: '#EEF6EE', color: '#2E7D32' },
  'Истёк': { bg: '#FEECEC', color: '#C62828' },
  DRAFT: { bg: '#F5F5F5', color: '#555' },
  PENDING_SUPERVISOR: { bg: '#E8F0FE', color: '#1A56CC' },
  APPROVED_SUPERVISOR: { bg: '#E8F0FE', color: '#1A56CC' },
  APPROVED_MOL: { bg: '#E8F0FE', color: '#1A56CC' },
  APPROVED_AHS_HEAD: { bg: '#E8F0FE', color: '#1A56CC' },
  APPROVED: { bg: '#E8F5E9', color: '#2E7D32' },
  EXECUTED: { bg: '#EEF6EE', color: '#2E7D32' },
  REJECTED: { bg: '#FEECEC', color: '#C62828' },
  CANCELLED: { bg: '#FAFAFA', color: '#9E9E9E' },
  ADMIN: { bg: '#FEECEC', color: '#C62828' },
  AHS_WORKER: { bg: '#E8F0FE', color: '#1A56CC' },
  AHS_HEAD: { bg: '#F3E8FF', color: '#7C3AED' },
  MOL_WAREHOUSE: { bg: '#EEF6EE', color: '#2E7D32' },
  MOL_NMA: { bg: '#E0F7FA', color: '#00838F' },
  FO_HEAD: { bg: '#FFF3E0', color: '#E65100' },
  DEPT_HEAD: { bg: '#E8F0FE', color: '#1A56CC' },
  USER: { bg: '#F5F5F5', color: '#555' },
  COMMISSION_MEMBER: { bg: '#FFFBEB', color: '#92400E' },
  IRD_WORKER: { bg: '#FCE4EC', color: '#AD1457' },
};

interface BadgeProps {
  status: string;
  style?: React.CSSProperties;
}

export function Badge({ status, style }: BadgeProps) {
  const s = statusColors[status] || { bg: '#F5F5F5', color: '#555' };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '3px 10px', borderRadius: 4,
      fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
      display: 'inline-block',
      ...style,
    }}>{status}</span>
  );
}

/* ═══ Table header cell ═══ */
interface ThProps {
  children?: React.ReactNode;
  right?: boolean;
  style?: React.CSSProperties;
}

export function Th({ children, right, style }: ThProps) {
  return (
    <th style={{
      padding: '10px 14px', textAlign: right ? 'right' : 'left',
      fontWeight: 500, fontSize: 12, color: '#8A93A2',
      borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap',
      background: C.thBg,
      ...style,
    }}>{children}</th>
  );
}

/* ═══ Table data cell ═══ */
interface TdProps {
  children?: React.ReactNode;
  right?: boolean;
  muted?: boolean;
  bold?: boolean;
  style?: React.CSSProperties;
}

export function Td({ children, right, muted, bold, style }: TdProps) {
  return (
    <td style={{
      padding: '13px 14px', textAlign: right ? 'right' : 'left',
      fontSize: 13, color: muted ? '#9AA3B0' : bold ? C.heading : C.text,
      borderBottom: `1px solid ${C.rowBorder}`, whiteSpace: 'nowrap',
      ...style,
    }}>{children}</td>
  );
}

/* ═══ Stat card ═══ */
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

export function StatCard({ label, value, sub, color }: StatCardProps) {
  return (
    <div style={{
      background: '#fff', borderRadius: 10,
      border: `1px solid ${C.border}`,
      padding: '20px 24px',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ fontSize: 13, color: C.secondary }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: color || C.heading, lineHeight: 1.2 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.muted }}>{sub}</div>}
    </div>
  );
}

/* ═══ Panel / Card wrapper ═══ */
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
    <div style={{
      background: '#fff',
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      overflow: 'hidden',
      ...style,
    }}>
      {title && (
        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${C.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <span style={{ fontWeight: 600, fontSize: 14, color: C.heading }}>{title}</span>
            {subtitle && <div style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{subtitle}</div>}
          </div>
          {titleRight}
        </div>
      )}
      <div style={{ padding: noPad ? 0 : 20 }}>{children}</div>
    </div>
  );
}

/* ═══ Primary button ═══ */
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
}

export function Btn({ variant = 'primary', loading, children, style, disabled, ...rest }: BtnProps) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: C.accent, color: '#fff', border: 'none' },
    secondary: { background: C.rowBorder, color: C.text, border: 'none' },
    danger: { background: C.dangerBg, color: C.danger, border: 'none' },
    ghost: { background: 'transparent', color: C.secondary, border: `1px solid ${C.inputBorder}` },
  };
  return (
    <button
      disabled={disabled || loading}
      style={{
        borderRadius: 6, padding: '9px 18px', fontSize: 13, fontWeight: 500,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        transition: 'opacity 0.15s',
        ...styles[variant],
        ...style,
      }}
      {...rest}
    >{loading ? 'Загрузка...' : children}</button>
  );
}

/* ═══ Text input ═══ */
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, style, ...rest }, ref) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 500, color: C.heading }}>{label}</label>}
      <input
        ref={ref}
        style={{
          padding: '8px 14px',
          border: `1px solid ${error ? C.danger : C.inputBorder}`,
          borderRadius: 6, fontSize: 13, color: C.heading,
          outline: 'none', width: '100%',
          ...style,
        }}
        {...rest}
      />
      {error && <span style={{ fontSize: 11, color: C.danger }}>{error}</span>}
    </div>
  )
);

/* ═══ Select field ═══ */
interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string | number; label: string }[];
}

export function SelectField({ label, options, style, ...rest }: SelectFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 500, color: C.heading }}>{label}</label>}
      <select style={{
        padding: '8px 12px',
        border: `1px solid ${C.inputBorder}`,
        borderRadius: 6, fontSize: 13, color: C.secondary,
        background: '#fff', cursor: 'pointer', outline: 'none',
        ...style,
      }} {...rest}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

/* ═══ Textarea ═══ */
interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function TextAreaField({ label, style, ...rest }: TextAreaFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 500, color: C.heading }}>{label}</label>}
      <textarea style={{
        padding: '8px 14px',
        border: `1px solid ${C.inputBorder}`,
        borderRadius: 6, fontSize: 13, color: C.heading,
        outline: 'none', resize: 'vertical', minHeight: 80,
        ...style,
      }} {...rest} />
    </div>
  );
}

/* ═══ Hoverable table row ═══ */
export function hoverRow(e: React.MouseEvent<HTMLTableRowElement>, enter: boolean) {
  e.currentTarget.style.background = enter ? C.hoverRow : '';
}

/* ═══ Modal / Overlay ═══ */
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
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(16,24,40,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 12, width,
          padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        {title && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 20,
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.heading }}>{title}</div>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', fontSize: 18,
                color: C.muted, cursor: 'pointer', padding: 4,
              }}
            >✕</button>
          </div>
        )}
        {children}
        {footer && <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>{footer}</div>}
      </div>
    </div>
  );
}

/* ═══ Drawer (slide from right) ═══ */
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
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(16,24,40,0.3)',
        display: 'flex', justifyContent: 'flex-end', zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', width, height: '100%',
          display: 'flex', flexDirection: 'column',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
        }}
      >
        <div style={{
          padding: '16px 24px',
          borderBottom: `1px solid ${C.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: C.heading }}>{title}</span>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', fontSize: 18,
              color: C.muted, cursor: 'pointer', padding: 4,
            }}
          >✕</button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {children}
        </div>
        {footer && (
          <div style={{
            padding: '16px 24px',
            borderTop: `1px solid ${C.border}`,
            display: 'flex', gap: 10, justifyContent: 'flex-end',
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══ Tabs ═══ */
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
    <div style={{ display: 'flex', gap: 6, ...style }}>
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => onChange(item.key)}
          style={{
            padding: '6px 14px',
            border: `1px solid ${C.inputBorder}`,
            borderRadius: 6, fontSize: 12,
            background: activeKey === item.key ? C.accent : '#fff',
            color: activeKey === item.key ? '#fff' : C.secondary,
            cursor: 'pointer',
          }}
        >{item.label}</button>
      ))}
    </div>
  );
}

/* ═══ Page header helper ═══ */
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function PageHeader({ title, subtitle, right }: PageHeaderProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: C.heading, marginBottom: 2 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 13, color: C.secondary }}>{subtitle}</p>}
      </div>
      {right && <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>{right}</div>}
    </div>
  );
}

/* ═══ Popconfirm ═══ */
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
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(16,24,40,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 10, padding: '24px 28px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)', maxWidth: 380,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 500, color: C.heading, marginBottom: 16 }}>{title}</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Btn variant="secondary" onClick={onClose}>{cancelText}</Btn>
          <Btn variant="primary" onClick={onConfirm}>{confirmText}</Btn>
        </div>
      </div>
    </div>
  );
}

/* ═══ Spinner ═══ */
export function Spinner({ size = 32 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
      <div style={{
        width: size, height: size,
        border: `3px solid ${C.rowBorder}`,
        borderTopColor: C.accent,
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ═══ Empty state ═══ */
export function EmptyState({ text = 'Нет данных' }: { text?: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: C.muted, fontSize: 13 }}>
      {text}
    </div>
  );
}
