---
title: Build Program Run Slice V1
status: complete
created_at: 2026-05-13
completed_at: 2026-05-13
summary: Build the first command-driven Program slice runner that executes one ExecPlan through proof, fresh review, fixes, reproof, docs sync, and checkpoint state.
post_build_recap: Added a command-driven `program:run-slice` runner in the local-runner package, with fakeable Codex/review/proof boundaries, review prompt artifacts, bounded fix attempts, docs sync, and regression coverage.
program_id: autonomous-program-execution-loop
planning_brief: docs/programs/active/2026-05-13-autonomous-program-execution-loop/planning-brief-1.md
read_when:
  - "Starting the first autonomous Program runner implementation."
  - "Checking how one ExecPlan should run through review, fix, proof, and docs sync before the next slice starts."
  - "Validating the runner's safety and state model."
---

# Build Program Run Slice V1

This document is a living execution plan for the first autonomous Program runner slice.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Parker currently spends repeated manual attention on the same loop after each ExecPlan: ask the implementation thread for a review prompt, paste that prompt into a fresh high-reasoning review context, bring the findings back, ask for fixes, rerun proof, and decide whether to continue or hand off. This plan builds the first command-driven version of that loop for one child ExecPlan.

After this plan, a maintainer should be able to run one command against an approved Program child ExecPlan and get the same basic lifecycle: execute, prove, review in fresh context, fix real findings, reprove, update docs, and store local run artifacts. This plan intentionally stops before full multi-ExecPlan Program looping.

## Progress

- [x] 2026-05-13: Created the ExecPlan from `docs/programs/active/2026-05-13-autonomous-program-execution-loop/planning-brief-1.md`.
- [x] 2026-05-13: Inspected the local runner Codex execution code, docs operating-system command, Worker ExecPlan workflow reference, and official Codex CLI `exec` documentation.
- [x] 2026-05-13: Chose the narrow command boundary: `bun run program:run-slice -- --program-id <id> --plan <path>` and `ship-by-sunday program run-slice`.
- [x] 2026-05-13: Implemented one-slice runner phases with injectable Codex/review/proof boundaries in `packages/local-runner/src/core/program-run-slice.ts`.
- [x] 2026-05-13: Added fixture-driven tests for happy path, must-fix review repair, proof failure, capped unresolved review findings, dirty worktree safety, and Test Commands extraction.
- [x] 2026-05-13: Updated package/root scripts and CLI help for the new command.
- [x] 2026-05-13: Ran focused and package-level validation and recorded proof.

## Surprises & Discoveries

Official Codex CLI docs confirm `codex exec` is the correct headless primitive for scripted or CI-style runs that should finish without human interaction. The implementation keeps that behind an injectable boundary so tests can run without live model calls.

The first Test Commands extractor had to preserve indentation inside Markdown subsections. A direct `.trim()` on the subsection removed indentation from the first indented command and made it invisible to the parser. The runner now trims blank leading lines without stripping command indentation.

## Decision Log

Decision: Start with one ExecPlan slice rather than full Program looping.
Rationale: The one-slice loop is the smallest useful primitive and gives later full Program looping a stable building block.
Date: 2026-05-13.

Decision: Keep hooks out of the v1 state machine.
Rationale: The first runner must be explicit, testable, and resumable. Hooks can be added later for lifecycle notifications or convenience triggers.
Date: 2026-05-13.

Decision: Treat Worker as a reference, not a dependency.
Rationale: The Worker repo has useful headless execution and proof patterns, but this repo needs a generic runner that works for Ship by Sunday and future generated or installed repos.
Date: 2026-05-13.

Decision: Require `--program-id` and `--plan` in v1 instead of auto-discovering the next child plan.
Rationale: Explicit inputs make the first runner deterministic and avoid hidden selection rules. Full Program looping and next-plan discovery belong to a later slice.
Date: 2026-05-13.

Decision: Fail closed on a dirty worktree at run start.
Rationale: The runner should not mix unrelated user edits into an autonomous execution. Dirty-scope ownership can be designed later, but v1 should require a clean starting point.
Date: 2026-05-13.

## Outcomes & Retrospective

This plan shipped the first command-driven Program slice runner. The root command is:

    bun run program:run-slice -- --program-id <id> --plan <repo-relative-execplan-path>

The package CLI command is:

    bun run --cwd packages/local-runner program:run-slice -- --program-id <id> --plan <repo-relative-execplan-path>

The packaged binary path is:

    ship-by-sunday program run-slice --program-id <id> --plan <repo-relative-execplan-path>

The runner resolves the Program's current planning brief, hydrates context from Program docs and the child ExecPlan, refuses dirty worktrees at start, executes through Codex, extracts and runs the ExecPlan `### Test Commands`, writes a review prompt under `.sbs/program-runs/`, runs a structured fresh review, fixes must-fix findings up to a bounded attempt count, reruns proof, writes proof/review artifacts, and appends concise evidence to the Program and ExecPlan docs.

The implementation is intentionally one-slice only. Full multi-ExecPlan Program looping, auto-discovery of next plans, hook integration, PR creation, and portable installer updates remain later slices in the owning Program.

## Context and Orientation

This work spans Program docs, ExecPlan docs, local runner command code, Codex execution wrappers, and proof/review artifacts.

The Program packet that owns this plan lives at `docs/programs/active/2026-05-13-autonomous-program-execution-loop/`. The planning brief for this slice is `docs/programs/active/2026-05-13-autonomous-program-execution-loop/planning-brief-1.md`.

Ship by Sunday's current Program and ExecPlan contracts live in `docs/programs/PROGRAMS.md` and `docs/exec-plans/PLANS.md`. Prompt assets live in `docs/prompts/`. The local runner's current Codex wrapper lives in `packages/local-runner/src/core/codex-exec-runner.ts`. The docs operating system command surface lives in `packages/local-runner/src/commands/docs-operating-system.ts`.

Before implementing, inspect the sibling Worker repo at `/Users/bazelrex/Developer/worker`, especially `apps/runtime/src/workflows/execplan-feature-workflow/` and `apps/runtime/src/workflows/program-loop/`. Use those files as references for runner shape, proof command extraction, repair loops, and receipts. Do not import Worker runtime code directly.

### In Scope

This plan should add a command-driven one-slice Program runner. It should resolve a Program and child ExecPlan, hydrate context, run implementation through headless Codex, run proof commands, generate a review prompt from live state, run a fresh review pass, classify must-fix findings, run a bounded fix pass, rerun proof, update docs with concise evidence, and write ignored local run artifacts.

This plan should add tests that fake the Codex runner and prove the state machine without live model calls.

This plan should update scripts and docs so maintainers know how to run the slice runner and what artifacts it writes.

### Out Of Scope

This plan should not build full Program looping across every child ExecPlan. It should not automate ideation, design moodboards, browser polish, taxonomy review, feature-usage instrumentation, PR creation, merging, provider setup, deployment, or separate-repo extraction.

This plan should not make hooks own the runner. It should not sync raw Codex transcripts, raw source, long logs, secrets, provider payloads, or absolute paths into durable docs.

This plan should not depend on Worker as a runtime package.

## Plan of Work

First, inspect the local runner and Worker reference code. Read `packages/local-runner/src/core/codex-exec-runner.ts`, `packages/local-runner/src/commands/docs-operating-system.ts`, `packages/local-runner/src/workflows/docs-operating-system-adoption/`, and the Worker `execplan-feature-workflow` files. Record any material findings in `Surprises & Discoveries`.

Second, choose the smallest command surface. Prefer adding a root script named `program:run-slice` backed by code that can later be exposed through `shipbysunday program run-slice`. The runner should have explicit phases such as `hydrate_context`, `execute`, `proof`, `write_review_prompt`, `review`, `fix_findings`, `reproof`, `sync_docs`, `checkpoint`, and `complete_or_blocked`.

Third, implement the runner with injectable boundaries. The Codex execution boundary, review execution boundary, proof command boundary, git state boundary, and docs writeback boundary must be replaceable in tests. Do not require live OpenAI or Codex calls in automated tests.

Fourth, implement review prompt generation. The generated prompt should include the Program path, child ExecPlan path, planning brief path, changed files, git diff summary, proof command results, risk notes, and the repo's review instruction pattern. The prompt should be stored under an ignored run artifact directory.

Fifth, implement structured review classification. The review output should distinguish must-fix findings, open questions, validation notes, and non-blocking notes. The fix phase should only run when must-fix findings exist and should cap attempts.

Sixth, implement docs sync. The runner should append concise evidence to the child ExecPlan and Program progress or artifacts sections. Keep durable docs concise and avoid dumping raw logs.

Seventh, add fixture-driven tests. Use temporary directories or fixtures to create a fake Program, fake ExecPlan, fake proof commands, fake review findings, and fake Codex responses. Prove happy path, proof failure, capped review-fix failure, and dirty worktree safety.

Eighth, update docs and scripts. Document the command, required state, artifact paths, safety boundaries, and the fact that full Program looping is later.

## Milestones

Milestone 1 is runner boundary discovery. At the end of this milestone, the plan should name the files to edit, the command shape, the state directory, and which Worker patterns are being adapted.

Milestone 2 is a non-mutating runner skeleton. At the end of this milestone, the command should resolve a Program and ExecPlan, create a run directory, write initial state, and stop before invoking Codex.

Milestone 3 is executable phase orchestration with fakeable dependencies. At the end of this milestone, tests should prove the happy path without live Codex calls.

Milestone 4 is review and fix behavior. At the end of this milestone, tests should prove review prompt generation, must-fix classification, bounded fix attempts, and reproof.

Milestone 5 is docs sync and final validation. At the end of this milestone, the Program and ExecPlan docs should record concise evidence, and all focused validation commands should pass.

## Concrete Steps

Start by reading the owning docs and code:

    cd /Users/bazelrex/Developer/ship-by-sunday
    sed -n '1,260p' docs/programs/PROGRAMS.md
    sed -n '1,260p' docs/exec-plans/PLANS.md
    sed -n '1,260p' packages/local-runner/src/core/codex-exec-runner.ts
    sed -n '1,260p' packages/local-runner/src/commands/docs-operating-system.ts

Inspect Worker reference files without editing them:

    cd /Users/bazelrex/Developer/worker
    find apps/runtime/src/workflows/execplan-feature-workflow -maxdepth 2 -type f | sort
    find apps/runtime/src/workflows/program-loop -maxdepth 2 -type f | sort

Return to Ship by Sunday before editing:

    cd /Users/bazelrex/Developer/ship-by-sunday

The implementation added `packages/local-runner/src/core/program-run-slice.ts` as the runner state machine and `packages/local-runner/src/commands/program.ts` as the CLI wrapper. `packages/local-runner/src/cli.ts`, root `package.json`, and `packages/local-runner/package.json` expose the command.

The regression tests live in `packages/local-runner/tests/program-run-slice.test.ts`. They keep fake Codex and review fixtures local to tests and assert state transitions, artifacts, docs updates, proof behavior, and blocked failure modes.

This ExecPlan was updated with the final command shape and proof output before completion.

## Validation and Acceptance

Acceptance is behavioral. A maintainer can run one command for one active Program child ExecPlan and observe a run artifact directory, review prompt, review result, proof summary, docs update, and final state of complete or blocked. Tests prove the same behavior without live Codex.

The runner must fail safely when the target Program or ExecPlan cannot be resolved, when proof fails before review, when review produces unresolved must-fix findings after capped attempts, or when the worktree contains unrelated dirty state that the runner cannot safely own.

The runner must not dump raw logs, secrets, raw source, long transcripts, provider payloads, or absolute paths into Program or ExecPlan docs.

### Test Commands

Run focused local runner tests for this new workflow:

    cd /Users/bazelrex/Developer/ship-by-sunday
    bun test packages/local-runner/tests/program-run-slice.test.ts

Run docs validation for this Program and child ExecPlan:

    cd /Users/bazelrex/Developer/ship-by-sunday
    bun run programs:lint
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-13-build-program-run-slice-v1.md
    bun run markdown:lint -- --paths docs/programs/active/2026-05-13-autonomous-program-execution-loop docs/exec-plans/active/2026-05-13-build-program-run-slice-v1.md

Run package-level validation if local runner package code changes:

    cd /Users/bazelrex/Developer/ship-by-sunday
    bun test packages/local-runner/tests
    bun run test:package-smoke

Run the repo gates required by the root instructions before completion:

    cd /Users/bazelrex/Developer/ship-by-sunday
    bun run format
    bun run lint
    bun run typecheck

## Idempotence and Recovery

The runner should create unique run directories and should not overwrite previous artifacts unless an explicit resume mode is implemented. It should write state transitions incrementally so an interrupted run can be inspected.

If proof fails before review, the runner should record the failure and stop or enter a bounded repair phase only if implementation already produced changes. If review finds must-fix issues, the runner should attempt a bounded fix loop and then stop with a blocked state if findings or proof failures remain.

If the worktree has unrelated dirty files before the run starts, the runner should fail closed unless the command explicitly supports and documents an ownership scope.

## Artifacts and Notes

Expected local artifact shape:

    .sbs/program-runs/<program-id>/<run-id>/state.json
    .sbs/program-runs/<program-id>/<run-id>/review-prompt.md
    .sbs/program-runs/<program-id>/<run-id>/review-result.json
    .sbs/program-runs/<program-id>/<run-id>/proof-summary.md
    .sbs/program-runs/<program-id>/<run-id>/handoff-prompt.md

Expected durable docs updates are concise progress and proof summaries in the child ExecPlan and owning Program. Do not paste raw run logs into docs.

Validation proof recorded on 2026-05-13:

    bun test packages/local-runner/tests/program-run-slice.test.ts
    6 pass, 0 fail

    bun run --cwd packages/local-runner typecheck
    passed

    bun run --cwd packages/local-runner lint
    passed

    bun run --cwd packages/local-runner format:check
    passed

    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run typecheck
    passed

    bun test packages/local-runner/tests
    194 pass, 7 skip, 0 fail

    bun run test:package-smoke
    package smoke passed

    bun run program:run-slice -- --help
    printed Program run-slice usage

    bun run --cwd packages/local-runner program:run-slice -- --help
    printed Program run-slice usage

## Interfaces and Dependencies

The runner depends on the Program packet contract in `docs/programs/PROGRAMS.md`, the ExecPlan contract in `docs/exec-plans/PLANS.md`, and runnable test commands listed under each child ExecPlan's `### Test Commands` section.

The runner should use or adapt the local runner Codex execution boundary in `packages/local-runner/src/core/codex-exec-runner.ts`. It should borrow design ideas from the Worker repo's `execplan-feature-workflow` area, including proof command extraction and bounded repair loops, without taking a runtime dependency on Worker.

The command should expose a narrow, opinionated interface. Required inputs should include the Program id or Program path and the child ExecPlan path when auto-discovery is ambiguous. Optional flags should be limited to safe controls such as dry run, max attempts, and fake runner mode for tests.
