import { test, expect } from "../support/fixtures";

// Seed: a logged-in, fully registered member on the home page.
//
// Agents start from this file (see .github/skills/e2e). They run it with --debug=cli and attach
// playwright-cli, so they explore the app already logged in, and they copy its setup into every
// test they write. Keep it short and keep it passing: if the seed breaks, every agent breaks.
//
// Other roles: admin.seed.spec.ts, officer.seed.spec.ts, pending.seed.spec.ts.
test.describe("Logged in as a member", () => {
  test("seed", async ({ page, loginAs }) => {
    await loginAs("member");
    await page.goto("/home");
    // Not bounced to /login or /register, so the login worked.
    await expect(page).toHaveURL(/\/home$/);
  });
});
