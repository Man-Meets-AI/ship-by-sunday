---
title: Ship By Sunday Codex Release Reset Planning Brief 2
program_id: sbs-codex-release-reset
brief_version: 2
status: superseded
summary: Make tag release identity and hosted evidence contract definition the next child slice after proof-surface reconciliation.
read_when:
  - Writing the second child ExecPlan for the Codex release reset Program.
  - Deciding how SBS release tags, version truth, and hosted evidence should work before workflow implementation.
  - Checking the required decisions before changing CI, tag rules, branch protection, QA, or CLI surfaces.
---

# Ship By Sunday Codex Release Reset Planning Brief 2

## Planning Refresh

## What Changed

The first child ExecPlan is complete at `docs/exec-plans/completed/2026-04-24-reconcile-release-proof-and-required-checks.md`. It verified the current release proof surface without changing behavior: both `dev` and `main` require `static`, `integration`, `browser-smoke`, and `cli`; `qa_control_plane` is important CI drift detection but is not branch-protected; `Dev Staging Proof`, `Production Release Proof`, and `Convex Production Deploy` are branch-push or post-deploy proof, not required PR contexts; `Sandbox E2E Nightly` is failing scheduled proof; `Deployment Smoke` is an orphaned active remote workflow with no local file on the current checkout, `origin/dev`, or `origin/main`; visible repo rulesets and branch rules returned empty arrays.

The release workflow and QA readme now document that proof surface. The next plan can start from documented current truth instead of re-inventorying required contexts as its main outcome.

## What Still Holds

The nine-plan split still holds. The next implementation work must define release identity before workflow replacement, helper relocation, CLI retirement, browser proof migration, QA retirement, GitHub automation, or final docs cleanup.

Codex remains a model for operating shape, not implementation details. SBS should copy protected semver release tags, version validation, explicit stable/prerelease policy, release evidence artifacts, narrow permissions, idempotent publication, and clear required checks. SBS should not copy Codex's Rust, Bazel, npm, DotSlash, WinGet, signing, or binary packaging details unless a later product decision makes those relevant.

The hosted-product constraints still hold. A release identity decision is incomplete unless it explains how Vercel production, Convex production, Stripe billing, Clerk auth, entitlement, and GitHub Release publication prove the same release SHA.

## Boundary Changes

Plan 2 should now be titled `Define Tag Release Identity And Hosted Evidence Contract`.

The scope is decision and contract definition only. It should choose or document the proposed release tag pattern, version source of truth, stable/prerelease policy, branch model recommendation, deploy-versus-attest model, protected tag/ruleset requirements, release evidence artifact shape, and hosted proof contract for Vercel, Convex, billing, auth, entitlement, and GitHub Release publication.

The plan may update narrow release documentation and the child ExecPlan itself to record the chosen contract. It must not edit GitHub workflows, change branch protection, create tag rulesets, move `qa/scripts`, delete QA files, delete the helper CLI, remove the `cli` context, rewrite tests, add CODEOWNERS, or implement GitHub automation.

## Dependency Changes

The dependency order is unchanged, but Plan 2 must consume the first child plan's proof-surface output. The required `cli` context remains a hard downstream constraint for CLI retirement. Empty visible rulesets make protected tag policy a design requirement rather than an already-existing surface. The orphaned `Deployment Smoke` and failing `Sandbox E2E Nightly` remain downstream cleanup or replacement concerns, not blockers for defining release identity.

Plan 4 remains blocked until Plan 2 settles branch model, deploy-versus-attest, and version source of truth. Plan 3 remains blocked on choosing a release-helper ownership boundary, but Plan 2 should define enough evidence contract shape for Plan 3 to know which release helpers must be preserved or relocated.

## Next Plan Recommendation

Exact next plan title: `Define Tag Release Identity And Hosted Evidence Contract`.

Exact scope: define what an SBS release tag means and what evidence must exist before it can publish or attest a release. The plan should settle the semver tag pattern, version source of truth, stable/prerelease policy, branch model recommendation, deploy-versus-attest model, protected tag or ruleset requirements, GitHub Release publication requirements, release evidence artifact fields, and hosted proof requirements for Vercel, Convex, Stripe billing, Clerk auth, entitlement, and production environment identity.

Exact boundaries: do not implement tag workflows, do not change `.github/workflows/*`, do not change GitHub branch protection or tag rulesets, do not move release helpers out of `qa/scripts`, do not retire the helper CLI, do not remove browser/e2e proof, do not add CODEOWNERS or `.github/codex` automation, and do not perform broad docs cleanup. If live platform checks are needed, keep them read-only and record the result as evidence for the contract.

Why it is next now: the Program has documented the current protected proof surface, so the next blocker is semantic rather than inventory-based. Later CI and release workflow implementation cannot be reliable until the repo knows whether a tag deploys the exact SHA or attests an already deployed SHA, which file owns release version truth, which tag patterns are stable versus prerelease, which branch model SBS will preserve or change, and which hosted evidence proves the release.

## Risks To Carry Forward

A tag that does not deploy or attest the exact hosted SHA creates release identity drift. A tag workflow that assumes Vercel or Convex can deploy directly from tags may require platform changes larger than one GitHub Actions edit. A version check against root `package.json` may be too weak if private workspace package versions remain repeated and stale. A dedicated release manifest may be cleaner but creates another source that workflows, docs, and release scripts must maintain.

Do not let Plan 2 hide implementation decisions inside prose. The output must be concrete enough for the next ExecPlan to name workflow triggers, evidence files, protection rules, and validation commands. If a decision cannot be made from repo evidence, Plan 2 should record the exact assumption and make the later implementation plan validate it before changing workflows.
