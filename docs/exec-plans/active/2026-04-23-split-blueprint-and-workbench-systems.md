---
title: Split Blueprint And Workbench Systems
status: active
created_at: 2026-04-23
completed_at: null
summary: Split the large blueprint controller and repeated workbench upload and checklist behavior into smaller testable feature-local systems without changing visible product behavior.
post_build_recap: null
read_when:
  - Resuming blueprint or workbench structural cleanup.
  - Adding blueprint fields, workbench upload behavior, or lesson workbench modes.
  - Validating the fourth Ship by Sunday recovery slice.
program_id: sbs-codebase-recovery
planning_brief: docs/programs/active/2026-04-23-sbs-codebase-recovery/planning-brief-1.md
---

# Split Blueprint And Workbench Systems

This is a living execution plan. Keep it current as implementation, proof, and discoveries change the blueprint and workbench split.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Feature work is slower when the main blueprint page and lesson workbenches are hard to reason about. The review found one large blueprint page controller and several workbench components that repeat upload, checklist, preview, and error behavior. After this plan, save behavior, validation, navigation, unlock state, upload lifecycle, and checklist rendering should be smaller, named, and independently testable while the visible product remains the same.

This plan is the fourth child slice of the Program packet at `docs/programs/active/2026-04-23-sbs-codebase-recovery/`, written from `planning-brief-1.md`.

## Progress

- [x] 2026-04-23 EDT: Identified blueprint and workbench complexity as the main structural maintenance burden.
- [ ] Split `use-blueprint-page-state.ts` into smaller controllers or hooks.
- [ ] Add focused tests for extracted save, validation, navigation, and field-state behavior.
- [ ] Consolidate repeated workbench upload lifecycle behavior.
- [ ] Consolidate repeated checklist rendering behavior.
- [ ] Split oversized TSX components into UI components plus hooks or helpers.
- [ ] Run focused tests and repo closeout checks.

## Surprises & Discoveries

The main problem is not merely that some files exceed 150 lines. The deeper problem is mixed responsibility. Stateful behavior, data transformation, validation, upload orchestration, and rendering are often colocated in the same module, which makes it hard to change one behavior without touching several others.

## Decision Log

Decision: Preserve current visible product behavior while splitting internals.
Rationale: Product route truth has a separate plan. This slice should make future changes safer without changing the user's workflow.
Date: 2026-04-23

Decision: Split by behavior before styling.
Rationale: Save, validation, navigation, field state, upload, and checklist behavior are the real repeated systems. Styling cleanup belongs later unless a component split requires small presentational changes.
Date: 2026-04-23

## Outcomes & Retrospective

This plan is active. Fill this section after implementation with the modules extracted, behavior preserved, tests added, and any component-size exceptions that remain.

## Context and Orientation

The blueprint page state lives in `apps/web/features/blueprint-flow/hooks/use-blueprint-page-state.ts`. Workbench UI and behavior live under `apps/web/features/course/lesson/workbench/`. Upload behavior appears across reference gallery fields, sketch upload workbench, brand kit image fields, and prompt import flows. Shared upload helpers already exist but are not the only path.

### In Scope

In scope is splitting the blueprint page controller into smaller feature-local hooks or helpers, adding tests around the extracted behavior, creating a shared workbench upload lifecycle where repetition exists, creating a shared checklist renderer where repetition exists, and splitting oversized TSX components while preserving current UI.

### Out Of Scope

Out of scope is changing the canonical route contract, redesigning the blueprint page, changing lesson content, changing storage schema, adding new workbench modes, or removing design dependencies not required by the split.

## Plan of Work

Start by adding characterization tests around the current blueprint page state behavior. The tests should capture save payload construction, validation reveal, navigation decisions, field focus, and generated or optional field handling. If the current hook is hard to test directly, extract one pure helper at a time and add tests as each helper moves.

Then split `use-blueprint-page-state.ts` into smaller feature-local modules. Favor names that describe behavior, such as save controller, validation model, navigation controller, and field state. Keep the top-level hook as the orchestration boundary that the page imports.

Next audit the workbench upload flows. Identify what is shared across reference galleries, sketch upload, brand kit images, and prompt import. Extract one shared upload lifecycle helper or hook and migrate one caller at a time, running focused tests after each migration.

After upload behavior is shared, extract repeated checklist rendering into a small presentation component or renderer. Keep mode-specific labels and data near their owning workbench mode.

Finally split oversized TSX components. Move stateful logic into hooks or helpers and leave rendering components focused on presentation. Do not change user-visible layout except where a split requires preserving the same layout with smaller components.

## Milestones

Milestone 1 characterizes blueprint behavior. At the end, tests prove the current save, validation, and navigation behavior before the split.

Milestone 2 splits the blueprint controller. At the end, the top-level hook delegates to named helpers and the extracted helpers have focused tests.

Milestone 3 consolidates workbench uploads. At the end, repeated upload state and storage behavior share one lifecycle path and migrated callers still pass tests.

Milestone 4 consolidates checklist rendering and splits oversized components. At the end, repeated checklist UI uses one rendering boundary and the largest components have clear UI/logic separation.

Milestone 5 validates the slice. At the end, focused tests, plan lint, markdown lint, and repo quality checks have passed or blockers are recorded.

## Concrete Steps

1. Map the largest blueprint and workbench files:

       cd /Users/parkerrex/Developer/ship-by-sunday
       wc -l apps/web/features/blueprint-flow/hooks/use-blueprint-page-state.ts
       find apps/web/features/course/lesson/workbench -name '*.tsx' -o -name '*.ts' | xargs wc -l | sort -nr | head -30

2. Add or extend tests around blueprint page state behavior. Prefer pure helper tests under `apps/web/tests/unit/` or the nearest existing blueprint-flow test lane.

3. Extract save behavior from `use-blueprint-page-state.ts` into a feature-local helper. Run the focused tests.

4. Extract validation, navigation, and field-state behavior one at a time. After each extraction, run the focused tests again.

5. Audit upload callers with:

       cd /Users/parkerrex/Developer/ship-by-sunday
       rg -n 'upload|storageId|getUploadUrl|preview' apps/web/features/course/lesson/workbench apps/web/features/blueprint-flow

6. Extract the shared upload lifecycle and migrate the smallest caller first. Continue only while focused tests stay green.

7. Extract checklist rendering after upload behavior is stable.

8. Run validation:

       cd /Users/parkerrex/Developer/ship-by-sunday
       bun run --cwd apps/web test:unit -- tests/unit/blueprint-page-state.test.ts
       bun run plans:lint -- --plan docs/exec-plans/active/2026-04-23-split-blueprint-and-workbench-systems.md
       bun run markdown:lint -- --paths docs/exec-plans/active/2026-04-23-split-blueprint-and-workbench-systems.md
       git diff --check
       bun run format
       bun run lint
       bun run typecheck

If the named focused test file is not the final location, replace it with the actual tests added by this slice and record the exact command in `Progress`.

## Validation and Acceptance

This slice is complete when blueprint page behavior is covered by smaller tests, the top-level blueprint hook delegates to named helpers, repeated workbench upload behavior is consolidated, checklist rendering is not repeatedly reimplemented, and visible product behavior remains unchanged.

### Test Commands

Run these commands from `/Users/parkerrex/Developer/ship-by-sunday`:

       bun run --cwd apps/web test:unit -- tests/unit/blueprint-page-state.test.ts
       bun run plans:lint -- --plan docs/exec-plans/active/2026-04-23-split-blueprint-and-workbench-systems.md
       bun run markdown:lint -- --paths docs/exec-plans/active/2026-04-23-split-blueprint-and-workbench-systems.md
       git diff --check
       bun run format
       bun run lint
       bun run typecheck

Also run any existing workbench tests touched by upload or checklist migrations and record exact commands in `Progress`.

## Idempotence and Recovery

Each extraction should be small enough to revert independently. If a helper extraction changes behavior, restore the previous behavior first and keep the helper only after tests prove parity. If a component split creates visual risk, run the smallest available browser smoke for that surface before continuing.

## Artifacts and Notes

Program source for this plan:

       docs/programs/active/2026-04-23-sbs-codebase-recovery/planning-brief-1.md

High-signal files from the review:

       apps/web/features/blueprint-flow/hooks/use-blueprint-page-state.ts
       apps/web/features/course/lesson/workbench/shared/prompt-import-card.tsx
       apps/web/features/course/lesson/workbench/fields/reference-gallery-field-control.tsx
       apps/web/features/course/lesson/workbench/modes/sketch-upload-workbench.tsx

## Interfaces and Dependencies

This plan depends on the current blueprint field contract, Convex-backed blueprint persistence, lesson workbench storage helpers, and existing app UI components. Keep code feature-local and do not introduce top-level generic `utils` buckets.
