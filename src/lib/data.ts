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
    slug: "rocketgpt",
    title: "RocketGPT",
    description:
      "A fast, focused AI chatbot built for quick answers and creative brainstorming. Streamed responses, custom persona, and a minimal UI designed to get out of your way.",
    tags: ["AI", "Chatbot", "Next.js", "LLM"],
    liveUrl: "#",
    featured: true,
  },
  {
    slug: "low-tide-corp",
    title: "Low Tide Corp",
    description:
      "An experiment: a crew of AI agents — Orchestrator, Researcher, Product, Builder, Growth, Operator, and a Critic that can't be skipped — works one pinned business idea every day, unedited, and publishes a dated workday plus a living company brief that compounds over time.",
    tags: ["AI", "Multi-agent", "Next.js", "Experiment"],
    liveUrl: "#",
    featured: true,
  },
  {
    slug: "example-project",
    title: "Example Project",
    description:
      "A placeholder project to show how new work gets added to the Lab. Swap this out for your next creation — the card layout scales automatically.",
    tags: ["Web", "Design"],
    liveUrl: "#",
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
