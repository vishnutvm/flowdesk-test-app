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

- There is **no real backend, database, or auth provider**. Everything is
  mocked: seeded, deterministic data in `lib/seed-data.ts`, mutated via a
  client-side store (`lib/store.ts`, Zustand) persisted to `localStorage`.
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
- Zustand (client-side mock data/session store, persisted to `localStorage`)
- Vitest (unit tests) + Playwright (E2E tests)

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
```

## Environment variables

See `.env.example`. Everything is optional — the app has no real backend.
The only variable of note is `NEXT_PUBLIC_CHATBOT_WIDGET_URL`, the future
embed URL for the real chatbot widget (see
`components/ChatbotPlaceholder.tsx` for swap-in instructions).

## Known limitations

- All data resets if you clear browser storage (`localStorage` key
  `flowdesk-storage`) — this is by design, not a bug.
- "Sent" emails (password reset, invites) are mocked and never actually sent.
- The payment method on the Billing page is display-only; no real card can
  be entered and no real charge ever occurs.
- Role permissions are testable via a "Simulate role" selector on the Team
  page rather than requiring multiple real accounts.
