---
title: "Program Review And Repair Hardening Planning Brief 3"
program_id: autonomous-program-execution-loop
brief_version: 3
status: current
summary: "Harden the autonomous Program runner's review and repair quality with stricter structured review contracts, severity policy, and repair-stop behavior."
read_when:
  - "Writing the Harden Program Review And Repair child ExecPlan."
  - "Checking what remains after program:run shipped."
---

# Program Review And Repair Hardening Planning Brief 3

Date: 2026-05-13.

This brief drives the next child ExecPlan for the autonomous Program execution loop.

## What Landed

`Build Program Run Loop` shipped the Program-level `program run` command. The local runner can now select active Program-linked child ExecPlans from frontmatter, invoke the existing one-slice runner in deterministic order, write loop state under `.sbs/program-runs/<program-id>/<loop-run-id>/loop-state.json`, and stop with explicit reasons for Program completion, no active child plan, slice failure, and safety-limit checkpoints.

The root command is:

    bun run program:run -- --program-id <id>

The package command is:

    bun run --cwd packages/local-runner program:run -- --program-id <id>

## Initiative-Level Facts

The runner now has two durable primitives:

- `program:run-slice` owns one child ExecPlan lifecycle: execute, proof, fresh review, repair, reproof, docs sync, and checkpoint.
- `program:run` owns Program-level sequencing across active child ExecPlans and stops before inventing new scope.

The next quality gap is review and repair fidelity. The current review result schema is intentionally small and useful, but later automation needs stricter issue classification, clearer severity thresholds, better repair caps, and a documented way to stop when findings are real but intentionally deferred.

## Next Child ExecPlan

The next child ExecPlan should be `Harden Program Review And Repair`.

It should improve the existing review and repair contracts in `packages/local-runner/src/core/program-run-slice.ts` without changing the `program run` sequencing contract. It should focus on structured review quality, not broad Program-loop features.

## Boundaries

Do not add automatic child-plan generation, PR creation, deployment, provider setup, hook ownership, or separate-repo extraction in this slice.

Do not reimplement the Program loop. The next slice should use the shipped `program:run` and `program:run-slice` boundaries as stable interfaces.

## Validation

The next slice should include focused tests for review schema parsing, severity policy, must-fix handling, repair caps, and intentionally deferred findings. Existing `program-run-slice` and `program-run-loop` tests must keep passing.
