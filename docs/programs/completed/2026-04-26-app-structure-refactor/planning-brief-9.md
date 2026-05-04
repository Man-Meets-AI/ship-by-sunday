---
title: App Structure Refactor Planning Brief 9
program_id: app-structure-refactor
brief_version: 9
status: current
summary: Continue the course-domain split by separating stage-unlock model summaries from workbench href presentation.
read_when:
  - Writing the ninth child ExecPlan for the app structure refactor Program.
  - Separating stage-unlock artifact and objective logic from route-aware workbench summary rendering.
  - Preserving Convex, course registry, manifest compatibility, checkout, and billing behavior during course cleanup.
---

# App Structure Refactor Planning Brief 9

## Planning Refresh

This is the ninth planning brief for the app structure refactor Program.

The first eight child ExecPlans are complete. They made boundary imports explicit, extracted the shared workspace shell, moved route-owned wrapper surfaces into App Router private folders, moved marketing-only effects and a codebase-only hook out of generic shared locations, moved persisted completion field IDs into the lesson model, and moved lesson URL construction out of `apps/web/features/course/lesson/model/curriculum.ts`.

The current Program recommendation is to continue course-domain cleanup without moving `apps/web/features/course/lesson/model/manifest.ts`, course registry barrels, route screens, Convex schema, generated Convex files, or billing-sensitive behavior. The next visible boundary smell is `apps/web/features/course/lesson/model/stage-unlock.ts`: it is imported by registry artifact and objective code, but it also imports lesson routing so stage-unlock sections can render workbench edit links.

## What The Previous Slice Unblocked

Lesson href construction now has an explicit routing home at `apps/web/features/course/lesson/routing/lesson-routes.ts`. That makes route-aware stage-unlock edit actions easier to isolate. Registry code should only need the stage-unlock artifact preview and objective tasks. Workbench rendering should be the only path that needs hrefs for edit links.

This slice should keep the model summary builder pure of route href construction by representing edit actions as lesson keys. It should add a workbench adapter that converts those lesson keys to hrefs for UI rendering. Registry code should stop importing the full route-aware summary builder and instead consume narrow artifact-preview and objective-task helpers.

## Next Plan Recommendation

Exact next plan title: `Make Stage Unlock Summary Boundary Explicit`.

Exact scope: update `apps/web/features/course/lesson/model/stage-unlock.ts` so it no longer imports `apps/web/features/course/lesson/routing/lesson-routes.ts`. Stage-unlock section actions should carry canonical lesson keys, not hrefs. Add narrow model helpers for the registry paths that need only stage-unlock artifact previews and objective tasks. Add a workbench-owned adapter such as `apps/web/features/course/lesson/workbench/stage-unlock-summary.ts` that calls the model builder and adds hrefs using `getLessonHref`. Update workbench components to use workbench summary types, and update focused tests to prove model actions stay key-based while workbench actions resolve to the same canonical hrefs.

Exact implementation boundaries: do not move `apps/web/features/course/lesson/model/manifest.ts`, course registry barrels, lesson content files, workbench renderer, workbench folders beyond adding the adapter, App Router route screens, AppShell, Convex schema, generated Convex files, public Convex function names, checkout, Stripe, billing proof, pricing, promo code behavior, environment behavior, shared UI inventory, or the unrelated stashed scrollbar styling change.

Exact validation boundaries: run static scans proving `stage-unlock.ts` no longer imports lesson routing and registry code no longer imports the full `buildStageUnlockSummary` function. Run focused stage-unlock, course registry, course state lifecycle, watch-lesson contract, and lesson page tests first. Then run `bun run format:check`, `bun run --cwd apps/web lint`, `bun run --cwd apps/web typecheck`, plan lint, Program lint, markdown lint, and `git diff --check`.

Why it is next: it builds directly on the route-helper extraction. It reduces another model-to-route coupling without moving high-fan-in course files or changing route, Convex, checkout, Stripe, billing, pricing, promo code, or environment behavior.

## Risks To Carry Forward

Do not change stage-unlock copy or task semantics casually. The goal is a boundary split, not a product rewrite.

Do not make registry code import workbench paths. Registry helpers should consume model-owned preview and task helpers only.

Do not remove `buildStageUnlockSummary` compatibility in this slice. Preserve it as the model summary builder, but keep route href decoration in the workbench adapter.
