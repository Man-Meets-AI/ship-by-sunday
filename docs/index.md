---
title: "Docs Index"
summary: "First-hop map for the canonical Ship by Sunday docs spine."
docType: "readme"
status: "active"
read_when:
  - "You need the repo-wide docs map before opening subtree docs."
  - "You are deciding which checked-in doc owns a rule or routing decision."
---

# Docs Index

`docs/` is the canonical contributor and agent-facing docs spine for this repository. Start here after `AGENTS.md` when you need cross-cutting repo guidance.

## Owns

- the first-hop map for stable repo docs
- routing between cross-cutting docs, ExecPlans, references, and generated projections
- the explanation of how root guidance and nested owner docs fit together

## Does Not Own

- feature implementation details that belong in `apps/web/` or `packages/*`
- live runtime state or machine-local config
- historical archive detail inside completed ExecPlans

## How The Repo Routes Guidance

Root guidance starts at `AGENTS.md` and this index. More specific nested `AGENTS.md` files then narrow the rules when work moves into `apps/web/` or `packages/blueprint-compiler/`.

## First Hop

- Architecture and authority split: [docs/ARCHITECTURE.md](/Users/parkerrex/Developer/ship-by-sunday/docs/ARCHITECTURE.md)
- Validation and release proof: [docs/RELIABILITY.md](/Users/parkerrex/Developer/ship-by-sunday/docs/RELIABILITY.md)
- Secrets and trust boundaries: [docs/SECURITY.md](/Users/parkerrex/Developer/ship-by-sunday/docs/SECURITY.md)
- Frontend implementation rules: [docs/FRONTEND.md](/Users/parkerrex/Developer/ship-by-sunday/docs/FRONTEND.md)
- Visual and interaction doctrine: [docs/DESIGN.md](/Users/parkerrex/Developer/ship-by-sunday/docs/DESIGN.md)
- Product scoping and requirements routing: [docs/PRODUCT_SENSE.md](/Users/parkerrex/Developer/ship-by-sunday/docs/PRODUCT_SENSE.md)
- Repo-quality landing surface: [docs/QUALITY_SCORE.md](/Users/parkerrex/Developer/ship-by-sunday/docs/QUALITY_SCORE.md)
- ExecPlan compatibility route: [docs/PLANS.md](/Users/parkerrex/Developer/ship-by-sunday/docs/PLANS.md)
- ExecPlan contract and inventory: [docs/exec-plans/index.md](/Users/parkerrex/Developer/ship-by-sunday/docs/exec-plans/index.md)
- Generated-docs landing zone: [docs/generated/index.md](/Users/parkerrex/Developer/ship-by-sunday/docs/generated/index.md)
- Prompt assets: [docs/prompts/README.md](/Users/parkerrex/Developer/ship-by-sunday/docs/prompts/README.md)
- References landing zone: [docs/references/README.md](/Users/parkerrex/Developer/ship-by-sunday/docs/references/README.md)
- Durable design notes: [docs/design-docs/index.md](/Users/parkerrex/Developer/ship-by-sunday/docs/design-docs/index.md)
- Release workflow runbook: [docs/release-workflow.md](/Users/parkerrex/Developer/ship-by-sunday/docs/release-workflow.md)

## Next

- Read [docs/ARCHITECTURE.md](/Users/parkerrex/Developer/ship-by-sunday/docs/ARCHITECTURE.md).
- Read [docs/RELIABILITY.md](/Users/parkerrex/Developer/ship-by-sunday/docs/RELIABILITY.md).
- Read [docs/PLANS.md](/Users/parkerrex/Developer/ship-by-sunday/docs/PLANS.md).
- Browse [docs/exec-plans/index.md](/Users/parkerrex/Developer/ship-by-sunday/docs/exec-plans/index.md) for active work and planning rules.
- Use [docs/design-docs/index.md](/Users/parkerrex/Developer/ship-by-sunday/docs/design-docs/index.md) for design-system, scripts, and workspace-layout notes.
