import type { ReactNode, RefObject } from 'react';
import { cn } from '../../lib/cn';

interface LayerProps {
  id?: string;
  runway: string;
  depth: string;
  tone: string;
  sectionRef?: RefObject<HTMLElement | null>;
  children: ReactNode;
}

/* The tall section is scroll distance only; the sticky child is the frame the visitor
   actually sees, so each layer holds the viewport while its runway passes and the next
   layer rides up over it. */
export function Layer({ id, runway, depth, tone, sectionRef, children }: LayerProps) {
  return (
    <section ref={sectionRef} id={id} className={cn('relative', runway, depth)}>
      <div className={cn('sticky top-0 h-svh overflow-hidden', tone)}>{children}</div>
    </section>
  );
}
