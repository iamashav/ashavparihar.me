import { Logo } from '../Logo/Logo';

const NAV = [
  { label: 'Work', href: '#work' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
];

/* Deliberately not fixed: it belongs to the hero like a poster masthead, and scrolls away with it
   rather than hovering over every layer below. */
export function SiteHeader() {
  return (
    <header className="flex items-center justify-between py-6">
      {/* The mark, not the name — the hero headline already says it. */}
      <a href="#top" aria-label="Ashav Parihar — home">
        <Logo className="h-7 w-7" />
      </a>
      <nav className="flex gap-8">
        {NAV.map((item) => (
          <a key={item.href} href={item.href} className="label link-wipe">
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
