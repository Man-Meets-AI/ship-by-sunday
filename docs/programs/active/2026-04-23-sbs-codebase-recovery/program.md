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

The first child recovery slice has landed. The rejected Dub-style CI/CD harness direction is retired as completed historical context, and the working dev and production CI/CD path is codified from current remote evidence. Release and intake correctness remains important, but it is deferred because it belongs in a dedicated Program with a larger implementation surface. Runtime footgun removal also graduated out of this Program because it is now owned by `docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/`. Product route contract reconciliation, blueprint/workbench boundary splitting, observability data-contract hardening, and design dependency cleanup are complete. This Program now has no remaining immediate-path implementation slice; it remains active only as a pointer to the deferred release/intake control-plane plan until that dedicated lane absorbs or closes it.

## Progress

- [x] 2026-04-23 EDT: Completed the read-only review and identified six recovery tracks.
- [x] 2026-04-23 EDT: Inspected Worker Program syntax and the Ship by Sunday ExecPlan contract.
- [x] 2026-04-23 EDT: Created this Program packet and six child ExecPlans from `planning-brief-1.md`.
- [x] 2026-04-24 EDT: Corrected the Program order after confirming the Dub-style CI/CD harness plan is rejected and current remote evidence favors the existing dev and production workflows.
- [x] 2026-04-24 EDT: Executed the first child ExecPlan for CI/CD harness retirement and working-path codification.
- [x] 2026-04-24 EDT: Refreshed this Program after the first child slice landed.
- [x] 2026-04-24 EDT: Deferred release and intake control-plane repair to a dedicated Program and selected runtime footgun removal as the next recovery slice.
- [x] 2026-04-24 EDT: Retired the oversized runtime-footguns ExecPlan as superseded by a dedicated runtime-boundary Program and selected product route contract reconciliation as the next recovery slice.
- [x] 2026-04-24 EDT: Validation for this refresh: `bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-23-remove-runtime-footguns.md` passed; `bun run plans:lint -- --plan docs/exec-plans/active/2026-04-23-reconcile-product-route-contract.md` passed; `bun run markdown:lint -- --paths docs/programs/active/2026-04-23-sbs-codebase-recovery/program.md docs/programs/active/2026-04-23-sbs-codebase-recovery/dependency-graph.md docs/exec-plans/completed/2026-04-23-remove-runtime-footguns.md docs/exec-plans/active/2026-04-23-reconcile-product-route-contract.md` passed; `git diff --check -- docs/programs/active/2026-04-23-sbs-codebase-recovery/program.md docs/programs/active/2026-04-23-sbs-codebase-recovery/dependency-graph.md docs/exec-plans/completed/2026-04-23-remove-runtime-footguns.md docs/exec-plans/active/2026-04-23-reconcile-product-route-contract.md` passed. `bun run programs:lint` reported `sbs-codebase-recovery: ok` but exited 1 because unrelated active packet `sbs-codex-release-reset` is missing required packet files.
- [x] 2026-04-24 EDT: Runtime Program creation validation reported this recovery Program document as markdown-lint `ok`, and `bun run programs:lint` still reports `sbs-codebase-recovery: ok`.
- [x] 2026-04-24 EDT: Completed product route contract reconciliation. Focused route tests, Blueprint page proof, QA validation, format, lint, typecheck, plan lint, markdown lint, and `git diff --check` passed. Selected blueprint and workbench system splitting as the next active slice.
- [x] 2026-04-24 EDT: Program bookkeeping validation passed after moving route-contract reconciliation to completed: `bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-23-reconcile-product-route-contract.md`, `bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-23-reconcile-product-route-contract.md docs/programs/active/2026-04-23-sbs-codebase-recovery/program.md docs/programs/active/2026-04-23-sbs-codebase-recovery/dependency-graph.md apps/web/content/docs/route-map.mdx qa/README.md`, `bun run programs:lint`, and `git diff --check` all passed.
- [x] 2026-04-24 EDT: Completed blueprint and workbench system splitting. The blueprint hook now delegates draft, validation, focus, and optimistic update behavior to tested feature-local helpers; reference gallery upload now uses the shared upload lifecycle; repeated plain checklist rows now use a shared renderer; focused tests, format, lint, typecheck, plan lint, markdown lint, and `git diff --check` passed.
- [x] 2026-04-24 EDT: Program bookkeeping validation passed after moving blueprint/workbench splitting to completed: `bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-23-split-blueprint-and-workbench-systems.md`, `bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-23-split-blueprint-and-workbench-systems.md docs/programs/active/2026-04-23-sbs-codebase-recovery/program.md docs/programs/active/2026-04-23-sbs-codebase-recovery/dependency-graph.md`, `bun run programs:lint`, and `git diff --check` all passed.
- [x] 2026-04-24 EDT: Completed observability data-contract hardening. Convex now separates `incidents` rollups from `incidentOccurrences` event rows, runtime intake exports reference latest occurrences when available, and `docs/internal/observability.md` documents the ledger and the `scripts/release/lib/engineering-intake-contract.mjs` contract boundary. Focused observability tests, Convex codegen, format, lint, typecheck, plan lint, markdown lint, and `git diff --check` passed.
- [x] 2026-04-24 EDT: Program bookkeeping validation passed after moving observability data-contract hardening to completed: `bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-23-harden-observability-data-contracts.md`, `bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-23-harden-observability-data-contracts.md docs/internal/observability.md docs/programs/active/2026-04-23-sbs-codebase-recovery/program.md docs/programs/active/2026-04-23-sbs-codebase-recovery/dependency-graph.md`, `bun run programs:lint`, and `git diff --check` all passed.
- [x] 2026-04-24 EDT: Completed design dependency sprawl reduction. Removed unused 3D globe, Cobe, heat graph, and particle-engine package dependencies and deleted dead visual modules after import proof. Preserved non-lucide icon libraries because the blueprint theme configurator and preset compiler path intentionally expose `iconLibrary` selection. `bun run --cwd apps/web build`, landing screenshots with the Playwright Clerk bypass, targeted hero hover proof, format, lint, typecheck, plan lint, markdown lint, and `git diff --check` passed.
- [x] 2026-04-24 EDT: Program bookkeeping validation passed after moving design dependency sprawl reduction to completed: `bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-23-reduce-design-dependency-sprawl.md`, `bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-23-reduce-design-dependency-sprawl.md docs/programs/active/2026-04-23-sbs-codebase-recovery/program.md docs/programs/active/2026-04-23-sbs-codebase-recovery/dependency-graph.md`, `bun run programs:lint`, and `git diff --check` all passed.

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

Decision: Defer release and intake control-plane repair to a dedicated Program.
Rationale: The release/intake work involves a broader control-plane rebuild than should be absorbed into this recovery sequence right now. Runtime footgun removal can proceed independently after the CI/CD correction and has the next best dependency position.
Date: 2026-04-24

Decision: Graduate runtime footgun removal to a dedicated Program.
Rationale: The runtime plan contains four distinct lanes: client observability transport, bonus lesson tracking, Codex app-server route boundaries, and public metadata routes. Treating those as one ExecPlan would blur write sets and validation proof, so this Program now marks the old runtime ExecPlan as completed/superseded and continues with the next independent recovery slice.
Date: 2026-04-24

Decision: Complete product route contract reconciliation and move next to blueprint and workbench system splitting.
Rationale: The route model is now implemented and documented: Blueprint and Review are canonical, old staged URLs are protected redirects, and Execute/Mission are compatibility entrypoints. The next dependency is reducing the blueprint and workbench complexity now that route truth is stable.
Date: 2026-04-24

Decision: Complete blueprint and workbench system splitting and move next to observability data-contract hardening.
Rationale: The structural blueprint/workbench slice now has smaller tested boundaries and preserved visible behavior. Observability data contracts are the next dependency because runtime transport hardening is delegated and complete, leaving storage/export truth as the next correctness layer before design dependency cleanup.
Date: 2026-04-24

Decision: Complete observability data-contract hardening and move next to design dependency sprawl.
Rationale: The observability ledger and export contract now have explicit rollup, occurrence, and shared contract ownership. The only remaining active slice in this Program's immediate path is build-backed design dependency cleanup.
Date: 2026-04-24

Decision: Complete design dependency sprawl reduction and do not pull release/intake repair back into this Program.
Rationale: The design cleanup now has import, build, and screenshot proof. The only not-implemented child plan is release/intake control-plane repair, which the user explicitly deferred to a dedicated Program because it is larger than this recovery sequence.
Date: 2026-04-24

## Slice Ledger

Active child ExecPlans:

- `docs/exec-plans/active/2026-04-23-repair-release-intake-control-plane.md`

Completed child ExecPlans:

- `docs/exec-plans/completed/2026-04-24-retire-dub-style-harness-and-codify-cicd.md`
- `docs/exec-plans/completed/2026-04-23-remove-runtime-footguns.md`
- `docs/exec-plans/completed/2026-04-23-reconcile-product-route-contract.md`
- `docs/exec-plans/completed/2026-04-23-split-blueprint-and-workbench-systems.md`
- `docs/exec-plans/completed/2026-04-23-harden-observability-data-contracts.md`
- `docs/exec-plans/completed/2026-04-23-reduce-design-dependency-sprawl.md`

Delegated Programs:

- `docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/`

Each child ExecPlan should carry `program_id: sbs-codebase-recovery` and the immutable planning brief path it was written from. New child plans should use `docs/programs/active/2026-04-23-sbs-codebase-recovery/planning-brief-2.md`.

## Next Slice

There is no remaining immediate-path child slice to execute in this Program. Release and intake repair is intentionally deferred to a dedicated Program, and runtime footgun removal moved to `docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/`.

Do not restart release/intake implementation from this Program unless the dedicated release/intake lane is explicitly brought back here.

## Risks and Watchpoints

Do not let this Program become a license for broad cleanup. Each child ExecPlan must stay within its boundary and validate the touched slice.

Do not let Program validation replace child-plan validation. Program packets use `programs:lint`; child ExecPlans still use `plans:lint` and focused implementation proof.

Do not execute the completed Dub-style harness plan. The completed first child slice retired it and preserved the CI/CD surfaces proven by recent remote runs.

Do not pull release or intake control-plane implementation into the runtime footgun slice. That work remains active planning context, but execution is deferred to its own Program.

Do not pull runtime-boundary implementation back into this Program. That work now belongs to the dedicated runtime-boundary Program.

Do not delete heavy design dependencies until import scans and build-backed proof show they are unused.

## Outcomes & Retrospective

This Program is active only as a deferred-lane pointer. Completed slices have retired the rejected Dub-style CI/CD harness direction, delegated runtime-boundary hardening to its own Program, reconciled product route truth across app routes, docs, QA files, and tests, split blueprint/workbench internals into smaller tested boundaries, made observability rollup, occurrence, and intake-export ownership explicit, and removed unused heavy design dependencies with build and screenshot proof. Release/intake repair remains deferred to its own Program and is the only unfinished child plan still listed here.

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
- `docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/` for the delegated runtime boundary lane
- `.github/workflows/` and GitHub Actions remote run metadata for the first slice
- `qa/` release and intake scripts for the second slice
- `apps/web/` product, runtime, and observability surfaces for later slices
- `packages/blueprint-compiler/` for blueprint readiness and generated project contracts
