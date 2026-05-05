---
title: Workspace Support Surfaces
status: complete
created_at: 2026-05-04
completed_at: 2026-05-04
summary: Build the Crawl and Walk support pages for run history, finding-filtered workflows, and local privacy controls without introducing worker queues.
post_build_recap: Added protected `/workspace/runs`, `/workspace/loops`, and `/workspace/privacy` support surfaces backed by sync-safe workspace read models, focused tests, and existing runner revocation plus synced-finding deletion controls.
program_id: customer-agentic-operating-system
planning_brief: docs/programs/active/2026-05-02-customer-agentic-operating-system/planning-brief-2.md
read_when:
  - Resuming `/workspace/runs`, `/workspace/loops`, or `/workspace/privacy` work.
  - Validating Crawl and Walk support surfaces.
  - Checking existing-codebase privacy, runner revocation, or synced-report deletion boundaries.
---

# Workspace Support Surfaces

This document is a living execution plan for the existing-codebase workspace support slice.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

After setup, doctor pass, findings, and the first source-truth workflow approval, the customer needs support surfaces that explain what already happened and what remains possible. This slice adds `/workspace/runs`, `/workspace/loops`, and `/workspace/privacy` so a buyer can review doctor-pass and workflow history, see the workflow catalog filtered by approved findings, and control local-execution privacy boundaries. The work is visible when the three protected workspace routes render inside the existing app shell, use the existing workspace backend state, and show no queue controls, branch push controls, PR controls, raw source, raw terminal logs, or Codex transcripts.

## Progress

- [x] 2026-05-04 local: Read `AGENTS.md`, `docs/exec-plans/PLANS.md`, the active Program, `planning-brief-2.md`, `plan-split-recommendation.md`, the completed source-truth ExecPlan, support notes, app instructions, release workflow, design guidance, Convex AI guidelines, and current workspace code before writing the plan.
- [x] 2026-05-04 local: Confirmed the current worktree already contains `docs/exec-plans/completed/2026-05-04-source-truth-agent-readiness-workflow.md` and source-truth workflow implementation files, so the next Program child is `workspace-support-surfaces`.
- [x] 2026-05-04 local: Created the active ExecPlan and kept it current while implementing.
- [x] 2026-05-04 local: Added `apps/web/app/(workspace)/_lib/workspace-support-read-model.ts` for run history rows, finding-filtered workflow catalog rows, and privacy status without raw source, raw logs, or transcript fields.
- [x] 2026-05-04 local: Added protected `/workspace/runs`, `/workspace/loops`, and `/workspace/privacy` routes plus feature-local support components under `apps/web/app/(workspace)/_components/existing-codebase-support/`.
- [x] 2026-05-04 local: Wired privacy controls to the existing `revokeWorkspaceRunner` and `markWorkspaceFindingsDeleted` Convex mutations without adding queue, PR, branch push, or managed GitHub controls.
- [x] 2026-05-04 local: Split support components so feature-local TSX files stay at or under 150 lines where clean boundaries exist.
- [x] 2026-05-04 local: Focused validation passed: `bun run --cwd apps/web test:unit -- tests/unit/workspace-support-read-model.test.ts`.
- [x] 2026-05-04 local: Focused integration UI validation passed: `bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-runs-page.test.tsx tests/integration-ui/workspace-loops-page.test.tsx tests/integration-ui/workspace-privacy-page.test.tsx`.
- [x] 2026-05-04 local: Existing workspace privacy/event contract validation passed: `bun run --cwd apps/web test:unit -- tests/unit/workspace-runner-events.test.ts tests/unit/workspace-privacy-contract.test.ts`.
- [x] 2026-05-04 local: App validation passed: `bun run --cwd apps/web format`, `bun run --cwd apps/web format:check`, `bun run --cwd apps/web lint`, and `bun run --cwd apps/web typecheck`.

## Surprises & Discoveries

- 2026-05-04 local: The instruction path `apps/web/node_modules/next/dist/docs/` is not present in this checkout because `apps/web/node_modules/next` does not exist. The relevant App Router docs were available from the hoisted root package at `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md`, `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`, and `node_modules/next/dist/docs/01-app/02-guides/authentication.md`.
- 2026-05-04 local: The first integration UI test draft treated any mention of "queue" as forbidden, but the product copy truthfully says execution does not start from a queue. The final assertion forbids queue-worker controls instead of forbidding explanatory copy.
- 2026-05-04 local: `apps/web typecheck` runs the production Next build and PostHog source-map upload hook in this checkout. The command passed and the route manifest included `/workspace/runs`, `/workspace/loops`, and `/workspace/privacy`.

## Decision Log

Decision: Treat `workspace-support-surfaces` as the next slice instead of recreating `source-truth-agent-readiness-workflow`.
Rationale: The active Program and current worktree already mark source truth as implemented. Continuing with support surfaces follows `planning-brief-2.md` and avoids duplicating completed Walk work.
Date: 2026-05-04

Decision: Build the support pages as read and control surfaces over existing workspace tables.
Rationale: The previous slices already own `doctorPassRuns`, `workflowRuns`, `codebaseFindings`, `workspaceRunnerBindings`, repository bindings, sync-preview state, runner revocation, and synced finding deletion. This slice should compose those contracts rather than invent a second store or a worker queue.
Date: 2026-05-04

## Outcomes & Retrospective

This plan is complete. The existing-codebase workspace now has protected support surfaces for Crawl and Walk. `/workspace/runs` shows doctor-pass and approved workflow history without queue controls or PR handoff. `/workspace/loops` shows a finding-filtered workflow catalog with review links and no direct run-loop buttons. `/workspace/privacy` shows runner identity, repository binding, local execution boundaries, disabled raw sharing defaults, the last sync preview, managed GitHub disabled state, and controls for revoking the runner or hiding synced findings through existing Convex mutations.

The implementation stayed inside existing workspace contracts. It did not add new backend tables, new execution modes, branch creation, PR delivery, worker queues, local file access from the browser, raw source display, raw terminal logs, screenshots, or Codex transcript sharing. The remaining support work belongs to later ExecPlans: recurring worker queues, pause or stop controls, managed GitHub execution, and deeper browser proof for authenticated workspace routes.

## Context and Orientation

The existing-codebase lane now has setup, doctor-pass sync preview, findings ledger, finding detail approval, and source-truth workflow execution in the dirty working tree. Workspace backend exports live in `apps/web/convex/workspace.ts` and are implemented in `apps/web/convex/workspace/model.ts`. The main tables are `workspaceProjects`, `workspaceRunnerBindings`, `workspaceRepositoryBindings`, `doctorPassRuns`, `codebaseFindings`, `workflowRuns`, and `workspaceRunnerEvents` in `apps/web/convex/schema.ts`. Existing workspace pages follow the protected route pattern in `apps/web/app/(workspace)/workspace/setup/page.tsx`, `apps/web/app/(workspace)/workspace/doctor-pass/page.tsx`, and `apps/web/app/(workspace)/workspace/findings/page.tsx`.

The support surfaces are app and dashboard-style operational UI. They should use the existing `AppShell`, the local workspace rail from `buildExistingCodebaseWorkspaceLocalNavModel`, and neutral dense layouts. These are not landing pages, marketing pages, or setup heroes.

Official OpenAI Codex docs checked through the OpenAI developer documentation MCP during planning confirm that Codex security still separates sandbox mode from approval policy and that user config lives under `~/.codex/config.toml` with named profiles and permissions. This slice does not add a new Codex automation path. It only displays the already approved SBS profile, local runner mode, and privacy boundaries.

### In Scope

This plan includes protected routes for `/workspace/runs`, `/workspace/loops`, and `/workspace/privacy`; read models for run history, workflow catalog rows, and privacy status; narrow backend read helpers only if the existing queries cannot safely supply the needed state; UI tests for the three pages; and unit tests proving the read model hides raw source, raw logs, local absolute paths, and Codex transcript material. It also includes runner revocation and synced findings deletion controls when they can be wired to the existing Convex mutations without adding new execution behavior.

### Out Of Scope

This plan does not re-run the doctor pass, regenerate findings, approve sync preview, approve new workflow packets beyond the existing source-truth flow, create branches, push branches, open PRs, create write leases, execute workflows, add managed GitHub, build worker queues, add pause or stop controls for recurring workers, install dependencies, run migrations, read local files from the browser, show raw source, show raw terminal logs, show screenshots, or show Codex transcripts. The later `existing-codebase-work-phase-workers` slice owns recurring approved jobs, queues, and worker controls.

## Plan of Work

First, inspect the existing route and data contracts. Confirm that `api.workspace.getWorkspaceRunHistory`, `api.workspace.getWorkspaceHeartbeatState`, `api.workspace.getWorkspaceSyncPreviewState`, `api.workspace.listWorkspaceFindings`, `api.workspace.revokeWorkspaceRunner`, `api.workspace.markWorkspaceFindingsDeleted`, and `api.workspace.markWorkspaceProjectDeleted` provide enough state for the support pages. If a query shape is missing, add only a narrow read helper that returns redacted workspace state.

Next, add `apps/web/app/(workspace)/_lib/workspace-support-read-model.ts`. It should convert backend documents into three models: a run-history model for doctor-pass and workflow run rows, a workflow catalog model filtered by uploaded findings, and a privacy model showing runner identity, repo binding, last sync preview, disabled raw sharing defaults, deletion controls, and managed GitHub disabled state. Keep all text sync-safe and bounded.

Then add feature-local components under `apps/web/app/(workspace)/_components/existing-codebase-support/`. Suggested files are `workspace-runs-page.tsx`, `workspace-loops-page.tsx`, `workspace-privacy-page.tsx`, and small row or section components if the main components grow too large. The components should render dense rows and status panels, not marketing cards or nested card stacks.

After that, add route files at `apps/web/app/(workspace)/workspace/runs/page.tsx`, `apps/web/app/(workspace)/workspace/loops/page.tsx`, and `apps/web/app/(workspace)/workspace/privacy/page.tsx`. Each route should use `loadWorkspacePageAccess`, redirect generated-codebase buyers to `/codebase`, redirect unresolved buyers to `/workspace/choose`, fetch authenticated Convex state on the server, and pass initial state to the component.

Finally, add tests and validation. Unit tests should prove model derivation and privacy boundaries. Integration UI tests should render the three pages with seeded state and assert that run history, loop catalog, privacy controls, revocation, deletion, and disabled managed GitHub messaging work without exposing prohibited content.

## Milestones

The first milestone is planning and read-model proof. At the end, this ExecPlan exists, `workspace-support-read-model.ts` has tests for run history, workflow catalog, and privacy status, and the model returns only sync-safe display values.

The second milestone is route composition. At the end, `/workspace/runs`, `/workspace/loops`, and `/workspace/privacy` render inside the existing app shell, use the workspace local rail, and show useful empty states when no doctor pass or findings exist.

The third milestone is safe controls. At the end, the privacy page can revoke an active runner and mark synced findings deleted through existing Convex mutations, with local UI feedback and without deleting raw local files or local runner credentials from the browser.

The fourth milestone is validation and plan completion. At the end, focused tests and linters have passed or have exact recorded blockers, the Program is updated if durable contracts changed, and this ExecPlan records the final evidence.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Inspect the current support-relevant surfaces:

    rg -n "getWorkspaceRunHistory|getWorkspaceHeartbeatState|getWorkspaceSyncPreviewState|revokeWorkspaceRunner|markWorkspaceFindingsDeleted" apps/web/convex apps/web/tests
    rg -n "workspaceRuns|workspaceLoops|workspacePrivacy|buildExistingCodebaseWorkspaceLocalNavModel" apps/web/app apps/web/config apps/web/tests

After the read model is implemented, run:

    bun run --cwd apps/web test:unit -- tests/unit/workspace-support-read-model.test.ts

After the UI routes are implemented, run:

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-runs-page.test.tsx tests/integration-ui/workspace-loops-page.test.tsx tests/integration-ui/workspace-privacy-page.test.tsx

Before finishing, run the full command list in `Validation and Acceptance`.

## Validation and Acceptance

The slice is accepted when `/workspace/runs` shows doctor-pass and approved workflow history for Crawl and Walk, `/workspace/loops` shows a finding-filtered workflow catalog with review links and no run buttons, and `/workspace/privacy` shows local execution and sync boundaries with runner revoke and synced finding deletion controls. Acceptance also requires proof that the pages do not expose raw source excerpts, raw terminal logs, local absolute paths, secrets, screenshots, Codex transcripts, queue controls, branch push controls, PR controls, or managed GitHub execution controls.

### Test Commands

Run these commands from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run --cwd apps/web test:unit -- tests/unit/workspace-support-read-model.test.ts
    bun run --cwd apps/web test:unit -- tests/unit/workspace-runner-events.test.ts tests/unit/workspace-privacy-contract.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-runs-page.test.tsx tests/integration-ui/workspace-loops-page.test.tsx tests/integration-ui/workspace-privacy-page.test.tsx
    bun run --cwd apps/web typecheck
    bun run --cwd apps/web lint
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-04-workspace-support-surfaces.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-04-workspace-support-surfaces.md docs/programs/active/2026-05-02-customer-agentic-operating-system support-codebases.md
    git diff --check

Local authenticated browser proof remains limited by the existing Clerk local session-refresh issue recorded in the setup UI plan. The focused integration UI tests cover the rendered route components for desktop-like DOM output and the Next production build proves the routes compile into the app manifest.

## Idempotence and Recovery

All read-model functions should be pure and deterministic for the same input documents. Route fetches should be safe to reload. Runner revocation should be safe to repeat in the sense that a revoked runner remains revoked and no active credential hash is exposed to the browser. Synced findings deletion should mark rows deleted instead of physically removing data, matching the existing privacy contract.

If validation fails, record the exact failing command in `Progress`, fix the focused issue, and rerun the command before moving to broader checks. Do not revert unrelated dirty worktree changes. If a backend query needs to change, keep it read-only and bounded unless the plan explicitly names a mutation already in scope.

## Artifacts and Notes

Implemented app files are `apps/web/app/(workspace)/_lib/workspace-support-read-model.ts`, feature components under `apps/web/app/(workspace)/_components/existing-codebase-support/`, route files under `apps/web/app/(workspace)/workspace/runs/`, `apps/web/app/(workspace)/workspace/loops/`, and `apps/web/app/(workspace)/workspace/privacy/`, plus focused tests under `apps/web/tests/unit/` and `apps/web/tests/integration-ui/`.

Validation evidence from 2026-05-04 local:

    bun run --cwd apps/web test:unit -- tests/unit/workspace-support-read-model.test.ts
    Test Files 1 passed; Tests 3 passed.

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-runs-page.test.tsx tests/integration-ui/workspace-loops-page.test.tsx tests/integration-ui/workspace-privacy-page.test.tsx
    Test Files 3 passed; Tests 5 passed.

    bun run --cwd apps/web test:unit -- tests/unit/workspace-runner-events.test.ts tests/unit/workspace-privacy-contract.test.ts
    Test Files 2 passed; Tests 18 passed.

    bun run --cwd apps/web format:check
    All matched files use the correct format.

    bun run --cwd apps/web lint
    Found 0 warnings and 0 errors.

    bun run --cwd apps/web typecheck
    Passed and included `/workspace/loops`, `/workspace/privacy`, and `/workspace/runs` in the route manifest.

The local command `date +%F` returned `2026-05-04` in this checkout, so this plan uses the local repo date in its filename and front matter.

## Interfaces and Dependencies

This slice depends on Clerk-authenticated existing-codebase product access, hosted Convex workspace state, `fetchAuthenticatedQuery`, `loadWorkspacePageAccess`, `AppShell`, `WorkspaceLocalNavRail`, and the existing workspace Convex exports in `apps/web/convex/workspace.ts`. It consumes but does not change local runner execution behavior. It may call `api.workspace.revokeWorkspaceRunner` and `api.workspace.markWorkspaceFindingsDeleted` from the privacy UI, but it must not call local daemon APIs, access customer files, push branches, open PRs, or create queues.
