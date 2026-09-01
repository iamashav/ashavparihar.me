import { caseStudies } from '../../data/caseStudies';
import { Reveal, RevealGroup, RevealItem } from '../Reveal/Reveal';
import { ScrambleText } from '../ScrambleText/ScrambleText';

export function CaseStudies() {
  return (
    <section id="case-studies" className="border-b border-panel-border px-6 pt-24 pb-32 md:px-10 md:pt-28 md:pb-40">
      <Reveal>
        <h2 className="label text-neutral-500">
          <ScrambleText text="Case Studies" />
        </h2>
      </Reveal>

      <RevealGroup className="mt-14 space-y-24 md:space-y-32">
        {caseStudies.map((study, index) => (
          <RevealItem key={study.id}>
            <article className="border-t border-panel-border pt-12">
              <span className="label text-neutral-600">{String(index + 1).padStart(2, '0')}</span>

              <h3 className="mt-6 max-w-4xl text-3xl leading-tight md:text-5xl">{study.title}</h3>

              <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-24">
                <div className="lg:sticky lg:top-16 lg:self-start">
                  {/* The study's own summary, set as a pull quote — no invented figures. */}
                  <blockquote className="border-l border-panel-border pl-6 font-display text-xl leading-snug text-neutral-200 md:text-2xl">
                    {study.summary}
                  </blockquote>

                  <ul className="mt-10 flex flex-wrap gap-x-4 gap-y-2">
                    {study.tech.map((tech) => (
                      <li key={tech} className="text-micro text-neutral-600">
                        {tech.toLowerCase().replace(/[\s.]/g, '-')}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="max-w-2xl space-y-8 text-[0.9375rem] leading-loose text-neutral-400">
                  {study.narrative.map((paragraph) => (
                    <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </article>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
