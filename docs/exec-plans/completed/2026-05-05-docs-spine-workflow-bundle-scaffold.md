---
title: Docs Spine Workflow Bundle Scaffold
status: complete
created_at: 2026-05-05
completed_at: 2026-05-05
summary: Create the deterministic local-runner workflow bundle scaffold for future docs-spine adoption in mature repositories.
post_build_recap: Added the docs-spine-adoption runner scaffold, exact approval packet validation, local .sbs artifacts, focused tests, and workflow packet docs.
program_id: docs-spine-adoption-operating-loop
planning_brief: docs/programs/completed/2026-05-05-docs-spine-adoption-operating-loop/planning-brief-1.md
read_when:
  - Starting implementation of the docs-spine adoption workflow bundle.
  - Updating local-runner workflow bundle conventions.
  - Validating the scaffold before scanner and Codex synthesis slices.
---

# Docs Spine Workflow Bundle Scaffold

This is a living execution plan for the first Docs Spine Adoption Operating Loop slice: create the workflow bundle scaffold that later scanners, Codex synthesis packets, apply logic, and the Arena CRM pilot will use.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday needs docs-spine adoption to become a repeatable local-runner workflow instead of a manual audit habit. The first implementation step is not to generate every doc. It is to create the workflow host: a deterministic bundle with a manifest, phase boundaries, schemas, artifact refs, proof output, approval constants, and focused tests.

After this slice, the repo should have a named `docs-spine-adoption` workflow scaffold that can be approved, resolved, blocked safely, and proven locally without mutating customer repo docs yet. Later slices can add scanners, bounded Codex draft generation, file application, and the Arena CRM pilot into this stable host.

## Progress

- [x] 2026-05-05: Created this ExecPlan from `docs/programs/completed/2026-05-05-docs-spine-adoption-operating-loop/planning-brief-1.md`.
- [x] 2026-05-05: Read root `AGENTS.md`, `docs/internal/workflow-packets.md`, the local-runner workflow implementations, workspace approval read models, Convex workflow model, and this ExecPlan before editing.
- [x] 2026-05-05: Added the `docs-spine-adoption` workflow id to local-runner and app approval surfaces.
- [x] 2026-05-05: Created the workflow bundle scaffold, manifest, schemas, artifact refs, and blocked/proof output.
- [x] 2026-05-05: Added focused tests for packet validation, CLI/daemon handling, and scaffold proof behavior.
- [x] 2026-05-05: Updated workflow contract docs, this ExecPlan, and the Program with validation evidence.

## Surprises & Discoveries

The app workflow approval detail model does not carry `nextRecommendedWorkflowId`; that value is recorded by workflow proof and runner events after execution, so the scaffold keeps the recommendation in local runner proof/sync artifacts instead of initial approval display state.

The daemon `--work` path can claim any approved workflow in the queue, so enabling docs-spine execution required an explicit `--confirm-docs-spine-adoption` daemon confirmation gate, not only a one-off workflow command flag.

The first facts artifact can be deterministic and useful without full source scanning by using `git ls-files` and manifest names to map instruction, docs, Program, ExecPlan, prompt/spec, generated-doc, validation, CI, and release surfaces.

## Decision Log

Decision: Keep the first scaffold in Bun and TypeScript.
Rationale: Existing local-runner workflow code, approval packet validation, CLI/daemon dispatch, Convex integration, and tests are TypeScript-owned. JSON phase boundaries keep future Go scanner replacement possible.
Date: 2026-05-05

Decision: Make the scaffold `.sbs`-only for customer repo writes.
Rationale: The first slice should prove workflow authority and artifacts before it applies docs to a mature repo. Actual docs writes belong to the later apply-and-proof slice.
Date: 2026-05-05

Decision: Treat Codex and subagents as synthesis and review workers, not authority owners.
Rationale: Deterministic workflow proof requires one controller to own allowed paths, phase order, schema validation, patch application, proof status, and sync payloads.
Date: 2026-05-05

## Outcomes & Retrospective

Complete. Ship by Sunday now recognizes `docs-spine-adoption` as a supported local-runner workflow with exact approval packet validation in the runner API and Convex model, catalog/detail visibility in the workspace UI read models, CLI and daemon dispatch, and focused tests.

The scaffold writes only `.sbs/runs/<workflow-run-id>/**` and `.sbs/docs-spine-adoption/**`. It creates a workflow packet, docs-spine manifest, repo facts and scanner artifacts, proof JSON, and sync preview metadata. It blocks on missing confirmation, wrong workflow id/version/profile/lease, unsafe branch names, dirty worktrees, packet drift, and unexpected touched files outside the approved `.sbs` surfaces.

The scaffold reserves later artifact refs for parity checklist, docs gap report, architecture signals, Semgrep output, AST output, and Codex drafts, but it does not implement scanners, Codex synthesis, Markdown application, Arena CRM mutation, provider setup, CI mutation, branch pushes, or pull requests.

Validation evidence:

    bun run --cwd packages/local-runner test -- docs-spine-adoption-workflow.test.ts workflow-run-api.test.ts cli-help.test.ts
    bun run --cwd apps/web test:unit -- workspace-findings-read-model.test.ts workspace-support-read-model.test.ts workspace-runner-events.test.ts
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner format:check
    bunx oxfmt -c .oxfmtrc.json --check <changed scaffold and read-model files>
    bun run --cwd packages/local-runner test
    bunx oxlint -c .oxlintrc.json --deny-warnings <changed app read-model and Convex files>
    bun run --cwd packages/local-runner build
    bun run typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-05-docs-spine-workflow-bundle-scaffold.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/completed/2026-05-05-docs-spine-adoption-operating-loop docs/exec-plans/completed/2026-05-05-docs-spine-workflow-bundle-scaffold.md docs/internal/workflow-packets.md docs/programs/README.md docs/programs/active/index.md
    git diff --check
    bun lint

`bun run format:check` was run as the broad formatting gate and failed on pre-existing unrelated dirty workspace UI/test files outside this scaffold slice: `workspace-doctor-pass-page.tsx`, `workspace-findings-page.tsx`, `workspace-runs-page.tsx`, `workspace-doctor-pass-page.test.tsx`, `workspace-doctor-pass-toast-watcher.test.tsx`, `workspace-runs-page.test.tsx`, and `workspace-setup-page.test.tsx`. The scaffold-owned files passed focused `oxfmt --check`, and `packages/local-runner format:check` passed.

## Context and Orientation

Existing local-runner workflows live in `packages/local-runner/src/core/`. The closest predecessor is `packages/local-runner/src/core/mature-repo-adoption-workflow.ts`, which resolves an approved workflow, requires explicit confirmation, validates branch/profile/lease metadata, writes `.sbs` artifacts, runs Git proof commands, and queues sync-safe proof events.

Workflow command dispatch lives in `packages/local-runner/src/commands/workflow.ts`, daemon work execution in `packages/local-runner/src/commands/daemon.ts`, CLI help in `packages/local-runner/src/cli.ts`, and workflow-run packet resolution in `packages/local-runner/src/core/workflow-run-api.ts`.

Hosted approval models live in `apps/web/app/(workspace)/_lib/workspace-findings-read-model.ts`, `apps/web/app/(workspace)/_lib/workspace-support-read-model.ts`, and `apps/web/convex/workspace/model.ts`. The workflow packet contract is documented in `docs/internal/workflow-packets.md`.

Generated-repo operating-pack rendering lives in `packages/codebase-compiler/src/repo-generation/render-starter-operating-pack.ts`. Use it only as reference for file shapes; mature-repo adoption must preserve detected conventions and avoid generated-starter assumptions.

### In Scope

Add `docs-spine-adoption` as a recognized workflow id and approval packet shape. Use workflow version `v1`.

Create a workflow bundle scaffold under a feature-local local-runner path, preferably:

    packages/local-runner/src/workflows/docs-spine-adoption/

If current local-runner organization makes `src/core/docs-spine-adoption-workflow.ts` the safer first step, use that path for the runnable wrapper and keep the bundle folder for manifest, schemas, prompts, and phases.

Add a manifest that declares workflow id/version, phases, local artifact refs, allowed and disallowed touch targets, proof commands, sync policy, rollback notes, required confirmation flag, parity-checklist placeholder refs, and performance budget placeholders.

Add initial schemas or TypeScript types for repo facts, source-truth map, command-proof map, docs-gap report, workflow packet, proof, sync preview, and the future parity checklist. In this scaffold, the facts can be minimal placeholders backed by deterministic metadata such as package manager and canonical instruction refs. The parity checklist can be a reserved artifact contract until the scanner, synthesis, and apply slices have enough evidence to populate it.

Implement blocked proof for missing confirmation, wrong workflow id, unsafe branch, wrong profile, expired write lease, dirty worktree, and unsafe packet metadata.

Implement a minimal successful path that writes only `.sbs/runs/<workflow-run-id>/**` and `.sbs/docs-spine-adoption/**`, runs Git proof commands, and sends sync-safe proof metadata without using the repo-local event outbox.

Update internal docs and focused tests.

### Out Of Scope

Do not implement the full scanner suite in this slice. Do not add Semgrep rule packs, AST parsing, Codex synthesis prompts, Markdown file application, Program/ExecPlan rendering into customer repos, package script mutation, CI mutation, branch pushes, pull requests, hosted execution, or the Arena CRM pilot.

Do not write customer repo docs in this slice. The only customer-repo writes are `.sbs` workflow artifacts.

Do not introduce Go in this slice. Keep the JSON boundaries ready for future replacement, but do not start a language migration before performance proof exists.

## Plan of Work

Start by adding shared constants for `docs-spine-adoption`: workflow id, version, branch pattern `sbs/docs-spine-adoption-<YYYYMMDD-HHMM>`, profile `sbs-workspace-write`, confirmation flag `--confirm-docs-spine-adoption`, expected outputs, allowed targets, disallowed targets, proof commands, sync policy, stop conditions, and rollback notes.

Next, wire the workflow id through the approval and runner boundaries. Update the workspace finding approval model, loops catalog, Convex allow-list and packet validation, runner API union, CLI help, workflow command dispatch, and daemon execution only as far as needed for the scaffold to run.

Then create the workflow bundle scaffold. Add a manifest module, schema/type modules, and the first workflow runner. The runner should mirror mature-repo workflow safety: explicit confirmation, clean worktree, write lease validation, branch validation, profile validation, local branch creation, `.sbs` artifact writes, Git proof commands, sync preview, and direct sync-safe runner event delivery that does not create `.sbs/events/**`.

Add tests next. Cover successful `.sbs` artifact proof, blocked proof for missing confirmation, blocked proof for dirty worktree, packet validation rejection for unsafe branch/profile/version, and CLI help or daemon routing when those are wired.

Finally, update `docs/internal/workflow-packets.md`, this ExecPlan, and the owning Program. Run focused validation first, then planning validation and diff hygiene.

## Milestones

The first milestone is workflow identity. It is complete when app and runner code recognize `docs-spine-adoption` as a supported workflow id with exact approval metadata.

The second milestone is bundle scaffold. It is complete when the local runner has a manifest, schema boundary, artifact layout, and minimal runnable workflow that writes only `.sbs` proof artifacts.

The third milestone is proof and closeout. It is complete when focused tests pass, docs are updated, this ExecPlan records validation, and the Program points to the scanner/facts child slice.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Inspect the current workflow surfaces:

    rg -n "mature-repo-adoption|observability-debuggability|source-truth-agent-readiness|workflowId" packages/local-runner apps/web/convex apps/web/app/\(workspace\)/_lib docs/internal

Implement the scaffold in the smallest coherent slice. Prefer extending existing local-runner patterns over inventing a new framework.

Run focused tests after implementation. Start with the local-runner tests for the new workflow and packet validation. Add app or Convex tests only for approval surfaces touched by the implementation.

## Validation and Acceptance

Acceptance requires the repo to recognize `docs-spine-adoption` as a supported local-runner workflow and to run a minimal approved scaffold that writes only `.sbs` artifacts and proof metadata.

The workflow must block safely on missing confirmation, expired write lease, dirty worktree, unsafe branch, wrong profile, wrong workflow id, or unsafe approval packet metadata.

The workflow must not write customer docs, source files, package manifests, lockfiles, CI config, provider config, migrations, branches remotes, pull requests, raw logs, raw source, or Codex transcripts in this slice.

### Test Commands

Run the narrow checks that match the files touched. The expected initial set is:

    bun run --cwd packages/local-runner test -- docs-spine-adoption-workflow.test.ts workflow-run-api.test.ts cli-help.test.ts
    bun run --cwd apps/web test:unit -- tests/unit/workspace-findings-read-model.test.ts tests/unit/workspace-support-read-model.test.ts tests/unit/workspace-runner-events.test.ts
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-05-docs-spine-workflow-bundle-scaffold.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/completed/2026-05-05-docs-spine-adoption-operating-loop docs/exec-plans/completed/2026-05-05-docs-spine-workflow-bundle-scaffold.md docs/internal/workflow-packets.md
    git diff --check

Run broader gates if the implementation touches shared app or runner behavior beyond the focused workflow boundaries:

    bun run format
    bun lint
    bun typecheck

## Idempotence and Recovery

The workflow should be safe to retry. If `.sbs` artifacts already exist for a workflow run, overwrite only that run's local artifacts or block with a clear reason if artifact state is inconsistent.

If branch creation fails because the branch already exists at an unexpected commit, block instead of switching silently.

If proof commands fail, write proof with `proofStatus: failed` and keep the next recommendation explicit. Do not escalate permissions or run broader commands.

If a later Go scanner is introduced, it must preserve the same JSON artifact contracts so this scaffold remains valid.

## Artifacts and Notes

The owning Program is `docs/programs/completed/2026-05-05-docs-spine-adoption-operating-loop/program.md`.

The first local artifacts should be:

    .sbs/runs/<workflow-run-id>/workflow-packet.json
    .sbs/runs/<workflow-run-id>/proof.json
    .sbs/runs/<workflow-run-id>/sync-preview.json
    .sbs/docs-spine-adoption/manifest.json
    .sbs/docs-spine-adoption/facts/repo-facts.json

The scaffold should reserve manifest refs for later artifacts such as `parity-checklist.json`, `docs-gap-report.json`, `architecture-signals.json`, Semgrep output, AST output, and Codex drafts, but it should leave their populated contents for later child ExecPlans.

## Interfaces and Dependencies

This slice depends on local Git, `.sbs` local artifact storage, local-runner credentials, workflow-run resolution, runner events, Convex workflow approval, workspace read models, and existing local-runner test harnesses.

It does not depend on Semgrep, tree-sitter, TypeScript compiler API, Codex synthesis, hosted execution, provider credentials, GitHub APIs, package installs, migrations, branch pushes, or pull requests.
