import React from 'react';
import { Drawer as AntDrawer, Modal as AntModal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { AnimatedButton } from './animated/AnimatedButton';
import { C, statusColors } from './tokens';
import { useBreadcrumbPageTitle } from '../navigation/breadcrumbs';

export { C };

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
  PENDING_AHS_APPROVAL: 'На согласовании АХС',
  PENDING_CHANGE_APPROVAL: 'Запрошено изменение',
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
  icon?: React.ReactNode;
}

export function StatCard({ label, value, sub, color, icon }: StatCardProps) {
  const accent = color || C.accent;
  return (
    <div
      className="ui-card ui-stat-card"
      style={{
        background: C.surface,
        borderRadius: C.radiusLg,
        border: `1px solid ${C.border}`,
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        minHeight: 104,
        position: 'relative',
        overflow: 'hidden',
        transition: `transform 0.2s ${C.spring}, box-shadow 0.2s ${C.ease}`,
      }}
    >
      <div style={{
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        width: 3,
        background: accent,
        borderRadius: '0 2px 2px 0',
      }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontSize: 12, color: C.secondary, fontWeight: 650 }}>{label}</div>
        {icon && (
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `${accent}14`,
            color: accent,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, flexShrink: 0,
          }}>
            {icon}
          </div>
        )}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: C.heading, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.3 }}>{sub}</div>}
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
  className?: string;
}

export function Panel({ children, title, subtitle, titleRight, style, noPad, className }: PanelProps) {
  return (
    <div
      className={`ui-card ui-panel${className ? ` ${className}` : ''}`}
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: C.radiusLg,
        overflow: 'hidden',
        ...style,
      }}
    >
      {title && (
        <div
          style={{
            padding: '13px 16px',
            borderBottom: `1px solid ${C.rowBorder}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            background: C.surfaceSoft,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: C.heading }}>{title}</span>
            {subtitle && <div style={{ fontSize: 11, color: C.secondary, marginTop: 2, lineHeight: 1.3 }}>{subtitle}</div>}
          </div>
          {titleRight}
        </div>
      )}
      <div style={{ padding: noPad ? 0 : 16 }}>{children}</div>
    </div>
  );
}

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  success?: boolean;
  onSuccess?: () => void;
}

export function Btn({ variant = 'primary', loading, success, onSuccess, children, className, ...rest }: BtnProps) {
  let status: 'idle' | 'loading' | 'success' = 'idle';
  if (success) status = 'success';
  else if (loading) status = 'loading';
  return (
    <AnimatedButton
      status={status}
      variant={variant}
      onSuccess={onSuccess}
      className={`ui-button ui-button-${variant}${className ? ` ${className}` : ''}`}
      {...rest}
    >
      {children}
    </AnimatedButton>
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
          background: '#FFFFFF',
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

interface SelectFieldProps {
  label?: string;
  options: { value: string | number; label: string }[];
  value?: string | number;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  style?: React.CSSProperties;
  className?: string;
  name?: string;
}

export function SelectField({
  label, options, style, value, onChange, onValueChange, disabled, placeholder, className, name,
}: SelectFieldProps) {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const normalizedValue = event.target.value;
    onValueChange?.(normalizedValue);
    onChange?.(event);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 650, color: C.heading }}>{label}</label>}
      <div className="ui-select-control" style={{ width: '100%', minWidth: 150, ...style }}>
        <select
          value={value === undefined || value === null ? '' : String(value)}
          disabled={disabled}
          name={name}
          aria-label={label || placeholder || name}
          className={`ui-select-field ui-native-select${className ? ` ${className}` : ''}`}
          style={{ width: '100%' }}
          onChange={handleChange}
        >
          {placeholder && !options.some((option) => String(option.value) === '') && (
            <option value="" disabled>{placeholder}</option>
          )}
          {options.map((option) => (
            <option key={String(option.value)} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="ui-select-arrow-overlay" aria-hidden="true">
          <span className="ui-select-chevron" />
        </span>
      </div>
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
          background: '#FFFFFF',
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
  e.currentTarget.style.backgroundColor = enter ? C.hoverRow : '';
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
  return (
    <AntModal
      open={open}
      onCancel={onClose}
      title={title}
      width={width}
      footer={footer}
      centered
    >
      {children}
    </AntModal>
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
  return (
    <AntDrawer
      open={open}
      onClose={onClose}
      title={title}
      width={width}
      footer={footer}
      placement="right"
    >
      {children}
    </AntDrawer>
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
            boxShadow: 'none',
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
  breadcrumb?: { label: string; path?: string }[];
}

export function PageHeader({ title, subtitle, right, breadcrumb }: PageHeaderProps) {
  const navigate = useNavigate();
  useBreadcrumbPageTitle(title);
  return (
    <div
      className="ui-page-header"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        marginBottom: 16,
        padding: '14px 18px',
        borderRadius: C.radiusLg,
        border: `1px solid ${C.border}`,
        background: `linear-gradient(135deg, ${C.surface}, ${C.surfaceSoft})`,
      }}
    >
      <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 4, height: 32, borderRadius: 2, background: `linear-gradient(180deg, ${C.accent}, ${C.accentDark})`, flexShrink: 0 }} />
        <div>
          {breadcrumb && breadcrumb.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontSize: 12, color: C.muted }}>
              {breadcrumb.map((item, idx) => (
                <React.Fragment key={idx}>
                  {item.path ? (
                    <button
                      type="button"
                      className="page-breadcrumb-link"
                      onClick={() => navigate(item.path!)}
                    >
                      {item.label}
                    </button>
                  ) : (
                    <span>{item.label}</span>
                  )}
                  {idx < breadcrumb.length - 1 && <span style={{ opacity: 0.5 }}>/</span>}
                </React.Fragment>
              ))}
            </div>
          )}
          <h2 style={{ fontSize: 20, fontWeight: 800, color: C.heading, marginBottom: 2, lineHeight: 1.15 }}>{title}</h2>
          {subtitle && <p style={{ fontSize: 12, color: C.secondary, lineHeight: 1.4 }}>{subtitle}</p>}
        </div>
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
        borderRadius: C.radiusLg,
        overflow: 'hidden',
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
        marginBottom: 14,
        flexWrap: 'wrap',
        alignItems: 'center',
        padding: 12,
        border: `1px solid ${C.border}`,
        borderRadius: C.radiusLg,
        background: C.surface,
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
  return (
    <AntModal open={open} onCancel={onClose} width={380} centered footer={
      <>
        <Btn variant="secondary" onClick={onClose}>{cancelText}</Btn>
        <Btn variant="primary" onClick={onConfirm}>{confirmText}</Btn>
      </>
    }>
      <div style={{ fontSize: 14, fontWeight: 600, color: C.heading, lineHeight: 1.45 }}>{title}</div>
    </AntModal>
  );
}

export function Spinner({ size = 32 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 32 }}>
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

export function EmptyState({ text = 'Нет данных', icon }: { text?: string; icon?: React.ReactNode }) {
  return (
    <div className="ui-empty-state" style={{ textAlign: 'center', padding: '32px 20px', color: C.muted, fontSize: 13 }}>
      <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.4 }}>{icon || '\u{1F4E6}'}</div>
      {text}
    </div>
  );
}
