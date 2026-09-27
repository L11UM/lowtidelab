import type { Metadata } from "next";
import { Anchor, Clock3, Waves } from "lucide-react";
import { TideTracker } from "@/components/tide-tracker";
import { tideStations } from "@/lib/tides";

export const metadata: Metadata = {
  title: "Tide Tables",
  description: "Explore two-day NOAA tide predictions across three Southern California stations.",
};

export default function TidesPage() {
  return (
    <section className="container-x py-10 sm:py-14">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-white/10 pb-6">
        <div>
          <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-primary-light">
            <Waves className="h-3.5 w-3.5" /> Navigation instruments · NOAA CO-OPS
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Tide tables</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">Compare two days of predicted water levels from Santa Monica through Newport Bay.</p>
        </div>
        <div className="flex items-center gap-5 text-xs text-muted">
          <span className="inline-flex items-center gap-2"><Anchor className="h-4 w-4 text-primary-light" /> {tideStations.length} stations</span>
          <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-accent-light" /> Local station time</span>
        </div>
      </header>
      <TideTracker fullWidth />
      <p className="mt-4 text-xs leading-relaxed text-muted">Predictions are provided by NOAA Center for Operational Oceanographic Products and Services. Heights are relative to MLLW and shown in feet.</p>
    </section>
  );
}
