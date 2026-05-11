---
title: Shipping Evidence CI Baseline
status: complete
created_at: 2026-05-09
completed_at: 2026-05-09
summary: Make the fast CI source gate prove the whole shipped workspace contract while keeping PR checks cheap and deterministic.
post_build_recap: Root scripts and CI now run a cheap whole-repo source gate through `static`, keep `integration` stable, and document the remaining hosted-proof boundaries.
program_id: shipping-evidence-hardening
planning_brief: docs/programs/completed/2026-05-09-shipping-evidence-hardening/planning-brief-1.md
read_when:
  - Reviewing the completed CI and workspace baseline slice.
  - Changing `.github/workflows/ci.yml`, root package scripts, or package workspace validation scripts.
  - Deciding whether a check belongs on every PR or in a later hosted proof slice.
---

# Shipping Evidence CI Baseline

This is a living execution plan for the completed CI and workspace baseline slice of Shipping Evidence Hardening.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The old source gate could pass without proving package workspaces, root script tests, local-runner smoke contracts, or the app's critical coverage gate. Parker needs the required pre-merge checks to answer whether the fast source-level contract for the whole repository passed, while still avoiding expensive hosted Stripe, Vercel, Clerk, Convex, browser, staging, and production preflight work on every pull request.

After this slice, root scripts expose the whole-repo source proof directly, `.github/workflows/ci.yml` keeps the durable `static` and `integration` job names, and the workflow docs state what `static` now proves. The visible result is that `bun run check:source` runs the cheap source gate locally, and the `static` CI job runs the same categories before merge.

## Progress

- [x] 2026-05-09: Created the Shipping Evidence Hardening Program and Planning Brief 1 from the multi-agent research pass.
- [x] 2026-05-09: Added the root `AGENTS.md` feature-risk testing rubric so future features classify P0/P1/P2/P3 risk before choosing test depth.
- [x] 2026-05-09: Created this child ExecPlan for the CI and workspace baseline slice.
- [x] 2026-05-09: Discovered that GitHub branch-protection and ruleset APIs return plan-gated HTTP 403 for this private repository; preserved `static` and `integration`.
- [x] 2026-05-09: Inventoried root, app, and package scripts and timed package typechecks, package tests, root script tests, critical coverage, and local-runner source smokes.
- [x] 2026-05-09: Added root aggregate scripts for package lint, package typecheck, package tests, root script tests, critical coverage, package smoke, worker compatibility smoke, `check:source`, and the expanded root `check`.
- [x] 2026-05-09: Updated `.github/workflows/ci.yml` so `static` runs the whole cheap source gate and `integration` remains the app integration job.
- [x] 2026-05-09: Updated `.github/workflows/README.md` and `docs/release-workflow.md` with the new source-gate contract.
- [x] 2026-05-09: Repaired stale tests and lint/typecheck blockers exposed by the new gate, then ran source, integration, plan, Program, markdown, and diff validation.
- [x] 2026-05-09: Repaired a package-smoke portability blocker exposed by a follow-up `check:source` run: the native pnpm dry-run fixture now supplies a fake `pnpm --version` binary instead of requiring pnpm to be installed on the developer machine.

## Surprises & Discoveries

- 2026-05-09: GitHub branch protection and ruleset reads returned HTTP 403 with the message "Upgrade to GitHub Pro or make this repository public to enable this feature." That is inconclusive for live enforcement, so the implementation preserved the documented required context names.
- 2026-05-09: Recent remote `CI` runs were roughly three to three and a half minutes before this change. The completed local `bun run check:source` proof took about 81 seconds, so adding the source checks is cheap enough for every PR in this repo.
- 2026-05-09: `bun run test:coverage:critical` was fast enough for PR CI but initially failed because checkout, Codex, and product-access tests were stale. The implementation added behavior tests for support-mode blocking, checkout auth token mocking, and checkout recovery branches so the existing coverage thresholds pass.
- 2026-05-09: `bun run test:integration` was already failing on the codebase download route because the route now checks support-mode download policy. The test now mocks that route-policy boundary and asserts the audit calls.
- 2026-05-09: `packages/local-runner/tests/package-smoke.ts` requires `packages/local-runner/dist/cli.js`, which is ignored and absent on clean CI checkouts. The root `test:package-smoke` wrapper now builds `packages/local-runner` before running the package smoke so `static` does not depend on a local artifact.
- 2026-05-09: `packages/local-runner/tests/package-smoke.ts` has a pnpm-owned fixture for package-manager detection. The fixture must provide its own fake pnpm command, because the source gate should not depend on pnpm being installed locally while the installer still blocks real pnpm-owned repos when pnpm is unavailable.
- 2026-05-09: Local production env can make `next build` upload PostHog source maps through `@posthog/nextjs-config`. The source gate now sets `DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1` for the app build, preserving production build validation without making PR proof provider-backed.
- 2026-05-09: Package format checks are still not part of `static`; the source gate keeps the existing app format check and adds package lint, typecheck, tests, and smokes. Package format can be considered in a later cleanup.

## Decision Log

Decision: Preserve the required GitHub check names `static` and `integration`.
Rationale: `.github/workflows/README.md`, `docs/release-workflow.md`, and root `AGENTS.md` already describe those jobs as durable required contexts. Live branch-protection and ruleset reads were plan-gated, so changing check names would risk blocking or weakening merges.
Date: 2026-05-09

Decision: Keep this slice source-level and cheap.
Rationale: Parker explicitly wanted broke-startup-friendly checks. Hosted Stripe, Vercel, Clerk, Convex, browser release proof, staging smoke, and production preflight are valuable, but they belong in later conditional, post-merge, nightly, release, or manual slices.
Date: 2026-05-09

Decision: Start from existing scripts instead of introducing a new runner.
Rationale: The repository already uses Bun workspace scripts, Vitest, oxlint, oxfmt, TypeScript, Playwright, Program lint, ExecPlan lint, and workflow-specific release scripts. The baseline now wires those existing contracts together.
Date: 2026-05-09

Decision: Run both local-runner source smokes on every PR.
Rationale: `package:smoke` and `worker:compatibility-smoke` are source-only, deterministic, and cheap enough locally. They directly protect the shipped CLI and worker-install contract and do not require hosted providers.
Date: 2026-05-09

Decision: Keep package format checks out of this slice.
Rationale: The existing required workflow only checked app formatting. This slice adds package lint, typecheck, tests, and smokes without expanding into unrelated package-format cleanup.
Date: 2026-05-09

## Outcomes & Retrospective

The first Shipping Evidence Hardening slice is complete. Root `package.json` now exposes `lint:app`, `lint:packages`, `typecheck:app`, `typecheck:packages`, `test:packages`, `test:scripts`, `test:package-smoke`, `test:worker-compatibility-smoke`, `check:source`, and a broader `check`. The existing root `lint` now covers app and package lint, and the existing root `typecheck` now covers the app build/typecheck plus package typechecks. `test:package-smoke` builds the ignored local-runner CLI artifact before packing so clean checkouts run the same path as warmed local worktrees.

The `static` job in `.github/workflows/ci.yml` now runs app and package lint, the app format check, package typechecks, app unit tests, app contract tests, package tests, root script tests, critical coverage, package smoke, worker compatibility smoke, and the app build with PostHog source-map upload disabled. The `integration` job remains the app integration suite. The required context names remain `static` and `integration` because live branch-protection discovery was inconclusive.

The implementation also repaired stale source-gate blockers that the new gate exposed: the presentation helper copy assertion, Stripe checkout auth fixture shape, critical coverage for support-mode and checkout recovery branches, the support-mode bar mock in app shell tests, the docs inventory count, no-`unknown` boundary lint violations, and codebase download route support-mode policy mocking.

Hosted Stripe, Vercel, Clerk, Convex, browser proof, staging smoke, production preflight, and generated customer repo clean-room proof remain out of scope for this completed slice and belong to later child ExecPlans.

## Context and Orientation

The repository root is `/Users/bazelrex/Developer/ship-by-sunday`. The root package is a Bun workspace with `apps/web` and `packages/*`. The source workflow is `.github/workflows/ci.yml`; it runs on pull requests into `main`, pushes to `main`, manual dispatch, and a daily schedule.

The current `static` job installs dependencies, runs app and package lint, checks app formatting, typechecks packages, runs app unit tests, app contract tests, package tests, root script tests, app critical coverage, package smoke, worker compatibility smoke, and the app build with PostHog source-map upload disabled. The current `integration` job installs dependencies and runs app integration and integration-ui tests.

The workflow docs live in `.github/workflows/README.md`, and the broader release contract lives in `docs/release-workflow.md`. Both documents name `static` and `integration` as durable merge-gate jobs. Root `AGENTS.md` also names those durable required CI contexts under Release Proof.

The package workspaces are `packages/codebase-compiler`, `packages/codebase-presentation`, and `packages/local-runner`. The root Program for this initiative lives at `docs/programs/completed/2026-05-09-shipping-evidence-hardening/program.md`.

### In Scope

This slice covered the fast source-level CI gate. It added aggregate root scripts, updated `.github/workflows/ci.yml`, updated `.github/workflows/README.md`, updated `docs/release-workflow.md`, repaired tests required to make the existing and new source gates pass, and updated this ExecPlan and its parent Program packet.

It included read-only discovery of live GitHub branch-protection or ruleset enforcement through `gh` commands and recorded that the proof is inconclusive due plan-gated HTTP 403 responses.

### Out Of Scope

This slice did not implement hosted Stripe, Vercel, Clerk, Convex, browser release proof, staging smoke, production preflight, generated customer repo proof, release evidence schema changes, or conditional path detection.

This slice did not introduce a new test runner, package manager, external CI service, or dependency. It did not rename required GitHub status contexts. It did not touch `.worktrees/`.

## Plan of Work

The work first established the actual enforcement and command inventory. `gh api repos/Man-Meets-AI/ship-by-sunday/branches/main/protection` and `gh api repos/Man-Meets-AI/ship-by-sunday/rulesets` returned HTTP 403. `gh run list --repo Man-Meets-AI/ship-by-sunday --workflow ci.yml --limit 10` showed recent CI runs completing successfully in roughly three to three and a half minutes.

The work then benchmarked direct package and root-script checks. Package typechecks were roughly two to three seconds each, package tests ranged from under a second to roughly fourteen seconds, the root Program lint test was under a second, critical coverage was roughly two seconds once fixed, package smoke was roughly four seconds, and worker compatibility smoke was roughly twelve seconds.

The implementation added aggregate root scripts in `package.json`, wired those scripts into `.github/workflows/ci.yml`, and updated `.github/workflows/README.md` and `docs/release-workflow.md`. Stale source-gate blockers were fixed where they affected commands that were already required or newly required by this slice.

## Milestones

Discovery is complete. The live GitHub enforcement surface could not be proven locally because branch-protection and ruleset APIs are plan-gated, so the durable job names remain unchanged.

Local command aggregation is complete. A contributor can run `bun run check:source` from the repository root to execute the cheap source gate without remembering package-specific commands.

CI wiring is complete. The `static` job now runs the whole cheap source gate, and `integration` remains the app integration job.

Documentation and closeout are complete. Workflow docs, release docs, this ExecPlan, and the Program packet now agree on the first source-gate slice.

## Concrete Steps

The completed implementation touched these source surfaces:

    package.json
    .github/workflows/ci.yml
    .github/workflows/README.md
    docs/release-workflow.md
    docs/programs/completed/2026-05-09-shipping-evidence-hardening/program.md

It also repaired source-gate blockers in focused tests and helpers:

    packages/codebase-presentation/tests/codebase-presentation.test.ts
    apps/web/tests/integration/codex-route-handlers.test.ts
    apps/web/tests/integration/stripe-checkout-route.test.ts
    apps/web/tests/integration/codebase-download-routes.test.ts
    apps/web/tests/unit/course-access.test.ts
    apps/web/tests/unit/product-shell.test.tsx
    apps/web/tests/unit/public-content-inventory.test.ts
    apps/web/app/(identity)/_components/sign-in/use-sign-in-flow.ts
    apps/web/platform/billing/checkout/checkout-intent.ts
    packages/local-runner/tests/package-smoke.ts

The key local proof commands were:

    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run check:source
    bun run test:integration

## Validation and Acceptance

This slice is accepted because `bun run check:source` now proves the cheap source contract from the repository root and `.github/workflows/ci.yml` uses the same categories under the durable `static` job. The source-gate app build disables PostHog source-map upload so every-PR proof stays non-provider-backed. `bun run test:integration` proves the separate durable `integration` job.

The docs now say which checks run on every PR and preserve `static` and `integration` as the required context names. The implementation does not claim branch-protection certainty because GitHub APIs were plan-gated.

### Test Commands

Run the aggregate source-gate command created by this slice:

    bun run check:source

Run the integration job that remains separate from `static`:

    bun run test:integration

Validate the plan, Program, docs, and diff:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-09-shipping-evidence-ci-baseline.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-09-shipping-evidence-ci-baseline.md docs/programs/completed/2026-05-09-shipping-evidence-hardening .github/workflows/README.md docs/release-workflow.md AGENTS.md
    git diff --check

## Idempotence and Recovery

All work in this slice is additive or narrow rewiring. Re-running tests, script discovery, and GitHub read-only discovery is safe. `bun run test:package-smoke` writes `packages/local-runner/dist/cli.js`, which is ignored and can be deleted at any time. `bun run check:source` also writes app build output under ignored `.next` paths. If a future package smoke becomes slow or flaky, remove that smoke from PR `static` and document whether it belongs on schedule, manual proof, or a later conditional gate.

If branch-protection discovery remains inconclusive, keep job names unchanged. Do not rename required contexts from local assumptions.

## Artifacts and Notes

Final validation evidence:

    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run check:source
    # passed locally

    bun run test:integration
    # 48 files passed, 235 tests passed

GitHub enforcement discovery result:

    gh: Upgrade to GitHub Pro or make this repository public to enable this feature. (HTTP 403)

That output means the local executor did not prove live required checks. It does not mean checks are absent. Preserve `static` and `integration` unless a future worker has conclusive branch-protection or ruleset visibility and updates docs in the same change.

## Interfaces and Dependencies

This slice depends on Bun `1.3.5`, Node `24.12.0` in GitHub Actions, GitHub Actions, the GitHub CLI for read-only enforcement discovery, root Bun workspace scripts, package workspace scripts, Vitest, TypeScript, oxlint, oxfmt, Next build, Program lint, ExecPlan lint, and markdown lint.

The only external service dependency in this slice is read-only GitHub metadata discovery. No Stripe, Clerk, Convex, Vercel, Playwright browser proof, live production proof, or hosted staging dependency belongs in the every-PR gate created here.
