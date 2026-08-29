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

export default function DashboardPage() {
  const [idea, setIdea] = useState<Idea | null>(null);
  const [brief, setBrief] = useState<Brief | null>(null);

  function refresh() {
    fetch("/api/idea")
      .then((r) => r.json())
      .then(({ idea }) => setIdea(idea));
    fetch("/api/brief")
      .then((r) => r.json())
      .then(({ brief }) => setBrief(brief));
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
