---
title: Existing Codebase Work Phase Workers
status: complete
created_at: 2026-05-04
completed_at: 2026-05-04
summary: Add the Work-phase local worker queue, daemon claiming path, queue controls, proof-safe state transitions, and validation for approved existing-codebase workflow jobs.
post_build_recap: Added approved workflow queue claiming through the runner credential API, daemon `--work --confirm-local-writes` execution, `/workspace/runs` worker queue controls, pause/resume/stop mutations, and focused tests without adding PR delivery, managed GitHub, or raw-source sharing.
program_id: customer-agentic-operating-system
planning_brief: docs/programs/completed/2026-05-02-customer-agentic-operating-system/planning-brief-2.md
read_when:
  - Resuming existing-codebase worker queue, local daemon, or Work-phase execution work.
  - Validating approved workflow queue, pause/resume/stop controls, or one active write lease per project.
  - Extending `/workspace/runs` beyond Crawl and Walk history.
---

# Existing Codebase Work Phase Workers

This document is the completed execution plan for the first existing-codebase Work-phase worker slice.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

After Crawl and Walk, the customer needs the local runner to stay paired and process approved workflow packets over time. This slice turns `/workspace/runs` into the first worker home: it shows approved queue state, a daemon worker command, heartbeat-backed runner identity, pause/resume/stop controls, proof and blocked-proof state, and a credentialed queue-claim path for the local daemon. The work is complete when an approved source-truth workflow can be claimed by the paired daemon, refreshed with one active project write lease, run through the existing local workflow execution path, and remain controllable from the protected workspace without adding managed GitHub, PR push/open behavior, raw source sharing, raw terminal logs, screenshots, or Codex transcript sync.

## Progress

- [x] 2026-05-04 local: Confirmed the active Program's next slice is `existing-codebase-work-phase-workers` and read the completed `workspace-support-surfaces` plan before implementation.
- [x] 2026-05-04 local: Extended workspace workflow status and runner event contracts with `paused` and `workflow.claimed` while preserving sync-safe event payload validation.
- [x] 2026-05-04 local: Added credentialed queue claiming in Convex, enforcing daemon-only claims and one active `running` workflow per project.
- [x] 2026-05-04 local: Added viewer-owned pause, resume, and stop mutations for approved workflow jobs; stopped terminal runs ignore late proof/block events.
- [x] 2026-05-04 local: Added `/api/workspace/runner/workflow-runs/claim` and local runner claim support.
- [x] 2026-05-04 local: Extended `ship-by-sunday daemon start` with `--work --confirm-local-writes` so the persistent daemon can claim and run approved queue jobs serially.
- [x] 2026-05-04 local: Updated `/workspace/runs` with a Work-phase worker queue panel, daemon command, queue metrics, and pause/resume/stop icon controls.
- [x] 2026-05-04 local: Added focused unit and integration tests for queue read models, Convex queue state transitions, runner claim API behavior, and the runs page worker controls.
- [x] 2026-05-04 local: Validation passed for focused workspace, local-runner, integration UI, formatting, linting, typecheck, plan lint, Program lint, markdown lint, and diff whitespace checks. Exact commands are recorded in `Validation and Acceptance`.

## Surprises & Discoveries

- 2026-05-04 local: The previous `/workspace/runs` test intentionally forbade queue controls. That was correct for Crawl/Walk, so this slice updated the assertion to require queue controls while continuing to forbid PR handoff language.
- 2026-05-04 local: The existing source-truth approval creates the write lease at approval time. The Work-phase claim path now refreshes the lease at claim time so approved queue jobs do not lose their lease before the daemon picks them up.
- 2026-05-04 local: Stop controls need backend terminal-state protection because a running local process can still deliver a late proof event. The event reducer now ignores proof/block/start updates once a workflow is terminal.

## Decision Log

Decision: Use `workflowRuns` as the first approved queue instead of adding a new queue table.
Rationale: Approved workflow packets already carry runner, workflow, branch, profile, lease, proof, and blocked-state metadata. Reusing the table keeps the slice smaller and avoids a second source of truth.
Date: 2026-05-04

Decision: Treat `approved` as queued, `paused` as held, `running` as claimed, and `canceled` as stopped.
Rationale: The existing status model already represented most queue states. Adding only `paused` gives the UI a real hold state while preserving compatibility with existing completed, blocked, canceled, and deleted semantics.
Date: 2026-05-04

Decision: Require `daemon start --work --confirm-local-writes` for background queue execution.
Rationale: The local runner may create branches and write approved docs/config artifacts. Worker mode must be explicit at the terminal and should not run queued write jobs from one-shot or heartbeat-only daemon sessions.
Date: 2026-05-04

Decision: Keep PR delivery, managed GitHub, workflow scheduling UX, and new workflow types out of this slice.
Rationale: Work phase needs a reliable local approved queue first. Managed GitHub, PR authority, and additional workflows need their own consent and storage contracts.
Date: 2026-05-04

## Outcomes & Retrospective

This plan is complete. The existing-codebase Work phase now has a real local worker queue path: approved workflow packets can be claimed by the paired daemon through a runner-token API, claimed jobs refresh the active write lease, only one project workflow can be `running`, and the local daemon can execute the supported source-truth workflow with the existing proof sync. `/workspace/runs` now shows worker queue state alongside run history and includes pause, resume, and stop controls. Stopped workflow runs stay stopped even if a late local proof event arrives.

The implementation stayed within the privacy-forward local runner contract. It did not add raw-source upload, raw logs, Codex transcript sync, screenshots, branch pushing, PR opening, managed GitHub, package installs, migrations, or provider setup. Recurring loops are represented as approval-backed jobs entering the same queue; richer scheduling and multiple workflow implementations remain later slices.

## Context and Orientation

The relevant backend surface is `apps/web/convex/workspace.ts` and `apps/web/convex/workspace/model.ts`. The workflow queue uses the existing `workflowRuns` table in `apps/web/convex/schema.ts`. Runner-safe event validation lives in `apps/web/convex/workspace/events.ts`, and document validators live in `apps/web/convex/workspace/validators.ts`.

The runner bridge lives in `apps/web/app/api/workspace/runner/_server/runner-bridge.ts`. The local runner API client lives in `packages/local-runner/src/core/workflow-run-api.ts`, and daemon behavior lives in `packages/local-runner/src/commands/daemon.ts`.

The Work-phase UI is the existing `/workspace/runs` page under `apps/web/app/(workspace)/workspace/runs/page.tsx`, with read models in `apps/web/app/(workspace)/_lib/workspace-support-read-model.ts` and components under `apps/web/app/(workspace)/_components/existing-codebase-support/`.

### In Scope

This slice includes queue-state modeling for approved workflow runs, daemon queue claiming, one active project write lease, pause/resume/stop mutations, terminal event protection, a runner claim API route, local runner claim API support, daemon worker mode for the supported source-truth workflow, and `/workspace/runs` worker queue UI.

### Out Of Scope

This slice does not add managed GitHub, Codex cloud handoff, PR pushing, PR opening, provider access, dependency installs, migrations, raw-source sharing, raw terminal logs, screenshots, Codex transcript sync, a hosted scheduler, or new workflow implementations beyond the existing source-truth workflow.

## Plan of Work

First, extend the workspace backend contract. Add a paused workflow state, a sync-safe claimed event type, daemon-only queue claiming, pause/resume/stop mutations, and terminal-state guards so canceled workflow runs cannot be revived by late runner events.

Next, add the runner bridge and local runner path. Expose a runner-token claim endpoint, add a local client helper for it, and make `daemon start --work --confirm-local-writes` claim one approved job per loop before running the existing source-truth workflow.

Then update `/workspace/runs`. Keep the existing run-history rows, add a worker queue panel driven by the existing run history and setup state, show the daemon worker command, and wire icon controls to the new mutations.

Finally, update tests and docs. Cover the backend state machine, local runner claim client, runs-page queue controls, Program ledger, support notes, and this ExecPlan.

## Milestones

The first milestone was backend queue safety: approved jobs can be claimed by the paired daemon, one active project run is enforced, paused jobs stay out of the claim path, and stopped jobs stay terminal.

The second milestone was local daemon execution: the runner has a claim API client and explicit worker mode that requires local write confirmation before executing queue jobs.

The third milestone was workspace control UI: `/workspace/runs` shows worker queue state, command guidance, pause/resume/stop controls, proof state, and blocked state.

The fourth milestone was validation and documentation: focused tests, broad gates, Program updates, support notes, and plan lint all passed.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Inspect the relevant contracts:

    rg -n "workflowRuns|workflow.started|workflow.proof.completed|daemon start|workflow-runs/resolve" apps/web/convex apps/web/app/api packages/local-runner/src
    rg -n "WorkspaceRunsPage|buildWorkspaceRunsModel|workspace-runs" apps/web/app apps/web/tests

After backend and runner edits, run focused tests:

    bun run --cwd apps/web test:unit -- tests/unit/workspace-runner-events.test.ts tests/unit/workspace-support-read-model.test.ts
    bun test packages/local-runner/tests/workflow-run-api.test.ts packages/local-runner/tests/source-truth-workflow.test.ts

After UI edits, run:

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-runs-page.test.tsx tests/integration-ui/workspace-loops-page.test.tsx tests/integration-ui/workspace-privacy-page.test.tsx

Before completion, run the full validation list in `Validation and Acceptance`.

## Validation and Acceptance

Acceptance requires these behaviors:

- An approved source-truth workflow can be claimed only by the owning paired daemon credential.
- Claiming refreshes the write lease and sets the workflow to `running`.
- A second claim returns no work while a project workflow is already `running`.
- Pause holds approved jobs out of the claimable queue, resume returns them to approved, and stop marks them canceled.
- Late workflow proof events do not resurrect stopped terminal runs.
- `/workspace/runs` shows queue state and controls while continuing to omit PR handoff and managed GitHub execution.

### Test Commands

Validation evidence from 2026-05-04 local:

    bun run --cwd apps/web test:unit -- tests/unit/workspace-runner-events.test.ts tests/unit/workspace-support-read-model.test.ts
    Test Files 2 passed; Tests 20 passed.

    bun test packages/local-runner/tests/workflow-run-api.test.ts
    2 pass; 0 fail.

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-runs-page.test.tsx
    Test Files 1 passed; Tests 2 passed.

Broader validation passed after the final implementation:

    bun run --cwd apps/web format
    bun run --cwd apps/web format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run format
    bun lint
    bun typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-04-existing-codebase-work-phase-workers.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-04-existing-codebase-work-phase-workers.md docs/programs/completed/2026-05-02-customer-agentic-operating-system support-codebases.md
    git diff --check

## Idempotence and Recovery

Queue claim is idempotent at the project level: when a workflow is already running, additional claims return `null` instead of creating another write lease. Pause and stop on terminal runs fail closed or leave terminal state intact. Resume only applies to paused runs. Runner event ingestion remains append-only and idempotent by event id.

If the local daemon crashes after claim, the workflow remains `running` until proof, blocked proof, or a user stop action records the outcome. A later slice can add lease-expiry recovery, but this slice records the active lease and exposes stop controls for operator recovery.

## Artifacts and Notes

Implemented files include:

- `apps/web/convex/workspace.ts`
- `apps/web/convex/workspace/model.ts`
- `apps/web/convex/workspace/validators.ts`
- `apps/web/convex/workspace/events.ts`
- `apps/web/convex/workspace/types.ts`
- `apps/web/app/api/workspace/runner/_server/runner-bridge.ts`
- `apps/web/app/api/workspace/runner/workflow-runs/claim/route.ts`
- `packages/local-runner/src/core/workflow-run-api.ts`
- `packages/local-runner/src/commands/daemon.ts`
- `packages/local-runner/src/cli.ts`
- `apps/web/app/(workspace)/_lib/workspace-support-read-model.ts`
- `apps/web/app/(workspace)/_components/existing-codebase-support/workspace-runs-page.tsx`
- `apps/web/app/(workspace)/_components/existing-codebase-support/workspace-worker-queue-section.tsx`
- `apps/web/app/(workspace)/_components/existing-codebase-support/workspace-worker-queue-row.tsx`
- `apps/web/app/(workspace)/workspace/runs/page.tsx`
- `apps/web/tests/unit/workspace-runner-events.test.ts`
- `apps/web/tests/unit/workspace-support-read-model.test.ts`
- `apps/web/tests/integration-ui/workspace-runs-page.test.tsx`
- `packages/local-runner/tests/workflow-run-api.test.ts`

## Interfaces and Dependencies

The runner claim API is:

    POST /api/workspace/runner/workflow-runs/claim
    Authorization: Bearer <runner token>
    Body: { "projectId": "...", "runnerId": "..." }

It returns either the approved workflow packet or `null` when no claimable approved job exists. The local daemon uses:

    ship-by-sunday daemon start --work --confirm-local-writes

The explicit `--confirm-local-writes` flag is required for worker mode because the currently supported workflow can create a branch and write approved local artifacts.
