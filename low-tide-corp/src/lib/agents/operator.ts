import { generateStructured } from "@/lib/llm";
import { OperatorSchema, type AgentContext, type OperatorOutput } from "./types";
import { buildContextBlock, systemPromptFor } from "./shared";

export function renderOperatorMarkdown(out: OperatorOutput): string {
  const lines: string[] = [];
  if (out.costs.length) {
    lines.push("### Costs");
    for (const c of out.costs) lines.push(`- ${c.item}: $${c.estUsd.toFixed(2)}`);
    lines.push("");
  }
  if (out.legalRiskFlags.length) {
    lines.push("### Legal / risk flags");
    for (const f of out.legalRiskFlags) lines.push(`- ${f}`);
    lines.push("");
  }
  if (out.checklist.length) {
    lines.push("### Checklist");
    for (const c of out.checklist) lines.push(`- [${c.done ? "x" : " "}] ${c.item}`);
    lines.push("");
  }
  lines.push(`### Ship vs wait: **${out.shipVsWait.toUpperCase()}**`);
  lines.push(out.rationale);
  if (out.unknowns.length) {
    lines.push("", "### Unknowns");
    for (const u of out.unknowns) lines.push(`- ${u}`);
  }
  return lines.join("\n");
}

export async function runOperator(ctx: AgentContext) {
  const system = systemPromptFor("Operator", ctx.ownerName);
  const user = `${buildContextBlock(ctx)}\n\nEstimate real costs, flag legal/risk issues, produce a short checklist, and give a clear ship-vs-wait call with rationale.\n\nReturn JSON matching: { costs: [{item, estUsd}], legalRiskFlags: string[], checklist: [{item, done}], shipVsWait: "ship"|"wait", rationale, unknowns: string[] }`;
  const { data, usage } = await generateStructured(system, user, OperatorSchema);
  return { data, usage, markdown: renderOperatorMarkdown(data) };
}
