"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { StatusBadge, ScoreBadge } from "@/components/badges";
import { MarkdownView } from "@/components/markdown-view";
import { AgentConsole } from "@/components/agent-console";

interface Artifact {
  id: string;
  agent: string;
  type: string;
  markdown: string;
  error: string | null;
}

interface Workday {
  id: string;
  date: string;
  status: string;
  summary: string | null;
  criticScore: number | null;
  artifacts: Artifact[];
}

const AGENT_ORDER = ["orchestrator", "researcher", "product", "builder", "growth", "operator", "critic"];

export default function WorkdayDetailPage() {
  const params = useParams<{ date: string; slot?: "night" }>();
  const date = params.date;
  const slot = params.slot === "night" ? "night" : "morning";
  const [workday, setWorkday] = useState<Workday | null>(null);
  const [tab, setTab] = useState<string | null>(null);
  const [rerunning, setRerunning] = useState<string | null>(null);

  function refresh() {
    const suffix = slot === "night" ? "/night" : "";
    fetch(`/api/workdays/${date}${suffix}`)
      .then((r) => r.json())
      .then(({ workday }) => {
        setWorkday(workday);
        if (workday?.artifacts?.length && !tab) setTab(workday.artifacts[0].agent);
      });
  }

  useEffect(refresh, [date, slot]);

  if (!workday) {
    return (
      <div className="container-x max-w-3xl py-12">
        <p className="text-sm text-muted">Loading…</p>
      </div>
    );
  }

  const present = AGENT_ORDER.filter((a) => workday.artifacts.some((art) => art.agent === a));
  const activeArtifact = workday.artifacts.find((a) => a.agent === tab);

  return (
    <div className="container-x max-w-3xl py-12">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{workday.date} <span className="text-base font-normal capitalize text-muted">{slot} session</span></h1>
        <div className="flex items-center gap-2">
          <StatusBadge status={workday.status} />
          <ScoreBadge score={workday.criticScore} />
        </div>
      </div>
      {workday.summary && <p className="mt-2 text-sm text-muted">{workday.summary}</p>}

      <div className="mt-6 flex flex-wrap gap-2">
        {present.map((agent) => (
          <button
            key={agent}
            onClick={() => setTab(agent)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              tab === agent ? "border-primary/50 bg-primary/10 text-primary-light" : "border-border text-muted hover:text-white"
            }`}
          >
            {agent}
          </button>
        ))}
      </div>

      <div className="mt-6 glass rounded-xl p-5">
        {activeArtifact?.error ? (
          <p className="text-sm text-red-300">Failed: {activeArtifact.error}</p>
        ) : activeArtifact ? (
          <MarkdownView markdown={activeArtifact.markdown} />
        ) : (
          <p className="text-sm text-muted">No artifact for this agent yet.</p>
        )}

        {tab && tab !== "orchestrator" && (
          <div className="mt-4 border-t border-border pt-4">
            {rerunning === tab ? (
              <AgentConsole
                endpoint={`/api/workdays/${date}${slot === "night" ? "/night" : ""}/rerun`}
                body={{ agent: tab }}
                onFinished={() => {
                  setRerunning(null);
                  refresh();
                }}
              />
            ) : (
              <button
                onClick={() => setRerunning(tab)}
                className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold text-white/90 hover:border-white/30 hover:bg-white/5"
              >
                Rerun {tab}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
