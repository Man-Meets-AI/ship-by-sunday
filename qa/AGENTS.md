# QA Agent Workflow

Use this file whenever a task changes routes, auth behavior, entitlement behavior, checkout behavior, browser QA, or ship-readiness evidence.

This folder is the canonical QA control plane. Do not invent alternate scenario lists in a skill folder, a PR comment, or a one-off script. Update the files in `qa/` directly.

In phase 1, the main user-facing behavior is `QA Lead`. The specialist roles below are support roles that the lead may use when they materially improve the review. A normal “go talk to our QA team” request should come back as one consolidated verdict, not a committee memo.

Phase 2 delegation stance: for material reviews, the lead should no longer guess about whether to fan out. Use the deterministic specialist pattern below unless the request is truly lightweight.

## Read Order

Read these files in order before changing QA decisions:

1. `qa/README.md`
2. `qa/glossary.md`
3. `qa/journeys.csv`
4. `qa/coverage.csv`
5. `qa/test-inventory.csv`
6. `qa/personas.json`

Then inspect only the app code and tests required for the selected scenarios.

Before running a pack, declare the target environment in plain English: `feature branch`, `dev`, `prod`, `main`, or a named test environment. Do not mix evidence from different environments in one report without saying so explicitly.

Branch lifecycle is part of the QA contract:

- feature branches are preview-only and should stay on dry-run QA or focused proof
- `dev` is the integrated staging branch where the full buyer flow is first proven
- `main` is production, so release evidence must match the `dev -> main` promotion path

## Current Resume State

- Feature branches get only preview-safe QA. Use dry-run `default_ship` or focused tests, never real billing proof.
- Start with `dev`. `qa/runs/2026-03-26-dev-default-ship-local-auth.md` is the current green `default_ship` baseline and is the canonical first debug baseline.
- `billing_integration` on `dev` has a green rerun in `qa/runs/2026-03-25-dev-billing-integration-rerun.md`. Use that report as the local billing baseline.
- Move to `prod` second. `default_ship` is now green there too; use `qa/runs/2026-03-25-default-ship-prod-rerun.md` as the current hosted baseline.
- Hosted `billing_integration` now has both the repair report and the automatic post-fix rerun. Read `qa/runs/2026-03-25-prod-billing-integration-webhook-fix.md` first for the misconfig repair, then `qa/runs/2026-03-25-prod-billing-integration-automatic-rerun.md` for the fresh automatic delivery proof.
- The key prod invariants are: Stripe posts to the Convex `.convex.site` webhook URL, production Convex has both `STRIPE_WEBHOOK_SECRET` and `STRIPE_SECRET_KEY`, and a fresh live completed no-cost order can patch or insert a `stripe_webhook` access grant without replay.
- For this repo, prefer a live no-cost Checkout verification using a restricted `100% off` promotion code instead of a real card charge. That proves the webhook/access handoff without treating prod as a card-testing surface.
- Use `qa/runs/` as the durable evidence set and read the latest relevant environment report before rerunning a pack.

## QA Lead

Read the QA control plane in the documented order before app code. Start advisory-first: map the feature to journeys, inspect current proof, identify missing proof, and recommend the smallest next run.

Use:

```bash
bun run qa:validate
bun run qa:run-pack -- --pack=default_ship --dry-run
bun run --cwd apps/web test:integration:ui -- tests/integration-ui/<focused-test>.test.tsx
```

Default safe local auto-run budget:

- `bun run qa:validate`
- `bun run qa:run-pack -- --pack=<pack> --dry-run`
- directly relevant focused `vitest` runs

Do not automatically run full browser packs, billing flows, or canonical `qa/` truth writes during an ordinary review request. If the user explicitly asks for browser execution and the environment is safe, the lead may use `Browser Runner`. If inventory or coverage updates are needed, the lead may prepare exact edits, but it must ask for confirmation before applying changes to canonical files such as `qa/coverage.csv` or `qa/test-inventory.csv`.

The lead’s answer should cover:

- affected journeys
- current proof
- missing proof
- recommended runs
- findings
- release confidence

Material review specialist pattern:

- Use `Scenario Mapper`, `Coverage Analyst`, and `Gap Reviewer` in parallel for feature diff reviews, multi-journey reviews, or any review substantial enough to justify a local review artifact.
- Add `Browser Runner` only when the user explicitly asks for browser execution and the environment is declared safe.
- Add `Release Summarizer` after any command-backed review, browser run, or material review where the final verdict should separate proven behavior from missing proof.
- If specialist inputs disagree, keep the answer consolidated and choose the more conservative confidence call.

## Phase 1 Support Roles

### Scenario Mapper

Read the diff, map the changed files to scenario IDs, and state which packs are affected. Prefer product language over file names. Example: a change in `apps/web/features/product-access/` affects `AUTH-02`, `ACCESS-01`, and `PACKET-01`, not “the access-required component.”

### Coverage Analyst

Keep `qa/test-inventory.csv` current with the real `apps/web/tests/` tree and compare it against `qa/coverage.csv` when proof strength drifts. Every test file must have one row. If a test only proves implementation details, mark it `merge`, `replace`, or `delete` instead of pretending it is ship-critical journey proof.

Use:

```bash
bun run qa:inventory:sync
bun run qa:validate
```

`qa:inventory:sync` preserves curated rows for unchanged files and only uses filename heuristics to seed genuinely new files. If a meaningful mapping still degrades after sync, stop and repair the control plane before concluding the review.

Do not silently apply canonical inventory or coverage edits during an ordinary QA-team review. Prepare the exact change and ask for confirmation first.

### Browser Runner

Prepare the needed personas, run the smallest relevant browser surface, and record which scenario IDs were actually exercised. This role is opt-in in phase 1. Use it only when the user explicitly asks for browser execution and the environment is declared safe.

Use:

```bash
bun run qa:run-pack -- --pack=default_ship --dry-run
PLAYWRIGHT_BASE_URL=<safe_base_url> bun run qa:personas:prepare -- --pack=default_ship
bun run test:browser-smoke
bunx vitest run --project integration-ui tests/integration-ui/packet-start-page.test.tsx tests/integration-ui/packet-stage-page.test.tsx tests/integration-ui/packet-review-page.test.tsx tests/integration-ui/packet-stage-sidebar.test.tsx
E2E_RUN_SANDBOX=1 PLAYWRIGHT_BASE_URL=<safe_base_url> bun run --cwd apps/web test:e2e:sandbox:default-ship
PLAYWRIGHT_BASE_URL=<safe_base_url> bun run --cwd apps/web test:e2e:local-auth:default-ship
```

Environment ownership:

- `qa/personas.local.json` supplies the real QA account emails and passwords.
- `apps/web/.env.local` or `QA_ENV_FILE=<path>` supplies the Clerk and Convex environment for provisioning.
- `PLAYWRIGHT_BASE_URL` supplies the browser target.

Pack policy:

- `default_ship`: run `qa:run-pack -- --pack=default_ship` once the environment is ready on `dev` or production release verification. On feature branches, use only `--dry-run` plus focused tests. This validates the catalog, prepares personas, scaffolds the report, runs browser smoke, runs the packet integration-ui suite, and runs the tagged canonical packet-route sandbox spec.
- For packet-funnel diffs, the packet integration-ui suite is required because it directly proves the stacked Start page, the routed workbench, the Continue-only save and validation flow, and the Review unlock hierarchy.
- On local dev, prefer the local-auth default-ship lane when sandbox auth is not active. It reuses the same prepared personas and storage-state bootstrap but does not depend on the sandbox gate.
- `extended`: run only the scenarios touched by the diff unless the user asks for a full extended sweep.
- `billing_integration`: run `qa:run-pack -- --pack=billing_integration` only on `dev` or production release verification when the environment is explicitly safe for test payments and `QA_ALLOW_BILLING_INTEGRATION=1` is set. Do not run it on ordinary feature branches. On local targets, the pack now records `bun run stripe:dev:doctor` as a warning-only preflight and then runs `bun run stripe:dev:verify` after the sandbox billing flow as the hard Stripe-to-Convex proof. A warning about the pinned Stripe CLI project `ship-by-sunday` should be fixed, but it should not override a passing billing handoff by itself. If the pack still regresses, first verify that `bun run dev:stripe` is forwarding to `{NEXT_PUBLIC_CONVEX_SITE_URL}/stripe/webhook` before treating it as an app-auth issue. For hosted prod verification, prefer a restricted live `100% off` promotion code so Checkout completes as a no-cost order while still producing `checkout.session.completed` for the webhook grant path.
- Run authenticated sandbox work on local `dev` first. The current green local baseline is `default_ship`; use hosted or prod only after the local path is understood.
- If the sandbox Playwright lane exits with all tests skipped, treat that as missing browser evidence, not as a green pass. Record the skipped state explicitly in the report and call out why the auth environment was inactive.
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

- Use `QA Lead` as the default user-facing role. Treat the other roles as optional helpers behind the scenes.
- Do not store secrets in `qa/`. Only `qa/personas.local.json` may hold local credentials, and it must stay ignored.
- Do not count a unit test as journey proof if it only checks an internal helper and never validates the user-facing behavior.
- If a current test uses `/mission` or `/artifacts`, mark it `rewrite_required` or `rewrite` unless the actual customer-facing contract still depends on that alias.
- Prefer additive updates. Refresh the inventory, coverage map, and report before deleting legacy tests.
- Do not update canonical `qa/` truth files during an ordinary QA-team interaction without explicit confirmation.
- Run `bun run qa:validate` before concluding any QA control plane change is complete.
- Use `Gap Reviewer` whenever a diff touches release-critical journeys but the coverage map still shows `gap`, `rewrite_required`, or stale browser evidence.
