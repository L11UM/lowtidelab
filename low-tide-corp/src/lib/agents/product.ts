import { generateStructured } from "@/lib/llm";
import { ProductSchema, type AgentContext, type ProductOutput } from "./types";
import { buildContextBlock, systemPromptFor } from "./shared";

export function renderProductMarkdown(out: ProductOutput): string {
  const lines = ["### Problem", out.problem, "", "### ICP (ideal customer profile)", out.icp, ""];
  if (out.mvpScope.length) {
    lines.push("### MVP scope");
    for (const s of out.mvpScope) lines.push(`- ${s}`);
    lines.push("");
  }
  if (out.userStories.length) {
    lines.push("### User stories");
    for (const s of out.userStories) lines.push(`- ${s}`);
    lines.push("");
  }
  if (out.notToBuild.length) {
    lines.push("### What NOT to build");
    for (const s of out.notToBuild) lines.push(`- ${s}`);
    lines.push("");
  }
  if (out.unknowns.length) {
    lines.push("### Unknowns");
    for (const u of out.unknowns) lines.push(`- ${u}`);
  }
  return lines.join("\n");
}

export async function runProduct(ctx: AgentContext) {
  const system = systemPromptFor("Product", ctx.ownerName);
  const user = `${buildContextBlock(ctx)}\n\nDefine the product for your assigned task: problem statement, ICP, MVP scope, user stories, and explicitly what NOT to build right now.\n\nReturn JSON matching: { problem, icp, mvpScope: string[], userStories: string[], notToBuild: string[], unknowns: string[] }`;
  const { data, usage } = await generateStructured(system, user, ProductSchema);
  return { data, usage, markdown: renderProductMarkdown(data) };
}
