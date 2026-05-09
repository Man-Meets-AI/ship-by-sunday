---
title: Ship Worker Install Recipient Ergonomics
status: complete
created_at: 2026-05-09
completed_at: 2026-05-09
summary: Make Worker install produce Bun-default blank repos plus recipient-grade README, AGENTS, and direct help output.
post_build_recap: Worker install now creates Bun-default blank repositories, defaults unclaimed package roots to Bun, writes managed README and AGENTS handoff sections, exposes Worker-specific run-worker help, and proves those surfaces through compatibility smoke.
program_id: worker-install-compatibility-matrix
planning_brief: docs/programs/active/2026-05-09-worker-install-compatibility-matrix/planning-brief-2.md
read_when:
  - Implementing blank-slate Worker install support.
  - Updating generated Worker README or AGENTS output.
  - Validating recipient-ready Worker install behavior.
---

# Ship Worker Install Recipient Ergonomics

This is a living execution plan for making Worker Foundations install more usable for a person or agent who receives the target repository after install.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

After this slice, `shipbysunday install` should work on blank repositories and on unclaimed JavaScript repositories without forcing npm. A recipient should see a root README and AGENTS instructions that explain the Worker command surface, and `./scripts/run-worker.sh --help` should show Worker-specific help instead of generic Bun help.

## Progress

- [x] 2026-05-09: Created planning brief 2 and this active child ExecPlan.
- [x] 2026-05-09: Implemented Bun defaults for blank and unclaimed repositories.
- [x] 2026-05-09: Added a managed root README section with recipient command and handoff guidance.
- [x] 2026-05-09: Strengthened root AGENTS guidance for future Worker agents.
- [x] 2026-05-09: Made `./scripts/run-worker.sh --help` and `-h` print Worker-specific help.
- [x] 2026-05-09: Flipped blank-slate compatibility smoke to install success and added the unclaimed package scenario.
- [x] 2026-05-09: Ran validation and completed this plan.

## Surprises & Discoveries

The existing compatibility smoke already had the right fresh-clone and fake-Codex kickoff shape, so the recipient proof could be extended in place instead of creating a second harness. The final compatibility smoke proved six installing scenarios and fake kickoff:

    blank-slate: ok
    minimal-unclaimed-package: ok
    minimal-bun-package: ok
    next-npm-single-app: ok
    next-pnpm-monorepo: ok
    bun-different-version: ok
    fake-codex-kickoff: ok
    worker install compatibility smoke passed (6 scenarios)

## Decision Log

Decision: Blank and unclaimed repositories default to Bun.
Rationale: The product prefers Bun, and repos without an explicit package-manager identity are safe places for the installer to choose a default.
Date: 2026-05-09

Decision: Existing explicit package-manager identities remain preserved.
Rationale: The Worker internals can stay Bun-backed through `scripts/run-worker.sh` without rewriting a customer's npm, pnpm, yarn, or Bun project identity.
Date: 2026-05-09

Decision: The generated README uses the same managed-section markers as root AGENTS.
Rationale: Existing recipient README content must be preserved while still letting reruns replace the Worker-owned handoff block idempotently.
Date: 2026-05-09

## Outcomes & Retrospective

This slice delivered the recipient-ready install surface described in planning brief 2. Blank Git repositories no longer block on missing `package.json`; install creates a private root package with `packageManager: bun@1.3.5` and Worker root scripts. Existing root packages without explicit package-manager identity or lockfiles now default to Bun, while explicit Bun, npm, and pnpm fixture identities remain preserved.

The installer now writes managed root README and AGENTS sections, preserves owner content outside those managed blocks, and exposes Worker-specific help from `./scripts/run-worker.sh --help`. The compatibility smoke asserts the README, AGENTS, direct help, package-manager commands, fresh-clone behavior, and fake-Codex kickoff. Polyglot, conflict, upgrade, and Arena-shaped fixtures remain intentionally deferred to the next Program slice.

## Context and Orientation

The Worker installer is implemented in `packages/local-runner/src/workflows/worker-foundations-install/workflow.ts`. It inspects a target repo, builds an install plan, writes root package scripts and managed files, runs installed proof commands, writes `docs/worker/install-report.md`, optionally kicks off Codex, and commits the tracked install output.

The compatibility harness is `packages/local-runner/tests/worker-install-compatibility-smoke.ts`. It is the behavioral acceptance surface for this slice because it installs into temporary repositories and then proves direct commands, root package-manager commands, fresh clone behavior, and fake-Codex kickoff.

### In Scope

Change Worker install so blank repositories get a root `package.json` with Bun defaults, unclaimed repositories default to Bun, generated root README and AGENTS content is recipient-grade, direct Worker help works, and compatibility smoke proves the behavior.

### Out Of Scope

Do not add conflict and upgrade fixtures beyond README managed-section preservation. Do not add polyglot or Arena-shaped fixtures in this slice. Do not change Codex kickoff semantics except through generated instructions and existing fake-Codex proof.

## Plan of Work

First, change target repo inspection and apply behavior so a missing `package.json` is not a blocker. The apply phase should create a minimal private root package manifest with `packageManager: bun@<managed version>` and then add Worker scripts. Existing `package.json` files without package-manager or lockfile evidence should also default to Bun by receiving a `packageManager` field.

Second, add a root README managed section to the Worker managed file set. The README should preserve existing owner content and append or replace only the Worker-managed block. The block should name the native package-manager commands for the target repo, direct executable fallback, install report, Program/ExecPlan locations, and local `.worker/` boundary.

Third, update the root AGENTS managed section with stronger instructions for future agents. It should tell agents to read README, install report, active Program, and active ExecPlan; prefer native root package-manager scripts; use `./scripts/run-worker.sh` directly when needed; and keep local proof sync-safe.

Fourth, update `scripts/run-worker.sh` and the installed Worker CLI help so `./scripts/run-worker.sh --help` and `./scripts/run-worker.sh -h` show Worker-specific usage.

Fifth, flip the `blank-slate` compatibility scenario to install success, add an unclaimed package scenario, and assert README, AGENTS, and help output from installed repos and fresh clones.

## Milestones

Milestone 1 lands installer policy and generated templates. Success means blank and unclaimed repo dry-runs report Bun proof commands and installs write the expected root package, README, AGENTS, scripts, and Worker files.

Milestone 2 lands recipient proof. Success means compatibility smoke proves blank-slate install success, unclaimed package install success, root README content, AGENTS content, direct help output, fresh clone commands, and fake-Codex kickoff.

Milestone 3 closes the slice. Success means local-runner tests, compatibility smoke, package smoke, lint, typecheck, format check, Program lint, ExecPlan lint, markdown lint, and `git diff --check` pass.

## Concrete Steps

Run the focused smoke before and after changes when diagnosing behavior:

    bun run --cwd packages/local-runner worker:compatibility-smoke

Run the local runner package validation:

    bun run --cwd packages/local-runner test
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner format:check
    bun run --cwd packages/local-runner build
    bun run --cwd packages/local-runner package:smoke

Run Program and plan validation:

    bun run programs:lint
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-09-worker-install-recipient-ergonomics.md
    bun run markdown:lint -- --paths docs/programs/active/2026-05-09-worker-install-compatibility-matrix docs/exec-plans/completed/2026-05-09-worker-install-recipient-ergonomics.md
    git diff --check

## Validation and Acceptance

Acceptance requires blank-slate compatibility smoke to install successfully through Bun, unclaimed package repositories to default to Bun, explicit npm/pnpm/Bun scenarios to remain preserved, generated README and AGENTS content to be asserted by smoke, direct Worker help to be asserted by smoke, and the normal local-runner and docs validation commands to pass.

### Test Commands

Run the Worker compatibility smoke:

    bun run --cwd packages/local-runner worker:compatibility-smoke

Run local runner validation:

    bun run --cwd packages/local-runner test
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner format:check
    bun run --cwd packages/local-runner build
    bun run --cwd packages/local-runner package:smoke

Run Program and plan validation:

    bun run programs:lint
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-09-worker-install-recipient-ergonomics.md
    bun run markdown:lint -- --paths docs/programs/active/2026-05-09-worker-install-compatibility-matrix docs/exec-plans/completed/2026-05-09-worker-install-recipient-ergonomics.md
    git diff --check

## Idempotence and Recovery

The installer must remain safe to rerun. Existing managed README and AGENTS sections should be replaced in place, not duplicated. Existing owner README and AGENTS content must remain outside managed blocks. If validation fails after creating temporary fixture repositories, rerun the smoke because each run creates fresh repositories under the system temporary directory.

## Artifacts and Notes

The main code artifacts are `packages/local-runner/src/workflows/worker-foundations-install/workflow.ts` and `packages/local-runner/tests/worker-install-compatibility-smoke.ts`. The Program artifacts are `docs/programs/active/2026-05-09-worker-install-compatibility-matrix/planning-brief-2.md` and `docs/exec-plans/completed/2026-05-09-worker-install-recipient-ergonomics.md`.

## Interfaces and Dependencies

This slice depends on the Worker-managed Bun version constant, root package-manager detection, managed section replacement helpers, the installed shell launcher, the installed Worker CLI source template, and the compatibility harness. The package-manager command surface remains the root scripts `programs:lint`, `plans:lint`, `markdown:lint`, `docs:validate`, `program:write-child-plan`, `execplan:write`, `execplan:grill`, `execplan:build`, `execplan:validate`, and `worker:test`.
