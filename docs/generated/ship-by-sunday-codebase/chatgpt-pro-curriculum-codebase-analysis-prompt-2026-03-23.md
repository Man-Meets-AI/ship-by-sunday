You are helping redesign the **Ship by Sunday** curriculum.

This is not a generic course-design exercise.

You are analyzing:

1. the **actual video lesson transcripts** in sequence
2. the **codebase contract** we want the product to generate
3. the **OpenAI-derived domain contracts** for:
   - design
   - marketing
   - build / long-horizon execution

The goal is to figure out:

- what order the lessons should go in
- which lessons should be cut, merged, split, or renamed
- what facts the curriculum must collect
- which current lessons align to codebase needs vs which are just workflow noise
- when the codebase(s) should unlock

## Files attached

Treat the attached files as the canonical source set for this analysis:

- `ship-by-sunday-all-transcripts-2026-03-23.txt`
- `ship-by-sunday-transcript-index-2026-03-23.md`
- `codebase-contract-and-question-map-2026-03-23.md`
- `openai-domain-contract-reconciliation-2026-03-23.md`
- `curriculum-reset-funnel-2026-03-23.md`
- `2026-03-23-openai-domain-ui-contracts.md`

## Core context

We are rebuilding the curriculum as an **input funnel**, not as a traditional course.

Students answer questions through the lessons and videos.

Those answers should become the canonical facts needed to generate a custom downloadable folder that contains:

- a design codebase
- a marketing codebase
- a long-horizon build codebase
- a prompt pack
- a README
- a `project-definition.json` facts file

We do **not** want to treat lesson workflow state as codebase truth.

There are four buckets:

- `facts`: stable truths about the student’s app
- `derived docs`: generated codebase files
- `workflow`: lesson/process scaffolding only
- `ephemeral`: runtime/session-only state like secrets or live QA toggles

If a lesson question does not help customize a downloaded codebase file, it is probably:

- workflow-only
- ephemeral
- duplicated
- or unnecessary

## Important constraints

- Root everything in the **actual transcripts** and the attached planning docs.
- Do **not** give generic course-design advice.
- Do **not** invent codebase requirements that are not supported by the attached docs.
- Do **not** optimize for preserving existing lesson count.
- Be willing to recommend cutting lessons.
- Be willing to recommend moving questions to earlier or later lessons.
- Separate **current curriculum diagnosis** from **proposed rebuilt curriculum**.
- Prefer fewer, denser, better lessons over thin repetitive ones.

## What I need from you

Please produce the output in this exact structure.

### 1. Executive judgment

Give a short blunt summary of:

- what the current curriculum is trying to do
- what it actually does
- what the rebuilt funnel should do instead

### 2. Transcript-to-codebase coverage map

Create a table with these columns:

- `current transcript / video`
- `what it teaches`
- `codebase facts it currently supports`
- `bucket`
  - `fact`
  - `workflow`
  - `ephemeral`
  - `mixed`
- `keep / cut / merge / move`
- `notes`

Use the exact transcript IDs from the transcript headers.

### 3. Missing codebase facts

Create a table with these columns:

- `missing codebase fact`
- `why it is required`
- `which codebase file needs it`
- `best place in the rebuilt funnel to ask it`
- `current transcript closest to it`

### 4. Recommended rebuilt curriculum order

Give the proposed lesson sequence from start to finish.

For each lesson include:

- `new lesson number / title`
- `primary goal`
- `facts collected`
- `codebase impact`
  - `design`
  - `marketing`
  - `build`
  - `multiple`
- `source transcript(s)` from the current set

### 5. Cut / merge / rename recommendations

Create a table with these columns:

- `current transcript / lesson`
- `decision`
  - `keep`
  - `merge`
  - `split`
  - `rename`
  - `cut`
- `why`
- `where the useful content should go`

### 6. Codebase unlock recommendation

Answer these explicitly:

- When should the **design codebase** unlock?
- When should the **marketing codebase** unlock?
- When should the **build / long-horizon codebase** unlock?
- When should the **full magical folder** unlock?

Be decisive.

### 7. Final funnel design

Describe the rebuilt funnel as stages:

- `Stage 1`
- `Stage 2`
- `Stage 3`
- `Stage 4`
- `Stage 5`

For each stage, say:

- what students are doing
- what facts are being collected
- what codebase(s) become ready

### 8. Open questions

List only the unresolved questions that actually matter for recording or product design.

## Style requirements

- Be concrete and opinionated.
- Use tables where possible.
- Use exact transcript IDs and attached file names.
- Call out contradictions between the transcript order and the codebase needs.
- Optimize for helping us re-record the curriculum correctly.

## One more thing

Do not protect the current curriculum structure.

If the right answer is:

- fewer lessons
- merged lessons
- codebase unlock much earlier
- or “this transcript is useful but belongs in a different stage”

say that directly.
