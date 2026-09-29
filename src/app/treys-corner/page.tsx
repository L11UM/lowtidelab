import type { Metadata } from "next";
import { ExternalLink, Globe2, Radio, Telescope } from "lucide-react";
import { treysEmbedUrl, treysFeeds } from "@/lib/treys-corner";

export const metadata: Metadata = {
  title: "Trey's Corner",
  description: "A private-ish corner of Low Tide Lab for watching live places around the world.",
};

export default function TreysCornerPage() {
  const liveFeeds = treysFeeds.filter((feed) => feed.kind === "live");
  const directories = treysFeeds.filter((feed) => feed.kind === "directory");

  return (
    <section className="container-x py-10 sm:py-14">
      <header className="mb-8 border-b border-white/10 pb-6">
        <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-accent-light">
          <Telescope className="h-3.5 w-3.5" /> Low Tide Lab · private channel
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Trey&apos;s Corner</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">A world window for Trey: live places, far-away cities, wildlife, and whatever is happening on the other side of the planet.</p>
      </header>

      <section aria-labelledby="live-feeds-heading">
        <div className="mb-4 flex items-center gap-2">
          <Radio className="h-4 w-4 text-red-300" />
          <h2 id="live-feeds-heading" className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Playing now</h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {liveFeeds.map((feed) => (
            <article key={feed.id} className="overflow-hidden rounded-lg border border-border bg-surface">
              <div className="relative aspect-video bg-black">
                <iframe
                  src={treysEmbedUrl(feed) ?? undefined}
                  title={`${feed.place} live stream`}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="absolute inset-0 h-full w-full"
                />
                <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-2 rounded bg-black/65 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" /> Live</span>
              </div>
              <div className="p-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-primary-light">{feed.country}</p>
                <h3 className="mt-1 text-lg font-semibold text-white">{feed.place}</h3>
                <p className="mt-1 text-xs text-muted">{feed.operator}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/70">{feed.note}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="country-desks-heading" className="mt-12">
        <div className="mb-4 flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-primary-light" />
          <h2 id="country-desks-heading" className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Country desks</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {directories.map((feed) => (
            <a key={feed.id} href={feed.url} target="_blank" rel="noreferrer" className="group rounded-lg border border-border bg-surface p-4 transition-colors hover:border-primary/45">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-accent-light">{feed.country}</p>
                  <h3 className="mt-1 font-semibold text-white">{feed.place}</h3>
                </div>
                <ExternalLink className="h-4 w-4 text-muted transition-colors group-hover:text-white" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">{feed.note}</p>
              <p className="mt-3 text-[11px] text-primary-light">Open {feed.operator} →</p>
            </a>
          ))}
        </div>
      </section>

      <p className="mt-8 text-xs leading-relaxed text-muted">Live streams are operated by their listed owners. A channel can go offline, change its broadcast, or become unavailable without notice.</p>
    </section>
  );
}
