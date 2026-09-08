import { useEffect, useRef, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

interface ScrollStageProps {
  locked: boolean;
  children: ReactNode;
}

export function ScrollStage({ locked, children }: ScrollStageProps) {
  const reducedMotion = usePrefersReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenisRef.current = lenis;

    const raf = (time: number) => lenis.raf(time * 1000);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(raf);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  /* The intro holds scroll at the top, so letting the browser restore a previous position lands it
     somewhere the layers have not been measured for. Own the starting position instead. */
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('is-scroll-blocked', locked);

    const lenis = lenisRef.current;
    if (lenis) {
      if (locked) lenis.stop();
      else lenis.start();
    }

    /* Triggers measured while the body could not scroll are stale once it can. Without this the
       sticky layers sit against out-of-date bounds until something else forces a recalculation. */
    if (!locked) ScrollTrigger.refresh();

    return () => document.documentElement.classList.remove('is-scroll-blocked');
  }, [locked]);

  return <>{children}</>;
}
