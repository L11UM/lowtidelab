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

export function readAlerts(payload: any): CoastalAlert[] {
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
