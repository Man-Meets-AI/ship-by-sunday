---
title: Extract Explicit Generated Template App
status: complete
created_at: 2026-05-13
completed_at: 2026-05-13
summary: Make generated Starter repos ship an explicit runnable template app instead of a broad copy of the Man Meets AI core app.
post_build_recap: Generated Starter repos now render a small intake-shaped Next app shell instead of copying the core app route tree, and the clean-room generated repo test proves the generated app typechecks.
program_id: public-product-split-starter-workers
planning_brief: docs/programs/active/2026-05-12-public-product-split-starter-workers/planning-brief-3.md
read_when:
  - Resuming the generated template app extraction slice.
  - Changing generated Starter app files, snapshot includes, or clean-room generated repo validation.
  - Checking why generated repos no longer copy the core app route tree.
---

# Extract Explicit Generated Template App

This document is a living execution plan for making generated Starter repos ship a first-class generated app shell.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Starter buyers should receive a repo that can run as their generated template app, not a partial copy of the Man Meets AI product with protected routes surgically removed. The prior slice removed Worker and runner leakage, but a clean-room app typecheck still fails because broad copied workspace routes import excluded Worker-owned modules. After this slice, the generated repo should contain an explicit small Next app whose homepage, metadata, design tokens, and product copy are rendered from the customer intake facts, while the generated docs, Program, ExecPlans, and starter skills remain intact.

## Progress

- [x] 2026-05-13: Read root instructions, compiler instructions, Program contract, ExecPlan contract, active Program, generated snapshot contract, manifest, renderer, and clean-room generated repo test.
- [x] 2026-05-13: Reproduced the current generated app failure. `bun ci` passed in a clean generated repo, then `bun run --cwd apps/web typecheck` failed because copied workspace routes import Worker-only component paths that are intentionally excluded.
- [x] 2026-05-13: Created planning brief 3 and this active child ExecPlan.
- [x] 2026-05-13: Added `renderGeneratedTemplateAppFiles(...)` to render generated `apps/web/app/layout.tsx`, `apps/web/app/page.tsx`, `apps/web/app/globals.css`, `apps/web/config/product.ts`, `apps/web/app/_content/home-page.ts`, and a minimal `apps/web/next.config.ts`.
- [x] 2026-05-13: Narrowed generated snapshot app includes so broad core app directories are no longer copied; generated snapshots now keep only app setup files plus generated app runtime files.
- [x] 2026-05-13: Updated compiler snapshot, zip, trace, and clean-room generated repo tests. The clean-room test now runs `bun run --cwd apps/web typecheck`.
- [x] 2026-05-13: Ran focused compiler tests, the app trace unit test, compiler lint, compiler typecheck, and the full compiler test suite successfully.
- [x] 2026-05-13: Ran docs validation, repo `format`, repo `lint`, repo `typecheck`, restored the tracked `apps/web/next-env.d.ts` route-type reference after Next build output rewrote it, and confirmed `git diff --check` is clean.

## Surprises & Discoveries

The existing no-provider generated repo contract does not run the app. It proves `bun ci`, Program lint, ExecPlan lint, the generated Codebase contract, and `agentic:check`, but it does not catch route-tree build failures. The new proof needs to run the generated app typecheck path.

The generated app failure is a good dependency signal rather than a reason to restore Worker files. The copied app route tree still depends on Worker modules, and the correct fix is to stop copying that route tree into Starter output.

The generated snapshot dropped from roughly 889 files after the snapshot-purity pass to 158 files after the explicit-template pass. The app still keeps the current `apps/web/package.json` dependency declarations for now so the generated root lockfile remains installable without turning this slice into dependency pruning.

Running the root app typecheck rewrites `apps/web/next-env.d.ts` from `.next/dev/types/routes.d.ts` to `.next/types/routes.d.ts`. The tracked repo expects the dev route-type reference, so this slice restores that generated local change after typecheck.

## Decision Log

Decision: Render a small generated Next app shell instead of trying to make the copied core app typecheck.
Rationale: The product decision is that Starter generated repos are template apps. Making the core app compile after deleting Worker files would preserve the wrong boundary and create more fragile exclusions.
Date: 2026-05-13.

Decision: Keep the generated operating pack and customer-safe workspace packages in this slice.
Rationale: Starter value includes generated source truth, docs, Program, ExecPlans, and agent instructions. Removing those would solve app build noise by deleting the actual product contract.
Date: 2026-05-13.

## Outcomes & Retrospective

Completed the explicit generated template app extraction. `packages/codebase-compiler/src/repo-generation/repo-download-source-contract.ts` no longer includes broad app directories such as `apps/web/app`, `apps/web/convex`, `apps/web/platform`, or `apps/web/scripts`. `packages/codebase-compiler/src/repo-generation/render-generated-template-app-files.ts` now renders the small generated Next app shell from the canonical project facts and generated design system.

The generated repo keeps the source truth, generated docs, design facts, Program, ExecPlans, starter skills, and customer-safe workspace packages. It no longer copies the Man Meets AI workspace routes, public blog routes, protected Worker routes, runner APIs, Codex bridge code, or local-runner package. The clean-room generated repo contract now proves `bun ci`, `bun run codebase:contract`, `bun run agentic:check`, and `bun run --cwd apps/web typecheck`.

Remaining gap: this slice intentionally did not prune the generated app dependency list. The app package still inherits broad tracked dependencies so the existing lockfile remains stable. A future package-pruning slice can simplify generated dependencies and scripts if needed.

## Context and Orientation

Generated repo downloads are assembled by `packages/codebase-compiler/src/repo-generation/materialize-repo-snapshot.ts`. The manifest comes from `packages/codebase-compiler/src/repo-generation/build-repo-generation-manifest.ts`, which reads include arrays from `packages/codebase-compiler/src/repo-generation/repo-download-source-contract.ts`. The current broad include array copies `apps/web/app` and other core app folders before generated overrides are applied.

Generated files are layered afterward. `renderTemplateOverrides(...)` currently writes the root README, root package, bootstrap script, generated `apps/web/config/product.ts`, and generated `apps/web/app/_content/home-page.ts`. `renderGeneratedDesignSystemFiles(...)` writes `DESIGN.md`, `docs/facts/design-system.json`, and `apps/web/config/generated-design-system.ts`. `renderStarterOperatingPackFiles(...)` writes customer-safe Program and ExecPlan files plus lint scripts. This plan should add or extend renderer code so generated app runtime files are rendered from the same `CanonicalProjectDefinition` facts.

### In Scope

This slice may change compiler snapshot include arrays, generated app renderers, generated app content/config files, compiler tests, clean-room generated repo tests, and the active Program packet. It should render a minimal Next app that can build without Clerk, Convex, Stripe, Worker, runner, Codex bridge, or core-app route dependencies.

### Out Of Scope

Do not build the final customizable application generator in this slice. Do not add new questionnaire facts unless existing facts cannot render the template. Do not remove generated docs, Program/ExecPlan output, starter setup skills, or generated design-system facts. Do not migrate existing customers or change live public app routes in this slice.

## Plan of Work

First, update the snapshot contract and include arrays so generated Starter snapshots no longer copy the broad `apps/web/app` route tree or other core app runtime folders. Keep the source files needed to install and build the generated app, such as package metadata, TypeScript config, PostCSS config, and the serialized Next build script.

Next, add a generated template app renderer. It should render `apps/web/app/layout.tsx`, `apps/web/app/page.tsx`, `apps/web/app/globals.css`, `apps/web/config/product.ts`, `apps/web/app/_content/home-page.ts`, and a minimal `apps/web/next.config.ts`. The page should read generated product content and generated design-system data instead of importing the core homepage implementation.

Next, update compiler tests so materialized snapshots contain the explicit generated app files, do not contain copied workspace routes, and still contain generated docs, source truth, Program, ExecPlans, and starter skills.

Finally, strengthen the clean-room generated repo command test so it runs the generated app typecheck path after `bun ci` and the no-provider operating-pack checks.

## Milestones

The first milestone is a template app renderer. It is complete when the generated snapshot contains an explicit `apps/web/app/page.tsx` and `apps/web/app/layout.tsx` whose imports are limited to generated config/content/design files.

The second milestone is manifest narrowing. It is complete when materialized snapshots no longer include core app routes such as `apps/web/app/(workspace)/layout.tsx`, `apps/web/app/(workspace)/settings/_components/settings-page.tsx`, or public marketing pages from the Man Meets AI app.

The third milestone is clean-room proof. It is complete when the generated repo command contract runs `bun ci`, operating-pack checks, and `bun run --cwd apps/web typecheck` successfully in a temporary generated repo.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

After the renderer and manifest changes, run focused compiler tests:

    bun run --cwd packages/codebase-compiler test -- tests/repo-generation.test.ts tests/review-download-zip.test.ts tests/generated-repo-command-contract.test.ts

Run package-level compiler gates:

    bun run --cwd packages/codebase-compiler lint
    bun run --cwd packages/codebase-compiler typecheck
    bun run --cwd packages/codebase-compiler test

Run docs validation for this plan and the Program:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-13-extract-explicit-generated-template-app.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-13-extract-explicit-generated-template-app.md docs/programs/active/2026-05-12-public-product-split-starter-workers

Before completion, run the repo-level gates required by root instructions:

    bun run format
    bun run lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run typecheck
    git diff --check

## Validation and Acceptance

Acceptance requires a generated repo materialized from `createCompleteProjectDefinition()` to install and pass the generated app typecheck in a clean temporary directory. The generated snapshot must retain generated docs, facts, design system, Program, ExecPlans, starter skills, and customer-safe workspace packages. It must not contain copied core app route files, Worker routes, runner APIs, Codex bridge code, local-runner package files, or deleted Worker component dependencies.

The test brief for this slice is: Feature: explicit generated Starter template app. Risk: P1 core product because it changes the downloadable customer repo contract and app build path. Source of truth: clean-room generated repo directory, generated app files, and Next build/typecheck result. Must work: generated repo installs, generated operating-pack commands pass, and `apps/web` typechecks/builds. Must fail safely: if broad core app files or Worker dependencies re-enter the snapshot, compiler tests or clean-room typecheck fail. Tests: compiler snapshot tests, review zip tests, clean-room generated repo command test, compiler lint/typecheck/test, plan/program lint. CI gate: compiler package tests, generated-output contract, docs lint, repo format/lint/typecheck.

### Test Commands

    bun run --cwd packages/codebase-compiler test -- tests/repo-generation.test.ts tests/review-download-zip.test.ts tests/generated-repo-command-contract.test.ts
    bun run --cwd packages/codebase-compiler lint
    bun run --cwd packages/codebase-compiler typecheck
    bun run --cwd packages/codebase-compiler test
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-13-extract-explicit-generated-template-app.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-13-extract-explicit-generated-template-app.md docs/programs/active/2026-05-12-public-product-split-starter-workers
    bun run format
    bun run lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run typecheck
    git diff --check

## Idempotence and Recovery

The renderer should be deterministic from `CanonicalProjectDefinition`. If the generated app fails typecheck, inspect the missing import and either render a small generated replacement or stop copying the file that introduced the dependency. Do not recover by restoring Worker-owned files to the generated snapshot.

If `bun ci` fails because package files and `bun.lock` drift, prefer preserving dependency declarations that match the tracked lockfile in this slice. Changing generated dependency sets can be a later package-pruning slice with its own lockfile proof.

## Artifacts and Notes

Characterization command output before this slice:

    CI_STATUS 0
    TYPECHECK_STATUS 1
    Module not found: Can't resolve '@/app/(workspace)/_components/codex-connection-card/codex-connection-card'
    Module not found: Can't resolve '@/app/(workspace)/_components/existing-codebase-doctor-pass/workspace-doctor-pass-toast-watcher'

This proves the generated repo no longer leaks those Worker paths, but copied core app routes still try to import them.

## Interfaces and Dependencies

This slice depends on `packages/codebase-compiler/src/repo-generation/repo-download-source-contract.ts`, `packages/codebase-compiler/src/repo-generation/materialize-repo-snapshot.ts`, `packages/codebase-compiler/src/repo-generation/render-template-overrides.ts`, any new generated app renderer added under `packages/codebase-compiler/src/repo-generation/`, `packages/codebase-compiler/tests/repo-generation.test.ts`, `packages/codebase-compiler/tests/review-download-zip.test.ts`, and `packages/codebase-compiler/tests/generated-repo-command-contract.test.ts`.
