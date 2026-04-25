---
title: 'Plans'
summary: 'Top-level route from a generic PLANS expectation to the canonical Ship by Sunday ExecPlan contract and inventory.'
docType: 'guide'
status: 'active'
read_when:
  - 'A reader expects a top-level PLANS.md route inside docs/.'
  - 'You need to know where long-running work should be planned in this repo.'
---

# Plans

This file is the top-level landing page for long-running planning work in this repository. The canonical Program contract lives under `docs/programs/` and the canonical ExecPlan contract lives under `docs/exec-plans/`.

## Owns

- the top-level route from a generic `PLANS.md` expectation to the real repo contract
- the repo-wide distinction between Programs, ExecPlans, product specs, and generated docs

## Does Not Own

- the canonical Program or ExecPlan rules themselves
- product-spec requirements
- generated output indexes

## Routing

- Use Programs for durable multi-slice initiatives that coordinate several ExecPlans.
- Use ExecPlans for one bounded implementation, validation, and review slice.
- Use product specs for stable behavior and requirement truth.
- Use generated docs for machine-produced, human-readable checked-in projections.

## Next

- Read [docs/programs/PROGRAMS.md](/Users/parkerrex/Developer/ship-by-sunday/docs/programs/PROGRAMS.md).
- Browse [docs/programs/README.md](/Users/parkerrex/Developer/ship-by-sunday/docs/programs/README.md).
- Read [docs/exec-plans/PLANS.md](/Users/parkerrex/Developer/ship-by-sunday/docs/exec-plans/PLANS.md).
- Browse [docs/exec-plans/index.md](/Users/parkerrex/Developer/ship-by-sunday/docs/exec-plans/index.md).
