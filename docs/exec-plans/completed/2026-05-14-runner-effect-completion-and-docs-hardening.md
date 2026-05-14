---
title: Runner Effect Completion And Docs Hardening
status: complete
created_at: 2026-05-14
completed_at: 2026-05-14
summary: Finish local-runner Node and Effect migration docs, broad validation, and Program closeout.
post_build_recap: The local-runner README now states the Node-first shipped runtime, npm Worker default, and migrated Effect service boundaries; broad local-runner tests, package static checks, build, Worker compatibility smoke, package smoke, plan lint, markdown lint, Program lint, scoped whitespace checks, and repo-level format, lint, and typecheck passed.
program_id: local-runner-node-effect-migration
planning_brief: docs/programs/active/2026-05-13-local-runner-node-effect-migration/planning-brief-9.md
read_when:
  - Closing the local-runner Node and Effect migration Program.
  - Validating local-runner README/runtime docs.
  - Reviewing final local-runner Node and Effect migration evidence.
---

# Runner Effect Completion And Docs Hardening

This document is a living execution plan for the final documentation, validation, and closeout slice of the local-runner Node and Effect migration Program.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The implementation slices have already moved the local-runner package to Node/npm and migrated the important I/O boundaries to Effect. This final slice makes the durable docs match that shipped reality, runs the broad validation that proves the package still works, and closes the owning Program only if no required migration work remains.

## Progress

- [x] 2026-05-14: Read planning brief 9, the active Program packet, and `packages/local-runner/README.md`.
- [x] 2026-05-14: Updated the local-runner README with the Node-first runtime and Effect boundary summary.
- [x] 2026-05-14: Ran broad local-runner validation, Worker compatibility smoke, and package smoke.
- [x] 2026-05-14: Updated this ExecPlan and the Program retrospective, then prepared both for completed locations.

## Surprises & Discoveries

After the completed Program folders and indexes were reconciled, `bun run programs:lint` passed across Program docs, Program packets, and Program prompt inventory.

## Decision Log

Decision: Treat this final slice as docs and validation only unless validation exposes a concrete local-runner bug.
Rationale: Planning brief 9 exists to close the Program after the behavior slices have landed. Widening this slice into more runtime migration would make the closeout ambiguous.
Date: 2026-05-14.

## Outcomes & Retrospective

This plan is complete. `packages/local-runner/README.md` now records the Node-first shipped runtime, monorepo source-mode Bun scripts, npm default for blank Worker installs, and the migrated Effect service boundaries. Broad local-runner validation passed, repo-level format, lint, and typecheck passed, and Program docs now lint cleanly with the local-runner packet under `docs/programs/completed/`.

## Context and Orientation

`packages/local-runner/README.md` is the durable operator-facing command map for the local runner and Worker Foundations installer. The completed Program is `docs/programs/completed/2026-05-13-local-runner-node-effect-migration/program.md`. The final Program packet moved to `completed/` only after this ExecPlan completed and the Program frontmatter, `Next Slice`, `Outcomes & Retrospective`, validation evidence, and indexes were made consistent.

### In Scope

Update `packages/local-runner/README.md` to state that the shipped CLI is Node-first, source-mode development still runs through the repo's Bun scripts, Worker blank installs default to npm, and the migrated Effect boundaries include process, Codex, runner events, workflow API, repository state, runner home, Codex config, Worker proof/event sync, and Program run-slice orchestration. Update this ExecPlan and the Program packet with validation evidence. Move the completed ExecPlan and Program folders when closeout is true.

### Out Of Scope

Do not change local-runner runtime behavior, command names, package-manager defaults, generated Worker output, package manifests, lockfiles, or Effect service implementations. Do not fix unrelated dirty Program packets or unrelated app files as part of this closeout.

## Plan of Work

First, make a small README edit near the top of `packages/local-runner/README.md` so future maintainers can see the Node/npm runtime contract and Effect service boundaries before the command map.

Second, run broad validation from the repository root. Start with full local-runner tests, then format, lint, typecheck, build, Worker compatibility smoke, and package smoke. Run plan, markdown, and Program validation for this Program, and record any unrelated blocker if one appears.

Third, update this ExecPlan and the Program packet with the exact evidence. If no local-runner work remains, fill completed frontmatter and retrospective, move this ExecPlan to `docs/exec-plans/completed/`, and move the Program folder to `docs/programs/completed/`.

## Milestones

Milestone 1: README hardening. Success means `packages/local-runner/README.md` names the Node-first shipped runtime and Effect service boundaries without changing command semantics.

Milestone 2: Broad validation. Success means local-runner tests, static checks, build, Worker compatibility smoke, package smoke, and docs validation pass.

Milestone 3: Program closeout. Success means no active child ExecPlan remains for this Program, the Program folder is under `docs/programs/completed/`, and the Program retrospective explains what actually changed.

## Concrete Steps

From the repository root, edit `packages/local-runner/README.md`.

Run validation:

    bun run --cwd packages/local-runner test
    bun run --cwd packages/local-runner format:check
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner build
    bun run --cwd packages/local-runner worker:compatibility-smoke
    bun run --cwd packages/local-runner package:smoke
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-runner-effect-completion-and-docs-hardening.md
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-runner-effect-completion-and-docs-hardening.md docs/programs/completed/2026-05-13-local-runner-node-effect-migration packages/local-runner/README.md
    bun run programs:lint
    git diff --check -- packages/local-runner docs/exec-plans/completed/2026-05-14-runner-effect-completion-and-docs-hardening.md docs/programs/completed/2026-05-13-local-runner-node-effect-migration MISTAKES.md

Move completed docs only after updating final frontmatter and retrospective.

## Validation and Acceptance

Feature: maintainers and future agents can install, validate, and reason about the Node-first local-runner package after the Effect migration. Risk: P1 core product, because the local runner executes Worker install, Program automation, proof commands, and package smoke. Source of truth: README command map, Program packet state, package smoke output, and local-runner validation results. Must work: CLI build, package smoke, Worker compatibility smoke, focused and full local-runner tests, docs lint for touched docs, and completed Program metadata. Must fail safely: unrelated dirty Program packet lint would be recorded instead of silently fixed in this slice. Tests: full package test, static checks, build, Worker compatibility smoke, package smoke, plan lint, markdown lint, Program lint. CI gate: baseline local-runner package validation and docs validation.

Acceptance requires README hardening, broad validation evidence, no active child ExecPlan for this Program, the Program moved to `completed/` with `status: complete`, and any skipped or blocked check explicitly recorded.

### Test Commands

    bun run --cwd packages/local-runner test
    bun run --cwd packages/local-runner format:check
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner build
    bun run --cwd packages/local-runner worker:compatibility-smoke
    bun run --cwd packages/local-runner package:smoke
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-runner-effect-completion-and-docs-hardening.md
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-runner-effect-completion-and-docs-hardening.md docs/programs/completed/2026-05-13-local-runner-node-effect-migration packages/local-runner/README.md
    bun run programs:lint
    git diff --check -- packages/local-runner docs/exec-plans/completed/2026-05-14-runner-effect-completion-and-docs-hardening.md docs/programs/completed/2026-05-13-local-runner-node-effect-migration MISTAKES.md

## Idempotence and Recovery

The README edit is plain text and can be rerun safely. Validation commands use temporary fixture repositories for package and Worker smoke. If a smoke command leaves temporary files, rerun it after cleaning only its reported temporary path. If Program closeout metadata is wrong, keep the Program under `active/` until `plans:lint`, packet lint for local-runner, and markdown lint agree.

## Artifacts and Notes

Important touched surfaces:

    packages/local-runner/README.md
    docs/exec-plans/completed/2026-05-14-runner-effect-completion-and-docs-hardening.md
    docs/programs/completed/2026-05-13-local-runner-node-effect-migration/program.md
    docs/programs/completed/2026-05-13-local-runner-node-effect-migration/current-planning-brief.txt
    docs/programs/completed/2026-05-13-local-runner-node-effect-migration/planning-brief-9.md

Validation evidence:

    bun run --cwd packages/local-runner test
    Test Files  27 passed | 2 skipped (29)
    Tests  248 passed | 7 skipped (255)

    bun run --cwd packages/local-runner format:check
    All matched files use the correct format.

    bun run --cwd packages/local-runner lint
    Found 0 warnings and 0 errors.

    bun run --cwd packages/local-runner typecheck
    exited with code 0

    bun run --cwd packages/local-runner build
    dist/cli.js  1.7mb
    Done

    bun run --cwd packages/local-runner worker:compatibility-smoke
    worker install compatibility smoke passed (11 scenarios)

    bun run --cwd packages/local-runner package:smoke
    package smoke passed

    bun run format
    Finished in 2772ms on 1016 files using 12 threads.

    bun lint
    Found 0 warnings and 0 errors.

    bun typecheck
    exited with code 0
    Note: the configured Next production compile hook created a PostHog release and uploaded source maps during this command.

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-runner-effect-completion-and-docs-hardening.md
    docs/exec-plans/completed/2026-05-14-runner-effect-completion-and-docs-hardening.md: ok

    bun run markdown:lint -- --paths docs/programs/README.md docs/programs/active/index.md docs/programs/completed/index.md docs/programs/completed/2026-05-13-local-runner-node-effect-migration
    docs/programs/README.md: ok
    docs/programs/active/index.md: ok
    docs/programs/completed/2026-05-13-local-runner-node-effect-migration/program.md: ok
    docs/programs/completed/index.md: ok

    bun run programs:lint
    Program docs, packets, and prompts: ok

    git diff --check -- <touched local-runner Program and package paths>
    exited with code 0

## Interfaces and Dependencies

The final docs depend on the current package scripts in `packages/local-runner/package.json`, the Program contract in `docs/programs/PROGRAMS.md`, and the ExecPlan contract in `docs/exec-plans/PLANS.md`. No new external setup, provider configuration, or dependency change is required for this closeout.
