export type TreysFeed = {
  id: string;
  country: string;
  place: string;
  kind: "live" | "directory";
  embedAllowed: boolean;
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
    embedAllowed: false,
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
    embedAllowed: true,
    operator: "Africam",
    youtubeId: "qpukdDslCjk",
    url: "https://www.youtube.com/watch?v=qpukdDslCjk",
    note: "A 24/7 wildlife network with rotating cameras across African reserves.",
  },
  {
    id: "china-shanghai-live",
    country: "China",
    place: "Shanghai · Huangpu River skyline",
    kind: "live",
    embedAllowed: true,
    operator: "Brainrolling Workshop",
    youtubeId: "Z-g8M1QGKbg",
    url: "https://www.youtube.com/watch?v=Z-g8M1QGKbg",
    note: "A 24/7 view of Shanghai's riverfront and skyline.",
  },
  {
    id: "south-korea-seoul-live",
    country: "South Korea",
    place: "Seoul · Han River",
    kind: "live",
    embedAllowed: true,
    operator: "RIVERWORKER",
    youtubeId: "vk5BHoDxXf0",
    url: "https://www.youtube.com/watch?v=vk5BHoDxXf0",
    note: "A continuous city view over the Han River and the Seoul skyline.",
  },
  {
    id: "japan-tokyo-live",
    country: "Japan",
    place: "Tokyo · Shinjuku crossing",
    kind: "live",
    embedAllowed: true,
    operator: "Tokyo Shinjuku Live Channel",
    youtubeId: "6dp-bvQ7RWo",
    url: "https://www.youtube.com/watch?v=6dp-bvQ7RWo",
    note: "A live street camera at the Shinjuku intersection.",
  },
  {
    id: "australia-sydney-live",
    country: "Australia",
    place: "Sydney Harbour",
    kind: "live",
    embedAllowed: true,
    operator: "WebcamSydney",
    youtubeId: "5uZa3-RMFos",
    url: "https://www.youtube.com/watch?v=5uZa3-RMFos",
    note: "A 24/7 view across Sydney Harbour.",
  },
  {
    id: "united-states-new-york-live",
    country: "United States",
    place: "New York City · Times Square",
    kind: "live",
    embedAllowed: true,
    operator: "FOX 5 New York",
    youtubeId: "VGnFLdQW39A",
    url: "https://www.youtube.com/watch?v=VGnFLdQW39A",
    note: "A 24/7 street-level look at Times Square and Midtown Manhattan.",
  },
  {
    id: "ireland-dublin-live",
    country: "Ireland",
    place: "Dublin city",
    kind: "live",
    embedAllowed: true,
    operator: "EarthCam",
    youtubeId: "3nyPER2kzqk",
    url: "https://www.youtube.com/watch?v=3nyPER2kzqk",
    note: "An EarthCam view from the heart of Dublin.",
  },
  {
    id: "united-states-st-augustine-gators",
    country: "United States",
    place: "St. Augustine · Alligator Farm",
    kind: "live",
    embedAllowed: true,
    operator: "See St. Augustine",
    youtubeId: "LHtzZf4T7xw",
    url: "https://www.youtube.com/watch?v=LHtzZf4T7xw",
    note: "The Alligator Farm's 24/7 live camera.",
  },
  {
    id: "india",
    country: "India",
    place: "Mumbai · Delhi · regional cameras",
    kind: "directory",
    embedAllowed: false,
    operator: "EarthLive24",
    url: "https://earthlive24.com/country/india",
    note: "Browse live India cameras by city and region.",
  },
  {
    id: "brazil",
    country: "Brazil",
    place: "Cities and coastline",
    kind: "directory",
    embedAllowed: false,
    operator: "EarthLive24",
    url: "https://earthlive24.com/country/brazil",
    note: "Live city and coastline cameras across Brazil.",
  },
];

export function treysEmbedUrl(feed: TreysFeed) {
  if (!feed.youtubeId || !feed.embedAllowed) return null;
  return `https://www.youtube-nocookie.com/embed/${feed.youtubeId}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`;
}
