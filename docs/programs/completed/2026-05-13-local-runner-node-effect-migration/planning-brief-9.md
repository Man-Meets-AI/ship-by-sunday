---
title: "Runner Effect Completion And Docs Hardening Planning Brief 9"
program_id: local-runner-node-effect-migration
brief_version: 9
status: current
summary: "Finish local-runner Node and Effect migration docs, validation, and Program closeout after run-slice orchestration migration."
read_when:
  - "Writing or executing the final local-runner Node and Effect migration child ExecPlan."
  - "Closing the local-runner Node and Effect migration Program."
  - "Checking the final validation and documentation hardening expectations."
---

# Runner Effect Completion And Docs Hardening Planning Brief 9

Date: 2026-05-14.

This brief drives the final child ExecPlan for the local-runner Node and Effect migration Program.

## Outcome

The local-runner Node and Effect migration should be closed only after the durable docs and validation surfaces match the shipped behavior. `packages/local-runner` should be described as Node-first, the migrated Effect boundaries should be named in the local docs and Program packet, the completed child ExecPlans should be archived, and the broad local-runner validation set should pass from the current checkout.

## Scope

Use the existing docs and validation surfaces:

- `packages/local-runner/README.md`
- `docs/programs/completed/2026-05-13-local-runner-node-effect-migration/program.md`
- the active final child ExecPlan
- package validation commands under `packages/local-runner/package.json`

Inspect the README before editing. Prefer small documentation corrections over new architecture prose. The README should make the runtime contract and important Effect service boundaries discoverable without duplicating every implementation detail from the Program packet.

## Boundaries

Do not change local-runner runtime behavior, Worker generated output, command names, Program packet schemas, ExecPlan schemas, package-manager defaults, or Effect service implementations in this final slice unless validation reveals a concrete bug that must be fixed before closeout.

Do not move the Program to `completed/` until the final ExecPlan is complete, the Program retrospective is written, `completed_at` and `post_build_recap` are filled, and docs/program lint passes.

Do not import runtime code from `repos/effect/`.

## Acceptance

Focused validation should prove:

- local-runner README/runtime docs match the Node-first package and Worker install contract
- the Program ledger names the completed run-slice orchestration migration and the final closeout
- all Program-owned active child ExecPlans have moved to `docs/exec-plans/completed/`
- broad local-runner validation passes, including tests, format, lint, typecheck, build, Worker compatibility smoke, package smoke, plan lint, Program lint, markdown lint, and scoped whitespace checks
- the Program can move from `docs/programs/active/` to `docs/programs/completed/` with a meaningful retrospective

The final ExecPlan should record every validation command and any intentionally deferred follow-up outside this Program.
