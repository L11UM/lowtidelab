import Link from "next/link";
import { Anchor } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="container-x flex flex-col justify-between gap-5 py-7 sm:flex-row sm:items-center">
        <p className="inline-flex items-center gap-2 text-xs text-muted"><Anchor className="h-4 w-4 text-primary-light" /> Low Tide Lab · Coastal signals, clearly read</p>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
          <Link href="/tides" className="hover:text-white">Tides</Link>
          <Link href="/piers" className="hover:text-white">Piers</Link>
          <Link href="/fishing-report" className="hover:text-white">Fishing Report</Link>
          <Link href="/coast" className="hover:text-white">Conditions</Link>
          <Link href="/treys-corner" className="hover:text-white">Trey&apos;s Corner</Link>
          <Link href="/about" className="hover:text-white">Mission</Link>
        </nav>
      </div>
    </footer>
  );
}
