import { motion } from 'framer-motion';
import { MagneticLink } from '../MagneticLink/MagneticLink';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { RevealGroup, RevealItem } from '../Reveal/Reveal';
import { ScrambleText } from '../ScrambleText/ScrambleText';
import { TerminalCursor } from '../TerminalCursor/TerminalCursor';
import { GameOfLife } from './GameOfLife';

const MISSION =
  'I build and ship production React and TypeScript interfaces, the backend services behind them, and the AI tooling that now handles the mechanical half of the work.';

export function HeroSection() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section id="top" className="border-b border-panel-border">
      <div className="grid md:grid-cols-2">
        <RevealGroup className="flex flex-col justify-between gap-12 p-6 md:p-10 lg:p-14">
          <RevealItem className="flex items-center gap-3">
            <motion.span
              className="size-2 bg-phosphor shadow-[0_0_12px_#00ff66]"
              animate={reducedMotion ? undefined : { opacity: [1, 0.25, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <p className="label flex items-center gap-2 text-phosphor">
              System status: Operational
              <TerminalCursor />
            </p>
          </RevealItem>

          <RevealItem>
            <p className="label text-muted">
              Software <span className="text-glitch">//</span> Engineer
            </p>
            <h1 className="mt-5 text-[clamp(2.75rem,7vw,6rem)]">
              <ScrambleText text="Ashav Parihar" />
            </h1>
            <p className="mt-8 max-w-xl text-sm text-muted">{MISSION}</p>
          </RevealItem>

          <RevealItem className="flex flex-col gap-3 sm:flex-row">
            <MagneticLink href="#contact">Deploy project</MagneticLink>
            <MagneticLink href="#projects">View directory</MagneticLink>
          </RevealItem>
        </RevealGroup>

        <div className="relative min-h-[26rem] border-t border-panel-border md:min-h-full md:border-t-0 md:border-l">
          <GameOfLife />
        </div>
      </div>
    </section>
  );
}
