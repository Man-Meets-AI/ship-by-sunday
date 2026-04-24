---
title: 'Programs'
summary: 'Contract for durable Program documents that hold initiative-level truth above several ExecPlans.'
docType: 'guide'
status: 'active'
read_when:
  - 'Authoring the first real Program document.'
  - 'Checking how Programs differ from ExecPlans.'
  - 'Moving a Program between active and completed.'
---

# Programs

This file defines the contract for a Program document in this repository. A Program is a living, checked-in initiative document that stays above several ExecPlans and preserves the durable truth that would otherwise drift across research notes, planning briefs, and chat memory.

Use this contract when a multi-slice initiative is stable enough to deserve one durable home under `docs/programs/`. Keep the Program current as slices land, just as an ExecPlan stays current while one slice is executed.

## What A Program Is

A Program is the initiative-level document for one larger body of work. It records why the initiative exists, which checked-in packet artifacts defined it, which ExecPlans belong to it, what has already landed, what still remains, and which slice should happen next.

A Program is not an ExecPlan. An ExecPlan is the implementation contract for one bounded slice of work. A Program coordinates several ExecPlans and keeps the long-running initiative coherent between those slices.

## Storage And Lifecycle

Each Program is one folder.

Keep unfinished Programs under:

- `docs/programs/active/<created_at>-<program_id>/`

Move the whole Program folder into:

- `docs/programs/completed/<created_at>-<program_id>/`

only after the initiative-level work is actually complete and the retrospective is written.

Use `status: active` while the Program still has remaining slices, validation, or follow-up work. Use `status: complete` only when the initiative is done, `completed_at` is a real date, and the Program contains a meaningful retrospective.

Inside each Program folder:

- `program.md` is the canonical Program document
- the packet artifacts live beside it

The dated folder name after `YYYY-MM-DD-` must match `program_id`.

## Frontmatter

Every `program.md` document must begin with YAML frontmatter and must include these keys:

- `program_id`
- `title`
- `status`
- `created_at`
- `completed_at`
- `summary`
- `post_build_recap`
- `read_when`

Use the same finished-state rule as ExecPlans:

- active Program: `status: active`, `completed_at: null`, `post_build_recap: null`
- completed Program: `status: complete`, a real `completed_at` date, and a non-empty `post_build_recap`

The `title` must match the H1 exactly.
The `program_id` must be a stable kebab-case Program id slug.
The dated folder slug after `YYYY-MM-DD-` must match `program_id`.

## Required Structure

Each Program document should use this structure in order:

1. `program.md` with YAML frontmatter and the required keys
2. `# <Program title>`
3. One short paragraph stating that the Program is a living initiative document
4. One sentence stating that the Program must be maintained in accordance with `docs/programs/PROGRAMS.md`
5. `## Purpose / Big Picture`
6. `## Program Inputs`
7. `## Current State`
8. `## Progress`
9. `## Decision Log`
10. `## Slice Ledger`
11. `## Next Slice`
12. `## Risks and Watchpoints`
13. `## Outcomes & Retrospective`
14. `## Validation and Acceptance`
15. `## Artifacts and Notes`
16. `## Interfaces and Dependencies`

The structure is intentionally lighter than an ExecPlan. A Program should explain the initiative and steer the next slice, not repeat the implementation details that belong in each ExecPlan.

## Prompt Contract

Program prompt assets live under `docs/prompts/` and are part of this Program contract. They are not examples to copy loosely; they are the step contracts for moving a Program through the funnel and loop.

The canonical Program prompt families are:

- `program-orchestrator.md`
- `program-initialize.md`
- `program-funnel.md`
- `program-research-passes.md`
- `program-normalize-pass.md`
- `program-converged-decision-packet.md`
- `program-dependency-graph.md`
- `program-plan-split-recommendation.md`
- `program-cross-repo-review.md`
- `program-planning-brief.md`
- `program-doc-synthesis.md`
- `program-loop.md`
- `program-docs-sync.md`
- `program-planning-refresh.md`
- `program-completion-review.md`

Every Program prompt must include a `Quality gate before returning` block. The gate is the difference between a prompt that merely produces an artifact and a prompt that produces a durable Program artifact a later agent can trust.

Use `bun run programs:lint` to validate both Program packets and the Program prompt contract.

## Section Expectations

`Purpose / Big Picture` explains why the initiative matters, what will be different when the initiative is complete, and how a reader can tell the effort is moving in the right direction.

`Program Inputs` names the durable packet artifacts that define the Program. Use exact repo-relative paths in prose. Markdown links may use absolute local link targets when following this repo's clickable-file convention, but the visible artifact path should still be repo-relative.

The canonical artifact families are:

- research passes
- normalized track memos
- `converged-decision-packet.md`
- `dependency-graph.md`
- `plan-split-recommendation.md`
- `cross-repo-review.md`
- versioned `planning-brief-<N>.md` files
- `current-planning-brief.txt`

Every Program packet must include `program.md`, at least one research pass, at least one normalized pass, `converged-decision-packet.md`, `dependency-graph.md`, `plan-split-recommendation.md`, `cross-repo-review.md`, one or more versioned planning briefs, and `current-planning-brief.txt`.

`Current State` explains what already exists, what is still missing, and how the initiative currently manifests in the repo. This is the initiative-level truth snapshot.

`Progress` uses checkboxes and timestamps, just like an ExecPlan. Record every meaningful slice completion, refresh, validation pass, or blocker here so a later contributor can resume from the Program alone.

`Decision Log` records initiative-level decisions. Capture why the current split, ordering, or boundary rules were chosen so later slices do not silently re-litigate them.

`Slice Ledger` lists the relevant ExecPlans or other named slices that belong to the Program. Use explicit repo-relative paths in prose or bullets. Program-linked ExecPlans should carry `program_id` and `planning_brief` in their own frontmatter so the child slice records the owning Program and exact immutable planning brief revision it came from.

Keep versioned planning briefs in the Program folder as immutable files named `planning-brief-<N>.md` plus one mutable pointer file `current-planning-brief.txt`. The pointer answers which brief is current now. Child ExecPlans must record the exact versioned brief path they were written from, not the pointer file.

`Next Slice` must use one of these truthful states:

- if no child ExecPlan exists yet, state the exact next recommended slice, why it is next, and which boundary rules it must respect
- if a child ExecPlan is already active, name that active child ExecPlan path and explain the remaining outcome that still has to land
- if the Program is complete, state explicitly that no required next slice remains inside this Program

`Risks and Watchpoints` records the traps that later slices must avoid, such as scope bleed, source-of-truth drift, migration hazards, or misleading ambient repo failures.

`Outcomes & Retrospective` remains future-facing while the Program is active and becomes the final initiative recap when the Program completes.

`Validation and Acceptance` defines how the initiative should be judged at the Program level. This is not just one test command. It should explain what durable behavior, documents, contracts, or proof surfaces must exist before the Program can move to `completed/`.

`Artifacts and Notes` stores short proof snippets, canonical file lists, or evidence-bearing references that help a later contributor re-enter the initiative quickly.

`Interfaces and Dependencies` records the durable interfaces, docs contracts, systems, or packet inputs that the Program depends on.

## Relationship To ExecPlans

Programs and ExecPlans are complementary:

- Programs hold initiative-level truth across several slices.
- ExecPlans hold execution-level truth for one slice at a time.

A Program should name the ExecPlans that belong to it, but it should not duplicate each ExecPlan body. Program-linked ExecPlans should use `program_id` for the stable Program id and `planning_brief` for the exact immutable brief revision that drove that slice. The Program still names the child ExecPlan paths directly in prose or bullets.

## Promotion Guidance

Create a Program folder and its packet together when all of these are true:

- the larger initiative is stable enough that it should survive beyond one chat session
- the split into several slices is already real
- at least one next slice can be named concretely
- the repo would lose important context if the planning artifacts remained only in chat memory

Do not create a Program just because one ExecPlan exists. A Program is warranted when the initiative needs durable memory above the slice level.

Do not use `docs/programs/active/` as scratch space for unresolved exploration. Rough notes can remain in chat, local scratch, or a temporary working artifact until they are stable enough to become packet inputs. Once a Program folder exists, the research passes in that folder should be durable inputs that later agents can trust.

## Completion Guidance

A Program is complete only when:

- the intended initiative-level outcome has landed
- no required slices remain
- the final state is reflected in the repo truth surfaces
- `completed_at` and `post_build_recap` are filled
- `Outcomes & Retrospective` explains what actually happened, what was learned, and any intentionally deferred follow-up

After that, move the whole Program folder from `docs/programs/active/` to `docs/programs/completed/`.
