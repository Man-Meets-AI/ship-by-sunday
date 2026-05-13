---
title: Package Runner Through Local Runner Install
status: complete
created_at: 2026-05-13
completed_at: 2026-05-13
summary: Expose the autonomous Program runner through ExecPlan build commands so maintainers can run the loop without remembering internal Program runner commands.
post_build_recap: Added local and installed `execplan:build` command surfaces that forward into the autonomous Program runner, with focused command, Worker install, compatibility smoke, and package smoke coverage.
program_id: autonomous-program-execution-loop
planning_brief: docs/programs/active/2026-05-13-autonomous-program-execution-loop/planning-brief-4.md
read_when:
  - Running autonomous ExecPlan execution from package scripts.
  - Updating Worker Foundations installed command behavior.
  - Validating the autonomous Program runner command surface.
---

# Package Runner Through Local Runner Install

This is a living execution plan for packaging the autonomous Program runner behind the command surface maintainers expect.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The runner engine already exists, but the command Parker naturally wants is an ExecPlan command, not an internal Program runner command. After this change, a maintainer can run `bun run execplan:build -- --program-id <program-id>` or `bun run execplan:build -- --plan <path>` from Ship by Sunday, and an installed Worker Foundations repo can run its installed `execplan:build` script to forward into the same autonomous runner. The visible win is that the command no longer tells the user to manually continue Program-linked ExecPlans; it runs the automate-review-fix-proof loop.

## Progress

- [x] 2026-05-13: Created planning brief 4 and this Program-linked child ExecPlan for the missing ExecPlan command surface.
- [x] 2026-05-13: Added the local-runner `execplan build` command and root/package `execplan:build` scripts.
- [x] 2026-05-13: Replaced the installed Worker `execplan:build` placeholder with forwarding to the Ship by Sunday local runner.
- [x] 2026-05-13: Added focused command, Worker install, compatibility smoke, and package smoke coverage for the new command surface.
- [x] 2026-05-13: Hardened review snapshots and installed Worker runner resolution after review; untracked symlink targets are omitted from review prompts, Worker shell wrappers preserve caller PATH priority, and package smoke proves the installed fallback with the packed tarball instead of registry availability.

## Surprises & Discoveries

The installed Worker CLI is intentionally standalone JavaScript and should not duplicate the TypeScript runner state machine. Forwarding to `ship-by-sunday execplan build` keeps one implementation of execution, proof, review, repair, and docs sync.

## Decision Log

Decision: Add `execplan build` as the user-facing command while preserving `program run` and `program run-slice` as the core execution primitives.
Rationale: The Program runner already owns sequencing and the slice runner already owns the lifecycle. The missing piece was ergonomic command naming.
Date: 2026-05-13.

Decision: Make installed Worker `execplan:build` forward to `SHIPBYSUNDAY_CLI`, a `ship-by-sunday` or `shipbysunday` binary on PATH, or an `npx`/`npm exec` package fallback.
Rationale: This makes installed repositories use the same packaged runner without copying the state machine into generated Worker source.
Date: 2026-05-13.

Decision: Omit untracked symlink targets from autonomous review snapshots.
Rationale: Review prompts need enough context to catch untracked generated files, but they must not follow a repo-local symlink to files outside the repository.
Date: 2026-05-13.

Decision: Append an absolute `NODE` binary directory in `scripts/run-worker.sh` instead of prepending it.
Rationale: The wrapper can still find Node-adjacent tools, but caller PATH entries keep priority so installed Worker `execplan:build` does not accidentally select the wrong runner or `npx` binary.
Date: 2026-05-13.

## Outcomes & Retrospective

This plan is complete. Ship by Sunday now exposes `bun run execplan:build -- --program-id <program-id>` for Program-level execution and `bun run execplan:build -- --plan <path>` for one ExecPlan slice with `program_id` inferred from frontmatter. The installed Worker Foundations `execplan:build` command now forwards to the packaged Ship by Sunday runner instead of printing a placeholder, using a local binary when available and package execution when a normal `npx` install did not leave one behind. The final shape preserves the existing Program runner and slice runner as the only state machines, so command packaging did not fork execution behavior.

## Context and Orientation

The core autonomous execution code lives in `packages/local-runner/src/core/program-run-slice.ts` and `packages/local-runner/src/core/program-run-loop.ts`. The root CLI dispatcher is `packages/local-runner/src/cli.ts`. Package scripts live in root `package.json` and `packages/local-runner/package.json`. Worker Foundations installs standalone Worker files from `packages/local-runner/src/workflows/worker-foundations-install/workflow.ts`; that generated CLI already exposes `execplan:build`, but before this slice it only printed a placeholder.

### In Scope

In scope is adding a local-runner `execplan build` command, wiring root/package scripts, forwarding installed Worker `execplan:build` to the runner binary, updating installed README and AGENTS guidance, and adding regression coverage for those surfaces.

### Out Of Scope

Out of scope is changing the runner state machine, automatic PR creation, deployment, provider dashboard setup, broad Worker runtime extraction, and separate-repo extraction.

## Plan of Work

First, add a new local-runner command module that parses `execplan build`. When passed `--program-id`, it should call the existing Program loop. When passed `--plan`, it should read the plan frontmatter, infer `program_id`, and call the existing one-slice runner. Next, expose that command through `packages/local-runner/src/cli.ts`, root `package.json`, and `packages/local-runner/package.json`.

Then update the Worker Foundations installed source template so `execplan:build` forwards to `ship-by-sunday execplan build --repo <target-repo> ...`. If no runner binary is available, it should fail with a clear setup message instead of pretending the command did work. Finally, update focused tests and smoke tests to prove both package and installed command surfaces.

## Milestones

Milestone 1 adds the local runner command surface. Success means `bun run execplan:build -- --help` prints usage for Program and plan-path driven builds.

Milestone 2 wires the installed Worker handoff. Success means a fixture install can run `./scripts/run-worker.sh execplan:build --program-id worker-foundations-adoption` and the fake runner receives `execplan build --repo <fixture> --program-id worker-foundations-adoption`.

Milestone 3 validates package and compatibility proof. Success means focused local-runner tests, Worker install tests, compatibility smoke expectations, package smoke, lint, typecheck, and docs lint pass for the touched surfaces.

## Concrete Steps

From the repository root, inspect and edit the local-runner command files:

    packages/local-runner/src/cli.ts
    packages/local-runner/src/commands/execplan.ts
    package.json
    packages/local-runner/package.json

Then inspect and edit the Worker Foundations template and tests:

    packages/local-runner/src/workflows/worker-foundations-install/workflow.ts
    packages/local-runner/tests/execplan-command.test.ts
    packages/local-runner/tests/worker-foundations-install.test.ts
    packages/local-runner/tests/worker-install-compatibility-smoke.ts
    packages/local-runner/tests/package-smoke.ts

Run the focused tests first, then package smoke and docs lint. If a test fails, fix that behavior before broad validation.

## Validation and Acceptance

Acceptance is command behavior, not just code shape. Ship by Sunday must expose `bun run execplan:build -- --program-id <program-id>` and `bun run execplan:build -- --plan <path>`. The packaged CLI must show the same help after build. Installed Worker Foundations must no longer leave `execplan:build` as a placeholder; it must forward to the local runner binary and include the target repository with `--repo`.

### Test Commands

    bun test packages/local-runner/tests/execplan-command.test.ts packages/local-runner/tests/worker-foundations-install.test.ts
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner format:check
    bun run test:worker-compatibility-smoke
    bun run test:package-smoke
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-package-runner-through-local-runner-install.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-package-runner-through-local-runner-install.md docs/programs/active/2026-05-13-autonomous-program-execution-loop

## Idempotence and Recovery

The root and package script changes are idempotent because rerunning install refreshes Worker-managed scripts. The installed Worker forwarding path accepts `SHIPBYSUNDAY_CLI` for explicit recovery when `ship-by-sunday` is not on PATH, and otherwise falls back to `npx`/`npm exec` for `ship-by-sunday@0.1.0`. `SHIPBYSUNDAY_PACKAGE_SPEC` can point at a tarball, folder, or alternate package spec when a Worker install must use a private or locally packed runner source. If the forwarding command fails, it exits nonzero and does not claim the ExecPlan was built.

## Artifacts and Notes

Expected direct command help:

    bun run execplan:build -- --help
    Ship by Sunday ExecPlan commands

Expected installed forwarding command:

    ./scripts/run-worker.sh execplan:build --program-id worker-foundations-adoption
    ship-by-sunday execplan build --repo <repo> --program-id worker-foundations-adoption

Validation completed on 2026-05-13:

    bun run execplan:build -- --help
    bun test packages/local-runner/tests/execplan-command.test.ts packages/local-runner/tests/worker-foundations-install.test.ts
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner format:check
    bun run test:worker-compatibility-smoke
    bun run test:package-smoke
    bun test packages/local-runner/tests/execplan-command.test.ts packages/local-runner/tests/program-run-loop.test.ts packages/local-runner/tests/program-run-slice.test.ts
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-package-runner-through-local-runner-install.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-package-runner-through-local-runner-install.md docs/programs/active/2026-05-13-autonomous-program-execution-loop
    git diff --check

## Interfaces and Dependencies

This plan depends on `runProgramRunLoop` from `packages/local-runner/src/core/program-run-loop.ts`, `runProgramRunSlice` from `packages/local-runner/src/core/program-run-slice.ts`, repository root resolution from `packages/local-runner/src/core/repository-root.ts`, and Worker Foundations generated source in `packages/local-runner/src/workflows/worker-foundations-install/workflow.ts`.
