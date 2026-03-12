# Lesson Workbench Architecture

Last updated: 2026-03-12

## Public entrypoint

- Keep `@/components/lesson-workbench` as the public import surface.
- `components/lesson-workbench.tsx` is intentionally a thin facade that re-exports `WorkbenchRenderer`.
- `components/lesson-page.tsx` and any future consumers should keep importing from the facade, not from internal module paths.

## Internal module split

The workbench implementation now lives under `components/lesson-workbench/` and is split in this order:

1. `renderer.tsx`
2. `modes/`
3. `fields/`
4. `shared/`

### `renderer.tsx`

- Computes shared runtime data once:
  - `fields`
  - `objectiveTasks`
  - `completedTaskCount`
  - `workbenchSections`
  - `sectionStates`
- Dispatches by `lesson.workbench` through a typed registry.
- Owns the unsupported-workbench fallback only.

### `modes/`

Each workbench mode gets its own file.

- Keep layout and mode-specific behavior local here.
- If a mode needs a bespoke subcomponent, keep it next to that mode.
- Current examples:
  - guided-form handoff UI stays in `guided-form-workbench.tsx`
  - roadmap block rendering stays in `roadmap-overview-workbench.tsx`
  - external-tool messaging stays in `external-workspace-workbench.tsx`

Do not collapse similar modes into a generic meta-mode unless multiple real changes prove the duplication is a maintenance problem.

Prompt-import rules:

- If a lesson needs a main-workbench `copy prompt -> paste result` loop, declare it explicitly on `lesson.promptImport`.
- Keep prompt-template building and pasted-output parsing in `lib/course/research-prompt.ts`, not inside the lesson shell or the lesson page.
- Keep the mode-specific import UI local to the matching workbench mode.
- Imported output should hydrate existing lesson fields; do not add one-off persistence paths for prompt imports.

### `fields/`

- `field-control.tsx` is the dispatcher.
- Split field behavior by field kind, not by lesson mode.
- Keep pure parsing/normalization helpers in `value-codecs.ts`.
- Keep table normalization and preview helpers in `lib/course/table.ts`.
- Keep upload behavior isolated in `upload-field-control.tsx`.

Table rules:

- `kind: "table"` fields should declare `columns` in the lesson manifest whenever the UI is expected to render as a structured grid.
- The shared editable grid lives in `fields/editable-table-field.tsx`.
- Keep persisted table values backward-compatible as `string[][]`.
- Strip fully blank table rows during persistence and preview formatting, but keep one visible empty row in the client UI for immediate entry.
- If a future table field does not declare columns, fall back to the legacy pipe-delimited textarea instead of breaking the lesson.

Upload rules:

- Preserve the existing `UploadFieldValue` shape.
- Keep `useMutation(api.uploads.generateUploadUrl)` in the upload field control.
- Do not move persistence cleanup out of `lib/course/registry.ts`.
- Do not move URL hydration out of `convex/course.ts`.

### `shared/`

Only cross-mode presentation primitives belong here.

- `WorkbenchContainer`
- `WorkbenchHeader`
- `WorkbenchCard`
- `SectionCard`
- `StatusRail`
- `TemplateDownloadCard`
- `ArtifactContext`
- artifact formatting helpers

If a component needs lesson-specific logic to make sense, it probably belongs in `modes/`, not `shared/`.

## Guardrails

- Keep `LessonConfig`, `WorkbenchType`, and registry contracts unchanged unless the product behavior is intentionally changing.
- Prefer adding a new mode file over expanding an existing unrelated one.
- Prefer adding a field-kind control over branching inside a mode file.
- Prefer stable manifest column ids over ad hoc row objects when table data will need to be reused later.
- Add narrow regression coverage when extracting helpers or introducing a new mode branch.

## Regression coverage

Current coverage for the split lives in:

- `tests/unit/lesson-workbench-helpers.test.ts`
- `tests/unit/lesson-workbench-renderer.test.tsx`
- `tests/unit/research-import-workbench.test.tsx`

These tests are intentionally narrow:

- helper round-trips and formatting
- table normalization, preview summaries, and blank-row persistence cleanup
- representative mode rendering
- capture-upload render path
- guided-form handoff render path
