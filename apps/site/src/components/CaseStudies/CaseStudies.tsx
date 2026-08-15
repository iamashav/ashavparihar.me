import { caseStudies } from '../../data/caseStudies';
import './case-studies.scss';

const STUDY_MODIFIERS = [
  'case-studies__cell--featured',
  'case-studies__cell--s2',
  'case-studies__cell--s3',
];

export function CaseStudies() {
  return (
    <section className="case-studies" id="case-studies">
      <div className="case-studies__grid">
        <div className="case-studies__cell case-studies__cell--label" data-reveal>
          <h2 className="case-studies__label-title">Case Studies</h2>
        </div>

        {caseStudies.map((study, index) => (
          <article
            key={study.id}
            className={`case-studies__cell case-studies__cell--study ${STUDY_MODIFIERS[index]}`}
            data-reveal
          >
            <div className="case-studies__cell-head">
              <span className="case-studies__num">{String(index + 1).padStart(2, '0')}</span>
            </div>

            <h3 className="case-studies__title">{study.title}</h3>
            <p className="case-studies__summary">{study.summary}</p>

            <div className="case-studies__narrative">
              {study.narrative.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>

            <ul className="case-studies__tech">
              {study.tech.map((tech) => (
                <li key={tech} className="case-studies__tech-item">
                  {tech}
                </li>
              ))}
            </ul>
          </article>
        ))}

        <div
          className="case-studies__cell case-studies__cell--hatch case-studies__cell--h1"
          aria-hidden="true"
        />
        <div
          className="case-studies__cell case-studies__cell--hatch case-studies__cell--h2"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
