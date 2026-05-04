---
title: Retire Disposable QA Control Plane
status: complete
created_at: 2026-04-24
completed_at: 2026-04-24
summary: Replace the remaining QA-owned orchestration and bookkeeping with release-owned hosted proof and source-level tests so `qa/` no longer acts as the canonical control plane.
post_build_recap: Retired the active `qa/` control plane, replaced `qa:run-pack` with release-owned proof commands, archived historical proof reports, moved engineering-intake fixtures under `scripts/release/fixtures/`, removed QA command and CI surfaces, and validated the retained hosted proof semantics plus repo gates.
read_when:
  - Resuming the seventh child slice of the Codex release reset Program.
  - Retiring QA inventories, run-pack orchestration, personas, reports, or QA-team surfaces.
  - Checking boundaries before deleting hosted release proof, sandbox e2e, or release-critical helpers.
program_id: sbs-codex-release-reset
planning_brief: docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-7.md
---

# Retire Disposable QA Control Plane

This is a living execution plan. Keep it current as implementation, proof, and discoveries change the QA-control-plane retirement.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday has already replaced the helper CLI and shallow browser-smoke proof, but the repo still teaches `qa/` as the canonical QA control plane. That folder still owns scenario spreadsheets, coverage maps, test inventory bookkeeping, persona commands, pack orchestration, run-report scaffolding, QA-team review scaffolding, and docs that tell operators to use `qa:run-pack` for release proof.

After this plan is implemented, release proof should no longer depend on a bespoke QA control plane. Hosted `default_ship` and `billing_integration` proof must still exist because this is a hosted Vercel, Convex, Clerk, and Stripe product, but those release gates should be owned by release or app test commands rather than QA spreadsheets and report scaffolds. Source-level unit, integration, integration-ui, and retained sandbox Playwright tests should remain. A maintainer should be able to read root scripts, workflows, release docs, and public docs without seeing `qa/` described as the source of truth for what is safe to ship.

This is the seventh child slice of the Program at `docs/programs/completed/2026-04-24-sbs-codex-release-reset/`, governed by `planning-brief-7.md`.

## Progress

- [x] 2026-04-24 EDT: Created this child ExecPlan from `docs/programs/completed/2026-04-24-sbs-codex-release-reset/planning-brief-7.md`.
- [x] 2026-04-24 EDT: Grilled the plan before implementation and tightened the main boundary: Plan 7 may replace QA-owned command wrappers and delete disposable bookkeeping only after equivalent hosted release proof remains available from release-owned commands or direct app test commands. It must not delete `sandbox-e2e`, authenticated Playwright specs, hosted release proof semantics, release evidence artifacts, or release-critical helpers.
- [x] 2026-04-24 EDT: Added release-owned proof orchestration under `scripts/release/`: release env loading, release persona loading and preparation, Clerk target validation, and `release:proof` wrappers for `default_ship` and `billing_integration`.
- [x] 2026-04-24 EDT: Rewired CI and hosted proof workflows away from the QA control plane. `ci.yml` now exposes code-centric `static` and `integration` jobs, while `Dev Staging Proof` and `Production Release Proof` call `bun run release:proof`.
- [x] 2026-04-24 EDT: Removed root `qa:*` scripts, app-local QA handoff aliases, the `qa_control_plane` job, disposable QA CSVs, QA scripts, QA-team skill/config, and the active `qa/` directory.
- [x] 2026-04-24 EDT: Archived historical proof reports under `docs/archive/release-proof-runs/` and moved engineering-intake compatibility fixtures to `scripts/release/fixtures/engineering-intake/`.
- [x] 2026-04-24 EDT: Updated active repo docs, public docs, agent instructions, release skills, generated starter output, and compiler tests so active surfaces no longer teach `qa/` or `$qa-team` as the proof model.
- [x] 2026-04-24 EDT: Completed focused and broad validation. Replacement proof dry-runs, sandbox-e2e listings, moved fixture tests, generated starter tests, release manifest/evidence checks, workflow YAML parsing, format, lint, typecheck, plan lint, markdown lint, Program lint, and diff hygiene passed.

## Surprises & Discoveries

Plan authoring found that the repo is ahead of the previous stale handoff. `planning-brief-7.md` exists, the sixth child is complete at `docs/exec-plans/completed/2026-04-24-replace-browser-harness-proof-with-source-and-release-proof.md`, and browser-smoke is already gone from checked-in CI and scripts. This plan therefore starts at disposable QA retirement, not browser proof migration.

The remaining QA surface is not one system. Root `package.json` still exposes `qa:inventory:sync`, `qa:inventory:check`, `qa:validate`, `qa:personas:prepare`, `qa:personas:reset`, `qa:ship`, `qa:team`, and `qa:run-pack`. `.github/workflows/ci.yml` still has a `qa_control_plane` job that directly runs `node qa/scripts/validate.mjs` and `node qa/scripts/generate-test-inventory.mjs && git diff --exit-code -- qa/test-inventory.csv`. `Dev Staging Proof` and `Production Release Proof` still write `qa/personas.local.json` and run `bun run qa:run-pack` for `default_ship` and, when billing-sensitive, `billing_integration`.

`qa/scripts/run-pack.mjs` now mostly coordinates release proof rather than testing unique QA logic. It validates the QA control plane, prepares personas, scaffolds a run report, runs the codebase integration-ui proof suite, and runs either `apps/web` sandbox Playwright commands or hosted Stripe verifier commands. Billing steps are already built by `scripts/release/lib/billing-integration-step-planner.mjs`, which means part of the release-proof logic has moved to the release boundary but is still invoked through the QA pack wrapper.

`qa/scripts/validate.mjs` makes the disposable bookkeeping sticky. It requires `qa/README.md`, `qa/AGENTS.md`, `qa/glossary.md`, `qa/personas.example.json`, `qa/templates/*`, `qa/runs/README.md`, `qa/reviews/README.md`, `qa/test-inventory.csv`, `qa/scripts/team.mjs`, `.agents/skills/qa-team/SKILL.md`, `.codex/config.toml`, and several `.codex/agents/*.toml` files. It then validates `qa/journeys.csv`, `qa/coverage.csv`, and `qa/test-inventory.csv` against current test files. Deleting any of those files while `qa:validate` or `qa_control_plane` remains active will immediately fail CI.

The current `qa/` directory still contains historical release evidence under `qa/runs/`, engineering-intake fixtures under `qa/fixtures/engineering-intake/`, the persona protocol and examples, QA docs, CSV catalogs, templates, and the remaining scripts. Historical reports are referenced by release docs, so the safe default is to preserve or archive them, not delete them outright.

The deferred active plan `docs/exec-plans/active/2026-04-23-repair-release-intake-control-plane.md` still exists. This plan must not absorb release-intake correctness, runtime-intake grouping, or engineering-intake contract repair. If inventory finds a QA fixture or evidence map that the active intake repair needs, preserve it or explicitly mark it as owned by that other plan.

Implementation found one additional active source of QA reintroduction: generated customer starter output under `packages/codebase-compiler` still emitted `qa/` files and `$qa-team` prompts. That was not historical evidence; it would have shipped the retired operating model to customers. The generated starter now emits lightweight `docs/testing/` notes instead.

The `docs/codex/` archive and `todo.md` still contain historical references to `qa:*`, `qa/`, and QA-control-plane work. Those are historical records, not active instructions. The after-grep audit excludes legacy archives and historical proof reports.

## Decision Log

Decision: Make replacement proof the first implementation milestone.
Rationale: Removing `qa:run-pack` before release-owned hosted proof exists would remove the current automated path for auth, entitlement, checkout, billing, and deployment-environment evidence.
Date: 2026-04-24

Decision: Treat QA inventory, coverage, journeys, reports, and QA-team scaffolding as disposable only after dependencies are unwired.
Rationale: `.github/workflows/ci.yml`, root scripts, public docs, release docs, and QA validation still depend on those files. Deleting them first would reproduce the stale required-context failure pattern from the retired helper and browser-smoke lanes.
Date: 2026-04-24

Decision: Preserve sandbox e2e specs unless a same-strength replacement is proven.
Rationale: `apps/web/tests/e2e/auth-protection.sandbox.spec.ts` and `apps/web/tests/e2e/buyer-handoff.sandbox.spec.ts` still own authenticated browser behavior for `/codebase`, `/review`, `/settings`, and billing handoff. Source tests complement them but do not fully replace hosted Clerk, Convex, Stripe, and browser session proof.
Date: 2026-04-24

Decision: Do not mutate release-intake repair in this slice.
Rationale: `planning-brief-7.md` explicitly defers release-intake correctness to `docs/exec-plans/active/2026-04-23-repair-release-intake-control-plane.md`. Mixing that repair with QA retirement would blur ownership and make validation weaker.
Date: 2026-04-24

Decision: Archive historical QA evidence if docs still need it.
Rationale: `qa/runs/` contains release evidence cited by docs and useful for audit context. The goal is to retire the active QA control plane, not erase historical evidence that explains prior release state.
Date: 2026-04-24

Decision: Move generated starter verification notes to `docs/testing/` instead of shipping a customer `qa/` kit.
Rationale: Keeping generated starter `qa/` files would recreate the same spreadsheet/control-plane pattern this Program is retiring.
Date: 2026-04-24

## Outcomes & Retrospective

This plan is complete. The active QA control plane is gone from local commands, CI, release workflows, public docs, and generated customer starter output.

Replacement proof commands:

- `bun run release:personas:prepare -- --proof=default_ship`
- `bun run release:personas:prepare -- --proof=billing_integration`
- `bun run release:proof -- --proof=default_ship`
- `QA_ALLOW_BILLING_INTEGRATION=1 bun run release:proof -- --proof=billing_integration`
- dry-run variants with `--dry-run`

Retained hosted proof semantics:

- `default_ship` still prepares personas, runs the codebase integration-ui subset, and runs authenticated browser proof.
- `billing_integration` still enforces `QA_ALLOW_BILLING_INTEGRATION=1`, selects local sandbox versus hosted Stripe verifier behavior through the release-owned billing step planner, and rejects only-skipped browser proof.
- Workflow job names `default_ship`, `billing_integration`, and `release_gate` stayed stable for release evidence collection.

Deleted active control-plane surfaces include `qa/journeys.csv`, `qa/coverage.csv`, `qa/test-inventory.csv`, `qa/scripts/**`, `qa/templates/**`, `qa/reviews/**`, `qa/AGENTS.md`, `qa/README.md`, `.agents/skills/qa-team`, `.codex/config.toml`, and `.codex/agents/**`.

Archived or moved evidence and fixtures:

- `qa/runs/**` moved to `docs/archive/release-proof-runs/**`
- `qa/fixtures/engineering-intake/**` moved to `scripts/release/fixtures/engineering-intake/**`

The deferred release-intake repair plan was not absorbed. Its compatibility fixtures now live under the release-owned fixture path.

## Context and Orientation

`qa/` currently contains the repository's bespoke QA control plane. In plain English, the control plane is a file-backed QA spreadsheet plus scripts: `qa/journeys.csv` lists user journeys, `qa/coverage.csv` maps journeys to proof, `qa/test-inventory.csv` inventories test files, `qa/personas.json` describes test personas, `qa/personas.local.json` is the ignored credential file, `qa/scripts/run-pack.mjs` runs scenario packs, `qa/scripts/personas.mjs` provisions Clerk and Convex personas, `qa/scripts/ship.mjs` scaffolds run reports, `qa/scripts/team.mjs` scaffolds QA review notes, and `qa/scripts/validate.mjs` validates the whole control plane.

Release proof is different from QA bookkeeping. `Dev Staging Proof` and `Production Release Proof` in `.github/workflows/` are release workflows. They currently call `bun run qa:run-pack`, but the user-visible release requirement is not "run a QA spreadsheet." The real requirement is hosted proof that the deployed app at the target commit can handle auth, entitlement, checkout success, billing-sensitive handoff, Vercel identity, Convex identity, and Stripe state when those facts matter.

The app already has direct proof commands. Root scripts forward to `apps/web` for `test:unit`, `test:integration`, `test:integration:ui`, `test:e2e:sandbox`, `test:e2e:sandbox:default-ship`, `test:e2e:sandbox:billing-integration`, and `test:e2e:local-auth:default-ship`. `apps/web/playwright.config.ts` still defines the `sandbox-e2e` project. Billing proof command construction already lives partly under `scripts/release/lib/billing-integration-step-planner.mjs`.

The current CI workflow has only `qa_control_plane`, `static`, and `integration`. The checked-in required branch contexts are documented as `static` and `integration`, while `qa_control_plane` is described as release-important drift detection but not branch-required. Plan 7 may remove or replace `qa_control_plane` only after the disposable QA validation and inventory drift checks are no longer needed.

### In Scope

In scope is inventorying every active QA-owned surface; replacing `qa:run-pack` release calls with release-owned commands or direct app test commands that preserve `default_ship` and `billing_integration` hosted proof semantics; replacing or deleting root `qa:*` scripts once no workflow, doc, or local gate depends on them; removing or archiving QA journeys, coverage, test inventory, templates, run-report scaffolding, QA-team scaffolding, and QA docs after dependencies are unwired; and updating release docs, README, public docs, `qa/` docs, package scripts, workflows, and this Program to describe the new operating model.

In scope is moving small wrapper code out of `qa/scripts/` only when it is still needed for release proof and when the destination is an existing release or app-owned boundary such as `scripts/release/` or `apps/web` test scripts. The implementation should prefer direct existing app commands when they already express the proof clearly.

In scope is preserving or archiving historical `qa/runs/` evidence when current docs still cite it, and making those docs point at the archive path if files move.

### Out Of Scope

Out of scope is deleting hosted release proof semantics, removing billing-sensitive production proof, deleting `apps/web/tests/e2e/auth-protection.sandbox.spec.ts`, deleting `apps/web/tests/e2e/buyer-handoff.sandbox.spec.ts`, deleting the `sandbox-e2e` Playwright project, weakening persona secret handling, changing `release.json` semantics, changing tag-release evidence schemas, deleting release-critical helpers under `scripts/release/`, changing snapshot fallback, adding CODEOWNERS, adding broad GitHub policy automation, rotating credentials, or doing final historical docs archive cleanup beyond the files needed to retire active QA control-plane instructions.

Out of scope is repairing `docs/exec-plans/active/2026-04-23-repair-release-intake-control-plane.md`. If this plan encounters release-intake fixtures or contracts that are still required by that active plan, preserve them and document the dependency.

Out of scope is deleting source-level unit, contract, integration, integration-ui, or app Playwright tests merely because they are mentioned in QA CSV files. Source tests are the desired Codex-shaped proof surface.

## Plan of Work

Start with a read-only inventory. Search root scripts, workflows, docs, public docs, `.agents/skills/qa-team`, `.codex/agents`, `qa/`, `apps/web/tests`, `apps/web/playwright.config.ts`, and `scripts/release/` for `qa:`, `qa/`, `qa_control_plane`, `qa:run-pack`, `default_ship`, `billing_integration`, personas, journeys, coverage, test inventory, and run reports. Classify each match as one of these owners: release proof that must survive, source-test inventory bookkeeping, persona and auth bootstrap machinery, historical evidence, QA-team review scaffolding, CI drift detection, or active documentation. Record the classification in this plan before deleting anything.

Next build the replacement command path for hosted proof. For `default_ship`, preserve the behavior that `qa:run-pack` currently provides: environment loading, persona preparation, codebase integration-ui proof, and either local-auth or sandbox authenticated browser proof. For `billing_integration`, preserve the safety gate `QA_ALLOW_BILLING_INTEGRATION=1`, hosted dev versus hosted production verifier selection, local Stripe guardrails for local targets, and the no-only-skipped-browser-evidence check. Prefer release-owned scripts under `scripts/release/` or direct app commands over new QA wrappers. Update `Dev Staging Proof` and `Production Release Proof` to call the replacement commands only after they pass locally in dry-run or list mode.

Then unwind CI and root scripts in dependency order. Remove or replace `qa_control_plane` from `.github/workflows/ci.yml` only after `qa:validate` and `qa:inventory:check` are no longer expected proof. Remove `check:fast`'s dependency on `qa:validate` if that command is retired. Remove root `qa:*` scripts only after workflows and docs no longer call them. Keep `qa:convex:sync-hosted-dev` out of the deletion set because it already points at `scripts/release/sync-hosted-convex-dev.mjs`, not `qa/scripts`.

Then retire disposable files. Once scripts and workflows no longer need them, delete or archive `qa/journeys.csv`, `qa/coverage.csv`, `qa/test-inventory.csv`, `qa/scripts/generate-test-inventory.mjs`, `qa/scripts/validate.mjs`, `qa/scripts/ship.mjs`, `qa/scripts/team.mjs`, `qa/templates/`, `qa/reviews/`, `qa/AGENTS.md`, `qa/README.md`, `.agents/skills/qa-team/SKILL.md`, and QA-team-specific `.codex/agents` entries only if repo-level Codex config no longer needs them. Preserve `qa/personas.json`, `qa/personas.local.example.json`, and `qa/scripts/personas.mjs` until the replacement persona command exists elsewhere. Preserve `qa/runs/` or move it to a clearly named historical archive if docs still cite reports.

Finally update docs and validation. `README.md`, `docs/release-workflow.md`, `docs/RELIABILITY.md`, `docs/design-docs/scripts.md`, `apps/web/content/docs/commands.mdx`, `apps/web/content/docs/local-qa.mdx`, `apps/web/content/docs/deploy-to-vercel.mdx`, `apps/web/content/docs/ship-live.mdx`, and any remaining active docs should no longer say `qa/` is the canonical control plane or tell operators to run retired QA commands. They should point to source tests and release-owned hosted proof commands instead.

## Milestones

Milestone 1 maps ownership before deletion. At the end, this plan records which QA surfaces are release proof, which are disposable bookkeeping, which are historical evidence, and which belong to the deferred release-intake repair. Success means a fresh agent can name exactly what may be removed, what must move, and what must stay.

Milestone 2 creates replacement release-proof commands. At the end, `default_ship` and `billing_integration` hosted proof can run through release-owned commands or direct app commands without `qa:run-pack`, while preserving billing safety, persona preparation, target environment handling, and no-only-skipped-browser-evidence behavior. Success is proven with dry-run, list, or focused unit coverage for the command planner plus the retained app Playwright command listings.

Milestone 3 rewires workflows and root scripts. At the end, `Dev Staging Proof` and `Production Release Proof` no longer call `bun run qa:run-pack`, CI no longer runs disposable QA inventory drift checks, and root scripts no longer expose retired QA commands. Success means workflow YAML parses and grep shows no active workflow or package script depends on a deleted QA command.

Milestone 4 retires disposable QA docs and files. At the end, active docs no longer describe `qa/` as the canonical control plane, disposable QA spreadsheets and scaffolds are deleted or archived, and historical evidence remains findable if current docs cite it. Success means `rg` finds no active instructions to run retired QA commands outside historical archives or this plan.

Milestone 5 validates the slice and updates living artifacts. At the end, focused replacement proof, release evidence dry-run, broad root gates, plan lint, markdown lint, Program lint, and diff hygiene pass or have explicit blockers recorded. Success means the repo has a smaller Codex-shaped proof model without losing hosted release proof.

## Concrete Steps

1. Confirm the starting state and preserve unrelated work:

       cd /Users/parkerrex/Developer/ship-by-sunday
       git status --short
       cat docs/programs/completed/2026-04-24-sbs-codex-release-reset/current-planning-brief.txt
       test "$(cat docs/programs/completed/2026-04-24-sbs-codex-release-reset/current-planning-brief.txt)" = "planning-brief-7.md"

   Expect unrelated dirty files in the checkout. Do not revert them.

2. Run the read-only QA dependency inventory:

       rg -n "qa:|qa/|qa_control_plane|run-pack|default_ship|billing_integration|personas|journeys|coverage.csv|test-inventory|qa-team|sandbox-e2e|Playwright" package.json .github/workflows README.md docs apps/web/content/docs apps/web/tests apps/web/playwright.config.ts scripts/release qa .agents/skills/qa-team .codex/agents --glob '!qa/runs/local/**' --glob '!qa/reviews/local/**' --glob '!docs/exec-plans/**' --glob '!docs/programs/**'

   Classify every active match. Do not delete historical `qa/runs/` evidence or release-intake fixtures during this step.

3. Inspect the current QA command behavior before replacing it:

       sed -n '1,360p' qa/scripts/run-pack.mjs
       sed -n '1,260p' qa/scripts/personas.mjs
       sed -n '1,300p' qa/scripts/validate.mjs
       sed -n '1,260p' scripts/release/lib/billing-integration-step-planner.mjs

   Record which behavior must survive outside `qa/`: persona target-env validation, Clerk and Convex persona provisioning, pack safety gates, default-ship app tests, billing verifier selection, and only-skipped-browser detection.

4. Inspect workflow callers:

       sed -n '1,140p' .github/workflows/ci.yml
       rg -n "qa:run-pack|qa/personas.local.json|default_ship|billing_integration|release_gate" .github/workflows/dev-staging-proof.yml .github/workflows/production-release-proof.yml

   Expected observation: CI calls `qa/scripts/validate.mjs` and inventory sync directly, while release proof workflows call `bun run qa:run-pack`.

5. Add or move replacement command code. Prefer `scripts/release/` for release-owned orchestration and `apps/web` scripts for app-local Playwright command surfaces. If a new release wrapper is needed, it should accept the same environment variables used by the workflows today and produce clear JSON or terminal output that says which proof ran. Keep credentials in ignored files or GitHub secrets only; do not commit `qa/personas.local.json`.

6. Validate the replacement proof before deleting old wrappers. Use the exact commands produced by implementation, plus these baseline checks:

       bun run --cwd apps/web test:e2e:sandbox -- --list
       bun run --cwd apps/web test:e2e:sandbox:default-ship -- --list
       QA_ALLOW_BILLING_INTEGRATION=1 bun run --cwd apps/web test:e2e:sandbox:billing-integration -- --list
       bun run --cwd apps/web test:integration:ui -- tests/integration-ui/codebase-page.test.tsx tests/integration-ui/codebase-review-page.test.tsx tests/integration-ui/legacy-codebase-route-redirects.test.tsx

   The list commands prove the retained browser specs are still discoverable without spending live billing or requiring hosted credentials.

7. Rewire `.github/workflows/dev-staging-proof.yml` and `.github/workflows/production-release-proof.yml` away from `bun run qa:run-pack` only after the replacement command is proven. Preserve release job names `default_ship`, `billing_integration`, and `release_gate` unless there is a strong reason to change them, because `.github/workflows/release.yml` and release evidence collection look for those check-run names.

8. Rewire `.github/workflows/ci.yml` away from `qa_control_plane` only after disposable QA validation is retired. If the job is deleted, update `docs/release-workflow.md` and `qa/README.md` or its replacement docs so `qa_control_plane` is no longer described as active drift detection.

9. Remove root scripts that no active workflow or doc uses. Likely deletion candidates are `qa:inventory:sync`, `qa:inventory:check`, `qa:validate`, `qa:personas:prepare`, `qa:personas:reset`, `qa:ship`, `qa:team`, and `qa:run-pack`. Keep or rename `qa:convex:sync-hosted-dev` only if it remains useful as an alias to `scripts/release/sync-hosted-convex-dev.mjs`; otherwise move it to a release-named script.

10. Remove or archive disposable files only after commands and docs are unwired. Candidate deletion or archive set:

       qa/journeys.csv
       qa/coverage.csv
       qa/test-inventory.csv
       qa/scripts/generate-test-inventory.mjs
       qa/scripts/validate.mjs
       qa/scripts/ship.mjs
       qa/scripts/team.mjs
       qa/templates/
       qa/reviews/
       qa/AGENTS.md
       qa/README.md
       .agents/skills/qa-team/SKILL.md

   Keep `qa/personas.json`, `qa/personas.local.example.json`, `qa/scripts/personas.mjs`, and `qa/scripts/lib/*` until replacement persona code exists elsewhere. Keep `qa/fixtures/engineering-intake/` unless the deferred release-intake plan no longer needs it. Keep or archive `qa/runs/` depending on doc references.

11. Update docs. Active docs should describe the new proof surfaces and should not tell users that `qa/` is canonical. At minimum inspect and update:

       README.md
       docs/release-workflow.md
       docs/RELIABILITY.md
       docs/design-docs/scripts.md
       apps/web/content/docs/commands.mdx
       apps/web/content/docs/local-qa.mdx
       apps/web/content/docs/deploy-to-vercel.mdx
       apps/web/content/docs/ship-live.mdx

12. Run the after-grep audit:

       rg -n "qa:|qa/|qa_control_plane|run-pack|QA control plane|canonical QA|qa-team|journeys.csv|coverage.csv|test-inventory.csv" package.json .github/workflows README.md docs apps/web/content/docs apps/web/tests scripts/release .agents .codex packages/codebase-compiler --glob '!**/docs/exec-plans/**' --glob '!**/docs/programs/**' --glob '!**/docs/ship-by-sunday/**' --glob '!**/docs/archive/**' --glob '!**/docs/codex/**'

   Expected observation: active references either point to retained release-owned persona or hosted-proof code, or there are no matches outside historical/archive material and this active plan.

13. Run validation:

       bun run release:manifest:check
       bun run release:evidence:build
       ruby -e 'require "yaml"; Dir[".github/workflows/*.yml"].each { |file| YAML.load_file(file) }; puts "workflow yaml ok"'
       bun run format
       bun run lint
       bun run typecheck
       bun run plans:lint -- --plan docs/exec-plans/active/2026-04-24-retire-disposable-qa-control-plane.md
       bun run markdown:lint -- --paths docs/exec-plans/active/2026-04-24-retire-disposable-qa-control-plane.md README.md docs/release-workflow.md docs/RELIABILITY.md docs/design-docs/scripts.md apps/web/content/docs
       bun run programs:lint
       git diff --check

   If any command fails because of unrelated dirty work, record the exact command, paths, and error summary in this plan before continuing.

14. Close the loop. Update `Progress`, `Surprises & Discoveries`, `Decision Log`, `Outcomes & Retrospective`, and `Artifacts and Notes` with the actual replacement commands, deletion/archive list, workflow changes, docs changes, and validation receipts. Move this plan to `docs/exec-plans/completed/` only after implementation is done. Then run the Program planning refresh to write `planning-brief-8.md`.

## Validation and Acceptance

The slice is accepted only when `qa/` is no longer an active control plane for local checks, PR checks, release proof, or public operator docs. Hosted release proof for `default_ship` and `billing_integration` must still exist and must still fail closed when required proof fails or only skipped browser tests run. Source tests and retained sandbox Playwright tests must remain discoverable.

Release evidence must still be able to find the relevant check runs for `default_ship`, `billing_integration`, and release gates, or this plan must update release evidence code and tests deliberately. Do not rename workflow jobs casually.

After implementation, root scripts and workflows should not call deleted QA scripts. Active docs should not tell operators to run retired `qa:*` commands. Historical release reports may remain in an archive if current docs point to them as historical evidence rather than active instructions.

### Test Commands

Run these commands from `/Users/parkerrex/Developer/ship-by-sunday` after implementation, plus any new focused tests for moved wrapper code:

       rg -n "qa:|qa/|qa_control_plane|run-pack|QA control plane|canonical QA|qa-team|journeys.csv|coverage.csv|test-inventory.csv" package.json .github/workflows README.md docs apps/web/content/docs apps/web/tests scripts/release .agents .codex packages/codebase-compiler --glob '!**/docs/exec-plans/**' --glob '!**/docs/programs/**' --glob '!**/docs/ship-by-sunday/**' --glob '!**/docs/archive/**' --glob '!**/docs/codex/**'
       bun run --cwd apps/web test:e2e:sandbox -- --list
       bun run --cwd apps/web test:e2e:sandbox:default-ship -- --list
       QA_ALLOW_BILLING_INTEGRATION=1 bun run --cwd apps/web test:e2e:sandbox:billing-integration -- --list
       bun run release:proof -- --proof=default_ship --dry-run
       QA_ALLOW_BILLING_INTEGRATION=1 bun run release:proof -- --proof=billing_integration --dry-run
       bun run --cwd apps/web test:unit -- release-proof-command engineering-intake-contract release-scope
       bun run --cwd packages/codebase-compiler test -- repo-generation review-download-zip customer-safe-snapshot-contract --testTimeout=30000
       bun run release:manifest:check
       bun run release:evidence:build
       ruby -e 'require "yaml"; Dir[".github/workflows/*.yml"].each { |file| YAML.load_file(file) }; puts "workflow yaml ok"'
       bun run format
       bun run lint
       bun run typecheck
       bun run plans:lint -- --plan docs/exec-plans/active/2026-04-24-retire-disposable-qa-control-plane.md
       bun run markdown:lint -- --paths docs/exec-plans/active/2026-04-24-retire-disposable-qa-control-plane.md README.md docs/release-workflow.md docs/RELIABILITY.md docs/design-docs/scripts.md apps/web/content/docs
       bun run programs:lint
       git diff --check

## Idempotence and Recovery

Every removal step should be rerunnable. If a QA file is already gone, continue only after confirming no active script or workflow still references it. If workflow rewiring fails, restore the release proof call path before deleting QA wrappers. If the replacement command produces only skipped Playwright tests, treat that as missing proof and repair the command or environment instead of accepting the run.

If deleting QA inventory causes CI or `check:fast` to fail, stop and remove the dependency first rather than recreating the inventory. If deleting personas breaks hosted proof, move persona loading and provisioning into a release-owned or app-owned command and rerun focused proof before deleting the QA version.

If docs still cite historical reports under `qa/runs/`, either leave `qa/runs/` in place as historical evidence or move it to an archive path and update those references in the same change. Do not delete historical evidence merely to make grep clean.

If this slice collides with `docs/exec-plans/active/2026-04-23-repair-release-intake-control-plane.md`, preserve the intake fixture or contract and record the ownership conflict in both plans before continuing.

## Artifacts and Notes

Current active QA command surfaces observed during plan authoring:

       package.json: qa:inventory:sync, qa:inventory:check, qa:validate, qa:personas:prepare, qa:personas:reset, qa:ship, qa:team, qa:run-pack
       .github/workflows/ci.yml: qa_control_plane job runs qa validation and inventory drift checks
       .github/workflows/dev-staging-proof.yml: default_ship and billing_integration jobs write qa/personas.local.json and run qa:run-pack
       .github/workflows/production-release-proof.yml: default_ship and billing_integration jobs write qa/personas.local.json and run qa:run-pack
       qa/scripts/run-pack.mjs: pack orchestration and only-skipped-browser detection
       qa/scripts/personas.mjs: Clerk and Convex persona preparation
       qa/scripts/validate.mjs: CSV, docs, QA-team, and agent config validator
       qa/scripts/generate-test-inventory.mjs: qa/test-inventory.csv generator
       qa/scripts/ship.mjs and qa/scripts/team.mjs: local report and review scaffolding

Current retained proof surfaces observed during plan authoring:

       apps/web/playwright.config.ts: sandbox-e2e Playwright project
       apps/web/tests/e2e/auth-protection.sandbox.spec.ts
       apps/web/tests/e2e/buyer-handoff.sandbox.spec.ts
       apps/web test:e2e:sandbox:default-ship
       apps/web test:e2e:sandbox:billing-integration
       apps/web stripe:hosted:verify and stripe:hosted:verify:dev through scripts/release/lib/billing-integration-step-planner.mjs
       scripts/release/build-release-evidence.mjs and .github/workflows/release.yml check-run collection

Final validation receipts from 2026-04-24 EDT:

       rg active QA audit: passed with no active matches outside excluded legacy archives and historical proof reports
       bun run release:proof -- --proof=default_ship --dry-run: passed and planned persona prep, codebase integration-ui proof, and authenticated browser proof
       QA_ALLOW_BILLING_INTEGRATION=1 bun run release:proof -- --proof=billing_integration --dry-run: passed and planned Stripe doctor, persona prep, billing sandbox browser proof, and Stripe handoff verification
       bun run --cwd apps/web test:unit -- release-proof-command engineering-intake-contract release-scope: 3 files, 10 tests passed
       bun run --cwd packages/codebase-compiler test -- repo-generation review-download-zip customer-safe-snapshot-contract --testTimeout=30000: 3 files, 6 tests passed
       bun run --cwd apps/web test:e2e:sandbox -- --list: listed 7 retained sandbox tests
       bun run --cwd apps/web test:e2e:sandbox:default-ship -- --list: listed 5 default_ship tests
       QA_ALLOW_BILLING_INTEGRATION=1 bun run --cwd apps/web test:e2e:sandbox:billing-integration -- --list: listed 1 billing_integration test
       bun run release:manifest:check: passed for release.json v0.3.0
       bun run release:evidence:build: passed dry-run build and wrote unavailable hosted proof as blockers
       ruby workflow YAML parse: passed; Ruby printed local gem extension warnings before "workflow yaml ok"
       bun run format: passed on 1001 files
       bun run lint: passed with 0 warnings and 0 errors
       bun run typecheck: passed through Next build and TypeScript
       bun run plans:lint -- --plan docs/exec-plans/active/2026-04-24-retire-disposable-qa-control-plane.md: passed before completion move
       bun run markdown:lint -- --paths docs/exec-plans/active/2026-04-24-retire-disposable-qa-control-plane.md README.md docs/release-workflow.md docs/RELIABILITY.md docs/design-docs/scripts.md apps/web/content/docs packages/codebase-compiler/src/repo-generation packages/codebase-compiler/tests: passed
       bun run programs:lint: passed
       git diff --check: passed

## Interfaces and Dependencies

`package.json` at the repository root defines the public local command surface. The active release proof commands are now `release:personas:prepare`, `release:personas:reset`, `release:proof`, `release:proof:default-ship`, and `release:proof:billing-integration`.

`.github/workflows/ci.yml` defines code-centric CI with `static` and `integration`. The `qa_control_plane` job has been removed.

`.github/workflows/dev-staging-proof.yml` and `.github/workflows/production-release-proof.yml` are release-proof workflows. They keep the hosted proof job names and now materialize release personas at `tmp/release-personas.local.json` before calling `bun run release:proof`.

`scripts/release/lib/billing-integration-step-planner.mjs` is already release-owned billing proof orchestration. It should be reused or extended rather than duplicated in a new QA replacement.

`apps/web/playwright.config.ts` and `apps/web/tests/e2e/*.sandbox.spec.ts` are retained browser proof. They should survive this plan unless the implementation adds equal or stronger proof and updates the plan first.

`scripts/release/personas.json`, `scripts/release/personas.local.example.json`, `scripts/release/prepare-release-personas.mjs`, `scripts/release/lib/release-personas.mjs`, `scripts/release/lib/clerk-target.mjs`, and `scripts/release/lib/release-env.mjs` now own release persona protocol and target-env validation.

`docs/archive/release-proof-runs/` contains historical release evidence. It is not an active control plane by itself.

`docs/exec-plans/active/2026-04-23-repair-release-intake-control-plane.md` is a separate active plan. Engineering-intake fixtures moved to `scripts/release/fixtures/engineering-intake/`; this plan did not change release-intake contract behavior.
