import type { AgentContext } from "./types";

export const AUTONOMY_RULES = `
Rules you must follow:
- Never invent fake users, fake revenue, fake metrics, or fake citations.
- If you don't know something, write "UNKNOWN" and state what would unblock it — never guess and present it as fact.
- Be concrete and specific. Prefer short, concrete sentences over vague filler.
- You work for ${"{{OWNER_NAME}}"} and Low Tide Corp (a Low Tide Lab project). Never claim a different founder, owner, or company.
- Respond with ONLY a single JSON object matching the requested schema. No markdown fences, no commentary outside the JSON.
`.trim();

export function buildContextBlock(ctx: AgentContext): string {
  const lines: string[] = [];
  lines.push(`Today's date: ${ctx.today}`);
  lines.push(`Company: ${ctx.companyName} (owned and operated by ${ctx.ownerName}, ${ctx.ownerEmail})`);
  lines.push("");
  lines.push("## Active idea");
  lines.push(`Title: ${ctx.idea.title}`);
  lines.push(`One-liner: ${ctx.idea.oneLiner}`);
  if (ctx.idea.audience) lines.push(`Audience: ${ctx.idea.audience}`);
  if (ctx.idea.budget) lines.push(`Budget: ${ctx.idea.budget}`);
  if (ctx.idea.dontDo) lines.push(`Constraints ("don't do"): ${ctx.idea.dontDo}`);
  lines.push("");

  if (ctx.brief) {
    lines.push("## Company brief (rolling synthesis from prior days)");
    lines.push(`Problem: ${ctx.brief.problem}`);
    lines.push(`ICP: ${ctx.brief.icp}`);
    lines.push(`Offer: ${ctx.brief.offer}`);
    if (ctx.brief.bets.length) lines.push(`Current bets: ${ctx.brief.bets.join("; ")}`);
    if (ctx.brief.killedIdeas.length) lines.push(`Killed ideas (do not repeat): ${ctx.brief.killedIdeas.join("; ")}`);
    if (ctx.brief.openQuestions.length) lines.push(`Open questions: ${ctx.brief.openQuestions.join("; ")}`);
  } else {
    lines.push("## Company brief");
    lines.push("None yet — this is the first workday for this idea.");
  }
  lines.push("");

  if (ctx.recentWorkdays.length) {
    lines.push("## Last workdays");
    for (const wd of ctx.recentWorkdays) {
      lines.push(`- ${wd.date} (critic score: ${wd.criticScore ?? "n/a"}): ${wd.summary ?? "no summary"}`);
    }
  } else {
    lines.push("## Last workdays");
    lines.push("None yet.");
  }
  lines.push("");

  if (ctx.task) {
    lines.push("## Your task today");
    lines.push(ctx.task);
  }

  return lines.join("\n");
}

export function systemPromptFor(role: string, ownerName: string): string {
  return `You are the ${role} agent at Low Tide Corp, a daily autonomous multi-agent company owned by ${ownerName}.\n\n${AUTONOMY_RULES.replace(
    "{{OWNER_NAME}}",
    ownerName
  )}`;
}
