import { useEffect, useRef } from 'react';
import { gsap, SplitText } from '../../lib/gsap';
import { cn } from '../../lib/cn';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { caseStudies } from '../../data/caseStudies';
import { Layer } from '../Layer/Layer';

/* The ground colour flips per case, so every panel carries its own palette rather than
   inheriting the layer's. Alternating means the wipe itself reads as the transition. */
const TONES = [
  { panel: 'bg-flood text-ink', dim: 'text-ink/50', rule: 'border-ink/25' },
  { panel: 'bg-ink text-bone', dim: 'text-bone/45', rule: 'border-bone/20' },
];

const toneFor = (index: number) => TONES[index % TONES.length];

const PANEL_GRID = 'grid gap-y-10 md:grid-cols-[1.15fr_0.85fr] md:gap-x-14';

function Panel({ index, title, summary, tech }: {
  index: number;
  title: string;
  summary: string;
  tech: string[];
}) {
  const tone = toneFor(index);

  return (
    <div className="flex h-full flex-col stage-pad pt-28 pb-[var(--stage-gutter)]">
      <div className={cn('flex items-baseline justify-between border-b pb-5', tone.rule)}>
        <span className="label">Selected work</span>
        <ol className="flex gap-5">
          {caseStudies.map((study, i) => (
            <li key={study.id} className={cn('label', i === index ? 'underline' : tone.dim)}>
              {String(i + 1).padStart(2, '0')}
            </li>
          ))}
        </ol>
      </div>

      <div data-panel-inner className={cn('flex-1 content-center', PANEL_GRID)}>
        <div>
          <h2 data-panel-title className="text-[clamp(2.25rem,6vw,5.75rem)]">
            {title}
          </h2>
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

        timeline.fromTo(
          item,
          { clipPath: 'inset(100% 0px 0px 0px)' },
          { clipPath: 'inset(0% 0px 0px 0px)', duration: 1, ease: 'none' },
          i - 1,
        );

        /* Counter-drift so the incoming case reads as arriving rather than as a flat curtain. */
        timeline.fromTo(
          item.querySelector('[data-panel-inner]'),
          { yPercent: 8 },
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
        {caseStudies.map((study, i) => (
          <article key={study.id} className={cn('min-h-svh', toneFor(i).panel)}>
            <Panel index={i} title={study.title} summary={study.summary} tech={study.tech} />
          </article>
        ))}
      </section>
    );
  }

  return (
    <Layer
      id="work"
      runway="h-[380vh]"
      depth="z-50"
      tone="bg-ink"
      sectionRef={sectionRef}
    >
      <div ref={panelsRef} className="relative h-full">
        {caseStudies.map((study, i) => (
          <article key={study.id} className={cn('absolute inset-0', toneFor(i).panel)}>
            <Panel index={i} title={study.title} summary={study.summary} tech={study.tech} />
          </article>
        ))}
      </div>
    </Layer>
  );
}
