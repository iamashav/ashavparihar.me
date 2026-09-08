import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { EMAIL, QR_MODULES, QR_PATH, QR_SIZE } from '../../data/contactQr';
import { Layer } from '../Layer/Layer';
import { Logo } from '../Logo/Logo';

const EXTERNAL = { target: '_blank', rel: 'noopener noreferrer' };

const LINKS = [
  { label: 'GitHub', href: 'https://github.com/iamashav' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/ashavparihar/' },
];

const CENTRE = (QR_SIZE - 1) / 2;

/* The dent is driven by how fast the cursor crosses, not merely that it crossed. A slow hand barely
   disturbs the surface; a quick one strikes it properly — which is also why no dead-band is needed
   any more. Jitter is slow by definition, so it produces no visible dent at all. */
const MAX_BULGE = 18;

/* Perpendicular speed in px/ms mapped to viewBox units. A gentle drag runs ~0.2, a flick ~3. */
const SPEED_TO_BULGE = 8;

/* Below this the crossing is ignored outright, so a creeping cursor never interrupts a spring
   already in flight. */
const MIN_BULGE = 1.5;

export function ContactLayer() {
  const reducedMotion = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const codeRef = useRef<SVGSVGElement>(null);
  const blockRef = useRef<HTMLAnchorElement>(null);
  const plateRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const code = codeRef.current;
    const block = blockRef.current;
    const plate = plateRef.current;
    if (reducedMotion || !section || !code || !block || !plate) return;

    /* Each edge is a quadratic curve whose control point sits where the cursor crossed. Positive
       values dent the edge inward — the cursor presses into the plate rather than the plate
       reaching out for it. The elastic overshoot swings it back out past flat on the way to rest. */
    const edge = { top: 0, right: 0, bottom: 0, left: 0, tx: 50, ry: 50, bx: 50, ly: 50 };

    const draw = () => {
      plate.setAttribute(
        'd',
        `M0,0 Q${edge.tx},${edge.top} 100,0` +
          ` Q${100 - edge.right},${edge.ry} 100,100` +
          ` Q${edge.bx},${100 - edge.bottom} 0,100` +
          ` Q${edge.left},${edge.ly} 0,0 Z`,
      );
    };

    draw();

    const strike = (event: PointerEvent, direction: number, vx: number, vy: number) => {
      const bounds = block.getBoundingClientRect();
      const rawX = ((event.clientX - bounds.left) / bounds.width) * 100;
      const rawY = ((event.clientY - bounds.top) / bounds.height) * 100;

      /* An exit strike happens with the cursor already outside the box, so the raw values fall
         beyond 0-100. Left unclamped they push the control point past a corner and the edge kinks
         instead of bowing. The nearest-edge test still uses the raw values — it needs the sign. */
      const px = gsap.utils.clamp(0, 100, rawX);
      const py = gsap.utils.clamp(0, 100, rawY);

      const gaps = [
        { side: 'top', gap: rawY },
        { side: 'right', gap: 100 - rawX },
        { side: 'bottom', gap: 100 - rawY },
        { side: 'left', gap: rawX },
      ];
      const nearest = gaps.reduce((a, b) => (b.gap < a.gap ? b : a));

      /* Only the component perpendicular to the struck edge deforms it — sliding along an edge
         shouldn't push into it. */
      const vertical = nearest.side === 'top' || nearest.side === 'bottom';
      const speed = Math.abs(vertical ? vy : vx);
      const amount = gsap.utils.clamp(0, MAX_BULGE, speed * SPEED_TO_BULGE);
      if (amount < MIN_BULGE) return;

      const depth = amount * direction;
      if (nearest.side === 'top') {
        edge.tx = px;
        edge.top = depth;
      } else if (nearest.side === 'bottom') {
        edge.bx = px;
        edge.bottom = depth;
      } else if (nearest.side === 'left') {
        edge.ly = py;
        edge.left = depth;
      } else {
        edge.ry = py;
        edge.right = depth;
      }

      draw();

      /* Springs back from wherever it is, so re-entering mid-bounce just re-strikes. */
      gsap.to(edge, {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        duration: 1.15,
        ease: 'elastic.out(1, 0.34)',
        overwrite: true,
        onUpdate: draw,
        /* Snap to exact zeros so float residue can never leave the plate slightly bent. */
        onComplete: () => {
          edge.top = 0;
          edge.right = 0;
          edge.bottom = 0;
          edge.left = 0;
          draw();
        },
      });
    };

    const context = gsap.context(() => {
      /* Delay is each module's own distance from the centre of the matrix, so the code assembles
         as a radial ripple rather than a uniform fade. The data is the choreography. */
      gsap.from(code.querySelectorAll('rect'), {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        ease: 'back.out(1.7)',
        stagger: (index) => {
          const module = QR_MODULES[index];
          return Math.hypot(module.x - CENTRE, module.y - CENTRE) * 0.022;
        },
        scrollTrigger: { trigger: section, start: 'top 60%' },
      });
    }, section);

    /* We own the in/out state rather than trusting enter/leave, so the plate is struck once per
       crossing: in presses the edge inward, out pushes it back through the surface. The boundary is
       the edge itself in both directions — speed, not distance, is what decides whether it shows. */
    let inside = false;
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;
    let tracking = false;

    const onMove = (event: PointerEvent) => {
      const { clientX: x, clientY: y } = event;

      let vx = 0;
      let vy = 0;
      if (tracking) {
        /* Floor the interval at one frame: coalesced events can report sub-millisecond gaps that
           would divide into an absurd velocity. */
        const dt = Math.max(8, event.timeStamp - lastTime);
        vx = (x - lastX) / dt;
        vy = (y - lastY) / dt;
      }
      lastX = x;
      lastY = y;
      lastTime = event.timeStamp;
      tracking = true;

      const b = block.getBoundingClientRect();
      const within = x >= b.left && x <= b.right && y >= b.top && y <= b.bottom;
      if (within === inside) return;

      inside = within;
      strike(event, within ? 1 : -1, vx, vy);
    };

    window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onMove);
      gsap.killTweensOf(edge);
      context.revert();
    };
  }, [reducedMotion]);

  return (
    <Layer
      id="contact"
      runway="h-[110vh]"
      depth="z-70"
      tone="bg-flood text-ink"
      sectionRef={sectionRef}
    >
      <div className="flex h-full flex-col stage-pad pt-24 pb-[var(--stage-gutter)]">
        <div className="flex items-baseline justify-between">
          <h2 className="section-label">Contact</h2>
          <div className="flex gap-6">
            {LINKS.map((link) => (
              <a key={link.href} href={link.href} {...EXTERNAL} className="label link-wipe">
                {link.label} ↗
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          {/* Clickable on desktop, scannable on a phone, and the address never enters the DOM. */}
          <a
            ref={blockRef}
            href={`mailto:${EMAIL}`}
            aria-label="Email me"
            className="group relative p-5"
          >
            {/* The deformable plate. overflow-visible so a struck edge can bow past the box. */}
            <svg
              aria-hidden
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 size-full overflow-visible text-ink"
            >
              <path ref={plateRef} d="M0,0 L100,0 L100,100 L0,100 Z" fill="currentColor" />
            </svg>

            <svg
              ref={codeRef}
              viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`}
              role="img"
              aria-label="QR code containing my email address"
              className="relative size-40 text-bone transition-colors duration-300 group-hover:text-flood md:size-48"
            >
              {reducedMotion ? (
                <path d={QR_PATH} fill="currentColor" />
              ) : (
                QR_MODULES.map((module) => (
                  <rect
                    key={`${module.x}-${module.y}`}
                    x={module.x}
                    y={module.y}
                    width="1"
                    height="1"
                    fill="currentColor"
                    className="qr-module"
                  />
                ))
              )}
            </svg>
          </a>
          <span className="note text-ink/70">Scan, or click to email</span>
        </div>

        <div className="relative flex items-end">
          <span className="note text-ink/70">© 2026</span>
          {/* w-fit so the hit area is the mark itself rather than the whole footer strip. */}
          <a href="#top" aria-label="Back to top" className="absolute inset-x-0 mx-auto w-fit">
            <Logo className="h-6 w-6" />
          </a>
        </div>
      </div>
    </Layer>
  );
}
