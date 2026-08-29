import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { ExperimentFrame } from "@/components/experiment-frame";
import { ideas } from "@/lib/data";
import { getNewestExperiment } from "@/lib/experiments";
import { ArrowRight, ArrowUpRight, Bot, FlaskConical } from "lucide-react";

export const metadata: Metadata = {
  title: "Lab",
  description: "A new interactive experiment every week, written and built entirely by AI.",
};

const statusStyles: Record<string, string> = {
  exploring: "border-primary/30 bg-primary/10 text-primary-light",
  prototyping: "border-accent/30 bg-accent/10 text-accent-light",
  shipped: "border-white/20 bg-white/10 text-white",
};

export default function LabPage() {
  const newest = getNewestExperiment();

  return (
    <section className="container-x py-24">
      <Reveal>
        <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted">
          <FlaskConical className="h-3.5 w-3.5" />
          A new experiment every week
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">The Lab</h1>
        <p className="mt-3 max-w-xl text-muted">
          Once a week, an AI designs and builds one original, playable, browser-based
          experiment — a simulation, visualizer, generative art piece, or small game.
          Every experiment stays live in the archive, permanently.
        </p>
      </Reveal>

      {newest && (
        <Reveal delay={0.08}>
          <div className="mt-10 rounded-3xl border border-primary/20 bg-primary/[0.04] p-4 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-muted">
                <span className="flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-accent-light">
                  <Bot className="h-3 w-3" /> This week&apos;s experiment
                </span>
                <span>No. {String(newest.number).padStart(3, "0")}</span>
              </div>
              <Link
                href={`/lab/experiments/${newest.slug}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary-light hover:text-white"
              >
                Full write-up <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{newest.title}</h2>
            <p className="mt-2 max-w-2xl text-muted">{newest.description}</p>

            <div className="mt-6">
              <ExperimentFrame html={newest.demoHtml} title={newest.title} />
            </div>
          </div>
        </Reveal>
      )}

      <Reveal delay={0.12}>
        <div className="mt-10 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Ideas</h2>
          <Link
            href="/lab/archive"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary-light hover:text-white"
          >
            Experiment archive <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <p className="mt-2 max-w-xl text-muted">
          Concepts still being explored — not everything here ships, but it&apos;s
          where projects like RocketGPT started.
        </p>
      </Reveal>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
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
