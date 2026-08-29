"use client";

import { useEffect, useState } from "react";

interface Idea {
  id: string;
  title: string;
  oneLiner: string;
  audience: string | null;
  budget: string | null;
  dontDo: string | null;
}

export default function SetupPage() {
  const [idea, setIdea] = useState<Idea | null>(null);
  const [title, setTitle] = useState("");
  const [oneLiner, setOneLiner] = useState("");
  const [audience, setAudience] = useState("");
  const [budget, setBudget] = useState("");
  const [dontDo, setDontDo] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/idea")
      .then((r) => r.json())
      .then(({ idea }) => {
        if (idea) {
          setIdea(idea);
          setTitle(idea.title);
          setOneLiner(idea.oneLiner);
          setAudience(idea.audience ?? "");
          setBudget(idea.budget ?? "");
          setDontDo(idea.dontDo ?? "");
        }
      });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/idea", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, oneLiner, audience, budget, dontDo }),
    });
    const { idea: newIdea } = await res.json();
    setIdea(newIdea);
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="container-x max-w-2xl py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Idea setup</h1>
      <p className="mt-2 text-sm text-muted">
        Pin the one active idea the company works today. Saving replaces the current active idea — the old one is
        archived, not deleted.
      </p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-white">Title</span>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-lg border border-border bg-panel px-3 py-2 text-white outline-none focus:border-primary/50"
            placeholder="e.g. Tide-aware trip planner for surfers"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-white">One-liner</span>
          <textarea
            required
            value={oneLiner}
            onChange={(e) => setOneLiner(e.target.value)}
            rows={3}
            className="rounded-lg border border-border bg-panel px-3 py-2 text-white outline-none focus:border-primary/50"
            placeholder="What is it, for whom, and why now?"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-white">Audience (optional)</span>
          <input
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="rounded-lg border border-border bg-panel px-3 py-2 text-white outline-none focus:border-primary/50"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-white">Budget (optional)</span>
          <input
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="rounded-lg border border-border bg-panel px-3 py-2 text-white outline-none focus:border-primary/50"
            placeholder="e.g. $0 — bootstrap only"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-white">Constraints — &ldquo;don&apos;t do&rdquo; (optional)</span>
          <textarea
            value={dontDo}
            onChange={(e) => setDontDo(e.target.value)}
            rows={2}
            className="rounded-lg border border-border bg-panel px-3 py-2 text-white outline-none focus:border-primary/50"
            placeholder="e.g. no paid ads, no crypto, no B2B enterprise sales"
          />
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {saving ? "Saving..." : "Pin as active idea"}
          </button>
          {saved && <span className="text-sm text-primary-light">Saved.</span>}
        </div>
      </form>

      {idea && (
        <p className="mt-6 text-xs text-muted">
          Currently active idea id: <code>{idea.id}</code>
        </p>
      )}
    </div>
  );
}
