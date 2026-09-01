"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatusBadge, ScoreBadge } from "@/components/badges";

interface Workday {
  id: string;
  date: string;
  slot: "morning" | "night";
  status: string;
  summary: string | null;
  criticScore: number | null;
}

export default function WorkdaysPage() {
  const [workdays, setWorkdays] = useState<Workday[]>([]);

  useEffect(() => {
    fetch("/api/workdays")
      .then((r) => r.json())
      .then(({ workdays }) => setWorkdays(workdays));
  }, []);

  return (
    <div className="container-x max-w-3xl py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Workdays</h1>
      <p className="mt-2 text-sm text-muted">Every day the crew has worked the idea, newest first.</p>

      {workdays.length === 0 ? (
        <p className="mt-8 text-sm text-muted">No workdays yet — run one from the dashboard.</p>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {workdays.map((wd) => (
            <Link key={wd.id} href={wd.slot === "night" ? `/workdays/${wd.date}/night` : `/workdays/${wd.date}`} className="glass block rounded-xl p-4 transition-colors hover:border-white/20">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold">{wd.date} <span className="text-xs font-normal capitalize text-muted">{wd.slot}</span></span>
                <div className="flex items-center gap-2">
                  <StatusBadge status={wd.status} />
                  <ScoreBadge score={wd.criticScore} />
                </div>
              </div>
              {wd.summary && <p className="mt-2 text-sm text-muted">{wd.summary}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
