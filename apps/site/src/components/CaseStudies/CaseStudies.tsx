import { caseStudies } from '../../data/caseStudies';
import { Reveal, RevealGroup, RevealItem } from '../Reveal/Reveal';
import { ScrambleText } from '../ScrambleText/ScrambleText';

export function CaseStudies() {
  return (
    <section id="case-studies" className="border-b border-panel-border px-6 py-24 md:px-10">
      <Reveal>
        <h2 className="label text-phosphor">
          <ScrambleText text="Case Studies" />
        </h2>
      </Reveal>

      <RevealGroup className="mt-12 space-y-px bg-panel-border">
        {caseStudies.map((study, index) => (
          <RevealItem key={study.id}>
            <article className="bg-panel p-6 md:p-10">
              <span className="label text-amber">{String(index + 1).padStart(2, '0')}</span>

              <h3 className="mt-4 max-w-3xl text-2xl md:text-4xl">{study.title}</h3>
              <p className="mt-4 max-w-3xl text-sm text-muted">{study.summary}</p>

              <div className="mt-6 max-w-3xl space-y-4 text-sm text-muted">
                {study.narrative.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>

              <ul className="mt-8 flex flex-wrap gap-2">
                {study.tech.map((tech) => (
                  <li
                    key={tech}
                    className="label border border-panel-border px-2 py-1 text-glitch"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            </article>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
