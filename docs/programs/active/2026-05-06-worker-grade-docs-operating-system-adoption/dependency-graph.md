---
title: Worker-Grade Docs Operating System Dependency Graph
summary: Dependency order for making the local runner install portable docs operating-system tooling and runtime surfaces.
docType: dependency_graph
status: active
read_when:
  - Choosing the next child ExecPlan.
  - Checking why package-script install must not happen inside docs-only apply.
---

# Worker-Grade Docs Operating System Dependency Graph

The hard dependency is authority before mutation. The runner must define the install manifest, conflict states, and proof model before it mutates package scripts, dependencies, validator files, or runtime wrappers in a customer repo.

## Ordered Dependencies

1. Tooling install authority and manifest. Define the workflow boundary, approval flag, structured install plan, same-name conflict model, dry-run proof, and real-repo fixture expectations.

2. Package-script and dependency patching. Parse package manifests and lockfile constraints, add or preserve scripts, add dependencies only when required, and report collisions explicitly.

3. Portable validator installation. Install or wire Program lint, ExecPlan lint, path-family markdown lint, docs-spine validation, prompt inventory checks, quality-score freshness checks, and child-plan generation.

4. Runtime wrapper and bootstrap. Add the `scripts/run-runtime.sh`-style wrapper or package-manager equivalent, bootstrap env, runtime index, worktree runtime root, runtime health commands, and proof artifact conventions.

5. Optional operating-surface modules. Add notes, goals, projects, workers, topology, and worker-state validators only when selected or supported by target repo evidence.

6. Multi-repo pilot proof. Run the full install or dry-run flow against Worker, Ship by Sunday, Arena CRM, and a sparse fixture, then record passed, failed, and blocked evidence.

## Parallelizable Work

Worker surface inventory and sparse fixture design can run while the first manifest slice is implemented.

Markdown-family schema extraction can run alongside package-script patch design if it remains read-only until the tooling authority exists.

Runtime bootstrap design can be researched in parallel, but runtime files should not be applied before the package-script conflict model and proof model exist.

## Non-Parallel Work

Package mutation and runtime wrapper installation should not run in parallel with docs-spine apply on the same target checkout. The workflows may compose in sequence, but their write authority and proof need to stay separate.

Optional operating-surface modules should not ship before the portable validators, because they depend on the same script and proof infrastructure.
