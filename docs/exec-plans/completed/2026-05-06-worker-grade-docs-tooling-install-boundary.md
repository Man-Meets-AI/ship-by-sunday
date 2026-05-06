---
title: Worker-Grade Docs Tooling Install Boundary
status: complete
created_at: 2026-05-06
completed_at: 2026-05-06
summary: Add a dry-run local-runner workflow that plans portable docs tooling installation without mutating customer package files or Worker-specific surfaces.
post_build_recap: The local runner now supports a confirmed docs-operating-system-adoption dry-run workflow that emits sync-safe portable tooling plans, detects script conflicts and out-of-scope Worker/runtime surfaces, and proves it writes only approved .sbs artifacts.
program_id: worker-grade-docs-operating-system-adoption
planning_brief: docs/programs/active/2026-05-06-worker-grade-docs-operating-system-adoption/planning-brief-1.md
read_when:
  - Resuming the portable docs tooling install boundary implementation.
  - Changing local-runner workflow packet validation or install-plan schemas.
  - Validating dry-run install plans against Worker, Ship by Sunday, Arena CRM, or sparse fixtures.
---

# Worker-Grade Docs Tooling Install Boundary

This document is a living execution plan for the first portable docs tooling install slice. It must stay current as implementation, validation, and discoveries happen.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The local runner can now generate and apply a strong docs spine, but customer repos still get blocked proof when the docs mention validator commands that are not installed. This slice creates the next boundary: a dry-run workflow that inspects a repo and writes a deterministic plan for installing only the portable docs core tooling.

After this slice, Parker should be able to run one local-runner workflow and inspect `.sbs/docs-operating-system-adoption/**` plus `.sbs/runs/<workflow-run-id>/proof.json` to see which portable docs modules are already present, which package scripts or wrappers would be added later, which script names conflict, and which adjacent Worker/runtime surfaces are explicitly out of scope. The slice does not edit `package.json`, lockfiles, docs files, root instruction files, validator files, runtime files, CI, provider setup, or app-stack commands.

## Progress

- [x] 2026-05-06 EDT: Created this ExecPlan from `docs/programs/active/2026-05-06-worker-grade-docs-operating-system-adoption/planning-brief-1.md`.
- [x] 2026-05-06 EDT: Read the required implementation context before editing: root `AGENTS.md`, `docs/exec-plans/PLANS.md`, the owning Program packet, `docs/internal/workflow-packets.md`, and the local-runner workflow dispatch files.
- [x] 2026-05-06 EDT: Added the dry-run `docs-operating-system-adoption` workflow packet, manifest constants, workflow dispatch, daemon dispatch, and proof artifacts.
- [x] 2026-05-06 EDT: Added the portable docs install-plan schema and deterministic planner.
- [x] 2026-05-06 EDT: Added same-name canonical script collision handling and explicit out-of-scope reporting for runtime, Worker state, topology, CI/provider setup, app-stack commands, and broad root instruction rewrites.
- [x] 2026-05-06 EDT: Added focused planner and workflow tests plus an opt-in real-repo dry-run eval against Worker, Ship by Sunday, and Arena CRM.
- [x] 2026-05-06 EDT: Updated this ExecPlan and the Program with implementation proof.

## Surprises & Discoveries

The existing docs-spine scanner already had the right privacy boundary for this slice: it exposes package manager, script names, dependency names, docs refs, instruction refs, validation refs, CI refs, and prompt refs without exposing package script bodies or raw source. The new installer can therefore build a useful dry-run plan by reading `package.json` only as a local boundary input, then serializing statuses and reasons rather than command bodies.

The direct workflow does not need to create or switch branches for this dry-run. It follows the docs-spine adoption scaffold model where the approved branch name is metadata, while the actual writes stay under `.sbs/runs/<workflow-run-id>/**` and `.sbs/docs-operating-system-adoption/**`.

## Decision Log

Decision: Make this first slice dry-run manifest only.
Rationale: The runner needs a proven install-plan schema, conflict model, proof shape, and real-repo behavior before it mutates customer `package.json`, lockfiles, wrapper files, or validators.
Date: 2026-05-06

Decision: Keep `worker-grade` as a portable docs quality profile, not a Worker clone.
Rationale: The profile name should mean Worker-quality docs memory, planning contracts, prompts, validators, scripts, and proof. It must not select Worker runtime, Worker notes/goals/projects, worker role docs, topology, worker-state commands, CI/provider setup, app-stack commands, or broad root `AGENTS.md` rewrites.
Date: 2026-05-06

Decision: Use a pinned shared tooling package plus small wrappers as the future validator source of truth.
Rationale: Customer repos should not receive copied Worker validator implementations. A shared package keeps updates centralized, while small checked-in wrappers make commands discoverable and repo-local.
Date: 2026-05-06

Decision: Block unknown collisions with canonical validator script names.
Rationale: Existing customer scripts may already use `programs:lint`, `plans:lint`, `markdown:lint`, `docs:validate`, `docs:refresh-quality`, or `program:write-child-plan`. The runner must not overwrite those bodies. The dry-run plan should classify them as keep, add, rename proposal, blocked, or conflict.
Date: 2026-05-06

Decision: Make conflict-free dry runs pass proof even when the future install plan contains blocked operations.
Rationale: A blocked operation such as an unknown same-name package script is useful output of this dry-run, not a failure of the dry-run itself. Proof should fail only when the dry-run writes outside its authority or a proof command fails. Blocked future operations are recorded in `blockedProof` for the next approval slice.
Date: 2026-05-06

## Outcomes & Retrospective

This slice shipped the first concrete docs operating-system tooling boundary. The runner now accepts approved `docs-operating-system-adoption` packets with `installProfile: worker-grade`, requires `--confirm-docs-operating-system-scan` and `--confirm-docs-operating-system-tooling-plan`, writes a manifest, repo facts, scanner summary, install plan, proof, and sync preview under approved `.sbs` roots, and leaves `package.json`, lockfiles, docs, validators, wrappers, root instructions, CI, runtime files, and source code untouched.

The install plan resolves only the portable docs core modules: docs spine, Programs, ExecPlans, prompts, markdown lint, docs validation, planning scripts, and proof artifacts. It plans canonical script operations for `programs:lint`, `plans:lint`, `markdown:lint`, `docs:validate`, `docs:refresh-quality`, and `program:write-child-plan`; it marks recognized existing scripts as keep, missing scripts as add, and unknown same-name scripts as blocked conflicts without serializing script bodies. It also reports runtime, Worker-specific state, topology, CI/provider setup, app-stack command wiring, and broad root instruction rewrites as out of scope.

The next slice should be package-script and wrapper patching. It should consume this install plan, parse and patch `package.json` structurally, add small checked-in wrapper files, update lockfiles only with explicit tooling-apply authority, and keep the same conflict model for same-name owner work.

## Context and Orientation

The local runner code lives under `packages/local-runner/src`. `packages/local-runner/src/commands/workflow.ts` handles direct `ship-by-sunday workflow <name> run` execution, parses workflow confirmation flags, loads local project state and runner credentials, resolves the approved workflow packet, dispatches to the workflow function, and converts `proofStatus` into a process exit code.

`packages/local-runner/src/commands/daemon.ts` handles queued daemon work. It claims approved workflow runs and dispatches by `approvedWorkflowRun.workflowId`. If the daemon can claim the new workflow, its worker confirmation checks must require the new dry-run confirmations before it can write `.sbs` artifacts.

`packages/local-runner/src/core/workflow-run-api.ts` owns approved workflow packet typing and validation. It currently accepts `source-truth-agent-readiness`, `observability-debuggability`, `broken-app-triage`, `mature-repo-adoption`, `docs-spine-adoption`, and `docs-spine-apply-and-proof`. This slice adds `docs-operating-system-adoption` with `installProfile: worker-grade`, `profileName: sbs-workspace-write`, dry-run allowed touch targets, and exact expected outputs.

`packages/local-runner/src/core/docs-spine-adoption-workflow.ts` shows the existing local artifact pattern: assert the approved packet, enforce confirmation flags and write lease, write `.sbs/runs/<workflow-run-id>/**`, create structured artifacts, run proof commands, and deliver sync-safe runner events. Reuse its boundaries as code patterns, but do not chain the public `runDocsSpineAdoptionWorkflow` function from the new workflow.

`packages/local-runner/src/workflows/docs-spine-adoption/scanner.ts` and `schemas.ts` already collect safe repo facts such as package manager, package script names, dependency names, docs refs, Program refs, ExecPlan refs, prompt refs, instruction refs, validation refs, and CI refs. The install planner should reuse or extract scanner phase services so it can reason from names and repo-relative refs without storing raw source, raw logs, package script bodies, dependency versions, or local absolute paths.

`docs/internal/workflow-packets.md` documents the user-facing workflow packet contracts. Update it when the new workflow packet exists so a future operator can tell exactly what the runner can and cannot write.

### In Scope

This slice adds the dry-run `docs-operating-system-adoption` workflow ID, workflow manifest constants, approved packet validation, CLI and daemon dispatch, phase confirmation flags for scan and tooling-plan proof, `.sbs/docs-operating-system-adoption/**` artifact writing, a structured portable docs install-plan schema, deterministic install-plan synthesis, same-name package script collision classification, out-of-scope detection/reporting, proof artifacts, focused tests, and real-repo dry-run eval hooks.

The only install modules in scope are `docs-spine`, `programs`, `exec-plans`, `prompts`, `markdown-lint`, `docs-validate`, `planning-scripts`, and `proof-artifacts`. The canonical portable docs scripts in scope are `programs:lint`, `plans:lint`, `markdown:lint`, `docs:validate`, `docs:refresh-quality`, and `program:write-child-plan`.

### Out Of Scope

This slice does not mutate `package.json`, lockfiles, docs files, root instruction files, validator files, wrapper files, runtime files, CI files, provider settings, app-stack commands, or customer source code.

Runtime bootstrap, runtime health, `.runtime` state, gateway or process supervision, `ASSISTANT_RUNTIME_ROOT`, Worker notes, Worker goals, Worker projects, worker role docs, `system/topology.json`, worker-state commands, CI/provider setup, app-stack run commands, and broad root `AGENTS.md` rewrites are out of scope. The dry-run plan may report these surfaces as detected or deferred, but it must not model them as installable modules.

## Plan of Work

Start by adding a new workflow namespace under `packages/local-runner/src/workflows/docs-operating-system-adoption/`. Create `manifest.ts` for IDs, versions, allowed and disallowed touch targets, confirmation flag names, expected outputs, proof commands, sync policy, rollback notes, and the portable module list. Create `schemas.ts` for the install-plan and proof artifact types. Create `install-plan.ts` for the deterministic planner that consumes scanner facts and returns module states, script operations, dependency operations, validator-file operations, conflicts, blocked operations, out-of-scope detections, proof commands, and rollback notes.

Then add `packages/local-runner/src/core/docs-operating-system-adoption-workflow.ts`. It should follow the proof-writing shape from `docs-spine-adoption-workflow.ts`: validate the packet, enforce safe workflow run ids and write leases, require `--confirm-docs-operating-system-scan` and `--confirm-docs-operating-system-tooling-plan` for the dry-run phases, write `.sbs/docs-operating-system-adoption/facts/repo-facts.json`, write `.sbs/docs-operating-system-adoption/tooling-plan/install-plan.json`, write `.sbs/runs/<workflow-run-id>/workflow-packet.json`, write `.sbs/runs/<workflow-run-id>/proof.json`, and run `git status --short`, `git diff --name-only`, and `git diff --check` as proof.

Next, update workflow dispatch. `packages/local-runner/src/core/workflow-run-api.ts` should accept the new workflow id and assert the exact dry-run packet contract. `packages/local-runner/src/commands/workflow.ts` should accept `docs-operating-system-adoption`, parse `--confirm-docs-operating-system-scan`, parse `--confirm-docs-operating-system-tooling-plan`, and dispatch to the new workflow. `packages/local-runner/src/commands/daemon.ts` should be able to claim and run the workflow only when the corresponding dry-run confirmations are present.

Finally, add tests. Existing docs-spine tests should keep passing. New tests should prove packet validation, missing confirmation blocking, dry-run artifact writing, script collision classification, out-of-scope reporting, and real-repo dry-run behavior.

## Milestones

Milestone one is the workflow packet and dispatch boundary. At the end, the direct CLI and daemon code recognize `docs-operating-system-adoption`, approved packets validate `installProfile: worker-grade`, and unsupported profiles or missing confirmations block before artifacts are written.

Milestone two is the install-plan schema and planner. At the end, the planner consumes safe scanner facts and produces a deterministic JSON plan with only portable docs core modules. It classifies canonical script names as already present, installable, conflict, blocked, or rename proposal, and reports runtime or Worker-specific state surfaces as out of scope.

Milestone three is dry-run proof. At the end, running the workflow writes only `.sbs/runs/<workflow-run-id>/**` and `.sbs/docs-operating-system-adoption/**`, records proof commands, avoids raw source and script bodies, and returns passed, failed, or blocked proof without mutating customer package files.

Milestone four is real-repo confidence. At the end, focused tests pass and the dry-run eval inspects Worker, Ship by Sunday, Arena CRM, and at least one sparse fixture. The sparse fixture should prove that the runner does not invent runtime, worker-state, topology, notes, goals, projects, CI, provider, app-stack, or broad root instruction surfaces.

## Concrete Steps

Work from `/Users/bazelrex/Developer/ship-by-sunday`.

Read the context first:

    sed -n '1,240p' docs/programs/active/2026-05-06-worker-grade-docs-operating-system-adoption/program.md
    sed -n '1,140p' docs/programs/active/2026-05-06-worker-grade-docs-operating-system-adoption/planning-brief-1.md
    sed -n '1,260p' docs/exec-plans/PLANS.md

Add workflow constants and schemas under:

    packages/local-runner/src/workflows/docs-operating-system-adoption/manifest.ts
    packages/local-runner/src/workflows/docs-operating-system-adoption/schemas.ts
    packages/local-runner/src/workflows/docs-operating-system-adoption/install-plan.ts

The install plan should use a schema version such as `docs-operating-system-install-plan.v1`, `workflowId: docs-operating-system-adoption`, `workflowVersion: v1`, and `installProfile: worker-grade`. The resolved module list must contain only:

    docs-spine
    programs
    exec-plans
    prompts
    markdown-lint
    docs-validate
    planning-scripts
    proof-artifacts

Add the workflow runner:

    packages/local-runner/src/core/docs-operating-system-adoption-workflow.ts

The successful dry-run should create artifacts like:

    .sbs/docs-operating-system-adoption/facts/repo-facts.json
    .sbs/docs-operating-system-adoption/tooling-plan/install-plan.json
    .sbs/runs/<workflow-run-id>/workflow-packet.json
    .sbs/runs/<workflow-run-id>/proof.json
    .sbs/runs/<workflow-run-id>/sync-preview.json

Update dispatch and packet validation:

    packages/local-runner/src/core/workflow-run-api.ts
    packages/local-runner/src/commands/workflow.ts
    packages/local-runner/src/commands/daemon.ts
    docs/internal/workflow-packets.md

Add tests in `packages/local-runner/tests/`. A reasonable split is:

    docs-operating-system-adoption-workflow.test.ts
    docs-operating-system-install-plan.test.ts
    docs-operating-system-real-repo-eval.test.ts

The real-repo eval should be skipped unless an environment flag such as `SBS_DOCS_OPERATING_SYSTEM_REAL_REPO_EVAL=1` is set. It should default to the known local repos used by the docs-spine eval: `/Users/bazelrex/Developer/worker`, `/Users/bazelrex/Developer/ship-by-sunday`, and `/Users/bazelrex/Developer/arena-crm`, with environment overrides.

After implementation, update this ExecPlan `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective`. Also update the owning Program with exact files changed, proof artifacts, validation results, and the next recommended slice for package-script patching.

## Validation and Acceptance

Acceptance requires the new workflow to be usable through the local-runner CLI, to block without explicit dry-run confirmations, to write only approved `.sbs` artifacts, and to emit a deterministic install plan for the portable docs core. The plan must not include runtime, Worker-specific operating state, CI/provider setup, app-stack command wiring, broad root `AGENTS.md` rewrites, raw source, raw logs, package script bodies, dependency versions, or local absolute paths.

The install plan must demonstrate these observable behaviors:

It reports `programs`, `exec-plans`, `prompts`, `markdown-lint`, `docs-validate`, `planning-scripts`, and `proof-artifacts` as module states.

It reports canonical script names as keep, add, blocked, conflict, or rename proposal without overwriting unknown existing scripts.

It reports runtime and Worker-specific state as out of scope when detected.

It records proof under `.sbs/runs/<workflow-run-id>/proof.json` and writes the plan under `.sbs/docs-operating-system-adoption/tooling-plan/install-plan.json`.

### Test Commands

Run these commands from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run --cwd packages/local-runner test -- docs-operating-system-adoption-workflow.test.ts docs-operating-system-install-plan.test.ts
    SBS_DOCS_OPERATING_SYSTEM_REAL_REPO_EVAL=1 bun run --cwd packages/local-runner test -- docs-operating-system-real-repo-eval.test.ts
    bun run --cwd packages/local-runner test -- docs-spine-adoption-workflow.test.ts docs-spine-apply-and-proof-workflow.test.ts
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner format:check
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-06-worker-grade-docs-tooling-install-boundary.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/active/2026-05-06-worker-grade-docs-operating-system-adoption docs/exec-plans/active/2026-05-06-worker-grade-docs-tooling-install-boundary.md
    git diff --check

If the real-repo eval cannot run because a local comparison repo is missing, record the missing path in this ExecPlan and in the Program before calling the slice complete. Do not substitute synthetic confidence for the real-repo proof unless Parker explicitly changes the acceptance bar.

## Idempotence and Recovery

The dry-run workflow must be safe to rerun with a fresh workflow run id. It should write only under `.sbs/runs/<workflow-run-id>/**` and `.sbs/docs-operating-system-adoption/**`. It should not delete or rewrite customer files, package manifests, lockfiles, docs files, validators, root instruction files, runtime state, CI, provider setup, or source code.

If the workflow blocks because the worktree has unsafe existing `.sbs` artifacts, record blocked proof and stop before additional writes. If the workflow blocks because an approved packet is stale, expired, missing `installProfile`, or has the wrong profile, write blocked proof under the local run directory when safe and return a nonzero exit through the CLI.

If a test fixture creates a temporary repo, clean it up through the test utility or leave it in the system temp directory only when the test framework does that already. Real-repo evals must not write outside `.sbs` and must not mutate package files.

## Artifacts and Notes

Expected successful proof should be short and machine-checkable. A successful dry-run CLI transcript should look like:

    Docs operating system adoption workflow wrote .sbs/runs/workflowRuns_docs_os.
    Branch: sbs/docs-operating-system-adoption-20260506-1200.
    Proof status: passed.

Expected install-plan excerpts should show only portable docs modules:

    installProfile: worker-grade
    resolvedModules: docs-spine, programs, exec-plans, prompts, markdown-lint, docs-validate, planning-scripts, proof-artifacts
    outOfScopeDetections: runtime, worker-state, topology, ci-provider-setup, app-stack-command-wiring, broad-root-agent-rewrite

Do not paste raw customer source, raw command logs, full package script bodies, local absolute paths from customer repos, secrets, or provider data into proof artifacts or this plan.

## Interfaces and Dependencies

This slice depends on local-runner workflow dispatch, approved workflow packet validation, local project state, runner credentials, `.sbs` artifact storage, docs-spine scanner facts, package manager and package script name detection, Git proof commands, Bun tests, and the existing docs-spine real-repo eval pattern.

New public TypeScript surfaces should be narrow and named for the domain. Expected names include `DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_ID`, `DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_VERSION`, `DOCS_OPERATING_SYSTEM_ADOPTION_PROFILE_NAME`, `DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE`, `buildDocsOperatingSystemInstallPlan`, and `runDocsOperatingSystemAdoptionWorkflow`.

The `ApprovedWorkflowRunPacket` type should keep `profileName` as execution authority and add `installProfile` for the selected docs tooling profile. `installProfile` is required for `docs-operating-system-adoption` and should initially accept only `worker-grade`.
