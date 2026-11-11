# End-to-end tests

Browser tests that drive the real UI against a real backend. Coding agents help write and maintain
them through **skills** that use the `playwright-cli` shell command. There is no MCP server.

```
tests/e2e/
  docker-compose.yml     the throwaway portal: Postgres, Mongo, backend, UI on :8100
  stack/users.json       the seeded users (member, admin, officer of Hack, pending), fixed UUIDs
  stack/seed-users.js    creates those users when the backend container starts
  support/auth.ts        signs a login token for a seeded user and sets the cookie
  support/fixtures.ts    import test/expect from here: loginAs(role), testData, unique()
  seed.spec.ts                 seed: member, on /home
  admin.seed.spec.ts           seed: admin, on /controlpanel
  officer.seed.spec.ts         seed: Hack officer, on /controlpanel
  pending.seed.spec.ts         seed: unregistered user, sent to /register
  <group>/               feature tests, one folder per area
  specs/                 test plans (Markdown) written during the planning step
.github/skills/          Copilot agent skills (VS Code loads these automatically)
  playwright-cli/        Microsoft's skill for driving a browser and plan/generate/heal (generated)
  e2e/                   this project's rules on top of it: the stack, seeds, paths, login, data
playwright.config.ts     where tests live, the base URL, traces and screenshots
```

## One-time setup (per developer)

1. Check out `membership-portal` next to `membership-portal-ui` (the stack builds both), on the
   **`feat/testing`** branch until that branch is merged into `main`:
   `git clone -b feat/testing https://github.com/uclaacm/membership-portal.git`.
2. Install Docker Desktop, and VS Code with GitHub Copilot. Copilot picks up the skills in
   `.github/skills/` on its own. Use Copilot Chat in **Agent** mode, so it can run terminal commands.
3. In this repo: `npm ci` then `npx playwright install chromium`. `npm ci` also installs
   `playwright-cli` (`@playwright/cli`, pinned in `devDependencies`); run it as
   `npx playwright-cli`.

## Everyday use

```bash
npm run e2e:up      # build + start the throwaway portal, wait until healthy (first run is slow)
npm run test:e2e    # run every test against http://localhost:8100
npm run e2e:down    # delete the whole stack, databases included
```

`npx playwright test --ui` opens the interactive runner, and `npx playwright show-report tests/e2e/report`
opens the last HTML report. Point the tests elsewhere with `E2E_BASE_URL`, but only at a stack
with the same throwaway secret. Never at staging or prod.

## How logging in works

Real logins go through Google, which a test can't automate. But all a finished login leaves
behind is a `token` cookie holding a JWT the backend signed. The throwaway stack starts the
backend with a fixed, fake `SESSION_SECRET` and creates users with known UUIDs, so the
`loginAs("member" | "admin" | "officer" | "pending")` fixture can sign a valid token itself and
set the cookie. The
backend checks the signature, then loads the user by UUID, so it behaves exactly as for a real
login.

The stack also starts with demo data (about 20 events, 10 committees, a leaderboard), which the
backend loads itself in development mode (`membership-portal/app/db/dev-setup.js`). That gives
planning something realistic to explore.

None of the demo events is happening right now, and tests shouldn't change demo data anyway.
Tests create what they need with the `testData` fixture, e.g. `testData.createEvent()`, which is
deleted again when the test ends.

`users.json` is shared by everyone, so check with the team lead before adding a role. Then add it,
write a seed for it, and run `npm run e2e:down && npm run e2e:up`.

## Generating tests with an agent

With the stack up, open Copilot Chat in Agent mode and ask in plain language (or type `/e2e` to
call the skill directly). The `e2e` skill tells it how this project
works, and the `playwright-cli` skill tells it how to drive the browser. Under the hood, it runs
the seed with `npx playwright test <seed> --debug=cli`, attaches with `playwright-cli attach`, and
copies the Playwright code each CLI action prints into the test.

| Step | Ask for | It produces |
|---|---|---|
| **Plan** | "Write an e2e test plan for RSVPing to events, as a member" | `tests/e2e/specs/<feature>.plan.md` |
| **Generate** | "Generate the tests from `tests/e2e/specs/rsvp.plan.md`" (or one scenario, e.g. `1.2`) | `tests/e2e/<group>/<scenario>.spec.ts` |
| **Heal** | "Run the e2e tests and fix the failures" | Edited test files, or a question when the app itself looks wrong |

You can also drive a browser by hand. Start a seed with `--debug=cli`, run
`npx playwright-cli attach <session>`, then `npx playwright-cli -s=<session> step-over` twice
(the seed is now done and the page is still open), then `snapshot`, `click e5`, and so on. See
`.github/skills/e2e/SKILL.md` for the details and `npx playwright-cli --help` for every command.

To refresh the generated skill after upgrading `@playwright/cli`, run `npm run e2e:skills`. It
regenerates the skill and copies it into `.github/skills/playwright-cli`. Don't edit that folder by
hand: put project rules in `.github/skills/e2e`.

Rules of thumb:

- **Review every plan and every generated test.** The agents write tests that pass against what
  the app does now, bugs included. You decide what it *should* do.
- **Healing fixes tests, not the app.** If the agent says the app is broken, check before accepting
  a change that weakens an assertion.
- **Keep the seeds green.** Every agent starts from one; if it breaks, they all do.
- **Tests share one database.** Create your own data with unique names rather than relying on
  what another test left behind.
