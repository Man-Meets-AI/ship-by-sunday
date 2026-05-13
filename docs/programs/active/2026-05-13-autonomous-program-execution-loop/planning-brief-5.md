---
title: "Runner Extraction Boundary Planning Brief 5"
program_id: autonomous-program-execution-loop
brief_version: 5
status: current
summary: "Decide whether the autonomous Program runner should remain in Ship by Sunday local-runner surfaces or move into a separate reusable package after the command contract has been proven."
read_when:
  - "Writing the Decide Runner Extraction Boundary child ExecPlan."
  - "Checking whether autonomous Program execution should be extracted into a separate package or repo."
---

# Runner Extraction Boundary Planning Brief 5

Date: 2026-05-13.

This brief drives the remaining architecture decision slice for the autonomous Program execution loop.

## What Landed

The local runner now exposes the low-level Program commands and the user-facing ExecPlan build command. `program run-slice` owns one child ExecPlan lifecycle, `program run` owns Program-level sequencing, and `execplan build` provides the command maintainers can remember. Installed Worker Foundations `execplan:build` now forwards to the packaged Ship by Sunday runner instead of printing a placeholder.

## Initiative-Level Facts

The engine and command contract are proven in Ship by Sunday and through the installed Worker command surface. The remaining question is ownership and packaging: whether the docs operating system and autonomous Program runner should stay inside `packages/local-runner`, become a separately versioned package, or wait for more consumers before extraction.

## Next Child ExecPlan

The next child ExecPlan should be `Decide Runner Extraction Boundary`.

It should review the current command contract, package smoke results, installed Worker forwarding behavior, and likely consumers. It should produce a concrete recommendation and any small repo changes needed to make that recommendation durable.

## Boundaries

Do not reimplement runner phases in this slice. Do not create a new repo unless the decision and required migration work are fully justified. Do not change the shipped `execplan build`, `program run`, or `program run-slice` command contracts unless a real packaging blocker requires it.

## Validation

The slice should include docs/program linting, package smoke or command smoke evidence where relevant, and a final Program-level review if it marks the Program complete.
