---
title: Effect Dependency And Boundary Scaffold
status: active
created_at: 2026-05-13
completed_at: null
summary: Add published Effect dependencies and prove one small local-runner external I/O boundary through an injectable Effect service without changing behavior.
post_build_recap: null
program_id: local-runner-node-effect-migration
planning_brief: docs/programs/active/2026-05-13-local-runner-node-effect-migration/planning-brief-2.md
read_when:
  - Resuming the first local-runner Effect scaffold slice.
  - Validating bounded process behavior after adding Effect.
  - Preparing the next Effect boundary migration slice.
---

# Effect Dependency And Boundary Scaffold

This document is a living execution plan for adding the first Effect scaffold to `packages/local-runner` after the Node/npm runtime cutover.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The local-runner package now ships as a Node-first CLI. The next safe step is to add Effect as a real dependency and prove it at one small external I/O boundary before larger migrations touch Codex execution, event delivery, workflow HTTP calls, or Worker install. After this slice, maintainers should see a concrete pattern for running local-runner effects and injecting an I/O service while the existing `runBoundedProcess` API continues to behave the same for current callers.

## Progress

- [x] 2026-05-13: Read root instructions, Program guidance, the completed Node/npm cutover ExecPlan, `docs/exec-plans/PLANS.md`, `docs/programs/PROGRAMS.md`, and the read-only Effect repo guidance.
- [x] 2026-05-13: Created planning brief 2 for the Effect dependency and boundary scaffold slice.
- [x] 2026-05-13: Added `effect@3.21.2`, `@effect/platform@0.96.1`, and `@effect/platform-node@0.106.0` to `packages/local-runner/package.json`; `bun.lock` records the resolved dependency graph.
- [x] 2026-05-13: Added `packages/local-runner/src/effect/runtime.ts` for running fully provided local effects and `packages/local-runner/src/effect/node-platform-runtime.ts` for the Node platform layer scaffold.
- [x] 2026-05-13: Routed `packages/local-runner/src/core/bounded-process.ts` through `BoundedProcessService` and `runBoundedProcessEffect` while preserving the promise-returning `runBoundedProcess` API.
- [x] 2026-05-13: Added focused tests for missing executable failures, stdout and stderr capture, non-zero exit codes, timeout classification, Effect interruption cleanup, Effect service injection, and the Node platform scaffold.
- [x] 2026-05-13: Local-runner focused test, format check, lint, typecheck, build, ExecPlan lint, Program lint, and markdown lint passed.
- [x] 2026-05-13: Final whitespace validation passed for the touched files, and this ExecPlan plus the Program were updated with final evidence.

## Surprises & Discoveries

The completed Node/npm cutover left `bounded-process.ts` as a good first Effect boundary because it is small, already centralizes process execution, and has existing tests.

The first build after importing `effect` into `bounded-process.ts` produced a bundled `dist/cli.js` of 1.6 MB. The single-file Node bin contract still holds, but later slices should keep an eye on bundle size if they import broader platform modules into the CLI's hot path.

The first review found that wrapping `execFile` in `Effect.promise` was not enough by itself because the child process did not receive Effect's interruption signal. The bounded process implementation now passes the provided `AbortSignal` to Node `execFile`, and the regression test proves a timed-out Effect does not leave the spawned process alive long enough to write a delayed marker file.

## Decision Log

Decision: Use `bounded-process` as the first proven Effect boundary.

Rationale: It is an external process I/O boundary with a narrow API, existing coverage, and meaningful later value for Codex, Worker proof, and Program automation without requiring a Worker installer rewrite.

Date: 2026-05-13.

Decision: Keep the public `runBoundedProcess` promise API stable in this slice.

Rationale: Many local-runner modules already call this helper. Preserving the API proves the scaffold without forcing broad call-site changes.

Date: 2026-05-13.

Decision: Add `effect`, `@effect/platform`, and `@effect/platform-node` as published package dependencies.

Rationale: The Program explicitly requires production code to use published packages and the first scaffold should be ready for Node platform services in later boundary migrations.

Date: 2026-05-13.

Decision: Keep the Node platform layer scaffold separate from the immediate bounded-process implementation.

Rationale: `bounded-process` can preserve its current `execFile` behavior behind an Effect service without pulling the broader `@effect/platform-node` layer into the bundled CLI path. The platform runtime module still typechecks and is tested so later filesystem, terminal, HTTP, and process migrations have a concrete starting point. The Node platform runner creates and disposes its managed runtime per call so scoped platform services do not become a hidden long-lived lifecycle.

Date: 2026-05-13.

Decision: Treat Effect interruption as part of the bounded-process boundary contract.

Rationale: Future callers will use Effect timeouts, races, and fiber interruption around process work. If the wrapper returns early while a child process keeps running, later migrations can silently leave mutating work behind. Passing the Effect `AbortSignal` into `execFile` preserves current promise callers and makes the new Effect helper safe to compose.

Date: 2026-05-13.

## Outcomes & Retrospective

This plan is active. The first scaffold has landed: local-runner now depends on published Effect packages, has a small Effect runtime and Node platform runtime scaffold, and proves the bounded process boundary through an injectable Effect service. The bounded process proof covers existing promise behavior plus Effect interruption cleanup. The larger Codex, event outbox, workflow API, and Worker install migrations remain intentionally outside this slice.

## Context and Orientation

`packages/local-runner/package.json` owns the local-runner package dependency manifest, scripts, build, and published bin contract. The root workspace remains Bun-managed, so dependency changes must update the root `bun.lock` while preserving the Node-first package runtime established by the previous slice.

`packages/local-runner/src/core/bounded-process.ts` wraps Node `execFile` for process execution, stdout and stderr capture, timeout classification, and missing executable failure codes. Many workflows call its promise-returning `runBoundedProcess` helper, so the first Effect change must keep that surface intact.

The read-only Effect reference subtree at `repos/effect/` may be inspected for patterns, but production code must import only from published packages. The first scaffold should live under `packages/local-runner/src/` and should be small enough that later slices can extend it rather than replace it.

### In Scope

This slice covers adding `effect`, `@effect/platform`, and `@effect/platform-node` to `packages/local-runner`, adding a minimal Effect runtime and Node platform layer scaffold, routing `bounded-process` through an injectable Effect service, adding focused bounded-process tests, and updating this Program packet with evidence.

### Out Of Scope

This slice does not migrate the root workspace away from Bun, does not rewrite Worker Foundations install, does not migrate Codex execution, runner events, workflow HTTP APIs, or Worker install phases, does not change generated Worker output, and does not import code from `repos/effect/`.

## Plan of Work

First, update the Program packet so this child slice has its own immutable planning brief and active ExecPlan. The Program should list this ExecPlan as active while implementation is underway. This step is complete.

Second, add the published Effect packages to `packages/local-runner/package.json` with the existing Bun workspace toolchain and let `bun.lock` record the exact resolved versions. This step is complete with `effect@3.21.2`, `@effect/platform@0.96.1`, and `@effect/platform-node@0.106.0`.

Third, add a tiny local-runner Effect runtime scaffold. One module should run fully provided local effects through `Effect.runPromise`. A second module should expose the Node platform layer from `@effect/platform-node` for later external I/O migrations and dispose its managed runtime after each run. This keeps the immediate process boundary small while making the Node platform dependency intentional. This step is complete in `packages/local-runner/src/effect/runtime.ts` and `packages/local-runner/src/effect/node-platform-runtime.ts`.

Fourth, refactor `packages/local-runner/src/core/bounded-process.ts` so the existing Node `execFile` behavior is implemented behind a `BoundedProcessService` Effect service. Export a `runBoundedProcessEffect` helper for tests and future migrations, but keep `runBoundedProcess` and `boundedProcessSucceeds` available for current callers. This step is complete.

Fifth, extend `packages/local-runner/tests/bounded-process.test.ts` so it proves missing executable failure codes, successful stdout and stderr capture, non-zero exit code capture, timeout classification, Effect interruption cleanup, and service injection through `runBoundedProcessEffect`. This step is complete, and the same test file also proves the Node platform scaffold can supply the Effect `Path` service.

Sixth, run the focused local-runner checks and docs validation, then update the ExecPlan and Program with dependency versions, design decisions, and command evidence. This step is complete.

## Milestones

Milestone 1 establishes the planning and dependency surface. Success means the active ExecPlan exists, the Program points at planning brief 2, and `packages/local-runner/package.json` plus `bun.lock` contain the published Effect packages.

Status: complete.

Milestone 2 establishes the runtime and service scaffold. Success means TypeScript can import the local Effect runtime modules and `bounded-process` exposes a service-backed Effect helper while current promise callers still compile.

Status: complete.

Milestone 3 proves unchanged behavior. Success means the focused bounded-process tests pass, then local-runner format, lint, and typecheck pass, followed by plan, Program, markdown, and whitespace validation.

Status: complete. Focused tests, format check, lint, typecheck, build, plan lint, Program lint, markdown lint, and whitespace validation passed.

## Concrete Steps

Work from `/Users/bazelrex/Developer/ship-by-sunday`.

Inspect the touched boundary before editing:

    sed -n '1,260p' packages/local-runner/src/core/bounded-process.ts
    sed -n '1,260p' packages/local-runner/tests/bounded-process.test.ts

Add dependencies with the root Bun workspace:

    bun add --cwd packages/local-runner effect @effect/platform @effect/platform-node

Run the focused test after editing `bounded-process`:

    bun run --cwd packages/local-runner test -- bounded-process

Then run package validation:

    bun run --cwd packages/local-runner format:check
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck

Validate the plan and Program packet:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-13-effect-dependency-and-boundary-scaffold.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-13-effect-dependency-and-boundary-scaffold.md docs/programs/active/2026-05-13-local-runner-node-effect-migration
    git diff --check -- bun.lock packages/local-runner/package.json packages/local-runner/src/core/bounded-process.ts packages/local-runner/tests/bounded-process.test.ts docs/programs/active/2026-05-13-local-runner-node-effect-migration/current-planning-brief.txt docs/programs/active/2026-05-13-local-runner-node-effect-migration/program.md MISTAKES.md
    for slice_path in packages/local-runner/src/effect/runtime.ts packages/local-runner/src/effect/node-platform-runtime.ts docs/exec-plans/active/2026-05-13-effect-dependency-and-boundary-scaffold.md docs/programs/active/2026-05-13-local-runner-node-effect-migration/planning-brief-2.md; do git diff --no-index --check /dev/null "$slice_path" >/dev/null || check_status=$?; if [ "${check_status:-0}" -gt 1 ]; then exit "$check_status"; fi; unset check_status; done

## Validation and Acceptance

Feature: first Effect dependency and process boundary scaffold for local-runner.

Risk: P2 normal product internals. The changed helper is used by important workflows, but this slice preserves the public API and does not change generated Worker files, checkout, auth, billing, or persistent product state.

Source of truth: `packages/local-runner/package.json`, `bun.lock`, the new local Effect scaffold modules, `packages/local-runner/src/core/bounded-process.ts`, and focused bounded-process test results.

Must work: current callers can still await `runBoundedProcess`, successful commands still return stdout and stderr, non-zero exits still expose numeric `exitCode`, missing commands still expose `failureCode: "ENOENT"`, process timeout still sets `timedOut: true`, Effect interruption stops the spawned process, and tests can inject the process boundary without spawning a process.

Must fail safely: process launch failures and non-zero exits must return structured `BoundedProcessResult` values instead of throwing through current callers, and interrupted Effect callers must not leave child process work running after the Effect has timed out.

Tests: focused bounded-process tests, local-runner format check, lint, typecheck, build, ExecPlan lint, Program lint, markdown lint, and `git diff --check`.

CI gate: local-runner package validation plus plan and Program docs validation for this slice.

### Test Commands

Run these commands before completing this plan:

    bun run --cwd packages/local-runner test -- bounded-process
    bun run --cwd packages/local-runner format:check
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner build
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-13-effect-dependency-and-boundary-scaffold.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-13-effect-dependency-and-boundary-scaffold.md docs/programs/active/2026-05-13-local-runner-node-effect-migration
    git diff --check -- bun.lock packages/local-runner/package.json packages/local-runner/src/core/bounded-process.ts packages/local-runner/tests/bounded-process.test.ts docs/programs/active/2026-05-13-local-runner-node-effect-migration/current-planning-brief.txt docs/programs/active/2026-05-13-local-runner-node-effect-migration/program.md MISTAKES.md
    for slice_path in packages/local-runner/src/effect/runtime.ts packages/local-runner/src/effect/node-platform-runtime.ts docs/exec-plans/active/2026-05-13-effect-dependency-and-boundary-scaffold.md docs/programs/active/2026-05-13-local-runner-node-effect-migration/planning-brief-2.md; do git diff --no-index --check /dev/null "$slice_path" >/dev/null || check_status=$?; if [ "${check_status:-0}" -gt 1 ]; then exit "$check_status"; fi; unset check_status; done

## Idempotence and Recovery

The dependency install is safe to rerun with the same package names; Bun should converge `packages/local-runner/package.json` and `bun.lock`. The bounded-process tests spawn only short-lived local Node processes or use an injected service. If a timeout test fails, rerun only `bun run --cwd packages/local-runner test -- bounded-process` before changing code so transient host load can be distinguished from behavior drift. Do not reset the worktree because unrelated user changes are present.

## Artifacts and Notes

The starting worktree already contains unrelated changes outside this slice, including root package metadata, Program runner files, and web files. This plan must not revert them.

Final validation evidence will be recorded here after implementation.

Evidence recorded on 2026-05-13:

    bun add --cwd packages/local-runner effect @effect/platform @effect/platform-node
    installed effect@3.21.2
    installed @effect/platform@0.96.1
    installed @effect/platform-node@0.106.0

    bun run --cwd packages/local-runner test -- bounded-process
    Test Files  1 passed (1)
    Tests  7 passed (7)

    bun run --cwd packages/local-runner format:check
    All matched files use the correct format.

    bun run --cwd packages/local-runner lint
    Found 0 warnings and 0 errors.

    bun run --cwd packages/local-runner typecheck
    exited with code 0

    bun run --cwd packages/local-runner build
    dist/cli.js  1.6mb
    Done

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-13-effect-dependency-and-boundary-scaffold.md
    docs/exec-plans/active/2026-05-13-effect-dependency-and-boundary-scaffold.md: ok

    bun run programs:lint
    local-runner-node-effect-migration: ok

    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-13-effect-dependency-and-boundary-scaffold.md docs/programs/active/2026-05-13-local-runner-node-effect-migration
    docs/exec-plans/active/2026-05-13-effect-dependency-and-boundary-scaffold.md: ok
    docs/programs/active/2026-05-13-local-runner-node-effect-migration/program.md: ok

    git diff --check -- bun.lock packages/local-runner/package.json packages/local-runner/src/core/bounded-process.ts packages/local-runner/tests/bounded-process.test.ts docs/programs/active/2026-05-13-local-runner-node-effect-migration/current-planning-brief.txt docs/programs/active/2026-05-13-local-runner-node-effect-migration/program.md MISTAKES.md
    exited with code 0

    no-index whitespace checks for new slice files
    exited with code 0

## Interfaces and Dependencies

The new dependencies are the published npm packages `effect`, `@effect/platform`, and `@effect/platform-node`. `effect` supplies `Effect`, `Context`, and `Layer` for the service boundary. `@effect/platform-node` supplies the Node platform layer scaffold for later process, filesystem, terminal, and HTTP migrations, with `@effect/platform` as its platform interface dependency.

`packages/local-runner/src/core/bounded-process.ts` must continue to export `BoundedProcessResult`, `getReadinessProbeTimeoutMs`, `runBoundedProcess`, and `boundedProcessSucceeds`. It may additionally export `BoundedProcessService`, the live Node service layer, and `runBoundedProcessEffect` so tests and later migrations can use the Effect boundary directly.
