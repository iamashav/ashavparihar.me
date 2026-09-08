import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface LogoProps {
  className?: string;
}

// Inline SVG (not <img>) so it inherits `currentColor` and recolors per context. The viewBox is
// cropped to the ink rather than the artboard, so the mark fills the box it is given.
export function Logo({ className }: LogoProps) {
  const reducedMotion = usePrefersReducedMotion();
  const rootRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (reducedMotion || !root) return;

    /* Path measurement needs a geometry engine, which environments without layout (jsdom, SSR)
       do not have. Without this the missing API would take the whole render down rather than
       just costing the mark its animation. */
    const strokes = Array.from(root.querySelectorAll('path')).filter(
      (stroke) => typeof stroke.getTotalLength === 'function',
    );
    if (strokes.length === 0) return;

    /* Dashing each path by its own length means the whole stroke is one dash, so shifting the
       offset walks the line on and off rather than producing a repeating pattern. */
    strokes.forEach((stroke) => {
      gsap.set(stroke, { strokeDasharray: stroke.getTotalLength() });
    });

    const redraw = () => {
      gsap.fromTo(
        strokes,
        { strokeDashoffset: (_index, target: SVGPathElement) => target.getTotalLength() },
        {
          strokeDashoffset: 0,
          duration: 0.7,
          ease: 'power2.inOut',
          /* A trails P, so the mark writes itself letter by letter instead of both at once. */
          stagger: 0.12,
          overwrite: true,
        },
      );
    };

    /* Bound to the link so the whole hit area triggers it, not just the glyphs. */
    const target = root.closest('a') ?? root;
    target.addEventListener('pointerenter', redraw);

    return () => {
      target.removeEventListener('pointerenter', redraw);
      gsap.killTweensOf(strokes);
      strokes.forEach((stroke) => {
        gsap.set(stroke, { clearProps: 'strokeDasharray,strokeDashoffset' });
      });
    };
  }, [reducedMotion]);

  return (
    <svg
      ref={rootRef}
      className={className}
      viewBox="10 10 44 44"
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
      strokeLinejoin="miter"
      strokeLinecap="square"
      aria-hidden="true"
    >
      <path d="M 16 48 L 16 16 L 28 16 L 28 48 M 16 32 L 28 32" />
      <path d="M 36 48 L 36 16 L 48 16 L 48 32 L 36 32" />
    </svg>
  );
}
