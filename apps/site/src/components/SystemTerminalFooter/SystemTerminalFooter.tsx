import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { EMAIL, QR_PATH, QR_SIZE } from '../../data/contactQr';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { Reveal, RevealGroup, RevealItem } from '../Reveal/Reveal';
import { ScrambleText } from '../ScrambleText/ScrambleText';

const SOCIALS = [
  { tag: '[GH]', href: 'https://github.com/iamashav', label: 'GitHub' },
  { tag: '[LI]', href: 'https://linkedin.com/in/ashavparihar/', label: 'LinkedIn' },
];

function useSystemClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return now;
}

function offsetLabel(date: Date) {
  const minutes = -date.getTimezoneOffset();
  const sign = minutes < 0 ? '-' : '+';
  const abs = Math.abs(minutes);
  return `UTC${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
}

export function SystemTerminalFooter() {
  const now = useSystemClock();
  const reducedMotion = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  // The headline lags the barcode beside it, which keeps the last screen from arriving as one flat slab.
  const headlineParallax = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <footer id="contact" ref={sectionRef} className="border-t border-panel-border">
      <div className="px-6 py-24 md:px-10">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
          <Reveal className="min-w-0">
            {/* Break opportunities at the underscores, so a narrow column wraps between words
                rather than mid-word. */}
            <motion.h2
              style={reducedMotion ? undefined : { y: headlineParallax }}
              className="text-[clamp(2rem,7vw,6rem)]"
            >
              <ScrambleText text="Transmit_a_message" repeatDelay={5000} />
            </motion.h2>

            <RevealGroup className="mt-10 flex flex-wrap gap-3">
              {SOCIALS.map((social) => (
                <RevealItem key={social.href}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="label inline-flex items-center gap-2 border border-panel-border px-5 py-3 transition-colors hover:border-phosphor hover:bg-phosphor hover:text-void"
                >
                  {social.tag}
                  <ArrowUpRight className="size-3" aria-hidden="true" />
                </a>
                </RevealItem>
              ))}
            </RevealGroup>
          </Reveal>

          <Reveal className="shrink-0">
            <a
              href={`mailto:${EMAIL}`}
              aria-label={`Email ${EMAIL}`}
              className="group block w-64 border border-panel-border bg-panel transition-colors hover:border-phosphor"
            >
              <span className="text-micro flex items-center justify-between border-b border-panel-border px-3 py-2 text-glitch">
                [SCAN: mailto.qr]
                <span className="text-muted">□ ×</span>
              </span>
              <svg
                className="w-full fill-current p-4 text-muted transition-colors group-hover:text-phosphor"
                viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`}
                role="presentation"
              >
                <path d={QR_PATH} />
              </svg>
            </a>
          </Reveal>
        </div>
      </div>

      <div className="label flex flex-col gap-4 border-t border-panel-border px-6 py-6 text-muted md:flex-row md:items-center md:justify-between md:px-10">
        <p>
          SYS_TIME {now.toLocaleTimeString('en-GB', { hour12: false })} {offsetLabel(now)}
        </p>

        <p className="md:text-right">© {now.getFullYear()} Ashav Parihar / source public on GitHub</p>
      </div>
    </footer>
  );
}
