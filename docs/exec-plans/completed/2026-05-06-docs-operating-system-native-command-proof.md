---
title: Docs Operating System Native Command Proof
status: complete
created_at: 2026-05-06
completed_at: 2026-05-06
summary: Add a shared docs operating-system command that proves an existing repo-native validation script without installing app-stack conventions.
post_build_recap: Added native-command-proof to the shared docs operating-system command surface, with pass, failed, setup-blocked, and missing-script proof behavior plus CLI help and focused tests.
program_id: worker-grade-docs-operating-system-adoption
planning_brief: docs/programs/completed/2026-05-06-worker-grade-docs-operating-system-adoption/planning-brief-4.md
read_when:
  - Resuming native command proof implementation.
  - Changing docs operating-system native validation behavior.
  - Closing the Worker-grade docs operating-system Program.
---

# Docs Operating System Native Command Proof

This document is a living execution plan for the native command proof slice of the Worker-grade docs operating-system Program.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The portable docs operating-system can now install docs scripts, refresh lockfiles safely, prove the package artifact, and refresh quality evidence. The final gap is native command proof: a customer repo should be able to use the installed `ship-by-sunday` binary to run the repo's own broad validation script and record an honest pass, failure, or setup blocker.

After this slice, `ship-by-sunday docs-operating-system native-command-proof --repo <target>` selects one existing package script from a conservative priority list, runs it through the detected package manager, prints only sync-safe proof status, and returns zero only when the native script passes. It does not add package scripts or impose a new app-stack command convention.

## Progress

- [x] 2026-05-06 EDT: Implemented native command proof and focused tests.
- [x] 2026-05-06 EDT: Updated Program/workflow docs and completed the Program after focused validation.
- [x] 2026-05-06 EDT: Focused command tests, package-script and lockfile regression tests, build, package smoke, lint, typecheck, and format check passed.

## Surprises & Discoveries

The package command needed its own privacy filter for package-manager script echoes. `npm run` can echo the script line before running it, so the proof summary now ignores lines beginning with `>` and reports only classified setup or failure summaries.

## Decision Log

Decision: Expose native proof as an explicit package-owned command, not a generated root package script.
Rationale: The Program should prove existing repo commands without wiring app-stack conventions into package.json or pretending every repo runs like Worker.
Date: 2026-05-06

Decision: Use the existing broad-gate priority order from docs-spine apply proof.
Rationale: `gate`, `check`, `ci`, `proof`, `test`, `lint`, `typecheck`, and `build` are already the conservative order used to choose one broad proof command when several native scripts exist.
Date: 2026-05-06

## Outcomes & Retrospective

This plan is complete. `ship-by-sunday docs-operating-system native-command-proof --repo <target>` now reads root package script names without serializing script bodies, selects one existing broad validation script, runs it through the detected package manager with a bounded timeout, and reports `passed`, `failed`, or `blocked`.

The command returns zero only on passed proof. Missing package metadata, no recognized script, non-string selected script values, missing modules, missing dependencies, and command-not-found setup errors are blocked proof. Ordinary assertion, lint, test, typecheck, or build failures are failed proof. The Program is now complete; publication, signing, release automation, CI/provider setup, runtime bootstrap, and app-stack command conventions remain separate future authority classes.

## Context and Orientation

The command implementation lives in `packages/local-runner/src/commands/docs-operating-system.ts`. The top-level CLI help lives in `packages/local-runner/src/cli.ts`. Focused command tests live in `packages/local-runner/tests/docs-operating-system-command.test.ts`, and CLI help assertions live in `packages/local-runner/tests/cli-help.test.ts`.

Native proof means running an existing root `package.json` script through the detected package manager. It does not mean installing dependencies, starting an app server, editing package scripts, writing runtime state, configuring CI/providers, or pushing branches.

### In Scope

Add `native-command-proof [--repo <path>]` under the shared docs operating-system command surface. It should detect Bun, pnpm, Yarn, or npm from lockfiles, read root `package.json` scripts without serializing script bodies, choose one existing script from the accepted priority order, run it with a bounded timeout, classify status as passed, failed, or blocked, and print only command name, status, and a concise sanitized summary.

Update CLI help, focused tests, workflow packet docs, this Program, and this ExecPlan. If the Program is complete after validation, move the Program folder to completed and update indexes.

### Out Of Scope

Do not add a new canonical root package script, mutate package manifests, mutate lockfiles, install dependencies, publish packages, configure CI/providers, run app servers, add runtime state, edit root instructions, push branches, open pull requests, or modify unrelated Telegram/support/homepage worktree changes.

## Plan of Work

First update `packages/local-runner/src/commands/docs-operating-system.ts` with the new subcommand. Add small helpers for package-manager detection, root package script reading, native script selection, package-manager-specific command construction, command-output summarization, and setup-blocker classification. Keep the helper output sync-safe and avoid printing script bodies.

Then update `packages/local-runner/src/cli.ts` and `packages/local-runner/tests/cli-help.test.ts` so the top-level help names the new command. Extend `packages/local-runner/tests/docs-operating-system-command.test.ts` to cover a passing native script, a setup-shaped blocked failure, an ordinary failed script, and a repo with no recognized native script.

Finally update `docs/internal/workflow-packets.md` and the owning Program. If validation passes and no Program outcomes remain, complete this ExecPlan and move the Program packet to `docs/programs/completed/`.

## Milestones

Milestone one is command behavior. At the end, the new subcommand runs one existing native package script and returns pass, failed, or blocked with a concise summary.

Milestone two is privacy and scope proof. At the end, tests prove the output does not include package script bodies or local absolute paths and that the command does not add or edit package scripts.

Milestone three is Program closure. At the end, durable docs record native command proof as shipped and the Program is moved to completed if every Program outcome is closed.

## Concrete Steps

Work from `/Users/bazelrex/Developer/ship-by-sunday`.

Inspect the command and tests:

    sed -n '1,780p' packages/local-runner/src/commands/docs-operating-system.ts
    sed -n '1,380p' packages/local-runner/tests/docs-operating-system-command.test.ts
    sed -n '1,80p' packages/local-runner/src/cli.ts
    sed -n '1,80p' packages/local-runner/tests/cli-help.test.ts

Patch the command, help text, and focused tests:

    packages/local-runner/src/commands/docs-operating-system.ts
    packages/local-runner/src/cli.ts
    packages/local-runner/tests/docs-operating-system-command.test.ts
    packages/local-runner/tests/cli-help.test.ts

Then update durable docs:

    docs/internal/workflow-packets.md
    docs/programs/completed/2026-05-06-worker-grade-docs-operating-system-adoption/program.md
    docs/programs/active/index.md
    docs/programs/completed/index.md
    docs/exec-plans/completed/2026-05-06-docs-operating-system-native-command-proof.md

## Validation and Acceptance

Acceptance requires the command tests to prove passing, failing, blocked, and no-script behavior. A setup blocker must be classified as blocked, not failed. An ordinary validation failure must be failed, not blocked. Successful proof must return zero; failed and blocked proof must return non-zero. Output must not include root package script bodies, local absolute paths, raw logs, raw source, secrets, dependency versions, or Codex transcripts.

Program closure requires all child ExecPlans to be complete, the Program retrospective to name shipped outcomes and accepted residual risks, and the active/completed Program indexes to point at the final completed Program location.

### Test Commands

- bun run --cwd packages/local-runner test -- docs-operating-system-command.test.ts cli-help.test.ts
- bun run --cwd packages/local-runner test -- docs-operating-system-package-script-patching.test.ts docs-operating-system-lockfile-refresh.test.ts
- bun run --cwd packages/local-runner build
- bun run --cwd packages/local-runner package:smoke
- bun run --cwd packages/local-runner lint
- bun run --cwd packages/local-runner typecheck
- bun run --cwd packages/local-runner format:check
- bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-06-docs-operating-system-native-command-proof.md
- bun run programs:lint
- bun run markdown:lint -- --paths docs/programs/completed/2026-05-06-worker-grade-docs-operating-system-adoption docs/exec-plans/completed/2026-05-06-docs-operating-system-native-command-proof.md docs/internal/workflow-packets.md docs/programs/active/index.md docs/programs/completed/index.md
- git diff --check

## Idempotence and Recovery

The command itself is read-only except for whatever the selected native package script does. If a native script writes files, the proof command should report the script status but this shared command does not clean or bless those writes. Operators should inspect the target repo's Git status after running native proof.

If package metadata is missing, invalid, or has no recognized native script, rerun after the repo owner adds or repairs the target repo's own validation script. Do not add scripts through this command.

## Artifacts and Notes

Expected passing output:

    Native command: npm run gate
    Status: passed

Expected blocked output:

    Native command: npm run gate
    Status: blocked
    Summary: exit 1: Cannot find package happy-dom

Validation evidence from implementation:

    bun run --cwd packages/local-runner test -- docs-operating-system-command.test.ts cli-help.test.ts
    Test Files  2 passed (2)
    Tests  12 passed (12)

    bun run --cwd packages/local-runner test -- docs-operating-system-package-script-patching.test.ts docs-operating-system-lockfile-refresh.test.ts
    Test Files  2 passed (2)
    Tests  19 passed (19)

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

This slice depends on Node filesystem APIs for reading root `package.json`, `runBoundedProcess` for bounded command execution, and the existing package-manager command forms `bun run <script>`, `pnpm run <script>`, `yarn <script>`, and `npm run <script>`.
