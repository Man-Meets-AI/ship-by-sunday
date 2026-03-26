# QA Agent Workflow

Use this file whenever a task changes routes, auth behavior, entitlement behavior, checkout behavior, browser QA, or ship-readiness evidence.

This folder is the canonical QA control plane. Do not invent alternate scenario lists in a skill folder, a PR comment, or a one-off script. Update the files in `qa/` directly.

## Read Order

Read these files in order before changing QA decisions:

1. `qa/README.md`
2. `qa/glossary.md`
3. `qa/journeys.csv`
4. `qa/coverage.csv`
5. `qa/test-inventory.csv`
6. `qa/personas.json`

Then inspect only the app code and tests required for the selected scenarios.

Before running a pack, declare the target environment in plain English: `dev`, `prod`, or a named test environment. Do not mix evidence from different environments in one report without saying so explicitly.

## Current Resume State

- Start with `dev`. `default_ship` is green there and is the canonical first debug baseline.
- `billing_integration` on `dev` has a green rerun in `qa/runs/2026-03-25-dev-billing-integration-rerun.md`. Use that report as the local billing baseline.
- Move to `prod` second. `default_ship` is now green there too; use `qa/runs/2026-03-25-default-ship-prod-rerun.md` as the current hosted baseline.
- Hosted `billing_integration` now has both the repair report and the automatic post-fix rerun. Read `qa/runs/2026-03-25-prod-billing-integration-webhook-fix.md` first for the misconfig repair, then `qa/runs/2026-03-25-prod-billing-integration-automatic-rerun.md` for the fresh automatic delivery proof.
- The key prod invariants are: Stripe posts to the Convex `.convex.site` webhook URL, production Convex has both `STRIPE_WEBHOOK_SECRET` and `STRIPE_SECRET_KEY`, and a fresh live completed no-cost order can patch or insert a `stripe_webhook` access grant without replay.
- For this repo, prefer a live no-cost Checkout verification using a restricted `100% off` promotion code instead of a real card charge. That proves the webhook/access handoff without treating prod as a card-testing surface.
- Use `qa/runs/` as the durable evidence set and read the latest relevant environment report before rerunning a pack.

## Five Agent Responsibilities

### Scenario Mapper

Read the diff, map the changed files to scenario IDs, and state which packs are affected. Prefer product language over file names. Example: a change in `apps/web/features/product-access/` affects `AUTH-02`, `ACCESS-01`, and `PACKET-01`, not “the access-required component.”

### Test Auditor

Keep `qa/test-inventory.csv` current with the real `apps/web/tests/` tree. Every test file must have one row. If a test only proves implementation details, mark it `merge`, `replace`, or `delete` instead of pretending it is ship-critical journey proof.

Use:

```bash
bun run qa:inventory:sync
bun run qa:validate
```

### Browser Runner

Prepare the needed personas, run the smallest relevant browser surface, and record which scenario IDs were actually exercised.

Use:

```bash
bun run qa:run-pack -- --pack=default_ship --dry-run
PLAYWRIGHT_BASE_URL=<safe_base_url> bun run qa:personas:prepare -- --pack=default_ship
bun run test:browser-smoke
E2E_RUN_SANDBOX=1 PLAYWRIGHT_BASE_URL=<safe_base_url> bun run --cwd apps/web test:e2e:sandbox:default-ship
```

Environment ownership:

- `qa/personas.local.json` supplies the real QA account emails and passwords.
- `apps/web/.env.local` or `QA_ENV_FILE=<path>` supplies the Clerk and Convex environment for provisioning.
- `PLAYWRIGHT_BASE_URL` supplies the browser target.

Pack policy:

- `default_ship`: run `qa:run-pack -- --pack=default_ship` once the environment is ready. This validates the catalog, prepares personas, scaffolds the report, runs browser smoke, and runs the tagged canonical packet-route sandbox spec.
- `extended`: run only the scenarios touched by the diff unless the user asks for a full extended sweep.
- `billing_integration`: run `qa:run-pack -- --pack=billing_integration` only when the environment is explicitly safe for test payments and `QA_ALLOW_BILLING_INTEGRATION=1` is set. The current local rerun is green; if it regresses, first verify that `bun run dev:stripe` is forwarding to `{NEXT_PUBLIC_CONVEX_SITE_URL}/stripe/webhook` before treating it as an app-auth issue. For hosted prod verification, prefer a restricted live `100% off` promotion code so Checkout completes as a no-cost order while still producing `checkout.session.completed` for the webhook grant path.
- Run authenticated sandbox work on local `dev` first. The current green local baseline is `default_ship`; use hosted or prod only after the local path is understood.
- Hosted persona prep must use Clerk env values that match the hosted target. `qa:personas:prepare` and `qa:run-pack` load `apps/web/.env.local` by default; set `QA_ENV_FILE=<path>` or export matching Clerk env vars before targeting prod or any other non-local Clerk instance.
- Workflow order is `dev` first, then `prod`. Use local dev to debug product/runtime issues before collecting hosted ship evidence. Only use `prod` once the local behavior is understood.
- For production QA, prefer the single command `PLAYWRIGHT_BASE_URL=https://www.man-meets-ai.com QA_ENV_FILE=<prod-env-file> bun run qa:run-pack -- --pack=default_ship` so persona prep and both browser lanes use the same target assumptions.

### Gap Reviewer

Read `qa/journeys.csv`, `qa/coverage.csv`, the latest report, and the touched diffs together. Find important scenarios that still have `gap`, `rewrite_required`, low-confidence automation, or no recent browser evidence. Flag the missing proof in product language, not in framework language.

Use:

```bash
bun run qa:validate
```

Then inspect the rows with `gap` or low confidence in `qa/coverage.csv` and compare them against the latest committed run report.

### Release Summarizer

Create or update `qa/runs/YYYY-MM-DD-<slug>.md` using `qa/templates/run-report.md`. List the pack, personas, scenario IDs, commands run, pass/fail findings, and blocked items. If a flow was not executed, say so plainly.

Use:

```bash
bun run qa:ship -- --pack=default_ship --slug=<short-name>
```

That command scaffolds a local report under `qa/runs/local/`. Promote the final report into committed `qa/runs/` only after the evidence is worth keeping.

Every report must include the environment label near the top. Good examples are `Environment: dev-local`, `Environment: prod-www.man-meets-ai.com`, or `Environment: staging-<name>`.

## Operating Rules

- Do not store secrets in `qa/`. Only `qa/personas.local.json` may hold local credentials, and it must stay ignored.
- Do not count a unit test as journey proof if it only checks an internal helper and never validates the user-facing behavior.
- If a current test uses `/mission` or `/artifacts`, mark it `rewrite_required` or `rewrite` unless the actual customer-facing contract still depends on that alias.
- Prefer additive updates. Refresh the inventory, coverage map, and report before deleting legacy tests.
- Run `bun run qa:validate` before concluding any QA control plane change is complete.
- Use `Gap Reviewer` whenever a diff touches release-critical journeys but the coverage map still shows `gap`, `rewrite_required`, or stale browser evidence.
