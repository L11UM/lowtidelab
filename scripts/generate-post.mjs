#!/usr/bin/env node
// Generates one blog post per day using an AI provider (Gemini or any OpenAI-compatible
// chat API), writes it to content/posts/, and skips if a post for today already exists.
import fs from "node:fs";
import path from "node:path";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

// PROVIDER: "gemini" (default) or "openai".
const PROVIDER = (process.env.AI_PROVIDER || "gemini").toLowerCase();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
const GEMINI_MODEL = process.env.AI_MODEL || "gemini-3.6-flash";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
const OPENAI_API_URL = process.env.AI_API_URL || "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = process.env.AI_MODEL || "gpt-4o-mini";

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

function extractJson(raw) {
  // Strip markdown code fences some models add despite instructions.
  const cleaned = raw.trim().replace(/^```(json)?/i, "").replace(/```$/, "").trim();
  return JSON.parse(cleaned);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetries(fn, { attempts = 3, baseDelayMs = 2000 } = {}) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const isRetryable = /\b(429|500|502|503|504)\b/.test(String(err.message));
      if (!isRetryable || i === attempts - 1) throw err;
      const delay = baseDelayMs * 2 ** i;
      console.log(`Attempt ${i + 1} failed (${err.message.slice(0, 80)}...), retrying in ${delay}ms`);
      await sleep(delay);
    }
  }
  throw lastErr;
}

// Fallback chain in case the primary model is overloaded or renamed/deprecated.
const GEMINI_MODEL_FALLBACKS = [GEMINI_MODEL, "gemini-flash-latest", "gemini-2.0-flash"];

async function discoverGeminiModel() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ListModels failed: ${res.status} ${await res.text()}`);

  const data = await res.json();
  const candidates = (data.models || []).filter(
    (m) =>
      m.supportedGenerationMethods?.includes("generateContent") &&
      !/vision|embedding|aqa|tts|image/i.test(m.name)
  );

  // Prefer a "flash" model (cheaper/faster) over "pro".
  const flash = candidates.find((m) => /flash/i.test(m.name));
  const chosen = flash || candidates[0];
  if (!chosen) throw new Error("No usable Gemini model found via ListModels");

  return chosen.name.replace(/^models\//, "");
}

async function callGemini(model, userPrompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }],
        },
      ],
      generationConfig: {
        temperature: 0.9,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini API request failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error("Gemini API returned no content");

  return extractJson(raw);
}

async function generateWithGemini(userPrompt) {
  if (!GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY (or AI_API_KEY).");

  let lastErr;
  let sawNotFound = false;

  for (const model of GEMINI_MODEL_FALLBACKS) {
    try {
      return await withRetries(() => callGemini(model, userPrompt));
    } catch (err) {
      lastErr = err;
      if (/\b404\b/.test(err.message)) sawNotFound = true;
      console.log(`Model "${model}" failed after retries: ${err.message.slice(0, 120)}`);
    }
  }

  // If the hardcoded names are stale, ask Google which models actually exist right now.
  if (sawNotFound) {
    try {
      const discovered = await discoverGeminiModel();
      console.log(`Discovered fallback model via ListModels: ${discovered}`);
      return await withRetries(() => callGemini(discovered, userPrompt));
    } catch (err) {
      lastErr = err;
      console.log(`Discovered model also failed: ${err.message.slice(0, 120)}`);
    }
  }

  throw lastErr;
}

async function generateWithOpenAI(userPrompt) {
  if (!OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY (or AI_API_KEY).");

  const res = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.9,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API request failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error("OpenAI API returned no content");

  return extractJson(raw);
}

async function generatePost(userPrompt) {
  return PROVIDER === "openai" ? generateWithOpenAI(userPrompt) : generateWithGemini(userPrompt);
}

async function main() {
  const dateStr = todaySlugDate();

  if (alreadyPostedToday(dateStr)) {
    console.log(`A post for ${dateStr} already exists — skipping.`);
    return;
  }

  const hasKey = PROVIDER === "openai" ? Boolean(OPENAI_API_KEY) : Boolean(GEMINI_API_KEY);
  if (!hasKey) {
    console.error(
      `Missing API key for provider "${PROVIDER}". Set GEMINI_API_KEY (or AI_API_KEY) as a GitHub Actions secret to enable daily posts.`
    );
    process.exitCode = 1;
    return;
  }

  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  const recentTitles = getRecentTitles();
  const avoidNote =
    recentTitles.length > 0
      ? `\n\nRecent post titles to avoid repeating (pick something clearly different): ${recentTitles.join("; ")}`
      : "";
  const userPrompt = `Write today's post. General area for inspiration: ${topic}. You don't have to stick strictly to this area — use it as a loose starting point and write about whatever genuinely interesting angle comes to mind.${avoidNote}`;
  const post = await generatePost(userPrompt);

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
