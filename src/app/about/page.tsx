import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { SupportCTA } from "@/components/support-cta";
import { Code2, Rocket, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: "A bit about who I am and what I'm building.",
};

const highlights = [
  {
    icon: Code2,
    title: "What I do",
    description:
      "I design and build full-stack products — from polished front-ends to the systems behind them.",
  },
  {
    icon: Sparkles,
    title: "What I'm into",
    description:
      "AI tooling, developer experience, and interfaces that feel fast and alive.",
  },
  {
    icon: Rocket,
    title: "What I'm building now",
    description:
      "RocketGPT — a chatbot I'm designing from the ground up, plus whatever's next in the Lab.",
  },
];

export default function AboutPage() {
  return (
    <section className="container-x py-24">
      <Reveal>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">About Me</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Hey, I&apos;m yourname — a developer who likes turning ideas into
          real, working things. This site is part portfolio, part lab
          notebook: a place to show finished projects and think out loud
          about what&apos;s next.
        </p>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          Right now most of my energy is going into{" "}
          <span className="font-medium text-white">RocketGPT</span>, an AI
          chatbot I&apos;m building end-to-end — from the model layer to the
          interface you can try on the home page.
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

      <div className="mt-16">
        <Reveal>
          <SupportCTA />
        </Reveal>
      </div>
    </section>
  );
}
