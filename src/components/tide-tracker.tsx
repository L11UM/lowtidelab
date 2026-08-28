"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Loader2, Waves } from "lucide-react";
import { fetchTideData, type TideData } from "@/lib/tides";

const WIDTH = 400;
const HEIGHT = 150;
const PAD_Y = 16;

// Deterministic sine-wave fallback so the widget never shows a blank/broken state.
function buildFallbackData(): TideData {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const points = Array.from({ length: 96 }, (_, i) => {
    const time = new Date(start.getTime() + i * 15 * 60 * 1000);
    const hours = i / 4;
    const feet = 3 + 2.2 * Math.sin((hours / 12.4) * Math.PI * 2);
    return { time, feet };
  });

  const hiLo: TideData["hiLo"] = [];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1].feet;
    const cur = points[i].feet;
    const next = points[i + 1].feet;
    if (cur > prev && cur > next) hiLo.push({ ...points[i], type: "H" });
    if (cur < prev && cur < next) hiLo.push({ ...points[i], type: "L" });
  }

  return { points, hiLo, stationName: "Simulated data" };
}

export function TideTracker() {
  const [data, setData] = useState<TideData | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchTideData()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setIsLive(true);
      })
      .catch(() => {
        if (cancelled) return;
        setData(buildFallbackData());
        setIsLive(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
    <div className="glass w-full max-w-md overflow-hidden rounded-2xl p-6 shadow-glow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary-light">
            <Waves className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">Redondo Beach, CA</p>
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <span
                className={`h-1.5 w-1.5 rounded-full ${isLive ? "bg-accent" : "bg-muted"}`}
              />
              {isLive ? "Live tide" : "Simulated tide"}
            </p>
          </div>
        </div>
        {chart && (
          <div className="text-right">
            <p className="text-lg font-semibold text-white">{chart.currentFeet.toFixed(1)} ft</p>
            <p
              className={`flex items-center justify-end gap-1 text-xs ${
                chart.trendUp ? "text-accent-light" : "text-primary-light"
              }`}
            >
              {chart.trendUp ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )}
              {chart.trendUp ? "Rising" : "Falling"}
            </p>
          </div>
        )}
      </div>

      <div className="relative mt-4 h-[150px] w-full">
        {loading && !chart ? (
          <div className="flex h-full items-center justify-center text-muted">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : chart ? (
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <defs>
              <linearGradient id="tide-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5fa8a0" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#5fa8a0" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            <motion.path
              d={chart.areaPath}
              fill="url(#tide-fill)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            />
            <motion.path
              d={chart.linePath}
              fill="none"
              stroke="#8fc9c1"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.8, ease: [0.21, 0.47, 0.32, 0.98] }}
            />

            <motion.circle
              cx={chart.nowX}
              cy={chart.nowY}
              r={10}
              fill="#8fc9c1"
              opacity={0.18}
              animate={{ scale: [1, 1.6, 1], opacity: [0.28, 0, 0.28] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: `${chart.nowX}px ${chart.nowY}px` }}
            />
            <circle cx={chart.nowX} cy={chart.nowY} r={4} fill="#e8c39a" />
          </svg>
        ) : null}
      </div>

      {chart?.nextEvent && (
        <p className="mt-2 text-xs text-muted">
          Next {chart.nextEvent.type === "H" ? "high" : "low"} tide at{" "}
          <span className="text-white/80">
            {chart.nextEvent.time.toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>{" "}
          ({chart.nextEvent.feet.toFixed(1)} ft)
        </p>
      )}
    </div>
  );
}
