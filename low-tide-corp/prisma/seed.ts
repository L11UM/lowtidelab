import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Idea
  await prisma.idea.updateMany({ where: { status: "active" }, data: { status: "archived" } });
  await prisma.idea.create({
    data: {
      title: "Tide-aware trip planner for surfers and tide-poolers",
      oneLiner:
        "A tiny web app that tells casual beachgoers the single best low-tide window this week near them, in plain English — no chart-reading required.",
      audience: "Casual coastal visitors and beginner surfers/tide-poolers, not hardcore surfers who already read buoy data.",
      budget: "$0 — bootstrap only, no paid ads",
      dontDo: "No native mobile app in v1. No hardware. No enterprise/B2B sales motion.",
      status: "active",
    },
  });

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 2);
  const dayBefore = new Date();
  dayBefore.setDate(dayBefore.getDate() - 3);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  // Workday 1 (older, seed context)
  const wd1 = await prisma.workday.create({
    data: {
      date: fmt(dayBefore),
      status: "done",
      summary: "First workday: scoped the idea, found 3 direct competitors, and defined a razor-thin MVP.",
      criticScore: 6.5,
      agenda: JSON.stringify([
        { agent: "researcher", task: "Map existing tide apps and their weaknesses for casual users", priority: "high" },
        { agent: "product", task: "Define the smallest possible MVP", priority: "high" },
        { agent: "growth", task: "Draft a positioning angle for non-surfers", priority: "medium" },
      ]),
    },
  });
  await prisma.artifact.createMany({
    data: [
      {
        workdayId: wd1.id,
        agent: "orchestrator",
        type: "agenda",
        body: JSON.stringify({ agenda: [], rationale: "Day one: understand the landscape and cut scope aggressively." }),
        markdown: "### Today's agenda\n- **[high] researcher** — Map existing tide apps and their weaknesses for casual users\n- **[high] product** — Define the smallest possible MVP\n- **[medium] growth** — Draft a positioning angle for non-surfers\n\n### Rationale\nDay one: understand the landscape and cut scope aggressively.",
      },
      {
        workdayId: wd1.id,
        agent: "researcher",
        type: "research",
        body: JSON.stringify({ findings: "Most tide apps (e.g. Tides Near Me, MyTideTimes) target experienced surfers with raw charts.", competitors: [{ name: "Tides Near Me", note: "Good data, bad UX for casual users" }], risks: ["NOAA API rate limits"], citations: [], unknowns: ["Real demand size — UNKNOWN, would need a landing page test to unblock"] }),
        markdown: "### Findings\nMost tide apps (e.g. Tides Near Me, MyTideTimes) target experienced surfers with raw charts, not plain-English guidance.\n\n### Competitors\n- **Tides Near Me** — Good data, bad UX for casual users\n\n### Risks\n- NOAA API rate limits\n\n### Unknowns\n- Real demand size — UNKNOWN, would need a landing page test to unblock",
      },
      {
        workdayId: wd1.id,
        agent: "product",
        type: "plan",
        body: JSON.stringify({ problem: "Casual beachgoers don't know when low tide happens or why it matters.", icp: "Someone planning a weekend beach trip", mvpScope: ["Single location input", "This week's best low-tide window in plain English"], userStories: ["As a visitor, I want the one best time to go, not a chart"], notToBuild: ["Accounts", "Notifications v1"], unknowns: [] }),
        markdown: "### Problem\nCasual beachgoers don't know when low tide happens or why it matters.\n\n### ICP (ideal customer profile)\nSomeone planning a weekend beach trip.\n\n### MVP scope\n- Single location input\n- This week's best low-tide window in plain English\n\n### What NOT to build\n- Accounts\n- Notifications v1",
      },
      {
        workdayId: wd1.id,
        agent: "growth",
        type: "copy",
        body: JSON.stringify({ positioning: "The tide app for people who don't read tide charts.", channelExperiment: { channel: "Reddit r/tidepooling", hypothesis: "Casual tide-poolers will click a plain-English tide tool", metric: "click-through rate on a single post" }, draftCopy: [{ platform: "Reddit", text: "Made a tiny tool that just tells you the best low-tide window this week — no chart reading." }], unknowns: [] }),
        markdown: "### Positioning\nThe tide app for people who don't read tide charts.\n\n### Channel experiment\n- Channel: Reddit r/tidepooling\n- Hypothesis: Casual tide-poolers will click a plain-English tide tool\n- Metric: click-through rate on a single post",
      },
      {
        workdayId: wd1.id,
        agent: "critic",
        type: "critique",
        body: JSON.stringify({ scores: { clarity: 7, novelty: 5, feasibility: 8, moat: 3 }, overall: 6.5, weaknesses: ["No evidence of real demand yet", "Moat is weak — NOAA data is public"], requiredNextExperiment: "Ship a 1-page landing test and measure signups before writing more code.", shippableNextAction: "Publish a single-page landing site with an email capture form.", verdict: "Feasible and cheap to test, but needs a demand signal before real investment." }),
        markdown: "### Scores (1-10)\n- Clarity: 7\n- Novelty: 5\n- Feasibility: 8\n- Moat: 3\n- **Overall: 6.5**\n\n### Weaknesses\n- No evidence of real demand yet\n- Moat is weak — NOAA data is public\n\n### Required next experiment\nShip a 1-page landing test and measure signups before writing more code.\n\n### Shippable next action (<2 hours)\nPublish a single-page landing site with an email capture form.\n\n### Verdict\nFeasible and cheap to test, but needs a demand signal before real investment.",
      },
    ],
  });

  // Workday 2 (more recent, builds on workday 1)
  const wd2 = await prisma.workday.create({
    data: {
      date: fmt(yesterday),
      status: "done",
      summary: "Scoped the landing-page test and drafted the build plan for it.",
      criticScore: 7,
      agenda: JSON.stringify([
        { agent: "builder", task: "Spec a single-page landing site with email capture", priority: "high" },
        { agent: "operator", task: "Flag any legal/cost concerns with a public landing page", priority: "medium" },
      ]),
    },
  });
  await prisma.artifact.createMany({
    data: [
      {
        workdayId: wd2.id,
        agent: "orchestrator",
        type: "agenda",
        body: JSON.stringify({ agenda: [], rationale: "Critic said: test demand before building more. Today = spec the test." }),
        markdown: "### Today's agenda\n- **[high] builder** — Spec a single-page landing site with email capture\n- **[medium] operator** — Flag any legal/cost concerns with a public landing page\n\n### Rationale\nCritic said: test demand before building more. Today = spec the test.",
      },
      {
        workdayId: wd2.id,
        agent: "builder",
        type: "spec",
        body: JSON.stringify({ specs: "Static single-page site: headline, one screenshot mockup, email capture form.", architecture: "Next.js static export + a free form backend (e.g. Formspree).", tickets: [{ title: "Landing page layout", description: "Headline + subhead + form", estimate: "1h" }], codePrompts: [{ title: "Landing page prompt", prompt: "Build a single Next.js page with a headline, one paragraph, and an email capture form posting to a Formspree endpoint." }], unknowns: [] }),
        markdown: "### Specs\nStatic single-page site: headline, one screenshot mockup, email capture form.\n\n### Architecture\nNext.js static export + a free form backend (e.g. Formspree).\n\n### Tickets\n- **Landing page layout** (1h) — Headline + subhead + form",
      },
      {
        workdayId: wd2.id,
        agent: "operator",
        type: "plan",
        body: JSON.stringify({ costs: [{ item: "Domain (already owned)", estUsd: 0 }, { item: "Form backend free tier", estUsd: 0 }], legalRiskFlags: ["Add a plain-language privacy note since we're capturing emails"], checklist: [{ item: "Add privacy note", done: false }], shipVsWait: "ship", rationale: "Zero cost, low risk, directly answers the Critic's required experiment.", unknowns: [] }),
        markdown: "### Costs\n- Domain (already owned): $0.00\n- Form backend free tier: $0.00\n\n### Legal / risk flags\n- Add a plain-language privacy note since we're capturing emails\n\n### Ship vs wait: **SHIP**\nZero cost, low risk, directly answers the Critic's required experiment.",
      },
      {
        workdayId: wd2.id,
        agent: "critic",
        type: "critique",
        body: JSON.stringify({ scores: { clarity: 8, novelty: 5, feasibility: 9, moat: 3 }, overall: 7, weaknesses: ["Still no real user signal"], requiredNextExperiment: "Actually publish the landing page and drive 20 visits to it.", shippableNextAction: "Deploy the landing page and share the link in one relevant community.", verdict: "Good, focused day. Ship the page before doing anything else." }),
        markdown: "### Scores (1-10)\n- Clarity: 8\n- Novelty: 5\n- Feasibility: 9\n- Moat: 3\n- **Overall: 7**\n\n### Required next experiment\nActually publish the landing page and drive 20 visits to it.\n\n### Shippable next action (<2 hours)\nDeploy the landing page and share the link in one relevant community.\n\n### Verdict\nGood, focused day. Ship the page before doing anything else.",
      },
    ],
  });

  await prisma.companyBrief.create({
    data: {
      problem: "Casual beachgoers don't know when low tide happens or why it matters, and existing tools are built for experienced surfers.",
      icp: "Someone planning a weekend beach trip who wants one plain-English answer, not a tide chart.",
      offer: "A single-page tool that gives the best low-tide window this week for one location.",
      bets: JSON.stringify(["Plain-English tide guidance beats raw charts for casual users"]),
      killedIdeas: JSON.stringify([]),
      openQuestions: JSON.stringify(["Is there real demand? Landing page test is the next required experiment."]),
      version: 1,
    },
  });

  console.log("Seeded demo idea, 2 workdays, and a company brief.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
