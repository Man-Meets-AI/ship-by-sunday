---
summary: Eliminate private `packages/codebase-compiler/src/...` imports from `apps/web` and replace them with the workspace package’s public root and server exports. Add any missing server-side re-export needed to keep the app off internal compiler paths.
read_when: Open when `apps/web` still imports `packages/codebase-compiler/src/...` or needs to migrate to the public `@shipbysunday/codebase-compiler` surface.
plan_status: done
---

# Tighten the codebase-compiler package boundary

This is a living execution plan. Keep it updated as the import surface changes, the package exports move, or the validation strategy changes, so a new contributor can finish the work from this file alone.

This ExecPlan must be maintained in accordance with `.plans/PLANS.md`.

## Purpose / Big Picture

The goal is to stop `apps/web` from reaching into `packages/codebase-compiler/src/...` directly and make it consume only the package’s published entry points. In plain terms, a deep import means a file under `apps/web` imports a private source file from the package instead of importing the package by its public name.

Nothing visible to the user should change. The user-facing result is the same codebase flow and the same repo-download behavior. The benefit is internal: the web app becomes less brittle, because future compiler refactors can happen inside `packages/codebase-compiler` without forcing `apps/web` to follow private file paths.

## Progress

- [x] 2026-04-04 12:43 EDT: Read `AGENTS.md`, `.plans/PLANS.md`, `packages/codebase-compiler/AGENTS.md`, `apps/web/AGENTS.md`, and the package/app files that define the current boundary.
- [x] 2026-04-04 13:00 EDT: Added the missing `buildRepoDownloadTraceIncludes` re-export in `packages/codebase-compiler/src/server.ts`.
- [x] 2026-04-04 13:02 EDT: Rewrote `apps/web` imports to `@shipbysunday/codebase-compiler` and `@shipbysunday/codebase-compiler/server`, including the deep imports in `apps/web/config/vercel-output-tracing.ts` and `apps/web/convex/codebase/projectDefinition.ts`.
- [x] 2026-04-04 13:02 EDT: Removed the `@codebase-compiler` path aliases from `apps/web/tsconfig.json` and `apps/web/vitest.config.ts`.
- [x] 2026-04-04 13:11 EDT: Ran focused package and app tests, the legacy-import search, and the repository quality gates.

## Surprises & Discoveries

The package already has the right public shape for most of this work. `packages/codebase-compiler/package.json` already exports `.` and `./server`, and `apps/web/app/api/download/repo/route.ts` already imports `@shipbysunday/codebase-compiler/server`, so the workspace package name is already valid inside the app. The main gap is not package identity; it is that `apps/web` still uses a private alias, `@codebase-compiler`, in many files and still deep-imports helpers from `packages/codebase-compiler/src/...`.

The migration surface is slightly broader than the first reconnaissance pass suggested. `apps/web/config/vercel-output-tracing.ts` still deep-imports the repo-download trace helper, and `apps/web/convex/codebase/projectDefinition.ts` still deep-imports canonical project-definition helpers and fixtures. The other `@codebase-compiler` imports are already going through the package root, just under the old alias. There is also explanatory prose in `apps/web/content/docs/ship-by-sunday-cli.mdx` that names internal compiler paths, but that text is not an import boundary and can stay out of scope for this plan unless the team wants the docs wording aligned too.

## Decision Log

- Decision: Standardize `apps/web` on `@shipbysunday/codebase-compiler` and `@shipbysunday/codebase-compiler/server` instead of keeping the `@codebase-compiler` alias. Rationale: the workspace package already exists under the stable name, and `apps/web` already consumes that package name in at least one route file, so the alias is unnecessary. Date: 2026-04-04.
- Decision: Re-export `buildRepoDownloadTraceIncludes` from `packages/codebase-compiler/src/server.ts` instead of creating a new package subpath. Rationale: the helper is server/build infrastructure, and the existing `./server` entry is the right public surface for it. Date: 2026-04-04.
- Decision: Leave explanatory docs out of scope for the first pass. Rationale: this initiative is about runtime and test import boundaries, not prose references, and keeping the diff narrow reduces risk. Date: 2026-04-04.

## Outcomes & Retrospective

Completed. `apps/web` now consumes the compiler through the stable workspace package name, the server helper needed for Vercel output tracing is publicly re-exported from the server entry, and the local alias plus source-path shim are gone. The structural proof is the empty search for `@codebase-compiler|packages/codebase-compiler/src/` under `apps/web/{app,config,convex,features,tests}`, and the behavioral proof is that the package tests, app test lanes, and root gates all passed.

## Context and Orientation

`packages/codebase-compiler` is the compiler package that owns canonical codebase data, stage definitions, readiness rules, and repo-generation helpers. Its public root entry is `packages/codebase-compiler/src/index.ts`, and its server entry is `packages/codebase-compiler/src/server.ts`. The package name itself is `@shipbysunday/codebase-compiler` in `packages/codebase-compiler/package.json`.

`apps/web` currently knows about the package in two different ways. Most code imports `@codebase-compiler`, which is only a local alias defined in `apps/web/tsconfig.json` and `apps/web/vitest.config.ts`. A smaller number of files already use the real workspace name, including `apps/web/app/api/download/repo/route.ts` and `apps/web/tests/integration/codebase-download-routes.test.ts`. Two files, `apps/web/config/vercel-output-tracing.ts` and `apps/web/convex/codebase/projectDefinition.ts`, currently bypass the package export map entirely by importing private source files with relative paths.

The important consumers live in `apps/web/features/codebase-flow/**`, `apps/web/tests/**`, `apps/web/convex/codebase/projectDefinition.ts`, `apps/web/config/vercel-output-tracing.ts`, `apps/web/features/course/shared/components/app-shell/app-shell-props.ts`, and `apps/web/features/execute-ship/components/bonus-lesson-page.tsx`. Those files use the compiler for field helpers, stage IDs, readiness, render metadata, and test fixtures. `apps/web/next.config.ts` already transpiles `@shipbysunday/codebase-compiler`, so the app build path is already prepared for the stable package name. Any edit under `apps/web/convex/**` must also respect the rules in `apps/web/convex/_generated/ai/guidelines.md`, because Convex function files have stricter registration and validator expectations than ordinary app code.

## Plan of Work

First, make the package export surface complete enough that `apps/web` never needs to touch `packages/codebase-compiler/src/...` directly. The only missing public edge is `buildRepoDownloadTraceIncludes`, so `packages/codebase-compiler/src/server.ts` should re-export it from `./repo-generation/repo-download-source-contract`. That keeps the helper on the existing server-facing surface instead of exposing a new package path.

Second, rewrite every `apps/web` import that still says `@codebase-compiler` to `@shipbysunday/codebase-compiler`. That includes the codebase-flow components, hooks, and helper modules; the Convex codebase project-definition code in `apps/web/convex/codebase/projectDefinition.ts`; the app route at `apps/web/app/api/download/repo/route.ts`; the Vercel tracing helper at `apps/web/config/vercel-output-tracing.ts`; the course shell props; the execute-ship lesson component; and the unit and integration tests that build codebase fixtures and verify behavior.

Third, remove the `@codebase-compiler` path aliases from `apps/web/tsconfig.json` and `apps/web/vitest.config.ts` once the import rewrite is complete. The app should resolve the package by its real workspace name instead of a private alias, and the Vitest/TypeScript config should stop pointing at `packages/codebase-compiler/src/index.ts` and `packages/codebase-compiler/src/server.ts`.

## Milestones

The first milestone is to publish the missing server helper through the package’s public server entry. At the end of that slice, `packages/codebase-compiler/src/server.ts` will expose `buildRepoDownloadTraceIncludes`, and the package tests will still pass with the server-side repo-generation code exercised through the public entry. This is independently verifiable with the package test command.

The second milestone is to migrate `apps/web` off the old alias and off the remaining deep imports. At the end of that slice, every code file and test under `apps/web` will import `@shipbysunday/codebase-compiler` or `@shipbysunday/codebase-compiler/server`, and no app-side file will reference `packages/codebase-compiler/src/...`. This is independently verifiable with a search over `apps/web` code directories and the app test commands.

The third milestone is to clean up the resolution shims and prove the workspace still builds cleanly. At the end of that slice, `apps/web/tsconfig.json` and `apps/web/vitest.config.ts` will no longer mention the private `src` paths, and the package and app quality gates will pass together. This is independently verifiable with formatting, lint, typecheck, and focused tests.

## Concrete Steps

From `/Users/parkerrex/Projects/ship-by-sunday`, update `packages/codebase-compiler/src/server.ts` first so the helper needed by `apps/web/config/vercel-output-tracing.ts` is publicly reachable. Then update the app consumers one subtree at a time, starting with the deep import in `apps/web/config/vercel-output-tracing.ts`, then the Convex file, then the `apps/web/features/codebase-flow/**` files, and finally the tests under `apps/web/tests/**`.

After the import rewrite, remove the `@codebase-compiler` entries from `apps/web/tsconfig.json` and `apps/web/vitest.config.ts`. Keep the `@/*` alias and the existing `@shipbysunday/codebase-compiler` dependency in `apps/web/package.json`; this plan is about eliminating the fake alias, not changing the package graph.

Run the validation commands from the repository root in this order so the narrowest checks fail fast before the broader gates:

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run --cwd packages/codebase-compiler format:check
    bun run --cwd packages/codebase-compiler lint
    bun run --cwd packages/codebase-compiler typecheck
    bun run --cwd packages/codebase-compiler test
    bun run --cwd apps/web test:unit
    bun run --cwd apps/web test:integration-ui
    bun run format
    bun lint
    bun typecheck
    rg -n '@codebase-compiler|packages/codebase-compiler/src/' apps/web/{app,config,convex,features,tests}

The `rg` command should print nothing for the code directories after the migration. The test commands should finish with zero exit status, and the final three root commands should leave the workspace clean or only change files that were already intended edits.

## Validation and Acceptance

The work is done when `apps/web` code no longer imports `packages/codebase-compiler/src/...` and no file under `apps/web/{app,config,convex,features,tests}` still imports `@codebase-compiler`. The stable imports must be `@shipbysunday/codebase-compiler` for the package root and `@shipbysunday/codebase-compiler/server` for server-side helpers.

The proof is both structural and behavioral. Structural proof is the empty legacy-import search and the removal of the alias entries from `apps/web/tsconfig.json` and `apps/web/vitest.config.ts`. Behavioral proof is that the package tests, the relevant app tests, and the root quality gates all pass:

    bun run --cwd packages/codebase-compiler test
    bun run --cwd apps/web test:unit
    bun run --cwd apps/web test:integration-ui
    bun run format
    bun lint
    bun typecheck

If any of those commands fail, the failure should be treated as a real regression until the import path or package export is corrected.

## Idempotence and Recovery

The edits in this plan are mechanical and safe to rerun. If a search-and-replace only partially lands, rerun the search and finish the remaining import sites; nothing in this change set mutates data or external state.

If a package or app test fails because a private path still exists, fix the remaining import instead of restoring the old alias. The recovery path is always to move closer to the public export surface, not to reintroduce `src`-pointing shims.

If `bun run format` rewrites files, rerun it once after the code edits and before the final checks. There is no deployment rollback or data migration here, so recovery is limited to source edits and rerunning validation.

## Artifacts and Notes

A successful package export change should make this kind of import possible without touching `packages/codebase-compiler/src/...`:

    import { buildRepoDownloadTraceIncludes } from "@shipbysunday/codebase-compiler/server";
    import { createCompleteProjectDefinition } from "@shipbysunday/codebase-compiler";

A successful boundary check should look like this:

    rg -n '@codebase-compiler|packages/codebase-compiler/src/' apps/web/{app,config,convex,features,tests}
    # expected: no output

The most important regression tests in this plan are `apps/web/tests/unit/vercel-output-tracing.test.ts`, which protects the repo-download trace include list, and `apps/web/tests/integration-ui/codebase-test-fixtures.ts`, which proves the app test tree can build codebase fixtures through the public package name.

Observed proof snippets:

    $ rg -n '@codebase-compiler|packages/codebase-compiler/src/' apps/web/{app,config,convex,features,tests}
    # no output

    $ bun run --cwd apps/web test:unit
    Test Files  108 passed (108)

    $ bun run --cwd apps/web test:integration:ui
    Test Files  19 passed (19)

## Interfaces and Dependencies

`packages/codebase-compiler/src/index.ts` remains the public root contract for canonical project definitions, stage definitions, readiness, public artifact labels, and field helpers. `packages/codebase-compiler/src/server.ts` is the public server contract for repo generation and the new `buildRepoDownloadTraceIncludes` export. `packages/codebase-compiler/package.json` should keep exporting `.` and `./server` through that contract.

`apps/web/tsconfig.json` and `apps/web/vitest.config.ts` are the only app-side resolution shims that need to change. They currently point `@codebase-compiler` at package source files; after this migration they should stop naming those source files entirely. `apps/web/package.json` already depends on `@shipbysunday/codebase-compiler`, and `apps/web/next.config.ts` already transpiles that package, so no new dependency or Next config change is required.

`apps/web/config/vercel-output-tracing.ts` depends on the server-side repo-download trace helper, and the codebase-flow files and tests depend on the root package exports for types, stage metadata, readiness, and canonical project-definition helpers. `apps/web/convex/codebase/projectDefinition.ts` depends on the same root package exports and must continue to satisfy `apps/web/convex/_generated/ai/guidelines.md` after the import rewrite. `apps/web/tests/unit/vercel-output-tracing.test.ts` and the existing package tests under `packages/codebase-compiler/tests` are the main guardrails that should stay green while the import surface changes.
