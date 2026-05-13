---
title: "Package Runner Through Local Runner Install Planning Brief 4"
program_id: autonomous-program-execution-loop
brief_version: 4
status: current
summary: "Expose the autonomous Program runner through the ExecPlan command surface and installed Worker command handoff so Parker can run the loop without remembering runner internals."
read_when:
  - "Writing the Package Runner Through Local Runner Install child ExecPlan."
  - "Checking how to run autonomous ExecPlan execution from package or installed Worker commands."
---

# Package Runner Through Local Runner Install Planning Brief 4

Date: 2026-05-13.

This brief drives the packaging and command-surface slice for the autonomous Program execution loop.

## What Landed

The core runner now exists in `packages/local-runner`: `program run-slice` executes one child ExecPlan through execution, proof, fresh review, bounded repair, reproof, docs sync, and checkpointing. `program run` sequences active child ExecPlans for one Program until the Program completes, blocks, or reaches the configured safety limit. Review and repair policy now requires shipped-risk findings to be fixed and includes staged plus untracked changes in review context.

## Initiative-Level Facts

The remaining usability gap is not the engine. The gap is the command Parker naturally reaches for. Installed Worker Foundations already creates root `execplan:*` scripts, but `execplan:build` still behaves like a placeholder instead of forwarding into the autonomous runner. Ship by Sunday itself also exposes `program:run`, but the user-facing command should not require remembering that ExecPlans are implemented through the Program runner internals.

## Next Child ExecPlan

The next child ExecPlan should be `Package Runner Through Local Runner Install`.

It should add an `execplan build` command to the local runner, expose a root/package `execplan:build` script, and make the installed Worker Foundations `execplan:build` command forward to the Ship by Sunday local runner. The command should preserve the existing `program:run` and `program:run-slice` boundaries instead of duplicating their state machines.

## Boundaries

Do not reimplement the runner inside the installed Worker CLI. The installed Worker command can forward to the local runner binary and fail with a clear setup message if the binary is unavailable. Do not add PR creation, deployment, provider setup, or separate-repo extraction in this slice.

## Validation

The slice should include focused command tests for the new `execplan build` help and required arguments, Worker install tests proving installed `execplan:build` forwards to the local runner, compatibility smoke expectations for the installed command surface, and package smoke coverage that the built CLI exposes the command.
