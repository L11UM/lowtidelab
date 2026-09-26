export type CoastalStorm = {
  id: string;
  name: string;
  basin: string;
  classification: string;
  lat: number | null;
  lon: number | null;
  windMph: number | null;
  pressureMb: number | null;
  movement: string | null;
  sourceUrl: string;
};

export type CoastalAlert = {
  id: string;
  area: string;
  headline: string;
  severity: string;
  event: string;
  sent: string;
  url: string;
};

export type CoastalSnapshot = {
  updatedAt: string;
  storms: CoastalStorm[];
  alerts: CoastalAlert[];
  stormFeedAvailable: boolean;
  alertFeedAvailable: boolean;
  sources: { label: string; url: string }[];
};

const NHC_ACTIVE_STORMS = "https://www.nhc.noaa.gov/xhr/active_storms.json";
const NWS_ALERTS = "https://api.weather.gov/alerts/active?status=actual&message_type=alert";
const NWS_USER_AGENT = "Low Tide Lab coastal dashboard (hello@lowtidelab.dev)";

function numberOrNull(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

function readStorms(payload: any): CoastalStorm[] {
  const raw = Array.isArray(payload?.activeStorms) ? payload.activeStorms : Array.isArray(payload) ? payload : [];
  return raw.map((storm: any, index: number) => ({
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

function readAlerts(payload: any): CoastalAlert[] {
  const features = Array.isArray(payload?.features) ? payload.features : [];
  return features.slice(0, 18).map((feature: any, index: number) => {
    const p = feature.properties ?? {};
    return {
      id: String(feature.id ?? index),
      area: String(p.areaDesc ?? "United States coast"),
      headline: String(p.headline ?? p.description ?? "Coastal alert"),
      severity: String(p.severity ?? "Unknown"),
      event: String(p.event ?? "Weather alert"),
      sent: String(p.sent ?? new Date().toISOString()),
      url: String(p.web ?? "https://www.weather.gov/alerts"),
    };
  });
}

export async function fetchCoastalSnapshot(): Promise<CoastalSnapshot> {
  const headers = { "User-Agent": NWS_USER_AGENT, Accept: "application/geo+json, application/json" };
  const [stormResponse, alertResponse] = await Promise.all([
    fetch(NHC_ACTIVE_STORMS, { next: { revalidate: 300 }, signal: AbortSignal.timeout(8000) })
      .then(async (response) => ({ response, payload: response.ok ? await response.json() : null }))
      .catch(() => ({ response: null, payload: null })),
    fetch(NWS_ALERTS, { headers, next: { revalidate: 300 }, signal: AbortSignal.timeout(8000) })
      .then(async (response) => ({ response, payload: response.ok ? await response.json() : null }))
      .catch(() => ({ response: null, payload: null })),
  ]);

  const storms = stormResponse.response?.ok ? readStorms(stormResponse.payload) : [];
  const alerts = alertResponse.response?.ok ? readAlerts(alertResponse.payload) : [];
  return {
    updatedAt: new Date().toISOString(),
    storms,
    alerts,
    stormFeedAvailable: Boolean(stormResponse.response?.ok),
    alertFeedAvailable: Boolean(alertResponse.response?.ok),
    sources: [
      { label: "National Hurricane Center", url: "https://www.nhc.noaa.gov/" },
      { label: "National Weather Service alerts", url: "https://www.weather.gov/alerts" },
    ],
  };
}
