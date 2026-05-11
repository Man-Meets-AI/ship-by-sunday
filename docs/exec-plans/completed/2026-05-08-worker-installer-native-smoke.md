---
title: Prove Worker Installer Native Smoke
status: complete
created_at: 2026-05-08
completed_at: 2026-05-08
summary: Add a native distributable smoke path for shipbysunday install and prove it against disposable repos beyond runner-test.
post_build_recap: Package smoke now compiles a standalone shipbysunday CLI, runs a native actual install into a disposable repo, and dry-runs a second pnpm-shaped disposable repo with isolated Worker license state.
program_id: sbs-worker-foundations-installer
planning_brief: docs/programs/completed/2026-05-07-sbs-worker-foundations-installer/planning-brief-2.md
read_when:
  - Changing native or distributable packaging for the local-runner CLI.
  - Verifying Worker Foundations installer release readiness.
  - Resuming the Worker Foundations installer Program after Bun provisioning.
---

# Prove Worker Installer Native Smoke

This is a living execution plan for the final distribution/smoke slice of the Worker Foundations installer Program.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The installer now works from source and packed package smoke. The Program-level acceptance also requires a native installer proof and broader real target-repo smoke. This slice should add the smallest durable native-distribution proof available in the local-runner package and use it to exercise `shipbysunday install` against disposable repos without touching Arena CRM.

After this slice, the Program should have evidence that the distributable CLI can reach the Worker installer command outside the source `bun packages/local-runner/src/cli.ts` path, and that the installer behaves correctly in at least one additional non-Arena repo shape.

## Progress

- [x] 2026-05-08: Created this Program-linked child ExecPlan after completing the Worker-managed Bun provisioning fallback slice.
- [x] 2026-05-08: Added native compiled CLI smoke support inside `packages/local-runner/tests/package-smoke.ts`.
- [x] 2026-05-08: Smoked `shipbysunday install` through the native artifact against one disposable actual-install repo and one pnpm-shaped dry-run repo.
- [x] 2026-05-08: Confirmed Program-level acceptance is true after native smoke, runner-test smoke, package smoke, and completed child slices.

## Surprises & Discoveries

The local Bun toolchain can compile the local-runner CLI with `bun build --compile`, so native proof did not require new dependencies or a release pipeline.

## Decision Log

Decision: Keep Arena CRM untouched.
Rationale: The user explicitly said Arena is in a good state. This slice should use `~/Developer/runner-test` and other disposable test projects.
Date: 2026-05-08

Decision: Prefer the smallest native proof that the repo can run locally.
Rationale: Program acceptance needs native proof, not a full notarized release pipeline. Signing, notarization, publishing, and update channels can stay outside this Program unless acceptance proves they are required now.
Date: 2026-05-08

## Outcomes & Retrospective

This plan is complete. `package:smoke` now builds a standalone native `shipbysunday` executable in a temporary directory, runs `shipbysunday install --yes --json --no-kickoff` through that artifact against a disposable committed repo, verifies the install report exists, and verifies the repo worktree is clean after the proof-gated install commit.

The same native artifact also runs `shipbysunday install --dry-run --json --no-kickoff` against a second disposable repo with `packageManager: pnpm@9.12.0`, proving a non-default package-manager shape without requiring pnpm to be installed or mutating the repo. Arena CRM was not touched.

This closes the final Program acceptance gap, so the Program can move to completed after Program docs and indexes are updated.

## Context and Orientation

The local-runner package is `packages/local-runner`. Its package scripts currently include `build` and `package:smoke`. The CLI entry is `packages/local-runner/src/cli.ts`, built to `packages/local-runner/dist/cli.js`. Package distribution smoke lives in `packages/local-runner/tests/package-smoke.ts`.

The existing package smoke proves `bunx`, `npx`, installed docs commands, packed `shipbysunday install --dry-run --json --no-kickoff`, and packed `shipbysunday install --yes --json --no-kickoff`. This slice should add the native/distributable proof that Program acceptance still lacks.

### In Scope

Add a native build or native smoke command that is runnable on the current machine. Prove `shipbysunday install` through that artifact against disposable repos, including one clean minimal repo and one additional simple repo shape. Keep license state isolated with `SHIPBYSUNDAY_WORKER_HOME`.

Update Program truth and complete the Program only if all initiative-level acceptance items are actually true.

### Out Of Scope

Do not touch Arena CRM. Do not add signing, notarization, release publishing, updater channels, external account setup, or CI mutation unless the native smoke cannot be meaningful without them.

## Plan of Work

First, inspect the package build scripts and decide whether to add a dedicated native build script, a native smoke script, or extend `package:smoke` with a native binary proof.

Next, implement the smallest durable command and smoke coverage. The smoke should create disposable repos under `/tmp` or `~/Developer`, create isolated Worker homes with valid test licenses, and run `shipbysunday install --dry-run --json --no-kickoff` through the native/distributable artifact.

Then, run full local-runner validation, Program docs validation, and `git diff --check`.

Finally, evaluate Program acceptance. If native proof and additional smoke close the remaining gaps, move this ExecPlan and the Program to completed. If not, create the next child ExecPlan before stopping.

## Milestones

Milestone 1 is native/distributable proof implementation. Success means the local-runner package has a command that produces and exercises the artifact.

Milestone 2 is disposable repo smoke. Success means at least two disposable repos prove the installer command shape without touching Arena CRM.

Milestone 3 is Program closeout decision. Success means the Program either moves to completed with a real retrospective or remains active with the next child ExecPlan created for a concrete remaining blocker.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Inspect package scripts:

    sed -n '1,160p' packages/local-runner/package.json
    sed -n '1,260p' packages/local-runner/tests/package-smoke.ts

Edit only the local-runner package and Program docs needed for native smoke.

Run validation:

    bun run --cwd packages/local-runner test
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner format:check
    bun run --cwd packages/local-runner build
    bun run --cwd packages/local-runner package:smoke
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-08-worker-installer-native-smoke.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-08-worker-installer-native-smoke.md docs/programs/completed/2026-05-07-sbs-worker-foundations-installer/program.md
    git diff --check

## Validation and Acceptance

Acceptance requires a native or native-equivalent distributable artifact to exercise `shipbysunday install` successfully against disposable repos with isolated Worker homes. The smoke must not mutate Arena CRM. If this completes all Program-level acceptance bullets, the Program must move to completed with a retrospective and active/completed indexes updated.

### Test Commands

Run full package validation:

    bun run --cwd packages/local-runner test
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner format:check
    bun run --cwd packages/local-runner build
    bun run --cwd packages/local-runner package:smoke

Completion result: full tests passed with 24 files passed and 2 skipped; lint found 0 warnings and 0 errors; typecheck passed; format:check passed; build produced `dist/cli.js`; package smoke passed, including packed mutating install, native actual install, and pnpm-shaped dry-run.

Run docs validation:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-08-worker-installer-native-smoke.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-08-worker-installer-native-smoke.md docs/programs/completed/2026-05-07-sbs-worker-foundations-installer/program.md
    git diff --check

## Idempotence and Recovery

All smoke repos should be disposable. If a smoke run fails after creating files, inspect that repo, record the failure, and create a fresh disposable repo for the next run instead of reusing a corrupted state.

## Artifacts and Notes

The prior Bun provisioning slice completed at `docs/exec-plans/completed/2026-05-08-worker-installer-bun-provisioning.md`.

## Interfaces and Dependencies

This slice depends on Bun build capabilities, the existing CLI package scripts, package smoke infrastructure, and Worker installer dry-run behavior.
