import type { ReactNode } from 'react';
import { ReactLenis } from 'lenis/react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const reducedMotion = usePrefersReducedMotion();

  // Lenis hijacks the wheel entirely, so under reduced-motion it is skipped rather than tuned down.
  if (reducedMotion) return children;

  return (
    <ReactLenis root options={{ duration: 1.1, smoothWheel: true, anchors: true }}>
      {children}
    </ReactLenis>
  );
}
