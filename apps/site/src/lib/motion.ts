import type { Variants } from 'framer-motion';

export const VIEWPORT = { once: true, amount: 0.2 } as const;

export const SPRING = { type: 'spring', stiffness: 260, damping: 26, mass: 0.6 } as const;

export const GROUP_VARIANTS: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

export const ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: SPRING },
};
