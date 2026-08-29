import { clsx } from "clsx";

export function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted">no score</span>;
  }
  const color = score >= 7 ? "text-primary-light border-primary/40 bg-primary/10" : score >= 4 ? "text-accent-light border-accent/40 bg-accent/10" : "text-red-300 border-red-400/40 bg-red-400/10";
  return <span className={clsx("rounded-full border px-2.5 py-0.5 text-xs font-semibold", color)}>{score.toFixed(1)}/10</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    done: "text-primary-light border-primary/40 bg-primary/10",
    running: "text-accent-light border-accent/40 bg-accent/10 animate-pulse",
    queued: "text-muted border-border bg-white/5",
    failed: "text-red-300 border-red-400/40 bg-red-400/10",
  };
  return (
    <span className={clsx("rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize", map[status] ?? map.queued)}>
      {status}
    </span>
  );
}
