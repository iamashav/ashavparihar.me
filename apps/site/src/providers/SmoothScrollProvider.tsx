import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { ReactLenis } from 'lenis/react';
import type { LenisRef } from 'lenis/react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

interface SmoothScrollProviderProps {
  children: ReactNode;
}

/** Breathing room left above a heading once an anchor jump settles. */
const HEADING_INSET = 40;

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const reducedMotion = usePrefersReducedMotion();
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    if (reducedMotion) return;

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;
      if (!(event.target instanceof Element)) return;

      const href = event.target.closest('a[href^="#"]')?.getAttribute('href');
      if (!href || href === '#') return;

      const section = document.querySelector(href);
      const lenis = lenisRef.current?.lenis;
      if (!section || !lenis) return;

      event.preventDefault();

      if (href === '#top') {
        lenis.scrollTo(0);
        return;
      }

      // Sections carry a deep top inset and lay their heading out differently — the footer centres
      // its headline against the QR panel, for one. Aiming at the section top therefore strands the
      // heading anywhere between 130px and 500px down. Aim at the heading itself instead.
      const heading = section.querySelector('h1, h2') ?? section;
      const top = heading.getBoundingClientRect().top + window.scrollY - HEADING_INSET;
      lenis.scrollTo(Math.max(top, 0));
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [reducedMotion]);

  // Lenis hijacks the wheel entirely, so under reduced-motion it is skipped rather than tuned down.
  if (reducedMotion) return children;

  return (
    <ReactLenis ref={lenisRef} root options={{ duration: 1.1, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
