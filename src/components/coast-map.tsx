"use client";

import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import type { CoastalSnapshot, CoastalStorm } from "@/lib/coastal";
import { mapColors as colors, type LayerKey } from "@/lib/map-layers";
import { pierCams } from "@/lib/piers";
import { tideStations } from "@/lib/tides";

function stormRadius(storm: CoastalStorm) {
  const wind = storm.windMph ?? 40;
  return Math.min(22, 8 + wind / 10);
}

export default function CoastMap({ layers, onStorms }: { layers: Record<LayerKey, boolean>; onStorms: (storms: CoastalStorm[] | null) => void }) {
  const [storms, setStorms] = useState<CoastalStorm[]>([]);

  useEffect(() => {
    fetch("/coastal-snapshot.json", { cache: "no-store" })
      .then((response) => (response.ok ? (response.json() as Promise<CoastalSnapshot>) : null))
      .then((snapshot) => {
        const plotted = (snapshot?.storms ?? []).filter((storm) => storm.lat !== null && storm.lon !== null);
        setStorms(plotted);
        onStorms(snapshot ? plotted : null);
      })
      .catch(() => onStorms(null));
  }, [onStorms]);

  const bounds = useMemo<LatLngBoundsExpression>(() => {
    const points = [...pierCams.map((cam) => [cam.lat, cam.lon]), ...tideStations.map((station) => [station.lat, station.lon])] as [number, number][];
    return points;
  }, []);

  return (
    <MapContainer bounds={bounds} boundsOptions={{ padding: [40, 40] }} worldCopyJump scrollWheelZoom className="h-full w-full bg-[#0b1416]">
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains="abcd"
        maxZoom={19}
      />

      {layers.storms && storms.map((storm) => (
        <CircleMarker key={storm.id} center={[storm.lat!, storm.lon!]} radius={stormRadius(storm)} pathOptions={{ color: colors.storms, fillColor: colors.storms, fillOpacity: 0.25, weight: 1.5, className: "storm-pulse" }}>
          <Tooltip direction="top" offset={[0, -8]}>{storm.name}</Tooltip>
          <Popup>
            <p className="map-popup-kicker">Active storm · {storm.basin}</p>
            <p className="map-popup-title">{storm.name}</p>
            <p className="map-popup-body">{storm.classification}{storm.windMph ? ` · ${storm.windMph} mph` : ""}{storm.pressureMb ? ` · ${storm.pressureMb} mb` : ""}</p>
            {storm.movement && <p className="map-popup-body">Moving {storm.movement}</p>}
            <Link href="/coast" className="map-popup-link">Coastal watch →</Link>
          </Popup>
        </CircleMarker>
      ))}

      {layers.tides && tideStations.map((station) => (
        <CircleMarker key={station.id} center={[station.lat, station.lon]} radius={6} pathOptions={{ color: colors.tides, fillColor: colors.tides, fillOpacity: 0.85, weight: 2 }}>
          <Tooltip direction="top" offset={[0, -6]}>{station.name}</Tooltip>
          <Popup>
            <p className="map-popup-kicker">Tide station · NOAA {station.id}</p>
            <p className="map-popup-title">{station.name}</p>
            <Link href={`/tides?station=${station.id}`} className="map-popup-link">Open tide table →</Link>
          </Popup>
        </CircleMarker>
      ))}

      {layers.piers && pierCams.map((cam) => (
        <CircleMarker key={cam.id} center={[cam.lat, cam.lon]} radius={7} pathOptions={{ color: colors.piers, fillColor: "#0b1416", fillOpacity: 1, weight: 3 }}>
          <Tooltip direction="top" offset={[0, -6]}>{cam.pier}</Tooltip>
          <Popup>
            <p className="map-popup-kicker">Live pier cam · {cam.operator}</p>
            <p className="map-popup-title">{cam.pier}</p>
            <p className="map-popup-body">{cam.note}</p>
            <Link href={`/piers?cam=${cam.id}`} className="map-popup-link">Watch live →</Link>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
