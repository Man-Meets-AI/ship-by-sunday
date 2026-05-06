---
title: Docs Spine Final Apply Proof And Arena Acceptance
status: complete
created_at: 2026-05-06
completed_at: 2026-05-06
summary: Harden docs-spine apply proof so renderer-complete docs are quality-gated, native gate blockers are recorded, and Arena CRM acceptance can replace weak prior output safely.
post_build_recap: Apply proof now tolerates approved prior docs-spine adoption artifacts, expands untracked .sbs directories before dirty-state decisions, replaces recognized weak prior docs-spine output on approved targets, runs a bounded repo-native gate candidate, records setup blockers separately from docs-spine quality, and passed repaired Arena CRM sandbox plus live acceptance with a 100 quality report.
program_id: docs-spine-adoption-quality-reset
planning_brief: docs/programs/completed/2026-05-05-docs-spine-adoption-quality-reset/planning-brief-4.md
read_when:
  - Reviewing final docs-spine apply proof hardening.
  - Debugging native gate blockers in docs-spine apply proof.
  - Checking Arena CRM quality-reset pilot evidence.
---

# Docs Spine Final Apply Proof And Arena Acceptance

This document is a living execution plan. It was maintained while final docs-spine apply proof and Arena CRM acceptance were implemented and now records the completed slice.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The docs-spine adoption loop can only be customer-ready if apply proof means more than "Markdown files exist." This slice makes the apply workflow prove renderer-complete docs before writes, tolerate the approved adoption artifacts that naturally exist before apply, replace recognized weak prior docs-spine output on approved targets, record native repo gate blockers without calling them docs-spine quality failures, and run the repaired flow against Arena CRM.

The visible result is that the local runner can take repaired docs-spine drafts, apply only approved docs files, produce `.sbs` proof with a deterministic quality report, and show whether the repo-native gate passed, failed, or was blocked by local setup.

## Progress

- [x] 2026-05-06: Added bounded native-gate proof to `docs-spine-apply-and-proof`.
- [x] 2026-05-06: Fixed apply dirty-state handling for Git status entries that collapse approved `.sbs/` adoption artifacts into a directory ref.
- [x] 2026-05-06: Added focused tests for setup blockers, true native-gate failures, blocked drafts, unapproved targets, managed sections, malformed drafts, symlink guards, and quality reports.
- [x] 2026-05-06: Ran a sandbox Arena CRM pilot from a clean clone of `/Users/bazelrex/Developer/arena-crm`; adoption proof passed, apply proof passed, apply quality scored 100, and `bun run gate` was recorded as blocked by `Error: Failed to run Biome: spawnSync biome ENOENT`.
- [x] 2026-05-06: Replaced recognized weak prior docs-spine output in the live Arena CRM checkout and recorded live apply proof at `/Users/bazelrex/Developer/arena-crm/.sbs/runs/arena_docs_spine_live_acceptance_apply/proof.json` with quality score 100.

## Surprises & Discoveries

Arena CRM's live checkout already contained the previous weak untracked docs-spine output on `sbs/docs-spine-apply-20260505-2250`. The repaired apply workflow first refused to start because replacing those files would overwrite existing local work. The final hardening added a narrow replacement path for recognized weak prior docs-spine output on approved targets, while still blocking unrelated dirty files.

Git may report untracked `.sbs/` as one directory entry even when every file under it is an approved docs-spine adoption artifact. The apply guard now expands untracked directories before filtering, so it still blocks unrelated `.sbs/runs/other-run/**` files while allowing prior docs-spine adoption proof for the current apply.

The native Arena gate fails before docs-spine quality is involved. `bun run gate` currently reports Biome spawn failure through Ultracite, and prior manual proof also showed missing `happy-dom` in test setup. The apply proof records that as blocked native proof while leaving the docs-spine quality report passed.

## Decision Log

Decision: Treat setup-shaped native gate failures as blocked proof, not docs-spine quality failure.
Rationale: A missing Biome binary or missing test environment package does not mean generated docs are structurally weak. The proof should show both facts: docs-spine quality passed and the repo-native gate remains blocked.
Date: 2026-05-06

Decision: Allow prior docs-spine adoption run artifacts only when their workflow packet identifies `docs-spine-adoption`.
Rationale: Apply naturally follows adoption and needs the adoption proof files present, but unrelated `.sbs/runs/**` artifacts should still block before writes.
Date: 2026-05-06

Decision: Run Arena acceptance in a sandbox clone instead of overwriting the live Arena checkout.
Rationale: The live checkout already has untracked weak docs from the previous pilot. Overwriting them without explicit approval would violate the dirty-worktree boundary.
Date: 2026-05-06

Decision: Replace recognized weak prior docs-spine output only on approved apply targets.
Rationale: The live pilot needed to move from the known weak v1 docs to the accepted repaired docs without weakening dirty-worktree safety for unrelated files.
Date: 2026-05-06

## Outcomes & Retrospective

The apply workflow now writes `.sbs/docs-spine-adoption/apply/quality-report.json` before applying, blocks weak or blocked drafts, applies only approved Markdown targets, replaces recognized weak prior docs-spine output on approved targets, preserves existing docs with managed sections, expands Git's collapsed untracked directories, tolerates prior docs-spine adoption run artifacts, and records native gate proof after docs structural proof.

The Arena sandbox and live pilots proved the repaired renderer and apply path can produce customer-visible docs that pass deterministic docs-spine quality. The remaining operational gap is outside the runner code: Arena's native `bun run gate` is blocked by repo-local dependency/tooling setup.

## Context and Orientation

`packages/local-runner/src/core/docs-spine-apply-and-proof-workflow.ts` owns apply execution. It reads apply-ready drafts from `.sbs/docs-spine-adoption/drafts/**`, reads scanner facts from `.sbs/docs-spine-adoption/facts/repo-facts.json`, builds the final planned Markdown set, runs `buildDocsSpineApplyQualityReport`, writes approved docs, runs Git and structural proof, then runs one native gate candidate discovered from package scripts.

`packages/local-runner/src/workflows/docs-spine-apply-and-proof/manifest.ts` owns the proof-command contract surfaced in approval packets. `packages/local-runner/tests/docs-spine-apply-and-proof-workflow.test.ts` owns the focused behavior tests. `codex-scripts/run-arena-docs-spine-pilot.ts` is an ignored local probe that clones Arena CRM into a temp directory and runs adoption plus apply. `codex-scripts/run-arena-live-docs-spine-apply.ts` is an ignored local probe that applied the repaired approved drafts to the live Arena checkout.

### In Scope

This slice includes apply proof hardening, native gate blocker recording, dirty-state tolerance for approved docs-spine artifacts, recognized weak-output replacement, focused tests, and sandbox plus live Arena acceptance proof.

### Out Of Scope

This slice does not fix Arena's Biome or `happy-dom` setup, mutate customer package scripts, update root agent instructions, push branches, open PRs, or change hosted provider configuration.

## Plan of Work

The implementation first extends the apply proof command contract to include a repo-native gate candidate. The apply workflow then reads scanner facts, selects the strongest native gate script, runs it with the detected package manager, summarizes the important failure lines, and records setup-shaped failures as blocked proof. Dirty-state filtering expands untracked directories and accepts only current apply artifacts, docs-spine adoption artifacts, approved docs targets, and prior run artifacts whose workflow packet identifies docs-spine adoption. Before writes, apply builds the final planned Markdown set so replacements and managed-section merges are evaluated exactly as they will be written.

Finally, focused tests cover the new behavior and the Arena pilot probe demonstrates the full workflow on a clean clone of the real customer repository.

## Milestones

Milestone one is native gate proof. Success means a repo with a setup-blocked native gate returns `proofStatus: passed`, a passed docs-spine quality report, and `blockedProof` naming the native command and exact blocker summary. A repo with a non-setup gate failure returns `proofStatus: failed`.

Milestone two is apply dirty-state hardening. Success means apply follows adoption in a clean repo even when Git reports `.sbs/` as a directory, while unrelated `.sbs/runs/other-run/**` artifacts still block.

Milestone three is Arena acceptance. Success means a clean Arena clone and the live Arena checkout run apply, write the contract docs, pass the docs-spine quality report with score 100, and record the native gate blocker honestly.

## Concrete Steps

The implementation touched `packages/local-runner/src/core/docs-spine-apply-and-proof-workflow.ts`, `packages/local-runner/src/workflows/docs-spine-apply-and-proof/manifest.ts`, and `packages/local-runner/tests/docs-spine-apply-and-proof-workflow.test.ts`. The ignored local proof probes are `codex-scripts/run-arena-docs-spine-pilot.ts` and `codex-scripts/run-arena-live-docs-spine-apply.ts`.

The Arena acceptance command was:

    bun codex-scripts/run-arena-docs-spine-pilot.ts

The observed result included:

    adoptionResult.proofStatus: passed
    applyResult.status: proof_completed
    applyResult.proofStatus: passed
    apply qualityReportStatus: passed
    apply qualityScore: 100
    native gate: blocked, Error: Failed to run Biome: spawnSync biome ENOENT

The live Arena acceptance proof path was:

    /Users/bazelrex/Developer/arena-crm/.sbs/runs/arena_docs_spine_live_acceptance_apply/proof.json

## Validation and Acceptance

Acceptance requires the focused apply tests to pass, local-runner typecheck, lint, and format checks to pass, and the Arena sandbox plus live pilots to prove the repaired docs quality path.

### Test Commands

Run these commands from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun test packages/local-runner/tests/docs-spine-apply-and-proof-workflow.test.ts
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner format:check
    bun codex-scripts/run-arena-docs-spine-pilot.ts
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-06-docs-spine-final-apply-proof-and-arena-acceptance.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-06-docs-spine-final-apply-proof-and-arena-acceptance.md docs/programs/completed/2026-05-05-docs-spine-adoption-quality-reset
    git diff --check

## Idempotence and Recovery

The apply workflow is safe to retry with a fresh workflow run id. It replaces recognized weak prior docs-spine output only on approved targets, replaces only managed sections in other existing docs, and blocks before writes when unexpected non-approved files are dirty. The sandbox Arena probe creates a new temp clone on each run. The live Arena probe writes only approved docs targets after the replacement guard accepts the prior weak docs-spine output.

If native gate proof is blocked, fix the repo-local setup and rerun with a fresh apply workflow. If apply blocks because the target checkout contains unrecognized dirty docs, review and either commit, remove, or explicitly approve replacing those files before rerunning.

## Artifacts and Notes

The final sandbox proof path from this run was `/var/folders/z4/0mjj1q8n0v17xyfyfvc11vx40000gn/T/arena-docs-spine-quality-reset-rT2sH3/arena-crm/.sbs/runs/arena_docs_spine_quality_reset_apply_pilot/proof.json`. The live Arena proof path was `/Users/bazelrex/Developer/arena-crm/.sbs/runs/arena_docs_spine_live_acceptance_apply/proof.json`.

Important proof snippet:

    qualityReportStatus: passed
    qualityScore: 100
    proofCommandResults[-1].commandName: bun run gate
    proofCommandResults[-1].status: blocked
    blockedProof[0].reason: Error: Failed to run Biome: spawnSync biome ENOENT

## Interfaces and Dependencies

This slice depends on local-runner workflow dispatch, `.sbs` artifact storage, docs-spine scanner facts, the deterministic quality evaluator, Git status and diff commands, and the customer repository's package manager and script inventory. It adds no external provider setup, secrets, database migrations, dependencies, CI permissions, branch pushes, or pull requests.
