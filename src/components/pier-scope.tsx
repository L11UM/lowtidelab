"use client";

import { useCallback, useEffect, useState } from "react";
import { clsx } from "clsx";
import { ExternalLink, LayoutGrid, Pause, Play, Radio, Square } from "lucide-react";
import { pierCams, pierEmbedUrl, pierWatchUrl, type PierCam } from "@/lib/piers";

const CRUISE_SECONDS = 60;

function useLocalTime(timeZone: string) {
  const [time, setTime] = useState("");
  useEffect(() => {
    const format = () => setTime(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit", timeZone }));
    format();
    const id = window.setInterval(format, 1000);
    return () => window.clearInterval(id);
  }, [timeZone]);
  return time;
}

function CamFrame({ cam, title }: { cam: PierCam; title: string }) {
  return (
    <iframe
      key={cam.youtubeId}
      src={pierEmbedUrl(cam)}
      title={title}
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      referrerPolicy="strict-origin-when-cross-origin"
      className="absolute inset-0 h-full w-full"
    />
  );
}

function ScopeOverlay({ cam }: { cam: PierCam }) {
  const time = useLocalTime(cam.timeZone);
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.12)_0px,rgba(0,0,0,0.12)_1px,transparent_1px,transparent_3px)] opacity-40" />
      <div className="absolute inset-3 sm:inset-5">
        <span className="absolute left-0 top-0 h-5 w-5 border-l border-t border-primary-light/70" />
        <span className="absolute right-0 top-0 h-5 w-5 border-r border-t border-primary-light/70" />
        <span className="absolute bottom-0 left-0 h-5 w-5 border-b border-l border-primary-light/70" />
        <span className="absolute bottom-0 right-0 h-5 w-5 border-b border-r border-primary-light/70" />
      </div>
      <div className="absolute left-5 top-5 flex items-center gap-2 rounded bg-black/55 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/90 sm:left-8 sm:top-8">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" /> Live · {cam.coast}
      </div>
      <div className="absolute right-5 top-5 rounded bg-black/55 px-2 py-1 font-mono text-[10px] tabular-nums text-white/90 sm:right-8 sm:top-8">
        {time} local
      </div>
    </div>
  );
}

export function PierScope() {
  const [index, setIndex] = useState(0);
  const [cruising, setCruising] = useState(false);
  const [countdown, setCountdown] = useState(CRUISE_SECONDS);
  const [wall, setWall] = useState(false);
  const cam = pierCams[index];

  const select = useCallback((next: number) => {
    setIndex((next + pierCams.length) % pierCams.length);
    setCountdown(CRUISE_SECONDS);
  }, []);

  useEffect(() => {
    if (!cruising || wall) return;
    const id = window.setInterval(() => setCountdown((seconds) => seconds - 1), 1000);
    return () => window.clearInterval(id);
  }, [cruising, wall]);

  useEffect(() => {
    if (countdown <= 0) select(index + 1);
  }, [countdown, index, select]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (wall || event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) return;
      if (event.key === "ArrowRight") select(index + 1);
      if (event.key === "ArrowLeft") select(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, select, wall]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-md border border-white/10 bg-white/[0.03] p-1 text-xs" role="group" aria-label="View mode">
          <button type="button" onClick={() => setWall(false)} aria-pressed={!wall} className={clsx("inline-flex items-center gap-1.5 rounded px-3 py-1.5 transition-colors", !wall ? "bg-white/10 text-white" : "text-muted hover:text-white")}>
            <Square className="h-3.5 w-3.5" /> Scope
          </button>
          <button type="button" onClick={() => setWall(true)} aria-pressed={wall} className={clsx("inline-flex items-center gap-1.5 rounded px-3 py-1.5 transition-colors", wall ? "bg-white/10 text-white" : "text-muted hover:text-white")}>
            <LayoutGrid className="h-3.5 w-3.5" /> Wall
          </button>
        </div>
        {!wall && (
          <button type="button" onClick={() => { setCruising((value) => !value); setCountdown(CRUISE_SECONDS); }} aria-pressed={cruising} className={clsx("inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition-colors", cruising ? "border-accent/50 bg-accent/10 text-accent-light" : "border-white/10 text-white/80 hover:border-primary/50 hover:text-white")}>
            {cruising ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {cruising ? `Cruising · next pier in ${countdown}s` : "Auto-cruise the coast"}
          </button>
        )}
      </div>

      {wall ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {pierCams.map((item) => (
            <figure key={item.id} className="overflow-hidden rounded-lg border border-white/10 bg-black">
              <div className="relative aspect-video">
                <CamFrame cam={item} title={`${item.pier} live camera`} />
              </div>
              <figcaption className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
                <span className="truncate text-white">{item.pier}</span>
                <span className="shrink-0 text-muted">{item.coast}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <section aria-label={`${cam.pier} live view`}>
            <div className="relative aspect-video overflow-hidden rounded-lg border border-primary/25 bg-black shadow-glow">
              <CamFrame cam={cam} title={`${cam.pier} live camera`} />
              <ScopeOverlay cam={cam} />
            </div>
            <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">{cam.pier}</h2>
                <p className="mt-1 text-sm text-muted">{cam.place} · {cam.operator}</p>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75">{cam.note}</p>
              </div>
              <a href={pierWatchUrl(cam)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary-light hover:text-white">
                Open on YouTube <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </section>

          <nav aria-label="Pier channels" className="lg:border-l lg:border-white/10 lg:pl-4">
            <p className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted"><Radio className="h-3.5 w-3.5 text-primary-light" /> Channels</p>
            <ol className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
              {pierCams.map((item, i) => (
                <li key={item.id}>
                  <button type="button" onClick={() => select(i)} aria-current={i === index} className={clsx("flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors", i === index ? "bg-primary/15 text-white" : "text-white/75 hover:bg-white/5 hover:text-white")}>
                    <span className="font-mono text-[11px] text-muted">{String(i + 1).padStart(2, "0")}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">{item.pier}</span>
                      <span className="block truncate text-[11px] text-muted">{item.place}</span>
                    </span>
                    {i === index && <span className="h-1.5 w-1.5 rounded-full bg-red-500" />}
                  </button>
                </li>
              ))}
            </ol>
            <p className="mt-3 hidden text-[11px] text-muted lg:block">Use ← → to change piers.</p>
          </nav>
        </div>
      )}
    </div>
  );
}
