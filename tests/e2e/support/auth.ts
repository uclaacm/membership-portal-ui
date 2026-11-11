import { createHmac } from "node:crypto";
import { test, type Page } from "@playwright/test";

import users from "../stack/users.json";

// Real logins go through Google, which a test can't do. But a finished login only leaves one
// thing behind: a `token` cookie holding a JWT the backend signed. So the seeds sign that JWT
// themselves, with the throwaway stack's secret, for a user the stack seeded with a known UUID.
// Must match SESSION_SECRET in tests/e2e/docker-compose.yml.
const SESSION_SECRET = process.env.E2E_SESSION_SECRET ?? "e2e-throwaway-secret-not-for-real-use";

export type Role = keyof typeof users;

const base64url = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");

// The same claims the backend's /auth/login puts in a token. The UI reads them to decide which
// pages you may open; the backend ignores them and looks the user up by uuid.
export function tokenFor(role: Role): string {
  const user: { uuid: string; accessType: string; state?: string } = users[role];
  const now = Math.floor(Date.now() / 1000);
  const header = base64url({ alg: "HS256", typ: "JWT" });
  const payload = base64url({
    uuid: user.uuid,
    admin: user.accessType === "ADMIN" || user.accessType === "SUPERADMIN",
    superAdmin: user.accessType === "SUPERADMIN",
    officer: user.accessType === "OFFICER",
    // A pending user hasn't finished /register yet; the UI sends them there.
    registered: user.state !== "PENDING",
    iat: now,
    exp: now + 60 * 60,
  });
  const signature = createHmac("sha256", SESSION_SECRET).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${signature}`;
}

// Logs the browser in as a seeded user. Call it before the first page.goto().
export async function loginAs(page: Page, role: Role): Promise<void> {
  const { baseURL } = test.info().project.use;
  if (!baseURL) throw new Error("loginAs needs use.baseURL in playwright.config.ts");
  await page.context().addCookies([{ name: "token", value: tokenFor(role), url: baseURL }]);
}
