import Link from "next/link";
import { Anchor } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="container-x flex flex-col justify-between gap-5 py-7 sm:flex-row sm:items-center">
        <p className="inline-flex items-center gap-2 text-xs text-muted"><Anchor className="h-4 w-4 text-primary-light" /> Low Tide Lab · Ocean intelligence for curious crews</p>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
          <Link href="/tides" className="hover:text-white">Tides</Link>
          <Link href="/piers" className="hover:text-white">Piers</Link>
          <Link href="/coast" className="hover:text-white">Conditions</Link>
          <Link href="/blog" className="hover:text-white">Creature Log</Link>
          <Link href="/about" className="hover:text-white">Mission</Link>
        </nav>
      </div>
    </footer>
  );
}
