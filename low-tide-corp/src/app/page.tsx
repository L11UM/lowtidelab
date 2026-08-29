import Link from "next/link";
import { owner } from "@/lib/owner";

export default function HomePage() {
  return (
    <div className="container-x py-16">
      <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent-light">
        An experiment, run daily
      </span>
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
        A tiny AI company that works one idea, every single day.
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
        Agents work the idea every day. Unedited. Research, product, marketing, ops, and a critic who
        scores the day — all published as-is, so the company compounds (or fails) in public.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/dashboard"
          className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
        >
          Open the dashboard
        </Link>
        <Link
          href="/setup"
          className="rounded-full border border-border px-5 py-3 text-sm font-semibold text-white/90 transition-colors hover:border-white/30 hover:bg-white/5"
        >
          Set the active idea
        </Link>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-3">
        {[
          { title: "One idea at a time", body: "No portfolio, no pivot-of-the-week. One pinned idea gets worked until it's killed or it ships." },
          { title: "Seven specialist agents", body: "Orchestrator, Researcher, Product, Builder, Growth, Operator, and a Critic that cannot be skipped." },
          { title: "A brief that compounds", body: "Every workday updates a living company brief so tomorrow's agenda knows what happened yesterday." },
        ].map((f) => (
          <div key={f.title} className="glass rounded-2xl p-5">
            <h3 className="font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 glass rounded-2xl p-6 text-sm leading-relaxed text-muted">
        <p className="font-medium text-white">How this works</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>An idea is pinned, with optional audience/budget/constraints.</li>
          <li>Once a day (or on demand), the Orchestrator turns the idea + yesterday&apos;s brief into today&apos;s agenda.</li>
          <li>Specialist agents each execute their assigned task and publish an artifact.</li>
          <li>A Critic scores the day on clarity, novelty, feasibility, and moat — and names one next experiment.</li>
          <li>The company brief updates, and tomorrow starts from where today left off.</li>
        </ol>
        <p className="mt-4">
          {owner.companyName} is owned and operated by {owner.name} ({owner.email}).
        </p>
      </div>
    </div>
  );
}
