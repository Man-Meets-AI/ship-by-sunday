---
title: Reconcile Release Proof And Required Checks
status: complete
created_at: 2026-04-24
completed_at: 2026-04-24
summary: Verify and document the current Ship by Sunday release proof surface before any tag-release, QA, CLI, workflow, or test migration begins.
post_build_recap: The current release proof surface is now documented in the release workflow and QA readme with live GitHub branch-protection, workflow, ruleset, and run evidence, without changing release, QA, CLI, workflow, or test behavior.
read_when:
  - Resuming the first child slice of the Codex release reset Program.
  - Checking which GitHub workflows and required checks are current before changing CI or release policy.
  - Preparing later tag-release, QA retirement, CLI retirement, or browser-proof migration work.
program_id: sbs-codex-release-reset
planning_brief: docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-1.md
---

# Reconcile Release Proof And Required Checks

This is a living execution plan. Keep it current as implementation, proof, and discoveries change the release proof and required-check reconciliation path.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday is about to replace its current QA and release control plane with a Codex-shaped model, but destructive cleanup is unsafe until the repo knows the real proof surface. The visible outcome of this plan is a verified, repo-visible inventory of current local workflows, remote GitHub workflow state, branch protection, required status contexts, tag rulesets, package scripts, documented release proof, and orphaned workflow surfaces. A later agent should be able to open the updated docs and know what must be preserved, removed, or renamed before tag release, QA retirement, CLI retirement, or browser-proof migration begins.

This is the first child slice of the Program at `docs/programs/completed/2026-04-24-sbs-codex-release-reset/`, governed by `planning-brief-1.md`.

## Progress

- [x] 2026-04-24 EDT: Created this child ExecPlan from `docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-1.md`.
- [x] 2026-04-24 EDT: Completed the pre-implementation grill and tightened the plan around dirty doc preservation and scoped diff validation.
- [x] 2026-04-24 EDT: Reconfirmed live GitHub repository settings, workflow list, branch protection, tag/ruleset endpoints, recent workflow runs, and per-workflow job evidence.
- [x] 2026-04-24 EDT: Compared live GitHub metadata with local workflow files, `origin/dev`, `origin/main`, and root package scripts.
- [x] 2026-04-24 EDT: Updated `docs/release-workflow.md` and `qa/README.md` with verified current proof-surface truth while preserving pre-existing edits.
- [x] 2026-04-24 EDT: Recorded stale required-context risk, orphaned `Deployment Smoke`, failing scheduled `Sandbox E2E Nightly`, empty visible ruleset output, and CLI coupling without changing behavior.
- [x] 2026-04-24 EDT: Ran plan lint, markdown lint, Program lint, and scoped diff checks.

## Surprises & Discoveries

During plan authoring, read-only GitHub checks showed current facts that future implementation must verify again before editing docs. `gh repo view ParkerRex/ship-by-sunday --json nameWithOwner,defaultBranchRef,mergeCommitAllowed,rebaseMergeAllowed,squashMergeAllowed,deleteBranchOnMerge,viewerPermission` reported default branch `main`, merge commits enabled, rebase enabled, squash enabled, delete-branch-on-merge disabled, and admin viewer permission. That differs from Codex's squash-only model and must be treated as current SBS policy until changed by a later plan.

During plan authoring, `gh workflow list --repo ParkerRex/ship-by-sunday --all` reported active remote workflows for `CI`, `Convex Production Deploy`, `Deployment Smoke`, `Dev Staging Proof`, `Issue Labels`, `Production Release Proof`, and `Sandbox E2E Nightly`. The local checkout has no `.github/workflows/deployment-smoke.yml`, so `Deployment Smoke` is currently an orphaned remote Actions surface.

During plan authoring, branch protection endpoint reads reported that both `main` and `dev` require the status contexts `static`, `integration`, `browser-smoke`, and `cli`, enforce admins, dismiss stale reviews, do not require code-owner review, and require zero approving reviews. Reconfirm this before implementation because GitHub settings can drift faster than checked-in docs.

During plan authoring, `gh api repos/ParkerRex/ship-by-sunday/rulesets` returned no visible repo rulesets. Reconfirm this before implementation; tag rulesets are central to later Program slices.

During pre-implementation grill on 2026-04-24, `docs/release-workflow.md` and `qa/README.md` were already dirty from other release/runtime documentation work. The implementer must inspect and preserve those pre-existing edits, then layer this plan's narrow proof-surface corrections on top instead of replacing either file wholesale.

During pre-implementation grill on 2026-04-24, `gh api repos/ParkerRex/ship-by-sunday/rulesets`, `gh api repos/ParkerRex/ship-by-sunday/rules/branches/main`, and `gh api repos/ParkerRex/ship-by-sunday/rules/branches/dev` each returned an empty array. Treat that as implementation-time evidence only after rerunning the commands; the branch-protection endpoint still remains the authority for the required `static`, `integration`, `browser-smoke`, and `cli` contexts.

During implementation on 2026-04-24, `gh repo view ParkerRex/ship-by-sunday --json nameWithOwner,defaultBranchRef,mergeCommitAllowed,rebaseMergeAllowed,squashMergeAllowed,deleteBranchOnMerge,viewerPermission` again reported default branch `main`, merge commits enabled, rebase enabled, squash enabled, delete-branch-on-merge disabled, and admin viewer permission.

During implementation on 2026-04-24, live branch protection for both `main` and `dev` still required the exact contexts `static`, `integration`, `browser-smoke`, and `cli`. Both protections enforced admins, dismissed stale reviews, did not require code-owner review, and required zero approving reviews. This means helper CLI retirement remains blocked on deliberate branch-protection and CI context replacement.

During implementation on 2026-04-24, local `.github/workflows/` and both `origin/dev` and `origin/main` contained `ci.yml`, `convex-production-deploy.yml`, `dev-staging-proof.yml`, `issue-labels.yml`, `production-release-proof.yml`, and `sandbox-e2e-nightly.yml`; none contained `deployment-smoke.yml`. Remote Actions still listed `Deployment Smoke` as active, with failed run `24571382089` from 2026-04-17, so it remains an orphaned remote workflow surface.

During implementation on 2026-04-24, `Sandbox E2E Nightly` remained active and failed every scheduled run in the latest checked window, including run `24876267728` on 2026-04-24. It is not branch-protected release proof and should remain a repair candidate until a later plan replaces or fixes it.

## Decision Log

Decision: Make this slice inventory and reconciliation only.
Rationale: The Program dependency graph makes proof-surface truth a prerequisite for tag release, QA deletion, CLI deletion, test migration, and docs cleanup. Implementing any of those now would hide dependencies inside the first slice.
Date: 2026-04-24

Decision: Use `docs/release-workflow.md` and `qa/README.md` as the narrow durable write targets.
Rationale: Both files already duplicate current CI/CD proof path and orphaned workflow claims. Updating only those sections records verified truth without turning this slice into broad docs cleanup.
Date: 2026-04-24

Decision: Treat live GitHub metadata as the authority for required contexts and remote workflow activation.
Rationale: Local workflow files cannot reveal stale required status contexts, missing remote workflow files, or branch-protection settings. The future implementation must record command outputs and not infer those facts from YAML alone.
Date: 2026-04-24

Decision: Scope diff validation to this slice's touched planning and documentation files.
Rationale: The checkout contains unrelated dirty work, including pre-existing edits to `docs/release-workflow.md` and `qa/README.md`. A broad `git diff --check` can fail on unrelated files and obscure whether this slice introduced whitespace errors.
Date: 2026-04-24

Decision: Keep `qa_control_plane` described as release-important drift detection but not a required branch-protection context.
Rationale: The `CI` workflow contains and runs `qa_control_plane`, but the live branch-protection contexts on both `dev` and `main` are only `static`, `integration`, `browser-smoke`, and `cli`. The docs need to separate CI job truth from required-context truth.
Date: 2026-04-24

## Outcomes & Retrospective

This plan verified the current release proof surface and updated the narrow duplicated docs in `docs/release-workflow.md` and `qa/README.md`. The docs now distinguish required PR status contexts from branch-push hosted proof, name `Deployment Smoke` as an orphaned remote Actions surface, name `Sandbox E2E Nightly` as a failing scheduled/manual repair candidate, record that visible ruleset and branch-rule endpoints returned empty arrays, and state that helper CLI retirement is still coupled to the required `cli` context and root `sbs:check` script.

No release workflow behavior, GitHub settings, QA files, CLI files, test files, or package scripts were changed. Remaining follow-up belongs to later Program slices: define tag release identity, replace required contexts deliberately, move release-critical helpers out of `qa/`, retire the helper CLI, and replace or remove stale browser/nightly proof.

## Context and Orientation

The Program wants a Codex-shaped operating model, but SBS currently ships through a branch-driven hosted-product release path. The current local workflow files are `.github/workflows/ci.yml`, `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, `.github/workflows/convex-production-deploy.yml`, `.github/workflows/sandbox-e2e-nightly.yml`, and `.github/workflows/issue-labels.yml`. Live GitHub currently also lists `Deployment Smoke`, whose file is absent locally.

The root `package.json` defines the local command surface. `check` currently includes `sbs:check`, and `.github/workflows/ci.yml` has a `cli` job that runs `bun run sbs:check`. Current branch protection requires `static`, `integration`, `browser-smoke`, and `cli` on both `main` and `dev`, so later CLI retirement cannot begin until this required context is deliberately changed.

`docs/release-workflow.md` is the canonical release runbook. `qa/README.md` repeats the current CI/CD proof path for QA operators. This slice should update only the narrow sections in those files that describe current workflows, branch protection, required checks, active remote workflow surfaces, and evidence commands.

### In Scope

In scope is read-only verification of GitHub repository settings, workflow activation, recent run evidence, branch protection, required status contexts, visible tag rulesets, local workflow files, package scripts, and release docs. In scope is narrowly updating `docs/release-workflow.md`, `qa/README.md`, and this ExecPlan to record verified current truth, stale contexts, orphaned workflow surfaces, and exact commands a later agent should rerun.

### Out Of Scope

Out of scope is implementing tag-driven release, changing branch protection, changing GitHub merge settings, editing workflow behavior, deleting workflows, deleting QA files, deleting the helper CLI, moving release helpers out of `qa/scripts`, rewriting tests, adding CODEOWNERS, adding `.github/codex` automation, rotating credentials, or doing broad docs cleanup. If verification shows an urgent security issue such as tracked real credentials, stop and report it instead of handling it silently inside this plan.

## Plan of Work

Start by confirming the local dirty state and reading the current diffs for `docs/release-workflow.md` and `qa/README.md`. Those files may already contain unrelated release/runtime documentation edits. Preserve that existing content and apply only the proof-surface corrections required by this plan. Then refresh local and remote state. Fetch branch refs so commands that compare `origin/dev` and `origin/main` are meaningful. Then query GitHub through `gh` for repository merge settings, workflow activation, branch protection on `main` and `dev`, visible rulesets, and recent workflow runs. Capture the short relevant outputs in this plan's `Artifacts and Notes` section or a concise snippet inside the updated docs.

Next compare remote workflow activation with local workflow files. The current known mismatch is remote `Deployment Smoke` with no `.github/workflows/deployment-smoke.yml`. Verify whether that remains true. Also verify that local workflow files still contain the jobs and triggers the docs describe: `CI` on PR, push to `main`, schedule, and manual; `Dev Staging Proof` on push to `dev`; `Production Release Proof` on push to `main`; `Convex Production Deploy` on push to `main`; `Sandbox E2E Nightly` on schedule and manual; and `Issue Labels` for label maintenance.

Then update `docs/release-workflow.md`. Keep the release workflow branch model intact unless live evidence disproves it. Update the `Current CI/CD proof path` and `Required standing configuration` sections so they distinguish local workflow files, active remote workflow surfaces, required status contexts, non-required release proof jobs, orphaned remote workflows, visible tag rulesets, and recent run evidence. Do not rewrite the standard release process into a tag-driven model in this slice.

Update `qa/README.md` only where it repeats the current CI/CD proof path and QA operator expectations. The QA readme should not claim a workflow is release-critical if it is only scheduled, orphaned, failed, or unprotected. It should also not claim QA control-plane commands are going away; that belongs to later Program slices.

Finally update this ExecPlan's `Progress`, `Surprises & Discoveries`, `Outcomes & Retrospective`, and `Artifacts and Notes` with the exact facts discovered during implementation. If any live GitHub query fails because of auth or permissions, record the exact failure and do not claim the proof surface is reconciled.

## Milestones

Milestone 1 verifies live GitHub metadata. At the end of this milestone, the plan has current outputs for repository merge settings, workflow activation, branch protection on `main` and `dev`, visible rulesets, recent workflow runs, and local workflow files. Success means the implementer can name which facts are live GitHub facts, which are local file facts, and which are stale or missing.

Milestone 2 reconciles docs with the verified proof surface. At the end of this milestone, `docs/release-workflow.md` and `qa/README.md` record the same current workflow truth and do not overstate unprotected jobs, orphaned workflows, or future tag-release behavior. Success means a future CLI or QA deletion slice can see exactly why it must update branch protection before deleting required contexts.

Milestone 3 validates the planning slice. At the end of this milestone, the child plan, Program packet, and touched docs pass their linters, and `git diff --check` reports no whitespace errors. Success means no implementation code changed and the repo-visible proof-surface inventory is ready for the next Program slice.

## Concrete Steps

1. Confirm the starting state without cleaning unrelated work:

       cd /Users/parkerrex/Developer/ship-by-sunday
       git status --short
       git diff -- docs/release-workflow.md qa/README.md

   Expect existing unrelated dirty work in the checkout, including possible pre-existing edits to the two docs this plan touches. Do not revert it. Preserve any existing edits in `docs/release-workflow.md` and `qa/README.md` while layering this slice's release-proof corrections.

2. Refresh local refs and list local workflow files:

       git fetch --all --prune
       find .github/workflows -maxdepth 1 -type f -print | sort

   Expected local workflow files currently include `ci.yml`, `convex-production-deploy.yml`, `dev-staging-proof.yml`, `issue-labels.yml`, `production-release-proof.yml`, and `sandbox-e2e-nightly.yml`.

3. Capture live repository settings:

       gh repo view ParkerRex/ship-by-sunday --json nameWithOwner,defaultBranchRef,mergeCommitAllowed,rebaseMergeAllowed,squashMergeAllowed,deleteBranchOnMerge,viewerPermission

   During plan authoring on 2026-04-24, this reported default branch `main`, merge commits enabled, rebase enabled, squash enabled, delete-branch-on-merge disabled, and admin viewer permission. Treat implementation-time output as authoritative.

4. Capture remote workflow activation:

       gh workflow list --repo ParkerRex/ship-by-sunday --all

   During plan authoring on 2026-04-24, this listed `Deployment Smoke` as active even though no local workflow file exists. Reconfirm and record the result.

5. Capture branch protection for `main` and `dev`:

       gh api repos/ParkerRex/ship-by-sunday/branches/main/protection --jq '{required_status_checks:.required_status_checks.contexts,enforce_admins:.enforce_admins.enabled,required_pull_request_reviews:.required_pull_request_reviews,restrictions:.restrictions}'
       gh api repos/ParkerRex/ship-by-sunday/branches/dev/protection --jq '{required_status_checks:.required_status_checks.contexts,enforce_admins:.enforce_admins.enabled,required_pull_request_reviews:.required_pull_request_reviews,restrictions:.restrictions}'

   During plan authoring, both branches required `static`, `integration`, `browser-smoke`, and `cli`. If either command fails or returns different contexts, record the exact output and update docs accordingly.

6. Capture visible rulesets and tag rules:

       gh api repos/ParkerRex/ship-by-sunday/rulesets
       gh api repos/ParkerRex/ship-by-sunday/rules/branches/main
       gh api repos/ParkerRex/ship-by-sunday/rules/branches/dev

   If these return empty arrays or no output, say that no visible repo rulesets or branch rules were returned. Do not assume org-level rulesets are absent unless the command proves it with adequate permissions.

7. Capture recent workflow run evidence:

       gh run list --repo ParkerRex/ship-by-sunday --limit 20 --json databaseId,workflowName,status,conclusion,headBranch,headSha,createdAt,event
       gh run list --repo ParkerRex/ship-by-sunday --workflow ci.yml --limit 10
       gh run list --repo ParkerRex/ship-by-sunday --workflow dev-staging-proof.yml --limit 10
       gh run list --repo ParkerRex/ship-by-sunday --workflow production-release-proof.yml --limit 10
       gh run list --repo ParkerRex/ship-by-sunday --workflow convex-production-deploy.yml --limit 10
       gh run list --repo ParkerRex/ship-by-sunday --workflow sandbox-e2e-nightly.yml --limit 10

   Record only concise evidence: workflow name, run id, conclusion, branch, SHA, event, and date. Avoid dumping long logs into docs.

8. Inspect the relevant local docs and scripts before editing:

       sed -n '1,140p' package.json
       sed -n '1,140p' .github/workflows/ci.yml
       sed -n '1,120p' .github/workflows/dev-staging-proof.yml
       sed -n '1,120p' .github/workflows/production-release-proof.yml
       sed -n '1,120p' .github/workflows/convex-production-deploy.yml
       sed -n '1,100p' .github/workflows/sandbox-e2e-nightly.yml
       sed -n '1,130p' docs/release-workflow.md
       sed -n '1,100p' qa/README.md

9. Update only narrow docs surfaces:

       docs/release-workflow.md
       qa/README.md
       docs/exec-plans/completed/2026-04-24-reconcile-release-proof-and-required-checks.md

   In `docs/release-workflow.md`, update the proof-path and standing-configuration text to separate required PR checks from branch-push release proof and scheduled/non-release proof. In `qa/README.md`, mirror the current proof-path correction at the QA operator level. In this ExecPlan, record discoveries and progress.

10. Run validation:

       bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-reconcile-release-proof-and-required-checks.md
       bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-24-reconcile-release-proof-and-required-checks.md docs/release-workflow.md qa/README.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/program.md
       bun run programs:lint
       git diff --check -- docs/exec-plans/completed/2026-04-24-reconcile-release-proof-and-required-checks.md docs/release-workflow.md qa/README.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/program.md

## Validation and Acceptance

This slice is complete when live GitHub metadata and local repo files have been compared, the current proof surface is documented narrowly and truthfully, and no destructive release, QA, CLI, workflow, or test migration has occurred.

Acceptance requires `docs/release-workflow.md` and `qa/README.md` to agree on the current proof surface. They must name the required PR contexts, distinguish `Dev Staging Proof`, `Production Release Proof`, and `Convex Production Deploy` from required PR checks, identify `Sandbox E2E Nightly` as non-release-critical if it remains failing/scheduled-only, and identify remote `Deployment Smoke` as orphaned if it remains active remotely but absent locally. Acceptance also requires this ExecPlan to include the implementation-time evidence snippets that justify those statements.

If live GitHub metadata cannot be queried, the slice is not complete unless the limitation is explicitly recorded and the docs avoid claiming verified remote truth.

### Test Commands

Run these commands from `/Users/parkerrex/Developer/ship-by-sunday`:

       gh repo view ParkerRex/ship-by-sunday --json nameWithOwner,defaultBranchRef,mergeCommitAllowed,rebaseMergeAllowed,squashMergeAllowed,deleteBranchOnMerge,viewerPermission
       gh workflow list --repo ParkerRex/ship-by-sunday --all
       gh api repos/ParkerRex/ship-by-sunday/branches/main/protection --jq '{required_status_checks:.required_status_checks.contexts,enforce_admins:.enforce_admins.enabled,required_pull_request_reviews:.required_pull_request_reviews,restrictions:.restrictions}'
       gh api repos/ParkerRex/ship-by-sunday/branches/dev/protection --jq '{required_status_checks:.required_status_checks.contexts,enforce_admins:.enforce_admins.enabled,required_pull_request_reviews:.required_pull_request_reviews,restrictions:.restrictions}'
       gh api repos/ParkerRex/ship-by-sunday/rulesets
       gh run list --repo ParkerRex/ship-by-sunday --limit 20 --json databaseId,workflowName,status,conclusion,headBranch,headSha,createdAt,event
       bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-reconcile-release-proof-and-required-checks.md
       bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-24-reconcile-release-proof-and-required-checks.md docs/release-workflow.md qa/README.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/program.md
       bun run programs:lint
       git diff --check -- docs/exec-plans/completed/2026-04-24-reconcile-release-proof-and-required-checks.md docs/release-workflow.md qa/README.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/program.md

There are no product unit tests for this slice because it should not change product code. If implementation changes any script or workflow behavior, stop and update this plan before continuing.

## Idempotence and Recovery

All verification commands are read-only except docs edits. It is safe to rerun GitHub metadata queries and local file inspections. If a GitHub command fails because of authentication, rate limits, or missing permissions, record the failure and rerun after fixing access; do not substitute stale chat memory for live proof. If docs edits drift beyond the proof-path sections, narrow the diff before validation. If branch protection differs from the plan-authoring facts, implementation-time output wins.

If a later implementer accidentally starts deleting CLI, QA, workflow, or test surfaces while executing this plan, stop and revert only those changes if they were made by that implementer in the same slice. Do not revert unrelated dirty work that already existed in the checkout.

## Artifacts and Notes

Program source:

       docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-1.md
       docs/programs/completed/2026-04-24-sbs-codex-release-reset/converged-decision-packet.md
       docs/programs/completed/2026-04-24-sbs-codex-release-reset/dependency-graph.md
       docs/programs/completed/2026-04-24-sbs-codex-release-reset/plan-split-recommendation.md
       docs/programs/completed/2026-04-24-sbs-codex-release-reset/cross-repo-review.md

Plan-authoring live metadata snapshots from 2026-04-24:

       defaultBranchRef.name: main
       mergeCommitAllowed: true
       rebaseMergeAllowed: true
       squashMergeAllowed: true
       deleteBranchOnMerge: false
       main/dev required_status_checks: static, integration, browser-smoke, cli
       remote workflows included Deployment Smoke
       visible repo rulesets: none returned by gh api repos/ParkerRex/ship-by-sunday/rulesets

These snapshots are orientation only. Implementation must rerun the commands and record fresh evidence.

Implementation evidence captured on 2026-04-24:

       repo settings: default branch main; merge, rebase, and squash all enabled; delete-branch-on-merge false; viewer permission ADMIN
       remote active workflows: CI, Convex Production Deploy, Deployment Smoke, Dev Staging Proof, Issue Labels, Production Release Proof, Sandbox E2E Nightly
       main required_status_checks: static, integration, browser-smoke, cli
       dev required_status_checks: static, integration, browser-smoke, cli
       visible repo rulesets: []
       visible branch rules for main/dev: []
       local workflow files: ci.yml, convex-production-deploy.yml, dev-staging-proof.yml, issue-labels.yml, production-release-proof.yml, sandbox-e2e-nightly.yml
       origin/dev and origin/main workflow files: same local six files, no deployment-smoke.yml
       latest CI evidence: run 24736015264 success on main push at 2026-04-21T17:11:30Z; scheduled run 24874408634 success at 2026-04-24T05:47:19Z
       latest Dev Staging Proof evidence: run 24736371175 success on dev push at 2026-04-21T17:19:40Z
       latest Production Release Proof evidence: run 24736015243 success on main push at 2026-04-21T17:11:30Z
       latest Convex Production Deploy evidence: run 24736015267 success on main push at 2026-04-21T17:11:30Z
       latest Sandbox E2E Nightly evidence: run 24876267728 failure on scheduled main at 2026-04-24T06:45:41Z
       Deployment Smoke evidence: active remote workflow with failed run 24571382089 from deployment_status event on fix-tests at 2026-04-17T14:50:52Z

## Interfaces and Dependencies

This plan depends on GitHub CLI read access for `ParkerRex/ship-by-sunday`, local workflow files under `.github/workflows/`, root `package.json`, the release runbook `docs/release-workflow.md`, the QA operator doc `qa/README.md`, and the Program packet under `docs/programs/completed/2026-04-24-sbs-codex-release-reset/`.

The plan must preserve the existing release and QA command interfaces. It may document that `cli`, `qa_control_plane`, `release_gate`, `default_ship`, `billing_integration`, and `deploy` have different roles, but it must not rename or remove any of them. Branch protection and tag rules are external GitHub configuration dependencies; this plan verifies and documents them but does not change them.
