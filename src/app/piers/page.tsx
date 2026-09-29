import type { Metadata } from "next";
import { Video } from "lucide-react";
import { PierScope } from "@/components/pier-scope";
import { pierCams } from "@/lib/piers";

export const metadata: Metadata = {
  title: "Pier Scope",
  description: "Live California pier cameras from Santa Monica through Oceanside.",
};

export default function PiersPage() {
  return (
    <section className="container-x py-10 sm:py-14">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-white/10 pb-6">
        <div>
          <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-primary-light">
            <Video className="h-3.5 w-3.5" /> Periscope · live surface feeds
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Pier scope</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">Raise the periscope on {pierCams.length} California pier cameras. Feeds play muted; unmute from the player.</p>
        </div>
      </header>
      <PierScope />
      <p className="mt-6 text-xs leading-relaxed text-muted">Streams are operated by their listed owners and embedded from YouTube. A feed may go dark when its operator is offline or restarts a broadcast.</p>
    </section>
  );
}
