# FlowDesk

FlowDesk is a **fictional SaaS application** for managing projects, teams,
tasks, and customer work. It is a fully working Next.js app with a realistic
UI — but it is **not a real product**.

## What this repository actually is

This is **not** the chatbot platform itself. It exists solely as an
**external integration / end-to-end testing target** for a separate chatbot
platform built elsewhere. That platform will eventually embed a chat widget
in this app (see `components/ChatbotPlaceholder.tsx`) to answer support
questions and visually guide users through workflows.

Because of that purpose:

- **Auth has no real provider and is intentionally kept that way.** Login,
  signup, session, and the demo/simulated-role switcher are fully mocked
  client-side (`lib/store.ts`, Zustand), persisted to `localStorage` under the
  `flowdesk-storage` key. There is no password hashing, no real JWT/session,
  and no account database.
- **Business data (projects, tasks, team members, customers, notifications,
  invoices, API keys, webhooks, login history, active sessions, integrations,
  notification prefs) is backed by a real MongoDB Atlas database.** Next.js
  Route Handlers under `app/api/**` provide CRUD over Mongoose models
  (`lib/db/models.ts`); the Zustand store fetches from those routes and
  refetches after each mutation, so the UI always reflects what's in MongoDB.
  See `lib/mongodb.ts` for the connection helper and `scripts/seed-db.ts` for
  the deterministic seed data (same records as before, now persisted instead
  of held in memory).
- Every important interactive element carries stable `data-testid` and
  `data-ai-target` attributes for automated testing and AI-guided navigation.
- The help center / docs content is written to match the live UI exactly, so
  a chatbot answering from that content will always describe the real app.

See `docs/CHATBOT-INTEGRATION-TEST-PLAN.md` for the full integration test
plan (selectors, expected Q&A, navigation paths) and `docs/DEPLOYMENT.md`
for deployment steps.

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- MongoDB Atlas + Mongoose (business data — see `lib/db/models.ts`)
- Zustand (client-side session store — mocked auth only — plus a thin data
  cache populated from `app/api/**`, persisted to `localStorage`)
- Vitest (unit tests) + Playwright (E2E tests)

## Database setup

1. Copy `.env.example` to `.env.local` and set `MONGODB_URI` to a MongoDB
   Atlas (or any MongoDB) connection string. Use a dedicated database name in
   the URI path, e.g. `.../flowdesk?retryWrites=true&w=majority`.
2. Seed the deterministic demo data:
   ```bash
   npm run db:seed
   ```
   This is idempotent — it upserts each seed record by its fixed `id`, so
   running it again converges the database back to the same known state
   without duplicating records. Run it once after pointing at a fresh
   database, and again any time you want to restore the original demo data
   for records that still exist by their seed `id` (it does not delete
   records created afterward through the UI, e.g. via "New project").
3. `npm run dev` / `npm run build && npm run start` as usual — API routes
   under `app/api/**` connect to MongoDB lazily at request time via
   `lib/mongodb.ts`, so the app (and `npm run build`) works even before you've
   set `MONGODB_URI`, as long as you don't hit a data-backed page.

## Local setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo credentials

| Field | Value |
|---|---|
| Email | `demo@flowdesk.test` |
| Password | `Demo@12345` |

These are also shown directly on the login and landing pages. You can also
sign up for a new (equally mocked) account at `/signup`.

## Full route list

```
/                              Marketing landing page
/login                         Log in
/signup                        Create account
/forgot-password               Request password reset
/reset-password                Set new password

/dashboard                     Overview, stats, activity, quick actions   (protected)
/projects                      Project list + create                     (protected)
/projects/[id]                 Project detail, edit, delete               (protected)
/tasks                         Task list, filters, create                 (protected)
/tasks/[id]                    Task detail, edit, delete                  (protected)
/team                          Team members, invite, roles                (protected)
/customers                     Customer CRUD                              (protected)
/notifications                 Notification feed                         (protected)

/settings/profile              Name, email, avatar, timezone              (protected)
/settings/security             Password, 2FA, sessions, login history     (protected)
/settings/notifications        Notification preferences                   (protected)
/settings/billing               Plan, payment method, invoices, upgrade   (protected)
/settings/team                 Team management (alias of /team)           (protected)
/settings/integrations         Slack, Google Calendar, API keys, webhooks (protected)

/help                          Help center, grouped by category           (protected)
/docs                          Documentation index                        (protected)
/docs/[slug]                   Individual doc article (15 topics)         (protected)
```

Protected routes redirect unauthenticated visitors to `/login?redirected=1`.

## Scripts

```bash
npm run dev         # start the dev server
npm run build       # production build
npm run start       # serve the production build
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm run test         # unit tests (Vitest)
npm run test:e2e     # end-to-end tests (Playwright; manages its own server)
npm run db:seed      # idempotently (re)seed MongoDB with the deterministic demo data
```

## Environment variables

See `.env.example`. `MONGODB_URI` is required for any page/route that reads
or writes business data (projects, tasks, etc.) — see "Database setup"
above. `NEXT_PUBLIC_CHATBOT_WIDGET_URL` is the future embed URL for the real
chatbot widget (see `components/ChatbotPlaceholder.tsx` for swap-in
instructions) and remains optional.

## Known limitations

- Auth (login, signup, session, simulated role) is fully mocked and resets
  if you clear browser storage (`localStorage` key `flowdesk-storage`) — this
  is by design, not a bug. Business data does **not** reset with it; it lives
  in MongoDB and survives across browsers/devices/sessions.
- "Sent" emails (password reset, invites) are mocked and never actually sent.
- The payment method on the Billing page is display-only; no real card can
  be entered and no real charge ever occurs.
- Role permissions are testable via a "Simulate role" selector on the Team
  page rather than requiring multiple real accounts.
- Mutating actions in the Zustand store (`lib/store.ts`) refetch the affected
  resource from the API after each write rather than updating optimistically
  — simpler and correct by construction, at the cost of an extra round trip
  per mutation. Fine at this app's scale.
- `npm run db:seed` is additive/idempotent (upsert by id) — it restores the
  original seed records but does not delete records created afterward
  through the UI or by the Playwright suite.
