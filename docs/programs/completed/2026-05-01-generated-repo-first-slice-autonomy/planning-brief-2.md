---
title: Derived First Slice Planner Planning Brief 2
program_id: generated-repo-first-slice-autonomy
brief_version: 2
status: superseded
summary: Define the next generated-repo autonomy slice that derives a structured first-slice plan from existing Blueprint facts and starter files.
read_when:
  - Writing or resuming the Derived First Slice Planner child ExecPlan.
  - Checking what follows the Build Pack readiness manifest slice.
---

# Derived First Slice Planner Planning Brief 2

## Planning Refresh

This is the second planning brief for the generated-repo autonomy Program.

The first child slice completed the Build Pack Readiness Manifest. Generated repos now include `docs/build/docs/readiness.md`, `agent-handoff.md` reads readiness before the copy-ready prompt, validation entries are typed as `runnable`, `manual`, or `blocked`, placeholder-friendly facts are visible as customer-input work, and complete plus reduced compiler tests cover the manifest and materialized repo snapshot.

## Next Plan Recommendation

Exact next plan title: `Derived First Slice Planner`.

Exact scope: replace generic first-slice prose with a structured plan derived from `core_flow`, `must_have_capabilities`, `scope_in`, `scope_out`, `acceptance_criteria`, `selected_next_slice`, and generated starter files. The generated plan should tell a fresh agent which product slice to start, which files to inspect first, what acceptance proof is required, and which scope boundaries must not move.

Exact implementation boundaries: keep the work compiler-owned, derive from existing facts first, preserve the readiness manifest as the confidence and blocker source, and do not touch auth, billing, checkout, Convex runtime, app routes, provider setup, generated mirrors, or required intake fields.

Exact validation boundaries: run focused compiler tests for blueprint rendering and repo generation, then package typecheck, package format check, package lint, plan lint, Program lint, markdown lint for touched planning docs, and repo-level gates as needed.

Why it is next: the readiness manifest now names confidence and blockers, but the actual first-slice plan still leans on `selected_next_slice` free text. A structured derived planner is the next prerequisite for clean-room execution.

## Risks To Carry Forward

Do not duplicate the readiness manifest. The derived planner should reference readiness for confidence, blockers, customer-input work, and validation typing.

Do not invent new starter file ownership without inspecting the generated repo contract.

Do not claim clean-room replay proof from the planner. Replay remains a later Program slice.
