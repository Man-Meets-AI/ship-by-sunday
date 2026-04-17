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

- detailed implementation docs that belong to `apps/`, `workspace/`, `system/`, or `knowledge/`
- live runtime state under `.runtime/assistant/`
- the canonical ExecPlan contract body under `docs/exec-plans/PLANS.md`

## How Codex loads repo guidance

Root guidance starts at `AGENTS.md` and this docs index. More specific nested `AGENTS.md` files override broader guidance when you work deeper in the tree. In this repo the active owner files are [apps/runtime/AGENTS.md](/Users/parkerrex/Developer/worker/apps/runtime/AGENTS.md), [system/AGENTS.md](/Users/parkerrex/Developer/worker/system/AGENTS.md), [knowledge/AGENTS.md](/Users/parkerrex/Developer/worker/knowledge/AGENTS.md), and [apps/knowledge-pipeline/AGENTS.md](/Users/parkerrex/Developer/worker/apps/knowledge-pipeline/AGENTS.md).

## First Hop

- Architecture and authority split: [docs/ARCHITECTURE.md](/Users/parkerrex/Developer/worker/docs/ARCHITECTURE.md)
- Validation, worktree behavior, and review loops: [docs/RELIABILITY.md](/Users/parkerrex/Developer/worker/docs/RELIABILITY.md)
- Secrets, approvals, and trust boundaries: [docs/SECURITY.md](/Users/parkerrex/Developer/worker/docs/SECURITY.md)
- Frontend implementation rules: [docs/FRONTEND.md](/Users/parkerrex/Developer/worker/docs/FRONTEND.md)
- Visual and interaction doctrine: [docs/DESIGN.md](/Users/parkerrex/Developer/worker/docs/DESIGN.md)
- Product judgment and spec routing: [docs/PRODUCT_SENSE.md](/Users/parkerrex/Developer/worker/docs/PRODUCT_SENSE.md)
- Quality-score landing surface: [docs/QUALITY_SCORE.md](/Users/parkerrex/Developer/worker/docs/QUALITY_SCORE.md)
- Planning contract compatibility route: [docs/PLANS.md](/Users/parkerrex/Developer/worker/docs/PLANS.md)
- ExecPlan inventory: [docs/exec-plans/index.md](/Users/parkerrex/Developer/worker/docs/exec-plans/index.md)
- Product-spec landing zone: [docs/product-specs/index.md](/Users/parkerrex/Developer/worker/docs/product-specs/index.md)
- Generated-docs landing zone: [docs/generated/index.md](/Users/parkerrex/Developer/worker/docs/generated/index.md)
- Stable prompt assets: [docs/prompts/README.md](/Users/parkerrex/Developer/worker/docs/prompts/README.md)
- Reference landing zone: [docs/references/README.md](/Users/parkerrex/Developer/worker/docs/references/README.md)
- Durable design notes: [docs/design-docs/index.md](/Users/parkerrex/Developer/worker/docs/design-docs/index.md)

## Next

- Read [docs/ARCHITECTURE.md](/Users/parkerrex/Developer/worker/docs/ARCHITECTURE.md).
- Read [docs/RELIABILITY.md](/Users/parkerrex/Developer/worker/docs/RELIABILITY.md).
- Read [docs/PLANS.md](/Users/parkerrex/Developer/worker/docs/PLANS.md).
- Browse [docs/exec-plans/index.md](/Users/parkerrex/Developer/worker/docs/exec-plans/index.md) for active and completed ExecPlans.
- Use [workspace/README.md](/Users/parkerrex/Developer/worker/workspace/README.md) for the human-facing operating surface.
- Use [system/README.md](/Users/parkerrex/Developer/worker/system/README.md) only when the task changes runtime-meta or repo policy.
- Use [knowledge/README.md](/Users/parkerrex/Developer/worker/knowledge/README.md) for non-role knowledge surfaces.
- Use [apps/runtime/README.md](/Users/parkerrex/Developer/worker/apps/runtime/README.md) for runtime implementation details.
