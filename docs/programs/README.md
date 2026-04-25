---
title: 'Programs'
summary: 'Landing lane for durable multi-slice initiative docs that sit above individual ExecPlans.'
docType: 'readme'
status: 'active'
read_when:
  - 'You need the first-hop docs surface for a multi-ExecPlan initiative.'
  - 'You are deciding whether work belongs in a Program doc or an ExecPlan.'
---

# Programs

`docs/programs/` is the canonical landing lane for durable initiative docs that coordinate several ExecPlans.

## Owns

- routing for checked-in Program docs that span multiple slices of work
- the distinction between Program-level initiative state and ExecPlan-level execution
- the inventory lanes for active and completed Program documents
- the checked-in Program packet model that keeps planning briefs, research passes, convergence artifacts, and refreshes beside the owning Program

## Does Not Own

- single-slice execution instructions or validation loops that belong in `docs/exec-plans/`
- implementation details that belong in app, workspace, system, or knowledge docs

## Current State

This lane has the durable contract in [PROGRAMS.md](/Users/parkerrex/Developer/ship-by-sunday/docs/programs/PROGRAMS.md). There are no active Program packets right now; completed packets remain under [completed/](/Users/parkerrex/Developer/ship-by-sunday/docs/programs/completed/).

The canonical Program shape is now one folder per Program:

- active Program: `docs/programs/active/<YYYY-MM-DD-program-id>/`
- completed Program: `docs/programs/completed/<YYYY-MM-DD-program-id>/`

Inside that folder:

- `program.md` is the canonical Program document
- the planning packet artifacts live beside it

## Program Funnel

The Program Funnel is the one-way shaping path from rough research to a durable Program packet. Use it when an initiative is too large for one ExecPlan and needs initiative-level memory.

The funnel in this repository is:

1. Start with durable research passes inside the Program packet folder.
   Promote only the raw track-by-track inputs that still matter; keep unresolved scratch outside the Program root until it is stable.
2. Normalize those research passes.
   Turn each track into one cleaned-up decision memo without cross-track merging yet.
3. Converge the direction.
   Build the converged decision packet, dependency graph, plan split recommendation, and cross-repo review.
4. Write `planning-brief-1.md`.
   This is the first execution-facing source of truth for the initiative.
5. Point `current-planning-brief.txt` at that version.
6. Run the Program Loop until the initiative is done.
   Each completed ExecPlan writes the next versioned planning brief instead of creating an ad hoc refresh file.

## Canonical Program Shape

The current canonical Program root lives under:

- `docs/programs/<active|completed>/<YYYY-MM-DD-program-id>/`

The expected artifact families are:

- research passes
- normalized track memos
- `converged-decision-packet.md`
- `dependency-graph.md`
- `plan-split-recommendation.md`
- `cross-repo-review.md`
- `planning-brief-<N>.md`
- `current-planning-brief.txt`
- `program.md`

The enforced minimum is `program.md`, at least one research pass, at least one normalized pass, `converged-decision-packet.md`, `dependency-graph.md`, `plan-split-recommendation.md`, `cross-repo-review.md`, one or more versioned planning briefs, and `current-planning-brief.txt`.

The pointer file should contain exactly one planning brief filename such as:

    planning-brief-3.md

Do not teach legacy ad hoc refresh files as the canonical model anymore. The refresh loop now writes the next versioned planning brief instead.

## Program Loop

Once a Program exists, run the same repeatable loop after every meaningful slice:

1. Read the current Program and confirm the exact next slice.
2. Read `program.md` in the Program folder, then read `current-planning-brief.txt` and resolve the latest versioned planning brief.
3. Write or refresh one ExecPlan for the next slice.
4. Grill that ExecPlan until the boundaries and proof path are implementation-ready.
5. Execute the slice in tight validated increments.
6. Validate the finished slice against the plan's acceptance path.
7. Sync any durable docs or repo truth that changed.
8. Write the next versioned planning brief based on what changed.
9. Update the Program so the next contributor can see what landed and what should happen next.
10. Repeat until the initiative is actually complete.

The Program stays above the slice. It should explain which slice is next and why, but it should not duplicate the implementation details that belong in the ExecPlan for that slice.

When a Program is active, keep two truths separate:

- `docs/programs/active/<YYYY-MM-DD-program-id>/current-planning-brief.txt` answers which planning brief revision is current now
- the generated ExecPlan frontmatter answers which exact immutable brief revision that specific slice used through `planning_brief: docs/programs/<active|completed>/<YYYY-MM-DD-program-id>/planning-brief-<N>.md`

That split is what makes the Program Loop deterministic. Advancing the pointer should affect a fresh run, not rewrite the provenance of an already-generated ExecPlan. Completed Program brief paths are allowed in historical ExecPlans, but the runtime Program Loop starts new runs from active Program folders only.

## Program Validation

Use these repo-owned proof surfaces for the Program primitive:

- `bun run markdown:lint -- --paths docs/programs` validates the Program docs lane, including `program.md` files and the Program indexes
- `bun run programs:lint` validates Program docs plus checked-in Program packet folders under `docs/programs/active/` and `docs/programs/completed/`, including required packet artifacts, planning briefs, and current-brief pointers

`programs:lint` is the narrow public proof surface for the Program primitive itself. It does not replace `plans:lint` for child ExecPlans.

## Real Prompt Loop

The real prompt loop for this repository is checked in under `docs/prompts/`. It has controller prompts for the whole Program Funnel and Program Loop, plus artifact-level prompts for deterministic handoffs.

Use these prompt assets in order for the first Program packet:

0. `docs/prompts/program-orchestrator.md`
   Use this to route from checked-in state when the next step is unclear.
1. `docs/prompts/program-funnel.md`
   Controller prompt for the whole first-packet funnel.
2. `docs/prompts/program-initialize.md`
   Create the Program root and honest skeletal `program.md`.
3. `docs/prompts/program-research-passes.md`
   Preserve stable source research inside the Program root.
4. `docs/prompts/program-normalize-pass.md`
   Convert one research pass into one normalized memo. Run once per track.
5. `docs/prompts/program-converged-decision-packet.md`
   Write `converged-decision-packet.md`.
6. `docs/prompts/program-dependency-graph.md`
   Write `dependency-graph.md`.
7. `docs/prompts/program-plan-split-recommendation.md`
   Write `plan-split-recommendation.md`.
8. `docs/prompts/program-cross-repo-review.md`
   Write `cross-repo-review.md`.
9. `docs/prompts/program-planning-brief.md`
   Write `planning-brief-1.md` and `current-planning-brief.txt`.
10. `docs/prompts/program-doc-synthesis.md`
   Write or refresh `program.md`.

Use these prompt assets for each child ExecPlan loop:

0. `docs/prompts/program-orchestrator.md`
   Use this to route from current Program state when resuming.
1. `docs/prompts/program-loop.md`
   Controller prompt after a child ExecPlan lands.
2. `docs/prompts/exec-plan-writer.md`
   Turn the current immutable planning brief into one self-contained child ExecPlan under `docs/exec-plans/active/`.
3. `docs/prompts/exec-plan-grill.md`
   Stress-test the child ExecPlan and force hidden assumptions into explicit decisions.
4. `docs/prompts/exec-plan-execute.md`
   Implement the approved child ExecPlan in a tight slice-and-validate loop.
5. `docs/prompts/exec-plan-validate.md`
   Prove the intended outcome against the real repo-owned proof surface.
6. `docs/prompts/program-docs-sync.md`
   Sync durable docs after validation.
7. `docs/prompts/program-planning-refresh.md`
   Write `planning-brief-<N+1>.md`, update `current-planning-brief.txt`, refresh `program.md`, and choose the next slice.
8. `docs/prompts/program-completion-review.md`
   Move a Program to `completed/` only when the initiative-level evidence supports it.

Every Program prompt includes a quality gate that must pass before returning. The quality gate checks evidence traceability, next-step resumability, immutable planning brief provenance, and validation receipts appropriate to that step.

## Programs Versus ExecPlans

Use a Program when the larger initiative spans several ExecPlans and needs durable initiative-level truth. Use an ExecPlan when you are implementing one bounded slice.

Programs answer:

- what larger initiative this slice belongs to
- which checked-in packet artifacts defined it
- what has already landed
- what slice should happen next

ExecPlans answer:

- exactly how to execute one slice
- what files and systems to touch
- what validation proves that slice worked

## Promotion Rule

Create the Program folder and its checked-in packet together when the initiative framing, split, and next-slice logic are stable enough that losing them to chat memory would be a real cost. Until then, keep shaping lightweight and avoid creating a durable Program root too early.

## Next

- Read [PROGRAMS.md](/Users/parkerrex/Developer/ship-by-sunday/docs/programs/PROGRAMS.md) before authoring a Program folder.
- Keep using [docs/exec-plans/index.md](/Users/parkerrex/Developer/ship-by-sunday/docs/exec-plans/index.md) for one-slice execution work.
- Use [active/index.md](/Users/parkerrex/Developer/ship-by-sunday/docs/programs/active/index.md) for in-flight Program folders.
- Use [completed/index.md](/Users/parkerrex/Developer/ship-by-sunday/docs/programs/completed/index.md) for finished Program folders.
