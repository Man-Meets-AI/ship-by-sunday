---
title: Remove Workspace Navigation Feature Surface
status: complete
created_at: 2026-04-27
completed_at: 2026-04-27
summary: Delete the workspace-navigation feature folder by moving workspace navigation components, models, and routing helpers to explicit non-feature owners without changing route behavior.
post_build_recap: Workspace navigation UI now lives under the workspace App Router private component tree, shared navigation models and routing helpers live under apps/web/lib/workspace-navigation, and the old feature folder is deleted. Focused navigation tests, app format/lint/typecheck, Program/ExecPlan lint, markdown lint, and diff checks passed.
program_id: remove-feature-folder-surface
planning_brief: docs/programs/active/2026-04-26-remove-feature-folder-surface/planning-brief-6.md
read_when:
  - Resuming the workspace-navigation feature-folder removal slice.
  - Checking why workspace navigation UI lives under the workspace App Router group.
  - Validating that no features/workspace-navigation references remain.
---

# Remove Workspace Navigation Feature Surface

This is a living execution plan for deleting the workspace-navigation feature folder.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The workspace navigation code is shared workspace chrome and route-model logic, not a standalone product feature. After this slice, the two client navigation components should live under the protected workspace App Router group, and the route/model helpers should live under a named library owner that Convex and React code can import without referencing `apps/web/features/workspace-navigation`. The visible result should be unchanged navigation in AppShell, Review, and bonus lesson surfaces, with no old workspace-navigation feature imports left.

## Progress

- [x] 2026-04-27 EDT: Created branch `codex/remove-workspace-navigation-feature-surface` from `main` at `7d0d690`.
- [x] 2026-04-27 EDT: Read `apps/web/AGENTS.md` and the local Next.js project structure and server/client component docs. Private App Router folders are non-routable, and the moved interactive nav components must keep their client boundary.
- [x] 2026-04-27 EDT: Created planning brief 6 and this active child ExecPlan.
- [x] 2026-04-27 EDT: Moved workspace navigation UI to `apps/web/app/(workspace)/_components/workspace-navigation` and navigation models/helpers to `apps/web/lib/workspace-navigation`.
- [x] 2026-04-27 EDT: Deleted `apps/web/features/workspace-navigation`; `rg '@/features/workspace-navigation|features/workspace-navigation' apps/web` returned no matches and `find apps/web/features/workspace-navigation -maxdepth 3 -type f` confirmed the folder is absent.
- [x] 2026-04-27 EDT: Focused unit, contract, and integration-ui tests passed, followed by app format check, app lint, app typecheck, completed ExecPlan lint, Program lint, markdown lint, and `git diff --check`.

## Surprises & Discoveries

2026-04-27 EDT: The focused workspace primary nav integration-ui test hit the existing local duplicate-React package layout through Radix NavigationMenu. The test now mocks the shared navigation-menu primitives while still exercising this repo's `WorkspacePrimaryNav` rendering, viewport-less prop wiring, dropdown content rendering, and class contract.

## Decision Log

Decision: Move navigation UI components to `apps/web/app/(workspace)/_components/workspace-navigation`.
Rationale: They render protected workspace navigation and are not route screens. Next.js private folders keep them non-routable while making the workspace owner explicit.
Date: 2026-04-27

Decision: Move navigation models and route helpers to `apps/web/lib/workspace-navigation`.
Rationale: The helpers are shared by App Router UI, feature-domain lesson surfaces, tests, and Convex files. A named library folder is a clearer shared owner than a top-level feature folder, and Convex can keep relative imports into that folder.
Date: 2026-04-27

## Outcomes & Retrospective

This slice is complete. `apps/web/features/workspace-navigation` was deleted, the interactive workspace nav components now live under the workspace App Router private component tree, and the shared route/model helpers now live under `apps/web/lib/workspace-navigation`. The focused proof covered primary navigation rendering, navigation model behavior, legacy lesson-map href behavior, post-review resume destination behavior, the curriculum contract, app lint/typecheck, plan validation, and old-path import scans. Route semantics and AppShell location were intentionally unchanged.

## Context and Orientation

`apps/web/features/workspace-navigation/components/workspace-primary-nav.tsx` is a client component used by AppShell and focused integration-ui tests. `apps/web/features/workspace-navigation/components/workspace-local-nav-rail.tsx` is a client component used by Review and bonus lesson surfaces.

`apps/web/features/workspace-navigation/lib/build-primary-nav-model.ts` builds the post-review top navigation model. `build-secondary-nav-model.ts` builds Review and lesson local rail models. `lesson-map-href.ts` builds the Review route query string for showing the lesson map. `post-review-destination.ts` resolves protected workspace resume destinations and is imported by Convex `apps/web/convex/blueprint/stageReadiness.ts`.

### In Scope

Move workspace navigation components to `apps/web/app/(workspace)/_components/workspace-navigation`.

Move workspace navigation model and routing helpers to `apps/web/lib/workspace-navigation`.

Update first-party imports in AppShell, Review, blueprint flow, execute/ship, course, Convex files, and tests, then delete `apps/web/features/workspace-navigation`.

### Out Of Scope

Do not move AppShell, route screens, checkout, billing, Stripe, pricing, promotion codes, webhook behavior, environment behavior, Convex schema, generated Convex files, shared UI inventory, or route semantics in this slice.

## Plan of Work

Create the destination folders if needed. Move `workspace-primary-nav.tsx` and `workspace-local-nav-rail.tsx` into the workspace App Router private component folder, keeping `"use client"` at the top of each file.

Move `build-primary-nav-model.ts`, `build-secondary-nav-model.ts`, `lesson-map-href.ts`, and `post-review-destination.ts` into `apps/web/lib/workspace-navigation`. Update internal imports in those files so they reference the new library owner.

Update all consumers from `@/features/workspace-navigation/...` to either `@/app/(workspace)/_components/workspace-navigation/...` for components or `@/lib/workspace-navigation/...` for model and routing helpers. Convex files should use relative imports such as `../../lib/workspace-navigation/post-review-destination` instead of the `@/` alias.

Delete `apps/web/features/workspace-navigation` after all imports resolve, then run old-path scans and focused validation.

## Milestones

The first milestone is library ownership. It is complete when post-review destination, lesson-map href, and workspace nav model imports come from `apps/web/lib/workspace-navigation` and Convex files import them through relative paths.

The second milestone is workspace UI ownership. It is complete when the primary nav and local rail components live under the workspace App Router private component folder and AppShell/Review/bonus consumers import the moved components.

The third milestone is validation. It is complete when focused tests, app format check, app lint, app typecheck, plan lint, Program lint, markdown lint, and `git diff --check` pass.

## Concrete Steps

From repo root, confirm branch and status:

    git status --short --branch

Run import scans after edits:

    rg '@/features/workspace-navigation|features/workspace-navigation' apps/web
    find apps/web/features/workspace-navigation -maxdepth 3 -type f

The first scan should return no matches. The second command should fail because the folder was deleted.

## Validation and Acceptance

Acceptance requires `apps/web/features/workspace-navigation` to be deleted, no old workspace-navigation feature imports to remain, AppShell and workspace route screens to keep their current behavior, and focused tests to prove primary navigation rendering, navigation model behavior, lesson-map href behavior, post-review resume destination behavior, and the curriculum contract.

### Test Commands

Run these commands from repo root:

    bun run --cwd apps/web test:unit -- tests/unit/build-primary-nav-model.test.ts tests/unit/post-review-destination.test.ts tests/unit/legacy-lesson-routes.test.ts
    bun run --cwd apps/web test:contracts -- tests/contracts/curriculum-contract.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-primary-nav.test.tsx
    bun run --cwd apps/web format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-27-remove-workspace-navigation-feature-surface.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/active/2026-04-26-remove-feature-folder-surface docs/exec-plans/completed/2026-04-27-remove-workspace-navigation-feature-surface.md
    git diff --check

## Idempotence and Recovery

These are file moves and import updates. If a scan finds old paths, update the consumer to the moved component, model, or routing helper instead of adding compatibility re-exports. If Convex import validation fails, keep the route helpers pure and use relative imports from Convex files into `apps/web/lib/workspace-navigation`.

## Artifacts and Notes

Baseline import scan:

    rg '@/features/workspace-navigation|features/workspace-navigation|workspace-primary-nav|workspace-local-nav-rail|post-review-destination|lesson-map-href' apps/web/app apps/web/features apps/web/convex apps/web/tests

The scan found consumers in AppShell, Review, blueprint flow, execute/ship bonus lesson surfaces, course lesson/artifact helpers, Convex `stageReadiness` and `mission`, and focused tests.

## Interfaces and Dependencies

Workspace navigation depends on Next.js App Router private folders, the shared UI primitives in `apps/web/components/ui`, route configuration in `apps/web/config/product.ts`, course lesson routing and registry helpers, execute/ship bonus mission presentation helpers, and Convex-safe route resolution in `apps/web/convex/blueprint/stageReadiness.ts`.
