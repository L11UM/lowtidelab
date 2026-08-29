import { generateStructured } from "@/lib/llm";
import { GrowthSchema, type AgentContext, type GrowthOutput } from "./types";
import { buildContextBlock, systemPromptFor } from "./shared";

export function renderGrowthMarkdown(out: GrowthOutput): string {
  const lines = ["### Positioning", out.positioning, "", "### Channel experiment"];
  lines.push(`- Channel: ${out.channelExperiment.channel}`);
  lines.push(`- Hypothesis: ${out.channelExperiment.hypothesis}`);
  lines.push(`- Metric: ${out.channelExperiment.metric}`);
  lines.push("");
  if (out.draftCopy.length) {
    lines.push("### Draft copy");
    for (const c of out.draftCopy) lines.push(`**${c.platform}**\n\n${c.text}\n`);
  }
  if (out.unknowns.length) {
    lines.push("### Unknowns");
    for (const u of out.unknowns) lines.push(`- ${u}`);
  }
  return lines.join("\n");
}

export async function runGrowth(ctx: AgentContext) {
  const system = systemPromptFor("Growth", ctx.ownerName);
  const user = `${buildContextBlock(ctx)}\n\nDefine positioning, ONE channel experiment (not five), and draft real post/landing copy for it.\n\nReturn JSON matching: { positioning, channelExperiment: {channel, hypothesis, metric}, draftCopy: [{platform, text}], unknowns: string[] }`;
  const { data, usage } = await generateStructured(system, user, GrowthSchema);
  return { data, usage, markdown: renderGrowthMarkdown(data) };
}
