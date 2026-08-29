import fs from "node:fs";
import path from "node:path";
import { sanitizeExperimentHtml } from "@/lib/sanitize";

const EXPERIMENTS_DIR = path.join(process.cwd(), "content", "experiments");

export const EXPERIMENT_CATEGORIES = [
  "simulation",
  "visualizer",
  "generative-art",
  "game",
  "data",
  "physics",
  "probability",
  "other",
] as const;

export type ExperimentCategory = (typeof EXPERIMENT_CATEGORIES)[number];
export type ExperimentStatus = "active" | "archived";

export type ExperimentMeta = {
  slug: string; // folder name, e.g. "0002-flow-field-drift"
  number: number;
  date: string;
  title: string;
  description: string;
  category: ExperimentCategory;
  instructions: string;
  explanation: string;
  labNotes: string;
  status: ExperimentStatus;
};

export type Experiment = ExperimentMeta & {
  demoHtml: string;
};

function readMeta(slug: string): Omit<ExperimentMeta, "status"> | null {
  const metaPath = path.join(EXPERIMENTS_DIR, slug, "meta.json");
  if (!fs.existsSync(metaPath)) return null;

  const raw = JSON.parse(fs.readFileSync(metaPath, "utf8"));
  return {
    slug,
    number: raw.number,
    date: raw.date,
    title: raw.title,
    description: raw.description,
    category: raw.category,
    instructions: raw.instructions,
    explanation: raw.explanation,
    labNotes: raw.labNotes,
  };
}

export function getAllExperimentSlugs(): string[] {
  if (!fs.existsSync(EXPERIMENTS_DIR)) return [];
  return fs.readdirSync(EXPERIMENTS_DIR).filter((f) => {
    const full = path.join(EXPERIMENTS_DIR, f);
    return fs.statSync(full).isDirectory() && fs.existsSync(path.join(full, "meta.json"));
  });
}

// Only the newest experiment (by number) is "active" — every prior one is
// permanently kept and marked "archived", never deleted.
export function getAllExperiments(): ExperimentMeta[] {
  const metas = getAllExperimentSlugs()
    .map(readMeta)
    .filter((m): m is Omit<ExperimentMeta, "status"> => m !== null)
    .sort((a, b) => b.number - a.number);

  return metas.map((m, i) => ({ ...m, status: i === 0 ? "active" : "archived" }));
}

export function getNewestExperiment(): Experiment | null {
  const [newest] = getAllExperiments();
  return newest ? getExperimentBySlug(newest.slug) : null;
}

export function getExperimentBySlug(slug: string): Experiment | null {
  const all = getAllExperiments();
  const meta = all.find((m) => m.slug === slug);
  if (!meta) return null;

  const demoPath = path.join(EXPERIMENTS_DIR, slug, "demo.html");
  if (!fs.existsSync(demoPath)) return null;

  const demoHtml = sanitizeExperimentHtml(fs.readFileSync(demoPath, "utf8"));
  return { ...meta, demoHtml };
}

export function nextExperimentNumber(): number {
  const all = getAllExperiments();
  return all.length === 0 ? 1 : Math.max(...all.map((e) => e.number)) + 1;
}
