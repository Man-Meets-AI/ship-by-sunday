---
title: Docs Operating System Package Script Patching
status: complete
created_at: 2026-05-06
completed_at: 2026-05-06
summary: Add an approved local-runner tooling-apply workflow that patches conflict-free docs operating-system package scripts, shared tooling dependency metadata, and wrapper files.
post_build_recap: The local runner and hosted approval surfaces now support a bounded docs-operating-system package-script patching workflow that applies conflict-free package scripts, shared tooling dependency metadata, and generated wrappers from the dry-run install plan.
program_id: worker-grade-docs-operating-system-adoption
planning_brief: docs/programs/active/2026-05-06-worker-grade-docs-operating-system-adoption/planning-brief-1.md
read_when:
  - Resuming package-script, dependency, or wrapper-file patching for the docs operating-system workflow.
  - Changing the docs-operating-system install-plan schema or conflict contract.
  - Validating the first tooling-apply authority after the dry-run workflow.
---

# Docs Operating System Package Script Patching

This document is a living execution plan for the first tooling-apply slice after the docs operating-system dry-run workflow.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The runner can now inspect a repo and write a dry-run install plan that says which portable docs tooling scripts, wrappers, and dependency metadata are missing or blocked. The next useful step is to let the runner apply only the conflict-free operations from that plan under a separate approval boundary, so a customer repo can gain the canonical docs commands without the dry-run workflow secretly mutating package files.

After this slice, an approved local-runner workflow can consume `.sbs/docs-operating-system-adoption/tooling-plan/install-plan.json`, verify that the plan still matches the current repo, patch root `package.json` structurally, write small wrapper files under `scripts/sbs-docs/`, and prove exactly which refs changed. Same-name scripts with unrecognized bodies remain blocked. Runtime setup, Worker-specific state, CI/provider setup, app-stack command wiring, broad root `AGENTS.md` rewrites, package-manager installs, and lockfile mutation remain outside this slice.

## Progress

- [x] 2026-05-06 EDT: Created this ExecPlan from the owning Program after confirming the dry-run install boundary is complete in `docs/exec-plans/completed/2026-05-06-worker-grade-docs-tooling-install-boundary.md`.
- [x] 2026-05-06 EDT: Read root `AGENTS.md`, `docs/exec-plans/PLANS.md`, `docs/programs/PROGRAMS.md`, the owning Program, `docs/internal/workflow-packets.md`, and the current docs operating-system dry-run implementation before editing code.
- [x] 2026-05-06 EDT: Added the package-script patching workflow manifest, schema, package patch helper, local-runner workflow, CLI dispatch, daemon dispatch, and approved packet validation.
- [x] 2026-05-06 EDT: Preserved the dry-run conflict contract by blocking package-script, dependency, or wrapper writes when the install plan contains blocked operations or the live `package.json` has drifted.
- [x] 2026-05-06 EDT: Added focused tests for package.json patching, wrapper writes, blocked collisions, stale plan protection, proof artifacts, command dispatch, and hosted approval/proof boundaries.
- [x] 2026-05-06 EDT: Updated this ExecPlan, the owning Program, and `docs/internal/workflow-packets.md` with implementation proof and remaining gaps.

## Surprises & Discoveries

The dry-run workflow already records `DOCS_OPERATING_SYSTEM_ADOPTION_NEXT_RECOMMENDED_WORKFLOW_ID` as `docs-operating-system-package-script-patching`, so this slice should implement that workflow id instead of inventing a second name.

## Decision Log

Decision: Implement package patching as a separate workflow id, `docs-operating-system-package-script-patching`.
Rationale: The dry-run workflow writes only `.sbs` artifacts and has a deliberately narrow approval packet. Package scripts, dependency metadata, and wrapper files are a different authority class and need their own packet, confirmations, allowed touch targets, proof, rollback notes, and hosted/local validation.
Date: 2026-05-06

Decision: Consume the dry-run install plan and re-check live state before writing.
Rationale: The install plan is useful evidence, but package files may drift after the dry run. The apply workflow must parse the current `package.json` and block if any canonical script that the plan expected to add now exists with an unrecognized body.
Date: 2026-05-06

Decision: Do not mutate lockfiles or run package-manager installs in this slice.
Rationale: Lockfile refresh can require network access and package-manager-specific behavior. This slice records the exact `package.json` devDependency change and leaves lockfile refresh as a later explicit authority, while still proving package-script and wrapper-file writes locally.
Date: 2026-05-06

Decision: Keep wrapper files tiny and generated under `scripts/sbs-docs/`.
Rationale: The Program decision is to avoid copying Worker validator implementations into customer repos. The wrappers should delegate to the shared `ship-by-sunday` package command surface and stay easy to replace in later validator slices.
Date: 2026-05-06

## Outcomes & Retrospective

This slice adds `docs-operating-system-package-script-patching` as a distinct tooling-apply workflow. It requires `installProfile: worker-grade`, `--confirm-docs-operating-system-tooling-apply`, an approved `sbs/docs-operating-system-package-scripts-YYYYMMDD-HHMM` branch, a live write lease, and a clean approved write surface before source writes.

The workflow consumes `.sbs/docs-operating-system-adoption/tooling-plan/install-plan.json`, parses root `package.json`, adds or keeps the canonical portable docs scripts, adds the exact `ship-by-sunday` devDependency metadata when missing, and writes generated wrappers under `scripts/sbs-docs/`. It writes run-level proof under `.sbs/runs/<workflow-run-id>/**` and apply metadata under `.sbs/docs-operating-system-adoption/tooling-apply/**`.

The conflict contract held: blocked dry-run operations, missing or malformed `package.json`, stale install-plan expectations, unrecognized same-name package scripts, and non-managed existing wrapper targets stop before package/wrapper writes. Hosted approval, resolve, claim, and proof-ref validation now recognize the new workflow and preserve `installProfile: worker-grade`.

Remaining gaps are intentionally outside this slice: package-manager installs, lockfile refresh, full shared validator command implementation, docs application, root instruction edits, runtime setup, CI/provider setup, app-stack command wiring, and Worker-specific state.

## Context and Orientation

The completed dry-run slice lives in `packages/local-runner/src/core/docs-operating-system-adoption-workflow.ts` and `packages/local-runner/src/workflows/docs-operating-system-adoption/`. It writes `.sbs/docs-operating-system-adoption/tooling-plan/install-plan.json`. The install plan contains `packageScriptOperations`, `dependencyOperations`, `validatorFileOperations`, `conflicts`, and `blockedOperations`. It intentionally does not serialize package script bodies or dependency versions.

`packages/local-runner/src/workflows/docs-operating-system-adoption/install-plan.ts` already defines the canonical script names and wrapper targets. A later apply workflow should reuse those names and targets so the dry run and apply phase cannot disagree. The canonical scripts are `programs:lint`, `plans:lint`, `markdown:lint`, `docs:validate`, `docs:refresh-quality`, and `program:write-child-plan`. The wrapper root is `scripts/sbs-docs/`.

`packages/local-runner/src/commands/workflow.ts`, `packages/local-runner/src/commands/daemon.ts`, and `packages/local-runner/src/core/workflow-run-api.ts` dispatch and validate local workflow packets. The new workflow must be added to those surfaces. If hosted approval is updated in this slice, `apps/web/convex/workspace/model.ts`, `apps/web/convex/workspace/validators.ts`, and `apps/web/app/(workspace)/_lib/workspace-findings-read-model.ts` are the approval/read-model surfaces, and Convex edits must follow `apps/web/convex/_generated/ai/guidelines.md`.

### In Scope

This slice adds one approved local-runner workflow that reads a prior docs operating-system install plan, blocks stale or conflicting operations, patches root `package.json` scripts and `devDependencies.ship-by-sunday` when conflict-free, writes small wrapper files under `scripts/sbs-docs/`, writes run-level proof under `.sbs/runs/<workflow-run-id>/**`, records apply metadata under `.sbs/docs-operating-system-adoption/tooling-apply/**`, and proves the diff with local Git proof plus wrapper syntax checks.

The workflow may update hosted approval and read-model surfaces if that is necessary to claim and resolve the new workflow id end to end. The package dependency version should be an exact version derived from `packages/local-runner/package.json` so the metadata is pinned.

### Out Of Scope

This slice does not run package-manager installs, update lockfiles, implement the full shared validator command surface, mutate docs files, edit root instruction files, configure CI or providers, push branches, open pull requests, touch runtime code, create `.runtime`, install Worker notes/goals/projects/workers/topology state, add worker-state commands, or wire customer app-stack commands.

If a target repo has an unknown existing canonical script body, the workflow blocks. It must not overwrite, rename, or replace that script in this slice.

## Plan of Work

Start by adding a package-script patching manifest and schema near the existing docs operating-system workflow. Reuse the dry-run constants where possible, but give the apply workflow its own allowed touch targets, expected outputs, confirmation flag, proof commands, rollback notes, and local artifact refs. The allowed write targets should be `.sbs/runs/<workflow-run-id>/**`, `.sbs/docs-operating-system-adoption/tooling-apply/**`, `package.json`, and `scripts/sbs-docs/**`.

Then add an apply helper that reads and validates `install-plan.json`, reads root `package.json` through `JSON.parse`, applies only `add`, `installable`, and already-present operations, and writes formatted JSON with a trailing newline. Preserve existing scripts and dependencies. Add missing canonical scripts that point at the corresponding wrapper files, add the exact `ship-by-sunday` devDependency when it is not already present, and write wrapper files only when missing or already recognized as runner-managed wrappers.

Next add `packages/local-runner/src/core/docs-operating-system-package-script-patching-workflow.ts`. It should mirror the guard/proof shape of the dry-run workflow: validate the approved packet, require `--confirm-docs-operating-system-tooling-apply`, enforce the write lease and clean starting state, block if the install plan is missing or stale, write a workflow packet, apply metadata, proof, and sync preview, and send runner events.

Finally, update dispatch, packet validation, docs, and tests. Keep the test fixtures small and use temporary Git repos. The focused tests should prove that conflict-free plans patch `package.json` and wrappers, blocked script collisions stop before writes, missing install plans block, stale plans block, and proof reports only approved refs.

## Milestones

Milestone one is the packet and manifest boundary. At the end, the local runner recognizes `docs-operating-system-package-script-patching`, validates its packet, and blocks without the explicit tooling-apply confirmation.

Milestone two is package and wrapper patching. At the end, a test fixture with a dry-run install plan can be patched structurally. `package.json` keeps owner scripts, gains only the missing canonical docs scripts, gains an exact `ship-by-sunday` devDependency when needed, and receives wrapper files under `scripts/sbs-docs/`.

Milestone three is conflict and drift safety. At the end, the workflow blocks before writing when the install plan has blocked operations, when a canonical script has appeared since the dry run with an unrecognized body, or when the root package manifest is missing or invalid.

Milestone four is proof and docs. At the end, proof artifacts list the touched refs and command statuses, `docs/internal/workflow-packets.md` explains the new authority, the owning Program points at the next slice, and focused validation passes.

## Concrete Steps

Work from `/Users/bazelrex/Developer/ship-by-sunday`.

Read the implementation context:

    sed -n '1,260p' docs/programs/completed/2026-05-06-worker-grade-docs-operating-system-adoption/program.md
    sed -n '1,320p' docs/exec-plans/completed/2026-05-06-worker-grade-docs-tooling-install-boundary.md
    sed -n '1,260p' packages/local-runner/src/workflows/docs-operating-system-adoption/manifest.ts
    sed -n '1,360p' packages/local-runner/src/workflows/docs-operating-system-adoption/install-plan.ts

Add or update these local-runner files:

    packages/local-runner/src/workflows/docs-operating-system-adoption/manifest.ts
    packages/local-runner/src/workflows/docs-operating-system-adoption/schemas.ts
    packages/local-runner/src/workflows/docs-operating-system-adoption/package-script-patching.ts
    packages/local-runner/src/core/docs-operating-system-package-script-patching-workflow.ts
    packages/local-runner/src/core/workflow-run-api.ts
    packages/local-runner/src/commands/workflow.ts
    packages/local-runner/src/commands/daemon.ts
    packages/local-runner/src/cli.ts

Add focused tests:

    packages/local-runner/tests/docs-operating-system-package-script-patching.test.ts
    packages/local-runner/tests/workflow-run-api.test.ts
    packages/local-runner/tests/daemon.test.ts
    packages/local-runner/tests/cli-help.test.ts

Update durable docs:

    docs/internal/workflow-packets.md
    docs/programs/completed/2026-05-06-worker-grade-docs-operating-system-adoption/program.md
    docs/exec-plans/completed/2026-05-06-docs-operating-system-package-script-patching.md

If hosted approval surfaces are included, first read `apps/web/AGENTS.md` and `apps/web/convex/_generated/ai/guidelines.md`, then update the minimal app files and their focused unit tests.

## Validation and Acceptance

Acceptance requires a conflict-free temporary repo to run the package-script patching workflow and end with only approved changes: root `package.json`, `scripts/sbs-docs/**`, `.sbs/runs/<workflow-run-id>/**`, and `.sbs/docs-operating-system-adoption/tooling-apply/**`. The same workflow must block before writing when the install plan contains blocked operations or when live `package.json` has an unrecognized same-name canonical script.

The workflow must not serialize script bodies, dependency versions from the target repo, raw source, raw logs, local absolute paths, or Codex transcripts in hosted-syncable proof. It may write exact wrapper contents locally because those are the approved generated files.

### Test Commands

Run these commands from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run --cwd packages/local-runner test -- docs-operating-system-package-script-patching.test.ts docs-operating-system-install-plan.test.ts
    bun run --cwd packages/local-runner test -- docs-operating-system-adoption-workflow.test.ts workflow-run-api.test.ts daemon.test.ts cli-help.test.ts
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner format:check
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-06-docs-operating-system-package-script-patching.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/completed/2026-05-06-worker-grade-docs-operating-system-adoption docs/exec-plans/completed/2026-05-06-docs-operating-system-package-script-patching.md docs/internal/workflow-packets.md
    git diff --check

If app-hosted approval code is touched, also run the focused app tests for workflow runner events and findings read models.

This slice touched hosted approval/read-model code, so the focused app validation command is:

    bun run --cwd apps/web test:unit tests/unit/workspace-runner-events.test.ts tests/unit/workspace-findings-read-model.test.ts
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck

## Idempotence and Recovery

The workflow must be safe to rerun with a fresh workflow run id. Re-running against a repo that already has recognized scripts, the exact dependency metadata, and runner-managed wrappers should keep them instead of duplicating them. A partially completed run should be recoverable by inspecting the Git diff and deleting only that run's `.sbs/runs/<workflow-run-id>/**` artifacts if needed.

If a write fails after `package.json` but before wrapper files, the Git diff should show the partial changes. The workflow should record blocked proof when possible and should never continue into broader writes to compensate. Recovery is ordinary Git review or revert of the approved touched refs.

## Artifacts and Notes

Expected successful proof should include refs like:

    package.json
    scripts/sbs-docs/programs-lint.mjs
    scripts/sbs-docs/exec-plans-lint.mjs
    scripts/sbs-docs/markdown-lint.mjs
    scripts/sbs-docs/docs-validate.mjs
    scripts/sbs-docs/docs-refresh-quality.mjs
    scripts/sbs-docs/write-child-plan.mjs
    .sbs/docs-operating-system-adoption/tooling-apply/package-script-patching.json
    .sbs/runs/<workflow-run-id>/proof.json

Expected package script values should be stable and wrapper-based, such as:

    bun scripts/sbs-docs/programs-lint.mjs
    bun scripts/sbs-docs/exec-plans-lint.mjs
    bun scripts/sbs-docs/markdown-lint.mjs
    bun scripts/sbs-docs/docs-validate.mjs
    bun scripts/sbs-docs/docs-refresh-quality.mjs
    bun scripts/sbs-docs/write-child-plan.mjs

## Interfaces and Dependencies

This slice depends on the existing docs operating-system install plan, local-runner workflow dispatch, approved workflow packet validation, Bun tests, temporary Git repo fixtures, and root `package.json` parsing.

The new public TypeScript names should be domain-specific. Expected names include `DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_ID`, `DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_CONFIRM_FLAG`, `buildDocsOperatingSystemPackagePatch`, `applyDocsOperatingSystemPackagePatch`, and `runDocsOperatingSystemPackageScriptPatchingWorkflow`.
