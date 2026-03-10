# Ship by Sunday Lesson Content Ingestion

Last updated: 2026-03-10

## Goal

Take the lesson material that already exists across recording docs, prep docs, worksheets, and future video exports, and load it into the product without turning `app/lessonRegistry.ts` into a giant content dump.

The system should keep one clear separation:

- `app/lessonRegistry.ts` owns lesson order, progression, workbench type, artifact contract, and shell defaults
- a separate lesson-content layer owns copy, video links, transcript text, examples, downloads, and source references

## Recommended source-of-truth model

### 1. Keep the registry structural

`app/lessonRegistry.ts` should stay focused on:

- `id`
- `title`
- `block`
- `shell`
- `workbench`
- artifact contract
- unlock logic
- panel defaults

Do not keep long transcript text, example banks, or resource lists in the registry.

### 2. Add one content file per lesson

Create a new folder:

`content/lessons/`

Recommended shape:

- `content/lessons/00-01-welcome-to-ship-by-sunday.ts`
- `content/lessons/00-02-how-the-sprint-works.ts`
- `content/lessons/01-01-start-with-the-problem.ts`
- ...
- `content/lessons/04-06-final-wrap.ts`

Use the slugs already defined in `docs/recording/founder-checklists.md`.

### 3. Add one central index

Create:

`content/lessons/index.ts`

It should:

- import every lesson content module
- export a typed `lessonContentById`
- validate that every content file points to a real lesson id
- make it easy to detect missing lesson content during build

## Recommended lesson content schema

Each lesson file should export a typed object like this:

```ts
export type LessonContent = {
  lessonId: string;
  slug: string;
  status: "outline" | "draft" | "ready";
  intro: string;
  coach: {
    video?: {
      provider: "mux" | "vimeo" | "loom" | "youtube" | "file";
      url: string;
      durationLabel?: string;
    };
    transcript?: string;
    examples?: Array<{
      id: string;
      title: string;
      body: string;
    }>;
    resources?: Array<{
      id: string;
      label: string;
      href: string;
      kind: "download" | "internal" | "external";
    }>;
  };
  workbench: {
    prompt?: string;
    steps?: string[];
    emptyState?: string;
    templateDownloadLabel?: string;
    templateDownloadHref?: string;
  };
  sourceRefs: string[];
};
```

This is enough for launch.

Do not add a CMS, rich text editor, or database-backed authoring flow first.

## What should populate each field

### `intro`

Use the lesson framing copy the student should read before starting the rep.

Best sources:

- `docs/recording/sprint-packets.md`
- lesson-specific prep docs like `docs/recording/day-1-prep.md`

### `coach.video`

Use the final hosted lesson video URL once recording exports are uploaded.

Do not fake this in the registry.

### `coach.transcript`

Use cleaned transcript text after upload.

If no transcript exists yet, leave it empty rather than inventing summary copy.

### `coach.examples`

Use the concrete example material already prepared for teaching:

- weak vs strong problem examples
- user statement examples
- outcome statement examples
- scope-cut examples
- research examples
- storyboard / rough screen examples
- demo examples

These are already referenced in:

- `docs/recording/day-1-prep.md`
- `docs/recording/sprint-packets.md`

### `coach.resources`

Use only launch-relevant downloads and links:

- worksheet packet
- specific worksheet PDF anchor or extracted file
- Friday Prep Sheet
- Student Packet
- lesson-specific template or prompt sheet

Do not dump every asset into every lesson.

### `workbench`

Use this for text that belongs in the middle of the lesson player rather than the coach rail:

- the short prompt above the inputs
- numbered steps for upload/capture lessons
- “what good looks like” copy for focus lessons
- template-download CTA for sketch / flow / storyboard lessons

## Best ingestion workflow

### Phase 1. Build the content layer by hand from markdown docs

Start with:

- `0.1`
- `0.2`
- all CEO block lessons

Reason:

- the best current source material is already in markdown
- the CEO block is the first student path
- this avoids waiting on transcript cleanup for every lesson

### Phase 2. Add media and transcript URLs after hosting is chosen

Once video hosting is locked:

- attach the video URL to each lesson content file
- attach transcript text or transcript file output
- add any thumbnail/poster URL if needed

### Phase 3. Backfill Design, Build, and Ship content

Use the same lesson-file pattern for the remaining blocks.

## What not to do

- Do not make PDFs the runtime source of truth
- Do not keep long content blobs in Convex
- Do not store launch copy directly inside React components
- Do not build a content admin before the first student path is working
- Do not force every lesson into the same giant markdown document

## Why this is the right launch approach

- fast to ship
- typed and version-controlled
- easy to review in git
- easy to diff when lesson wording changes
- keeps product structure separate from lesson content
- no vendor or CMS dependency before launch

## Concrete implementation sequence

1. Create `content/lessons/` and the shared `LessonContent` type.
2. Build `content/lessons/index.ts` with a strict map keyed by lesson id.
3. Update the lesson page to merge structural lesson config with lesson content at render time.
4. Replace placeholder coach content with content-file data.
5. Add day-one content first: `0.1`, `0.2`, `1.1` through `1.7`.
6. Add video/transcript URLs only after hosting is finalized.
7. Backfill the remaining blocks.

## First files to create

These are the highest-leverage first-pass content files:

- `content/lessons/00-01-welcome-to-ship-by-sunday.ts`
- `content/lessons/00-02-how-the-sprint-works.ts`
- `content/lessons/01-01-start-with-the-problem.ts`
- `content/lessons/01-02-pick-one-user.ts`
- `content/lessons/01-03-define-the-outcome.ts`
- `content/lessons/01-04-light-research-not-a-thesis.ts`
- `content/lessons/01-05-map-the-core-flow.ts`
- `content/lessons/01-06-kill-scope.ts`
- `content/lessons/01-07-ceo-block-wrap-up.ts`

## Founder dependencies

These are the only founder-dependent inputs for this layer:

- final recorded lesson video files
- final approval if a lesson title changes materially
- final approval on any examples that are sensitive or misleading

Everything else can be assembled from existing repo docs.
