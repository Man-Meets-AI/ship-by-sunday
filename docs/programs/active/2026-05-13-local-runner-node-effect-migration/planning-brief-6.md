---
title: "Worker Workflow Effect Migration Planning Brief 6"
program_id: local-runner-node-effect-migration
brief_version: 6
status: current
summary: "Migrate the split Worker Foundations install workflow modules to Effect where dependency injection, failure modeling, cancellation, or resource cleanup improves the boundary."
read_when:
  - "Writing or executing the Worker workflow Effect migration child ExecPlan."
  - "Checking how the split Worker installer should use the existing local-runner Effect services."
---

# Worker Workflow Effect Migration Planning Brief 6

Date: 2026-05-13.

This brief drives the sixth child ExecPlan for the local-runner Node and Effect migration Program.

## Outcome

The Worker Foundations installer should use Effect at the I/O-heavy module boundaries that now exist after the module split: repository inspection, license activation, apply/write operations, proof execution, report writes, commit/kickoff execution, and runner event sync. Current command callers should keep the stable `runWorkerFoundationsInstall` promise API until a later orchestration slice is ready to consume Effect directly.

## Scope

Migrate the split modules under `packages/local-runner/src/workflows/worker-foundations-install/` selectively. Use the existing local-runner Effect service pattern: service tag where dependency injection is useful, live Node layer, Effect helper, and promise adapter at the public workflow boundary.

Prioritize boundaries that already depend on external I/O:

- filesystem reads/writes and repository safety checks
- bounded process execution for proof, package scripts, Git, and kickoff commands
- license HTTP activation and validation
- runner event outbox sync/queue behavior
- local proof and install report writes
- cancellation and timeout behavior around child processes

Keep pure template rendering, small string utilities, and deterministic plan construction as ordinary TypeScript unless moving them into Effect removes real complexity.

## Boundaries

Do not change generated Worker output, package-manager behavior, license semantics, kickoff semantics, report shape, or customer-facing setup docs unless a focused test proves an existing bug and the fix is explicitly recorded in the ExecPlan.

Do not migrate Program run loop, daemon, one-shot commands, or CLI command wrappers in this slice.

Do not introduce repo-wide package-manager changes. Node remains the shipped local-runner and generated Worker runtime; Bun remains the monorepo package manager and validation command runner.

Do not import runtime code from `repos/effect/`; use published packages already installed in `packages/local-runner`.

Do not wrap every line in Effect. Keep the migration focused on dependencies, failures, cancellation, resource cleanup, and test injection.

## Acceptance

Focused validation should prove:

- `runWorkerFoundationsInstall` public behavior remains stable
- dry-run, blocked plan, confirmation, install, proof, commit, kickoff, and event sync behavior remain unchanged
- timeout, missing executable, non-zero exit, stdout/stderr capture, and cancellation behavior still match existing process tests
- license activation and validation failures keep current messages and redaction behavior
- generated Worker files remain unchanged unless explicitly justified
- service injection can test at least one Worker workflow boundary without touching a real process, network, or user home
- compatibility smoke and package smoke still prove the Node/npm local-runner and Worker contracts

The final ExecPlan should record the migrated service names, adapter strategy, tests added or updated, exact validation commands, any boundaries intentionally left as plain TypeScript, and the next orchestration runtime slice.
