---
title: Source Truth Agent Readiness Workflow
status: complete
created_at: 2026-05-04
completed_at: 2026-05-04
summary: Let existing-codebase customers approve and run the first low-risk source-truth workflow from a finding decision screen, with local branch proof and sync-safe workflow state.
post_build_recap: The finding detail screen now creates an approved source-truth workflow run, Convex stores approval and lease metadata, and the local runner can create the branch, write source-truth proof artifacts, update AGENTS.md after terminal confirmation, and sync safe proof events.
program_id: customer-agentic-operating-system
planning_brief: docs/programs/completed/2026-05-02-customer-agentic-operating-system/planning-brief-2.md
read_when:
  - Resuming the source-truth workflow slice.
  - Validating first-workflow approval, runner execution, or proof sync.
  - Reviewing existing-codebase Walk phase boundaries.
---

# Source Truth Agent Readiness Workflow

This document is a living execution plan for the first approved write workflow in the existing-codebase lane.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

After the doctor pass and findings ledger, a customer needs one concrete next step: approve a small, low-risk workflow that makes later agent work safer. This slice turns the `source-truth-agent-readiness` finding into an approval sheet, records the approval and write lease, gives the customer a local runner command, creates a local branch only after approval, writes source-truth artifacts, and syncs only safe proof metadata back to the workspace. It works when `/workspace/findings/[findingId]` shows the exact branch, profile, lease, allowed and disallowed touch targets, proof commands, and runner command, and when the local runner can execute that workflow into local proof without opening a PR.

## Progress

- [x] 2026-05-04 EDT: Read repo, Program, ExecPlan, app, design, Convex, Next, and OpenAI Codex docs needed for this slice.
- [x] 2026-05-04 EDT: Created this active ExecPlan from the Program's `source-truth-agent-readiness` Walk contract.
- [x] 2026-05-04 EDT: Implemented workflow approval persistence and write lease metadata in Convex by extending `workflowRuns` and `requestWorkspaceWorkflowRun`.
- [x] 2026-05-04 EDT: Replaced the finding detail placeholder with the approval sheet, durable mutation call, and `bunx` or `npx` local runner command handoff.
- [x] 2026-05-04 EDT: Added the local runner `workflow source-truth-readiness run` command with dirty-state blocking, branch creation, local proof artifacts, terminal confirmation for `AGENTS.md`, and sync-safe workflow events.
- [x] 2026-05-04 EDT: Added focused tests for the findings read model, finding detail UI approval, Convex workflow approval and event state, and local runner source-truth proof.
- [x] 2026-05-04 EDT: Validation passed: `bun run --cwd packages/local-runner test`, `bun run --cwd packages/local-runner test -- tests/source-truth-workflow.test.ts`, `bun run --cwd packages/local-runner lint`, `bun run --cwd packages/local-runner typecheck`, `bun run --cwd packages/local-runner format:check`, `bun run --cwd packages/local-runner build`, `bun run --cwd packages/local-runner package:smoke`, `bun run --cwd packages/local-runner ship-by-sunday -- --help`, `bun run --cwd apps/web test:unit -- tests/unit/workspace-findings-read-model.test.ts`, `bun run --cwd apps/web test:unit -- tests/unit/workspace-runner-events.test.ts`, `bun run --cwd apps/web test:unit -- tests/unit/workspace-privacy-contract.test.ts`, `bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-finding-detail-page.test.tsx`, `bun run --cwd apps/web lint`, `bun run --cwd apps/web format:check`, and `bun run --cwd apps/web typecheck`.
- [x] 2026-05-04 EDT: Planning validation passed: `bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-04-source-truth-agent-readiness-workflow.md`, `bun run programs:lint`, `bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-04-source-truth-agent-readiness-workflow.md docs/programs/completed/2026-05-02-customer-agentic-operating-system support-codebases.md`, and `git diff --check`.
- [x] 2026-05-04 EDT: Browser proof was not run because the route is protected and requires a live authenticated existing-codebase workspace with approved findings and a paired runner. The integration UI test renders the actual decision component with seeded findings, runner ids, and mutation calls across the approval path.

## Surprises & Discoveries

- The handoff prompt named `bun run --cwd apps/web test:integration-ui`, but the repo script is `test:integration:ui`. The equivalent command `bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-finding-detail-page.test.tsx` passed.
- `apps/web typecheck` runs the serialized Next production build path and uploaded PostHog source maps because the local environment contains PostHog credentials. The command completed successfully.

## Decision Log

Decision: Use the existing `workflowRuns` table rather than creating a second workflow store.
Rationale: The workspace backend already models workflow runs and runner workflow events. Extending that table preserves the current data contract and keeps `/workspace/runs` ready for the later run-history slice.
Date: 2026-05-04

Decision: The browser approval creates an approved workflow run and returns a terminal command instead of starting local runner work directly.
Rationale: The browser cannot safely mutate a customer's local repository. The approval is durable in Convex, while the local runner remains the enforcement point for branch creation, writes, proof, and sync-safe event upload.
Date: 2026-05-04

Decision: Include `--branch-name` and `--profile` in the local runner command.
Rationale: The approval sheet shows an exact branch and profile. Passing them to the runner prevents the local command from recomputing a different branch timestamp and keeps the terminal boundary aligned with the approved Convex run.
Date: 2026-05-04

## Outcomes & Retrospective

The slice now completes the first Walk workflow boundary. `/workspace/findings/[findingId]` shows a concrete source-truth approval sheet with branch, SBS profile, 30 minute write lease, allowed and disallowed touch targets, proof commands, sync policy, stop conditions, and rollback note. Pressing `Create branch and run workflow` creates or returns an approved Convex workflow run and displays both `bunx` and `npx` local runner commands. Convex stores approval audit metadata, write lease metadata, local artifact refs, proof command lists, and later proof summaries on the existing `workflowRuns` table, and workflow events update the related finding to `running`, `done`, or `blocked`.

The local runner now supports `ship-by-sunday workflow source-truth-readiness run --workflow-run-id <id> --branch-name <name> --profile sbs-workspace-write --confirm-local-writes`. It blocks on a dirty worktree before branch creation, writes blocked proof when blocked, creates or reuses the approved branch when clean, writes `.sbs/runs/<workflow-run-id>/workflow-packet.json`, `.sbs/runs/<workflow-run-id>/proof.json`, `.sbs/runs/<workflow-run-id>/sync-preview.json`, `.sbs/source-truth/command-proof-map.json`, and updates root `AGENTS.md` only after terminal confirmation. It syncs workflow status, touched repo-relative refs, artifact refs, proof command names and statuses, and next recommendation, but not raw source, command logs, local absolute paths, Codex transcripts, pushes, or PRs.

## Context and Orientation

The previous slices created the protected existing-codebase workspace, runner pairing, doctor pass, findings upload, and findings decision screens. The next Program step is Walk: one approved write workflow that is safer than runtime code changes and improves future agent work. A workflow packet is the concrete boundary for an approved workflow: it names the workflow id and version, project, runner, profile, write lease, branch, allowed writes, disallowed writes, proof commands, sync policy, stop conditions, local artifacts, and rollback notes.

The app surfaces live under `apps/web/app/(workspace)/workspace/findings/` and `apps/web/app/(workspace)/_components/existing-codebase-findings/`. The findings read model lives at `apps/web/app/(workspace)/_lib/workspace-findings-read-model.ts`. The workspace backend is exported from `apps/web/convex/workspace.ts` and implemented in `apps/web/convex/workspace/model.ts`, with validators in `apps/web/convex/workspace/validators.ts` and schema fields in `apps/web/convex/schema.ts`. The local runner CLI lives under `packages/local-runner/src/cli.ts`, command modules under `packages/local-runner/src/commands/`, runner event queueing under `packages/local-runner/src/core/runner-events.ts`, and repo-local non-secret state under `packages/local-runner/src/core/local-project-state.ts`.

OpenAI Codex behavior for this slice stays inside the existing local runner boundaries. Official OpenAI docs say `codex exec --json` is the non-interactive automation surface and emits JSONL events on stdout. They also define user-level `~/.codex/config.toml` profiles under `[profiles.<name>]`, named permissions under `[permissions.<name>]`, profile sandbox mode, and `default_permissions`. This slice does not need a new Codex execution path; it uses the approved SBS profile name as a workflow boundary and keeps PR delivery for a later explicit approval.

### In Scope

This plan covers the first approved workflow after the findings ledger: `source-truth-agent-readiness`. It includes a compact approval sheet in `/workspace/findings/[findingId]`, durable workflow approval metadata in Convex, a 30 minute write lease with one runner-local workflow run boundary, branch naming as `sbs/source-truth-readiness-<YYYYMMDD-HHMM>`, a local runner command that creates or reuses that branch, docs and `.sbs/` artifact writes only, local proof output, and sync-safe runner events for `workflow.started`, `workflow.proof.completed`, and `workflow.blocked`.

### Out Of Scope

This plan does not run doctor-pass probes, regenerate findings, implement sync preview approval, create worker queues, run always-on jobs, create managed GitHub access, push branches, open PRs, install dependencies, run migrations, edit runtime app code, edit environment files, read or sync raw source, sync raw terminal logs, sync Codex transcripts, or implement the later `observability-debuggability` workflow. PR delivery remains a second explicit action named `Open PR` in a later slice.

## Plan of Work

First, extend the backend workflow run contract. Add approval, lease, touch target, proof command, sync policy, local artifact ref, and proof summary fields to `apps/web/convex/workspace/validators.ts`, then use those fields in `apps/web/convex/schema.ts`. Update `requestWorkspaceWorkflowRun` in `apps/web/convex/workspace/model.ts` so it validates the selected finding, requires a paired runner, stores the approval audit fields, returns an idempotent active run on retry, and rejects unsupported workflow ids for this slice. Extend workflow event side effects so runner events update finding status from `needs approval` to `running`, `done`, or `blocked`.

Second, replace the placeholder on the finding decision page. Extend `apps/web/app/(workspace)/_lib/workspace-findings-read-model.ts` with a source-truth workflow approval model containing branch name, profile, lease, proof commands, expected outputs, allowed touch targets, disallowed touch targets, sync policy, stop conditions, rollback notes, and local artifact refs. Update `apps/web/app/(workspace)/workspace/findings/[findingId]/page.tsx` to load setup state so the client receives project and active runner ids. Update `workspace-finding-detail-page.tsx` to render the approval sheet and call `api.workspace.requestWorkspaceWorkflowRun`, then display `bunx` and `npx` local runner commands for the approved run. The page must still avoid raw source, terminal logs, Codex transcripts, branch push controls, PR controls, and queue controls.

Third, add the local runner workflow command. Add a command module under `packages/local-runner/src/commands/` and route it from `packages/local-runner/src/cli.ts`. The command should be shaped as `ship-by-sunday workflow source-truth-readiness run --workflow-run-id <id> --confirm-local-writes [--repo <path>] [--json]`. It reads local project state and runner credentials, checks the Git worktree before writes, creates or checks out the approved branch, writes `.sbs/runs/<workflow-run-id>/workflow-packet.json` and proof artifacts, updates root `AGENTS.md` only after `--confirm-local-writes`, runs bounded proof commands that do not execute provider CLIs or migrations, queues sync-safe workflow runner events, and flushes the event outbox. If the worktree is dirty or the lease boundary cannot be honored locally, it writes blocked proof and queues `workflow.blocked`.

Fourth, test the slice at the narrowest useful boundaries. Add or update Convex unit tests around workflow approval persistence and runner workflow events, read-model tests around approval sheet construction, integration UI tests around the detail page approval handoff, and local runner tests around branch/proof creation and blocked dirty-state behavior.

## Milestones

The first milestone is backend approval state. At the end of it, calling `requestWorkspaceWorkflowRun` with a source-truth finding, paired runner, branch name, profile, lease, touch targets, proof commands, and sync policy returns one approved workflow run with audit metadata. Repeating the same call returns the same active run instead of creating duplicates.

The second milestone is customer approval UX. At the end of it, `/workspace/findings/[findingId]` shows the compact approval sheet and, after the user presses `Create branch and run workflow`, displays the exact local runner commands. The UI must still be a decision screen, not a report page or queue center.

The third milestone is local runner execution. At the end of it, the runner command creates a local branch, writes `.sbs/runs/<workflow-run-id>/workflow-packet.json`, writes source-truth proof artifacts, appends the approved source-truth guidance block to root `AGENTS.md`, runs bounded proof commands, and queues workflow events without syncing raw logs, local absolute paths, source excerpts, or transcripts.

The fourth milestone is validation and documentation. At the end of it, focused app, Convex, runner, plan, and markdown checks have run, this ExecPlan records exact evidence, and the Program is updated if this slice changed durable route, data, privacy, or execution-surface contracts.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Before edits, inspect the active surfaces:

    rg -n "requestWorkspaceWorkflowRun|workflow.started|workflow.proof.completed" apps/web/convex apps/web/tests
    rg -n "WorkspaceFindingDetailPage|buildWorkspaceFindingDetailModel" apps/web/app apps/web/tests
    rg -n "doctor-pass|runner-events|local-project-state" packages/local-runner/src packages/local-runner/tests

After backend changes, run the focused Convex unit tests:

    bun run --cwd apps/web test:unit -- tests/unit/workspace-runner-events.test.ts

After read-model and UI changes, run:

    bun run --cwd apps/web test:unit -- tests/unit/workspace-findings-read-model.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-finding-detail-page.test.tsx

After runner changes, run:

    bun run --cwd packages/local-runner test -- tests/source-truth-workflow.test.ts
    bun run --cwd packages/local-runner ship-by-sunday -- --help

Before finishing, run the broader checks listed in `Validation and Acceptance`.

## Validation and Acceptance

The slice is accepted when a source-truth finding can be approved in the browser, the backend stores an approved workflow run with audit and lease fields, the UI displays the local runner command, the local runner creates a branch and proof artifacts from that command, and workflow status moves through running and proof-completed by sync-safe events. Acceptance also requires proof that raw source summaries, terminal logs, local absolute paths, Codex transcripts, branch push controls, PR controls, and queue controls are absent from this slice.

### Test Commands

Run these from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run --cwd apps/web test:unit -- tests/unit/workspace-findings-read-model.test.ts
    bun run --cwd apps/web test:unit -- tests/unit/workspace-runner-events.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-finding-detail-page.test.tsx
    bun run --cwd apps/web typecheck
    bun run --cwd apps/web lint
    bun run --cwd packages/local-runner test -- tests/source-truth-workflow.test.ts
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner package:smoke
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-04-source-truth-agent-readiness-workflow.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-04-source-truth-agent-readiness-workflow.md docs/programs/completed/2026-05-02-customer-agentic-operating-system
    git diff --check

If visible UI changes can be run locally, start the app on an available port and verify desktop and mobile views of `/workspace/findings/[findingId]`. The approval sheet should fit without overlap, `Create branch and run workflow` should be visible, `Open PR` should not be present, and no raw source/log/transcript text should appear.

## Idempotence and Recovery

The browser approval mutation must be safe to retry after a lost response. For the same project, finding, workflow id, and non-terminal active state, it should return the existing workflow run instead of creating a duplicate. The runner command should be safe to retry: if the target branch already exists, it should reuse it; if local artifacts already exist, it should rewrite the same run directory deterministically; if the worktree is dirty before writes, it should stop and write blocked proof. Do not revert user work. Do not delete unrelated files. Do not push or open a PR.

If validation fails, update `Progress` with the failing command and exact reason, fix the root cause, and rerun the focused check before broad checks. If a browser proof cannot run because local auth or services are unavailable, record the exact blocker here and in the final summary.

## Artifacts and Notes

Expected local runner artifacts are `.sbs/runs/<workflow-run-id>/workflow-packet.json`, `.sbs/runs/<workflow-run-id>/proof.json`, `.sbs/runs/<workflow-run-id>/sync-preview.json`, and any source-truth support artifacts needed by the command map. These files are local, non-secret SBS state. Durable credentials remain outside the repo under the runner home. Synced events may include workflow id and version, branch, profile, touched file paths, artifact names, proof command names and statuses, blocked reason, and next recommendation. They must not include raw generated docs, source excerpts, command logs, local absolute paths, screenshots, secrets, or Codex transcript content.

## Interfaces and Dependencies

The web app depends on Clerk-authenticated product access and the existing workspace Convex API. The approval UI depends on `api.workspace.listWorkspaceFindings`, `api.workspace.getWorkspaceSetupState`, and `api.workspace.requestWorkspaceWorkflowRun`. The runner depends on local `.sbs/` state, user-home runner credentials, Git, and the existing event outbox endpoint. The workflow should use the SBS Codex profile name as part of the approval and packet contract, but this slice does not introduce a new Codex prompt or direct app-server relay.
