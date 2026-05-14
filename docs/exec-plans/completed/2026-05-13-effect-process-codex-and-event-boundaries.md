---
title: Effect Process Codex And Event Boundaries
status: complete
created_at: 2026-05-13
completed_at: 2026-05-13
summary: Move Codex execution, runner event delivery, and workflow-run API calls behind injectable Effect services while preserving current promise APIs.
post_build_recap: Codex execution, runner event delivery, and workflow-run API calls now expose injectable Effect services while current promise adapters and focused behavior tests remain green.
program_id: local-runner-node-effect-migration
planning_brief: docs/programs/completed/2026-05-13-local-runner-node-effect-migration/planning-brief-3.md
read_when:
  - Resuming the process, Codex, event, and workflow API Effect migration slice.
  - Validating Codex execution behavior after introducing Effect services.
  - Checking runner event outbox or workflow-run API migration risk.
---

# Effect Process Codex And Event Boundaries

This document is a living execution plan for migrating the next local-runner external I/O boundaries to Effect after the bounded process scaffold.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The local-runner now has published Effect dependencies and a proven bounded-process service. The next useful step is to move the still-hand-rolled Codex execution, runner event delivery, and workflow-run HTTP calls behind injectable Effect services. After this slice, current commands should behave the same, while tests and later orchestration slices can replace Codex, event, and workflow API I/O without spawning real processes, writing real outboxes, or making real network calls.

## Progress

- [x] 2026-05-13: Read root instructions, `docs/exec-plans/PLANS.md`, `docs/programs/PROGRAMS.md`, the active Program packet, the completed scaffold ExecPlan, and `repos/effect/AGENTS.md`.
- [x] 2026-05-13: Researched current runner surfaces in `codex-exec-runner.ts`, `runner-events.ts`, `workflow-run-api.ts`, local state helpers, Worker install workflow, Program orchestration, and focused tests.
- [x] 2026-05-13: Verified relevant published Effect APIs from installed package type definitions and checked OpenAI Codex configuration docs through the OpenAI developer documentation MCP.
- [x] 2026-05-13: Implemented `CodexExecService`, `NodeCodexExecServiceLive`, and `runCodexExecEffect` while preserving `runCodexExec`.
- [x] 2026-05-13: Implemented `RunnerEventService`, `NodeRunnerEventServiceLive`, and Effect queue/read/flush helpers while preserving the current promise APIs.
- [x] 2026-05-13: Implemented `WorkflowRunApiService`, `NodeWorkflowRunApiServiceLive`, and Effect claim/resolve helpers while preserving the current promise APIs.
- [x] 2026-05-13: Ran focused tests, package format, lint, typecheck, and build; then updated this ExecPlan and the Program packet with evidence.

## Surprises & Discoveries

`@effect/platform-node/NodeContext.layer` provides Node command, filesystem, path, terminal, and worker services, but not the HTTP client service. This slice should either keep HTTP behind a local injectable fetch service or explicitly provide a Node or fetch HTTP client layer if it adopts `@effect/platform/HttpClient`.

The current Codex runner has only one direct happy-path test. Higher-level doctor-pass tests cover malformed JSONL behavior indirectly, but this slice should add direct Codex boundary tests for timeout cleanup, spawn failure, non-zero stderr behavior, malformed JSONL, and structured output parse failure before relying on the service from larger orchestration code.

The runner event outbox tests already cover the most important queueing behavior. The migration risk is preserving lock-file and requeue semantics while changing the implementation shape, so tests should stay outcome-focused and avoid asserting implementation details such as exact temporary file names.

The first workflow-run API refactor used bare `Effect.tryPromise`, which wrapped thrown errors as generic unknown failures. That changed existing promise-adapter error messages. The live services now map `tryPromise` failures back to the original thrown value, and `runLocalRunnerEffect` unwraps failed exits with `Cause.squash` so current callers see the same messages.

The bundled local-runner bin grew from 1.6 MB after the first scaffold to 1.7 MB after these additional Effect service imports. The one-file Node bin contract still holds, but later slices should continue watching bundle size when introducing broader platform services.

## Decision Log

Decision: Keep current promise-returning exports as adapters in this slice.

Rationale: The runner has many existing call sites. The goal is to establish injectable Effect boundaries without forcing a broad orchestration rewrite at the same time.

Date: 2026-05-13.

Decision: Prioritize behavior-preserving Node wrappers over forced platform API adoption when parity is uncertain.

Rationale: Codex execution needs stdin, stdout, stderr, non-zero exit, timeout, and process-kill parity. If `@effect/platform/Command` cannot preserve those details cleanly in one pass, a local `Effect.async` service around `spawn` is the smaller safe step.

Date: 2026-05-13.

Decision: Migrate Codex execution, runner events, and workflow-run API calls in one child plan but as separately validated milestones.

Rationale: These boundaries are independent enough to test one at a time, but they are all part of the same next external I/O layer and share the same adapter pattern.

Date: 2026-05-13.

Decision: Preserve thrown error objects when promise adapters run failing Effects.

Rationale: Existing callers and tests assert concrete error messages for workflow packet validation, non-2xx responses, fetch failures, and missing Codex executables. Mapping `Effect.tryPromise` failures back to the original thrown value keeps the new Effect boundary from changing the promise API's observable failure behavior.

Date: 2026-05-13.

## Outcomes & Retrospective

This plan is complete. `codex-exec-runner.ts`, `runner-events.ts`, and `workflow-run-api.ts` now follow the bounded-process scaffold pattern: each boundary has a service tag, a live Node layer, an Effect helper for injection and later orchestration, and a promise adapter for current callers. Focused tests now cover Codex service injection, missing executable failures, non-zero stderr capture, malformed JSONL, malformed structured output, timeout cleanup, runner event service injection, stranded flushing restore, workflow API service injection, resolve behavior, fetch failures, malformed JSON, and non-JSON error bodies. The Worker installer and broader filesystem state migration remain intentionally deferred to later child slices.

## Context and Orientation

`packages/local-runner/src/core/bounded-process.ts` already demonstrates the local pattern: an exported service tag, a live Node layer, an Effect helper for tests and future callers, and a promise adapter for current callers. This slice should extend that pattern to three more boundaries.

`packages/local-runner/src/core/codex-exec-runner.ts` currently uses `spawn` directly. It builds `codex exec --json` arguments, writes the prompt to stdin, collects stdout and stderr strings, kills the child on timeout, parses stdout as JSONL events, extracts a thread id and final agent message, optionally parses structured output JSON, writes `.sbs/runs/codex-thread.json`, and returns `CodexExecRunnerResult`.

`packages/local-runner/src/core/runner-events.ts` currently owns event creation, sync-safe validation, queue writes, outbox reads, lock acquisition, stranded `.flushing` restore, sequential fetch delivery, timeout aborts, and requeue behavior. It is used by setup, daemon, one-shot, Worker install, doctor pass, and workflow commands.

`packages/local-runner/src/core/workflow-run-api.ts` currently owns the `/api/workspace/runner/workflow-runs/claim` and `/resolve` calls. It validates server packets against local workflow contracts before runner code is allowed to execute the job.

### In Scope

This slice covers `packages/local-runner/src/core/codex-exec-runner.ts`, `packages/local-runner/src/core/runner-events.ts`, `packages/local-runner/src/core/workflow-run-api.ts`, and focused tests under `packages/local-runner/tests/`. It may make small runtime scaffold additions under `packages/local-runner/src/effect/` if needed for shared helper functions.

### Out Of Scope

This slice does not split or rewrite the Worker Foundations installer, migrate the broader filesystem-state layer, change generated Worker files, change Codex profile setup, change customer docs, migrate repo package management, or change CLI command behavior beyond internal service injection.

## Plan of Work

First, capture the current baseline by running the focused tests for Codex execution, runner events, workflow-run API, bounded process, and Program run slice. This confirms the starting behavior before implementation.

Second, refactor `packages/local-runner/src/core/codex-exec-runner.ts` to export a `CodexExecService`, a live Node layer, and `runCodexExecEffect`. The live implementation should preserve the existing `spawn` contract inside an Effect boundary. It should kill the child process when timeout or Effect interruption occurs, collect stdout and stderr, return the same `CodexExecRunnerResult` shape, and keep `runCodexExec` as the current promise adapter. Add direct tests for timeout cleanup, spawn failure, non-zero stderr, malformed JSONL, structured-output parse failure, service injection, and the existing happy path.

Third, refactor `packages/local-runner/src/core/runner-events.ts` to export a `RunnerEventService`, live layer, and Effect helpers for queueing, reading, and flushing. Keep `queueRunnerEvent`, `readQueuedRunnerEvents`, and `flushRunnerEvents` as promise adapters. Preserve lock-file behavior, stranded flushing restore, per-event sequential delivery, timeout aborts, and requeue behavior. Extend tests for stranded flushing restore and service injection if those behaviors are not already pinned.

Fourth, refactor `packages/local-runner/src/core/workflow-run-api.ts` to export a `WorkflowRunApiService`, live layer, and Effect helpers for claim and resolve. Keep `claimApprovedWorkflowRun` and `resolveApprovedWorkflowRun` as promise adapters. Preserve existing error messages for non-2xx responses while adding focused tests for fetch rejection, malformed response JSON, and non-JSON error bodies.

Fifth, run focused tests after each boundary lands. After all three boundaries are complete, run local-runner format, lint, typecheck, build, and the docs validation commands for this ExecPlan and the Program packet. Update `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Artifacts and Notes` with exact evidence before marking the plan complete.

## Milestones

Milestone 1 proves the Codex execution boundary. At the end of this milestone, `runCodexExecEffect` can be tested with an injected service, `runCodexExec` still works for existing callers, and the focused Codex tests prove happy path plus important failure modes.

Milestone 2 proves the runner event outbox boundary. At the end of this milestone, queue, read, and flush behavior are available as Effect helpers and current callers still use the same promise exports. Existing event outbox tests should pass with any added stranded-restore and injection coverage.

Milestone 3 proves the workflow-run API boundary. At the end of this milestone, claim and resolve calls are available as Effect helpers, current promise adapters preserve thrown message behavior, and workflow-run API tests cover network and parse failure modes.

Milestone 4 proves integration and documentation. At the end of this milestone, Program runner tests still pass, package validation is green, and the ExecPlan plus Program packet record exact validation evidence.

## Concrete Steps

Work from `/Users/bazelrex/Developer/ship-by-sunday`.

Run the baseline focused checks:

    bun run --cwd packages/local-runner test -- codex-exec-runner runner-events workflow-run-api bounded-process program-run-slice

Implement the Codex service boundary in `packages/local-runner/src/core/codex-exec-runner.ts`, then run:

    bun run --cwd packages/local-runner test -- codex-exec-runner

Implement the runner event service boundary in `packages/local-runner/src/core/runner-events.ts`, then run:

    bun run --cwd packages/local-runner test -- runner-events

Implement the workflow-run API service boundary in `packages/local-runner/src/core/workflow-run-api.ts`, then run:

    bun run --cwd packages/local-runner test -- workflow-run-api

Run integration-oriented focused tests:

    bun run --cwd packages/local-runner test -- program-run-slice bounded-process

Run package validation:

    bun run --cwd packages/local-runner format:check
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner build

Validate the plan and Program packet:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-effect-process-codex-and-event-boundaries.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-effect-process-codex-and-event-boundaries.md docs/programs/completed/2026-05-13-local-runner-node-effect-migration
    git diff --check -- docs/exec-plans/completed/2026-05-13-effect-process-codex-and-event-boundaries.md docs/programs/completed/2026-05-13-local-runner-node-effect-migration packages/local-runner/src/effect/runtime.ts packages/local-runner/src/core/codex-exec-runner.ts packages/local-runner/src/core/runner-events.ts packages/local-runner/src/core/workflow-run-api.ts packages/local-runner/tests/codex-exec-runner.test.ts packages/local-runner/tests/runner-events.test.ts packages/local-runner/tests/workflow-run-api.test.ts

## Validation and Acceptance

Feature: Effect-backed Codex execution, runner event delivery, and workflow-run API boundaries.

Risk: P2 normal product internals. These boundaries affect operational runner workflows, but the slice preserves current public promise APIs and does not touch billing, auth, generated Worker output, customer setup, or database migrations.

Source of truth: focused tests for `codex-exec-runner`, `runner-events`, and `workflow-run-api`, plus integration coverage through `program-run-slice`, typecheck, and build.

Must work: `runCodexExec`, `queueRunnerEvent`, `readQueuedRunnerEvents`, `flushRunnerEvents`, `claimApprovedWorkflowRun`, and `resolveApprovedWorkflowRun` keep current result shapes and thrown messages for current callers. New Effect helpers and services can be injected in tests. Timeouts and interruptions must not leave Codex child processes or event fetches running after the Effect boundary returns.

Must fail safely: missing Codex executable, Codex timeout, non-zero Codex exits, malformed Codex JSONL, malformed structured output, event delivery timeout, event delivery non-2xx, workflow API fetch rejection, malformed workflow API JSON, non-2xx workflow API responses, and invalid workflow packets must be explicit tested outcomes rather than incidental exceptions.

Tests: focused boundary tests first, then local-runner format, lint, typecheck, build, ExecPlan lint, Program lint, markdown lint, and scoped whitespace checks.

CI gate: local-runner package validation plus plan and Program docs validation for this slice.

### Test Commands

Run these commands before completing this plan:

    bun run --cwd packages/local-runner test -- codex-exec-runner runner-events workflow-run-api bounded-process program-run-slice
    bun run --cwd packages/local-runner format:check
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner build
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-effect-process-codex-and-event-boundaries.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-effect-process-codex-and-event-boundaries.md docs/programs/completed/2026-05-13-local-runner-node-effect-migration
    git diff --check -- docs/exec-plans/completed/2026-05-13-effect-process-codex-and-event-boundaries.md docs/programs/completed/2026-05-13-local-runner-node-effect-migration packages/local-runner/src/effect/runtime.ts packages/local-runner/src/core/codex-exec-runner.ts packages/local-runner/src/core/runner-events.ts packages/local-runner/src/core/workflow-run-api.ts packages/local-runner/tests/codex-exec-runner.test.ts packages/local-runner/tests/runner-events.test.ts packages/local-runner/tests/workflow-run-api.test.ts

## Idempotence and Recovery

The service additions should be additive and safe to rerun. Keep promise adapters intact while adding Effect helpers so a failed partial migration can be repaired without changing every caller. Tests should use fake Codex binaries, fake fetch functions, and temporary directories. Do not run real Codex or call real workflow APIs during focused tests. If a boundary migration fails mid-slice, restore behavior by routing the promise adapter back to the pre-existing implementation shape while keeping any useful tests that describe the desired outcome.

The worktree may contain unrelated dirty files. Do not reset or revert unrelated changes. Scope staging, validation, and commits to files named by this ExecPlan.

## Artifacts and Notes

Research sources read before implementation:

    docs/exec-plans/PLANS.md
    docs/programs/PROGRAMS.md
    repos/effect/AGENTS.md
    docs/programs/completed/2026-05-13-local-runner-node-effect-migration/program.md
    docs/programs/completed/2026-05-13-local-runner-node-effect-migration/research-pass-remaining-effect-migration.md
    packages/local-runner/src/core/codex-exec-runner.ts
    packages/local-runner/src/core/runner-events.ts
    packages/local-runner/src/core/workflow-run-api.ts
    packages/local-runner/tests/codex-exec-runner.test.ts
    packages/local-runner/tests/runner-events.test.ts
    packages/local-runner/tests/workflow-run-api.test.ts

Validation evidence recorded on 2026-05-13:

    bun run --cwd packages/local-runner test -- codex-exec-runner runner-events workflow-run-api bounded-process program-run-slice
    Test Files  5 passed (5)
    Tests  59 passed (59)

    bun run --cwd packages/local-runner test
    Test Files  27 passed | 2 skipped (29)
    Tests  232 passed | 7 skipped (239)

    bun run --cwd packages/local-runner format:check
    All matched files use the correct format.

    bun run --cwd packages/local-runner lint
    Found 0 warnings and 0 errors.

    bun run --cwd packages/local-runner typecheck
    exited with code 0

    bun run --cwd packages/local-runner build
    dist/cli.js  1.7mb
    Done

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-effect-process-codex-and-event-boundaries.md
    docs/exec-plans/completed/2026-05-13-effect-process-codex-and-event-boundaries.md: ok

    bun run programs:lint
    local-runner-node-effect-migration: ok

    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-effect-process-codex-and-event-boundaries.md docs/programs/completed/2026-05-13-local-runner-node-effect-migration
    docs/exec-plans/completed/2026-05-13-effect-process-codex-and-event-boundaries.md: ok
    docs/programs/completed/2026-05-13-local-runner-node-effect-migration/program.md: ok

    git diff --check for touched slice files
    exited with code 0

    no-index whitespace check for planning-brief-4.md
    exited with code 0

## Interfaces and Dependencies

Use the published `effect` package for `Effect`, `Context`, and `Layer`. Use published `@effect/platform` and `@effect/platform-node` APIs only when they preserve the current boundary behavior. Do not import runtime code from `repos/effect/`.

`CodexExecService` should expose a method that accepts the same request fields as `runCodexExec` after defaults are resolved and returns an `Effect` producing `CodexExecRunnerResult`.

`RunnerEventService` should expose methods for queueing, reading, and flushing events. The live service must preserve sync-safe validation, `.sbs` repository boundary checks, outbox lock handling, stranded flushing restore, and requeue behavior.

`WorkflowRunApiService` should expose methods for resolving and claiming approved workflow runs. The live service must preserve endpoint paths, authorization headers, packet validation, null queue handling, and existing error message content for current promise callers.
