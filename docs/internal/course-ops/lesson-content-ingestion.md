# Ship by Sunday Lesson Authoring

Last updated: 2026-03-18

## Goal

Keep every lesson screen editable by hand in one place, without a generator, intermediate JSON, or a second runtime content layer.

## Source of truth

- `features/course/lesson/model/contracts.ts`: typed lesson, workbench, coach, and resource contracts
- `features/course/lesson/model/resources.ts`: shared worksheet, packet, and template-link constants
- `features/course/lesson/model/media.ts`: generated lesson video attachment catalog
- `features/course/lesson/model/lessons/start-here.ts`
- `features/course/lesson/model/lessons/ceo.ts`
- `features/course/lesson/model/lessons/design.ts`
- `features/course/lesson/model/lessons/build.ts`
- `features/course/lesson/model/lessons/ship.ts`
- `features/course/lesson/model/manifest.ts`: assembles the full ordered registry

Each lesson definition now owns:

- slug
- structural config
- student-facing intro and action card copy
- coach video / transcript placeholders
- coach examples
- coach resources
- workbench prompt and teaching points

There is no separate `content/lessons/` layer anymore.

## Editing workflow

1. Find the lesson in its block file under `features/course/lesson/model/lessons/`.
2. Edit the structure and the student-facing content in the same object.
3. Reuse shared resource constants from `features/course/lesson/model/resources.ts` instead of retyping packet links.
4. For lesson video attachments, use the publish pipeline instead of editing lesson definitions by hand.
5. Run `pnpm run typecheck` and the content smoke tests after meaningful lesson changes.

## What belongs where

Use the lesson object for:

- intro copy
- runtime label
- goal / purpose metadata
- action-card copy
- coach examples
- lesson-specific resources
- workbench prompts and teaching points

Use shared resource constants for:

- student packet
- worksheet packet
- worksheet 01 through 04 links
- template-download links already reused across multiple lessons
- external template links, such as the `1.5` core-flow FigJam handoff

When a lesson points to an external template link:

- keep the handoff explicit in the lesson copy
- open the external workspace in a new tab
- rename the downstream upload field to match the actual student output

Use lesson-specific prompt import config or coach resources for:

- prompt-driven workbench flows such as lesson `1.4`'s competitor-research copy/pasteback path
- prompt template ids that resolve through `features/course/lesson/model/research-prompt.ts`
- coach-dock resources that still belong in the dock, such as worksheet links or external references

Use recording docs as human reference only:

- `docs/internal/recording/day-1-prep.md`
- `docs/internal/recording/sprint-packets.md`
- `docs/internal/recording/founder-checklists.md`

These docs can inform edits, but they are not a code-generation source.

## Rules

- Keep examples in the coach dock only.
- Do not add section-level or field-level examples back into the center workbench.
- Prefer concrete examples and scaffolds over quote-only cards.
- Keep lesson structure and student-facing content together so a lesson can be fixed screen by screen.
- Do not rebuild the PDF-blueprint parser or a replacement ingestion pipeline.

## Media placeholders

Lesson definitions still own the default pending state for coach video and transcript placeholders:

- `video.status: "pending"` until real media is attached
- `transcript.status: "empty"` until transcript text is ready

When a real lesson video is ready:

1. Rename the approved source file in `.../Ship by Sunday Raw Footage/Ready` to `<lessonId>--<slug>.<ext>`.
2. Use `pnpm run video:lessons` if you need to confirm the current lesson ids and titles.
3. Run `pnpm run video:cut:setup` once on a machine before using the local silence-cut stage.
4. Use `pnpm run video:cut -- --only <fileName>` when you want to inspect the local VAD cut output only.
5. Use `pnpm run video:publish -- --only <fileName>` when you want to test one video, or `pnpm run video:publish` to process the full ready batch.
6. By default the publish flow runs the local silence-cut stage first. Use `--skip-cut` only when a file should bypass that stage.
7. Let the generated `features/course/lesson/model/media.ts` file carry the ready Bunny attachment data into the app for any filenames whose prefix matches a real lesson id.
8. If a valid `Ready/` filename does not map to a real lesson id yet, the pipeline still uploads it to Bunny and reports it as unattached media instead of blocking the whole batch.

Do not edit lesson definitions directly just to attach a Bunny-hosted lesson video.
