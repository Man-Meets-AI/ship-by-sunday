---
title: Make Stage Unlock Summary Boundary Explicit
status: complete
created_at: 2026-04-26
completed_at: 2026-04-26
summary: Split stage-unlock model summary data from workbench href presentation so registry paths do not depend on route-aware summary rendering.
post_build_recap: Stage-unlock model summaries now use lesson-key actions, workbench href decoration lives in a workbench adapter, registry code consumes narrow preview and objective-task helpers, and focused plus app validation passed.
program_id: app-structure-refactor
planning_brief: docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-9.md
read_when:
  - Resuming the stage-unlock boundary split.
  - Checking why stage-unlock model actions use lesson keys while workbench actions use hrefs.
  - Validating that stage-unlock artifact previews, objective tasks, and edit links remain unchanged.
---

# Make Stage Unlock Summary Boundary Explicit

This is a living execution plan. It describes the ninth implementation slice for the app structure refactor Program.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Stage-unlock summaries are used in two different ways. Registry code needs artifact previews and objective tasks so completion behavior and saved artifacts stay coherent. Workbench UI needs a richer summary with edit links. Today those concerns meet in `apps/web/features/course/lesson/model/stage-unlock.ts`, which imports lesson routing only so UI sections can link back to edit lessons.

After this slice, the model summary will stay route-neutral. It will describe edit actions with canonical lesson keys. The workbench will own the href decoration that turns those lesson keys into UI links. User-visible behavior should not change: stage-unlock edit links should still point at the same lessons, and completion tasks plus artifact previews should remain stable.

## Progress

- [x] 2026-04-26 EDT: Confirmed the first eight child ExecPlans are complete and the Program names stage-unlock boundary cleanup as the next recommended slice.
- [x] 2026-04-26 EDT: Inspected `stage-unlock.ts`, registry completion and artifact callers, workbench renderer and types, stage-unlock workbench components, and focused tests before editing.
- [x] 2026-04-26 EDT: Wrote planning brief 9 and opened this active child ExecPlan.
- [x] 2026-04-26 EDT: Removed route href construction from the model stage-unlock summary.
- [x] 2026-04-26 EDT: Added `apps/web/features/course/lesson/workbench/stage-unlock-summary.ts` to convert stage-unlock lesson-key actions to href actions.
- [x] 2026-04-26 EDT: Updated registry code to consume narrow stage-unlock preview and objective-task helpers.
- [x] 2026-04-26 EDT: Updated workbench renderer, workbench types, and stage-unlock UI components to use workbench summary types and the workbench adapter.
- [x] 2026-04-26 EDT: Updated focused tests to prove model actions stay route-neutral and workbench actions resolve to canonical lesson hrefs.
- [x] 2026-04-26 EDT: Static scans confirmed the model stage-unlock file no longer imports routing, registry no longer imports `buildStageUnlockSummary`, and workbench renderer/types/mode components no longer import model stage-unlock directly.
- [x] 2026-04-26 EDT: Focused stage-unlock, course registry, course state lifecycle, watch-lesson contract, and lesson page tests passed.
- [x] 2026-04-26 EDT: App format check, app lint, and app typecheck passed.
- [x] 2026-04-26 EDT: Completed-path plan lint, Program lint, markdown lint, and `git diff --check` passed after archival.

## Surprises & Discoveries

2026-04-26 EDT: Registry completion only needs stage-unlock tasks, and registry artifact preview only needs the stage-unlock preview. Neither path needs workbench edit-link hrefs.

2026-04-26 EDT: Workbench rendering is the only current path that needs stage-unlock action hrefs. That makes an adapter under `apps/web/features/course/lesson/workbench` a narrow enough split.

2026-04-26 EDT: The workbench adapter intentionally imports the model summary builder. The no-direct-model-import scan should target workbench renderer, types, and mode components, not the adapter itself.

## Decision Log

Decision: Keep `buildStageUnlockSummary` in the model but make its actions route-neutral.
Rationale: The function is the existing model summary builder and focused tests already exercise it. Changing action payloads from hrefs to lesson keys removes route coupling without deleting compatibility.
Date: 2026-04-26

Decision: Add narrow registry helpers instead of making registry consume the full summary.
Rationale: Completion and artifact registry code should depend on the data they actually use: objective tasks and artifact previews. This avoids leaking workbench section and href concerns through registry paths.
Date: 2026-04-26

Decision: Put href decoration in a workbench adapter.
Rationale: Hrefs are presentation concerns for UI edit links. The adapter can call the model summary builder and `getLessonHref` without making the model or registry import route helpers.
Date: 2026-04-26

## Outcomes & Retrospective

This plan is complete. Stage-unlock model summaries now represent edit actions with canonical lesson keys and no longer import lesson routing. `apps/web/features/course/lesson/workbench/stage-unlock-summary.ts` is the workbench-owned adapter that turns those lesson keys into href actions with `getLessonHref`.

Registry completion and artifact code now consume narrow helpers from the model stage-unlock module: `getStageUnlockObjectiveTasks` and `buildStageUnlockArtifactPreview`. Workbench renderer, workbench types, and stage-unlock mode components no longer import the model stage-unlock module directly.

Focused stage-unlock, course registry, course state lifecycle, watch-lesson contract, lesson page, format, app lint, app typecheck, plan, Program, markdown, and diff validation passed. This slice did not move the manifest, registry barrels, lesson content, workbench renderer beyond import updates, route screens, AppShell, Convex schema or generated files, public Convex functions, checkout, Stripe, billing proof, pricing, promo code behavior, environment behavior, shared UI inventory, or the unrelated stashed scrollbar styling.

## Context and Orientation

Ship by Sunday's web app lives in `apps/web`. The stage-unlock summary builder currently lives at `apps/web/features/course/lesson/model/stage-unlock.ts`. It builds summary sections, stats, objective tasks, artifact preview data, and optional bridge copy for brief-assembler lessons that unlock the next course stage.

Registry completion code in `apps/web/features/course/lesson/model/registry/completion.ts` uses the stage-unlock summary only to append objective tasks. Registry artifact code in `apps/web/features/course/lesson/model/registry/artifacts.ts` uses it only to return the stage-unlock preview. The workbench renderer in `apps/web/features/course/lesson/workbench/renderer.tsx` passes the full summary to stage-unlock UI components.

The previous slice moved generic lesson href construction into `apps/web/features/course/lesson/routing/lesson-routes.ts`. This slice should keep that routing helper out of the stage-unlock model and call it only from a workbench adapter.

### In Scope

Update `apps/web/features/course/lesson/model/stage-unlock.ts` so stage-unlock edit actions carry canonical lesson keys instead of hrefs, and so the file no longer imports `getLessonHref`.

Add narrow model helpers that return only the stage-unlock artifact preview and objective tasks needed by registry code.

Add `apps/web/features/course/lesson/workbench/stage-unlock-summary.ts` to adapt model summaries into workbench summaries with href-based actions.

Update registry callers, workbench renderer, workbench types, stage-unlock workbench components, and focused stage-unlock tests to use the new boundary.

Update this ExecPlan, the owning Program, and the current planning brief pointer to match the actual change.

### Out Of Scope

Do not move `apps/web/features/course/lesson/model/manifest.ts`, `apps/web/features/course/lesson/model/index.ts`, course registry barrels, lesson content files, workbench renderer beyond import updates, workbench folders beyond adding the adapter, App Router route screens, AppShell, Convex schema, generated Convex files, public Convex function names, checkout, Stripe, billing proof, pricing, promo code behavior, environment behavior, shared UI inventory, or the unrelated stashed scrollbar styling change.

Do not delete or rename feature folders.

Do not change stage-unlock product copy, completion semantics, legacy lesson aliases, route destinations, or billing behavior.

## Plan of Work

Start in `apps/web/features/course/lesson/model/stage-unlock.ts`. Remove the routing import and change section actions from hrefs to canonical lesson keys. Export helper functions that return only the artifact preview and objective tasks for registry callers.

Update `apps/web/features/course/lesson/model/registry/completion.ts` to use the objective-task helper. Update `apps/web/features/course/lesson/model/registry/artifacts.ts` to use the artifact-preview helper. Registry code must not import workbench modules.

Create `apps/web/features/course/lesson/workbench/stage-unlock-summary.ts`. It should call `buildStageUnlockSummary`, map model actions to href actions with `getLessonHref`, and export workbench summary types. Update `apps/web/features/course/lesson/workbench/renderer.tsx`, `apps/web/features/course/lesson/workbench/types.ts`, and stage-unlock workbench components to import workbench-specific types and builder.

Update focused tests so the model summary test proves actions are lesson-key based and the workbench adapter test proves those actions become canonical hrefs.

Finally run focused proof before broad validation. Keep this plan and the Program current after implementation and after validation.

## Milestones

The first milestone is plan and baseline evidence. It is complete when planning brief 9 and this ExecPlan exist, and the plan records the current model, registry, and workbench call sites.

The second milestone is route-neutral model summary. It is complete when `stage-unlock.ts` has no route helper import, model actions use lesson keys, and registry callers consume narrow preview and task helpers.

The third milestone is workbench href adapter. It is complete when workbench rendering gets href-decorated actions from a workbench adapter and focused tests prove edit links still resolve to the same canonical lesson hrefs.

The fourth milestone is validation and archival. It is complete when focused tests, app gates, plan lint, Program lint, markdown lint, and `git diff --check` pass, this ExecPlan moves to `docs/exec-plans/completed/`, and the Program names the next slice.

## Concrete Steps

From repo root, confirm branch and status:

    git status --short --branch

Read the Program, current planning brief, and this plan:

    sed -n '1,280p' docs/programs/completed/2026-04-26-app-structure-refactor/program.md
    sed -n '1,220p' docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-9.md
    sed -n '1,360p' docs/exec-plans/completed/2026-04-26-make-stage-unlock-summary-boundary-explicit.md

Record baseline stage-unlock imports:

    rg 'buildStageUnlockSummary|getLessonHref|lesson-routes|StageUnlockSummary|StageUnlockSection' apps/web/features/course/lesson/model apps/web/features/course/lesson/workbench apps/web/tests/unit/stage-unlock.test.ts --glob '!node_modules'

After implementation, prove the model and registry boundaries:

    rg 'getLessonHref|lesson-routes' apps/web/features/course/lesson/model/stage-unlock.ts
    rg 'buildStageUnlockSummary' apps/web/features/course/lesson/model/registry
    rg '@/features/course/lesson/model/stage-unlock' apps/web/features/course/lesson/workbench/renderer.tsx apps/web/features/course/lesson/workbench/types.ts apps/web/features/course/lesson/workbench/modes

Run focused tests:

    bun run --cwd apps/web test:unit -- tests/unit/stage-unlock.test.ts tests/unit/course-registry.test.ts tests/unit/course-state-lifecycle.test.ts tests/unit/watch-lesson-contract.test.ts tests/unit/app-workspace-lesson-page.test.tsx

Then run app and plan checks:

    bun run format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-26-make-stage-unlock-summary-boundary-explicit.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/completed/2026-04-26-app-structure-refactor docs/exec-plans/completed/2026-04-26-make-stage-unlock-summary-boundary-explicit.md
    git diff --check

## Validation and Acceptance

This slice is accepted because `apps/web/features/course/lesson/model/stage-unlock.ts` no longer imports route helpers, stage-unlock model actions carry lesson keys, workbench UI receives href-decorated actions from `apps/web/features/course/lesson/workbench/stage-unlock-summary.ts`, registry code consumes narrow preview and objective-task helpers, and focused plus app-level validation passed.

Stage-unlock artifact previews, objective tasks, and edit link destinations must remain behaviorally unchanged.

### Test Commands

Run these commands from repo root after implementation:

    rg 'getLessonHref|lesson-routes' apps/web/features/course/lesson/model/stage-unlock.ts
    rg 'buildStageUnlockSummary' apps/web/features/course/lesson/model/registry
    rg '@/features/course/lesson/model/stage-unlock' apps/web/features/course/lesson/workbench/renderer.tsx apps/web/features/course/lesson/workbench/types.ts apps/web/features/course/lesson/workbench/modes
    bun run --cwd apps/web test:unit -- tests/unit/stage-unlock.test.ts tests/unit/course-registry.test.ts tests/unit/course-state-lifecycle.test.ts tests/unit/watch-lesson-contract.test.ts tests/unit/app-workspace-lesson-page.test.tsx
    bun run format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-26-make-stage-unlock-summary-boundary-explicit.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/completed/2026-04-26-app-structure-refactor docs/exec-plans/completed/2026-04-26-make-stage-unlock-summary-boundary-explicit.md
    git diff --check

## Idempotence and Recovery

The split is safe to retry because it is additive around the workbench adapter and narrows registry imports without changing persisted data.

If tests fail because an edit link changes, do not update the expected href casually. Keep the workbench adapter mapped through `getLessonHref` so it stays aligned with canonical lesson routing.

If registry starts importing workbench paths, stop and revert that direction. Registry code must stay model-owned and consume only route-neutral preview or objective-task helpers.

Do not broaden this slice into moving the full workbench, manifest, registry barrel, Convex files, route screens, shared UI, checkout, or billing behavior.

## Artifacts and Notes

Source Program packet:

    docs/programs/completed/2026-04-26-app-structure-refactor/

Current planning brief:

    docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-9.md

Expected new workbench adapter:

    apps/web/features/course/lesson/workbench/stage-unlock-summary.ts

Post-move model and registry scans found no route or full-summary imports:

    rg 'getLessonHref|lesson-routes' apps/web/features/course/lesson/model/stage-unlock.ts
    no matches

    rg 'buildStageUnlockSummary' apps/web/features/course/lesson/model/registry
    no matches

    rg '@/features/course/lesson/model/stage-unlock' apps/web/features/course/lesson/workbench/renderer.tsx apps/web/features/course/lesson/workbench/types.ts apps/web/features/course/lesson/workbench/modes
    no matches

Focused stage-unlock and course validation passed:

    bun run --cwd apps/web test:unit -- tests/unit/stage-unlock.test.ts tests/unit/course-registry.test.ts tests/unit/course-state-lifecycle.test.ts tests/unit/watch-lesson-contract.test.ts tests/unit/app-workspace-lesson-page.test.tsx
    Test Files  5 passed (5)
    Tests  26 passed (26)

App-level validation passed:

    bun run format:check
    All matched files use the correct format.

    bun run --cwd apps/web lint
    Found 0 warnings and 0 errors.

    bun run --cwd apps/web typecheck
    Compiled successfully.

Completed-path plan and Program validation passed:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-26-make-stage-unlock-summary-boundary-explicit.md
    docs/exec-plans/completed/2026-04-26-make-stage-unlock-summary-boundary-explicit.md: ok

    bun run programs:lint
    app-structure-refactor: ok

    bun run markdown:lint -- --paths docs/programs/completed/2026-04-26-app-structure-refactor docs/exec-plans/completed/2026-04-26-make-stage-unlock-summary-boundary-explicit.md
    docs/exec-plans/completed/2026-04-26-make-stage-unlock-summary-boundary-explicit.md: ok
    docs/programs/completed/2026-04-26-app-structure-refactor/program.md: ok

    git diff --check
    no output

Focused validation targets:

    apps/web/tests/unit/stage-unlock.test.ts
    apps/web/tests/unit/course-registry.test.ts
    apps/web/tests/unit/course-state-lifecycle.test.ts
    apps/web/tests/unit/watch-lesson-contract.test.ts
    apps/web/tests/unit/app-workspace-lesson-page.test.tsx

## Interfaces and Dependencies

This plan depends on `docs/programs/completed/2026-04-26-app-structure-refactor/program.md`, `docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-9.md`, `docs/exec-plans/PLANS.md`, `docs/programs/PROGRAMS.md`, `apps/web/features/course/lesson/model/stage-unlock.ts`, `apps/web/features/course/lesson/model/registry/completion.ts`, `apps/web/features/course/lesson/model/registry/artifacts.ts`, `apps/web/features/course/lesson/workbench/renderer.tsx`, `apps/web/features/course/lesson/workbench/types.ts`, `apps/web/features/course/lesson/routing/lesson-routes.ts`, and focused unit tests under `apps/web/tests/unit`.
