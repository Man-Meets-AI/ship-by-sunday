---
title: Worker Workflow Effect Migration
status: complete
created_at: 2026-05-13
completed_at: 2026-05-13
summary: Migrate the Worker Foundations installer result/event sync boundary to Effect while preserving the public promise API.
post_build_recap: "`finishAndMaybeSyncResult` now runs through `finishAndMaybeSyncResultEffect`, using injected runner-home and runner-event services for credential lookup, queue, and flush. A focused Worker test proves service injection without touching a real runner home or event outbox."
program_id: local-runner-node-effect-migration
planning_brief: docs/programs/active/2026-05-13-local-runner-node-effect-migration/planning-brief-6.md
read_when:
  - Resuming the Worker workflow Effect migration.
  - Migrating Worker Foundations install I/O boundaries after the module split.
  - Validating Worker installer process, filesystem, license, kickoff, proof, report, or event-sync behavior.
---

# Worker Workflow Effect Migration

This document is a living execution plan for migrating the split Worker Foundations installer modules to Effect.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The Worker Foundations installer is now split into feature-local modules, but its orchestration still calls promise helpers directly. This slice introduced Effect at the Worker workflow result/event sync boundary, where existing runner-home and runner-event services make dependency injection useful without changing the public `runWorkerFoundationsInstall` promise API.

The migration must stay behavior-preserving. Generated Worker files, package-manager defaults, license semantics, kickoff behavior, report shape, and the Node runtime plus Bun package-management contract should not change.

## Progress

- [x] 2026-05-13: Opened this ExecPlan from planning brief 6 after completing the Worker workflow module split.
- [x] 2026-05-13: Mapped the split Worker workflow modules and chose result/event sync as the smallest high-value Effect boundary.
- [x] 2026-05-13: Added `finishAndMaybeSyncResultEffect` while preserving the existing promise adapter.
- [x] 2026-05-13: Added a focused Worker installer test that injects runner-home and runner-event services without touching a real runner home or event outbox.
- [x] 2026-05-13: Ran focused Worker installer tests, compatibility smoke, package smoke, local-runner static checks, and docs validation.
- [x] 2026-05-13: Updated this ExecPlan and the Program packet with evidence before marking the slice complete.

## Surprises & Discoveries

The result/event sync path was the smallest useful Worker workflow boundary because it already depended on completed Effect services. Migrating it gave the Worker workflow an injected service proof without changing proof command execution, generated file writes, license activation, or kickoff behavior in the same slice.

## Decision Log

Decision: Keep `runWorkerFoundationsInstall` as the public promise-returning entry point during this slice.

Rationale: Current command callers already depend on this API. Effect can improve internals without forcing command orchestration to migrate before the lower-level Worker workflow boundaries are ready.

Date: 2026-05-13.

Decision: Keep pure template rendering and deterministic plan construction as ordinary TypeScript unless a concrete benefit appears.

Rationale: Effect is most valuable at external I/O and lifecycle boundaries. Wrapping generated-template string rendering would add ceremony without improving failures, cancellation, resource cleanup, or test injection.

Date: 2026-05-13.

Decision: Migrate result/event sync before process, filesystem, or license activation boundaries.

Rationale: Worker install event sync already had Effect-backed runner-home and runner-event services available. This made it possible to prove Worker workflow service injection with a small diff and without changing generated Worker output, process execution, license activation, or target-repo write behavior.

Date: 2026-05-13.

## Outcomes & Retrospective

This plan is complete. `packages/local-runner/src/workflows/worker-foundations-install/result.ts` now exposes `finishAndMaybeSyncResultEffect` and keeps `finishAndMaybeSyncResult` as the promise adapter. The migrated boundary uses injected `LocalRunnerHomeService` and `RunnerEventService` dependencies to read credentials, queue install events, and flush the event outbox. Focused Worker tests now include an injected-service proof, and generated Worker output plus command results remain unchanged.

## Context and Orientation

`packages/local-runner/src/workflows/worker-foundations-install/workflow.ts` is now the orchestration entry point. The split modules live in the same directory:

- `inspection.ts`: repository inspection and package/runtime detection
- `license.ts`: Worker license validation and activation HTTP flow
- `apply.ts`: target-repo writes, branch preparation, managed files, and legacy cleanup
- `proof.ts`: dogfood child plan, proof process execution, and local proof write
- `report.ts`: install report rendering and writes
- `kickoff.ts`: commit, tracked report amendment, and Codex kickoff
- `result.ts`: result assembly and runner event sync
- `templates.ts`: generated Worker file contents
- `plan.ts`, `privacy.ts`, `env.ts`, `confirmation.ts`, `constants.ts`, `types.ts`, and `utils.ts`: deterministic planning, privacy, environment, confirmation, shared constants/types, and helpers

Existing Effect service surfaces are already available in `packages/local-runner/src/core/`: bounded process execution, Codex execution, runner events, workflow-run API calls, repository boundary helpers, local project state, local runner home, doctor artifacts, and Codex config management.

### In Scope

This slice covers `packages/local-runner/src/workflows/worker-foundations-install/` and focused tests under `packages/local-runner/tests/` when needed. It may use existing Effect services from `packages/local-runner/src/core/` and add Worker workflow-local Effect helpers or services when they make a boundary injectable and testable.

### Out Of Scope

This slice does not migrate Program run loop, daemon, one-shot commands, CLI command wrappers, repo-wide package management, generated Worker output, or customer setup docs. It does not import runtime code from `repos/effect/`. It does not change the public command API.

## Plan of Work

First, inspect the split Worker modules and list I/O boundaries. Choose the smallest high-value boundary that can prove the pattern without touching the whole installer.

Second, migrate that boundary behind an Effect helper and, where useful, a service tag. Preserve the current promise-returning wrapper used by `workflow.ts` or keep `workflow.ts` as the only adapter if the helper is internal.

Third, add focused tests that verify behavior is unchanged and that the new service can be injected without touching a real process, network, repository, or user home.

Fourth, repeat for a second adjacent boundary only if it stays narrow and shares the same validation surface. Do not migrate the whole Worker installer in one pass.

Fifth, run focused Worker tests, compatibility smoke, package smoke, local-runner static checks, docs validation, and scoped whitespace checks. Update this ExecPlan and the Program packet with evidence before completion.

## Milestones

Milestone 1 maps the split Worker workflow I/O boundaries. Success means this plan records the selected boundary and why it is small enough for this slice.

Milestone 2 proves the first Effect boundary. Success means an injected test can replace the live boundary and current behavior still passes.

Milestone 3 proves integration. Success means focused Worker tests, compatibility smoke, package smoke, local-runner static checks, and docs validation pass.

## Concrete Steps

Work from `/Users/bazelrex/Developer/ship-by-sunday`.

Map Worker workflow I/O boundaries:

    rg --line-number "runBoundedProcess|fetch|writeFile|readFile|mkdir|rm|rename|applyShipbysundayWorkerCodexConfigPatch|queueRunnerEvent|flushRunnerEvents|exec" packages/local-runner/src/workflows/worker-foundations-install

Run the focused baseline:

    bun run --cwd packages/local-runner test -- worker-foundations-install

After implementation, run:

    bun run --cwd packages/local-runner test -- worker-foundations-install
    bun run --cwd packages/local-runner worker:compatibility-smoke
    bun run --cwd packages/local-runner build && bun run --cwd packages/local-runner package:smoke
    bun run --cwd packages/local-runner format:check
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner build
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-worker-workflow-effect-migration.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-worker-workflow-effect-migration.md docs/programs/active/2026-05-13-local-runner-node-effect-migration
    git diff --check -- docs/exec-plans/completed/2026-05-13-worker-workflow-effect-migration.md docs/programs/active/2026-05-13-local-runner-node-effect-migration packages/local-runner/src/workflows/worker-foundations-install packages/local-runner/tests/worker-foundations-install.test.ts

## Validation and Acceptance

Feature: Worker Foundations workflow Effect migration.

Risk: P1 core product. The Worker installer writes target-repo files, runs proof commands, may activate licenses, may commit changes, may start Codex kickoff, and syncs runner events. This slice should preserve behavior but touches high-blast-radius orchestration.

Source of truth: generated file contents, install result JSON/report shape, proof command statuses, target repository Git state, license behavior, kickoff behavior, runner event sync or queue state, compatibility smoke, and package smoke.

Must work: dry-run preview, install happy path, grouped confirmation, noninteractive blocks, package-manager detection, legacy Bun cleanup, managed-file conflict detection, license validation/activation, proof command execution, report writes, commit handling, kickoff handling, event sync/queue behavior, compatibility smoke, and package smoke.

Must fail safely: missing Git repo, dirty worktree, missing Node, missing package-manager command, missing or invalid license, untrusted Codex project, unrecognized package scripts, unrecognized managed files, proof failure, kickoff failure, runner event sync failure, process timeout, missing executable, and cancellation.

Tests: focused Worker installer tests, at least one injection-focused test for a migrated Worker boundary, compatibility smoke, package smoke, local-runner format, lint, typecheck, build, plan lint, Program lint, markdown lint, and scoped whitespace checks.

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
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-worker-workflow-effect-migration.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-worker-workflow-effect-migration.md docs/programs/active/2026-05-13-local-runner-node-effect-migration
    git diff --check -- docs/exec-plans/completed/2026-05-13-worker-workflow-effect-migration.md docs/programs/active/2026-05-13-local-runner-node-effect-migration packages/local-runner/src/workflows/worker-foundations-install packages/local-runner/tests/worker-foundations-install.test.ts

## Idempotence and Recovery

This migration should stay incremental. If a migrated boundary changes test output, preserve the old behavior first and only then decide whether a separate bug fix is warranted. Do not change generated Worker templates, report shape, package-manager defaults, or license/kickoff semantics as part of converting control flow to Effect.

## Artifacts and Notes

Research sources read before implementation:

    docs/programs/active/2026-05-13-local-runner-node-effect-migration/planning-brief-6.md
    docs/programs/active/2026-05-13-local-runner-node-effect-migration/program.md
    docs/exec-plans/completed/2026-05-13-worker-workflow-module-split.md
    packages/local-runner/src/workflows/worker-foundations-install/
    packages/local-runner/tests/worker-foundations-install.test.ts

Implementation artifacts:

    packages/local-runner/src/workflows/worker-foundations-install/result.ts
    packages/local-runner/tests/worker-foundations-install.test.ts

Validation evidence from 2026-05-13:

    bun run --cwd packages/local-runner test -- worker-foundations-install
    Test Files  1 passed (1)
    Tests  37 passed (37)

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

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-worker-workflow-effect-migration.md
    docs/exec-plans/completed/2026-05-13-worker-workflow-effect-migration.md: ok

    bun run programs:lint
    local-runner-node-effect-migration: ok

    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-worker-workflow-effect-migration.md docs/programs/active/2026-05-13-local-runner-node-effect-migration
    docs/exec-plans/completed/2026-05-13-worker-workflow-effect-migration.md: ok
    docs/programs/active/2026-05-13-local-runner-node-effect-migration/program.md: ok

## Interfaces and Dependencies

Production code must import published packages only. `repos/effect/` remains read-only reference material. Existing command callers should continue importing `runWorkerFoundationsInstall`, `WorkerInstallOptions`, and `WorkerInstallResult` from `packages/local-runner/src/workflows/worker-foundations-install/workflow.ts`.
