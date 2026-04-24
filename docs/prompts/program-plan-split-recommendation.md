---
title: 'Program Plan Split Recommendation'
summary: 'Prompt asset for turning the Program dependency graph into bounded child ExecPlan recommendations.'
docType: 'prompt'
status: 'active'
read_when:
  - 'Splitting Program work into child ExecPlans.'
  - 'Choosing the first ExecPlan to write from a Program packet.'
---

# Program Plan Split Recommendation

Use this after the dependency graph exists. The output should define crisp child ExecPlan boundaries.

## Prompt

```text
Read the repo root `AGENTS.md` first and follow it.

Read `docs/programs/PROGRAMS.md`, `docs/programs/README.md`, `docs/exec-plans/PLANS.md`, and `docs/prompts/README.md`.

You are recommending the child ExecPlan split for one Program. Do not write the child ExecPlans yet. Do not implement code.

Use this Program root:
<program_root>
docs/programs/active/YYYY-MM-DD-program-id/
</program_root>

Read:
- `converged-decision-packet.md`
- `dependency-graph.md`
- normalized passes when needed to verify proposed boundaries

Write:
docs/programs/active/YYYY-MM-DD-program-id/plan-split-recommendation.md

Use exactly this structure:

# Plan Split Recommendation

## Recommended Number Of Plans
- state the number
- justify it clearly

## Plan 1
- title
- scope
- why it stands alone
- what it must not absorb

## Plan 2
- title
- scope
- why it stands alone
- what it must not absorb

## Plan 3
- title
- scope
- why it stands alone
- what it must not absorb

## Additional Plans
- only if needed

## First Plan To Write
- identify the first plan
- explain why it should go first

Rules:
- do not collapse unrelated architecture into one plan
- do not split so finely that plans lose useful outcomes
- make each plan independently reviewable and validateable
- name explicit out-of-scope boundaries for each plan
- preserve dependency order from `dependency-graph.md` unless you explain a correction

Quality gate before returning:
- Confirm every recommended plan has one observable outcome.
- Confirm each plan says what it must not absorb.
- Confirm the first plan unlocks later work and is not merely the easiest plan.
- Confirm the split can be validated through child ExecPlans without relying on chat history.

After writing the recommendation, run:
- `bun run programs:lint`
- `bun run markdown:lint -- --paths docs/programs docs/prompts/program-plan-split-recommendation.md`

Return:
- recommendation path
- plan count
- first plan to write
- validation commands and results
```
