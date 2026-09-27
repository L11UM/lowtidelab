"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { clsx } from "clsx";
import { Loader2 } from "lucide-react";
import type { CoastalStorm } from "@/lib/coastal";
import { mapLayers, type LayerKey } from "@/lib/map-layers";
import { pierCams } from "@/lib/piers";
import { tideStations } from "@/lib/tides";

const CoastMap = dynamic(() => import("@/components/coast-map"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center gap-2 text-sm text-muted"><Loader2 className="h-4 w-4 animate-spin" /> Plotting the coast</div>,
});

export function CoastChart() {
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({ piers: true, tides: true, storms: true });
  const [storms, setStorms] = useState<CoastalStorm[] | null | undefined>(undefined);
  const handleStorms = useCallback((next: CoastalStorm[] | null) => setStorms(next), []);

  const counts: Record<LayerKey, string> = {
    piers: String(pierCams.length),
    tides: String(tideStations.length),
    storms: storms === undefined ? "…" : storms === null ? "—" : String(storms.length),
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2" role="group" aria-label="Map layers">
        {mapLayers.map((layer) => (
          <button
            key={layer.key}
            type="button"
            aria-pressed={layers[layer.key]}
            onClick={() => setLayers((current) => ({ ...current, [layer.key]: !current[layer.key] }))}
            className={clsx("inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs transition-colors", layers[layer.key] ? "border-white/20 bg-white/[0.06] text-white" : "border-white/10 text-muted hover:text-white")}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: layers[layer.key] ? layer.color : "transparent", boxShadow: `inset 0 0 0 1.5px ${layer.color}` }} />
            {layer.label}
            <span className="font-mono text-[10px] text-muted">{counts[layer.key]}</span>
          </button>
        ))}
      </div>

      <div className="relative h-[68vh] min-h-[420px] overflow-hidden rounded-lg border border-primary/25 shadow-glow">
        <CoastMap layers={layers} onStorms={handleStorms} />
      </div>

      <p role="status" className="mt-3 text-xs text-muted">
        {storms === null
          ? "Storm positions are temporarily unavailable."
          : storms && storms.length > 0
            ? `Plotting ${storms.length} active tropical system${storms.length === 1 ? "" : "s"} from the latest NHC snapshot. Marker size follows wind speed.`
            : storms
              ? "No active tropical systems in the latest NHC snapshot."
              : "Loading storm positions…"}
      </p>
    </div>
  );
}
