---
title: Generated Starter Snapshot Purity Planning Brief 2
program_id: public-product-split-starter-workers
brief_version: 2
status: current
summary: Remove Worker and runner leakage from generated Starter repo snapshots before the larger explicit-template extraction.
read_when:
  - Writing or resuming the generated Starter snapshot purity ExecPlan.
  - Changing codebase-compiler repo snapshot includes, excludes, or download tracing.
  - Checking why Worker/local-runner code is not allowed in generated Starter repos.
---

# Generated Starter Snapshot Purity Planning Brief 2

## Planning Context

The first Program slice completed the public route, checkout, and access split. The next unresolved dependency is generated repo purity: Starter generated repos should be clean template apps influenced by intake answers, with source truth, Program, ExecPlans, and agent instructions for future loops. They should not ship Worker local-runner code or protected Worker product surfaces.

Current compiler research found that `packages/codebase-compiler/src/repo-generation/materialize-repo-snapshot.ts` builds a generated repo by reading a manifest from `buildRepoGenerationManifest(...)`, copying broad directories from `repo-download-source-contract.ts`, and then overlaying generated files from `renderTemplateOverrides(...)`, `renderGeneratedDesignSystemFiles(...)`, `renderGeneralizedStarterFiles(...)`, and `renderFullCodebaseTree(...)`.

The broad directory includes are the immediate defect. `customerSafeAppDirectoryPaths` includes full `apps/web/app`, `apps/web/convex`, `apps/web/platform`, and `apps/web/scripts`, which currently pulls protected Worker routes, workspace runner API routes, Convex Worker state, Codex bridge code, and Worker setup scripts into a Starter download. `packages/local-runner` is not directly included, and `render-starter-bun-lock.ts` already removes local-runner lockfile entries, but the generated snapshot still leaks Worker and runner application code through the app directory copy.

## Next Plan Recommendation

Exact next plan title: `Remove Worker Leakage From Generated Starter Snapshots`.

Exact target path: `docs/exec-plans/active/2026-05-13-remove-worker-leakage-from-generated-starter-snapshots.md`.

Exact scope: add an explicit Starter snapshot denylist for Worker, runner, Codex bridge, existing-codebase Worker component, Worker workspace read-model, Worker Convex, and local-runner path families that should not ship in a generated Starter repo; update the customer-safe snapshot contract; update compiler tests to assert those paths stay out of materialized snapshots and download zips.

Exact boundaries: do not fully rewrite the generated app into a hand-authored minimal template in this slice. Do not change the customer questionnaire schema unless a missing field blocks snapshot purity. Do not remove Program/ExecPlan rendering; it is already part of the generated operating spine and should remain.

## Success Criteria

The slice succeeds when `materializeRepoSnapshot(createCompleteProjectDefinition())` no longer contains protected Worker routes, workspace runner API routes, Worker Convex files, Codex bridge files, existing-codebase Worker component folders, workspace read models, or local-runner package references; the review-download zip has the same guarantee; and focused compiler tests pass.
