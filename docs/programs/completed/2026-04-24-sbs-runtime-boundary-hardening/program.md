---
program_id: 'sbs-runtime-boundary-hardening'
title: 'Ship By Sunday Runtime Boundary Hardening'
status: 'complete'
created_at: 2026-04-24
completed_at: 2026-04-24
summary: 'Coordinate the split of the oversized runtime-footguns plan into focused runtime boundary child ExecPlans.'
post_build_recap: 'Completed the runtime boundary hardening Program by splitting the oversized runtime-footguns source brief into four child ExecPlans and landing client observability, server-owned bonus lesson tracking, Codex app-server route boundary, and public metadata route hardening.'
read_when:
  - 'Planning Ship by Sunday runtime boundary hardening.'
  - 'Writing or refreshing child ExecPlans from this Program.'
  - 'Checking which runtime boundary slice should happen next.'
---

# Ship By Sunday Runtime Boundary Hardening

This is a living initiative document. It keeps the durable initiative-level truth for splitting Ship by Sunday's runtime-footguns work into focused runtime boundary slices.

This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

This initiative exists because the old runtime-footguns ExecPlan bundled several different failure classes into one oversized implementation contract. Browser error reporting, authenticated bonus lesson writes, Codex app-server route imports, and public metadata routes each need different edits and proof.

The intended end state is runtime hardening that follows the boundary discipline already observed in the Codex reference findings. Codex keeps protocol schema, transport, dispatch, lifecycle ownership, telemetry, and process execution separate. Ship by Sunday should copy that separation in the web app rather than treating runtime hardening as one broad cleanup.

## Program Inputs

The Program packet lives under `docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/`.

The durable packet inputs are:

- `research-pass-runtime-footguns.md`
- `normalized-pass-runtime-boundary-hardening.md`
- `converged-decision-packet.md`
- `dependency-graph.md`
- `plan-split-recommendation.md`
- `cross-repo-review.md`
- `planning-brief-1.md`
- `current-planning-brief.txt`

The source brief is `docs/exec-plans/completed/2026-04-23-remove-runtime-footguns.md`. It remains checked in as a retired planning artifact because the Program and child ExecPlans now own execution.

## Current State

This Program packet completed runtime boundary hardening. The old runtime-footguns ExecPlan is no longer the implementation contract. It preserves the original findings and Codex reference notes for context, while execution landed through four smaller child ExecPlans.

The current worktree already had unrelated dirty work before this Program was created, including edits to the old runtime-footguns plan and the broader Ship by Sunday codebase recovery Program. This Program layers on top of those existing edits.

## Progress

- [x] 2026-04-24 EDT: Promoted the oversized runtime-footguns ExecPlan into this dedicated Program.
- [x] 2026-04-24 EDT: Preserved the source findings and Codex boundary reference as durable packet artifacts.
- [x] 2026-04-24 EDT: Created four Program-linked child ExecPlans from `planning-brief-1.md`.
- [x] 2026-04-24 EDT: Validation recorded for Program creation. `bun run programs:lint` reported `sbs-runtime-boundary-hardening: ok` but exited 1 because unrelated active packet `sbs-codex-release-reset` is missing a versioned planning brief and `current-planning-brief.txt`. The requested old active-plan lint and markdown commands failed with `ENOENT` because the source brief now lives under `docs/exec-plans/completed/`. Completed-path plan lint, child-plan lint, completed-path markdown lint, and `git diff --check` passed.
- [x] 2026-04-24 EDT: Executed and completed the client observability transport child plan. The fallback browser fetch now catches rejected sends, and `bun run --cwd apps/web test:unit -- tests/unit/observability-client-report.test.ts` passed. Closeout checks passed except `bun run typecheck`, which failed on unrelated untracked route-contract work at `apps/web/features/blueprint-flow/lib/legacy-blueprint-route-redirects.ts:51`.
- [x] 2026-04-24 EDT: Executed and completed the bonus lesson server tracking child plan. The client tracker now posts to a server-authenticated route, focused route plus UI tests passed, and QA inventory validation passes. Closeout checks passed except `bun run typecheck`, which failed on unrelated untracked route-contract work at `apps/web/features/blueprint-flow/lib/legacy-blueprint-route-redirects.ts:54`.
- [x] 2026-04-24 EDT: Executed and completed the Codex app-server route boundary child plan. Codex API routes no longer define route-level app-server dynamic import helpers, lightweight app-server contracts are split from process execution, focused Codex route and runtime unit tests pass, and `bun run typecheck` now fails only on unrelated dirty blueprint-flow work at `apps/web/features/blueprint-flow/components/blueprint-page-progress-sidebar.tsx:4`.
- [x] 2026-04-24 EDT: Executed and completed the public metadata routes child plan. Sitemap now uses a filesystem-only public metadata index, docs catch-all behavior is explicit, and focused sitemap proof passes. Build/typecheck and repo-wide format check are blocked by unrelated dirty blueprint-flow/course files recorded in the child plan.
- [x] 2026-04-24 EDT: Completed the Program packet and moved it to `docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/`. The completion review accepts the recorded repo-wide format/build/typecheck failures as unrelated dirty work, not remaining runtime-boundary implementation scope.

## Decision Log

Decision: Treat `docs/exec-plans/completed/2026-04-23-remove-runtime-footguns.md` as a source brief.
Rationale: The plan contains valid findings, but its implementation scope is too broad for one safe execution contract.
Date: 2026-04-24

Decision: Create child ExecPlans in this pass.
Rationale: The Program packet and child slices are concrete, and the repo convention supports Program-linked child plans with paired `program_id` and `planning_brief` frontmatter.
Date: 2026-04-24

Decision: Use Codex as a boundary model, not a code template.
Rationale: Codex separates protocol schema, transport, dispatch, lifecycle ownership, telemetry, and process execution. Ship by Sunday should apply that discipline in its Next.js and Convex surfaces without porting Codex internals.
Date: 2026-04-24

## Slice Ledger

Active child ExecPlans:

- None.

Completed child ExecPlans:

- `docs/exec-plans/completed/2026-04-24-harden-client-observability-transport.md`
- `docs/exec-plans/completed/2026-04-24-server-own-bonus-lesson-view-tracking.md`
- `docs/exec-plans/completed/2026-04-24-split-codex-app-server-route-boundary.md`
- `docs/exec-plans/completed/2026-04-24-harden-public-metadata-routes.md`

Superseded source brief:

- `docs/exec-plans/completed/2026-04-23-remove-runtime-footguns.md`

Each child ExecPlan carries `program_id: sbs-runtime-boundary-hardening` and `planning_brief: docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/planning-brief-1.md`.

## Next Slice

No required next slice remains inside this Program.

No required Program action remains inside this Program.

## Risks and Watchpoints

Do not re-expand this Program into broad runtime cleanup. Each child ExecPlan must keep its write set narrow and prove only its own boundary.

Do not let Codex reference findings become a literal port. Copy the separation of responsibilities: protocol schema, transport, dispatch, lifecycle ownership, telemetry, and process execution stay separate.

Do not use the superseded old runtime-footguns ExecPlan as an implementation contract. It is source context only.

Do not change Convex code for bonus lesson tracking before reading `apps/web/convex/_generated/ai/guidelines.md`.

## Outcomes & Retrospective

All four child slices have landed. Runtime boundary hardening removed four failure classes: rejected browser observability fallback fetches, client-owned bonus lesson write authority, route-owned Codex app-server dynamic import helpers, and heavy public metadata route dependencies.

The Program stayed scoped to runtime boundary ownership instead of widening into unrelated dirty work. Focused proof passed for each child slice, Program and plan lints pass, and `git diff --check` passes. Repo-wide format/build/typecheck proof is not clean because unrelated dirty blueprint-flow and course files already in the worktree fail formatting or TypeScript checks; the child ExecPlans record those blockers with exact files and commands.

## Validation and Acceptance

Program-level acceptance is met when the four child ExecPlans have landed or been deliberately retired, the old runtime-footguns source brief no longer has unresolved implementation ownership, and runtime boundaries follow the Codex-shaped separation of protocol schema, transport, dispatch, lifecycle ownership, telemetry, and process execution.

Each child ExecPlan must pass:

    bun run plans:lint -- --plan <child-plan-path>

The Program packet must pass:

    bun run programs:lint

Touched Program and ExecPlan docs must also pass markdown lint and `git diff --check`.

## Artifacts and Notes

Current planning brief:

    docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/planning-brief-1.md

Source brief:

    docs/exec-plans/completed/2026-04-23-remove-runtime-footguns.md

Validation for this Program creation pass:

    bun run programs:lint

Result: `docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/program.md: ok` and `sbs-runtime-boundary-hardening: ok`. The command exited 1 because the unrelated existing active packet `sbs-codex-release-reset` is missing a versioned planning brief and `current-planning-brief.txt`.

    bun run plans:lint -- --plan docs/exec-plans/active/2026-04-23-remove-runtime-footguns.md

Result: failed with `ENOENT` because the source brief now lives at `docs/exec-plans/completed/2026-04-23-remove-runtime-footguns.md`.

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-23-remove-runtime-footguns.md
    bun run plans:lint -- --plan docs/exec-plans/active/2026-04-24-harden-client-observability-transport.md
    bun run plans:lint -- --plan docs/exec-plans/active/2026-04-24-server-own-bonus-lesson-view-tracking.md
    bun run plans:lint -- --plan docs/exec-plans/active/2026-04-24-split-codex-app-server-route-boundary.md
    bun run plans:lint -- --plan docs/exec-plans/active/2026-04-24-harden-public-metadata-routes.md

Result: all five plan lints passed.

    bun run markdown:lint -- --paths docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening docs/exec-plans/active/2026-04-23-remove-runtime-footguns.md docs/programs/active/2026-04-23-sbs-codebase-recovery/program.md docs/programs/active/2026-04-23-sbs-codebase-recovery/dependency-graph.md

Result: failed with `ENOENT` because the requested active source-brief path no longer exists.

    bun run markdown:lint -- --paths docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening docs/exec-plans/completed/2026-04-23-remove-runtime-footguns.md docs/programs/active/2026-04-23-sbs-codebase-recovery/program.md docs/programs/active/2026-04-23-sbs-codebase-recovery/dependency-graph.md docs/exec-plans/active/2026-04-24-harden-client-observability-transport.md docs/exec-plans/active/2026-04-24-server-own-bonus-lesson-view-tracking.md docs/exec-plans/active/2026-04-24-split-codex-app-server-route-boundary.md docs/exec-plans/active/2026-04-24-harden-public-metadata-routes.md

Result: passed for the new child ExecPlans, the completed source brief, the recovery Program document, and the new runtime Program document.

    git diff --check

Result: passed.

Completion review validation:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-harden-client-observability-transport.md
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-server-own-bonus-lesson-view-tracking.md
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-split-codex-app-server-route-boundary.md
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-harden-public-metadata-routes.md

Result: passed. All four completed child ExecPlans linted `ok`.

    bun run markdown:lint -- --paths docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening docs/programs/active/index.md docs/programs/completed/index.md docs/exec-plans/completed/2026-04-24-harden-client-observability-transport.md docs/exec-plans/completed/2026-04-24-server-own-bonus-lesson-view-tracking.md docs/exec-plans/completed/2026-04-24-split-codex-app-server-route-boundary.md docs/exec-plans/completed/2026-04-24-harden-public-metadata-routes.md docs/exec-plans/completed/2026-04-23-remove-runtime-footguns.md docs/programs/active/2026-04-23-sbs-codebase-recovery/program.md docs/programs/active/2026-04-23-sbs-codebase-recovery/dependency-graph.md

Result: initially failed because this completed Program's `## Next Slice` wording did not start with the exact required phrase `No required next slice remains`. After correcting the wording, rerunning the same command passed for the completed Program packet, indexes, recovery Program docs, old source brief, and all four completed child ExecPlans.

    bun run programs:lint

Result: initially failed for the same completed Program `## Next Slice` wording issue. After correcting the wording, rerunning the same command passed for Program docs, Program packets, and Program prompt inventory.

    git diff --check

Result: passed.

## Interfaces and Dependencies

This Program depends on:

- `docs/programs/PROGRAMS.md` for Program packet shape
- `docs/exec-plans/PLANS.md` for child ExecPlan shape
- `apps/web/features/observability/` for client transport hardening
- `apps/web/features/execute-ship/` and `apps/web/convex/` for bonus lesson view tracking
- `apps/web/app/api/codex/` and `apps/web/features/codex/server/` for Codex route boundaries
- `apps/web/app/sitemap.ts` and `apps/web/app/docs/[[...mdxPath]]/page.tsx` for public metadata hardening
