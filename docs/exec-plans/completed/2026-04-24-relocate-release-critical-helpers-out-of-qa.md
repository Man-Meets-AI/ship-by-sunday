---
title: Relocate Release-Critical Helpers Out Of QA
status: complete
created_at: 2026-04-24
completed_at: 2026-04-24
summary: Move Ship by Sunday's release-critical scripts and libraries out of the disposable QA control-plane boundary while preserving current release command and workflow behavior.
post_build_recap: Release-critical entrypoints and libraries now live under scripts/release, public root commands and release workflows point at that boundary, QA-owned scripts remain in qa/scripts, and focused command plus unit proof passes.
read_when:
  - Resuming the third child slice of the Codex release reset Program.
  - Moving release triage, release snapshot, Vercel, Convex, billing, or engineering-intake helpers out of qa/scripts.
  - Preparing Codex-shaped CI and tag release workflows that must not depend on disposable QA paths.
program_id: sbs-codex-release-reset
planning_brief: docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-3.md
---

# Relocate Release-Critical Helpers Out Of QA

This is a living execution plan. Keep it current as implementation, proof, and discoveries change the release-helper relocation.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday's current `qa/scripts` folder mixes two different responsibilities. Some files are genuinely QA control-plane behavior, such as QA validation, test inventory sync, persona preparation, pack execution, team review scaffolding, and run report scaffolding. Other files are release infrastructure: release triage, snapshot fallback, post-snapshot reconcile, release scope detection, Vercel deployment identity, hosted Convex sync, release intake export, and engineering-intake snapshot export. The larger Codex release reset cannot safely retire or demote QA while release infrastructure still lives under that disposable folder.

After this plan is implemented, release-owned commands should live under an explicit release boundary, recommended as `scripts/release/`, and current root scripts plus GitHub workflows should still behave the same. QA-owned commands can remain under `qa/scripts` for later Program slices. A fresh contributor should be able to tell which scripts are release infrastructure and which are QA control-plane machinery without reading the whole Program history.

This is the third child slice of the Program at `docs/programs/completed/2026-04-24-sbs-codex-release-reset/`, governed by `planning-brief-3.md`.

## Progress

- [x] 2026-04-24 EDT: Created this child ExecPlan from `docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-3.md`.
- [x] 2026-04-24 EDT: Validated the written plan with plan lint, markdown lint, Program lint, and scoped diff check.
- [x] 2026-04-24 EDT: Completed the pre-implementation grill and tightened the plan around release-scope path classification, runtime-intake contract imports, Convex sync tests, run-pack compatibility tests, and production reconcile workflow references.
- [x] 2026-04-24 EDT: Reconfirmed the current `qa/scripts` inventory, direct imports, root script entries, workflow path references, and unit tests before editing files.
- [x] 2026-04-24 EDT: Classified release triage, release intake, engineering-intake snapshot, release snapshot, release reconcile, Vercel, hosted Convex sync, release scope, and billing integration planning as release-owned, while leaving QA inventory, personas, validation, team, ship, and run-pack entrypoints under `qa/scripts`.
- [x] 2026-04-24 EDT: Created `scripts/release/` and `scripts/release/lib/`, moved release-critical entrypoints and libraries there, and used direct caller updates rather than compatibility wrappers.
- [x] 2026-04-24 EDT: Updated root scripts, release workflow helper paths, focused unit-test imports, `qa/scripts/run-pack.mjs`, `apps/web/features/observability/export/runtime-intake.mjs`, `docs/release-workflow.md`, and `qa/README.md` to use or describe the new release boundary.
- [x] 2026-04-24 EDT: Ran focused command validation, the moved-helper unit test set, plan lint, markdown lint, Program lint, and scoped diff check after the relocation.

## Surprises & Discoveries

During plan authoring, the current `qa/scripts` inventory included release entrypoints `detect-release-scope.mjs`, `export-engineering-intake-snapshot.mjs`, `export-release-intake.mjs`, `reconcile-post-snapshot-release.mjs`, `release-snapshot.mjs`, `release-triage.mjs`, `sync-hosted-convex-dev.mjs`, `wait-for-host.mjs`, and `wait-for-vercel-production-deployment.mjs`. It also included QA-owned entrypoints `generate-test-inventory.mjs`, `personas.mjs`, `run-pack.mjs`, `ship.mjs`, `team.mjs`, and `validate.mjs`.

During plan authoring, direct references confirmed that root `package.json` still calls release commands through `qa/scripts` for `engineering:intake:release`, `engineering:intake:snapshot`, `release:triage`, `release:snapshot`, and `qa:convex:sync-hosted-dev`. `.github/workflows/dev-staging-proof.yml` and `.github/workflows/production-release-proof.yml` directly call `qa/scripts/detect-release-scope.mjs`, `qa/scripts/wait-for-vercel-production-deployment.mjs`, and `qa/scripts/wait-for-host.mjs`. `.github/workflows/ci.yml` calls QA-owned `qa/scripts/validate.mjs` and `qa/scripts/generate-test-inventory.mjs`; those two should not move in this slice.

During plan authoring, existing unit tests import release libraries and commands directly from `qa/scripts`: `apps/web/tests/unit/release-scope.test.ts`, `release-triage.test.ts`, `release-snapshot.test.ts`, `release-reconcile.test.ts`, `release-intake-export.test.ts`, `export-release-intake-command.test.ts`, `engineering-intake-contract.test.ts`, `engineering-intake-snapshot.test.ts`, `billing-integration-step-planner.test.ts`, and `vercel-deployments.test.ts`. The relocation must update those imports or provide temporary wrappers so tests prove the new boundary.

During plan authoring, `qa/scripts/run-pack.mjs` imports `qa/scripts/lib/billing-integration-step-planner.mjs`. That library is release-gate-sensitive but still used by a QA-owned pack runner. Moving it requires either updating `run-pack.mjs` to import from the new release boundary or leaving a temporary QA wrapper that re-exports the release-owned implementation.

During plan authoring, `qa/scripts/export-engineering-intake-snapshot.mjs` imports the runtime-intake command from `apps/web/scripts/export-runtime-intake.mjs` and the release-intake command from `qa/scripts/export-release-intake.mjs`. The snapshot command is release/intake infrastructure, but its runtime half remains app-owned.

During pre-implementation grill on 2026-04-24, `qa/scripts/lib/release-scope.mjs` was found to hardcode `qa/scripts/detect-release-scope.mjs`, `qa/scripts/lib/billing-integration-step-planner.mjs`, `qa/scripts/lib/release-scope.mjs`, and `qa/scripts/run-pack.mjs` as billing or Convex sensitive paths. The implementation must update these classifications for the new `scripts/release` paths, while preserving `qa/scripts/run-pack.mjs` as billing-sensitive until QA pack execution is retired or replaced.

During pre-implementation grill on 2026-04-24, `apps/web/tests/unit/convex-dev-sync.test.ts` and `apps/web/tests/unit/runtime-intake-export.test.ts` were found to import release-owned libraries that the original validation list missed. `apps/web/tests/unit/qa-run-pack.test.ts` also needs to remain in the focused validation set because `qa/scripts/run-pack.mjs` will import the moved billing integration step planner from the release boundary.

During pre-implementation grill on 2026-04-24, `.github/workflows/production-release-proof.yml` was confirmed to call `qa/scripts/reconcile-post-snapshot-release.mjs` in addition to the other release helper paths. The workflow path update list must include this reconcile helper, but not change the `reconcile_dev` job's behavior.

During implementation on 2026-04-24, the final helper split left QA-owned files in `qa/scripts`: `generate-test-inventory.mjs`, `personas.mjs`, `run-pack.mjs`, `ship.mjs`, `team.mjs`, `validate.mjs`, and libraries `clerk-target.mjs`, `csv.mjs`, `personas.mjs`, and `qa-env.mjs`. Release-owned entrypoints now live in `scripts/release/`, and release-owned libraries now live in `scripts/release/lib/`.

During implementation on 2026-04-24, a broader active-code search found one stale runtime-intake import in `apps/web/features/observability/export/runtime-intake.mjs` that still pointed at `qa/scripts/lib/engineering-intake-contract.mjs`. The import was updated to `scripts/release/lib/engineering-intake-contract.mjs`, and `bun run engineering:intake:snapshot -- --output tmp/engineering-intake-snapshot-after-helper-relocation.json` then passed.

During implementation on 2026-04-24, `node scripts/release/release-snapshot.mjs --dry-run` returned deterministic dry-run JSON but exited with code 1 because there is no open `dev -> main` release PR. The blocker text was: `Snapshot release is forbidden without an open dev -> main release PR to prove the normal path is actually blocked.` This is current release-policy behavior, not a relocation regression.

During implementation on 2026-04-24, `bun run release:triage -- --output tmp/release-triage-after-helper-relocation.json` exited successfully from the new path but reported the expected current release blockers: missing Vercel metadata because `VERCEL_TOKEN` is unavailable locally, skipped `billing_integration`, and no exact preview deployment bound to `origin/dev`.

## Decision Log

Decision: Use `scripts/release/` as the default target boundary for release-critical helpers.
Rationale: The helpers are repo-level release and workflow infrastructure used by root scripts and GitHub Actions. They are not app runtime code, not a package API, and not disposable QA records. A root `scripts/release/` boundary gives Plan 4 a stable release-owned path to consume.
Date: 2026-04-24

Decision: Keep QA-owned pack, persona, inventory, validation, team, and report scripts in `qa/scripts` for this slice.
Rationale: The Program explicitly separates release-helper relocation from QA control-plane retirement. Moving QA commands now would widen this plan into the destructive QA cleanup slice.
Date: 2026-04-24

Decision: Preserve command compatibility through root script updates and, where useful, temporary QA wrappers.
Rationale: Workflows and tests currently depend on `qa/scripts` paths. A staged migration can make the release-owned path canonical while avoiding a brittle one-shot rewrite that breaks current release proof.
Date: 2026-04-24

Decision: Prefer direct caller updates over compatibility wrappers for this slice, and use wrappers only for a discovered hard blocker.
Rationale: The current callers are concrete and few: root scripts, two release workflows, one QA pack runner, and focused unit tests. Updating those references makes `scripts/release` the real canonical owner immediately. Wrappers should be temporary exceptions, not the default migration shape.
Date: 2026-04-24

Decision: Update release-scope sensitive path lists as part of the move.
Rationale: `release-scope.mjs` currently marks old `qa/scripts` helper paths as billing-sensitive or Convex-sensitive. If those literals are not updated, later changes to release-owned helpers under `scripts/release` could fail to trigger required billing proof or hosted Convex sync.
Date: 2026-04-24

Decision: Treat the nonzero snapshot dry-run exit as expected ineligible-release behavior for this slice.
Rationale: The relocation only needs to prove that the moved command resolves, executes, and reports the same release-policy decision. With no open `dev -> main` release PR, the current command intentionally denies snapshot release and exits nonzero.
Date: 2026-04-24

## Outcomes & Retrospective

This plan is complete. Release-critical helpers no longer have `qa/scripts` as their canonical home. The canonical release entrypoints are now `scripts/release/release-triage.mjs`, `scripts/release/export-release-intake.mjs`, `scripts/release/export-engineering-intake-snapshot.mjs`, `scripts/release/release-snapshot.mjs`, `scripts/release/reconcile-post-snapshot-release.mjs`, `scripts/release/detect-release-scope.mjs`, `scripts/release/wait-for-vercel-production-deployment.mjs`, `scripts/release/wait-for-host.mjs`, and `scripts/release/sync-hosted-convex-dev.mjs`. The canonical release libraries are now under `scripts/release/lib/`.

No compatibility wrappers were left behind. Root `package.json` public command names still call the same operator commands, but those commands now point at `scripts/release`. `.github/workflows/dev-staging-proof.yml` and `.github/workflows/production-release-proof.yml` now call release-owned helper paths. `.github/workflows/ci.yml` still calls QA-owned validation and inventory scripts under `qa/scripts`.

QA remains the owner of validation, inventory, persona, pack, team, ship, and report-oriented scripts until a later Program slice retires or replaces those surfaces. `qa/scripts/run-pack.mjs` now imports billing integration planning from `scripts/release/lib/billing-integration-step-planner.mjs`, and `qa/scripts/run-pack.mjs` remains billing-sensitive in release-scope classification.

Focused command validation passed for release triage, release intake, engineering-intake snapshot export, and release-scope detection from the new paths. Snapshot dry-run resolved and produced policy JSON, but intentionally exited nonzero because the current repo state has no open `dev -> main` release PR. The focused unit set passed with 13 files and 38 tests.

## Context and Orientation

The Program is moving Ship by Sunday toward a Codex-shaped release model. Plans 1 and 2 are already complete. Plan 1 documented the current proof surface and required checks. Plan 2 documented the release tag identity and hosted evidence contract. This plan prepares for workflow replacement by moving release infrastructure out of the QA control-plane folder before Plan 4 builds tag and evidence workflows.

The current command surface is split between root scripts, GitHub workflows, QA entrypoints, and app-owned scripts. Root `package.json` exposes operator commands such as `release:triage`, `release:snapshot`, `engineering:intake:release`, and `engineering:intake:snapshot`. These commands currently run files under `qa/scripts`. GitHub workflows call several `qa/scripts` files directly. Tests under `apps/web/tests/unit` import the release libraries from `qa/scripts/lib`.

The recommended target is a new `scripts/release/` tree. Entry points should live directly under `scripts/release/`, and reusable modules should live under `scripts/release/lib/`. Existing command names in root `package.json` should continue to work, but they should invoke the new release-owned paths. GitHub workflows should use the new paths for release-owned helper calls. QA-owned commands should stay where they are.

The term "release-critical helper" means a script or library that is part of release candidate classification, release path eligibility, hosted deployment identity, hosted environment synchronization, release evidence export, snapshot fallback, or post-snapshot reconcile behavior. The term "QA-owned helper" means a script or library that exists to maintain QA inventory, personas, journey packs, review scaffolding, run reports, or QA validation. Some helpers are shared during the transition; those should be handled with adapters and clear follow-up notes.

### In Scope

In scope is creating a release-owned script boundary, moving or wrapping release-critical helpers from `qa/scripts`, updating imports, updating root `package.json` scripts, updating direct workflow path references in `.github/workflows/dev-staging-proof.yml` and `.github/workflows/production-release-proof.yml`, and updating focused tests that currently import release helpers from `qa/scripts`. In scope is updating release-sensitive path classification inside `release-scope.mjs` so the new `scripts/release` helper paths keep triggering billing and Convex proof correctly. In scope is a narrow docs update to `docs/release-workflow.md`, `qa/README.md`, and this ExecPlan if paths or ownership descriptions change.

The release-critical helper set to evaluate includes `qa/scripts/release-triage.mjs`, `qa/scripts/export-release-intake.mjs`, `qa/scripts/export-engineering-intake-snapshot.mjs`, `qa/scripts/release-snapshot.mjs`, `qa/scripts/reconcile-post-snapshot-release.mjs`, `qa/scripts/detect-release-scope.mjs`, `qa/scripts/wait-for-vercel-production-deployment.mjs`, `qa/scripts/wait-for-host.mjs`, `qa/scripts/sync-hosted-convex-dev.mjs`, and release-related libraries under `qa/scripts/lib`: `release-triage-source.mjs`, `release-triage.mjs`, `release-intake-export.mjs`, `engineering-intake-contract.mjs`, `release-snapshot.mjs`, `release-reconcile.mjs`, `release-scope.mjs`, `vercel-deployments.mjs`, `convex-dev-sync.mjs`, and `billing-integration-step-planner.mjs`.

### Out Of Scope

Out of scope is deleting QA control-plane files, deleting QA journey or inventory CSVs, deleting committed run reports, deleting personas, deleting `qa:run-pack`, deleting browser or e2e harnesses, deleting the helper CLI, removing `bin/sbs`, changing `sbs:check`, removing the required `cli` context, creating `release.json`, creating `release-evidence.v1`, implementing tag-triggered workflows, changing GitHub branch protection or tag rulesets, adding CODEOWNERS, adding `.github/codex` automation, rotating credentials, or doing broad docs cleanup.

Out of scope is changing the behavior of release triage, snapshot fallback, release intake schemas, release scope classification, Vercel deployment selection, hosted Convex sync, billing proof routing, or QA packs except for import and path changes required by the relocation. If a behavior change looks necessary, record it in `Surprises & Discoveries`, add it as a future Program risk, and keep this slice focused on relocation unless the plan is updated and grilled again.

## Plan of Work

Start by refreshing the exact current dependency graph. Run `git status --short`, list `qa/scripts`, and use `rg` to find references to the release helpers across root scripts, workflows, tests, docs, and app scripts. Read the entrypoints and libraries before moving them. The goal is to avoid mistaking QA-owned helpers for release infrastructure or moving a shared utility without updating its dependents.

Next classify the helper set in this plan. Release-owned files should move to `scripts/release/` or `scripts/release/lib/`. QA-owned files should remain under `qa/scripts`. Shared transitional libraries should either move to `scripts/release/lib/` with QA code importing from that new path, or remain under `qa/scripts/lib/` only if they are truly QA-owned. The implementation should record the classification in this ExecPlan before moving files.

Then create the release-owned boundary. Use normal file moves where possible so git history remains understandable. Adjust relative imports in moved files from `./lib/...` to the new relative paths. For code that remains in QA but depends on a moved release library, such as `qa/scripts/run-pack.mjs` and `billing-integration-step-planner.mjs`, update the import to the new release-owned path. Prefer direct caller updates over compatibility wrappers. Leave a tiny wrapper under `qa/scripts` only if implementation discovers a hard blocker that makes direct updates unsafe, and document that wrapper as temporary for Plan 7.

After the files are in their new home, update root scripts and workflows. `package.json` should keep the public script names but point release commands at `scripts/release`. `.github/workflows/dev-staging-proof.yml` and `.github/workflows/production-release-proof.yml` should call `scripts/release/detect-release-scope.mjs`, `scripts/release/wait-for-vercel-production-deployment.mjs`, and `scripts/release/wait-for-host.mjs` for release-owned helpers. `.github/workflows/production-release-proof.yml` should also call `scripts/release/reconcile-post-snapshot-release.mjs` in the existing `reconcile_dev` job. `.github/workflows/ci.yml` should keep QA validation and inventory commands under `qa/scripts`.

Update focused tests to import release-owned libraries from `scripts/release/lib` and commands from `scripts/release`. Tests that prove QA pack planning may still live under `apps/web/tests/unit`, but their imports should reflect the canonical owner where they depend on release-owned libraries. Preserve fixtures and schema expectations. Do not rewrite test purpose or broaden coverage in this slice.

Finally update narrow docs. `docs/release-workflow.md` and `qa/README.md` should state that release triage, release intake, snapshot, Vercel, Convex, and release scope helpers are release-owned after relocation, while QA remains the temporary owner of pack execution, personas, inventory, and run reports. This ExecPlan must be updated throughout implementation with progress, decisions, and any wrappers left for later cleanup.

## Milestones

Milestone 1 verifies and classifies the helper surface. At the end of this milestone, the implementer has a recorded classification of release-owned, QA-owned, and transitional shared helpers, plus a list of root scripts, workflows, tests, and docs that reference them. Success means the move plan is based on current repo facts rather than the planning brief alone.

Milestone 2 creates the release-owned boundary and moves release-critical code. At the end of this milestone, release entrypoints and libraries live under `scripts/release/`, relative imports are repaired, and any compatibility wrappers are deliberate and documented. Success means the new release-owned command paths can run locally without import errors.

Milestone 3 updates callers and tests. At the end of this milestone, root scripts, GitHub workflow helper calls, and focused unit-test imports point at the release-owned boundary. QA-owned commands still run from `qa/scripts`. Success means old public command names such as `bun run release:triage` and `bun run engineering:intake:release` still work while the underlying files are release-owned.

Milestone 4 validates and documents the relocation. At the end of this milestone, focused unit tests and command dry-runs pass, narrow docs describe the new boundary, this ExecPlan reflects the actual work, and no unrelated QA, CLI, workflow-trigger, branch-protection, tag, or test-strategy changes were absorbed.

## Concrete Steps

1. Confirm the starting state and preserve unrelated work:

       cd /Users/parkerrex/Developer/ship-by-sunday
       git status --short

   Expect unrelated dirty work in the checkout. Do not revert it.

2. Refresh the helper inventory and references:

       find qa/scripts -maxdepth 2 -type f | sort
       rg -n "qa/scripts|release:triage|release:snapshot|engineering:intake|wait-for-vercel|wait-for-host|detect-release-scope|sync-hosted-convex|billing-integration-step-planner|vercel-deployments|release-scope|release-reconcile" package.json .github/workflows docs/release-workflow.md qa/README.md apps/web/tests qa apps/web/scripts

   Expected observation: root scripts and release workflows still call release helpers through `qa/scripts`, while `.github/workflows/ci.yml` calls QA-owned validation and inventory scripts.

3. Read the release helper files before moving them:

       sed -n '1,220p' qa/scripts/release-triage.mjs
       sed -n '1,260p' qa/scripts/lib/release-triage-source.mjs
       sed -n '1,200p' qa/scripts/export-release-intake.mjs
       sed -n '1,220p' qa/scripts/export-engineering-intake-snapshot.mjs
       sed -n '1,220p' qa/scripts/release-snapshot.mjs
       sed -n '1,220p' qa/scripts/reconcile-post-snapshot-release.mjs
       sed -n '1,180p' qa/scripts/detect-release-scope.mjs
       sed -n '1,260p' qa/scripts/wait-for-vercel-production-deployment.mjs
       sed -n '1,160p' qa/scripts/wait-for-host.mjs
       sed -n '1,160p' qa/scripts/sync-hosted-convex-dev.mjs
       sed -n '1,220p' qa/scripts/run-pack.mjs
       sed -n '1,120p' qa/scripts/lib/release-scope.mjs

   Record any newly discovered coupling in `Surprises & Discoveries`.

4. Create `scripts/release/` and `scripts/release/lib/`, then move release-owned files. The expected release-owned entrypoints are:

       scripts/release/release-triage.mjs
       scripts/release/export-release-intake.mjs
       scripts/release/export-engineering-intake-snapshot.mjs
       scripts/release/release-snapshot.mjs
       scripts/release/reconcile-post-snapshot-release.mjs
       scripts/release/detect-release-scope.mjs
       scripts/release/wait-for-vercel-production-deployment.mjs
       scripts/release/wait-for-host.mjs
       scripts/release/sync-hosted-convex-dev.mjs

   The expected release-owned libraries are:

       scripts/release/lib/billing-integration-step-planner.mjs
       scripts/release/lib/convex-dev-sync.mjs
       scripts/release/lib/engineering-intake-contract.mjs
       scripts/release/lib/release-intake-export.mjs
       scripts/release/lib/release-reconcile.mjs
       scripts/release/lib/release-scope.mjs
       scripts/release/lib/release-snapshot.mjs
       scripts/release/lib/release-triage-source.mjs
       scripts/release/lib/release-triage.mjs
       scripts/release/lib/vercel-deployments.mjs

   Do not move QA-owned `generate-test-inventory.mjs`, `personas.mjs`, `run-pack.mjs`, `ship.mjs`, `team.mjs`, `validate.mjs`, or QA-owned libraries unless this plan is updated with a specific reason.

5. Repair imports after the move. Search for stale imports and path references:

       rg -n "qa/scripts/(release|export|detect|wait|sync|reconcile)|qa/scripts/lib/(release|engineering-intake|vercel|convex-dev|billing-integration)" package.json .github/workflows apps/web/tests qa scripts docs

   Expected observation after repair: root release commands, release workflows, and unit tests reference `scripts/release` for release helpers. QA-owned scripts may still reference `scripts/release/lib` for shared transitional release planning logic.

6. Update `scripts/release/lib/release-scope.mjs` path classifications. Replace moved `qa/scripts` exact paths with their new `scripts/release` paths for release-owned helpers. Keep `qa/scripts/run-pack.mjs` billing-sensitive while QA owns pack execution, and add or preserve tests that prove release-owned helper changes still classify correctly. Do not broaden release-scope behavior beyond path ownership updates.

7. Update root scripts and workflows while preserving behavior. Keep public command names stable. Update only path references needed for the move. Do not change workflow triggers, job names, branch filters, permissions, environments, required check names, or tag behavior. Include the `reconcile-post-snapshot-release.mjs` path in `.github/workflows/production-release-proof.yml`.

8. Update focused unit-test imports. At minimum, update tests for:

       apps/web/tests/unit/billing-integration-step-planner.test.ts
       apps/web/tests/unit/convex-dev-sync.test.ts
       apps/web/tests/unit/engineering-intake-contract.test.ts
       apps/web/tests/unit/engineering-intake-snapshot.test.ts
       apps/web/tests/unit/export-release-intake-command.test.ts
       apps/web/tests/unit/qa-run-pack.test.ts
       apps/web/tests/unit/release-intake-export.test.ts
       apps/web/tests/unit/release-reconcile.test.ts
       apps/web/tests/unit/release-scope.test.ts
       apps/web/tests/unit/release-snapshot.test.ts
       apps/web/tests/unit/release-triage.test.ts
       apps/web/tests/unit/runtime-intake-export.test.ts
       apps/web/tests/unit/vercel-deployments.test.ts

9. Run focused command compatibility checks that do not require hosted secrets:

       bun run release:triage -- --output tmp/release-triage-after-helper-relocation.json
       bun run engineering:intake:release -- --output tmp/release-intake-after-helper-relocation.json
       bun run engineering:intake:snapshot -- --output tmp/engineering-intake-snapshot-after-helper-relocation.json
       node scripts/release/detect-release-scope.mjs --base=origin/main --head=origin/dev --output tmp/release-scope-after-helper-relocation.json
       node scripts/release/release-snapshot.mjs --dry-run || test $? -eq 1

   `release:snapshot --dry-run` may return `allowed: false` and exit with code 1 depending on current release PR state. That is acceptable if the command prints deterministic eligibility and plan JSON with the expected no-open-release-PR blocker. If `release:triage` reports metadata blockers because Vercel credentials are unavailable, that is acceptable only if the command exits successfully and the blocker text is the expected metadata limitation.

10. Run focused unit tests:

       bunx vitest run --project unit tests/unit/billing-integration-step-planner.test.ts tests/unit/convex-dev-sync.test.ts tests/unit/engineering-intake-contract.test.ts tests/unit/engineering-intake-snapshot.test.ts tests/unit/export-release-intake-command.test.ts tests/unit/qa-run-pack.test.ts tests/unit/release-intake-export.test.ts tests/unit/release-reconcile.test.ts tests/unit/release-scope.test.ts tests/unit/release-snapshot.test.ts tests/unit/release-triage.test.ts tests/unit/runtime-intake-export.test.ts tests/unit/vercel-deployments.test.ts

   Run from `apps/web` if invoking Vitest directly there, or use the repo-root command form:

       bun run --cwd apps/web test:unit -- tests/unit/billing-integration-step-planner.test.ts tests/unit/convex-dev-sync.test.ts tests/unit/engineering-intake-contract.test.ts tests/unit/engineering-intake-snapshot.test.ts tests/unit/export-release-intake-command.test.ts tests/unit/qa-run-pack.test.ts tests/unit/release-intake-export.test.ts tests/unit/release-reconcile.test.ts tests/unit/release-scope.test.ts tests/unit/release-snapshot.test.ts tests/unit/release-triage.test.ts tests/unit/runtime-intake-export.test.ts tests/unit/vercel-deployments.test.ts

11. Run structural validation:

       bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-relocate-release-critical-helpers-out-of-qa.md
       bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-24-relocate-release-critical-helpers-out-of-qa.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/program.md docs/release-workflow.md qa/README.md
       bun run programs:lint
       git diff --check -- docs/exec-plans/completed/2026-04-24-relocate-release-critical-helpers-out-of-qa.md scripts/release qa/scripts package.json .github/workflows/dev-staging-proof.yml .github/workflows/production-release-proof.yml .github/workflows/ci.yml apps/web/tests docs/release-workflow.md qa/README.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/program.md

## Validation and Acceptance

This slice is complete when release-critical helpers no longer have `qa/scripts` as their canonical home, public root command names still work, release workflows reference release-owned helper paths, focused unit tests pass against the new imports, and QA-owned control-plane behavior remains intact for later Program slices.

Acceptance requires a recorded helper classification, a canonical `scripts/release/` boundary, preserved output schemas for `release-intake.v1` and `engineering-intake.snapshot.v1`, unchanged release workflow triggers and job names except for helper path updates, and no deletion of QA, CLI, browser, tag, or GitHub policy surfaces.

If hosted credentials are unavailable locally, the slice can still complete with local command compatibility and unit proof, but it must record that Vercel and Convex hosted identity were not freshly proven in this local environment. The next workflow plan must prove those from CI or a credentialed environment.

### Test Commands

Run these commands from `/Users/parkerrex/Developer/ship-by-sunday` unless a command states another working directory:

       find qa/scripts scripts/release -maxdepth 2 -type f | sort
       rg -n "qa/scripts/(release|export|detect|wait|sync|reconcile)|qa/scripts/lib/(release|engineering-intake|vercel|convex-dev|billing-integration)" package.json .github/workflows apps/web/tests qa scripts docs
       bun run release:triage -- --output tmp/release-triage-after-helper-relocation.json
       bun run engineering:intake:release -- --output tmp/release-intake-after-helper-relocation.json
       bun run engineering:intake:snapshot -- --output tmp/engineering-intake-snapshot-after-helper-relocation.json
       node scripts/release/detect-release-scope.mjs --base=origin/main --head=origin/dev --output tmp/release-scope-after-helper-relocation.json
       node scripts/release/release-snapshot.mjs --dry-run || test $? -eq 1
       bun run --cwd apps/web test:unit -- tests/unit/billing-integration-step-planner.test.ts tests/unit/convex-dev-sync.test.ts tests/unit/engineering-intake-contract.test.ts tests/unit/engineering-intake-snapshot.test.ts tests/unit/export-release-intake-command.test.ts tests/unit/qa-run-pack.test.ts tests/unit/release-intake-export.test.ts tests/unit/release-reconcile.test.ts tests/unit/release-scope.test.ts tests/unit/release-snapshot.test.ts tests/unit/release-triage.test.ts tests/unit/runtime-intake-export.test.ts tests/unit/vercel-deployments.test.ts
       bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-relocate-release-critical-helpers-out-of-qa.md
       bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-24-relocate-release-critical-helpers-out-of-qa.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/program.md docs/release-workflow.md qa/README.md
       bun run programs:lint
       git diff --check -- docs/exec-plans/completed/2026-04-24-relocate-release-critical-helpers-out-of-qa.md scripts/release qa/scripts package.json .github/workflows/dev-staging-proof.yml .github/workflows/production-release-proof.yml .github/workflows/ci.yml apps/web/tests docs/release-workflow.md qa/README.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/program.md

## Idempotence and Recovery

The implementation should be staged so import repair and command validation can be rerun safely. File moves are idempotent once complete, but half-moved imports can create confusing module resolution failures. After each move group, run `rg` for old paths and run the focused unit tests for that group before moving on.

Do not use destructive git commands to recover. If a moved file needs to return to `qa/scripts`, move back only files changed by this slice and only after confirming no unrelated user work is in that file. If compatibility wrappers are added, keep them tiny and comment-free unless a comment is needed to explain that they are temporary bridges for a later QA-retirement plan.

Temporary JSON outputs under `tmp/` are scratch evidence and should not be committed unless a later plan explicitly asks for a committed fixture. If command validation writes to `tmp/`, leave those files untracked or remove only the files created by this slice after recording the relevant output in the ExecPlan.

If a workflow path update would force a larger workflow behavior change, stop and update this plan instead of silently implementing Plan 4. If a QA-owned script breaks because it depended on release libraries, prefer a narrow import update or wrapper rather than moving broad QA behavior.

## Artifacts and Notes

Program source:

       docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-3.md
       docs/programs/completed/2026-04-24-sbs-codex-release-reset/program.md
       docs/programs/completed/2026-04-24-sbs-codex-release-reset/dependency-graph.md
       docs/programs/completed/2026-04-24-sbs-codex-release-reset/plan-split-recommendation.md
       docs/programs/completed/2026-04-24-sbs-codex-release-reset/cross-repo-review.md

Completed prerequisite child plans:

       docs/exec-plans/completed/2026-04-24-reconcile-release-proof-and-required-checks.md
       docs/exec-plans/completed/2026-04-24-define-tag-release-identity-and-hosted-evidence-contract.md

Authoring-time reference facts from 2026-04-24:

       current required branch contexts: static, integration, browser-smoke, cli on both dev and main
       release tag contract: vMAJOR.MINOR.PATCH stable tags attest verified main SHA
       future version source: root release.json, not package versions
       future evidence target: release-evidence.v1
       current recommended release helper boundary: scripts/release/
       release workflow replacement remains blocked until this helper relocation lands

Current release helper callers found during plan authoring:

       package.json release commands call qa/scripts paths
       dev-staging-proof.yml and production-release-proof.yml call qa/scripts release helper paths directly
       apps/web/tests/unit release tests import qa/scripts/lib modules directly
       ci.yml calls QA-owned validate and inventory scripts that should stay in qa/scripts for this slice

Pre-implementation grill findings from 2026-04-24:

       release-scope.mjs hardcodes qa/scripts release helper paths as sensitive and must be updated to scripts/release paths
       production-release-proof.yml also calls qa/scripts/reconcile-post-snapshot-release.mjs
       convex-dev-sync.test.ts imports qa/scripts/lib/convex-dev-sync.mjs
       runtime-intake-export.test.ts imports qa/scripts/lib/engineering-intake-contract.mjs
       qa-run-pack.test.ts must remain in focused validation because run-pack imports the moved billing integration planner

Plan-writing validation from 2026-04-24:

       bun run plans:lint -- --plan docs/exec-plans/active/2026-04-24-relocate-release-critical-helpers-out-of-qa.md
       bun run markdown:lint -- --paths docs/exec-plans/active/2026-04-24-relocate-release-critical-helpers-out-of-qa.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/program.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-3.md docs/prompts/exec-plan-writer.md
       bun run programs:lint
       git diff --check -- docs/exec-plans/active/2026-04-24-relocate-release-critical-helpers-out-of-qa.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/program.md docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-3.md

These facts are orientation only. Implementation must rerun the inventory and reference commands and record fresh evidence in this plan before moving files.

## Interfaces and Dependencies

This plan depends on root `package.json` scripts, `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, `.github/workflows/ci.yml`, `docs/release-workflow.md`, `qa/README.md`, `qa/scripts`, `apps/web/tests/unit`, and `apps/web/scripts/export-runtime-intake.mjs`.

The public command interfaces that must remain stable are `bun run release:triage`, `bun run release:snapshot`, `bun run engineering:intake:release`, `bun run engineering:intake:snapshot`, and `bun run qa:convex:sync-hosted-dev`. The workflow helper interfaces that must remain stable are `detect-release-scope.mjs --base=<ref> --head=<ref>`, `wait-for-vercel-production-deployment.mjs --commit_sha=<sha>`, `wait-for-host.mjs --url=<url> --path=<path>`, and the snapshot reconcile command used by `production-release-proof.yml`.

The downstream Program dependency is Plan 4, `Implement Codex-Shaped CI And Tag Release Workflows`. Plan 4 must be able to call release-owned helper paths and eventually build tag validation plus `release-evidence.v1` without depending on disposable QA paths. Plan 7, `Retire Disposable QA Control Plane`, will own removing any temporary `qa/scripts` wrappers and deleting or archiving QA-only control-plane surfaces after release and browser proof dependencies are gone.
