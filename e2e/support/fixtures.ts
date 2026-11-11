import { test as base, expect, type APIRequestContext } from "@playwright/test";

import { loginAs, tokenFor, type Role } from "./auth";

// Shared fixtures for every e2e test. Import `test` and `expect` from here instead of from
// "@playwright/test":
//
//   import { test, expect } from "../../support/fixtures";
//
//   test("a member can RSVP", async ({ page, loginAs, testData }) => {
//     const event = await testData.createEvent({ title: "RSVP target" });
//     await loginAs("member");
//     await page.goto("/events");
//     ...
//   });
//
// Anything created through `testData` is deleted again when the test ends, pass or fail.

export { expect };

export const HOUR = 60 * 60 * 1000;

/** A name no other test (or earlier run) will have, e.g. unique("RSVP target"). */
export const unique = (prefix: string) =>
  `${prefix} ${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export type EventInput = {
  title?: string;
  description?: string;
  /** A committee name from the demo data, e.g. "Hack" or "AI". "ACM" means chapter-wide. */
  committee?: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  attendanceCode?: string;
  attendancePoints?: number;
};

export type CreatedEvent = Required<Omit<EventInput, "startDate" | "endDate">> & {
  uuid: string;
  startDate: string;
  endDate: string;
};

/**
 * Creates test data through the backend API, the same way the control panel does, and
 * remembers it so it can be deleted afterwards. Use it to set up what a test needs instead of
 * clicking through admin pages, and instead of relying on the demo data.
 */
export class TestData {
  private events: string[] = [];

  constructor(private api: APIRequestContext) {}

  private headers(as: Role) {
    return { Authorization: `Bearer ${tokenFor(as)}` };
  }

  /**
   * Creates an event. By default it is happening right now (started an hour ago, ends in an
   * hour), so its attendance code can be used to check in. Pass startDate/endDate in the
   * future for an upcoming event you can RSVP to.
   */
  async createEvent(values: EventInput = {}, { as = "admin" as Role } = {}): Promise<CreatedEvent> {
    const now = Date.now();
    const event = {
      title: unique("E2E Event"),
      description: "Created by an e2e test.",
      committee: "Hack",
      location: "Boelter 3400",
      startDate: new Date(now - HOUR),
      endDate: new Date(now + HOUR),
      attendanceCode: unique("code").replace(/\s/g, "-"),
      attendancePoints: 10,
      ...values,
    };
    const response = await this.api.post("/app/api/v1/event", {
      headers: this.headers(as),
      data: { event },
    });
    const body = await response.json();
    if (!response.ok() || body.error) {
      throw new Error(`createEvent failed (${response.status()}): ${JSON.stringify(body.error ?? body)}`);
    }
    this.events.push(body.event.uuid);
    return body.event as CreatedEvent;
  }

  /** Deletes everything this test created. Runs automatically after each test. */
  async cleanup() {
    for (const uuid of this.events.reverse()) {
      await this.api.delete(`/app/api/v1/event/${uuid}`, { headers: this.headers("admin") });
    }
    this.events = [];
  }
}

type Fixtures = {
  /** Logs the browser in as a seeded user: "member", "admin", "officer" (Hack) or "pending". */
  loginAs: (role: Role) => Promise<void>;
  /** Creates test data through the API and deletes it when the test ends. */
  testData: TestData;
};

export const test = base.extend<Fixtures>({
  loginAs: async ({ page }, use) => {
    await use((role) => loginAs(page, role));
  },
  testData: async ({ playwright, baseURL }, use) => {
    const api = await playwright.request.newContext({ baseURL });
    const data = new TestData(api);
    await use(data);
    await data.cleanup();
    await api.dispose();
  },
});
