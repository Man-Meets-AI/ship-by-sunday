---
title: Docs Operating System Lockfile Refresh Proof
status: complete
created_at: 2026-05-06
completed_at: 2026-05-06
summary: Add an approved local-runner workflow that runs a bounded package-manager lockfile refresh after docs operating-system package patching.
post_build_recap: The local runner and hosted approval surfaces now support a bounded docs-operating-system lockfile refresh workflow with guarded package inputs, lockfile-only package-manager proof, and sync-safe proof metadata.
program_id: worker-grade-docs-operating-system-adoption
planning_brief: docs/programs/active/2026-05-06-worker-grade-docs-operating-system-adoption/planning-brief-1.md
read_when:
  - Resuming package-manager install proof for docs operating-system adoption.
  - Changing the docs-operating-system lockfile refresh authority boundary.
  - Validating the slice after package-script patching and shared validator commands.
---

# Docs Operating System Lockfile Refresh Proof

This document is a living execution plan for the package-manager and lockfile proof slice after docs operating-system package-script patching.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The runner can now dry-run a Worker-grade portable docs operating system, patch conflict-free package scripts, add the pinned `ship-by-sunday` package metadata, write generated wrappers, and expose the package-owned docs commands those wrappers call. What is still missing is a bounded package-manager step that refreshes the target repo lockfile and proves that the dependency metadata is installable or honestly blocked.

After this slice, an approved workflow named `docs-operating-system-lockfile-refresh` can consume the prior dry-run install plan and package-script apply summary, re-check the live package scripts and wrappers, run only the approved package-manager lockfile refresh command, and record proof under `.sbs/runs/<workflow-run-id>/**` plus `.sbs/docs-operating-system-adoption/lockfile-refresh/**`. The workflow must not implement runner distribution, publish packages, install runtime state, edit docs, rewrite root instructions, configure CI/providers, wire app-stack commands, or hide a failed package-manager command behind a fake pass.

## Progress

- [x] 2026-05-06 EDT: Read root `AGENTS.md`, `docs/exec-plans/PLANS.md`, the owning Program, completed docs operating-system child ExecPlans, workflow packet docs, current local-runner workflow dispatch, package-script patching workflow, schemas, and tests before authoring this plan.
- [x] 2026-05-06 EDT: Add the lockfile refresh workflow manifest, schemas, local-runner execution, CLI and daemon dispatch, and approved packet validation.
- [x] 2026-05-06 EDT: Add focused temporary-repo tests for confirmation blocking, prior-apply validation, package-manager command execution with a fake package manager, lockfile-only touched refs, failed package-manager proof, and guarded input mutation proof.
- [x] 2026-05-06 EDT: Update hosted approval/read-model surfaces so the workflow can be approved, resolved, claimed, and displayed with `installProfile: worker-grade`.
- [x] 2026-05-06 EDT: Update durable docs and the owning Program with the shipped boundary and remaining follow-up slices.

## Surprises & Discoveries

The package-script patching workflow already records `docs-operating-system-lockfile-refresh` as its `nextRecommendedWorkflow`, so this slice should implement that exact id.

The previous apply workflow intentionally leaves `package.json` and `scripts/sbs-docs/**` dirty in a target repo until the operator commits or reviews them. This lockfile workflow therefore cannot require a globally clean worktree at the local proof layer. It must instead allow those prior approved refs only after re-validating that the live package scripts and wrappers still match the dry-run and apply contracts.

Yarn lockfile refresh is not safely generalized in this slice. The implementation blocks Yarn instead of running an unbounded install because the approved path requires lockfile-only behavior with lifecycle scripts disabled.

## Decision Log

Decision: Implement `docs-operating-system-lockfile-refresh` as a separate workflow id.
Rationale: Running a package manager and mutating lockfiles is a different authority class than patching package scripts. It needs its own approval packet, confirmation flag, allowed touch targets, proof commands, rollback notes, and failure reporting.
Date: 2026-05-06

Decision: Use lockfile-only install commands with lifecycle scripts disabled where the package manager supports them.
Rationale: This slice needs to prove dependency metadata and lockfile refresh without widening into runtime setup, node_modules installation state, or arbitrary package lifecycle scripts. If the package manager command fails because the package is not published or the manager does not support the bounded mode, proof should fail or block honestly.
Date: 2026-05-06

Decision: Re-check the prior install plan and package-script apply summary before running the package manager.
Rationale: A stale package plan, missing wrapper, unrecognized canonical script body, or missing `ship-by-sunday` dependency metadata means the lockfile refresh would no longer be proving the approved package patch. The workflow should stop before running package-manager commands in that case.
Date: 2026-05-06

Decision: Treat `package.json` and wrapper files as guarded inputs, not lockfile-refresh targets.
Rationale: The previous workflow owns package manifest and wrapper mutation. This workflow may observe those refs and may allow them as pre-existing dirty state when they match prior approved output, but the package-manager command must not further mutate them without failed proof.
Date: 2026-05-06

## Outcomes & Retrospective

This slice is complete. `packages/local-runner/src/core/docs-operating-system-lockfile-refresh-workflow.ts` adds the new `docs-operating-system-lockfile-refresh` workflow behind `--confirm-docs-operating-system-lockfile-refresh`. It validates the approved packet, write lease, prior dry-run install plan, package-script apply summary, live package scripts, generated wrappers, and pinned `ship-by-sunday` dependency metadata before running any package-manager command.

The workflow resolves approved lockfile-only package-manager commands for Bun, npm, and pnpm, blocks Yarn until a safe bounded mode exists, snapshots guarded `package.json` and wrapper refs, runs the package-manager command, and fails proof if guarded inputs or unexpected refs change. Proof and sync preview artifacts stay under `.sbs/runs/<workflow-run-id>/**` and `.sbs/docs-operating-system-adoption/lockfile-refresh/**`, while hosted sync receives only command names, statuses, refs, and other structured metadata.

Hosted approval, resolve, claim, proof-ref validation, and the workspace findings read model now recognize the workflow and preserve `installProfile: worker-grade`. Remaining work is outside this slice: runner distribution, package publication, evidence-bound quality refresh, native command integration, runtime setup, CI/provider setup, and app-stack command wiring.

## Context and Orientation

The docs operating-system Program lives at `docs/programs/completed/2026-05-06-worker-grade-docs-operating-system-adoption/program.md`. It says the next remaining authority slice is package-manager install proof and lockfile refresh, and it explicitly excludes runner distribution, runtime setup, Worker-specific state, CI/provider setup, app-stack command wiring, and broad root `AGENTS.md` rewrites.

The dry-run workflow is `packages/local-runner/src/core/docs-operating-system-adoption-workflow.ts`. It writes `.sbs/docs-operating-system-adoption/tooling-plan/install-plan.json` and does not mutate package manifests or lockfiles.

The package-script apply workflow is `packages/local-runner/src/core/docs-operating-system-package-script-patching-workflow.ts`. It consumes the dry-run plan, writes root `package.json`, writes generated wrappers under `scripts/sbs-docs/**`, writes `.sbs/docs-operating-system-adoption/tooling-apply/package-script-patching.json`, and records `docs-operating-system-lockfile-refresh` as the next recommended workflow.

The package patch domain helper is `packages/local-runner/src/workflows/docs-operating-system-adoption/package-script-patching.ts`. Reuse it to re-check the live package script and wrapper contract before lockfile refresh. The manifest constants and schema types live in `packages/local-runner/src/workflows/docs-operating-system-adoption/manifest.ts` and `packages/local-runner/src/workflows/docs-operating-system-adoption/schemas.ts`.

Local runner workflow dispatch lives in `packages/local-runner/src/commands/workflow.ts`, `packages/local-runner/src/commands/daemon.ts`, `packages/local-runner/src/core/workflow-run-api.ts`, and `packages/local-runner/src/cli.ts`. Hosted approval and read-model support, if included in this slice, live in `apps/web/convex/workspace/model.ts` and `apps/web/app/(workspace)/_lib/workspace-findings-read-model.ts`.

### In Scope

This slice adds the `docs-operating-system-lockfile-refresh` workflow id, a `--confirm-docs-operating-system-lockfile-refresh` confirmation flag, manifest constants, schema types, local-runner execution, approved packet validation, CLI and daemon dispatch, focused local-runner tests, workflow packet docs, and owning Program updates.

The workflow reads the prior dry-run install plan and package-script apply summary, validates that package patching was applied, validates that root `package.json` still contains the pinned `ship-by-sunday` dependency metadata, validates live canonical docs scripts and generated wrappers against the prior package patch contract, runs one approved package-manager lockfile refresh command, writes local proof and sync preview artifacts, and reports touched lockfile refs.

The approved source targets for this slice are root package-manager lockfiles only: `bun.lock`, `bun.lockb`, `package-lock.json`, `npm-shrinkwrap.json`, `pnpm-lock.yaml`, and `yarn.lock`. The workflow may write its own `.sbs` proof artifacts under the current run and lockfile-refresh artifact roots.

### Out Of Scope

This slice does not distribute the runner by cURL, npx, bunx, package publication, or any other installation channel. It does not solve whether `ship-by-sunday` is available from a registry. A missing package or failed package-manager command is proof failure, not a reason to fake success.

This slice does not run runtime bootstrap, create `.runtime`, install Worker notes/goals/projects/workers/topology state, add worker-state commands, configure CI or providers, mutate docs files, rewrite root instructions, push branches, open pull requests, wire app-stack commands, refresh quality evidence, or change the already-shipped dry-run, package-script, and shared-command conflict contracts.

## Plan of Work

Start by extending `packages/local-runner/src/workflows/docs-operating-system-adoption/manifest.ts` with lockfile-refresh constants: workflow id, version, profile, confirmation flag, expected outputs, allowed and disallowed touch targets, proof commands, stop conditions, rollback notes, phase names, and local artifact refs under `.sbs/docs-operating-system-adoption/lockfile-refresh/**`.

Add schema types in `packages/local-runner/src/workflows/docs-operating-system-adoption/schemas.ts` for the lockfile refresh manifest and summary. The summary should record package manager, command name, command status, source install-plan ref, source apply-summary ref, guarded input refs, touched lockfile refs, unexpected touched refs, proof command results, and a privacy boundary that excludes raw logs, package script bodies, dependency versions from the target repo, local absolute paths, and Codex transcripts.

Add a small package-manager helper under `packages/local-runner/src/workflows/docs-operating-system-adoption/lockfile-refresh.ts`. It should resolve the package manager from the install plan to one approved command. Prefer bounded commands such as `bun install --lockfile-only --ignore-scripts`, `npm install --package-lock-only --ignore-scripts`, and `pnpm install --lockfile-only --ignore-scripts`. If a package manager has no safe bounded command in this slice, return a blocked reason instead of guessing.

Add `packages/local-runner/src/core/docs-operating-system-lockfile-refresh-workflow.ts`. It should mirror the guard and proof shape of the package-script patching workflow, but with lockfile targets only. It must validate the approved packet, require the new confirmation flag, enforce the write lease, block dirty lockfiles before running, allow pre-existing package patch refs only after re-validating them, write workflow packet and manifest artifacts, run the package-manager command, run Git proof commands, detect unexpected refs, compare guarded package and wrapper contents before and after, write proof and sync preview, and send runner events.

Update `packages/local-runner/src/core/workflow-run-api.ts`, `packages/local-runner/src/commands/workflow.ts`, `packages/local-runner/src/commands/daemon.ts`, and `packages/local-runner/src/cli.ts` so the workflow can be resolved, claimed, run directly, run by the daemon, and shown in help text. If hosted approval surfaces are included, update only the minimal workflow constants, packet construction, proof-ref validation, and read model tests needed for this id.

Update durable docs after behavior exists. `docs/internal/workflow-packets.md` should describe the new packet boundary. The owning Program should add this child ExecPlan to the Slice Ledger and mark this package-manager slice complete only after validation passes. This ExecPlan should move to `docs/exec-plans/completed/` and receive a real retrospective at the end.

## Milestones

Milestone one is the packet boundary. At the end, the local runner recognizes `docs-operating-system-lockfile-refresh`, validates approved packet metadata, and blocks without `--confirm-docs-operating-system-lockfile-refresh`. Focused tests should cover confirmation and packet drift.

Milestone two is prior-state validation. At the end, the workflow blocks before running a package manager when the package-script apply summary is missing, blocked, malformed, or stale; when the live canonical scripts no longer match the prior contract; when wrappers are missing or unrecognized; or when the pinned `ship-by-sunday` dependency metadata is absent.

Milestone three is package-manager proof. At the end, a temporary Git repo with an applied docs operating-system package patch and a fake package-manager binary can run the workflow, rewrite only the expected lockfile, and produce passed proof with no unexpected touched refs. A failing fake package manager should produce failed proof without widening writes.

Milestone four is hosted and documentation integration if needed. At the end, workflow-run approval, resolve, claim, proof-ref validation, UI read models, workflow packet docs, the Program, and this ExecPlan all agree on the new authority boundary.

## Concrete Steps

Work from `/Users/bazelrex/Developer/ship-by-sunday`.

Inspect the relevant existing implementation:

    sed -n '1,620p' packages/local-runner/src/core/docs-operating-system-package-script-patching-workflow.ts
    sed -n '1,260p' packages/local-runner/src/workflows/docs-operating-system-adoption/manifest.ts
    sed -n '1,280p' packages/local-runner/src/workflows/docs-operating-system-adoption/schemas.ts
    sed -n '1,220p' packages/local-runner/src/commands/workflow.ts
    sed -n '1,380p' packages/local-runner/src/commands/daemon.ts

Add or update these local-runner files:

    packages/local-runner/src/workflows/docs-operating-system-adoption/manifest.ts
    packages/local-runner/src/workflows/docs-operating-system-adoption/schemas.ts
    packages/local-runner/src/workflows/docs-operating-system-adoption/lockfile-refresh.ts
    packages/local-runner/src/core/docs-operating-system-lockfile-refresh-workflow.ts
    packages/local-runner/src/core/workflow-run-api.ts
    packages/local-runner/src/commands/workflow.ts
    packages/local-runner/src/commands/daemon.ts
    packages/local-runner/src/cli.ts

Add focused tests:

    packages/local-runner/tests/docs-operating-system-lockfile-refresh.test.ts
    packages/local-runner/tests/workflow-run-api.test.ts
    packages/local-runner/tests/daemon.test.ts
    packages/local-runner/tests/cli-help.test.ts

If hosted approval is touched, update focused app tests:

    apps/web/tests/unit/workspace-runner-events.test.ts
    apps/web/tests/unit/workspace-findings-read-model.test.ts

Update durable docs:

    docs/internal/workflow-packets.md
    docs/programs/completed/2026-05-06-worker-grade-docs-operating-system-adoption/program.md
    docs/exec-plans/completed/2026-05-06-docs-operating-system-lockfile-refresh-proof.md

## Validation and Acceptance

Acceptance requires the workflow to prove the package-manager lockfile path without mutating anything outside the lockfile and approved `.sbs` artifact roots. A successful fake-package-manager fixture should end with `proofStatus: "passed"`, `touchedFiles` containing the expected lockfile, and `unexpectedTouchedFiles: []`. A missing confirmation, stale prior apply state, dirty pre-existing lockfile, missing shared dependency metadata, unsupported package manager, or failed package-manager command should produce blocked or failed proof with the exact reason.

The implementation must not serialize raw package-manager stdout/stderr, package script bodies, target dependency versions, raw source, local absolute paths, or Codex transcripts into hosted-syncable artifacts. Command names and pass/fail/blocked statuses are sync-safe.

### Test Commands

Run these commands from `/Users/bazelrex/Developer/ship-by-sunday`:

- bun run --cwd packages/local-runner test -- docs-operating-system-lockfile-refresh.test.ts docs-operating-system-package-script-patching.test.ts docs-operating-system-install-plan.test.ts
- bun run --cwd packages/local-runner test -- workflow-run-api.test.ts daemon.test.ts cli-help.test.ts
- bun run --cwd packages/local-runner lint
- bun run --cwd packages/local-runner typecheck
- bun run --cwd packages/local-runner format:check
- bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-06-docs-operating-system-lockfile-refresh-proof.md
- bun run programs:lint
- bun run markdown:lint -- --paths docs/programs/completed/2026-05-06-worker-grade-docs-operating-system-adoption docs/exec-plans/completed/2026-05-06-docs-operating-system-lockfile-refresh-proof.md docs/internal/workflow-packets.md
- git diff --check

If hosted app code is touched, also run:

- bun run --cwd apps/web test:unit tests/unit/workspace-runner-events.test.ts tests/unit/workspace-findings-read-model.test.ts
- bun run --cwd apps/web lint
- bun run --cwd apps/web typecheck

## Idempotence and Recovery

The workflow should be safe to rerun with a fresh workflow run id after reviewing or reverting failed proof. It must block on dirty lockfiles before running so it does not mix owner changes with package-manager output. It may tolerate pre-existing dirty `package.json` and `scripts/sbs-docs/**` only when those refs still match the approved package-script patching contract.

If the package-manager command fails, the proof should record the command name, status, touched lockfile refs, unexpected touched refs, and rollback instructions. Recovery is ordinary Git review or revert of the named lockfile refs plus deletion of that run's `.sbs/runs/<workflow-run-id>/**` artifacts if the operator wants a clean retry.

If the package-manager command mutates `package.json` or wrapper files, proof should fail and name the guarded input ref that changed. That is a package-manager side effect outside this slice, not a reason to accept the mutation silently.

## Artifacts and Notes

Expected successful proof should include refs like:

    .sbs/runs/<workflow-run-id>/workflow-packet.json
    .sbs/runs/<workflow-run-id>/proof.json
    .sbs/runs/<workflow-run-id>/sync-preview.json
    .sbs/docs-operating-system-adoption/lockfile-refresh/manifest.json
    .sbs/docs-operating-system-adoption/lockfile-refresh/lockfile-refresh.json
    bun.lock

Expected safe command names are package-manager-specific and should remain narrow:

    bun install --lockfile-only --ignore-scripts
    npm install --package-lock-only --ignore-scripts
    pnpm install --lockfile-only --ignore-scripts

If Yarn support is not proven safely in this slice, the workflow should block Yarn with a clear unsupported package-manager reason rather than running an unbounded install.

Validation evidence from implementation:

    bun run --cwd packages/local-runner test
    Test Files  23 passed | 2 skipped (25)

    bun run --cwd apps/web test:unit tests/unit/workspace-runner-events.test.ts tests/unit/workspace-findings-read-model.test.ts
    Test Files  2 passed (2)

    bun run --cwd packages/local-runner typecheck
    tsc --noEmit -p tsconfig.json

    bun run --cwd apps/web typecheck
    Next.js production build and TypeScript completed successfully.

## Interfaces and Dependencies

This slice depends on local-runner workflow dispatch, approved workflow packet validation, `runBoundedProcess`, Git status parsing from `parseGitStatusPathsForProof`, the docs operating-system install-plan schema, the package-script patching summary, and the package patch helper that recognizes generated wrapper content.

Expected public TypeScript names include `DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_ID`, `DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_CONFIRM_FLAG`, `resolveDocsOperatingSystemLockfileRefreshCommand`, and `runDocsOperatingSystemLockfileRefreshWorkflow`.
