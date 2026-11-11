import { test, expect } from "./support/fixtures";

// Seed: a signed-in user who hasn't finished registering. The app sends them to /register
// whatever page they ask for. See seed.spec.ts for how the agents use a seed.
test.describe("Logged in as a pending user", () => {
  test("seed", async ({ page, loginAs }) => {
    await loginAs("pending");
    await page.goto("/home");
    await expect(page).toHaveURL(/\/register$/);
  });
});
