"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bookmark, LocateFixed, MapPin, Video, X } from "lucide-react";
import { clsx } from "clsx";
import { TideTracker } from "@/components/tide-tracker";
import { buildBreakCall, type BreakCall } from "@/lib/break-call";
import { closestCoastalSpot, coastalSpots, defaultCoastalSpot, getSpotCamera, getSpotTideStation } from "@/lib/coastal-spots";
import { fetchMarineConditions, type MarineConditions } from "@/lib/marine";
import type { TideData } from "@/lib/tides";

const HOME_KEY = "lowtidelab.homeSpot.v1";
const PINS_KEY = "lowtidelab.pinnedSpots.v1";
const DEFAULT_PINS = ["redondo", "huntington"];

function knownSpotIds(value: unknown) {
  return Array.isArray(value)
    ? [...new Set(value.filter((id): id is string => typeof id === "string" && coastalSpots.some((spot) => spot.id === id)))].slice(0, 3)
    : [];
}

function verdictStyle(verdict: BreakCall["verdict"]) {
  if (verdict === "GO") return "border-accent/35 bg-accent/10 text-accent-light";
  if (verdict === "STAY HOME") return "border-red-300/30 bg-red-300/10 text-red-200";
  if (verdict === "WAIT") return "border-primary/35 bg-primary/10 text-primary-light";
  return "border-white/15 bg-white/[0.04] text-muted";
}

export function HomeSpot() {
  const [homeSpotId, setHomeSpotId] = useState(defaultCoastalSpot.id);
  const [pinnedIds, setPinnedIds] = useState<string[]>(DEFAULT_PINS);
  const [hydrated, setHydrated] = useState(false);
  const [tideData, setTideData] = useState<TideData | null>(null);
  const [marine, setMarine] = useState<MarineConditions | null>(null);
  const [marineUnavailable, setMarineUnavailable] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [locationStatus, setLocationStatus] = useState("");
  const [pinStatus, setPinStatus] = useState("");

  useEffect(() => {
    try {
      const savedHome = localStorage.getItem(HOME_KEY);
      if (savedHome && coastalSpots.some((spot) => spot.id === savedHome)) setHomeSpotId(savedHome);
      const savedPins = localStorage.getItem(PINS_KEY);
      if (savedPins !== null) setPinnedIds(knownSpotIds(JSON.parse(savedPins)));
    } catch {
      setPinStatus("Saved spots are unavailable in this browser.");
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(HOME_KEY, homeSpotId);
      localStorage.setItem(PINS_KEY, JSON.stringify(pinnedIds));
    } catch {
      setPinStatus("Could not save spots in this browser.");
    }
  }, [hydrated, homeSpotId, pinnedIds]);

  const spot = coastalSpots.find((item) => item.id === homeSpotId) ?? defaultCoastalSpot;
  const tideStation = getSpotTideStation(spot);
  const nearbyCamera = getSpotCamera(spot);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let active = true;
    setTideData(null);
    setMarine(null);
    setMarineUnavailable(false);
    fetchMarineConditions(spot)
      .then((result) => { if (active) setMarine(result); })
      .catch(() => { if (active) setMarineUnavailable(true); });
    const interval = window.setInterval(() => {
      fetchMarineConditions(spot)
        .then((result) => { if (active) setMarine(result); })
        .catch(() => { if (active) setMarineUnavailable(true); });
    }, 15 * 60 * 1000);
    return () => { active = false; window.clearInterval(interval); };
  }, [spot]);

  const receiveTideData = useCallback((data: TideData | null) => setTideData(data), []);
  const breakCall = useMemo(() => buildBreakCall(tideData, marine, spot, now), [tideData, marine, spot, now]);

  const locate = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Location is unavailable in this browser.");
      return;
    }
    setLocationStatus("Finding your nearest tracked break…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const nearest = closestCoastalSpot(coords.latitude, coords.longitude);
        setHomeSpotId(nearest.spot.id);
        setLocationStatus(nearest.distance > 100
          ? `Nearest tracked break: ${nearest.spot.name} · ${Math.round(nearest.distance)} km away`
          : `Nearest tracked break: ${nearest.spot.name}`);
      },
      () => setLocationStatus("Location permission was unavailable. Choose a break above."),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 15 * 60 * 1000 },
    );
  };

  const togglePin = () => {
    if (pinnedIds.includes(spot.id)) {
      setPinnedIds((current) => current.filter((id) => id !== spot.id));
      setPinStatus(`${spot.name} unpinned.`);
    } else if (pinnedIds.length >= 3) {
      setPinStatus("You can pin up to three breaks.");
    } else {
      setPinnedIds((current) => [...current, spot.id]);
      setPinStatus(`${spot.name} pinned for quick access.`);
    }
  };

  return (
    <section aria-label="Saved home break" className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary-light">Your home break</p>
          <label htmlFor="home-spot" className="sr-only">Choose your home break</label>
          <select
            id="home-spot"
            value={spot.id}
            onChange={(event) => setHomeSpotId(event.target.value)}
            className="mt-2 w-full rounded-md border border-white/15 bg-[#102124] px-3 py-2.5 text-sm text-white outline-none focus:border-primary-light sm:max-w-xs"
          >
            {coastalSpots.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={locate} className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs font-medium text-white/80 transition-colors hover:border-primary/50 hover:text-white">
            <LocateFixed className="h-3.5 w-3.5 text-primary-light" /> Use my location
          </button>
          <button type="button" onClick={togglePin} aria-pressed={pinnedIds.includes(spot.id)} className={clsx("inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition-colors", pinnedIds.includes(spot.id) ? "border-accent/35 bg-accent/10 text-accent-light" : "border-white/10 text-white/80 hover:border-accent/40 hover:text-white")}>
            <Bookmark className="h-3.5 w-3.5" />{pinnedIds.includes(spot.id) ? "Pinned" : "Pin this break"}
          </button>
        </div>
      </div>

      {pinnedIds.length > 0 && <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Pinned breaks">
        <span className="mr-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted">Pinned · {pinnedIds.length}/3</span>
        {pinnedIds.map((id) => {
          const pinned = coastalSpots.find((item) => item.id === id);
          if (!pinned) return null;
          return <div key={id} className="inline-flex max-w-full items-center rounded-md border border-white/10 bg-white/[0.03]">
            <button type="button" onClick={() => setHomeSpotId(id)} aria-current={id === spot.id} className={clsx("truncate px-2.5 py-1.5 text-xs transition-colors", id === spot.id ? "text-white" : "text-muted hover:text-white")}>
              <MapPin className="mr-1 inline h-3 w-3 text-primary-light" />{pinned.area}
            </button>
            <button type="button" onClick={() => setPinnedIds((current) => current.filter((item) => item !== id))} aria-label={`Unpin ${pinned.area}`} title={`Unpin ${pinned.area}`} className="border-l border-white/10 px-1.5 py-1.5 text-muted hover:text-white">
              <X className="h-3 w-3" />
            </button>
          </div>;
        })}
      </div>}

      {(locationStatus || pinStatus) && <p role="status" className="text-xs text-muted">{locationStatus || pinStatus}</p>}

      <div className="flex flex-wrap items-center gap-3 border-y border-white/10 py-3">
        <span className={clsx("rounded-md border px-2.5 py-1 text-[11px] font-semibold tracking-[0.12em]", verdictStyle(breakCall.verdict))}>{breakCall.verdict}</span>
        <p className="min-w-0 flex-1 text-sm font-medium leading-relaxed text-white">{breakCall.line || (marineUnavailable ? "Marine conditions unavailable" : "Reading tide and marine conditions…")}</p>
      </div>
      <p className="text-[10px] leading-relaxed text-muted">{breakCall.note} · Tide: NOAA CO-OPS · Marine forecast: Open-Meteo. A quick planning signal, not a safety advisory.</p>

      {nearbyCamera && <Link href={`/piers?cam=${nearbyCamera.id}`} className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-light transition-colors hover:text-white">
        <Video className="h-3.5 w-3.5" /> Nearby cam: {nearbyCamera.pier}
      </Link>}

      <TideTracker key={spot.id} stationId={tideStation.id} displayLocation={spot.name} showStationSelect={false} showChart={false} onData={receiveTideData} />
    </section>
  );
}
