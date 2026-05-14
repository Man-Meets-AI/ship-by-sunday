---
title: "Local Runner Node Runtime Cutover Planning Brief 1"
program_id: local-runner-node-effect-migration
brief_version: 1
status: current
summary: "Make packages/local-runner and generated Worker installs run on Node/npm without introducing Effect yet."
read_when:
  - "Writing or executing the first child ExecPlan for the local-runner Node and Effect migration."
  - "Checking the scope of the Node runtime and distribution cutover."
---

# Local Runner Node Runtime Cutover Planning Brief 1

Date: 2026-05-13.

This brief drives the first child ExecPlan for the local-runner Node and Effect migration Program.

## Outcome

`packages/local-runner` should build, pack, and execute as a Node-first CLI. The published `ship-by-sunday` and `shipbysunday` bin paths should not require Bun at runtime.

Generated Worker installs should also run on Node/npm. This is a hard cutover; old Bun-shaped Worker installs are not a compatibility target. This slice should not add Effect dependencies yet.

## Scope

Update the local-runner package runtime and distribution boundary:

- replace the Bun shebang in `packages/local-runner/src/cli.ts` with a Node-compatible shebang for the built artifact
- replace Bun-targeted build behavior with a Node-targeted package build while preserving the single `dist/cli.js` bin contract if practical
- update package scripts that currently run source TypeScript through Bun
- update package smoke so the shipped package path proves Node-first execution through `npx` or installed package-manager execution
- remove or quarantine Bun-native package smoke expectations that only prove the old runtime
- update Worker Foundations generated files so root scripts, `scripts/run-worker.sh`, `apps/worker/package.json`, and smoke tests use Node/npm
- remove Worker-managed Bun toolchain provisioning from the install plan
- update `packages/local-runner/README.md` command examples that describe local-runner development or direct package execution

## Boundaries

Do not add `effect`, `@effect/platform`, or `@effect/platform-node` in this slice.

Do not migrate the root workspace away from Bun. Root scripts may continue to use Bun while the local-runner package itself becomes Node-first.

Do not rewrite the Worker Foundations install workflow into Effect or split it broadly in this slice. Keep the change focused on the runtime contract.

## Acceptance

Focused validation should prove:

- local-runner typecheck passes
- local-runner lint passes
- local-runner format check passes
- package build produces an executable `dist/cli.js`
- package smoke proves Node-first packed or installed execution
- existing local-runner tests still pass or only fail where the test intentionally described the old Bun runtime

The final ExecPlan should record any package build tool chosen, why it was chosen, and whether the single-file bin contract was preserved.
