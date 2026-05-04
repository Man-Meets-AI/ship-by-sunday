---
title: Ship By Sunday Codex Release Reset Planning Brief 7
program_id: sbs-codex-release-reset
brief_version: 7
status: superseded
summary: Make disposable QA control-plane retirement the next child slice after browser-smoke was replaced by source proof.
read_when:
  - Writing the seventh child ExecPlan for the Codex release reset Program.
  - Retiring QA inventories, run-pack orchestration, personas, reports, or QA-team surfaces.
  - Checking boundaries before deleting hosted release proof, sandbox e2e, or release-critical helpers.
---

# Ship By Sunday Codex Release Reset Planning Brief 7

## Planning Refresh

## What Changed

The sixth child ExecPlan is complete at `docs/exec-plans/completed/2026-04-24-replace-browser-harness-proof-with-source-and-release-proof.md`. It removed the shallow `browser-smoke` PR lane from checked-in code by deleting `apps/web/tests/browser-smoke/app-smoke.spec.ts`, removing the `browser-smoke` Playwright project, removing root and app browser-smoke package scripts, removing the `browser-smoke` CI job, and updating active docs and QA inventory references.

Public homepage, crawl, sitemap, robots, route noindex, docs/blog metadata, and checkout-success recovery proof now lives in source-level unit and integration-ui tests. The new source proof also exposed and fixed a protected-route crawl gap by adding `/codebase` to the robots disallow list.

The sixth child intentionally retained `sandbox-e2e`, `auth-protection.sandbox.spec.ts`, `buyer-handoff.sandbox.spec.ts`, `qa:run-pack`, QA personas, QA inventories, QA reports, and hosted `default_ship` and `billing_integration` release proof workflows. Those surfaces are now the main remaining bespoke QA control plane.

Validation for Plan 6 passed with focused source tests, integration-ui tests, `qa:run-pack -- --pack=default_ship --dry-run`, `qa:validate`, sandbox e2e listing, workflow YAML parsing, release evidence build, `bun run format`, `bun run lint`, `bun run typecheck`, plan lint, markdown lint, Program lint, and diff hygiene. `qa:inventory:check` fails before commit only because the intended inventory diff is uncommitted; the generator was proven idempotent by diffing before and after `node qa/scripts/generate-test-inventory.mjs`.

## What Still Holds

The nine-plan split still holds. Plans 1 through 6 are complete. Plan 7 is now next because release helpers have moved out of `qa/scripts`, helper CLI proof is gone, and shallow browser-smoke proof has been replaced by source tests.

The Program direction is still not "delete every hosted proof path." Ship by Sunday remains a hosted Vercel, Convex, Stripe, and Clerk product. Auth, entitlement, checkout, billing, Vercel deployment identity, and Convex deployment identity still need release-scoped hosted proof until a stronger replacement exists.

The release and intake control-plane repair work remains deferred to the separate active plan at `docs/exec-plans/active/2026-04-23-repair-release-intake-control-plane.md`. Plan 7 must not absorb release-intake correctness, runtime-intake grouping, or engineering-intake contract repair.

Source-level tests should continue to survive. Plan 7 is about retiring disposable QA orchestration and evidence bookkeeping, not deleting unit, integration, integration-ui, sandbox, release, or hosted verifier tests without replacement.

## Boundary Changes

Plan 7 should be titled `Retire Disposable QA Control Plane`.

The next slice should first inventory every remaining QA-owned surface and classify it as release proof, source-test inventory bookkeeping, persona/bootstrap machinery, run-report archive, QA-team orchestration, or plain documentation. The inventory must include root `qa:*` package scripts, `.github/workflows/ci.yml`, `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, `.github/workflows/sandbox-e2e-nightly.yml`, `qa/scripts/*`, `qa/*.csv`, `qa/personas*.json`, `qa/runs/`, `qa/templates/`, `qa/reviews/`, `qa/AGENTS.md`, `qa/README.md`, `.agents/skills/qa-team/SKILL.md`, and active public docs that still instruct operators to run `qa:run-pack`.

The next slice may delete or archive QA journeys, coverage, test inventory, QA validation, inventory generation, committed run reports, local report scaffolding, QA-team review scaffolding, and QA-specific docs only after active workflows, root scripts, and release docs no longer depend on them.

The next slice may replace hosted `qa:run-pack` workflow calls with narrower release-owned scripts or direct app Playwright commands if the new command surface preserves the same hosted `default_ship` and `billing_integration` proof semantics and keeps persona secrets out of source control.

The next slice must not remove hosted release proof, billing-sensitive production proof, sandbox e2e specs, Playwright auth bootstrap, release evidence artifacts, `release.json`, tag-release workflows, release-critical helpers under `scripts/release/`, release snapshot fallback, branch-protection cleanup commands, GitHub policy automation, CODEOWNERS, credential rotation, or final docs archive cleanup unless the ExecPlan explicitly proves those exact changes are necessary for QA retirement.

## Dependency Changes

Plan 6 unblocked Plan 7 because browser-smoke is no longer a checked-in branch-required proof lane. Plan 7 can now focus on the QA control plane itself instead of mixing QA deletion with browser-proof replacement.

Plan 7 depends on the completed release-helper relocation from Plan 3. If any `qa/scripts` file still owns release-critical behavior during inventory, the plan must stop and either move that behavior into an existing release-owned boundary with focused tests or mark it as out of scope for a separate release-intake repair.

Plan 8 still depends on Plan 7. GitHub policy and Codex automation should describe the final release and QA model, not the current transitional `qa:run-pack` control plane.

Plan 9 still depends on Plans 7 and 8. Final docs cleanup should happen after QA retirement and GitHub policy updates have made the operating model real.

## Next Plan Recommendation

Exact next plan title: `Retire Disposable QA Control Plane`.

Exact scope: replace or remove the remaining disposable QA control-plane surfaces that are no longer needed after release helpers, helper CLI, and browser-smoke proof were retired. Start with a read-only dependency map. Then move any still-needed hosted release proof behind release-owned commands or direct app test commands, remove root `qa:*` scripts that are no longer part of the release path, retire QA inventories and validation only after no CI or local check depends on them, and update docs to stop describing `qa/` as the canonical control plane.

Exact implementation boundaries: preserve hosted `default_ship` and `billing_integration` proof semantics until the replacement command is proven. Preserve `sandbox-e2e` and the authenticated Playwright specs unless the plan adds a same-strength replacement. Keep release-critical helper code under `scripts/release/`. Do not repair the deferred release-intake control-plane plan in this slice.

Exact validation boundaries: run a read-only grep proving no remaining root script, workflow, release doc, or public doc depends on deleted QA commands; run replacement hosted-proof command dry-runs or direct Playwright listings for retained browser proof; run focused tests for any moved command wrappers; run `bun run format`, `bun run lint`, `bun run typecheck`, plan lint, markdown lint for touched docs, Program lint, and `git diff --check`.

Why it is next now: the Program has reconciled required checks, defined release identity, relocated release helpers, implemented tag release evidence, retired the helper CLI, and replaced browser-smoke with source proof. The remaining bespoke release-reset drag is the QA control plane that still owns inventories, personas, run packs, reports, docs, root scripts, and the QA-team skill.

## Risks To Carry Forward

Deleting `qa:run-pack` before replacing hosted `default_ship` and `billing_integration` proof would remove the current release path for auth, entitlement, checkout, billing, and production handoff evidence.

Deleting QA inventories before removing `qa:inventory:check` from CI would recreate the stale required-context problem already fixed for `cli` and `browser-smoke`.

Deleting personas or Playwright auth bootstrap before workflows have a replacement would break hosted proof even if source tests still pass.

Moving historical `qa/runs/` evidence into an archive is safer than deleting it outright. Some release docs still cite specific run reports and GitHub Actions run IDs as historical evidence.

The deferred release-intake control-plane plan still references QA-owned evidence maps and intake fixtures. Plan 7 must either preserve the fixtures and contracts it needs or clearly document why that separate program now owns them.

Remote branch protection may still carry stale helper or browser-smoke contexts until the prior workflow deletions are merged and the operator runs the recorded `gh api` cleanup commands. Plan 7 should not treat that external policy cleanup as proof that QA deletion landed.
