# Deployment

FlowDesk is a static-friendly Next.js (App Router) application with no real
backend, no database, and no external API dependencies. It deploys cleanly to
Vercel with zero special configuration.

## Prerequisites

- A Vercel account (free tier is sufficient).
- This repository pushed to a Git provider Vercel can access (GitHub, GitLab,
  or Bitbucket).

## Deploy to Vercel

1. Push this repository to a Git remote.
2. In the Vercel dashboard, click **Add New… → Project** and import the
   repository.
3. Vercel auto-detects Next.js — leave the default build settings:
   - **Framework preset:** Next.js
   - **Build command:** `next build` (default)
   - **Output directory:** `.next` (default)
   - **Install command:** `npm install` (default)
4. Configure environment variables (see below), then click **Deploy**.
5. Once deployed, Vercel gives you a `*.vercel.app` URL. That URL is the
   "test app URL" referenced throughout `docs/CHATBOT-INTEGRATION-TEST-PLAN.md`.

## Environment variables

Copy `.env.example` for the full list. Every variable is optional for the app
to function, since there is no real backend:

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_CHATBOT_WIDGET_URL` | No | URL of the real chatbot widget's embed script. Leave unset until the chatbot platform is ready to be wired in — see `components/ChatbotPlaceholder.tsx` for the swap-in instructions. |

Set variables in Vercel under **Project Settings → Environment Variables**
for each environment (Production / Preview / Development) as needed. No
variable in this project holds a secret — nothing here needs to be marked
sensitive, though `NEXT_PUBLIC_*` variables are always public in the client
bundle regardless.

## What is NOT required

- No database provisioning (Postgres, MongoDB, etc.) — all data is seeded
  in `lib/seed-data.ts` and mutated only in the browser via `localStorage`.
- No auth provider configuration — auth is fully mocked in `lib/store.ts`.
- No API keys or secrets of any kind.
- No serverless functions beyond what Next.js generates automatically for
  routing; the app does not call any external API.

## Local production build check

Before deploying, verify the production build locally:

```bash
npm run build
npm run start   # serves the production build on http://localhost:3000
```

## Rollback

Because this app has no persistent server-side state, rollback is a plain
Vercel deployment rollback (Vercel dashboard → Deployments → pick a previous
deployment → **Promote to Production**). There is no data migration to
reverse.

## Notes for the chatbot integration team

- The app is fully client-rendered behind login; there is no server data to
  keep in sync with a staging chatbot environment.
- Every dashboard page requires the mocked session (see demo credentials in
  the root `README.md`). The chatbot's test harness should log in through
  the UI (`/login`) before attempting to test any protected route.
- The session is stored in the browser's `localStorage` under the key
  `flowdesk-storage`. Clearing site data resets the app back to the seeded
  demo state.
