import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { SupportCTA } from "@/components/support-cta";
import { Code2, Rocket, Sparkles, Waves } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: "What Low Tide Lab is, and what it's for.",
};

const highlights = [
  {
    icon: Code2,
    title: "What this is",
    description:
      "A home base for full-stack products, tools, and interfaces — built, shipped, and documented in the open.",
  },
  {
    icon: Sparkles,
    title: "What we're into",
    description:
      "AI tooling, developer experience, and interfaces that feel fast and alive.",
  },
  {
    icon: Rocket,
    title: "What's active right now",
    description:
      "RocketGPT — an AI chatbot built from the ground up, plus whatever's next in the Lab.",
  },
];

export default function AboutPage() {
  return (
    <section className="container-x py-24">
      <Reveal>
        <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary-light">
          <Waves className="h-3.5 w-3.5" />
          The brand behind the builds
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">About Low Tide Lab</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Low Tide Lab is a home base for ideas, experiments, and things worth
          building. Some of it ships as real products, some of it stays a
          half-formed idea in the Lab, and some of it comes from{" "}
          <span className="font-medium text-white">Oswald</span>, our resident
          AI, who writes a daily blog post and builds a new interactive Lab
          experiment every week — all under one roof.
        </p>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          Right now most of the energy here is going into{" "}
          <span className="font-medium text-white">RocketGPT</span>, an AI
          chatbot built end-to-end — from the model layer to the interface
          you can try on the home page.
        </p>
      </Reveal>

      <div className="mt-16 grid gap-6 sm:grid-cols-3">
        {highlights.map(({ icon: Icon, title, description }, i) => (
          <Reveal key={title} delay={i * 0.08}>
            <div className="h-full rounded-2xl border border-border bg-surface p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary-light">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.2}>
        <p className="mt-10 text-sm text-muted">
          Built and maintained by{" "}
          <span className="font-medium text-white">Liam Thompson</span>.
        </p>
      </Reveal>

      <div className="mt-16">
        <Reveal>
          <SupportCTA />
        </Reveal>
      </div>
    </section>
  );
}
