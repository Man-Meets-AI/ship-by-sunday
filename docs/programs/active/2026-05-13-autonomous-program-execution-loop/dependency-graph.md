---
title: "Autonomous Program Execution Loop Dependency Graph"
summary: "Dependency graph for implementing the autonomous Program runner from one-slice execution through full Program looping."
docType: "dependency_graph"
status: "active"
read_when:
  - "Choosing the next child ExecPlan for the autonomous Program runner."
  - "Checking why full Program looping waits on one-slice execution."
---

# Autonomous Program Execution Loop Dependency Graph

## Root Outcome

Parker signs off on a Program, starts the runner, and the system advances through child ExecPlans with execution, review, fixes, proof, docs sync, and checkpoints until the Program is complete or blocked with actionable evidence.

## Dependencies

`program:run-slice` v1 is the root implementation dependency. It must be able to hydrate context, execute one child ExecPlan, run proof, generate and run a fresh review pass, fix must-fix findings, reproof, update docs, and checkpoint.

Structured review output depends on the slice runner's ability to collect live context after implementation. It also depends on a schema or parser that distinguishes findings, open questions, validation notes, and must-fix status.

Fix automation depends on structured review output. It must not run before review output is classified.

Reproof depends on fix automation. The runner must prove the final state, not merely the first implementation attempt.

Docs sync depends on final proof. Program and ExecPlan docs should not claim completion until the slice has passed proof after review findings are addressed or explicitly waived by policy.

Full `program:run` depends on `program:run-slice`. It should call the slice runner repeatedly and stop when the Program is complete, blocked, or hits a configured safety limit.

Program completion review depends on full Program looping. It should review the complete Program diff and acceptance criteria after all child ExecPlans have landed.

Broader SDLC automation depends on reliable Program execution. Ideation, design affordance breadboarding, browser polish, taxonomy review, and feature-usage instrumentation can be automated later, but they should not block the first runner.

Portable installation depends on a stable command contract. The local runner and generated Starter template should not receive the autonomous loop until Ship by Sunday proves the command shape and artifact/state boundaries.

Potential repo extraction depends on at least two real consumers. A standalone repo should wait until Ship by Sunday, Worker, and at least one generated or installed repo can run the same command contract without bespoke assumptions.

## Ordering

The first slice should build `program:run-slice` v1.

The second slice should add full Program looping over child ExecPlans.

The third slice should harden structured review, repair limits, checkpointing, and resume behavior.

The fourth slice should install the runner through Worker Foundations or the docs operating system path.

The fifth slice should integrate the runner into generated Starter repos when the generic command is proven safe and useful outside the core app.
