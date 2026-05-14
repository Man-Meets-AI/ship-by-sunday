---
title: "Runner Orchestration Runtime Migration Planning Brief 8"
program_id: local-runner-node-effect-migration
brief_version: 8
status: current
summary: "Move higher-level local-runner orchestration onto the lower-level Effect services after Worker proof process migration."
read_when:
  - "Writing or executing the next runner orchestration Effect child ExecPlan."
  - "Choosing how to migrate Program run slice, Program run loop, daemon, one-shot, or command wrappers after Worker proof process migration."
---

# Runner Orchestration Runtime Migration Planning Brief 8

Date: 2026-05-14.

This brief drives the next child ExecPlan for the local-runner Node and Effect migration Program.

## Outcome

The local-runner should begin moving higher-level orchestration paths onto the Effect service layer now that lower-level process, Codex, event, workflow API, filesystem, Worker event sync, and Worker proof process boundaries exist. The next slice should make one orchestration path compose existing Effect services directly while preserving the current promise-returning command API.

## Scope

Use the existing local-runner orchestration surfaces under `packages/local-runner/src/commands/` and `packages/local-runner/src/core/`. Prioritize one narrow path that already depends on migrated lower-level services:

- Program run slice execution and proof in `packages/local-runner/src/core/program-run-slice.ts`
- Program run loop checkpointing and proof orchestration in `packages/local-runner/src/core/program-run-loop.ts`
- daemon or one-shot workflow execution in `packages/local-runner/src/commands/daemon.ts` or `packages/local-runner/src/commands/one-shot.ts`
- command wrapper boundaries only when they can remain thin adapters over a migrated core Effect helper

Prefer `program-run-slice` if inspection confirms it still shells out or writes state through promise helpers that now have Effect equivalents. Reuse existing services first: bounded process, Codex execution, workflow-run API, runner events, local project state, runner home, repository boundaries, and Worker proof helpers.

## Boundaries

Do not change command names, command arguments, workflow packet schemas, generated Worker output, package-manager defaults, runner event payload schemas, hosted workflow-run API semantics, or customer setup docs unless a focused test proves an existing bug and the ExecPlan records the bug separately from the Effect migration.

Do not introduce a long-lived `ManagedRuntime` for broad orchestration unless the child ExecPlan explicitly owns lifecycle and disposal.

Do not import runtime code from `repos/effect/`.

Do not migrate every command wrapper in one pass. The next slice should prove one orchestration path and leave later paths for a completion or follow-up slice.

## Acceptance

Focused validation should prove:

- the migrated orchestration path composes existing Effect services instead of wrapping raw promises directly
- command callers still receive the same promise-returning results or exit codes
- at least one orchestration test can inject a lower-level service and avoid a real child process, network call, or runner-home write
- existing Program run slice or loop failure behavior remains truthful for proof failures, review failures, dirty worktrees, and checkpoint writes
- local-runner package validation remains green

The final ExecPlan should record the migrated Effect helper names, adapter strategy, tests added or updated, exact validation commands, and any orchestration paths intentionally deferred.
