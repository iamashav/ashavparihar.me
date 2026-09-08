import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

/* Six bordered faces pushed out to half the cube's width. CSS 3D rather than WebGL: a wireframe
   box is a handful of divs, so it costs no dependency, no model file and no loading state. */
const HALF = '6rem';
const FACES = [
  `[transform:translateZ(${HALF})]`,
  `[transform:rotateY(180deg)_translateZ(${HALF})]`,
  `[transform:rotateY(90deg)_translateZ(${HALF})]`,
  `[transform:rotateY(-90deg)_translateZ(${HALF})]`,
  `[transform:rotateX(90deg)_translateZ(${HALF})]`,
  `[transform:rotateX(-90deg)_translateZ(${HALF})]`,
];

export function HeroField() {
  const reducedMotion = usePrefersReducedMotion();
  const cubeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cube = cubeRef.current;
    if (reducedMotion || !cube) return;

    const context = gsap.context(() => {
      /* Two axes on different periods, so the tumble never repeats the same pose — one shared
         duration would loop visibly every cycle. Linear because a turning object has no easing. */
      gsap.to(cube, { rotationY: 360, duration: 19, ease: 'none', repeat: -1 });
      gsap.to(cube, { rotationX: 360, duration: 28, ease: 'none', repeat: -1 });
    }, cube);

    return () => context.revert();
  }, [reducedMotion]);

  return (
    <div data-grid aria-hidden className="fade-grid relative h-full w-full [perspective:900px]">
      <div
        ref={cubeRef}
        data-cube
        className="absolute top-1/2 left-1/2 size-48 -translate-x-1/2 -translate-y-1/2 [transform-style:preserve-3d]"
      >
        {FACES.map((face) => (
          <span key={face} className={`absolute inset-0 border border-ink/45 ${face}`} />
        ))}
      </div>
    </div>
  );
}
