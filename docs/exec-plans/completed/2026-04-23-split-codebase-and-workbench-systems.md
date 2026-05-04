---
title: Split Codebase And Workbench Systems
status: complete
created_at: 2026-04-23
completed_at: 2026-04-24
summary: Split the large codebase controller and repeated workbench upload and checklist behavior into smaller testable feature-local systems without changing visible product behavior.
post_build_recap: The codebase page hook now delegates draft, validation, focus, and optimistic update behavior to feature-local helpers; reference gallery upload and model behavior now share the existing upload helper; repeated plain checklist rows now use one renderer across migrated workbench modes; focused tests and required closeout checks passed.
read_when:
  - Resuming codebase or workbench structural cleanup.
  - Adding codebase fields, workbench upload behavior, or lesson workbench modes.
  - Validating the fourth Ship by Sunday recovery slice.
program_id: sbs-codebase-recovery
planning_brief: docs/programs/active/2026-04-23-sbs-codebase-recovery/planning-brief-1.md
---

# Split Codebase And Workbench Systems

This is a living execution plan. Keep it current as implementation, proof, and discoveries change the codebase and workbench split.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Feature work is slower when the main codebase page and lesson workbenches are hard to reason about. The review found one large codebase page controller and several workbench components that repeat upload, checklist, preview, and error behavior. After this plan, save behavior, validation, navigation, unlock state, upload lifecycle, and checklist rendering should be smaller, named, and independently testable while the visible product remains the same.

This plan is the fourth child slice of the Program packet at `docs/programs/active/2026-04-23-sbs-codebase-recovery/`, written from `planning-brief-1.md`.

## Progress

- [x] 2026-04-23 EDT: Identified codebase and workbench complexity as the main structural maintenance burden.
- [x] 2026-04-24 EDT: Resumed after product route contract reconciliation completed and confirmed this slice must preserve the new route contract.
- [x] 2026-04-24 EDT: Mapped current hotspots: `use-codebase-page-state.ts` is 633 lines; largest workbench files are `sketch-upload-workbench.tsx` at 565 lines, `shared/prompt-import-card.tsx` at 523 lines, and `fields/reference-gallery-field-control.tsx` at 425 lines.
- [x] Split `use-codebase-page-state.ts` into smaller controllers or hooks: the hook now delegates draft payload, validation, focus, and optimistic update behavior to feature-local helpers and dropped from 633 lines to 270 lines.
- [x] Add focused tests for extracted save, validation, navigation, and field-state behavior: `apps/web/tests/unit/codebase-page-state-model.test.ts` covers draft flattening, untouched generated-scope stripping, stale derived design clearing, section status, field errors, and page feedback.
- [x] Consolidate repeated workbench upload lifecycle behavior: `reference-gallery-field-control.tsx` now uses `uploadFilesToLessonStorage`, matching upload fields, brand kit image fields, and sketch uploads.
- [x] Consolidate repeated checklist rendering behavior: `ChecklistFieldRows` now owns the normalized checklist row loop for brand kit, build-product iteration, route-access orientation, brief unlock review, and production deploy handoff cards.
- [x] Split oversized TSX components into UI components plus hooks or helpers: reference gallery add controls and model behavior now live in `reference-gallery-add-controls.tsx` and `reference-gallery-field-model.ts`; `reference-gallery-field-control.tsx` dropped from 425 lines to 310 lines.
- [x] 2026-04-24 EDT: Focused validation passed with `PATH="$HOME/.bun/bin:$PATH" bun run --cwd apps/web test:unit -- tests/unit/codebase-page-state-model.test.ts tests/unit/use-codebase-page-state.test.tsx tests/unit/upload-storage.test.ts tests/unit/reference-gallery.test.ts tests/unit/brand-kit-workbench.test.tsx tests/unit/build-product-iteration-workbench.test.tsx tests/unit/route-access-orientation-workbench.test.tsx tests/unit/production-deploy-handoff-workbench.test.tsx` (8 files, 18 tests passed, 3.72s).
- [x] 2026-04-24 EDT: `PATH="$HOME/.bun/bin:$PATH" bun run format` passed (`oxfmt`, 1006 files, 415ms).
- [x] 2026-04-24 EDT: `PATH="$HOME/.bun/bin:$PATH" bun run lint` passed (0 warnings, 0 errors, 945 files).
- [x] 2026-04-24 EDT: `PATH="$HOME/.bun/bin:$PATH" bun run typecheck` passed after restoring the hook's public `CodebasePageSectionStatus` export and local `CodebaseStepInlineFeedback` import.
- [x] 2026-04-24 EDT: `PATH="$HOME/.bun/bin:$PATH" bun run plans:lint -- --plan docs/exec-plans/active/2026-04-23-split-codebase-and-workbench-systems.md` passed.
- [x] 2026-04-24 EDT: `PATH="$HOME/.bun/bin:$PATH" bun run markdown:lint -- --paths docs/exec-plans/active/2026-04-23-split-codebase-and-workbench-systems.md` passed.
- [x] 2026-04-24 EDT: `git diff --check` passed.
- [x] Run focused tests and repo closeout checks.
- [x] 2026-04-24 EDT: Post-move validation passed with `PATH="$HOME/.bun/bin:$PATH" bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-23-split-codebase-and-workbench-systems.md`, `PATH="$HOME/.bun/bin:$PATH" bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-23-split-codebase-and-workbench-systems.md docs/programs/active/2026-04-23-sbs-codebase-recovery/program.md docs/programs/active/2026-04-23-sbs-codebase-recovery/dependency-graph.md`, `PATH="$HOME/.bun/bin:$PATH" bun run programs:lint`, and `git diff --check`.

## Surprises & Discoveries

The main problem is not merely that some files exceed 150 lines. The deeper problem is mixed responsibility. Stateful behavior, data transformation, validation, upload orchestration, and rendering are often colocated in the same module, which makes it hard to change one behavior without touching several others.

Current upload inspection shows most upload fields already use `apps/web/features/course/lesson/workbench/fields/upload-storage.ts`, but `reference-gallery-field-control.tsx` still performs its own upload URL, fetch, storage ID parsing, object URL creation, and error handling. Current checklist inspection shows a shared `ChecklistOptionRow` exists for generic field rendering, but multiple mode-specific components still duplicate the same normalize-map-toggle-render loop.

After the split, direct upload storage callers under `apps/web/features/course/lesson/workbench` are `upload-field-control.tsx`, `reference-gallery-field-control.tsx`, `sketch-upload-workbench.tsx`, and `brand-kit-brand-inputs-image-field.tsx`, all through `uploadFilesToLessonStorage`. Remaining direct `normalizeChecklistValue` mode callers are specialized renderers that add badge-, grid-, or mode-specific content rather than plain repeated checklist rows.

The first broad typecheck after extraction failed because the top-level codebase hook had stopped exporting `CodebasePageSectionStatus`, which `codebase-page-progress-sidebar.tsx` imports as part of the hook's public surface. The next typecheck failed because the hook still used `CodebaseStepInlineFeedback` locally after the validation extraction but lacked its type import. Both were extraction contract gaps, and the final typecheck passed after restoring the export and import.

## Decision Log

Decision: Preserve current visible product behavior while splitting internals.
Rationale: Product route truth has a separate plan. This slice should make future changes safer without changing the user's workflow.
Date: 2026-04-23

Decision: Split by behavior before styling.
Rationale: Save, validation, navigation, field state, upload, and checklist behavior are the real repeated systems. Styling cleanup belongs later unless a component split requires small presentational changes.
Date: 2026-04-23

Decision: Treat the just-completed route contract as a hard prerequisite and do not change route behavior in this slice.
Rationale: The Program dependency graph now depends on the route model staying stable while this plan splits internal codebase and workbench systems. Any route or post-review behavior change belongs in a new plan.
Date: 2026-04-24

Decision: Consolidate the reference-gallery upload path onto the existing lesson upload storage helper before touching broader upload UI.
Rationale: `upload-storage.ts` is already used by normal upload fields, brand kit image fields, and sketch uploads. Migrating the one duplicate uploader removes the real repeated upload lifecycle without introducing a new abstraction.
Date: 2026-04-24

## Outcomes & Retrospective

This plan is complete. `use-codebase-page-state.ts` now stays as the page orchestration boundary and delegates draft payload construction, generated-scope field cleanup, derived design cleanup, section status, field errors, page feedback, first-missing-field focus, and optimistic Convex updates to named feature-local helpers. Focused tests cover the extracted draft and validation model behavior, and the existing hook test still passes.

Workbench upload behavior is now centralized through `uploadFilesToLessonStorage` for the reference gallery, standard upload field, brand kit image field, and sketch uploads. `upload-storage.test.ts` locks the generated URL fetch contract and missing storage ID failure path.

Repeated plain checklist row rendering now uses `ChecklistFieldRows` in the migrated brand kit, build-product iteration, route-access orientation, brief unlock review, and production deploy handoff cards. Remaining direct checklist normalization callers are specialized renderers with badge, grid, or mode-specific content.

The largest touched TSX file, `reference-gallery-field-control.tsx`, dropped from 425 lines to 310 lines by moving add-control UI into `reference-gallery-add-controls.tsx` and browser/model helpers into `reference-gallery-field-model.ts`. `sketch-upload-workbench.tsx` and `prompt-import-card.tsx` remain large but were not changed because the repeated upload/checklist responsibilities targeted by this slice are now shared and tested.

## Context and Orientation

The codebase page state lives in `apps/web/features/codebase-flow/hooks/use-codebase-page-state.ts`. Workbench UI and behavior live under `apps/web/features/course/lesson/workbench/`. Upload behavior appears across reference gallery fields, sketch upload workbench, brand kit image fields, and prompt import flows. Shared upload helpers already exist but are not the only path.

### In Scope

In scope is splitting the codebase page controller into smaller feature-local hooks or helpers, adding tests around the extracted behavior, creating a shared workbench upload lifecycle where repetition exists, creating a shared checklist renderer where repetition exists, and splitting oversized TSX components while preserving current UI.

### Out Of Scope

Out of scope is changing the canonical route contract, redesigning the codebase page, changing lesson content, changing storage schema, adding new workbench modes, or removing design dependencies not required by the split.

## Plan of Work

Start by adding characterization tests around the current codebase page state behavior. The tests should capture save payload construction, validation reveal, navigation decisions, field focus, and generated or optional field handling. If the current hook is hard to test directly, extract one pure helper at a time and add tests as each helper moves.

Then split `use-codebase-page-state.ts` into smaller feature-local modules. Favor names that describe behavior, such as save controller, validation model, navigation controller, and field state. Keep the top-level hook as the orchestration boundary that the page imports.

Next audit the workbench upload flows. Identify what is shared across reference galleries, sketch upload, brand kit images, and prompt import. Extract one shared upload lifecycle helper or hook and migrate one caller at a time, running focused tests after each migration.

After upload behavior is shared, extract repeated checklist rendering into a small presentation component or renderer. Keep mode-specific labels and data near their owning workbench mode.

Finally split oversized TSX components. Move stateful logic into hooks or helpers and leave rendering components focused on presentation. Do not change user-visible layout except where a split requires preserving the same layout with smaller components.

## Milestones

Milestone 1 characterizes codebase behavior. At the end, tests prove the current save, validation, and navigation behavior before the split.

Milestone 2 splits the codebase controller. At the end, the top-level hook delegates to named helpers and the extracted helpers have focused tests.

Milestone 3 consolidates workbench uploads. At the end, repeated upload state and storage behavior share one lifecycle path and migrated callers still pass tests.

Milestone 4 consolidates checklist rendering and splits oversized components. At the end, repeated checklist UI uses one rendering boundary and the largest components have clear UI/logic separation.

Milestone 5 validates the slice. At the end, focused tests, plan lint, markdown lint, and repo quality checks have passed or blockers are recorded.

## Concrete Steps

1. Map the largest codebase and workbench files:

       cd /Users/parkerrex/Developer/ship-by-sunday
       wc -l apps/web/features/codebase-flow/hooks/use-codebase-page-state.ts
       find apps/web/features/course/lesson/workbench -name '*.tsx' -o -name '*.ts' | xargs wc -l | sort -nr | head -30

2. Add or extend tests around codebase page state behavior. Prefer pure helper tests under `apps/web/tests/unit/` or the nearest existing codebase-flow test lane.

3. Extract save behavior from `use-codebase-page-state.ts` into a feature-local helper. Run the focused tests.

4. Extract validation, navigation, and field-state behavior one at a time. After each extraction, run the focused tests again.

5. Audit upload callers with:

       cd /Users/parkerrex/Developer/ship-by-sunday
       rg -n 'upload|storageId|getUploadUrl|preview' apps/web/features/course/lesson/workbench apps/web/features/codebase-flow

6. Extract the shared upload lifecycle and migrate the smallest caller first. Continue only while focused tests stay green.

7. Extract checklist rendering after upload behavior is stable.

8. Run validation:

       cd /Users/parkerrex/Developer/ship-by-sunday
       bun run --cwd apps/web test:unit -- tests/unit/codebase-page-state-model.test.ts tests/unit/use-codebase-page-state.test.tsx tests/unit/upload-storage.test.ts tests/unit/reference-gallery.test.ts tests/unit/brand-kit-workbench.test.tsx tests/unit/build-product-iteration-workbench.test.tsx tests/unit/route-access-orientation-workbench.test.tsx tests/unit/production-deploy-handoff-workbench.test.tsx
       bun run plans:lint -- --plan docs/exec-plans/active/2026-04-23-split-codebase-and-workbench-systems.md
       bun run markdown:lint -- --paths docs/exec-plans/active/2026-04-23-split-codebase-and-workbench-systems.md
       git diff --check
       bun run format
       bun run lint
       bun run typecheck

If the named focused test file is not the final location, replace it with the actual tests added by this slice and record the exact command in `Progress`.

## Validation and Acceptance

This slice is complete when codebase page behavior is covered by smaller tests, the top-level codebase hook delegates to named helpers, repeated workbench upload behavior is consolidated, checklist rendering is not repeatedly reimplemented, and visible product behavior remains unchanged.

### Test Commands

Run these commands from `/Users/parkerrex/Developer/ship-by-sunday`:

       bun run --cwd apps/web test:unit -- tests/unit/codebase-page-state-model.test.ts tests/unit/use-codebase-page-state.test.tsx tests/unit/upload-storage.test.ts tests/unit/reference-gallery.test.ts tests/unit/brand-kit-workbench.test.tsx tests/unit/build-product-iteration-workbench.test.tsx tests/unit/route-access-orientation-workbench.test.tsx tests/unit/production-deploy-handoff-workbench.test.tsx
       bun run plans:lint -- --plan docs/exec-plans/active/2026-04-23-split-codebase-and-workbench-systems.md
       bun run markdown:lint -- --paths docs/exec-plans/active/2026-04-23-split-codebase-and-workbench-systems.md
       git diff --check
       bun run format
       bun run lint
       bun run typecheck

Focused result: 8 files and 18 tests passed in 3.58s on the final run. Plan lint, markdown lint, `git diff --check`, `bun run format`, `bun run lint`, and `bun run typecheck` all passed.

## Idempotence and Recovery

Each extraction should be small enough to revert independently. If a helper extraction changes behavior, restore the previous behavior first and keep the helper only after tests prove parity. If a component split creates visual risk, run the smallest available browser smoke for that surface before continuing.

## Artifacts and Notes

Program source for this plan:

       docs/programs/active/2026-04-23-sbs-codebase-recovery/planning-brief-1.md

High-signal files from the review:

       apps/web/features/codebase-flow/hooks/use-codebase-page-state.ts
       apps/web/features/course/lesson/workbench/shared/prompt-import-card.tsx
       apps/web/features/course/lesson/workbench/fields/reference-gallery-field-control.tsx
       apps/web/features/course/lesson/workbench/modes/sketch-upload-workbench.tsx

## Interfaces and Dependencies

This plan depends on the current codebase field contract, Convex-backed codebase persistence, lesson workbench storage helpers, and existing app UI components. Keep code feature-local and do not introduce top-level generic `utils` buckets.
