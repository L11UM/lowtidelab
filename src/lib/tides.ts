// Fetches live tide predictions from NOAA's public CO-OPS API (no key required).
export const tideStations = [
  { id: "9410840", name: "Santa Monica, California", region: "Los Angeles County", timeZone: "America/Los_Angeles", lat: 34.0083, lon: -118.5 },
  { id: "9410660", name: "Los Angeles, California", region: "South Bay", timeZone: "America/Los_Angeles", lat: 33.72, lon: -118.272 },
  { id: "9410580", name: "Newport Beach, California", region: "Orange County", timeZone: "America/Los_Angeles", lat: 33.6033, lon: -117.883 },
  { id: "9410170", name: "San Diego, California", region: "San Diego County", timeZone: "America/Los_Angeles", lat: 32.715557, lon: -117.17667 },
] as const;

export type TideStation = (typeof tideStations)[number];
export const defaultTideStation = tideStations[1];

export type TidePoint = { time: Date; feet: number };
export type HiLoPoint = { time: Date; feet: number; type: "H" | "L" };

export type TideData = {
  points: TidePoint[];
  hiLo: HiLoPoint[];
  stationName: string;
  timeZone: string;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatDate(d: Date) {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
}

function stationDate(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "0";
  return new Date(Date.UTC(Number(part("year")), Number(part("month")) - 1, Number(part("day"))));
}

function parseNoaaTime(t: string): Date {
  // NOAA returns "YYYY-MM-DD HH:mm" in local station time, converting to UTC.
  return new Date(`${t.replace(" ", "T")}Z`);
}

export async function fetchTideData(station: TideStation = defaultTideStation): Promise<TideData> {
  const today = stationDate(new Date(), station.timeZone);
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  const begin = formatDate(today);
  const end = formatDate(tomorrow);

  const base = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter";
  const params = new URLSearchParams({
    application: "lowtidelab",
    begin_date: begin,
    end_date: end,
    station: station.id,
    datum: "MLLW",
    time_zone: "gmt",
    units: "english",
    format: "json",
  });
  const common = params.toString();

  const [predRes, hiloRes] = await Promise.all([
    fetch(`${base}?${common}&product=predictions&interval=15`, { signal: AbortSignal.timeout(10000) }),
    fetch(`${base}?${common}&product=predictions&interval=hilo`, { signal: AbortSignal.timeout(10000) }),
  ]);

  if (!predRes.ok || !hiloRes.ok) throw new Error("Tide data request failed");

  const predJson = await predRes.json();
  const hiloJson = await hiloRes.json();

  if (predJson.error || hiloJson.error) throw new Error("NOAA API returned an error");

  const points: TidePoint[] = (predJson.predictions || []).map(
    (p: { t: string; v: string }) => ({
      time: parseNoaaTime(p.t),
      feet: parseFloat(p.v),
    })
  );

  const hiLo: HiLoPoint[] = (hiloJson.predictions || []).map(
    (p: { t: string; v: string; type: "H" | "L" }) => ({
      time: parseNoaaTime(p.t),
      feet: parseFloat(p.v),
      type: p.type,
    })
  );

  if (points.length === 0) throw new Error("No tide predictions returned");

  return { points, hiLo, stationName: station.name, timeZone: station.timeZone };
}
