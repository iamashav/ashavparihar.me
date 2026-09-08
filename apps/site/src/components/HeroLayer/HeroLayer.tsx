import { useLayoutEffect, useRef } from 'react';
import { gsap, SplitText } from '../../lib/gsap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { HeroField } from '../HeroField/HeroField';
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
    const grid = root.querySelector('[data-grid]');
    const object = root.querySelector('[data-object]');
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

    let context: gsap.Context | null = null;
    let timeline: gsap.core.Timeline | null = null;
    let failsafe = 0;

    const build = () => {
      context = gsap.context(() => {
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
      /* The field was the one thing already on screen while everything else built itself. */
      gsap.set(grid, { '--grid-reveal': 0 });
      gsap.set(object, { opacity: 0, scale: 0.6 });

      const split = new SplitText(name, { type: 'chars', mask: 'chars' });
      gsap.set(split.chars, { yPercent: 115 });
      gsap.set(aside.children, { opacity: 0 });

      timeline = gsap
        .timeline({ paused: true, onComplete: finish })
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
        /* The grid opens outward from its centre — the mask radius growing from nothing, so it
           reads as being drawn rather than faded up. */
        .to(grid, { '--grid-reveal': 1, duration: 1.2, ease: 'power2.out' }, '<0.15')
        /* The name rises out of the baseline rule the mark just drew. */
        .to(
          split.chars,
          { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.028 },
          '-=0.55',
        )
        /* Only once there is a field for it to sit on. */
        .to(object, { opacity: 1, scale: 1, duration: 0.9, ease: 'expo.out' }, '-=0.5')
        .to(aside.children, { opacity: 1, duration: 0.6, stagger: 0.08 }, '-=0.4');
      }, root);

    };

    let dropped = false;
    let started = false;

    /* The opening state is written now, whether or not anyone is looking, so a tab opened in the
       background is already holding the first frame of the sequence rather than the last. Only the
       clock waits. */
    build();

    const play = () => {
      if (dropped || !timeline) return;
      timeline.play();
      if (started) return;
      started = true;
      /* Everything starts hidden, so a stalled ticker would leave an empty hero and scroll locked.
         Release regardless — but only once the sequence is actually running, or a tab left in the
         background would unlock itself unseen. */
      failsafe = window.setTimeout(finish, 5000);
    };

    /* A hidden tab gets no animation frames, and lag smoothing is off so GSAP's clock stays in step
       with Lenis. Between them, a sequence left running in the background is handed one enormous
       delta the moment it returns and skips straight to its end — open the site in a background tab
       and the whole thing is over before it is ever seen. So it holds until it is looked at, and
       holds again if it is looked away from mid-flight. */
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') {
        timeline?.pause();
        return;
      }
      /* The first frame after a tab returns still carries the whole time it spent away. Waiting two
         frames lets that one oversized tick pass before the clock is let go. */
      requestAnimationFrame(() => requestAnimationFrame(play));
    };

    if (document.visibilityState === 'visible') play();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      dropped = true;
      document.removeEventListener('visibilitychange', onVisibility);
      window.clearTimeout(failsafe);
      context?.revert();
    };
  }, [reducedMotion, onBuilt]);

  return (
    <Layer id="top" runway="h-[115svh]" depth="z-40" tone="bg-flood text-ink">
      <div ref={rootRef} className="flex h-full flex-col stage-pad pb-[var(--stage-gutter)]">
        <SiteHeader />
        <span data-rule className="block h-px w-full bg-ink" />

        <div className="mt-10 flex flex-1 flex-col items-start gap-6 md:flex-row md:items-center">
          {/* The line break leaves no space in textContent, so the name would be announced as one
              run-on word; the label also survives SplitText rewriting the markup underneath. */}
          <h1
            ref={nameRef}
            aria-label="Ashav Parihar"
            className="shrink-0 text-[clamp(3.5rem,21vw,18rem)] tracking-[-0.01em] md:text-[clamp(3rem,16.5vw,18rem)]"
          >
            Ashav
            <br />
            Parihar
          </h1>

          {/* Beside the name where there is a void to fill, beneath it on a phone where there is
              not. It takes whatever the name leaves rather than a fixed share: at a fixed height the
              column packed to the top and dropped all the slack between the field and the rule. */}
          <div className="min-h-0 w-full flex-1 self-stretch md:w-auto">
            <HeroField />
          </div>
        </div>

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
            {/* The pair measures 318px at its natural size, which overruns a 320px phone and leaves
                two on a 360px one. Splitting the row evenly and trimming the inset lets them shrink
                to fit rather than press against the gutters. */}
            <div className="flex w-full gap-3 md:w-auto">
              <a
                href="#work"
                className="label flex-1 border border-ink bg-ink px-4 py-4 text-center text-flood hover:bg-transparent hover:text-ink md:flex-none md:px-6"
              >
                See the work
              </a>
              <a
                href="#contact"
                className="label flex-1 border border-ink px-4 py-4 text-center hover:bg-ink hover:text-flood md:flex-none md:px-6"
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
