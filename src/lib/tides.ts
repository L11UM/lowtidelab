// Fetches live tide predictions from NOAA's public CO-OPS API (no key required).
// Station 9410660 (Los Angeles, CA) is the nearest NOAA tide station to Redondo Beach, CA.
const STATION_ID = "9410660";
const STATION_NAME = "Los Angeles, CA — nearest NOAA station to Redondo Beach";

export type TidePoint = { time: Date; feet: number };
export type HiLoPoint = { time: Date; feet: number; type: "H" | "L" };

export type TideData = {
  points: TidePoint[];
  hiLo: HiLoPoint[];
  stationName: string;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatDate(d: Date) {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

function parseNoaaTime(t: string): Date {
  // NOAA returns "YYYY-MM-DD HH:mm" in local station time.
  return new Date(t.replace(" ", "T"));
}

export async function fetchTideData(): Promise<TideData> {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const begin = formatDate(today);
  const end = formatDate(tomorrow);

  const base = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter";
  const common =
    `application=lowtidelab&begin_date=${begin}&end_date=${end}&station=${STATION_ID}` +
    `&datum=MLLW&time_zone=lst_ldt&units=english&format=json`;

  const [predRes, hiloRes] = await Promise.all([
    fetch(`${base}?${common}&product=predictions&interval=15`),
    fetch(`${base}?${common}&product=predictions&interval=hilo`),
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

  return { points, hiLo, stationName: STATION_NAME };
}
