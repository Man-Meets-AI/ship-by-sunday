---
title: "Program Run Slice V1 Planning Brief 1"
program_id: autonomous-program-execution-loop
brief_version: 1
status: superseded
summary: "Build the first autonomous one-slice runner that executes an ExecPlan, reviews it in fresh context, fixes real findings, reruns proof, syncs docs, and checkpoints state."
read_when:
  - "Writing or executing the first child ExecPlan for the autonomous Program runner."
  - "Checking the minimum useful implementation boundary for post-ExecPlan review automation."
---

# Program Run Slice V1 Planning Brief 1

Date: 2026-05-13.

This brief drives the first child ExecPlan for the autonomous Program execution loop.

## Outcome

Ship by Sunday should gain a command-driven one-slice Program runner. Given an approved Program and one active child ExecPlan, the command should run the child ExecPlan through the same loop Parker currently performs manually: execute, prove, generate a fresh review prompt, run a fresh review pass, fix real findings, rerun proof, update docs, and checkpoint state.

The command does not need to loop across every child ExecPlan yet. It should build the reliable primitive that a later full Program runner can call.

## Scope

Add a Program slice runner command through the smallest durable command surface that fits the repo. Prefer a root script such as `program:run-slice` backed by package-shaped code in the local runner or a nearby scripts module. Reuse the existing local runner Codex exec wrapper where practical. Adapt the sibling Worker repo's proof-command and validation-loop ideas, but do not introduce Worker runtime or dashboard dependencies.

The runner should:

- resolve the Program folder and current child ExecPlan
- hydrate context from Program docs, current planning brief, child ExecPlan, AGENTS instructions, git status, and changed files
- execute the child ExecPlan through headless Codex
- run the child ExecPlan's `### Test Commands`
- write a runtime-generated review prompt from live state
- run a fresh review pass in read-only or non-mutating mode
- classify review findings into must-fix issues, open questions, and notes
- run a bounded fix pass for must-fix findings
- rerun proof
- update the child ExecPlan and Program with concise evidence
- store local run artifacts under ignored state
- stop before starting the next ExecPlan

## Boundaries

Do not build full Program looping in this slice. Do not automate ideation, moodboards, screen-by-screen browser polish, taxonomy review, feature usage analytics, PR creation, merging, provider setup, or production deployment.

Do not create a separate repo. Do not depend directly on the Worker repo at runtime. Do not sync raw Codex transcripts, raw source, long logs, secrets, provider payloads, or absolute paths into durable docs.

Do not make hooks own the state machine in v1. Hooks may be documented as a later enhancement.

## Acceptance

The command should be testable without requiring live OpenAI API calls by using a stubbed or fake Codex runner in unit/integration tests.

The command should have at least one fixture-driven test proving the happy path:

- an active Program and child ExecPlan are discovered
- the fake execute phase mutates controlled fixture output
- proof runs
- a review prompt is written
- fake review findings are classified
- a fake fix phase runs for must-fix findings
- proof reruns
- docs are updated with a proof/review summary
- local run artifacts are written

The command should have failure-mode tests for proof failure, review must-fix failure after capped attempts, and dirty worktree safety.

The final implementation should pass focused runner tests, Program and ExecPlan linting for touched docs, markdown linting for touched docs, and any package smoke required by local runner changes.
