---
title: App Structure Refactor Planning Brief 8
program_id: app-structure-refactor
brief_version: 8
status: current
summary: Continue the course-domain split by moving lesson URL construction out of the curriculum model and into an explicit routing helper.
read_when:
  - Writing the eighth child ExecPlan for the app structure refactor Program.
  - Separating course lesson model data from route URL construction.
  - Preserving Convex, course registry, manifest compatibility, checkout, and billing behavior during course cleanup.
---

# App Structure Refactor Planning Brief 8

## Planning Refresh

This is the eighth planning brief for the app structure refactor Program.

The first seven child ExecPlans are complete. They made selected cross-feature imports explicit, moved shared assertions to `apps/web/lib/assert.ts`, added server-only guards, extracted the shared workspace shell from course ownership, moved route-owned wrapper surfaces into App Router private folders, moved marketing-only effects and a codebase-only hook out of generic shared locations, and moved persisted course completion field IDs into the lesson model.

The current Program recommendation is to continue course-domain cleanup without moving `apps/web/features/course/lesson/model/manifest.ts`, course registry barrels, route screens, Convex schema, generated Convex files, or billing-sensitive behavior. A full workbench renderer move remains too broad because lesson content, field definitions, registry helpers, and tests still have high fan-in. The smaller dependency now visible is that `apps/web/features/course/lesson/model/curriculum.ts` imports `apps/web/config/product.ts` and `apps/web/features/workspace-navigation/lib/lesson-map-href.ts` only to build lesson hrefs and legacy route aliases.

## What The Previous Slice Unblocked

The previous slice removed one direct model-to-workbench import edge. That makes it easier to see the next model boundary smell: curriculum data should define lessons, blocks, route segments, and lookup functions, while route URL construction should live in an explicit routing helper.

This slice should move `getLessonHref` and legacy route alias URL construction out of `apps/web/features/course/lesson/model/curriculum.ts` into a course lesson routing module. The existing manifest and model barrel should keep compatibility exports so older callers do not break, but first-party code that is specifically constructing navigation destinations should import from the new routing helper directly.

## Next Plan Recommendation

Exact next plan title: `Split Lesson Routing From Curriculum`.

Exact scope: create `apps/web/features/course/lesson/routing/lesson-routes.ts` for `getLessonHref` and `legacyRouteAliases`. Replace the curriculum model's URL-producing exports with a route-segment-only alias map that does not import app route config or workspace navigation. Keep compatibility re-exports from `apps/web/features/course/lesson/model/manifest.ts` and `apps/web/features/course/lesson/model/index.ts`. Update first-party route and navigation callers that use `getLessonHref` or `legacyRouteAliases` to import from the routing helper directly. Keep Convex behavior unchanged while making Convex's route destination helper import explicit.

Exact implementation boundaries: do not move `apps/web/features/course/lesson/model/manifest.ts`, course registry barrels, lesson content files, workbench renderer, workbench folders, App Router route screens, AppShell, Convex schema, generated Convex files, public Convex function names, checkout, Stripe, billing proof, pricing, promo code behavior, environment behavior, shared UI inventory, or the unrelated stashed scrollbar styling change.

Exact validation boundaries: run a static scan proving `apps/web/features/course/lesson/model/curriculum.ts` no longer imports `routeConfig` or `getLessonMapHref`. Run focused route, navigation, course registry, course lifecycle, stage unlock, mission, and execute route tests first. Then run `bun run format:check`, `bun run --cwd apps/web lint`, `bun run --cwd apps/web typecheck`, plan lint, Program lint, markdown lint, and `git diff --check`.

Why it is next: it is the smallest course-domain cleanup that reduces route coupling inside the core lesson model while preserving the high-fan-in manifest and registry surfaces for compatibility.

## Risks To Carry Forward

Do not silently change route aliases. The legacy lesson route compatibility map must continue to send current numeric labels and removed legacy IDs to the same destinations.

Do not remove manifest or model barrel compatibility exports in this slice. Many route, UI, test, and Convex-adjacent callers still import from those high-fan-in surfaces.

Do not mistake this slice for a complete Convex-safe course entrypoint. It removes route URL construction from the curriculum model; later slices may still need dedicated Convex import cleanup once the content graph and registry barrels can be split safely.
