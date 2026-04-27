---
title: Remove Generic Feature Surfaces
status: complete
created_at: 2026-04-26
completed_at: 2026-04-26
summary: Delete the generic shared hook and public metadata feature folders by moving their code to clearer app-owned homes.
post_build_recap: The generic autosave hook now lives in apps/web/hooks, sitemap content indexing now lives under apps/web/app/_metadata, and the features/shared and features/public-metadata folders are deleted with focused and app-wide validation passing.
program_id: remove-feature-folder-surface
planning_brief: docs/programs/completed/2026-04-26-remove-feature-folder-surface/planning-brief-1.md
read_when:
  - Resuming the first feature-folder reduction slice.
  - Checking why this slice deletes features/shared and features/public-metadata.
  - Validating the generic hook and sitemap helper moves.
---

# Remove Generic Feature Surfaces

This is a living execution plan for deleting two non-domain feature folders.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The app still has generic and route-metadata code under `apps/web/features`, which makes the feature tree look like a catch-all. After this slice, the generic autosave hook will live in `apps/web/hooks`, sitemap support will live beside the App Router metadata route, and the `features/shared` and `features/public-metadata` folders will be gone. Users should see no route or UI behavior change; the proof is import scans plus the existing focused unit tests.

## Progress

- [x] 2026-04-26 EDT: Created the owning Program packet and this first active child ExecPlan.
- [x] 2026-04-26 EDT: Confirmed `features/shared` contains only `hooks/use-autosave.ts` and `features/public-metadata` contains only `server/content-route-index.ts`.
- [x] 2026-04-26 EDT: Moved the generic autosave hook to `apps/web/hooks/use-autosave.ts`.
- [x] 2026-04-26 EDT: Moved the sitemap helper to `apps/web/app/_metadata/content-route-index.ts` and updated its `webRoot` calculation for the new location.
- [x] 2026-04-26 EDT: Deleted the old `apps/web/features/shared` and `apps/web/features/public-metadata` folders.
- [x] 2026-04-26 EDT: Import scans found no remaining `@/features/shared`, `features/shared`, `@/features/public-metadata`, or `features/public-metadata` references under `apps/web`; `find` confirmed both old folders are absent.
- [x] 2026-04-26 EDT: Updated `tests/unit/use-autosave.test.tsx` to render the hook with the app's own `react` and `react-dom/client` pair, avoiding the nested `@testing-library/react` renderer copy that caused duplicate-React dispatcher failures.
- [x] 2026-04-26 EDT: Focused unit validation passed for `tests/unit/use-autosave.test.tsx` and `tests/unit/public-metadata-routes.test.ts`.
- [x] 2026-04-26 EDT: App format check, app lint, app typecheck, plan lint, Program lint, markdown lint, and `git diff --check` passed.

## Surprises & Discoveries

2026-04-26 EDT: The first focused test run caught that `content-route-index.ts` needed `../..`, not `..`, after moving from `features/public-metadata/server` to `app/_metadata`.

2026-04-26 EDT: The same focused run hit the local duplicate-React test harness issue in `tests/unit/use-autosave.test.tsx`, with `@testing-library/react/node_modules/react-dom` setting a different React dispatcher than the root `react` import used by the moved hook. Vite's `resolve.dedupe` did not affect that nested CommonJS renderer, so the focused test now uses the app's own `react` and `react-dom/client` pair directly.

## Decision Log

Decision: Move `useAutosave` to `apps/web/hooks`.
Rationale: It is a generic client hook, not a feature-domain module.
Date: 2026-04-26

Decision: Move `content-route-index.ts` to `apps/web/app/_metadata`.
Rationale: The helper is private support for App Router public metadata routes, not a product feature.
Date: 2026-04-26

Decision: Keep the React dispatcher fix local to the moved hook test.
Rationale: The focused hook test exposed duplicate React resolution from nested test dependencies, but a broad Vitest config change did not fix that CommonJS renderer. The smallest stable proof is to render this hook with the app's own React renderer pair.
Date: 2026-04-26

## Outcomes & Retrospective

This slice is complete. It deleted two non-domain feature folders and left their behavior in clearer homes: `apps/web/hooks/use-autosave.ts` for the generic hook and `apps/web/app/_metadata/content-route-index.ts` for private sitemap support. The only test harness change was keeping the autosave proof on the app's own React renderer pair, which removed a duplicate-React artifact from the focused test without changing production hook behavior.

## Context and Orientation

`apps/web/features/shared/hooks/use-autosave.ts` is a client-only debounce hook. Its only known first-party consumer is `apps/web/tests/unit/use-autosave.test.tsx`.

`apps/web/features/public-metadata/server/content-route-index.ts` reads MDX files under `apps/web/content/docs` and `apps/web/content/blog` to build sitemap entries. Its production consumer is `apps/web/app/sitemap.ts`, and its focused test is `apps/web/tests/unit/public-metadata-routes.test.ts`.

### In Scope

Move `useAutosave` to `apps/web/hooks/use-autosave.ts`, update its test import, and delete `apps/web/features/shared`.

Move `content-route-index.ts` to `apps/web/app/_metadata/content-route-index.ts`, update `apps/web/app/sitemap.ts`, and delete `apps/web/features/public-metadata`.

Update this ExecPlan and the owning Program as implementation reality changes.

### Out Of Scope

Do not move settings, workspace home, starter, starter-repo, course, checkout, product-access, observability, Codex, docs, blog, marketing, or workspace-shell files in this slice.

Do not change route behavior, sitemap output, robots output, billing, checkout, Stripe, webhook, pricing, promotion codes, environment behavior, Convex schema, generated Convex files, AppShell, route screens, or shared UI inventory.

## Plan of Work

First create the replacement directories. Move the autosave hook into `apps/web/hooks/use-autosave.ts` without changing its code. Update `apps/web/tests/unit/use-autosave.test.tsx` to import from `@/hooks/use-autosave`. If the focused hook test resolves nested React through `@testing-library/react`, render the hook with the app's own `react` and `react-dom/client` pair instead of changing production code.

Then move the metadata helper into `apps/web/app/_metadata/content-route-index.ts`. Because the helper computes `webRoot` from its own file location, update the relative path in the `path.resolve(...)` call so it still points at `apps/web`. Update `apps/web/app/sitemap.ts` to import from `./_metadata/content-route-index`.

After both imports are updated, delete the old `apps/web/features/shared` and `apps/web/features/public-metadata` folders. Run scans proving no feature-path references remain.

## Milestones

The first milestone is the generic hook move. It is complete when `useAutosave` lives under `apps/web/hooks`, the unit test imports the new path, and no old shared feature import remains.

The second milestone is the metadata helper move. It is complete when `apps/web/app/sitemap.ts` imports from the private metadata helper and the public metadata feature folder no longer exists.

The third milestone is validation. It is complete when focused tests pass, app lint and typecheck pass, plan and Program docs pass their linters, markdown lint passes for the touched docs, and `git diff --check` passes.

## Concrete Steps

From repo root, confirm branch and status:

    git status --short --branch

Move files and update imports:

    apps/web/features/shared/hooks/use-autosave.ts -> apps/web/hooks/use-autosave.ts
    apps/web/features/public-metadata/server/content-route-index.ts -> apps/web/app/_metadata/content-route-index.ts

Run import scans after edits:

    rg '@/features/(shared|public-metadata)|features/(shared|public-metadata)' apps/web
    find apps/web/features/shared apps/web/features/public-metadata -maxdepth 3 -type f

The first scan should return no matches. The second command should fail with missing paths because the folders were deleted.

## Validation and Acceptance

Acceptance requires no old imports, no old folders, and unchanged behavior in the focused tests. The sitemap test must still find `/`, `/blog`, `/docs/local-setup`, and the published blog post URL. The autosave test must still prove delayed save, unmount cleanup, and latest callback behavior.

### Test Commands

Run these commands from repo root:

    bun run --cwd apps/web test:unit -- tests/unit/use-autosave.test.tsx tests/unit/public-metadata-routes.test.ts
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-26-remove-generic-feature-surfaces.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/active/2026-04-26-remove-feature-folder-surface docs/exec-plans/completed/2026-04-26-remove-generic-feature-surfaces.md
    git diff --check

## Idempotence and Recovery

These moves are safe to rerun by checking the current file location before editing imports. If the sitemap test fails because `webRoot` points at the wrong directory, adjust only the `path.resolve(...)` ancestry in `apps/web/app/_metadata/content-route-index.ts` and rerun the focused test. If import scans find old paths, update the consumers rather than adding compatibility re-exports.

## Artifacts and Notes

Baseline scans:

    rg '@/features/(shared|public-metadata)|features/(shared|public-metadata)' apps/web
    apps/web/tests/unit/use-autosave.test.tsx:5:import { useAutosave } from "@/features/shared/hooks/use-autosave";
    apps/web/app/sitemap.ts:7:} from "@/features/public-metadata/server/content-route-index";

## Interfaces and Dependencies

`useAutosave` depends on React client hooks and must keep `"use client"` at the top of `apps/web/hooks/use-autosave.ts`. Its focused unit test should use the same React renderer pair as the hook so the test proves hook behavior instead of Testing Library package layout.

`content-route-index.ts` depends on `node:fs/promises`, `node:path`, and `node:url`, and remains server-only by usage through `apps/web/app/sitemap.ts`. It does not need a public `@/features` import path.
