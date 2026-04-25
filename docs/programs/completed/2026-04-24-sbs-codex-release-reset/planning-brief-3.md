---
title: Ship By Sunday Codex Release Reset Planning Brief 3
program_id: sbs-codex-release-reset
brief_version: 3
status: superseded
summary: Make release-critical helper relocation out of qa/scripts the next child slice after tag identity and hosted evidence were defined.
read_when:
  - Writing the third child ExecPlan for the Codex release reset Program.
  - Deciding where release triage, release evidence, Vercel, Convex, billing, and intake helpers should live before QA retirement.
  - Checking boundaries before moving qa/scripts helpers or changing release workflow paths.
---

# Ship By Sunday Codex Release Reset Planning Brief 3

## Planning Refresh

## What Changed

The second child ExecPlan is complete at `docs/exec-plans/completed/2026-04-24-define-tag-release-identity-and-hosted-evidence-contract.md`. It documented a tag-attests-main release identity contract without changing workflows, branch protection, tag rulesets, package scripts, package versions, QA control-plane files, CLI files, or tests.

The release identity contract now says stable production tags use `vMAJOR.MINOR.PATCH`; future prerelease channels may use semver prerelease suffixes; the current `dev -> main` branch model remains in force until a later workflow slice changes it; release tags attest the verified `main` production SHA for now; current package versions are not release truth; a future root `release.json` manifest should own release version identity; a future protected `refs/tags/v*` policy is required; and future `release-evidence.v1` artifacts must bind GitHub, Vercel, Convex, billing, auth, entitlement, changelog, workflow runs, and GitHub Release publication to the tag target SHA.

The second child also refreshed concrete evidence that matters for the next slice. Existing tags are `v0.2.0` and `v0.1.0`; root, app, and package versions still report `0.1.0`; visible repo rulesets and branch-rule endpoints still returned empty arrays; branch protection on both `dev` and `main` still requires `static`, `integration`, `browser-smoke`, and `cli`; Vercel identity could not be queried from the local shell because Vercel env vars were missing; and Convex CLI auth existed but `convex logs --prod --history 20` behaved as a watch and emitted no historical lines before being stopped.

The helper surface under `qa/scripts` is now the next blocking risk. The current checkout has release-critical files and libraries under `qa/scripts`, including `release-triage.mjs`, `release-snapshot.mjs`, `reconcile-post-snapshot-release.mjs`, `export-release-intake.mjs`, `export-engineering-intake-snapshot.mjs`, `detect-release-scope.mjs`, `sync-hosted-convex-dev.mjs`, `wait-for-host.mjs`, `wait-for-vercel-production-deployment.mjs`, and libraries for release triage, release snapshot, release reconcile, release scope, release intake export, engineering intake contracts, Vercel deployments, Convex dev sync, QA env resolution, Clerk target resolution, personas, CSV parsing, and billing integration step planning.

Root scripts and workflows still call those `qa/scripts` paths directly. `package.json` maps `engineering:intake:release`, `engineering:intake:snapshot`, `release:triage`, `release:snapshot`, `qa:convex:sync-hosted-dev`, `qa:personas:prepare`, `qa:run-pack`, and other QA commands to `qa/scripts`. `.github/workflows/dev-staging-proof.yml` and `.github/workflows/production-release-proof.yml` call `qa/scripts/detect-release-scope.mjs`, `qa/scripts/wait-for-vercel-production-deployment.mjs`, `qa/scripts/wait-for-host.mjs`, and `qa:run-pack`. `.github/workflows/ci.yml` still calls `qa/scripts/validate.mjs` and `qa/scripts/generate-test-inventory.mjs`.

## What Still Holds

The nine-plan split still holds. Plans 1 and 2 are complete. Plan 3 remains the next dependency because QA deletion is unsafe while release-critical helpers live inside the disposable QA folder.

Codex remains a model for operating shape, not implementation details. For this slice, the transferable idea is clear ownership of release automation and evidence helpers, not copying Codex's Rust or packaging layout.

The current release path remains branch-driven until Plan 4 changes it. Plan 3 must preserve current command behavior for `dev -> main` release triage, snapshot fallback, staging proof, production proof, Vercel deployment lookup, Convex sync, billing-sensitive detection, and engineering-intake exports.

The required `cli` context still blocks helper CLI retirement. Plan 3 must not remove the helper CLI, `bin/sbs`, `sbs:check`, or the `cli` CI job.

The QA control plane is still active. Plan 3 must not delete journeys, coverage, test inventory, run reports, QA agents, personas, run-pack behavior, browser harnesses, or QA docs except for narrow references needed to keep relocated release helper paths truthful.

## Boundary Changes

Plan 3 should now be titled `Relocate Release-Critical Helpers Out Of QA`.

The scope is a release-helper ownership and compatibility migration. The next ExecPlan should first choose one owning boundary for release-critical helpers. The default recommendation is `scripts/release/` for repo-level release commands and reusable release libraries, because these helpers are root scripts and GitHub workflow infrastructure rather than app runtime modules or disposable QA records. If inspection proves a narrower package or app-owned boundary is safer for one helper, the plan must explain the exception before moving it.

The slice should classify `qa/scripts` into at least three groups before any move: release-critical helpers to relocate now, QA control-plane helpers that must stay for later QA retirement, and shared utility code that either moves with release helpers or stays behind because QA still owns it. Release-critical helpers include release triage, release snapshot, release reconcile, release scope detection, release intake export, engineering-intake snapshot export, Vercel deployment lookup, hosted wait helpers used by release proof, Convex hosted dev sync used by release proof, and billing integration planning used by release gates.

The plan may update root `package.json` scripts, `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, `.github/workflows/ci.yml` only for path changes required to keep equivalent behavior after relocation. It may add compatibility wrappers under `qa/scripts` only if that reduces blast radius and the plan explicitly schedules their later removal. It may update focused tests for moved modules and narrow docs that name command paths.

The plan must not delete QA control-plane files, delete QA journey or inventory CSVs, delete run-pack or persona behavior, delete browser/e2e harness files, delete the helper CLI, remove the `cli` context, implement tag workflows, create `release.json`, create `release-evidence.v1`, change GitHub branch protection or tag rulesets, add CODEOWNERS, add `.github/codex` automation, or perform broad docs cleanup.

## Dependency Changes

The dependency order is unchanged, but the completed tag contract sharpens Plan 3's target. Relocated release helpers must preserve enough interfaces for Plan 4 to implement tag validation and `release-evidence.v1` without reaching back into disposable QA paths.

Plan 4 remains blocked on Plan 3 because the workflow replacement should call release-owned helper paths, not new tag workflows that still depend on `qa/scripts`. Plan 5 remains blocked on Plan 4 because the `cli` context is still required. Plan 7 remains blocked on Plan 3 and Plan 6 because QA cannot be retired until release helpers and replacement proof are safe.

If Plan 3 finds a helper that is both release-critical and deeply coupled to `qa:run-pack` or personas, it should preserve behavior with a narrow adapter and record the coupling for Plan 6 or Plan 7. It should not pull broad QA retirement forward just to make the move look clean.

## Next Plan Recommendation

Exact next plan title: `Relocate Release-Critical Helpers Out Of QA`.

Exact scope: inventory every `qa/scripts` entrypoint and library that root scripts or workflows use for release triage, release snapshot, release reconcile, release scope detection, release intake export, engineering-intake snapshot export, Vercel deployment lookup, hosted wait helpers, Convex hosted dev sync, billing-sensitive planning, and release-gate support. Choose a single release-owned home, move or wrap only the release-critical helpers, update root scripts and workflow path references that must follow the move, preserve command outputs and contracts, and add or update focused tests that prove old and new command paths still produce equivalent release facts.

Exact boundaries: do not delete QA, do not retire the CLI, do not remove `qa:run-pack`, do not change the required `cli` context, do not implement tag workflows, do not add `release.json` or `release-evidence.v1`, do not change branch protection or tag rulesets, do not remove browser/e2e proof, do not add GitHub automation, and do not perform broad docs cleanup. Any compatibility wrapper under `qa/scripts` must be explicitly temporary and recorded for the later QA-retirement plan.

Why it is next now: proof-surface truth and release identity are now documented, but the release-critical implementation helpers still live under the QA control plane. Moving them before workflow replacement prevents Plan 4 from building the new Codex-shaped release path on a folder that the Program intends to demote or delete later.

## Risks To Carry Forward

Path churn can break release workflows even if helper logic does not change. The next ExecPlan must run focused command compatibility tests and inspect workflow references before and after any move.

Release-intake exports are downstream contracts. `engineering:intake:release` and `engineering:intake:snapshot` must preserve schema and output semantics even if files move.

`qa:run-pack`, personas, QA env resolution, Clerk target resolution, and billing integration planning are intertwined with release proof. The next plan should relocate only the release-owned parts and preserve adapters where the QA-owned browser pack still needs them.

`wait-for-vercel-production-deployment.mjs` is a release identity seam for both current branch proof and future tag evidence. Moving it must not change its read-only mode or alias-assignment behavior.

The current local shell may still lack Vercel credentials. The relocation plan should prove local command compatibility without requiring secrets, and treat hosted identity checks as CI or credentialed environment proof.

Do not make Plan 3 a stealth workflow replacement. Updating workflow paths to moved helpers is allowed when needed for compatibility; changing triggers, required jobs, tag rules, evidence artifacts, or branch protection belongs to Plan 4.
