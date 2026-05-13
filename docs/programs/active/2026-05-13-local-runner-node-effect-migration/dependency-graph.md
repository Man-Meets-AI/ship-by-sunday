---
title: "Local Runner Node And Effect Migration Dependency Graph"
summary: "Ordering dependencies for Node runtime cutover, Worker install defaults, and Effect boundary migration."
docType: "dependency_graph"
status: "active"
read_when:
  - "Ordering child ExecPlans for the local-runner Node and Effect migration."
  - "Checking which slices can safely run before others."
---

# Local Runner Node And Effect Migration Dependency Graph

## Critical Path

1. Effect reference subtree and guidance.
2. Node runtime and generated Worker contract cutover for `packages/local-runner`.
3. Effect dependency and runtime scaffold.
4. Effect migration for process, Codex, event, and workflow API boundaries.
5. Worker Foundations workflow module split and later Effect migration.

## Dependencies

The Node cutover depends on the current package scripts, CLI entrypoint, package smoke, published bin contract, Worker generated file templates, and Worker install tests.

The Effect dependency scaffold depends on the Node cutover so it can use `@effect/platform-node` against the intended runtime and generated Worker contract.

The process, Codex, event, and workflow API Effect migration depends on the scaffold. These boundaries can be migrated in parallel only if their write scopes are disjoint and tests cover each boundary.

The Worker Foundations workflow Effect migration depends on the hard Node Worker contract and a module split. The file is too large and behavior-heavy to migrate safely before inspect, plan, apply, and proof responsibilities are separated.

## Parallel Work

Documentation updates for the Node runtime contract can run alongside implementation if the package behavior is already decided.

Effect reference research can continue in parallel with Node implementation, but Effect dependencies should not be added until the Node package smoke path is stable.

Tests for generated Worker Node behavior should move with the Node runtime cutover.

## Blockers

Do not start the Effect migration if `ship-by-sunday` still requires Bun at runtime.

Do not change Worker target defaults without updating `packages/local-runner/README.md`, focused Worker install tests, and smoke expectations.

Do not split the Worker workflow without proving existing installer happy path, blocked path, dry-run path, and package-manager detection behavior.
