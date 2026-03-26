# QA Control Plane

This folder is the product-readable source of truth for Ship by Sunday QA. Read this folder before reading `apps/web/tests/` if you need to answer what journeys matter, which personas are required, what should run before ship, and which existing tests are still worth trusting.

The control plane is organized around product journeys first and implementation files second.

- `qa/glossary.md` defines the shared language for journeys, personas, scenario packs, confidence states, and release reports.
- `qa/journeys.csv` is the canonical journey catalog. Each row is a scenario that a PM or agent can reason about without reading code.
- `qa/coverage.csv` maps each scenario ID to the current proving mechanisms and highlights where coverage is trusted, stale, or missing.
- `qa/test-inventory.csv` inventories every file under `apps/web/tests/` and records whether it should be kept, rewritten, merged, replaced, or deleted.
- `qa/personas.json` is the committed non-secret persona protocol. `qa/personas.local.json` is the ignored local credential file used for real browser runs.
- `qa/AGENTS.md` tells agents how to select scenarios from a diff, how to prepare personas, how to run packs, and how to write reports.
- `qa/templates/run-report.md` is the report template for baseline and ship evidence.
- `qa/runs/` stores committed ship evidence. `qa/runs/local/` is ignored scratch space for dry runs.

Start with these commands from the repository root:

```bash
bun run qa:validate
bun run qa:inventory:sync
bun run qa:personas:prepare
bun run qa:run-pack -- --pack=default_ship --dry-run
bun run qa:ship -- --pack=default_ship --slug=baseline
```

`qa:validate` is the fast integrity check. `qa:inventory:sync` refreshes the full-suite inventory from the current `apps/web/tests/` tree. `qa:personas:prepare` provisions the committed personas against the Clerk and Convex environment currently loaded for QA. `qa:run-pack` is the explicit scenario-pack runner for `default_ship`, `extended`, and `billing_integration`. `qa:ship` scaffolds a dated run report for the selected scenario pack so the human runner can record what passed, failed, or remained blocked.

`qa:personas:prepare` and `qa:run-pack` load `apps/web/.env.local` by default. Override that with `QA_ENV_FILE=<path>` when the hosted target uses a different Clerk instance than local. For hosted runs, also pass `PLAYWRIGHT_BASE_URL=<target>` so persona prep can refuse a mismatched Clerk environment before Playwright writes a bad auth state.

## Plain-English QA Map

If you used to manage QA with a spreadsheet, contractors, user personas, and pass/fail notes, this folder is the same system encoded into files and commands.

- `persona` means the test user or account being used for a run.
- `journey` or `scenario` means the user story being proven.
- `pack` means the bundle of scenarios and commands to run together.
- `Playwright` is the browser robot that does the clicking.
- `report` means the saved run evidence under `qa/runs/`.

Rough old-world translation:

- `qa/personas.local.json` replaces the tester login sheet.
- `qa/journeys.csv` replaces the user-story spreadsheet.
- `qa/coverage.csv` replaces the “how do we know this is covered?” notes.
- `qa/test-inventory.csv` replaces the test-catalog tab that says which files still matter.
- `qa/runs/` replaces the dated QA pass/fail reports.

## What The Commands Actually Do

- `bun run qa:validate`
  Checks the QA system itself. This validates the CSVs, persona protocol, and inventory wiring. It does not click through the app.
- `bun run qa:inventory:sync`
  Rebuilds the inventory of every test file under `apps/web/tests/`. Use this when the test tree changes and the inventory needs to catch up.
- `bun run qa:personas:prepare -- --pack=<pack>`
  Makes sure the right QA accounts exist in the current Clerk and Convex environment before browser runs start.
- `bun run test:browser-smoke`
  Runs the quick browser sanity pass. Think: does the app load, do key pages render, is there an obvious runtime failure?
- `bun run qa:run-pack -- --pack=default_ship`
  Runs the orchestrated QA checklist for a named pack. This is the closest replacement for “have a tester click the standard customer flow and tell me whether it is safe.”
- `bun run qa:ship -- --pack=<pack> --slug=<name>`
  Scaffolds the report file where the run evidence gets written down.

## Pack Meanings

- `default_ship`
  Core release pack. This is the main auth, access, and buyer journey. If you only run one serious QA pass before shipping, run this.
- `extended`
  Broader secondary coverage. Useful for confidence and cleanup, but not the first thing to run on every change.
- `billing_integration`
  Payment-specific pack. Run this when checkout, Stripe, billing, or entitlement behavior changed and you need payment-path proof.

## Browser Terms

- `browser smoke`
  Fast, shallow browser check. Good for “is the app basically alive?”
- `sandbox e2e`
  Deeper end-to-end scripted flows in a safe test environment. Good for “can a user actually complete the journey?”
- `Playwright`
  The browser automation tool used for smoke and sandbox runs.
- `green`
  The last known run for that pack and environment passed. It does not mean the whole product is universally safe forever. It means that checklist passed on that target recently.

## When To Run What

- If auth, protected routes, onboarding, or access gates changed:
  Run `bun run qa:validate`, then `bun run qa:personas:prepare -- --pack=default_ship`, then `bun run qa:run-pack -- --pack=default_ship`.
- If public pages, docs surface, or unauthenticated routes changed:
  Run `bun run qa:validate`, then `bun run test:browser-smoke`.
- If checkout, Stripe, billing, or entitlements changed:
  Run `bun run qa:validate`, then `bun run qa:run-pack -- --pack=default_ship`, then `bun run qa:run-pack -- --pack=billing_integration`.

Best mental model:

- `qa:validate` means “is the QA spreadsheet sane?”
- `qa:personas:prepare` means “do we have the right test accounts?”
- `browser-smoke` means “does the app basically work?”
- `default_ship` means “does the main customer journey look ship-safe?”
- `billing_integration` means “does the paid path still work?”

## Current resume state

- Start on `dev` first. `qa/runs/2026-03-25-dev-default-ship.md` is the current green `default_ship` baseline.
- `billing_integration` on `dev` has a green rerun in `qa/runs/2026-03-25-dev-billing-integration-rerun.md`. Use that report as the local Stripe baseline.
- Move to `prod` second for release evidence. `default_ship` is now green there as well; use `qa/runs/2026-03-25-default-ship-prod-rerun.md` as the current hosted baseline.
- Hosted `billing_integration` now has both the repair report and the automatic post-fix rerun: `qa/runs/2026-03-25-prod-billing-integration-webhook-fix.md` plus `qa/runs/2026-03-25-prod-billing-integration-automatic-rerun.md`.
- In this repo, the preferred production proof remains a live no-cost Checkout run using a restricted `100% off` promotion code, because that exercises `checkout.session.completed`, the webhook grant, `/checkout/success`, and `/start` without requiring a real charge.
- Treat `qa/runs/` as the durable evidence set and read the latest relevant report for the target environment before rerunning a pack.

## Fresh-Agent Restart

When a fresh agent needs to resume this workflow, use this order:

1. `bun run qa:validate`
2. Read the latest committed `dev` report first, then the latest matching report for the target environment
3. Decide the target environment before running anything else
4. Run the smallest relevant pack in that environment

Environment order:

- `dev` first for product debugging and auth/runtime fixes
- `prod` second for release evidence
- `billing_integration` only in a confirmed Stripe test environment

Typical dev-first restart:

```bash
bun run dev:full
PLAYWRIGHT_USE_LOCAL_SERVER=1 PLAYWRIGHT_BASE_URL=http://localhost:3000 bun run --cwd apps/web test:browser-smoke
```

Typical hosted evidence run:

```bash
PLAYWRIGHT_BASE_URL=https://www.man-meets-ai.com QA_ENV_FILE=apps/web/.env.production bun run qa:run-pack -- --pack=default_ship
```

Every committed report under `qa/runs/` must say whether it came from `dev`, `prod`, or another explicitly named environment.

Use local `dev` first for authenticated sandbox work. The current green baseline is `default_ship` on local dev. Use hosted or prod second once the local path is understood.
For local Stripe billing reruns, make sure `.env.local` contains `NEXT_PUBLIC_CONVEX_SITE_URL` and that `bun run dev:stripe` is forwarding to `{NEXT_PUBLIC_CONVEX_SITE_URL}/stripe/webhook`.

## Environment sources

Three inputs control authenticated QA:

- `qa/personas.local.json` holds the real QA email and password pairs.
- `apps/web/.env.local` or `QA_ENV_FILE=<path>` chooses which Clerk and Convex environment those personas are provisioned against.
- `PLAYWRIGHT_BASE_URL=<target>` chooses which site the browser pack opens.

The credentials in `qa/personas.local.json` are not tied to one fixed environment. The selected Clerk secret key decides which Clerk instance receives or reuses those identities. That is why production QA must load production Clerk env values before persona prep.

Hosted production example:

```bash
PLAYWRIGHT_BASE_URL=https://www.man-meets-ai.com QA_ENV_FILE=apps/web/.env.production bun run qa:run-pack -- --pack=default_ship
```

If the loaded Clerk env does not match the hosted target, `qa:personas:prepare` now fails before Playwright writes storage state. Treat that as an env-parity problem, not a route bug.
