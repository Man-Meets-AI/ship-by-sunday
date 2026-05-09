---
title: Build Worker Install Fixture Harness
status: complete
created_at: 2026-05-09
completed_at: 2026-05-09
summary: Add the first reusable compatibility smoke harness for Worker Foundations install across practical repo shapes.
post_build_recap: Added a source-level Worker install compatibility smoke harness with Bun, npm, pnpm, Bun different-version, current blank-slate blocker, dry-run mutation snapshots, preserved target identity checks, exact proof-report assertions, fresh-clone proof, fake-Codex kickoff contract proof, and Program-owned planning context.
program_id: worker-install-compatibility-matrix
planning_brief: docs/programs/active/2026-05-09-worker-install-compatibility-matrix/planning-brief-1.md
read_when:
  - Resuming Worker install compatibility harness work.
  - Validating the first Worker install compatibility slice.
  - Extending the compatibility matrix with new repo shapes.
---

# Build Worker Install Fixture Harness

This is a living execution plan for creating the first reusable Worker install compatibility smoke harness.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Worker Foundations install needs product-level proof that it can drop a ready-to-run Worker system into real repository shapes. After this slice, maintainers can run one focused command to exercise the real installer against temporary repositories, prove fresh clone command execution, and prove fake-Codex kickoff without relying on the disposable `runner-test` repository.

## Progress

- [x] 2026-05-09: Created the Program packet and first fixture harness slice from the agreed compatibility scope.
- [x] 2026-05-09: Added `packages/local-runner/tests/worker-install-compatibility-smoke.ts` with Bun, npm, pnpm, Bun different-version, current blank-slate blocker, dry-run mutation snapshots, preserved target identity checks, exact proof-report assertions, fresh clone proof, and fake-Codex kickoff contract proof.
- [x] 2026-05-09: Added `worker:compatibility-smoke` to `packages/local-runner/package.json`.
- [x] 2026-05-09: Ran focused validation and recorded the observed result.
- [x] 2026-05-09: Completed this first slice; follow-up product fixes belong to the next Program slice.

## Surprises & Discoveries

The current installer still blocks blank repositories before apply because it requires a root `package.json`. The harness records that as an expected blocker for now so the gap is visible and can be flipped to install success when the Bun-default policy lands.

The local development environment does not expose a direct `pnpm` binary, but Corepack can run real pnpm for a repository that declares `packageManager: pnpm@9.12.0`. The harness uses a small `pnpm` shim that delegates to `corepack pnpm` so the proof still exercises pnpm instead of a fake package-script runner.

## Decision Log

Decision: Add a source-level compatibility harness before expanding package smoke.
Rationale: The scenario matrix needs quick iteration and readable failures. Once stable, the same expectations can be promoted into packed/native smoke without making every package smoke debug session harder.
Date: 2026-05-09

Decision: Include expected blockers in the first matrix only when they represent known product gaps.
Rationale: Blank-slate support is part of the Program acceptance, but the current installer does not support it. Recording the blocker keeps the test honest while preserving a passing harness during staged implementation.
Date: 2026-05-09

Decision: Prove kickoff with a fake Codex binary in non-JSON mode.
Rationale: JSON mode must remain sync-safe and block kickoff, but the product contract also requires the foreground kickoff path to work after proof and commit.
Date: 2026-05-09

## Outcomes & Retrospective

This plan completed the first compatibility harness slice. The new smoke runner exercises the real installer against temporary repositories, records the current blank-slate blocker, proves Bun, npm, pnpm, and Bun different-version install paths, verifies dry-run no-mutation behavior, verifies target package-manager and workspace identity after install and fresh clone, requires exact proof command reporting, verifies fresh clone command execution, and proves the fake-Codex kickoff argv, cwd, prompt, and report timing contract. Validation passed for the compatibility smoke, local-runner tests, lint, typecheck, format check, build, package smoke, Program lint, ExecPlan lint, markdown lint, and `git diff --check`. Follow-up work should implement blank-slate Bun defaults, generated recipient README/AGENTS output, conflict and upgrade fixtures, polyglot fixtures, and release smoke integration through new Program slices.

## Context and Orientation

The Worker install command is implemented in `packages/local-runner/src/workflows/worker-foundations-install/workflow.ts` and exposed through `packages/local-runner/src/commands/install.ts`. Existing focused unit tests live in `packages/local-runner/tests/worker-foundations-install.test.ts`, and the shipped artifact smoke runner lives in `packages/local-runner/tests/package-smoke.ts`.

The new harness lives in `packages/local-runner/tests/worker-install-compatibility-smoke.ts`. It creates temporary Git repositories, runs the real install command, and asserts the installed repo shape. The harness is invoked through `bun run --cwd packages/local-runner worker:compatibility-smoke`.

### In Scope

Add a reusable compatibility smoke runner, wire it to a package script, create the Program packet and this child ExecPlan, cover the first Bun, npm, pnpm, current blank-slate blocker, fresh clone, and fake-Codex kickoff scenarios, and validate the new command.

### Out Of Scope

Do not implement blank-slate Bun defaults in this slice. Do not generate root README output in this slice. Do not add the full conflict, upgrade, polyglot, Arena-shaped, packed-package, or native executable matrix in this slice. Do not change the Worker install public contract beyond adding the new test harness and planning packet.

## Plan of Work

First, create `packages/local-runner/tests/worker-install-compatibility-smoke.ts` as a standalone Bun script. The script should define named scenarios, create temporary Git repositories, snapshot each repository before dry-run, run dry-run JSON install, assert dry-run made no tracked or untracked working-file changes and did not touch `.git/info/exclude`, run mutating JSON install for supported scenarios, verify proof commands exactly, verify clean worktrees, assert target package-manager and workspace identity is preserved, clone installed repos fresh, and run the documented command surface again from the clone.

Second, wire the script into `packages/local-runner/package.json` as `worker:compatibility-smoke` so maintainers can run it without remembering a file path.

Third, create the Program packet under `docs/programs/active/2026-05-09-worker-install-compatibility-matrix/` and link this ExecPlan to `planning-brief-1.md`.

Fourth, run the focused validation commands. If the harness fails, inspect the failing temporary repository output, repair the harness or product behavior if it is inside this slice, and rerun validation.

## Milestones

Milestone 1 creates the harness and package script. Success means `bun run --cwd packages/local-runner worker:compatibility-smoke -- --list` lists named scenarios and the harness compiles under local runner typecheck.

Milestone 2 proves the first matrix. Success means the default harness command runs through the current blank-slate blocker, installing Bun, npm, pnpm, and Bun different-version scenarios, fresh clone proof, and fake-Codex kickoff.

Milestone 3 records durable planning context. Success means Program and ExecPlan lint pass for the new packet and this child plan.

## Concrete Steps

From the repository root, inspect the new script and package entry:

    sed -n '1,260p' packages/local-runner/tests/worker-install-compatibility-smoke.ts
    bun run --cwd packages/local-runner worker:compatibility-smoke -- --list

Run the compatibility smoke:

    bun run --cwd packages/local-runner worker:compatibility-smoke

Expected high-level output includes one line per scenario and a final summary:

    blank-slate: expected blocker ok
    minimal-bun-package: ok
    next-npm-single-app: ok
    next-pnpm-monorepo: ok
    bun-different-version: ok
    Worker Foundations installed.
    fake-codex-kickoff: ok
    worker install compatibility smoke passed (5 scenarios)

Observed result on 2026-05-09 matched this transcript.

Validate the local runner package and docs touched by this slice:

    bun run --cwd packages/local-runner test
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner format:check
    bun run --cwd packages/local-runner build
    bun run --cwd packages/local-runner package:smoke
    bun run programs:lint
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-09-worker-install-fixture-harness.md
    bun run markdown:lint -- --paths docs/programs/active/2026-05-09-worker-install-compatibility-matrix docs/exec-plans/completed/2026-05-09-worker-install-fixture-harness.md

## Validation and Acceptance

Acceptance for this slice requires the new package script to exist, the harness to run against real temporary Git repositories, at least one expected current blocker to be explicit, dry-run to prove no repository mutation, installing scenarios to prove both direct and root package-manager commands, target package-manager and workspace identity to survive install and fresh clone, install proof reports to include every expected proof command, fresh clone proof to run, fake-Codex kickoff to verify the expected argv, cwd, prompt, and started report status, and the touched Program and ExecPlan documents to pass lint.

### Test Commands

Run focused compatibility validation:

    bun run --cwd packages/local-runner worker:compatibility-smoke

Run local runner validation:

    bun run --cwd packages/local-runner test
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner format:check
    bun run --cwd packages/local-runner build
    bun run --cwd packages/local-runner package:smoke

Run Program and ExecPlan validation:

    bun run programs:lint
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-09-worker-install-fixture-harness.md
    bun run markdown:lint -- --paths docs/programs/active/2026-05-09-worker-install-compatibility-matrix docs/exec-plans/completed/2026-05-09-worker-install-fixture-harness.md

## Idempotence and Recovery

The harness creates repositories under the system temporary directory and does not write to real user target repositories. If a scenario fails, rerun the named scenario by passing its name to the smoke script, then inspect the temporary path shown in the thrown error. Rerunning the full harness should create fresh repositories and should not depend on previous temporary output.

If Corepack cannot run pnpm in the local environment, the pnpm scenario should fail loudly. Do not replace it with a fake pnpm runner; either repair the environment or adjust the Program with an explicit validation limitation.

## Artifacts and Notes

The primary artifact is `packages/local-runner/tests/worker-install-compatibility-smoke.ts`. The package entrypoint is `packages/local-runner/package.json#scripts.worker:compatibility-smoke`.

The Program packet for the larger compatibility initiative lives at `docs/programs/active/2026-05-09-worker-install-compatibility-matrix/`.

## Interfaces and Dependencies

This slice depends on `runInstallCommand(args, env)` accepting an explicit environment map, `initializeGitRepository` setting local Git identity for temporary repositories, Bun and npm being available on the local PATH, Corepack being able to delegate to pnpm for pnpm fixtures, and fake Codex binaries being discoverable through PATH during kickoff proof.
