#!/usr/bin/env node
// Generates one blog post per day using an AI provider (Gemini or any OpenAI-compatible
// chat API), writes it to content/posts/, and skips if a post for today already exists.
import fs from "node:fs";
import path from "node:path";
import { generateJson, hasApiKey, currentProvider } from "./lib/ai-client.mjs";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

const CREATURES = [
  ["vampire squid", "Vampyroteuthis infernalis"],
  ["Dumbo octopus", "Grimpoteuthis spp."],
  ["barreleye fish", "Macropinna microstoma"],
  ["giant isopod", "Bathynomus giganteus"],
  ["black dragonfish", "Idiacanthus atlanticus"],
  ["giant phantom jelly", "Stygiomedusa gigantea"],
  ["Yeti crab", "Kiwa tyleri"],
  ["gulper eel", "Eurypharynx pelecanoides"],
  ["deep-sea anglerfish", "Ceratioidei"],
  ["bigfin squid", "Magnapinna spp."],
  ["frilled shark", "Chlamydoselachus anguineus"],
  ["Greenland shark", "Somniosus microcephalus"],
  ["cookiecutter shark", "Isistius brasiliensis"],
  ["Pacific viperfish", "Chauliodus macouni"],
  ["deep-sea hatchetfish", "Argyropelecus spp."],
  ["tripod fish", "Bathypterois grallator"],
  ["Atolla jellyfish", "Atolla wyvillei"],
  ["cockeyed squid", "Histioteuthis heteropsis"],
  ["faceless cusk eel", "Typhlonus nasus"],
  ["snailfish of the hadal zone", "Pseudoliparis swirei"],
  ["deep-sea comb jelly", "Beroe abyssicola"],
  ["Sloane's viperfish", "Chauliodus sloani"],
  ["long-arm octopus squid", "Chiroteuthis calyx"],
  ["giant larvacean", "Bathochordaeus stygius"],
  ["giant siphonophore", "Praya dubia"],
  ["Pacific blackdragon", "Idiacanthus antrostomus"],
  ["deep-sea red crab", "Chaceon quinquedens"],
  ["glass squid", "Cranchia scabra"],
  ["sleeper shark", "Somniosus pacificus"],
  ["telescope octopus", "Amphitretus pelagicus"],
  ["giant squid", "Architeuthis dux"],
  ["colossal squid", "Mesonychoteuthis hamiltoni"],
  ["Pacific footballfish", "Himantolophus sagamius"],
  ["Pompeii worm", "Alvinella pompejana"],
  ["longnose lancetfish", "Alepisaurus ferox"],
  ["stubby squid", "Rossia pacifica"],
  ["deep-sea octopus", "Opisthoteuthis californiana"],
];

const SYSTEM_PROMPT = `You are the natural-history writer aboard Low Tide Lab, a submarine collecting field notes on deep-sea life. Write one engaging, accurate daily creature profile for an ocean-intelligence site.

Rules:
- 250-400 words.
- Focus on the assigned creature, not a broad overview of ocean life.
- Explain how its adaptations fit its habitat, using concrete but well-supported details.
- Never invent measurements, depth records, behaviors, or conservation status. If a detail is uncertain or varies by species, say so.
- Include two or three reliable source links in the markdown body (NOAA, MBARI, Smithsonian Ocean, or peer-reviewed institutions). Do not fabricate source URLs; omit a citation if you cannot verify the link.
- No fluff, no "in conclusion", no generic AI disclaimers, and no claims that a human wrote or reviewed the post.
- Return ONLY valid JSON with keys: title (under 70 chars), excerpt (one sentence under 140 chars), creature (common name), scientificName, tags (2-3 lowercase single words), and body (markdown, no frontmatter).`;

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

function getRecentCreatures(limit = 15) {
  if (!fs.existsSync(POSTS_DIR)) return new Set();
  return new Set(fs.readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".md"))
    .sort()
    .reverse()
    .slice(0, limit)
    .map((file) => {
      const content = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
      return content.match(/^scientific_name:\s*"(.*)"\s*$/m)?.[1]?.toLowerCase();
    })
    .filter(Boolean));
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
  const recentCreatures = getRecentCreatures();
  const availableCreatures = CREATURES.filter(([, scientificName]) => !recentCreatures.has(scientificName.toLowerCase()));
  const assignedCreature = availableCreatures[Math.floor(Math.random() * availableCreatures.length)] ?? CREATURES[Math.floor(Math.random() * CREATURES.length)];
  const recentTitles = getRecentTitles();
  const avoidNote =
    recentTitles.length > 0
      ? `\n\nRecent post titles to avoid repeating (pick something clearly different): ${recentTitles.join("; ")}`
      : "";
  const creaturePrompt = topicOverride
    ? `Write today's creature profile about: ${topicOverride}. Identify the correct scientific name and focus on a distinct deep-sea animal.`
    : `Today's assigned creature: ${assignedCreature[0]} (${assignedCreature[1]}). Keep the profile specifically about this animal.`;
  const userPrompt = `${creaturePrompt}${avoidNote}\n\nRecent creature scientific names to avoid repeating: ${[...recentCreatures].slice(-30).join("; ") || "none"}`;
  const post = await generateJson(userPrompt, SYSTEM_PROMPT);
  const creatureName = post.creature || assignedCreature[0];
  const scientificName = post.scientificName || assignedCreature[1];

  if (!topicOverride && scientificName.toLowerCase() !== assignedCreature[1].toLowerCase()) {
    throw new Error(`Generated creature ${scientificName} did not match assigned creature ${assignedCreature[1]}.`);
  }

  const slug = `${dateStr}-${slugify(post.title)}`;
  const frontmatter = [
    "---",
    `title: "${post.title.replace(/"/g, '\\"')}"`,
    `date: "${dateStr}"`,
    `excerpt: "${post.excerpt.replace(/"/g, '\\"')}"`,
    `tags: [${post.tags.map((t) => `"${t}"`).join(", ")}]`,
    `creature: "${creatureName.replace(/"/g, '\\"')}"`,
    `scientific_name: "${scientificName.replace(/"/g, '\\"')}"`,
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
