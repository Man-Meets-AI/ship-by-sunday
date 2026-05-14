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

- detailed implementation docs that belong to `apps/`
- generated mirrors under `docs/generated/`; those are output/reference material, not primary doctrine
- historical archives under `docs/archive/`; those stay searchable as evidence but are excluded from the normal current-truth path
- the canonical ExecPlan contract body under `docs/exec-plans/PLANS.md`

## How Codex loads repo guidance

Root guidance starts at `AGENTS.md` and this docs index. More specific nested `AGENTS.md` files override broader guidance when you work deeper in the tree. In this repo the active owner files are [apps/web/AGENTS.md](../apps/web/AGENTS.md) and [packages/codebase-compiler/AGENTS.md](../packages/codebase-compiler/AGENTS.md).

## First Hop

- Architecture and authority split: [docs/ARCHITECTURE.md](ARCHITECTURE.md)
- Validation, worktree behavior, and review loops: [docs/RELIABILITY.md](RELIABILITY.md)
- Secrets, approvals, and trust boundaries: [docs/SECURITY.md](SECURITY.md)
- Active web UI and app-shape migration: [docs/programs/active/2026-05-14-t3-code-source-design-system-port/program.md](programs/active/2026-05-14-t3-code-source-design-system-port/program.md)
- Product judgment and spec routing: [docs/PRODUCT_SENSE.md](PRODUCT_SENSE.md)
- Quality-score landing surface: [docs/QUALITY_SCORE.md](QUALITY_SCORE.md)
- Planning contract compatibility route: [docs/PLANS.md](PLANS.md)
- Program inventory and contract: [docs/programs/README.md](programs/README.md)
- ExecPlan inventory: [docs/exec-plans/index.md](exec-plans/index.md)
- Product-spec landing zone: [docs/product-specs/index.md](product-specs/index.md)
- Generated mirror reference: [docs/generated/index.md](generated/index.md)
- Stable prompt assets: [docs/prompts/README.md](prompts/README.md)
- Reference landing zone: [docs/internal/README.md](internal/README.md)
- Historical design notes: [docs/design-docs/index.md](design-docs/index.md)
- Historical archives: [docs/archive/README.md](archive/README.md)

## Next

- Read [docs/ARCHITECTURE.md](ARCHITECTURE.md).
- Read [docs/RELIABILITY.md](RELIABILITY.md).
- Read [docs/PLANS.md](PLANS.md).
- Browse [docs/programs/README.md](programs/README.md) for multi-ExecPlan initiatives.
- Browse [docs/exec-plans/index.md](exec-plans/index.md) for active and completed ExecPlans.
- Use [docs/design-docs/index.md](design-docs/index.md) for the deeper repo reference lane.
