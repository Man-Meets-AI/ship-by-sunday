---
program_id: autonomous-program-execution-loop
title: Autonomous Program Execution Loop
status: active
created_at: 2026-05-13
completed_at: null
summary: Automate the manual Program and ExecPlan SOP so an approved Program can advance through execution, fresh review, fixes, proof, docs sync, and checkpoints without prompt-pasting.
post_build_recap: null
read_when:
  - "Starting work on autonomous Program execution."
  - "Planning how ExecPlan review, fix, and proof should run before the next slice begins."
  - "Deciding whether the Program runner belongs in Ship by Sunday, Worker, or a separate repo."
---

# Autonomous Program Execution Loop

This Program is a living initiative document for turning Parker's manual Program and ExecPlan execution SOP into a command-driven autonomous loop.

This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

Parker's current Program workflow works, but it wastes human attention on repeated orchestration: asking for a review prompt, pasting that prompt into a fresh review thread, waiting for findings, telling the implementation thread to fix them, deciding whether context is still safe, requesting a handoff prompt, and repeating the same loop for every child ExecPlan.

When this Program is complete, Parker should be able to sign off on a Program, start the runner, and let the system advance child ExecPlans through execution, fresh review, fixes, proof, docs sync, and checkpoints until the Program is complete or blocked with useful evidence.

The immediate focus is the post-ExecPlan automation loop. The broader SDLC goal is recorded here, but the first implementation should not try to automate ideation, design moodboarding, taxonomy review, browser polish, or usage analytics all at once.

## Program Inputs

The current manual SOP and repository research are recorded in `research-pass-current-manual-loop-and-runner-state.md`. The v1 scope boundary is normalized in `normalized-pass-manual-sdlc-and-runner-boundary.md`. Canonical decisions are recorded in `converged-decision-packet.md`. Ordering is recorded in `dependency-graph.md` and `plan-split-recommendation.md`. Cross-repo boundaries are recorded in `cross-repo-review.md`. Completed child slices used `planning-brief-1.md` through `planning-brief-4.md`; `current-planning-brief.txt` now points at `planning-brief-5.md` for the runner extraction boundary decision.

This Program depends on the existing Program and ExecPlan contracts in `docs/programs/PROGRAMS.md` and `docs/exec-plans/PLANS.md`, the prompt assets in `docs/prompts/`, the local runner's Codex execution wrapper, and the sibling Worker repo's headless ExecPlan workflow patterns.

## Current State

Ship by Sunday already has durable Program and ExecPlan docs, prompt assets, markdown/frontmatter linting, Program linting, ExecPlan linting, and local runner docs-operating-system commands. The local runner now exposes `program:run-slice` for one child ExecPlan lifecycle, `program:run` for Program-level sequencing across active child ExecPlans, and `execplan:build` for the user-facing autonomous ExecPlan command.

The local runner already wraps `codex exec --json` and can install planning-oriented scripts into other repos. The Worker Foundations installer now wires installed `execplan:build` to the packaged Ship by Sunday autonomous runner while keeping the implementation in one runner code path.

The sibling Worker repo already contains useful headless execution patterns: Codex runners, proof-command extraction, grill loops, validation repair loops, and runtime receipts. Those patterns should inform the implementation without making Ship by Sunday depend on Worker runtime internals.

The core command path now exists in the local runner: `program run-slice` executes one child ExecPlan through proof, fresh review, bounded repair, reproof, docs sync, and checkpointing, while `program run` sequences active child ExecPlans until it completes, blocks, or reaches a safety limit. The user-facing command path now also exists: `execplan build` and the root `execplan:build` script forward into the same runner, and installed Worker Foundations `execplan:build` forwards to the packaged Ship by Sunday local runner instead of printing a placeholder.

## Progress

- [x] 2026-05-13: Captured the manual SOP that currently happens after each ExecPlan: write review prompt, run fresh review thread, fix findings, reproof, continue or hand off.
- [x] 2026-05-13: Recorded the broader SDLC desire, including problem ideation, customer wow moment, affordance breadboarding, design exploration, decision interviews, screen polish, taxonomy checks, and feature-usage automation.
- [x] 2026-05-13: Researched the Ship by Sunday docs operating system, local runner install paths, and Worker headless execution patterns.
- [x] 2026-05-13: Created this Program packet and planning brief 1 for `program:run-slice` v1.
- [x] 2026-05-13: Completed `Build Program Run Slice V1`; the local runner now exposes `program run-slice`, root/package scripts expose `program:run-slice`, and fixture tests prove execute, proof, fresh review, fix, reproof, docs sync, checkpoint, and blocked failure modes.
- [x] 2026-05-13: Refreshed the Program with planning brief 2 for `Build Program Run Loop`.
- [x] 2026-05-13: Completed `Build Program Run Loop`; the local runner now exposes `program run`, root/package scripts expose `program:run`, and tests prove Program child plan selection, sequencing, safety-limit stops, no-plan blocking, and slice failure blocking.
- [x] 2026-05-13: Refreshed the Program with planning brief 3 for `Harden Program Review And Repair`.
- [x] 2026-05-13: Completed `Harden Program Review And Repair`; review findings now carry category and disposition, severity policy is enforced before repair decisions, review prompts include staged and untracked changes, repair prompts include attempt budgets, and only missing-test findings can be intentionally deferred with rationale and follow-up.
- [x] 2026-05-13: Refreshed the Program with planning brief 4 for `Package Runner Through Local Runner Install`.
- [x] 2026-05-13: Completed `Package Runner Through Local Runner Install`; maintainers can now run `bun run execplan:build -- --program-id <id>` or `bun run execplan:build -- --plan <path>`, and installed Worker Foundations `execplan:build` forwards to `ship-by-sunday execplan build`.
- [x] 2026-05-13: Refreshed the Program with planning brief 5 for `Decide Runner Extraction Boundary`.
- [x] 2026-05-14: Removed the startup clean-worktree refusal from `program run`, `program run-slice`, and the `execplan build` paths that delegate to them so dogfood and mature repo automation can run on already-dirty checkouts.

## Decision Log

Decision: Automate Parker's existing SOP rather than inventing a new process.
Rationale: The existing loop has worked repeatedly. The cost is manual orchestration, not the sequence itself.
Date: 2026-05-13.

Decision: Build a one-slice runner first.
Rationale: `program:run-slice` is the smallest useful primitive: it can execute one ExecPlan through review, fixes, proof, and docs sync. Full Program looping should reuse that primitive later.
Date: 2026-05-13.

Decision: Keep broader SDLC automation out of the first slice.
Rationale: Ideation, moodboards, taxonomy, browser polish, and usage instrumentation matter, but they should not block automating the painful post-ExecPlan loop.
Date: 2026-05-13.

Decision: Use command-driven orchestration before hooks.
Rationale: A command is easier to test, resume, and debug. Hooks can assist later, but they should not hide the first mutating state machine.
Date: 2026-05-13.

Decision: Do not extract to a separate repo yet.
Rationale: Ship by Sunday owns the canonical contracts and local runner distribution path. Extraction should wait until the command contract works here and in at least one second consumer.
Date: 2026-05-13.

Decision: Treat Worker as a reference implementation.
Rationale: Worker has stronger execution machinery, but its runtime state and dashboard assumptions do not belong directly in every Ship by Sunday or generated customer repo.
Date: 2026-05-13.

Decision: Generate the review prompt after implementation from live context.
Rationale: The prompt is valuable because it carries the actual Program, ExecPlan, git diff, changed files, proof output, and risk context.
Date: 2026-05-13.

Decision: Store execution artifacts locally and durable truth in docs.
Rationale: Raw prompts, review results, and proof captures are useful local artifacts. Program and ExecPlan docs remain the checked-in source of truth.
Date: 2026-05-13.

Decision: Keep v1 explicit with `--program-id` and `--plan`.
Rationale: Auto-selecting the next child plan is part of full Program looping. The first runner should be deterministic and should not hide plan selection.
Date: 2026-05-13.

Decision: Do not require a clean worktree at Program runner startup.
Rationale: Dogfooding and mature-repo automation often happen in already-active checkouts. The runner should not block those loops before useful execution starts; a future TUI or approval design can decide whether to warn, checkpoint, or gate dirty state.
Date: 2026-05-14.

## Slice Ledger

Active child ExecPlans:

- None currently.

Planned child ExecPlans:

- `Decide Runner Extraction Boundary` should revisit whether the docs operating system and Program runner deserve a separate repo after multiple consumers prove the command contract.

Completed child ExecPlans:

- [Build Program Run Slice V1](../../../exec-plans/completed/2026-05-13-build-program-run-slice-v1.md) added the explicit one-slice runner command, fakeable Codex/review/proof boundaries, local run artifacts, structured review classification, bounded fix attempts, docs sync, and regression coverage.
- [Build Program Run Loop](../../../exec-plans/completed/2026-05-13-build-program-run-loop.md) added Program-level sequencing over the slice runner, active child ExecPlan selection by frontmatter, loop state artifacts, explicit stop reasons, safety-limit checkpoints, and regression coverage.
- [Harden Program Review And Repair](../../../exec-plans/completed/2026-05-13-harden-program-review-and-repair.md) tightened review schemas, severity thresholds, staged and untracked review context, repair cap messaging, review policy artifacts, and intentionally deferred finding handling.
- [Package Runner Through Local Runner Install](../../../exec-plans/completed/2026-05-13-package-runner-through-local-runner-install.md) added the `execplan build` CLI and root/package `execplan:build` scripts, forwarded installed Worker `execplan:build` into the packaged runner, updated installed command guidance, and added command, install, compatibility, and package smoke coverage.

## Next Slice

The next recommended slice is `Decide Runner Extraction Boundary`. It should revisit whether the docs operating system and Program runner belong in this repo, the local-runner package, or a separate package/repo now that the command contract works locally and through the installed Worker command surface.

## Risks and Watchpoints

Do not let automation hide the quality bar. The point is not to skip review; it is to make the review, fix, and proof loop happen without Parker manually moving text between threads.

Do not depend on chat context. The runner must hydrate each phase from durable docs, git state, proof summaries, review artifacts, and run receipts.

Do not make raw logs, Codex transcripts, secrets, provider payloads, or absolute paths part of synced durable docs.

Do not let hooks own the v1 state machine. Hooks can become later lifecycle affordances, but the first runner should be an explicit command.

Do not copy Worker dashboard or runtime assumptions into every repo. Reuse the ideas and tested patterns, not the product-specific state model.

Do not move to the next ExecPlan until the current ExecPlan has passed implementation, proof, review, fixes, reproof, and docs sync.

Do not create a separate repo before the command contract is stable. Extraction too early would create versioning overhead and duplicate truth.

## Outcomes & Retrospective

This Program is active. The expected outcome is a reliable autonomous Program execution loop that reduces Parker's role to Program signoff, kickoff, and handling true blockers.

## Validation and Acceptance

At Program completion, Ship by Sunday should expose a documented runner that can execute approved Program work through child ExecPlans without manual prompt-pasting. The runner should prove one-slice execution, full Program looping, fresh review context, fix/reproof behavior, docs sync, checkpoint state, and safe failure modes.

The Program is not complete until focused tests prove the runner with fake Codex execution, linting passes for Program and ExecPlan docs, local runner package smoke passes where the runner is installed or exported, and at least one real or dry-run Program slice demonstrates the execute-review-fix-proof-docs loop end to end.

## Artifacts and Notes

Manual SOP captured for automation:

    implement ExecPlan
    write context-rich review prompt
    run fresh reviewer
    fix real findings
    rerun proof
    continue if context is safe, otherwise hand off

Desired v1 phase sequence:

    hydrate_context
    execute
    proof
    write_review_prompt
    review
    fix_findings
    reproof
    sync_docs
    checkpoint
    complete_or_blocked

Completed v1 command surface:

    bun run program:run-slice -- --program-id <id> --plan <path>
    ship-by-sunday program run-slice --program-id <id> --plan <path>

Completed Program loop command surface:

    bun run program:run -- --program-id <id>
    ship-by-sunday program run --program-id <id>

Completed ExecPlan command surface:

    bun run execplan:build -- --program-id <id>
    bun run execplan:build -- --plan <path>
    ship-by-sunday execplan build --program-id <id>
    ship-by-sunday execplan build --plan <path>

Focused proof from `Build Program Run Slice V1`:

    bun test packages/local-runner/tests/program-run-slice.test.ts
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner format:check
    bun test packages/local-runner/tests
    bun run test:package-smoke

Focused proof from `Build Program Run Loop`:

    bun test packages/local-runner/tests/program-run-loop.test.ts
    bun test packages/local-runner/tests/program-run-slice.test.ts
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner format:check
    bun run programs:lint
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-build-program-run-loop.md
    bun run markdown:lint -- --paths docs/programs/active/2026-05-13-autonomous-program-execution-loop docs/exec-plans/completed/2026-05-13-build-program-run-loop.md
    bun test packages/local-runner/tests
    bun run test:package-smoke
    bun run lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run typecheck
    bun run format:check
    git diff --check

## Interfaces and Dependencies

This Program depends on `docs/programs/PROGRAMS.md`, `docs/exec-plans/PLANS.md`, `docs/prompts/program-loop.md`, `docs/prompts/program-docs-sync.md`, `docs/prompts/program-planning-refresh.md`, `docs/prompts/exec-plan-execute.md`, and `docs/prompts/exec-plan-validate.md`.

Implementation should inspect `packages/local-runner/src/core/codex-exec-runner.ts`, `packages/local-runner/src/commands/docs-operating-system.ts`, and the sibling Worker repo's `apps/runtime/src/workflows/execplan-feature-workflow/` before choosing final code boundaries.
