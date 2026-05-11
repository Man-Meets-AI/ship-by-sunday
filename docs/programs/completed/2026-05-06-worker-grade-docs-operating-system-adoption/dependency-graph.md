---
title: Worker-Grade Docs Operating System Dependency Graph
summary: Dependency order for making the local runner install portable docs operating-system tooling.
docType: dependency_graph
status: active
read_when:
  - Choosing the next child ExecPlan.
  - Checking why package-script install must not happen inside docs-only apply.
---

# Worker-Grade Docs Operating System Dependency Graph

The hard dependency is authority before mutation. The runner must define the install manifest, conflict states, and proof model before it mutates package scripts, dependencies, or validator files in a customer repo.

## Ordered Dependencies

1. Top-level workflow and phase-service boundary. Add `docs-operating-system-adoption`, extract reusable docs-spine phase services from the existing public workflows, define approval bits, and keep the public workflow layer thin.

2. Tooling install authority and manifest. Define the structured install plan, same-name conflict model, dry-run proof, and real-repo fixture expectations.

3. Package-script and dependency patching. Parse package manifests and lockfile constraints, add or preserve scripts, add dependencies only when required, and report collisions explicitly.

4. Portable validator installation. Install or wire Program lint, ExecPlan lint, path-family markdown lint, docs-spine validation, prompt inventory checks, quality-score freshness checks, and child-plan generation.

5. Multi-repo pilot proof. Run the full install or dry-run flow against Worker, Ship by Sunday, Arena CRM, and a sparse fixture, then record passed, failed, and blocked evidence.

## Parallelizable Work

Worker surface inventory and sparse fixture design can run while the first manifest slice is implemented.

Markdown-family schema extraction can run alongside package-script patch design if it remains read-only until the tooling authority exists.

Runtime bootstrap and Worker-specific operating-state design are deferred to separate Programs. They should not run in parallel with this Program's implementation because they would pull target-stack process management and non-portable Worker state back into the portable docs tooling slice.

## Non-Parallel Work

Package mutation should not run in parallel with docs-spine apply on the same target checkout. The workflows may compose in sequence, but their write authority and proof need to stay separate.

Worker-specific operating-surface modules should not ship in this Program.
