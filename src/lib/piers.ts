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
    id: "santa-monica",
    spotId: "santa-monica",
    pier: "Santa Monica Pier",
    place: "Santa Monica, California",
    coast: "Pacific",
    operator: "explore.org",
    timeZone: "America/Los_Angeles",
    youtubeId: "v97JpT3ZA0w",
    note: "Beach, pier, and the long Santa Monica Bay horizon.",
    lat: 34.0092,
    lon: -118.4977,
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
  {
    id: "oceanside",
    spotId: "oceanside",
    pier: "Oceanside Pier",
    place: "Oceanside, California",
    coast: "Pacific",
    operator: "San Diego Web Cam",
    timeZone: "America/Los_Angeles",
    youtubeId: "OYqo4dqYjh0",
    note: "A fixed west-facing view over the historic pier and North County surf.",
    lat: 33.1934,
    lon: -117.3867,
  },
];

export function pierEmbedUrl(cam: PierCam) {
  const params = new URLSearchParams({ autoplay: "1", mute: "1", playsinline: "1", rel: "0", modestbranding: "1" });
  return `https://www.youtube-nocookie.com/embed/${cam.youtubeId}?${params}`;
}

export function pierWatchUrl(cam: PierCam) {
  return `https://www.youtube.com/watch?v=${cam.youtubeId}`;
}
