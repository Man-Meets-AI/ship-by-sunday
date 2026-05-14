---
title: Cut Local Runner And Worker Runtime To Node
status: complete
created_at: 2026-05-13
completed_at: 2026-05-13
summary: Make the local-runner package and generated Worker install surface run on Node/npm without requiring Bun.
post_build_recap: The local-runner package now builds a Node-targeted CLI, packed package execution works through npm/npx, and Worker Foundations install generates Node/npm Worker files without a managed Bun toolchain.
program_id: local-runner-node-effect-migration
planning_brief: docs/programs/completed/2026-05-13-local-runner-node-effect-migration/planning-brief-1.md
read_when:
  - Resuming the local-runner Node cutover.
  - Validating Worker install runtime behavior.
  - Preparing the next Effect migration slice.
---

# Cut Local Runner And Worker Runtime To Node

This document is a living execution plan for cutting `packages/local-runner` and the Worker install output from Bun-shaped runtime assumptions to Node/npm.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

After this work, a user can install and run the `ship-by-sunday` or `shipbysunday` CLI with Node, and the Worker Foundations installer will generate a Node/npm Worker surface in target repositories. The visible proof is that the package builds a Node executable `dist/cli.js`, package smoke runs through `npx` or installed package execution, and an installed Worker runs `npm run docs:validate` and `npm run worker:test` without Bun or a Worker-managed Bun toolchain.

## Progress

- [x] 2026-05-13: Read root repository instructions, Program guidance, and `docs/exec-plans/PLANS.md`.
- [x] 2026-05-13: Updated the Program packet so the current slice is a hard Node/npm cutover, not a Bun compatibility migration.
- [x] 2026-05-13: Cut `packages/local-runner` package scripts, shebang, build, root Program script entrypoints, and smoke tests to Node-first execution.
- [x] 2026-05-13: Cut Worker Foundations generated files, package-manager detection defaults, proof labels, and installer tests to Node/npm.
- [x] 2026-05-13: Updated `packages/local-runner/README.md`, package dependencies, lockfile, and this ExecPlan with final validation evidence.

## Surprises & Discoveries

Parker explicitly chose a hard cutover. Existing Bun-shaped Worker installs are not a compatibility target for this plan.

The local-runner package already has in-progress user edits for Program commands in `packages/local-runner/package.json` and `packages/local-runner/src/cli.ts`. Preserve those edits while changing the runtime.

The installed npm package initially exited with status 0 and no output because the ESM entrypoint guard compared `import.meta.url` to the symlink path in `process.argv[1]`. Installed package bins run through `node_modules/.bin`, so the guard now compares real paths before calling `runCli()`.

The committed reinstall tests perform two full Worker installs and git proof passes. Under the Node/npm proof path they can exceed the default 20 second Vitest timeout, so those two double-install tests now carry explicit per-test timeouts while keeping their behavior assertions unchanged.

## Decision Log

Decision: Use Node/npm as the only generated Worker runtime for this slice.

Rationale: The user rejected keeping Bun in this path and does not want a compatibility migration for old users.

Date: 2026-05-13.

Decision: Keep the single-file package bin contract if practical.

Rationale: `packages/local-runner/package.json` publishes only `dist/cli.js`. A Node-targeted bundled bin keeps package consumers on the same bin paths while removing Bun as the runtime.

Date: 2026-05-13.

Decision: Do not introduce Effect in this slice.

Rationale: This slice changes the distribution and generated runtime contract. Effect should follow after the Node package and Worker smoke paths are stable.

Date: 2026-05-13.

## Outcomes & Retrospective

This slice cut `packages/local-runner` and generated Worker installs over to Node/npm. The package now uses a Node shebang, an esbuild Node bundle, an explicit `node >=20` engine floor, `jiti` for source-mode local scripts, and npm-compatible package smoke. Worker Foundations install no longer models or provisions a managed Bun toolchain, defaults blank and Bun-shaped target repos to npm, generates `.mjs` Worker files, runs Worker proof with `node` and `node --test`, and keeps legacy managed `apps/worker/bun.lock` cleanup only as a recognized-rerun removal path. The next Program slice can start from a stable Node/npm runtime and add Effect deliberately.

## Context and Orientation

`packages/local-runner/package.json` owns the published bin contract and development scripts for the local CLI. `packages/local-runner/src/cli.ts` is the CLI entrypoint. `packages/local-runner/tests/package-smoke.ts` proves packed package behavior. `packages/local-runner/src/workflows/worker-foundations-install/workflow.ts` generates Worker files into a target repository and now resolves Worker runtime proof through Node/npm instead of a managed Bun toolchain. `packages/local-runner/src/workflows/worker-foundations-install/manifest.ts` exports Worker install constants without Bun download environment variables.

The generated Worker surface is customer-facing setup behavior. The files generated into target repos include `scripts/run-worker.sh`, `apps/worker/package.json`, `apps/worker/src/worker-cli.mjs`, `apps/worker/tests/smoke.test.mjs`, root `package.json` scripts, managed README/AGENTS sections, and `docs/worker/install-report.md`.

### In Scope

This plan covers changing the local-runner package build and scripts to Node, removing Bun-native package smoke expectations, changing Worker install generated output to Node/npm, removing Worker-managed Bun provisioning from the install path, updating focused Worker install tests, updating `packages/local-runner/README.md`, and updating dependency metadata and lockfiles when direct build or TypeScript runner dependencies are added.

### Out Of Scope

Do not migrate the root monorepo away from Bun. Do not add `effect`, `@effect/platform`, or `@effect/platform-node`. Do not split the large Worker installer into modules unless a tiny extraction is required to keep the Node cutover readable. Do not touch `repos/effect/` except as read-only reference for later work. Do not preserve Bun Worker compatibility for old generated installs.

## Plan of Work

First, update `packages/local-runner/package.json` and `packages/local-runner/src/cli.ts` so the package has a Node shebang, Node-targeted build output, Node-based local script entrypoints, and package smoke commands that no longer rely on Bun-native runners. Add direct dev dependencies only for tools actually used by the local-runner package, such as a Node bundler or TypeScript execution helper, and update the repo lockfile with the existing workspace package manager.

Second, update `packages/local-runner/src/workflows/worker-foundations-install/manifest.ts` and `workflow.ts` so Worker install plans no longer model, provision, download, or prefer Bun. Blank and unclaimed repositories should resolve to npm. Generated Worker files should use `node src/worker-cli.mjs` and `node --test tests` or an equivalent Node-native command surface. The generated smoke test should use Node's test runner and `node:assert`.

Third, update `packages/local-runner/tests/worker-foundations-install.test.ts`, `packages/local-runner/tests/worker-install-compatibility-smoke.ts`, and `packages/local-runner/tests/package-smoke.ts` so they assert the new Node/npm contract. Delete or rewrite tests that only proved Worker-managed Bun behavior.

Fourth, update `packages/local-runner/README.md` command examples and generated-file descriptions so future maintainers see the Node/npm contract. Keep this ExecPlan current with discoveries and validation output.

## Milestones

Milestone 1 makes the local-runner package Node-first. Success means `npm run build --workspace packages/local-runner` or the chosen local equivalent creates an executable `packages/local-runner/dist/cli.js`, and running `node packages/local-runner/dist/cli.js --help` prints the CLI help.

Milestone 2 makes Worker install output Node/npm-first. Success means a dry-run install plan for a blank target repo reports npm proof commands, has no Bun toolchain operation, and generated templates reference Node commands.

Milestone 3 restores focused test and smoke confidence. Success means local-runner typecheck, lint, focused Worker install tests, blank-slate compatibility smoke, and package smoke pass or any skipped broad check is explicitly justified.

## Concrete Steps

Work from `/Users/bazelrex/Developer/ship-by-sunday`.

Inspect before editing:

    rg -n "bun|Bun|toolchain|worker-cli|packageManager" packages/local-runner/src packages/local-runner/tests packages/local-runner/README.md

After editing the package runtime, run:

    bun run --cwd packages/local-runner build
    node packages/local-runner/dist/cli.js --help

After editing Worker generation, run the focused test first:

    bun run --cwd packages/local-runner test -- worker-foundations-install

After updating smoke scripts, run:

    bun run --cwd packages/local-runner worker:compatibility-smoke
    bun run test:package-smoke

The root Program command wrappers should also prove the source-mode Node runner path:

    bun run program:run -- --help

## Validation and Acceptance

Feature: Node-first local-runner package and Node/npm Worker install output.

Risk: P1 core product setup path. The installer mutates target repositories and creates customer-facing setup files, so it needs focused integration and smoke proof.

Source of truth: the built `packages/local-runner/dist/cli.js`, the packed package execution path, generated target repository files, install plan JSON, proof command labels, and generated Worker smoke results.

Must work: `ship-by-sunday` and `shipbysunday` package bins run on Node, blank Worker installs create npm/Node scripts, generated `scripts/run-worker.sh` works without Bun, and package smoke proves packed execution.

Must fail safely: missing Node command, unsupported target package-manager declarations, dirty target repos, unmanaged file conflicts, and failed proof commands must stop before unsafe repo mutation or report a clear failure.

Tests: focused Worker installer tests, blank-slate compatibility smoke, package smoke, typecheck, lint, and format check for `packages/local-runner`.

CI gate: local-runner package tests and package smoke. Broader repo gates can remain root Bun-based because this plan does not migrate the monorepo package manager.

### Test Commands

Run these commands before completing this plan:

    bun run --cwd packages/local-runner format:check
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner test -- worker-foundations-install
    bun run --cwd packages/local-runner worker:compatibility-smoke
    bun run test:package-smoke
    bun run program:run -- --help
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-local-runner-node-worker-cutover.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-local-runner-node-worker-cutover.md docs/programs/completed/2026-05-13-local-runner-node-effect-migration packages/local-runner/README.md
    git diff --check -- package.json packages/local-runner docs/exec-plans/completed/2026-05-13-local-runner-node-worker-cutover.md docs/programs/completed/2026-05-13-local-runner-node-effect-migration MISTAKES.md bun.lock

## Idempotence and Recovery

The generated Worker install tests use temporary repositories and should be safe to rerun. Package smoke creates temporary target repos and should clean up after itself; if it fails, inspect the printed temporary path before deleting it. Do not use `git reset --hard` or checkout commands to recover because this working tree contains unrelated user changes. If dependency changes fail halfway, restore only files edited for this plan and rerun the lockfile update command.

## Artifacts and Notes

Final evidence captured on 2026-05-13:

- `node packages/local-runner/dist/cli.js --help` printed the local-runner usage text.
- `npx --yes --package /tmp/ship-by-sunday-0.1.0.tgz ship-by-sunday --help` printed the same usage text after the realpath entrypoint fix.
- `bun run test:package-smoke` passed and proved packed package pairing, installed docs command execution, packed Worker install, and built Node install.
- `bun run --cwd packages/local-runner worker:compatibility-smoke` passed all 11 scenarios, including legacy Bun-shaped inputs that now cut over to npm.
- `bun run --cwd packages/local-runner test -- worker-foundations-install` passed 34 tests.
- `bun run --cwd packages/local-runner format:check`, `lint`, and `typecheck` passed.
- `bun run program:run -- --help` proved the root Program script now uses the Node source runner path.

## Interfaces and Dependencies

The published package interface remains the `ship-by-sunday` and `shipbysunday` bins pointing at `dist/cli.js`, with `packages/local-runner/package.json` declaring `engines.node: >=20` to match the bundled Node target. The Worker install interface remains `shipbysunday install --repo <target>` and the root target-repo scripts listed in `WORKER_FOUNDATIONS_ROOT_SCRIPTS`. The runtime dependency for generated Worker files is Node on `PATH`; the package-manager default for blank target repos is npm. Production code must not import from `repos/effect/`; later Effect work must depend on published packages through `packages/local-runner/package.json`.
