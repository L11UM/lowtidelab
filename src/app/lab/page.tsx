import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { ideas } from "@/lib/data";
import { FlaskConical } from "lucide-react";

export const metadata: Metadata = {
  title: "Lab",
  description: "Future concepts, experiments, and half-baked ideas.",
};

const statusStyles: Record<string, string> = {
  exploring: "border-primary/30 bg-primary/10 text-primary-light",
  prototyping: "border-accent/30 bg-accent/10 text-accent-light",
  shipped: "border-white/20 bg-white/10 text-white",
};

export default function LabPage() {
  return (
    <section className="container-x py-24">
      <Reveal>
        <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted">
          <FlaskConical className="h-3.5 w-3.5" />
          Work in progress
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Idea Lab</h1>
        <p className="mt-3 max-w-xl text-muted">
          A public notebook of concepts I&apos;m exploring — not everything
          here ships, but it&apos;s where projects like RocketGPT start.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {ideas.map((idea, i) => (
          <Reveal key={idea.slug} delay={i * 0.06}>
            <div className="h-full rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-primary/40">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold tracking-tight">{idea.title}</h3>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[idea.status]}`}
                >
                  {idea.status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">{idea.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {idea.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-surface2 px-2.5 py-1 text-xs text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
