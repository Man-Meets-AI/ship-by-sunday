---
title: "Program Run Loop Planning Brief 2"
program_id: autonomous-program-execution-loop
brief_version: 2
status: superseded
summary: "Build the full Program runner loop that repeatedly invokes the completed one-slice runner until the Program is complete, blocked, or stopped by a safety limit."
read_when:
  - "Writing or executing the Build Program Run Loop child ExecPlan."
  - "Checking how the Program runner should select and sequence active child ExecPlans."
---

# Program Run Loop Planning Brief 2

Date: 2026-05-13.

This brief drives the second child ExecPlan for the autonomous Program execution loop.

## What Landed

The first child slice shipped `program:run-slice`. That command can execute one Program child ExecPlan through implementation, proof, fresh review, bounded fixes, reproof, docs sync, and checkpoint artifacts. It is exposed through the root script `bun run program:run-slice -- --program-id <id> --plan <path>` and the package command `ship-by-sunday program run-slice`.

Focused tests now prove the one-slice lifecycle, proof command extraction, dirty worktree safety, review schema validation, bounded repair failure, docs sync, and markdown heading insertion behavior.

## Initiative-Level Facts

The stable primitive is now `packages/local-runner/src/core/program-run-slice.ts`. The next command should not duplicate its phase logic. The next command should own only Program-level sequencing: finding the next active child ExecPlan, invoking the slice runner, recording loop state, and deciding whether to continue or stop.

The slice runner still has an important safety constraint: it refuses a dirty worktree by default. A full Program loop must preserve that safety at loop start while allowing subsequent child slices to run after the loop has created expected in-progress changes.

The first loop implementation does not need to create new child ExecPlans automatically. If an active Program has no runnable active child plan, the loop should stop as blocked with useful evidence instead of inventing scope.

## Next Child ExecPlan

The next child ExecPlan is `Build Program Run Loop`.

It should add a command surface shaped as:

    bun run program:run -- --program-id <id> [--max-slices <count>]
    ship-by-sunday program run --program-id <id> [--max-slices <count>]

The command should:

- resolve the active Program packet and current planning brief
- select active ExecPlans under `docs/exec-plans/active/` whose frontmatter has matching `program_id` and current `planning_brief`
- invoke the existing one-slice runner for each selected child plan
- write loop state and slice receipts under ignored `.sbs/program-runs/<program-id>/<loop-run-id>/`
- stop when the Program frontmatter is `status: complete`
- stop as blocked when no active child plan remains while the Program is still active
- stop as blocked when a slice run blocks or throws
- stop as stopped when `--max-slices` is reached before completion

## Boundaries

Do not rewrite the one-slice runner phases. Do not add automatic child-plan generation, automatic PR creation, deployment, provider setup, hook ownership, or separate-repo extraction. Do not make the loop silently accept a dirty worktree at initial startup.

Do not treat safety-limit stop as Program completion. It is a checkpoint that lets Parker inspect state and rerun the loop deliberately.

## Validation

The child ExecPlan should include focused local-runner tests that fake the slice runner and prove selection, sequencing, safety-limit stop, blocked stop, and CLI help. It should also keep the existing `program-run-slice` tests passing, because the loop depends on that primitive.

Expected proof commands:

    bun test packages/local-runner/tests/program-run-loop.test.ts
    bun test packages/local-runner/tests/program-run-slice.test.ts
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner format:check
    bun run programs:lint
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-13-build-program-run-loop.md
    bun run markdown:lint -- --paths docs/programs/active/2026-05-13-autonomous-program-execution-loop docs/exec-plans/active/2026-05-13-build-program-run-loop.md
