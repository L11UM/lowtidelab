# Personal Portfolio

A modern personal portfolio built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and Framer Motion. Includes a home page, projects grid, an "Idea Lab" page, an about page, and an interactive RocketGPT chat demo.

## Getting started

This project was scaffolded by hand (Node.js wasn't available in the environment it was generated in). To run it locally, you'll need [Node.js](https://nodejs.org/) 18.18+ installed.

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
  app/
    layout.tsx        Root layout, fonts, metadata, nav/footer
    page.tsx           Home page (hero, featured projects, RocketGPT demo)
    projects/page.tsx  Projects grid
    lab/page.tsx       Idea Lab page
    about/page.tsx     About page
    sitemap.ts         Auto-generated sitemap
    robots.ts          Robots.txt config
    not-found.tsx       404 page
  components/
    navbar.tsx          Site navigation with active-route pill
    footer.tsx          Footer with socials
    reveal.tsx          Scroll-triggered fade/slide animation wrapper
    project-card.tsx    Reusable project card
    chat-demo.tsx       Interactive RocketGPT chat demo (simulated)
  lib/
    data.ts             Projects & ideas data — edit this to add new work
```

## Adding a new project

Edit `src/lib/data.ts` and add an entry to the `projects` array:

```ts
{
  slug: "my-new-project",
  title: "My New Project",
  description: "What it does and why it's cool.",
  tags: ["Next.js", "AI"],
  liveUrl: "https://example.com",
  image: "/projects/my-new-project.png", // optional screenshot
  featured: true, // optional, shows on the home page
}
```

## Connecting the real RocketGPT

`src/components/chat-demo.tsx` currently simulates responses client-side. To wire it up to a real backend:

1. Create an API route (e.g. `src/app/api/chat/route.ts`) that proxies to your model/provider.
2. Replace the `setTimeout` + canned-response logic in `handleSend` with a `fetch("/api/chat", ...)` call, ideally using a streaming response.

## Monetization (no backend required)

Since this site is statically exported, monetization is done via third-party hosted links/forms — no server needed. Everything is configured in one place: `src/lib/config.ts`.

- **Waitlist / lead capture** (`src/components/waitlist-form.tsx`): collects emails for "RocketGPT Pro" early access.
  1. Create a free form at [Formspree](https://formspree.io) (or similar).
  2. Copy the form endpoint into `monetization.waitlistFormEndpoint` in `src/lib/config.ts`.
- **Support / tips** (`src/components/support-cta.tsx`): "Buy me a coffee" and monthly membership buttons.
  1. Create [Stripe Payment Links](https://dashboard.stripe.com/payment-links) for a one-time tip and a recurring membership (Payment Links are safe to use client-side — no secret keys involved).
  2. Paste the links into `monetization.stripeTipLink` and `monetization.stripeMembershipLink`.
  3. Optionally set `monetization.koFiUrl` / `monetization.githubSponsorsUrl` as alternates.

Both components are already placed on the home page (below the RocketGPT demo) and the About page.

## Customization

- Update site name, socials, and metadata (`src/app/layout.tsx`, `src/components/navbar.tsx`, `src/components/footer.tsx`).
- Colors and theme live in `tailwind.config.ts`.
- Replace `https://liamthompson.dev` in `layout.tsx`, `sitemap.ts`, and `robots.ts` with your real domain.

## Deploying to GitHub Pages

This project is configured for static export (`output: "export"` in `next.config.mjs`), so it can be hosted for free on GitHub Pages.

1. Push this repo to GitHub as **`newportFOLIO`** (the `basePath` in `next.config.mjs` is already set to match). If you rename the repo, update the `repoName` constant in `next.config.mjs` to match.
2. In your repo settings, go to **Settings → Pages** and set the source to **GitHub Actions**.
3. Push to `main` — the included workflow at `.github/workflows/deploy.yml` will run `npm ci && npm run build` and publish the exported `out/` folder automatically.
4. Your site will be live at `https://<username>.github.io/newportFOLIO/`.

Notes:
- If you use a **user/organization page** repo (named exactly `<username>.github.io`), set `repoName` to `""` in `next.config.mjs` since it's served from the root, not a subpath.
- If you later add project screenshots via plain `<img>` tags (as in `project-card.tsx`), reference them with the `basePath` in mind, or move to `next/image` with `unoptimized` (already enabled) and root-relative paths under `public/`.
- To build and preview the static export locally: `npm run build` then serve the `out/` folder with any static server (e.g. `npx serve out`).

