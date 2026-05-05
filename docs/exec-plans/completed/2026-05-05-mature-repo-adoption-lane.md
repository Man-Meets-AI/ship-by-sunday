---
title: Mature Repo Adoption Lane
status: complete
created_at: 2026-05-05
completed_at: 2026-05-05
summary: Add the first mature-repository adoption workflow that audits an existing repo and emits a reviewable adoption Program/ExecPlan packet without rewriting the repo.
post_build_recap: Shipped the `mature-repo-adoption` local-runner workflow, app and Convex approval support, workflow catalog surfacing, `.sbs` adoption audit/program/ExecPlan/proof artifacts, docs, Program update, and focused validation.
program_id: customer-agentic-operating-system
planning_brief: docs/programs/completed/2026-05-02-customer-agentic-operating-system/planning-brief-2.md
read_when:
  - Implementing or reviewing mature existing-repository adoption.
  - Updating workflow approval, local-runner mature repo audits, or `/workspace/loops`.
  - Checking that mature repos are not forced into generated-starter conventions.
---

# Mature Repo Adoption Lane

This is a living execution plan for the next Customer Agentic Operating System slice: ship the first mature-repository adoption lane without widening execution authority.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Mature repos already have conventions, commands, docs, CI, release habits, and source-truth drift. Ship by Sunday should not replace those repos with generated-starter assumptions. After this slice, a customer can approve a `mature-repo-adoption` workflow from a finding, run it through the local runner, and receive a reviewable `.sbs` adoption audit, generated adoption Program packet, first child ExecPlan draft, proof, sync preview, and next recommendation. The workflow preserves repo conventions by default and reports blocked proof for missing facts instead of inventing confidence.

## Progress

- [x] 2026-05-05 EDT: Read root `AGENTS.md`, `docs/programs/PROGRAMS.md`, `docs/exec-plans/PLANS.md`, the active Program, `planning-brief-2.md`, mature-repo research, `support-codebases.md`, `apps/web/AGENTS.md`, root `DESIGN.md`, design-pack instructions, and Convex AI guidelines.
- [x] 2026-05-05 EDT: Inspected workflow approval, Convex workflow-run resolution, local-runner workflow commands/daemon handling, and the shipped source-truth, observability, and broken-app workflow packet writers.
- [x] 2026-05-05 EDT: Added app and Convex approval support for `mature-repo-adoption`.
- [x] 2026-05-05 EDT: Implemented the local-runner mature repo adoption audit workflow.
- [x] 2026-05-05 EDT: Added focused tests and updated docs.
- [x] 2026-05-05 EDT: Updated the Program, completed this ExecPlan, and ran validation.

## Surprises & Discoveries

The existing workflow packet machinery can support one more local-runner workflow with a narrow diff: approval read model, Convex allow-list/packet validation, runner API union, CLI/daemon dispatch, and one local workflow implementation. The safest mature-repo lane is an artifact overlay under `.sbs`, not root docs mutation.

## Decision Log

Decision: Ship mature adoption as a local `.sbs` audit and adoption-packet workflow first.
Rationale: The Program requires mature repos to preserve their conventions and avoid generated-starter assumptions. Writing `.sbs/mature-repo/**` and `.sbs/runs/<workflow-run-id>/**` gives a reviewable Program/ExecPlan packet without patching runtime code, package scripts, provider config, root docs, or CI.
Date: 2026-05-05

## Outcomes & Retrospective

This plan is complete. `mature-repo-adoption` is now a supported finding recommendation, approval packet, Convex-resolved workflow run, `/workspace/loops` catalog row, CLI/daemon workflow, and local-runner implementation.

The workflow requires explicit `--confirm-adoption-audit`, an unexpired write lease, clean worktree, approved branch pattern, and `sbs-workspace-write` profile. It writes only `.sbs/runs/<workflow-run-id>/**` and `.sbs/mature-repo/**` artifacts: workflow packet, sync-safe adoption audit, adoption Program draft, first child ExecPlan draft, proof, and sync preview. It does not mutate source, root docs, package manifests, lockfiles, migrations, provider config, CI, package scripts, generated folders, branch remotes, PRs, raw logs, raw source, or Codex transcripts.

The main implementation discovery was that the local-runner proof helper must trust `runBoundedProcess.succeeded`, not an unset success `exitCode`. The mature workflow now records proof command summaries from the same bounded process helper used by the other runner workflows.

## Context and Orientation

The Program-owned next slice is recorded in `docs/programs/completed/2026-05-02-customer-agentic-operating-system/program.md`. Mature-repo research is in `docs/programs/completed/2026-05-02-customer-agentic-operating-system/research-pass-mature-repo-adoption.md`.

The owning app surfaces are `apps/web/app/(workspace)/_lib/workspace-findings-read-model.ts`, `apps/web/app/(workspace)/_lib/workspace-support-read-model.ts`, and the finding/loops UI that consumes those models. Convex workflow approval lives in `apps/web/convex/workspace/model.ts` and validators in `apps/web/convex/workspace/validators.ts`. Local-runner dispatch lives in `packages/local-runner/src/commands/workflow.ts`, `packages/local-runner/src/commands/daemon.ts`, `packages/local-runner/src/cli.ts`, and `packages/local-runner/src/core/workflow-run-api.ts`.

The new workflow implementation should live in `packages/local-runner/src/core/mature-repo-adoption-workflow.ts`. It should follow the existing local-runner pattern: resolve approved packet, require explicit terminal confirmation, require clean worktree and unexpired lease, create or reuse the approved local branch, write `.sbs` artifacts, run Git proof commands, queue sync-safe proof events, and block safely.

### In Scope

Add `mature-repo-adoption` as a supported local-runner workflow id. It should be available in the workflow catalog and approval read model. It should write local artifacts only under `.sbs/runs/<workflow-run-id>/**` and `.sbs/mature-repo/**`: workflow packet JSON, adoption audit JSON, adoption Program Markdown, first ExecPlan Markdown, proof JSON, and sync preview JSON.

The audit may inspect sync-safe repo metadata: package manager, package script names, dependency names, docs file names, agent instruction file names, CI workflow file names, release docs file names, test/config file names, and Git branch/churn summaries. It must not store raw source excerpts, full command output, secrets, local absolute paths, screenshots, raw logs, or Codex transcripts.

The generated Program and ExecPlan drafts must preserve the repo's detected conventions, name missing facts, and recommend a first follow-up such as `normalize-validation-and-source-truth` or blocked proof when validation/release/source-truth facts are missing.

### Out Of Scope

Do not mutate root `AGENTS.md`, README, package scripts, runtime code, env files, dependency manifests, lockfiles, migrations, provider configuration, CI configuration, generated folders, or source docs in this slice. Do not install dependencies, run package scripts, run provider CLIs, run migrations, push branches, create pull requests, rerun CI, share raw source, share raw logs, expand Codex app-server repair authority, add hosted execution, or implement package/update-channel mechanics.

## Plan of Work

First, update app read models so `mature-repo-adoption` appears in finding detail approval and the loops catalog with explicit `.sbs`-only write boundaries, proof commands, stop conditions, and rollback notes.

Second, update Convex to accept and validate `mature-repo-adoption` approval packets. The packet must require the `sbs-workspace-write` profile, the approved branch pattern `sbs/mature-repo-adoption-<YYYYMMDD-HHMM>`, Git proof commands only, the shared sync policy, and exact expected outputs/touch targets/stop conditions.

Third, implement the local runner workflow. It should scan metadata, generate the audit and adoption packet, write local proof/sync-preview JSON, and emit structured proof events. It should block on missing confirmation, expired lease, dirty worktree, unsafe branch, wrong workflow id, wrong profile, or unsafe branch name.

Fourth, update CLI help and daemon worker confirmation so manual and worker execution stay explicit. Add focused tests for the read models, Convex approval/runner packet resolution, CLI help/API allow-list, and local-runner artifact/proof behavior.

Finally, update docs, Program, move this plan to completed, and run focused validations followed by broad gates.

## Milestones

The first milestone is approval support. At the end, a mature-repo finding can produce an approval packet and Convex can persist and resolve it for the owning runner.

The second milestone is local runner execution. At the end, `bunx ship-by-sunday workflow mature-repo-adoption run --workflow-run-id <id> --confirm-adoption-audit` writes the mature adoption audit/program/ExecPlan/proof artifacts under `.sbs` without patching source.

The third milestone is closeout. At the end, focused tests, docs, this completed ExecPlan, Program update, and required repository gates prove the shipped lane.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Edit the app read models, Convex workflow approval model, local runner workflow command and daemon dispatch, local runner API, focused tests, internal docs, design-pack documentation, Program packet, and this ExecPlan.

After implementation, move the plan to:

    docs/exec-plans/completed/2026-05-05-mature-repo-adoption-lane.md

## Validation and Acceptance

Acceptance requires a finding with `recommendedWorkflowId: mature-repo-adoption` to produce a bounded approval packet, Convex to accept and return that packet to the owning runner, and the local runner to write a sync-safe adoption audit plus adoption Program and first ExecPlan drafts under `.sbs`. The workflow must not patch source, run package scripts, install dependencies, use providers, push branches, create pull requests, rerun CI, or sync raw source/logs.

This slice does not require external setup.

### Test Commands

Run these commands from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run --cwd apps/web test:unit -- tests/unit/workspace-findings-read-model.test.ts tests/unit/workspace-support-read-model.test.ts tests/unit/workspace-runner-events.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-finding-detail-page.test.tsx tests/integration-ui/workspace-loops-page.test.tsx
    bun run --cwd packages/local-runner test -- tests/mature-repo-adoption-workflow.test.ts tests/workflow-run-api.test.ts tests/cli-help.test.ts
    bun run format
    bun lint
    bun typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-05-mature-repo-adoption-lane.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-05-mature-repo-adoption-lane.md docs/programs/completed/2026-05-02-customer-agentic-operating-system/program.md docs/internal/workflow-packets.md docs/ship-by-sunday/design-pack/documentation.md docs/generated/ship-by-sunday-codebase/design-pack/documentation.md
    git diff --check

## Idempotence and Recovery

The workflow should block before writing if the worktree is dirty or the lease is expired. If a branch already exists elsewhere, it should block rather than switching unexpectedly. If a proof command fails, it should leave proof or blocked proof under `.sbs/runs/<workflow-run-id>/`.

## Artifacts and Notes

Durable local artifacts are the workflow packet JSON, mature repo adoption audit JSON, adoption Program Markdown, first ExecPlan Markdown, proof JSON, sync preview JSON, and structured workflow events.

## Interfaces and Dependencies

This slice depends on existing workspace findings, workflow approval, runner credential resolution, local Git, `.sbs` local artifact storage, and runner event sync. It does not depend on provider credentials, GitHub APIs, CI providers, package managers beyond metadata detection, dependency installation, migrations, hosted execution, or generated-repo compiler changes.
