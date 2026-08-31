import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface PreloaderProps {
  onComplete: () => void;
}

const BOOT_MS = 2600;
const BAR_CELLS = 16;

const BOOT_TEXT = [
  '[SYS_INIT] Loading memory blocks...',
  '[SYS_INIT] Mapping page tables... ok',
  '[KERNEL] Initializing frontend modules...',
  '[KERNEL] Mounting /react ... ok',
  '[KERNEL] Scheduler online',
  '[GFX] Allocating 2d canvas surface',
  '[GFX] Phosphor CRT profile applied',
  '[NET] Connecting to backend services...',
  '[NET] Handshake complete',
  '[FS] Indexing case studies... 3 found',
  '[FS] Indexing projects... 4 found',
  '[LIFE] Seeding Conway field',
  '[AUTH] Session anonymous / read-only',
  '[READY] System operational. 100%',
];

// Spread across the run so the log keeps scrolling for the whole boot rather than stalling at the end.
const BOOT_LINES = BOOT_TEXT.map((text, index) => ({
  text,
  at: (index / BOOT_TEXT.length) * BOOT_MS * 0.9,
  dur: 150,
}));

const RAMP = '.:-=+*#%@';
const SPHERE_W = 46;
const SPHERE_H = 23;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const TILT = 0.45;

// Plateaus in the ramp make the bar stall and lurch like a machine reporting real work.
const RAMP_POINTS: [number, number][] = [
  [0, 0],
  [0.18, 0.12],
  [0.34, 0.39],
  [0.5, 0.42],
  [0.7, 0.76],
  [0.85, 0.8],
  [1, 1],
];

function rampAt(t: number) {
  for (let i = 1; i < RAMP_POINTS.length; i += 1) {
    const [x1, y1] = RAMP_POINTS[i];
    if (t <= x1) {
      const [x0, y0] = RAMP_POINTS[i - 1];
      return y0 + ((t - x0) / (x1 - x0)) * (y1 - y0);
    }
  }
  return 1;
}

// Nudging the character cursor off a constant rate keeps the typing from reading as a CSS animation.
function stutter(p: number) {
  return Math.min(1, Math.max(0, p + Math.sin(p * 22) * 0.035));
}

// Point count scales with progress, so the sphere literally resolves from a sparse scatter into a solid.
function renderSphere(progress: number, timeMs: number) {
  const points = 60 + Math.floor(progress * progress * 1500);
  const cells = new Array<string>(SPHERE_W * SPHERE_H).fill(' ');
  const depth = new Float32Array(SPHERE_W * SPHERE_H).fill(-2);

  const spin = timeMs * 0.0012;
  const cosSpin = Math.cos(spin);
  const sinSpin = Math.sin(spin);
  const cosTilt = Math.cos(TILT);
  const sinTilt = Math.sin(TILT);

  for (let i = 0; i < points; i += 1) {
    const y = 1 - (2 * i + 1) / points;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = i * GOLDEN_ANGLE;
    const x0 = Math.cos(theta) * radius;
    const z0 = Math.sin(theta) * radius;

    const x = x0 * cosSpin - z0 * sinSpin;
    const zSpun = x0 * sinSpin + z0 * cosSpin;
    const yTilted = y * cosTilt - zSpun * sinTilt;
    const z = y * sinTilt + zSpun * cosTilt;

    const sx = Math.round((x * 0.5 + 0.5) * (SPHERE_W - 1));
    const sy = Math.round((-yTilted * 0.5 + 0.5) * (SPHERE_H - 1));
    if (sx < 0 || sx >= SPHERE_W || sy < 0 || sy >= SPHERE_H) continue;

    const index = sy * SPHERE_W + sx;
    if (z <= depth[index]) continue;
    depth[index] = z;
    cells[index] = RAMP[Math.max(0, Math.min(RAMP.length - 1, Math.round(((z + 1) / 2) * (RAMP.length - 1))))];
  }

  let out = '';
  for (let row = 0; row < SPHERE_H; row += 1) {
    out += cells.slice(row * SPHERE_W, (row + 1) * SPHERE_W).join('');
    if (row < SPHERE_H - 1) out += '\n';
  }
  return out;
}

type Phase = 'boot' | 'flash' | 'collapse';

export function Preloader({ onComplete }: PreloaderProps) {
  const [phase, setPhase] = useState<Phase>('boot');
  const [elapsed, setElapsed] = useState(0);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const sphereRef = useRef<HTMLPreElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (phase !== 'boot') return;

    let raf = 0;
    let last = performance.now();
    let accumulated = 0;
    let lastPublished = -1;

    const loop = (now: number) => {
      // rAF is parked while the tab is hidden, so clamp the delta: a backgrounded tab must not burn
      // through the sequence and land on a finished screen the moment it is focused.
      accumulated += Math.min(now - last, 50);
      last = now;

      const progress = rampAt(Math.min(accumulated / BOOT_MS, 1));

      // The sphere and the percentage run at full frame rate off the DOM; only the typed log,
      // which nobody can read faster than this, goes through React.
      if (sphereRef.current) sphereRef.current.textContent = renderSphere(progress, now);
      if (percentRef.current) percentRef.current.textContent = String(Math.round(progress * 100));

      if (accumulated - lastPublished >= 40) {
        lastPublished = accumulated;
        setElapsed(accumulated);
      }

      if (accumulated >= BOOT_MS) {
        setElapsed(BOOT_MS);
        setPhase('flash');
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  useEffect(() => {
    const skip = () => {
      if (phaseRef.current === 'boot') {
        setElapsed(BOOT_MS);
        setPhase('flash');
        // The loop owns these two nodes and stops here, so skipping must land them on a finished
        // state or the centre reads 0% while the bar and [READY] line both say 100%.
        if (percentRef.current) percentRef.current.textContent = '100';
        if (sphereRef.current) sphereRef.current.textContent = renderSphere(1, performance.now());
      }
    };
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    return () => {
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, []);

  const progress = rampAt(Math.min(elapsed / BOOT_MS, 1));
  const filled = Math.round(progress * BAR_CELLS);
  const bar = `[${'█'.repeat(filled)}${'░'.repeat(BAR_CELLS - filled)}]`;
  const started = BOOT_LINES.filter((line) => elapsed > line.at);

  return (
    <motion.div
      className="fixed inset-0 z-100 overflow-hidden bg-void"
      style={{ transformOrigin: 'center' }}
      animate={phase === 'collapse' ? { scaleY: 0 } : { scaleY: 1 }}
      transition={{ duration: 0.42, ease: [0.7, 0, 0.84, 0] }}
      onAnimationComplete={() => {
        if (phaseRef.current === 'collapse') onComplete();
      }}
      role="status"
      aria-live="off"
      aria-label="System boot sequence"
    >
      <div className="flex h-full flex-col items-center justify-center gap-5" aria-hidden="true">
        <pre className="text-[10px] leading-[1.05] text-phosphor [text-shadow:0_0_10px_#00ff66] sm:text-xs">
          <span ref={sphereRef} />
        </pre>
        <p className="label text-phosphor">
          <span ref={percentRef}>0</span>%
        </p>
      </div>

      <div
        className="absolute bottom-0 left-0 flex max-h-[55vh] w-full flex-col justify-end overflow-hidden p-6 md:p-10"
        aria-hidden="true"
      >
        {started.map((line) => {
          const raw = (elapsed - line.at) / line.dur;
          const progressed = Math.min(raw, 1);
          // stutter() rides slightly under 1.0 at the end, so a finished line is pinned to full length
          // rather than left one character short with its cursor still blinking.
          const chars =
            progressed >= 1 ? line.text.length : Math.floor(stutter(progressed) * line.text.length);
          const done = chars >= line.text.length;
          return (
            <p
              key={line.text}
              className={
                done && line.text.startsWith('[READY')
                  ? 'text-xs text-phosphor'
                  : 'text-xs text-muted'
              }
            >
              {line.text.slice(0, chars)}
              {!done && <span className="bg-phosphor text-void">_</span>}
            </p>
          );
        })}
        <p className="mt-3 text-xs text-phosphor">{bar}</p>
      </div>

      <p className="text-micro absolute right-6 bottom-6 text-muted md:right-10 md:bottom-10">
        Press any key to skip
      </p>

      {phase === 'collapse' && (
        <motion.span
          className="absolute inset-x-0 top-1/2 h-[2px] bg-phosphor"
          initial={{ opacity: 0, scaleX: 1 }}
          animate={{ opacity: [0, 1, 1], scaleX: [1, 1, 0.05] }}
          transition={{ duration: 0.42, ease: 'easeIn' }}
        />
      )}

      {phase === 'flash' && (
        <motion.div
          className="absolute inset-0 bg-phosphor"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.92, 0.08, 0.7, 0] }}
          transition={{ duration: 0.26, times: [0, 0.12, 0.38, 0.6, 1] }}
          onAnimationComplete={() => setPhase('collapse')}
        />
      )}
    </motion.div>
  );
}
