import Link from "next/link";
import { ArrowUpRight, Compass, Radio, Waves } from "lucide-react";
import { CoastalConditions } from "@/components/coastal-conditions";
import { CreatureSpotlight } from "@/components/creature-spotlight";
import { TideTracker } from "@/components/tide-tracker";
import { deepSeaCreatures, getDailyCreature } from "@/lib/creatures";
import { getAllPosts } from "@/lib/posts";

const quickLinks = [
  { href: "/tides", label: "Tide tables", icon: Waves },
  { href: "/coast", label: "Coastal watch", icon: Radio },
  { href: "/blog", label: "Creature log", icon: Compass },
];

export default function HomePage() {
  const newestCreaturePost = getAllPosts().find((post) => post.creature);
  const indexedCreature = deepSeaCreatures.find((item) => item.scientificName === newestCreaturePost?.scientificName);
  const creature = newestCreaturePost ? {
    commonName: newestCreaturePost.creature,
    scientificName: newestCreaturePost.scientificName || "Species details pending",
    depth: indexedCreature?.depth ?? "Depth varies by species",
    zone: indexedCreature?.zone ?? "Deep-sea field note",
    fieldNote: newestCreaturePost.excerpt,
  } : getDailyCreature();

  return (
    <div className="container-x pb-16 pt-8 sm:pt-12">
      <header className="flex flex-col justify-between gap-6 border-b border-white/10 pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-primary-light">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Low Tide Lab · Submarine 04
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Ocean intelligence</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">Tides, coastal conditions, and life below the light. A quiet instrument panel for a restless ocean.</p>
        </div>
        <nav aria-label="Ocean instruments" className="flex flex-wrap gap-2">
          {quickLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/80 transition-colors hover:border-primary/50 hover:text-white">
              <Icon className="h-3.5 w-3.5 text-primary-light" />{label}<ArrowUpRight className="h-3 w-3 text-muted" />
            </Link>
          ))}
        </nav>
      </header>

      <section aria-label="Surface instruments" className="grid gap-5 py-6 xl:grid-cols-[1.1fr_0.9fr]">
        <TideTracker />
        <CreatureSpotlight creature={creature} />
      </section>

      <CoastalConditions compact />

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-[11px] text-muted">
        <span>NOAA CO-OPS · National Hurricane Center · National Weather Service</span>
        <Link href="/about" className="transition-colors hover:text-white">Mission & data sources <ArrowUpRight className="inline h-3 w-3" /></Link>
      </footer>
    </div>
  );
}
