import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { CoastalConditions } from "@/components/coastal-conditions";

export const metadata: Metadata = {
  title: "Coastal Conditions",
  description: "Live NOAA tropical systems and National Weather Service coastal alerts.",
};

export default function CoastPage() {
  if (process.env.NEXT_PUBLIC_CONDITIONS_ENABLED !== "true") notFound();

  return (
    <>
      <section className="container-x pt-20 sm:pt-28">
        <Reveal>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to Low Tide Lab
          </Link>
          <p className="mt-10 text-xs font-medium uppercase tracking-[0.18em] text-primary-light">Low Tide Lab · live view</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
            A clearer read on a restless coast.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            Tropical systems, coastal alerts, and the tide context beneath them — drawn from NOAA and the National Weather Service, with the source always visible.
          </p>
        </Reveal>
      </section>
      <CoastalConditions />
    </>
  );
}
