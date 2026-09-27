export type LayerKey = "piers" | "tides" | "storms";

export const mapLayers: { key: LayerKey; label: string; color: string }[] = [
  { key: "piers", label: "Pier cams", color: "#e8c39a" },
  { key: "tides", label: "Tide stations", color: "#8fc9c1" },
  { key: "storms", label: "Active storms", color: "#f07167" },
];

export const mapColors = Object.fromEntries(mapLayers.map((layer) => [layer.key, layer.color])) as Record<LayerKey, string>;
