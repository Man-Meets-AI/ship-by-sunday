# Video Editing Pipeline Plan

Last updated: 2026-03-18

## Goal

Add dead-silence cutting to the current lesson-media flow without breaking the working Auphonic -> Bunny -> lesson-attachment pipeline.

Status:

- Implemented. The repo now has `video:cut`, `video:cut:setup`, and an integrated cut stage inside `video:publish`.
- Keep this doc as rationale/history for the chosen pipeline, not as the current runbook.

Current working path:

1. raw lesson file in `Ready/`
2. Auphonic preset processing
3. Bunny upload
4. generated `features/course/lesson/model/media.ts` attachment

Desired next path:

1. raw lesson file in `Ready/`
2. local silence-cut pass
3. Auphonic preset processing on the cut output
4. Bunny upload
5. generated `features/course/lesson/model/media.ts` attachment

## Imported bundle assessment

### Use first

`scripts/vendor/for_youtube/execution/jump_cut_vad_parallel.py`

- Best first candidate for integration.
- Uses Silero VAD instead of FFmpeg volume heuristics.
- Supports restart-phrase removal.
- Designed for Apple Silicon parallel encoding.
- Closest match to the problem you actually want solved now: cutting dead air in talking-head lesson footage.

### Keep as fallback/reference

`scripts/vendor/for_youtube/execution/jump_cut_vad.py`

- Same conceptual workflow as the parallel version.
- Useful as a simpler fallback if the parallel path proves unstable.

`scripts/vendor/for_youtube/execution/jump_cut_vad_singlepass.py`

- Interesting performance option.
- Simpler and potentially faster, but it drops restart detection and other quality-of-life features.
- Not the first integration target.

`scripts/vendor/for_youtube/execution/jump_cut_editor.py`

- Older hybrid approach using FFmpeg silence detection plus Whisper snapping.
- Less attractive than Silero VAD for the main workflow.

### Reference only for now

`scripts/vendor/for_youtube/execution/simple_video_edit.py`

- Useful as a reference for Anthropic-generated metadata and Auphonic API usage.
- Not a fit for the main lesson pipeline because it uses FFmpeg silence detection, hardcodes YouTube upload assumptions, and mixes metadata generation into the edit step.

Other imported files:

- thumbnail recreation, face direction, 3D transitions, and scraping are out of scope for the course-media pipeline.
- `pan_3d_transition.py` appears malformed and should not be used operationally.

## Recommended integration

### Stage 1: Add a local cut step before Auphonic

Create a repo-owned wrapper around `jump_cut_vad_parallel.py` and make it the default pre-processing stage for lesson videos.

Behavior:

- Input: the raw file from `Ready/`
- Output: a temporary cut file in the run workspace
- Downstream: feed the cut file, not the raw file, into the existing Auphonic publish flow

Why:

- Auphonic is good at audio finishing and transcripts.
- Auphonic is not solving dead silences for you.
- Silence cutting belongs before Auphonic so the hosted asset, transcript timing, and final runtime all reflect the cleaned edit.

### Stage 2: Do not double-process audio by default

Default local cut settings should leave audio enhancement off.

Use:

- VAD silence cutting: yes
- restart-phrase detection: optional flag
- local audio enhancement: no by default
- LUT/color grading: no

Reason:

- Your Auphonic preset already applies video/audio processing.
- Running local compression/EQ/loudness before Auphonic risks stacked processing and worse final audio.

### Stage 3: Keep metadata generation out of the critical path

Do not integrate Anthropic metadata generation into the lesson-media publish path yet.

Reason:

- The lesson app only needs the final Bunny video attachment.
- Metadata/chapters/descriptions are useful later for YouTube or marketing reuse, but they are not needed to get lesson videos into the product.

## Concrete build plan

### 1. Add Python environment support

Create a lightweight Python setup for the silence-cut stage.

Needed dependencies:

- `ffmpeg` on PATH
- `torch`
- optional `whisper` only if restart detection is enabled

Keep the initial install instructions local and explicit. Do not add a heavy global automation layer yet.

### 2. Add a repo-owned wrapper command

Add a new command such as:

- `pnpm run video:cut -- --only <fileName>`

Wrapper responsibilities:

- resolve the selected `Ready/` file
- run `jump_cut_vad_parallel.py`
- write the cut output to a temp path
- capture timing and runtime reduction stats
- fail cleanly without mutating lesson media if the cut step fails

### 3. Extend `video:publish`

Update the current `video:publish` flow so it:

- runs the cut wrapper first by default
- uses the cut file as the Auphonic input
- supports `--skip-cut` as an escape hatch
- supports `--detect-restarts` as an opt-in flag
- reports raw file path, cut file path, and final Bunny id in the run report

### 4. Keep unattached-media support

Preserve the current behavior where valid filenames without a real lesson id still upload to Bunny as unattached media.

That lets recording continue ahead of curriculum cleanup.

### 5. Add one focused acceptance test path

Use one known lesson file as the acceptance case:

- cut locally
- process through Auphonic
- upload to Bunny
- confirm the lesson shell renders the Bunny player
- compare runtime before/after and record the reduction in the run report

## Defaults to implement

- Primary cutter: `jump_cut_vad_parallel.py`
- Silence-cut stage enabled by default
- Local audio enhancement disabled by default
- Restart detection off by default
- `--skip-cut` available
- Unattached media still allowed
- Auphonic remains the canonical finishing/transcript stage

## What to do next

1. Add the Python wrapper and dependency/install note.
2. Integrate the cut step into `video:publish`.
3. Test on one real file and compare runtime reduction.
4. Only after that, decide whether restart detection should be on by default for your recording style.
