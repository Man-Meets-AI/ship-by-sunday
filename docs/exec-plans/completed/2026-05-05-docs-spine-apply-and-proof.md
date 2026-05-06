---
title: Docs Spine Apply And Proof
status: complete
created_at: 2026-05-05
completed_at: 2026-05-05
summary: Add the bounded workflow that can apply approved docs-spine draft Markdown and prove the local result.
post_build_recap: The local runner, CLI, daemon, workspace approval model, Convex approval guards, proof refs, tests, and internal packet docs now support docs-spine-apply-and-proof as a separate apply workflow with managed-section updates, structural Markdown proof, and Arena CRM pilot evidence.
program_id: docs-spine-adoption-operating-loop
planning_brief: docs/programs/completed/2026-05-05-docs-spine-adoption-operating-loop/planning-brief-4.md
read_when:
  - Reviewing the docs-spine apply workflow boundary.
  - Debugging managed-section docs-spine writes.
  - Debugging docs-spine apply approval or proof events.
---

# Docs Spine Apply And Proof

This document is a living execution plan. It was maintained while the docs-spine apply workflow slice was implemented and now records the completed boundary.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The previous `docs-spine-adoption` slices intentionally stopped at local `.sbs` scanner facts and draft packets. This slice adds the separate approved workflow, `docs-spine-apply-and-proof`, that can turn explicit apply-ready draft Markdown into repo docs on a local branch and produce proof. A user can now approve the apply workflow independently from adoption, run the local runner with `--confirm-docs-spine-apply`, and get bounded docs writes, managed updates to existing docs, or honest blocked proof.

## Progress

- [x] 2026-05-05: Added the `docs-spine-apply-and-proof` manifest and schema contract under `packages/local-runner/src/workflows/docs-spine-apply-and-proof/`.
- [x] 2026-05-05: Implemented `runDocsSpineApplyWorkflow` with branch guard, dirty-state guard, apply-ready draft parsing, approved target validation, docs writes, proof artifacts, sync preview, and direct runner events.
- [x] 2026-05-05: Wired local-runner approval validation, CLI dispatch, daemon worker dispatch, CLI help, and focused tests.
- [x] 2026-05-05: Wired workspace read-model approval UI metadata, support catalog row, Convex approval packet validation, supported-runner checks, and proof event ref guards.
- [x] 2026-05-05: Updated workflow packet docs, smoke checklist commands, and the Program ledger.
- [x] 2026-05-05: Hardened the final apply boundary with managed-section replacement for existing docs, a structural Markdown heading proof command, deterministic apply-ready Markdown from synthesis, and an Arena CRM pilot run.

## Surprises & Discoveries

The apply workflow cannot reuse the adoption workflow's clean-worktree rule directly. Adoption produces local `.sbs/docs-spine-adoption/**` drafts, and apply must tolerate those prior local artifacts while still blocking unexpected runtime or docs drift before it writes.

The synthesis packets originally described operations but did not include Markdown content. The adoption synthesis now emits deterministic `proposedFiles` entries with `targetRef` and `markdown`, and apply still blocks if a draft lacks that explicit content.

Arena CRM's local docs-spine apply proof passed, but its native `bun run gate` failed because Ultracite could not spawn Biome and tests could not resolve `happy-dom` from `test-setup.ts`. That is recorded as a repo setup/tooling blocker, not as apply workflow failure.

## Decision Log

Decision: Implement apply as `docs-spine-apply-and-proof`, not as a widened `docs-spine-adoption` phase.
Rationale: Adoption is deliberately `.sbs`-only. Applying docs needs a separate confirmation flag, branch guard, allowed docs roots, rollback text, and hosted proof validation.
Date: 2026-05-05

Decision: Update existing docs through managed `sbs-docs-spine` Markdown sections.
Rationale: Mature repos often already have `docs/` files. A marked section lets the workflow replace only its own prior output on rerun while preserving owner-written content around it.
Date: 2026-05-05

Decision: Add structural Markdown proof before treating apply as complete.
Rationale: Git proof shows what changed, but it does not prove the installed docs are usable Markdown entry points. The structural check catches applied Markdown files that lack a top-level heading.
Date: 2026-05-05

Decision: Do not allow root agent instruction edits in this apply slice.
Rationale: The Program still needs instruction routing, but root instruction changes are a higher-risk authority class than docs Markdown and should get a dedicated approval boundary.
Date: 2026-05-05

## Outcomes & Retrospective

The slice landed the docs-spine mutation workflow. It accepts only exact approval packets, requires `--confirm-docs-spine-apply`, verifies the checked-out branch matches `sbs/docs-spine-apply-YYYYMMDD-HHMM`, tolerates prior `.sbs` docs-spine draft artifacts, applies only approved Markdown files, and reports applied refs plus proof artifacts. New docs are created directly. Existing docs receive or replace a managed `sbs-docs-spine` section so reruns are deterministic and owner-written content remains intact.

## Context and Orientation

`packages/local-runner/src/core/docs-spine-apply-and-proof-workflow.ts` owns local execution. It reads JSON draft packets from `.sbs/docs-spine-adoption/drafts/**`. A draft is apply-ready only when it has `proposedFiles` entries with `targetRef` and `markdown`. Approved targets are limited to selected docs-spine paths under `docs/` plus local `.sbs` proof artifacts.

`packages/local-runner/src/core/workflow-run-api.ts`, `packages/local-runner/src/commands/workflow.ts`, `packages/local-runner/src/commands/daemon.ts`, and `packages/local-runner/src/cli.ts` expose the workflow to the runner. `apps/web/app/(workspace)/_lib/workspace-findings-read-model.ts` builds approval metadata for the app. `apps/web/convex/workspace/model.ts` validates exact approval packets and proof refs on the server.

### In Scope

This slice includes the apply workflow contract, docs application from explicit draft Markdown, managed-section updates to existing docs, local proof artifacts, structural Markdown proof, sync-safe metadata, CLI and daemon execution, workspace approval metadata, Convex validation, focused tests, Arena CRM pilot proof, and Program documentation updates.

### Out Of Scope

This slice does not call live Codex models, update root `AGENTS.md`, mutate package scripts or CI, fix customer repo-native gate dependencies, push branches, open pull requests, or sync Markdown bodies.

## Plan of Work

The implementation first creates a manifest that defines the new workflow id, confirmation flag, expected outputs, allowed docs roots, disallowed authorities, stop conditions, and rollback notes. Then the local runner gains a workflow implementation that validates the approved packet, branch, lease, dirty state, draft content, and target refs before writing. Finally the hosted app and Convex surfaces are updated so approval and proof validation match the runner exactly.

## Milestones

Milestone one is the local-runner apply engine. Success means a temp repo on the approved branch with an apply-ready `.sbs` draft creates `docs/index.md`, can update an existing docs file through a managed section, writes `.sbs` proof artifacts, and passes focused tests.

Milestone two is product approval wiring. Success means workflow run resolution accepts the exact apply packet, CLI help names the command, daemon worker mode requires the confirmation flag, and the app read model builds the expected approval packet.

Milestone three is hosted proof enforcement. Success means Convex accepts apply approval packets, rejects drift, allows approved docs touched refs, and blocks proof events that report unapproved paths such as `src/runtime.ts`.

Milestone four is real-repo pilot proof. Success means Arena CRM can run adoption, apply the approved drafts on `sbs/docs-spine-apply-20260505-2250`, pass local Git and structural Markdown proof, and record any native `bun run gate` failure as explicit blocked proof.

## Concrete Steps

The files changed for this slice are the local-runner workflow files under `packages/local-runner/src/workflows/docs-spine-apply-and-proof/`, the runner controller `packages/local-runner/src/core/docs-spine-apply-and-proof-workflow.ts`, runner dispatch files under `packages/local-runner/src/`, workspace approval and support read models under `apps/web/app/(workspace)/_lib/`, Convex workflow approval and proof handling in `apps/web/convex/workspace/model.ts`, focused test files under `packages/local-runner/tests/` and `apps/web/tests/unit/`, plus `docs/internal/workflow-packets.md`, `RUNNER_SMOKE_CHECKLIST.md`, and this Program packet.

To run the workflow manually after approval, the customer repo must already be on the approved branch and contain local `.sbs/docs-spine-adoption/drafts/**` draft packets with explicit `proposedFiles` Markdown entries. The command shape is:

    bun packages/local-runner/src/cli.ts workflow docs-spine-apply-and-proof run --workflow-run-id <id> --confirm-docs-spine-apply --repo <customer-repo-path> --json

Expected success includes `status: "proof_completed"`, `proofStatus: "passed"`, applied docs refs in `touchedFiles`, and proof artifacts under `.sbs/runs/<workflow-run-id>/`.

## Validation and Acceptance

Acceptance requires the workflow to apply only explicit Markdown draft files to approved docs paths, preserve owner-written content in existing docs through managed sections, block malformed or unapproved drafts, expose exact approval metadata to the local runner and app, reject proof events that claim unapproved touched refs, and record proof for the Arena CRM pilot.

### Test Commands

Run these commands from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun test packages/local-runner/tests/docs-spine-apply-and-proof-workflow.test.ts packages/local-runner/tests/workflow-run-api.test.ts packages/local-runner/tests/cli-help.test.ts
    bun test apps/web/tests/unit/workspace-findings-read-model.test.ts apps/web/tests/unit/workspace-runner-events.test.ts
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-05-docs-spine-apply-and-proof.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-05-docs-spine-apply-and-proof.md docs/programs/completed/2026-05-05-docs-spine-adoption-operating-loop/program.md docs/internal/workflow-packets.md RUNNER_SMOKE_CHECKLIST.md
    cd /Users/bazelrex/Developer/arena-crm && bun run gate
    git diff --check

## Idempotence and Recovery

The workflow is safe to retry after deleting the current `.sbs/runs/<workflow-run-id>/` artifacts or approving a fresh workflow run. It will replace only prior managed `sbs-docs-spine` sections in existing docs, cross no symlinks, write outside no approved docs roots, refuse the wrong branch, and stop after lease expiry. If a docs file or managed section should be removed, revert that file on the local branch and delete the apply run artifacts.

## Artifacts and Notes

The apply proof artifacts are `.sbs/runs/<workflow-run-id>/workflow-packet.json`, `.sbs/runs/<workflow-run-id>/proof.json`, `.sbs/runs/<workflow-run-id>/sync-preview.json`, and `.sbs/docs-spine-adoption/apply/apply-summary.json`.

The Arena CRM pilot used `/Users/bazelrex/Developer/arena-crm` on branch `sbs/docs-spine-apply-20260505-2250`. The adoption proof is `/Users/bazelrex/Developer/arena-crm/.sbs/runs/arena_docs_spine_adoption_pilot/proof.json`, the apply proof is `/Users/bazelrex/Developer/arena-crm/.sbs/runs/arena_docs_spine_apply_pilot/proof.json`, and the apply summary is `/Users/bazelrex/Developer/arena-crm/.sbs/docs-spine-adoption/apply/apply-summary.json`.

The supported apply draft shape is intentionally narrow:

    {
      "proposedFiles": [
        {
          "targetRef": "docs/index.md",
          "markdown": "# Docs\n"
        }
      ]
    }

## Interfaces and Dependencies

This slice depends on the existing local runner credential and workflow-run APIs, Convex workspace workflow approval storage, runner event ingestion, `.sbs` local artifact storage, Git proof commands, and structural Markdown proof. It adds no external provider setup, secrets, OAuth apps, webhooks, dependencies, migrations, CI permissions, or hosted executors.
