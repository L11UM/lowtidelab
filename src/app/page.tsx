import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { ProjectCard } from "@/components/project-card";
import { ChatDemo } from "@/components/chat-demo";
import { WaitlistForm } from "@/components/waitlist-form";
import { SupportCTA } from "@/components/support-cta";
import { TideTracker } from "@/components/tide-tracker";
import { projects, type Project } from "@/lib/data";

export default function HomePage() {
  const featured = projects.filter((p) => p.featured).slice(0, 3);
  const rest = projects.filter((p) => !p.featured).slice(0, 2);
  const highlighted = [...featured, ...rest].slice(0, 3);

  return (
    <>
      <Hero />
      <FeaturedProjects projects={highlighted} />
      <RocketGPTSection />
      <SupportSection />
    </>
  );
}

function Hero() {
  return (
    <section className="container-x flex min-h-[85vh] flex-col justify-center py-24">
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Reveal>
            <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary-light">
              <Sparkles className="h-3.5 w-3.5" />
              Currently building RocketGPT
            </span>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
              Low tide is when{" "}
              <span className="text-gradient">the interesting stuff surfaces.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-6 max-w-xl text-lg text-muted">
              Low Tide Lab is a home base for ideas, experiments, and things worth
              building — including{" "}
              <span className="font-medium text-white">RocketGPT</span>, an AI
              chatbot, and a blog written entirely by AI, one day at a time.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/projects"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.03] active:scale-[0.98]"
              >
                View Projects
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/lab"
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-white/90 transition-colors hover:border-white/30 hover:bg-white/5"
              >
                Explore the Lab
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            <p className="mt-8 hidden items-center gap-2 text-xs text-muted sm:flex">
              Tip: press
              <kbd className="rounded border border-border bg-surface2 px-1.5 py-0.5 font-mono text-[11px] text-white/80">
                ⌘K
              </kbd>
              to jump anywhere on this site
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.25} className="flex justify-center lg:justify-end">
          <TideTracker />
        </Reveal>
      </div>
    </section>
  );
}

function FeaturedProjects({ projects }: { projects: Project[] }) {
  return (
    <section className="container-x py-16">
      <Reveal>
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Featured Work
            </h2>
            <p className="mt-2 text-muted">A few things I&apos;ve been building.</p>
          </div>
          <Link
            href="/projects"
            className="hidden items-center gap-1 text-sm font-medium text-primary-light hover:text-white sm:inline-flex"
          >
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Reveal>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => (
          <Reveal key={project.slug} delay={i * 0.08}>
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function RocketGPTSection() {
  return (
    <section className="container-x py-16">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <Reveal>
          <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent-light">
            Live Demo
          </span>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Meet <span className="text-gradient">RocketGPT</span>
          </h2>
          <p className="mt-4 max-w-md text-muted">
            A fast, focused AI chatbot built in the Lab from scratch. Try
            the interactive demo below — it&apos;s a placeholder UI wired
            up to simulate real responses until the live model is connected.
          </p>
          <Link
            href="/projects"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary-light hover:text-white"
          >
            Read more about the project <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="mt-8">
            <WaitlistForm />
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <ChatDemo />
        </Reveal>
      </div>
    </section>
  );
}

function SupportSection() {
  return (
    <section className="container-x py-16">
      <Reveal>
        <SupportCTA />
      </Reveal>
    </section>
  );
}
