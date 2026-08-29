"use client";

import { useState } from "react";
import { MarkdownView } from "@/components/markdown-view";

type RunEvent =
  | { type: "workday_start"; date: string }
  | { type: "agent_start"; agent: string }
  | { type: "agent_done"; agent: string; markdown: string }
  | { type: "agent_error"; agent: string; error: string }
  | { type: "brief_updated" }
  | { type: "workday_done"; date: string; status: string; criticScore: number | null }
  | { type: "workday_error"; error: string };

const AGENT_ORDER = ["orchestrator", "researcher", "product", "builder", "growth", "operator", "critic"];

export function AgentConsole({ endpoint, body, onFinished }: { endpoint: string; body: object; onFinished?: () => void }) {
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<RunEvent[]>([]);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);

  async function start() {
    setRunning(true);
    setLog([]);
    setActiveAgent(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.body) throw new Error("No response stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";
        for (const chunk of chunks) {
          const line = chunk.split("\n").find((l) => l.startsWith("data: "));
          if (!line) continue;
          const event = JSON.parse(line.slice(6)) as RunEvent;
          setLog((prev) => [...prev, event]);
          if (event.type === "agent_start") setActiveAgent(event.agent);
          if (event.type === "agent_done" || event.type === "agent_error") setActiveAgent(null);
        }
      }
    } catch (err) {
      setLog((prev) => [...prev, { type: "workday_error", error: err instanceof Error ? err.message : String(err) }]);
    } finally {
      setRunning(false);
      onFinished?.();
    }
  }

  return (
    <div>
      <button
        onClick={start}
        disabled={running}
        className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {running ? "Running..." : "Run today"}
      </button>

      {log.length > 0 && (
        <div className="mt-6 flex flex-col gap-3">
          {AGENT_ORDER.filter((a) => log.some((e) => "agent" in e && e.agent === a)).map((agent) => {
            const done = log.find((e) => e.type === "agent_done" && e.agent === agent) as Extract<RunEvent, { type: "agent_done" }> | undefined;
            const errored = log.find((e) => e.type === "agent_error" && e.agent === agent) as Extract<RunEvent, { type: "agent_error" }> | undefined;
            const isActive = activeAgent === agent;
            return (
              <div key={agent} className="glass rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${isActive ? "animate-pulse bg-accent" : done ? "bg-primary" : errored ? "bg-red-400" : "bg-white/20"}`}
                  />
                  <span className="text-sm font-semibold capitalize">{agent}</span>
                  {isActive && <span className="text-xs text-muted">working…</span>}
                  {errored && <span className="text-xs text-red-300">failed: {errored.error}</span>}
                </div>
                {done && (
                  <div className="mt-3">
                    <MarkdownView markdown={done.markdown} />
                  </div>
                )}
              </div>
            );
          })}

          {log.some((e) => e.type === "workday_done" || e.type === "workday_error") && (
            <div className="glass rounded-xl p-4 text-sm">
              {log
                .filter((e) => e.type === "workday_done" || e.type === "workday_error")
                .map((e, i) =>
                  e.type === "workday_done" ? (
                    <p key={i} className="text-primary-light">
                      Workday {e.date}: {e.status} {e.criticScore !== null ? `(critic score ${e.criticScore.toFixed(1)}/10)` : ""}
                    </p>
                  ) : (
                    <p key={i} className="text-red-300">
                      Error: {e.error}
                    </p>
                  )
                )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
