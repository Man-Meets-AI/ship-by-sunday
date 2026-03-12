# Course State Lifecycle

`convex/course.ts` owns the dynamic runtime state for the product. It should not become a second copy of the static course contract that already lives in `lib/course/`.

## Ownership split

- `lib/course/`: lesson definitions, unlock graph, field shapes, artifact contracts, and student-facing static content
- `convex/course.ts`: entitlements, lesson progress, hydrated draft values, pinned artifact previews, mission status, and artifact listing

If a piece of data can be derived from the lesson registry, keep it out of Convex responses.

## Shared viewer-state loader

The lesson-state lifecycle in `convex/course.ts` should read through one internal loader before doing mission, lesson, or mutation work:

- `loadViewerCourseState(ctx)`: authenticates the viewer, loads all lesson rows once, indexes them by lesson id, computes compatibility-filtered completed lesson ids, and derives unlocked lesson ids
- `getCompatibleCompletedLessonIds(lessonStates)`: treats a lesson as completed only when the row is marked `completed`, the lesson still exists, and the stored field shape is compatible with the current lesson definition

This keeps access, mission progress, and artifact logic on one definition of “completed”.

## Compatibility rules

- Incompatible saved field values are stale, not valid progress.
- Stale completed rows do not count toward mission progress.
- Stale completed rows do not produce artifacts.
- A learner who already has a row for a lesson can still reopen that lesson and resave against the new field shape; the lesson should fall back to an available/not-started state instead of looking completed.

This behavior matches the field-shape versioning rules in `lib/course/registry.ts`.

## Mutation modes

The lesson-state write path should stay centralized behind `upsertLessonState(...)` with explicit modes:

- `view`: create a `not_started` row if missing, otherwise only refresh `lastViewedAt`
- `draft`: create/update `in_progress`, but preserve `completed` if the row was already completed
- `complete`: persist normalized field values and stamp `completedAt`

This avoids re-querying the same lesson row in each mutation and makes future lifecycle changes one-file edits.

## Regression coverage

Use `tests/unit/course-state-lifecycle.test.ts` for regressions around stale field-shape rows, mission status, lesson reopening, artifact omission, and draft resaves against previously completed rows.
