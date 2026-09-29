export type TreysFeed = {
  id: string;
  country: string;
  place: string;
  kind: "live" | "directory";
  operator: string;
  youtubeId?: string;
  url: string;
  note: string;
};

export const treysFeeds: TreysFeed[] = [
  {
    id: "russia-st-petersburg",
    country: "Russia",
    place: "St. Petersburg · Zagorodny Avenue",
    kind: "live",
    operator: "Mobotix Webcams Russia",
    youtubeId: "h1wly909BYw",
    url: "https://www.youtube.com/watch?v=h1wly909BYw",
    note: "A live street-level view near Five Corners and the Razyezzhaya transit stop.",
  },
  {
    id: "south-africa-wildlife",
    country: "South Africa",
    place: "Wild Africa · safari network",
    kind: "live",
    operator: "Africam",
    youtubeId: "qpukdDslCjk",
    url: "https://www.youtube.com/watch?v=qpukdDslCjk",
    note: "A 24/7 wildlife network with rotating cameras across African reserves.",
  },
  {
    id: "china-shanghai",
    country: "China",
    place: "Shanghai skyline",
    kind: "directory",
    operator: "SkylineWebcams",
    url: "https://www.skylinewebcams.com/en/webcam/china/shanghai/shanghai/skyline-of-shanghai.html",
    note: "A live-camera directory for Shanghai's skyline and city views.",
  },
  {
    id: "india",
    country: "India",
    place: "Mumbai · Delhi · regional cameras",
    kind: "directory",
    operator: "EarthLive24",
    url: "https://earthlive24.com/country/india",
    note: "Browse live India cameras by city and region.",
  },
  {
    id: "japan",
    country: "Japan",
    place: "Tokyo and coastal Japan",
    kind: "directory",
    operator: "SkylineWebcams",
    url: "https://www.skylinewebcams.com/en/webcam/japan.html",
    note: "A country-wide directory of city, harbor, and coastal views.",
  },
  {
    id: "brazil",
    country: "Brazil",
    place: "Cities and coastline",
    kind: "directory",
    operator: "EarthLive24",
    url: "https://earthlive24.com/country/brazil",
    note: "Live city and coastline cameras across Brazil.",
  },
  {
    id: "australia",
    country: "Australia",
    place: "Cities, beaches, and harbors",
    kind: "directory",
    operator: "EarthLive24",
    url: "https://earthlive24.com/country/australia",
    note: "A rotating directory of live Australian city and coastal cameras.",
  },
];

export function treysEmbedUrl(feed: TreysFeed) {
  if (!feed.youtubeId) return null;
  return `https://www.youtube-nocookie.com/embed/${feed.youtubeId}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`;
}
