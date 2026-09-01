import { prisma } from "@/lib/db";
import { owner } from "@/lib/owner";
import type { AgentContext, AgentKey } from "@/lib/agents/types";
import { runOrchestrator } from "@/lib/agents/orchestrator";
import { runResearcher } from "@/lib/agents/researcher";
import { runProduct } from "@/lib/agents/product";
import { runBuilder } from "@/lib/agents/builder";
import { runGrowth } from "@/lib/agents/growth";
import { runOperator } from "@/lib/agents/operator";
import { runCritic } from "@/lib/agents/critic";
import { synthesizeBrief } from "@/lib/brief";

export type RunEvent =
  | { type: "workday_start"; date: string }
  | { type: "agent_start"; agent: string }
  | { type: "agent_done"; agent: string; markdown: string }
  | { type: "agent_error"; agent: string; error: string }
  | { type: "brief_updated" }
  | { type: "workday_done"; date: string; status: string; criticScore: number | null }
  | { type: "workday_error"; error: string };

export type Emit = (event: RunEvent) => void;

export function todayInTimezone(timezone: string): string {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" });
  return fmt.format(new Date()); // en-CA gives YYYY-MM-DD
}

async function getSettings() {
  let settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
  if (!settings) settings = await prisma.settings.create({ data: { id: "singleton" } });
  return settings;
}

async function getActiveIdea() {
  return prisma.idea.findFirst({ where: { status: "active" }, orderBy: { updatedAt: "desc" } });
}

async function getLatestBrief(ideaId: string) {
  return prisma.companyBrief.findFirst({ where: { ideaId }, orderBy: { version: "desc" } });
}

async function getRecentWorkdaySummaries(beforeDate: string, ideaId: string) {
  const rows = await prisma.workday.findMany({
    where: { date: { lt: beforeDate }, status: "done", ideaId },
    orderBy: { date: "desc" },
    take: 3,
  });
  return rows.map((r) => ({ date: r.date, summary: r.summary, criticScore: r.criticScore }));
}

async function getExecutionEvidence(ideaId: string) {
  const actions = await prisma.actionItem.findMany({
    where: { status: { in: ["open", "done", "blocked"] }, workday: { ideaId } },
    orderBy: { updatedAt: "desc" },
    take: 6,
  });
  return actions.map((action) => {
    const evidence = action.evidence ? ` Evidence: ${action.evidence}` : "";
    const metric = action.successMetric ? ` Success: ${action.successMetric}.` : "";
    const kill = action.killCriterion ? ` Kill: ${action.killCriterion}.` : "";
    return `[${action.status.toUpperCase()}] ${action.title}${metric}${kill}${evidence}`;
  });
}

async function recordCriticAction(
  workdayId: string,
  title: string,
  experiment?: { hypothesis: string; successMetric: string; killCriterion: string }
) {
  await prisma.actionItem.deleteMany({ where: { workdayId, status: "open" } });
  await prisma.actionItem.create({
    data: {
      workdayId,
      title,
      hypothesis: experiment?.hypothesis,
      successMetric: experiment?.successMetric,
      killCriterion: experiment?.killCriterion,
    },
  });
}

function briefToContext(brief: Awaited<ReturnType<typeof getLatestBrief>>) {
  if (!brief) return null;
  return {
    problem: brief.problem,
    icp: brief.icp,
    offer: brief.offer,
    bets: JSON.parse(brief.bets) as string[],
    killedIdeas: JSON.parse(brief.killedIdeas) as string[],
    openQuestions: JSON.parse(brief.openQuestions) as string[],
  };
}

async function saveArtifact(
  workdayId: string,
  agent: string,
  type: string,
  body: unknown,
  markdown: string,
  citations?: unknown,
  error?: string
) {
  return prisma.artifact.create({
    data: {
      workdayId,
      agent,
      type,
      body: JSON.stringify(body ?? {}),
      markdown,
      citations: citations ? JSON.stringify(citations) : null,
      error: error ?? null,
    },
  });
}

async function log(workdayId: string, agent: string | null, level: "info" | "error", message: string, tokensIn = 0, tokensOut = 0) {
  await prisma.runLog.create({ data: { workdayId, agent, level, message, tokensIn, tokensOut } });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Spread sequential agent calls out to stay under free-tier requests-per-minute limits.
const AGENT_STAGGER_MS = 4000;

const AGENT_RUNNERS: Record<Exclude<AgentKey, "orchestrator" | "critic">, (ctx: AgentContext) => Promise<{ data: unknown; usage: { tokensIn: number; tokensOut: number }; markdown: string }>> = {
  researcher: runResearcher,
  product: runProduct,
  builder: runBuilder,
  growth: runGrowth,
  operator: runOperator,
};

/**
 * Runs (or resumes) the workday for `date`. Idempotent: if a workday for that
 * date is already "done" and force is not set, it returns immediately without
 * re-running agents.
 */
export async function runWorkday(
  dateOverride: string | undefined,
  force: boolean,
  emit: Emit,
  slot: "morning" | "night" = "morning"
) {
  const settings = await getSettings();
  const date = dateOverride ?? todayInTimezone(settings.timezone);
  emit({ type: "workday_start", date });

  const idea = await getActiveIdea();
  if (!idea) {
    emit({ type: "workday_error", error: "No active idea is pinned. Set one on the Idea Setup page first." });
    return;
  }

  let workday = await prisma.workday.findUnique({ where: { date_slot_ideaId: { date, slot, ideaId: idea.id } } });
  if (workday && workday.status === "done" && !force) {
    emit({ type: "workday_done", date, status: "done", criticScore: workday.criticScore });
    return;
  }
  if (workday && workday.status === "running") {
    emit({ type: "workday_error", error: "This workday is already running." });
    return;
  }

  if (workday && force) {
    await prisma.artifact.deleteMany({ where: { workdayId: workday.id } });
    workday = await prisma.workday.update({ where: { id: workday.id }, data: { status: "running", summary: null, criticScore: null } });
  } else if (!workday) {
    workday = await prisma.workday.create({ data: { ideaId: idea.id, date, slot, status: "running" } });
  } else {
    workday = await prisma.workday.update({ where: { id: workday.id }, data: { status: "running" } });
  }

  const agentsOn = JSON.parse(settings.agentsOn) as Record<string, boolean>;
  const brief = briefToContext(await getLatestBrief(idea.id));
  const recentWorkdays = await getRecentWorkdaySummaries(date, idea.id);
  const executionEvidence = await getExecutionEvidence(idea.id);

  const baseCtx: AgentContext = {
    today: date,
    idea: { title: idea.title, oneLiner: idea.oneLiner, audience: idea.audience, budget: idea.budget, dontDo: idea.dontDo },
    brief,
    recentWorkdays,
    ownerName: owner.name,
    ownerEmail: owner.email,
    companyName: owner.companyName,
    executionEvidence,
  };

  try {
    // 1. Orchestrator sets today's agenda.
    emit({ type: "agent_start", agent: "orchestrator" });
    const orch = await runOrchestrator(baseCtx);
    await saveArtifact(workday.id, "orchestrator", "agenda", orch.data, orch.markdown);
    await log(workday.id, "orchestrator", "info", "Agenda created", orch.usage.tokensIn, orch.usage.tokensOut);
    emit({ type: "agent_done", agent: "orchestrator", markdown: orch.markdown });
    await prisma.workday.update({ where: { id: workday.id }, data: { agenda: JSON.stringify(orch.data.agenda) } });

    // 2. Specialist agents run their assigned tasks (if enabled in settings).
    const artifactsMarkdown: string[] = [`## Orchestrator\n${orch.markdown}`];
    for (const agentKey of ["researcher", "product", "builder", "growth", "operator"] as const) {
      const tasksForAgent = orch.data.agenda.filter((a) => a.agent === agentKey);
      if (tasksForAgent.length === 0) continue;
      if (agentsOn[agentKey] === false) continue;

      const ctx: AgentContext = { ...baseCtx, task: tasksForAgent.map((t) => `- (${t.priority}) ${t.task}`).join("\n") };
      emit({ type: "agent_start", agent: agentKey });
      await sleep(AGENT_STAGGER_MS);
      try {
        const result = await AGENT_RUNNERS[agentKey](ctx);
        await saveArtifact(workday.id, agentKey, agentTypeFor(agentKey), result.data, result.markdown, (result.data as { citations?: unknown }).citations);
        await log(workday.id, agentKey, "info", "Completed", result.usage.tokensIn, result.usage.tokensOut);
        artifactsMarkdown.push(`## ${agentKey}\n${result.markdown}`);
        emit({ type: "agent_done", agent: agentKey, markdown: result.markdown });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        await saveArtifact(workday.id, agentKey, agentTypeFor(agentKey), {}, "", undefined, message);
        await log(workday.id, agentKey, "error", message);
        emit({ type: "agent_error", agent: agentKey, error: message });
      }
    }

    // 3. Critic — cannot be skipped.
    emit({ type: "agent_start", agent: "critic" });
    await sleep(AGENT_STAGGER_MS);
    let criticScore: number | null = null;
    try {
      const criticCtx: AgentContext = { ...baseCtx, task: `Here is all of today's work to critique:\n\n${artifactsMarkdown.join("\n\n")}` };
      const critic = await runCritic(criticCtx);
      await saveArtifact(workday.id, "critic", "critique", critic.data, critic.markdown);
      await log(workday.id, "critic", "info", "Scored", critic.usage.tokensIn, critic.usage.tokensOut);
      criticScore = critic.data.overall;
      await recordCriticAction(workday.id, critic.data.shippableNextAction, critic.data.experiment);
      artifactsMarkdown.push(`## Critic\n${critic.markdown}`);
      emit({ type: "agent_done", agent: "critic", markdown: critic.markdown });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await log(workday.id, "critic", "error", message);
      emit({ type: "agent_error", agent: "critic", error: message });
    }

    // 4. Synthesize the updated company brief (best-effort; does not fail the day).
    await sleep(AGENT_STAGGER_MS);
    try {
      const prevBrief = await getLatestBrief(idea.id);
      const briefResult = await synthesizeBrief(baseCtx, artifactsMarkdown.join("\n\n"));
      await prisma.companyBrief.create({
        data: {
          ideaId: idea.id,
          problem: briefResult.data.problem,
          icp: briefResult.data.icp,
          offer: briefResult.data.offer,
          bets: JSON.stringify(briefResult.data.bets),
          killedIdeas: JSON.stringify(briefResult.data.killedIdeas),
          openQuestions: JSON.stringify(briefResult.data.openQuestions),
          version: (prevBrief?.version ?? 0) + 1,
        },
      });
      await log(workday.id, null, "info", "Company brief updated", briefResult.usage.tokensIn, briefResult.usage.tokensOut);
      emit({ type: "brief_updated" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await log(workday.id, null, "error", `Brief synthesis failed: ${message}`);
    }

    const status = criticScore !== null ? "done" : "failed";
    const orchRationale = orch.data.rationale;
    await prisma.workday.update({ where: { id: workday.id }, data: { status, summary: orchRationale, criticScore } });
    emit({ type: "workday_done", date, status, criticScore });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await log(workday.id, null, "error", message);
    await prisma.workday.update({ where: { id: workday.id }, data: { status: "failed" } });
    emit({ type: "workday_error", error: message });
  }
}

function agentTypeFor(agent: string): string {
  const map: Record<string, string> = {
    researcher: "research",
    product: "plan",
    builder: "spec",
    growth: "copy",
    operator: "plan",
  };
  return map[agent] ?? "plan";
}

/** Re-runs a single agent for an existing workday date, replacing its artifact. */
export async function rerunAgent(
  date: string,
  agentKey: Exclude<AgentKey, "orchestrator">,
  emit: Emit,
  slot: "morning" | "night" = "morning"
) {
  const idea = await getActiveIdea();
  if (!idea) {
    emit({ type: "workday_error", error: "No active idea is pinned." });
    return;
  }
  const workday = await prisma.workday.findUnique({
    where: { date_slot_ideaId: { date, slot, ideaId: idea.id } },
    include: { artifacts: true },
  });
  if (!workday) {
    emit({ type: "workday_error", error: `No workday found for ${date}` });
    return;
  }
  const brief = briefToContext(await getLatestBrief(idea.id));
  const recentWorkdays = await getRecentWorkdaySummaries(date, idea.id);
  const executionEvidence = await getExecutionEvidence(idea.id);
  const baseCtx: AgentContext = {
    today: date,
    idea: { title: idea.title, oneLiner: idea.oneLiner, audience: idea.audience, budget: idea.budget, dontDo: idea.dontDo },
    brief,
    recentWorkdays,
    ownerName: owner.name,
    ownerEmail: owner.email,
    companyName: owner.companyName,
    executionEvidence,
  };

  const agenda = workday.agenda ? (JSON.parse(workday.agenda) as { agent: string; task: string; priority: string }[]) : [];

  emit({ type: "agent_start", agent: agentKey });
  try {
    let markdown: string;
    let data: unknown;
    let usage = { tokensIn: 0, tokensOut: 0 };

    if (agentKey === "critic") {
      const artifacts = workday.artifacts.filter((a) => a.agent !== "critic");
      const combined = artifacts.map((a) => `## ${a.agent}\n${a.markdown}`).join("\n\n");
      const result = await runCritic({ ...baseCtx, task: `Here is all of today's work to critique:\n\n${combined}` });
      data = result.data;
      markdown = result.markdown;
      usage = result.usage;
      await prisma.workday.update({ where: { id: workday.id }, data: { criticScore: result.data.overall } });
      await recordCriticAction(workday.id, result.data.shippableNextAction, result.data.experiment);
    } else {
      const tasksForAgent = agenda.filter((a) => a.agent === agentKey);
      const task = tasksForAgent.length
        ? tasksForAgent.map((t) => `- (${t.priority}) ${t.task}`).join("\n")
        : `Redo your work for this idea given the current context.`;
      const result = await AGENT_RUNNERS[agentKey]({ ...baseCtx, task });
      data = result.data;
      markdown = result.markdown;
      usage = result.usage;
    }

    await prisma.artifact.deleteMany({ where: { workdayId: workday.id, agent: agentKey } });
    await saveArtifact(workday.id, agentKey, agentKey === "critic" ? "critique" : agentTypeFor(agentKey), data, markdown);
    await log(workday.id, agentKey, "info", "Rerun completed", usage.tokensIn, usage.tokensOut);
    emit({ type: "agent_done", agent: agentKey, markdown });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await log(workday.id, agentKey, "error", message);
    emit({ type: "agent_error", agent: agentKey, error: message });
  }
}
