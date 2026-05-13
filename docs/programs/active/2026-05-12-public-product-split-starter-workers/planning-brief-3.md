---
title: Explicit Generated Template App Planning Brief 3
program_id: public-product-split-starter-workers
brief_version: 3
status: current
summary: Replace broad copied core-app routes in generated Starter repos with an explicit template app that can pass clean-room app validation.
read_when:
  - Writing or resuming the explicit generated template app ExecPlan.
  - Changing codebase-compiler app snapshot includes, generated app runtime files, or clean-room generated repo checks.
  - Checking why generated Starter repos should not copy the Man Meets AI core app route tree.
---

# Explicit Generated Template App Planning Brief 3

## Planning Context

The second generated-repo slice blocked Worker, runner, Codex bridge, and local-runner leakage with explicit path tests. A clean-room app typecheck now exposes the next dependency: generated repos still copy broad non-Worker core-app routes, and those copied files import Worker-only modules that are intentionally excluded. The generated repo is therefore cleaner, but the runnable app contract is still inherited from the core Man Meets AI app instead of from a first-class Starter template.

The current generation path is `materializeRepoSnapshot(...)` in `packages/codebase-compiler/src/repo-generation/materialize-repo-snapshot.ts`. It copies manifest paths from `repo-download-source-contract.ts`, then applies generated overrides from `renderTemplateOverrides(...)`, `renderGeneratedDesignSystemFiles(...)`, `renderGeneralizedStarterFiles(...)`, and `renderFullCodebaseTree(...)`.

The immediate failure was reproduced by materializing `createCompleteProjectDefinition()`, running `bun ci`, and then running `bun run --cwd apps/web typecheck` in the generated repo. `bun ci` passed. The app typecheck failed during Next build because copied protected app routes imported `apps/web/app/(protected)/_components/codex-connection-card/codex-connection-card` and `apps/web/app/(protected)/_components/existing-codebase-doctor-pass/workspace-doctor-pass-toast-watcher`, which are Worker-owned files now excluded from Starter snapshots.

## Next Plan Recommendation

Exact next plan title: `Extract Explicit Generated Template App`.

Exact target path: `docs/exec-plans/active/2026-05-13-extract-explicit-generated-template-app.md`.

Exact scope: stop including the broad `apps/web/app` route tree in generated Starter snapshots; render an explicit small Next app shell from intake-derived facts; keep generated source truth, docs, Program, ExecPlans, design system, and app setup files; and add clean-room generated repo validation that runs the app typecheck/build path.

Exact boundaries: do not build the full future Starter application generator in this slice. Do not change the questionnaire schema unless the existing facts cannot render the template. Do not remove generated docs, Program/ExecPlan output, starter skills, or the customer-safe workspace packages required by the generated contract. Do not reintroduce Worker, runner, Codex bridge, or local-runner paths.

## Success Criteria

The slice succeeds when `materializeRepoSnapshot(createCompleteProjectDefinition())` contains generated app files such as `apps/web/app/layout.tsx`, `apps/web/app/page.tsx`, `apps/web/app/globals.css`, `apps/web/config/product.ts`, and `apps/web/app/_content/home-page.ts`, while no broad core-app route files are copied. A clean-room generated repo must pass `bun ci`, `bun run codebase:contract`, `bun run agentic:check`, and `bun run --cwd apps/web typecheck`.
