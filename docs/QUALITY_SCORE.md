---
title: 'Quality Score'
summary: 'Landing surface for repo-wide quality scoring expectations and follow-up debt tracking in Ship by Sunday.'
docType: 'guide'
status: 'active'
read_when:
  - 'You need the current repo stance on quality scoring or quality debt.'
  - 'You are deciding where a cross-cutting reliability or docs follow-up should live.'
---

# Quality Score

This file is the durable landing surface for repo-wide quality scoring in Ship by Sunday. It exists to explain how quality debt should be tracked in this repository without turning one branch or one chat into the source of truth.

## Owns

- the repo-wide purpose of quality scoring
- routing from broad quality findings into the right durable docs surface
- the expectation that quality debt should be recorded in checked-in docs, not left in chat

## Does Not Own

- a live scoring engine or automation job
- feature-level acceptance criteria
- one branch's temporary review findings

## Current Stance

- Treat quality score as a durable repo-health concept, not as a one-off review artifact.
- Prefer concrete findings tied to real code paths, proof gaps, or stale docs over abstract scorekeeping.
- Route multi-step follow-up work into `docs/exec-plans/active/` when it needs execution planning.
- Route ongoing repo debt into `docs/exec-plans/tech-debt-tracker.md` when it does not belong to one feature slice.

## How To Use It

- If a review finds one isolated bug, fix the bug directly or record it in the active branch handoff.
- If a review finds repeated repo-wide drift, create or update an ExecPlan.
- If the finding is broad debt without one immediate owner, add it to the tech-debt tracker.

## Next

- Use [docs/exec-plans/tech-debt-tracker.md](/Users/parkerrex/Developer/ship-by-sunday/docs/exec-plans/tech-debt-tracker.md) for the durable repo-quality debt ledger.
- Use [docs/exec-plans/index.md](/Users/parkerrex/Developer/ship-by-sunday/docs/exec-plans/index.md) for active and completed planning work.
- Use [docs/RELIABILITY.md](/Users/parkerrex/Developer/ship-by-sunday/docs/RELIABILITY.md) for the current proof loop and validation expectations.
