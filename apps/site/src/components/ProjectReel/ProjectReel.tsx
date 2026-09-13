import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';
import { cn } from '../../lib/cn';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { projects, type Project } from '../../data/projects';
import { Layer } from '../Layer/Layer';

const EXTERNAL = { target: '_blank', rel: 'noopener noreferrer' };

/* Every card hangs from the SAME top edge, so each image's height drops its caption to a different
   line. Varying the top margin instead reads as noise. */
/* Heights are the binding constraint: header + tallest image + caption has to stay inside one
   viewport, or the caption falls out through the layer's overflow. The image scales with the
   viewport but the caption is fixed text, so each height is capped at what is left once 20rem is
   reserved for the header and caption. The cap is scaled by the card's own size too — an unscaled
   cap brings every card down to the same height on a short laptop and the sizes stop reading. */
const SHAPES = [
  {
    width: 'w-[74vw] md:w-[44svh]',
    height: 'h-[min(111vw,calc(100svh_-_20rem))] md:h-[min(66svh,calc(100svh_-_20rem))]',
  },
  {
    width: 'w-[56vw] md:w-[33svh]',
    height:
      'h-[min(83vw,calc((100svh_-_20rem)*0.75))] md:h-[min(50svh,calc((100svh_-_20rem)*0.75))]',
  },
  {
    width: 'w-[63vw] md:w-[37svh]',
    height:
      'h-[min(94vw,calc((100svh_-_20rem)*0.85))] md:h-[min(56svh,calc((100svh_-_20rem)*0.85))]',
  },
  {
    width: 'w-[42vw] md:w-[22svh]',
    height:
      'h-[min(62vw,calc((100svh_-_20rem)*0.56))] md:h-[min(34svh,calc((100svh_-_20rem)*0.52))]',
  },
];

const shapeFor = (index: number) => SHAPES[index % SHAPES.length];

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const shape = shapeFor(index);

  return (
    <article className={cn('shrink-0', shape.width)}>
      <a href={project.live} {...EXTERNAL} className="block">
        {/* A hairline, because a screenshot of a dark app has no edge of its own here — one built on
            these same tokens has a background of exactly the section colour. Inset so it sits on the
            image rather than growing the card. */}
        <img
          src={project.image.src}
          alt={project.image.alt}
          loading="lazy"
          className={cn(
            'w-full object-cover object-top outline -outline-offset-1 outline-bone/15',
            shape.height,
          )}
        />
      </a>

      <span className="label mt-5 block leading-[1.6] text-bone/45">{project.tech.slice(0, 3).join(' · ')}</span>

      <h3 className="mt-3 text-[clamp(1.5rem,2.4vw,2.25rem)]">{project.title}</h3>

      <p className="mt-3 text-[0.9375rem] leading-[1.45] text-bone/70">{project.description}</p>

      <div className="mt-4 flex gap-5">
        <a href={project.live} {...EXTERNAL} className="label link-wipe hover:text-flood">
          Live ↗
        </a>
        <a href={project.github} {...EXTERNAL} className="label link-wipe hover:text-flood">
          Code ↗
        </a>
      </div>
    </article>
  );
}

export function ProjectReel() {
  const reducedMotion = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (reducedMotion || !section || !track) return;

    const context = gsap.context(() => {
      /* The reel opens with the first card centred and settles it into its normal left position
         before carrying on, so the entry is a move rather than a jump. Function-based values plus
         invalidateOnRefresh keep both ends remeasured on resize instead of baked in at mount. */
      const centredOffset = () => {
        const first = track.firstElementChild;
        if (!(first instanceof HTMLElement)) return 0;
        const padLeft = parseFloat(getComputedStyle(track).paddingLeft);
        return Math.max(0, (window.innerWidth - first.offsetWidth) / 2 - padLeft);
      };

      /* Measured from the last card rather than from scrollWidth, which omits a flex container's
         right padding when its content overflows — the reel stopped that much short and left the
         last card flush against the edge. This lands it one gutter inside instead. */
      const endOffset = () => {
        const last = track.lastElementChild;
        if (!(last instanceof HTMLElement)) return 0;
        const gutter = parseFloat(getComputedStyle(track).paddingLeft);
        return Math.min(0, window.innerWidth - gutter - (last.offsetLeft + last.offsetWidth));
      };

      gsap.fromTo(
        track,
        { x: centredOffset },
        {
          x: endOffset,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        },
      );
    }, section);

    return () => context.revert();
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <section id="projects" className="relative z-60 bg-ink stage-pad py-12 text-bone md:py-24">
        <h2 className="section-label">Projects</h2>
        <div className="mt-16 grid gap-20 md:grid-cols-2">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <Layer
      id="projects"
      runway="h-[160svh]"
      depth="z-60"
      tone="bg-ink text-bone"
      sectionRef={sectionRef}
    >
      <div className="flex h-full flex-col pt-12 md:pt-24">
        <div className="stage-pad">
          <h2 className="section-label">Projects</h2>
        </div>

        {/* In flow under the header rather than absolutely placed, so the two cannot overlap. */}
        <div
          ref={trackRef}
          /* A viewport-relative gap collapses to nothing on a phone — 1.2vw is 23px on a desktop but
             4px at 370, so the cards touch and the next caption crowds the current one. Fixed below
             md, proportional above it.

             Auto margins rather than flex-1: the cards must keep a shared top edge for the stagger
             to work, so the row cannot centre its own items — instead the row sizes to its content
             and floats in the leftover space, which used to pool underneath it. */
          className="my-auto flex items-start gap-8 pl-[var(--stage-gutter)] md:gap-[1.2vw]"
        >
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </Layer>
  );
}
