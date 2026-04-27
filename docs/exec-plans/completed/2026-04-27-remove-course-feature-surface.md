---
title: Remove Course Feature Surface
status: complete
created_at: 2026-04-27
completed_at: 2026-04-27
summary: Move course code out of the feature tree and into route-private course UI, shared course library, and route hook owners without changing course behavior.
post_build_recap: Course shared contracts now live under lib/course, workspace course UI and hooks live under route-private owners, and the old course feature folder is gone.
program_id: remove-feature-folder-surface
planning_brief: docs/programs/completed/2026-04-26-remove-feature-folder-surface/planning-brief-17.md
read_when:
  - Resuming the course feature-folder removal slice.
  - Checking why course model code lives under lib/course.
  - Validating that no features/course references remain.
---

# Remove Course Feature Surface

This is a living execution plan for deleting the course feature folder.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The protected workspace course runtime should no longer be hidden behind `apps/web/features/course`. Users should see the same lesson pages, mission page, artifacts page, bonus lessons, skill rail, video surfaces, and post-review destinations, but the code should make ownership explicit. Shared lesson and course contracts belong under `apps/web/lib/course`, while route-facing React UI belongs under the protected workspace route group's private folders. This slice is locally ready when `apps/web/features/course` is gone, course routes and focused tests still pass, and Convex schema and generated files are untouched. The release workflow must still prove the merged commit in production.

## Progress

- [x] 2026-04-27 EDT: Verified #167 main production gates for the blueprint-flow slice passed before starting this branch.
- [x] 2026-04-27 EDT: Created branch `codex/remove-course-feature-surface` from verified `main` at `1c8fb6f`.
- [x] 2026-04-27 EDT: Confirmed two top-level feature folders remain before this slice: `course` and `marketing`.
- [x] 2026-04-27 EDT: Confirmed `apps/web/features/course` contains 335 source files across artifacts, lesson, mission, and shared skill rail surfaces.
- [x] 2026-04-27 EDT: Confirmed current consumers include workspace routes, AppShell, execute-ship pages, Blueprint video cards, workspace navigation, billing recovery, scripts, Convex course source modules, contracts, unit tests, and integration-ui tests.
- [x] 2026-04-27 EDT: Created planning brief 17 and this active child ExecPlan.
- [x] 2026-04-27 EDT: Moved pure course contracts, lesson model/content/routing helpers, video verification, mission model, artifacts helpers, and skill rail navigation utilities to `apps/web/lib/course`.
- [x] 2026-04-27 EDT: Moved course React components, workbench renderers, shells, artifacts UI, mission UI, and skill rail UI to `apps/web/app/(workspace)/_components/course`.
- [x] 2026-04-27 EDT: Moved course-specific React hooks to `apps/web/app/(workspace)/_hooks/course`.
- [x] 2026-04-27 EDT: Moved workbench mode constants used by lesson content construction to `apps/web/lib/course/lesson/workbench` so shared course code does not import route-private UI folders.
- [x] 2026-04-27 EDT: Updated app routes, AppShell, execute-ship components, Blueprint video UI, workspace navigation, billing recovery, scripts, content docs, tests, and Convex course source imports to the new owners.
- [x] 2026-04-27 EDT: Deleted `apps/web/features/course`; current app, lib, platform, Convex source, scripts, tests, and content scans return no `features/course` references.
- [x] 2026-04-27 EDT: Pure course unit tests passed locally: 16 files and 68 tests.
- [x] 2026-04-27 EDT: Course route/component unit group mostly passed locally, but `skill-rail.test.tsx` still hit this checkout's known duplicate-React `Invalid hook call` issue; the other 8 files in that group passed.
- [x] 2026-04-27 EDT: Workbench-rendering unit group still hit this checkout's known duplicate-React `Invalid hook call` issue across React, Radix, and lucide renders; the constants-only test in that group passed.
- [x] 2026-04-27 EDT: Curriculum contract test passed locally: 1 file and 4 tests.
- [x] 2026-04-27 EDT: Focused integration-ui tests for copy prompt resource card, Blueprint page, and Blueprint review page passed locally: 3 files and 10 tests, with the expected JSDOM navigation notices.
- [x] 2026-04-27 EDT: Workspace primary nav, bonus lesson view tracker, and bonus lesson viewed route integration tests passed locally.
- [x] 2026-04-27 EDT: App format check, app lint, and app typecheck passed. Typecheck compiled the Next route table with `/artifacts`, `/lesson/[lessonKey]`, `/mission`, `/execute`, `/blueprint`, and `/review`.
- [x] 2026-04-27 EDT: Plan lint, Program lint, markdown lint, old course path scans, Convex schema/generated diff check, and `git diff --check` passed.

## Surprises & Discoveries

The course folder is the largest remaining feature folder and is not a single kind of code. Convex source modules import only pure lesson registry, curriculum, routing, reference-gallery, and shared contract helpers. Route-facing React code is used by lesson, mission, artifacts, bonus lesson, AppShell, and Blueprint video surfaces. Keeping those groups separate prevents client UI from being presented as neutral library code while still removing the feature-folder surface.

The initial move made `apps/web/lib/course/lesson/content/build.ts` import workbench constants from route-private component folders. Those constants are pure lesson-content contracts, so they were moved to `apps/web/lib/course/lesson/workbench/modes` to keep `lib/course` from depending on `app/(workspace)/_components/course`.

Local React-heavy Vitest files still reproduce the checkout's known duplicate-React `Invalid hook call` issue. Pure course tests, contract tests, integration-ui tests, and Next typecheck pass locally. A clean-install PR static check must be treated as the authoritative full-unit proof for React-heavy unit files.

## Decision Log

Decision: Move pure course contracts and helpers to `apps/web/lib/course`.
Rationale: Lesson registry, curriculum, routing, video verification, mission model, artifacts grouping, and related contracts are shared by app routes, scripts, tests, billing recovery, and Convex course source modules.
Date: 2026-04-27

Decision: Move course React UI and workbench surfaces to `apps/web/app/(workspace)/_components/course`.
Rationale: These components render protected workspace routes or route-owned bonus lesson surfaces and should stay private to the workspace route group.
Date: 2026-04-27

Decision: Move course React hooks to `apps/web/app/(workspace)/_hooks/course`.
Rationale: The hooks are client interaction state for course pages, not generic app hooks.
Date: 2026-04-27

Decision: Allow Convex course source import rewrites but forbid Convex schema, generated, and behavior changes.
Rationale: Convex course modules consume pure lesson contracts. Updating their import paths is required when those contracts move, but persistence and API behavior are outside this structural slice.
Date: 2026-04-27

Decision: Keep workbench constants used by lesson content construction under `apps/web/lib/course/lesson/workbench`.
Rationale: The constants define persisted field ids, options, and lesson prompt contracts consumed by shared course content. They should not make shared course code import route-private React UI folders.
Date: 2026-04-27

## Outcomes & Retrospective

This slice is complete. `apps/web/features/course` has been deleted. Shared course contracts now live under `apps/web/lib/course`, pure workbench constants used by lesson content live under `apps/web/lib/course/lesson/workbench`, route-facing course UI lives under `apps/web/app/(workspace)/_components/course`, and course hooks live under `apps/web/app/(workspace)/_hooks/course`. Lesson copy, curriculum data, mission progression, artifacts grouping behavior, route URLs, bonus lesson access, skill rail behavior, video URLs, checkout, billing, Stripe, Convex schema, generated Convex files, environment behavior, and marketing were intentionally unchanged.

## Context and Orientation

`apps/web/features/course` currently owns the protected workspace course runtime. `apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx` renders bonus lessons and uses lesson manifest helpers. `apps/web/app/(workspace)/mission/page.tsx` renders the mission page and bonus route state. `apps/web/app/(workspace)/artifacts/page.tsx` renders artifact previews. AppShell imports course model helpers and skill rail components. Execute-ship pages under `apps/web/app/(workspace)/_components/execute-ship` reuse lesson shells, routing, and manifest helpers. Blueprint video cards reuse the course lesson video player. Convex source modules under `apps/web/convex/course` import pure course helpers, but Convex schema and generated files must not change.

### In Scope

Move `apps/web/features/course/lesson/model`, `lesson/content`, `lesson/routing`, `lesson/lib`, `lesson/utils`, `mission/lib`, `artifacts/lib`, `artifacts/types.ts`, and `shared/utils` to `apps/web/lib/course` while preserving exported names.

Move `apps/web/features/course/lesson/components`, `lesson/shared`, `lesson/shells`, `lesson/workbench`, `mission/components`, `artifacts/components`, and `shared/components` to `apps/web/app/(workspace)/_components/course`.

Move `apps/web/features/course/lesson/hooks` and `shared/hooks` to `apps/web/app/(workspace)/_hooks/course`.

Update app, library, platform, script, Convex source, test, and current Program imports away from `@/features/course`, relative `features/course`, and `../../features/course` paths.

Delete `apps/web/features/course` after imports are updated and scans are clean.

Update this ExecPlan and the owning Program packet as implementation and validation complete.

### Out Of Scope

Do not change visible lesson copy, curriculum data, mission progression, artifacts grouping behavior, route URLs, bonus lesson access, skill rail interaction, video URLs, checkout, billing, Stripe, pricing, promo code behavior, Convex schema, generated Convex files, environment behavior, marketing, or `apps/web/features/marketing`.

Do not move AppShell again in this slice.

Do not add compatibility re-export folders under `apps/web/features/course`.

## Plan of Work

First, move pure course contracts and helper modules to `apps/web/lib/course`. This includes lesson model, content, routing, browser-safe helpers, video verification, legacy lesson route helpers, mission page model, artifacts grouping, artifact types, and skill rail navigation utilities. Update library, platform, script, Convex course source, and tests that consume those pure helpers.

Next, move route-facing course UI to workspace private folders. Lesson video components, shells, workbench renderers, artifacts components, mission components, and skill rail components should live under `apps/web/app/(workspace)/_components/course`. Course-specific React hooks should live under `apps/web/app/(workspace)/_hooks/course`. Update workspace routes, AppShell, execute-ship components, Blueprint video card, and tests to import those owners.

Then, run old-path scans and delete the empty `apps/web/features/course` tree. If a scan finds a remaining reference, choose the explicit owner based on whether the module is shared course logic, route-private UI, or a course-specific hook.

Finally, run focused course validation first, then app format check, lint, typecheck, plan lint, Program lint, markdown lint, Convex schema/generated diff checks, and `git diff --check`. Archive the ExecPlan and update the Program only after validation passes.

## Milestones

The first milestone is shared course library ownership. It is complete when pure course contracts and helper modules live under `apps/web/lib/course`, Convex course source imports point at that library, and pure course tests still pass.

The second milestone is route-private course UI ownership. It is complete when course React components and workbench surfaces live under `apps/web/app/(workspace)/_components/course`, course hooks live under `apps/web/app/(workspace)/_hooks/course`, and route/component tests still pass.

The third milestone is feature-folder deletion. It is complete when `apps/web/features/course` is absent and old-path scans return no current app, script, Convex source, platform, test, or Program references except historical completed ExecPlan text.

The fourth milestone is local validation and PR handoff. It is complete when focused tests and app gates pass locally, plan docs are current, Convex schema/generated files are unchanged, and the PR is ready for clean-install CI. After the PR merges, Convex Production Deploy, CI, and Production Release Proof must pass for the merge commit.

## Concrete Steps

From repo root, confirm branch and status:

    git status --short --branch

Move files with `git mv` so rename history is preserved. After editing imports, run scans:

    rg '@/features/course|features/course|\.\./features/course|\.\./\.\./features/course|\.\./\.\./\.\./features/course' apps/web scripts docs/programs/active/2026-04-26-remove-feature-folder-surface
    find apps/web/features/course -maxdepth 4 -type f
    git diff --name-only -- apps/web/convex/schema.ts apps/web/convex/_generated

The first scan should return no current app, script, Convex source, platform, test, or Program matches. The `find` command should fail because the course folder was deleted. The Convex diff command should return no paths.

## Validation and Acceptance

Acceptance requires `apps/web/features/course` to be deleted, all current feature-course imports to be gone, course and bonus route behavior to remain unchanged under focused tests, Convex schema and generated files to be untouched, and production proof to pass after merge.

### Test Commands

Run these commands from repo root:

    bun run --cwd apps/web test:unit -- tests/unit/course-registry.test.ts tests/unit/course-state-lifecycle.test.ts tests/unit/reference-gallery.test.ts tests/unit/stage-unlock.test.ts tests/unit/watch-lesson-contract.test.ts tests/unit/lesson-layout.test.ts tests/unit/lesson-video-support.test.ts tests/unit/video-verification.test.ts tests/unit/lesson-workbench-helpers.test.ts tests/unit/checklist-label.test.tsx tests/unit/upload-storage.test.ts tests/unit/build-fresh-template-plan-prompt.test.ts tests/unit/skill-rail-navigation.test.ts tests/unit/post-review-destination.test.ts tests/unit/bonus-course-card.test.tsx tests/unit/mission-extras-row.test.tsx
    bun run --cwd apps/web test:unit -- tests/unit/mission-page.test.tsx tests/unit/app-workspace-mission-page.test.tsx tests/unit/app-workspace-lesson-page.test.tsx tests/unit/bonus-lesson-page.test.tsx tests/unit/bonus-mission-page.test.tsx tests/unit/product-shell.test.tsx tests/unit/skill-rail.test.tsx tests/unit/lesson-shells.test.tsx tests/unit/next-lesson-handoff.test.ts
    bun run --cwd apps/web test:unit -- tests/unit/build-product-iteration-workbench.test.tsx tests/unit/guided-form-lessons.test.tsx tests/unit/core-flow-sketch-workbench.test.tsx tests/unit/core-ux-plan-flow-workbench.test.tsx tests/unit/brand-kit-workbench.test.tsx tests/unit/codex-marketing-site-workbench.test.tsx tests/unit/production-deploy-handoff-workbench.test.tsx tests/unit/repo-map-orientation-workbench.test.tsx tests/unit/route-access-orientation-workbench.test.tsx tests/unit/competitor-research-light-workbench.test.tsx tests/unit/roadmap-sprint-overview.test.tsx tests/unit/core-ux-build-constants.test.ts
    bun run --cwd apps/web test:contracts -- tests/contracts/curriculum-contract.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/copy-prompt-resource-card.test.tsx tests/integration-ui/blueprint-page.test.tsx tests/integration-ui/blueprint-review-page.test.tsx
    bun run --cwd apps/web format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-27-remove-course-feature-surface.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/active/2026-04-26-remove-feature-folder-surface docs/exec-plans/completed/2026-04-27-remove-course-feature-surface.md
    git diff --check

After this PR merges, inspect the `Production Release Proof` run for the merged `main` commit and confirm `default_ship` and `release_gate` pass. `billing_integration` should only run if release scope explicitly detects billing-sensitive files.

## Idempotence and Recovery

These are file moves, import updates, and docs updates. If a scan finds old course paths, update the consumer to the new explicit owner instead of adding compatibility re-exports. If a focused test fails, compare import paths and rendered output before changing course state, curriculum data, Convex code behavior, route URLs, or UI copy.

If a Convex source import fails after the move, point it only at pure helpers under `apps/web/lib/course`. Do not import route-private React UI from Convex. If a route-private component needs a pure helper, import from `apps/web/lib/course` instead of duplicating logic.

## Artifacts and Notes

Initial inventory showed `apps/web/features/course` had four main groups: artifacts, lesson, mission, and shared skill rail code. The lesson group is dominant with 308 files, mostly workbench UI modes. Convex source modules import only pure course helpers and should stay behaviorally unchanged.

Initial import scan:

    rg -n '@/features/course|features/course|\.\./features/course|\.\./\.\./features/course' apps/web scripts docs/programs/active/2026-04-26-remove-feature-folder-surface

The scan shows current app, script, test, platform, Convex source, and Program consumers of the course surface. Current references should move. Historical completed plans may keep old-path history unless a current docs surface needs an ownership update.

## Interfaces and Dependencies

This slice depends on Next.js App Router private folder colocation, the protected workspace route group under `apps/web/app/(workspace)`, shared workspace navigation helpers under `apps/web/lib/workspace-navigation`, execute-ship bonus route UI under `apps/web/app/(workspace)/_components/execute-ship`, Convex course source modules under `apps/web/convex/course`, the billing recovery helper under `apps/web/platform/billing/checkout`, video verification scripts under `apps/web/scripts`, and production release proof for the merged `main` commit.
