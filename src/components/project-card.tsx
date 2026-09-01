"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Radio } from "lucide-react";
import type { Project } from "@/lib/data";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-primary/40"
    >
      <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-gradient-to-br from-surface2 to-surface">
        <div className="absolute inset-0 bg-grid opacity-30" />
        {project.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.image}
            alt={`${project.title} screenshot`}
            className="relative h-full w-full object-cover"
          />
        ) : (
          <div className="relative flex items-center gap-2 text-primary-light">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
            </span>
            <Radio className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Live in the Lab</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold tracking-tight">{project.title}</h3>
          {project.liveUrl && (
            <Link
              href={project.liveUrl}
              target={project.liveUrl.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer noopener"
              aria-label={`Open ${project.title}`}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-colors group-hover:border-primary/50 group-hover:text-white"
            >
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <p className="flex-1 text-sm leading-relaxed text-muted">{project.description}</p>

        <div className="flex flex-wrap gap-2 pt-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-surface2 px-2.5 py-1 text-xs text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
