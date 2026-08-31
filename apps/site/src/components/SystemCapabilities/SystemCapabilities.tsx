import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SUBSYSTEMS, capabilities } from '../../data/capabilities';
import type { Capability, Subsystem } from '../../data/capabilities';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { cn } from '../../lib/cn';
import { Reveal } from '../Reveal/Reveal';

type Filter = Subsystem | 'ALL';

// Tailwind only sees class names it can read statically, so each accent is a complete literal.
const ACCENTS = {
  cyan: {
    icon: 'text-glitch',
    ref: 'text-glitch/70',
    tag: 'text-glitch',
    hover: 'hover:border-glitch hover:shadow-[0_0_20px_rgba(0,240,255,0.18)]',
  },
  amber: {
    icon: 'text-amber',
    ref: 'text-amber/70',
    tag: 'text-amber',
    hover: 'hover:border-amber hover:shadow-[0_0_20px_rgba(255,176,0,0.18)]',
  },
};

const accentFor = (subsystem: Subsystem) =>
  subsystem === 'DATA_INFRA' ? ACCENTS.amber : ACCENTS.cyan;

export function SystemCapabilities() {
  const [activeSubsystem, setActiveSubsystem] = useState<Filter>('ALL');
  const reducedMotion = usePrefersReducedMotion();

  const visible =
    activeSubsystem === 'ALL'
      ? capabilities
      : capabilities.filter((item) => item.subsystem === activeSubsystem);

  return (
    <section
      id="capabilities"
      className="border-b border-panel-border px-6 py-24 md:px-10"
      aria-label="Technical capabilities"
    >
      <Reveal>
        <h2 className="label text-phosphor">System capabilities</h2>
      </Reveal>

      <Reveal>
        <div
          className="mt-10 flex flex-wrap gap-2"
          role="group"
          aria-label="Filter capabilities by subsystem"
        >
          {SUBSYSTEMS.map((subsystem) => {
            const active = activeSubsystem === subsystem.id;
            return (
              <button
                key={subsystem.id}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveSubsystem(subsystem.id)}
                className={cn(
                  'label border px-3 py-2 transition-colors',
                  active
                    ? 'border-phosphor bg-phosphor text-void'
                    : 'border-panel-border text-muted hover:border-phosphor hover:text-phosphor',
                )}
              >
                [ {subsystem.label} ]
              </button>
            );
          })}
        </div>
      </Reveal>

      <motion.div layout className="mt-8 grid gap-px md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((capability) => (
            <CapabilityCard
              key={capability.id}
              capability={capability}
              reducedMotion={reducedMotion}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      <p className="text-micro mt-6 text-muted">
        {visible.length} of {capabilities.length} subsystems listed
      </p>
    </section>
  );
}

interface CapabilityCardProps {
  capability: Capability;
  reducedMotion: boolean;
}

function CapabilityCard({ capability, reducedMotion }: CapabilityCardProps) {
  const accent = accentFor(capability.subsystem);
  const Icon = capability.icon;

  return (
    <motion.article
      layout={!reducedMotion}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={reducedMotion ? undefined : { scale: 1.02 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className={cn(
        'group relative flex flex-col border border-panel-border bg-panel p-6',
        // transform is excluded so this never fights the scale Framer Motion drives inline.
        'transition-[background-color,border-color,box-shadow] duration-200',
        // Scaling grows the card over its neighbours, and later siblings paint on top, so without
        // this the glowing border is clipped on the right and bottom edges.
        'hover:z-10 hover:bg-panel-border/40',
        accent.hover,
      )}
    >
      <header className="flex items-start justify-between gap-4">
        <Icon className={cn('size-5', accent.icon)} aria-hidden="true" />
        <span className={cn('text-micro', accent.ref)}>{capability.ref}</span>
      </header>

      <h3 className="mt-6 text-xl">{capability.title}</h3>
      <p className="mt-3 text-sm text-muted">{capability.summary}</p>

      <ul className="mt-6 flex flex-wrap gap-x-3 gap-y-1">
        {capability.tags.map((tag) => (
          <li key={tag} className={cn('text-micro', accent.tag)}>
            {tag}
          </li>
        ))}
      </ul>
    </motion.article>
  );
}
