"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Compass, MapPin, Video, Waves, X } from "lucide-react";
import { clsx } from "clsx";
import { TideTracker } from "@/components/tide-tracker";
import { fishingSpots } from "@/lib/fishing-spots";

const HOME_KEY = "lowtidelab.fishingSpot.v1";
const PINS_KEY = "lowtidelab.pinnedFishingSpots.v1";
const DEFAULT_PINS = ["upper-lake-mary", "big-lake"];
const DEFAULT_SPOT = fishingSpots[0];

function knownSpotIds(value: unknown) {
  return Array.isArray(value)
    ? [...new Set(value.filter((id): id is string => typeof id === "string" && fishingSpots.some((spot) => spot.id === id)))].slice(0, 3)
    : [];
}

export function HomeSpot() {
  const [homeSpotId, setHomeSpotId] = useState(DEFAULT_SPOT.id);
  const [pinnedIds, setPinnedIds] = useState<string[]>(DEFAULT_PINS);
  const [hydrated, setHydrated] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");
  const [pinStatus, setPinStatus] = useState("");

  useEffect(() => {
    try {
      const savedHome = localStorage.getItem(HOME_KEY);
      if (savedHome && fishingSpots.some((spot) => spot.id === savedHome)) setHomeSpotId(savedHome);
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

  const spot = fishingSpots.find((item) => item.id === homeSpotId) ?? DEFAULT_SPOT;

  const locate = () => {
    setLocationStatus("Nearby lake matching is ready for the next pass. Pick a water above for now.");
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
    <section aria-label="Current water" className="glass min-w-0 space-y-4 rounded-[28px] p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary-light">Current water</p>
          <label htmlFor="home-spot" className="sr-only">Choose your water</label>
          <select
            id="home-spot"
            value={spot.id}
            onChange={(event) => setHomeSpotId(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/15 bg-[#102124] px-3 py-2.5 text-sm text-white outline-none focus:border-primary-light sm:max-w-xs"
          >
            {fishingSpots.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={locate} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs font-medium text-white/80 transition-colors hover:border-primary/50 hover:text-white">
            <Compass className="h-3.5 w-3.5 text-primary-light" /> Nearby match
          </button>
          <button type="button" onClick={togglePin} aria-pressed={pinnedIds.includes(spot.id)} className={clsx("inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors", pinnedIds.includes(spot.id) ? "border-accent/35 bg-accent/10 text-accent-light" : "border-white/10 bg-white/[0.02] text-white/80 hover:border-accent/40 hover:text-white")}>
            <Bookmark className="h-3.5 w-3.5" />{pinnedIds.includes(spot.id) ? "Pinned" : "Pin this water"}
          </button>
        </div>
      </div>

      {pinnedIds.length > 0 && <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Pinned breaks">
        <span className="mr-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted">Pinned · {pinnedIds.length}/3</span>
        {pinnedIds.map((id) => {
          const pinned = fishingSpots.find((item) => item.id === id);
          if (!pinned) return null;
          return <div key={id} className="inline-flex max-w-full items-center rounded-md border border-white/10 bg-white/[0.03]">
            <button type="button" onClick={() => setHomeSpotId(id)} aria-current={id === spot.id} className={clsx("truncate px-2.5 py-1.5 text-xs transition-colors", id === spot.id ? "text-white" : "text-muted hover:text-white")}>
              <MapPin className="mr-1 inline h-3 w-3 text-primary-light" />{pinned.community}
            </button>
            <button type="button" onClick={() => setPinnedIds((current) => current.filter((item) => item !== id))} aria-label={`Unpin ${pinned.community}`} title={`Unpin ${pinned.community}`} className="border-l border-white/10 px-1.5 py-1.5 text-muted hover:text-white">
              <X className="h-3 w-3" />
            </button>
          </div>;
        })}
      </div>}

      {(locationStatus || pinStatus) && <p role="status" className="text-xs text-muted">{locationStatus || pinStatus}</p>}

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-white/10 bg-[#0d171a] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-primary-light">Signal</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{spot.name}</h2>
            </div>
            <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-primary-light">{spot.region}</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted">{spot.approach}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted">Best odds</p>
              <p className="mt-1 text-sm font-medium text-white">{spot.species.slice(0, 2).join(" · ")}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted">Style</p>
              <p className="mt-1 text-sm font-medium text-white">{spot.style}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d171a] p-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-primary-light">Crew note</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">{spot.waterNote}</p>
          <div className="mt-4 flex items-center gap-2 text-xs text-white/80">
            <MapPin className="h-3.5 w-3.5 text-primary-light" /> {spot.community}
          </div>
          {spot.mapUrl && (
            <Link href={spot.mapUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary-light transition-colors hover:text-white">
              Open lake info <Video className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      <div className="border-t border-white/10 pt-4">
        <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-primary-light">
          <Waves className="h-3.5 w-3.5" /> Tide instrument
        </div>
        <TideTracker key={spot.id} displayLocation={spot.name} showStationSelect={false} showChart={false} fullWidth />
      </div>
    </section>
  );
}
