#!/usr/bin/env node

const siteUrl = process.env.SITE_URL || "https://lowtidelab.dev";
const title = process.env.COMMIT_TITLE || "A new signal is live at Low Tide Lab";
const sha = process.env.COMMIT_SHA || "";
const changedFiles = (process.env.CHANGED_FILES || "").split("\n").filter(Boolean);
const releaseUrl = `${siteUrl}/`;

function hasAny(...terms) {
  const text = changedFiles.join(" ").toLowerCase();
  return terms.some((term) => text.includes(term));
}

function featureLine() {
  if (hasAny("shop", "mockup", "field gear")) return "New field gear is on deck: a Low Tide cap and deck signal patch.";
  if (hasAny("home-spot", "coastal-spots", "break-call", "marine")) return "The dashboard now remembers your home break and gives a tide + wind + swell call.";
  if (hasAny("pier", "pier-scope")) return "Pier Scope is live with real coastal camera feeds and auto-cruise viewing.";
  if (hasAny("coast-map", "coast-chart", "leaflet", "map")) return "The Coast Chart now plots pier cams, NOAA tide stations, and active storms together.";
  if (hasAny("tide", "tide-tracker")) return "Tide tables now make it easier to check the next turn before you head out.";
  if (hasAny("coastal", "storm", "nhc", "nws")) return "The coastal watch has a fresh read on storms, alerts, and changing water.";
  return "A new ocean signal is live on the Low Tide Lab dashboard.";
}

const feature = featureLine();
const xText = `${feature} Check it out at ${releaseUrl} #LowTideLab #OceanIntel`;
const instagramCaption = `${feature}\n\nLow Tide Lab is a small ocean-intelligence desk for people who check the water before they leave the house.\n\n${releaseUrl}\n\n#LowTideLab #OceanIntel #CoastalConditions #SurfCheck`;
const payload = {
  generatedAt: new Date().toISOString(),
  commit: sha,
  commitTitle: title,
  feature,
  x: xText.slice(0, 280),
  instagram: instagramCaption,
  changedFiles,
};

if (process.env.DRY_RUN === "true") {
  console.log(JSON.stringify(payload, null, 2));
  process.exit(0);
}

async function postX() {
  const token = process.env.X_ACCESS_TOKEN;
  if (!token) return { status: "draft", reason: "X_ACCESS_TOKEN is not configured" };
  const response = await fetch("https://api.x.com/2/tweets", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text: payload.x }),
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`X API ${response.status}: ${body}`);
  return { status: "published", id: JSON.parse(body).data?.id ?? null };
}

async function postInstagram() {
  const userId = process.env.INSTAGRAM_USER_ID;
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const imageUrl = process.env.INSTAGRAM_IMAGE_URL;
  if (!userId || !token || !imageUrl) return { status: "draft", reason: "Instagram secrets are not fully configured" };

  const createParams = new URLSearchParams({ image_url: imageUrl, caption: payload.instagram, access_token: token });
  const createResponse = await fetch(`https://graph.facebook.com/v22.0/${userId}/media`, { method: "POST", body: createParams });
  const createBody = await createResponse.json();
  if (!createResponse.ok) throw new Error(`Instagram container ${createResponse.status}: ${JSON.stringify(createBody)}`);

  const publishParams = new URLSearchParams({ creation_id: createBody.id, access_token: token });
  const publishResponse = await fetch(`https://graph.facebook.com/v22.0/${userId}/media_publish`, { method: "POST", body: publishParams });
  const publishBody = await publishResponse.json();
  if (!publishResponse.ok) throw new Error(`Instagram publish ${publishResponse.status}: ${JSON.stringify(publishBody)}`);
  return { status: "published", id: publishBody.id ?? null };
}

const results = { x: await postX(), instagram: await postInstagram() };
console.log(JSON.stringify({ ...payload, results }, null, 2));
