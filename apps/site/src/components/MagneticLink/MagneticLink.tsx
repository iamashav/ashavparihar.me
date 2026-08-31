import type { ReactNode } from 'react';
import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface MagneticLinkProps {
  href: string;
  children: ReactNode;
}

const PULL = 14;

export function MagneticLink({ href, children }: MagneticLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 260, damping: 18, mass: 0.4 });

  const onPointerMove = (event: React.PointerEvent<HTMLAnchorElement>) => {
    if (reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    x.set(Math.max(-PULL, Math.min(PULL, (dx / rect.width) * PULL * 2)));
    y.set(Math.max(-PULL, Math.min(PULL, (dy / rect.height) * PULL * 2)));
  };

  // Any off-site href gets the safe new-tab treatment automatically, so a future external CTA
  // cannot ship without it; in-page anchors must not be given target=_blank.
  const isExternal = /^https?:/.test(href);

  const release = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      style={{ x: springX, y: springY }}
      onPointerMove={onPointerMove}
      onPointerLeave={release}
      onBlur={release}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="label inline-flex items-center justify-center border border-panel-border px-6 py-4 text-center hover:border-phosphor hover:bg-phosphor hover:text-void"
    >
      {children}
    </motion.a>
  );
}
