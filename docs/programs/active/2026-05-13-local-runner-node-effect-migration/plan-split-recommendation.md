---
title: "Local Runner Node And Effect Migration Plan Split Recommendation"
summary: "Recommended child ExecPlan split for porting local-runner to Node and migrating selected boundaries to Effect."
docType: "plan_split_recommendation"
status: "active"
read_when:
  - "Writing child ExecPlans for the local-runner Node and Effect migration."
  - "Checking the first safe implementation slice."
---

# Local Runner Node And Effect Migration Plan Split Recommendation

## Recommended Split

Slice 1 should perform the Node runtime and generated Worker contract cutover for `packages/local-runner`. It should update the shebang, build tooling, package scripts, direct command docs, package smoke, Worker generated scripts, proof labels, and Worker tests so the published CLI and generated Worker surface run on Node/npm without requiring Bun. It should preserve local-runner command behavior.

Slice 2 should add Effect dependencies and a small Node runtime scaffold. It should introduce the minimal service/layer pattern needed for later migrations and prove typecheck, lint, focused tests, and package smoke still pass.

Slice 3 should migrate Codex exec, runner event delivery, and workflow-run API calls to Effect. Bounded process execution is already complete in slice 2. Slice 3 should keep each boundary focused and covered by regression tests for timeout, interruption, parse, delivery, retry, fetch rejection, malformed response, and HTTP failure modes.

Slice 4 should migrate filesystem-state boundaries to Effect. It should cover local `.sbs` state, runner-home credentials, repository-boundary path safety, Codex config state, and doctor artifacts without changing storage paths or sync-safety behavior.

Slice 5 should split Worker Foundations install into feature-local modules for inspect, plan, apply, proof, report, generated templates, license, and kickoff. This slice should avoid changing behavior except where the split reveals a bug.

Slice 6 should migrate the split Worker install modules to Effect where it clarifies dependency injection, failure modeling, cancellation, and resource cleanup.

Slice 7 should migrate runner orchestration and command runtime surfaces after lower-level services exist. Program run slice, Program run loop, daemon, one-shot, and command wrappers should compose Effect services rather than wrap raw promises directly.

Slice 8 should complete docs and hardening. It should update README/runtime docs if needed, archive completed child ExecPlans, run broad local-runner validation, and move the Program to completed only after no required slices remain.

## First Slice Boundary

The first ExecPlan should make the local-runner package and generated Worker surface run and ship on Node/npm. It should not add Effect dependencies, rewrite tests wholesale, or replace the repo-wide Bun workspace commands.

Minimum useful first slice:

- change CLI shebang to Node
- replace Bun-targeted build with a Node-targeted package build
- keep the published `dist/cli.js` bin contract if practical
- update package scripts for local development and smoke
- update package smoke from Bun-native assumptions to Node-first assumptions
- update Worker-generated root scripts, app package scripts, direct runner, and smoke tests to Node/npm
- remove Worker-managed Bun toolchain provisioning from the install path
- prove `npx` or installed package execution
- update README command map where it describes local-runner runtime commands

## Explicitly Later

The following work belongs after slice 1:

- Effect dependency installation
- Effect service/layer architecture
- broad Worker install workflow split
- repo-wide package-manager migration
- generated Starter template package-manager changes
- provider setup or release workflow changes

## Remaining Slice Table

| Slice | Working Title | Core Output | Validation Anchor |
| --- | --- | --- | --- |
| 2 | Effect Dependency And Boundary Scaffold | published Effect dependencies, runtime scaffold, bounded-process service | `bounded-process`, package validation |
| 3 | Effect Process Codex And Event Boundaries | Codex, runner event, and workflow-run API Effect services | `codex-exec-runner`, `runner-events`, `workflow-run-api` |
| 4 | Effect Filesystem State Boundaries | `.sbs`, runner-home, repository, Codex config, and artifact services | `local-state`, `codex-config-manager`, setup and doctor tests |
| 5 | Worker Workflow Module Split | behavior-preserving Worker install modules | `worker-foundations-install`, compatibility smoke |
| 6 | Worker Workflow Effect Migration | Effect-backed split Worker phases | Worker install tests, package smoke |
| 7 | Runner Orchestration Runtime Migration | Program and daemon orchestration composed through Effect | Program runner, daemon, package smoke |
| 8 | Runner Effect Completion And Docs Hardening | completed Program docs and broad validation proof | full local-runner test and docs validation |
