export type PierCam = {
  id: string;
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
    pier: "Oceanside Pier",
    place: "Oceanside, California",
    coast: "Pacific",
    operator: "San Diego Web Cam",
    timeZone: "America/Los_Angeles",
    youtubeId: "cvP_F-c2Upw",
    note: "A rooftop view west over the historic wooden pier and North County surf.",
    lat: 33.1934,
    lon: -117.3867,
  },
  {
    id: "deerfield",
    pier: "Deerfield Beach International Fishing Pier",
    place: "Deerfield Beach, Florida",
    coast: "Atlantic",
    operator: "Deerfield Beach Live",
    timeZone: "America/New_York",
    youtubeId: "H33wtprQqSM",
    note: "From the T at the end of the pier, nearly 1,000 feet into the Atlantic.",
    lat: 26.3175,
    lon: -80.0744,
  },
  {
    id: "st-augustine",
    pier: "St. Augustine Beach Pier",
    place: "St. Augustine, Florida",
    coast: "Atlantic",
    operator: "The Surf Station",
    timeZone: "America/New_York",
    youtubeId: "Q6eZVkUKFxo",
    note: "The Surf Station's north pier cam on Florida's First Coast.",
    lat: 29.8566,
    lon: -81.2645,
  },
];

export function pierEmbedUrl(cam: PierCam) {
  const params = new URLSearchParams({ autoplay: "1", mute: "1", playsinline: "1", rel: "0", modestbranding: "1" });
  return `https://www.youtube-nocookie.com/embed/${cam.youtubeId}?${params}`;
}

export function pierWatchUrl(cam: PierCam) {
  return `https://www.youtube.com/watch?v=${cam.youtubeId}`;
}
