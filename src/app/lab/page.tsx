import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Fish } from "lucide-react";
import { deepSeaCreatures } from "@/lib/creatures";

export const metadata: Metadata = {
  title: "Abyssal Index",
  description: "A field guide to animals living below the sunlit ocean.",
};

export default function AbyssalIndexPage() {
  return (
    <section className="container-x py-12 sm:py-16">
      <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-primary-light"><Fish className="h-3.5 w-3.5" /> Field guide · low-light life</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Abyssal index</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">A starting chart for the remarkable animals of the twilight, midnight, and vent zones. Depths are approximate and can vary by species and life stage.</p>
        </div>
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-primary-light hover:text-white">Open field gear <ArrowUpRight className="h-4 w-4" /></Link>
      </div>

      <div className="mt-8 overflow-x-auto border-y border-white/10">
        <table className="w-full min-w-[600px] text-left">
          <thead className="text-[10px] uppercase tracking-[0.16em] text-muted">
            <tr><th className="py-3 pr-5 font-medium">Species</th><th className="py-3 pr-5 font-medium">Zone</th><th className="py-3 font-medium">Observed depth</th></tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {deepSeaCreatures.map((creature) => <tr key={creature.scientificName}>
              <td className="py-4 pr-5"><span className="block text-sm font-medium text-white">{creature.commonName}</span><span className="mt-1 block font-mono text-xs text-primary-light">{creature.scientificName}</span></td>
              <td className="py-4 pr-5 text-sm text-white/75">{creature.zone}</td>
              <td className="py-4 text-sm tabular-nums text-white/75">{creature.depth}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </section>
  );
}