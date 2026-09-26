"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowUpRight, CloudLightning, MapPinned, Radio, Waves } from "lucide-react";
import type { CoastalSnapshot } from "@/lib/coastal";

const initial: CoastalSnapshot = {
  updatedAt: "",
  storms: [],
  alerts: [],
  stormFeedAvailable: true,
  alertFeedAvailable: true,
  sources: [],
};

export function CoastalConditions({ compact = false }: { compact?: boolean }) {
  const [snapshot, setSnapshot] = useState<CoastalSnapshot>(initial);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadSnapshot = async () => {
      try {
        const response = await fetch("/api/coastal", { cache: "no-store" });
        if (!response.ok) throw new Error("Coastal data request failed");
        const nextSnapshot: CoastalSnapshot = await response.json();
        if (mounted) setSnapshot(nextSnapshot);
      } catch {
        if (mounted) {
          setSnapshot((current) => ({
            ...current,
            stormFeedAvailable: false,
            alertFeedAvailable: false,
          }));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadSnapshot();
    const interval = window.setInterval(loadSnapshot, 300_000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const visibleAlerts = compact ? snapshot.alerts.slice(0, 2) : snapshot.alerts;
  const visibleStorms = compact ? snapshot.storms.slice(0, 3) : snapshot.storms;

  return (
    <section className={compact ? "rounded-3xl border border-primary/20 bg-primary/[0.04] p-5 sm:p-6" : "container-x py-20"}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="mb-3 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-primary-light">
            <Radio className="h-3.5 w-3.5" /> Coastal conditions
          </span>
          <h2 className={compact ? "text-2xl font-semibold tracking-tight" : "text-3xl font-semibold tracking-tight"}>
            What the coast is doing now.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            Active tropical systems and coastal alerts from NOAA. Refreshes every five minutes.
          </p>
          <p role="status" className="mt-2 text-xs text-muted">
            {snapshot.updatedAt
              ? `Last checked ${new Date(snapshot.updatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
              : loading
                ? "Connecting to live feeds…"
                : "Live feed check unavailable."}
          </p>
        </div>
        {compact && (
          <Link href="/coast" className="inline-flex items-center gap-1 text-sm font-medium text-primary-light hover:text-white">
            Open live view <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="relative min-h-[260px] overflow-hidden rounded-2xl border border-border bg-[#101b25] p-5">
          <div className="absolute inset-0 opacity-35" style={{ backgroundImage: "linear-gradient(rgba(134,193,190,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(134,193,190,.14) 1px, transparent 1px)", backgroundSize: "34px 34px" }} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_38%,rgba(223,155,104,.2),transparent_22%),radial-gradient(circle_at_34%_62%,rgba(63,174,156,.18),transparent_26%)]" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Live storm board</p>
              <p className="mt-1 text-sm text-white/80">Atlantic · Pacific · Central Pacific</p>
            </div>
            <MapPinned className="h-5 w-5 text-primary-light" />
          </div>
          {!loading && !snapshot.stormFeedAvailable && <p role="status" className="relative mt-3 text-xs text-accent-light">NHC feed unavailable; showing the last received data.</p>}
          <div className="relative mt-10 grid gap-3 sm:grid-cols-2">
            {loading ? <p className="text-sm text-muted">Reading NOAA feeds…</p> : visibleStorms.length ? visibleStorms.map((storm) => (
              <div key={storm.id} className="rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">{storm.name}</p>
                  <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] text-accent-light">{storm.basin}</span>
                </div>
                <p className="mt-2 text-xs text-muted">{storm.classification}{storm.windMph ? ` · ${storm.windMph} mph` : ""}</p>
                {storm.movement && <p className="mt-1 text-xs text-white/70">{storm.movement}</p>}
              </div>
            )) : <div className="sm:col-span-2 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-muted">{snapshot.stormFeedAvailable ? "No active named systems in the current NHC feed." : "The NHC storm feed is temporarily unavailable."}</div>}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-accent-light" />
            <p className="text-xs uppercase tracking-wide text-muted">Coastal alerts</p>
          </div>
          {!loading && !snapshot.alertFeedAvailable && <p role="status" className="mt-3 text-xs text-accent-light">NWS feed unavailable; showing the last received data.</p>}
          <div className="mt-4 flex flex-col divide-y divide-border">
            {loading ? <p className="py-3 text-sm text-muted">Checking NWS alerts…</p> : visibleAlerts.length ? visibleAlerts.map((alert) => (
              <a key={alert.id} href={alert.url} target="_blank" rel="noreferrer" className="py-3 transition-colors hover:text-primary-light">
                <p className="text-sm font-medium text-white">{alert.event}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{alert.area} · {alert.headline}</p>
              </a>
            )) : <p className="py-3 text-sm text-muted">{snapshot.alertFeedAvailable ? "No active coastal alerts in the current NWS feed." : "The NWS alert feed is temporarily unavailable."}</p>}
          </div>
        </div>
      </div>

      {!compact && (
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5"><Waves className="h-3.5 w-3.5" /> Tides remain on the home view</span>
          <span className="inline-flex items-center gap-1.5"><CloudLightning className="h-3.5 w-3.5" /> Alerts are informational, not emergency guidance</span>
          <span>Sources: {snapshot.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="ml-1 underline hover:text-white">{source.label}</a>)}</span>
        </div>
      )}
    </section>
  );
}
