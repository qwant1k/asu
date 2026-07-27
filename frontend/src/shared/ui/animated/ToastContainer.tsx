/* ToastContainer — тосты, появляющиеся из правого нижнего угла
   скольжением с прогресс-баром автозакрытия. */

import * as React from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { motion, AnimatePresence, useReducedMotion } from './animations';
import { C } from '../tokens';

export interface ToastItem {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  /** ms, по умолчанию 4000 */
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

const typeColors: Record<string, { bg: string; border: string; bar: string }> = {
  success: { bg: '#EDF7F1', border: '#D1E8D9', bar: C.success },
  error: { bg: '#FBEFEE', border: '#F0D0CD', bar: C.danger },
  warning: { bg: '#FBF4E7', border: '#EDE2CA', bar: C.warning },
  info: { bg: '#E7F2F3', border: '#CDE2E5', bar: C.accent },
};

const Toast: React.FC<{ toast: ToastItem; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const reduced = useReducedMotion();
  const colors = typeColors[toast.type || 'info'];
  const duration = toast.duration ?? 4000;

  React.useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), duration);
    return () => clearTimeout(t);
  }, [toast.id, duration, onRemove]);

  return (
    <motion.div
      initial={reduced ? { opacity: 1 } : { opacity: 0, x: 24, y: 8 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, x: 24, scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: C.radiusMd,
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
        minWidth: 280,
        maxWidth: 360,
        overflow: 'hidden',
        pointerEvents: 'auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px' }}>
        <div style={{ flex: 1, fontSize: 13, color: C.heading, lineHeight: 1.4 }}>{toast.message}</div>
        <button
          onClick={() => onRemove(toast.id)}
          aria-label="Закрыть"
          style={{
            border: 'none',
            background: 'transparent',
            color: C.secondary,
            cursor: 'pointer',
            padding: 0,
            width: 20,
            height: 20,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <CloseOutlined style={{ fontSize: 10 }} />
        </button>
      </div>
      <div style={{ height: 2, background: colors.border, width: '100%' }}>
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          style={{ height: '100%', background: colors.bar }}
        />
      </div>
    </motion.div>
  );
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  const reduced = useReducedMotion();
  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
