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

Slice 3 should migrate bounded process execution, Codex exec, runner event delivery, and workflow-run API calls to Effect. It should keep each migration focused and covered by regression tests for timeout, parse, delivery, retry, and HTTP failure modes.

Slice 4 should split Worker Foundations install into feature-local modules for inspect, plan, apply, proof, report, and generated templates. This slice should avoid changing behavior except where the split reveals a bug.

Slice 5 should migrate the split Worker install modules to Effect where it clarifies dependency injection, failure modeling, cancellation, and resource cleanup.

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
