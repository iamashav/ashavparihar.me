import { useLayoutEffect, useRef } from 'react';
import { gsap, SplitText } from '../../lib/gsap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { Layer } from '../Layer/Layer';
import { SiteHeader } from '../SiteHeader/SiteHeader';

interface HeroLayerProps {
  onBuilt: () => void;
}

/* How much of the layer's height the mark fills while it is centre stage. */
const MARK_STAGE_HEIGHT = 0.34;

export function HeroLayer({ onBuilt }: HeroLayerProps) {
  const reducedMotion = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const asideRef = useRef<HTMLDivElement>(null);

  /* Layout effect, not a passive one: the opening states have to be written before the browser
     paints, or the finished hero flashes for a frame and then hides itself to animate in. */
  useLayoutEffect(() => {
    const root = rootRef.current;
    const name = nameRef.current;
    const aside = asideRef.current;

    if (reducedMotion || !root || !name || !aside) {
      onBuilt();
      return;
    }

    const mark = root.querySelector('[data-mark]');
    const nav = root.querySelector('[data-nav]');
    const rules = root.querySelectorAll('[data-rule]');
    if (!(mark instanceof HTMLElement) || !(nav instanceof HTMLElement)) {
      onBuilt();
      return;
    }

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      onBuilt();
    };

    const context = gsap.context(() => {
      /* The mark flies from centre stage to its masthead slot, so the opening and the resting
         position are the same element — measured here rather than guessed, because both depend on
         the viewport. */
      const markRect = mark.getBoundingClientRect();
      const stage = root.getBoundingClientRect();
      const scale = markRect.height
        ? (stage.height * MARK_STAGE_HEIGHT) / markRect.height
        : 1;
      const dx = stage.left + stage.width / 2 - (markRect.left + markRect.width / 2);
      const dy = stage.top + stage.height / 2 - (markRect.top + markRect.height / 2);

      /* Dashed by its own length so the strokes can be walked on. Set here rather than relying on
         the Logo's own hover setup, which runs in a passive effect and so lands after this. */
      const strokes = Array.from(mark.querySelectorAll('path')).filter(
        (stroke) => typeof stroke.getTotalLength === 'function',
      );
      strokes.forEach((stroke) => {
        const length = stroke.getTotalLength();
        gsap.set(stroke, { strokeDasharray: length, strokeDashoffset: length });
      });

      gsap.set(mark, { x: dx, y: dy, scale, transformOrigin: 'center center' });
      gsap.set(nav, { opacity: 0 });
      gsap.set(rules, { scaleX: 0, transformOrigin: 'left center' });

      const split = new SplitText(name, { type: 'chars', mask: 'chars' });
      gsap.set(split.chars, { yPercent: 115 });
      gsap.set(aside.children, { opacity: 0 });

      gsap
        .timeline({ onComplete: finish })
        /* The mark writes itself at full size — A first, then P. */
        .to(strokes, {
          strokeDashoffset: 0,
          duration: 0.9,
          ease: 'power2.inOut',
          stagger: 0.14,
        })
        /* Then it shrinks into the masthead. */
        .to(mark, { x: 0, y: 0, scale: 1, duration: 1.3, ease: 'expo.inOut' }, '+=0.25')
        /* Rules trail out of the flight rather than drawing on their own clock, which is what
           makes it read as the mark laying the layout down as it travels. */
        .to(rules, { scaleX: 1, duration: 1.1, ease: 'expo.out', stagger: 0.12 }, '<0.25')
        .to(nav, { opacity: 1, duration: 0.5, ease: 'power2.out' }, '<0.45')
        /* The name rises out of the baseline rule the mark just drew. */
        .to(
          split.chars,
          { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.028 },
          '-=0.55',
        )
        .to(aside.children, { opacity: 1, duration: 0.6, stagger: 0.08 }, '-=0.45');
    }, root);

    /* Everything above starts hidden, so a stalled ticker would leave an empty hero and scroll
       locked. Release regardless. */
    const failsafe = window.setTimeout(finish, 5000);

    return () => {
      window.clearTimeout(failsafe);
      context.revert();
    };
  }, [reducedMotion, onBuilt]);

  return (
    <Layer id="top" runway="h-[115vh]" depth="z-40" tone="bg-flood text-ink">
      <div ref={rootRef} className="flex h-full flex-col stage-pad pb-[var(--stage-gutter)]">
        <SiteHeader />
        <span data-rule className="block h-px w-full bg-ink" />

        {/* The line break leaves no space in textContent, so the name would be announced as one
            run-on word; the label also survives SplitText rewriting the markup underneath. */}
        <h1
          ref={nameRef}
          aria-label="Ashav Parihar"
          className="mt-10 text-[clamp(3.5rem,18.5vw,20rem)] tracking-[-0.01em]"
        >
          Ashav
          <br />
          Parihar
        </h1>

        <div className="mt-auto">
          <span data-rule className="block h-px w-full bg-ink" />
          <div
            ref={asideRef}
            className="flex flex-col gap-8 pt-6 md:flex-row md:items-end md:justify-between"
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
      </div>
    </Layer>
  );
}
