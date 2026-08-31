import { ArrowUpRight, CodeXml } from 'lucide-react';
import { projects } from '../../data/projects';
import { Reveal } from '../Reveal/Reveal';

export function Projects() {
  return (
    <section id="projects" className="border-b border-panel-border px-6 py-24 md:px-10">
      <Reveal>
        <h2 className="label text-phosphor">Projects</h2>
      </Reveal>

      <ul className="mt-12 grid gap-px bg-panel-border md:grid-cols-2">
        {projects.map((project) => (
          <li key={project.id} className="bg-panel">
            <Reveal className="flex h-full flex-col p-6 md:p-8">
              <span className="label text-amber">{project.index}</span>

              <img
                className="mt-6 w-full border border-panel-border"
                src={project.image.src768}
                srcSet={`${project.image.src320} 320w, ${project.image.src768} 768w, ${project.image.src1280} 1280w`}
                sizes="(max-width: 768px) 90vw, 40vw"
                alt={project.image.alt}
                loading="lazy"
              />

              <h3 className="mt-6 text-xl">
                <a
                  href={project.live}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-phosphor"
                >
                  {project.title}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              </h3>

              <p className="mt-3 text-sm text-muted">{project.description}</p>

              <ul className="mt-6 flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                  <li key={tech} className="label border border-panel-border px-2 py-1 text-glitch">
                    {tech}
                  </li>
                ))}
              </ul>

              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="label mt-auto inline-flex items-center gap-2 pt-6 transition-colors hover:text-phosphor"
              >
                <CodeXml className="size-3.5" aria-hidden="true" />
                Source
              </a>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
