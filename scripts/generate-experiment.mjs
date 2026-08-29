#!/usr/bin/env node
// Generates one interactive Lab experiment per week using an AI provider, writes it
// to content/experiments/<number>-<slug>/{meta.json,demo.html}, and skips if this
// week's experiment already exists (unless forced).
import fs from "node:fs";
import path from "node:path";
import { generateJson, hasApiKey, currentProvider } from "./lib/ai-client.mjs";

const EXPERIMENTS_DIR = path.join(process.cwd(), "content", "experiments");

const CATEGORIES = [
  "simulation",
  "visualizer",
  "generative-art",
  "game",
  "data",
  "physics",
  "probability",
  "other",
];

const SEED_IDEAS = [
  "a physics simulation (gravity, springs, collisions, fluids, cloth)",
  "a generative art piece driven by noise, math curves, or cellular automata",
  "a tiny playable game with a twist",
  "a data/probability visualizer that makes an abstract concept tangible",
  "an optical illusion or perception trick rendered interactively",
  "a simulation of a natural system (flocking, ecosystems, weather, fire, erosion)",
  "a sound-reactive or rhythm-based visual toy (no audio files, generate tones with WebAudio if used)",
  "a strange little toy based on a mathematical curiosity (fractals, tilings, knots, chaos)",
];

function todayDateStr() {
  return new Date().toISOString().slice(0, 10);
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function padNumber(n) {
  return String(n).padStart(4, "0");
}

function getExistingSlugs() {
  if (!fs.existsSync(EXPERIMENTS_DIR)) return [];
  return fs.readdirSync(EXPERIMENTS_DIR).filter((f) => {
    const full = path.join(EXPERIMENTS_DIR, f);
    return fs.statSync(full).isDirectory() && fs.existsSync(path.join(full, "meta.json"));
  });
}

function getExistingMetas() {
  return getExistingSlugs()
    .map((slug) => {
      try {
        return JSON.parse(fs.readFileSync(path.join(EXPERIMENTS_DIR, slug, "meta.json"), "utf8"));
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function nextNumber(metas) {
  return metas.length === 0 ? 1 : Math.max(...metas.map((m) => m.number)) + 1;
}

function alreadyPublishedThisWeek(metas, dateStr) {
  // Consider "this week" already covered if any experiment was published in the last 6 days.
  const now = new Date(dateStr).getTime();
  return metas.some((m) => {
    const diffDays = (now - new Date(m.date).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays < 6;
  });
}

const SYSTEM_PROMPT = `You are an eccentric, playful creative technologist building a weekly "Lab Experiment" for a personal site's interactive Lab section. Each experiment is a single self-contained HTML file that runs inside a sandboxed iframe.

STRICT technical rules for the demo code:
- Output ONE complete HTML document: <!DOCTYPE html><html>...<head><style>...</style></head><body>...<script>...</script></body></html>.
- Everything must be inline. NO external resources of any kind: no CDN scripts, no external fonts, no external images, no fetch/XHR/WebSocket calls, no external stylesheets.
- Pure vanilla JS/CSS/HTML only (no frameworks, no build step, no import statements).
- Must be genuinely INTERACTIVE — the user must be able to affect it with mouse/touch, click, drag, or keyboard input. A passive animation with zero interaction is not acceptable.
- Canvas/DOM should fill the viewport responsively (width/height 100%, listen for window resize if using <canvas>).
- Dark background (something like #0b1416) to match the site's chill, moody aesthetic — but the experiment's own colors/palette can be creative and eccentric.
- Keep it performant: use requestAnimationFrame for animation loops, avoid unbounded memory growth, avoid huge particle counts that would choke a phone.
- No localStorage, sessionStorage, cookies, or any persistence.
- Include a tiny unobtrusive on-screen hint (small text, low opacity) describing the core interaction, similar to a game's control hint.

Tone for the written fields: confident, curious, slightly eccentric — like a real lab notebook, not marketing copy. Second field ("labNotes") should read like a genuine first-person aside about building this specific experiment: a technical decision, a tradeoff, something that surprised you, or an idea for a future version. Never mention being an AI or add disclaimers.

Return ONLY valid JSON (no markdown code fences) with these exact keys:
- title (string, punchy, under 60 chars)
- description (string, one enticing sentence, under 160 chars, for a card preview)
- category (one of: ${CATEGORIES.join(", ")})
- instructions (string, markdown, 1-3 short sentences or a short list telling the user exactly how to interact with it)
- explanation (string, markdown, 2-4 short paragraphs explaining the concept/mechanism behind the experiment for a curious reader)
- labNotes (string, markdown, 1-2 short paragraphs, first-person build notes/reflections)
- demoHtml (string, the complete self-contained HTML document described above)`;

async function main() {
  const dateStr = todayDateStr();
  const forceRun = process.env.FORCE_EXPERIMENT === "true" || process.argv.includes("--force");

  const metas = getExistingMetas();

  if (!forceRun && alreadyPublishedThisWeek(metas, dateStr)) {
    console.log("An experiment was already published within the last week — skipping.");
    return;
  }

  if (!hasApiKey()) {
    console.error(
      `Missing API key for provider "${currentProvider()}". Set GEMINI_API_KEY (or AI_API_KEY) as a GitHub Actions secret to enable weekly experiments.`
    );
    process.exitCode = 1;
    return;
  }

  const topicOverride = process.env.TOPIC_OVERRIDE?.trim();
  const seed = topicOverride || SEED_IDEAS[Math.floor(Math.random() * SEED_IDEAS.length)];

  const recent = metas
    .sort((a, b) => b.number - a.number)
    .slice(0, 20)
    .map((m) => `#${m.number} "${m.title}" (${m.category}): ${m.description}`);
  const avoidNote =
    recent.length > 0
      ? `\n\nExisting experiments already published — do NOT repeat these concepts, mechanics, or visual styles, pick something clearly different:\n${recent.join("\n")}`
      : "";

  const userPrompt = topicOverride
    ? `Design and build this week's experiment specifically inspired by: ${seed}. Find a genuinely surprising, specific angle rather than the most obvious version of this idea.${avoidNote}`
    : `Design and build this week's experiment. Loose creative seed for inspiration: ${seed}. You don't have to follow it literally — treat it as a starting point and take it somewhere unexpected.${avoidNote}`;

  const experiment = await generateJson(userPrompt, SYSTEM_PROMPT, 8192);

  if (!experiment.demoHtml || !experiment.demoHtml.includes("<html")) {
    throw new Error("Generated experiment is missing a valid demoHtml document");
  }
  if (!CATEGORIES.includes(experiment.category)) {
    experiment.category = "other";
  }

  const number = nextNumber(metas);
  const slug = `${padNumber(number)}-${slugify(experiment.title)}`;
  const dir = path.join(EXPERIMENTS_DIR, slug);
  fs.mkdirSync(dir, { recursive: true });

  const meta = {
    number,
    date: dateStr,
    title: experiment.title,
    description: experiment.description,
    category: experiment.category,
    instructions: experiment.instructions,
    explanation: experiment.explanation,
    labNotes: experiment.labNotes,
  };

  fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify(meta, null, 2) + "\n");
  fs.writeFileSync(path.join(dir, "demo.html"), experiment.demoHtml.trim() + "\n");

  console.log(`Created experiment: ${slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
