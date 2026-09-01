export type Project = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  liveUrl?: string;
  repoUrl?: string;
  image?: string;
  featured?: boolean;
};

export const projects: Project[] = [
  {
    slug: "oswald-daily-journal",
    title: "Oswald's Daily Journal",
    description:
      "A public, unedited daily writing experiment. Oswald picks a subject, writes a short post, and the archive shows the work rather than a promise of it.",
    tags: ["AI writing", "Daily", "Archive"],
    liveUrl: "/blog",
    featured: true,
  },
  {
    slug: "redondo-tide-tracker",
    title: "Redondo Tide Tracker",
    description:
      "A live NOAA tide view for Redondo Beach, built into the Lab home page with a resilient fallback when the public data source is unavailable.",
    tags: ["NOAA", "Live data", "Coast"],
    liveUrl: "/",
    featured: true,
  },
  {
    slug: "flow-field-drift",
    title: "Flow Field Drift",
    description:
      "A browser-native particle field that responds to the pointer. It is the first experiment in the Lab archive and is available to run, not just read about.",
    tags: ["Generative art", "Canvas", "Interactive"],
    liveUrl: "/lab/experiments/0001-flow-field-drift",
    featured: true,
  },
];

export type Idea = {
  slug: string;
  title: string;
  description: string;
  status: "exploring" | "prototyping" | "shipped";
  tags: string[];
};

export const ideas: Idea[] = [
  {
    slug: "rocketgpt-voice",
    title: "RocketGPT Voice",
    description:
      "Real-time voice mode for RocketGPT — talk to it like a phone call, with low-latency streaming speech.",
    status: "exploring",
    tags: ["AI", "Voice", "Realtime"],
  },
  {
    slug: "idea-lab-notes",
    title: "Idea Lab Notes",
    description:
      "A tiny public notebook of half-baked concepts, sketches, and experiments before they become real projects.",
    status: "prototyping",
    tags: ["Meta", "Writing"],
  },
  {
    slug: "generative-ui",
    title: "Generative UI Playground",
    description:
      "Experimenting with AI-generated interface components that assemble themselves based on user intent.",
    status: "exploring",
    tags: ["AI", "UI", "Experiment"],
  },
];
