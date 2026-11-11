# Test plans

Test plans live here as Markdown (`<feature>.plan.md`), written by an agent using the `e2e` skill
(planning step). Review a plan before generating tests from it: it decides what gets tested.
Each plan names the seed it was explored from (`tests/e2e/seed.spec.ts`, `admin.seed.spec.ts`,
`officer.seed.spec.ts` or `pending.seed.spec.ts`).
