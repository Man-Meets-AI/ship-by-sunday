---
title: Complete Worker Install Release Gates
status: complete
created_at: 2026-05-09
completed_at: 2026-05-09
summary: Close the Worker install compatibility Program by making source, CI, package-smoke, and hosted release-proof placement explicit.
post_build_recap: The Worker compatibility matrix is now a source and CI static gate through test:worker-compatibility-smoke and check:source, package smoke remains the shipped packed/native artifact gate, hosted release proof intentionally excludes local repository mutation checks, and the Worker install compatibility Program moved to completed.
program_id: worker-install-compatibility-matrix
planning_brief: docs/programs/completed/2026-05-09-worker-install-compatibility-matrix/planning-brief-4.md
read_when:
  - Checking why Worker install compatibility runs in source and CI gates.
  - Reviewing the completed Worker install compatibility Program.
  - Moving Worker compatibility coverage between CI and release proof.
---

# Complete Worker Install Release Gates

This is a living execution plan for the final Worker install compatibility Program slice.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

After this slice, the Worker install compatibility Program should be complete. The repo should clearly show where the full compatibility matrix runs, where the shipped local-runner artifact is proven, and why hosted release proof does not include local repository mutation checks.

## Progress

- [x] 2026-05-09: Confirmed root `test:worker-compatibility-smoke` runs the full Worker install compatibility matrix.
- [x] 2026-05-09: Confirmed root `check:source` includes both `test:package-smoke` and `test:worker-compatibility-smoke`.
- [x] 2026-05-09: Confirmed `.github/workflows/ci.yml` runs package smoke and Worker compatibility smoke as separate `static` job steps.
- [x] 2026-05-09: Recorded the release-gate decision in planning brief 4 and the completed Program retrospective.
- [x] 2026-05-09: Moved the Program packet to `docs/programs/completed/`.

## Surprises & Discoveries

The release-gate wiring already existed in this branch: root `check:source` runs `test:package-smoke` and `test:worker-compatibility-smoke`, and CI has explicit `Run package smoke test` plus `Run worker compatibility smoke` steps in the required `static` job. The final slice therefore became a documentation and lifecycle closure slice instead of another code change.

## Decision Log

Decision: Run the full 11-scenario Worker compatibility smoke as a source and CI static gate.
Rationale: The matrix creates temporary local Git repositories and proves generated Worker files, root package-manager scripts, fresh clones, and fake Codex kickoff. That is a source-level local-runner contract, not a hosted production runtime contract.
Date: 2026-05-09

Decision: Keep package smoke as the shipped-artifact proof instead of duplicating the full matrix there.
Rationale: Package smoke proves the packed and native CLI paths a customer actually invokes. Duplicating all source matrix scenarios through the packaged command would slow the gate without materially expanding the contract being proven.
Date: 2026-05-09

Decision: Do not add Worker install compatibility to hosted release proof.
Rationale: Hosted release proof should remain focused on production web behavior. Worker install compatibility mutates local recipient repositories and is better proven by local source, package, and CI checks.
Date: 2026-05-09

## Outcomes & Retrospective

The release-gate placement is now explicit and the Worker install compatibility Program is complete. The full matrix runs through `bun run test:worker-compatibility-smoke`, root `check:source`, and the CI `static` job. The shipped local-runner artifact path remains covered by `bun run test:package-smoke`, which builds the CLI and exercises packed plus native install command paths.

No hosted release proof step was added because Worker install compatibility is not hosted web production behavior. That keeps release proof focused and keeps local generated-repository compatibility in the gates that can directly observe it.

## Context and Orientation

The relevant root scripts live in `package.json`. `test:worker-compatibility-smoke` runs the local-runner matrix. `test:package-smoke` builds and smokes the packaged local-runner command. `check:source` includes both commands so local source validation catches Worker install regressions.

The CI gate lives in `.github/workflows/ci.yml`. The `static` job runs package smoke and Worker compatibility smoke after local-runner package tests and before the app build. The hosted release proof commands live under `scripts/release/` and root `release:proof:*` scripts; they intentionally remain unchanged by this slice.

### In Scope

Record the release-gate decision, update the Worker install compatibility Program to complete, add the final planning brief and child ExecPlan, update Program indexes, and move the Program packet to `docs/programs/completed/`.

### Out Of Scope

Do not add a new hosted release proof step. Do not duplicate the full 11-scenario matrix inside package smoke. Do not change unrelated shipping-evidence or web-app CI work.

## Plan of Work

First, inspect root scripts and CI to verify where `test:worker-compatibility-smoke`, `test:package-smoke`, and `check:source` run. Use that inspection to make an explicit gate placement decision.

Second, write planning brief 4 and this completed ExecPlan so the decision is durable. Update the Program frontmatter, current state, progress, decision log, slice ledger, next slice, retrospective, validation, and artifacts sections.

Third, move the Program folder from active to completed and update Program-linked ExecPlan `planning_brief` paths to the completed Program packet path.

Fourth, run Program, ExecPlan, markdown, Worker compatibility, package smoke, and local-runner static validation.

## Milestones

Milestone 1 confirms the current gate wiring. Success means root scripts and CI show the source matrix and package smoke gates.

Milestone 2 closes Program documentation. Success means planning brief 4, this ExecPlan, the completed Program retrospective, and indexes agree.

Milestone 3 validates closure. Success means Program lint, plan lint, markdown lint, Worker compatibility smoke, package smoke, and local-runner static checks pass.

## Concrete Steps

Inspect scripts and CI:

    rg -n "test:worker-compatibility-smoke|test:package-smoke|check:source|worker compatibility smoke|package smoke" package.json .github/workflows/ci.yml

Run the Worker gates:

    bun run --cwd packages/local-runner worker:compatibility-smoke
    bun run --cwd packages/local-runner package:smoke

Validate Program closure:

    bun run programs:lint
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-09-worker-install-release-gates.md
    bun run markdown:lint -- --paths docs/programs/completed/2026-05-09-worker-install-compatibility-matrix docs/exec-plans/completed/2026-05-09-worker-install-release-gates.md

## Validation and Acceptance

Acceptance requires the Program to live under `docs/programs/completed/`, carry `status: complete`, record no remaining next slice, and name the exact source, CI, and package smoke gates. The repo must still pass the Worker compatibility smoke, package smoke, Program lint, this plan lint, targeted markdown lint, and local-runner static checks.

### Test Commands

Worker source matrix:

    bun run --cwd packages/local-runner worker:compatibility-smoke

Shipped-artifact smoke:

    bun run --cwd packages/local-runner build
    bun run --cwd packages/local-runner package:smoke

Local-runner static validation:

    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner format:check

Program and plan validation:

    bun run programs:lint
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-09-worker-install-release-gates.md
    bun run markdown:lint -- --paths docs/programs/completed/2026-05-09-worker-install-compatibility-matrix docs/exec-plans/completed/2026-05-09-worker-install-release-gates.md

## Idempotence and Recovery

The Program move is a repository file move from active to completed. If a lint command reports stale `planning_brief` paths, update each Program-linked ExecPlan to point at the completed Program packet path. If CI placement changes later, update this plan's retrospective only through a new focused follow-up because this plan records the state at completion.

## Artifacts and Notes

The key artifacts are `package.json`, `.github/workflows/ci.yml`, `packages/local-runner/tests/worker-install-compatibility-smoke.ts`, `packages/local-runner/tests/package-smoke.ts`, and `docs/programs/completed/2026-05-09-worker-install-compatibility-matrix/program.md`.

## Interfaces and Dependencies

This slice depends on Bun 1.3.5, the local-runner package scripts, the root source-check script, GitHub Actions `static` CI, Program lint, ExecPlan lint, markdown metadata lint, and the completed Worker install compatibility matrix from the earlier slices.
