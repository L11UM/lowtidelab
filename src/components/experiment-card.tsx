"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, FlaskConical } from "lucide-react";
import type { ExperimentMeta } from "@/lib/experiments";

const categoryLabels: Record<string, string> = {
  simulation: "Simulation",
  visualizer: "Visualizer",
  "generative-art": "Generative Art",
  game: "Game",
  data: "Data",
  physics: "Physics",
  probability: "Probability",
  other: "Experiment",
};

export function ExperimentCard({ experiment }: { experiment: ExperimentMeta }) {
  const date = new Date(experiment.date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}>
      <Link
        href={`/lab/experiments/${experiment.slug}`}
        className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-primary/40"
      >
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="rounded-full border border-border bg-surface2 px-2 py-0.5">
            No. {String(experiment.number).padStart(3, "0")}
          </span>
          <span
            className={`rounded-full border px-2 py-0.5 ${
              experiment.status === "active"
                ? "border-accent/30 bg-accent/10 text-accent-light"
                : "border-border bg-surface2 text-muted"
            }`}
          >
            {experiment.status === "active" ? "Active" : "Archived"}
          </span>
          <span>{date}</span>
        </div>

        <h3 className="mt-3 flex items-center gap-2 text-lg font-semibold tracking-tight group-hover:text-primary-light">
          <FlaskConical className="h-4 w-4 shrink-0 text-primary-light" />
          {experiment.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{experiment.description}</p>

        <div className="mt-4 flex items-center justify-between">
          <span className="rounded-full border border-border bg-surface2 px-2.5 py-1 text-xs text-muted">
            {categoryLabels[experiment.category] ?? experiment.category}
          </span>
          <ArrowUpRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
        </div>
      </Link>
    </motion.div>
  );
}
