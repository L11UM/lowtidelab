import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { ExperimentCard } from "@/components/experiment-card";
import { getAllExperiments } from "@/lib/experiments";
import { Archive } from "lucide-react";

export const metadata: Metadata = {
  title: "Experiment Archive",
  description: "Every weekly Lab experiment ever published — nothing is ever deleted.",
};

export default function ExperimentArchivePage() {
  const experiments = getAllExperiments();

  return (
    <section className="container-x py-24">
      <Reveal>
        <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted">
          <Archive className="h-3.5 w-3.5" />
          {experiments.length} experiment{experiments.length === 1 ? "" : "s"} and counting
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Experiment Archive</h1>
        <p className="mt-3 max-w-xl text-muted">
          Every weekly Lab experiment, in order. The newest is Active on the Lab
          page — everything else lives here, permanently, exactly as it was
          published.
        </p>
      </Reveal>

      {experiments.length === 0 ? (
        <p className="mt-12 text-sm text-muted">No experiments yet — check back soon.</p>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {experiments.map((experiment, i) => (
            <Reveal key={experiment.slug} delay={i * 0.05}>
              <ExperimentCard experiment={experiment} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
