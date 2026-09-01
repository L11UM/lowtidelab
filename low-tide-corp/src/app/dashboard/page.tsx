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
  evidence: string | null;
  workday: { date: string; slot: string };
}

export default function DashboardPage() {
  const [idea, setIdea] = useState<Idea | null>(null);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [actions, setActions] = useState<ActionItem[]>([]);

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
  }

  useEffect(refresh, []);

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
