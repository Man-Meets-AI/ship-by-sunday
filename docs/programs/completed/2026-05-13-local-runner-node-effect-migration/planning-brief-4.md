---
title: "Effect Filesystem State Boundaries Planning Brief 4"
program_id: local-runner-node-effect-migration
brief_version: 4
status: current
summary: "Migrate local-runner filesystem state helpers to injectable Effect boundaries while preserving current promise APIs and repository safety checks."
read_when:
  - "Writing or executing the filesystem state Effect child ExecPlan."
  - "Checking which local-runner state surfaces should move after process, event, and API boundaries."
---

# Effect Filesystem State Boundaries Planning Brief 4

Date: 2026-05-13.

This brief drives the fourth child ExecPlan for the local-runner Node and Effect migration Program.

## Outcome

The runner should have Effect-owned boundaries for local `.sbs` state, runner-home credentials, repository path safety, Codex config files, and doctor-pass artifacts. Current callers should keep their promise-returning functions, but tests and later orchestration code should be able to inject filesystem state behavior without touching the real user home or a real repository.

## Scope

Create injectable Effect services around the local filesystem state surfaces that are already shared by multiple runner workflows:

- `packages/local-runner/src/core/local-project-state.ts`
- `packages/local-runner/src/core/local-runner-home.ts`
- `packages/local-runner/src/core/repository-boundary.ts`
- `packages/local-runner/src/core/codex-config-manager.ts`
- doctor artifact helpers under `packages/local-runner/src/core/doctor-pass/`

Use the existing local-runner service pattern: service tag, live Node layer, Effect helper, and promise adapter. Preserve existing exported promise APIs until a later orchestration slice is ready to consume Effect directly.

## Boundaries

Do not split or migrate `packages/local-runner/src/workflows/worker-foundations-install/workflow.ts` in this slice.

Do not migrate Program run loop, daemon, one-shot, or command wrappers yet.

Do not change generated Worker output, package-manager behavior, Codex profile semantics, or customer-facing setup docs unless a focused test proves an existing behavior already changed.

Keep the runtime/package-management contract unchanged: Node runs the shipped local-runner CLI, and Bun remains the monorepo package manager and validation command runner.

Do not import runtime code from `repos/effect/`.

## Acceptance

Focused validation should prove:

- local project state read/write behavior is preserved
- runner-home credential file behavior is preserved
- repository path safety and symlink rejection still work
- Codex config inspection and patch behavior is preserved
- doctor artifact read/write helpers still validate JSON and report parse failures clearly
- current promise callers do not need broad rewrites
- no Worker installer rewrite, orchestration migration, generated Worker change, or repo-wide package-manager migration enters the slice

The final ExecPlan should record the exact service names, adapter strategy, tests added, validation commands, and any decision to keep a Node `fs/promises` wrapper instead of moving directly to `@effect/platform/FileSystem` where behavior parity or path-safety clarity would be worse.
