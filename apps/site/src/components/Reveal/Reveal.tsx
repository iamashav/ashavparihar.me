import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) return <div className={cn(className)}>{children}</div>;

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
}
