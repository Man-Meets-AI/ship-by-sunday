---
title: Build Program Run Loop
status: complete
created_at: 2026-05-13
completed_at: 2026-05-13
summary: Build the Program-level runner that repeatedly invokes the completed one-slice runner until the Program is complete, blocked, or stopped by a safety limit.
post_build_recap: Added `program run` sequencing over the one-slice runner, with active child ExecPlan selection, loop state artifacts, explicit stop reasons, CLI scripts, and regression coverage.
program_id: autonomous-program-execution-loop
planning_brief: docs/programs/active/2026-05-13-autonomous-program-execution-loop/planning-brief-2.md
read_when:
  - "Starting the full autonomous Program runner loop."
  - "Checking how active child ExecPlans are selected and sequenced."
  - "Validating Program runner stop reasons and run artifacts."
---

# Build Program Run Loop

This document is a living execution plan for the Program-level autonomous runner loop.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The first autonomous runner slice proved that one child ExecPlan can move through implementation, proof, fresh review, bounded fixes, reproof, docs sync, and checkpoint artifacts. Parker still has to choose and start each child slice manually. This plan adds the Program-level loop that can keep invoking that one-slice primitive until there is no safe next action.

After this plan, a maintainer should be able to run `bun run program:run -- --program-id <id>` and watch the runner select active Program child ExecPlans, execute them one at a time through the existing slice runner, and stop with a clear reason: Program complete, no active child plan, a blocked slice, or a configured safety limit.

## Progress

- [x] 2026-05-13: Created this ExecPlan from `docs/programs/active/2026-05-13-autonomous-program-execution-loop/planning-brief-2.md`.
- [x] 2026-05-13: Implemented the loop state machine and selection logic in `packages/local-runner/src/core/program-run-loop.ts`.
- [x] 2026-05-13: Exposed `program run` through the local runner CLI, root script, and package script.
- [x] 2026-05-13: Added fixture-driven tests for loop completion, no-plan blocking, slice blocking, safety-limit stops, dirty-start safety, and CLI help.
- [x] 2026-05-13: Ran focused package and docs validation and recorded proof.

## Surprises & Discoveries

The first discovery is that `program:run-slice` deliberately refuses a dirty worktree at startup. The loop keeps that guard at the beginning of the full Program run, then passes ownership of expected loop changes to slice invocations with `requireCleanWorktree: false` so the second child slice is not blocked by the first child slice's uncommitted edits.

## Decision Log

Decision: Build `program run` as sequencing over `program:run-slice`, not as another copy of the slice phases.
Rationale: The completed first slice already owns execution, proof, review, repair, docs sync, and checkpoint behavior. Duplicating that logic would create drift.
Date: 2026-05-13.

Decision: Select active child ExecPlans from frontmatter.
Rationale: Program-linked ExecPlans already carry `program_id` and immutable `planning_brief` frontmatter. Filtering active plans by the current planning brief gives the loop a deterministic and testable next-slice source without parsing prose from `program.md`.
Date: 2026-05-13.

Decision: Stop blocked when an active Program has no runnable active child plan.
Rationale: Automatic child-plan generation is a separate capability. The loop should not invent scope when the Program docs need a planning refresh or a new ExecPlan.
Date: 2026-05-13.

Decision: Treat `--max-slices` as a safety checkpoint, not success.
Rationale: A safety limit prevents runaway automation. Reaching it means the loop stopped deliberately before proving Program completion.
Date: 2026-05-13.

## Outcomes & Retrospective

This plan shipped the Program-level runner loop. The root command is:

    bun run program:run -- --program-id <id>

The package CLI command is:

    bun run --cwd packages/local-runner program:run -- --program-id <id>

The packaged binary path is:

    ship-by-sunday program run --program-id <id>

The loop resolves the active Program packet, reads the current planning brief, selects active child ExecPlans whose frontmatter matches the Program id and current planning brief, invokes the existing one-slice runner, writes `loop-state.json`, and stops with explicit reasons for Program completion, no active child plan, slice failure, or `--max-slices`.

Automatic child-plan generation, planning refresh after every slice, review-swarm integration, PR creation, deployment, and installer portability remain later slices in the owning Program.

## Context and Orientation

This work lives in the local runner package. The existing slice primitive is `packages/local-runner/src/core/program-run-slice.ts`. The existing Program CLI surface is `packages/local-runner/src/commands/program.ts`, and the root CLI dispatcher is `packages/local-runner/src/cli.ts`. Root and package scripts live in `package.json` and `packages/local-runner/package.json`.

The Program packet that owns this work is `docs/programs/active/2026-05-13-autonomous-program-execution-loop/`. The current planning brief for this plan is `docs/programs/active/2026-05-13-autonomous-program-execution-loop/planning-brief-2.md`.

The loop should write local artifacts under ignored `.sbs/program-runs/<program-id>/<loop-run-id>/`. Durable docs should only receive concise evidence. Raw transcripts, long logs, secrets, absolute paths, and provider payloads must stay out of checked-in docs.

### In Scope

This plan should add a Program-level runner core that resolves one active Program, reads the current planning brief, selects active child ExecPlans with matching `program_id` and current `planning_brief`, invokes the existing slice runner for each selected child plan, writes loop state, and stops with explicit statuses for complete, blocked, and stopped.

This plan should add a `program run` CLI command plus root and package scripts named `program:run`. It should add tests that fake the slice runner so automated validation does not require live Codex calls.

### Out Of Scope

This plan should not create child ExecPlans automatically, write new planning briefs after every child slice, run PR creation or merge workflows, deploy, touch provider dashboards, implement hooks, integrate review-swarm, or extract the runner to another repo.

This plan should not loosen the one-slice runner's default dirty worktree safety for direct `program run-slice` users.

## Plan of Work

First, add a small core module in `packages/local-runner/src/core/program-run-loop.ts`. It should define the loop result and state types, scan active ExecPlans, check Program completion from `program.md`, assert the initial worktree is clean, invoke an injectable slice runner, and write `loop-state.json` after every state transition.

Second, update `packages/local-runner/src/core/program-run-slice.ts` to accept an optional `requireCleanWorktree` parameter that defaults to `true`. The new Program loop should assert a clean worktree once at loop start and then call the slice runner with `requireCleanWorktree: false` for owned loop slices.

Third, update `packages/local-runner/src/commands/program.ts` so `program run` parses `--program-id`, `--repo`, `--max-slices`, `--max-fix-attempts`, and `--json`. Keep `program run-slice` behavior intact. Update `packages/local-runner/src/cli.ts`, `packages/local-runner/package.json`, and root `package.json` help or scripts for `program:run`.

Fourth, add `packages/local-runner/tests/program-run-loop.test.ts`. The fixture should create a temporary git repository, an active Program packet, a current planning brief, and active ExecPlans with Program frontmatter. Tests should prove that the loop selects matching active plans, stops on Program completion, stops blocked when no active child plan exists, stops blocked when a slice runner fails, and stops at `--max-slices`.

Fifth, update this ExecPlan and the owning Program with concise progress and proof evidence, then run focused tests and docs linting.

## Milestones

Milestone 1 is the loop skeleton. At the end of this milestone, `runProgramRunLoop` should resolve Program context, create a loop run directory, write `loop-state.json`, and return blocked when no active child plan exists.

Milestone 2 is slice sequencing. At the end of this milestone, tests should prove that multiple matching active child plans are run in deterministic path order and that the loop passes bounded controls through to the slice runner.

Milestone 3 is stop behavior. At the end of this milestone, tests should prove Program-complete, no-active-plan, slice-blocked, and max-slices stop reasons.

Milestone 4 is command exposure and validation. At the end of this milestone, `bun run program:run -- --help` and `bun run --cwd packages/local-runner program:run -- --help` should show the new command, focused tests should pass, and docs linting should pass for touched Program and ExecPlan files.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Read the existing primitive and command surface before editing:

    sed -n '1,260p' packages/local-runner/src/core/program-run-slice.ts
    sed -n '1,220p' packages/local-runner/src/commands/program.ts
    sed -n '1,220p' packages/local-runner/src/cli.ts

Run the focused baseline:

    bun test packages/local-runner/tests/program-run-slice.test.ts

After implementation, run the focused loop tests:

    bun test packages/local-runner/tests/program-run-loop.test.ts

Then run the package and docs checks listed under Test Commands.

## Validation and Acceptance

Acceptance is behavioral. A maintainer can run `program run` for an active Program and the command selects the next active child ExecPlan from frontmatter, invokes the existing slice runner, records loop state, and stops with a clear reason. The loop must be testable without live OpenAI or Codex calls.

The loop must not duplicate the slice runner's phase logic. It must not silently start from a dirty worktree. It must not call a child plan whose `program_id` or `planning_brief` does not match the active Program's current planning brief.

### Test Commands

    bun test packages/local-runner/tests/program-run-loop.test.ts
    bun test packages/local-runner/tests/program-run-slice.test.ts
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner format:check
    bun run programs:lint
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-build-program-run-loop.md
    bun run markdown:lint -- --paths docs/programs/active/2026-05-13-autonomous-program-execution-loop docs/exec-plans/completed/2026-05-13-build-program-run-loop.md

## Idempotence and Recovery

The loop should create a unique run directory by default. Supplying the same run id in tests should overwrite only that run's local `.sbs` state in a temporary repository, not checked-in source.

If a slice blocks or throws, the loop should write the failure into `loop-state.json` and stop without selecting another child plan. If `--max-slices` is reached, the loop should stop with a safety-limit reason and leave enough state for Parker to inspect and rerun deliberately.

If the initial worktree is dirty, the loop should fail before invoking any slice runner. Direct `program run-slice` users should keep the existing clean-worktree requirement unless a later documented option changes it.

## Artifacts and Notes

Expected local artifact shape:

    .sbs/program-runs/<program-id>/<loop-run-id>/loop-state.json

Each slice invocation should continue to write its own artifacts under:

    .sbs/program-runs/<program-id>/<slice-run-id>/

Validation proof recorded on 2026-05-13:

    bun test packages/local-runner/tests/program-run-loop.test.ts
    6 pass, 0 fail

    bun test packages/local-runner/tests/program-run-slice.test.ts
    13 pass, 0 fail

    bun run --cwd packages/local-runner typecheck
    passed

    bun run --cwd packages/local-runner lint
    passed

    bun run --cwd packages/local-runner format:check
    passed

    bun run programs:lint
    passed

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-build-program-run-loop.md
    passed

    bun run markdown:lint -- --paths docs/programs/active/2026-05-13-autonomous-program-execution-loop docs/exec-plans/completed/2026-05-13-build-program-run-loop.md
    passed

    bun test packages/local-runner/tests
    207 pass, 7 skip, 0 fail

    bun run test:package-smoke
    package smoke passed

    bun run lint
    passed

    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run typecheck
    passed

    bun run format:check
    passed

    git diff --check
    passed

## Interfaces and Dependencies

The new loop depends on `runProgramRunSlice` from `packages/local-runner/src/core/program-run-slice.ts`, `resolveCurrentPlanningBrief` from `scripts/programs/briefs.ts`, `parseMarkdownFrontmatter` from `scripts/markdown-metadata/frontmatter.ts`, and repository-safe path helpers from `packages/local-runner/src/core/repository-boundary.ts`.

The public command interface should be:

    ship-by-sunday program run --program-id <id> [--repo <path>] [--max-slices <count>] [--max-fix-attempts <count>] [--json]

The root script should be:

    bun run program:run -- --program-id <id>
