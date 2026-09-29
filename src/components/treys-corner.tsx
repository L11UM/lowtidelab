"use client";

import { useCallback, useEffect, useState } from "react";
import { clsx } from "clsx";
import { ChevronLeft, ChevronRight, ExternalLink, Globe2, LayoutGrid, Radio, Square } from "lucide-react";
import { AiTimeMachine } from "@/components/ai-time-machine";
import { treysEmbedUrl, type TreysFeed } from "@/lib/treys-corner";

function FeedPlayer({ feed }: { feed: TreysFeed }) {
  const embedUrl = treysEmbedUrl(feed);
  if (!embedUrl) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface px-6 text-center">
        <p className="max-w-sm text-sm text-white/75">This broadcaster blocks playback inside other sites.</p>
        <a href={feed.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-xs font-medium text-white transition-colors hover:border-primary/50 hover:bg-white/5">
          Watch on YouTube <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    );
  }

  return (
    <iframe
      key={feed.id}
      src={embedUrl}
      title={`${feed.place} live stream`}
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      referrerPolicy="strict-origin-when-cross-origin"
      loading="lazy"
      className="absolute inset-0 h-full w-full"
    />
  );
}

export function TreysCorner({ feeds }: { feeds: TreysFeed[] }) {
  const liveFeeds = feeds.filter((feed) => feed.kind === "live");
  const directories = feeds.filter((feed) => feed.kind === "directory");
  const [index, setIndex] = useState(0);
  const [wall, setWall] = useState(false);
  const feed = liveFeeds[index];

  const select = useCallback((next: number) => {
    setIndex((next + liveFeeds.length) % liveFeeds.length);
  }, [liveFeeds.length]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (wall || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === "ArrowRight") select(index + 1);
      if (event.key === "ArrowLeft") select(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, select, wall]);

  return (
    <>
      <section aria-label="Live camera views">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-md border border-white/10 bg-white/[0.03] p-1 text-xs" role="group" aria-label="View mode">
            <button type="button" onClick={() => setWall(false)} aria-pressed={!wall} className={clsx("inline-flex items-center gap-1.5 rounded px-3 py-1.5 transition-colors", !wall ? "bg-white/10 text-white" : "text-muted hover:text-white")}>
              <Square className="h-3.5 w-3.5" /> Scope
            </button>
            <button type="button" onClick={() => setWall(true)} aria-pressed={wall} className={clsx("inline-flex items-center gap-1.5 rounded px-3 py-1.5 transition-colors", wall ? "bg-white/10 text-white" : "text-muted hover:text-white")}>
              <LayoutGrid className="h-3.5 w-3.5" /> Wall
            </button>
          </div>
          <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" /> {liveFeeds.length} live channels
          </span>
        </div>

        {wall ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {liveFeeds.map((item) => (
              <figure key={item.id} className="overflow-hidden rounded-lg border border-white/10 bg-black">
                <div className="relative aspect-video">
                  <FeedPlayer feed={item} />
                  <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-2 rounded bg-black/65 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" /> Live · {item.country}</span>
                </div>
                <figcaption className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
                  <span className="truncate text-white">{item.place}</span>
                  <span className="shrink-0 text-muted">{item.operator}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
            <section aria-label={`${feed.place} live view`}>
              <div className="relative aspect-video overflow-hidden rounded-lg border border-primary/25 bg-black shadow-glow">
                <FeedPlayer feed={feed} />
                <span className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-2 rounded bg-black/65 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" /> Live · {feed.country}</span>
              </div>
              <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-primary-light">{feed.country}</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">{feed.place}</h2>
                  <p className="mt-1 text-xs text-muted">{feed.operator}</p>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75">{feed.note}</p>
                </div>
                <a href={feed.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary-light hover:text-white">
                  Open source <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                <button type="button" onClick={() => select(index - 1)} aria-label="Previous live feed" title="Previous feed (left arrow)" className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-2 text-xs text-white/80 transition-colors hover:border-primary/50 hover:text-white">
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                <span className="font-mono text-[11px] tabular-nums text-muted">{String(index + 1).padStart(2, "0")} / {String(liveFeeds.length).padStart(2, "0")}</span>
                <button type="button" onClick={() => select(index + 1)} aria-label="Next live feed" title="Next feed (right arrow)" className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-2 text-xs text-white/80 transition-colors hover:border-primary/50 hover:text-white">
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </section>

            <nav aria-label="Live channels" className="lg:border-l lg:border-white/10 lg:pl-4">
              <p className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted"><Radio className="h-3.5 w-3.5 text-primary-light" /> Channels</p>
              <ol className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
                {liveFeeds.map((item, itemIndex) => (
                  <li key={item.id}>
                    <button type="button" onClick={() => select(itemIndex)} aria-current={itemIndex === index} className={clsx("flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors", itemIndex === index ? "bg-primary/15 text-white" : "text-white/75 hover:bg-white/5 hover:text-white")}>
                      <span className="font-mono text-[11px] text-muted">{String(itemIndex + 1).padStart(2, "0")}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">{item.country}</span>
                        <span className="block truncate text-[11px] text-muted">{item.place}</span>
                      </span>
                      {itemIndex === index && <span className="h-1.5 w-1.5 rounded-full bg-red-500" />}
                    </button>
                  </li>
                ))}
              </ol>
              <p className="mt-3 hidden text-[11px] text-muted lg:block">Use ← → to change feeds.</p>
            </nav>
          </div>
        )}
      </section>

      <AiTimeMachine />

      <section aria-labelledby="country-desks-heading" className="mt-12">
        <div className="mb-4 flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-primary-light" />
          <h2 id="country-desks-heading" className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Country desks</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {directories.map((item) => (
            <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="group rounded-lg border border-border bg-surface p-4 transition-colors hover:border-primary/45">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-accent-light">{item.country}</p>
                  <h3 className="mt-1 font-semibold text-white">{item.place}</h3>
                </div>
                <ExternalLink className="h-4 w-4 text-muted transition-colors group-hover:text-white" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.note}</p>
              <p className="mt-3 text-[11px] text-primary-light">Open {item.operator} →</p>
            </a>
          ))}
        </div>
      </section>

      <p className="mt-8 text-xs leading-relaxed text-muted">Live streams are operated by their listed owners. A channel can go offline, change its broadcast, or become unavailable without notice.</p>
    </>
  );
}
