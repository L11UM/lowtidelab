import type { Metadata } from "next";
import { Telescope } from "lucide-react";
import { TreysCorner } from "@/components/treys-corner";
import { treysFeeds } from "@/lib/treys-corner";

export const metadata: Metadata = {
  title: "Trey's Corner",
  description: "A private-ish corner of Low Tide Lab for watching live places around the world.",
};

export default function TreysCornerPage() {
  return (
    <section className="container-x py-10 sm:py-14">
      <header className="mb-8 border-b border-white/10 pb-6">
        <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-accent-light">
          <Telescope className="h-3.5 w-3.5" /> Low Tide Lab · private channel
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Trey&apos;s Corner</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">A world window for Trey: live places, far-away cities, wildlife, and whatever is happening on the other side of the planet.</p>
      </header>

      <TreysCorner feeds={treysFeeds} />
    </section>
  );
}
