import { useEffect, useRef } from 'react';
import { gsap, SplitText } from '../../lib/gsap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { Layer } from '../Layer/Layer';
import { SiteHeader } from '../SiteHeader/SiteHeader';

interface HeroLayerProps {
  ready: boolean;
}

export function HeroLayer({ ready }: HeroLayerProps) {
  const reducedMotion = usePrefersReducedMotion();
  const nameRef = useRef<HTMLHeadingElement>(null);
  const asideRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  /* Built paused at mount, not when the intro clears. `from` applies its start values as soon as
     the tween exists, so the name is hidden from the first painted frame — otherwise the intro
     slides away revealing finished text, which then snaps back to hidden and replays. */
  useEffect(() => {
    const name = nameRef.current;
    const aside = asideRef.current;
    if (reducedMotion || !name || !aside) return;

    const context = gsap.context(() => {
      const split = new SplitText(name, { type: 'chars', mask: 'chars' });

      timelineRef.current = gsap
        .timeline({ paused: true })
        .from(split.chars, {
          yPercent: 115,
          duration: 1.1,
          ease: 'expo.out',
          stagger: 0.028,
        })
        .from(aside.children, { opacity: 0, duration: 0.6, stagger: 0.08 }, '-=0.5');
    });

    return () => {
      timelineRef.current = null;
      context.revert();
    };
  }, [reducedMotion]);

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!ready || !timeline) return;

    timeline.play();

    /* The content is hidden until this plays, so a stalled ticker would leave the hero blank.
       Timed from playback rather than mount, or it would cut the reveal short. */
    const failsafe = window.setTimeout(() => {
      if (timeline.progress() < 1) timeline.progress(1);
    }, 2500);

    return () => window.clearTimeout(failsafe);
  }, [ready]);

  return (
    <Layer id="top" runway="h-[115vh]" depth="z-40" tone="bg-flood text-ink">
      <div className="flex h-full flex-col stage-pad pb-[var(--stage-gutter)]">
        <SiteHeader />

        {/* The line break leaves no space in textContent, so the name would be announced as one
            run-on word; the label also survives SplitText rewriting the markup underneath. */}
        <h1
          ref={nameRef}
          aria-label="Ashav Parihar"
          className="mt-12 text-[clamp(3.5rem,18.5vw,20rem)] tracking-[-0.01em]"
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
            I build production React and TypeScript interfaces, the services behind them, and the
            AI tooling that increasingly handles the repetitive work.
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
