const NAV = [
  { label: 'Work', href: '#work' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
];

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-90 flex items-center justify-between stage-pad py-6 text-ink mix-blend-difference">
      <a href="#top" className="label">
        Ashav Parihar
      </a>
      <nav className="flex gap-8">
        {NAV.map((item) => (
          <a key={item.href} href={item.href} className="label hover:line-through">
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
