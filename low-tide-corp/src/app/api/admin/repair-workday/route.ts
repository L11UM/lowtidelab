import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rerunAgent } from "@/lib/run";
import { synthesizeBrief } from "@/lib/brief";
import { owner } from "@/lib/owner";
import type { AgentContext } from "@/lib/agents/types";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * One-off maintenance endpoint: finishes a workday that partially failed
 * (e.g. hit a transient Gemini rate limit) by re-running only the failed
 * agents, then marking the day done and re-synthesizing the brief. Does not
 * touch agents that already succeeded. Remove after use.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { date, slot } = await req.json().catch(() => ({}));
  if (typeof date !== "string" || (slot !== "morning" && slot !== "night")) {
    return NextResponse.json({ error: "Body must be { date: string, slot: 'morning' | 'night' }" }, { status: 400 });
  }

  const log: string[] = [];
  const workdayBefore = await prisma.workday.findUnique({
    where: { date_slot: { date, slot } },
    include: { artifacts: true },
  });
  if (!workdayBefore) return NextResponse.json({ error: "Workday not found" }, { status: 404 });

  const failedAgents = workdayBefore.artifacts.filter((a) => a.error).map((a) => a.agent);
  const agentsToRerun = (["growth", "operator", "critic"] as const).filter(
    (a) => failedAgents.includes(a) || a === "critic"
  );

  for (const agent of agentsToRerun) {
    await rerunAgent(date, agent, (event) => {
      if (event.type === "agent_done") log.push(`${agent}: done`);
      else if (event.type === "agent_error") log.push(`${agent}: ERROR ${event.error}`);
    }, slot);
  }

  const workday = await prisma.workday.findUnique({
    where: { date_slot: { date, slot } },
    include: { artifacts: { orderBy: { createdAt: "asc" } } },
  });
  if (!workday) return NextResponse.json({ error: "Workday disappeared" }, { status: 500 });

  if (workday.criticScore === null) {
    return NextResponse.json({ ok: false, log, reason: "critic still failing" }, { status: 500 });
  }

  await prisma.workday.update({ where: { id: workday.id }, data: { status: "done" } });

  const idea = await prisma.idea.findFirst({ where: { status: "active" }, orderBy: { updatedAt: "desc" } });
  if (!idea) return NextResponse.json({ ok: false, log, reason: "no active idea" }, { status: 500 });

  const prevBrief = await prisma.companyBrief.findFirst({ orderBy: { version: "desc" } });
  const brief = prevBrief
    ? {
        problem: prevBrief.problem,
        icp: prevBrief.icp,
        offer: prevBrief.offer,
        bets: JSON.parse(prevBrief.bets),
        killedIdeas: JSON.parse(prevBrief.killedIdeas),
        openQuestions: JSON.parse(prevBrief.openQuestions),
      }
    : null;
  const recentWorkdays = (
    await prisma.workday.findMany({ where: { date: { lt: date }, status: "done" }, orderBy: { date: "desc" }, take: 3 })
  ).map((r) => ({ date: r.date, summary: r.summary, criticScore: r.criticScore }));
  const executionEvidence = (
    await prisma.actionItem.findMany({ orderBy: { updatedAt: "desc" }, take: 6 })
  ).map((action) => `[${action.status.toUpperCase()}] ${action.title}${action.evidence ? ` Evidence: ${action.evidence}` : ""}`);

  const ctx: AgentContext = {
    today: date,
    idea: { title: idea.title, oneLiner: idea.oneLiner, audience: idea.audience, budget: idea.budget, dontDo: idea.dontDo },
    brief,
    recentWorkdays,
    ownerName: owner.name,
    ownerEmail: owner.email,
    companyName: owner.companyName,
    executionEvidence,
  };

  const combined = workday.artifacts
    .filter((a) => !a.error)
    .map((a) => `## ${a.agent}\n${a.markdown}`)
    .join("\n\n");

  const briefResult = await synthesizeBrief(ctx, combined);
  await prisma.companyBrief.create({
    data: {
      problem: briefResult.data.problem,
      icp: briefResult.data.icp,
      offer: briefResult.data.offer,
      bets: JSON.stringify(briefResult.data.bets),
      killedIdeas: JSON.stringify(briefResult.data.killedIdeas),
      openQuestions: JSON.stringify(briefResult.data.openQuestions),
      version: (prevBrief?.version ?? 0) + 1,
    },
  });

  return NextResponse.json({ ok: true, log, criticScore: workday.criticScore });
}
