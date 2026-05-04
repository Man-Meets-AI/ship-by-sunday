# Plan Split Recommendation

## Recommended Number Of Plans

Nine child ExecPlans.

This Program should not collapse the reset into one large migration because the dependency graph has real hard dependencies: required-check truth before workflow replacement, release identity before tag automation, release-helper relocation before QA deletion, replacement proof before browser harness deletion, and command-surface unwiring before CLI deletion. Nine plans is enough to keep each outcome reviewable and validateable without splitting the work into administrative fragments.

## Plan 1

Title: Reconcile Release Proof And Required Checks

Scope: Inventory the current SBS GitHub Actions workflows, branch protections, tag rulesets, required status contexts, orphaned remote workflows, and package-script check surfaces. Produce repo-visible truth about which checks are required, which workflows are actually active, which release gates are not protected, and which stale contexts must be removed or renamed.

Why it stands alone: Every later workflow, CLI, QA, and docs deletion depends on knowing the real protected surface. This plan has an observable outcome: the repo and GitHub settings agree on the current required-check and workflow inventory.

What it must not absorb: Do not implement tag-driven release, delete QA files, delete the CLI, move release helpers, rewrite tests, or add CODEOWNERS. This plan is proof-surface reconciliation only.

## Plan 2

Title: Define Tag Release Identity And Hosted Evidence Contract

Scope: Choose the SBS release tag pattern, version source of truth, stable/prerelease policy, deploy-versus-attest model, and machine-readable release evidence contract for Vercel, Convex, billing, auth, entitlement, and GitHub Release publication.

Why it stands alone: Tag-driven release cannot be implemented safely until the repo knows what a release tag means and how production identity is proven. This plan has an observable outcome: a documented release identity and evidence contract ready for workflow implementation.

What it must not absorb: Do not move `qa/scripts`, change live workflows, delete `dev -> main` machinery, retire the CLI, or remove QA packs. This plan decides the release contract; it does not implement the workflow migration.

## Plan 3

Title: Relocate Release-Critical Helpers Out Of QA

Scope: Move or replace release triage, release snapshot, Vercel deployment lookup, Convex production proof, billing scope/proof, and engineering-intake contracts currently trapped under `qa/scripts` into an explicitly owned release or observability boundary.

Why it stands alone: QA deletion is unsafe while release-critical helpers live under `qa/`. This plan has an observable outcome: release and intake commands no longer depend on disposable QA control-plane files.

What it must not absorb: Do not delete QA journeys, coverage, test inventory, run reports, browser harness files, QA agents, or CLI files. Do not replace CI/release workflows beyond the minimum needed to keep relocated helper paths working.

## Plan 4

Title: Implement Codex-Shaped CI And Tag Release Workflows

Scope: Reshape PR and release workflows around always-visible required checks, internal job skipping, protected release tags, tag/version validation, hosted Vercel/Convex/billing proof, release evidence artifacts, and branch/tag protection alignment.

Why it stands alone: This is the core operating-model change. It depends on Plan 1's truth inventory, Plan 2's release contract, and Plan 3's helper relocation. Its observable outcome is a working CI/release workflow set that proves and publishes the intended tagged release identity.

What it must not absorb: Do not delete the helper CLI package, delete QA inventory, remove browser harness files, or rewrite docs broadly. Do not add broad GitHub issue automation unless it is required for release workflow operation.

## Plan 5

Title: Retire The Helper CLI

Scope: Unwire `packages/ship-by-sunday-cli`, `bin/sbs`, CLI tests, `sbs:*` scripts, the `cli` CI context, branch-protection references, lockfile entries, README/public docs references, and any release docs that treat the helper CLI as required proof. Move only selected reusable draft or generation behavior if the Program explicitly keeps it.

Why it stands alone: The CLI is conceptually disposable but operationally wired into checks and docs. This plan has an observable outcome: the repo no longer exposes or requires the helper CLI, while web review download and generated starter paths still work.

What it must not absorb: Do not delete QA control-plane files, rewrite release workflows, remove browser harness tests, or redesign codebase generation. CLI retirement should not become a QA or product refactor.

## Plan 6

Title: Replace Browser Harness Proof With Source And Release Proof

Scope: Preserve source-level unit and integration tests, rewrite or delete stale route/autosave tests, add source-level or local integration replacement coverage for identified browser-proof gaps, and define minimal release-scoped hosted checks for auth, checkout, entitlement, metadata, Vercel, Convex, and billing.

Why it stands alone: Browser harness deletion is unsafe until replacement proof exists. This plan has an observable outcome: source and release proof cover the behavior that broad QA packs used to cover.

What it must not absorb: Do not delete QA control-plane inventories or QA agents yet. Do not remove release-critical helpers or CLI files unless those prior plans have already landed. Do not redesign product routes.

## Plan 7

Title: Retire Disposable QA Control Plane

Scope: Remove or archive QA journeys, coverage, test inventory, committed run reports, run-pack scripts, persona/bootstrap surfaces that are no longer needed, QA-specific `.codex` agents, and `qa-team` skill references after release and test dependencies have been removed.

Why it stands alone: This is the destructive QA cleanup slice and should happen only after release helpers and replacement test proof are safe. Its observable outcome is that `qa/` no longer acts as a control plane and no root script, workflow, app test, or release path depends on deleted QA surfaces.

What it must not absorb: Do not move release helpers here; that belongs to Plan 3. Do not add replacement browser proof here; that belongs to Plan 6. Do not rewrite branch policy or GitHub automation here.

## Plan 8

Title: Add GitHub Policy And Codex Automation

Scope: Add or refine PR templates, issue templates, `.github/codex` label prompts, issue labeler/deduplicator workflows, minimal CODEOWNERS, and branch/tag rules documentation around the new release model.

Why it stands alone: GitHub automation is valuable after the release model is clear, but it is not a prerequisite for release correctness. This plan has an observable outcome: issue intake, review ownership, and Codex Action prompts reflect SBS surfaces instead of generic or missing policy.

What it must not absorb: Do not change CI/release mechanics, delete QA or CLI files, or rewrite the Program/ExecPlan planning system. Automation should describe and support the new model, not define it implicitly.

## Plan 9

Title: Final Docs And Archive Cleanup

Scope: Update `docs/release-workflow.md`, `README.md`, `apps/web/content/docs`, AGENTS files, `qa/README.md` or its replacement, command docs, and `docs/codex` archive classification so public and internal docs reflect the final operating model.

Why it stands alone: Documentation should land after the operating model is real enough to describe truthfully. This plan has an observable outcome: no active doc points to retired CLI, QA, release, or branch surfaces as current truth.

What it must not absorb: Do not perform implementation cleanup here. Do not delete remaining code or workflows except doc/archive surfaces explicitly left for final cleanup.

## Additional Plans

No additional plans are recommended now.

If implementation discovers that deploy-tagged-SHA requires a Vercel or Convex platform migration larger than the release workflow itself, split that platform work out before Plan 4 rather than hiding it inside workflow replacement. If credential rotation is required for QA account references, handle it as a focused security slice before destructive QA cleanup.

## First Plan To Write

Write Plan 1: Reconcile Release Proof And Required Checks.

It should go first because every destructive or release-shaping action depends on it. The Program has already found that protected checks, release gates, workflow files, and remote workflow reality do not line up cleanly. If this truth surface is not fixed first, later slices can delete a still-required `cli` check, preserve an unprotected release gate, miss an orphaned remote workflow, or write tag workflows against stale branch-protection assumptions.
