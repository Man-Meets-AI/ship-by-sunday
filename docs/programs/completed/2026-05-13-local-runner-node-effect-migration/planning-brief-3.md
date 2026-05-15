---
title: "Effect Process Codex And Event Boundaries Planning Brief 3"
program_id: local-runner-node-effect-migration
brief_version: 3
status: current
summary: "Migrate Codex execution, runner event delivery, and workflow-run HTTP calls to injectable Effect boundaries while preserving current promise APIs."
read_when:
  - "Writing or executing the process, Codex, event, and workflow API Effect child ExecPlan."
  - "Checking which validation commands prove the next local-runner Effect slice."
---

# Effect Process Codex And Event Boundaries Planning Brief 3

Date: 2026-05-13.

This brief drives the third child ExecPlan for the local-runner Node and Effect migration Program.

## Outcome

The runner should have Effect-owned boundaries for Codex process execution, runner event outbox delivery, and workflow-run API calls. Current callers should keep their promise-returning functions, but tests and later orchestration code should be able to call injectable Effect services directly.

## Research Basis

Use `research-pass-remaining-effect-migration.md` as the current-state audit. The next child ExecPlan should rely on the installed published package APIs, not imports from `repos/effect/`. The relevant installed APIs are `Effect`, `Context`, `Layer`, and optionally `@effect/platform` services such as `Command`, `FileSystem`, and `HttpClient`. `@effect/platform-node/NodeContext` supplies command, filesystem, path, terminal, and worker services, but it does not supply `HttpClient` by itself.

OpenAI Codex assumptions should remain narrow. The local runner's fake `codex` tests own the JSONL contract for this package. The OpenAI developer docs confirm that non-interactive Codex runs should use non-interactive approval policy settings such as `approval_policy = "never"`, but this slice should not rewrite Codex setup, authentication, profile generation, or broader Codex configuration.

## Scope

Create injectable Effect services for these boundaries:

- Codex execution in `packages/local-runner/src/core/codex-exec-runner.ts`
- runner event queue, read, and flush behavior in `packages/local-runner/src/core/runner-events.ts`
- workflow-run claim and resolve HTTP calls in `packages/local-runner/src/core/workflow-run-api.ts`

Keep existing promise-returning exports as adapters so current commands and workflows do not need a broad rewrite. Add direct Effect helpers for tests and later orchestration.

The implementation may keep exact Node APIs internally when needed for behavior parity. For example, Codex execution can wrap `spawn` in an Effect service first if that is the smallest safe way to preserve stdin, stdout, stderr, timeout, and kill behavior. Do not force a platform `Command` rewrite if it would lose stderr or timeout parity.

## Boundaries

Do not split or migrate `packages/local-runner/src/workflows/worker-foundations-install/workflow.ts` in this slice.

Do not migrate local filesystem state wholesale. Local state functions may still be called by the Codex service through their existing promise APIs.

Do not change generated Worker output, package-manager behavior, Codex profile setup, or customer-facing setup docs unless a focused test proves the existing behavior already changed.

Do not import runtime code from `repos/effect/`.

## Slice Tracking Table

| Step | Boundary | Done When | Focused Tests |
| --- | --- | --- | --- |
| 1 | Codex exec service | `runCodexExecEffect` and `CodexExecService` exist; `runCodexExec` still returns the same result shape | `codex-exec-runner` covers happy path, timeout kill, spawn failure, non-zero stderr, malformed JSONL, structured-output parse failure |
| 2 | Runner event service | queue, read, and flush have Effect helpers and service injection; lock/requeue semantics stay unchanged | `runner-events` covers failed delivery retention, concurrent queue safety, timeout retention, stranded flushing restore, service injection |
| 3 | Workflow-run API service | claim and resolve have Effect helpers and service injection; promise adapters preserve thrown messages | `workflow-run-api` covers accepted packets, null queue, non-2xx messages, fetch rejection, malformed JSON, invalid packet rejection |
| 4 | Integration proof | current workflows still compile and the main Program runner path still uses unchanged promise adapters | `program-run-slice`, local-runner format, lint, typecheck, build |

## Acceptance

Focused validation should prove:

- Codex execution behavior is preserved and has coverage for failure modes that were previously implicit.
- Runner events still queue, flush, requeue, time out, and protect sync-safe payloads.
- Workflow API calls still validate approved packets and report non-2xx failures clearly.
- Current promise callers do not need broad rewrites.
- No Worker installer rewrite, Codex setup rewrite, or repo-wide Bun migration enters the slice.

The final ExecPlan should record the exact service names, adapter strategy, tests added, validation commands, and any decision to defer platform `Command` or `HttpClient` adoption in favor of behavior-preserving Node wrappers.
