---
title: Split Lesson Routing From Curriculum
status: complete
created_at: 2026-04-26
completed_at: 2026-04-26
summary: Move lesson URL construction out of the curriculum model so course data and route navigation boundaries are easier to audit.
post_build_recap: Lesson href and legacy alias URL construction now live in an explicit lesson routing helper, curriculum no longer imports app route helpers, Convex course files import pure curriculum lookups directly, and focused plus app validation passed.
program_id: app-structure-refactor
planning_brief: docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-8.md
read_when:
  - Resuming the lesson routing extraction.
  - Checking why route URL helpers moved without moving the manifest, registry, or route screens.
  - Validating that legacy lesson redirects and post-review lesson navigation remain unchanged.
---

# Split Lesson Routing From Curriculum

This is a living execution plan. It describes the eighth implementation slice for the app structure refactor Program.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The course lesson curriculum model should define course data: lessons, blocks, route segments, and lookup functions. It should not also know how the app's review route opens the lesson map or how product route config names the old mission destination. After this slice, lesson URL construction will live in an explicit course lesson routing helper, while the high-fan-in manifest keeps compatibility exports for callers that have not moved yet.

The user-visible behavior should not change. Lesson links, legacy lesson redirects, post-review navigation, mission resume destinations, and stage unlock edit actions should continue to resolve to the same hrefs.

## Progress

- [x] 2026-04-26 EDT: Confirmed the first seven child ExecPlans are complete and the Program names course-domain and Convex-safe logic cleanup as the next recommended area.
- [x] 2026-04-26 EDT: Inspected the Program, planning brief 7, course curriculum, stage unlock summary, lesson route helper usages, Convex course mission destination logic, workspace navigation helpers, and focused route/navigation tests before editing.
- [x] 2026-04-26 EDT: Wrote planning brief 8 and opened this active child ExecPlan.
- [x] 2026-04-26 EDT: Moved lesson href and legacy alias URL construction into `apps/web/features/course/lesson/routing/lesson-routes.ts`.
- [x] 2026-04-26 EDT: Updated `apps/web/features/course/lesson/model/curriculum.ts` to expose route-segment alias data without importing route config or workspace navigation.
- [x] 2026-04-26 EDT: Kept manifest compatibility exports for `getLessonHref` and `legacyRouteAliases`.
- [x] 2026-04-26 EDT: Updated route-aware first-party callers to import lesson routing from the explicit routing helper.
- [x] 2026-04-26 EDT: Updated Convex course files that only need model lookups to import directly from `apps/web/features/course/lesson/model/curriculum.ts`.
- [x] 2026-04-26 EDT: Static scans confirmed `curriculum.ts` no longer imports `routeConfig` or `getLessonMapHref`, and `apps/web/convex/course` no longer imports the manifest compatibility surface.
- [x] 2026-04-26 EDT: Focused route, navigation, course, and Convex-adjacent tests passed.
- [x] 2026-04-26 EDT: App format check, app lint, and app typecheck passed.
- [x] 2026-04-26 EDT: Completed-path plan lint, Program lint, markdown lint, and `git diff --check` passed after archival.

## Surprises & Discoveries

2026-04-26 EDT: `apps/web/features/course/lesson/model/curriculum.ts` imports `routeConfig` and `getLessonMapHref` only for URL construction. Its core lookup functions can stay model-owned if legacy alias route segments are exposed separately from route hrefs.

2026-04-26 EDT: Convex course mission logic already constructs route destinations. This slice can keep behavior unchanged by importing the explicit routing helper there, but it should not pretend that a fully Convex-safe course entrypoint exists yet.

2026-04-26 EDT: Keeping manifest compatibility exports means the manifest remains route-aware for old callers. Convex course modules that only need pure lookups should avoid the manifest now and import `getLessonByKey` or `CURRICULUM_VERSION` from `apps/web/features/course/lesson/model/curriculum.ts`.

## Decision Log

Decision: Move URL-producing helpers, not lesson model files.
Rationale: `manifest.ts`, registry barrels, lesson content, and workbench files still have high fan-in. Moving only `getLessonHref` and legacy alias href construction reduces route coupling without destabilizing the course graph.
Date: 2026-04-26

Decision: Preserve manifest compatibility exports.
Rationale: The manifest and model barrel are still broad public surfaces in this codebase. Keeping compatibility exports avoids a risky all-callers migration while allowing route-aware first-party code to use the explicit helper now.
Date: 2026-04-26

Decision: Move Convex course lookup imports from manifest to curriculum.
Rationale: The manifest now keeps route helper compatibility exports. Convex course files that only need curriculum lookups should import from the pure curriculum module so they do not depend on the compatibility surface.
Date: 2026-04-26

## Outcomes & Retrospective

This plan is complete. Lesson URL construction now lives in `apps/web/features/course/lesson/routing/lesson-routes.ts`. `apps/web/features/course/lesson/model/curriculum.ts` still owns lesson data, lookups, and `legacyRouteAliasSegments`, but it no longer imports `routeConfig` or `getLessonMapHref`.

First-party route-aware callers now import `getLessonHref` and `legacyRouteAliases` from the explicit routing helper. `apps/web/features/course/lesson/model/manifest.ts` still re-exports those helpers for compatibility, while Convex course files that only need model lookups import directly from `apps/web/features/course/lesson/model/curriculum.ts`.

Focused route, navigation, mission, course registry, course lifecycle, stage unlock, format, app lint, app typecheck, plan, Program, markdown, and diff validation passed. This slice did not move the manifest, registry barrels, lesson content, workbench renderer, route screens, AppShell, Convex schema or generated files, public Convex functions, checkout, Stripe, billing proof, pricing, promo code behavior, environment behavior, shared UI inventory, or the unrelated stashed scrollbar styling.

## Context and Orientation

Ship by Sunday's web app lives in `apps/web`. Course lesson model data lives under `apps/web/features/course/lesson/model`. The current curriculum file at `apps/web/features/course/lesson/model/curriculum.ts` owns the lesson manifest JSON, block and lesson lookup tables, and helper functions like `getLesson`, `getLessonByKey`, and `getNextLesson`.

The same curriculum file also currently imports `apps/web/config/product.ts` and `apps/web/features/workspace-navigation/lib/lesson-map-href.ts` to export `getLessonHref` and `legacyRouteAliases`. Those exports are route URL helpers, not pure course model data. The new explicit route helper should live at `apps/web/features/course/lesson/routing/lesson-routes.ts`.

### In Scope

Create `apps/web/features/course/lesson/routing/lesson-routes.ts` for `getLessonHref` and `legacyRouteAliases`.

Update `apps/web/features/course/lesson/model/curriculum.ts` so it exposes route-segment alias data without importing `routeConfig` or `getLessonMapHref`.

Keep compatibility exports from `apps/web/features/course/lesson/model/manifest.ts` and the model barrel.

Update first-party route destination callers that use `getLessonHref` or `legacyRouteAliases` to import from `apps/web/features/course/lesson/routing/lesson-routes.ts` directly where they are clearly constructing navigation destinations.

Update focused tests and this ExecPlan, the owning Program, and the current planning brief pointer to match the actual change.

### Out Of Scope

Do not move `apps/web/features/course/lesson/model/manifest.ts`, `apps/web/features/course/lesson/model/index.ts`, course registry barrels, lesson content files, workbench renderer, workbench folders, App Router route screens, AppShell, Convex schema, generated Convex files, public Convex function names, checkout, Stripe, billing proof, pricing, promo code behavior, environment behavior, shared UI inventory, or the unrelated stashed scrollbar styling change.

Do not delete or rename feature folders.

Do not remove the old manifest or model barrel compatibility exports in this slice.

## Plan of Work

Start by extracting the URL helpers. Add `apps/web/features/course/lesson/routing/lesson-routes.ts`, importing `routeConfig`, `getLessonMapHref`, and the model-owned lookup data it needs. Replace curriculum's URL alias export with a model-owned route segment alias export such as `legacyRouteAliasSegments`.

Then update compatibility surfaces. `apps/web/features/course/lesson/model/manifest.ts` should continue to export contracts and curriculum data, and it should re-export the route helper values from the new routing module. `apps/web/features/course/lesson/model/index.ts` already exports the manifest and should remain compatible through that path.

Then move first-party route-aware callers. Workspace navigation, course mission presentation, lesson completion navigation, legacy lesson route redirects, Convex mission resume destinations, and focused tests should import `getLessonHref` or `legacyRouteAliases` from the new routing helper when they are constructing hrefs.

Finally run focused proof before broad validation. Keep this plan and the Program current after implementation and after validation.

## Milestones

The first milestone is plan and baseline evidence. It is complete when planning brief 8 and this ExecPlan exist, and the plan records that curriculum currently imports route config and lesson map helpers only for URL construction.

The second milestone is route helper extraction. It is complete when `lesson-routes.ts` owns `getLessonHref` and `legacyRouteAliases`, curriculum no longer imports `routeConfig` or `getLessonMapHref`, and manifest compatibility exports still exist.

The third milestone is caller migration and behavior proof. It is complete when route-aware first-party callers import the explicit helper and focused tests prove legacy redirects, post-review navigation, execute redirects, mission rendering, course registry behavior, course lifecycle, and stage unlock actions.

The fourth milestone is archival. It is complete when this ExecPlan records the completed outcome, moves from `docs/exec-plans/active/` to `docs/exec-plans/completed/`, and the Program names the next slice.

## Concrete Steps

From repo root, confirm branch and status:

    git status --short --branch

Read the Program, current planning brief, and this plan:

    sed -n '1,280p' docs/programs/completed/2026-04-26-app-structure-refactor/program.md
    sed -n '1,220p' docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-8.md
    sed -n '1,360p' docs/exec-plans/completed/2026-04-26-split-lesson-routing-from-curriculum.md

Record baseline lesson routing imports:

    rg 'getLessonHref|legacyRouteAliases|routeConfig|getLessonMapHref' apps/web/features/course/lesson/model/curriculum.ts apps/web/features/course/lesson/model/stage-unlock.ts apps/web/features/workspace-navigation apps/web/convex/course apps/web/tests/unit --glob '!node_modules'

After implementation, prove curriculum no longer owns app route dependencies:

    rg 'routeConfig|getLessonMapHref|export function getLessonHref|export const legacyRouteAliases =' apps/web/features/course/lesson/model/curriculum.ts

Prove Convex course files no longer import the manifest compatibility surface:

    rg 'features/course/lesson/model/manifest' apps/web/convex/course

Run focused tests:

    bun run --cwd apps/web test:unit -- tests/unit/legacy-lesson-routes.test.ts tests/unit/post-review-destination.test.ts tests/unit/app-workspace-execute-page.test.tsx tests/unit/mission-page.test.tsx tests/unit/course-registry.test.ts tests/unit/course-state-lifecycle.test.ts tests/unit/stage-unlock.test.ts

Then run app and plan checks:

    bun run format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-26-split-lesson-routing-from-curriculum.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/completed/2026-04-26-app-structure-refactor docs/exec-plans/completed/2026-04-26-split-lesson-routing-from-curriculum.md
    git diff --check

## Validation and Acceptance

This slice is accepted because `apps/web/features/course/lesson/model/curriculum.ts` no longer imports `routeConfig` or `getLessonMapHref`, lesson URL construction lives in `apps/web/features/course/lesson/routing/lesson-routes.ts`, compatibility exports remain available through `apps/web/features/course/lesson/model/manifest.ts`, Convex course lookup imports avoid the manifest compatibility surface, and focused plus app-level validation passed.

Legacy lesson redirects, post-review navigation targets, mission resume destinations, execute page redirects, course registry behavior, course state lifecycle, and stage unlock edit hrefs must remain unchanged.

### Test Commands

Run these commands from repo root after implementation:

    rg 'routeConfig|getLessonMapHref|export function getLessonHref|export const legacyRouteAliases =' apps/web/features/course/lesson/model/curriculum.ts
    rg 'features/course/lesson/model/manifest' apps/web/convex/course
    bun run --cwd apps/web test:unit -- tests/unit/legacy-lesson-routes.test.ts tests/unit/post-review-destination.test.ts tests/unit/app-workspace-execute-page.test.tsx tests/unit/mission-page.test.tsx tests/unit/course-registry.test.ts tests/unit/course-state-lifecycle.test.ts tests/unit/stage-unlock.test.ts
    bun run format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-26-split-lesson-routing-from-curriculum.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/completed/2026-04-26-app-structure-refactor docs/exec-plans/completed/2026-04-26-split-lesson-routing-from-curriculum.md
    git diff --check

## Idempotence and Recovery

The extraction is safe to retry because the new route helper is additive and compatibility exports remain in place. If a caller still imports `getLessonHref` from the manifest after this slice, that is allowed for compatibility unless the caller is one of the route-aware first-party surfaces intentionally migrated here.

If tests fail because a legacy redirect changes, do not update the expected route casually. Keep `legacyRouteAliases` behavior aligned with the previous redirect map and record any real product route change in a separate route-behavior plan.

If the import scan finds more route coupling inside the model, record it in `Surprises & Discoveries` before broadening scope. Do not move the full workbench, manifest, registry barrel, Convex files, route screens, shared UI, checkout, or billing behavior as part of this slice.

## Artifacts and Notes

Source Program packet:

    docs/programs/completed/2026-04-26-app-structure-refactor/

Current planning brief:

    docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-8.md

Expected new route helper:

    apps/web/features/course/lesson/routing/lesson-routes.ts

Post-move curriculum scan found no route config or lesson map imports:

    rg 'routeConfig|getLessonMapHref' apps/web/features/course/lesson/model/curriculum.ts
    no matches

Post-move Convex scan found no manifest compatibility imports:

    rg 'features/course/lesson/model/manifest' apps/web/convex/course
    no matches

Focused route and course validation passed:

    bun run --cwd apps/web test:unit -- tests/unit/legacy-lesson-routes.test.ts tests/unit/post-review-destination.test.ts tests/unit/app-workspace-execute-page.test.tsx tests/unit/mission-page.test.tsx tests/unit/course-registry.test.ts tests/unit/course-state-lifecycle.test.ts tests/unit/stage-unlock.test.ts
    Test Files  7 passed (7)
    Tests  26 passed (26)

App-level validation passed:

    bun run format:check
    All matched files use the correct format.

    bun run --cwd apps/web lint
    Found 0 warnings and 0 errors.

    bun run --cwd apps/web typecheck
    Compiled successfully.

Completed-path plan and Program validation passed:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-26-split-lesson-routing-from-curriculum.md
    docs/exec-plans/completed/2026-04-26-split-lesson-routing-from-curriculum.md: ok

    bun run programs:lint
    app-structure-refactor: ok

    bun run markdown:lint -- --paths docs/programs/completed/2026-04-26-app-structure-refactor docs/exec-plans/completed/2026-04-26-split-lesson-routing-from-curriculum.md
    docs/exec-plans/completed/2026-04-26-split-lesson-routing-from-curriculum.md: ok
    docs/programs/completed/2026-04-26-app-structure-refactor/program.md: ok

    git diff --check
    no output

Focused validation targets:

    apps/web/tests/unit/legacy-lesson-routes.test.ts
    apps/web/tests/unit/post-review-destination.test.ts
    apps/web/tests/unit/app-workspace-execute-page.test.tsx
    apps/web/tests/unit/mission-page.test.tsx
    apps/web/tests/unit/course-registry.test.ts
    apps/web/tests/unit/course-state-lifecycle.test.ts
    apps/web/tests/unit/stage-unlock.test.ts

## Interfaces and Dependencies

This plan depends on `docs/programs/completed/2026-04-26-app-structure-refactor/program.md`, `docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-8.md`, `docs/exec-plans/PLANS.md`, `docs/programs/PROGRAMS.md`, `apps/web/features/course/lesson/model/curriculum.ts`, `apps/web/features/course/lesson/model/manifest.ts`, `apps/web/features/workspace-navigation/lib/lesson-map-href.ts`, `apps/web/config/product.ts`, `apps/web/convex/course/mission.ts`, and focused unit tests under `apps/web/tests/unit`.
