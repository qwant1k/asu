/* AnimatedModal — модальное окно, «вырастающее» из элемента-триггера
   через layoutId (Framer Motion shared layout transition).
   Использование: обернуть кнопку-триггер в motion.button с layoutId,
   затем <AnimatedModal triggerLayoutId="..." open={...} onClose={...}>.
   Если layoutId не указан — плавное появление из центра с fade+scale. */

import * as React from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { motion, AnimatePresence, useReducedMotion } from './animations';
import { C } from '../tokens';

interface AnimatedModalProps {
  open: boolean;
  onClose: () => void;
  triggerLayoutId?: string;
  title?: React.ReactNode;
  width?: number | string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export const AnimatedModal: React.FC<AnimatedModalProps> = ({
  open,
  onClose,
  triggerLayoutId,
  title,
  width = 520,
  footer,
  children,
}) => {
  const reduced = useReducedMotion();

  const content = (
    <motion.div
      layoutId={triggerLayoutId}
      initial={reduced || !triggerLayoutId ? { opacity: 0, scale: 0.96, y: 8 } : { opacity: 0 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 4 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      style={{
        background: '#fff',
        borderRadius: C.radiusLg,
        border: `1px solid ${C.border}`,
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
        width,
        maxWidth: 'calc(100vw - 24px)',
        maxHeight: 'calc(100vh - 24px)',
        overflowY: 'auto',
        zIndex: 1001,
      }}
    >
      {title !== undefined && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '16px 20px',
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600, color: C.heading }}>{title}</div>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: `1px solid ${C.border}`,
              background: 'transparent',
              color: C.secondary,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.12s ease-out, color 0.12s ease-out',
            }}
          >
            <CloseOutlined />
          </button>
        </div>
      )}
      <div style={{ padding: 20 }}>{children}</div>
      {footer !== undefined && (
        <div style={{ padding: '0 20px 20px', display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
          {footer}
        </div>
      )}
    </motion.div>
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12,
            zIndex: 1000,
            pointerEvents: 'auto',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.24)' }}
          />
          {content}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedModal;
