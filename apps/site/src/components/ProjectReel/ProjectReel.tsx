import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';
import { cn } from '../../lib/cn';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { projects, type Project } from '../../data/projects';
import { Layer } from '../Layer/Layer';

const EXTERNAL = { target: '_blank', rel: 'noopener noreferrer' };

/* Every card hangs from the SAME top edge — the stagger comes from the images having different
   heights, which drops each caption to a different line. Varying the top margin instead reads as
   noise. Portrait ratios and near-touching gaps are the rest of it. */
/* Heights are the binding constraint: header + tallest image + caption has to stay inside one
   viewport, or the caption falls out through the layer's overflow. */
const SHAPES = [
  { width: 'w-[66vw] md:w-[44svh]', height: 'h-[99vw] md:h-[66svh]' },
  { width: 'w-[45vw] md:w-[30svh]', height: 'h-[68vw] md:h-[45svh]' },
  { width: 'w-[62vw] md:w-[43svh]', height: 'h-[83vw] md:h-[57svh]' },
  { width: 'w-[36vw] md:w-[22svh]', height: 'h-[54vw] md:h-[34svh]' },
];

const shapeFor = (index: number) => SHAPES[index % SHAPES.length];

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const shape = shapeFor(index);

  return (
    <article className={cn('shrink-0', shape.width)}>
      <a href={project.live} {...EXTERNAL} className="block">
        <img
          src={project.image.src768}
          srcSet={`${project.image.src320} 320w, ${project.image.src768} 768w, ${project.image.src1280} 1280w`}
          sizes="(max-width: 768px) 72vw, 38vw"
          alt={project.image.alt}
          loading="lazy"
          className={cn('w-full object-cover object-top', shape.height)}
        />
      </a>

      <span className="label mt-5 block text-bone/45">{project.tech.slice(0, 3).join(' · ')}</span>

      <h3 className="mt-3 text-[clamp(1.5rem,2.4vw,2.25rem)]">{project.title}</h3>

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

      gsap.fromTo(
        track,
        { x: centredOffset },
        {
          x: () => -(track.scrollWidth - window.innerWidth),
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
      <section id="projects" className="relative z-60 bg-ink stage-pad py-28 text-bone">
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
      runway="h-[160vh]"
      depth="z-60"
      tone="bg-ink text-bone"
      sectionRef={sectionRef}
    >
      <div className="flex h-full flex-col pt-24">
        <div className="stage-pad">
          <h2 className="section-label">Projects</h2>
        </div>

        {/* In flow under the header rather than absolutely placed, so the two cannot overlap. */}
        <div
          ref={trackRef}
          className="mt-7 flex flex-1 items-start gap-[1.2vw] pr-[26vw] pl-[var(--stage-gutter)]"
        >
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </Layer>
  );
}
