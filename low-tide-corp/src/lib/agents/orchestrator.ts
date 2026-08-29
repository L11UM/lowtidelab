import { generateStructured } from "@/lib/llm";
import { OrchestratorSchema, type AgentContext, type OrchestratorOutput } from "./types";
import { buildContextBlock, systemPromptFor } from "./shared";

const TASK = `
Turn the active idea, the company brief, and yesterday's workday into TODAY's agenda.
Produce 3 to 7 tasks, each assigned to exactly one of: researcher, product, builder, growth, operator.
Prioritize what actually moves the idea forward today — do not repeat killed ideas or already-answered open questions.
Every agent must know: making money for the company is a priority before it "dies" (its work for today ends) —
frame tasks so they push toward a real, shippable step, not busywork.
`.trim();

export function renderOrchestratorMarkdown(out: OrchestratorOutput): string {
  const lines = ["### Today's agenda", ""];
  for (const t of out.agenda) {
    lines.push(`- **[${t.priority}] ${t.agent}** — ${t.task}`);
  }
  lines.push("", "### Rationale", out.rationale);
  return lines.join("\n");
}

export async function runOrchestrator(ctx: AgentContext) {
  const system = systemPromptFor("Orchestrator", ctx.ownerName);
  const user = `${buildContextBlock(ctx)}\n\n## Your task today\n${TASK}\n\nReturn JSON matching: { agenda: [{agent, task, priority}], rationale: string }`;
  const { data, usage } = await generateStructured(system, user, OrchestratorSchema);
  return { data, usage, markdown: renderOrchestratorMarkdown(data) };
}
