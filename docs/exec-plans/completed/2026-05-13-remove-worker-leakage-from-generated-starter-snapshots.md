---
title: Remove Worker Leakage From Generated Starter Snapshots
status: complete
created_at: 2026-05-13
completed_at: 2026-05-13
summary: Make generated Starter repo snapshots exclude Worker, runner, and core-app operational code while preserving the generated operating pack.
post_build_recap: Generated Starter snapshots now explicitly exclude Worker routes, runner APIs, Worker Convex state, Codex bridge files, existing-codebase Worker components, and local-runner package paths, with compiler tests proving materialized snapshots and review-download zips stay clean.
program_id: public-product-split-starter-workers
planning_brief: docs/programs/active/2026-05-12-public-product-split-starter-workers/planning-brief-2.md
read_when:
  - Resuming the generated Starter snapshot purity slice.
  - Changing codebase-compiler repo download includes, excludes, or trace inputs.
  - Validating that Starter downloads do not contain Worker local-runner code.
---

# Remove Worker Leakage From Generated Starter Snapshots

This document is a living execution plan for making generated Starter repo snapshots stop shipping Worker and runner product code.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Starter buyers should receive a template app plus durable product source truth, not a copy of the Man Meets AI core product with Worker install surfaces inside it. After this slice, a generated repo download should still contain the generated docs, source truth, Program, ExecPlans, agent instructions, design system, and starter setup files, but it should not contain protected Worker pages, workspace runner API routes, Codex bridge endpoints, Worker Convex state, local-runner package entries, or Worker-only setup scripts. The visible proof is a materialized compiler snapshot and review-download zip whose path list has no Worker or runner leakage.

## Progress

- [x] 2026-05-13: Read root and package instructions, the active Program, compiler AGENTS, and ExecPlan contract before editing.
- [x] 2026-05-13: Used two explorer agents to map the generated snapshot assembly path and the intake/docs/Program/ExecPlan rendering path.
- [x] 2026-05-13: Created this child ExecPlan and linked it to planning brief 2.
- [x] 2026-05-13: Added explicit generated Starter snapshot forbidden path rules for Worker, runner, Codex bridge, Worker Convex, existing-codebase Worker component, and local-runner path families.
- [x] 2026-05-13: Updated snapshot, zip, and trace tests to prove Worker and runner paths stay out.
- [x] 2026-05-13: Ran focused compiler validation and package-level compiler gates.

## Surprises & Discoveries

The current generated repo path does not directly include `packages/local-runner`; the lockfile scrubber in `packages/codebase-compiler/src/repo-generation/render-starter-bun-lock.ts` already removes the local-runner workspace block and `ship-by-sunday` package entries. The leakage is mainly from broad app directory includes in `repo-download-source-contract.ts`: full `apps/web/app`, `apps/web/convex`, `apps/web/platform`, and `apps/web/scripts` pull Worker pages, runner API routes, Codex bridge code, and Worker setup scripts into Starter snapshots.

The generated operating spine already exists. `renderStarterOperatingPackFiles(...)` emits Program and ExecPlan contracts, an active Program, a planning brief, a first active ExecPlan, and lint scripts. This slice should preserve that rather than rebuild it.

The broader explicit-template rewrite remains real. Generated overrides still replace `apps/web/config/product.ts` and `apps/web/app/_content/home-page.ts` with smaller generated modules that do not match every import in the copied app. This slice hardens the generated snapshot boundary first; it does not claim the copied app has become a fully minimal standalone template.

After the first denylist pass, a content probe still found Worker product material in adjacent `existing-codebase-*` component folders and workspace read models. The final denylist includes those folders and files too, leaving the materialized snapshot with 889 files and zero path matches for the protected Worker and runner families named in this plan.

## Decision Log

Decision: Start with explicit denylisted paths instead of a full generated app rewrite.
Rationale: The user wants the program moving, and the immediate harmful behavior is Worker/runner leakage. A denylist with tests gives fast, durable protection while keeping the larger template extraction separately tractable.
Date: 2026-05-13.

Decision: Preserve generated Program and ExecPlan output in this slice.
Rationale: The product direction explicitly wants generated repos to include Programs and ExecPlans for future loops, and the compiler already renders them from intake-derived facts.
Date: 2026-05-13.

## Outcomes & Retrospective

Completed the generated Starter snapshot purity slice. `packages/codebase-compiler/src/repo-generation/customer-safe-snapshot-contract.ts` now records that generated Starter repos must exclude the public Workers page, protected Worker app pages, existing-codebase Worker setup/doctor/findings/support components, Worker workspace read models, workspace runner APIs, Codex bridge APIs, Worker Convex state, Codex platform bridge files, and `packages/local-runner`. `packages/codebase-compiler/src/repo-generation/repo-download-source-contract.ts` enforces those rules during snapshot materialization.

Tests now prove the contract at three levels: the exclusion helper rejects representative Worker/runner paths, `materializeRepoSnapshot(...)` contains no forbidden path families, and `buildReviewDownloadZip(...)` produces a zip without those entries. A direct snapshot probe after implementation returned `fileCount: 889` and `matches: []` for the Worker, runner, Codex bridge, existing-codebase Worker component, workspace read model, and local-runner path families.

Remaining gap: this is a boundary-hardening pass, not the deeper explicit template rewrite. The generated repo still copies broad non-Worker portions of the core app and still includes the compiler package. The next compiler slice should replace that broad app snapshot with a smaller generated template app whose runtime modules match the generated `product.ts` and homepage contracts.

## Context and Orientation

The generated repo download starts in `apps/web/app/api/download/repo/route.ts`, which calls `buildReviewDownloadZip(...)` from `@shipbysunday/codebase-compiler/server`. That zip builder uses `materializeRepoSnapshot(...)` in `packages/codebase-compiler/src/repo-generation/materialize-repo-snapshot.ts`. Snapshot materialization asks `buildRepoGenerationManifest(...)` for included files and directories. Those arrays are defined in `packages/codebase-compiler/src/repo-generation/repo-download-source-contract.ts`.

The generated overlay files are separate from the copied source files. `renderTemplateOverrides(...)` writes generated root files, generated app product config, and generated homepage content. `renderGeneratedDesignSystemFiles(...)` writes `DESIGN.md`, `docs/facts/design-system.json`, and `apps/web/config/generated-design-system.ts`. `renderGeneralizedStarterFiles(...)` writes generalized root assistant instructions and testing docs. `renderStarterOperatingPackFiles(...)` writes generated Program, ExecPlan, planning brief, and local lint scripts. `renderFullCodebaseTree(...)` writes generated docs and fact snapshots.

### In Scope

This slice owns path-level generated snapshot purity for Worker and runner separation. It may change `repo-download-source-contract.ts`, `customer-safe-snapshot-contract.ts`, compiler tests, app trace tests, and Program/ExecPlan docs. It should prove generated snapshots and review-download zips exclude Worker routes, workspace runner API routes, Worker Convex state, Codex bridge code, local-runner path references, and Worker-only setup scripts.

### Out Of Scope

Do not fully replace the copied app with a brand-new explicit minimal template in this slice. Do not change the customer questionnaire schema unless a missing field blocks the exclusion tests. Do not remove the generated operating pack, generated docs, generated design system, or starter skills. Do not try to migrate existing customers in this slice.

## Plan of Work

First, update `packages/codebase-compiler/src/repo-generation/customer-safe-snapshot-contract.ts` to name the Worker, runner, Codex bridge, and core-app operational path families that generated Starter repos must exclude. The contract is the durable explanation; it should say why each family belongs to the Man Meets AI core app or Workers product rather than the generated Starter template.

Next, update `packages/codebase-compiler/src/repo-generation/repo-download-source-contract.ts` so `isExcludedSnapshotPath(...)` catches the forbidden path prefixes even though the broad source directories are still included. Keep generated Program and ExecPlan path allowances working.

Next, update tests. `packages/codebase-compiler/tests/customer-safe-snapshot-contract.test.ts` should prove the new contract entries exist and that the exclusion helper catches representative forbidden paths. `packages/codebase-compiler/tests/repo-generation.test.ts` should prove materialized snapshots do not contain forbidden path families and do not contain `packages/local-runner`. `packages/codebase-compiler/tests/review-download-zip.test.ts` should prove the zip has the same guarantee. `apps/web/tests/unit/vercel-output-tracing.test.ts` should continue proving Vercel tracing aligns with compiler trace includes.

Finally, run focused compiler and app trace tests, then update this plan and the Program packet with the validation record.

## Milestones

The first milestone is a failing or meaningful characterization test for generated Starter purity. It is complete when tests name representative Worker, runner, Codex bridge, and local-runner paths that must not appear in generated snapshots.

The second milestone is the contract change. It is complete when the exclusion helper removes those path families from materialized snapshots while preserving generated Program, ExecPlan, design, docs, and setup files.

The third milestone is validation and handoff. It is complete when focused compiler tests pass, markdown/plan/program lint passes for touched docs, and this plan records the exact outcome and remaining gaps.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Run focused characterization after tests are edited:

    bun run --cwd packages/codebase-compiler test -- tests/customer-safe-snapshot-contract.test.ts tests/repo-generation.test.ts tests/review-download-zip.test.ts
    bun run --cwd apps/web test:unit -- tests/unit/vercel-output-tracing.test.ts

Run docs validation after this plan or Program packet changes:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-remove-worker-leakage-from-generated-starter-snapshots.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-remove-worker-leakage-from-generated-starter-snapshots.md docs/programs/active/2026-05-12-public-product-split-starter-workers

Before completion, run package-level compiler gates:

    bun run --cwd packages/codebase-compiler lint
    bun run --cwd packages/codebase-compiler typecheck
    bun run --cwd packages/codebase-compiler test
    git diff --check

## Validation and Acceptance

Acceptance requires `materializeRepoSnapshot(createCompleteProjectDefinition())` to exclude protected Worker app routes under `apps/web/app/(workspace)/workers`, workspace runner API routes under `apps/web/app/api/workspace/runner`, Codex account/generate bridge routes under `apps/web/app/api/codex`, Worker Convex state under `apps/web/convex/workspace*`, Codex platform bridge files under `apps/web/platform/codex`, and local-runner package paths. Acceptance also requires generated Program and ExecPlan files to remain present, because those are part of the Starter operating spine.

The test brief for this slice is: Feature: generated Starter snapshot purity. Risk: P1 core product because it changes the downloadable customer repo contract. Source of truth: compiler snapshot path list and zip entries. Must work: generated docs, design facts, Program, ExecPlan, setup scripts, and app starter files remain present; Worker and runner files are absent. Must fail safely: if a forbidden path family re-enters the snapshot, compiler tests fail. Tests: compiler unit tests for contract helper, materialized snapshot tests, zip tests, and Vercel trace alignment tests. CI gate: compiler test, compiler lint, compiler typecheck, app unit trace test, plan/program markdown lint.

### Test Commands

    bun run --cwd packages/codebase-compiler test -- tests/customer-safe-snapshot-contract.test.ts tests/repo-generation.test.ts tests/review-download-zip.test.ts
    bun run --cwd apps/web test:unit -- tests/unit/vercel-output-tracing.test.ts
    bun run --cwd packages/codebase-compiler lint
    bun run --cwd packages/codebase-compiler typecheck
    bun run --cwd packages/codebase-compiler test
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-remove-worker-leakage-from-generated-starter-snapshots.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-remove-worker-leakage-from-generated-starter-snapshots.md docs/programs/active/2026-05-12-public-product-split-starter-workers
    git diff --check

## Idempotence and Recovery

The exclusion helper is safe to rerun because it only filters generated snapshot paths. If a required generated file disappears, restore it by narrowing the forbidden prefix rather than bypassing the helper globally. If a copied source path is still required for the template app but matches a forbidden family, move or render a generated replacement file explicitly instead of shipping the Worker-owned original.

If tests expose that the generated app still depends on a forbidden Worker file, treat that as evidence for the next explicit-template extraction slice. Do not restore Worker files to the generated snapshot unless the Program decision changes.

## Artifacts and Notes

Explorer research found the existing materialized snapshot had about 960 files and multiple Worker/runner leakage path families, including protected Worker pages, runner API routes, Convex Worker state, Codex bridge code, and Worker Stripe setup scripts. The exact representative families are encoded in this plan and should become tests.

## Interfaces and Dependencies

This slice depends on `packages/codebase-compiler/src/repo-generation/repo-download-source-contract.ts` for included/excluded snapshot paths, `packages/codebase-compiler/src/repo-generation/customer-safe-snapshot-contract.ts` for durable contract documentation, `packages/codebase-compiler/src/repo-generation/materialize-repo-snapshot.ts` for applying exclusions, `packages/codebase-compiler/src/bundle/build-review-download-zip.ts` for zip output, `apps/web/config/vercel-output-tracing.ts` for deployment tracing, and compiler tests under `packages/codebase-compiler/tests/`.
