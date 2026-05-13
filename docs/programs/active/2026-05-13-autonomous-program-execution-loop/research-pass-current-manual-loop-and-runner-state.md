---
title: "Autonomous Program Execution Loop Research"
summary: "Research pass capturing the current manual Program and ExecPlan operating loop, the local runner docs operating system, and the Worker repo headless execution machinery."
docType: "research_pass"
status: "active"
read_when:
  - "Planning the autonomous Program runner."
  - "Checking how the manual review and fix loop should be automated."
  - "Comparing Ship by Sunday local runner commands with Worker execution workflows."
---

# Autonomous Program Execution Loop Research

This research pass records the current operating loop that Parker has been running manually and the repository surfaces that can turn that loop into a programmatic state machine.

## Manual Loop Today

The current process starts before code. Parker usually begins by saying that a piece of work needs a Program or ExecPlan, sometimes after a small customer-journey tracing pass that explains how the thing works from the user's point of view. When the shape is still ambiguous, Parker runs a decision interview with this prompt:

> Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer. Ask the questions one at a time. If a question can be answered by exploring the codebase, explore the codebase instead.

Parker often answers with the concrete answer plus a standing quality rubric: choose what makes the most sense for customer experience, coding-agent experience, and developer experience. That rubric is now part of the desired operating system. It means plans should optimize first for an impressive customer journey, second for clear durable agent paths, and third for low-brittleness developer maintenance.

Once a Program or ExecPlan is signed off, the current implementation loop is repetitive. A coding agent executes one ExecPlan. When it finishes, Parker asks it to write a review prompt for another coding agent. Parker pastes that prompt into a fresh high-reasoning review thread, often using the repo's review-swarm pattern. The reviewer reports findings. Parker returns to the implementation thread and asks it to fix the findings. After fixes and proof, Parker either tells the same thread to continue to the next ExecPlan when context usage is still low or asks it to write a handoff prompt for another coding agent when context is high. That loop repeats until the Program is complete.

The manual SOP works. The automation target is not to invent a new SDLC, but to encode this exact SOP as explicit phases, artifacts, limits, and state transitions so Parker only signs off on the Program and starts the loop.

## Desired SDLC Shape

The broader desired SDLC has these stages:

- ideate in the problem space
- define the "oh shit this was easy, awesome, or valuable" customer moment
- write the rough steps on paper
- breadboard affordances
- design or moodboard the visual and interaction direction
- decide whether the work needs an ExecPlan or a Program
- run the relentless interview or grill session to resolve design-tree dependencies
- update durable docs as decisions converge
- sign off on the Program or ExecPlan
- execute one slice
- review the completed slice in a fresh review context
- fix real findings
- prove the result programmatically
- continue or hand off based on durable state, not chat context
- run smoke checks, full Program review, browser polish, taxonomy review, and usage instrumentation before final completion

The immediate Program should not automate the entire SDLC. The first valuable slice is the post-ExecPlan loop: execute, prove, generate fresh review context, run review, fix findings, reprove, update docs, checkpoint, then move to the next ExecPlan.

## Ship by Sunday Docs Operating System

Ship by Sunday already has the canonical docs and planning contracts. `docs/programs/PROGRAMS.md` defines Program packets. `docs/exec-plans/PLANS.md` defines ExecPlans. `docs/prompts/` contains Program loop, docs-sync, planning-refresh, ExecPlan execute, grill, and validate prompts. `scripts/programs/run-lint.ts`, `scripts/exec-plan/run-lint.ts`, and `scripts/markdown-metadata/run-lint.ts` provide deterministic validation for those contracts.

The root scripts already expose the important proof surface:

- `bun run programs:lint`
- `bun run plans:lint`
- `bun run markdown:lint`

The current Program loop documented in `docs/programs/README.md` says to read the Program, resolve the current planning brief, write, grill, execute, and validate one child ExecPlan, sync docs, write the next planning brief, and repeat. That describes the operating model, but it is still prompt-driven and manual.

## Local Runner State

The local runner has two relevant installer families.

The docs operating system command lives in `packages/local-runner/src/commands/docs-operating-system.ts`. It exposes `programs-lint`, `exec-plans-lint`, `markdown-lint`, `docs-validate`, `docs-refresh-quality`, `native-command-proof`, and `write-child-plan`. The adoption workflow installs or proves a portable docs operating system with strict privacy boundaries. It intentionally avoids runtime app code, raw source sync, raw logs, Codex transcripts, provider secrets, and Worker-specific state.

The Worker Foundations installer exposes `shipbysunday install`. Its manifest installs visible repo-local Worker source and root scripts such as `execplan:write`, `execplan:grill`, `execplan:build`, `execplan:validate`, and `worker:test`. The installed command names are the right shape, but some generated `execplan:*` commands are still placeholders rather than a full autonomous build-review-fix loop.

The local runner already has a useful Codex wrapper at `packages/local-runner/src/core/codex-exec-runner.ts`. It runs `codex exec --json`, supports a target repo, sandbox mode, profile, and structured output schema, and parses JSONL events plus final agent messages. That is the correct primitive for scriptable headless work.

## Worker Repo Execution Machinery

The sibling Worker repo has stronger execution code. Its `apps/runtime/src/workflows/execplan-feature-workflow/` area contains Codex execution wrappers, proof-command extraction from ExecPlan `### Test Commands`, grill loops, build commands, and validation repair loops. The validate path repeatedly runs proof, feeds exact failures back into Codex, and caps attempts. That is close to Parker's manual "review, fix, prove again" loop.

Worker also has `apps/runtime/src/workflows/program-loop/service.ts`, which resolves an active Program, freezes the current planning brief, writes a child ExecPlan, and stores runtime state. That service does not yet run a whole Program to completion, but its stateful approach is useful.

The Worker repo should be treated as a reference implementation, not as a direct runtime dependency for Ship by Sunday. The reusable ideas are the Codex runner, proof-command runner, repair loop, structured receipts, and Program-linked state transitions.

## Research Conclusions

The automation should be command-driven rather than hook-driven at first. OpenAI Codex CLI headless mode is designed for scripted and CI-style tasks, so `codex exec` should be the execution backbone. Hooks can become notifications or lifecycle triggers later, but the main state machine should be an explicit command that can be tested, resumed, and debugged.

The first implementation should run one ExecPlan slice end to end. A later command can loop across all remaining ExecPlans in the Program. This keeps the first slice useful without hiding too much control flow.

The durable state model should separate technical run artifacts from source-of-truth docs. Run artifacts belong under an ignored state directory such as `.sbs/program-runs/`. Program and ExecPlan progress, decisions, proof summaries, review summaries, and next-slice pointers belong in checked-in docs.

The review prompt must be generated at the moment the slice finishes because it needs live context: Program packet, child ExecPlan, git diff, changed files, proof output summaries, known risk areas, AGENTS instructions, and intended base branch. The reviewer should run in a fresh Codex execution context. The implementer should only fix real findings, then rerun proof before moving on.
