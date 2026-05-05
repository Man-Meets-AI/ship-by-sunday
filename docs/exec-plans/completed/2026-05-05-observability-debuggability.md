---
title: Observability Debuggability
status: complete
created_at: 2026-05-05
completed_at: 2026-05-05
summary: Add a bounded observability/debuggability workflow after source-truth readiness without silently changing runtime code, provider setup, dependencies, CI, PRs, or source-sharing boundaries.
post_build_recap: Observability/debuggability is now a first-class approved local-runner workflow that writes sync-safe `.sbs` audit/proof artifacts and keeps runtime/provider implementation behind later approval.
program_id: customer-agentic-operating-system
planning_brief: docs/programs/completed/2026-05-02-customer-agentic-operating-system/planning-brief-2.md
read_when:
  - Implementing or reviewing the observability/debuggability workflow.
  - Checking local-runner approval boundaries for observability work.
  - Updating the Program after the second post-source-truth workflow lands.
---

# Observability Debuggability

This is a living execution plan. It captures the next Customer Agentic Operating System slice: make `observability-debuggability` a first-class approved workflow after `source-truth-agent-readiness` while keeping provider, runtime, dependency, CI, PR, and raw-source boundaries explicit.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

After a customer approves and runs source-truth readiness, the next useful loop for fragile or opaque apps is observability/debuggability. Production failures are expensive when the app cannot answer basic questions: where errors are captured, what runtime intake exists, whether client and server failures are correlated, what proof command can verify the path, and what provider setup is missing.

The safest first implementation is not automatic instrumentation. It is an approved local workflow that creates a branch after explicit approval, inspects repo-local observability signals, writes sync-safe `.sbs` audit and proof artifacts, and reports blocked-proof states when provider setup, environment values, source maps, dashboards, or deployment proof are needed. Runtime code edits, provider CLIs, package installs, package script edits, dependency changes, migrations, branch pushes, PR opening, CI-affecting commands, raw logs, raw source, and Codex transcripts remain out of scope for this slice.

## Progress

- [x] 2026-05-05 EDT: Read root `AGENTS.md`, `docs/programs/PROGRAMS.md`, `docs/exec-plans/PLANS.md`, the active Program, `planning-brief-2.md`, `apps/web/AGENTS.md`, and existing observability documentation.
- [x] 2026-05-05 EDT: Inspected the workspace finding approval model, approval sheet, local-runner workflow command, worker daemon, workflow-run API, and existing source-truth and broken-app workflow implementations.
- [x] Implement the bounded `observability-debuggability` approval model and local-runner workflow.
- [x] Add focused runner and workspace tests.
- [x] Update operator/customer docs with the local audit command, `.sbs` artifacts, provider setup boundary, and forbidden actions.
- [x] Update the active Program and this ExecPlan with final proof.

## Surprises & Discoveries

The existing finding approval sheet treated every workflow except `broken-app-triage` as `source-truth-readiness`, which would generate the wrong local command for `observability-debuggability`. This slice must make the workflow command and confirmation flag explicit rather than relying on a generic fallback.

## Decision Log

Decision: Ship an approved observability audit/proof workflow first, not automatic runtime instrumentation.
Rationale: The Program explicitly warns that observability can touch runtime code, provider setup, package scripts, environment variables, dashboards, deployment proof, and customer data boundaries. A sync-safe local audit gives useful proof and blocked-proof output while preserving the consent boundary for later runtime changes.
Date: 2026-05-05

Decision: Limit writes to `.sbs/runs/<workflow-run-id>/**` and `.sbs/observability/**`.
Rationale: This first workflow should prove the second loop path after source-truth readiness without adding broad write power. Runtime code, provider configs, env files, dependencies, package scripts, migrations, generated folders, pushes, PRs, CI-affecting commands, raw source, raw logs, and transcripts remain disallowed unless a later workflow packet names and approves them.
Date: 2026-05-05

## Outcomes & Retrospective

The slice shipped `observability-debuggability` as a bounded local audit/proof workflow. Workspace finding detail approvals now show the correct workflow command and `--confirm-observability-audit` flag instead of falling through to source truth. Convex accepts, stores, resolves, and claims observability workflow packets for the local runner. The runner now creates the approved local branch, scans sync-safe observability signals, writes local workflow packet, audit, proof, and sync-preview artifacts under `.sbs`, and emits structured workflow events.

The workflow deliberately does not edit runtime code or provider configuration. Provider setup, dashboard access, source maps, instrumentation, dependencies, package scripts, deployment proof, CI-affecting commands, branch pushes, PRs, raw-source sharing, raw-log sharing, screenshots, secrets, and Codex transcript sync remain blocked-proof boundaries for later workflow approval.

## Context and Orientation

The owning app surfaces are the workspace finding detail approval model in `apps/web/app/(workspace)/_lib/workspace-findings-read-model.ts`, the approval sheet in `apps/web/app/(workspace)/_components/existing-codebase-findings/workspace-source-truth-approval-sheet.tsx`, and the support catalog in `apps/web/app/(workspace)/_lib/workspace-support-read-model.ts`.

The owning local-runner surfaces are `packages/local-runner/src/core/workflow-run-api.ts`, `packages/local-runner/src/commands/workflow.ts`, `packages/local-runner/src/commands/daemon.ts`, and a new workflow implementation under `packages/local-runner/src/core/`. Existing workflow patterns live in `source-truth-workflow.ts` and `broken-app-triage-workflow.ts`.

Existing operator documentation for this repo's observability stack is `docs/internal/observability.md`. This slice should update it only for the new local workflow boundary and should not invent provider credentials or setup that the implementation does not use.

### In Scope

Make `observability-debuggability` a first-class workflow id accepted by the workflow-run API, the manual workflow command, and the worker daemon. Add a local workflow that requires explicit terminal confirmation, checks the clean-worktree and write-lease boundary, creates or reuses only the approved local branch, scans repo-relative observability signals without copying source contents, writes local workflow packet, audit, proof, and sync-preview artifacts, and syncs only structured event metadata.

The workflow packet must name allowed touch targets, disallowed touch targets, provider values, local-runner commands, proof commands, rollback path, sync-safe output schema, and blocked-proof states. The approval UI must show the correct command, flag, proof commands, touch targets, stop conditions, and rollback note.

### Out Of Scope

Do not add package/update-channel mechanics, mature-repo adoption, managed GitHub execution, GitHub provider calls, broad provider access, dependency installs, dependency or lockfile changes, migrations, source-map upload, provider CLIs, dashboard creation, runtime instrumentation edits, package script edits, branch pushes, PR opening, CI-affecting commands, screenshots, raw-log sharing, raw-source sharing, or Codex transcript sync.

## Plan of Work

First, add explicit workflow metadata for `observability-debuggability` in the workspace approval read model: kind, branch name, profile, expected outputs, allowed targets, proof commands, stop conditions, rollback notes, command name, and confirmation flag. Update the approval sheet so commands are built from the model rather than a source-truth fallback.

Second, add the runner workflow. The command should be:

    bunx ship-by-sunday workflow observability-debuggability run --workflow-run-id <id> --confirm-observability-audit

The `npx` fallback should use the same workflow name and confirmation flag. The daemon may run approved queue jobs only under `--work --confirm-local-writes --confirm-observability-audit`, so observability audit work keeps its workflow-specific terminal confirmation even when claimed from the queue.

Third, implement the local audit. It should create `.sbs/runs/<workflow-run-id>/workflow-packet.json`, `.sbs/observability/debuggability-audit.json`, `.sbs/runs/<workflow-run-id>/proof.json`, and `.sbs/runs/<workflow-run-id>/sync-preview.json`. It should scan for repo-relative signals such as package scripts, instrumentation files, error routes, logger files, PostHog/Sentry/OpenTelemetry/Datadog/New Relic references, source-map hints, and runtime-intake/export scripts. It should store paths and capability labels only, not source excerpts or command output.

Fourth, add focused runner and web tests, update documentation, move this plan to completed after implementation, update the Program progress, slice ledger, next slice, and risks, then run focused validations followed by the required broad gates.

## Milestones

The first milestone is workflow approval correctness. At the end, the finding detail approval sheet must show `observability-debuggability`, `--confirm-observability-audit`, the approved branch, `.sbs` touch targets, proof commands, sync policy, stop conditions, and rollback note without falling through to source truth.

The second milestone is local-runner execution. At the end, the runner must accept approved observability packets, create the approved branch, write local audit/proof artifacts under `.sbs`, emit sync-safe proof events, and block cleanly before branch creation when the worktree is dirty or the lease is expired.

The third milestone is closeout. At the end, focused tests, docs, the Program packet, this completed ExecPlan, and required repository gates must prove the shipped boundary.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Edit:

    apps/web/app/(workspace)/_lib/workspace-findings-read-model.ts
    apps/web/app/(workspace)/_components/existing-codebase-findings/workspace-source-truth-approval-sheet.tsx
    apps/web/app/(workspace)/_lib/workspace-support-read-model.ts
    apps/web/convex/workspace/model.ts
    packages/local-runner/src/core/workflow-run-api.ts
    packages/local-runner/src/core/observability-debuggability-workflow.ts
    packages/local-runner/src/commands/workflow.ts
    packages/local-runner/src/commands/daemon.ts
    packages/local-runner/src/cli.ts
    focused tests under apps/web/tests and packages/local-runner/tests
    docs/internal/observability.md
    docs/programs/completed/2026-05-02-customer-agentic-operating-system/program.md
    docs/exec-plans/completed/2026-05-05-observability-debuggability.md

Run the focused runner and workspace tests before broad gates. If the workflow command regresses to `source-truth-readiness`, fix the approval model instead of adding UI-specific conditionals. If the runner tries to execute provider, package, CI, push, PR, or source-sharing work, reduce the implementation back to `.sbs` audit/proof artifacts and blocked-proof metadata.

## Validation and Acceptance

Acceptance requires a customer to see and run an observability workflow command that is visibly different from source truth, has a narrow `.sbs` write boundary, and cannot silently edit runtime code or use providers. The local runner must accept approved `observability-debuggability` packets, write sync-safe audit/proof artifacts, emit structured proof events, and block with local proof when the lease expires, the worktree is dirty, the branch is unsafe, or terminal confirmation is missing.

The workflow packet must document provider setup boundaries. For this slice, provider values are discovered as required/missing by capability labels only. The runner does not ask for, store, or verify provider secrets. Missing provider setup must appear as blocked-proof metadata for later approval, not as hidden failure or automatic setup.

### Test Commands

These commands passed from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run --cwd packages/local-runner test -- tests/observability-debuggability-workflow.test.ts tests/workflow-run-api.test.ts tests/cli-help.test.ts
    bun run --cwd apps/web test:unit -- tests/unit/workspace-findings-read-model.test.ts tests/unit/workspace-support-read-model.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-finding-detail-page.test.tsx tests/integration-ui/workspace-loops-page.test.tsx tests/integration-ui/workspace-runs-page.test.tsx
    bun run format
    bun lint
    bun typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-05-observability-debuggability.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-05-observability-debuggability.md docs/programs/completed/2026-05-02-customer-agentic-operating-system/program.md docs/internal/observability.md
    git diff --check

The focused runner suite covered packet support, CLI help, branch creation, sync-safe audit proof, event redaction, and dirty-worktree blocked proof. The focused app suites covered approval/read models, Convex workflow approval and resolution, loops/runs read models, and the finding detail command UI.

## Idempotence and Recovery

The local workflow must be safe to rerun only when the approved branch is already checked out or when no branch exists. If the branch exists elsewhere, it should block rather than switch. If the lease expires or the worktree is dirty before local writes, it should write blocked proof under `.sbs/runs/<workflow-run-id>/` and avoid branch creation. If broad validation fails in unrelated dirty worktree files, record the exact failure instead of reverting unrelated changes.

## Artifacts and Notes

The durable artifacts are the workflow packet, audit JSON, proof JSON, sync preview JSON, workflow proof events, focused tests, Program update, and this completed ExecPlan. The audit JSON and sync preview are intentionally sync-safe: repo-relative refs, capability labels, statuses, proof command names, and blocked-proof summaries only.

## Interfaces and Dependencies

This slice depends on workspace finding approval, workflow-run approval packets, local-runner credentials and events, Git branch state, `.sbs` local artifact storage, and existing internal observability docs. It does not depend on provider credentials, GitHub APIs, CI, production deployment, PostHog, Sentry, OpenTelemetry, Datadog, or any external dashboard API.
