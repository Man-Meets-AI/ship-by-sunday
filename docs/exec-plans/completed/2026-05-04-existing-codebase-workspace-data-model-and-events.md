---
title: Existing Codebase Workspace Data Model And Events
status: complete
created_at: 2026-05-04
completed_at: 2026-05-04
summary: Add the durable existing-codebase workspace tables and sync-safe runner event protocol that setup, doctor pass, findings, and workflow screens will derive from.
post_build_recap: Shipped the separate existing-codebase Convex workspace model, sync-safe event validators, workspace queries and mutations, privacy guards, focused tests, and review hardening for internal runner ingestion, revocation, deletion markers, and local-path rejection.
program_id: customer-agentic-operating-system
planning_brief: docs/programs/completed/2026-05-02-customer-agentic-operating-system/planning-brief-2.md
read_when:
  - Implementing Convex state for existing-codebase projects, runner bindings, repository bindings, doctor-pass runs, findings, workflow runs, or runner events.
  - Designing `/workspace/setup`, `/workspace/doctor-pass`, `/workspace/findings`, `/workspace/runs`, `/workspace/loops`, or `/workspace/privacy` data reads.
  - Verifying that local-runner events stay sync-safe and do not upload raw source, logs, local absolute paths, secrets, or Codex transcripts.
---

# Existing Codebase Workspace Data Model And Events

This is a living execution plan. Keep it current as implementation, validation, discoveries, and decisions change.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Existing-codebase support needs durable state before the setup UI and local runner can be trusted. After this change, the app should have a separate Convex-backed workspace model for existing-codebase projects, runner bindings, repository bindings, doctor-pass runs, findings, future workflow runs, and append-only runner events. The user-visible effect is that `/workspace/*` screens can render setup, doctor-pass, findings, run history, loop catalog, and privacy state from backend rows without the browser reading local files or talking directly to the customer's daemon.

This plan creates the state contract only. It does not build the setup UI, local runner, doctor pass, findings ledger, or workflow execution.

## Progress

- [x] 2026-05-04 EDT: Created this child ExecPlan from `planning-brief-2.md`.
- [x] 2026-05-04 EDT: Inspected current Convex schema, generated-codebase tables, access helpers, Codex connection state, codebase module patterns, and unit test style before implementation.
- [x] 2026-05-04 EDT: Added `apps/web/convex/workspace/validators.ts`, `apps/web/convex/workspace/types.ts`, `apps/web/convex/workspace/events.ts`, and `apps/web/convex/workspace/model.ts` with sync-safe validators, discriminated runner event payloads, model types, and runtime privacy guards for direct handler paths.
- [x] 2026-05-04 EDT: Added separate Convex schema tables and indexes for `workspaceProjects`, `workspaceRunnerBindings`, `workspaceRepositoryBindings`, `doctorPassRuns`, `codebaseFindings`, `workflowRuns`, and `workspaceRunnerEvents` without modifying `projectDefinitions` or `codebaseWorkflowStates`.
- [x] 2026-05-04 EDT: Added authenticated `apps/web/convex/workspace.ts` queries and mutations for project creation/loading, runner and repository binding, doctor-pass and workflow run shells, idempotent runner event ingestion, heartbeat and sync-preview reads, findings reads and sync, runner revocation, finding deletion markers, and project deletion markers.
- [x] 2026-05-04 EDT: Added focused unit tests in `apps/web/tests/unit/workspace-data-model.test.ts`, `apps/web/tests/unit/workspace-runner-events.test.ts`, and `apps/web/tests/unit/workspace-privacy-contract.test.ts`, with a small fake Convex test database helper.
- [x] 2026-05-04 EDT: Refreshed the owning Program and this ExecPlan. Validation passed with `bun run --cwd apps/web test:unit -- tests/unit/workspace-data-model.test.ts tests/unit/workspace-runner-events.test.ts tests/unit/workspace-privacy-contract.test.ts`, `bun run --cwd apps/web typecheck`, `bun run --cwd apps/web lint`, `bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-04-existing-codebase-workspace-data-model-and-events.md`, `bun run programs:lint`, `bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-04-existing-codebase-workspace-data-model-and-events.md docs/programs/completed/2026-05-02-customer-agentic-operating-system support-codebases.md`, and `git diff --check`.
- [x] 2026-05-04 EDT: Addressed review-found security and privacy gaps: runner event ingestion is internal for this slice, revoked runners cannot resume by heartbeat, runner events cannot approve sync previews, default findings reads hide deletion markers, and embedded local absolute paths are rejected in sync-safe text.

## Surprises & Discoveries

Typecheck caught that the event schema version helper must return the literal `"workspace.runner-event.v1"` rather than `string`; otherwise inserts into `workspaceRunnerEvents` cannot satisfy the schema-derived table type. The helper in `apps/web/convex/workspace/events.ts` now returns a literal type.

The first backend slice did not need to update `apps/web/content/docs/route-map.mdx` because no visible `/workspace/*` route or success routing changed in this implementation. The durable route contract remains owned by the checkout-intent and setup UI plans.

Review found that a public runner-event mutation was too broad before runner-token auth exists. The slice now registers ingestion as an internal Convex mutation and keeps browser-visible state derived from backend rows and events.

## Decision Log

Decision: Add separate existing-codebase workspace tables instead of overloading generated-codebase tables.
Rationale: `projectDefinitions` and `codebaseWorkflowStates` are generated-codebase state for `/codebase` and review readiness. Existing-codebase setup, runner pairing, repository binding, doctor-pass runs, findings, and workflow runs need a different lifecycle and privacy contract.
Date: 2026-05-04

Decision: Store runner events in an append-only `workspaceRunnerEvents` table.
Rationale: The web app needs live progress and audit history, but Convex guidance warns against storing high-churn operational state on shared profile documents. Append-only events plus durable summary rows let refreshes and reconnects work while avoiding raw browser-daemon coupling.
Date: 2026-05-04

Decision: Store only sync-safe state by default.
Rationale: The existing-codebase promise is local execution by default. Convex should store project identity, fulfillment track, runner status, repo display metadata, setup health, run status, finding metadata, sync preview status, proof status, and deletion or revocation timestamps, not source files, raw logs, local absolute paths, secrets, or Codex transcripts.
Date: 2026-05-04

Decision: Add new tables directly rather than a widen-migrate-narrow migration.
Rationale: This slice creates greenfield existing-codebase tables. Existing generated-codebase data does not need migration. If the checkout-intent plan adds required fields to existing tables, that plan owns its own optional-field compatibility.
Date: 2026-05-04

Decision: Use `workspaceRunnerBindings` document ids as the `runnerId` in runner events.
Rationale: The first backend contract needs a stable runner identifier without accepting a client-provided ownership id. A Convex runner binding id is scoped through the authenticated viewer's project before event ingestion, so runner events can reference `runnerId` while authorization still comes from server-derived user access.
Date: 2026-05-04

Decision: Include a narrow `syncApprovedCodebaseFindings` mutation in the data/events slice.
Rationale: The doctor-pass plan will own real probe execution and upload orchestration, but the backend privacy contract must already prove that uploaded findings require an approved sync preview and reject raw source, raw logs, local absolute paths, full Markdown reports, secrets, and transcript-like fields. Keeping this mutation narrow gives later runner work a tested destination without implementing the doctor pass here.
Date: 2026-05-04

Decision: Keep sync preview approval user-owned and keep runner ingestion internal until runner-token auth exists.
Rationale: The browser must not be able to forge runner, setup, doctor, workflow, or approval progress. Runner events can report sync-preview readiness, but approval must go through `approveWorkspaceSyncPreview`; revoked runner bindings are rejected before derived state can be patched.
Date: 2026-05-04

## Outcomes & Retrospective

This plan is complete. The app now has separate existing-codebase workspace tables for projects, runner bindings, repository bindings, doctor-pass runs, findings, workflow runs, and append-only runner events. The implementation added validators, domain types, model helpers, sync-safe event payloads, authenticated workspace functions, idempotent event ingestion, privacy guards, runner revocation, finding deletion markers, and sync-preview approval boundaries without overloading generated-codebase tables.

The review pass tightened the security posture: runner event ingestion stayed internal until runner-token auth existed, revoked runners cannot resume by heartbeat, runner events cannot approve sync previews, deleted findings are hidden by default, and embedded local absolute paths are rejected in sync-safe text.

## Context and Orientation

Convex schema lives in `apps/web/convex/schema.ts`. Validators currently live near their feature modules, such as `apps/web/convex/access/validators.ts`, `apps/web/convex/codebase/validators.ts`, and `apps/web/convex/codexValidators.ts`. Generated-codebase state lives in `projectDefinitions` and `codebaseWorkflowStates`; those tables must stay focused on `/codebase`.

The existing product access helpers live in `apps/web/convex/access/model.ts`. New public queries and mutations must derive the authenticated user server-side through existing access checks. Do not accept `clerkUserId`, `userId`, or any ownership identifier as a client argument for authorization. Follow `apps/web/convex/_generated/ai/guidelines.md`: every function needs argument and return validators, schema indexes must name their fields, unbounded child lists belong in separate tables, and high-churn operational data should not be stored on stable documents.

The current Codex connection table is `codexConnections`. This plan should not merge local runner state into `codexConnections`; Codex connection tells whether the account/app-server connection exists, while runner bindings tell whether a specific local machine is paired to an existing-codebase project.

Before implementing, read `apps/web/AGENTS.md`, `apps/web/convex/_generated/ai/guidelines.md`, `docs/release-workflow.md`, `docs/programs/completed/2026-05-02-customer-agentic-operating-system/planning-brief-2.md`, and `docs/exec-plans/completed/2026-05-04-existing-codebase-checkout-intent-routing.md`.

### In Scope

This plan includes Convex schema additions, validators, server-side model helpers, public and internal Convex functions, tests, route-map documentation, and Program/ExecPlan updates for existing-codebase workspace state.

The first table set should include `workspaceProjects`, `workspaceRunnerBindings`, `workspaceRepositoryBindings`, `doctorPassRuns`, `codebaseFindings`, `workflowRuns`, and `workspaceRunnerEvents`. `workflowRuns` can be minimal in this slice, but the table should exist if the event protocol needs stable references before Walk implementation.

This plan includes the first event protocol: `runner.paired`, `runner.heartbeat`, `setup.check.started`, `setup.check.completed`, `doctor.stage.started`, `doctor.probe.completed`, `doctor.sync_preview.ready`, `workflow.approval.requested`, `workflow.started`, `workflow.proof.completed`, `workflow.blocked`, and `runner.revoked`. Sync preview approval is intentionally not accepted as a runner-ingested event in this slice; the user-owned `approveWorkspaceSyncPreview` mutation owns that transition.

### Out Of Scope

This plan does not implement checkout intent routing, `/workspace/setup` UI, local runner CLI or daemon, pairing token generation UI, one-shot mode, Codex profile installation, doctor-pass probes, `.sbs/` report writing, findings upload from a real runner, workflow approval UI, write leases, branch creation, PR delivery, recurring worker queues, managed GitHub, or generated-repo operating pack work.

This plan must not store raw source, raw terminal logs, local absolute paths, secrets, full Codex transcripts, screenshots with sensitive content, or full local Markdown reports in Convex by default.

## Plan of Work

First, create a `workspace` Convex module under `apps/web/convex/workspace/` with validators, types, and model helpers. Keep names domain-specific: `workspaceProject`, `workspaceRunnerBinding`, `workspaceRepositoryBinding`, `doctorPassRun`, `codebaseFinding`, `workflowRun`, and `workspaceRunnerEvent`. Avoid vague generic names like `data`, `misc`, or `handler`.

Next, update `apps/web/convex/schema.ts` with additive tables. Because these are new tables, no existing data migration is required. Use indexes that match the reads the app will need: project by clerk user and status, runner bindings by project and status, repository bindings by project and status, doctor runs by project and started time, findings by project and status, workflow runs by project and status, events by project and created time, and events by event id for dedupe. Keep index names explicit, such as `by_project_id_and_status`.

Then implement narrow authenticated functions. The first read model should let the web app fetch the current workspace project summary, setup health summary, latest doctor-pass run, Top 9 findings, run history, and privacy/sync status. The first write model should let authorized code create a project shell, bind or revoke a runner, bind repository display metadata, ingest sync-safe events idempotently, mark a sync preview approved, mark findings deleted, and mark a runner revoked. Use internal functions for trusted webhook or runner-token flows when those exist; do not expose sensitive ingestion as a broad public mutation without an authorization story.

After that, implement event payload validators as discriminated unions rather than loose records. Every event should include `eventId`, `projectId`, `runnerId` or runner binding id, `runId` when applicable, `eventType`, `createdAt`, `schemaVersion`, `receivedAt`, and a narrow payload. Heartbeat events may update a small summary field such as `lastHeartbeatAt`, but the append-only event remains the audit source. Use a dedicated event table for high-churn event writes.

Finally, add tests and docs. Tests should prove authorization, route separation from generated-codebase state, schema validation, idempotent event ingestion by event id, unsafe payload rejection, derived summary state, revocation behavior, and deletion markers. Update `apps/web/content/docs/route-map.mdx` only for durable route/data contract changes, and refresh the Program and this ExecPlan after validation.

## Milestones

The first milestone is schema and validators. It is complete when the new table definitions and validators exist, generated types are usable, and no generated-codebase table is modified for existing-codebase project state.

The second milestone is authenticated model functions. It is complete when a signed-in entitled user can create or load an existing-codebase workspace project and read stable summaries, while unauthenticated or unauthorized calls are rejected.

The third milestone is sync-safe event ingestion. It is complete when typed runner events can be inserted idempotently, unsafe payload shapes are rejected, and derived summary fields update without storing raw local data.

The fourth milestone is read models for future UI. It is complete when setup, doctor-pass, findings, runs, loops, and privacy screens have enough backend query shape to render placeholder or future real UI without daemon access.

The fifth milestone is validation and Program refresh. It is complete when focused Convex tests, typecheck, lint, plan lint, Program lint, markdown lint, and diff checks pass, and this ExecPlan records the evidence.

## Concrete Steps

From the repo root, inspect the current state before implementation:

    sed -n '1,260p' apps/web/convex/schema.ts
    sed -n '1,220p' apps/web/convex/access/model.ts
    sed -n '1,180p' apps/web/convex/access/validators.ts
    sed -n '1,180p' apps/web/convex/codebase/validators.ts
    sed -n '1,180p' apps/web/convex/codex.ts
    sed -n '1,180p' apps/web/convex/codexValidators.ts

Read required local docs before changing Convex code:

    sed -n '1,220p' apps/web/AGENTS.md
    sed -n '1,260p' apps/web/convex/_generated/ai/guidelines.md
    sed -n '1,220p' docs/release-workflow.md
    sed -n '1,220p' docs/exec-plans/completed/2026-05-04-existing-codebase-checkout-intent-routing.md

Implement the schema and functions in additive files. Expected ownership is:

    apps/web/convex/schema.ts
    apps/web/convex/workspace/validators.ts
    apps/web/convex/workspace/types.ts
    apps/web/convex/workspace/model.ts
    apps/web/convex/workspace/events.ts
    apps/web/convex/workspace.ts

Add focused tests under the existing test layout. Exact filenames can change during implementation, but keep tests close to these names:

    apps/web/tests/unit/workspace-data-model.test.ts
    apps/web/tests/unit/workspace-runner-events.test.ts
    apps/web/tests/unit/workspace-privacy-contract.test.ts

Run focused validation:

    bun run --cwd apps/web test:unit -- tests/unit/workspace-data-model.test.ts tests/unit/workspace-runner-events.test.ts tests/unit/workspace-privacy-contract.test.ts
    bun run --cwd apps/web typecheck
    bun run --cwd apps/web lint

Run planning validation:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-04-existing-codebase-workspace-data-model-and-events.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-04-existing-codebase-workspace-data-model-and-events.md docs/programs/completed/2026-05-02-customer-agentic-operating-system support-codebases.md
    git diff --check

If the implementation needs live Convex proof, use hosted Convex dev only. Do not switch this repo to Convex local mode.

## Validation and Acceptance

The implementation is accepted when existing-codebase state is stored in dedicated tables and future `/workspace/*` screens can derive their state from backend queries and append-only events. A test should prove that a generated-codebase `projectDefinitions` row is not required for an existing-codebase workspace project and that existing-codebase project state does not mutate generated-codebase facts.

Event ingestion is accepted when duplicate `eventId` values are idempotent, unsupported event types fail validation, and payloads containing raw source, raw logs, local absolute paths, secrets, or transcript-like fields are rejected or impossible to express through validators.

Privacy is accepted when synced findings and events can represent repo-relative evidence refs, command names, statuses, artifact ids, blocked reasons, local report refs, and proof summaries without storing source excerpts or full Markdown reports.

### Test Commands

Run these commands from the repo root:

    bun run --cwd apps/web test:unit -- tests/unit/workspace-data-model.test.ts tests/unit/workspace-runner-events.test.ts tests/unit/workspace-privacy-contract.test.ts
    bun run --cwd apps/web typecheck
    bun run --cwd apps/web lint
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-04-existing-codebase-workspace-data-model-and-events.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-04-existing-codebase-workspace-data-model-and-events.md docs/programs/completed/2026-05-02-customer-agentic-operating-system support-codebases.md
    git diff --check

If implementation adds visible placeholder routes or reads from these queries in UI, add the narrow integration or integration-ui tests for those routes before completion.

## Idempotence and Recovery

Adding new tables is additive and can be rerun safely. If an implementation accidentally modifies generated-codebase table behavior, revert that portion and add a regression test proving separation.

Event ingestion must be idempotent by `eventId`. A retried local runner event should not create duplicate progress rows or double-count findings.

Revocation and deletion should be marker-based in this slice. Prefer `revokedAt`, `deletedAt`, or status transitions over hard deletes so support and audit behavior stay recoverable. Actual purge mechanics can be a later privacy/export plan.

If a field is likely to grow without bound, move it to a child table instead of storing it in an array on a shared document. This is especially important for events, findings, proof entries, and run history.

## Artifacts and Notes

Owning Program: `docs/programs/completed/2026-05-02-customer-agentic-operating-system/program.md`.

Planning brief: `docs/programs/completed/2026-05-02-customer-agentic-operating-system/planning-brief-2.md`.

Prior child plan: `docs/exec-plans/completed/2026-05-04-existing-codebase-checkout-intent-routing.md`.

Scratch note: `support-codebases.md`.

The canonical existing-codebase object is a `finding`, not an `opportunity`.

## Interfaces and Dependencies

This plan depends on `apps/web/AGENTS.md`, `docs/release-workflow.md`, `apps/web/convex/_generated/ai/guidelines.md`, `apps/web/convex/schema.ts`, `apps/web/convex/access/model.ts`, `apps/web/convex/access/validators.ts`, `apps/web/convex/codebase/validators.ts`, `apps/web/convex/codex.ts`, `apps/web/convex/codexValidators.ts`, `apps/web/content/docs/route-map.mdx`, `docs/exec-plans/completed/2026-05-04-existing-codebase-checkout-intent-routing.md`, `docs/programs/completed/2026-05-02-customer-agentic-operating-system/planning-brief-2.md`, and the future workspace setup, doctor-pass, findings, runs, loops, privacy, local runner, and workflow approval ExecPlans.
