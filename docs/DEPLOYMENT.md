# Deployment

FlowDesk is a Next.js (App Router) application. Auth is fully mocked
(no real provider), but business data (projects, tasks, team members,
customers, notifications, invoices, API keys, webhooks, login history,
active sessions, integrations, notification prefs) is backed by a real
MongoDB Atlas database via Next.js Route Handlers under `app/api/**`. It
deploys cleanly to Vercel with one required environment variable.

## Prerequisites

- A Vercel account (free tier is sufficient).
- This repository pushed to a Git provider Vercel can access (GitHub, GitLab,
  or Bitbucket).
- A MongoDB Atlas cluster (or any reachable MongoDB instance) and its
  connection string. See "Database setup" in the root `README.md`.

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
   `MONGODB_URI` must be set **before** the first deploy — pages/routes that
   read business data will error at request time (not at build time) without
   it.
5. Once deployed, Vercel gives you a `*.vercel.app` URL. That URL is the
   "test app URL" referenced throughout `docs/CHATBOT-INTEGRATION-TEST-PLAN.md`.
6. Seed the deployed database once, from your machine, pointed at the same
   `MONGODB_URI` Vercel uses: `npm run db:seed`.

## Environment variables

Copy `.env.example` for the full list.

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | **Yes** | MongoDB Atlas connection string, including the database name (e.g. `/flowdesk`). Required for every page/route that reads or writes business data. Must be set as a **Vercel environment variable** (Project Settings → Environment Variables) for Production (and Preview/Development as needed) — see below. |

Set variables in Vercel under **Project Settings → Environment Variables**
for each environment (Production / Preview / Development) as needed.
`MONGODB_URI` is a secret — mark it sensitive in Vercel and never commit it
(it's gitignored locally via `.env*` in `.gitignore`, with `.env.example`
explicitly excepted). `NEXT_PUBLIC_*` variables are always public in the
client bundle regardless — `MONGODB_URI` is intentionally not prefixed with
`NEXT_PUBLIC_` and is only read server-side (`lib/mongodb.ts`, used from
`app/api/**` route handlers).

## What is NOT required

- No auth provider configuration — auth is fully mocked in `lib/store.ts`
  and stays client-side/localStorage-only; it does not touch MongoDB.
- No other API keys or secrets beyond `MONGODB_URI`.
- No serverless functions beyond what Next.js generates automatically for
  routing and the `app/api/**` route handlers; the app does not call any
  other external API.

## Local production build check

Before deploying, verify the production build locally:

```bash
npm run build
npm run start   # serves the production build on http://localhost:3000
```

`npm run build` does not require `MONGODB_URI` to be set — every
`app/api/**` route handler is dynamic (`export const dynamic =
"force-dynamic"`) and connects to MongoDB lazily at request time, not at
build/collect-page-data time.

## Rollback

Vercel deployment rollback is a plain Vercel deployment rollback (Vercel
dashboard → Deployments → pick a previous deployment → **Promote to
Production**). Business data lives in MongoDB, independent of the deployed
code revision, so a code rollback does not itself roll back data — there is
no automatic data migration/rollback tied to a deployment.

## Notes for the chatbot integration team

- Auth is mocked client-side; the chatbot's test harness should log in
  through the UI (`/login`) before attempting to test any protected route.
  The session is stored in the browser's `localStorage` under the key
  `flowdesk-storage` — clearing site data resets auth back to the logged-out
  state, but does **not** reset business data (that lives in MongoDB).
- Business data (projects, tasks, etc.) is shared across all browsers and
  sessions hitting the same deployment/database — it is not per-browser like
  auth is. Running the chatbot's test harness repeatedly against the same
  environment will accumulate any records it creates; re-run `npm run
  db:seed` to restore the original seed records (it does not delete
  records created afterward).
