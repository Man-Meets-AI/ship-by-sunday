---
title: Ship By Sunday Codex Release Reset Planning Brief 5
program_id: sbs-codex-release-reset
brief_version: 5
status: superseded
summary: Make helper CLI retirement the next child slice after the tag release workflow and release evidence layer landed.
read_when:
  - Writing the fifth child ExecPlan for the Codex release reset Program.
  - Retiring the helper CLI, bin launcher, CLI CI context, or CLI docs.
  - Checking boundaries before changing QA, browser proof, source tests, or release workflows.
---

# Ship By Sunday Codex Release Reset Planning Brief 5

## Planning Refresh

## What Changed

The fourth child ExecPlan is complete at `docs/exec-plans/completed/2026-04-24-implement-codex-shaped-ci-and-tag-release-workflows.md`. It added the root `release.json` manifest, release manifest validation, `release-evidence.v1` dry-run and publish validation, proof-summary artifacts from hosted proof workflows, and a guarded `.github/workflows/release.yml` workflow named `Tag Release`.

The release identity source is now concrete. `release.json` currently prepares `v0.3.0`, uses `schemaVersion: release-manifest.v1`, and declares `releaseEvidenceSchemaVersion: release-evidence.v1`. Root scripts now expose `release:manifest:check` and `release:evidence:build`. New release helpers live under `scripts/release/validate-release-manifest.mjs`, `scripts/release/build-release-evidence.mjs`, `scripts/release/lib/release-manifest.mjs`, and `scripts/release/lib/release-evidence.mjs`.

The hosted proof workflows now emit machine-readable summaries for release evidence. `Dev Staging Proof`, `Production Release Proof`, and `Convex Production Deploy` upload JSON summary artifacts while preserving their existing branch-push proof roles. The tag workflow collects check-run proof for a tag target SHA and fails closed in publish mode when required hosted proof is unavailable or failed.

The helper CLI is still fully wired. Root `package.json` exposes `sbs`, `sbs:check`, and `check` still chains `bun run sbs:check`. `.github/workflows/ci.yml` still has a required-looking `cli` job that runs `bun run sbs:check`. `bin/sbs`, `packages/ship-by-sunday-cli/`, CLI tests, `README.md`, `docs/design-docs/scripts.md`, `docs/release-workflow.md`, and `apps/web/content/docs/ship-by-sunday-cli.mdx` still describe the CLI as current. `docs/release-workflow.md` still records `static`, `integration`, `browser-smoke`, and `cli` as the live required branch-protection contexts on `dev` and `main`.

Local validation for Plan 4 passed: manifest validation, evidence dry-run, publish fail-closed validation, focused release tests, expanded release helper tests, workflow YAML parsing, `bun run release:manifest:check`, `bun run release:evidence:build`, release triage/intake/snapshot exports, `bun run format`, `bun lint`, `bun typecheck`, plan lint, markdown lint, Program lint, and scoped diff check. Live GitHub tag protection, branch-protection mutation, GitHub Release publication, and hosted production proof were not mutated from the local shell.

## What Still Holds

The nine-plan split still holds. Plans 1 through 4 are complete. Plan 5 remains the next dependency because the helper CLI is conceptually disposable but operationally wired into scripts, CI, docs, tests, and external branch protection.

Codex remains a model for operating shape, not implementation details. For the helper CLI slice, the relevant Codex-shaped invariant is a smaller ordinary repo command surface guarded by GitHub-native checks. Ship by Sunday should not preserve a separate intake CLI only because historical CI made it required.

The release workflow and hosted proof surfaces remain active and must not be rewritten in this slice. `release.json`, `scripts/release/`, `Tag Release`, `Dev Staging Proof`, `Production Release Proof`, `Convex Production Deploy`, release triage, release snapshot, release intake, and engineering-intake exports should be treated as existing release infrastructure, not as CLI cleanup targets.

QA and browser proof remain transitional surfaces. The CLI retirement slice may remove the `cli` CI job and CLI-owned tests, but it must not delete `qa:run-pack`, QA inventories, QA personas, `browser-smoke`, sandbox e2e, or browser harness files. Replacement browser proof and disposable QA retirement are still downstream Plans 6 and 7.

Source-level product tests must be preserved. Removing the helper CLI package must not remove `packages/blueprint-compiler`, web review/download behavior, starter repo generation used by the product, release manifest tests, release evidence tests, or application tests that prove public, auth, checkout, entitlement, metadata, and generated starter behavior.

## Boundary Changes

Plan 5 should now be titled `Retire The Helper CLI`.

The next slice is destructive, but narrowly destructive. Its scope is to remove the local helper CLI product surface and all direct wiring that makes it release-critical: `packages/ship-by-sunday-cli/`, `bin/sbs`, CLI tests, root `sbs` and `sbs:check` scripts, the `cli` CI job, root `check` dependency on `sbs:check`, CLI docs, and release docs that require `cli` proof.

The next slice must decide whether any CLI-only behavior should survive outside the CLI before deleting files. The default is deletion, not migration. Only reusable behavior that is required by web review/download generation or a release helper should move, and the plan must name the destination and tests before implementation. The current research says the CLI depends on `packages/blueprint-compiler`, not the other way around, so the expected outcome is that `packages/blueprint-compiler` and web generation remain without CLI code.

The next slice may update `.github/workflows/ci.yml` to remove the `cli` job and may update branch-protection documentation to remove `cli` from required contexts. It may inspect or mutate live GitHub branch protection if credentials and operator intent allow it, but it must record exact commands and results. If live branch protection still requires `cli` and cannot be changed locally, the plan may still update checked-in repo artifacts but must record the external policy as a blocker before claiming the release model is complete.

The next slice may update `README.md`, `docs/design-docs/scripts.md`, `docs/release-workflow.md`, `apps/web/content/docs/commands.mdx`, `apps/web/content/docs/ship-by-sunday-cli.mdx`, `apps/web/content/docs/_meta.ts`, `apps/web/content/docs/index.mdx`, package manifests, lockfile state, and this Program. It should remove public CLI docs rather than leave stale "retired" operating instructions in active docs.

The next slice must not delete QA control-plane files, remove `qa:run-pack`, remove `browser-smoke`, remove sandbox e2e, replace browser proof, delete snapshot fallback, change `release.json` semantics, rewrite release workflows beyond removing CLI references, add CODEOWNERS, add broad GitHub issue automation, rotate credentials, or perform final archive cleanup.

## Dependency Changes

Plan 4 unblocks Plan 5 because release identity and release publication no longer depend on the helper CLI. The replacement release path now has `release.json`, release evidence, and a guarded tag workflow, so the `cli` context can be evaluated as legacy CLI product proof rather than release identity proof.

Plan 5 does not unblock QA deletion by itself. QA run-pack, browser smoke, staging proof, production proof, release scope, and hosted evidence remain active until Plans 6 and 7 replace or retire them deliberately.

Plan 6 should still follow Plan 5. Once the helper CLI is removed, the next remaining bulky proof surface is browser and QA-pack proof. Plan 6 should then decide which browser assertions become source-level tests, which hosted proof remains release-scoped, and which stale browser tests can be removed.

Plan 8 remains downstream. Removing the `cli` status context may require branch-protection updates, but CODEOWNERS, PR templates, issue automation, and `.github/codex` policy still belong after the core release and test surfaces are stable.

## Next Plan Recommendation

Exact next plan title: `Retire The Helper CLI`.

Exact scope: remove the helper CLI as a supported repo product and release gate. The plan should unwind root scripts, CI, docs, tests, package files, launcher files, branch-protection references, and lockfile entries so the repository no longer exposes `bun run sbs`, `./bin/sbs`, `sbs:check`, or a `cli` CI context. It should preserve the web app, `packages/blueprint-compiler`, generated starter behavior used by web routes, release helpers, release manifest/evidence helpers, QA transitional proof, and browser proof.

Exact implementation boundaries: first inventory all CLI references with `rg`, then prove whether `packages/blueprint-compiler` or web runtime code imports the CLI. If they do not, delete `packages/ship-by-sunday-cli/` and `bin/sbs`, remove the package from workspace and lockfile state, remove root scripts that only serve the CLI, remove the `cli` job from `.github/workflows/ci.yml`, and update docs that advertise or require the CLI. If an import or behavior dependency appears, move only that non-CLI behavior behind an existing non-CLI boundary before deleting the CLI package.

Exact policy boundaries: update checked-in docs to say the required branch checks after CLI retirement are the remaining truthful contexts, expected to be `static`, `integration`, and `browser-smoke` until Plan 6 changes browser proof. Inspect live GitHub branch protection for `dev` and `main`; if authorized and safe, remove the `cli` required context after the workflow file no longer emits it. If not authorized, record the exact `gh api` read result and the required operator action.

Exact validation boundaries: the finished slice should pass focused checks that prove the web and compiler still work without the CLI, plus the repo's standard broad gates. It should include `bun run format`, `bun lint`, `bun typecheck`, workflow YAML parsing, release manifest/evidence checks, focused compiler tests, focused web tests for generated starter or review/download behavior if affected, Program/plan lint, markdown lint for touched docs, and a grep audit proving active docs and scripts no longer advertise `bun run sbs`, `./bin/sbs`, `sbs:check`, `packages/ship-by-sunday-cli`, or a required `cli` context outside historical archives or the completed plan records.

Why it is next now: the Program has already reconciled proof truth, defined tag identity, moved release helpers out of QA, and implemented the manifest-backed tag release workflow. The helper CLI is the next piece of bespoke machinery that is still slowing the repo down: it is not the hosted product, but it is required by `check`, CI, docs, and branch policy. Retiring it simplifies the required-check surface before browser proof and disposable QA cleanup.

## Risks To Carry Forward

Branch protection can block merges after the workflow stops emitting `cli`. The next plan must treat live GitHub policy as part of the work, not as a doc footnote. If it cannot mutate branch protection, it must leave a precise operator command or blocker.

Deleting the CLI can accidentally remove reusable generation behavior if the implementer treats `packages/ship-by-sunday-cli` and `packages/blueprint-compiler` as one system. The plan must prove import direction before deletion and preserve compiler-owned generation behavior.

Docs may keep the CLI alive socially even after code deletion. Active public docs, README text, release docs, script docs, command docs, and metadata navigation need a grep audit so the retired surface does not remain user-facing.

Root `bun run check` must stay truthful after `sbs:check` disappears. The next plan should decide whether `check` becomes only `bun run --cwd apps/web check` or adds a different non-CLI compiler check. It should not leave `check` calling a removed script.

Lockfile and workspace metadata may retain stale package entries. The next plan should refresh dependencies with the repo's existing Bun workflow and validate that removing the workspace package does not create unrelated lockfile churn.

Historical docs and completed ExecPlans will still mention the CLI. The grep audit should distinguish active truth surfaces from historical archives so the slice does not become final docs archive cleanup.
