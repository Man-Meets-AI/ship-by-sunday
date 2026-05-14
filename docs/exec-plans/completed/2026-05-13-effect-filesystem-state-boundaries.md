---
title: Effect Filesystem State Boundaries
status: complete
created_at: 2026-05-13
completed_at: 2026-05-13
summary: Move local-runner filesystem state helpers behind injectable Effect services while preserving current promise APIs and repository safety behavior.
post_build_recap: Local project state, runner-home credentials, repository path safety, Codex config files, and doctor artifacts now expose injectable Effect services while existing promise APIs and focused behavior tests remain green.
program_id: local-runner-node-effect-migration
planning_brief: docs/programs/active/2026-05-13-local-runner-node-effect-migration/planning-brief-4.md
read_when:
  - Resuming the local-runner filesystem state Effect migration slice.
  - Validating local .sbs state, runner-home credentials, repository boundaries, Codex config, or doctor artifacts.
  - Checking the next local-runner Effect boundary before Worker installer work.
---

# Effect Filesystem State Boundaries

This document is a living execution plan for migrating local-runner filesystem state helpers to Effect after the process, Codex, event, and workflow API boundaries.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The local-runner now has Effect service boundaries for process execution, Codex execution, runner event delivery, and workflow-run API calls. The next useful step is to move the shared filesystem state helpers behind injectable Effect services, so later orchestration and Worker installer slices can test stateful behavior without touching a real home directory or repository. After this slice, current commands should still call promise-returning functions, while tests and future Effect orchestration can inject local project state, runner-home credentials, repository path safety, Codex config, and doctor artifact behavior.

## Progress

- [x] 2026-05-13: Read root instructions, `docs/exec-plans/PLANS.md`, `docs/programs/PROGRAMS.md`, the Program packet, planning brief 4, and current filesystem-state target files.
- [x] 2026-05-13: Ran focused baseline tests for local state, Codex config, doctor-pass artifacts, setup checks, and already migrated lower-level Effect boundaries.
- [x] 2026-05-13: Implemented `RepositoryBoundaryService`, `NodeRepositoryBoundaryServiceLive`, repository Effect helpers, and behavior-preserving promise adapters.
- [x] 2026-05-13: Implemented `LocalProjectStateService`, `NodeLocalProjectStateServiceLive`, local project state Effect helpers, and behavior-preserving promise adapters.
- [x] 2026-05-13: Implemented `LocalRunnerHomeService`, `DoctorArtifactService`, their live Node layers, Effect helpers, and behavior-preserving promise adapters.
- [x] 2026-05-13: Implemented `CodexConfigService`, `NodeCodexConfigServiceLive`, Codex config Effect helpers, and behavior-preserving promise adapters.
- [x] 2026-05-13: Ran focused and full local-runner validation plus plan, Program, markdown, and whitespace checks; then updated this ExecPlan and the Program packet with evidence.

## Surprises & Discoveries

The existing filesystem helpers contain safety behavior that is clearer to preserve with local Node `fs/promises` wrappers than by forcing a platform filesystem rewrite in the same slice. Repository symlink refusal, `.git/info/exclude` updates, atomic temp-file writes, credential locking, Codex config backups, and existing error messages stayed behind live Node services while Effect helpers made the boundaries injectable for tests and later orchestration.

The bundled local-runner bin remains a single Node-targeted file and reported `dist/cli.js  1.7mb` after this slice, matching the previous post-process-boundary bundle size class. Later slices should keep watching bundle growth before adopting broader platform modules.

## Decision Log

Decision: Keep existing promise-returning exports as adapters in this slice.

Rationale: Current commands and workflows already call these helpers directly. The slice should create injectable Effect boundaries without forcing command orchestration or Worker installer rewrites.

Date: 2026-05-13.

Decision: Preserve Node `fs/promises` implementations behind services first.

Rationale: The current helpers include repository-specific symlink checks, atomic write patterns, backup files, and exact error messages. A local Effect service around the existing Node implementation is the smallest safe step; later slices can adopt broader `@effect/platform/FileSystem` APIs where that improves behavior without losing parity.

Date: 2026-05-13.

## Outcomes & Retrospective

This plan is complete. `repository-boundary.ts`, `local-project-state.ts`, `local-runner-home.ts`, `doctor-pass/artifacts.ts`, and `codex-config-manager.ts` now follow the local-runner Effect boundary pattern: exported service tag, live Node layer, direct Effect helper, and current promise adapter. Focused tests prove service injection for repository writes, local project state reads/writes, runner-home credentials, doctor artifacts, and Codex config inspection/preview. The existing behavior tests continue to cover repository-local `.sbs` state, runner-home credential storage, Codex config patching and rollback, doctor artifacts, setup checks, process execution, Codex execution, runner events, and workflow-run API behavior.

The slice intentionally did not split the Worker installer, migrate command orchestration, change generated Worker output, or change the Node runtime plus Bun package-management contract.

## Context and Orientation

`packages/local-runner/src/core/local-project-state.ts` owns repository-local `.sbs` state such as `state.json`, daemon status, Codex thread state, and daemon stop flags. It also updates `.git/info/exclude` so local `.sbs/` state remains untracked.

`packages/local-runner/src/core/local-runner-home.ts` owns runner-home credential storage under `~/.ship-by-sunday` or `SBS_LOCAL_RUNNER_HOME`. It reads and writes credential files atomically and validates their JSON shape.

`packages/local-runner/src/core/repository-boundary.ts` owns repository-relative path normalization, symlink refusal, directory creation inside the repository, and repository-safe writes.

`packages/local-runner/src/core/codex-config-manager.ts` owns Codex config inspection, managed block rendering, patch previews, backup writes, apply, and rollback behavior.

`packages/local-runner/src/core/doctor-pass/artifacts.ts` owns doctor-pass artifact directory construction plus JSON artifact reads and atomic writes.

### In Scope

This slice covers `packages/local-runner/src/core/local-project-state.ts`, `packages/local-runner/src/core/local-runner-home.ts`, `packages/local-runner/src/core/repository-boundary.ts`, `packages/local-runner/src/core/codex-config-manager.ts`, `packages/local-runner/src/core/doctor-pass/artifacts.ts`, and focused tests under `packages/local-runner/tests/`.

### Out Of Scope

This slice does not split or migrate the Worker Foundations installer, migrate Program run loop or command wrappers, change generated Worker output, change package-manager behavior, change Codex profile semantics, change customer docs, or import runtime code from `repos/effect/`. The runtime contract remains Node for the shipped runner and Bun for workspace package management and validation commands.

## Plan of Work

First, run the focused baseline tests for `local-state`, `codex-config-manager`, `doctor-pass`, `setup-check`, and the already migrated lower-level boundaries. This records starting behavior before the filesystem-state refactor.

Second, add service tags, live Node layers, and Effect helpers for repository boundary and local project state. Keep current promise APIs in place and route them through the live service. Add injection tests that prove local project state behavior can be replaced without touching disk, while existing tests continue to prove real filesystem behavior.

Third, add the same service boundary pattern for runner-home credentials and doctor artifacts. Preserve atomic write behavior, malformed JSON failures, credential lookup behavior, and artifact path shape.

Fourth, add the Codex config service boundary. Preserve inspection, preview, apply, rollback, backup, malformed TOML, and missing-file behavior. Add a direct injection test and keep focused config tests outcome-based.

Fifth, run focused tests after each boundary group. After all groups are complete, run local-runner format, lint, typecheck, build, full local-runner tests if feasible, ExecPlan lint, Program lint, markdown lint, and scoped whitespace checks. Update `Progress`, `Surprises & Discoveries`, `Decision Log`, `Artifacts and Notes`, and the Program packet with exact evidence before marking this plan complete.

## Milestones

Milestone 1 proves repository boundary and local project state services. Success means state directory creation, `.git/info/exclude` updates, state read/write, daemon status, Codex thread state, and daemon stop flags still behave the same, and tests can inject the local project state boundary.

Milestone 2 proves runner-home and doctor artifact services. Success means credential file read/write behavior and doctor artifact JSON read/write behavior remain unchanged, malformed JSON still fails clearly, and tests can inject those boundaries.

Milestone 3 proves Codex config services. Success means config inspection, patch preview, apply, rollback, backup behavior, and malformed config handling remain unchanged, and tests can inject Codex config behavior.

Milestone 4 proves integration and documentation. Success means focused tests plus package validation pass, and the ExecPlan plus Program packet record exact evidence and next slice state.

## Concrete Steps

Work from `/Users/bazelrex/Developer/ship-by-sunday`.

Run the baseline focused checks:

    bun run --cwd packages/local-runner test -- local-state codex-config-manager doctor-pass setup-check bounded-process codex-exec-runner runner-events workflow-run-api

Implement repository boundary and local project state services, then run:

    bun run --cwd packages/local-runner test -- local-state runner-events codex-exec-runner

Implement runner-home and doctor artifact services, then run:

    bun run --cwd packages/local-runner test -- doctor-pass setup-check runner-events

Implement Codex config services, then run:

    bun run --cwd packages/local-runner test -- codex-config-manager setup-check doctor-pass

Run package validation:

    bun run --cwd packages/local-runner format:check
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner build

Validate this plan and Program packet:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-effect-filesystem-state-boundaries.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-effect-filesystem-state-boundaries.md docs/programs/active/2026-05-13-local-runner-node-effect-migration
    git diff --check -- docs/exec-plans/completed/2026-05-13-effect-filesystem-state-boundaries.md docs/programs/active/2026-05-13-local-runner-node-effect-migration packages/local-runner/src/core/local-project-state.ts packages/local-runner/src/core/local-runner-home.ts packages/local-runner/src/core/repository-boundary.ts packages/local-runner/src/core/codex-config-manager.ts packages/local-runner/src/core/doctor-pass/artifacts.ts packages/local-runner/tests/local-state.test.ts packages/local-runner/tests/codex-config-manager.test.ts packages/local-runner/tests/doctor-pass.test.ts packages/local-runner/tests/setup-check.test.ts

## Validation and Acceptance

Feature: Effect-backed filesystem state boundaries for local-runner.

Risk: P2 normal product internals. These helpers affect local runner setup, pairing, doctor passes, Codex execution, event delivery, and future orchestration, but the slice preserves current promise APIs and does not touch billing, auth, generated Worker output, customer setup, package management, or database migrations.

Source of truth: focused tests for `local-state`, `codex-config-manager`, `doctor-pass`, and `setup-check`, plus local-runner format, lint, typecheck, build, and plan/Program docs validation.

Must work: repository path safety still rejects invalid paths and symlinks, local `.sbs` state still reads and writes atomically where it did before, runner credentials still read and write with the same shape, Codex config preview/apply/rollback keeps existing behavior, and doctor artifacts still read/write JSON with clear failures.

Must fail safely: malformed project state, malformed runner credentials, unsafe repository paths, repository symlinks, malformed Codex TOML, missing Codex backup files, and malformed doctor artifact JSON must remain explicit tested outcomes rather than silent fallbacks.

Tests: focused boundary tests first, then local-runner format, lint, typecheck, build, ExecPlan lint, Program lint, markdown lint, and scoped whitespace checks.

CI gate: local-runner package validation plus plan and Program docs validation for this slice.

### Test Commands

Run these commands before completing this plan:

    bun run --cwd packages/local-runner test -- local-state codex-config-manager doctor-pass setup-check bounded-process codex-exec-runner runner-events workflow-run-api
    bun run --cwd packages/local-runner format:check
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner build
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-effect-filesystem-state-boundaries.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-effect-filesystem-state-boundaries.md docs/programs/active/2026-05-13-local-runner-node-effect-migration
    git diff --check -- docs/exec-plans/completed/2026-05-13-effect-filesystem-state-boundaries.md docs/programs/active/2026-05-13-local-runner-node-effect-migration packages/local-runner/src/core/local-project-state.ts packages/local-runner/src/core/local-runner-home.ts packages/local-runner/src/core/repository-boundary.ts packages/local-runner/src/core/codex-config-manager.ts packages/local-runner/src/core/doctor-pass/artifacts.ts packages/local-runner/tests/local-state.test.ts packages/local-runner/tests/codex-config-manager.test.ts packages/local-runner/tests/doctor-pass.test.ts packages/local-runner/tests/setup-check.test.ts

## Idempotence and Recovery

The service additions should be additive and safe to rerun. Keep promise adapters intact while adding Effect helpers so a failed partial migration can be repaired without changing every caller. Tests should use temporary directories, fake home paths, fake repository roots, and injected services. Do not touch a real user Codex config or runner credential file in focused tests. If a boundary migration fails mid-slice, route the promise adapter back to the existing Node implementation shape while keeping tests that describe the desired outcome.

The worktree may contain unrelated dirty files. Do not reset or revert unrelated changes. Scope staging, validation, and commits to files named by this ExecPlan.

## Artifacts and Notes

Research sources read before implementation:

    docs/exec-plans/PLANS.md
    docs/programs/PROGRAMS.md
    docs/programs/active/2026-05-13-local-runner-node-effect-migration/program.md
    docs/programs/active/2026-05-13-local-runner-node-effect-migration/planning-brief-4.md
    packages/local-runner/src/core/local-project-state.ts
    packages/local-runner/src/core/local-runner-home.ts
    packages/local-runner/src/core/repository-boundary.ts
    packages/local-runner/src/core/codex-config-manager.ts
    packages/local-runner/src/core/doctor-pass/artifacts.ts

Validation evidence from 2026-05-13:

    bun run --cwd packages/local-runner test -- local-state codex-config-manager doctor-pass setup-check bounded-process codex-exec-runner runner-events workflow-run-api
    Test Files  8 passed (8)
    Tests  62 passed (62)

    bun run --cwd packages/local-runner test
    Test Files  27 passed | 2 skipped (29)
    Tests  239 passed | 7 skipped (246)

    bun run --cwd packages/local-runner format:check
    All matched files use the correct format.

    bun run --cwd packages/local-runner lint
    Found 0 warnings and 0 errors.

    bun run --cwd packages/local-runner typecheck
    exited with code 0

    bun run --cwd packages/local-runner build
    dist/cli.js  1.7mb
    Done

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-effect-filesystem-state-boundaries.md
    docs/exec-plans/completed/2026-05-13-effect-filesystem-state-boundaries.md: ok

    bun run programs:lint
    local-runner-node-effect-migration: ok

    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-effect-filesystem-state-boundaries.md docs/programs/active/2026-05-13-local-runner-node-effect-migration
    docs/exec-plans/completed/2026-05-13-effect-filesystem-state-boundaries.md: ok
    docs/programs/active/2026-05-13-local-runner-node-effect-migration/program.md: ok

    git diff --check -- docs/exec-plans/completed/2026-05-13-effect-filesystem-state-boundaries.md docs/programs/active/2026-05-13-local-runner-node-effect-migration packages/local-runner/src/core/local-project-state.ts packages/local-runner/src/core/local-runner-home.ts packages/local-runner/src/core/repository-boundary.ts packages/local-runner/src/core/codex-config-manager.ts packages/local-runner/src/core/doctor-pass/artifacts.ts packages/local-runner/tests/local-state.test.ts packages/local-runner/tests/codex-config-manager.test.ts
    exited with code 0

## Interfaces and Dependencies

Use the published `effect` package for `Effect`, `Context`, and `Layer`. Do not import runtime code from `repos/effect/`.

Each migrated boundary should follow the established local-runner pattern: an exported service tag, a live Node layer, an Effect helper, and a promise adapter that preserves the current export name and behavior. The live Node implementations may keep using `node:fs/promises` when that is the clearest way to preserve atomic writes, path checks, backup behavior, and error messages.
