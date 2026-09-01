import { useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { SUBSYSTEMS, capabilities } from '../../data/capabilities';
import type { Capability, Subsystem } from '../../data/capabilities';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { cn } from '../../lib/cn';
import { ITEM_VARIANTS, SPRING, VIEWPORT } from '../../lib/motion';
import { Reveal } from '../Reveal/Reveal';
import { ScrambleText } from '../ScrambleText/ScrambleText';

type Filter = Subsystem | 'ALL';

// Tailwind only sees class names it can read statically, so each accent is a complete literal.
const ACCENTS = {
  cyan: {
    icon: 'group-hover:text-glitch',
    ref: 'text-glitch/40',
    tag: 'group-hover:text-glitch',
    hover: 'hover:border-glitch hover:shadow-[0_0_20px_rgba(0,240,255,0.18)]',
  },
  amber: {
    icon: 'group-hover:text-amber',
    ref: 'text-amber/40',
    tag: 'group-hover:text-amber',
    hover: 'hover:border-amber hover:shadow-[0_0_20px_rgba(255,176,0,0.18)]',
  },
};

// AnimatePresence sits between the grid and the cards, so variant state does not propagate down
// from the grid. Each card is driven directly and staggers off its own index instead.
const CARD_VARIANTS: Variants = {
  ...ITEM_VARIANTS,
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { ...SPRING, delay: index * 0.07 },
  }),
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.18 } },
};

const accentFor = (subsystem: Subsystem) =>
  subsystem === 'DATA_INFRA' ? ACCENTS.amber : ACCENTS.cyan;

export function SystemCapabilities() {
  const [activeSubsystem, setActiveSubsystem] = useState<Filter>('ALL');
  const reducedMotion = usePrefersReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);
  const inView = useInView(gridRef, VIEWPORT);

  const visible =
    activeSubsystem === 'ALL'
      ? capabilities
      : capabilities.filter((item) => item.subsystem === activeSubsystem);

  return (
    <section
      id="capabilities"
      className="border-b border-panel-border px-6 py-32 md:px-10 md:py-40"
      aria-label="Technical capabilities"
    >
      <Reveal>
        <h2 className="label text-neutral-500">
          <ScrambleText text="System capabilities" />
        </h2>
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
                  'label border px-4 py-3 transition-colors',
                  active
                    ? 'border-phosphor bg-phosphor text-void'
                    : 'border-panel-border text-neutral-500 hover:border-phosphor hover:text-phosphor',
                )}
              >
                [ {subsystem.label} ]
              </button>
            );
          })}
        </div>
      </Reveal>

      <motion.div ref={gridRef} layout className="mt-12 grid gap-px md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((capability, index) => (
            <CapabilityCard
              key={capability.id}
              capability={capability}
              index={index}
              inView={inView}
              reducedMotion={reducedMotion}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      <p className="text-micro mt-10 text-neutral-600">
        {visible.length} of {capabilities.length} subsystems listed
      </p>
    </section>
  );
}

interface CapabilityCardProps {
  capability: Capability;
  index: number;
  inView: boolean;
  reducedMotion: boolean;
}

function CapabilityCard({ capability, index, inView, reducedMotion }: CapabilityCardProps) {
  const accent = accentFor(capability.subsystem);
  const Icon = capability.icon;

  return (
    <motion.article
      layout={!reducedMotion}
      variants={CARD_VARIANTS}
      custom={index}
      initial={reducedMotion ? false : 'hidden'}
      animate={reducedMotion || inView ? 'visible' : 'hidden'}
      exit="exit"
      whileHover={reducedMotion ? undefined : { scale: 1.02 }}
      className={cn(
        'group relative flex flex-col border border-panel-border bg-panel p-12',
        // transform is excluded so this never fights the scale Framer Motion drives inline.
        'transition-[background-color,border-color,box-shadow] duration-200',
        // Scaling grows the card over its neighbours, and later siblings paint on top, so without
        // this the glowing border is clipped on the right and bottom edges.
        'hover:z-10 hover:bg-panel-border/40',
        accent.hover,
      )}
    >
      <header className="flex items-start justify-between gap-4">
        <Icon className={cn('size-5 text-neutral-600 transition-colors', accent.icon)} aria-hidden="true" />
        <span className={cn('text-micro', accent.ref)}>{capability.ref}</span>
      </header>

      <h3 className="mt-10 text-xl">{capability.title}</h3>
      <p className="mt-4 text-[0.9375rem] leading-relaxed text-neutral-400">{capability.summary}</p>

      <ul className="mt-10 flex flex-wrap gap-x-4 gap-y-2">
        {capability.tags.map((tag) => (
          <li key={tag} className={cn('text-micro text-neutral-600 transition-colors', accent.tag)}>
            {tag}
          </li>
        ))}
      </ul>
    </motion.article>
  );
}
