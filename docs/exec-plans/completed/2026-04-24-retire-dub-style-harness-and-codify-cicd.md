---
title: Retire Dub Style Harness And Codify CI/CD
status: complete
created_at: 2026-04-24
completed_at: 2026-04-24
summary: Retire the rejected Dub-style harness plan and document the dev and production CI/CD path that recent remote runs prove is working.
post_build_recap: The rejected Dub-style harness plan was moved to completed historical status, release and QA docs now preserve the proven Dev Staging Proof, CI, Production Release Proof, and Convex Production Deploy path, and failing or orphaned lanes are marked separately.
read_when:
  - Reviewing the completed CI/CD correction slice.
  - Deciding whether to preserve, retire, or repair GitHub Actions workflows.
  - Checking why the Dub-style harness plan must not be implemented.
program_id: sbs-codebase-recovery
planning_brief: docs/programs/active/2026-04-23-sbs-codebase-recovery/planning-brief-2.md
---

# Retire Dub Style Harness And Codify CI/CD

This is a living execution plan. Keep it current as implementation, proof, and discoveries change the CI/CD retirement and codification path.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The previous Dub-style CI/CD harness plan is the wrong direction for this repository. Recent remote evidence shows that the current release path has working pieces: `Dev Staging Proof` is green on `dev`, and `CI`, `Production Release Proof`, and `Convex Production Deploy` are green on `main`. The visible outcome of this plan is that the rejected Dub plan is no longer an active execution path, and the repository docs explain which CI/CD surfaces are proven, which are failing or unproven, and which surfaces must be preserved for releases.

This plan is the first child slice of the Program packet at `docs/programs/active/2026-04-23-sbs-codebase-recovery/`, written from `planning-brief-2.md`.

## Progress

- [x] 2026-04-24 EDT: Verified local workflow files and recent remote GitHub Actions runs for `dev` and `main`.
- [x] 2026-04-24 EDT: Reordered the Program so this slice runs before release and intake repair.
- [x] 2026-04-24 EDT: Grilled the plan against the live checkout, `docs/exec-plans/PLANS.md`, current workflow files, Program state, and fresh GitHub Actions evidence.
- [x] 2026-04-24 EDT: Moved `docs/exec-plans/active/2026-04-15-dub-style-ci-cd-test-harness-reset.md` to `docs/exec-plans/completed/2026-04-15-dub-style-ci-cd-test-harness-reset.md` and marked it complete as a rejected historical direction.
- [x] 2026-04-24 EDT: Codified the working `dev` and `main` CI/CD path in `docs/release-workflow.md` and `qa/README.md`.
- [x] 2026-04-24 EDT: Marked `Sandbox E2E Nightly` as a failing non-release-critical repair candidate and `Deployment Smoke` as an orphaned historical Actions surface until a workflow file and passing evidence exist.
- [x] 2026-04-24 EDT: Ran focused validation from this plan and recorded the exact results below.
- [x] 2026-04-24 09:28 EDT: Re-ran the focused remote-evidence and planning-validation slice. The current GitHub Actions evidence still supports the documented dev/main path, and `.github/workflows` still has no local diff.
- [x] 2026-04-24 09:56 EDT: Audited the entire ExecPlan completion state, fixed stale Program current-state prose so it no longer says no child slices have landed, and reran focused plus broad validation.

## Surprises & Discoveries

The old Dub-style plan describes deleting or replacing surfaces that the current repository still has and that recent remote runs show are part of the working release path. The plan is not merely stale; it points in the wrong direction. It now lives in `docs/exec-plans/completed/2026-04-15-dub-style-ci-cd-test-harness-reset.md` as a rejected historical record, not active guidance.

Remote `dev` proof is concentrated in `Dev Staging Proof`. The latest inspected green run was `24736371175`, created 2026-04-21 for commit `36c8360da5d94d9be2ac4485d935389fa5b4fe52`, with green `release_scope`, `default_ship`, and `release_gate`.

Remote `main` proof is a green trio. Runs `24736015264` (`CI`), `24736015243` (`Production Release Proof`), and `24736015267` (`Convex Production Deploy`) all passed on 2026-04-21 for commit `3c5347c06c039859b7780a61e331cebda9421aea`. Scheduled `CI` also passed on 2026-04-24.

The unstable surfaces are not the same as the working release path. `Sandbox E2E Nightly` has repeated scheduled failures in the inspected history. `Deployment Smoke` is active but only showed a failed deployment-status run in the inspected run list.

The 2026-04-24 grill confirmed that `Deployment Smoke` is stranger than a normal failing local workflow. `gh workflow list --repo ParkerRex/ship-by-sunday --all` lists it as active, and run `24571382089` failed on 2026-04-17, but `.github/workflows/deployment-smoke.yml` does not exist in the current checkout, `origin/dev`, or `origin/main`, and `gh workflow view "Deployment Smoke" --yaml` cannot resolve a workflow file without a ref. Treat it as an orphaned or historical remote Actions surface until a workflow file is found again. Do not recreate it or use it to replace `Production Release Proof` in this slice.

The same grill confirmed that the old Dub-style plan already had a warning banner, but it still had `status: active` in frontmatter and remained in `docs/exec-plans/active/`. This slice fixed that by moving the file to `docs/exec-plans/completed/`, setting `status: complete`, setting `completed_at: 2026-04-24`, and writing a `post_build_recap` that says the direction was rejected and not implemented as the current CI/CD path.

The repo linter enforces that any plan with `status: complete` must live under `docs/exec-plans/completed/`. After this slice was complete, this plan itself moved from `docs/exec-plans/active/2026-04-24-retire-dub-style-harness-and-codify-cicd.md` to `docs/exec-plans/completed/2026-04-24-retire-dub-style-harness-and-codify-cicd.md`.

## Decision Log

Decision: Reject the Dub-style harness reset as an execution path.
Rationale: It contradicts the current repo and would delete or replace release surfaces that recent remote runs show are working.
Date: 2026-04-24

Decision: Preserve and document the current working release path before making control-plane repairs.
Rationale: The team needs to know which workflows are reliable before repairing release-intake and triage details.
Date: 2026-04-24

Decision: Treat `Sandbox E2E Nightly` and `Deployment Smoke` separately from the core release path.
Rationale: The inspected evidence shows failures or weak proof there, while the dev and production release surfaces are green.
Date: 2026-04-24

Decision: Retire the old Dub-style plan by moving it out of the active plan lane, not by deleting it.
Rationale: A warning inside an active plan is too easy to miss, while deletion would erase useful historical context. The safe target is a completed historical record that clearly says the direction was rejected and not implemented as the current release path.
Date: 2026-04-24

Decision: Preserve `.github/workflows/ci.yml`, `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, and `.github/workflows/convex-production-deploy.yml` during this slice.
Rationale: Fresh GitHub Actions evidence shows those files back the current passing release path. This plan is documentation and plan-lane correction, not a workflow replacement.
Date: 2026-04-24

## Outcomes & Retrospective

This slice is complete. The rejected Dub-style plan was retired by moving it from `docs/exec-plans/active/2026-04-15-dub-style-ci-cd-test-harness-reset.md` to `docs/exec-plans/completed/2026-04-15-dub-style-ci-cd-test-harness-reset.md` and marking it complete as a rejected historical direction. The record was preserved rather than deleted.

`docs/release-workflow.md` and `qa/README.md` now codify the proven release path from current remote evidence: `Dev Staging Proof` on `dev`, plus `CI`, `Production Release Proof`, and `Convex Production Deploy` on `main`. They also state that QA control-plane validation and `qa:run-pack` proof remain part of this path and must not be deleted under the rejected Dub-style harness plan.

The intentionally separate lanes are also documented. `Sandbox E2E Nightly` is a failing non-release-critical repair candidate, and `Deployment Smoke` is an orphaned historical remote Actions surface because its workflow file is absent from the current checkout, `origin/dev`, and `origin/main`.

No `.github/workflows/` file was changed by this slice.

Because this plan moved to `completed/`, `docs/programs/active/2026-04-23-sbs-codebase-recovery/program.md` was refreshed so the next active child is `docs/exec-plans/active/2026-04-23-repair-release-intake-control-plane.md`, and that release/intake plan now points at this completed correction slice.

A final completion audit on 2026-04-24 found one stale Program sentence that still said none of the child recovery slices had landed. That sentence was corrected so the Program now says the first child recovery slice has landed, the rejected Dub-style direction is retired, and release/intake correctness is the next active implementation gap.

## Context and Orientation

The rejected wrong-way plan is now `docs/exec-plans/completed/2026-04-15-dub-style-ci-cd-test-harness-reset.md`. It contains a 2026-04-24 warning, complete frontmatter, and a recap saying it was rejected rather than implemented. The working CI/CD surfaces are `.github/workflows/ci.yml`, `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, and `.github/workflows/convex-production-deploy.yml`. The questionable surfaces are `.github/workflows/sandbox-e2e-nightly.yml` and the remote-only historical `Deployment Smoke` workflow. `Deployment Smoke` is not present as `.github/workflows/deployment-smoke.yml` in the current checkout, `origin/dev`, or `origin/main` as of this slice, so do not add or rely on that file unless fresh repo evidence proves it returned. Local docs that teach release behavior include `docs/release-workflow.md` and `qa/README.md`.

### In Scope

In scope was retiring or superseding the Dub-style harness ExecPlan, documenting the proven dev and production CI/CD path from actual remote runs, preserving the working workflow surfaces, and separating failing, orphaned, or unproven workflows from the release-critical path.

### Out Of Scope

Out of scope was fixing release-intake slug normalization, changing product code, deleting QA scripts, replacing workflows, repairing the nightly browser suite, recreating `Deployment Smoke`, or changing Vercel and Convex deployment settings. Those can happen in later implementation slices after the working path is codified.

## Plan of Work

Start by preserving the remote evidence. Re-run the `gh run list` and `gh run view` commands in this plan so the implementer captures current run IDs, branches, SHAs, job names, and conclusions.

Then retire the Dub-style harness plan. The preferred approach is to move `docs/exec-plans/active/2026-04-15-dub-style-ci-cd-test-harness-reset.md` to `docs/exec-plans/completed/2026-04-15-dub-style-ci-cd-test-harness-reset.md`, set `status: complete`, set `completed_at` to the date of the retirement edit, and write a `post_build_recap` that says the plan was rejected and not implemented as the current CI/CD direction. Keep the near-top warning. Do not delete the file. If the move exposes lint failures that cannot be repaired in the same narrow slice, keep the file in place temporarily, change its `summary`, `read_when`, and near-top warning so it is unmistakably historical, and record in this plan why the move was deferred.

Next update docs that teach the release path. `docs/release-workflow.md` should name the current working path: `Dev Staging Proof` on `dev`, and `CI`, `Production Release Proof`, and `Convex Production Deploy` on `main`. `qa/README.md` should explain that QA control-plane validation and run-pack proof are still part of the current working release path and should not be deleted under the rejected Dub plan.

Then record the failing or unproven lanes. `Sandbox E2E Nightly` should be labeled as non-release-critical until repaired. `Deployment Smoke` should be labeled as an orphaned historical Actions surface unless a workflow file is found in the live repo. It should not be treated as a proven replacement for production release proof unless fresh repo evidence shows the workflow file exists and fresh remote evidence shows it passing.

Finally update `docs/programs/active/2026-04-23-sbs-codebase-recovery/program.md` and, only if needed, `docs/exec-plans/active/2026-04-23-repair-release-intake-control-plane.md` so the first priority is this CI/CD correction and release/intake repair remains the second slice. The grill found those two files already mostly aligned, so implementation should avoid churn there unless the fresh evidence changes the sequence or wording.

## Milestones

Milestone 1 captures current remote evidence. At the end, this plan records the latest passing dev and main runs and the latest failing or unproven workflow runs.

Milestone 2 retires the wrong Dub plan. At the end, `2026-04-15-dub-style-ci-cd-test-harness-reset.md` cannot be mistaken for the next active implementation path because it is either moved to `docs/exec-plans/completed/` with completed rejected-direction metadata, or this plan documents the exact lint blocker that forced a temporary tombstone-in-place.

Milestone 3 documents the working CI/CD path. At the end, release docs and QA docs tell a future agent to preserve the proven dev and production workflows.

Milestone 4 separates broken, orphaned, or unproven lanes. At the end, nightly and deployment-smoke failures are tracked as repair candidates rather than reasons to delete the working release path.

Milestone 5 validates the planning correction. At the end, this plan, the Program packet, and any touched docs pass their focused validation.

## Concrete Steps

1. Refresh GitHub evidence:

       cd /Users/parkerrex/Developer/ship-by-sunday
       gh workflow list --repo ParkerRex/ship-by-sunday --all
       gh run list --repo ParkerRex/ship-by-sunday --branch dev --limit 20 --json databaseId,workflowName,displayTitle,status,conclusion,createdAt,headSha,event,url
       gh run list --repo ParkerRex/ship-by-sunday --branch main --limit 20 --json databaseId,workflowName,displayTitle,status,conclusion,createdAt,headSha,event,url

2. Inspect the latest green dev and main run details:

       cd /Users/parkerrex/Developer/ship-by-sunday
       gh run view <latest-dev-staging-proof-run-id> --repo ParkerRex/ship-by-sunday --json name,displayTitle,createdAt,headSha,event,status,conclusion,jobs,url
       gh run view <latest-production-release-proof-run-id> --repo ParkerRex/ship-by-sunday --json name,displayTitle,createdAt,headSha,event,status,conclusion,jobs,url
       gh run view <latest-main-ci-run-id> --repo ParkerRex/ship-by-sunday --json name,displayTitle,createdAt,headSha,event,status,conclusion,jobs,url
       gh run view <latest-convex-production-deploy-run-id> --repo ParkerRex/ship-by-sunday --json name,displayTitle,createdAt,headSha,event,status,conclusion,jobs,url

3. Retire `docs/exec-plans/active/2026-04-15-dub-style-ci-cd-test-harness-reset.md`. Prefer moving it to `docs/exec-plans/completed/2026-04-15-dub-style-ci-cd-test-harness-reset.md` with completed rejected-direction metadata and the existing warning preserved. Do not implement its deletion plan, do not delete the historical file, and do not remove or replace any working workflow file as part of this retirement.

4. Update `docs/release-workflow.md` and `qa/README.md` with the current working path and the exact remote run evidence.

5. Update `docs/programs/active/2026-04-23-sbs-codebase-recovery/program.md` and `docs/exec-plans/active/2026-04-23-repair-release-intake-control-plane.md` only if the fresh evidence changes the sequence or a referenced path. Otherwise leave them alone and avoid plan churn.

6. Validate:

       cd /Users/parkerrex/Developer/ship-by-sunday
       PATH="$HOME/.bun/bin:$PATH" bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-retire-dub-style-harness-and-codify-cicd.md
       if test -f docs/exec-plans/completed/2026-04-15-dub-style-ci-cd-test-harness-reset.md; then PATH="$HOME/.bun/bin:$PATH" bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-15-dub-style-ci-cd-test-harness-reset.md; fi
       PATH="$HOME/.bun/bin:$PATH" bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-24-retire-dub-style-harness-and-codify-cicd.md docs/release-workflow.md qa/README.md
       git diff --name-only -- .github/workflows
       git diff --check

## Validation and Acceptance

This slice is complete when the rejected Dub-style plan cannot be mistaken for active implementation guidance, release docs identify the proven dev and production CI/CD path from actual remote evidence, QA docs preserve the current working proof surfaces, and failing, orphaned, or unproven workflows are clearly separated from the release-critical path. The diff should not delete, rename, or replace `.github/workflows/ci.yml`, `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, or `.github/workflows/convex-production-deploy.yml`.

### Test Commands

Run these commands from `/Users/parkerrex/Developer/ship-by-sunday`:

       gh workflow list --repo ParkerRex/ship-by-sunday --all
       gh run list --repo ParkerRex/ship-by-sunday --branch dev --limit 20 --json databaseId,workflowName,displayTitle,status,conclusion,createdAt,headSha,event,url
       gh run list --repo ParkerRex/ship-by-sunday --branch main --limit 20 --json databaseId,workflowName,displayTitle,status,conclusion,createdAt,headSha,event,url
       PATH="$HOME/.bun/bin:$PATH" bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-retire-dub-style-harness-and-codify-cicd.md
       if test -f docs/exec-plans/completed/2026-04-15-dub-style-ci-cd-test-harness-reset.md; then PATH="$HOME/.bun/bin:$PATH" bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-15-dub-style-ci-cd-test-harness-reset.md; fi
       PATH="$HOME/.bun/bin:$PATH" bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-24-retire-dub-style-harness-and-codify-cicd.md
       git diff --name-only -- .github/workflows
       git diff --check

## Idempotence and Recovery

Remote evidence commands are read-only and safe to rerun. Do not delete workflows during this slice. If the old Dub plan is moved to `completed/` and that causes plan lint failures, repair the completed-plan metadata in the moved file if the fix is narrow. If the lint failure is broad, restore the file to the active path, keep the rejected-direction tombstone warning, record the blocker in this plan, and stop before touching workflow files. If fresh remote evidence contradicts the run IDs listed here, update this plan before editing docs.

## Artifacts and Notes

Remote evidence collected on 2026-04-24:

       Dev Staging Proof run 24736371175, success, dev, commit 36c8360da5d94d9be2ac4485d935389fa5b4fe52
       Production Release Proof run 24736015243, success, main, commit 3c5347c06c039859b7780a61e331cebda9421aea
       CI run 24736015264, success, main, commit 3c5347c06c039859b7780a61e331cebda9421aea
       Convex Production Deploy run 24736015267, success, main, commit 3c5347c06c039859b7780a61e331cebda9421aea
       CI run 24874408634, success, scheduled main run on 2026-04-24
       Sandbox E2E Nightly run 24876267728, failure, scheduled main run on 2026-04-24
       Deployment Smoke run 24571382089, failure, deployment_status run on 2026-04-17
       Deployment Smoke workflow file absent from current checkout, origin/dev, and origin/main during the 2026-04-24 grill

Validation results from 2026-04-24:

       gh workflow list --repo ParkerRex/ship-by-sunday --all
       Result: passed; listed CI, Convex Production Deploy, Deployment Smoke, Dev Staging Proof, Issue Labels, Production Release Proof, and Sandbox E2E Nightly.

       gh run list --repo ParkerRex/ship-by-sunday --branch dev --limit 20 --json databaseId,workflowName,displayTitle,status,conclusion,createdAt,headSha,event,url
       Result: passed; latest listed dev run was successful Dev Staging Proof run 24736371175.

       gh run list --repo ParkerRex/ship-by-sunday --branch main --limit 20 --json databaseId,workflowName,displayTitle,status,conclusion,createdAt,headSha,event,url
       Result: passed; latest listed main runs included failing Sandbox E2E Nightly run 24876267728, successful scheduled CI run 24874408634, and successful release runs 24736015264, 24736015243, and 24736015267.

       PATH="$HOME/.bun/bin:$PATH" bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-retire-dub-style-harness-and-codify-cicd.md
       Result: passed.

       PATH="$HOME/.bun/bin:$PATH" bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-15-dub-style-ci-cd-test-harness-reset.md
       Result: passed.

       PATH="$HOME/.bun/bin:$PATH" bun run plans:lint -- --plan docs/exec-plans/active/2026-04-23-repair-release-intake-control-plane.md
       Result: passed.

       PATH="$HOME/.bun/bin:$PATH" bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-24-retire-dub-style-harness-and-codify-cicd.md docs/exec-plans/completed/2026-04-15-dub-style-ci-cd-test-harness-reset.md docs/release-workflow.md qa/README.md
       Result: passed before the Program and release/intake pointer refresh.

       PATH="$HOME/.bun/bin:$PATH" bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-24-retire-dub-style-harness-and-codify-cicd.md docs/exec-plans/completed/2026-04-15-dub-style-ci-cd-test-harness-reset.md docs/exec-plans/active/2026-04-23-repair-release-intake-control-plane.md docs/programs/active/2026-04-23-sbs-codebase-recovery/program.md docs/release-workflow.md qa/README.md
       Result: passed.

       git diff --name-only -- .github/workflows
       Result: passed with no output; this slice changed no workflow files.

       git diff --check
       Result: passed with no output.

Revalidation results from 2026-04-24 09:28 EDT:

       gh workflow list --repo ParkerRex/ship-by-sunday --all
       Result: passed; listed CI, Convex Production Deploy, Deployment Smoke, Dev Staging Proof, Issue Labels, Production Release Proof, and Sandbox E2E Nightly as active workflows.

       gh run list --repo ParkerRex/ship-by-sunday --branch dev --limit 20 --json databaseId,workflowName,displayTitle,status,conclusion,createdAt,headSha,event,url
       Result: passed; latest listed dev run was successful Dev Staging Proof run 24736371175 for commit 36c8360da5d94d9be2ac4485d935389fa5b4fe52.

       gh run list --repo ParkerRex/ship-by-sunday --branch main --limit 20 --json databaseId,workflowName,displayTitle,status,conclusion,createdAt,headSha,event,url
       Result: passed; latest listed main runs still separate failing Sandbox E2E Nightly run 24876267728 from successful scheduled CI run 24874408634 and successful release runs 24736015264, 24736015243, and 24736015267.

       gh run view 24736371175 --repo ParkerRex/ship-by-sunday --json name,displayTitle,createdAt,headSha,event,status,conclusion,jobs,url
       Result: passed; Dev Staging Proof succeeded with green release_scope, default_ship, and release_gate jobs; billing_integration was skipped.

       gh run view 24736015243 --repo ParkerRex/ship-by-sunday --json name,displayTitle,createdAt,headSha,event,status,conclusion,jobs,url
       Result: passed; Production Release Proof succeeded with green release_scope, default_ship, and release_gate jobs; billing_integration and reconcile_dev were skipped.

       gh run view 24736015264 --repo ParkerRex/ship-by-sunday --json name,displayTitle,createdAt,headSha,event,status,conclusion,jobs,url
       Result: passed; CI succeeded with green qa_control_plane, integration, cli, browser-smoke, and static jobs.

       gh run view 24736015267 --repo ParkerRex/ship-by-sunday --json name,displayTitle,createdAt,headSha,event,status,conclusion,jobs,url
       Result: passed; Convex Production Deploy succeeded with a green deploy job.

       gh run view 24876267728 --repo ParkerRex/ship-by-sunday --json name,displayTitle,createdAt,headSha,event,status,conclusion,jobs,url
       Result: passed; Sandbox E2E Nightly failed in sandbox-e2e at Run sandbox e2e tests and remains a separate non-release-critical repair candidate.

       gh run view 24571382089 --repo ParkerRex/ship-by-sunday --json name,displayTitle,createdAt,headSha,event,status,conclusion,jobs,url
       Result: passed; Deployment Smoke failed on 2026-04-17 in the deployment-smoke job at Smoke deployed URL.

       gh workflow view "Deployment Smoke" --repo ParkerRex/ship-by-sunday --yaml
       Result: failed with "could not find workflow file deployment-smoke.yml, try specifying a branch or tag using `--ref`"; this supports treating Deployment Smoke as an orphaned historical Actions surface.

       git fetch --prune origin
       Result: passed.

       test -f .github/workflows/deployment-smoke.yml
       Result: failed with exit code 1; the workflow file is absent from the current checkout.

       git cat-file -e origin/dev:.github/workflows/deployment-smoke.yml
       Result: failed with exit code 128; the workflow file is absent from origin/dev.

       git cat-file -e origin/main:.github/workflows/deployment-smoke.yml
       Result: failed with exit code 128; the workflow file is absent from origin/main.

       git diff --name-only -- .github/workflows
       Result: passed with no output; this slice still changed no workflow files.

       PATH="$HOME/.bun/bin:$PATH" bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-retire-dub-style-harness-and-codify-cicd.md
       Result: passed; docs/exec-plans/completed/2026-04-24-retire-dub-style-harness-and-codify-cicd.md: ok.

       PATH="$HOME/.bun/bin:$PATH" bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-15-dub-style-ci-cd-test-harness-reset.md
       Result: passed; docs/exec-plans/completed/2026-04-15-dub-style-ci-cd-test-harness-reset.md: ok.

       PATH="$HOME/.bun/bin:$PATH" bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-24-retire-dub-style-harness-and-codify-cicd.md docs/exec-plans/completed/2026-04-15-dub-style-ci-cd-test-harness-reset.md docs/release-workflow.md qa/README.md
       Result: passed; both completed ExecPlans reported ok, and the command exited 0 for docs/release-workflow.md and qa/README.md.

       git diff --check
       Result: passed with no output.

       PATH="$HOME/.bun/bin:$PATH" bun run format
       Result: passed; oxfmt check finished in 523ms on 978 files.

       PATH="$HOME/.bun/bin:$PATH" bun lint
       Result: passed; oxlint found 0 warnings and 0 errors across 917 files.

       PATH="$HOME/.bun/bin:$PATH" bun typecheck
       Result: passed; Next.js 16.2.0 compiled successfully, TypeScript finished in 13.0s, and 66 static pages generated successfully. The command emitted a non-fatal Nextra shallow-clone warning.

Final completion audit results from 2026-04-24 09:56 EDT:

       PATH="$HOME/.bun/bin:$PATH" bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-retire-dub-style-harness-and-codify-cicd.md
       Result: passed; docs/exec-plans/completed/2026-04-24-retire-dub-style-harness-and-codify-cicd.md: ok.

       PATH="$HOME/.bun/bin:$PATH" bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-15-dub-style-ci-cd-test-harness-reset.md
       Result: passed; docs/exec-plans/completed/2026-04-15-dub-style-ci-cd-test-harness-reset.md: ok.

       PATH="$HOME/.bun/bin:$PATH" bun run plans:lint -- --plan docs/exec-plans/active/2026-04-23-repair-release-intake-control-plane.md
       Result: passed; docs/exec-plans/active/2026-04-23-repair-release-intake-control-plane.md: ok.

       PATH="$HOME/.bun/bin:$PATH" bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-24-retire-dub-style-harness-and-codify-cicd.md docs/exec-plans/completed/2026-04-15-dub-style-ci-cd-test-harness-reset.md docs/exec-plans/active/2026-04-23-repair-release-intake-control-plane.md docs/programs/active/2026-04-23-sbs-codebase-recovery/program.md docs/release-workflow.md qa/README.md
       Result: passed; the three ExecPlans reported ok, and the command exited 0 for the Program, release workflow doc, and QA README.

       git diff --name-only -- .github/workflows
       Result: passed with no output; the completed plan still changes no workflow files.

       git diff --check
       Result: passed with no output.

       PATH="$HOME/.bun/bin:$PATH" bun run format
       Result: passed; oxfmt check finished in 701ms on 978 files.

       PATH="$HOME/.bun/bin:$PATH" bun lint
       Result: passed; oxlint found 0 warnings and 0 errors across 917 files.

       PATH="$HOME/.bun/bin:$PATH" bun typecheck
       Result: passed; Next.js 16.2.0 compiled successfully in 99s, TypeScript finished in 13.9s, and 66 static pages generated successfully. The command emitted the same non-fatal Nextra shallow-clone warning.

Program source for this plan:

       docs/programs/active/2026-04-23-sbs-codebase-recovery/planning-brief-2.md

## Interfaces and Dependencies

This plan depended on GitHub Actions remote run metadata, the current local workflow files, `docs/release-workflow.md`, `qa/README.md`, and the ExecPlan lane. It preserved the working dev and production release workflow surfaces; a later plan must provide equal or stronger proof before replacing them.
