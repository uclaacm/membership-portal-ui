---
name: e2e
description: Plan, generate, heal and run Playwright end-to-end tests for the ACM membership portal UI. Use when asked to write, fix, or run e2e / browser / Playwright tests, or to write a test plan for a page or flow in this repo. Builds on the playwright-cli skill.
---

# E2E tests for the membership portal

This skill is the project-specific layer on top of the **playwright-cli** skill
(`.github/skills/playwright-cli`). Follow its plan → generate → heal workflow in
`references/test-generation.md`, with the overrides below. Everything here uses the
`playwright-cli` shell command. Do not use an MCP server.

## 1. Start the throwaway stack first

```bash
npm run e2e:up      # Postgres, Mongo, backend, UI on http://localhost:8100 (first build is slow)
npm run e2e:down    # wipe it when finished, or to start from a clean database
npm run e2e:logs    # backend/UI logs when something looks wrong server-side
```

- Only run tests against `http://localhost:8100` (the default `baseURL`). **Never point tests or
  `playwright-cli` at staging or production.** The seeds forge login tokens with the stack's
  throwaway secret and tests create and delete data.
- Never call `/app/api/v1/health/setup`, and never change the seeded users' roles or delete them.
  Every test depends on them.

## 2. Paths (override the generic skill's `tests/` and `specs/`)

| What | Where |
|---|---|
| Seeds | `e2e/tests/seed.spec.ts` (member, `/home`), `admin.seed.spec.ts` (admin, `/controlpanel`), `officer.seed.spec.ts` (Hack officer, `/controlpanel`), `pending.seed.spec.ts` (unregistered, lands on `/register`) |
| Test plans | `e2e/specs/<feature>.plan.md` |
| Generated tests | `e2e/tests/<group>/<scenario-name>.spec.ts` |
| Fixtures | `e2e/support/fixtures.ts`: `test`, `expect`, `loginAs(role)`, `testData`, `unique()`, `HOUR` |
| Seeded users | `e2e/stack/users.json`: `member`, `admin`, `officer` (committee `Hack`), `pending` |

Pick the seed by who the flow is for: member pages use `seed.spec.ts`, the control panel uses
`admin.seed.spec.ts` or `officer.seed.spec.ts`, and registration uses `pending.seed.spec.ts`.

## 3. Logging in

The real login is Google sign-in, which can't be automated. **Do not try to click through it.**
`loginAs` sets a signed `token` cookie instead. So:

- Explore through the seed, never by opening a URL directly with `playwright-cli open`. Otherwise
  the browser is logged out and every page redirects to `/login`:
  ```bash
  npx playwright test e2e/tests/seed.spec.ts --debug=cli    # run in the background
  # wait for "Debugging Instructions" and the tw-XXXX session name, then:
  npx playwright-cli attach tw-XXXX
  npx playwright-cli -s=tw-XXXX step-over    # runs the seed's goto, pauses at its expect
  npx playwright-cli -s=tw-XXXX step-over    # pauses at "Close context": logged in, page still open
  npx playwright-cli -s=tw-XXXX snapshot     # now explore: click e9, fill e3 "...", find "RSVP", ...
  ```
  Two differences from the generic skill, both checked on this repo:
  - **Pass `-s=tw-XXXX` on every command after `attach`.** Without it, commands go to a
    `default` session that isn't open.
  - **Don't `resume` to "let the seed run".** The seed is short, so `resume` runs it to the end and
    the browser closes. Use `step-over` until it pauses at "Close context", explore, then
    `resume` once at the very end to let the test finish.
  The HTML report is already set to never open (`playwright.config.ts`), so
  `PLAYWRIGHT_HTML_OPEN=never` is not needed.
- **Always import `test` and `expect` from `e2e/support/fixtures.ts`**, never from
  `@playwright/test`. Copy the seed's setup into each test:
  ```ts
  // spec: e2e/specs/<feature>.plan.md
  // seed: e2e/tests/seed.spec.ts
  import { test, expect } from "../../support/fixtures";

  test.describe("<Group name from the plan>", () => {
    test("<scenario-name>", async ({ page, loginAs, testData }) => {
      const event = await testData.createEvent({ title: "..." });   // only if the test needs data
      await loginAs("member");
      await page.goto("/home");
      // 1. <step text>
      ...
    });
  });
  ```
- Need a role that isn't seeded yet (e.g. a super admin, or an officer of a second committee)?
  Ask the user first: `e2e/stack/users.json` is shared by the whole team.

## 4. Data rules

- All tests share one database and run one at a time (`workers: 1`). **Create the data a test
  needs with the `testData` fixture**, e.g. `testData.createEvent()` for an event happening now
  (usable for check-in), or pass `startDate`/`endDate` in the future for one to RSVP to. It is
  deleted automatically when the test ends. Use `unique("...")` for any names you type into
  forms. Don't rely on anything another test left behind.
- If a test needs a kind of data `testData` can't create yet, add a method to `TestData` in
  `e2e/support/fixtures.ts` (calling the backend API, cleaning up in `cleanup()`), rather than
  setting it up by clicking through other pages.
- The stack loads demo data (about 18 upcoming events, 10 committees, a leaderboard). Use it for
  reading and browsing, but don't assert exact counts or titles from it, and don't change it
  (RSVP, edit, delete). Assert on and act on data the test created. None of the demo events is
  happening right now.
- Prefer role and label locators (`getByRole`, `getByLabel`). If an element has no accessible name
  and no stable locator, say so instead of using a brittle CSS chain. A `data-testid` or label
  in the app may be the right fix.

## 5. Healing: fix the test, not the expectation

Follow the generic heal section, and also:

- If a fix would **weaken an assertion** (remove it, loosen it, or change the expected value to
  match new behaviour), stop and ask the user whether the app changed on purpose or regressed.
- A failure on a role or permission check (a member reaching an admin page, a missing redirect) is
  a likely security bug, not test drift. Report it, and don't "fix" the test.

## 6. Running

```bash
npm run test:e2e                                   # everything
npx playwright test e2e/tests/<group>/<file>.spec.ts   # one file
npx playwright show-report e2e/report              # last HTML report
```

When you're done, `resume` any paused `--debug=cli` run (or stop it) and run
`npx playwright-cli close-all`. Leave the stack up unless the user asks for it to be torn down.

## 7. Versions

`@playwright/cli`, `@playwright/test` and `playwright` are pinned exactly in `package.json`, and
they must be on the **same Playwright minor version**. `@playwright/cli` 0.1.22 is built on 1.64,
which matches `@playwright/test` 1.64.1. If they differ, `attach` fails with
`TypeError: Cannot read properties of undefined (reading 'tools')`. When upgrading, check
`npm view @playwright/cli@<version> dependencies.playwright`, bump all three together, then run
`npx playwright install chromium` and `npm run e2e:skills` (refreshes `.github/skills/playwright-cli`).
