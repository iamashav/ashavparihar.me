import { ArrowUpRight } from 'lucide-react';

const socials = [
  { href: 'https://github.com/iamashav', label: 'GitHub' },
  { href: 'https://linkedin.com/in/ashavparihar/', label: 'LinkedIn' },
];

export function Footer() {
  return (
    <footer className="label flex flex-col gap-4 px-6 py-8 text-muted sm:flex-row sm:items-center sm:justify-between md:px-10">
      <p>© {new Date().getFullYear()} Ashav Parihar</p>

      <div className="flex gap-6">
        {socials.map((social) => (
          <a
            key={social.href}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 transition-colors hover:text-phosphor"
          >
            {social.label}
            <ArrowUpRight className="size-3" aria-hidden="true" />
          </a>
        ))}
      </div>
    </footer>
  );
}
