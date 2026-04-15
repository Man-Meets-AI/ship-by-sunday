---
title: "Product Sense"
summary: "Repo-wide product judgment rules for deciding what belongs in specs, plans, and scoped implementation work."
docType: "guide"
status: "active"
read_when:
  - "You are making a product-scoping or trade-off decision."
  - "You need to distinguish product requirements, ExecPlans, and implementation notes."
---

# Product Sense

This file owns the durable product-judgment rules that help contributors keep scope tight and route requirements into the right checked-in surface.

## Owns

- the repo-wide distinction between product intent, execution plans, and implementation detail
- the rules for keeping scope honest during multi-step work
- routing from product judgment into the current spec and planning surfaces

## Does Not Own

- the canonical ExecPlan contract
- one feature’s exact requirements or acceptance criteria
- implementation patterns that belong in frontend or runtime docs

## Current Rules

- Prefer the smallest slice that solves the real user problem.
- Put stable behavior and requirement truth in product-facing or repo-facing docs, not in chat or transient notes.
- Put execution sequencing and proof loops in ExecPlans, not in feature code comments.
- Keep operator-facing workflow context in checked-in docs, not in local tooling state.

## Next

- Use [docs/exec-plans/PLANS.md](/Users/parkerrex/Developer/ship-by-sunday/docs/exec-plans/PLANS.md) for execution-plan routing.
- Use [docs/release-workflow.md](/Users/parkerrex/Developer/ship-by-sunday/docs/release-workflow.md) and [apps/web/content/docs/index.mdx](/Users/parkerrex/Developer/ship-by-sunday/apps/web/content/docs/index.mdx) for durable operator and product context.
