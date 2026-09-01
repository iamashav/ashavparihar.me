import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface TerminalCursorProps {
  className?: string;
}

export function TerminalCursor({ className }: TerminalCursorProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <span
      aria-hidden="true"
      className={`inline-block h-[0.9em] w-[0.5em] translate-y-[0.1em] bg-phosphor ${reducedMotion ? '' : 'animate-blink'} ${className ?? ''}`}
    />
  );
}
