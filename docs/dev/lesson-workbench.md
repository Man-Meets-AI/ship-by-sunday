# Lesson Workbench Architecture

Last updated: 2026-03-12

## Public entrypoint

- Keep `@/components/lesson-workbench` as the public import surface.
- `components/lesson-workbench.tsx` is intentionally a thin facade that re-exports `WorkbenchRenderer`.
- `components/lesson-page.tsx` and any future consumers should keep importing from the facade, not from internal module paths.

## Shell rules

- `watch` is a lesson-shell layout, not a workbench mode.
- Watch lessons should skip `WorkbenchRenderer` entirely and use `lesson.content.coach.video` as the primary surface.
- Watch lessons should not expose split/focus toggles, objective rails, or coach docks.
- Use watch lessons only when the learner's in-product job is genuinely just to watch and continue.
- Future Build lessons can opt into `watch` one lesson at a time; do not mass-convert focus lessons by default.

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
  - visual-direction prompt workflows stay in `visual-direction-workbench.tsx`

Do not collapse similar modes into a generic meta-mode unless multiple real changes prove the duplication is a maintenance problem.

Brief-assembler rules:

- `brief_assembler` can stay the default generic summary mode for lessons that still need to show a normal artifact context plus a few local fields.
- If a wrap-up lesson is primarily locking upstream work instead of collecting new inputs, declare a `lesson.briefAssembler` config instead of hard-coding one-off UI inside the shell.
- Current reusable variant: `stage_unlock`
  - use it for block-end lessons that should feel like a level clear
  - keep the hero, next-step label, skill strip, and CTA copy in lesson config
  - use a resolved artifact-preview path so the wrap-up artifact is composed from pinned upstream artifacts instead of staying empty
- The first acceptance case is `1.7`; future wrap-ups should copy the contract shape before inventing a new renderer.

Prompt-import rules:

- If a lesson needs a main-workbench `copy prompt -> paste result` loop, declare it explicitly on `lesson.promptImport`.
- Keep prompt-template building and pasted-output parsing in `lib/course/research-prompt.ts`, not inside the lesson shell or the lesson page.
- Keep the shared prompt-import UI in `shared/prompt-import-card.tsx`, then render it from the matching workbench mode instead of re-implementing the flow per lesson.
- Current prompt templates are `competitor_research`, `scope_boundary`, and `visual_direction_guide`. Add new templates by extending the typed prompt contract first, then hydrate existing lesson fields from the pasted result instead of adding a custom persistence path.
- Imported output should hydrate existing lesson fields; do not add one-off persistence paths for prompt imports.

Embedded-video rules:

- If a split-shell lesson needs the video inside the main workbench, declare `lesson.coachVideoPlacement = "workbench"` instead of duplicating the video in both the workbench and the coach rail.
- Keep `lesson.content.coach.video` as the single source of truth for the video payload even when the workbench renders it.
- When the video lives in the workbench, the coach rail should omit the Watch section and fall back to transcript/examples/resources.

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
- `WorkbenchHeaderLabel`
- `WorkbenchCard`
- `SectionCard`
- `StatusRail`
- `TemplateDownloadCard`
- `ArtifactContext`
- artifact formatting helpers

If a component needs lesson-specific logic to make sense, it probably belongs in `modes/`, not `shared/`.

Header rules:

- Workbench container headers should render one thin all-caps label only.
- Do not pair a quiet eyebrow with a second bold uppercase title inside the same workbench card or section shell.
- When a surface previously had both, keep the more specific title text and render it through the shared thin label primitive.
- `WorkbenchSection.eyebrow` can remain in lesson config for compatibility, but `SectionCard` should not render it.

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
- `tests/unit/course-registry.test.ts`
- `tests/smoke/content-contract.test.ts`
- `tests/smoke/lesson-completion-celebration.test.ts`

These tests are intentionally narrow:

- helper round-trips and formatting
- table normalization, preview summaries, and blank-row persistence cleanup
- representative mode rendering
- capture-upload render path
- guided-form handoff render path
- stage-unlock wrap-up rendering and composed artifact previews
- declarative wrap-up contract checks for lessons like `1.7`
