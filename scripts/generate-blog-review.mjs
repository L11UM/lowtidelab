#!/usr/bin/env node
// Publishes a weekly, unedited review of real GA4 blog metrics.
// It deliberately skips when GA4 is not configured rather than inventing performance data.
import fs from "node:fs";
import path from "node:path";
import { google } from "googleapis";
import { generateJson, hasApiKey, currentProvider } from "./lib/ai-client.mjs";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const propertyId = process.env.GA4_PROPERTY_ID;
const credentialsJson = process.env.GA4_SERVICE_ACCOUNT_JSON;

function dateString() {
  return new Date().toISOString().slice(0, 10);
}

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
}

async function getMetrics() {
  if (!propertyId || !credentialsJson) return null;
  const credentials = JSON.parse(credentialsJson);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
  });
  const analytics = google.analyticsdata({ version: "v1beta", auth });
  const response = await analytics.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate: "7daysAgo", endDate: "yesterday" }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }, { name: "eventCount" }],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: { matchType: "BEGINS_WITH", value: "/blog/" },
        },
      },
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 10,
    },
  });
  return (response.data.rows ?? []).map((row) => ({
    path: row.dimensionValues?.[0]?.value ?? "",
    views: Number(row.metricValues?.[0]?.value ?? 0),
    events: Number(row.metricValues?.[1]?.value ?? 0),
  }));
}

async function main() {
  if (!propertyId || !credentialsJson) {
    console.log("GA4_PROPERTY_ID or GA4_SERVICE_ACCOUNT_JSON is not configured — skipping honest weekly blog review.");
    return;
  }
  if (!hasApiKey()) {
    throw new Error(`Missing AI API key for provider "${currentProvider()}".`);
  }

  const metrics = await getMetrics();
  const prompt = `Write a transparent weekly performance note for Low Tide Lab's public blog. These are real GA4 results for the last 7 complete days:\n\n${JSON.stringify(metrics)}\n\nCritique the blog honestly: name what attracted attention, what did not, and one content experiment for the next week. Do not claim causation from small samples. Do not fabricate clicks, readers, or conversion results. Include a brief note that metrics are GA4 page views/events, not proof of reader satisfaction.`;
  const system = `You are Oswald, the resident AI writing an unedited public weekly review of a daily blog experiment. Keep it concrete, candid, and useful. Return ONLY JSON: {title, excerpt, tags, body}. Body must be 250-400 markdown words. Include these headings: ## What the data says, ## What I would change, ## Next experiment.`;
  const review = await generateJson(prompt, system);
  const date = dateString();
  const filename = `${date}-${slugify(review.title)}.md`;
  const frontmatter = [
    "---",
    `title: "${review.title.replace(/"/g, '\\"')}"`,
    `date: "${date}"`,
    `excerpt: "${review.excerpt.replace(/"/g, '\\"')}"`,
    `tags: [${review.tags.map((tag) => `"${tag}"`).join(", ")}]`,
    'author: "bot"',
    'kind: "performance-review"',
    "---",
    "",
  ].join("\n");
  fs.mkdirSync(POSTS_DIR, { recursive: true });
  fs.writeFileSync(path.join(POSTS_DIR, filename), `${frontmatter}${review.body}\n`);
  console.log(`Created weekly blog review: ${filename}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
