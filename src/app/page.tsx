import Link from "next/link";
import { ArrowUpRight, Fish, Telescope, Video } from "lucide-react";
import { HomeSpot } from "@/components/home-spot";

const shortcuts = [
  { href: "/fishing-report", label: "Fishing report", detail: "Northern Arizona waters", icon: Fish },
  { href: "/piers", label: "Pier Scope", detail: "Live coast cameras", icon: Video },
  { href: "/treys-corner", label: "Trey's Corner", detail: "World cams and AI timeline", icon: Telescope },
];

export default function HomePage() {
  return (
    <div className="container-x pb-12 pt-9 sm:pb-16 sm:pt-12">
      <header className="max-w-3xl border-b border-white/10 pb-7 sm:pb-9">
        <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-primary-light">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Low Tide Lab <span className="text-white/25">/</span> Crew desk
        </p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-4xl">Find your water. Check the signal.</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">The fishing spots and live views our crew comes back to.</p>
      </header>

      <nav aria-label="Crew favorites" className="grid border-b border-white/10 sm:grid-cols-3">
        {shortcuts.map(({ href, label, detail, icon: Icon }) => (
          <Link key={href} href={href} className="group flex items-center gap-3 border-t border-white/10 py-3 transition-colors hover:text-white sm:border-t-0 sm:px-3 sm:first:pl-0 sm:last:pr-0">
            <Icon className="h-4 w-4 shrink-0 text-primary-light" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-white">{label}</span>
              <span className="mt-0.5 block text-xs text-muted">{detail}</span>
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        ))}
      </nav>

      <section aria-label="Your home break" className="py-6 sm:py-8">
        <HomeSpot />
      </section>

      <section aria-label="Data sources" className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-[11px] text-muted">
        <span>NOAA CO-OPS · Open-Meteo</span>
        <Link href="/about" className="transition-colors hover:text-white">Mission & data sources <ArrowUpRight className="inline h-3 w-3" /></Link>
      </section>
    </div>
  );
}
