---
title: 'Product Sense'
summary: 'Repo-wide product judgment rules for deciding what belongs in specs, plans, and scoped implementation work.'
docType: 'guide'
status: 'active'
read_when:
  - 'You are making a product-scoping or trade-off decision.'
  - 'You need to distinguish product specs, ExecPlans, and workspace notes.'
---

# Product Sense

This file owns the durable product-judgment rules that help agents keep scope tight and route requirements into the right checked-in surface.

## Owns

- the repo-wide distinction between product intent, execution plans, and implementation detail
- the rules for keeping scope honest during multi-step work
- routing from product judgment into the current spec and workspace surfaces

## Does Not Own

- the canonical ExecPlan contract
- one feature’s exact requirements or acceptance criteria
- implementation patterns that belong in runtime or frontend docs

## Current Rules

- Prefer the smallest slice that solves the real user problem.
- Put stable behavior and requirement truth in product specs, not in chat or transient notes.
- Put execution sequencing and proof loops in ExecPlans, not in product specs.
- Keep human-facing operating context in `workspace/`, not in runtime state or `.codex/`.

## Next

- Use [docs/product-specs/index.md](/Users/parkerrex/Developer/worker/docs/product-specs/index.md) for stable product-spec routing.
- Use [workspace/README.md](/Users/parkerrex/Developer/worker/workspace/README.md) for the human-facing operating surface.
