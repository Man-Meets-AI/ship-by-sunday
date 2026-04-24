---
title: 'Program Planning Brief'
summary: 'Prompt asset for writing the first immutable Program planning brief and current pointer.'
docType: 'prompt'
status: 'active'
read_when:
  - 'Creating `planning-brief-1.md` for a Program.'
  - 'Turning Program packet decisions into the first execution-facing source of truth.'
---

# Program Planning Brief

Use this after convergence, dependency ordering, plan splitting, and cross-repo review are complete.

## Prompt

```text
Read the repo root `AGENTS.md` first and follow it.

Read `docs/programs/PROGRAMS.md`, `docs/programs/README.md`, `docs/exec-plans/PLANS.md`, and `docs/prompts/README.md`.

You are writing the first immutable planning brief for one Program. Do not write an ExecPlan yet. Do not implement code.

Use this Program root:
<program_root>
docs/programs/active/YYYY-MM-DD-program-id/
</program_root>

Read:
- `converged-decision-packet.md`
- `dependency-graph.md`
- `plan-split-recommendation.md`
- `cross-repo-review.md`
- normalized passes only when needed to resolve a brief detail

Write:
- `planning-brief-1.md`
- `current-planning-brief.txt`

`current-planning-brief.txt` must contain exactly:

planning-brief-1.md

Use exactly this structure for `planning-brief-1.md`:

# Planning Brief

## Goal
- one short paragraph

## Converged Decisions
- final architectural decisions we can act on now

## Open Questions
- only questions that truly remain

## Final Plan Split
1. ...
2. ...
3. ...

## Final Dependency Order
1. ...
2. ...
3. ...

## First ExecPlan To Write
- exact title
- exact scope
- exact boundaries

## Why This First
- short paragraph

Rules:
- make the brief concise and actionable
- do not leave vague plan names
- do not include implementation steps that belong in the ExecPlan
- keep later-plan boundaries explicit
- include enough context for `docs/prompts/exec-plan-writer.md` to write the first child plan without chat history

Quality gate before returning:
- Confirm the first child ExecPlan title, scope, and boundaries are exact.
- Confirm the final plan split and dependency order reflect the cross-repo review corrections.
- Confirm open questions are limited to real blockers or watchpoints.
- Confirm `current-planning-brief.txt` contains exactly `planning-brief-1.md`.

After writing the brief and pointer, run:
- `bun run programs:lint`
- `bun run markdown:lint -- --paths docs/programs docs/prompts/program-planning-brief.md`

Return:
- planning brief path
- current pointer contents
- first ExecPlan recommendation
- validation commands and results
```
