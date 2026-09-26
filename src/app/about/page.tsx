import type { Metadata } from "next";
import { Compass, Radio, Waves } from "lucide-react";

export const metadata: Metadata = {
  title: "Mission Brief",
  description: "How Low Tide Lab gathers ocean intelligence and where its data comes from.",
};

const sources = [
  { label: "NOAA CO-OPS", detail: "Tide predictions from coastal stations.", href: "https://api.tidesandcurrents.noaa.gov/api/prod/" },
  { label: "National Hurricane Center", detail: "Active tropical systems and advisories.", href: "https://www.nhc.noaa.gov/" },
  { label: "National Weather Service", detail: "Current watches, warnings, and alerts.", href: "https://api.weather.gov/" },
  { label: "MBARI", detail: "Deep-sea natural history and research.", href: "https://www.mbari.org/education/animals-of-the-deep/" },
];

export default function AboutPage() {
  return (
    <section className="container-x py-12 sm:py-16">
      <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-primary-light"><Compass className="h-3.5 w-3.5" /> Mission brief · Low Tide Lab</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Observe more. Assume less.</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">Low Tide Lab is an ocean-intelligence desk built around public marine data and natural history. It tracks the pull of the tide, watches active coastal conditions, and keeps a daily log of life in the deep.</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <section className="rounded-lg border border-border bg-surface p-5">
          <Waves className="h-5 w-5 text-primary-light" />
          <h2 className="mt-4 font-semibold text-white">Signals, not certainty</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">Measurements and alerts are shown with their source and update cadence. NOAA tide predictions describe expected water levels, not a substitute for local safety guidance.</p>
        </section>
        <section className="rounded-lg border border-border bg-surface p-5">
          <Radio className="h-5 w-5 text-accent-light" />
          <h2 className="mt-4 font-semibold text-white">A small crew, open waters</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">The dashboard uses public feeds and published research. Daily creature notes are automated and identify their references so the trail stays inspectable.</p>
        </section>
      </div>

      <h2 className="mt-12 text-xs font-medium uppercase tracking-[0.16em] text-muted">Signal sources</h2>
      <ul className="mt-3 divide-y divide-white/10 border-y border-white/10">
        {sources.map((source) => <li key={source.label} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
          <a href={source.href} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary-light hover:text-white">{source.label}</a>
          <span className="text-xs text-muted">{source.detail}</span>
        </li>)}
      </ul>
    </section>
  );
}