---
title: "Worker Workflow Module Split Planning Brief 5"
program_id: local-runner-node-effect-migration
brief_version: 5
status: current
summary: "Split the Worker Foundations install workflow into behavior-preserving feature modules before migrating that workflow to Effect."
read_when:
  - "Writing or executing the Worker workflow module split child ExecPlan."
  - "Checking how to reduce Worker installer blast radius before the Effect migration."
---

# Worker Workflow Module Split Planning Brief 5

Date: 2026-05-13.

This brief drives the fifth child ExecPlan for the local-runner Node and Effect migration Program.

## Outcome

The Worker Foundations installer should be split out of the current large `workflow.ts` file into feature-local modules for inspection, planning, applying file changes, proof execution, report rendering, generated templates, license activation, and kickoff behavior. The split should preserve behavior and public command results so the next slice can migrate those modules to Effect without hiding behavior changes inside a structural refactor.

## Scope

Refactor `packages/local-runner/src/workflows/worker-foundations-install/workflow.ts` into cohesive modules under the same workflow directory. Use the existing tests as the behavioral contract, and add focused tests only when extracting a boundary reveals behavior that is not already pinned.

The split should target these responsibilities:

- repository inspection and package-manager/runtime detection
- install planning and managed-file conflict decisions
- applying generated file changes and cleanup
- proof command construction and execution
- report and summary rendering
- generated Worker template content
- license activation HTTP behavior
- kickoff command behavior

Keep exported workflow entry points stable for current command callers. Prefer moving existing logic with domain-specific names over redesigning behavior.

## Boundaries

Do not migrate the Worker installer to Effect in this slice. Effect services for process, events, workflow API, and filesystem state are available, but this slice is about making the Worker workflow modular enough for a later Effect migration.

Do not change generated Worker output, package-manager behavior, license semantics, kickoff semantics, or customer-facing setup docs unless a focused test proves an existing bug and the fix stays inside this split.

Do not change the Program run loop, daemon, one-shot commands, or CLI command wrappers.

Keep the runtime/package-management contract unchanged: Node runs the shipped local-runner CLI, generated blank Worker installs use Node/npm, and Bun remains the monorepo package manager and validation command runner.

Do not import runtime code from `repos/effect/`.

## Acceptance

Focused validation should prove:

- Worker install happy path behavior is unchanged
- managed-file conflict and blocked-path behavior is unchanged
- dry-run behavior is unchanged
- package-manager detection and legacy Bun cleanup behavior is unchanged
- generated Worker templates are unchanged unless explicitly justified
- license activation behavior is unchanged
- kickoff behavior is unchanged
- package smoke and compatibility smoke still prove the Node/npm local-runner and Worker contracts

The final ExecPlan should record the extracted module names, the responsibilities each owns, any tests added, exact validation commands, and any intentionally deferred Effect migration work.
