import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Map as MapIcon } from "lucide-react";
import { CoastChart } from "@/components/coast-chart";

export const metadata: Metadata = {
  title: "Coast Chart",
  description: "A live chart of Low Tide Lab's pier cameras, NOAA tide stations, and active tropical storms.",
};

export default function MapPage() {
  if (process.env.NEXT_PUBLIC_MAP_ENABLED !== "true") notFound();

  return (
    <section className="container-x py-10 sm:py-14">
      <header className="mb-6 border-b border-white/10 pb-6">
        <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-primary-light">
          <MapIcon className="h-3.5 w-3.5" /> Navigation chart · every signal in one place
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Coast chart</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">Pier cams, tide stations, and active storms plotted together. Select any marker to open its feed.</p>
      </header>
      <CoastChart />
    </section>
  );
}
