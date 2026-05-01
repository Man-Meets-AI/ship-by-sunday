---
title: 'Programs'
summary: 'Landing lane for durable multi-slice initiative docs that sit above individual ExecPlans.'
docType: 'readme'
status: 'active'
read_when:
  - 'You need the first-hop docs surface for a multi-ExecPlan initiative.'
  - 'You are deciding whether work belongs in a Program doc or an ExecPlan.'
---

# Programs

`docs/programs/` is the landing lane for durable initiatives that coordinate several ExecPlans. This file is intentionally a route map; the canonical Program contract lives in [PROGRAMS.md](/Users/parkerrex/Developer/ship-by-sunday/docs/programs/PROGRAMS.md).

## Current State

Active:

- None currently.

Recently completed:

- `docs/programs/completed/2026-05-01-generated-repo-first-slice-autonomy/`: completed generated customer-repo autonomy Program that made downloaded repos executable by fresh coding agents without chat history.
- `docs/programs/completed/2026-04-26-app-structure-refactor/`: completed refactor Program that reduced and disciplined the Ship by Sunday app structure across App Router routes, Convex, Stripe, shared UI, platform boundaries, and durable product domains.

Active Program folders belong under `docs/programs/active/<YYYY-MM-DD-program-id>/`. Completed Program packets live under `docs/programs/completed/`.

Use a Program only when an initiative spans several ExecPlans and needs durable initiative-level truth. Use an ExecPlan for one bounded implementation, validation, and review slice.

## Canonical Files

- Contract: [PROGRAMS.md](/Users/parkerrex/Developer/ship-by-sunday/docs/programs/PROGRAMS.md)
- Active inventory: [active/index.md](/Users/parkerrex/Developer/ship-by-sunday/docs/programs/active/index.md)
- Completed inventory: [completed/index.md](/Users/parkerrex/Developer/ship-by-sunday/docs/programs/completed/index.md)
- Prompt assets: [docs/prompts/README.md](/Users/parkerrex/Developer/ship-by-sunday/docs/prompts/README.md)
- ExecPlan inventory: [docs/exec-plans/index.md](/Users/parkerrex/Developer/ship-by-sunday/docs/exec-plans/index.md)

## Program Loop

When a Program is active, the loop is:

1. Read `program.md`.
2. Resolve `current-planning-brief.txt` to the current versioned planning brief.
3. Write, grill, execute, and validate one child ExecPlan.
4. Sync durable docs that changed.
5. Write the next versioned planning brief and update the Program.
6. Repeat until `PROGRAMS.md` allows the Program to move to `completed/`.

Program-linked child ExecPlans must record the exact immutable planning brief path in their frontmatter. Do not point child ExecPlans at `current-planning-brief.txt`.

## Prompt Inventory

Program prompt assets live under `docs/prompts/` and are indexed in [docs/prompts/README.md](/Users/parkerrex/Developer/ship-by-sunday/docs/prompts/README.md). The Program prompt inventory is:

- `docs/prompts/program-orchestrator.md`
- `docs/prompts/program-initialize.md`
- `docs/prompts/program-funnel.md`
- `docs/prompts/program-research-passes.md`
- `docs/prompts/program-normalize-pass.md`
- `docs/prompts/program-converged-decision-packet.md`
- `docs/prompts/program-dependency-graph.md`
- `docs/prompts/program-plan-split-recommendation.md`
- `docs/prompts/program-cross-repo-review.md`
- `docs/prompts/program-planning-brief.md`
- `docs/prompts/program-doc-synthesis.md`
- `docs/prompts/program-loop.md`
- `docs/prompts/program-docs-sync.md`
- `docs/prompts/program-planning-refresh.md`
- `docs/prompts/program-completion-review.md`

## Validation

Use these proof surfaces for Program docs:

```bash
bun run programs:lint
bun run markdown:lint -- --paths docs/programs docs/prompts
```
