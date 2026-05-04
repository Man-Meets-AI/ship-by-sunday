---
program_id: generated-repo-first-slice-autonomy
title: Generated Repo First Slice Autonomy
status: complete
created_at: 2026-05-01
completed_at: 2026-05-01
summary: Make generated customer repos self-contained enough for a fresh coding agent to execute the first build slice without chat history.
post_build_recap: Generated repos now include deterministic readiness, structured first-slice planning, package-script-backed validation, review and verification guidance, broader weak-fact blockers, and clean-room replay tests for materialized Build Packs.
read_when:
  - Resuming generated-repo autonomy work.
  - Writing or grilling child ExecPlans for Build Pack readiness, first-slice planning, validation, QA, weak facts, replay proof, or regression snapshots.
  - Checking whether a generated customer repo can support fresh-agent execution without chat history.
---

# Generated Repo First Slice Autonomy

This is a living initiative document. It keeps the durable initiative-level truth for making generated customer repos executable by fresh coding agents without chat history.

This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

The long-horizon goal is a generated-repo autonomy guarantee. Every downloaded customer repo should include enough executable build context for a fresh coding agent to choose the first product slice, stay inside scope, run accurate validation, document evidence, and know when to ask the customer instead of guessing.

The initiative moves in the right direction when the generated Build Pack stops relying on free-text handoff assumptions and starts emitting deterministic readiness, typed validation, explicit blockers, review and verification proof, and clean-room replay evidence.

## Program Inputs

The Program packet lives under `docs/programs/completed/2026-05-01-generated-repo-first-slice-autonomy/`.

The durable research input is `research-pass-build-pack-autonomy.md`.

The normalized input is `normalized-pass-build-pack-autonomy.md`.

The convergence artifact is `converged-decision-packet.md`.

The dependency artifact is `dependency-graph.md`.

The plan split artifact is `plan-split-recommendation.md`.

The review artifact is `cross-repo-review.md`.

The planning briefs are `planning-brief-1.md`, `planning-brief-2.md`, and `planning-brief-3.md`, with `current-planning-brief.txt` pointing at the current versioned brief.

## Current State

The generated Build Pack now includes `docs/build/docs/readiness.md`. The manifest records first-slice confidence, typed validation entries, blockers, customer-input work, weak-fact warnings, ask-customer gates, and readiness limits.

Validation command generation no longer emits unknown validation steps as shell comments. Unknown validation steps become typed blocked entries in the readiness manifest.

The generated-repo autonomy roadmap is complete. Generated Build Packs now derive a structured first-slice plan, validate runnable commands against generated package scripts, add a review and verification pack, broaden weak-fact detection, include clean-room replay proof, and strengthen structural regression tests while preserving the readiness manifest as the confidence and blocker source.

## Progress

- [x] 2026-05-01 EDT: Created the Program packet and first child ExecPlan for the Build Pack Readiness Manifest.
- [x] 2026-05-01 EDT: Implemented the Build Pack Readiness Manifest in `packages/codebase-compiler`.
- [x] 2026-05-01 EDT: Validated focused compiler tests, planning lint, package gates, repo format, repo lint, repo typecheck, and diff whitespace checks for the first slice.
- [x] 2026-05-01 EDT: Wrote `planning-brief-2.md`, marked `planning-brief-1.md` superseded, and advanced `current-planning-brief.txt` to the Derived First Slice Planner.
- [x] 2026-05-01 EDT: Wrote `planning-brief-3.md`, marked `planning-brief-2.md` superseded, and opened the completion ExecPlan.
- [x] 2026-05-01 EDT: Completed the remaining roadmap with structured first-slice planning, package-aware validation resolution, review and verification guidance, expanded weak-fact detection, clean-room replay proof, and structural regression tests.
- [x] 2026-05-01 EDT: Focused compiler tests, package typecheck, package format check, and package lint passed for the completion pass.
- [x] 2026-05-01 EDT: Planning lint, Program lint, markdown lint, repo format, repo lint, repo typecheck, and diff whitespace checks passed after moving the Program to completed.

## Decision Log

Decision: Use a Program for generated-repo autonomy.
Rationale: The roadmap spans compiler models, generated docs, QA/review proof, clean-room replay, and structural regression snapshots across several child slices.
Date: 2026-05-01

Decision: Make the Build Pack Readiness Manifest the first child slice.
Rationale: A deterministic readiness report and typed validation entries are prerequisites for safer first-slice planning, review proof, replay proof, and regression snapshots.
Date: 2026-05-01

Decision: Derive from existing canonical facts in the first slice.
Rationale: The schema already has first-slice, scope, acceptance, validation, demo, risks, dependencies, open questions, proof-source, and placeholder-friendly fields.
Date: 2026-05-01

Decision: Treat generated open questions as readiness blockers.
Rationale: A fresh agent should not change promise, scope, data model, provider behavior, credentials, or production claims while customer questions remain unresolved.
Date: 2026-05-01

## Slice Ledger

Active child ExecPlans:

- None.

Recommended future child ExecPlans:

- None while the completion ExecPlan is active.

Completed child ExecPlans:

- `docs/exec-plans/completed/2026-05-01-build-pack-readiness-manifest.md`
- `docs/exec-plans/completed/2026-05-01-complete-generated-repo-first-slice-autonomy.md`

## Next Slice

No required next slice remains inside this Program.

## Risks and Watchpoints

Do not turn placeholder-friendly facts into generation blockers. Missing or placeholder-like domains and emails should be visible customer-input work before production claims.

Do not claim autonomous build readiness until the later clean-room replay proof exists.

Do not let unknown validation steps become shell comments. The generated output should classify them as blocked or manual.

Do not widen the first slice into auth, billing, checkout, Convex runtime, app routes, provider setup, generated mirrors, or a schema migration.

## Outcomes & Retrospective

The first child slice landed the Build Pack Readiness Manifest. Generated repos now include `docs/build/docs/readiness.md`, `agent-handoff.md` points to readiness before the copy-ready prompt, validation entries are typed, placeholder-friendly fields are named as customer-input work, and reduced-project tests prove blocked validation plus missing placeholder fields are visible.

The completion pass finished the remaining roadmap. Generated repos now include a structured first-slice plan derived from product flow, capabilities, scope, acceptance criteria, and generated starter files; runnable validation entries are backed by generated root `package.json` scripts; `docs/build/docs/review.md` provides review and verification proof; weak facts can become visible blockers; and clean-room replay tests parse the materialized Build Pack without chat history.

## Validation and Acceptance

At the Program level, completion requires generated repos to include deterministic readiness, derived first-slice planning, typed command manifests, review and verification proof, weak-fact blockers, clean-room replay proof, and structural regression tests that parse generated docs rather than only checking substrings.

The completion pass satisfies that bar in `packages/codebase-compiler`. Focused compiler tests, package typecheck, package format check, package lint, planning lint, Program lint, markdown lint, repo format, repo lint, repo typecheck, and diff whitespace checks passed before the Program was marked complete.

## Artifacts and Notes

The first planning brief is `docs/programs/completed/2026-05-01-generated-repo-first-slice-autonomy/planning-brief-1.md`.

The current planning brief is `docs/programs/completed/2026-05-01-generated-repo-first-slice-autonomy/planning-brief-3.md`.

The completed first child ExecPlan is `docs/exec-plans/completed/2026-05-01-build-pack-readiness-manifest.md`.

## Interfaces and Dependencies

This Program depends on root `AGENTS.md`, `docs/programs/PROGRAMS.md`, `docs/exec-plans/PLANS.md`, `packages/codebase-compiler/AGENTS.md`, the canonical project-definition schema, generated Build Pack renderers, repo-generation materialization, and compiler tests.
