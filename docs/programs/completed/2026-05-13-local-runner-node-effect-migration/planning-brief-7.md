---
title: "Worker Process And File Effect Boundaries Planning Brief 7"
program_id: local-runner-node-effect-migration
brief_version: 7
status: current
summary: "Continue the Worker Foundations Effect migration by targeting process and file boundaries after the event-sync boundary proof."
read_when:
  - "Writing or executing the next Worker workflow Effect child ExecPlan."
  - "Choosing which Worker install process, proof, apply, or license boundary to migrate after event sync."
---

# Worker Process And File Effect Boundaries Planning Brief 7

Date: 2026-05-13.

This brief drives the next child ExecPlan for the local-runner Node and Effect migration Program.

## Outcome

The Worker Foundations installer should continue moving I/O-heavy boundaries to Effect after the completed event-sync proof. The next slice should target process and file boundaries where cancellation, timeout classification, injectable process behavior, repository safety, or testability improves the implementation without changing generated Worker output.

## Scope

Use the split Worker modules under `packages/local-runner/src/workflows/worker-foundations-install/`. Prioritize one or two adjacent boundaries that can be validated without rewriting the installer:

- proof command execution in `proof.ts`
- Codex readiness and package-manager inspection in `inspection.ts`
- Git command execution and rollback helpers in `utils.ts`
- apply/write operations in `apply.ts`
- license activation filesystem and HTTP behavior in `license.ts` only if the slice can stay narrow

Reuse existing services first, especially bounded process, repository boundary, local project state, runner home, and runner events. Add Worker-local service tags only when existing services cannot express the boundary cleanly.

## Boundaries

Do not change generated Worker templates, package-manager defaults, report shape, license semantics, kickoff behavior, or customer setup docs unless a focused test proves an existing bug and the ExecPlan records the bug separately from the Effect migration.

Do not migrate Program run loop, daemon, one-shot commands, or CLI command wrappers in this slice.

Do not introduce repo-wide package-manager changes. Node remains the shipped local-runner and generated Worker runtime; Bun remains the monorepo package manager and validation command runner.

Do not import runtime code from `repos/effect/`.

## Acceptance

Focused validation should prove:

- migrated process/file boundaries preserve existing stdout/stderr, non-zero exit, timeout, missing executable, and cleanup behavior
- at least one Worker workflow boundary can be injected under test without starting a real child process or writing to a real user home
- generated Worker files remain unchanged unless explicitly justified
- `runWorkerFoundationsInstall` stays promise-returning and command callers do not need rewrites
- compatibility smoke and package smoke still prove the Node/npm local-runner and Worker contracts

The final ExecPlan should record the migrated service names, adapter strategy, tests added or updated, exact validation commands, and any Worker modules intentionally deferred.
