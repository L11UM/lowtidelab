"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AgentConsole } from "@/components/agent-console";

interface Brief {
  problem: string;
  icp: string;
  offer: string;
  bets: string;
  killedIdeas: string;
  openQuestions: string;
  version: number;
}

interface Idea {
  title: string;
  oneLiner: string;
}

interface ActionItem {
  id: string;
  title: string;
  status: "open" | "done" | "blocked";
  hypothesis: string | null;
  successMetric: string | null;
  killCriterion: string | null;
  evidence: string | null;
  workday: { date: string; slot: string };
}

interface SystemPulse {
  recentWorkdays: { date: string; slot: string; status: string; criticScore: number | null; updatedAt: string }[];
  totalTokens: number;
  recentErrors: number;
}

export default function DashboardPage() {
  const [idea, setIdea] = useState<Idea | null>(null);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [pulse, setPulse] = useState<SystemPulse | null>(null);
  const [evidence, setEvidence] = useState<Record<string, string>>({});
  const [updatingAction, setUpdatingAction] = useState<string | null>(null);

  function refresh() {
    fetch("/api/idea")
      .then((r) => r.json())
      .then(({ idea }) => setIdea(idea));
    fetch("/api/brief")
      .then((r) => r.json())
      .then(({ brief }) => setBrief(brief));
    fetch("/api/actions")
      .then((r) => r.json())
      .then(({ actions }) => setActions(actions ?? []));
    fetch("/api/health")
      .then((r) => r.json())
      .then(setPulse);
  }

  useEffect(refresh, []);

  async function updateAction(id: string, status: "done" | "blocked") {
    setUpdatingAction(id);
    await fetch(`/api/actions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, evidence: evidence[id] ?? "" }),
    });
    setUpdatingAction(null);
    refresh();
  }

  return (
    <div className="container-x max-w-3xl py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      {!idea ? (
        <p className="mt-4 text-sm text-muted">
          No active idea yet.{" "}
          <Link href="/setup" className="underline hover:text-white">
            Set one up
          </Link>
          .
        </p>
      ) : (
        <div className="mt-4 glass rounded-xl p-4">
          <p className="text-xs uppercase tracking-wide text-muted">Active idea</p>
          <p className="mt-1 font-semibold">{idea.title}</p>
          <p className="mt-1 text-sm text-muted">{idea.oneLiner}</p>
        </div>
      )}

      <div className="mt-8">
        <AgentConsole endpoint="/api/run" body={{}} onFinished={refresh} />
      </div>

      {pulse && (
        <section className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
          <div className="bg-surface p-4">
            <p className="text-xs uppercase tracking-wide text-muted">Autonomy</p>
            <p className="mt-2 text-sm font-semibold text-primary-light">Morning + night</p>
            <p className="mt-1 text-xs text-muted">Scheduled daily sessions</p>
          </div>
          <div className="bg-surface p-4">
            <p className="text-xs uppercase tracking-wide text-muted">Recent health</p>
            <p className={`mt-2 text-sm font-semibold ${pulse.recentErrors ? "text-accent-light" : "text-primary-light"}`}>
              {pulse.recentErrors ? `${pulse.recentErrors} logged issue${pulse.recentErrors === 1 ? "" : "s"}` : "Clear"}
            </p>
            <p className="mt-1 text-xs text-muted">Across the last 20 run events</p>
          </div>
          <div className="bg-surface p-4">
            <p className="text-xs uppercase tracking-wide text-muted">Latest session</p>
            <p className="mt-2 text-sm font-semibold capitalize text-white">
              {pulse.recentWorkdays[0] ? `${pulse.recentWorkdays[0].slot} · ${pulse.recentWorkdays[0].status}` : "Waiting"}
            </p>
            <p className="mt-1 text-xs text-muted">{pulse.totalTokens.toLocaleString()} recent tokens</p>
          </div>
        </section>
      )}

      <section className="mt-10 glass rounded-xl p-5">
        <p className="text-xs uppercase tracking-wide text-muted">Autonomous action queue</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Each Critic adds one concrete move here. Every scheduled session sees this queue and works from the latest evidence instead of inventing progress.
        </p>
        {actions.length === 0 ? (
          <p className="mt-4 text-sm text-muted">The next completed Critic pass will set the first action.</p>
        ) : (
          <div className="mt-4 divide-y divide-border">
            {actions.slice(0, 4).map((action) => (
              <div key={action.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-white">{action.title}</p>
                  <span className="shrink-0 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] font-medium capitalize text-accent-light">{action.status}</span>
                </div>
                <p className="mt-1 text-xs text-muted">From {action.workday.date} {action.workday.slot} session{action.evidence ? ` · ${action.evidence}` : ""}</p>
                {action.successMetric && (
                  <div className="mt-2 border-l-2 border-primary/40 pl-3 text-xs leading-relaxed text-muted">
                    <p><span className="text-white/80">Prove:</span> {action.successMetric}</p>
                    {action.killCriterion && <p><span className="text-white/80">Kill:</span> {action.killCriterion}</p>}
                  </div>
                )}
                {action.status === "open" && (
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      value={evidence[action.id] ?? ""}
                      onChange={(event) => setEvidence({ ...evidence, [action.id]: event.target.value })}
                      placeholder="What happened? Add real evidence."
                      className="min-w-0 flex-1 rounded-md border border-border bg-surface2 px-3 py-1.5 text-xs text-white outline-none focus:border-primary/50"
                    />
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => updateAction(action.id, "done")}
                        disabled={updatingAction === action.id}
                        className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
                      >
                        Done
                      </button>
                      <button
                        onClick={() => updateAction(action.id, "blocked")}
                        disabled={updatingAction === action.id}
                        className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted hover:text-white disabled:opacity-60"
                      >
                        Blocked
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {brief && (
        <div className="mt-10 glass rounded-xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-muted">Company brief (v{brief.version})</p>
          </div>
          <p className="mt-2 text-sm">
            <span className="font-medium">Problem:</span> {brief.problem}
          </p>
          <p className="mt-1 text-sm">
            <span className="font-medium">ICP:</span> {brief.icp}
          </p>
          <p className="mt-1 text-sm">
            <span className="font-medium">Offer:</span> {brief.offer}
          </p>
        </div>
      )}

      <p className="mt-6 text-sm">
        <Link href="/workdays" className="underline hover:text-white">
          View all workdays
        </Link>
      </p>
    </div>
  );
}
