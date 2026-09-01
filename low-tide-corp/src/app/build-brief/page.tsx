"use client";

import { useEffect, useState } from "react";
import { MarkdownView } from "@/components/markdown-view";
import { CopyButton } from "@/components/copy-button";

interface Artifact {
  id: string;
  agent: string;
  markdown: string;
  workday: { date: string; slot: string };
}

interface Action {
  id: string;
  title: string;
  workday: { date: string; slot: string };
}

interface BuildBrief {
  idea: { title: string; oneLiner: string } | null;
  artifacts: Artifact[];
  actions: Action[];
}

export default function BuildBriefPage() {
  const [brief, setBrief] = useState<BuildBrief | null>(null);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/build-brief")
      .then((response) => response.json())
      .then((data: BuildBrief) => {
        setBrief(data);
        setActiveAgent(data.artifacts[0]?.agent ?? null);
      });
  }, []);

  if (!brief) return <div className="container-x py-12 text-sm text-muted">Loading build brief...</div>;
  if (!brief.idea) return <div className="container-x py-12 text-sm text-muted">Set an active idea to create a build brief.</div>;

  const activeArtifact = brief.artifacts.find((artifact) => artifact.agent === activeAgent);
  const allWork = brief.artifacts
    .map((artifact) => `# ${artifact.agent}\n\n${artifact.markdown}`)
    .join("\n\n---\n\n");

  return (
    <div className="container-x max-w-4xl py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-primary-light">Private product workspace</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{brief.idea.title} build brief</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">{brief.idea.oneLiner}</p>
        </div>
        <CopyButton text={allWork} label="Copy full brief" />
      </div>

      <section className="mt-8 border-y border-border py-5">
        <p className="text-xs uppercase tracking-wide text-muted">Current execution</p>
        {brief.actions.length ? (
          <ul className="mt-3 space-y-2">
            {brief.actions.map((action) => (
              <li key={action.id} className="text-sm text-white">
                {action.title}
                <span className="ml-2 text-xs text-muted">from {action.workday.date} {action.workday.slot}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">No open Critic action yet.</p>
        )}
      </section>

      {brief.artifacts.length ? (
        <>
          <div className="mt-8 flex flex-wrap gap-2">
            {brief.artifacts.map((artifact) => (
              <button
                key={artifact.id}
                onClick={() => setActiveAgent(artifact.agent)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  activeAgent === artifact.agent ? "border-primary/50 bg-primary/10 text-primary-light" : "border-border text-muted hover:text-white"
                }`}
              >
                {artifact.agent}
              </button>
            ))}
          </div>

          {activeArtifact && (
            <section className="mt-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs text-muted">Latest {activeArtifact.agent} work: {activeArtifact.workday.date} {activeArtifact.workday.slot}</p>
                <CopyButton text={activeArtifact.markdown} />
              </div>
              <div className="glass rounded-xl p-5">
                <MarkdownView markdown={activeArtifact.markdown} />
              </div>
            </section>
          )}
        </>
      ) : (
        <p className="mt-8 text-sm text-muted">The first completed workday will populate product, build, growth, research, operator, and Critic output here.</p>
      )}
    </div>
  );
}
