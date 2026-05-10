---
title: Worker Install Fixture Harness Planning Brief 1
program_id: worker-install-compatibility-matrix
brief_version: 1
status: current
summary: First planning brief for the Worker install compatibility fixture harness.
read_when:
  - Writing the first Worker install compatibility ExecPlan.
  - Resuming the fixture harness slice.
---

# Worker Install Fixture Harness Planning Brief 1

Create the first durable Worker install compatibility harness under `packages/local-runner`. The harness should run the real installer against temporary Git repositories, include the current blank-slate blocker, prove installing scenarios for Bun, npm, pnpm, and Bun different-version repos, verify fresh clone command execution, and prove one successful fake-Codex kickoff.

Wire the harness to a package script so it is easy to run locally. Keep the first slice source-level and fast enough for focused development. Leave packed/native release-gate integration and the remaining compatibility matrix to later slices.
