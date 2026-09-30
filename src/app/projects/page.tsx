import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Fish, Radio, Video, Waves } from "lucide-react";

export const metadata: Metadata = {
  title: "Ocean Systems",
  description: "Navigate the Low Tide Lab ocean intelligence instruments.",
};

const systems = [
  { href: "/tides", label: "Tide tables", detail: "Compare predictions across three Southern California stations.", icon: Waves, status: "NOAA CO-OPS" },
  { href: "/coast", label: "Coastal watch", detail: "Track active storms and current watches, warnings, and advisories.", icon: Radio, status: "NHC · NWS" },
  { href: "/piers", label: "Pier scope", detail: "Look in on live coastal cameras and pier conditions.", icon: Video, status: "Live cameras" },
  { href: "/fishing-report", label: "Fishing report", detail: "Check weather, target species, and trip notes for Northern Arizona waters.", icon: Fish, status: "Northern Arizona" },
];

export default function ProjectsPage() {
  return (
    <section className="container-x py-12 sm:py-16">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary-light">Ocean systems · instrument index</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Choose a signal</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">A compact index of the tools tracking changing water.</p>
      <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
        {systems.map(({ href, label, detail, icon: Icon, status }) => <Link key={href} href={href} className="group flex flex-wrap items-center gap-4 py-5 transition-colors hover:text-white">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] text-primary-light"><Icon className="h-5 w-5" /></span>
          <span className="min-w-0 flex-1"><span className="block font-medium text-white">{label}</span><span className="mt-1 block text-sm text-muted">{detail}</span></span>
          <span className="text-[10px] uppercase tracking-[0.14em] text-muted">{status}</span>
          <ArrowUpRight className="h-4 w-4 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>)}
      </div>
    </section>
  );
}