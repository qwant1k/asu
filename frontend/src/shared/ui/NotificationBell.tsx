/* Колокольчик уведомлений: wobble при новом уведомлении,
   пульсирующая точка-индикатор пока есть непрочитанные.
   Чисто презентационный компонент — логика загрузки остаётся у вызывающего. */

import React, { useEffect, useRef } from 'react';
import { BellOutlined } from '@ant-design/icons';
import { useAnimationControls, useReducedMotion } from 'framer-motion';
import { motion } from './animated/animations';
import { C } from './primitives';

interface NotificationBellProps {
  unreadCount: number;
  open: boolean;
  onClick: () => void;
  title?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ unreadCount, open, onClick, title }) => {
  const controls = useAnimationControls();
  const reduced = useReducedMotion();
  const prevCount = useRef(unreadCount);

  useEffect(() => {
    if (unreadCount > prevCount.current && !reduced) {
      /* Одноразовое покачивание при получении нового уведомления */
      controls.start({
        rotate: [0, -15, 15, -8, 8, 0],
        transition: { duration: 0.4, ease: 'easeOut' },
      });
    }
    prevCount.current = unreadCount;
  }, [unreadCount, controls, reduced]);

  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        background: open ? C.accentLight : 'transparent',
        border: `1px solid ${open ? C.accent : C.border}`,
        color: open ? C.accent : C.text,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        transition: 'background 0.12s ease-out, border-color 0.12s ease-out, color 0.12s ease-out',
      }}
    >
      <motion.span animate={controls} style={{ display: 'inline-flex', transformOrigin: '50% 4px' }}>
        <BellOutlined style={{ fontSize: 16 }} />
      </motion.span>

      {unreadCount > 0 && (
        <motion.span
          animate={reduced ? undefined : { scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: -5,
            right: -5,
            minWidth: 17,
            height: 17,
            padding: '0 4px',
            borderRadius: 9,
            background: C.danger,
            color: '#fff',
            border: '2px solid #fff',
            fontSize: 10,
            fontWeight: 600,
            lineHeight: '13px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </motion.span>
      )}
    </button>
  );
};

export default NotificationBell;
