---
title: App Structure Refactor Planning Brief 7
program_id: app-structure-refactor
brief_version: 7
status: current
summary: Start the course-domain split by removing direct workbench-mode imports from backend-safe lesson completion registry logic.
read_when:
  - Writing the seventh child ExecPlan for the app structure refactor Program.
  - Splitting course domain code from lesson workbench UI and completion copy.
  - Preserving Convex, course registry, manifest, checkout, and billing behavior during course cleanup.
---

# App Structure Refactor Planning Brief 7

## Planning Refresh

This is the seventh planning brief for the app structure refactor Program.

The first child ExecPlan is complete at `docs/exec-plans/completed/2026-04-26-make-app-structure-boundaries-explicit.md`. It made selected cross-feature imports explicit, moved shared assertion helpers to `apps/web/lib/assert.ts`, added server-only guards to true server helper modules, and passed focused and app-level validation.

The second child ExecPlan is complete at `docs/exec-plans/completed/2026-04-26-extract-workspace-shell-from-course.md`. It moved the shared AppShell implementation into `apps/web/features/workspace-shell`, updated first-party imports, kept temporary compatibility exports at the old course-owned shell path, and passed focused and app-level validation.

The third child ExecPlan is complete at `docs/exec-plans/completed/2026-04-26-make-route-ownership-visible.md`. It moved the protected workspace access gate and legacy blueprint redirect helper into private `apps/web/app/(workspace)` folders, updated first-party imports and tests, kept temporary compatibility exports, and passed focused and app-level validation.

The fourth child ExecPlan is complete at `docs/exec-plans/completed/2026-04-26-make-identity-route-ownership-visible.md`. It moved identity route wrapper screens and support shell code into private `apps/web/app/(identity)` folders, updated first-party imports and tests, kept temporary compatibility exports, and passed focused and app-level validation.

The fifth child ExecPlan is complete at `docs/exec-plans/completed/2026-04-26-finish-route-ownership-visibility.md`. It moved checkout success wrappers, review route wrappers, and API route path contracts into App Router private folders, kept compatibility exports, and passed focused and app-level validation.

The sixth child ExecPlan is complete at `docs/exec-plans/completed/2026-04-26-clean-shared-ui-and-hooks.md`. It moved marketing-only visual effects and the blueprint-only keyboard shortcut hook into feature-owned paths, kept compatibility exports, and passed focused and app-level validation without deleting shared UI inventory.

## What The Previous Slice Unblocked

Shared UI and hook cleanup no longer blocks the course-domain split. The next safe course move should not relocate the full lesson registry, manifest, workbench renderer, or route screens. The current direct smell is smaller: `apps/web/features/course/lesson/model/registry/completion.ts` imports persisted completion field IDs from workbench mode constant files, even though that registry logic is part of the backend-safe lesson model consumed by Convex and app code.

This slice should move the persisted field IDs that completion logic needs into a model-owned file and make workbench constants re-export those IDs. That removes the direct model-to-workbench dependency without changing the registry, manifest, lesson content, Convex schema, or public behavior.

## Next Plan Recommendation

Exact next plan title: `Split Course Completion Field IDs From Workbench`.

Exact scope: create a backend-safe lesson model file for the persisted completion field IDs currently imported by `apps/web/features/course/lesson/model/registry/completion.ts` from `core-ux-build-constants.ts` and `skills-quickstart-constants.ts`. Update completion logic to import those IDs from the model-owned file. Update the existing workbench constant files to re-export the model-owned IDs so workbench and existing callers keep the same public constants. Update focused tests where they prove model completion behavior to use the model-owned ID path.

Exact implementation boundaries: do not move `apps/web/features/course/lesson/model/manifest.ts`, course registry barrels, lesson content files, workbench renderer, workbench folders, route screens, Convex schema, generated Convex files, public Convex function names, checkout, Stripe, billing proof, pricing, promo code behavior, environment behavior, route behavior, shared UI inventory, or the unrelated stashed scrollbar styling change.

Exact validation boundaries: run a static import scan proving `apps/web/features/course/lesson/model/registry/completion.ts` no longer imports `lesson/workbench`. Run focused course registry, watch-lesson contract, core UX build constants, course state lifecycle, and stage unlock tests first. Then run `bun run format:check`, `bun run --cwd apps/web lint`, `bun run --cwd apps/web typecheck`, plan lint, Program lint, markdown lint, and `git diff --check`.

Why it is next: it is the smallest course-domain cleanup that directly addresses the Program's backend-safe logic concern. A wholesale workbench move is still too broad while the lesson manifest and content graph have high fan-in.

## Risks To Carry Forward

Do not duplicate persisted field ID string literals in model and workbench files. The model-owned file should be the source, and workbench constants should re-export or consume it.

Do not move the lesson manifest or registry barrel in this slice. Those files are imported by app routes, Convex, tests, navigation, checkout, and course UI.

Do not mistake this slice for a full Convex hardening pass. It removes one direct model-to-workbench edge; later course slices may still need a dedicated Convex-safe entrypoint audit.
