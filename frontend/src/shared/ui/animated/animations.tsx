/* Type-safe re-exports for framer-motion components.
   Framer Motion 11 AnimatePresence reports an incompatible return type with
   React 18 JSX typings; wrapping it via React.createElement with children
   produces a ReactElement while preserving all runtime behaviour. */

import * as React from 'react';
import {
  AnimatePresence as AnimatePresenceRaw,
  type AnimatePresenceProps,
  motion,
} from 'framer-motion';

interface APProps extends AnimatePresenceProps {
  children?: React.ReactNode;
}

export const AnimatePresence: React.FC<APProps> = ({ children, ...props }) =>
  React.createElement(AnimatePresenceRaw as any, props, children) as unknown as React.ReactElement;

export { motion };
export { useReducedMotion, useAnimationControls } from 'framer-motion';
