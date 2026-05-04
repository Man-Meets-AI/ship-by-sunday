---
title: '`docs/prompts`'
summary: 'Canonical home for reusable prompt assets that support planning and other repeatable agent workflows.'
docType: 'readme'
status: 'active'
read_when:
  - 'Looking for a reusable prompt asset that should live in the repo instead of chat history.'
  - 'Updating prompt-path references or prompt-loading automation.'
---

# `docs/prompts`

This folder is the canonical home for reusable prompt assets that support durable agent workflows.

The repo-wide first hop is [docs/index.md](../index.md). Treat this folder as a second-hop docs surface for stable reusable prompts, not as a parallel onboarding entrypoint.

## Prompt Families

The active repo-agent ExecPlan prompts use the hyphenated `exec-plan-*` filenames:

- `exec-plan-outline-from-session.md`
- `exec-plan-writer.md`
- `exec-plan-grill.md`
- `exec-plan-execute.md`
- `exec-plan-validate.md`

The older `execplan-*` filenames are generated-starter prompt assets that the codebase compiler still ships through `packages/codebase-compiler/src/server/template-loader.ts` and `packages/codebase-compiler/src/codebases/render-prompt-pack.ts`. Do not delete or rename them unless the compiler path, generated-doc path types, repo-root marker, and tests are migrated in the same change.

Program-aware planning assumes one checked-in Program folder at `docs/programs/<active|completed>/<YYYY-MM-DD-program-id>/`. Inside that folder, `program.md` is the canonical Program document and the planning packet artifacts live beside it. The canonical sequence is:

- research passes
- normalized track memos
- `converged-decision-packet.md`
- `dependency-graph.md`
- `plan-split-recommendation.md`
- `cross-repo-review.md`
- `planning-brief-1.md`
- `current-planning-brief.txt`
- later `planning-brief-<N>.md` revisions after each completed ExecPlan

The Program prompt assets in this folder should reinforce that checked-in packet model rather than teaching `tmp/`-only planning artifacts.

## Program Prompt Index

Program work has two controller prompts, one state-routing prompt, and a set of artifact-level prompts. Use artifact prompts when a deterministic handoff is needed between agents or when a single Program packet step needs repair. Use the orchestrator when the next correct step is unclear.

### Program Funnel Prompts

0. `program-orchestrator.md`
   Inspect checked-in Program state and route to the next correct prompt.
1. `program-funnel.md`
   Use this as the controller prompt for the full first-packet funnel.
2. `program-initialize.md`
   Create the initial Program root and honest skeletal `program.md`.
3. `program-research-passes.md`
   Preserve durable track-by-track source research inside the Program root.
4. `program-normalize-pass.md`
   Convert one research pass into one normalized decision memo. Run once per track.
5. `program-converged-decision-packet.md`
   Synthesize normalized passes into `converged-decision-packet.md`.
6. `program-dependency-graph.md`
   Turn decisions into dependency-ordered work.
7. `program-plan-split-recommendation.md`
   Split the Program into bounded child ExecPlans.
8. `program-cross-repo-review.md`
   Pressure-test the architecture, dependency order, and split.
9. `program-planning-brief.md`
   Write `planning-brief-1.md` and `current-planning-brief.txt`.
10. `program-doc-synthesis.md`
   Create or refresh the canonical `program.md`.

### Program Loop Prompts

0. `program-orchestrator.md`
   Inspect the Program and route to write, grill, execute, validate, docs sync, refresh, or completion review.
1. `program-loop.md`
   Use this as the controller prompt after a child ExecPlan completes.
2. `exec-plan-writer.md`
   Consume the current immutable planning brief and produce one child ExecPlan with `program_id` and `planning_brief` frontmatter.
3. `exec-plan-grill.md`
   Stress-test the child ExecPlan while preserving Program boundaries.
4. `exec-plan-execute.md`
   Execute the child ExecPlan without absorbing later Program slices.
5. `exec-plan-validate.md`
   Prove the child ExecPlan outcome against the repo-owned proof surface.
6. `program-docs-sync.md`
   Sync durable docs after the child plan is validated.
7. `program-planning-refresh.md`
   Write `planning-brief-<N+1>.md`, update `current-planning-brief.txt`, and refresh `program.md`.
8. `program-completion-review.md`
   Decide whether the active Program can move to `completed/` and write the final retrospective.

Every Program prompt has a `Quality gate before returning` block. That gate is part of the contract, not optional phrasing.

## What Lives Here

- Repo-agent ExecPlan prompts:
  - `exec-plan-outline-from-session.md`
  - `exec-plan-writer.md`
  - `exec-plan-grill.md`
  - `exec-plan-execute.md`
  - `exec-plan-validate.md`
- Generated-starter ExecPlan prompt assets:
  - `execplan-outline-from-session.md`
  - `execplan-execution-loop.md`
  - `execplan-grill.md`
  - `execplan-writer.md`
- Program prompts:
  - `program-orchestrator.md`
  - `program-funnel.md`
  - `program-initialize.md`
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

## Legacy Flat List

- `exec-plan-outline-from-session.md`
- `exec-plan-writer.md`
- `exec-plan-grill.md`
- `exec-plan-execute.md`
- `exec-plan-validate.md`
- `program-orchestrator.md`
- `program-funnel.md`
- `program-initialize.md`
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

## Related Surfaces

- [docs/programs/PROGRAMS.md](../programs/PROGRAMS.md)
- [docs/programs/README.md](../programs/README.md)
- [docs/exec-plans/PLANS.md](../exec-plans/PLANS.md)
- [docs/index.md](../index.md)
- [AGENTS.md](../../AGENTS.md)
