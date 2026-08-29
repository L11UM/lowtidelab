# Low Tide Corp

An experiment: a crew of AI agents (Orchestrator, Researcher, Product, Builder, Growth, Operator, Critic) works one
pinned business idea every day, publishes unedited artifacts, and rolls everything into a living company brief.

Owned and operated by **Liam Thompson** (liambt20@gmail.com). A Low Tide Lab project.

This is a **separate Next.js app** from the main lowtidelab static site — it needs a live server (database writes,
SSE streaming, LLM calls), which a static export can't do. Deploy it separately (e.g. Vercel, Railway, Render).

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind
- Prisma + SQLite by default (swap `DATABASE_URL` to Postgres for production)
- Zod-validated structured LLM output (OpenAI or Anthropic via plain `fetch`, no SDK dependency)
- Server-Sent Events for a live agent run stream

## Setup

```bash
cd low-tide-corp
npm install
cp .env.example .env      # then fill in OPENAI_API_KEY or ANTHROPIC_API_KEY
npm run db:push           # creates prisma/dev.db
npm run db:seed           # demo idea + 2 fake completed workdays, so the UI isn't blank
npm run dev                # http://localhost:3100
```

## Core loop

1. Pin an idea at **/setup** (title, one-liner, optional audience/budget/constraints).
2. Click **Run today** on **/dashboard**. Watch agents stream in live.
3. The Orchestrator builds today's agenda from the idea + yesterday's brief.
4. Researcher / Product / Builder / Growth / Operator each run their assigned task (whichever they were assigned,
   skipped if disabled in Settings).
5. The Critic scores the day (clarity, novelty, feasibility, moat) and cannot be skipped.
6. The company brief is resynthesized from today's work.
7. Browse **/workdays** for the full history; open a day to see per-agent tabs and rerun a single failed agent.

## Guardrails baked into every agent prompt

- Never invent fake users, revenue, metrics, or citations — write `UNKNOWN` + what would unblock it instead.
- Every agent + the footer + `/settings` attribute ownership to Liam Thompson — no invented co-founders.
- The Critic must always produce one shippable next action a human could do in under 2 hours.
- A run is idempotent by date: re-running a `done` day is a no-op unless you pass `force`.

## Not in v1 (by design)

No payments, no multi-tenant teams, no agent marketplace, no external job queue (the "queue" is a single synchronous
server-side run, guarded by the workday's `running` status so a date can't run twice at once).
