import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

const CELL = 9;
const STEP_MS = 80;
const SEED_DENSITY = 0.18;
const BRUSH_RADIUS = 2;

const VOID = '#080808';
const GRID_LINE = '#1f1f24';
const PHOSPHOR = '#00ff66';
const GLITCH = '#00f0ff';

export function GameOfLife() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cellsRef = useRef<HTMLSpanElement>(null);
  const genRef = useRef<HTMLSpanElement>(null);
  const fpsRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const ctx = canvas.getContext('2d');
    // No 2D context under jsdom or a blocked canvas; the panel stays empty rather than throwing.
    if (!ctx) return;

    const background = document.createElement('canvas');
    const backgroundCtx = background.getContext('2d');

    let cols = 0;
    let rows = 0;
    let cssWidth = 0;
    let cssHeight = 0;
    let dpr = 1;
    let grid = new Uint8Array(0);
    let next = new Uint8Array(0);
    let born = new Uint8Array(0);
    let generation = 0;
    let alive = 0;
    let fps = 0;

    const seed = () => {
      for (let i = 0; i < grid.length; i += 1) {
        grid[i] = Math.random() < SEED_DENSITY ? 1 : 0;
      }
      born.fill(0);
      generation = 0;
    };

    // The 1px rule never changes between frames, so it is rasterised once and blitted per frame.
    const buildBackground = () => {
      if (!backgroundCtx) return;
      background.width = Math.max(Math.round(cssWidth * dpr), 1);
      background.height = Math.max(Math.round(cssHeight * dpr), 1);
      backgroundCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      backgroundCtx.fillStyle = VOID;
      backgroundCtx.fillRect(0, 0, cssWidth, cssHeight);
      backgroundCtx.strokeStyle = GRID_LINE;
      backgroundCtx.lineWidth = 1;
      backgroundCtx.beginPath();
      for (let c = 0; c <= cols; c += 1) {
        const x = Math.round(c * CELL) + 0.5;
        backgroundCtx.moveTo(x, 0);
        backgroundCtx.lineTo(x, cssHeight);
      }
      for (let r = 0; r <= rows; r += 1) {
        const y = Math.round(r * CELL) + 0.5;
        backgroundCtx.moveTo(0, y);
        backgroundCtx.lineTo(cssWidth, y);
      }
      backgroundCtx.stroke();
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      cssWidth = Math.max(rect.width, 1);
      cssHeight = Math.max(rect.height, 1);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(cssWidth / CELL);
      rows = Math.ceil(cssHeight / CELL);
      const size = cols * rows;
      grid = new Uint8Array(size);
      next = new Uint8Array(size);
      born = new Uint8Array(size);
      seed();
      buildBackground();
    };

    const step = () => {
      alive = 0;
      for (let r = 0; r < rows; r += 1) {
        // The field wraps, so gliders leave one edge and reappear on the other instead of dying.
        const up = ((r - 1 + rows) % rows) * cols;
        const mid = r * cols;
        const down = ((r + 1) % rows) * cols;
        for (let c = 0; c < cols; c += 1) {
          const left = (c - 1 + cols) % cols;
          const right = (c + 1) % cols;
          const neighbours =
            grid[up + left] +
            grid[up + c] +
            grid[up + right] +
            grid[mid + left] +
            grid[mid + right] +
            grid[down + left] +
            grid[down + c] +
            grid[down + right];

          const index = mid + c;
          const was = grid[index];
          let lives = 0;
          if (was) {
            lives = neighbours === 2 || neighbours === 3 ? 1 : 0;
          } else {
            lives = neighbours === 3 ? 1 : 0;
          }
          next[index] = lives;
          born[index] = lives && !was ? 1 : 0;
          if (lives) alive += 1;
        }
      }
      const previous = grid;
      grid = next;
      next = previous;
      generation += 1;
    };

    const draw = () => {
      ctx.drawImage(background, 0, 0, cssWidth, cssHeight);

      // Two batched paths keep the glow at two shadowed fills per frame instead of one per cell.
      const settled = new Path2D();
      const fresh = new Path2D();
      for (let r = 0; r < rows; r += 1) {
        const rowStart = r * cols;
        for (let c = 0; c < cols; c += 1) {
          const index = rowStart + c;
          if (!grid[index]) continue;
          const path = born[index] ? fresh : settled;
          path.rect(c * CELL + 1, r * CELL + 1, CELL - 1, CELL - 1);
        }
      }

      ctx.shadowBlur = 6;
      ctx.shadowColor = PHOSPHOR;
      ctx.fillStyle = PHOSPHOR;
      ctx.fill(settled);
      ctx.shadowColor = GLITCH;
      ctx.fillStyle = GLITCH;
      ctx.fill(fresh);
      ctx.shadowBlur = 0;
    };

    const updateHud = () => {
      if (cellsRef.current) cellsRef.current.textContent = String(alive);
      if (genRef.current) genRef.current.textContent = String(generation);
      if (fpsRef.current) fpsRef.current.textContent = String(fps);
    };

    const paint = (event: PointerEvent) => {
      if (!cols || !rows) return;
      const rect = canvas.getBoundingClientRect();
      const originCol = Math.floor((event.clientX - rect.left) / CELL);
      const originRow = Math.floor((event.clientY - rect.top) / CELL);
      for (let dr = -BRUSH_RADIUS; dr <= BRUSH_RADIUS; dr += 1) {
        for (let dc = -BRUSH_RADIUS; dc <= BRUSH_RADIUS; dc += 1) {
          if (dr * dr + dc * dc > BRUSH_RADIUS * BRUSH_RADIUS) continue;
          const r = (((originRow + dr) % rows) + rows) % rows;
          const c = (((originCol + dc) % cols) + cols) % cols;
          grid[r * cols + c] = 1;
        }
      }
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(wrap);

    if (reducedMotion) {
      draw();
      updateHud();
      return () => observer.disconnect();
    }

    let raf = 0;
    let lastTime = performance.now();
    let accumulator = 0;
    let frames = 0;
    let fpsAnchor = lastTime;

    const loop = (now: number) => {
      // Clamped so a backgrounded tab does not return and burn through hundreds of generations at once.
      accumulator += Math.min(now - lastTime, 250);
      lastTime = now;
      while (accumulator >= STEP_MS) {
        step();
        accumulator -= STEP_MS;
      }
      draw();

      frames += 1;
      if (now - fpsAnchor >= 500) {
        fps = Math.round((frames * 1000) / (now - fpsAnchor));
        frames = 0;
        fpsAnchor = now;
        updateHud();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    canvas.addEventListener('pointermove', paint);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointermove', paint);
      observer.disconnect();
    };
  }, [reducedMotion]);

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />

      <div className="text-micro pointer-events-none absolute inset-0 p-5 text-muted">
        <span className="absolute top-5 left-5 bg-void/85 px-2 py-1">LIFE // CONWAY</span>
        <span className="absolute right-5 bottom-5 bg-void/85 px-2 py-1">TOROIDAL</span>
        <span className="absolute bottom-5 left-5 flex flex-wrap gap-x-2 bg-void/85 px-2 py-1 text-glitch">
          <span>
            [CELLS_ALIVE: <span ref={cellsRef}>0</span>]
          </span>
          <span className="text-muted">|</span>
          <span>
            [GEN: <span ref={genRef}>0</span>]
          </span>
          <span className="text-muted">|</span>
          <span>
            [FPS: <span ref={fpsRef}>0</span>]
          </span>
        </span>
      </div>
    </div>
  );
}
