---
title: Worker Process And File Effect Boundaries
status: complete
created_at: 2026-05-14
completed_at: 2026-05-14
summary: Continue the Worker Foundations installer Effect migration by making proof process execution injectable without changing generated Worker output.
post_build_recap: Worker proof command and dogfood child-plan process execution now expose Effect helpers backed by `BoundedProcessService`, with focused injected tests proving proof ordering, failure stop behavior, and command arguments without spawning child processes.
program_id: local-runner-node-effect-migration
planning_brief: docs/programs/completed/2026-05-13-local-runner-node-effect-migration/planning-brief-7.md
read_when:
  - Resuming the Worker process and file Effect migration.
  - Validating Worker Foundations proof command execution after an Effect boundary change.
  - Checking which Worker installer process or file boundaries remain deferred.
---

# Worker Process And File Effect Boundaries

This document is a living execution plan for continuing the Worker Foundations installer Effect migration at process and file boundaries.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The Worker Foundations installer already runs as a Node-first CLI and has an Effect boundary for install result and event sync. Proof command execution is still called through a promise helper from the Worker proof module, which makes it harder to inject process behavior at the Worker workflow layer. After this slice, Worker proof execution should be testable without starting real child processes while `runWorkerFoundationsInstall` remains promise-returning and generated Worker files stay unchanged.

The visible behavior remains the same: installs still run the same proof scripts, record the same proof command labels and statuses, write the same local proof artifact, and keep using the Node/npm Worker contract. The change is internal testability and Effect composition at the proof process boundary.

## Progress

- [x] 2026-05-14: Opened this ExecPlan from planning brief 7 and selected Worker proof command execution as the first boundary.
- [x] 2026-05-14: Migrated proof command execution in `packages/local-runner/src/workflows/worker-foundations-install/proof.ts` to Effect helpers that reuse `BoundedProcessService`.
- [x] 2026-05-14: Added focused injected-service tests in `packages/local-runner/tests/worker-foundations-install.test.ts`.
- [x] 2026-05-14: Ran focused Worker installer tests, local-runner static checks, build, package smoke, and full Worker compatibility smoke.
- [x] 2026-05-14: Updated this ExecPlan and the owning Program with validation evidence before completion.

## Surprises & Discoveries

`Effect.succeed` inferred the recognized-child-plan branch too narrowly as `succeeded: true`, while the package-script branch returned the broader bounded-process result shape. Typecheck caught this and the branch now explicitly widens to the shared Worker package-script result type.

## Decision Log

Decision: Start with Worker proof command execution rather than apply writes or license activation.

Rationale: `proof.ts` already routes process execution through the existing bounded-process helper. Exposing an Effect helper over that path gives this slice an injected process proof with a small diff, and it avoids changing generated Worker templates, package-manager defaults, license semantics, or target-repo write behavior.

Date: 2026-05-14.

Decision: Reuse `BoundedProcessService` instead of adding a Worker-specific process service.

Rationale: The existing service already models the command, arguments, working directory, environment, timeout, stdout, stderr, non-zero exit, missing executable, and timeout result fields that Worker proof commands need. A second service tag would duplicate the same boundary without adding behavior.

Date: 2026-05-14.

## Outcomes & Retrospective

This plan is complete. `runDogfoodChildPlanEffect` and `runProofCommandsEffect` now let Worker proof process execution compose with injected `BoundedProcessService` dependencies while the existing promise wrappers keep `runWorkerFoundationsInstall` and command callers unchanged. Generated Worker output, proof labels, package-manager defaults, report shape, license behavior, and kickoff behavior were not intentionally changed.

## Context and Orientation

`packages/local-runner/src/workflows/worker-foundations-install/workflow.ts` orchestrates Worker install. It calls `runDogfoodChildPlan`, `runProofCommands`, and `writeLocalProof` from `packages/local-runner/src/workflows/worker-foundations-install/proof.ts`. `runDogfoodChildPlan` may run the installed `program:write-child-plan` package script when the expected child ExecPlan is absent. `runProofCommands` runs the scripts listed in `WORKER_FOUNDATIONS_PROOF_SCRIPTS` from `manifest.ts`, stops on the first failure, and returns proof command statuses that are written to JSON output, reports, and runner events.

`packages/local-runner/src/core/bounded-process.ts` already provides `runBoundedProcessEffect`, `BoundedProcessService`, and `NodeBoundedProcessServiceLive`. The promise adapter `runBoundedProcess` must keep working for existing callers, but Worker proof code can call the Effect helper directly and expose Worker-level Effect helpers for tests and later orchestration migration.

`packages/local-runner/tests/worker-foundations-install.test.ts` is the focused regression file for Worker install behavior. It already uses injected Effect services for runner-home and runner-event boundaries, so it is the right place for injected proof process coverage.

### In Scope

This slice may edit `packages/local-runner/src/workflows/worker-foundations-install/proof.ts`, focused Worker install tests, this ExecPlan, and the owning Program packet. It may import `Effect`, `Layer`, `runLocalRunnerEffect`, `BoundedProcessService`, `NodeBoundedProcessServiceLive`, and `runBoundedProcessEffect` from existing local-runner boundaries.

### Out Of Scope

This slice must not change generated Worker file contents, package-manager defaults, report shape, license activation semantics, kickoff behavior, command-line API shape, Program run loop, daemon, one-shot commands, or repo-wide package management. It must not import runtime code from `repos/effect/`. Apply/write filesystem migration and license HTTP/file migration are deferred unless proof process migration uncovers a small bug that must be fixed separately and recorded here.

## Plan of Work

First, update `proof.ts` so package script execution has an Effect helper that calls `runBoundedProcessEffect`. Keep the existing promise-returning `runDogfoodChildPlan` and `runProofCommands` wrappers by running the Effect helpers with `NodeBoundedProcessServiceLive`.

Second, preserve the existing command label logic. `npm` proof scripts must still use `npm run <script>` labels, and `npm` script arguments must still insert `--` before forwarded arguments. Other package managers must keep the current `run <script> ...args` argument shape.

Third, add focused tests that provide a stub `BoundedProcessService`. One test should prove `runProofCommandsEffect` executes the configured proof scripts through the injected service and stops after the first failed result. Another test should prove `runDogfoodChildPlanEffect` can run `program:write-child-plan` through the injected service without starting a real process.

Fourth, run the focused Worker installer suite and local-runner static checks. If the code path changed any generated output, stop and repair the behavior before broad validation.

## Milestones

Milestone 1 introduces the Effect helper while preserving promise adapters. Success means `proof.ts` exports Effect versions of the proof process operations and existing callers still compile without changes.

Milestone 2 proves injected behavior. Success means focused tests exercise Worker proof process execution with a stub process service and no real child process.

Milestone 3 validates the slice and records evidence. Success means the focused Worker installer test file, local-runner format check, lint, typecheck, plan lint, Program lint, markdown lint, and scoped diff check pass, with evidence recorded in this plan.

## Concrete Steps

Work from `/Users/bazelrex/Developer/ship-by-sunday`.

Inspect the proof and process boundaries:

    sed -n '1,220p' packages/local-runner/src/workflows/worker-foundations-install/proof.ts
    sed -n '1,220p' packages/local-runner/src/core/bounded-process.ts

After implementation, run:

    bun run --cwd packages/local-runner test -- tests/worker-foundations-install.test.ts
    bun run --cwd packages/local-runner format:check
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner build
    bun run --cwd packages/local-runner worker:compatibility-smoke
    bun run --cwd packages/local-runner package:smoke
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-worker-process-and-file-effect-boundaries.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-worker-process-and-file-effect-boundaries.md docs/programs/completed/2026-05-13-local-runner-node-effect-migration
    git diff --check -- docs/exec-plans/completed/2026-05-14-worker-process-and-file-effect-boundaries.md docs/programs/completed/2026-05-13-local-runner-node-effect-migration packages/local-runner/src/workflows/worker-foundations-install/proof.ts packages/local-runner/tests/worker-foundations-install.test.ts

Compatibility smoke and package smoke were run even though generated Worker output did not intentionally change, because this slice touches the installer proof path.

## Validation and Acceptance

Feature: Worker Foundations proof process Effect boundary.

Risk: P1 core product. Worker install proof is part of the main install path. The slice is intended to be behavior-preserving, but a mistake could make installs falsely pass, falsely fail, or stop running proof scripts.

Source of truth: proof command status arrays from `runProofCommands`, dogfood child-plan process results from `runDogfoodChildPlan`, install JSON/report proof entries, and focused tests that inject process behavior.

Must work: proof commands run in order, command labels are unchanged, the proof loop stops on first failed proof result, dogfood child-plan execution keeps the same package-script arguments, stdout/stderr/timedOut/exit fields remain available to callers, and public promise wrappers still work.

Must fail safely: non-zero proof result marks the command failed and stops later proof commands, missing executable and timeout results still come from bounded-process behavior, and filesystem races reading an existing child plan still surface as ordinary failures rather than being swallowed.

Tests: focused Worker installer tests with injected `BoundedProcessService`, existing Worker install fixture tests, local-runner format check, lint, typecheck, plan lint, Program lint, markdown lint, and scoped diff check.

CI gate: local-runner package validation plus plan and Program docs validation for this slice.

### Test Commands

Run these commands before completing this plan:

    bun run --cwd packages/local-runner test -- tests/worker-foundations-install.test.ts
    bun run --cwd packages/local-runner format:check
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner build
    bun run --cwd packages/local-runner worker:compatibility-smoke
    bun run --cwd packages/local-runner package:smoke
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-worker-process-and-file-effect-boundaries.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-worker-process-and-file-effect-boundaries.md docs/programs/completed/2026-05-13-local-runner-node-effect-migration
    git diff --check -- docs/exec-plans/completed/2026-05-14-worker-process-and-file-effect-boundaries.md docs/programs/completed/2026-05-13-local-runner-node-effect-migration packages/local-runner/src/workflows/worker-foundations-install/proof.ts packages/local-runner/tests/worker-foundations-install.test.ts

## Idempotence and Recovery

The change is additive: keep promise wrappers and add Effect helpers. If tests fail, compare proof command labels and package script argument arrays before changing behavior. If a broad smoke check exposes a generated-output diff, revert the generated-output change and keep this slice focused on the process boundary.

Do not stage unrelated dirty files. This repository may contain active work in `apps/web`, Program packets, or `MISTAKES.md` while this plan is being executed. Stage only the files explicitly changed for this slice.

## Artifacts and Notes

Research sources read before implementation:

    docs/programs/completed/2026-05-13-local-runner-node-effect-migration/program.md
    docs/programs/completed/2026-05-13-local-runner-node-effect-migration/planning-brief-7.md
    docs/exec-plans/PLANS.md
    repos/effect/AGENTS.md
    packages/local-runner/src/workflows/worker-foundations-install/proof.ts
    packages/local-runner/src/core/bounded-process.ts
    packages/local-runner/tests/worker-foundations-install.test.ts

Implementation artifacts:

    packages/local-runner/src/workflows/worker-foundations-install/proof.ts
    packages/local-runner/tests/worker-foundations-install.test.ts

Validation evidence from 2026-05-14:

    bun run --cwd packages/local-runner test -- tests/worker-foundations-install.test.ts
    Test Files  1 passed (1)
    Tests  44 passed (44)

    bun run --cwd packages/local-runner format:check
    All matched files use the correct format.

    bun run --cwd packages/local-runner lint
    Found 0 warnings and 0 errors.

    bun run --cwd packages/local-runner typecheck
    exited with code 0

    bun run --cwd packages/local-runner build
    dist/cli.js  1.7mb
    Done

    bun run --cwd packages/local-runner package:smoke
    package smoke passed

    bun run --cwd packages/local-runner worker:compatibility-smoke
    worker install compatibility smoke passed (11 scenarios)

## Interfaces and Dependencies

Production code must import published packages only. `repos/effect/` remains read-only reference material.

The primary interfaces are `BoundedProcessService`, `NodeBoundedProcessServiceLive`, `runBoundedProcessEffect`, `runLocalRunnerEffect`, `runDogfoodChildPlan`, `runProofCommands`, and the new Worker proof Effect helpers. `runWorkerFoundationsInstall` remains the public promise-returning installer entry point.
