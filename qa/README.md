# QA Control Plane

This folder is the product-readable source of truth for Ship by Sunday QA. Read this folder before reading `apps/web/tests/` if you need to answer what journeys matter, which personas are required, what should run before ship, and which existing tests are still worth trusting.

For incident capture, webhook verification, and manual status control, use [docs/internal/observability.md](../docs/internal/observability.md) as the operational drill instead of duplicating that flow here.

The control plane is organized around product journeys first and implementation files second.

- `qa/glossary.md` defines the shared language for journeys, personas, scenario packs, confidence states, and release reports.
- `qa/journeys.csv` is the canonical journey catalog. Each row is a scenario that a PM or agent can reason about without reading code.
- `qa/coverage.csv` maps each scenario ID to the current proving mechanisms and highlights where coverage is trusted, stale, or missing.
- `qa/test-inventory.csv` inventories every file under `apps/web/tests/` and records whether it should be kept, rewritten, merged, replaced, or deleted.
- `qa/personas.json` is the committed non-secret persona protocol. `qa/personas.local.json` is the ignored local credential file used for real browser runs.
- `qa/AGENTS.md` tells agents how to select scenarios from a diff, how to prepare personas, how to run packs, and how to write reports.
- `qa/templates/run-report.md` is the report template for baseline and ship evidence.
- `qa/templates/team-review.md` is the template for material QA-team review artifacts.
- `qa/reviews/README.md` explains local review artifacts under `qa/reviews/local/`.
- `qa/runs/` stores committed ship evidence. `qa/runs/local/` is ignored scratch space for dry runs.
- `.codex/config.toml` plus `.codex/agents/*.toml` define the repo-scoped lead-first QA role layer for Codex.
- `.agents/skills/qa-team/SKILL.md` is the natural-language QA-team entrypoint. It orchestrates the lead-first workflow but does not replace `qa/` as the source of truth.

Branch lifecycle is part of the QA contract:

- feature branches are preview-only and should use dry-run QA or focused proof, not real billing runs
- `dev` is the integrated staging branch and the first place to prove the full buyer flow
- `main` is production, so release evidence must line up with the `dev -> main` promotion path

Start with these commands from the repository root:

```bash
bun run qa:validate
bun run qa:inventory:sync
bun run qa:team -- --slug=feature-name --base=main --dry-run
bun run qa:personas:prepare
bun run qa:run-pack -- --pack=default_ship --dry-run
bun run qa:ship -- --pack=default_ship --slug=baseline
```

`qa:validate` is the fast integrity check for the QA control plane and the checked-in QA-team assets. `qa:inventory:sync` refreshes the full-suite inventory from the current `apps/web/tests/` tree while preserving curated rows for unchanged files. `qa:inventory:check` is the CI-facing guard that reruns inventory sync and fails if `qa/test-inventory.csv` would change. `qa:team` scaffolds a local review artifact for a material feature review. `qa:personas:prepare` provisions the committed personas against the Clerk and Convex environment currently loaded for QA. `qa:run-pack` is the explicit scenario-pack runner for `default_ship`, `extended`, and `billing_integration`. On local `billing_integration` targets it now records the pinned Stripe guardrail doctor as a warning-only preflight and runs `stripe:dev:verify` as the hard post-checkout proof. On `www.man-meets-ai.com`, the billing pack switches to the dedicated hosted verifier instead of the sandbox browser lane. `qa:ship` scaffolds a dated run report for the selected scenario pack so the human runner can record what passed, failed, or remained blocked.

If you want the fast local developer gate before handing a branch to QA, use `bun run hooks:install` once, then rely on `git commit` to run `bun run precommit` and `git push` to run `bun run prepush`. Those are separate repo-level checks, not QA packs.

Pack placement by branch:

- `default_ship` is the release-critical pack. On feature branches, run it only as `--dry-run` or through focused supporting tests. On `dev`, it is the standard integrated staging proof. On `main` or production, it is the release-evidence pack that should already be green before or after the merge depending on the change.
- `billing_integration` belongs on `dev` and production release verification, not on ordinary feature branches. Use it when checkout, Stripe, entitlement, or webhook behavior changed and the environment is explicitly safe for test payments. On `dev` and `main`, the repository should decide this from the changed files instead of a manual opt-in checkbox.

The QA team is lead-first and chat-first. The natural interaction is: “go talk to our QA team about this feature.” `qa_lead` is still the main QA mind, but material reviews now use a deterministic specialist pattern instead of ad hoc fan-out. For feature diff reviews and other substantial requests, the lead should pull in `journey_mapper`, `coverage_analyst`, and `gap_reviewer` before writing the final verdict. `bun run qa:team` is still a support scaffold for material reviews, not the main product experience.

Default safe local auto-run budget for the lead:

- `bun run qa:validate`
- `bun run qa:run-pack -- --pack=<pack> --dry-run`
- directly relevant focused `vitest` runs

Canonical `qa/` truth writes such as `qa/coverage.csv` or `qa/test-inventory.csv` still require explicit confirmation before they are applied. Browser execution is still opt-in: the lead should use existing pack commands and only run them when the user explicitly asks for browser QA and the target environment is safe.

Current delegation pattern:

- Advisory material review: `journey_mapper` + `coverage_analyst` + `gap_reviewer`
- Explicit safe browser execution: add `browser_runner`
- Command-backed or report-worthy verdict: add `release_summarizer`

For blueprint-funnel work, `default_ship` should not rely on browser lanes alone. The pack now needs the blueprint integration-ui proof suite for `/blueprint`, `/review`, and the legacy redirect map because those tests are first-class proof for the current canonical workspace contract.

On local dev, the preferred authenticated browser proof is now the local-auth lane rather than the sandbox-only gate. Use `PLAYWRIGHT_BASE_URL=http://localhost:3000 bun run --cwd apps/web test:e2e:local-auth:default-ship` when you need the protected blueprint funnel on the running local stack.

`qa:personas:prepare` and `qa:run-pack` load `apps/web/.env.local` by default. Override that with `QA_ENV_FILE=<path>` when the hosted target uses a different Clerk instance than local. For hosted runs, also pass `PLAYWRIGHT_BASE_URL=<target>` so persona prep can refuse a mismatched Clerk environment before Playwright writes a bad auth state.
In CI and repo-root commands, `QA_ENV_FILE` is resolved from the repository root. Production runs should use `QA_ENV_FILE=apps/web/.env.production`, not a path relative to `apps/web/`.
Production bootstrap can derive `CONVEX_DEPLOYMENT` from `NEXT_PUBLIC_CONVEX_URL` when the env file omits it, so hosted production env files do not need a separate deployment name just to let Playwright seed or reset QA state.

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
  Checks the QA system itself. This validates the CSVs, persona protocol, inventory wiring, repo-scoped QA role files, and the shared QA-team skill. It does not click through the app.
- `bun run qa:inventory:sync`
  Refreshes the inventory of every test file under `apps/web/tests/`. It preserves curated rows for unchanged files and only seeds new rows for newly discovered tests.
- `bun run qa:inventory:check`
  Re-runs inventory sync and fails if `qa/test-inventory.csv` would change. CI should use this so inventory drift fails on a pull request before it blocks a release workflow.
- `bun run qa:team -- --slug=<feature-slug> --base=<ref>`
  Scaffolds a local review artifact under `qa/reviews/local/` so a material QA-team review has a stable diff summary and note-taking surface.
  Add `--review-mode=command-backed --environment=<env>` when the review already includes real command output and should expect `release_summarizer` to help with the final verdict.
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
  Core release pack. This is the main auth, access, and buyer journey. If you only run one serious QA pass before shipping, run this. It should include browser smoke, the blueprint integration-ui suite, and the tagged sandbox blueprint-route run.
- `extended`
  Broader secondary coverage. Useful for confidence and cleanup, but not the first thing to run on every change.
- `billing_integration`
  Payment-specific pack. Run this when checkout, Stripe, billing, or entitlement behavior changed and you need payment-path proof. On local targets, the pack now warns if the pinned Stripe CLI project `ship-by-sunday` drifted and then uses `stripe:dev:verify` to prove the real Stripe-to-Convex handoff after checkout.

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

- Feature branches:
  Run `bun run qa:validate`, then `bun run qa:run-pack -- --pack=default_ship --dry-run`, plus the smallest focused tests needed for the diff.
- `dev`:
  Run `bun run qa:validate`, then `bun run qa:personas:prepare -- --pack=default_ship`, then `bun run qa:run-pack -- --pack=default_ship`. Add `billing_integration` when checkout, Stripe, billing, entitlement, or webhook behavior changed. In GitHub Actions on `dev`, that billing decision should come from the release-scope detector automatically, the workflow should auto-bind `dev.man-meets-ai.com` to the exact ready preview deployment, and hosted Convex dev should sync automatically when the release touched `apps/web/convex/`.
- `main` or production:
  Use the same `default_ship` evidence, then add `billing_integration` or the live no-cost Checkout proof when the release changed the commercial path. In GitHub Actions on `main`, `Production Release Proof` should run the same logic automatically after the deploy settles.
- If public pages, docs surface, or unauthenticated routes changed:
  Run `bun run qa:validate`, then `bun run test:browser-smoke`.

Best mental model:

- `qa:validate` means “is the QA spreadsheet sane?”
- `qa:personas:prepare` means “do we have the right test accounts?”
- `browser-smoke` means “does the app basically work?”
- `default_ship` means “does the main customer journey look ship-safe?”
- `billing_integration` means “does the paid path still work?”

Important: a Playwright run that exits `0` with every test skipped is not browser evidence. Treat “all skipped” as missing proof and call that out explicitly in the report.

## Current resume state

- Start on `dev` first. The latest green integrated staging proof is GitHub Actions run `23865552478` on commit `2b5eccf85141ad90ef2b8af4b85bda4804491189`, and it passed `release_scope`, `default_ship`, forced `billing_integration`, and `release_gate`.
- Move to `prod` second for release evidence. The latest green production proof is GitHub Actions run `23867770574` on commit `92da71a5218440030828d2b36bfab76a41993b79`, and the matching green Convex production deploy is `23867770585`.
- `qa/runs/2026-04-01-release-proof-final-green.md` is the durable report for that final April 1 release state.
- In this repo, the preferred production proof remains a live no-cost Checkout run using a restricted `100% off` discount, because that exercises `checkout.session.completed`, the webhook grant, `/checkout/success`, and `/blueprint` without requiring a real charge.
- On `https://www.man-meets-ai.com`, `qa:run-pack -- --pack=billing_integration` should use the dedicated hosted verifier that creates the live Checkout Session directly with a fresh one-time 100%-off coupon already attached. Do not make the production gate depend on typing a promotion code into Stripe’s hosted UI.
- Before hosted billing proof starts on `dev` or `main`, verify the managed Stripe env and the deployed `/api/stripe/checkout` route against the target host so stale price or product IDs fail fast.
- Treat `qa/runs/` plus the latest GitHub Actions run IDs as the durable evidence set and read the latest relevant report for the target environment before rerunning a pack.

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
PLAYWRIGHT_BASE_URL=http://localhost:3000 bun run --cwd apps/web test:e2e:local-auth:default-ship
```

Typical hosted evidence run:

```bash
PLAYWRIGHT_BASE_URL=https://www.man-meets-ai.com QA_ENV_FILE=apps/web/.env.production bun run qa:run-pack -- --pack=default_ship
```

Every committed report under `qa/runs/` must say whether it came from `dev`, `prod`, or another explicitly named environment.

Use local `dev` first for authenticated sandbox work. The current green baseline is `default_ship` on local dev. Use hosted or prod second once the local path is understood.
For local Stripe billing reruns, make sure `.env.local` contains `NEXT_PUBLIC_CONVEX_SITE_URL`, `bun run dev:stripe` is forwarding to `{NEXT_PUBLIC_CONVEX_SITE_URL}/stripe/webhook`, and the pinned Stripe CLI profile `ship-by-sunday` passes `bun run stripe:dev:doctor` or at least explains its warning clearly.

For blueprint-focused QA on local dev, the concrete behaviors worth checking are:

- `/blueprint` is the canonical protected entry and shows the combined intake plus overview/video block
- the one-page blueprint uses Continue-only save feedback and one primary `Continue to Review` action
- legacy `/start`, `/product/*`, `/design/*`, `/marketing/*`, and `/build-plan/*` URLs redirect into `/blueprint` anchors
- `/review` keeps the Blueprint primary and delays the full `Execute / Ship` surface until after the download moment

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
