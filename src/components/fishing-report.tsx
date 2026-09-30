"use client";

import { useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import { ArrowUpRight, Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, Fish, LocateFixed, RefreshCw, Snowflake, Sun, ThermometerSun, Wind } from "lucide-react";
import { defaultFishingSpot, fishingSpots, type FishingSpot } from "@/lib/fishing-spots";
import { fetchStockingReport, matchingStockingWeek, type StockingReport } from "@/lib/stocking";

type CurrentWeather = {
  time: string;
  temperature_2m: number;
  apparent_temperature: number;
  relative_humidity_2m: number;
  precipitation: number;
  weather_code: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  wind_gusts_10m: number;
};

type DailyWeather = {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max: number[];
};

type WeatherReport = {
  current: CurrentWeather;
  daily: DailyWeather;
};

function weatherLabel(code: number) {
  if (code === 0) return "Clear sky";
  if (code <= 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code <= 48) return "Fog";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain showers";
  if (code <= 86) return "Snow showers";
  return "Thunderstorms";
}

function WeatherIcon({ code, className }: { code: number; className?: string }) {
  const Icon = code === 0 ? Sun : code <= 2 ? Cloud : code === 3 ? Cloud : code <= 48 ? CloudFog : code <= 57 ? CloudDrizzle : code <= 67 ? CloudRain : code <= 77 ? Snowflake : code <= 82 ? CloudRain : code <= 86 ? Snowflake : CloudLightning;
  return <Icon className={className} aria-hidden="true" />;
}

function windDirection(degrees: number) {
  return ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(degrees / 45) % 8];
}

function formatDay(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { weekday: "short" });
}

function groupSpots(spots: FishingSpot[]) {
  return spots.reduce<Record<string, FishingSpot[]>>((groups, spot) => {
    groups[spot.region] ??= [];
    groups[spot.region].push(spot);
    return groups;
  }, {});
}

export function FishingReport() {
  const [spotId, setSpotId] = useState(defaultFishingSpot.id);
  const [weather, setWeather] = useState<WeatherReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [stockingReport, setStockingReport] = useState<StockingReport | null>(null);
  const [stockingLoading, setStockingLoading] = useState(true);
  const [stockingRefresh, setStockingRefresh] = useState(0);
  const spot = fishingSpots.find((item) => item.id === spotId) ?? defaultFishingSpot;
  const groupedSpots = useMemo(() => groupSpots(fishingSpots), []);
  const current = weather?.current;
  const lastStocking = stockingReport ? matchingStockingWeek(spot, stockingReport) : null;
  const stockingWeeksAgo = lastStocking
    ? Math.max(0, Math.floor((Date.now() - new Date(`${lastStocking.weekOf}T12:00:00`).getTime()) / (7 * 24 * 60 * 60 * 1000)))
    : null;
  const stockingAgePercent = stockingWeeksAgo === null ? 0 : Math.min(100, (stockingWeeksAgo / 10) * 100);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setUnavailable(false);
    setWeather(null);
    const params = new URLSearchParams({
      latitude: String(spot.coordinates.latitude),
      longitude: String(spot.coordinates.longitude),
      current: "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
      temperature_unit: "fahrenheit",
      wind_speed_unit: "mph",
      timezone: "America/Phoenix",
      forecast_days: "4",
    });

    fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Weather service unavailable");
        return await response.json() as WeatherReport;
      })
      .then((report) => setWeather(report))
      .catch(() => {
        if (!controller.signal.aborted) setUnavailable(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [spot]);

  useEffect(() => {
    const controller = new AbortController();
    setStockingLoading(true);
    fetchStockingReport(controller.signal)
      .then((report) => setStockingReport(report))
      .catch(() => setStockingReport(null))
      .finally(() => {
        if (!controller.signal.aborted) setStockingLoading(false);
      });
    return () => controller.abort();
  }, [stockingRefresh]);

  const windRead = current
    ? current.wind_gusts_10m >= 30
      ? "Strong gusts"
      : current.wind_speed_10m >= 18
        ? "Breezy"
        : "Light wind"
    : "—";

  return (
    <section aria-label="Northern Arizona fishing report" className="container-x py-8 sm:py-12">
      <header className="mb-7 max-w-3xl border-b border-white/10 pb-6 sm:mb-9">
        <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-primary-light">
          <Fish className="h-3.5 w-3.5" /> Northern Arizona <span className="text-white/25">/</span> Field report
        </p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-4xl">Fishing report</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">Pick a water for local weather, target species, and trip notes.</p>
      </header>

      <div className="mb-6 grid gap-4 border-b border-white/10 pb-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="max-w-xl">
          <label htmlFor="fishing-spot" className="mb-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Selected water</label>
          <select
            id="fishing-spot"
            value={spotId}
            onChange={(event) => setSpotId(event.target.value)}
            className="w-full rounded-md border border-white/15 bg-surface px-3 py-3 text-sm text-white outline-none transition-colors focus:border-primary-light sm:max-w-md"
          >
            {Object.entries(groupedSpots).map(([region, spots]) => (
              <optgroup key={region} label={region}>
                {spots.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
        <p className="inline-flex items-center gap-2 text-xs text-muted"><LocateFixed className="h-3.5 w-3.5 text-primary-light" /> {spot.community} · {spot.region}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:gap-10">
        <div className="min-w-0">
          <section aria-labelledby="spot-title">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary-light">{spot.style}</p>
            <h2 id="spot-title" className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{spot.name}</h2>
            <div className="mt-4 flex flex-wrap gap-2" aria-label="Common target species">
              {spot.species.map((species) => <span key={species} className="rounded border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs text-white/80">{species}</span>)}
            </div>
          </section>

          <section aria-labelledby="approach-title" className="mt-8 border-t border-white/10 pt-5">
            <h3 id="approach-title" className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Water notes</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/80">{spot.approach}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{spot.waterNote}</p>
          </section>

          <section aria-labelledby="forecast-title" className="mt-8 border-t border-white/10 pt-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 id="forecast-title" className="text-xs font-medium uppercase tracking-[0.14em] text-muted">4-day weather</h3>
                <p className="mt-1 text-xs text-muted">Forecast near {spot.name}; not a water-temperature or bite sensor.</p>
              </div>
              {weather?.current.time && <p className="font-mono text-[10px] text-muted">Updated {weather.current.time.replace("T", " ")} Arizona time</p>}
            </div>
            {loading ? (
              <p role="status" className="mt-4 text-sm text-muted">Loading local forecast…</p>
            ) : unavailable || !weather ? (
              <p role="status" className="mt-4 text-sm text-muted">Weather forecast is temporarily unavailable. Check the linked local sources before heading out.</p>
            ) : (
              <ol className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {weather.daily.time.map((date, index) => (
                  <li key={date} className="border-l border-white/10 py-1 pl-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">{index === 0 ? "Today" : formatDay(date)}</p>
                    <div className="mt-2 flex items-center gap-2 text-primary-light">
                      <WeatherIcon code={weather.daily.weather_code[index]} className="h-4 w-4" />
                      <span className="text-sm font-medium text-white">{Math.round(weather.daily.temperature_2m_max[index])}°</span>
                      <span className="text-xs text-muted">{Math.round(weather.daily.temperature_2m_min[index])}°</span>
                    </div>
                    <p className="mt-1 text-[10px] text-muted">{weather.daily.precipitation_probability_max[index]}% precip</p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside aria-label="Current trip conditions" className="h-fit border-y border-white/10 py-5 lg:border-l lg:border-y-0 lg:py-0 lg:pl-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Right now</p>
              <p className="mt-1 text-xs text-muted">{current ? weatherLabel(current.weather_code) : loading ? "Reading nearby weather…" : "Conditions unavailable"}</p>
            </div>
            <WeatherIcon code={current?.weather_code ?? 1} className="h-5 w-5 text-primary-light" />
          </div>

          {current ? (
            <>
              <p className="mt-5 text-5xl font-semibold tabular-nums text-white">{Math.round(current.temperature_2m)}<span className="text-2xl text-muted">°F</span></p>
              <p className="mt-1 text-xs text-muted">Feels like {Math.round(current.apparent_temperature)}° · Humidity {current.relative_humidity_2m}%</p>
              <dl className="mt-6 divide-y divide-white/10 border-y border-white/10">
                <div className="flex items-center justify-between gap-3 py-3">
                  <dt className="inline-flex items-center gap-2 text-xs text-muted"><Wind className="h-3.5 w-3.5" /> Wind</dt>
                  <dd className="text-right text-xs text-white">{Math.round(current.wind_speed_10m)} mph {windDirection(current.wind_direction_10m)} <span className="text-muted">· gusts {Math.round(current.wind_gusts_10m)}</span></dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-3">
                  <dt className="inline-flex items-center gap-2 text-xs text-muted"><ThermometerSun className="h-3.5 w-3.5" /> Trip read</dt>
                  <dd className={clsx("text-xs", current.wind_gusts_10m >= 30 ? "text-accent-light" : "text-white")}>{windRead}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-3">
                  <dt className="inline-flex items-center gap-2 text-xs text-muted"><CloudRain className="h-3.5 w-3.5" /> Precipitation</dt>
                  <dd className="text-xs text-white">{current.precipitation} mm now</dd>
                </div>
              </dl>
            </>
          ) : loading ? (
            <p className="mt-5 text-sm text-muted">Fetching current conditions…</p>
          ) : (
            <p className="mt-5 text-sm text-muted">Current conditions could not be loaded.</p>
          )}

          <section aria-labelledby="stocking-meter-title" className="mt-6 border-y border-white/10 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 id="stocking-meter-title" className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Stocking recency</h3>
                {stockingLoading ? (
                  <p role="status" className="mt-2 text-sm text-muted">Checking AZGFD schedule…</p>
                ) : lastStocking && stockingWeeksAgo !== null ? (
                  <>
                    <p className="mt-2 text-sm font-medium text-white">Week of {new Date(`${lastStocking.weekOf}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                    <p className="mt-1 text-xs text-muted">{stockingWeeksAgo === 0 ? "Listed this week" : `${stockingWeeksAgo} ${stockingWeeksAgo === 1 ? "week" : "weeks"} ago`} · {lastStocking.season}</p>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-muted">{stockingReport?.available ? "No stocking week listed for this water." : "Stocking schedule unavailable."}</p>
                )}
              </div>
              <button type="button" onClick={() => setStockingRefresh((value) => value + 1)} disabled={stockingLoading} aria-label="Refresh stocking schedule" title="Refresh AZGFD schedule" className="rounded border border-white/10 p-2 text-muted transition-colors hover:border-white/25 hover:text-white disabled:opacity-40">
                <RefreshCw className={clsx("h-3.5 w-3.5", stockingLoading && "animate-spin")} />
              </button>
            </div>
            <div role="meter" aria-label="Weeks since AZGFD's listed stocking week" aria-valuemin={0} aria-valuemax={10} aria-valuenow={stockingWeeksAgo === null ? 0 : Math.min(stockingWeeksAgo, 10)} aria-valuetext={lastStocking && stockingWeeksAgo !== null ? `${stockingWeeksAgo} ${stockingWeeksAgo === 1 ? "week" : "weeks"} since the AZGFD listed stocking week` : "No matching stocking week listed"} className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className={clsx("h-full rounded-full transition-[width] duration-500", stockingWeeksAgo !== null && stockingWeeksAgo <= 2 ? "bg-primary-light" : stockingWeeksAgo !== null && stockingWeeksAgo <= 6 ? "bg-accent-light" : "bg-muted")} style={{ width: `${stockingAgePercent}%` }} />
            </div>
            <div className="mt-1.5 flex justify-between font-mono text-[9px] uppercase tracking-[0.12em] text-muted"><span>0 weeks</span><span>10+ weeks</span></div>
            <p className="mt-2 text-[10px] leading-relaxed text-muted">AZGFD lists the planned stocking week; the delivery day can shift. This is recency, not a catch-rate forecast.</p>
            {stockingReport?.checkedAt && <p className="mt-1 font-mono text-[9px] text-muted">Schedule checked {new Date(stockingReport.checkedAt).toLocaleTimeString("en-US", { timeZone: "America/Phoenix", hour: "numeric", minute: "2-digit" })} Arizona time</p>}
          </section>

          <div className="mt-6 space-y-2">
            <a href={spot.mapUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 border-b border-white/10 py-2 text-xs text-primary-light transition-colors hover:text-white">
              AZGFD Fish & Boat map <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <a href="https://www.azgfd.com/fishing-2/where-to-fish/fishing-report-archive/" target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 border-b border-white/10 py-2 text-xs text-primary-light transition-colors hover:text-white">
              AZGFD fishing report archive <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <a href="https://www.azgfd.com/fishing-2/where-to-fish/fish-stocking-schedule/" target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 border-b border-white/10 py-2 text-xs text-primary-light transition-colors hover:text-white">
              Stocking schedule <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <a href="https://www.azgfd.com/fishing-2/licenses-and-regulations/" target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 border-b border-white/10 py-2 text-xs text-primary-light transition-colors hover:text-white">
              License & regulations <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            {spot.levelUrl && <a href={spot.levelUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 border-b border-white/10 py-2 text-xs text-primary-light transition-colors hover:text-white">
              Water level / flow <ArrowUpRight className="h-3.5 w-3.5" />
            </a>}
          </div>
        </aside>
      </div>

      <p className="mt-8 border-t border-white/10 pt-4 text-[11px] leading-relaxed text-muted">Weather updates from Open-Meteo. Species and fishing notes are general water profiles, not recent angler-submitted catches. Verify current conditions, closures, stocking, and regulations with AZGFD before your trip.</p>
    </section>
  );
}
