import { useEffect, useState } from 'react';
import { cn } from '../../lib/cn';
import { Logo } from '../Logo/Logo';

const NAV = [
  { label: 'Work', href: '#work' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
];

/* Deliberately not fixed: it belongs to the hero like a poster masthead, and scrolls away with it
   rather than hovering over every layer below. */
export function SiteHeader() {
  const [mono, setMono] = useState(false);

  /* The mode lives on the root element rather than in React state passed around, because the swap
     is a single CSS variable — no component needs to know the mode exists. */
  useEffect(() => {
    const root = document.documentElement;
    if (mono) root.dataset.mode = 'mono';
    else delete root.dataset.mode;

    return () => {
      delete root.dataset.mode;
    };
  }, [mono]);

  return (
    <header className="flex items-center justify-between py-6">
      {/* The mark, not the name — the hero headline already says it. */}
      <a href="#top" data-mark aria-label="Ashav Parihar — home">
        <Logo className="h-7 w-7" />
      </a>
      {/* A fixed gap does not shrink, so four items at 32px apart push the nav into the mark below
          about 390px and overlap it outright at 320. */}
      <nav data-nav className="flex items-center gap-5 md:gap-8">
        <button
          type="button"
          onClick={() => setMono((on) => !on)}
          aria-pressed={mono}
          aria-label="Toggle monochrome"
          className="group flex cursor-pointer items-center"
        >
          {/* Rotation is bound to the state, not to hover: half a turn moves the fill to the other
              side, so the spin performs the switch. Hover previewing it would fight the click —
              the icon would spin on hover and immediately spin back the moment you pressed. */}
          <svg
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            className={cn(
              'size-4 transition-transform duration-500 ease-out group-hover:scale-115',
              mono ? 'rotate-180' : 'rotate-0',
            )}
          >
            <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.75" />
            <path d="M10 1.75a8.25 8.25 0 0 1 0 16.5z" fill="currentColor" />
          </svg>
        </button>
        {NAV.map((item) => (
          <a key={item.href} href={item.href} className="label link-wipe">
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
