import { Logo } from '../Logo/Logo';

const navLinks = [
  { href: '#case-studies', label: 'Work' },
  { href: '#projects', label: 'Projects' },
  { href: '#contact', label: 'Contact' },
];

export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-panel-border px-6 py-6 md:px-10">
      <a
        href="#top"
        aria-label="Ashav Parihar — home"
        className="text-neutral-400 transition-colors hover:text-phosphor"
      >
        <Logo className="h-7 w-auto" />
      </a>
      <nav className="label flex gap-8 text-neutral-500" aria-label="Primary">
        {navLinks.map((link) => (
          <a key={link.href} href={link.href} className="transition-colors hover:text-phosphor">
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
