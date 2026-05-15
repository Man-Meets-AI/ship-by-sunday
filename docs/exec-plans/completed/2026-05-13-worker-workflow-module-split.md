---
title: Worker Workflow Module Split
status: complete
created_at: 2026-05-13
completed_at: 2026-05-13
summary: Split the Worker Foundations installer into behavior-preserving modules so the later Effect migration has narrow ownership boundaries.
post_build_recap: The Worker Foundations install workflow now has feature-local modules for inspect, plan, apply, proof, report, generated templates, license, kickoff, confirmation, environment, result, constants, types, and utilities. `workflow.ts` remains the stable orchestration entry point.
program_id: local-runner-node-effect-migration
planning_brief: docs/programs/completed/2026-05-13-local-runner-node-effect-migration/planning-brief-5.md
read_when:
  - Resuming the Worker Foundations workflow module split.
  - Refactoring the local-runner Worker installer before its Effect migration.
  - Validating generated Worker templates, proof commands, license activation, or kickoff behavior.
---

# Worker Workflow Module Split

This document is a living execution plan for splitting the Worker Foundations install workflow into smaller behavior-preserving modules.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

`packages/local-runner/src/workflows/worker-foundations-install/workflow.ts` is the largest remaining local-runner migration risk. It mixes preflight inspection, license activation, install planning, file application, proof execution, report rendering, generated Worker templates, kickoff, Git operations, and low-level utilities in one file. The next Effect migration would be hard to review if it also moved that behavior around. This slice should split the file into feature-local modules without changing the generated Worker contract or current command behavior, leaving the later Effect migration with clear module ownership.

## Progress

- [x] 2026-05-13: Read root instructions, `docs/exec-plans/PLANS.md`, `docs/programs/PROGRAMS.md`, the active Program packet, planning brief 5, `worker-foundations-install/workflow.ts`, `manifest.ts`, and focused Worker installer tests.
- [x] 2026-05-13: Ran focused baseline Worker installer, compatibility smoke, and package smoke tests.
- [x] 2026-05-13: Extracted shared Worker install types/constants into feature-local modules without changing public workflow entry points.
- [x] 2026-05-13: Extracted repository inspection, license activation, install planning, apply, proof/report, generated templates, kickoff, confirmation, environment, result, and utility modules in small validated steps.
- [x] 2026-05-13: Ran focused Worker installer tests after each extraction group, then ran local-runner package validation and docs validation.
- [x] 2026-05-13: Updated this ExecPlan and the Program packet with evidence before marking the slice complete.

## Surprises & Discoveries

The current `workflow.ts` file is 4,008 lines. The existing function layout already groups most responsibilities in a usable order: entrypoint and orchestration first, then inspection/license, planning, apply, proof/report/kickoff, generated template renderers, JSON/package-manager/Git helpers, environment helpers, and managed-block utilities. This makes a move-only module split feasible if exports are kept narrow and tests stay outcome-focused.

## Decision Log

Decision: Split modules before migrating this workflow to Effect.

Rationale: The Worker installer changes generated files, runs proof commands, manages license activation, and can commit target-repo changes. A behavior-preserving structural split makes the later Effect migration reviewable.

Date: 2026-05-13.

Decision: Keep `runWorkerFoundationsInstall` and its exported option/result types stable in `workflow.ts`.

Rationale: Current command callers import the workflow entry point directly. This slice should not force command rewrites or change the public API.

Date: 2026-05-13.

## Outcomes & Retrospective

This plan is complete. `workflow.ts` is now a smaller orchestration layer backed by feature-local modules under `packages/local-runner/src/workflows/worker-foundations-install/`. The public `runWorkerFoundationsInstall`, `WorkerInstallOptions`, and `WorkerInstallResult` entry points remain stable. Focused Worker installer tests, compatibility smoke, package smoke, local-runner static checks, and docs validation passed. No generated Worker output, license semantics, kickoff semantics, package-manager behavior, or Node runtime plus Bun package-management contract was intentionally changed.

## Context and Orientation

`packages/local-runner/src/workflows/worker-foundations-install/workflow.ts` exports `runWorkerFoundationsInstall`, `WorkerInstallOptions`, and `WorkerInstallResult`. The command layer calls this entry point through `packages/local-runner/src/commands/install.ts`.

`packages/local-runner/src/workflows/worker-foundations-install/manifest.ts` owns durable workflow constants such as workflow id, bundle version, install branch, root script names, proof script names, license environment variables, and the Worker Codex profile name.

The focused behavioral backstop is `packages/local-runner/tests/worker-foundations-install.test.ts`. Compatibility and packaging backstops are `packages/local-runner/tests/worker-install-compatibility-smoke.ts` and `packages/local-runner/tests/package-smoke.ts`.

### In Scope

This slice covers `packages/local-runner/src/workflows/worker-foundations-install/` and focused tests under `packages/local-runner/tests/` only when needed to keep behavior pinned. It should create modules for shared types, inspection, license activation, planning, apply/write operations, proof and reports, generated Worker templates, kickoff, and local utilities as needed.

### Out Of Scope

This slice does not migrate the Worker installer to Effect, change generated Worker files intentionally, change package-manager defaults, change license activation semantics, change kickoff behavior, migrate Program run loop or command wrappers, alter customer-facing setup docs, or import runtime code from `repos/effect/`. Bun remains the workspace package manager and validation runner; Node remains the shipped local-runner and generated Worker runtime.

## Plan of Work

First, run the focused baseline command for Worker installer behavior, compatibility smoke, and package smoke. Record the exact results in this plan before making code changes.

Second, extract shared internal types and small constants that multiple modules need. Keep `WorkerInstallOptions` and `WorkerInstallResult` exported from `workflow.ts`, either by defining them there or re-exporting them from a local types module. Avoid exporting implementation details outside the workflow directory unless current callers already need them.

Third, extract pure planning and template-rendering code. These modules should be easiest to move because they mostly consume plain inputs and return plan objects or strings. After this step, run the focused Worker installer test file.

Fourth, extract repository inspection, license activation, apply/write operations, proof/report, kickoff, and utility modules. Move one cluster at a time, keep names domain-specific, and run focused tests after each cluster that touches behavior-heavy code.

Fifth, leave `workflow.ts` as the orchestration layer that wires the extracted modules together. It should still read as the workflow sequence: resolve repo, inspect, optionally activate license, build plan, handle dry-run/blockers/confirmation, prepare branch, apply, dogfood, proof, report, commit, kickoff, sync event.

Sixth, run local-runner format, lint, typecheck, build, focused Worker tests, package smoke, compatibility smoke, ExecPlan lint, Program lint, markdown lint, and scoped whitespace checks. Update this ExecPlan and the Program packet with exact evidence before completion.

## Milestones

Milestone 1 proves the baseline. Success means the focused Worker installer, compatibility smoke, and package smoke tests pass before any extraction.

Milestone 2 proves pure module extraction. Success means planning and generated template functions move into separate modules while generated refs, package scripts, report contents, and existing tests stay unchanged.

Milestone 3 proves I/O-adjacent module extraction. Success means inspection, license activation, apply/write, proof/report, kickoff, Git helpers, and managed-block utilities move behind narrow local imports while the Worker installer tests still pass.

Milestone 4 proves integration and documentation. Success means focused and package validation pass, `workflow.ts` is materially smaller and orchestration-focused, and this ExecPlan plus the Program packet record final evidence and the next Effect migration state.

## Concrete Steps

Work from `/Users/bazelrex/Developer/ship-by-sunday`.

Run the baseline focused checks:

    bun run --cwd packages/local-runner test -- worker-foundations-install worker-install-compatibility-smoke package-smoke
    bun run --cwd packages/local-runner worker:compatibility-smoke
    bun run --cwd packages/local-runner build && bun run --cwd packages/local-runner package:smoke

Inspect the current module shape:

    rg --line-number '^export |^function |^async function |^type |^const ' packages/local-runner/src/workflows/worker-foundations-install/workflow.ts

After each extraction group, run at least:

    bun run --cwd packages/local-runner test -- worker-foundations-install

Before completing this plan, run:

    bun run --cwd packages/local-runner test -- worker-foundations-install
    bun run --cwd packages/local-runner worker:compatibility-smoke
    bun run --cwd packages/local-runner build && bun run --cwd packages/local-runner package:smoke
    bun run --cwd packages/local-runner format:check
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner build
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-worker-workflow-module-split.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-worker-workflow-module-split.md docs/programs/completed/2026-05-13-local-runner-node-effect-migration
    git diff --check -- docs/exec-plans/completed/2026-05-13-worker-workflow-module-split.md docs/programs/completed/2026-05-13-local-runner-node-effect-migration packages/local-runner/src/workflows/worker-foundations-install packages/local-runner/tests/worker-foundations-install.test.ts packages/local-runner/tests/worker-install-compatibility-smoke.ts packages/local-runner/tests/package-smoke.ts

## Validation and Acceptance

Feature: behavior-preserving Worker Foundations workflow module split.

Risk: P1 core product. The installer creates generated Worker files, runs proof commands, writes local proof, can activate licenses, can commit target repository changes, and can start Codex kickoff. This slice should not change behavior, but the blast radius is high enough that focused installer tests and package smoke are required.

Source of truth: generated file contents, install result JSON/report shape, proof command statuses, target repository Git state, license file behavior, queued/synced runner events, and focused smoke tests.

Must work: dry-run preview, install happy path, grouped confirmation, noninteractive blocks, package-manager detection, legacy Bun cleanup, managed-file conflict detection, license validation/activation, dogfood child plan writer, proof command execution, report writes, commit handling, kickoff handling, event sync/queue behavior, compatibility smoke, and package smoke.

Must fail safely: missing Git repo, dirty worktree, missing Node, missing package-manager command, missing or invalid license, untrusted Codex project, unrecognized package scripts, unrecognized managed files, incomplete/duplicate managed markers, proof failure, kickoff failure, and runner event sync failure.

Tests: focused Worker installer tests after each extraction group, then package smoke, compatibility smoke, local-runner format, lint, typecheck, build, plan lint, Program lint, markdown lint, and scoped whitespace checks.

CI gate: local-runner package validation plus plan and Program docs validation for this slice.

### Test Commands

Run these commands before completing this plan:

    bun run --cwd packages/local-runner test -- worker-foundations-install
    bun run --cwd packages/local-runner worker:compatibility-smoke
    bun run --cwd packages/local-runner build && bun run --cwd packages/local-runner package:smoke
    bun run --cwd packages/local-runner format:check
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner build
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-worker-workflow-module-split.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-worker-workflow-module-split.md docs/programs/completed/2026-05-13-local-runner-node-effect-migration
    git diff --check -- docs/exec-plans/completed/2026-05-13-worker-workflow-module-split.md docs/programs/completed/2026-05-13-local-runner-node-effect-migration packages/local-runner/src/workflows/worker-foundations-install packages/local-runner/tests/worker-foundations-install.test.ts packages/local-runner/tests/worker-install-compatibility-smoke.ts packages/local-runner/tests/package-smoke.ts

## Idempotence and Recovery

This split should be move-only whenever possible. If a focused test fails after a module extraction, compare the moved function against the original behavior and fix the import or preserved state before starting another cluster. Do not change generated Worker output to make tests pass unless the ExecPlan records a real pre-existing bug and the focused tests prove the intended behavior. The worktree may contain unrelated dirty files; scope staging and commits to this plan only.

## Artifacts and Notes

Research sources read before implementation:

    docs/exec-plans/PLANS.md
    docs/programs/PROGRAMS.md
    docs/programs/completed/2026-05-13-local-runner-node-effect-migration/program.md
    docs/programs/completed/2026-05-13-local-runner-node-effect-migration/planning-brief-5.md
    packages/local-runner/src/workflows/worker-foundations-install/workflow.ts
    packages/local-runner/src/workflows/worker-foundations-install/manifest.ts
    packages/local-runner/tests/worker-foundations-install.test.ts
    packages/local-runner/tests/worker-install-compatibility-smoke.ts
    packages/local-runner/tests/package-smoke.ts

Module split implementation artifacts:

    packages/local-runner/src/workflows/worker-foundations-install/workflow.ts
    packages/local-runner/src/workflows/worker-foundations-install/apply.ts
    packages/local-runner/src/workflows/worker-foundations-install/confirmation.ts
    packages/local-runner/src/workflows/worker-foundations-install/constants.ts
    packages/local-runner/src/workflows/worker-foundations-install/env.ts
    packages/local-runner/src/workflows/worker-foundations-install/inspection.ts
    packages/local-runner/src/workflows/worker-foundations-install/kickoff.ts
    packages/local-runner/src/workflows/worker-foundations-install/license.ts
    packages/local-runner/src/workflows/worker-foundations-install/plan.ts
    packages/local-runner/src/workflows/worker-foundations-install/privacy.ts
    packages/local-runner/src/workflows/worker-foundations-install/proof.ts
    packages/local-runner/src/workflows/worker-foundations-install/report.ts
    packages/local-runner/src/workflows/worker-foundations-install/result.ts
    packages/local-runner/src/workflows/worker-foundations-install/templates.ts
    packages/local-runner/src/workflows/worker-foundations-install/types.ts
    packages/local-runner/src/workflows/worker-foundations-install/utils.ts

`workflow.ts` now owns the public orchestration sequence only. The extracted modules own apply/write operations, confirmation, shared constants, environment construction, repository inspection, kickoff, license activation, install planning, privacy boundary construction, proof execution, report rendering, result finalization, generated templates, shared types, and local utility helpers.

Baseline validation evidence from 2026-05-13:

    bun run --cwd packages/local-runner test -- worker-foundations-install
    Test Files  1 passed (1)
    Tests  36 passed (36)

    bun run --cwd packages/local-runner worker:compatibility-smoke
    worker install compatibility smoke passed (11 scenarios)

    bun run --cwd packages/local-runner build && bun run --cwd packages/local-runner package:smoke
    dist/cli.js  1.7mb
    package smoke passed

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-13-worker-workflow-module-split.md
    docs/exec-plans/active/2026-05-13-worker-workflow-module-split.md: ok

    bun run programs:lint
    local-runner-node-effect-migration: ok

    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-13-worker-workflow-module-split.md docs/programs/completed/2026-05-13-local-runner-node-effect-migration
    docs/exec-plans/active/2026-05-13-worker-workflow-module-split.md: ok
    docs/programs/completed/2026-05-13-local-runner-node-effect-migration/program.md: ok

Final validation evidence from 2026-05-13:

    bun run --cwd packages/local-runner test -- worker-foundations-install
    Test Files  1 passed (1)
    Tests  36 passed (36)

    bun run --cwd packages/local-runner worker:compatibility-smoke
    worker install compatibility smoke passed (11 scenarios)

    bun run --cwd packages/local-runner build && bun run --cwd packages/local-runner package:smoke
    dist/cli.js  1.7mb
    package smoke passed

    bun run --cwd packages/local-runner format:check
    All matched files use the correct format.

    bun run --cwd packages/local-runner lint
    Found 0 warnings and 0 errors.

    bun run --cwd packages/local-runner typecheck
    exited with code 0

    bun run --cwd packages/local-runner build
    dist/cli.js  1.7mb
    Done

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-worker-workflow-module-split.md
    docs/exec-plans/completed/2026-05-13-worker-workflow-module-split.md: ok

    bun run programs:lint
    local-runner-node-effect-migration: ok

    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-worker-workflow-module-split.md docs/programs/completed/2026-05-13-local-runner-node-effect-migration
    docs/exec-plans/completed/2026-05-13-worker-workflow-module-split.md: ok
    docs/programs/completed/2026-05-13-local-runner-node-effect-migration/program.md: ok

    git diff --cached --check
    exited with code 0

## Interfaces and Dependencies

Keep production imports inside `packages/local-runner/src/workflows/worker-foundations-install/` local to the workflow package. Current external callers should continue importing from `packages/local-runner/src/workflows/worker-foundations-install/workflow.ts`. Use existing local-runner helpers such as `runBoundedProcess`, Codex config manager helpers, runner events, local runner home, repository root resolution, and redaction assertions. Do not introduce new dependencies for a structural module split.
