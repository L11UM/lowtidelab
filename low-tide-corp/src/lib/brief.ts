import { generateStructured } from "@/lib/llm";
import { CompanyBriefSchema, type AgentContext } from "@/lib/agents/types";
import { buildContextBlock, systemPromptFor } from "@/lib/agents/shared";

/** Synthesizes an updated CompanyBrief from the idea, prior brief, and today's artifact markdown. */
export async function synthesizeBrief(ctx: AgentContext, todaysArtifactsMarkdown: string) {
  const system = systemPromptFor("Brief Synthesizer", ctx.ownerName);
  const user = `${buildContextBlock(ctx)}\n\n## Today's artifacts\n${todaysArtifactsMarkdown}\n\nSynthesize an updated, rolling company brief: problem, ICP, offer, current bets, ideas that should now be considered killed, and open questions. Keep it tight — this is a living summary, not a transcript.\n\nReturn JSON matching: { problem, icp, offer, bets: string[], killedIdeas: string[], openQuestions: string[] }`;
  const { data, usage } = await generateStructured(system, user, CompanyBriefSchema);
  return { data, usage };
}
