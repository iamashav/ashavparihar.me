import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';
import { GROUP_VARIANTS, ITEM_VARIANTS, SPRING, VIEWPORT } from '../../lib/motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/** A single block that fades up on its own when it enters the viewport. */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) return <div className={cn(className)}>{children}</div>;

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ ...SPRING, delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Orchestrates a cascade. The parent holds no visual state of its own — it only sequences the
 * `RevealItem` children beneath it, so the group boundary never fades as one opaque block.
 */
export function RevealGroup({ children, className }: RevealProps) {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) return <div className={cn(className)}>{children}</div>;

  return (
    <motion.div
      className={cn(className)}
      variants={GROUP_VARIANTS}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
    >
      {children}
    </motion.div>
  );
}

/** One step of a `RevealGroup` cascade. Inherits its animation state from the group. */
export function RevealItem({ children, className }: RevealProps) {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) return <div className={cn(className)}>{children}</div>;

  return (
    <motion.div className={cn(className)} variants={ITEM_VARIANTS}>
      {children}
    </motion.div>
  );
}
