import { test, expect } from "../support/fixtures";

// Seed: a logged-in admin on the control panel. Give this seed to the agents for anything only
// admins can reach. See seed.spec.ts for how the agents use a seed.
test.describe("Logged in as an admin", () => {
  test("seed", async ({ page, loginAs }) => {
    await loginAs("admin");
    await page.goto("/controlpanel");
    // Members are redirected to /home, so staying here means the admin login worked.
    await expect(page).toHaveURL(/\/controlpanel$/);
  });
});
