---
title: Ship By Sunday Runtime Boundary Hardening Planning Brief 1
program_id: sbs-runtime-boundary-hardening
brief_version: 1
status: current
summary: Split the oversized runtime-footguns plan into four focused child ExecPlans for client observability, bonus lesson tracking, Codex app-server route boundaries, and public metadata routes.
read_when:
  - Writing child ExecPlans for runtime boundary hardening.
  - Checking the next runtime boundary slice to execute.
---

# Ship By Sunday Runtime Boundary Hardening Planning Brief 1

## Goal

Use `docs/exec-plans/completed/2026-04-23-remove-runtime-footguns.md` as a retired source brief, not as the implementation contract. The new Program should split that oversized plan into several child ExecPlans with separate write sets, validation, and ownership.

## Current Facts

The source ExecPlan already records the relevant runtime findings and Codex reference files. The findings are useful, but the plan is too broad because it combines browser observability transport, server-authenticated bonus lesson tracking, Codex route/runtime separation, and public metadata route hardening.

Codex keeps protocol schema, transport, dispatch, lifecycle ownership, telemetry, and process execution separate. Ship by Sunday should copy that boundary discipline in the web app instead of treating runtime hardening as one broad cleanup.

Ship by Sunday accepts Program-linked ExecPlan frontmatter when the paired `program_id` and `planning_brief` keys are both present. Child plans written from this brief should record `program_id: sbs-runtime-boundary-hardening` and `planning_brief: docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/planning-brief-1.md`.

## Child ExecPlan Sequence

The first child ExecPlan should be `docs/exec-plans/active/2026-04-24-harden-client-observability-transport.md`.

The second child ExecPlan should be `docs/exec-plans/active/2026-04-24-server-own-bonus-lesson-view-tracking.md`.

The third child ExecPlan should be `docs/exec-plans/active/2026-04-24-split-codex-app-server-route-boundary.md`.

The fourth child ExecPlan should be `docs/exec-plans/active/2026-04-24-harden-public-metadata-routes.md`.

## Boundaries

Do not implement product code while creating or refreshing this Program packet. Do not combine the child slices during execution. Do not use the old runtime-footguns ExecPlan as the execution contract after this Program exists.

## Validation

The Program packet is valid when it includes the research pass, normalized pass, decision packet, dependency graph, plan split recommendation, cross-repo review, immutable planning brief, current brief pointer, Program document, and child ExecPlans. Program validation is `bun run programs:lint`. Child ExecPlans are valid when `bun run plans:lint -- --plan <child-plan-path>` passes.
