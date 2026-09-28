import type { CoastalSpot } from "@/lib/coastal-spots";
import type { MarineConditions } from "@/lib/marine";
import type { TideData } from "@/lib/tides";

const compass = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];

function nextLow(tides: TideData, now: number) {
  return tides.hiLo.find((event) => event.type === "L" && event.time.getTime() > now) ?? null;
}

function durationLabel(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return hours ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
}

function offshoreLabel(direction: number, center: number) {
  const distance = Math.abs(((direction - center + 540) % 360) - 180);
  if (distance <= 50) return "offshore";
  if (distance >= 130) return "onshore";
  return "cross-shore";
}

function directionLabel(direction: number) {
  return compass[Math.round(direction / 22.5) % compass.length];
}

export type BreakCall = {
  line: string;
  verdict: "GO" | "WAIT" | "STAY HOME" | "NO READ";
  note: string;
  nextLow: { minutes: number; feet: number } | null;
};

export function buildBreakCall(tides: TideData | null, marine: MarineConditions | null, spot: CoastalSpot, now = Date.now()): BreakCall {
  const low = tides ? nextLow(tides, now) : null;
  const minutes = low ? Math.max(0, Math.round((low.time.getTime() - now) / 60000)) : null;
  const wind = marine?.windKnots;
  const windDirection = marine?.windDirection;
  const waveHeight = marine?.waveHeightMeters;
  const period = marine?.wavePeriodSeconds;
  const water = marine?.waterTemperatureC;

  const parts = [
    minutes !== null && low ? `Low in ${durationLabel(minutes)} · ${low.feet.toFixed(1)} ft` : "Next low unavailable",
    wind != null && windDirection != null
      ? `${directionLabel(windDirection)} ${Math.round(wind)} kn ${offshoreLabel(windDirection, spot.offshoreFromDegrees)}`
      : null,
    waveHeight != null && period != null
      ? `${(waveHeight * 3.28084).toFixed(1)} ft @ ${Math.round(period)}s`
      : null,
    water != null ? `${Math.round(water * 9 / 5 + 32)}°F` : null,
  ].filter(Boolean);

  if (!low || wind == null || windDirection == null || waveHeight == null || period == null) {
    const note = !low ? "Tide prediction unavailable" : "Marine data is incomplete";
    return { line: parts.join(" · "), verdict: "NO READ", note, nextLow: low && minutes !== null ? { minutes, feet: low.feet } : null };
  }

  const offshore = offshoreLabel(windDirection, spot.offshoreFromDegrees) === "offshore";
  let verdict: BreakCall["verdict"] = "WAIT";
  let note = "Conditions are mixed";
  if (wind >= 20 || waveHeight >= 2.5) {
    verdict = "STAY HOME";
    note = "Wind or surf is elevated";
  } else if (wind <= 10 && offshore && waveHeight <= 1.8 && period >= 7) {
    verdict = "GO";
    note = "Light offshore wind and manageable swell";
  } else if (wind <= 12 && waveHeight <= 1.2) {
    verdict = "GO";
    note = "Light wind and mellow water";
  }

  return { line: parts.join(" · "), verdict, note, nextLow: low && minutes !== null ? { minutes, feet: low.feet } : null };
}
