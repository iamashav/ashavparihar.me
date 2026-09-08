import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';

interface IntroProps {
  onDone: () => void;
}

export function Intro({ onDone }: IntroProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const rule = ruleRef.current;
    if (!root || !rule) return;

    /* GSAP's ticker is rAF-driven, so a backgrounded tab never advances the timeline. Without
       this the intro would hold the viewport and keep scroll locked indefinitely. */
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      onDone();
    };
    const failsafe = window.setTimeout(finish, 2600);

    const context = gsap.context(() => {
      gsap
        .timeline({ onComplete: finish })
        .fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'power2.inOut' })
        .to(root, { yPercent: -100, duration: 0.8, ease: 'power3.inOut' }, '+=0.1');
    });

    return () => {
      window.clearTimeout(failsafe);
      context.revert();
    };
  }, [onDone]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-100 flex flex-col justify-end bg-flood stage-pad pb-[var(--stage-gutter)]"
    >
      <div className="flex items-end justify-between text-ink">
        <span className="label">Ashav Parihar</span>
        <span className="label">Software Engineer</span>
      </div>
      <span className="mt-4 block h-px w-full origin-left bg-ink" ref={ruleRef} />
    </div>
  );
}
