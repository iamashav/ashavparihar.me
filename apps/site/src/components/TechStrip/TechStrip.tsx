import { Reveal } from '../Reveal/Reveal';

const tech = [
  'React',
  'Vue',
  'TypeScript',
  'Redux',
  'MobX',
  'Python',
  'Node.js',
  'REST APIs',
  'GraphQL',
  'LLM APIs',
  'AI Agents',
  'MCP',
  'Jest',
  'Playwright',
  'Vite',
  'Docker',
  'GitHub Actions',
  'Sass',
  'Tailwind',
  'Firebase',
  'PostgreSQL',
];

export function TechStrip() {
  return (
    <section
      className="border-b border-panel-border px-6 py-24 md:px-10"
      aria-label="Technologies I work with"
    >
      <Reveal>
        <h2 className="label text-phosphor">Toolbox</h2>
      </Reveal>

      <Reveal>
        <ul className="mt-10 flex flex-wrap gap-2">
          {tech.map((item) => (
            <li key={item} className="label border border-panel-border px-3 py-2 text-muted">
              {item}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
