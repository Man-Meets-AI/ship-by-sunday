---
title: "Autonomous Program Execution Loop Normalized Pass"
summary: "Normalized track memo reducing the manual SDLC, headless runner, review loop, and state-management decisions into one implementation boundary."
docType: "normalized_pass"
status: "active"
read_when:
  - "Checking the v1 boundary for autonomous Program execution."
  - "Deciding whether broader SDLC automation belongs in the first slice."
  - "Reviewing how customer, agent, and developer experience shape the runner."
---

# Autonomous Program Execution Loop Normalized Pass

## Track Summary

The durable goal is a programmatic SDLC where Parker approves a Program once, starts it once, and the system loops through child ExecPlans until the Program completion criteria are met. The system should preserve the parts of the current SOP that work: decision interviews before planning, context-rich review prompts after execution, fresh review context, fix loops, proof before moving on, and handoff when a context window is no longer useful.

The first implementation boundary is narrower. It should automate one child ExecPlan run through execution, proof, fresh review, fix, reproof, docs sync, and checkpoint. Once that is reliable, a Program-level loop can call the slice runner repeatedly.

## Experience Priorities

Customer experience means completed features should still get the same polish Parker currently enforces manually: proof, browser checks where relevant, taxonomy review, usage instrumentation, and visible quality. The runner should not declare a Program complete just because code changed.

Coding-agent experience means every run starts from durable state and clear instructions. Agents should not depend on the previous chat thread. The runner must hydrate context from Program docs, ExecPlan docs, AGENTS files, git diff, proof output, review output, and stored run receipts.

Developer experience means the runner should be explicit, testable, and debuggable. The core behavior should live behind commands and typed phases, not invisible hook side effects. Hooks may assist later, but v1 should be a command-driven state machine.

## Scope Boundary

In scope for v1 is the post-ExecPlan loop. A command should be able to select or receive one active child ExecPlan, run it with `codex exec`, run proof commands, generate a fresh review prompt, run a fresh review pass, fix must-fix findings, rerun proof, update docs, and store a checkpoint.

Out of scope for v1 is full SDLC ideation, moodboards, design exploration, browser polishing for every screen, taxonomy automation, feature usage analytics, automatic production deployment, automatic pull request merging, and provider dashboard configuration. Those should be recorded as desired later phases.

## Runner Boundary

The runner should first live in Ship by Sunday because this repo owns the canonical Program and ExecPlan contracts. The implementation should reuse the local runner's Codex exec wrapper and adapt the stronger Worker proof and validation-loop patterns. It should not become a separate repo until the command contract works in Ship by Sunday, Worker, a disposable installed repo, and the generated Starter template.

The likely public command shape is one of:

- `bun run program:run-slice`
- `shipbysunday program run-slice`
- `shipbysunday program run`

The first command should run one slice. The later command should loop until Program completion.

## State Boundary

Technical state should be ignored and resumable. A run can write artifacts such as `state.json`, `review-prompt.md`, `review-result.json`, `proof-summary.md`, and `handoff-prompt.md` under `.sbs/program-runs/<program-id>/<run-id>/`.

Durable truth should be checked in. Program progress, ExecPlan progress, decision log entries, proof summaries, review summaries, and next-slice pointers should be written back to Program and ExecPlan docs.

## Review Boundary

The automated review pass should preserve Parker's current review quality by generating the prompt after implementation, not before. It should include the exact Program, child ExecPlan, changed files, diff summary, proof commands, validation results, and risky assumptions. The review pass should run in a fresh Codex execution context and should return structured findings with severity, impact, location, minimal fix, and whether the finding must be fixed.

The fix pass should only address real must-fix findings. It should not re-litigate style or widen scope. After fixes, proof runs again.

## Completion Boundary

A single ExecPlan slice is complete only when implementation, proof, review, fixes, reproof, and docs sync are complete. A Program is complete only when all required child ExecPlans are complete, Program acceptance criteria pass, linting passes, and a final Program-level review finds no must-fix issues.
