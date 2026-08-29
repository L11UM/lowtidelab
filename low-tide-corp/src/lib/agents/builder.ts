import { generateStructured } from "@/lib/llm";
import { BuilderSchema, type AgentContext, type BuilderOutput } from "./types";
import { buildContextBlock, systemPromptFor } from "./shared";

export function renderBuilderMarkdown(out: BuilderOutput): string {
  const lines = ["### Specs", out.specs, "", "### Architecture", out.architecture, ""];
  if (out.tickets.length) {
    lines.push("### Tickets");
    for (const t of out.tickets) lines.push(`- **${t.title}** (${t.estimate}) — ${t.description}`);
    lines.push("");
  }
  if (out.codePrompts.length) {
    lines.push("### Copy-pasteable code prompts");
    for (const c of out.codePrompts) lines.push(`**${c.title}**\n\n\`\`\`\n${c.prompt}\n\`\`\`\n`);
  }
  if (out.unknowns.length) {
    lines.push("### Unknowns");
    for (const u of out.unknowns) lines.push(`- ${u}`);
  }
  return lines.join("\n");
}

export async function runBuilder(ctx: AgentContext) {
  const system = systemPromptFor("Builder", ctx.ownerName);
  const user = `${buildContextBlock(ctx)}\n\nWrite specs, a lightweight architecture, a ticket breakdown, and copy-pasteable prompts a human could feed into a coding agent to build this.\n\nReturn JSON matching: { specs, architecture, tickets: [{title, description, estimate}], codePrompts: [{title, prompt}], unknowns: string[] }`;
  const { data, usage } = await generateStructured(system, user, BuilderSchema);
  return { data, usage, markdown: renderBuilderMarkdown(data) };
}
