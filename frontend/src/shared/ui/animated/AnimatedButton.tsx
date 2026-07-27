/* AnimatedButton — кнопка с loading → success-анимацией.
   Логика действия остаётся у родителя: onClick вызывается родитель,
   родитель управляет status ('idle' | 'loading' | 'success').
   При status='success' кнопка 800ms окрашивается в success-цвет
   и автоматически вызывает onSuccess, если передан. */

import * as React from 'react';
import { LoadingOutlined, CheckOutlined } from '@ant-design/icons';
import { useReducedMotion, motion } from './animations';
import { C } from '../tokens';

export type ButtonStatus = 'idle' | 'loading' | 'success';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  status?: ButtonStatus;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /** Цвет success-анимации (по умолчанию C.success) */
  successColor?: string;
  onSuccess?: () => void;
  successMs?: number;
}

const variants: Record<string, React.CSSProperties> = {
  primary: { background: C.accent, color: '#fff', border: `1px solid ${C.accent}` },
  secondary: { background: C.surfaceSoft, color: C.text, border: `1px solid ${C.border}` },
  danger: { background: C.dangerBg, color: C.danger, border: `1px solid ${C.dangerBg}` },
  ghost: { background: 'transparent', color: C.secondary, border: `1px solid ${C.inputBorder}` },
};

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  status = 'idle',
  variant = 'primary',
  successColor = C.success,
  onSuccess,
  successMs = 800,
  children,
  onClick,
  disabled,
  style,
  ...rest
}) => {
  const reduced = useReducedMotion();
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (status === 'success' && onSuccess) {
      timer.current = setTimeout(onSuccess, successMs);
      return () => {
        if (timer.current) clearTimeout(timer.current);
      };
    }
    return undefined;
  }, [status, onSuccess, successMs]);

  const idle = status === 'idle';
  const success = status === 'success';

  const baseStyle: React.CSSProperties = {
    borderRadius: C.radiusSm,
    padding: '9px 15px',
    minHeight: 36,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: disabled || !idle ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.58 : 1,
    transition: reduced
      ? 'none'
      : 'transform 0.12s ease-out, box-shadow 0.12s ease-out, background-color 0.12s ease-out',
    boxShadow: variant === 'primary' && !success ? '0 2px 6px rgba(14, 124, 134, 0.24)' : 'none',
    ...variants[variant],
    ...(success ? { background: successColor, color: '#fff', borderColor: successColor, boxShadow: 'none' } : {}),
    ...style,
  };

  const iconContent =
    status === 'loading' ? (
      <LoadingOutlined spin />
    ) : status === 'success' ? (
      <motion.span
        initial={reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      >
        <CheckOutlined />
      </motion.span>
    ) : null;

  return (
    <button
      {...rest}
      onClick={!idle ? undefined : onClick}
      disabled={disabled || !idle}
      style={baseStyle}
    >
      {iconContent}
      {children}
    </button>
  );
};

export default AnimatedButton;
