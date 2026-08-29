#!/usr/bin/env node
// Generates one blog post per day using an AI provider (Gemini or any OpenAI-compatible
// chat API), writes it to content/posts/, and skips if a post for today already exists.
import fs from "node:fs";
import path from "node:path";
import { generateJson, hasApiKey, currentProvider } from "./lib/ai-client.mjs";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

const TOPICS = [
  "technology or software",
  "science or a scientific curiosity",
  "history or a historical event",
  "psychology or human behavior",
  "culture, media, or the internet",
  "nature or the environment",
  "food or cooking",
  "travel or a place in the world",
  "art, music, or creativity",
  "sports or games",
  "philosophy or a big question",
  "everyday life or a small personal observation",
  "business or economics",
  "health or fitness",
  "space or astronomy",
];

const SYSTEM_PROMPT = `You are writing a short, genuinely interesting blog post for a personal portfolio site with a chill, unpretentious voice. The post is part of a public experiment testing whether AI can write a good blog post every day, fully unedited before publishing.

You can write about absolutely anything — you are not limited to tech or AI topics. Pick something genuinely interesting within the general area you're given, the way a curious, well-read person would pick a subject for a short essay.

Rules:
- 250-400 words.
- No fluff, no "in conclusion", no generic AI disclaimers.
- Write like a thoughtful, curious person sharing a real observation or idea, not marketing copy or a Wikipedia summary.
- Do not repeat topics or titles you've already covered (a list of recent post titles may be provided — pick something clearly different).
- Return ONLY valid JSON (no markdown code fences) with keys: title (string, punchy, under 70 chars), excerpt (string, one sentence, under 140 chars), tags (array of 2-3 lowercase single words), body (string, markdown, no frontmatter, may use ## subheadings and lists).`;

function todaySlugDate() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function alreadyPostedToday(dateStr) {
  if (!fs.existsSync(POSTS_DIR)) return false;
  return fs.readdirSync(POSTS_DIR).some((f) => f.startsWith(dateStr));
}

function getRecentTitles(limit = 15) {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .reverse()
    .slice(0, limit)
    .map((f) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, f), "utf8");
      const match = raw.match(/^title:\s*"(.*)"\s*$/m);
      return match ? match[1] : null;
    })
    .filter(Boolean);
}

async function main() {
  const dateStr = todaySlugDate();
  const forceRun = process.env.FORCE_POST === "true" || process.argv.includes("--force");

  if (!forceRun && alreadyPostedToday(dateStr)) {
    console.log(`A post for ${dateStr} already exists — skipping.`);
    return;
  }

  if (!hasApiKey()) {
    console.error(
      `Missing API key for provider "${currentProvider()}". Set GEMINI_API_KEY (or AI_API_KEY) as a GitHub Actions secret to enable daily posts.`
    );
    process.exitCode = 1;
    return;
  }

  const topicOverride = process.env.TOPIC_OVERRIDE?.trim();
  const topic = topicOverride || TOPICS[Math.floor(Math.random() * TOPICS.length)];
  const recentTitles = getRecentTitles();
  const avoidNote =
    recentTitles.length > 0
      ? `\n\nRecent post titles to avoid repeating (pick something clearly different): ${recentTitles.join("; ")}`
      : "";
  const userPrompt = topicOverride
    ? `Write today's post specifically about: ${topicOverride}. Find a genuinely interesting, specific angle on this topic rather than a generic overview.${avoidNote}`
    : `Write today's post. General area for inspiration: ${topic}. You don't have to stick strictly to this area — use it as a loose starting point and write about whatever genuinely interesting angle comes to mind.${avoidNote}`;
  const post = await generateJson(userPrompt, SYSTEM_PROMPT);

  const slug = `${dateStr}-${slugify(post.title)}`;
  const frontmatter = [
    "---",
    `title: "${post.title.replace(/"/g, '\\"')}"`,
    `date: "${dateStr}"`,
    `excerpt: "${post.excerpt.replace(/"/g, '\\"')}"`,
    `tags: [${post.tags.map((t) => `"${t}"`).join(", ")}]`,
    `author: "bot"`,
    "---",
    "",
  ].join("\n");

  fs.mkdirSync(POSTS_DIR, { recursive: true });
  fs.writeFileSync(path.join(POSTS_DIR, `${slug}.md`), frontmatter + post.body + "\n");

  console.log(`Created post: ${slug}.md`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
