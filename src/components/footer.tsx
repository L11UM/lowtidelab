import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="container-x flex flex-col justify-between gap-5 py-7 sm:flex-row sm:items-center">
        <p className="inline-flex items-center gap-2 text-xs text-muted"><ShieldCheck className="h-4 w-4 text-primary-light" /> Low Tide Lab · Train together. Operate ready.</p>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
          <Link href="/#catalog" className="hover:text-white">Skill catalog</Link>
          <Link href="/#ems" className="hover:text-white">EMS</Link>
          <Link href="/#fire" className="hover:text-white">Fire</Link>
          <Link href="/#shared" className="hover:text-white">Shared skills</Link>
        </nav>
      </div>
    </footer>
  );
}
