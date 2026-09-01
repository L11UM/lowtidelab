import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { ProjectCard } from "@/components/project-card";
import { projects } from "@/lib/data";

export const metadata: Metadata = {
  title: "Projects",
  description: "Live experiments and systems built by Low Tide Lab.",
};

export default function ProjectsPage() {
  return (
    <section className="container-x py-24">
      <Reveal>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Public Work</h1>
        <p className="mt-3 max-w-xl text-muted">
          Only things you can actually open, use, or inspect. The private work stays private; this is the public record.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => (
          <Reveal key={project.slug} delay={i * 0.06}>
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
