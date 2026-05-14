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
4. Effect migration for Codex execution, runner event delivery, and workflow-run API boundaries.
5. Effect migration for local filesystem state boundaries.
6. Worker Foundations workflow module split.
7. Worker Foundations workflow Effect migration.
8. Runner orchestration runtime migration.
9. Program completion docs and broad validation hardening.

## Dependencies

The Node cutover depends on the current package scripts, CLI entrypoint, package smoke, published bin contract, Worker generated file templates, and Worker install tests.

The Effect dependency scaffold depends on the Node cutover so it can use `@effect/platform-node` against the intended runtime and generated Worker contract.

The Codex, event, and workflow API Effect migration depends on the scaffold. These boundaries can be migrated one at a time inside one child ExecPlan because their write scopes are disjoint and their focused tests are separate.

The filesystem-state Effect migration depends on the process/event/API service pattern. It touches `.sbs` state, runner-home credentials, repository-boundary path checks, Codex config, and local artifacts, so it should follow the first external I/O migration rather than precede it.

The Worker Foundations module split depends on the hard Node Worker contract and should happen before its Effect migration. The file is too large and behavior-heavy to migrate safely before inspect, plan, apply, proof, report, generated-template, license, and kickoff responsibilities are separated.

The runner orchestration runtime migration depends on the lower-level process, event, API, filesystem, and Worker services. Program run slice, Program run loop, daemon, and one-shot commands should compose existing Effect services instead of wrapping raw promises directly.

The final completion slice depends on all implementation slices and should update durable docs, archive child ExecPlans, run broad local-runner validation, and move the Program only when no required slice remains.

## Parallel Work

Documentation updates for the Node runtime contract can run alongside implementation if the package behavior is already decided.

Effect reference research can continue in parallel with implementation, but production code must continue importing only published packages.

Tests for generated Worker Node behavior should move with the Node runtime cutover.

Docs updates for future slice tracking can run before implementation, but active child ExecPlans should stay executable and should not become stale placeholders.

## Blockers

Do not start a new Effect migration slice if the prior child slice has not recorded focused validation evidence.

Do not change Worker target defaults without updating `packages/local-runner/README.md`, focused Worker install tests, and smoke expectations.

Do not split the Worker workflow without proving existing installer happy path, blocked path, dry-run path, package-manager detection behavior, license behavior, kickoff behavior, and package smoke expectations.
