#!/usr/bin/env node
// Generates one blog post per day using an AI provider (Gemini or any OpenAI-compatible
// chat API), writes it to content/posts/, and skips if a post for today already exists.
import fs from "node:fs";
import path from "node:path";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

// PROVIDER: "gemini" (default) or "openai".
const PROVIDER = (process.env.AI_PROVIDER || "gemini").toLowerCase();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
// "gemini-flash-latest" is Google's rolling alias for their current flash model,
// so this doesn't need updating every time a dated model version is deprecated.
const GEMINI_MODEL = process.env.AI_MODEL || "gemini-flash-latest";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
const OPENAI_API_URL = process.env.AI_API_URL || "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = process.env.AI_MODEL || "gpt-4o-mini";

const TOPICS = [
  "a small but clever pattern in modern web development",
  "an underrated feature of a popular AI coding tool",
  "a lesson learned from shipping a side project",
  "a simple idea that makes developer tools feel delightful",
  "something surprising about how large language models behave",
  "a tiny productivity habit for solo developers",
  "an argument for or against a common engineering trend",
];

const SYSTEM_PROMPT = `You are writing a short, genuinely interesting blog post for a personal developer portfolio site with a chill, unpretentious voice. The post is part of a public experiment testing whether AI can write a good blog post every day, fully unedited before publishing.

Rules:
- 250-400 words.
- No fluff, no "in conclusion", no generic AI disclaimers.
- Write like a thoughtful developer sharing a real observation, not marketing copy.
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
const GEMINI_MODEL_FALLBACKS = [GEMINI_MODEL, "gemini-2.0-flash", "gemini-1.5-flash"];

async function callGemini(model, topicHint) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: `${SYSTEM_PROMPT}\n\nWrite today's post about: ${topicHint}` }],
        },
      ],
      generationConfig: {
        temperature: 0.8,
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

async function generateWithGemini(topicHint) {
  if (!GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY (or AI_API_KEY).");

  let lastErr;
  for (const model of GEMINI_MODEL_FALLBACKS) {
    try {
      return await withRetries(() => callGemini(model, topicHint));
    } catch (err) {
      lastErr = err;
      console.log(`Model "${model}" failed after retries: ${err.message.slice(0, 120)}`);
    }
  }
  throw lastErr;
}

async function generateWithOpenAI(topicHint) {
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
        { role: "user", content: `Write today's post about: ${topicHint}` },
      ],
      temperature: 0.8,
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

async function generatePost(topicHint) {
  return PROVIDER === "openai" ? generateWithOpenAI(topicHint) : generateWithGemini(topicHint);
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
  const post = await generatePost(topic);

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
