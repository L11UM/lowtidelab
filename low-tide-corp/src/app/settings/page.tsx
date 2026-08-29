"use client";

import { useEffect, useState } from "react";

interface Settings {
  provider: string;
  model: string;
  timezone: string;
  maxDollarsPerDay: number;
  agentsOn: Record<string, boolean>;
  ownerName: string;
  ownerEmail: string;
}

const TOGGLEABLE_AGENTS = ["researcher", "product", "builder", "growth", "operator"];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(({ settings }) => setSettings(settings));
  }, []);

  async function save() {
    if (!settings) return;
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: settings.provider,
        model: settings.model,
        timezone: settings.timezone,
        maxDollarsPerDay: settings.maxDollarsPerDay,
        agentsOn: settings.agentsOn,
      }),
    });
    const { settings: updated } = await res.json();
    setSettings(updated);
    setSaving(false);
    setSaved(true);
  }

  if (!settings) {
    return (
      <div className="container-x max-w-2xl py-12">
        <p className="text-sm text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="container-x max-w-2xl py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <div className="mt-8 flex flex-col gap-5">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-white">LLM provider</span>
          <select
            value={settings.provider}
            onChange={(e) => setSettings({ ...settings, provider: e.target.value })}
            className="rounded-lg border border-border bg-panel px-3 py-2 text-white outline-none focus:border-primary/50"
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
          </select>
          <span className="text-xs text-muted">Actual model + API key are set via server env vars (OPENAI_MODEL / ANTHROPIC_MODEL, OPENAI_API_KEY / ANTHROPIC_API_KEY).</span>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-white">Schedule timezone</span>
          <input
            value={settings.timezone}
            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
            className="rounded-lg border border-border bg-panel px-3 py-2 text-white outline-none focus:border-primary/50"
            placeholder="e.g. America/Los_Angeles"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-white">Max $ / day</span>
          <input
            type="number"
            step="0.5"
            value={settings.maxDollarsPerDay}
            onChange={(e) => setSettings({ ...settings, maxDollarsPerDay: Number(e.target.value) })}
            className="rounded-lg border border-border bg-panel px-3 py-2 text-white outline-none focus:border-primary/50"
          />
        </label>

        <div className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-white">Agents on</span>
          {TOGGLEABLE_AGENTS.map((agent) => (
            <label key={agent} className="flex items-center gap-2 capitalize">
              <input
                type="checkbox"
                checked={settings.agentsOn[agent] !== false}
                onChange={(e) => setSettings({ ...settings, agentsOn: { ...settings.agentsOn, [agent]: e.target.checked } })}
              />
              {agent}
            </label>
          ))}
          <span className="text-xs text-muted">Orchestrator and Critic always run and cannot be disabled.</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="w-fit rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save settings"}
          </button>
          {saved && <span className="text-sm text-primary-light">Saved.</span>}
        </div>

        <p className="mt-4 text-xs text-muted">
          Owner / admin contact: {settings.ownerName} — {settings.ownerEmail}
        </p>
      </div>
    </div>
  );
}
