---
program_id: 'sbs-codebase-recovery'
title: 'Ship By Sunday Codebase Recovery'
status: 'active'
created_at: 2026-04-23
completed_at: null
summary: 'Use a checked-in Program packet to coordinate the Ship by Sunday recovery work found in the review.'
post_build_recap: null
read_when:
  - 'Planning the Ship by Sunday codebase recovery sequence.'
  - 'Writing or refreshing child ExecPlans from this Program.'
  - 'Checking which recovery slice should happen next.'
---

# Ship By Sunday Codebase Recovery

This is a living initiative document. It keeps the durable initiative-level truth for the Ship by Sunday codebase recovery work identified in the 2026-04-23 review.

This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

This initiative exists to make the codebase easier to ship, debug, and extend. The review found a small number of high-leverage improvement tracks: CI/CD truth, release and intake proof, recurring runtime failure classes, product route contract drift, blueprint and workbench complexity, observability data contracts, and design-system sprawl.

The intended end state is not a generic cleanup campaign. It is a sequence of bounded plans where each slice removes a real source of drift or repeated failure and leaves behind validation that future work can trust.

## Program Inputs

The Program packet lives under `docs/programs/active/2026-04-23-sbs-codebase-recovery/`.

The durable research inputs are:

- `track-0-cicd-harness-retirement.md`
- `track-1-release-intake-control-plane.md`
- `track-2-runtime-footguns.md`
- `track-3-route-product-contract.md`
- `track-4-blueprint-workbench-complexity.md`
- `track-5-data-observability-contracts.md`
- `track-6-design-dependency-sprawl.md`
- `normalized-track-0.md`
- `normalized-track-1.md`
- `normalized-track-2.md`
- `normalized-track-3.md`
- `normalized-track-4.md`
- `normalized-track-5.md`
- `normalized-track-6.md`
- `converged-decision-packet.md`
- `dependency-graph.md`
- `plan-split-recommendation.md`
- `cross-repo-review.md`
- `planning-brief-1.md`
- `planning-brief-2.md`
- `current-planning-brief.txt`

The source material came from the read-only review of the current local Ship by Sunday worktree on 2026-04-23, plus the Worker Program syntax inspection.

## Current State

The Program packet and child ExecPlans have been created as planning artifacts. The current worktree already had unrelated dirty implementation work before this Program was written, mostly around observability, release workflow docs, release triage, QA inventory, and engineering intake exports.

The first child recovery slice has landed. The rejected Dub-style CI/CD harness direction is retired as completed historical context, and the working dev and production CI/CD path is codified from current remote evidence. The active implementation gap is now the remaining recovery sequence, starting with release and intake correctness as the second slice.

## Progress

- [x] 2026-04-23 EDT: Completed the read-only review and identified six recovery tracks.
- [x] 2026-04-23 EDT: Inspected Worker Program syntax and the Ship by Sunday ExecPlan contract.
- [x] 2026-04-23 EDT: Created this Program packet and six child ExecPlans from `planning-brief-1.md`.
- [x] 2026-04-24 EDT: Corrected the Program order after confirming the Dub-style CI/CD harness plan is rejected and current remote evidence favors the existing dev and production workflows.
- [x] 2026-04-24 EDT: Executed the first child ExecPlan for CI/CD harness retirement and working-path codification.
- [x] 2026-04-24 EDT: Refreshed this Program after the first child slice landed.

## Decision Log

Decision: Create one Program packet instead of a loose priority list.
Rationale: The work spans several execution slices and would lose important ordering and boundary context if left only in chat.
Date: 2026-04-23

Decision: Use Program-linked child ExecPlan frontmatter.
Rationale: Ship by Sunday now accepts paired `program_id` and `planning_brief` frontmatter, so child plans can record their Program provenance in the same machine-readable shape as the Program contract.
Date: 2026-04-24

Decision: Start with release and intake control-plane repair.
Rationale: The current dirty work contains concrete bugs, and the release/intake layer is the proof surface for later changes.
Date: 2026-04-23

Decision: Replace the first slice with CI/CD harness retirement and working-path codification.
Rationale: The user corrected the direction on 2026-04-24. The Dub-style harness plan should be thrown out, and recent remote evidence shows the existing `Dev Staging Proof`, `CI`, `Production Release Proof`, and `Convex Production Deploy` lanes are the release path to preserve.
Date: 2026-04-24

## Slice Ledger

Active child ExecPlans:

- `docs/exec-plans/active/2026-04-23-repair-release-intake-control-plane.md`
- `docs/exec-plans/active/2026-04-23-remove-runtime-footguns.md`
- `docs/exec-plans/active/2026-04-23-reconcile-product-route-contract.md`
- `docs/exec-plans/active/2026-04-23-split-blueprint-and-workbench-systems.md`
- `docs/exec-plans/active/2026-04-23-harden-observability-data-contracts.md`
- `docs/exec-plans/active/2026-04-23-reduce-design-dependency-sprawl.md`

Completed child ExecPlans:

- `docs/exec-plans/completed/2026-04-24-retire-dub-style-harness-and-codify-cicd.md`

Each child ExecPlan should carry `program_id: sbs-codebase-recovery` and the immutable planning brief path it was written from. New child plans should use `docs/programs/active/2026-04-23-sbs-codebase-recovery/planning-brief-2.md`.

## Next Slice

The first active child ExecPlan is `docs/exec-plans/active/2026-04-23-repair-release-intake-control-plane.md`.

The CI/CD harness retirement slice is complete. Release and intake repair is now next because the working CI/CD path has been codified and the rejected Dub-style harness plan has been retired as historical context.

## Risks and Watchpoints

Do not let this Program become a license for broad cleanup. Each child ExecPlan must stay within its boundary and validate the touched slice.

Do not let Program validation replace child-plan validation. Program packets use `programs:lint`; child ExecPlans still use `plans:lint` and focused implementation proof.

Do not execute the completed Dub-style harness plan. The completed first child slice retired it and preserved the CI/CD surfaces proven by recent remote runs.

Do not delete heavy design dependencies until import scans and build-backed proof show they are unused.

## Outcomes & Retrospective

This Program is active. Fill this section after child slices land with the exact behavior and documentation that changed, which validation passed, and what remains outside the recovery initiative.

## Validation and Acceptance

The Program-level acceptance bar is met when the rejected Dub-style CI/CD direction is retired, the working dev and production CI/CD path is codified, the release/intake control plane is truthful, recurring runtime incident classes are removed, product route truth is reconciled across app/docs/QA, blueprint and workbench systems have smaller testable boundaries, observability data contracts are intentionally owned, and design dependency cleanup is build-backed.

Each child ExecPlan must pass:

    bun run plans:lint -- --plan <child-plan-path>

The Program packet must pass:

    bun run programs:lint

Touched child plans should also pass:

    bun run markdown:lint -- --paths <child-plan-path>

Implementation slices must run their own focused tests before broader `bun run format`, `bun run lint`, and `bun run typecheck` closeout.

## Artifacts and Notes

Current planning brief:

    docs/programs/active/2026-04-23-sbs-codebase-recovery/planning-brief-2.md

Program contract source:

    docs/programs/PROGRAMS.md
    docs/programs/README.md

## Interfaces and Dependencies

This Program depends on:

- `docs/exec-plans/PLANS.md` for child ExecPlan shape
- `docs/programs/active/2026-04-23-sbs-codebase-recovery/planning-brief-2.md` for current child plan provenance
- `.github/workflows/` and GitHub Actions remote run metadata for the first slice
- `qa/` release and intake scripts for the second slice
- `apps/web/` runtime, product, and observability surfaces for later slices
- `packages/blueprint-compiler/` for blueprint readiness and generated project contracts
