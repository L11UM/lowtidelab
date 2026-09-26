import { writeFile } from "node:fs/promises";

const NHC_ACTIVE_STORMS = "https://www.nhc.noaa.gov/xhr/active_storms.json";

function numberOrNull(value) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

function readStorms(payload) {
  const raw = Array.isArray(payload?.activeStorms)
    ? payload.activeStorms
    : Array.isArray(payload)
      ? payload
      : [];

  return raw.map((storm, index) => ({
    id: String(storm.id ?? storm.atcf ?? storm.bin ?? index),
    name: String(storm.name ?? storm.storm_name ?? "Unnamed system"),
    basin: String(storm.basin ?? storm.basinAbbr ?? "Atlantic"),
    classification: String(storm.classification ?? storm.type ?? "Active system"),
    lat: numberOrNull(storm.lat ?? storm.latitude),
    lon: numberOrNull(storm.lon ?? storm.longitude),
    windMph: numberOrNull(storm.wind_mph ?? storm.wind ?? storm.maxWind),
    pressureMb: numberOrNull(storm.pressure ?? storm.minPressure),
    movement: storm.movement ? String(storm.movement) : null,
    sourceUrl: "https://www.nhc.noaa.gov/",
  }));
}

let storms = [];
let stormFeedAvailable = false;

try {
  const response = await fetch(NHC_ACTIVE_STORMS, { signal: AbortSignal.timeout(8000) });
  if (response.ok) {
    storms = readStorms(await response.json());
    stormFeedAvailable = true;
  }
} catch {
  // Keep the static build available if the upstream feed is temporarily down.
}

const snapshot = {
  updatedAt: new Date().toISOString(),
  storms,
  alerts: [],
  stormFeedAvailable,
  alertFeedAvailable: false,
  sources: [{ label: "National Hurricane Center", url: "https://www.nhc.noaa.gov/" }],
};

await writeFile(
  new URL("../public/coastal-snapshot.json", import.meta.url),
  JSON.stringify(snapshot),
);
console.log(`Generated coastal storm snapshot (${storms.length} systems; feed ${stormFeedAvailable ? "available" : "unavailable"}).`);
