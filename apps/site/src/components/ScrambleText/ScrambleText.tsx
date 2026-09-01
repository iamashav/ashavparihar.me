import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface ScrambleTextProps {
  text: string;
  className?: string;
  duration?: number;
  /** When set, the decrypt replays on this interval for as long as the text stays in view. */
  repeatDelay?: number;
}

const GLYPHS = '!<>-_\\/[]{}—=+*^?#01';
const DEFAULT_DURATION = 400;

const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

export function ScrambleText({
  text,
  className,
  duration = DEFAULT_DURATION,
  repeatDelay,
}: ScrambleTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  // Deliberately not `once`, so leaving the viewport tears the loop down instead of scrambling
  // text nobody is looking at.
  const inView = useInView(ref, { amount: 0.6 });
  const hasPlayed = useRef(false);
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(text);
      return;
    }
    if (!inView) return;
    if (!repeatDelay && hasPlayed.current) return;

    let raf = 0;
    let timeout = 0;

    const run = () => {
      const start = performance.now();

      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const locked = Math.floor(progress * text.length);

        let next = '';
        for (let i = 0; i < text.length; i += 1) {
          // Whitespace stays put so the heading keeps its shape while the glyphs churn.
          if (i < locked || text[i] === ' ') next += text[i];
          else next += randomGlyph();
        }
        setDisplay(next);

        if (progress < 1) {
          raf = requestAnimationFrame(tick);
          return;
        }
        setDisplay(text);
        hasPlayed.current = true;
        if (repeatDelay) timeout = window.setTimeout(run, repeatDelay);
      };

      raf = requestAnimationFrame(tick);
    };

    run();

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
    };
  }, [inView, reducedMotion, text, duration, repeatDelay]);

  return (
    <span ref={ref} className={className}>
      {/* The scrambling glyphs are decoration; assistive tech reads the settled string instead. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{display}</span>
    </span>
  );
}
