---
title: Broken App Rescue Loop
status: complete
created_at: 2026-05-04
completed_at: 2026-05-04
summary: Add the conditional broken-app rescue workflow that starts with approved read-only diagnostics, local proof, and a later patch boundary.
post_build_recap: Added `broken-app-triage` as a supported workflow packet, approval-sheet variant, local runner read-only diagnostics executor, daemon worker dispatch path, Top 9 recommendation hook, sync-safe proof artifacts, and focused tests without adding source patching, package-script execution, PRs, installs, migrations, or raw-log/source sync.
program_id: customer-agentic-operating-system
planning_brief: docs/programs/active/2026-05-02-customer-agentic-operating-system/planning-brief-2.md
read_when:
  - Reviewing broken-app rescue, concrete-failure triage, or read-only diagnostics behavior.
  - Extending `broken-app-triage` into a later patch-approval workflow.
  - Validating workflow approval, daemon dispatch, or local runner proof boundaries.
---

# Broken App Rescue Loop

This document is the completed execution plan for the first broken-app rescue loop slice.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Customers who arrive with a failing route, command, build, checkout, auth flow, or runtime error need Ship by Sunday to prove it can handle failure evidence before it edits their repo. This slice makes `broken-app-triage` a conditional workflow that starts with approved read-only diagnostics, writes local proof under `.sbs/runs/<workflow-run-id>/`, syncs only structured status, and explicitly stops before source patching. The work is complete when the browser can approve a broken-app workflow, the local runner or daemon can run its bounded read-only diagnostic commands, and the proof records whether reproduction was blocked without pushing code, opening a PR, installing packages, running migrations, or uploading raw logs/source.

## Progress

- [x] 2026-05-04 local: Confirmed the active Program's next slice was `broken-app-rescue-loop` and read the ExecPlan and Program contracts before closing the slice.
- [x] 2026-05-04 local: Extended the workspace approval read model so `broken-app-triage` gets a distinct read-only approval packet, profile, branch name, touch boundary, stop conditions, and expected outputs.
- [x] 2026-05-04 local: Updated the finding approval sheet so broken-app findings show `Run read-only diagnostics` and print the exact local runner command with `--confirm-read-only-reproduction`.
- [x] 2026-05-04 local: Extended workspace workflow approval and runner credential resolution to support `source-truth-agent-readiness` and `broken-app-triage` as the supported workflows.
- [x] 2026-05-04 local: Added `packages/local-runner/src/core/broken-app-triage-workflow.ts`, which runs approved read-only Git diagnostics, writes local proof and sync preview artifacts, queues sync-safe runner events, and blocks unsupported package-script reproduction attempts.
- [x] 2026-05-04 local: Updated the local runner `workflow` command, daemon worker dispatch, CLI help, and workflow packet API so `broken-app-triage` can run directly or from the approved worker queue.
- [x] 2026-05-04 local: Updated the Top 9 recommendation prompt so concrete failures recommend `broken-app-triage` before patching.
- [x] 2026-05-04 local: Added focused unit, integration UI, and local-runner tests for broken-app approval, credential resolution, UI command copy, read-only proof artifacts, and blocked unsupported commands.
- [x] 2026-05-04 local: Updated Program and support docs, then ran focused tests, broad gates, plan lint, Program lint, markdown lint, and diff whitespace checks. Exact validation commands are recorded in `Validation and Acceptance`.

## Surprises & Discoveries

- 2026-05-04 local: The existing approval sheet could be generalized without adding a second component. Keeping one approval sheet and varying labels/copy by `workflowKind` avoided duplicate workflow approval UI.
- 2026-05-04 local: Read-only reproduction still needs a workflow branch name in the packet because the queue and proof model already expects one, but the local runner intentionally does not create or switch to that branch in this phase.
- 2026-05-04 local: Package scripts, tests, builds, provider CLIs, migrations, and networked reproduction commands are not executed in this phase. They require a later command policy or sandboxed approval boundary.

## Decision Log

Decision: Make `broken-app-triage` a read-only diagnostics workflow first.
Rationale: Reproducing a customer's concrete failure is the trust-building step before repair. Source edits, dependency installs, migrations, PRs, raw logs, and raw source require a later approval boundary.
Date: 2026-05-04

Decision: Allow only a narrow proof-command set in the first broken-app workflow.
Rationale: The runner can safely summarize `git status --short` and `git diff --name-only`. Package scripts already present in `package.json` are still arbitrary local programs, so unsupported commands block instead of being interpreted as shell text.
Date: 2026-05-04

Decision: Reuse the approved workflow queue and daemon dispatch path.
Rationale: The Work-phase queue already owns runner credentials, one active lease, proof sync, and blocked-state reporting. Adding a second queue would create drift before there is a need for a separate scheduler.
Date: 2026-05-04

Decision: Sync only structured proof status from broken-app reproduction.
Rationale: Failing commands often contain sensitive environment details, paths, or stack traces. Local proof can preserve command summaries, but the hosted app should receive statuses, command names, branch/profile identity, blocked reason, touched files, and next recommendation only.
Date: 2026-05-04

## Outcomes & Retrospective

This plan is complete. `broken-app-triage` is now a supported workflow from Top 9 recommendation through browser approval, backend workflow packet creation, runner credential resolution, direct local runner execution, and daemon worker queue dispatch. The approval sheet tells the customer the first phase is read-only, the command requires `--confirm-read-only-reproduction`, and the proof writes local artifacts under `.sbs/runs/<workflow-run-id>/`.

The implementation stayed within the intended rescue boundary. It does not patch source files, create or switch Git branches, push, open PRs, install dependencies, run migrations, call provider CLIs, upload raw source, upload raw logs, or sync Codex transcripts. Later repair work should build on this proof packet and request explicit patch approval as a separate workflow phase.

## Context and Orientation

Broken-app rescue begins when a synced Top 9 finding carries `recommendedWorkflowId: "broken-app-triage"`. The finding detail page uses `apps/web/app/(workspace)/_lib/workspace-findings-read-model.ts` to derive the approval packet and `apps/web/app/(workspace)/_components/existing-codebase-findings/workspace-source-truth-approval-sheet.tsx` to render the approval sheet. The backend creates and resolves approved workflow packets in `apps/web/convex/workspace/model.ts`.

The local runner workflow contract lives in `packages/local-runner/src/core/workflow-run-api.ts`. The direct CLI command is handled by `packages/local-runner/src/commands/workflow.ts`, daemon queue dispatch is handled by `packages/local-runner/src/commands/daemon.ts`, and the broken-app proof executor lives in `packages/local-runner/src/core/broken-app-triage-workflow.ts`.

### In Scope

This slice includes the `broken-app-triage` workflow id, browser approval copy, backend workflow packet support, runner credential resolution, direct local runner command, daemon worker dispatch, local `.sbs` proof artifacts, sync-safe proof and blocked events, Top 9 recommendation wording, tests, Program updates, and support docs.

### Out Of Scope

This slice does not include source patches, automatic repair, branch checkout, branch push, PR creation, managed GitHub execution, Codex cloud handoff, package script execution, package installs, dependency upgrades, migrations, provider CLIs, browser automation, screenshots, raw-source sync, raw-log sync, or Codex transcript sync.

## Plan of Work

First, teach the workspace approval model that `broken-app-triage` is a supported workflow with a different customer promise from `source-truth-agent-readiness`. The UI should show the read-only boundary and generate the local command with `--confirm-read-only-reproduction`.

Next, extend the backend workflow packet path. `requestWorkspaceWorkflowRunHandler`, runner credential resolution, and the shared workflow packet assertion should accept `broken-app-triage` while still rejecting unknown workflow ids.

Then add the local runner executor. It should verify the workflow id, require explicit read-only confirmation, enforce a clean worktree, run only approved read-only Git diagnostics, summarize command results without raw logs, write local proof and sync preview JSON, and send `workflow.proof.completed` or `workflow.blocked`.

Finally, update daemon dispatch, CLI help, Top 9 recommendation wording, focused tests, Program truth, support docs, and validation receipts.

## Milestones

The first milestone was workflow approval support: a broken-app finding produces a read-only approval model, the browser renders the correct command, and the backend creates a supported workflow packet.

The second milestone was local execution: the runner can execute a broken-app reproduction packet directly, write proof locally, and block unsupported command sets without touching source files.

The third milestone was worker integration: the daemon can claim a queued `broken-app-triage` workflow and route it to the read-only executor.

The fourth milestone was validation and documentation: focused tests, broad gates, Program updates, support notes, and this completed ExecPlan all passed.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Inspect the relevant contracts:

    rg -n "source-truth-agent-readiness|broken-app-triage|workflowKind|ApprovedWorkflowRunPacket" apps/web packages/local-runner
    rg -n "recommendedWorkflowId|proofCommands|workflow-runs" apps/web/convex apps/web/tests packages/local-runner/tests

After approval, backend, and runner edits, run focused tests:

    bun run --cwd apps/web test:unit -- tests/unit/workspace-findings-read-model.test.ts tests/unit/workspace-runner-events.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-finding-detail-page.test.tsx
    bun test packages/local-runner/tests/broken-app-triage-workflow.test.ts packages/local-runner/tests/workflow-run-api.test.ts packages/local-runner/tests/source-truth-workflow.test.ts

Before completion, run the full validation list in `Validation and Acceptance`.

## Validation and Acceptance

Acceptance requires these behaviors:

- A finding with `recommendedWorkflowId: "broken-app-triage"` renders a read-only approval sheet and creates an approved `broken-app-triage` workflow run.
- The approval sheet shows the `sbs-doctor-readonly` profile, the expected local artifacts, the read-only command, and the later patch boundary.
- The local runner refuses to run without `--confirm-read-only-reproduction`.
- The local runner writes local proof artifacts under `.sbs/runs/<workflow-run-id>/` and does not create a branch or change source files.
- Package scripts are blocked in this phase instead of being treated as read-only reproduction commands.
- Unsupported proof commands produce blocked proof instead of running arbitrary shell.
- The daemon can dispatch a claimed `broken-app-triage` workflow through the same approved worker queue.

### Test Commands

Validation evidence from 2026-05-04 local:

    bun run --cwd apps/web test:unit -- tests/unit/workspace-findings-read-model.test.ts tests/unit/workspace-runner-events.test.ts
    Test Files 2 passed; Tests 23 passed.

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-finding-detail-page.test.tsx
    Test Files 1 passed; Tests 3 passed.

    bun test packages/local-runner/tests/broken-app-triage-workflow.test.ts packages/local-runner/tests/workflow-run-api.test.ts packages/local-runner/tests/source-truth-workflow.test.ts
    9 pass; 0 fail.

Broader validation passed after the final implementation:

    bun run format
    bun run --cwd apps/web format:check
    bun lint
    bun typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-04-broken-app-rescue-loop.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-04-broken-app-rescue-loop.md docs/programs/active/2026-05-02-customer-agentic-operating-system support-codebases.md
    git diff --check

## Idempotence and Recovery

The workflow writes only under `.sbs/runs/<workflow-run-id>/` and can be rerun for the same approved packet to replace local proof artifacts for that run. It does not create a branch, switch branches, patch source files, execute package scripts, install packages, or run migrations. If no approved read-only diagnostic command can run, the workflow records a blocked proof instead of trying a fallback shell command.

If a reproduction command times out, the local runner records a blocked proof with the command name and timeout summary. If the customer later wants repair, a later workflow should consume the local proof packet and ask for explicit patch approval before any writes.

## Artifacts and Notes

Implemented files include:

- `apps/web/app/(workspace)/_lib/workspace-findings-read-model.ts`
- `apps/web/app/(workspace)/_components/existing-codebase-findings/workspace-source-truth-approval-sheet.tsx`
- `apps/web/convex/workspace/model.ts`
- `packages/local-runner/src/core/workflow-run-api.ts`
- `packages/local-runner/src/core/broken-app-triage-workflow.ts`
- `packages/local-runner/src/commands/workflow.ts`
- `packages/local-runner/src/commands/daemon.ts`
- `packages/local-runner/src/cli.ts`
- `packages/local-runner/src/core/source-truth-workflow.ts`
- `packages/local-runner/src/core/doctor-pass/top-nine.ts`
- `packages/local-runner/tests/broken-app-triage-workflow.test.ts`
- `apps/web/tests/unit/workspace-findings-read-model.test.ts`
- `apps/web/tests/unit/workspace-runner-events.test.ts`
- `apps/web/tests/integration-ui/workspace-finding-detail-page.test.tsx`
- `docs/programs/active/2026-05-02-customer-agentic-operating-system/program.md`
- `support-codebases.md`

The customer-visible direct command is:

    bunx ship-by-sunday workflow broken-app-triage run --workflow-run-id <id> --confirm-read-only-reproduction

## Interfaces and Dependencies

The supported workflow ids are now:

    source-truth-agent-readiness
    broken-app-triage

The local runner entry point for broken-app rescue is:

    runBrokenAppTriageWorkflow({
      repositoryRoot,
      workflowRunId,
      apiBaseUrl,
      runnerCredential,
      confirmReadOnlyReproduction: true,
    })

The executor depends on the approved workflow packet from the hosted runner API, the repo-local `.sbs` state directory, the existing package manager scripts in `package.json`, and the runner event outbox. It intentionally does not depend on managed GitHub, PR authority, migrations, provider credentials, or raw-source upload.
