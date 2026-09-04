import { Suspense, lazy, useState } from 'react';
import { motion } from 'framer-motion';
import { MagneticLink } from '../MagneticLink/MagneticLink';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { RevealGroup, RevealItem } from '../Reveal/Reveal';
import { TerminalCursor } from '../TerminalCursor/TerminalCursor';
import { SceneBoundary } from './SceneBoundary';

const HeroCanvas = lazy(() => import('./HeroCanvas'));

const MISSION =
  'Production React and TypeScript interfaces, the services behind them, and the AI tooling that now handles the mechanical half of the work.';

export function HeroSection() {
  const reducedMotion = usePrefersReducedMotion();
  const [sceneFailed, setSceneFailed] = useState(false);

  // The shader is a mouse-driven effect with no static equivalent, so reduced motion and a missing
  // GPU both fall back to the same thing: the headline as ordinary type.
  const showCanvas = !reducedMotion && !sceneFailed;

  return (
    <section
      id="top"
      className="relative h-[calc(100svh-var(--header-h))] w-full overflow-hidden bg-void"
    >
      {showCanvas && (
        <SceneBoundary onError={() => setSceneFailed(true)}>
          <Suspense fallback={null}>
            <HeroCanvas />
          </Suspense>
        </SceneBoundary>
      )}

      {/* The canvas headline is pixels — invisible to screen readers and crawlers. The real heading
          lives here either way, and becomes the visible one when the canvas is not rendering. */}
      {showCanvas ? (
        <h1 className="sr-only">Ashav Parihar</h1>
      ) : (
        <div className="absolute inset-0 z-0 flex items-center justify-center px-6">
          <h1 className="text-center text-[clamp(2.5rem,11vw,9rem)] text-white">Ashav Parihar</h1>
        </div>
      )}

      <RevealGroup className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-6 md:p-10 lg:p-14">
        <RevealItem className="flex items-center gap-3">
          <motion.span
            // The one status signal that earns colour: grey here would read as "offline".
            className="size-2 bg-phosphor shadow-[0_0_12px_#00ff66]"
            animate={reducedMotion ? undefined : { opacity: [1, 0.25, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <p className="label flex items-center gap-2 text-white">
            System status: Operational
            <TerminalCursor />
          </p>
        </RevealItem>

        <RevealItem className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-md">
            <p className="label text-white">
              Software <span className="text-neutral-600">//</span> Engineer
            </p>
            <p className="mt-6 text-[0.9375rem] leading-loose text-neutral-400">{MISSION}</p>
          </div>

          <div className="pointer-events-auto flex flex-col gap-3 sm:flex-row">
            <MagneticLink href="#contact">Deploy project</MagneticLink>
            <MagneticLink href="#projects">View directory</MagneticLink>
          </div>
        </RevealItem>
      </RevealGroup>
    </section>
  );
}
