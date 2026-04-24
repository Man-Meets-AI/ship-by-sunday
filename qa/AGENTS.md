# QA Control Plane

## Scope

Use this file whenever a task changes routes, auth behavior, entitlement behavior, checkout behavior, browser QA, release-readiness evidence, or ship-readiness evidence.

`qa/` is the canonical QA control plane. Do not invent alternate scenario lists in a skill folder, PR comment, or one-off script.

## Read Order

Read these files in order before changing QA decisions:

1. `qa/README.md`
2. `qa/glossary.md`
3. `qa/journeys.csv`
4. `qa/coverage.csv`
5. `qa/test-inventory.csv`
6. `qa/personas.json`
7. `qa/current-baseline.md`
8. latest relevant report under `qa/runs/`

Then inspect only the app code and tests required for the selected scenarios.

Before running a pack, declare the target environment in plain English: `feature branch`, `dev`, `prod`, `main`, or a named test environment. Do not mix evidence from different environments in one report without saying so explicitly.

## Branch And Environment Contract

- Feature branches are preview-only and should stay on dry-run QA or focused proof.
- `dev` is the integrated staging branch where the full buyer flow is first proven.
- `main` is production, so release evidence must match the `dev -> main` promotion path.
- Workflow order is `dev` first, then `prod`. Use local dev to debug product/runtime issues before collecting hosted ship evidence.
- Use `qa/runs/` as the durable evidence set and read the latest relevant environment report before rerunning a pack.
- For production QA, prefer a live no-cost Checkout verification using a restricted `100% off` discount instead of a real card charge. That proves the webhook/access handoff without treating prod as a card-testing surface.
- On production, canonical billing automation should create the Checkout Session directly with that discount already attached. Do not make the production gate depend on manual promotion-code entry in Stripe's hosted UI.

## QA Lead

`QA Lead` is the default user-facing role. A normal "go talk to our QA team" request should return one consolidated verdict, not a committee memo.

Start advisory-first:

1. Map the feature to journeys.
2. Inspect current proof.
3. Identify missing proof.
4. Recommend the smallest next run.
5. Run only the safe local budget unless the user asks for more.

Default safe local auto-run budget:

```bash
bun run qa:validate
bun run qa:run-pack -- --pack=<pack> --dry-run
bun run --cwd apps/web test:integration:ui -- tests/integration-ui/<focused-test>.test.tsx
```

Do not automatically run full browser packs, billing flows, or canonical `qa/` truth writes during an ordinary review request.

The lead's answer should cover:

- affected journeys
- current proof
- missing proof
- recommended runs
- findings
- release confidence

## Specialist Pattern

For material reviews, the lead should use the deterministic specialist pattern below unless the request is truly lightweight.

- Use `Scenario Mapper`, `Coverage Analyst`, and `Gap Reviewer` in parallel for feature diff reviews, multi-journey reviews, or any review substantial enough to justify a local review artifact.
- Add `Browser Runner` only when the user explicitly asks for browser execution and the environment is declared safe.
- Add `Release Summarizer` after any command-backed review, browser run, or material review where the final verdict should separate proven behavior from missing proof.
- If specialist inputs disagree, keep the answer consolidated and choose the more conservative confidence call.

## Scenario Mapper

Read the diff, map changed files to scenario IDs, and state which packs are affected. Prefer product language over file names.

Example: a change in `apps/web/features/product-access/` affects `AUTH-02`, `ACCESS-01`, and `BLUEPRINT-01`, not "the access-required component."

## Coverage Analyst

Keep `qa/test-inventory.csv` current with the real `apps/web/tests/` tree and compare it against `qa/coverage.csv` when proof strength drifts. Every test file must have one row.

Use:

```bash
bun run qa:inventory:sync
bun run qa:inventory:check
bun run qa:validate
```

- `qa:inventory:sync` preserves curated rows for unchanged files and only uses filename heuristics to seed genuinely new files.
- `qa:inventory:check` is the CI-facing fast fail that reruns inventory sync and fails if `qa/test-inventory.csv` would change.
- If a meaningful mapping still degrades after sync, stop and repair the control plane before concluding the review.
- If a test only proves implementation details, mark it `merge`, `replace`, or `delete` instead of pretending it is ship-critical journey proof.
- Do not silently apply canonical inventory or coverage edits during an ordinary QA-team review. Prepare the exact change and ask for confirmation first.

## Browser Runner

Use this role only when the user explicitly asks for browser execution and the environment is declared safe.

Prepare the needed personas, run the smallest relevant browser surface, and record which scenario IDs were actually exercised.

Use:

```bash
bun run qa:run-pack -- --pack=default_ship --dry-run
PLAYWRIGHT_BASE_URL=<safe_base_url> bun run qa:personas:prepare -- --pack=default_ship
bun run test:browser-smoke
bunx vitest run --project integration-ui tests/integration-ui/blueprint-start-page.test.tsx tests/integration-ui/blueprint-stage-page.test.tsx tests/integration-ui/blueprint-review-page.test.tsx tests/integration-ui/blueprint-stage-sidebar.test.tsx
E2E_RUN_SANDBOX=1 PLAYWRIGHT_BASE_URL=<safe_base_url> bun run --cwd apps/web test:e2e:sandbox:default-ship
PLAYWRIGHT_BASE_URL=<safe_base_url> bun run --cwd apps/web test:e2e:local-auth:default-ship
```

Environment ownership:

- `qa/personas.local.json` supplies the real QA account emails and passwords. It must stay ignored.
- `apps/web/.env.local` or `QA_ENV_FILE=<path>` supplies the Clerk and Convex environment for provisioning.
- `PLAYWRIGHT_BASE_URL` supplies the browser target.

Pack policy:

- `default_ship`: run the full pack on `dev` or production release verification once the environment is ready. On feature branches, use only `--dry-run` plus focused tests.
- Blueprint-funnel diffs require the blueprint integration-ui suite because it proves the stacked Start page, routed workbench, Continue-only save and validation flow, and Review unlock hierarchy.
- On local dev, prefer the local-auth default-ship lane when sandbox auth is not active.
- `extended`: run only the scenarios touched by the diff unless the user asks for a full extended sweep.
- `billing_integration`: run only on `dev` or production release verification when the environment is explicitly safe for test payments and `QA_ALLOW_BILLING_INTEGRATION=1` is set. Do not run it on ordinary feature branches.
- If the sandbox Playwright lane exits with all tests skipped, treat that as missing browser evidence, not a green pass.
- Hosted persona prep must use Clerk env values that match the hosted target. Set `QA_ENV_FILE=<path>` or export matching Clerk env vars before targeting prod or any non-local Clerk instance.

## Gap Reviewer

Read `qa/journeys.csv`, `qa/coverage.csv`, the latest report, and the touched diff together.

Flag important scenarios that still have `gap`, `rewrite_required`, low-confidence automation, or no recent browser evidence. Use product language, not framework language.

Use:

```bash
bun run qa:validate
```

Then inspect rows with `gap` or low confidence in `qa/coverage.csv` and compare them against the latest committed run report.

Use `Gap Reviewer` whenever a diff touches release-critical journeys but the coverage map still shows `gap`, `rewrite_required`, or stale browser evidence.

## Release Summarizer

Create or update `qa/runs/YYYY-MM-DD-<slug>.md` using `qa/templates/run-report.md`.

Every report must include:

- environment label near the top, such as `Environment: dev-local`, `Environment: prod-www.man-meets-ai.com`, or `Environment: staging-<name>`
- pack
- personas
- scenario IDs
- commands run
- pass/fail findings
- blocked items
- any flow that was not executed

Use:

```bash
bun run qa:ship -- --pack=default_ship --slug=<short-name>
```

That command scaffolds a local report under `qa/runs/local/`. Promote the final report into committed `qa/runs/` only after the evidence is worth keeping.

## Operating Rules

- Do not store secrets in `qa/`. Only `qa/personas.local.json` may hold local credentials, and it must stay ignored.
- Do not count a unit test as journey proof if it only checks an internal helper and never validates user-facing behavior.
- If a current test uses `/mission` or `/artifacts`, mark it `rewrite_required` or `rewrite` unless the actual customer-facing contract still depends on that alias.
- Prefer additive updates. Refresh the inventory, coverage map, and report before deleting legacy tests.
- Run `bun run qa:validate` before concluding any QA control plane change is complete.
