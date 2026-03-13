# Ship by Sunday Lesson Authoring

Last updated: 2026-03-11

## Goal

Keep every lesson screen editable by hand in one place, without a generator, intermediate JSON, or a second runtime content layer.

## Source of truth

- `lib/course/contracts.ts`: typed lesson, workbench, coach, and resource contracts
- `lib/course/resources.ts`: shared worksheet, packet, and template-link constants
- `lib/course/lessons/start-here.ts`
- `lib/course/lessons/ceo.ts`
- `lib/course/lessons/design.ts`
- `lib/course/lessons/build.ts`
- `lib/course/lessons/ship.ts`
- `lib/course/manifest.ts`: assembles the full ordered registry

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

1. Find the lesson in its block file under `lib/course/lessons/`.
2. Edit the structure and the student-facing content in the same object.
3. Reuse shared resource constants from `lib/course/resources.ts` instead of retyping packet links.
4. Run `pnpm run typecheck` and the content smoke tests after meaningful lesson changes.

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
- prompt template ids that resolve through `lib/course/research-prompt.ts`
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

For now, lesson coach video and transcript state stays manual inside the lesson definitions:

- `video.status: "pending"` until real media is attached
- `transcript.status: "empty"` until transcript text is ready

When lesson media is ready, update the matching lesson definition directly.
