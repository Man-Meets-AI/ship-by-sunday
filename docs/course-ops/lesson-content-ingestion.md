# Ship by Sunday Lesson Content Ingestion

Last updated: 2026-03-10

## Goal

Turn the lesson material in the repo into structured, reviewable, app-ready lesson content without turning `app/lessonRegistry.ts` into a giant content dump.

The system now keeps one clear separation:

- `app/lessonRegistry.ts` owns lesson order, progression, workbench type, artifact contract, and shell defaults
- a separate lesson-content layer owns copy, video links, transcript text, examples, downloads, and source references

## Current source-of-truth model

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

### 2. Keep one lesson content module per lesson slug

The product now uses:

- `content/lessons/<lesson-slug>.ts`
- `content/lessons/generated.ts`
- `content/source/recording-blueprint.json`

The slugs follow the recording file naming convention from `docs/recording/founder-checklists.md`.

### 3. Keep one central index

`content/lessons/index.ts` now:

- imports the generated barrel
- exports a typed `lessonContentById`
- validates that every content file points to a real lesson id
- guarantees that every non-mission lesson resolves to content at build time

## Current lesson content schema

Each lesson file now exports a typed object like this:

```ts
export type LessonContent = {
  lessonId: string;
  slug: string;
  status: "outline" | "draft" | "ready";
  intro: string;
  lessonMeta: {
    runtimeLabel?: string;
    goal: string;
    purpose: string;
  };
  actionCard: {
    jobNow: string;
    timebox: string;
    comeBackWith: string;
  };
  coach: {
    video?: {
      status: "pending" | "ready";
      provider: "mux" | "vimeo" | "loom" | "youtube" | "file";
      url?: string;
      durationLabel?: string;
    };
    transcript?: {
      status: "empty" | "ready";
      body?: string;
    };
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
    teachingPoints?: string[];
    emptyState?: string;
    templateDownloadLabel?: string;
    templateDownloadHref?: string;
  };
  sourceRefs: string[];
};
```

This is enough for launch. The app renders `goal`, `purpose`, runtime, and the action card directly in the lesson UI.

We are still intentionally not using a CMS or database-backed authoring flow.

## What should populate each field

### `intro`

Use the lesson framing copy the student should read before starting the rep.

Best sources:

- `docs/recording/sprint-packets.md`
- lesson-specific prep docs like `docs/recording/day-1-prep.md`

### `lessonMeta`

Use:

- `goal` for the sharp lesson outcome
- `purpose` for the short explanation of why the lesson exists
- `runtimeLabel` for the runtime shown in the lesson header

These now come from the recording blueprint parser.

### `actionCard`

Use the blueprint pause prompt directly:

- `jobNow`
- `timebox`
- `comeBackWith`

This is the core student handoff surface in the lesson player.

### `coach.video`

Use the final hosted lesson video URL once recording exports are uploaded.

Do not fake this in the registry.

### `coach.transcript`

Use cleaned transcript text after upload.

If no transcript exists yet, leave it empty rather than inventing summary copy.

### `coach.examples`

Use the concrete example material already prepared for teaching. Right now the generator creates:

- lesson-specific guidance cards from the recording blueprint
- curated overrides for the most important CEO lessons

The next pass should continue replacing generated guidance with stronger lesson-specific examples where we have them.

These are already referenced in:

- `docs/recording/day-1-prep.md`
- `docs/recording/sprint-packets.md`

### `coach.resources`

Use only launch-relevant downloads and links. Right now the app serves:

- worksheet packet
- student packet
- block-specific worksheet links
- lesson-specific template prompts where we have them

Do not dump every asset into every lesson.

### `workbench`

Use this for text that belongs in the middle of the lesson player rather than the coach rail:

- the short prompt above the inputs
- `teachingPoints` for what the lesson covers
- “what good looks like” copy for focus lessons
- template-download CTA for sketch / flow / storyboard lessons

## Current ingestion workflow

### Step 1. Parse the recording blueprint

Use:

- `scripts/build-lesson-content-from-blueprint.mjs`

It:

- parses `assets/ship_by_sunday_recording_blueprint_v3.md`
- validates wireframe shell/workbench defaults against the registry
- writes `content/source/recording-blueprint.json`
- regenerates the lesson content modules and generated barrel

### Step 2. Curate the generated output

The generator gives us full coverage for `0.1` through `4.6`, but the generated content still benefits from editorial cleanup.

Use this next for:

- stronger lesson-specific examples
- better resource links
- better copy on the most commercially important lessons

### Step 3. Add media and transcript URLs after hosting is chosen

Once video hosting is locked:

- attach the video URL to each lesson content file
- attach transcript text or transcript file output
- add any thumbnail/poster URL if needed

### Step 4. Keep design/build/ship refining from the same system

Do not go back to hand-maintained outline placeholders. Continue using the generator plus curated overrides.

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

## Current implementation status

- `content/lessons/` exists
- `content/source/recording-blueprint.json` exists
- the lesson page already merges structural lesson config with generated lesson content
- the full curriculum has generated lesson content from `0.1` through `4.6`
- the remaining work is editorial refinement and media attachment, not plumbing

## Highest-leverage next files to refine

These are the best next editorial targets:

- `content/lessons/03-03-brief-the-agent-correctly.ts`
- `content/lessons/03-04-build-the-core-flow.ts`
- `content/lessons/03-05-debug-without-spiraling.ts`
- `content/lessons/04-02-deploy-the-app.ts`
- `content/lessons/04-04-send-it-to-real-humans.ts`
- `content/lessons/04-05-capture-feedback-and-plan-version-two.ts`

## Founder dependencies

These are the only founder-dependent inputs for this layer:

- final recorded lesson video files
- final approval if a lesson title changes materially
- final approval on any examples that are sensitive or misleading

Everything else can be assembled from existing repo docs.
