---
title: Planning Brief
program_id: sbs-codex-release-reset
brief_version: 1
status: superseded
summary: Make release proof and required-check reconciliation the first child slice before tag release, QA, CLI, test, and docs migrations.
read_when:
  - Writing the first child ExecPlan for the Codex release reset Program.
  - Checking the required first slice before destructive QA, CLI, workflow, or test changes.
---

# Planning Brief

## Goal

Replace Ship by Sunday's current bespoke QA and release control-plane direction with a Codex-shaped operating model: truthful GitHub-native required checks, protected tag-centered release identity, hosted Vercel/Convex/billing proof, preserved source-level tests, helper CLI retirement, QA control-plane decomposition, and docs/GitHub automation that describe the final model instead of the old harness.

## Converged Decisions

- Copy Codex's operating shape, not its Rust/Bazel/npm implementation. SBS should adopt always-visible checks, internal job gating, protected release tags, version validation, evidence artifacts, narrow permissions, source-level tests, and release-scoped hosted proof.
- Release identity should become tag-centered, but release readiness must still prove the hosted product. Vercel, Convex, Stripe, Clerk, entitlement, and environment proof are SBS-specific requirements.
- The helper CLI should be retired as its own migration after root scripts, CI, branch protection, docs, tests, and lockfile state are unwired.
- `qa/` must be decomposed before deletion. Disposable QA journeys, inventories, run reports, and run packs are separate from release-critical helpers under `qa/scripts`.
- Most source-level tests should survive. The reset should remove stale tests, CLI tests when the CLI goes away, generated auth failure artifacts, and broad browser harness proof only after replacement proof exists.
- SBS should keep `docs/programs`, `docs/exec-plans`, and `docs/prompts` as the active planning system. `docs/codex` is historical.
- GitHub issue/PR automation, `.github/codex` prompts, CODEOWNERS, and templates should be added only after the release model is clear enough to describe accurately.

## Open Questions

- Branch model: SBS must decide whether to move toward topic branches into `main`, preserve `dev -> main`, or use a hosted-product hybrid.
- Release deployment model: SBS must decide whether release tags deploy the exact SHA to Vercel/Convex or attest an already deployed SHA.
- Version source of truth: SBS must choose the file or manifest that release tags validate against.
- Release helper ownership: SBS must choose the destination boundary for release-critical helpers currently under `qa/scripts`.
- CLI capability retention: SBS must decide whether draft normalization, reduced fact derivation, import/export, or local generation from facts should move to non-CLI code or be dropped.
- Security checkpoint: if tracked QA credentials or account secrets are verified, credential rotation and removal must happen before destructive QA cleanup.

## Final Plan Split

1. Reconcile Release Proof And Required Checks.
2. Define Tag Release Identity And Hosted Evidence Contract.
3. Relocate Release-Critical Helpers Out Of QA.
4. Implement Codex-Shaped CI And Tag Release Workflows.
5. Retire The Helper CLI.
6. Replace Browser Harness Proof With Source And Release Proof.
7. Retire Disposable QA Control Plane.
8. Add GitHub Policy And Codex Automation.
9. Final Docs And Archive Cleanup.

## Final Dependency Order

1. Inventory and reconcile local workflow files, remote workflow state, branch protections, tag rulesets, required status contexts, package scripts, release docs, and orphaned remote workflows.
2. Define the release tag pattern, protected tag rules, version source of truth, stable/prerelease policy, deploy-versus-attest model, and release evidence contract.
3. Relocate or replace release-critical helpers currently under `qa/scripts` before deleting or demoting QA surfaces.
4. Implement always-visible required checks, tag-triggered or tag-attested release proof, hosted Vercel/Convex/billing proof, release evidence artifacts, and branch/tag protection alignment.
5. Retire the helper CLI after scripts, CI, branch protection, docs, tests, and lockfile state are unwired.
6. Replace broad browser harness proof with source-level tests and minimal release-scoped hosted proof before removing browser/e2e harness files.
7. Remove or archive disposable QA control-plane files and QA-specific agents after release and test dependencies are gone.
8. Add GitHub policy and Codex automation after the release model is stable enough to encode.
9. Reconcile public docs, internal docs, AGENTS files, and historical archives after implementation slices make the new model real.

## First ExecPlan To Write

- Title: Reconcile Release Proof And Required Checks.
- Scope: inventory and reconcile the current release proof surface across local workflow files, remote GitHub Actions state, branch protection, required status contexts, tag rulesets, package scripts, documented release proof, and orphaned remote workflows. The plan should produce repo-visible truth about the current required check surface and identify stale or mismatched contexts that must be removed, renamed, or preserved.
- Boundaries: do not implement tag-driven release, delete QA files, delete the helper CLI, move release helpers, rewrite tests, add CODEOWNERS, or perform broad docs cleanup. The plan may update narrow documentation only if needed to record the verified proof surface and keep the Program resumable.

## Why This First

This plan unlocks every later slice because the Program has already found that protected checks, release gates, workflow files, package scripts, and remote workflow reality do not line up cleanly. If the proof surface is not reconciled first, later slices can delete a still-required `cli` context, preserve an unprotected release gate, miss an orphaned remote workflow, or build tag release automation on stale branch-protection assumptions.
