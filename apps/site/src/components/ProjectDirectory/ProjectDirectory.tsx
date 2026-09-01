import { useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import { ArrowUpRight, CodeXml } from 'lucide-react';
import { projects } from '../../data/projects';
import type { Project } from '../../data/projects';
import { usePointerIsFine } from '../../hooks/usePointerIsFine';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { cn } from '../../lib/cn';
import { Reveal, RevealGroup, RevealItem } from '../Reveal/Reveal';
import { ScrambleText } from '../ScrambleText/ScrambleText';
import { TerminalCursor } from '../TerminalCursor/TerminalCursor';

const fileName = (project: Project) => `${project.id.replace(/-/g, '_')}.exe`;

export function ProjectDirectory() {
  const pointerIsFine = usePointerIsFine();
  const reducedMotion = usePrefersReducedMotion();
  const [preview, setPreview] = useState<Project | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 340, damping: 30, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 340, damping: 30, mass: 0.4 });

  // A cursor-following panel is meaningless without a hovering pointer, and it is pure motion.
  const previewEnabled = pointerIsFine && !reducedMotion;

  const track = (event: React.PointerEvent<HTMLDivElement>) => {
    x.set(event.clientX);
    y.set(event.clientY);
  };

  return (
    <section
      id="projects"
      className="border-b border-panel-border"
      aria-label="Projects"
    >
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-panel-border px-6 py-6 md:px-10">
          <h2 className="label flex items-center gap-2 text-neutral-500">
            <ScrambleText text="~/root/selected_works/" />
            <TerminalCursor />
          </h2>
          <p className="label text-neutral-600">{projects.length} files</p>
        </div>
      </Reveal>

      <RevealGroup className="px-6 md:px-10">
        {projects.map((project) => (
          <RevealItem key={project.id}>
            <div
              className="group relative grid items-center gap-x-6 gap-y-2 border-b border-panel-border py-10 transition-colors hover:bg-panel md:grid-cols-[3rem_minmax(0,1fr)_7rem_minmax(0,15rem)_5rem_5rem]"
              onPointerEnter={(event) => {
                if (!previewEnabled) return;
                // Jump rather than animate: the springs rest at 0,0, so without this the first
                // preview of the session flies in from the top-left corner of the viewport.
                x.jump(event.clientX);
                y.jump(event.clientY);
                springX.jump(event.clientX);
                springY.jump(event.clientY);
                setPreview(project);
              }}
              onPointerMove={previewEnabled ? track : undefined}
              onPointerLeave={() => setPreview(null)}
            >
              <span className="label text-neutral-600">{project.index}</span>

              <h3 className="text-2xl md:text-3xl">
                <a
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  // Stretched link: one real anchor keeps the row keyboard-accessible while the
                  // pseudo-element makes the whole row clickable without nesting anchors.
                  className="transition-colors after:absolute after:inset-0 group-hover:text-phosphor"
                >
                  {project.title}
                </a>
              </h3>

              <span className="label text-neutral-600">{project.role}</span>

              <ul className="flex flex-wrap gap-x-2 gap-y-1">
                {project.tech.map((tech) => (
                  <li key={tech} className="text-micro text-neutral-600">
                    {tech.toLowerCase().replace(/[\s.]/g, '-')}
                  </li>
                ))}
              </ul>

              <span
                className={cn(
                  'label',
                  project.status === 'LIVE' ? 'text-neutral-500' : 'text-neutral-700',
                )}
              >
                {project.status}
              </span>

              <div className="label flex items-center gap-4">
                <span className="inline-flex items-center gap-1 text-neutral-600 group-hover:text-phosphor">
                  Execute
                  <ArrowUpRight className="size-3" aria-hidden="true" />
                </span>
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${project.title} source on GitHub`}
                  className="relative z-10 text-neutral-600 transition-colors hover:text-phosphor"
                >
                  <CodeXml className="size-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>

      {previewEnabled && (
        <AnimatePresence>
          {preview && (
            <motion.div
              className="pointer-events-none fixed top-0 left-0 z-40"
              style={{ x: springX, y: springY }}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              aria-hidden="true"
            >
              <div className="w-[22rem] -translate-y-1/2 translate-x-8 border border-panel-border bg-panel shadow-[0_0_30px_rgba(0,0,0,0.6)]">
                <div className="text-micro flex items-center justify-between border-b border-panel-border px-3 py-2 text-neutral-500">
                  <span>[PREVIEW_WINDOW: {fileName(preview)}]</span>
                  <span className="text-neutral-700">□ ×</span>
                </div>
                <img
                  src={preview.image.src768}
                  srcSet={`${preview.image.src320} 320w, ${preview.image.src768} 768w`}
                  sizes="352px"
                  alt=""
                  className="aspect-[3/2] w-full object-cover object-top"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </section>
  );
}
