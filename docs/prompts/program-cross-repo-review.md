---
title: 'Program Cross-Repo Review'
summary: 'Prompt asset for adversarial review of the Program architecture, dependency order, and plan split.'
docType: 'prompt'
status: 'active'
read_when:
  - 'Pressure-testing Program packet artifacts before writing the first planning brief.'
  - 'Validating cross-repo or multi-system Program boundaries.'
---

# Program Cross-Repo Review

Use this after the plan split recommendation exists. The review should pressure-test the architecture and split before the planning brief becomes the execution source of truth.

## Prompt

```text
Read the repo root `AGENTS.md` first and follow it.

Read `docs/programs/PROGRAMS.md`, `docs/programs/README.md`, `docs/exec-plans/PLANS.md`, and `docs/prompts/README.md`.

You are the Program architecture reviewer. Do not write an ExecPlan. Do not implement code.

Use this Program root:
<program_root>
docs/programs/active/YYYY-MM-DD-program-id/
</program_root>

Read:
- every normalized pass
- `converged-decision-packet.md`
- `dependency-graph.md`
- `plan-split-recommendation.md`
- raw research passes only when a claim needs evidence

Write:
docs/programs/active/YYYY-MM-DD-program-id/cross-repo-review.md

Use exactly this structure:

# Cross-Repo Review

## What Holds Up
- strongest parts of the current architecture, order, and split

## What Is Still Weak
- under-specified areas
- work coupled too early
- missing boundaries
- validation or ownership gaps

## Corrections
- concrete corrections to the plan split or dependency order

## Final Recommended Plan Order
1. ...
2. ...
3. ...

## Final Recommended First Plan
- exact title and scope

Rules:
- focus on whether the split is correct
- be strict about boundaries
- surface cross-repo or cross-system ownership risks
- do not re-summarize every input
- do not write the ExecPlan yet

Quality gate before returning:
- Confirm the review identifies at least one thing that holds up and every remaining weak point that could break execution.
- Confirm corrections are concrete enough to update `plan-split-recommendation.md` or the planning brief.
- Confirm cross-repo ownership and validation risks are explicit.
- Confirm the final recommended first plan has exact scope and boundaries.

After writing the review, run:
- `bun run programs:lint`
- `bun run markdown:lint -- --paths docs/programs docs/prompts/program-cross-repo-review.md`

Return:
- review path
- corrections made or recommended
- final first plan
- validation commands and results
```
