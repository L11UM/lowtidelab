"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Loader2, MapPin, Waves } from "lucide-react";
import { defaultTideStation, fetchTideData, tideStations, type TideData, type TideStation } from "@/lib/tides";

const WIDTH = 400;
const HEIGHT = 150;
const PAD_Y = 16;

export function TideTracker({ fullWidth = false }: { fullWidth?: boolean }) {
  const [data, setData] = useState<TideData | null>(null);
  const [station, setStation] = useState<TideStation>(defaultTideStation);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setData(null);

    fetchTideData(station)
      .then((result) => {
        if (cancelled) return;
        setData(result);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [station]);

  const chart = useMemo(() => {
    if (!data || data.points.length === 0) return null;

    const times = data.points.map((p) => p.time.getTime());
    const minT = Math.min(...times);
    const maxT = Math.max(...times);
    const feetValues = data.points.map((p) => p.feet);
    const minFeet = Math.min(...feetValues);
    const maxFeet = Math.max(...feetValues);
    const feetRange = maxFeet - minFeet || 1;

    const xFor = (t: number) => ((t - minT) / (maxT - minT || 1)) * WIDTH;
    const yFor = (feet: number) =>
      HEIGHT - PAD_Y - ((feet - minFeet) / feetRange) * (HEIGHT - PAD_Y * 2);

    const coords = data.points.map((p) => [xFor(p.time.getTime()), yFor(p.feet)] as const);

    const linePath = coords
      .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
      .join(" ");
    const areaPath = `${linePath} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`;

    const now = Date.now();
    const clampedNow = Math.min(Math.max(now, minT), maxT);
    const nowX = xFor(clampedNow);

    // Interpolate current tide height between the two nearest points.
    let currentFeet = data.points[0].feet;
    let trendUp = true;
    for (let i = 0; i < data.points.length - 1; i++) {
      const a = data.points[i];
      const b = data.points[i + 1];
      if (clampedNow >= a.time.getTime() && clampedNow <= b.time.getTime()) {
        const span = b.time.getTime() - a.time.getTime() || 1;
        const frac = (clampedNow - a.time.getTime()) / span;
        currentFeet = a.feet + (b.feet - a.feet) * frac;
        trendUp = b.feet >= a.feet;
        break;
      }
    }
    const nowY = yFor(currentFeet);

    const nextEvent = data.hiLo.find((h) => h.time.getTime() > now) ?? data.hiLo[0] ?? null;

    return { linePath, areaPath, nowX, nowY, currentFeet, trendUp, nextEvent };
  }, [data]);

  return (
    <section className={`glass w-full overflow-hidden rounded-2xl p-5 shadow-glow-sm sm:p-6 ${fullWidth ? "" : "max-w-md"}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary-light">Tide telemetry · NOAA CO-OPS</p>
          <div className="mt-3 flex items-center gap-2 text-sm text-white">
            <MapPin className="h-4 w-4 text-primary-light" />
            <span>{data?.stationName ?? station.name}</span>
          </div>
          <label htmlFor="tide-station" className="sr-only">Select tide station</label>
          <select
            id="tide-station"
            value={station.id}
            onChange={(event) => {
              const nextStation = tideStations.find((item) => item.id === event.target.value);
              if (nextStation) setStation(nextStation);
            }}
            className="mt-3 max-w-full rounded-md border border-white/15 bg-[#102124] px-3 py-2 text-sm text-white outline-none focus:border-primary-light"
          >
            {tideStations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </div>
        <div className="min-w-24 text-right">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Predicted now</p>
          {chart ? <>
            <p className="mt-1 text-3xl font-semibold tabular-nums text-white">{chart.currentFeet.toFixed(1)}<span className="ml-1 text-sm font-normal text-muted">ft</span></p>
            <p className={`mt-1 flex items-center justify-end gap-1 text-xs ${chart.trendUp ? "text-accent-light" : "text-primary-light"}`}>
              {chart.trendUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {chart.trendUp ? "Rising" : "Falling"}
            </p>
          </> : <p className="mt-2 text-sm text-muted">{loading ? "Loading" : "Unavailable"}</p>}
        </div>
      </div>

      <div className={`relative mt-5 w-full ${fullWidth ? "h-[240px]" : "h-[150px]"}`}>
        {loading ? <div className="flex h-full items-center justify-center gap-2 text-sm text-muted"><Loader2 className="h-4 w-4 animate-spin" />Reading station data</div>
          : error ? <div className="flex h-full items-center justify-center text-sm text-accent-light">NOAA predictions are temporarily unavailable for this station.</div>
            : chart ? <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="h-full w-full" role="img" aria-label={`Tide prediction chart for ${data?.stationName}`}>
              <defs><linearGradient id="tide-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5fa8a0" stopOpacity="0.45" /><stop offset="100%" stopColor="#5fa8a0" stopOpacity="0.02" /></linearGradient></defs>
              <path d={chart.areaPath} fill="url(#tide-fill)" />
              <motion.path d={chart.linePath} fill="none" stroke="#8fc9c1" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: [0.21, 0.47, 0.32, 0.98] }} />
              <motion.circle cx={chart.nowX} cy={chart.nowY} r={10} fill="#8fc9c1" opacity={0.18} animate={{ scale: [1, 1.6, 1], opacity: [0.28, 0, 0.28] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: `${chart.nowX}px ${chart.nowY}px` }} />
              <circle cx={chart.nowX} cy={chart.nowY} r={4} fill="#e8c39a" />
            </svg> : <div className="flex h-full items-center justify-center text-sm text-muted">No tide predictions for this station.</div>}
      </div>
      {data && data.points.length > 1 && <div className="mt-1 flex justify-between text-[10px] tabular-nums text-muted">
        <span>{data.points[0].time.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", timeZone: data.timeZone })}</span>
        <span>{data.points[data.points.length - 1].time.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", timeZone: data.timeZone })} local</span>
      </div>}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-sm">
        <span className="inline-flex items-center gap-2 text-muted"><Waves className="h-4 w-4 text-primary-light" /> Next tide</span>
        {chart?.nextEvent && data ? <span className="font-medium text-white">{chart.nextEvent.type === "H" ? "High" : "Low"} · {chart.nextEvent.time.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", timeZone: data.timeZone })} local · {chart.nextEvent.feet.toFixed(1)} ft</span> : <span className="text-muted">{loading ? "Calculating…" : "Unavailable"}</span>}
      </div>
    </section>
  );
}
