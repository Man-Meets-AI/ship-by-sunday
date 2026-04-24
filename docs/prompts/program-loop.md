---
title: 'Program Loop'
summary: 'Prompt asset for refreshing a folder-owned Program after one child ExecPlan completes.'
docType: 'prompt'
status: 'active'
read_when:
  - 'Refreshing a Program after a child ExecPlan lands.'
  - 'Writing the next versioned planning brief for an active Program.'
---

# Program Loop

Use this after one child ExecPlan has completed or materially changed the initiative state. The goal is to keep the Program and planning brief chain current before the next child ExecPlan is written.

## Prompt

```text
Read the repo root `AGENTS.md` first and follow it.

Read `docs/programs/PROGRAMS.md`, `docs/programs/README.md`, `docs/exec-plans/PLANS.md`, and the active Program's `program.md`.

You are refreshing one active Program after a child ExecPlan slice. Do not implement product code. Do not rewrite completed child ExecPlans. Do not change historical `planning_brief` provenance on an existing ExecPlan.

Use this Program root:
<program_root>
docs/programs/active/YYYY-MM-DD-program-id/
</program_root>

Use this completed or updated child ExecPlan:
<child_execplan>
docs/exec-plans/completed/YYYY-MM-DD-slice.md
</child_execplan>

Use this evidence:
<slice_evidence>
Paste validation results, merged PR notes, final implementation summary, blockers, or intentionally deferred work here.
</slice_evidence>

Use the Program Loop prompt assets as the step contracts:
1. `docs/prompts/program-orchestrator.md`
2. `docs/prompts/exec-plan-writer.md`
3. `docs/prompts/exec-plan-grill.md`
4. `docs/prompts/exec-plan-execute.md`
5. `docs/prompts/exec-plan-validate.md`
6. `docs/prompts/program-docs-sync.md`
7. `docs/prompts/program-planning-refresh.md`
8. `docs/prompts/program-completion-review.md`

Refresh sequence:
1. Read `current-planning-brief.txt`.
2. Read the current versioned `planning-brief-<N>.md`.
3. Read `program.md` and the completed child ExecPlan.
4. Confirm the child ExecPlan has been validated or run `docs/prompts/exec-plan-validate.md` first.
5. Sync durable docs with `docs/prompts/program-docs-sync.md` when behavior changed.
6. Synthesize what actually changed.
7. Write the next immutable `planning-brief-<N+1>.md`.
8. Update `current-planning-brief.txt` to contain only the new filename.
9. Update `program.md` Progress, Current State, Slice Ledger, Next Slice, Risks, and Validation sections.
10. Keep completed historical planning briefs immutable except for correcting obvious broken links or formatting.

The next planning brief must state:
- what landed
- what changed in the initiative-level facts
- which risks remain
- which child ExecPlan should happen next
- what that next slice must not absorb
- what validation proves the next slice

Quality gate before returning:
- Confirm validation happened before docs sync.
- Confirm docs sync happened before planning refresh when durable behavior changed.
- Confirm the new planning brief points to the next exact child slice or explicitly says the Program is ready for completion review.
- Confirm no completed child ExecPlan has had its immutable `planning_brief` provenance rewritten.
- Confirm `program.md` and `current-planning-brief.txt` agree on the current planning brief.

Run:
- `bun run programs:lint`
- `bun run markdown:lint -- --paths docs/programs docs/prompts/README.md docs/prompts/program-loop.md docs/prompts/program-orchestrator.md docs/prompts/program-docs-sync.md docs/prompts/program-planning-refresh.md docs/prompts/program-completion-review.md`

Return:
- old planning brief
- new planning brief
- Program updates
- next child ExecPlan recommendation
- validation commands and results
- blockers or intentionally deferred work
```
