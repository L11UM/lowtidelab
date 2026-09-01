import { z } from "zod";

export const AGENT_KEYS = [
  "orchestrator",
  "researcher",
  "product",
  "builder",
  "growth",
  "operator",
  "critic",
] as const;
export type AgentKey = (typeof AGENT_KEYS)[number];

export interface IdeaContext {
  title: string;
  oneLiner: string;
  audience?: string | null;
  budget?: string | null;
  dontDo?: string | null;
}

export interface BriefContext {
  problem: string;
  icp: string;
  offer: string;
  bets: string[];
  killedIdeas: string[];
  openQuestions: string[];
}

export interface RecentWorkdaySummary {
  date: string;
  summary: string | null;
  criticScore: number | null;
}

export interface AgentContext {
  today: string;
  idea: IdeaContext;
  brief: BriefContext | null;
  recentWorkdays: RecentWorkdaySummary[];
  ownerName: string;
  ownerEmail: string;
  companyName: string;
  executionEvidence: string[];
  task?: string; // the specific task assigned by the Orchestrator for this agent today
}

// Every agent must be able to say "UNKNOWN" instead of hallucinating.
export const unknownsField = z
  .array(z.string())
  .default([])
  .describe("Things this agent could not determine, and what would unblock them. Never invent facts instead.");

export const AgendaTaskSchema = z.object({
  agent: z.enum(["researcher", "product", "builder", "growth", "operator"]),
  task: z.string(),
  priority: z.enum(["high", "medium", "low"]),
});
export type AgendaTask = z.infer<typeof AgendaTaskSchema>;

export const OrchestratorSchema = z.object({
  agenda: z.array(AgendaTaskSchema).min(3).max(7),
  rationale: z.string(),
});
export type OrchestratorOutput = z.infer<typeof OrchestratorSchema>;

export const ResearcherSchema = z.object({
  findings: z.string(),
  competitors: z.array(z.object({ name: z.string(), note: z.string() })).default([]),
  risks: z.array(z.string()).default([]),
  citations: z.array(z.object({ title: z.string(), url: z.string() })).default([]),
  unknowns: unknownsField,
});
export type ResearcherOutput = z.infer<typeof ResearcherSchema>;

export const ProductSchema = z.object({
  problem: z.string(),
  icp: z.string(),
  mvpScope: z.array(z.string()).default([]),
  userStories: z.array(z.string()).default([]),
  notToBuild: z.array(z.string()).default([]),
  unknowns: unknownsField,
});
export type ProductOutput = z.infer<typeof ProductSchema>;

export const BuilderSchema = z.object({
  specs: z.string(),
  architecture: z.string(),
  tickets: z.array(z.object({ title: z.string(), description: z.string(), estimate: z.string() })).default([]),
  codePrompts: z.array(z.object({ title: z.string(), prompt: z.string() })).default([]),
  unknowns: unknownsField,
});
export type BuilderOutput = z.infer<typeof BuilderSchema>;

export const GrowthSchema = z.object({
  positioning: z.string(),
  channelExperiment: z.object({ channel: z.string(), hypothesis: z.string(), metric: z.string() }),
  draftCopy: z.array(z.object({ platform: z.string(), text: z.string() })).default([]),
  unknowns: unknownsField,
});
export type GrowthOutput = z.infer<typeof GrowthSchema>;

export const OperatorSchema = z.object({
  costs: z.array(z.object({ item: z.string(), estUsd: z.number() })).default([]),
  legalRiskFlags: z.array(z.string()).default([]),
  checklist: z.array(z.object({ item: z.string(), done: z.boolean() })).default([]),
  shipVsWait: z.enum(["ship", "wait"]),
  rationale: z.string(),
  unknowns: unknownsField,
});
export type OperatorOutput = z.infer<typeof OperatorSchema>;

export const CriticSchema = z.object({
  scores: z.object({
    clarity: z.number().min(1).max(10),
    novelty: z.number().min(1).max(10),
    feasibility: z.number().min(1).max(10),
    moat: z.number().min(1).max(10),
  }),
  overall: z.number().min(1).max(10),
  weaknesses: z.array(z.string()).default([]),
  requiredNextExperiment: z.string(),
  experiment: z.object({
    hypothesis: z.string(),
    successMetric: z.string(),
    killCriterion: z.string(),
  }),
  shippableNextAction: z.string().describe("One thing a human could do in under 2 hours"),
  verdict: z.string(),
});
export type CriticOutput = z.infer<typeof CriticSchema>;

export const CompanyBriefSchema = z.object({
  problem: z.string(),
  icp: z.string(),
  offer: z.string(),
  bets: z.array(z.string()).default([]),
  killedIdeas: z.array(z.string()).default([]),
  openQuestions: z.array(z.string()).default([]),
});
export type CompanyBriefOutput = z.infer<typeof CompanyBriefSchema>;
