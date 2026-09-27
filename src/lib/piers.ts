export type PierCam = {
  id: string;
  spotId: string;
  pier: string;
  place: string;
  coast: "Pacific" | "Atlantic";
  operator: string;
  timeZone: string;
  youtubeId: string;
  note: string;
  lat: number;
  lon: number;
};

// Live YouTube IDs are replaced when an operator restarts a stream; update them here.
export const pierCams: PierCam[] = [
  {
    id: "redondo",
    spotId: "redondo",
    pier: "Redondo Beach Pier",
    place: "Redondo Beach, California",
    coast: "Pacific",
    operator: "City of Redondo Beach",
    timeZone: "America/Los_Angeles",
    youtubeId: "TuVOKRP7IBA",
    note: "The city's own camera over the horseshoe pier and King Harbor shoreline.",
    lat: 33.8397,
    lon: -118.3927,
  },
  {
    id: "huntington",
    spotId: "huntington",
    pier: "Huntington Beach Pier",
    place: "Huntington Beach, California",
    coast: "Pacific",
    operator: "City of Huntington Beach",
    timeZone: "America/Los_Angeles",
    youtubeId: "mhQjsLBfOoY",
    note: "Surf City's pier, one of the longest public piers on the West Coast.",
    lat: 33.6553,
    lon: -118.0048,
  },
];

export function pierEmbedUrl(cam: PierCam) {
  const params = new URLSearchParams({ autoplay: "1", mute: "1", playsinline: "1", rel: "0", modestbranding: "1" });
  return `https://www.youtube-nocookie.com/embed/${cam.youtubeId}?${params}`;
}

export function pierWatchUrl(cam: PierCam) {
  return `https://www.youtube.com/watch?v=${cam.youtubeId}`;
}
