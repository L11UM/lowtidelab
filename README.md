# Low Tide Lab

Low Tide Lab is an EMS and fire training hub built with Next.js, TypeScript, Tailwind CSS, and Framer Motion. Its skill catalog groups short practice drills by discipline and competency area, with search, filters, and browser-local practice status.

## Run locally

Use Node.js 20 or newer.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The `predev` hook still creates the legacy coastal snapshot used by archived tools.

## Training hub

- `/` — searchable EMS, Fire, and shared crew competency catalog.
- Skill status is stored in the current browser only; it is not a credential, agency record, or shared crew database.
- Drill prompts are practice aids. Current agency protocols, approved curricula, medical direction, equipment manuals, and instructor supervision take priority.

The catalog is defined in `src/lib/training-skills.ts`; each skill contains an objective, level, estimated practice time, drill sequence, and completion check.

## Archived tools and content

Legacy coastal pages and the daily-post workflow remain in the repository but are not part of the primary training navigation.

## Public deployment

The GitHub Pages workflow at `.github/workflows/deploy.yml` builds and deploys on pushes to `main`. `npm run build` runs the snapshot generator before Next.js static export. The production domain is `https://lowtidelab.dev`.

## Release announcements

The workflow at `.github/workflows/social-release.yml` creates an X post and Instagram caption only for commits containing `[announce]` in the commit message, or for a manual workflow run. It always uploads the generated copy as an Actions artifact.

To publish automatically, add these GitHub Actions secrets:

- `X_ACCESS_TOKEN` — an X user access token with permission to write posts.
- `INSTAGRAM_USER_ID` — an Instagram Professional account ID.
- `INSTAGRAM_ACCESS_TOKEN` — a Meta Graph API token with publishing permission.
- `INSTAGRAM_IMAGE_URL` — a public HTTPS image URL for the Instagram post.

Without those secrets, the workflow still produces ready-to-post copy without failing the deployment pipeline.

