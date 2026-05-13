---
title: "Remaining Local Runner Effect Migration Research Pass"
summary: "Current-state audit and slice table for finishing the local-runner Effect migration after the dependency scaffold."
docType: "research_pass"
status: "active"
read_when:
  - "Choosing the next local-runner Effect migration slice."
  - "Checking validation targets for a runner Effect boundary."
  - "Updating the Local Runner Node And Effect Migration Program ledger."
---

# Remaining Local Runner Effect Migration Research Pass

## Question

What remains after the Node/npm cutover and first Effect scaffold, and how should the remaining work be split so every step can be tested and landed as a narrow slice?

## Findings

The Node/npm local-runner package cutover is complete, and the first Effect scaffold is now landed. `packages/local-runner/src/core/bounded-process.ts` already has an injectable `BoundedProcessService`, a `runBoundedProcessEffect` helper, and tests covering missing executables, stdout and stderr capture, non-zero exits, timeout classification, service injection, and Effect interruption cleanup.

The next highest-value boundary is `packages/local-runner/src/core/codex-exec-runner.ts`. It still owns manual `spawn`, stdin writing, stdout and stderr accumulation, timeout kill behavior, JSONL parsing, structured output parsing, and Codex thread-state persistence. Current direct coverage is `packages/local-runner/tests/codex-exec-runner.test.ts`, which proves the happy path through a fake `codex exec --json` binary but does not yet pin timeout cleanup, spawn failures, non-zero stderr behavior, malformed JSONL, or structured-output parse failures.

`packages/local-runner/src/core/runner-events.ts` is the next event I/O boundary. It owns append-only event queueing, `.sbs/events/outbox.lock`, stranded `.flushing` outbox restore, sequential fetch delivery, per-delivery timeout through `AbortController`, requeue on failed delivery, and sync-safe redaction checks. Existing coverage in `packages/local-runner/tests/runner-events.test.ts` already proves failed delivery retention, concurrent queue safety, delivery timeout retention, unsafe payload rejection, and absolute-path rejection.

`packages/local-runner/src/core/workflow-run-api.ts` is the queue HTTP boundary. It owns authenticated `fetch` calls for claim and resolve endpoints, non-2xx error message extraction, null queue responses, and packet validation. Existing coverage in `packages/local-runner/tests/workflow-run-api.test.ts` is strong for accepted and rejected packets but should be extended around fetch rejection, malformed response JSON, and non-JSON error bodies when the Effect service is introduced.

`packages/local-runner/src/core/local-project-state.ts`, `packages/local-runner/src/core/local-runner-home.ts`, `packages/local-runner/src/core/repository-boundary.ts`, `packages/local-runner/src/core/codex-config-manager.ts`, and `packages/local-runner/src/core/doctor-pass/artifacts.ts` are the filesystem-state cluster. These are important, but they should follow the process/event/API slice because several process and event services still call them through existing promise helpers.

`packages/local-runner/src/workflows/worker-foundations-install/workflow.ts` is the large workflow risk. It is about 3,960 lines and currently mixes inspection, planning, license activation HTTP, file writes, generated templates, interactive prompting, proof execution, commit behavior, event queueing, and kickoff behavior. It should be split into inspect, plan, apply, proof, report, generated-template, license, and kickoff modules before any deep Effect rewrite. Existing coverage in `packages/local-runner/tests/worker-foundations-install.test.ts` is broad and should stay the behavioral backstop.

`packages/local-runner/src/core/program-run-slice.ts`, `packages/local-runner/src/core/program-run-loop.ts`, and `packages/local-runner/src/commands/daemon.ts` are orchestration surfaces. They should move after external I/O services exist so the orchestration layer composes services instead of wrapping raw Node APIs directly.

The installed Effect packages expose the relevant published APIs locally. `@effect/platform/Command` exposes command construction, stdin feeding, stdout collection, exit codes, working directories, and process start through `CommandExecutor`; `@effect/platform/FileSystem` exposes file and directory operations; `@effect/platform/HttpClient` exposes typed HTTP execution; `@effect/platform-node/NodeContext` provides Node command, filesystem, path, terminal, and worker layers. `NodeContext.layer` does not include `HttpClient`; any slice that adopts platform HTTP must explicitly provide a Node or fetch HTTP client layer.

The OpenAI developer docs for Codex configuration confirm that `approval_policy = "never"` is the non-interactive choice and that Codex config controls sandboxing, output, history, and environment behavior. This Program should still treat the local runner's fake `codex` tests and local command contract as the source of truth for exact JSONL parsing behavior.

## Slice Table

| Step | Child ExecPlan | Primary Surfaces | Output | Focused Validation |
| --- | --- | --- | --- | --- |
| 0 | Completed: `docs/exec-plans/completed/2026-05-13-local-runner-node-worker-cutover.md` | local-runner package, Worker generated runtime | Node/npm runner and Worker contract | package smoke, Worker install tests, build |
| 1 | Completed: `docs/exec-plans/completed/2026-05-13-effect-dependency-and-boundary-scaffold.md` | package manifest, Effect runtime, bounded process | Published Effect dependencies and first process service | `bounded-process`, format, lint, typecheck, build |
| 2 | Active next: `docs/exec-plans/active/2026-05-13-effect-process-codex-and-event-boundaries.md` | `codex-exec-runner.ts`, `runner-events.ts`, `workflow-run-api.ts` | Injectable Effect services with promise adapters preserved | `codex-exec-runner`, `runner-events`, `workflow-run-api`, `program-run-slice`, typecheck |
| 3 | Planned: `Effect Filesystem State Boundaries` | `local-project-state.ts`, `local-runner-home.ts`, `repository-boundary.ts`, `codex-config-manager.ts`, doctor artifacts | Repository-safe filesystem services and typed local-state failures | `local-state`, `codex-config-manager`, setup pair/check, doctor-pass artifact tests |
| 4 | Planned: `Worker Workflow Module Split` | `worker-foundations-install/workflow.ts` and feature-local modules | Behavior-preserving inspect/plan/apply/proof/report/template/license/kickoff modules | `worker-foundations-install`, compatibility smoke, package smoke |
| 5 | Planned: `Worker Workflow Effect Migration` | split Worker modules | Effect-backed Worker install phases with explicit dependencies and failures | Worker install focused tests, compatibility smoke, package smoke, build |
| 6 | Planned: `Runner Orchestration Runtime Migration` | `program-run-slice.ts`, `program-run-loop.ts`, `daemon.ts`, `one-shot.ts`, command wrappers | CLI command/runtime entry points compose Effect services deliberately | `program-run-slice`, `program-run-loop`, daemon, cli help, package smoke |
| 7 | Planned: `Runner Effect Completion And Docs Hardening` | Program packet, README, completed ExecPlans, full package validation | Completed Program with final docs and broad regression proof | full local-runner test, format, lint, typecheck, build, package smoke, Program lint |

## Validation Pattern

Each child ExecPlan should land one independently testable behavior slice. The minimum pattern is: read the current code, write or extend focused tests for the boundary before or with the migration, keep current promise-returning public functions as adapters, add an Effect helper or service for the new boundary, run focused tests first, then run local-runner format, lint, typecheck, and build if the slice changes shipped code.

Documentation validation should run for every Program or ExecPlan change: `bun run plans:lint -- --plan <path>`, `bun run programs:lint`, `bun run markdown:lint -- --paths <paths>`, and `git diff --check` scoped to touched files.

## Implication

The next slice should not touch the Worker installer yet. It should finish the process/Codex/event/API boundary layer by adding Effect services and tests around the still-hand-rolled asynchronous I/O surfaces. That creates the service vocabulary needed for filesystem state and Worker workflow slices without widening the first implementation pass.
