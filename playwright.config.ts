import { defineConfig, devices } from "@playwright/test";

// End-to-end tests run against the throwaway stack in e2e/docker-compose.yml (`npm run e2e:up`),
// never against staging or prod: the seeds sign their own login tokens with that stack's
// throwaway secret, and tests are free to create and delete data.
export default defineConfig({
  testDir: "./e2e/tests",
  // Fail CI if someone leaves a test.only in.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Tests share one database, so keep them in a predictable order until they are isolated.
  workers: 1,
  reporter: [["list"], ["html", { open: "never", outputFolder: "e2e/report" }]],
  outputDir: "e2e/test-results",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:8100",
    // Keep a trace of the first retry: you (or an agent healing the test) can replay it step by step.
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
