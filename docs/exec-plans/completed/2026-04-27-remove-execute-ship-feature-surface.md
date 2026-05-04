---
title: Remove Execute Ship Feature Surface
status: complete
created_at: 2026-04-27
completed_at: 2026-04-27
summary: Move post-review bonus lesson code out of the feature tree and into route-private, shared library, and route-handler owners without changing bonus route behavior.
post_build_recap: Bonus lesson UI now lives under the workspace route private components, shared bonus contracts live under lib/execute-ship, server helpers live beside their routes, the stale execute-ship track modules are gone, and focused plus app validation passed.
program_id: remove-feature-folder-surface
planning_brief: docs/programs/completed/2026-04-26-remove-feature-folder-surface/planning-brief-15.md
read_when:
  - Resuming the execute-ship feature-folder removal slice.
  - Checking why bonus lesson UI lives under the workspace route group.
  - Validating that no features/execute-ship references remain.
---

# Remove Execute Ship Feature Surface

This is a living execution plan for deleting the execute-ship feature folder.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The post-review bonus lesson surface should no longer be hidden in a broad `features/execute-ship` bucket. Users should see the same Review, Lesson Map, bonus lesson, and locked-route behavior, but the code should make ownership obvious: workspace route UI lives under the protected workspace route group, shared bonus presentation contracts live under `apps/web/lib/execute-ship`, and server-only route helpers live beside the App Router route or route handler that calls them. This slice is working when `apps/web/features/execute-ship` is gone, route tests still pass, and production proof for the merged commit succeeds.

## Progress

- [x] 2026-04-27 EDT: Created branch `codex/remove-execute-ship-feature-surface` from verified `main` at `530929e`.
- [x] 2026-04-27 EDT: Confirmed four top-level feature folders remain before this slice: `codebase-flow`, `course`, `execute-ship`, and `marketing`.
- [x] 2026-04-27 EDT: Confirmed `apps/web/features/execute-ship` contains route UI, shared bonus presentation helpers, one client-safe view-tracking contract, and two server route helpers.
- [x] 2026-04-27 EDT: Confirmed `execute-ship-track-detail.tsx` and `execute-ship-tracks.ts` only reference each other and have no live app or test consumers.
- [x] 2026-04-27 EDT: Read the local Next.js project-structure and route-handler documentation. Private `_components` folders opt files out of routing, and route handlers live under `app` with the Web Request and Response APIs.
- [x] 2026-04-27 EDT: Created planning brief 15 and this active child ExecPlan.
- [x] 2026-04-27 EDT: Moved bonus route UI to `apps/web/app/(workspace)/_components/execute-ship`, shared bonus contracts to `apps/web/lib/execute-ship`, the viewed route helper to `apps/web/app/api/course/bonus-lesson-viewed/_server`, and the lesson access loader to `apps/web/app/(workspace)/lesson/[lessonKey]/_server`.
- [x] 2026-04-27 EDT: Added `import "server-only"` to the moved bonus route access loader.
- [x] 2026-04-27 EDT: Updated current app, library, feature, script, and test imports away from `@/features/execute-ship`.
- [x] 2026-04-27 EDT: Deleted `apps/web/features/execute-ship` and confirmed old-path scans return no current app or script matches.
- [x] 2026-04-27 EDT: Focused post-format unit tests passed: 5 files and 15 tests.
- [x] 2026-04-27 EDT: Focused bonus lesson viewed route integration test passed: 1 file and 4 tests.
- [x] 2026-04-27 EDT: Focused integration-ui tests passed: 3 files and 12 tests. JSDOM printed two expected `Not implemented: navigation to another Document` notices while tests passed.
- [x] 2026-04-27 EDT: App format check, app lint, and app typecheck passed. The typecheck route table still includes `/review`, `/mission`, `/lesson/[lessonKey]`, `/execute`, and `/api/course/bonus-lesson-viewed`.
- [x] 2026-04-27 EDT: Plan lint, Program lint, markdown lint, old execute-ship path scans, Convex schema/generated diff check, and `git diff --check` passed.
- [x] 2026-04-27 EDT: Moved this ExecPlan to completed and updated the Program after validation passed.

## Surprises & Discoveries

The old execute-ship track data and track detail renderer are dead code in the current app tree. The live `/execute` route redirects from the codebase resume destination instead of rendering those track modules. Removing those two files is part of deleting the obsolete feature surface, not a user-visible route change.

`apps/web/features/execute-ship/server/load-bonus-route-access.ts` imports authenticated server preload code but does not currently carry `import "server-only"`. After the move, the loader should be explicitly server-only so a future client import fails at build time.

## Decision Log

Decision: Move bonus route UI to `apps/web/app/(workspace)/_components/execute-ship`.
Rationale: `BonusLessonPage`, `BonusMissionPage`, `LessonMapSurface`, locked-state panels, and supporting cards render protected workspace route UI, and Next.js private folders are the explicit non-routable owner for route-local UI.
Date: 2026-04-27

Decision: Move shared bonus presentation contracts to `apps/web/lib/execute-ship`.
Rationale: Workspace navigation, codebase review, codebase flow, and route UI all consume bonus mission types and presentation helpers, so those modules are shared app contracts rather than route-private components.
Date: 2026-04-27

Decision: Move server helpers beside their App Router callers.
Rationale: The bonus lesson viewed mutation helper belongs to the API route it backs, and the bonus route access loader belongs to the dynamic lesson page that calls it.
Date: 2026-04-27

Decision: Delete the unused execute-ship track modules.
Rationale: Repository scans show the track data and renderer only reference each other and are not reached by the live `/execute`, `/mission`, `/lesson`, review, or test surfaces.
Date: 2026-04-27

## Outcomes & Retrospective

This slice is complete. Bonus route UI now lives under `apps/web/app/(workspace)/_components/execute-ship`, shared bonus presentation helpers and contracts live under `apps/web/lib/execute-ship`, route server helpers live beside the App Router route or route handler that calls them, and `apps/web/features/execute-ship` has been deleted. The stale execute-ship track modules were removed because they had no live consumers. Route URLs, post-review unlock behavior, bonus viewed tracking semantics, AppShell behavior, checkout, billing, Stripe, Convex schema, generated Convex files, and environment behavior were intentionally unchanged.

## Context and Orientation

`apps/web/features/execute-ship` currently holds the post-review bonus lesson surface. The live route entrypoints are `apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx`, `apps/web/app/(workspace)/mission/page.tsx`, `apps/web/app/(workspace)/execute/page.tsx`, and `apps/web/app/api/course/bonus-lesson-viewed/route.ts`. The review page at `apps/web/app/(workspace)/review/_components/codebase-review-page.tsx` can reveal the same Lesson Map.

The shared bonus mission state type comes from `api.course.getBonusMissionState` through `apps/web/features/execute-ship/lib/bonus-mission-types.ts`. `apps/web/features/execute-ship/lib/bonus-library-presentation.ts` maps that state into user-facing labels, default lesson destinations, AppShell mission props, and fallback post-review navigation targets. `apps/web/lib/workspace-navigation/build-primary-nav-model.ts` and `apps/web/lib/workspace-navigation/build-secondary-nav-model.ts` consume those shared contracts.

`apps/web/features/execute-ship/server/bonus-lesson-view-tracking.ts` is already server-only and backs the POST route at `/api/course/bonus-lesson-viewed`. `apps/web/features/execute-ship/server/load-bonus-route-access.ts` loads protected workspace and bonus route state for the dynamic bonus lesson route and should become server-only after it moves.

### In Scope

Move `apps/web/features/execute-ship/components/bonus-lesson-page.tsx`, `bonus-lesson-footer.tsx`, `bonus-lesson-view-tracker.tsx`, `bonus-mission-page.tsx`, `bonus-mission-block-card.tsx`, `bonus-mission-hero-card.tsx`, `bonus-route-state-panel.tsx`, and `lesson-map-surface.tsx` to `apps/web/app/(workspace)/_components/execute-ship`.

Move `apps/web/features/execute-ship/lib/bonus-library-presentation.ts`, `bonus-mission-types.ts`, `bonus-lesson-view-contract.ts`, and `bonus-route-access.ts` to `apps/web/lib/execute-ship`.

Move `apps/web/features/execute-ship/server/bonus-lesson-view-tracking.ts` to `apps/web/app/api/course/bonus-lesson-viewed/_server/bonus-lesson-view-tracking.ts` and keep `import "server-only"`.

Move `apps/web/features/execute-ship/server/load-bonus-route-access.ts` to `apps/web/app/(workspace)/lesson/[lessonKey]/_server/load-bonus-route-access.ts` and add `import "server-only"`.

Delete `apps/web/features/execute-ship` after imports are updated, including the unused execute-ship track files.

Update the Program packet and this ExecPlan as implementation and validation complete.

### Out Of Scope

Do not change route URLs, redirect destinations, post-review unlock semantics, bonus mission state, bonus viewed tracking behavior, AppShell props or layout, checkout, billing, Stripe, pricing, promo code behavior, Convex schema, generated Convex files, environment behavior, codebase compiler behavior, course lesson content, marketing, or remaining feature folders.

Do not move `apps/web/features/codebase-flow`, `apps/web/features/course`, or `apps/web/features/marketing` in this slice.

## Plan of Work

First, move the shared library files to `apps/web/lib/execute-ship` and update imports in workspace navigation, codebase flow, review, route UI, and tests. Keep the exported names unchanged so this is an ownership move rather than a behavior rewrite.

Next, move bonus route UI components to `apps/web/app/(workspace)/_components/execute-ship`. Update route entrypoints and tests to import that route-private owner. Keep rendered copy, AppShell props, local navigation behavior, and Lesson Map behavior unchanged.

Then, move server helpers beside their App Router callers. The POST helper moves under the API route's `_server` folder. The bonus-route access loader moves under the dynamic lesson route's `_server` folder and gains `import "server-only"`. Update route files and route-handler tests.

Finally, delete the old feature folder, run import scans, run focused tests, broaden to app format check, app lint, app typecheck, plan and Program lint, markdown lint, Convex diff checks, and `git diff --check`, then archive the ExecPlan and update the Program.

## Milestones

The first milestone is shared-contract ownership. It is complete when bonus mission types, presentation helpers, route access helpers, and view-tracking constants live under `apps/web/lib/execute-ship` and all consumers import that owner.

The second milestone is route-private UI ownership. It is complete when bonus lesson, bonus mission, Lesson Map, tracker, and locked-state UI live under `apps/web/app/(workspace)/_components/execute-ship`.

The third milestone is server boundary ownership. It is complete when the bonus viewed POST helper lives under `apps/web/app/api/course/bonus-lesson-viewed/_server`, the dynamic lesson access loader lives under `apps/web/app/(workspace)/lesson/[lessonKey]/_server`, and both server-only boundaries are guarded.

The fourth milestone is feature-folder deletion and validation. It is complete when `apps/web/features/execute-ship` is absent, old-path scans return no current app or script references, focused tests and app gates pass, plan docs are current, Convex schema/generated files are unchanged, and production proof passes after merge.

## Concrete Steps

From repo root, confirm branch and status:

    git status --short --branch

Move files with `git mv` so rename history is preserved. After editing imports, run scans:

    rg '@/features/execute-ship|features/execute-ship|\.\./features/execute-ship|\.\./\.\./features/execute-ship' apps/web scripts
    find apps/web/features/execute-ship -maxdepth 4 -type f
    git diff --name-only -- apps/web/convex/schema.ts apps/web/convex/_generated

The first scan should return no app or script matches. The `find` command should fail because the execute-ship folder was deleted. The Convex diff command should return no paths.

## Validation and Acceptance

Acceptance requires `apps/web/features/execute-ship` to be deleted, all old execute-ship feature imports to be gone, route UI and route handler behavior to remain unchanged under focused tests, and app typecheck to still build `/review`, `/mission`, `/lesson/[lessonKey]`, `/execute`, and `/api/course/bonus-lesson-viewed`.

### Test Commands

Run these commands from repo root:

    bun run --cwd apps/web test:unit -- tests/unit/bonus-mission-page.test.tsx tests/unit/bonus-lesson-page.test.tsx tests/unit/app-workspace-mission-page.test.tsx tests/unit/app-workspace-lesson-page.test.tsx tests/unit/mission-page.test.tsx
    bun run --cwd apps/web test:integration:node -- tests/integration/bonus-lesson-viewed-route.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/bonus-lesson-view-tracker.test.tsx tests/integration-ui/codebase-review-page.test.tsx tests/integration-ui/codebase-page.test.tsx
    bun run --cwd apps/web format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-27-remove-execute-ship-feature-surface.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/active/2026-04-26-remove-feature-folder-surface docs/exec-plans/completed/2026-04-27-remove-execute-ship-feature-surface.md
    git diff --check

After this PR merges, inspect the `Production Release Proof` run for the merged `main` commit and confirm `default_ship` and `release_gate` pass. `billing_integration` should only run if release scope explicitly detects billing-sensitive files.

## Idempotence and Recovery

These are file moves, import updates, stale dead-code deletion, and docs updates. If a scan finds old paths, update the consumer to the new explicit owner instead of adding compatibility re-exports. If a focused route test fails, compare imports and rendered output before changing bonus mission state, route behavior, unlock semantics, or Convex mutations.

If Next.js rejects a route-private import, keep UI files under `apps/web/app/(workspace)/_components/execute-ship` and fix only the import path. Route groups and private folders are valid organization folders and should not change URLs. If a server-only guard reveals a client import, stop and move the client-safe contract to `apps/web/lib/execute-ship` rather than removing the guard.

## Artifacts and Notes

Initial import scan:

    rg -n "execute-ship|BonusLesson|BonusMission|bonus-lesson-view|loadBonusRouteAccess|markBonusLessonViewed|BonusRouteStatePanel|LessonMapSurface" apps/web/tests apps/web/app apps/web/lib apps/web/features scripts

The scan shows current app and test consumers of the execute-ship surface plus historical completed-plan references. Current app and test references should move. Historical completed plans may keep old-path history unless a current docs surface needs an ownership update.

`rg -n "execute-ship-tracks|ExecuteShipTrack|executeShipTracks|execute-ship-track-detail|ExecuteShipTrackDetail" apps/web -g '!node_modules'` shows only the stale track data and renderer reference each other.

## Interfaces and Dependencies

This slice depends on Next.js App Router private folder colocation, the protected workspace route group under `apps/web/app/(workspace)`, the bonus viewed API route under `apps/web/app/api/course/bonus-lesson-viewed`, the shared workspace navigation models under `apps/web/lib/workspace-navigation`, the Convex course bonus mission API, the codebase workspace state API, Clerk server auth, and production release proof for the merged `main` commit.
