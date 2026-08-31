import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from '../Reveal/Reveal';

const socials = [
  { href: 'https://github.com/iamashav', label: 'GitHub' },
  { href: 'https://linkedin.com/in/ashavparihar/', label: 'LinkedIn' },
];

const formatTime = () => new Date().toLocaleTimeString('en-GB', { hour12: false });

export function Hero() {
  const [time, setTime] = useState(formatTime);

  useEffect(() => {
    const id = window.setInterval(() => setTime(formatTime()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section id="top" className="border-b border-panel-border px-6 py-24 md:px-10 md:py-32">
      <Reveal>
        <p className="label text-phosphor">Software Engineer</p>
        <h1 className="mt-6 text-[clamp(2.75rem,11vw,8rem)]">Ashav Parihar</h1>
      </Reveal>

      <Reveal className="mt-12 grid gap-10 md:grid-cols-[minmax(0,32rem)_auto] md:items-end md:justify-between">
        <div className="space-y-4 text-sm text-muted">
          <p>
            I build and ship production React/TypeScript interfaces and the backend services behind
            them.
          </p>
          <p>
            I like taking things from idea to production — balancing polished, professional work with
            a creative streak: motion, interaction, and the small touches that make something feel
            alive.
          </p>
        </div>

        <div className="flex flex-col gap-3 md:items-end">
          <p className="label text-amber" aria-label="Local time">
            {time}
          </p>
          {socials.map((social) => (
            <a
              key={social.href}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="label inline-flex items-center gap-1 transition-colors hover:text-phosphor"
            >
              {social.label}
              <ArrowUpRight className="size-3" aria-hidden="true" />
            </a>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
