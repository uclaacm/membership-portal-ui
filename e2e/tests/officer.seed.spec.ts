import { test, expect } from "../support/fixtures";

// Seed: a logged-in officer of the Hack committee on the control panel. Officers get
// committee-scoped access: they manage Hack's events and applications, not other committees'.
// See seed.spec.ts for how the agents use a seed.
test.describe("Logged in as a Hack officer", () => {
  test("seed", async ({ page, loginAs }) => {
    await loginAs("officer");
    await page.goto("/controlpanel");
    await expect(page).toHaveURL(/\/controlpanel$/);
  });
});
