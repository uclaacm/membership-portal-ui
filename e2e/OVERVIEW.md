# E2E Testing Overview: Playwright, Agents, and CI

How the membership portal's end-to-end tests are written, run, and (soon) enforced in CI.

**In one line:** agents help *write* the tests, Playwright *runs* them, and GitHub Actions *gates* merges with them.

| Stage | Tool | Status |
|---|---|---|
| Write tests | GitHub Copilot (Agent mode) + `playwright-cli` skills | ✅ Working |
| Run tests | Playwright test runner against a throwaway Docker stack | ✅ Working |
| Gate merges | GitHub Actions e2e workflow | ❌ Not built yet |

---

## Architecture

```
 AUTHORING (a developer + Copilot)             RUNNING (anyone, or CI)
 ─────────────────────────────────             ─────────────────────────

 Copilot Chat (Agent mode)                     npm run e2e:up
   │ loads .github/skills/e2e                    │ builds the throwaway portal from
   │   + .github/skills/playwright-cli           │ ../membership-portal + this repo
   ▼                                             ▼
 playwright-cli  ── drives ──► browser ──► http://localhost:8100  (UI → backend → Postgres/Mongo)
   │                                             ▲
   │ writes                                      │ runs against
   ▼                                             │
 e2e/specs/*.plan.md  →  e2e/tests/**/*.spec.ts ─┴── npm run test:e2e  →  pass/fail + e2e/report
                              │
                              ▼  developer reviews + commits
                         Pull request ──► GitHub Actions ──► e2e job (not built yet)
```

---

## 1. The throwaway stack

**File:** `e2e/docker-compose.yml`
**Commands:** `npm run e2e:up` / `npm run e2e:down` / `npm run e2e:logs`

`e2e:up` starts a complete, private copy of the portal on **http://localhost:8100**:

- **Postgres and Mongo** keep their data in memory, so `e2e:down` erases everything and every `up` starts clean.
- **The backend** is built from the `membership-portal` checkout next to the UI repo. On startup it:
  1. creates the tables (`scripts/db-init.js`),
  2. runs the migrations,
  3. seeds four test users with fixed UUIDs (`e2e/stack/users.json`): a **member**, an **admin**, an **officer** of the Hack committee, and a **pending** user who hasn't registered,
  4. loads demo data (about 18 upcoming events, 10 committees, a leaderboard).
- **The UI** is the Next.js app. It forwards `/app/api/*` requests to the backend.

It uses its own port and Compose project name, so it can run next to your normal dev stack on port 8000.

> ⚠️ Tests and agents only ever talk to this stack. **Never point them at staging or production.**

**Required folder layout:**

```
some-folder/
  membership-portal/        ← backend, on the feat/testing branch until it's merged into main
  membership-portal-ui/     ← this repo
```

---

## 2. Logging in without Google

**Files:** `e2e/support/auth.ts`, `e2e/support/fixtures.ts`

Tests can't automate Google sign-in. But all a completed login leaves behind is a `token` cookie holding a JWT the backend signed. So:

1. The stack starts the backend with a fixed, fake `SESSION_SECRET`.
2. The `loginAs("member" | "admin" | "officer" | "pending")` fixture signs a JWT with that secret for a seeded user and sets the `token` cookie.
3. The backend verifies the signature and looks up the user by UUID, just as it does after a real login.

This depends on two backend security fixes:
- **JWT verification is pinned to HS256**, so only tokens signed with the secret are accepted, and unsigned (`alg: none`) tokens are rejected.
- **`/health/setup` (the route that drops every table) is POST-only and needs a super admin**, so nothing that explores the dev stack can wipe the database by accident. The seeded users are not super admins.

**Adding a role** (for example a super admin): `users.json` is shared by the whole team, so check with the team lead first. Then add the role, write a seed for it, and run `npm run e2e:down && npm run e2e:up`.

### Test data

Tests import `test` and `expect` from `e2e/support/fixtures.ts`, which adds:

- `loginAs(role)`: log the browser in as a seeded user.
- `testData.createEvent({...})`: create an event through the API as an admin. By default it's happening right now (usable for check-in); pass future dates for an upcoming event. It's deleted automatically when the test ends.
- `unique("name")`: a name no other test or run will use.

None of the demo events is happening right now, and tests must not change demo data, so tests create their own.

---

## 3. Seed tests

| Seed | Who | Lands on |
|---|---|---|
| `e2e/tests/seed.spec.ts` | member | `/home` |
| `e2e/tests/admin.seed.spec.ts` | admin | `/controlpanel` |
| `e2e/tests/officer.seed.spec.ts` | officer of Hack | `/controlpanel` |
| `e2e/tests/pending.seed.spec.ts` | signed in, not registered | `/register` |

The smallest possible tests: log in, open a page, and confirm you weren't redirected to `/login`. They do two jobs:

- **A smoke test** that the stack and login work.
- **The starting point for agents.** Every agent session begins by running a seed, so it explores the app already logged in, and every generated test copies the seed's setup.

> Keep the seeds green. If a seed breaks, every agent breaks.

---

## 4. Writing tests with agents

**Files:** `.github/skills/e2e/SKILL.md` (project rules), `.github/skills/playwright-cli/` (Microsoft's skill, generated)

There is **no MCP server**. Agents use the `playwright-cli` shell command, guided by skills. GitHub Copilot in VS Code loads the skills in `.github/skills/` automatically.

**How to use it:** with the stack up, open Copilot Chat in **Agent** mode and ask in plain language, or type `/e2e`.

| Step | What you ask | What the agent does | What it produces |
|---|---|---|---|
| **Plan** | "Write an e2e test plan for RSVPing to events, as a member" | Runs a seed paused, attaches `playwright-cli`, explores the live app | `e2e/specs/<feature>.plan.md` |
| **Generate** | "Generate the tests from `e2e/specs/rsvp.plan.md`" | Walks each plan step in the browser. Every CLI action prints the equivalent Playwright code, which becomes the test | `e2e/tests/<group>/<scenario>.spec.ts` |
| **Heal** | "Run the e2e tests and fix the failures" | Debugs each failure the same way and fixes the test | Edited test files, or a question when the app looks broken |

**Under the hood** (what the agent runs):

```bash
npx playwright test e2e/tests/seed.spec.ts --debug=cli   # in the background; prints a session name tw-XXXX
npx playwright-cli attach tw-XXXX
npx playwright-cli -s=tw-XXXX step-over                  # runs the seed's goto
npx playwright-cli -s=tw-XXXX step-over                  # now logged in, page still open
npx playwright-cli -s=tw-XXXX snapshot                   # explore: click e9, fill e3 "...", etc.
```

**Rules for reviewers:**

- **Review every plan and every generated test.** Agents write tests that pass against what the app does *now*, bugs included. You decide what it *should* do.
- **Healing fixes tests, not the app.** If the agent wants to weaken an assertion, or a permission check fails (for example, a member reaching an admin page), treat it as a possible bug, not test drift.
- **Tests share one database.** Each test creates its own data with unique names, and never relies on demo data counts or on another test's leftovers.

> The agents only produce **files**. Nothing AI-driven runs in CI.

---

## 5. Running tests

**File:** `playwright.config.ts`

```bash
npm run e2e:up                                      # start the stack (first build is slow)
npm run test:e2e                                    # run every test
npx playwright test e2e/tests/<group>/<file>.spec.ts  # run one file
npx playwright test --ui                            # interactive runner
npx playwright show-report e2e/report               # open the last HTML report
npm run e2e:down                                    # tear down and wipe the stack
```

Playwright on its own, with no AI involved:

- Runs in Chromium against `http://localhost:8100`.
- **One worker**: tests run one at a time because they share a database.
- In CI: one retry, a trace saved on that retry, and `test.only` fails the run.
- Screenshots on failure; HTML report in `e2e/report/`.

Results are deterministic, which is why the Playwright suite, not the agents, is what gates merges.

---

## 6. GitHub Actions: current state

| Repo | Workflow | What runs on a PR |
|---|---|---|
| `membership-portal` (backend) | `.github/workflows/pr.yml` | ESLint, Jest **unit** tests, Jest **integration** tests against Postgres and Mongo service containers. Also runs on pushes to `main`. |
| `membership-portal-ui` | `.github/workflows/eslint.yml` | **ESLint only.** The Jest tests in `tests/unit` and `tests/component` don't run, and **e2e doesn't run either**. |

The backend's API rules (permissions, check-in, RSVPs, internship applications) are covered by integration tests, but **nothing in CI checks the UI itself yet.**

---

## 7. Next step: an e2e workflow in the UI repo

It mirrors what you do locally:

1. Check out `membership-portal-ui`, and check out `membership-portal` **next to it** (the compose file builds the backend from that sibling folder).
2. `npm ci` and `npx playwright install chromium`.
3. `npm run e2e:up` (Docker Compose works on GitHub's Ubuntu runners).
4. `npm run test:e2e`.
5. Upload `e2e/report/` and `e2e/test-results/` as artifacts, so failures can be opened in the trace viewer.
6. `npm run e2e:down`.

Once that job is required for merging into `main`, the loop is complete:

```
agents help write tests → humans review → Playwright runs them on every PR → green required to merge
```

**Open decision:** a backend PR can break the UI too. Consider also running the e2e suite on backend PRs, by checking out the UI repo in the backend workflow or triggering the UI workflow.

---

## One-time setup (per developer)

1. Check out `membership-portal` next to `membership-portal-ui`, on the **`feat/testing`** branch until it's merged into `main`.
2. Install **Docker Desktop**, plus **VS Code with GitHub Copilot**.
3. In `membership-portal-ui`:
   ```bash
   npm ci
   npx playwright install chromium
   ```
   `npm ci` also installs `playwright-cli` (`@playwright/cli`), pinned in `devDependencies`.

---

## Maintenance

**Versions must match.** `@playwright/cli`, `@playwright/test` and `playwright` are pinned exactly in `package.json`, and they must be on the **same Playwright minor version**. Currently that's CLI `0.1.22` (built on Playwright 1.64) with `@playwright/test` `1.64.1`. If they differ, `playwright-cli attach` fails with `TypeError: Cannot read properties of undefined (reading 'tools')`.

**To upgrade:**

```bash
npm view @playwright/cli@<version> dependencies.playwright   # find the matching Playwright version
npm i -D --save-exact @playwright/cli@<version> @playwright/test@<match> playwright@<match>
npx playwright install chromium
npm run e2e:skills                                         # refresh .github/skills/playwright-cli
```

Don't edit `.github/skills/playwright-cli/` by hand, because `e2e:skills` overwrites it. Put project rules in `.github/skills/e2e/SKILL.md`.

---

## File reference

```
membership-portal-ui/
  playwright.config.ts          test dir, base URL, retries, traces, report
  e2e/
    docker-compose.yml          the throwaway stack (port 8100)
    stack/users.json            seeded test users (member, admin, officer, pending), fixed UUIDs
    stack/seed-users.js         creates those users when the backend starts
    support/auth.ts             signs a login token for a seeded user and sets the cookie
    support/fixtures.ts         test/expect + loginAs, testData, unique (import from here)
    tests/*.seed.spec.ts        one seed per role
    tests/support/              self-test of the fixtures
    tests/<group>/*.spec.ts     generated and hand-written tests
    specs/*.plan.md             test plans
    report/, test-results/      output (gitignored)
  .github/skills/
    e2e/SKILL.md                project rules for agents
    playwright-cli/             Microsoft's skill (generated by npm run e2e:skills)
```
