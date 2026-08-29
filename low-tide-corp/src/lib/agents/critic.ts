import { generateStructured } from "@/lib/llm";
import { CriticSchema, type AgentContext, type CriticOutput } from "./types";
import { buildContextBlock, systemPromptFor } from "./shared";

export function renderCriticMarkdown(out: CriticOutput): string {
  const lines = ["### Scores (1-10)"];
  lines.push(`- Clarity: ${out.scores.clarity}`);
  lines.push(`- Novelty: ${out.scores.novelty}`);
  lines.push(`- Feasibility: ${out.scores.feasibility}`);
  lines.push(`- Moat: ${out.scores.moat}`);
  lines.push(`- **Overall: ${out.overall}**`, "");
  if (out.weaknesses.length) {
    lines.push("### Weaknesses");
    for (const w of out.weaknesses) lines.push(`- ${w}`);
    lines.push("");
  }
  lines.push("### Required next experiment", out.requiredNextExperiment, "");
  lines.push("### Shippable next action (<2 hours)", out.shippableNextAction, "");
  lines.push("### Verdict", out.verdict);
  return lines.join("\n");
}

export async function runCritic(ctx: AgentContext) {
  const system = systemPromptFor("Critic", ctx.ownerName);
  const user = `${buildContextBlock(ctx)}\n\nYou cannot be skipped. Attack weak assumptions in today's work (provided below as your task). Score clarity, novelty, feasibility, and moat from 1-10 each, give an overall score, list concrete weaknesses, name the ONE required next experiment, and give ONE shippable next action a human could complete in under 2 hours today.\n\nReturn JSON matching: { scores: {clarity, novelty, feasibility, moat}, overall, weaknesses: string[], requiredNextExperiment, shippableNextAction, verdict }`;
  const { data, usage } = await generateStructured(system, user, CriticSchema);
  return { data, usage, markdown: renderCriticMarkdown(data) };
}
