---
title: Harden Program Review And Repair
status: complete
created_at: 2026-05-13
completed_at: 2026-05-13
summary: Make the autonomous Program runner's review and repair loop stricter about finding classification, severity, repair caps, and intentionally deferred findings.
post_build_recap: Review findings now carry category and disposition fields, severity policy is enforced before repair decisions, only missing-test findings can be intentionally deferred, review prompts include staged and untracked file content, repair prompts include the attempt budget, and review policy summary artifacts are written for each review attempt.
program_id: autonomous-program-execution-loop
planning_brief: docs/programs/active/2026-05-13-autonomous-program-execution-loop/planning-brief-3.md
read_when:
  - Resuming review and repair hardening for the autonomous Program runner.
  - Validating Program runner review output contracts.
  - Checking why a Program run fixed, deferred, or blocked on review findings.
---

# Harden Program Review And Repair

This document is a living execution plan for hardening the autonomous Program runner's review and repair phase.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The autonomous Program runner already executes a child ExecPlan, runs proof, requests a fresh review, fixes must-fix findings, reruns proof, and syncs docs. The next quality gap is that the review result contract is too loose for reliable autonomous decisions. After this plan, a review finding must say what kind of risk it is, whether it must be fixed now or is intentionally deferred, and why any real deferred finding is allowed to remain. A user can see the change working by running the focused `program-run-slice` tests and inspecting generated run artifacts that separate must-fix, deferred, and informational findings.

## Progress

- [x] 2026-05-13: Created this ExecPlan from planning brief 3 and inspected the existing Program runner review, proof, and test surfaces.
- [x] 2026-05-13: Added review finding category and disposition fields, severity-policy enforcement, intentional deferral validation, repair-budget wording, and review policy summary artifacts.
- [x] 2026-05-13: Added focused `program-run-slice` tests for schema requirements, repair prompt scoping, high-severity policy, invalid deferrals, accepted missing-test deferrals, and review prompt coverage for staged plus untracked changes.
- [x] 2026-05-13: Ran final package, Program docs, and repo-level validation before completing the plan.
- [x] 2026-05-13: Closed review findings by making review prompts include staged and untracked file snapshots and by rejecting intentional deferrals for shipped-risk categories.

## Surprises & Discoveries

The current runner already writes a JSON schema file for review output and validates basic finding shape in `packages/local-runner/src/core/program-run-slice.ts`. The hardening can stay narrow by strengthening that schema and parser instead of adding another orchestration layer.

The formatter touched only `packages/local-runner/src/core/program-run-slice.ts` and `packages/local-runner/tests/program-run-slice.test.ts` after implementation. The focused slice tests still pass after formatting.

## Decision Log

Decision: Keep the shipped `program run` and `program run-slice` command boundaries unchanged.
Rationale: Planning brief 3 explicitly scopes this slice to review and repair quality, not Program sequencing.
Date: 2026-05-13.

Decision: Keep `mustFix` in the review finding contract while adding stricter classification fields.
Rationale: Existing callers and docs already expose `mustFix`; adding `category` and `disposition` gives the runner a clearer policy without forcing a broad public type rewrite in this slice.
Date: 2026-05-13.

## Outcomes & Retrospective

This plan is complete. The autonomous Program runner now requires review findings to include a category and disposition, rejects high or critical findings that are not marked must-fix, rejects medium informational findings, rejects intentional deferrals for anything other than missing-test follow-up coverage, and rejects missing-test deferrals that lack both rationale and follow-up. The review prompt now includes the tracked diff against `HEAD` plus bounded snapshots of untracked files so new files are reviewable before completion. The repair prompt names the current attempt and cap, and each review attempt writes `review-policy-summary.json` plus an attempt-specific summary with must-fix, deferred, informational, severity, and category counts. The shipped `program run` and `program run-slice` command boundaries stayed unchanged.

## Context and Orientation

The review and repair loop lives in `packages/local-runner/src/core/program-run-slice.ts`. The command layer in `packages/local-runner/src/commands/program.ts` should not need new flags. The focused tests live in `packages/local-runner/tests/program-run-slice.test.ts`, with Program-level sequencing coverage in `packages/local-runner/tests/program-run-loop.test.ts`.

The existing flow is one function, `runProgramRunSlice`. It hydrates Program and ExecPlan context, runs an executor, extracts proof commands from the ExecPlan, runs proof, writes a review prompt and review schema under `.sbs/program-runs/<program-id>/<run-id>/`, parses review JSON, fixes findings where `mustFix` is true, reruns proof and review until no must-fix findings remain or the repair cap is exhausted, then syncs a short completion note into the ExecPlan and Program docs.

### In Scope

This plan covers the review output schema, review prompt instructions, parser validation, must-fix selection, fix prompt repair-budget wording, generated review summary artifacts, docs sync counts, and focused tests for malformed review output, severity policy, repair caps, and intentionally deferred findings.

### Out Of Scope

Do not add automatic child-plan generation, PR creation, deployment, provider setup, hook ownership, separate-repo extraction, or a new Program loop. Do not replace the existing executor boundary or add a dependency on Worker runtime internals.

## Plan of Work

First, update `packages/local-runner/src/core/program-run-slice.ts` so `ProgramRunSliceReviewFinding` includes a risk category and review disposition in addition to the existing title, severity, impact, minimal fix, and `mustFix` boolean. The parser should reject findings that omit the new classification fields, use invalid enum values, mark critical or high severity findings as anything other than must-fix, mark medium severity findings as informational, claim a shipped-risk category deferral, or claim a missing-test deferral without a non-empty rationale and follow-up.

Second, update the review prompt and generated JSON schema in `program-run-slice.ts` so fresh reviewers know the exact policy. The prompt should say that critical and high findings must be fixed in the current slice, medium bug, regression, security, and incorrect-assumption findings must be fixed now, only missing-test findings can be intentionally deferred with a reason and follow-up, and low or info findings can be informational only when they do not represent a shipped risk. The fix prompt should name the current attempt and repair cap, and should tell the fixer to touch only must-fix findings. The review prompt should also include enough git context for a fresh reviewer to inspect newly created work, including staged changes and bounded untracked file snapshots.

Third, write a compact review policy summary artifact beside each review result. This artifact should count total findings, must-fix findings, intentionally deferred findings, informational findings, severity counts, and category counts. The final docs sync summary should include the same must-fix and deferred counts so a later reader can tell whether the runner completed because the review was clean or because remaining findings were intentionally deferred.

Fourth, update `packages/local-runner/tests/program-run-slice.test.ts` so existing fake review findings use the new contract and new regression tests cover rejected high-severity deferrals, rejected shipped-risk deferrals, rejected deferrals without rationale, accepted missing-test deferrals, repair-cap blocking, staged plus untracked review prompt context, and schema artifact contents. Keep `packages/local-runner/tests/program-run-loop.test.ts` passing without changing the Program loop contract.

## Milestones

Milestone 1 strengthens the review contract. Success means malformed or under-classified review output fails before the runner can treat it as passing, and the schema file written into `.sbs/program-runs/.../review-output-schema.json` requires the new fields.

Milestone 2 strengthens repair decisions. Success means only findings with a must-fix disposition enter the repair loop, the fix prompt includes the attempt budget, and the runner blocks with a clear message once that budget is exhausted.

Milestone 3 records review policy evidence. Success means the runner writes a policy summary artifact for each review attempt and syncs final docs with counts for total, must-fix, and intentionally deferred findings.

## Concrete Steps

Work from `/Users/bazelrex/Developer/ship-by-sunday`.

Inspect the existing review and repair code:

    rg -n "ProgramRunSliceReviewFinding|parseReviewResult|buildReviewOutputSchema|getMustFixFindings|buildFixPrompt|buildReviewPrompt" packages/local-runner/src/core/program-run-slice.ts

After editing `program-run-slice.ts` and its tests, run the focused test first:

    bun test packages/local-runner/tests/program-run-slice.test.ts

Then run the Program loop regression and package checks:

    bun test packages/local-runner/tests/program-run-loop.test.ts
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner format:check

Validate docs and the broader gates before completing the plan:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-harden-program-review-and-repair.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/active/2026-05-13-autonomous-program-execution-loop docs/exec-plans/completed/2026-05-13-harden-program-review-and-repair.md
    bun run format
    bun run lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run typecheck
    git diff --check

## Validation and Acceptance

Feature: stricter autonomous Program runner review and repair behavior.

Risk: P1 core product setup and automation path. The runner mutates repositories and decides whether reviewed work is safe to continue, so review classification errors can create real shipped regressions.

Source of truth: parsed review JSON, generated review schema, review policy summary artifacts under `.sbs/program-runs/`, runner error messages, synced ExecPlan and Program notes, and focused test outcomes.

Must work: clean reviews complete without repair, must-fix findings trigger repair and reproof, missing-test findings can be intentionally deferred only when they include rationale and follow-up, review prompts include tracked changes and untracked file snapshots, and repair caps block remaining must-fix findings with a clear error.

Must fail safely: missing classification fields, invalid severity, invalid disposition, critical or high findings not marked must-fix, medium informational findings, shipped-risk category deferrals, and missing-test deferrals without rationale or follow-up must fail before docs sync claims completion.

Tests: focused `program-run-slice` tests for schema parsing and repair behavior, `program-run-loop` regression tests for sequencing, local-runner typecheck, lint, and format checks, Program and ExecPlan docs lint, and repo-level format, lint, and typecheck gates.

CI gate: local-runner package tests and repo-level static/typecheck gates.

### Test Commands

Run these commands before completing this plan:

    bun test packages/local-runner/tests/program-run-slice.test.ts
    bun test packages/local-runner/tests/program-run-loop.test.ts
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner format:check
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-harden-program-review-and-repair.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/active/2026-05-13-autonomous-program-execution-loop docs/exec-plans/completed/2026-05-13-harden-program-review-and-repair.md
    bun run format
    bun run lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run typecheck
    git diff --check

## Idempotence and Recovery

The tests create temporary repositories and can be rerun safely. The runner writes `.sbs/program-runs/` artifacts inside fixtures and keeps `.sbs/` ignored there. If a parser change breaks existing tests, update the fake review fixtures to the new public review contract rather than weakening validation. Do not use `git reset --hard` or checkout commands to recover because this working tree contains unrelated changes.

## Artifacts and Notes

Expected focused success looks like:

    bun test packages/local-runner/tests/program-run-slice.test.ts
    17 pass
    0 fail

Final evidence captured on 2026-05-13:

    bun test packages/local-runner/tests/program-run-slice.test.ts
    17 pass, 0 fail

    bun test packages/local-runner/tests/program-run-loop.test.ts
    6 pass, 0 fail

    bun run --cwd packages/local-runner typecheck
    passed

    bun run --cwd packages/local-runner lint
    passed

    bun run --cwd packages/local-runner format:check
    passed

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-harden-program-review-and-repair.md
    passed

    bun run programs:lint
    passed

    bun run markdown:lint -- --paths docs/programs/active/2026-05-13-autonomous-program-execution-loop docs/exec-plans/completed/2026-05-13-harden-program-review-and-repair.md
    passed

    bun run format
    passed

    bun run lint
    passed

    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run typecheck
    passed

    bun run test:package-smoke
    passed

    git diff --check
    passed

The final implementation should write review artifacts shaped like:

    .sbs/program-runs/<program-id>/<run-id>/review-result-1.json
    .sbs/program-runs/<program-id>/<run-id>/review-policy-summary-1.json
    .sbs/program-runs/<program-id>/<run-id>/review-output-schema.json

## Interfaces and Dependencies

The public command interfaces stay unchanged:

    bun run program:run-slice -- --program-id <id> --plan <path>
    bun run program:run -- --program-id <id>
    ship-by-sunday program run-slice --program-id <id> --plan <path>
    ship-by-sunday program run --program-id <id>

`ProgramRunSliceReviewFinding` remains the core in-process review finding type in `packages/local-runner/src/core/program-run-slice.ts`. It should keep `mustFix` for compatibility, add explicit classification fields, and be validated at the parser boundary before the runner decides whether to repair, defer, or complete.
