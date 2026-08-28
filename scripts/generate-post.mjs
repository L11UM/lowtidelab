#!/usr/bin/env node
// Generates one blog post per day using an OpenAI-compatible chat completion API,
// writes it to content/posts/, and exits cleanly if a post for today already exists.
import fs from "node:fs";
import path from "node:path";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

const API_KEY = process.env.AI_API_KEY;
const API_URL = process.env.AI_API_URL || "https://api.openai.com/v1/chat/completions";
const MODEL = process.env.AI_MODEL || "gpt-4o-mini";

const TOPICS = [
  "a small but clever pattern in modern web development",
  "an underrated feature of a popular AI coding tool",
  "a lesson learned from shipping a side project",
  "a simple idea that makes developer tools feel delightful",
  "something surprising about how large language models behave",
  "a tiny productivity habit for solo developers",
  "an argument for or against a common engineering trend",
];

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

async function generatePost(topicHint) {
  const systemPrompt = `You are writing a short, genuinely interesting blog post for a personal developer portfolio site with a chill, unpretentious voice. The post is part of a public experiment testing whether AI can write a good blog post every day, fully unedited before publishing.

Rules:
- 250-400 words.
- No fluff, no "in conclusion", no generic AI disclaimers.
- Write like a thoughtful developer sharing a real observation, not marketing copy.
- Return ONLY valid JSON with keys: title (string, punchy, under 70 chars), excerpt (string, one sentence, under 140 chars), tags (array of 2-3 lowercase single words), body (string, markdown, no frontmatter, may use ## subheadings and lists).`;

  const userPrompt = `Write today's post about: ${topicHint}`;

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    throw new Error(`AI API request failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error("AI API returned no content");

  return JSON.parse(raw);
}

async function main() {
  const dateStr = todaySlugDate();

  if (alreadyPostedToday(dateStr)) {
    console.log(`A post for ${dateStr} already exists — skipping.`);
    return;
  }

  if (!API_KEY) {
    console.error(
      "Missing AI_API_KEY environment variable. Set it as a GitHub Actions secret to enable daily posts."
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
