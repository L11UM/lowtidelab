import Link from "next/link";
import { ArrowUpRight, Fish, Signal } from "lucide-react";
import type { DeepSeaCreature } from "@/lib/creatures";

export function CreatureSpotlight({ creature }: { creature: DeepSeaCreature }) {
  return (
    <section className="relative isolate flex min-h-[300px] flex-col justify-between overflow-hidden rounded-2xl border border-primary/25 bg-[#0d2023] p-6 sm:p-7">
      <div className="pointer-events-none absolute -right-16 -top-20 -z-10 h-72 w-72 rounded-full border border-primary/15">
        <div className="absolute inset-7 rounded-full border border-primary/15" />
        <div className="absolute inset-14 rounded-full border border-primary/15" />
        <div className="absolute inset-24 rounded-full border border-primary/20" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-primary/10" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-primary/10" />
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-primary-light">
            <Signal className="h-3.5 w-3.5" /> Abyssal field note · today
          </p>
          <Fish className="h-5 w-5 text-accent-light" />
        </div>
        <p className="mt-8 text-xs uppercase tracking-[0.14em] text-muted">{creature.zone} · {creature.depth}</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">{creature.commonName}</h2>
        <p className="mt-1 font-mono text-xs text-primary-light">{creature.scientificName}</p>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-white/75">{creature.fieldNote}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
        <Link href="/blog" className="inline-flex w-fit items-center gap-2 text-sm font-medium text-white transition-colors hover:text-accent-light">
          Open the creature log <ArrowUpRight className="h-4 w-4" />
        </Link>
        <Link href="/lab" className="inline-flex w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-white">
          Abyssal index <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
