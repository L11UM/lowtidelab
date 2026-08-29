import { generateStructured } from "@/lib/llm";
import { ResearcherSchema, type AgentContext, type ResearcherOutput } from "./types";
import { buildContextBlock, systemPromptFor } from "./shared";

export function renderResearcherMarkdown(out: ResearcherOutput): string {
  const lines = ["### Findings", out.findings, ""];
  if (out.competitors.length) {
    lines.push("### Competitors");
    for (const c of out.competitors) lines.push(`- **${c.name}** — ${c.note}`);
    lines.push("");
  }
  if (out.risks.length) {
    lines.push("### Risks");
    for (const r of out.risks) lines.push(`- ${r}`);
    lines.push("");
  }
  if (out.citations.length) {
    lines.push("### Citations");
    for (const c of out.citations) lines.push(`- [${c.title}](${c.url})`);
    lines.push("");
  }
  if (out.unknowns.length) {
    lines.push("### Unknowns");
    for (const u of out.unknowns) lines.push(`- ${u}`);
  }
  return lines.join("\n");
}

export async function runResearcher(ctx: AgentContext) {
  const system = systemPromptFor("Researcher", ctx.ownerName);
  const user = `${buildContextBlock(ctx)}\n\nDo market/competitor/user/risk research for your assigned task. If you have no live web search tool available, reason from general knowledge and clearly mark anything uncertain as UNKNOWN rather than fabricating a citation.\n\nReturn JSON matching: { findings, competitors: [{name, note}], risks: string[], citations: [{title, url}], unknowns: string[] }`;
  const { data, usage } = await generateStructured(system, user, ResearcherSchema);
  return { data, usage, markdown: renderResearcherMarkdown(data) };
}
