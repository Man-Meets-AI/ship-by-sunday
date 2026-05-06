---
title: Docs Spine Eval And Lint Harness
status: complete
created_at: 2026-05-05
completed_at: 2026-05-05
summary: Build the docs-spine quality gate that fails weak Arena-style output before scanner and renderer repair continue.
post_build_recap: Added a docs-spine quality report, draft and apply eval rules, blocked-draft apply rejection, adoption/apply proof integration, and focused tests proving weak Arena-style output fails.
program_id: docs-spine-adoption-quality-reset
planning_brief: docs/programs/completed/2026-05-05-docs-spine-adoption-quality-reset/planning-brief-1.md
read_when:
  - Reviewing the first docs-spine quality reset implementation.
  - Updating docs-spine eval rule ids, quality reports, or apply gating.
  - Debugging why docs-spine adoption or apply proof now fails weak generated docs.
---

# Docs Spine Eval And Lint Harness

This is a completed execution plan for the first Docs Spine Adoption Quality Reset slice.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The v1 docs-spine adoption loop could write Markdown, but it could not tell that the Markdown was bad. This slice adds the missing quality gate. After this change, the local runner writes a machine-readable docs-spine quality report, adoption proof fails when deterministic drafts are weak, and apply refuses blocked or structurally thin drafts before writing them into a customer repo.

The user-visible result is that a runner install can no longer call a placeholder docs spine "passed" merely because files exist. The current weak Arena-style shape now fails with stable rule ids and remediation text.

## Progress

- [x] 2026-05-05: Created the active Docs Spine Adoption Quality Reset Program and planning brief.
- [x] 2026-05-05: Added `packages/local-runner/src/workflows/docs-spine-adoption/quality-eval.ts` with deterministic quality reports and stable rule ids.
- [x] 2026-05-05: Wired adoption proof to write `.sbs/docs-spine-adoption/facts/quality-report.json` and fail proof when the report fails.
- [x] 2026-05-05: Wired apply proof to write `.sbs/docs-spine-adoption/apply/quality-report.json` and block weak or blocked drafts before applying Markdown.
- [x] 2026-05-05: Added focused tests for failed Arena-style output, blocked proposed files, passing docs-index shape, and adoption proof quality report refs.
- [x] 2026-05-05: Ran focused local-runner checks and planning/doc lint.

## Surprises & Discoveries

The most important failure was already present in the v1 draft model: blocked draft artifacts still carried `proposedFiles`. That meant apply could treat blocked synthesis as apply-ready Markdown. The new `draft.blocked-proposed-files` rule makes that impossible to miss.

The apply workflow needed quality validation before writes, not only after writes. The old structural check caught missing headings after applying. This slice moves weak docs into the draft-validation block path so the repo is not mutated before the quality gate fails.

## Decision Log

Decision: Make adoption proof fail, not pass, when generated drafts fail the docs-spine quality report.
Rationale: A scan-and-draft workflow that emits weak or blocked apply candidates should not produce a green proof status.
Date: 2026-05-05

Decision: Keep the first quality gate deterministic.
Rationale: The reset needs a stable guardrail before scanner repair or Codex synthesis. Model critique can come later, but the first failure mode must be caught by scripts.
Date: 2026-05-05

Decision: Put apply quality reports under `.sbs/docs-spine-adoption/apply/`.
Rationale: Apply proof owns the final write decision and needs its own report tied to the exact drafts it attempted to apply.
Date: 2026-05-05

## Outcomes & Retrospective

Complete. The local runner now has a docs-spine quality report with stable rule ids, status, score, source artifact refs, failed paths, messages, and remediation. Adoption proof includes the report and fails when drafts are blocked or too thin. Apply proof writes its own quality report and blocks before writing when drafts are blocked, missing required docs-index sections, missing quality-score structure, or otherwise below the deterministic contract.

The first gate intentionally fails the current deterministic v1 drafts. That is the correct result until the scanner and renderer are repaired in later slices.

## Context and Orientation

The docs-spine adoption workflow lives in `packages/local-runner/src/core/docs-spine-adoption-workflow.ts`. It scans a repo, writes facts and drafts under `.sbs/docs-spine-adoption/**`, and records proof under `.sbs/runs/<workflow-run-id>/**`.

The docs-spine apply workflow lives in `packages/local-runner/src/core/docs-spine-apply-and-proof-workflow.ts`. It reads draft JSON from `.sbs/docs-spine-adoption/drafts/**`, writes approved docs Markdown, and records apply proof.

The quality rules live in `packages/local-runner/src/workflows/docs-spine-adoption/quality-eval.ts`. They currently check blocked draft consistency, common Markdown validity, docs-index contract sections, quality-score contract shape, Program and ExecPlan contract shape, prompt inventory, validation/proof native-gate routing, hidden-noise references, and native gate routing.

### In Scope

This slice added deterministic evals and proof wiring. It changed the local-runner adoption and apply workflows, docs-spine artifact refs, apply-ready file metadata, and focused tests.

### Out Of Scope

This slice did not repair scanner ranking, did not rewrite the thin renderer output, did not rerun the Arena CRM pilot, did not mutate Arena CRM, did not add model-based critique, and did not change root instructions, package scripts, CI, dependencies, or provider setup.

## Plan of Work

The implementation first added a workflow-local quality evaluator that can evaluate draft JSON artifacts and apply-ready Markdown files. It then wired the adoption workflow to evaluate synthesis artifacts before proof, write a quality report artifact, and fail proof when the quality report fails.

Next, the apply workflow was changed so extracted apply-ready files remember the source draft status and blocked reasons. Apply validation now blocks proposed files from blocked drafts and runs the quality report before writing docs. The apply proof and sync preview record the quality report ref and score.

Finally, the focused tests were updated so passing apply fixtures use a real docs-index contract and weak Arena-style docs fail deterministically.

## Milestones

The first milestone was rule definition. It is complete because `quality-eval.ts` returns a machine-readable report with stable rule ids and remediation.

The second milestone was proof integration. It is complete because adoption and apply workflows now write quality report artifacts and change proof behavior based on the report.

The third milestone was regression coverage. It is complete because focused tests prove the weak Arena-style shape fails and blocked drafts cannot apply.

## Concrete Steps

Work was performed from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

The main implementation files were:

    packages/local-runner/src/workflows/docs-spine-adoption/quality-eval.ts
    packages/local-runner/src/workflows/docs-spine-adoption/manifest.ts
    packages/local-runner/src/core/docs-spine-adoption-workflow.ts
    packages/local-runner/src/core/docs-spine-apply-and-proof-workflow.ts
    packages/local-runner/src/workflows/docs-spine-apply-and-proof/schemas.ts

Focused regression tests were updated in:

    packages/local-runner/tests/docs-spine-adoption-workflow.test.ts
    packages/local-runner/tests/docs-spine-apply-and-proof-workflow.test.ts

## Validation and Acceptance

Acceptance requires the current weak docs-spine shape to fail, blocked drafts to be impossible to apply, and a complete docs-index fixture to pass the apply quality gate. The proof artifacts must include quality report refs so later runner UI or sync surfaces can show why a docs-spine pass failed.

The implementation meets that bar. The focused test suite now has 17 passing tests across adoption and apply. The quality report catches `draft.blocked-proposed-files`, `docs-index.*`, `quality-score.*`, `content.hidden-noise-primary-route`, and related contract failures.

### Test Commands

    bun run --cwd packages/local-runner test -- docs-spine-adoption-workflow.test.ts docs-spine-apply-and-proof-workflow.test.ts
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner format:check
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-05-docs-spine-eval-and-lint-harness.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/completed/2026-05-05-docs-spine-adoption-quality-reset docs/programs/README.md docs/programs/active/index.md docs/programs/completed/index.md docs/exec-plans/completed/2026-05-05-docs-spine-eval-and-lint-harness.md
    git diff --check

## Idempotence and Recovery

The quality report is deterministic for the same draft artifacts and timestamp. Rerunning adoption overwrites that workflow run's local `.sbs` artifacts. Rerunning apply blocks before docs writes when drafts are weak, so a failed quality report should leave target docs untouched except for existing approved writes from earlier attempts.

If the new gate blocks a repo, inspect the quality report path in proof, repair the scanner or renderer in a later slice, and rerun the workflow. Do not bypass the failed rule by deleting the report.

## Artifacts and Notes

New quality report refs:

    .sbs/docs-spine-adoption/facts/quality-report.json
    .sbs/docs-spine-adoption/apply/quality-report.json

Important rule ids added in this slice:

    draft.blocked-proposed-files
    docs-index.frontmatter
    docs-index.owns
    docs-index.does-not-own
    docs-index.codex-guidance
    docs-index.first-hop
    docs-index.next
    quality-score.scorecard-contract
    quality-score.placeholder-only
    content.hidden-noise-primary-route
    source-truth.native-gate-routed

## Interfaces and Dependencies

The evaluator depends only on structured draft artifacts, apply-ready file metadata, optional docs-spine repo facts, and Markdown strings. It does not call providers, install packages, run model APIs, mutate Git branches, or read raw source.

The adoption workflow depends on `buildDocsSpineDraftQualityReport()`. The apply workflow depends on `buildDocsSpineApplyQualityReport()` and `summarizeFailedQualityRules()`. The apply-ready file schema now carries `draftStatus` and `draftBlockedReasons` so blocked draft state survives extraction.
