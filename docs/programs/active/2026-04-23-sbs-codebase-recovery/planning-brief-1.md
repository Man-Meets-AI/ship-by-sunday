---
title: Ship By Sunday Codebase Recovery Planning Brief 1
program_id: sbs-codebase-recovery
brief_version: 1
status: superseded
summary: Define the first child ExecPlan sequence for improving release evidence, runtime reliability, route truth, core feature structure, observability data contracts, and design dependency hygiene.
read_when:
  - Writing child ExecPlans for this initiative.
  - Checking which recovery slice should happen next.
---

# Ship By Sunday Codebase Recovery Planning Brief 1

## Goal

Use the review findings to turn broad codebase pain into a durable sequence of executable plans. The initiative should improve Ship by Sunday by fixing release evidence first, then runtime incident classes, then product contract drift, then structural feature debt, then lower-priority cleanup.

## Current Facts

The release and intake control plane contains concrete defects in the dirty worktree. Runtime surfaces still show prior incident classes. Product route truth is split across app routes, docs, QA, and legacy copy. Blueprint and workbench code contains large stateful modules that repeat upload and rendering behavior. Observability data contracts mix rollup and occurrence concerns. Design dependencies and visual systems are broader than the product needs.

Ship by Sunday accepts Program-linked ExecPlan frontmatter when the paired `program_id` and `planning_brief` keys are both present. Child plans written from this brief should record `program_id: sbs-codebase-recovery` and the immutable planning brief path in frontmatter.

## Child ExecPlan Sequence

The first child ExecPlan should be `docs/exec-plans/active/2026-04-23-repair-release-intake-control-plane.md`.

The second child ExecPlan should be `docs/exec-plans/active/2026-04-23-remove-runtime-footguns.md`.

The third child ExecPlan should be `docs/exec-plans/active/2026-04-23-reconcile-product-route-contract.md`.

The fourth child ExecPlan should be `docs/exec-plans/active/2026-04-23-split-blueprint-and-workbench-systems.md`.

The fifth child ExecPlan should be `docs/exec-plans/active/2026-04-23-harden-observability-data-contracts.md`.

The sixth child ExecPlan should be `docs/exec-plans/active/2026-04-23-reduce-design-dependency-sprawl.md`.

## Boundaries

Do not implement product code while creating this Program packet and child ExecPlans. Do not make each priority a tiny incident plan. The split should stay at execution seams that can be validated independently.

## Validation

The Program packet is valid when it includes the research passes, normalized passes, decision packet, dependency graph, plan split recommendation, cross-repo review, immutable planning brief, current brief pointer, and Program document. Child ExecPlans are valid when `bun run plans:lint -- --plan <path>` passes for each file.
