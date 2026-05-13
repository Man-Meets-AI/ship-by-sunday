---
title: "Effect Dependency And Boundary Scaffold Planning Brief 2"
program_id: local-runner-node-effect-migration
brief_version: 2
status: current
summary: "Add published Effect dependencies and prove a small local-runner external I/O boundary without rewriting Worker install."
read_when:
  - "Writing or executing the Effect dependency scaffold child ExecPlan."
  - "Checking the first Effect boundary for packages/local-runner."
---

# Effect Dependency And Boundary Scaffold Planning Brief 2

Date: 2026-05-13.

This brief drives the second child ExecPlan for the local-runner Node and Effect migration Program.

## Outcome

`packages/local-runner` should depend on published Effect packages and expose a small runtime/service scaffold that later slices can use for external I/O boundaries. The first proven boundary should be narrow and low-risk. It should preserve current behavior while demonstrating that a production helper can run through an injectable Effect service.

## Scope

Add the minimal published Effect dependency set to `packages/local-runner`: `effect`, `@effect/platform`, and `@effect/platform-node`. Update `bun.lock` with the root Bun workspace toolchain; do not migrate the repository package manager.

Create a small Effect runtime scaffold under `packages/local-runner/src/` for running local effects and for holding the Node platform layer. The Node platform runner should dispose its managed runtime after use unless a later slice explicitly owns a longer-lived lifecycle. Use published package imports only. Do not import from `repos/effect/`.

Use `packages/local-runner/src/core/bounded-process.ts` as the first boundary. It is already the central helper for process execution and timeout classification. Keep the public promise-returning API intact, but route its implementation through an injectable Effect service so tests and later migrations can replace external process I/O deliberately. The Effect helper must also pass interruption through to the spawned process so future Effect timeouts and races do not leave child process work running.

## Boundaries

Do not rewrite the Worker Foundations install workflow in this slice.

Do not migrate Codex execution, runner event delivery, workflow HTTP calls, or Worker install phases yet.

Do not move the root workspace away from Bun. The local-runner package remains Node-first for runtime and distribution while the monorepo still uses Bun commands for development validation.

Do not import runtime code from `repos/effect/`. It remains read-only reference material only.

## Acceptance

Focused validation should prove:

- local-runner format check passes
- local-runner lint passes
- local-runner typecheck passes
- focused bounded-process tests pass
- focused tests prove non-zero exit capture and Effect interruption cleanup
- the active ExecPlan lints
- the Program packet lints
- markdown lint passes for this plan and Program packet
- `git diff --check` passes for touched files

The final ExecPlan should record dependency versions, the chosen scaffold shape, why `bounded-process` was selected, and the exact validation evidence.
