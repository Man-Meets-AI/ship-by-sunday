---
title: Ship By Sunday Codex Release Reset Planning Brief 6
program_id: sbs-codex-release-reset
brief_version: 6
status: superseded
summary: Make browser-harness proof migration the next child slice after helper CLI retirement landed.
read_when:
  - Writing the sixth child ExecPlan for the Codex release reset Program.
  - Replacing browser-smoke or sandbox e2e proof with source-level and release-scoped proof.
  - Checking boundaries before deleting QA control-plane files, run packs, or browser harness artifacts.
---

# Ship By Sunday Codex Release Reset Planning Brief 6

## Planning Refresh

## What Changed

The fifth child ExecPlan is complete at `docs/exec-plans/completed/2026-04-24-retire-the-helper-cli.md`. It removed `packages/ship-by-sunday-cli/`, `bin/sbs`, root `sbs` and `sbs:check` scripts, the `cli` CI job, active helper CLI docs, and public docs navigation. Root `check` now runs the web app check directly.

The helper CLI was deleted rather than migrated because fresh import-direction proof showed `apps/web` and `packages/codebase-compiler` do not import the CLI. The CLI imported `packages/codebase-compiler`, so compiler-owned generation behavior survived without moving CLI code.

Validation for Plan 5 passed: focused compiler lint/format/typecheck/tests, release manifest/evidence checks, workflow YAML parsing, format, lint, typecheck, plan lint, markdown lint, Program lint, `git diff --check`, helper-reference grep audits, and extra `bun run check`.

Live branch protection still reported the stale `cli` required context on both `dev` and `main` during read-only inspection. The Plan 5 grill explicitly said not to mutate remote protection from a dirty local checkout before the workflow deletion is pushed, so `docs/release-workflow.md` now records exact post-merge `gh api --method PATCH` commands to remove only that stale context while keeping `static`, `integration`, and `browser-smoke`.

## What Still Holds

The nine-plan split still holds. Plans 1 through 5 are complete. Plan 6 is now next because the helper CLI is gone and the remaining bulky proof surface is browser and QA-pack proof.

The Program direction is not "delete all browser proof blindly." Ship by Sunday is a hosted Vercel, Convex, Stripe, and Clerk product, so some hosted proof remains release-scoped. The migration goal is to replace broad browser harnesses as ordinary PR truth with source-level tests and smaller release-scoped hosted checks.

Source-level tests should be preserved. The test research classified most unit and integration tests as worth keeping. Browser-smoke, sandbox e2e, generated auth failure artifacts, and stale route/autosave tests need replacement coverage or deletion decisions, not a bulk purge.

QA control-plane retirement is still downstream. Plan 6 may update transitional QA inventory references for touched browser tests, but it must not delete `qa/` journeys, coverage, run reports, personas, QA agents, or `qa:run-pack` as a system. That belongs to Plan 7.

## Boundary Changes

Plan 6 should be titled `Replace Browser Harness Proof With Source And Release Proof`.

The next slice should first inventory browser and e2e proof surfaces, source-level coverage that already replaces them, and gaps named by the research: robots/sitemap, signed-out `/codebase`, entitled `/codebase -> /review -> /settings`, checkout success paid handoff, metadata/noindex rendered HTML, and QA inventory references for any removed harness files.

The next slice may add or adjust unit/integration/integration-ui tests under `apps/web/tests/` to cover behavior currently proved only by browser-smoke or sandbox e2e. It may remove or demote browser harness files only after replacement proof lands and the plan records the replacement.

The next slice may update `.github/workflows/ci.yml`, `apps/web/playwright.config.ts`, `qa/README.md`, `qa/test-inventory.csv`, `qa/coverage.csv`, `docs/release-workflow.md`, and public docs only where browser proof truth changes. It should preserve release workflows, release helpers, release manifests, helper CLI deletion, and the post-merge branch-protection command from Plan 5.

The next slice must not delete QA control-plane files, remove `qa:run-pack`, delete QA personas, delete run reports, remove release-critical helpers, change tag-release semantics, add CODEOWNERS, add broad GitHub automation, rotate credentials, or perform final docs archive cleanup.

## Dependency Changes

Plan 5 unblocked Plan 6 because the required-check model no longer carries the helper CLI locally. The remaining required checked-in contexts are `static`, `integration`, and `browser-smoke` until Plan 6 proves a replacement for browser proof or deliberately leaves browser-smoke as release-scoped proof.

Plan 6 should not assume live branch protection has already removed the stale `cli` context. It should read checked-in workflow truth and record live policy only if branch protection affects the validation path.

Plan 7 depends on Plan 6. Disposable QA control-plane cleanup should wait until Plan 6 records which browser-pack behaviors are preserved by source-level tests, which hosted proof remains, and which browser harness files were safely removed or retained.

## Next Plan Recommendation

Exact next plan title: `Replace Browser Harness Proof With Source And Release Proof`.

Exact scope: inventory current browser-smoke, sandbox e2e, and QA-pack proof; map each behavior to existing source-level tests or missing replacement coverage; add focused source-level or local integration coverage for the replacement gaps; remove or demote only browser harness files whose behavior is now covered elsewhere; and update checked-in proof documentation and QA inventory truth.

Exact implementation boundaries: start with read-only mapping. Do not delete browser files until each deleted behavior has a named replacement test or an explicit decision that hosted release proof remains the owner. Preserve `qa:run-pack`, QA personas, release helpers, release manifests, and workflows unless a browser-proof reference must change.

Exact validation boundaries: run focused source tests for each replacement, browser-smoke or sandbox proof if any browser harness remains or changes, workflow YAML parsing if workflows change, `bun run format`, `bun run lint`, `bun run typecheck`, plan lint, markdown lint for touched docs, Program lint, and grep/diff checks proving no stale browser-proof claims remain in active docs.

Why it is next now: the Program has reconciled proof truth, defined release identity, relocated release helpers, implemented tag release evidence, and retired the helper CLI. Browser proof is now the next oversized release surface that must be replaced or narrowed before disposable QA control-plane cleanup can be safe.

## Risks To Carry Forward

Deleting browser harness files before replacement coverage lands can lose route, auth, checkout, entitlement, robots/sitemap, and metadata/noindex proof.

Moving all browser proof into source tests would be too aggressive. Hosted proof still matters for production auth, checkout, entitlement, Vercel, Convex, and billing.

Leaving `browser-smoke` as a required context while deleting its workflow or tests would recreate the stale `cli` failure mode. Required-check changes must stay aligned with checked-in workflows and live branch protection.

QA inventory and coverage files can become misleading if browser files move or disappear without row updates.

Generated or vendor browser artifacts should not drive the plan. Focus on active app-owned browser-smoke, sandbox e2e, QA-pack, and release-proof surfaces.
