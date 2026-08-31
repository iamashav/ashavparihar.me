import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { usePointerIsFine } from '../../hooks/usePointerIsFine';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, [data-cursor="target"]';

const FRAME_IDLE = 20;
const FRAME_TARGET = 56;

const pad = (value: number) => Math.round(Math.max(value, 0)).toString().padStart(4, '0');

export function RetroCursor() {
  const pointerIsFine = usePointerIsFine();
  const reducedMotion = usePrefersReducedMotion();

  const [targeting, setTargeting] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  // The block tracks the pointer nearly 1:1; the frame lags behind it, which reads as targeting drift.
  const blockSpring = { stiffness: reducedMotion ? 4000 : 1400, damping: 60, mass: 0.2 };
  const frameSpring = { stiffness: reducedMotion ? 4000 : 260, damping: 26, mass: 0.6 };

  const blockX = useSpring(x, blockSpring);
  const blockY = useSpring(y, blockSpring);
  const frameX = useSpring(x, frameSpring);
  const frameY = useSpring(y, frameSpring);

  const readoutX = useTransform(x, pad);
  const readoutY = useTransform(y, pad);

  useEffect(() => {
    if (!pointerIsFine) return;

    const onMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
      setTargeting(
        event.target instanceof Element && event.target.closest(INTERACTIVE) !== null,
      );
    };
    const onLeave = () => setVisible(false);

    window.addEventListener('pointermove', onMove);
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', onLeave);

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
    };
  }, [pointerIsFine, x, y]);

  if (!pointerIsFine) return null;

  const size = targeting ? FRAME_TARGET : FRAME_IDLE;
  const corner = targeting ? 10 : 5;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60]" aria-hidden="true">
      <motion.div
        className="absolute top-0 left-0"
        style={{ x: blockX, y: blockY }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.15 }}
      >
        <div
          className={
            targeting
              ? 'size-[3px] -translate-x-1/2 -translate-y-1/2 bg-glitch'
              : 'size-[7px] -translate-x-1/2 -translate-y-1/2 bg-phosphor'
          }
        />
      </motion.div>

      <motion.div
        className="absolute top-0 left-0"
        style={{ x: frameX, y: frameY }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.15 }}
      >
        <motion.div
          className="relative -translate-x-1/2 -translate-y-1/2"
          animate={{ width: size, height: size }}
          transition={{ type: 'spring', stiffness: 500, damping: 34 }}
        >
          <Corner className="top-0 left-0 border-t border-l" size={corner} targeting={targeting} />
          <Corner className="top-0 right-0 border-t border-r" size={corner} targeting={targeting} />
          <Corner
            className="bottom-0 left-0 border-b border-l"
            size={corner}
            targeting={targeting}
          />
          <Corner
            className="right-0 bottom-0 border-r border-b"
            size={corner}
            targeting={targeting}
          />

          <motion.div
            className="text-micro absolute top-full left-full flex gap-2 pt-1.5 pl-1.5 whitespace-nowrap text-glitch"
            animate={{ opacity: targeting ? 1 : 0 }}
            transition={{ duration: 0.12 }}
          >
            <span>
              X<motion.span className="pl-1">{readoutX}</motion.span>
            </span>
            <span>
              Y<motion.span className="pl-1">{readoutY}</motion.span>
            </span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

interface CornerProps {
  className: string;
  size: number;
  targeting: boolean;
}

function Corner({ className, size, targeting }: CornerProps) {
  return (
    <motion.span
      className={`absolute ${className} ${targeting ? 'border-glitch' : 'border-phosphor'}`}
      animate={{ width: size, height: size }}
      transition={{ type: 'spring', stiffness: 500, damping: 34 }}
    />
  );
}
