---
title: Runner Orchestration Runtime Migration
status: complete
created_at: 2026-05-14
completed_at: 2026-05-14
summary: Move the Program run-slice orchestration path onto Effect helpers while keeping the existing CLI promise API stable.
post_build_recap: Program run-slice now has an Effect orchestration helper, the public promise API delegates through live Effect services, proof and git process execution use BoundedProcessService, Codex execution uses CodexExecService, and focused injection coverage proves the path without launching a real proof command.
program_id: local-runner-node-effect-migration
planning_brief: docs/programs/active/2026-05-13-local-runner-node-effect-migration/planning-brief-8.md
read_when:
  - Resuming the local-runner Program run-slice Effect migration.
  - Validating planning brief 8 for local-runner orchestration.
  - Checking why Program run-slice uses Effect services.
---

# Runner Orchestration Runtime Migration

This document is a living execution plan for migrating the local-runner Program run-slice orchestration path onto Effect helpers and injectable services.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The local runner already has Effect services for process execution, Codex execution, repository-safe file writes, and local `.sbs` state. The next useful user-visible improvement is to make `ship-by-sunday program run-slice` compose those services at the orchestration layer instead of calling the promise adapters directly. After this slice, command callers should still see the same promise-returning result, but tests should be able to inject the proof process boundary into the full run-slice path and prove the slice without launching real proof commands.

## Progress

- [x] 2026-05-14: Read `docs/programs/PROGRAMS.md`, `docs/exec-plans/PLANS.md`, the active Program packet, planning brief 8, the Effect subtree instructions, and current `program-run-slice` tests.
- [x] 2026-05-14: Added exported `runProgramRunSliceEffect` and `NodeProgramRunSliceServicesLive` while preserving `runProgramRunSlice` as the command-facing promise adapter.
- [x] 2026-05-14: Moved proof command execution, git snapshot commands, state writes, review artifact writes, docs sync writes, and the default Codex executor onto the existing Effect service layer.
- [x] 2026-05-14: Added focused full-slice coverage that injects `BoundedProcessService` and avoids a real proof child process.
- [x] 2026-05-14: Ran focused tests, format, lint, typecheck, and build, then updated this ExecPlan and the owning Program.

## Surprises & Discoveries

The initial inspection confirmed `program-run-slice.ts` still called `runBoundedProcess`, `runCodexExec`, `ensureLocalProjectStateDirectory`, `ensureRepositoryDirectory`, and `writeRepositoryTextFile` promise adapters from the orchestration body. During implementation, the git review snapshot also needed to move through `BoundedProcessService`; otherwise a full Effect run-slice test could inject proof process execution but would still shell out to real `git` during review prompt construction.

## Decision Log

Decision: Migrate `program-run-slice` before `program-run-loop`.
Rationale: `program-run-loop` already accepts an injected slice runner, while `program-run-slice` owns Codex execution, proof process execution, state writes, review prompt writes, and docs sync. Moving the slice first proves the service composition where the real I/O happens.
Date: 2026-05-14.

Decision: Preserve the existing `runProgramRunSlice` promise API as the command boundary.
Rationale: `packages/local-runner/src/commands/program.ts`, `packages/local-runner/src/commands/execplan.ts`, and existing tests call this function directly. The Effect helper should be additive so command behavior and CLI exit behavior do not change.
Date: 2026-05-14.

## Outcomes & Retrospective

This plan is complete. `packages/local-runner/src/core/program-run-slice.ts` now exports `runProgramRunSliceEffect`, `runProgramRunSliceProofCommandsEffect`, and `NodeProgramRunSliceServicesLive`. The existing `runProgramRunSlice` promise API remains the command boundary and delegates through the live Effect services. The run-slice path now composes `BoundedProcessService`, `CodexExecService`, `LocalProjectStateService`, and `RepositoryBoundaryService` for the orchestration I/O this slice touched. `packages/local-runner/tests/program-run-slice.test.ts` proves the new path can inject `BoundedProcessService` across a full run and complete without launching a real proof child process.

## Context and Orientation

`packages/local-runner/src/core/program-run-slice.ts` is the core implementation behind `ship-by-sunday program run-slice` and `ship-by-sunday execplan build --plan`. It hydrates Program and ExecPlan context, runs Codex to execute the slice, extracts proof commands from the ExecPlan's `Validation and Acceptance` section, runs proof commands, builds a review prompt, runs a read-only Codex review, optionally runs Codex fix attempts, reruns proof, writes `.sbs/program-runs/...` artifacts, and appends summaries to the child ExecPlan and owning Program.

The already-migrated lower-level services are `BoundedProcessService` in `packages/local-runner/src/core/bounded-process.ts`, `CodexExecService` in `packages/local-runner/src/core/codex-exec-runner.ts`, `RepositoryBoundaryService` in `packages/local-runner/src/core/repository-boundary.ts`, and `LocalProjectStateService` in `packages/local-runner/src/core/local-project-state.ts`. This slice should use those services from the Program run-slice orchestration path.

### In Scope

Add `runProgramRunSliceEffect` and live layer wiring in `packages/local-runner/src/core/program-run-slice.ts`. Keep `runProgramRunSlice` as a promise adapter over the Effect helper. Convert the proof command runner to use `runBoundedProcessEffect`, convert the default Codex executor to use `runCodexExecEffect`, and use the local state and repository boundary Effect helpers for the run directory and state file writes that the top-level orchestration performs. Add or update `packages/local-runner/tests/program-run-slice.test.ts` so one full slice run injects `BoundedProcessService` and proves the path without spawning real proof commands.

### Out Of Scope

Do not change command names, command arguments, Program packet schemas, ExecPlan frontmatter rules, runner event payloads, generated Worker output, package-manager defaults, or the Node package distribution contract. Do not migrate `program-run-loop`, daemon queue claiming, one-shot workflows, docs-spine workflows, or Worker install internals in this slice. Do not import from `repos/effect/`.

## Plan of Work

First, update `packages/local-runner/src/core/program-run-slice.ts` to import `Effect` and `Layer` plus the existing live service layers and Effect helper functions. Introduce a `NodeProgramRunSliceServicesLive` layer that merges the live lower-level services used by the slice. Add `runProgramRunSliceEffect` with the current top-level orchestration body expressed as `Effect.gen`, leaving existing parsing and prompt-building helpers unchanged where they are pure or already well-covered.

Second, change `runProgramRunSlice` into a thin adapter that calls `runLocalRunnerEffect(runProgramRunSliceEffect(params).pipe(Effect.provide(NodeProgramRunSliceServicesLive)))`. The command modules should keep importing and calling `runProgramRunSlice` exactly as they do today.

Third, replace the internal proof command runner with an Effect helper that validates command working directories and then calls `runBoundedProcessEffect`. Replace the default Codex executor with an Effect helper that calls `runCodexExecEffect` and preserves the current thrown error message when Codex exits non-zero, times out, or returns empty output.

Fourth, add a focused test in `packages/local-runner/tests/program-run-slice.test.ts` that calls `runProgramRunSliceEffect` directly, provides a stub `BoundedProcessService`, and confirms the full run completes while recording the proof command request. Existing tests should continue to call `runProgramRunSlice` so the promise adapter stays covered.

Fifth, update this ExecPlan and `docs/programs/completed/2026-05-13-local-runner-node-effect-migration/program.md` with the finished slice, validation evidence, and any intentional deferrals.

## Milestones

Milestone 1: The run-slice path has an exported Effect helper and the existing promise adapter still works. Success means TypeScript accepts the new helper and existing `program-run-slice` tests still exercise the public promise API.

Milestone 2: Proof commands and the default Codex executor use the lower-level Effect services. Success means a test can inject `BoundedProcessService` into a full run-slice execution and no real proof child process is needed for that test.

Milestone 3: The Program and ExecPlan docs reflect the completed slice. Success means Program lint and plan lint pass for the touched docs, and the owning Program points to the remaining completion and docs hardening slice.

## Concrete Steps

From the repository root, inspect the focused surfaces:

    sed -n '1,260p' packages/local-runner/src/core/program-run-slice.ts
    sed -n '1,760p' packages/local-runner/tests/program-run-slice.test.ts

Edit `packages/local-runner/src/core/program-run-slice.ts` so `runProgramRunSliceEffect` owns the orchestration and `runProgramRunSlice` becomes a promise adapter. Keep the result object identical to the current `ProgramRunSliceResult`.

Edit `packages/local-runner/tests/program-run-slice.test.ts` to import `Effect`, `Layer`, `BoundedProcessService`, `NodeCodexExecServiceLive`, `NodeLocalProjectStateServiceLive`, `NodeRepositoryBoundaryServiceLive`, and `runProgramRunSliceEffect`. Add the focused injection test beside the existing happy path so the behavior is obvious.

Run focused tests first:

    bun run --cwd packages/local-runner test -- program-run-slice

Expected success is one passing test file with the existing happy path and the new Effect injection coverage both green.

Then run local-runner static checks:

    bun run --cwd packages/local-runner format:check
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner build

Finally validate docs:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-runner-orchestration-runtime-migration.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-runner-orchestration-runtime-migration.md docs/programs/completed/2026-05-13-local-runner-node-effect-migration
    git diff --check -- packages/local-runner/src/core/program-run-slice.ts packages/local-runner/tests/program-run-slice.test.ts docs/exec-plans/completed/2026-05-14-runner-orchestration-runtime-migration.md docs/programs/completed/2026-05-13-local-runner-node-effect-migration/program.md

## Validation and Acceptance

Feature: a maintainer runs a Program child ExecPlan through the local-runner run-slice command. Risk: P1 core product, because this path executes repository-changing automation and blocks or advances Program work. Source of truth: `.sbs/program-runs/<program>/<run>/state.json`, proof summary files, review artifacts, and the returned `ProgramRunSliceResult`. Must work: happy path, proof command execution, review pass, docs sync, pre-existing dirty worktree context, and capped fix attempts. Must fail safely: invalid Program ids, mismatched ExecPlans, unsafe proof command working directories, shell operators, failed proof commands, malformed review output, and must-fix findings that remain after capped attempts. Tests: focused unit and integration-style tests in `packages/local-runner/tests/program-run-slice.test.ts`, plus local-runner typecheck and build. CI gate: baseline local-runner test, lint, typecheck, and build.

Acceptance requires an exported Effect helper for Program run-slice orchestration, unchanged command-facing promise behavior, focused service injection coverage that avoids a real proof child process, and updated Program/ExecPlan docs.

### Test Commands

    bun run --cwd packages/local-runner test -- program-run-slice
    bun run --cwd packages/local-runner format:check
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner build
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-runner-orchestration-runtime-migration.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-runner-orchestration-runtime-migration.md docs/programs/completed/2026-05-13-local-runner-node-effect-migration
    git diff --check -- packages/local-runner/src/core/program-run-slice.ts packages/local-runner/tests/program-run-slice.test.ts docs/exec-plans/completed/2026-05-14-runner-orchestration-runtime-migration.md docs/programs/completed/2026-05-13-local-runner-node-effect-migration/program.md

## Idempotence and Recovery

The code changes are additive until the final adapter wiring, so a failed edit can be retried by restoring the last passing `program-run-slice` test state. Test fixtures write into temporary repositories created by `createTemporaryDirectory`, and `.sbs/` artifacts in those fixtures are ignored by their fixture git config. If docs validation fails, fix the Markdown or frontmatter in the touched Program and ExecPlan files before changing production code again.

## Artifacts and Notes

Important touched surfaces:

    packages/local-runner/src/core/program-run-slice.ts
    packages/local-runner/tests/program-run-slice.test.ts
    docs/programs/completed/2026-05-13-local-runner-node-effect-migration/program.md
    docs/exec-plans/completed/2026-05-14-runner-orchestration-runtime-migration.md

Validation evidence:

    bun run --cwd packages/local-runner test -- program-run-slice
    Test Files  1 passed (1)
    Tests  19 passed (19)

    bun run --cwd packages/local-runner format:check
    All matched files use the correct format.

    bun run --cwd packages/local-runner lint
    Found 0 warnings and 0 errors.

    bun run --cwd packages/local-runner typecheck
    exited with code 0

    bun run --cwd packages/local-runner build
    dist/cli.js  1.7mb
    Done

## Interfaces and Dependencies

`runProgramRunSlice(params)` remains the promise-returning public API for commands. `runProgramRunSliceEffect(params)` is the new Effect helper for orchestration tests and later run-loop migration. It depends on `BoundedProcessService`, `CodexExecService`, `LocalProjectStateService`, and `RepositoryBoundaryService`. `NodeProgramRunSliceServicesLive` should provide those services for the promise adapter. The slice depends on published `effect` package APIs only; `repos/effect/` remains read-only reference material.
