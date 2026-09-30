import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CoastalConditions } from "@/components/coastal-conditions";
import { HomeSpot } from "@/components/home-spot";

export default function HomePage() {
  return (
    <div className="container-x pb-12 pt-9 sm:pb-16 sm:pt-12">
      <header className="max-w-3xl border-b border-white/10 pb-7 sm:pb-9">
        <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-primary-light">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Low Tide Lab <span className="text-white/25">/</span> Coast desk
        </p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-4xl">A clearer read on the coast.</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">Your home break, the moving tide, and official coastal conditions in one place.</p>
      </header>

      <section aria-label="Your home break" className="py-6 sm:py-8">
        <HomeSpot />
      </section>

      <section aria-label="Coastal conditions" className="border-t border-white/10 pt-6 sm:pt-8">
        <CoastalConditions compact />
      </section>

      <section aria-label="Data sources" className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-[11px] text-muted">
        <span>NOAA CO-OPS · National Hurricane Center · National Weather Service</span>
        <Link href="/about" className="transition-colors hover:text-white">Mission & data sources <ArrowUpRight className="inline h-3 w-3" /></Link>
      </section>
    </div>
  );
}
