---
title: Add Worker Installer Bun Provisioning Fallback
status: complete
created_at: 2026-05-08
completed_at: 2026-05-08
summary: Let shipbysunday install prepare a Worker-managed Bun runtime when no usable local Bun source exists.
post_build_recap: The installer now supports a download-origin Worker-managed Bun fallback, validates the prepared executable before repo writes, keeps download URLs and absolute paths out of JSON/report output, and has focused success/failure coverage for no-local-Bun paths.
program_id: sbs-worker-foundations-installer
planning_brief: docs/programs/completed/2026-05-07-sbs-worker-foundations-installer/planning-brief-2.md
read_when:
  - Changing Worker-managed Bun toolchain provisioning.
  - Testing shipbysunday install on machines without a global Bun runtime.
  - Resuming the Worker Foundations installer Program after checklist polish.
---

# Add Worker Installer Bun Provisioning Fallback

This is a living execution plan for removing the last local Bun prerequisite from the Worker Foundations installer path.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The installer can currently use an existing Worker-managed Bun, a compatible `bun` on `PATH`, an explicit `SHIPBYSUNDAY_WORKER_BUN`, or the current Bun runtime. That is enough for development and package smoke, but it is not enough for the customer distribution promise: a native `shipbysunday` installer should be able to prepare the private Worker runtime on a machine that has no global Bun and no local Bun executable to copy.

After this slice, `shipbysunday install` should have a deterministic fallback that downloads or unpacks a pinned Bun runtime into `<worker-home>/toolchains/bun/bin/bun`, verifies it by running `--version`, and then uses it for `apps/worker` proof. Reports and JSON output should continue to describe only sync-safe origin/status fields, not absolute paths or download URLs with secrets.

## Progress

- [x] 2026-05-08: Created this Program-linked child ExecPlan after completing the grouped interactive checklist slice.
- [x] 2026-05-08: Implemented a bounded Worker-managed Bun download fallback with sync-safe `origin: download` reporting.
- [x] 2026-05-08: Added focused tests for no-PATH/no-explicit-Bun fallback success and invalid downloaded Bun failure before repo mutation.
- [x] 2026-05-08: Ran local-runner validation, package smoke, and a fresh `runner-test` dry-run.

## Surprises & Discoveries

The installer already validated the Worker-managed Bun executable after copying local sources. Reusing that validation for downloads kept the failure path simple and ensured invalid downloads fail before branch creation or repo writes.

## Decision Log

Decision: Keep downloaded or bundled Bun private to the Worker home.
Rationale: The target app should not need global Bun, root dependencies, or app package-manager changes just because Worker Foundations is Bun-first internally.
Date: 2026-05-08

Decision: Preserve sync-safe reporting.
Rationale: Toolchain provisioning must not leak absolute paths, signed URLs, local cache paths, or machine-specific details into tracked reports or JSON output.
Date: 2026-05-08

## Outcomes & Retrospective

This plan is complete. The Worker toolchain plan now supports `origin: download` when no managed, PATH, explicit, or current-runtime Bun source should be used. A Worker-specific `SHIPBYSUNDAY_WORKER_BUN_DOWNLOAD_URL` override gives tests and support smoke a deterministic download source, while the default fallback resolves a pinned Bun release asset for the current platform.

Provisioning writes the downloaded executable or extracts a zip archive into the Worker home, sets executable permissions, and validates the resulting managed Bun with `--version` before repo mutation continues. Failed downloads or invalid executables return a failed install result without creating `apps/worker`, `docs/worker`, branch changes, or tracked reports. JSON output records only `origin: download` and the stable Worker-managed target ref; it does not include the URL or local absolute paths.

The Program remains active for native executable packaging and broader real-project smoke.

## Context and Orientation

The Worker install workflow lives in `packages/local-runner/src/workflows/worker-foundations-install/workflow.ts`. The toolchain inspection and preparation boundary is `inspectWorkerBunToolchain`, `resolveProvisionableBunCandidate`, `ensureWorkerBunToolchain`, and `resolveManagedBunPath`. Shared environment variable names live in `packages/local-runner/src/workflows/worker-foundations-install/manifest.ts`. Focused tests live in `packages/local-runner/tests/worker-foundations-install.test.ts`.

The current plan model supports toolchain statuses `available`, `managed`, `provisionable`, and `blocked`, with origins `path`, `worker-managed`, `current-runtime`, `explicit-env`, and `missing`. This slice may need a new origin such as `download` or `bundled`, but it should avoid widening the public JSON schema beyond what the installer can prove.

### In Scope

Add a deterministic fallback for preparing a Worker-managed Bun executable when no managed, PATH, explicit, or current-runtime Bun source is usable. Add tests that simulate that path without depending on the public internet by using a local fixture or override.

Validate the prepared executable with `--version` before repo writes continue.

### Out Of Scope

Do not build signed native installers, publish binaries, add updater infrastructure, alter `apps/worker` package semantics, or require a real public Bun download during tests. Do not store downloaded archives or executable paths in tracked target-repo reports.

## Plan of Work

First, inspect the existing toolchain code and choose the smallest schema addition needed to represent the fallback origin. Prefer one explicit Worker-specific environment override for tests and support smoke over a broad config bag.

Next, implement the fallback in the toolchain preparation boundary. The implementation should create the Worker toolchain directory, fetch or unpack the executable, set executable permissions, validate `--version`, and fail before repo mutation if validation does not pass.

Then, add focused tests. One test should remove Bun from `PATH`, avoid explicit Bun, provide the deterministic fallback source, and prove the install can proceed and dogfood Worker proof. Another should provide an invalid fallback and prove the installer blocks or fails before repo mutation without writing tracked files.

Finally, run package validation and a disposable repo smoke. Keep `arena-crm` untouched.

## Milestones

Milestone 1 is fallback design and schema. Success means the install plan can distinguish a fallback-provisioned Worker-managed Bun without leaking paths.

Milestone 2 is implementation and tests. Success means no-PATH/no-explicit-Bun fixture coverage can install using the fallback and invalid fallback coverage blocks before repo mutation.

Milestone 3 is Program truth. Success means this ExecPlan moves to completed, the Program ledger names the completed slice, and the remaining Program gaps are native packaging and broader real-project smoke.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Inspect the toolchain boundary:

    rg -n "WorkerBunToolchainPlan|inspectWorkerBunToolchain|ensureWorkerBunToolchain|resolveProvisionableBunCandidate|resolveManagedBunPath" packages/local-runner/src/workflows/worker-foundations-install/workflow.ts

Edit the implementation and tests:

    packages/local-runner/src/workflows/worker-foundations-install/manifest.ts
    packages/local-runner/src/workflows/worker-foundations-install/workflow.ts
    packages/local-runner/tests/worker-foundations-install.test.ts

Run focused validation:

    bun run --cwd packages/local-runner test -- worker-foundations-install.test.ts codex-config-manager.test.ts cli-help.test.ts
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner format:check

Before completing this plan, run:

    bun run --cwd packages/local-runner test
    bun run --cwd packages/local-runner build
    bun run --cwd packages/local-runner package:smoke
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-08-worker-installer-bun-provisioning.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-08-worker-installer-bun-provisioning.md docs/programs/completed/2026-05-07-sbs-worker-foundations-installer/program.md
    git diff --check

## Validation and Acceptance

Acceptance requires `shipbysunday install` to proceed on a test path where no Bun is on `PATH`, no explicit `SHIPBYSUNDAY_WORKER_BUN` is provided, and the fallback source is the only usable Bun source. The resulting plan must show a Worker-managed/provisionable toolchain state without leaking absolute paths. Invalid fallback sources must fail before target repo mutation. Existing managed, PATH, explicit, and current-runtime paths must keep working.

### Test Commands

Run focused tests:

    bun run --cwd packages/local-runner test -- worker-foundations-install.test.ts codex-config-manager.test.ts cli-help.test.ts

Completion result: Test Files 3 passed (3), Tests 25 passed (25).

Run broad package checks:

    bun run --cwd packages/local-runner test
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner format:check
    bun run --cwd packages/local-runner build
    bun run --cwd packages/local-runner package:smoke

Completion result: full tests passed with 24 files passed and 2 skipped; lint found 0 warnings and 0 errors; typecheck passed; format:check passed; build produced `dist/cli.js`; package smoke passed.

Run Program and docs validation:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-08-worker-installer-bun-provisioning.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-08-worker-installer-bun-provisioning.md docs/programs/completed/2026-05-07-sbs-worker-foundations-installer/program.md
    git diff --check

Read-only runner-test smoke:

    env SHIPBYSUNDAY_WORKER_HOME=/tmp/sbs-runner-test-worker-home-BpQhyK bun packages/local-runner/src/cli.ts install --repo /Users/bazelrex/Developer/runner-test --dry-run --json --no-kickoff

Completion result: `ready` with no blockers.

## Idempotence and Recovery

If fallback provisioning is interrupted, the next run should validate the managed Bun path with `--version`. If the file is missing or invalid, the installer should repair it from the fallback source or block before repo writes. Existing valid Worker-managed Bun should be reused.

## Artifacts and Notes

The grouped checklist slice completed at `docs/exec-plans/completed/2026-05-08-worker-installer-interactive-checklist.md`.

## Interfaces and Dependencies

This slice depends on Worker home resolution, bounded process execution, filesystem permissions for executable files, and the existing proof commands that run through `scripts/run-worker.sh`.
