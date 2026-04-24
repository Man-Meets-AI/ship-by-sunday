---
title: 'Docs Index'
summary: 'First-hop map for the canonical agent-facing docs spine in this repository.'
docType: 'readme'
status: 'active'
read_when:
  - 'You need the repo-wide docs map before opening subtree docs.'
  - 'You are deciding which cross-cutting doc owns a rule or routing decision.'
---

# Docs Index

`docs/` is the canonical agent-facing documentation spine for this repository. Start here before loading subtree docs.

## Owns

- the first-hop repo map for agents and contributors
- routing to the cross-cutting docs that stay stable across features
- the explanation of how repo-wide guidance and nested owner docs fit together

## Does Not Own

- detailed implementation docs that belong to `apps/` or generated outputs under `docs/generated/`
- the canonical ExecPlan contract body under `docs/exec-plans/PLANS.md`

## How Codex loads repo guidance

Root guidance starts at `AGENTS.md` and this docs index. More specific nested `AGENTS.md` files override broader guidance when you work deeper in the tree. In this repo the active owner files are [apps/web/AGENTS.md](/Users/parkerrex/Developer/ship-by-sunday/apps/web/AGENTS.md) and [packages/blueprint-compiler/AGENTS.md](/Users/parkerrex/Developer/ship-by-sunday/packages/blueprint-compiler/AGENTS.md).

## First Hop

- Architecture and authority split: [docs/ARCHITECTURE.md](/Users/parkerrex/Developer/ship-by-sunday/docs/ARCHITECTURE.md)
- Validation, worktree behavior, and review loops: [docs/RELIABILITY.md](/Users/parkerrex/Developer/ship-by-sunday/docs/RELIABILITY.md)
- Secrets, approvals, and trust boundaries: [docs/SECURITY.md](/Users/parkerrex/Developer/ship-by-sunday/docs/SECURITY.md)
- Frontend implementation rules: [docs/FRONTEND.md](/Users/parkerrex/Developer/ship-by-sunday/docs/FRONTEND.md)
- Visual and interaction doctrine: [docs/DESIGN.md](/Users/parkerrex/Developer/ship-by-sunday/docs/DESIGN.md)
- Product judgment and spec routing: [docs/PRODUCT_SENSE.md](/Users/parkerrex/Developer/ship-by-sunday/docs/PRODUCT_SENSE.md)
- Quality-score landing surface: [docs/QUALITY_SCORE.md](/Users/parkerrex/Developer/ship-by-sunday/docs/QUALITY_SCORE.md)
- Planning contract compatibility route: [docs/PLANS.md](/Users/parkerrex/Developer/ship-by-sunday/docs/PLANS.md)
- Program inventory and contract: [docs/programs/README.md](/Users/parkerrex/Developer/ship-by-sunday/docs/programs/README.md)
- ExecPlan inventory: [docs/exec-plans/index.md](/Users/parkerrex/Developer/ship-by-sunday/docs/exec-plans/index.md)
- Product-spec landing zone: [docs/product-specs/index.md](/Users/parkerrex/Developer/ship-by-sunday/docs/product-specs/index.md)
- Generated-docs landing zone: [docs/generated/index.md](/Users/parkerrex/Developer/ship-by-sunday/docs/generated/index.md)
- Stable prompt assets: [docs/prompts/README.md](/Users/parkerrex/Developer/ship-by-sunday/docs/prompts/README.md)
- Reference landing zone: [docs/internal/README.md](/Users/parkerrex/Developer/ship-by-sunday/docs/internal/README.md)
- Durable design notes: [docs/design-docs/index.md](/Users/parkerrex/Developer/ship-by-sunday/docs/design-docs/index.md)

## Next

- Read [docs/ARCHITECTURE.md](/Users/parkerrex/Developer/ship-by-sunday/docs/ARCHITECTURE.md).
- Read [docs/RELIABILITY.md](/Users/parkerrex/Developer/ship-by-sunday/docs/RELIABILITY.md).
- Read [docs/PLANS.md](/Users/parkerrex/Developer/ship-by-sunday/docs/PLANS.md).
- Browse [docs/programs/README.md](/Users/parkerrex/Developer/ship-by-sunday/docs/programs/README.md) for multi-ExecPlan initiatives.
- Browse [docs/exec-plans/index.md](/Users/parkerrex/Developer/ship-by-sunday/docs/exec-plans/index.md) for active and completed ExecPlans.
- Use [docs/design-docs/index.md](/Users/parkerrex/Developer/ship-by-sunday/docs/design-docs/index.md) for the deeper repo reference lane.
