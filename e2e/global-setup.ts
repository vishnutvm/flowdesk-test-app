// Playwright global setup: reseeds MongoDB back to the deterministic
// lib/seed-data.ts state before the suite runs, so every e2e run starts from
// the same known data (e.g. Organization.plan === "Pro") regardless of what
// a previous run mutated. Combined with fullyParallel: false / workers: 1 in
// playwright.config.ts, this keeps the suite deterministic and repeatable
// against the real, shared MongoDB Atlas database — there is no per-test
// transaction rollback, so tests that create records use uniquely-named
// data (timestamps/emails) rather than asserting exact list counts.
export default async function globalSetup() {
  // Playwright doesn't load .env files itself (unlike `next dev`/`next
  // start`, which auto-load .env.local). Load it here, before importing
  // anything that reads MONGODB_URI at call time.
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // .env.local may not exist in CI, where MONGODB_URI is instead injected
    // directly into the environment.
  }
  const { seedDatabase } = await import("../scripts/seed-db");
  await seedDatabase();
}
