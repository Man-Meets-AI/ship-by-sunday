---
title: Split Course Completion Field IDs From Workbench
status: complete
created_at: 2026-04-26
completed_at: 2026-04-26
summary: Move persisted lesson completion field IDs into the course lesson model so backend-safe completion logic no longer imports workbench mode constants.
post_build_recap: Persisted completion field IDs now live in the course lesson model, workbench constants re-export them, lesson completion logic no longer directly imports workbench paths, and focused plus app validation passed.
program_id: app-structure-refactor
planning_brief: docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-7.md
read_when:
  - Resuming the course completion field ID split.
  - Checking why this course-domain slice avoids moving the manifest, registry, or workbench renderer.
  - Validating that lesson completion behavior stays unchanged while model-to-workbench imports shrink.
---

# Split Course Completion Field IDs From Workbench

This is a living execution plan. It describes the seventh implementation slice for the app structure refactor Program.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The lesson completion registry is part of the course domain model. It is consumed by app code and indirectly by Convex-facing course logic, so it should not import workbench-mode constant files just to compare persisted field IDs. After this slice, the persisted completion field IDs used by backend-safe completion logic will live in the lesson model, while workbench constant files continue to expose the same constants for UI code.

This slice is intentionally narrow. It does not move the course registry, manifest, lesson content graph, workbench renderer, route screens, Convex files, or billing behavior.

## Progress

- [x] 2026-04-26 EDT: Confirmed the first six child ExecPlans are complete and the Program names course-domain and Convex-safe logic cleanup as the next recommended slice.
- [x] 2026-04-26 EDT: Inspected the Program packet, course feature tree, direct course model imports, completion registry, core UX build constants, skills quickstart constants, and focused course tests before editing.
- [x] 2026-04-26 EDT: Wrote planning brief 7 and opened this active child ExecPlan.
- [x] 2026-04-26 EDT: Added `apps/web/features/course/lesson/model/completion-field-ids.ts` for persisted completion field IDs.
- [x] 2026-04-26 EDT: Updated `registry/completion.ts` to import completion field IDs from the lesson model instead of workbench-mode constants.
- [x] 2026-04-26 EDT: Updated core UX build and skills quickstart workbench constants to re-export the model-owned IDs.
- [x] 2026-04-26 EDT: Updated watch-lesson contract tests to import model-owned skills completion IDs while keeping UI checklist options from workbench constants.
- [x] 2026-04-26 EDT: Confirmed no direct `lesson/workbench` imports remain under `apps/web/features/course/lesson/model`.
- [x] 2026-04-26 EDT: Focused course registry, watch-lesson contract, core UX build constants, course state lifecycle, and stage unlock tests passed.
- [x] 2026-04-26 EDT: App format check, app lint, and app typecheck passed after the completion field ID extraction.
- [x] 2026-04-26 EDT: Completed-path plan lint, Program lint, markdown lint, and `git diff --check` passed after archival.

## Surprises & Discoveries

2026-04-26 EDT: A full lesson workbench move would touch many UI modes, tests, lesson content imports, and compatibility paths. The smallest safe course-domain slice is to remove the direct `model/registry/completion.ts` imports from workbench-mode constants first.

2026-04-26 EDT: The direct static import scan under `apps/web/features/course/lesson/model` found only `registry/completion.ts` importing `lesson/workbench`. This makes the persisted completion field ID extraction a crisp first slice.

## Decision Log

Decision: Extract only persisted completion field IDs in this slice.
Rationale: These IDs are domain data used by completion logic. Moving them into the model removes a backend-safety smell without moving high-fan-in course registry, manifest, content, or workbench renderer files.
Date: 2026-04-26

Decision: Keep workbench constants as compatibility exports for the moved IDs.
Rationale: Workbench UI and tests already import these constants. Re-exporting the model-owned IDs avoids duplicating string literals and preserves the old workbench import surface.
Date: 2026-04-26

## Outcomes & Retrospective

This plan is complete. Persisted completion field IDs used by course domain completion logic now live in `apps/web/features/course/lesson/model/completion-field-ids.ts`. `apps/web/features/course/lesson/model/registry/completion.ts` imports those model-owned IDs, and the core UX build plus skills quickstart workbench constants re-export the same IDs for UI compatibility.

Focused course registry, watch-lesson contract, core UX build constants, course state lifecycle, stage unlock, format, app lint, app typecheck, plan, Program, markdown, and diff validation passed. The implementation did not move the course registry, manifest, lesson content graph, workbench renderer, workbench folders, route screens, Convex schema or generated files, public Convex functions, checkout, Stripe, billing proof, pricing, promo code behavior, environment behavior, shared UI inventory, or the unrelated stashed scrollbar styling.

## Context and Orientation

Ship by Sunday's web app lives in `apps/web`. The overloaded course feature lives at `apps/web/features/course`. The course lesson model lives under `apps/web/features/course/lesson/model`, while lesson workbench UI and workbench-mode constants live under `apps/web/features/course/lesson/workbench`.

`apps/web/features/course/lesson/model/registry/completion.ts` computes objective tasks and completion issues for lessons. It currently imports `CORE_UX_BUILD_FIELD_IDS`, `BUILD_SKILLS_USAGE_CHECKLIST_FIELD_ID`, and `BUILD_SKILLS_FIRST_TAGGED_PROMPT_FIELD_ID` from workbench-mode constant files. Those values are persisted field IDs used by domain completion rules, not UI-only copy.

The current workbench constant files also export UI copy, checklist options, prompt templates, and other presentation-specific values. This slice should not move that presentation copy. It should only move the persisted IDs completion logic needs.

### In Scope

Create `apps/web/features/course/lesson/model/completion-field-ids.ts` for the persisted completion field IDs used by course domain completion logic.

Update `apps/web/features/course/lesson/model/registry/completion.ts` to import those IDs from the new model file.

Update `apps/web/features/course/lesson/workbench/modes/core-ux-build/core-ux-build-constants.ts` and `apps/web/features/course/lesson/workbench/modes/skills-quickstart/skills-quickstart-constants.ts` to re-export the model-owned IDs while keeping their existing public constants.

Update focused model completion tests to import the model-owned IDs where those tests are proving course-domain completion behavior.

Update this ExecPlan, the owning Program, the current planning brief pointer, and only plan surfaces required by the actual changes.

### Out Of Scope

Do not move `apps/web/features/course/lesson/model/manifest.ts`, `apps/web/features/course/lesson/model/index.ts`, registry barrels, lesson content files, workbench renderer, workbench folders, App Router route screens, AppShell, route ownership files, shared UI inventory, Convex schema, generated Convex files, public Convex function names, checkout, Stripe, billing proof, pricing, promo code behavior, environment behavior, or the unrelated stashed scrollbar styling change.

Do not delete or rename feature folders.

## Plan of Work

Start by recording the baseline direct import scan for model-to-workbench edges. The expected direct edge is `apps/web/features/course/lesson/model/registry/completion.ts`.

Create the model-owned completion field ID module. Move the persisted ID constants from the workbench files into that module, then update the workbench files to re-export those constants from the model file. Do not duplicate the literal strings.

Update `registry/completion.ts` and focused tests to import from the model-owned path. Run a static scan proving no direct `lesson/workbench` imports remain under `apps/web/features/course/lesson/model`.

Run focused tests immediately after the code change, then run app-level and plan-level validation. Keep this ExecPlan and the Program current as implementation and validation results become real.

## Milestones

The first milestone is plan and baseline evidence. It is complete when planning brief 7 and this ExecPlan exist, lint cleanly, and baseline scans prove the exact model-to-workbench import being removed.

The second milestone is completion ID extraction. It is complete when the model-owned ID module exists, workbench constants re-export the moved IDs, completion logic imports the model-owned path, and no direct `lesson/workbench` imports remain under the lesson model.

The third milestone is validation. It is complete when focused course registry, watch-lesson contract, core UX build constants, course state lifecycle, stage unlock, format, app lint, app typecheck, plan lint, Program lint, markdown lint, and `git diff --check` pass.

The fourth milestone is archival. It is complete when this ExecPlan records the completed outcome, moves from `docs/exec-plans/active/` to `docs/exec-plans/completed/`, and the Program names the next slice.

## Concrete Steps

From repo root, confirm branch and status:

    git status --short --branch

Read the Program, the current planning brief, and this plan:

    sed -n '1,260p' docs/programs/completed/2026-04-26-app-structure-refactor/program.md
    sed -n '1,220p' docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-7.md
    sed -n '1,320p' docs/exec-plans/completed/2026-04-26-split-course-completion-field-ids-from-workbench.md

Record baseline imports:

    rg 'features/course/lesson/workbench' apps/web/features/course/lesson/model apps/web/convex apps/web/features/workspace-navigation apps/web/features/checkout apps/web/platform/billing --glob '!node_modules'
    rg 'CORE_UX_BUILD_FIELD_IDS|BUILD_SKILLS_USAGE_CHECKLIST_FIELD_ID|BUILD_SKILLS_FIRST_TAGGED_PROMPT_FIELD_ID' apps/web/features/course/lesson/model apps/web/features/course/lesson/workbench/modes apps/web/tests --glob '!node_modules'

After the move, prove the model no longer directly imports workbench files:

    rg 'features/course/lesson/workbench|lesson/workbench' apps/web/features/course/lesson/model --glob '!node_modules'

Run focused tests:

    bun run --cwd apps/web test:unit -- tests/unit/course-registry.test.ts tests/unit/watch-lesson-contract.test.ts tests/unit/core-ux-build-constants.test.ts tests/unit/course-state-lifecycle.test.ts tests/unit/stage-unlock.test.ts

Then run app and plan checks:

    bun run format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-26-split-course-completion-field-ids-from-workbench.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/completed/2026-04-26-app-structure-refactor docs/exec-plans/completed/2026-04-26-split-course-completion-field-ids-from-workbench.md
    git diff --check

## Validation and Acceptance

This slice is accepted because persisted completion field IDs used by course domain completion logic live in `apps/web/features/course/lesson/model/completion-field-ids.ts`, `registry/completion.ts` imports that model-owned file, workbench constants re-export the same IDs, no direct `lesson/workbench` imports remain under `apps/web/features/course/lesson/model`, and focused plus app-level validation passed.

Course completion behavior must remain unchanged. Tests must still prove course registry sequence, watch lesson completion gates, core UX build constant compatibility, course state lifecycle, and stage unlock behavior.

### Test Commands

Run these commands from repo root after implementation:

    rg 'features/course/lesson/workbench|lesson/workbench' apps/web/features/course/lesson/model --glob '!node_modules'
    bun run --cwd apps/web test:unit -- tests/unit/course-registry.test.ts tests/unit/watch-lesson-contract.test.ts tests/unit/core-ux-build-constants.test.ts tests/unit/course-state-lifecycle.test.ts tests/unit/stage-unlock.test.ts
    bun run format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-26-split-course-completion-field-ids-from-workbench.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/completed/2026-04-26-app-structure-refactor docs/exec-plans/completed/2026-04-26-split-course-completion-field-ids-from-workbench.md
    git diff --check

## Idempotence and Recovery

The extraction is safe to retry because the new model file is additive and the old workbench constant imports remain valid through re-exports.

If tests fail because a field ID drifted, do not add a duplicate literal. Make the model-owned constant the single source and re-export it from workbench constants.

If an import scan finds another model-to-workbench edge, record it in `Surprises & Discoveries` before changing scope. Do not broaden this slice into moving the full workbench, manifest, registry barrel, Convex files, route screens, shared UI, checkout, or billing behavior.

## Artifacts and Notes

Source Program packet:

    docs/programs/completed/2026-04-26-app-structure-refactor/

Current planning brief:

    docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-7.md

Baseline direct model-to-workbench edge:

    apps/web/features/course/lesson/model/registry/completion.ts imports IDs from workbench mode constant files.

Post-move scan found no direct model-to-workbench imports:

    rg 'features/course/lesson/workbench|lesson/workbench' apps/web/features/course/lesson/model --glob '!node_modules'
    no matches

Focused course-domain validation passed:

    bun run --cwd apps/web test:unit -- tests/unit/course-registry.test.ts tests/unit/watch-lesson-contract.test.ts tests/unit/core-ux-build-constants.test.ts tests/unit/course-state-lifecycle.test.ts tests/unit/stage-unlock.test.ts
    Test Files  5 passed (5)
    Tests  24 passed (24)

App-level validation passed:

    bun run format:check
    All matched files use the correct format.

    bun run --cwd apps/web lint
    Found 0 warnings and 0 errors.

    bun run --cwd apps/web typecheck
    Compiled successfully.

Completed-path plan and Program validation passed:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-26-split-course-completion-field-ids-from-workbench.md
    docs/exec-plans/completed/2026-04-26-split-course-completion-field-ids-from-workbench.md: ok

    bun run programs:lint
    app-structure-refactor: ok

    bun run markdown:lint -- --paths docs/programs/completed/2026-04-26-app-structure-refactor docs/exec-plans/completed/2026-04-26-split-course-completion-field-ids-from-workbench.md
    docs/exec-plans/completed/2026-04-26-split-course-completion-field-ids-from-workbench.md: ok
    docs/programs/completed/2026-04-26-app-structure-refactor/program.md: ok

    git diff --check
    no output

Focused validation targets:

    apps/web/tests/unit/course-registry.test.ts
    apps/web/tests/unit/watch-lesson-contract.test.ts
    apps/web/tests/unit/core-ux-build-constants.test.ts
    apps/web/tests/unit/course-state-lifecycle.test.ts
    apps/web/tests/unit/stage-unlock.test.ts

## Interfaces and Dependencies

This plan depends on `docs/programs/completed/2026-04-26-app-structure-refactor/program.md`, `docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-7.md`, `docs/exec-plans/PLANS.md`, `docs/programs/PROGRAMS.md`, `apps/web/features/course/lesson/model/registry/completion.ts`, `apps/web/features/course/lesson/workbench/modes/core-ux-build/core-ux-build-constants.ts`, `apps/web/features/course/lesson/workbench/modes/skills-quickstart/skills-quickstart-constants.ts`, and focused course tests under `apps/web/tests/unit`.
