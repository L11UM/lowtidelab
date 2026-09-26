import { writeFile } from "node:fs/promises";

const NHC_ACTIVE_STORMS = "https://www.nhc.noaa.gov/CurrentStorms.json";
const COMPASS_DIRECTIONS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

function readWindMph(storm) {
  const windMph = numberOrNull(storm.wind_mph ?? storm.maxWind);
  if (windMph !== null) return Math.round(windMph);
  const windKnots = numberOrNull(storm.intensity);
  return windKnots === null ? null : Math.round(windKnots * 1.15078);
}

function readMovement(storm) {
  if (storm.movement) return String(storm.movement);
  const direction = numberOrNull(storm.movementDir);
  const speed = numberOrNull(storm.movementSpeed);
  if (direction === null || speed === null) return null;
  const compass = COMPASS_DIRECTIONS[Math.round(direction / 22.5) % COMPASS_DIRECTIONS.length];
  return `${compass} at ${Math.round(speed * 1.15078)} mph`;
}

function readBasin(storm) {
  if (storm.basin || storm.basinAbbr) return String(storm.basin ?? storm.basinAbbr);
  const id = String(storm.id ?? storm.atcf ?? storm.binNumber ?? "").toLowerCase();
  if (id.startsWith("al") || id.startsWith("at")) return "Atlantic";
  if (id.startsWith("ep")) return "Pacific";
  if (id.startsWith("cp")) return "Central Pacific";
  return "Tropical";
}

function readStorms(payload) {
  const raw = Array.isArray(payload?.activeStorms)
    ? payload.activeStorms
    : Array.isArray(payload)
      ? payload
      : [];

  return raw.map((storm, index) => ({
    id: String(storm.id ?? storm.atcf ?? storm.bin ?? storm.binNumber ?? index),
    name: String(storm.name ?? storm.storm_name ?? "Unnamed system"),
    basin: readBasin(storm),
    classification: String(storm.classification ?? storm.type ?? "Active system"),
    lat: numberOrNull(storm.lat ?? storm.latitudeNumeric ?? storm.latitude),
    lon: numberOrNull(storm.lon ?? storm.longitudeNumeric ?? storm.longitude),
    windMph: readWindMph(storm),
    pressureMb: numberOrNull(storm.pressure ?? storm.minPressure),
    movement: readMovement(storm),
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
