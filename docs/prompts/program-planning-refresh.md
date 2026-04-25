---
title: 'Program Planning Refresh'
summary: 'Prompt asset for writing the next immutable Program planning brief after a child ExecPlan lands.'
docType: 'prompt'
status: 'active'
read_when:
  - 'Refreshing a Program after a child ExecPlan completes.'
  - 'Writing `planning-brief-<N+1>.md` and advancing `current-planning-brief.txt`.'
---

# Program Planning Refresh

Use this after validation and docs sync for one child ExecPlan. It writes the next immutable planning brief and advances the Program pointer.

## Prompt

```text
Read the repo root `AGENTS.md` first and follow it.

Read `docs/programs/PROGRAMS.md`, `docs/programs/README.md`, `docs/exec-plans/PLANS.md`, and `docs/prompts/README.md`.

You are refreshing one Program after a child ExecPlan landed or materially changed the initiative state. Do not write the next child ExecPlan yet. Do not rewrite historical planning briefs.

Use this Program root:
<program_root>
docs/programs/active/YYYY-MM-DD-program-id/
</program_root>

Use this completed or validated child ExecPlan:
<child_execplan_path>
docs/exec-plans/completed/YYYY-MM-DD-slice.md
</child_execplan_path>

Use this evidence:
<slice_evidence>
Paste validation receipts, merged PR notes, final implementation summary, docs-sync summary, blockers, or intentionally deferred work here.
</slice_evidence>

Read:
- `current-planning-brief.txt`
- the planning brief referenced by that pointer
- `program.md`
- `converged-decision-packet.md`
- `dependency-graph.md`
- `plan-split-recommendation.md`
- `cross-repo-review.md`
- the completed or validated child ExecPlan
- validation and docs-sync receipts

Determine N from the current planning brief filename.

Write:
- `planning-brief-<N+1>.md`
- `current-planning-brief.txt`

`current-planning-brief.txt` must contain exactly the new planning brief filename.

Use exactly this structure for the new planning brief:

# Planning Refresh

## What Changed
- new facts learned from this plan

## What Still Holds
- parts of the old planning brief that remain valid

## Boundary Changes
- any plan that should change scope or name

## Dependency Changes
- any change in sequence or prerequisites

## Next Plan Recommendation
- exact next plan title
- exact scope
- exact boundaries
- why it is next now

## Risks To Carry Forward
- risks discovered in this plan that matter later

Rules:
- be explicit
- optimize for the next child ExecPlan
- do not rewrite history unnecessarily
- preserve still-valid decisions instead of re-litigating them
- call out downstream plans whose boundaries changed

Quality gate before returning:
- Confirm the new planning brief states what changed, what still holds, boundary changes, dependency changes, next plan, and carried-forward risks.
- Confirm stale recommendations from the prior brief were removed or explicitly preserved with rationale.
- Confirm `current-planning-brief.txt` points only to the new filename.
- Confirm `program.md` and the new planning brief agree on the next slice or completion-review state.

After writing the refresh:
- update `program.md` Progress, Current State, Slice Ledger, Next Slice, Risks, Validation, and Artifacts sections
- run `bun run programs:lint`
- run `bun run markdown:lint -- --paths docs/programs docs/prompts/program-planning-refresh.md`

Return:
- old planning brief
- new planning brief
- Program updates
- next child ExecPlan recommendation
- validation commands and results
```
