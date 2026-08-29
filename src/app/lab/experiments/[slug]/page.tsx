import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { ArrowLeft, Bot, FlaskConical } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { ExperimentFrame } from "@/components/experiment-frame";
import { getAllExperimentSlugs, getExperimentBySlug } from "@/lib/experiments";
import { sanitizeHtml } from "@/lib/sanitize";

export function generateStaticParams() {
  return getAllExperimentSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const experiment = getExperimentBySlug(params.slug);
  if (!experiment) return {};
  return {
    title: experiment.title,
    description: experiment.description,
  };
}

function md(text: string) {
  return sanitizeHtml(marked.parse(text, { async: false }) as string);
}

export default function ExperimentDetailPage({ params }: { params: { slug: string } }) {
  const experiment = getExperimentBySlug(params.slug);
  if (!experiment) notFound();

  const date = new Date(experiment.date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const proseClass =
    "[&_a]:text-primary-light [&_a]:underline [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_li]:my-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-3 [&_p]:leading-relaxed [&_p]:text-white/80 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6";

  return (
    <article className="container-x max-w-3xl py-24">
      <Reveal>
        <Link href="/lab" className="inline-flex items-center gap-2 text-sm text-muted hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to the Lab
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="rounded-full border border-border bg-surface2 px-2.5 py-1">
            No. {String(experiment.number).padStart(3, "0")}
          </span>
          <span
            className={`rounded-full border px-2.5 py-1 ${
              experiment.status === "active"
                ? "border-accent/30 bg-accent/10 text-accent-light"
                : "border-border bg-surface2 text-muted"
            }`}
          >
            {experiment.status === "active" ? "Active" : "Archived"}
          </span>
          <span className="flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-accent-light">
            <Bot className="h-3 w-3" /> AI-built
          </span>
          <span>{date}</span>
        </div>

        <h1 className="mt-3 flex items-center gap-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          <FlaskConical className="h-7 w-7 shrink-0 text-primary-light" />
          {experiment.title}
        </h1>
        <p className="mt-3 max-w-2xl text-muted">{experiment.description}</p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-8">
          <ExperimentFrame html={experiment.demoHtml} title={experiment.title} />
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">How to interact</h2>
            <div
              className={proseClass}
              dangerouslySetInnerHTML={{ __html: md(experiment.instructions) }}
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">How it works</h2>
            <div
              className={proseClass}
              dangerouslySetInnerHTML={{ __html: md(experiment.explanation) }}
            />
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="mt-10 rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold tracking-tight">Lab Notes</h2>
          <div
            className={proseClass}
            dangerouslySetInnerHTML={{ __html: md(experiment.labNotes) }}
          />
        </div>
      </Reveal>
    </article>
  );
}
