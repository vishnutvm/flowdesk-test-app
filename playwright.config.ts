import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  // Tests now exercise a real, shared MongoDB Atlas database (no per-test
  // transaction/rollback isolation), so they run serially rather than in
  // parallel workers to avoid races on shared singleton documents (e.g. the
  // Organization plan) and cross-test data. globalSetup reseeds the database
  // to the deterministic seed state before the run starts.
  fullyParallel: false,
  workers: 1,
  globalSetup: require.resolve("./e2e/global-setup.ts"),
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npx next start -p 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
