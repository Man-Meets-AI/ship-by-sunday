---
title: Docs Spine Contract Grade Renderer Synthesis
status: complete
created_at: 2026-05-05
completed_at: 2026-05-05
summary: Replace thin docs-spine renderers with contract-grade Markdown that passes the deterministic quality evaluator.
post_build_recap: Reworked docs-spine synthesis output for docs index, Program, ExecPlan, prompt, validation, proof, and quality-score files so focused adoption proof now passes quality evaluation.
program_id: docs-spine-adoption-quality-reset
planning_brief: docs/programs/completed/2026-05-05-docs-spine-adoption-quality-reset/planning-brief-3.md
read_when:
  - Reviewing docs-spine renderer output.
  - Updating generated docs-spine Markdown contracts.
  - Debugging why docs-spine quality reports pass or fail after synthesis.
---

# Docs Spine Contract Grade Renderer Synthesis

This is a completed execution plan for the third Docs Spine Adoption Quality Reset slice.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The scanner and quality evaluator were repaired first, but synthesis still emitted placeholder Markdown. This slice replaces that thin output with contract-grade docs-spine Markdown so adoption proof can be green only when the drafts are structurally useful.

The user-visible result is that the runner's draft docs now look like a real operating spine: docs index, Program contract, active Program, ExecPlan contract, active ExecPlan, prompt inventory, validation notes, proof notes, and quality-score scorecard contract.

## Progress

- [x] 2026-05-05: Read planning brief 3 and inspected the current synthesis renderer, generated operating-pack renderer, docs index, and quality-score references.
- [x] 2026-05-05: Removed false blocked states for create/update drafts that have enough facts to render apply-ready Markdown.
- [x] 2026-05-05: Replaced the docs index renderer with frontmatter, Owns, Does Not Own, Codex guidance, First Hop, Native Gates, Existing Docs, Missing Surfaces, and Next sections.
- [x] 2026-05-05: Replaced Program and ExecPlan contract renderers with frontmatter, required structure, prompt or validation contracts, and lint command guidance.
- [x] 2026-05-05: Replaced active Program and active ExecPlan renderers with the required sections expected by the deterministic quality evaluator.
- [x] 2026-05-05: Replaced prompt, validation, proof, and quality-score renderers with complete contract output.
- [x] 2026-05-05: Updated tests so adoption proof now expects a passing quality report and no blocked proposed files.

## Surprises & Discoveries

The quality-score draft can be apply-ready without inventing a numeric score. The key is to render the scorecard contract, severity framework, `QUALITY_SCORE.review` hook, and blocked evidence language as part of the real document.

Local skills should not appear in generated Markdown as primary guidance. The scanner stores skill facts, but the renderer now avoids putting `.codex/skills/**` into first-hop docs where the hidden-noise rule would correctly fail it.

## Decision Log

Decision: Treat missing docs-spine files as create operations, not blocked drafts.
Rationale: A missing `docs/index.md`, Program contract, ExecPlan contract, or prompt index is exactly what the renderer can create when scanner facts are sufficient.
Date: 2026-05-05

Decision: Keep numeric quality score blocked while making `docs/QUALITY_SCORE.md` apply-ready.
Rationale: The scorecard contract is useful immediately, but numeric scores require a later evidence-bound quality audit.
Date: 2026-05-05

Decision: Keep Program and ExecPlan output compact but contract-compliant.
Rationale: Customer repos need a strong first operating packet without importing all Ship by Sunday-specific history.
Date: 2026-05-05

## Outcomes & Retrospective

Complete. `packages/local-runner/src/workflows/docs-spine-adoption/synthesis.ts` now emits contract-grade Markdown for the initial docs spine. The focused adoption workflow test now produces `proofStatus: passed`, a quality report with `status: passed`, and `score: 100` for the fixture repo.

This slice does not prove Arena CRM end to end yet. The next slice must harden final apply/proof and run the pilot acceptance path against the real customer test repo.

## Context and Orientation

`packages/local-runner/src/workflows/docs-spine-adoption/synthesis.ts` consumes scanner facts and writes draft JSON under `.sbs/docs-spine-adoption/drafts/**`. `packages/local-runner/src/workflows/docs-spine-adoption/quality-eval.ts` evaluates those drafts before adoption proof is marked passed.

### In Scope

This slice changed the deterministic renderer output and focused tests for adoption quality status.

### Out Of Scope

This slice did not run the Arena CRM pilot, did not apply files to a real customer repo, did not mutate root instructions, did not add model-based synthesis, and did not change package scripts, CI, dependencies, providers, or runtime code.

## Plan of Work

The implementation converted missing docs-spine surfaces from blocked draft states into create/update operations. It then replaced each thin Markdown renderer with output that satisfies the quality rules introduced in the first reset slice.

The test expectations were updated from "quality report fails weak output" to "quality report passes contract-grade output" for the adoption workflow fixture while keeping the apply workflow's weak-output rejection tests intact.

## Milestones

The first milestone was docs index parity. It is complete because generated `docs/index.md` has frontmatter, ownership sections, Codex guidance, First Hop, and Next.

The second milestone was planning contract parity. It is complete because Program and ExecPlan renderers now produce contract-bearing Markdown.

The third milestone was quality report proof. It is complete because the focused adoption workflow test now passes the quality report.

## Concrete Steps

Work was performed from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

The main implementation files were:

    packages/local-runner/src/workflows/docs-spine-adoption/synthesis.ts
    packages/local-runner/tests/docs-spine-adoption-workflow.test.ts

## Validation and Acceptance

Acceptance requires generated docs-spine drafts to pass the deterministic quality evaluator for the focused fixture repo without blocked proposed files and without fake numeric quality scores. The implementation meets that bar.

### Test Commands

    bun run --cwd packages/local-runner test -- docs-spine-adoption-workflow.test.ts docs-spine-apply-and-proof-workflow.test.ts
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner format:check
    bun run --cwd packages/local-runner build
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-05-docs-spine-contract-grade-renderer-synthesis.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/completed/2026-05-05-docs-spine-adoption-quality-reset docs/exec-plans/completed/2026-05-05-docs-spine-contract-grade-renderer-synthesis.md
    git diff --check

## Idempotence and Recovery

The renderer is deterministic for the same scanner facts. Rerunning adoption overwrites local draft artifacts for the same workflow run. If a quality rule fails, repair the renderer or scanner fact rather than bypassing the quality report.

## Artifacts and Notes

The adoption fixture now expects:

    proofStatus: passed
    qualityReport.status: passed
    qualityReport.score: 100

The renderer still records missing surfaces in the docs index and parity checklist; it does not pretend every optional docs lane exists.

## Interfaces and Dependencies

The renderer depends on `DocsSpineRepoFacts`, source-truth scanner artifacts, docs-gap artifacts, and validation-surface artifacts. It does not call providers, install packages, run model APIs, inspect raw source bodies, or mutate repo files directly.
