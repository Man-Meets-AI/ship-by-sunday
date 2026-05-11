---
title: Docs Operating System Quality Refresh
status: complete
created_at: 2026-05-06
completed_at: 2026-05-06
summary: Make the shared docs-refresh-quality command update QUALITY_SCORE.md with validation evidence instead of exiting as a placeholder.
post_build_recap: The docs-refresh-quality command now creates or updates docs/QUALITY_SCORE.md, preserves owner content outside a managed block, records docs-validate status, and returns that validation status without inventing a numeric score.
program_id: worker-grade-docs-operating-system-adoption
planning_brief: docs/programs/completed/2026-05-06-worker-grade-docs-operating-system-adoption/planning-brief-3.md
read_when:
  - Resuming evidence-bound quality refresh implementation.
  - Changing docs operating-system quality score behavior.
  - Validating the quality refresh slice before Program closure.
---

# Docs Operating System Quality Refresh

This document is a living execution plan for the evidence-bound quality refresh slice of the Worker-grade docs operating-system Program.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The generated docs operating-system package scripts already include `docs:refresh-quality`, but the shared command still exits with a placeholder message. A customer repo should be able to run that script and get a durable `docs/QUALITY_SCORE.md` evidence refresh that says what validation ran, whether it passed, and what remains blocked without inventing a score.

After this slice, `ship-by-sunday docs-operating-system docs-refresh-quality --repo <target>` creates or updates only the target repo's quality-score document. It preserves owner-authored text, refreshes one runner-managed evidence block, and returns the docs validation status so the command remains useful as both a mutation and a quality signal.

## Progress

- [x] 2026-05-06 EDT: Implemented the quality refresh command and focused tests.
- [x] 2026-05-06 EDT: Updated workflow-packet and Program docs after focused validation.
- [x] 2026-05-06 EDT: Build, focused local-runner tests, package smoke, lint, typecheck, format check, plan lint, Program lint, and targeted markdown lint passed for this slice.

## Surprises & Discoveries

The existing `runDocsValidate(repoRootDir)` helper already had the right evidence boundary for this command. Reusing it kept the refresh behavior tied to the same Markdown, Program, and active ExecPlan checks that `docs:validate` runs.

The command needs to return the validation status even after writing the evidence file. That lets `docs:refresh-quality` both update durable evidence and fail honestly when a target repo still lacks Program docs, prompt contracts, or another required docs operating-system surface.

## Decision Log

Decision: Keep quality refresh evidence-bound and non-numeric.
Rationale: Existing docs-spine quality rules reject invented numeric scores before a real audit records evidence refs, reviewer, date, and score rationale. This slice can refresh evidence without pretending to be a scoring engine.
Date: 2026-05-06

Decision: Preserve existing `docs/QUALITY_SCORE.md` content outside a managed block.
Rationale: Customer repos may already own quality guidance. The runner should add or replace its own evidence section instead of overwriting owner-authored content.
Date: 2026-05-06

## Outcomes & Retrospective

This plan is complete. `ship-by-sunday docs-operating-system docs-refresh-quality --repo <target>` now creates `docs/QUALITY_SCORE.md` when missing, preserves owner-authored content when the file already exists, replaces only the `sbs-docs-quality-refresh` managed block on repeated runs, records `ship-by-sunday docs-operating-system docs-validate` status, and keeps the current score `not scored`.

The command does not assign a numeric score, publish or install packages, mutate lockfiles, wire native commands, edit root instructions, configure CI/providers, or touch runtime state. The owning Program now records native command integration as the last remaining non-runtime slice.

## Context and Orientation

The owning Program is `docs/programs/completed/2026-05-06-worker-grade-docs-operating-system-adoption/program.md`. Package-script patching installs a `docs:refresh-quality` script that delegates to `ship-by-sunday docs-operating-system docs-refresh-quality`. The implementation of that command lives in `packages/local-runner/src/commands/docs-operating-system.ts`, beside existing bundled validators for Markdown docs, Program packets, and active ExecPlans.

`docs/QUALITY_SCORE.md` is the durable quality-score landing page in a target repo. This slice treats it as a bounded docs target. A managed evidence block is a Markdown section delimited by HTML comments so repeated runs replace the runner-owned block while leaving surrounding owner text intact.

### In Scope

Implement `docs-refresh-quality [--repo <path>]` so it creates or updates `docs/QUALITY_SCORE.md`, records the status of `docs-validate`, includes only repo-relative evidence refs and concise summaries, preserves existing owner content outside the managed block, and exits with the validation status.

Update focused tests in `packages/local-runner/tests/docs-operating-system-command.test.ts`, then update `docs/internal/workflow-packets.md`, this Program, the active Program index if needed, and this ExecPlan.

### Out Of Scope

Do not assign a numeric score, build a quality scoring engine, publish a package, add package registry setup, change lockfiles, run package-manager installs, wire native app-stack commands, edit root instructions, configure CI/providers, touch runtime state, push branches, open pull requests, or modify unrelated Telegram/support/homepage worktree changes.

## Plan of Work

First update `packages/local-runner/src/commands/docs-operating-system.ts`. Replace the placeholder branch for `docs-refresh-quality` with a helper that ensures `docs/QUALITY_SCORE.md` exists, runs the existing `runDocsValidate(repoRootDir)` helper, writes or replaces one managed evidence block, and prints a short result. The helper should keep output and file content free of local absolute paths by naming command refs and repo-relative paths only.

Then update `packages/local-runner/tests/docs-operating-system-command.test.ts`. Replace the blocked-stub test with tests that prove the command writes the quality file, records failing validation evidence when the target repo is incomplete, preserves owner content on repeated runs, and does not include the temporary repository's absolute path in the refreshed document.

Finally update the Program and workflow-packet docs to mark quality refresh as shipped and native command integration as the remaining Program outcome. Move this ExecPlan to completed only after the test commands pass.

## Milestones

Milestone one is the command mutation. At the end, running `docs-refresh-quality` against an empty or incomplete temporary repo creates `docs/QUALITY_SCORE.md`, records blocked validation evidence, and exits non-zero because validation failed.

Milestone two is idempotent owner preservation. At the end, repeated runs replace the managed block without duplicating it and leave owner-authored content outside the block unchanged.

Milestone three is Program documentation. At the end, durable docs describe the shipped quality refresh boundary and the remaining native-command slice truthfully.

## Concrete Steps

Work from `/Users/bazelrex/Developer/ship-by-sunday`.

Inspect the command and tests:

    sed -n '1,520p' packages/local-runner/src/commands/docs-operating-system.ts
    sed -n '1,360p' packages/local-runner/tests/docs-operating-system-command.test.ts

Patch the command implementation and focused tests:

    packages/local-runner/src/commands/docs-operating-system.ts
    packages/local-runner/tests/docs-operating-system-command.test.ts

Then update durable Program docs:

    docs/internal/workflow-packets.md
    docs/programs/completed/2026-05-06-worker-grade-docs-operating-system-adoption/program.md
    docs/programs/completed/2026-05-06-worker-grade-docs-operating-system-adoption/planning-brief-3.md
    docs/exec-plans/completed/2026-05-06-docs-operating-system-quality-refresh.md

## Validation and Acceptance

Acceptance requires the focused command tests to prove mutation, idempotence, owner preservation, and privacy. The refreshed quality file must include `## Current Score` with `not scored`, a `## QUALITY_SCORE.review` route or managed review block, the exact validation command name, pass or fail status, repo-relative evidence refs, and concise summaries. It must not include local absolute paths or raw logs.

The command may exit non-zero when `docs-validate` fails, but it must still write the refreshed evidence file before returning. That behavior lets package scripts both update quality evidence and fail honestly when the repo still lacks required docs operating-system surfaces.

### Test Commands

- bun run --cwd packages/local-runner test -- docs-operating-system-command.test.ts docs-operating-system-package-script-patching.test.ts docs-operating-system-lockfile-refresh.test.ts
- bun run --cwd packages/local-runner package:smoke
- bun run --cwd packages/local-runner lint
- bun run --cwd packages/local-runner typecheck
- bun run --cwd packages/local-runner format:check
- bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-06-docs-operating-system-quality-refresh.md
- bun run programs:lint
- bun run markdown:lint -- --paths docs/programs/completed/2026-05-06-worker-grade-docs-operating-system-adoption docs/exec-plans/completed/2026-05-06-docs-operating-system-quality-refresh.md docs/internal/workflow-packets.md
- git diff --check

## Idempotence and Recovery

The command is safe to rerun because it replaces only the marked quality-refresh block. If a run fails validation, fix the reported docs issue and rerun the same command; the evidence block should update in place.

If a write fails partway through, rerun after fixing filesystem permissions or path issues. The command does not mutate package manifests, lockfiles, source files, provider setup, runtime state, or Git refs, so rollback is limited to restoring or editing `docs/QUALITY_SCORE.md`.

## Artifacts and Notes

Expected failing-repo evidence should look like this in `docs/QUALITY_SCORE.md`:

    Current score: `not scored`
    - `ship-by-sunday docs-operating-system docs-validate`: failed
      Evidence refs: `docs/`, `docs/programs/`, `docs/exec-plans/active/`

Expected repeated-run behavior is one managed block:

    <!-- sbs-docs-quality-refresh:start -->
    ...
    <!-- sbs-docs-quality-refresh:end -->

Validation evidence from implementation:

    bun run --cwd packages/local-runner test -- docs-operating-system-command.test.ts docs-operating-system-package-script-patching.test.ts docs-operating-system-lockfile-refresh.test.ts
    Test Files  3 passed (3)
    Tests  26 passed (26)

    bun run --cwd packages/local-runner build
    Bundled 134 modules

    bun run --cwd packages/local-runner package:smoke
    package smoke passed

    bun run --cwd packages/local-runner lint
    Found 0 warnings and 0 errors.

    bun run --cwd packages/local-runner typecheck
    tsc --noEmit -p tsconfig.json

    bun run --cwd packages/local-runner format:check
    All matched files use the correct format.

## Interfaces and Dependencies

This slice depends on the existing `runDocsValidate(repoRootDir)` helper in `packages/local-runner/src/commands/docs-operating-system.ts`, the Markdown metadata linter under `scripts/markdown-metadata/`, Program lint helpers under `scripts/programs/`, ExecPlan lint helpers under `scripts/exec-plan/`, and Node filesystem APIs for bounded writes.
