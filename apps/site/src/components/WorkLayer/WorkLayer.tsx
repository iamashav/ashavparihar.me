import { useEffect, useRef } from 'react';
import { gsap, SplitText } from '../../lib/gsap';
import { cn } from '../../lib/cn';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { caseStudies } from '../../data/caseStudies';
import { Layer } from '../Layer/Layer';

/* The ground colour flips per case, so every panel carries its own palette rather than
   inheriting the layer's. Alternating means the wipe itself reads as the transition. */
const TONES = [
  { panel: 'bg-flood text-ink', dim: 'text-ink/50', rule: 'border-ink/25', track: 'bg-ink/20', fill: 'bg-ink' },
  { panel: 'bg-ink text-bone', dim: 'text-bone/45', rule: 'border-bone/20', track: 'bg-bone/20', fill: 'bg-bone' },
];

const toneFor = (index: number) => TONES[index % TONES.length];

const PANEL_GRID = 'grid gap-y-10 md:grid-cols-[1.15fr_0.85fr] md:gap-x-14';

function Panel({ index, title, summary, tech, showProgress }: {
  index: number;
  title: string;
  summary: string;
  tech: string[];
  showProgress: boolean;
}) {
  const tone = toneFor(index);

  return (
    <div
      data-panel-content
      className="flex h-full flex-col stage-pad pt-12 pb-[var(--stage-gutter)] md:pt-24"
    >
      <div className="flex items-center justify-between pb-5">
        {/* Decorative: every panel repeats this so it can flip colour with the ground, and three
            identical headings would be worse for assistive tech than none. The section's real
            heading is rendered once, below. */}
        <span aria-hidden className="section-label">
          Selected work
        </span>
      </div>

      {/* The header rule doubles as the progress track, so the fill sweeps the full viewport width
          instead of a stub too small to read as movement. */}
      {showProgress ? (
        <div className={cn('h-0.5 w-full', tone.track)}>
          {/* No `scale-x-0` here: Tailwind compiles it to the standalone `scale` property, which
              multiplies against GSAP's transform and pins the fill at zero. */}
          <span data-progress-fill className={cn('block h-full w-full origin-left', tone.fill)} />
        </div>
      ) : (
        <div className={cn('h-px w-full', tone.track)} />
      )}

      <div className={cn('flex-1 content-center', PANEL_GRID)}>
        <div>
          <h3 data-panel-title className="text-[clamp(2rem,4.8vw,4.5rem)]">
            {title}
          </h3>
        </div>
        <div className="md:pt-3">
          <p className="max-w-[44ch] text-[clamp(1.125rem,1.55vw,1.5rem)] leading-[1.4]">
            {summary}
          </p>
          <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2">
            {tech.map((item) => (
              <li key={item} className={cn('label', tone.dim)}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function WorkLayer() {
  const reducedMotion = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const panels = panelsRef.current;
    if (reducedMotion || !section || !panels) return;

    const context = gsap.context(() => {
      const items = Array.from(panels.children);

      const firstTitle = items[0]?.querySelector('[data-panel-title]');
      if (firstTitle instanceof HTMLElement) {
        const split = new SplitText(firstTitle, { type: 'lines', mask: 'lines' });
        gsap.from(split.lines, {
          yPercent: 110,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.08,
          scrollTrigger: { trigger: section, start: 'top 80%' },
        });
      }

      gsap.fromTo(
        panels.querySelectorAll('[data-progress-fill]'),
        { scaleX: 0 },
        {
          scaleX: 1,
          /* Set explicitly rather than trusting the `origin-left` class: GSAP writes its own
             transform-origin, and a centred origin makes the fill grow from the middle. */
          transformOrigin: 'left center',
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,
          },
        },
      );

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
        },
      });

      items.forEach((item, i) => {
        if (i === 0) return;

        /* Panel slides up while its content counter-slides down by the same amount, so the content
           looks stationary and only the panel's edge sweeps — a wipe, but on transforms, which the
           compositor can handle. Animating clip-path here repainted three full-screen layers a
           frame and could lock the renderer up entirely. */
        timeline.fromTo(
          item,
          { yPercent: 100 },
          { yPercent: 0, duration: 1, ease: 'none' },
          i - 1,
        );

        timeline.fromTo(
          item.querySelector('[data-panel-content]'),
          { yPercent: -100 },
          { yPercent: 0, duration: 1, ease: 'none' },
          i - 1,
        );
      });
    }, section);

    return () => context.revert();
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <section id="work" className="relative z-50">
        <h2 className="sr-only">Selected work</h2>
        {caseStudies.map((study, i) => (
          <article key={study.id} className={cn('min-h-svh', toneFor(i).panel)}>
            <Panel
              index={i}
              title={study.title}
              summary={study.summary}
              tech={study.tech}
              showProgress={false}
            />
          </article>
        ))}
      </section>
    );
  }

  return (
    <Layer
      id="work"
      runway="h-[380svh]"
      depth="z-50"
      tone="bg-ink"
      sectionRef={sectionRef}
    >
      <h2 className="sr-only">Selected work</h2>
      <div ref={panelsRef} className="relative h-full">
        {caseStudies.map((study, i) => (
          <article key={study.id} className={cn('absolute inset-0 overflow-hidden', toneFor(i).panel)}>
            <Panel
              index={i}
              title={study.title}
              summary={study.summary}
              tech={study.tech}
              showProgress
            />
          </article>
        ))}
      </div>
    </Layer>
  );
}
