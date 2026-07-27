/* AnimatedRow — строка таблицы с hover-анимацией и exit-анимацией
   (подсветка danger-оттенком + схлопывание по высоте + fade-out). */

import * as React from 'react';
import { motion, useReducedMotion } from './animations';

interface AnimatedRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  exiting?: boolean;
  onExitComplete?: () => void;
}

export const AnimatedRow: React.FC<AnimatedRowProps> = ({
  exiting = false,
  onExitComplete,
  children,
  className,
  style,
  ...rest
}) => {
  const reduced = useReducedMotion();

  return (
    <motion.tr
      {...(rest as any)}
      initial={false}
      animate={
        exiting
          ? { backgroundColor: 'rgba(196, 69, 61, 0.08)' }
          : { backgroundColor: 'transparent' }
      }
      exit={
        reduced
          ? { opacity: 0, height: 0 }
          : { opacity: 0, height: 0 }
      }
      transition={{ duration: 0.2, opacity: { duration: 0.2 }, height: { duration: 0.2 } }}
      onAnimationComplete={() => {
        if (exiting && onExitComplete) onExitComplete();
      }}
      className={className}
      style={{ ...style }}
    >
      {children}
    </motion.tr>
  );
};

export default AnimatedRow;
