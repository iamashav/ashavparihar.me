import { useEffect, useRef } from 'react';
import { gsap, SplitText } from '../../lib/gsap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { Layer } from '../Layer/Layer';

interface HeroLayerProps {
  ready: boolean;
}

export function HeroLayer({ ready }: HeroLayerProps) {
  const reducedMotion = usePrefersReducedMotion();
  const nameRef = useRef<HTMLHeadingElement>(null);
  const asideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const name = nameRef.current;
    const aside = asideRef.current;
    if (!ready || reducedMotion || !name || !aside) return;

    const context = gsap.context(() => {
      const split = new SplitText(name, { type: 'chars', mask: 'chars' });

      gsap
        .timeline()
        .from(split.chars, {
          yPercent: 115,
          duration: 1.1,
          ease: 'expo.out',
          stagger: 0.028,
        })
        .from(aside.children, { opacity: 0, duration: 0.6, stagger: 0.08 }, '-=0.5');
    });

    return () => context.revert();
  }, [ready, reducedMotion]);

  return (
    <Layer id="top" runway="h-[190vh]" depth="z-40" tone="bg-flood text-ink">
      <div className="flex h-full flex-col stage-pad pt-24 pb-[var(--stage-gutter)]">
        <span className="label">Frontend / Interfaces & the systems under them</span>

        {/* Anton is condensed enough that a viewport-relative size has to run large before the
            name spans the column; anything smaller leaves the layer reading as empty. */}
        <h1
          ref={nameRef}
          className="mt-5 text-[clamp(3.5rem,21vw,23rem)] leading-[0.78] tracking-[-0.01em]"
        >
          Ashav
          <br />
          Parihar
        </h1>

        <div
          ref={asideRef}
          className="mt-auto flex flex-col gap-8 border-t border-ink pt-6 md:flex-row md:items-end md:justify-between"
        >
          <p className="max-w-[38ch] text-[1.125rem] leading-[1.45]">
            I build production React and TypeScript interfaces, the services behind them, and
            the AI tooling that now does the mechanical half of the work.
          </p>
          <div className="flex gap-3">
            <a
              href="#work"
              className="label border border-ink bg-ink px-6 py-4 text-flood hover:bg-transparent hover:text-ink"
            >
              See the work
            </a>
            <a
              href="#contact"
              className="label border border-ink px-6 py-4 hover:bg-ink hover:text-flood"
            >
              Get in touch
            </a>
          </div>
        </div>
      </div>
    </Layer>
  );
}
