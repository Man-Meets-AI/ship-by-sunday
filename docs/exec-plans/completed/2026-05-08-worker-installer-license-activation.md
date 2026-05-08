---
title: Harden Worker Installer License Activation
status: complete
created_at: 2026-05-08
completed_at: 2026-05-08
summary: Make shipbysunday install activate a missing Worker license through a browser/device flow before mutating the target repo.
post_build_recap: Browser/device license activation now validates and persists v1 machine licenses under the Worker home, interactive missing-license installs can activate before repo mutation, noninteractive modes block honestly, packed package smoke covers `shipbysunday install`, and a fresh runner-test repository installed successfully with proof-gated commit.
program_id: sbs-worker-foundations-installer
planning_brief: docs/programs/completed/2026-05-07-sbs-worker-foundations-installer/planning-brief-2.md
read_when:
  - Resuming browser/device license activation for the Worker Foundations installer.
  - Changing Worker machine license storage, activation polling, package smoke, or install preflight behavior.
  - Verifying whether the Worker Foundations installer can move past the missing-license customer blocker.
---

# Harden Worker Installer License Activation

This is a living execution plan for hardening the customer license activation path in the Worker Foundations installer.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The first Worker Foundations installer can install visible repo-local Worker source, but a real customer who has no `~/.worker/license.json` is still blocked with setup prose instead of getting the browser/device activation flow promised by the Program. After this slice, `shipbysunday install` should validate the target repo, start a device activation with the Ship by Sunday service when the local Worker license is missing, open or print a browser URL, poll for the resulting machine credential, persist only the machine-level license under the Worker home, and then continue the existing install path without storing license material in the target repo.

The observable result is that an interactive install can move from missing license to installed Worker Foundations without manual file creation, while `--yes`, `--json`, and `--dry-run` remain deterministic and sync-safe. The package smoke should also prove that the built and packed CLI can exercise the Worker install command shape, not only the older setup-pair and docs command paths.

## Progress

- [x] 2026-05-08: Created this Program-linked child ExecPlan from `planning-brief-2.md` after confirming the first installer ExecPlan is completed and the active Program names browser/device activation as the next slice.
- [x] 2026-05-08: Ran the existing focused baseline before edits: Worker install, Codex config manager, CLI help, first child ExecPlan lint, and Program lint all passed.
- [x] 2026-05-08: Implemented the Worker license activation client, persisted v1 license validator, browser opener guard, bounded polling, and noninteractive blockers.
- [x] 2026-05-08: Added focused tests for activation success, status-only legacy license rejection, missing-license noninteractive blocking, JSON noninteraction, dry-run read-only behavior, and packed package install coverage.
- [x] 2026-05-08: Ran focused and package validation, then smoke-tested a fresh `~/Developer/runner-test` repository from empty-blocked state through a proof-gated install commit.

## Surprises & Discoveries

The previous review fixes are present in the current baseline. The existing test suite already proves parsed license rejection for expired licenses, same-version dogfood rerun, completed ExecPlan linting, AGENTS marker integrity preflight, kickoff failure as `failed`, sanitized kickoff environment, and Codex config rollback on kickoff failure.

The current package smoke proves packed `bunx` and `npx` setup pairing plus an installed docs-operating-system command, but it does not yet prove `shipbysunday install` from the packed artifact.

A completely empty Git repo still blocks correctly because Worker Foundations v1 requires a root `package.json`. After adding and committing a minimal `package.json`, the same fresh repo dry-run reports `ready` and the real install completes with npm as the root package manager.

## Decision Log

Decision: Keep the activation service contract in the local-runner workflow rather than adding target-repo files.
Rationale: License/account state belongs under the machine Worker home, not under the repository being installed. The target repo should only see the resulting install report and source files after activation succeeds.
Date: 2026-05-08

Decision: Treat `--yes` and `--json` installs as noninteractive for missing-license activation.
Rationale: The JSON contract requires one machine-readable object on stdout and no prompts, and agent/support commands must block with setup instructions instead of trying to open a browser or poll indefinitely.
Date: 2026-05-08

Decision: Extend package smoke with the Worker install command using a prepared local license and `--dry-run --json --no-kickoff`.
Rationale: Full install proof is already covered by focused fixture tests. Package smoke should add distribution coverage without mutating external services, launching Codex, or requiring a real customer account.
Date: 2026-05-08

## Outcomes & Retrospective

This plan is complete. The installer now treats `license.json` as a validated v1 machine-license document instead of a status flag. Interactive installs with only a missing license start a browser/device activation, print the activation URL and user code to stderr, optionally open the browser, poll the service, validate the returned machine license, write it to `<worker-home>/license.json`, and then re-run preflight before mutating the target repo.

Noninteractive paths remain deterministic. `--yes`, `--json`, and `--dry-run` do not attempt browser activation; they report blocked state when the license is missing or invalid. JSON stdout remains one sync-safe object. Invalid legacy `{ "status": "active" }` licenses now block before repo mutation.

The package smoke now exercises the packed `shipbysunday install --dry-run --json --no-kickoff` command against a disposable committed repo with an isolated Worker home, proving the distributed bin reaches the Worker installer path. A fresh `~/Developer/runner-test` repo also proved the customer-shaped path: empty repo blocked on missing `package.json`; after adding a minimal committed `package.json`, dry-run returned `ready`; the real install with an isolated test Worker home completed on `shipbysunday/install`, committed `45f8d85`, and passed `npm run programs:lint`, `npm run plans:lint`, `npm run markdown:lint`, `npm run docs:validate`, and `npm run worker:test`.

The Program remains active. Native executable packaging, bundled or downloaded Bun provisioning for machines with no usable local Bun source, grouped interactive checklist polish, and broader real-project smoke are still outside this completed slice.

## Context and Orientation

The command entry point is `packages/local-runner/src/commands/install.ts`. The Worker installer workflow lives in `packages/local-runner/src/workflows/worker-foundations-install/workflow.ts`, with shared constants in `packages/local-runner/src/workflows/worker-foundations-install/manifest.ts`. The focused test file is `packages/local-runner/tests/worker-foundations-install.test.ts`; package distribution smoke is `packages/local-runner/tests/package-smoke.ts`.

The existing workflow resolves a target Git repository, inspects package metadata, checks the worktree, checks `license.json`, prepares a Worker-managed Bun toolchain, prepares Codex safety profiles when kickoff is enabled, applies visible Worker source, dogfoods `program:write-child-plan`, runs proof, writes `.worker/**` local proof plus `docs/worker/install-report.md`, optionally commits, and optionally launches Codex in the foreground. The current license check only parses `license.json`; it does not create that file through a customer activation flow.

The machine Worker home is `~/.worker/` by default and may be isolated in tests through `SHIPBYSUNDAY_WORKER_HOME`. The activation client may use a package/test-only service base URL override, but that override is not the normal customer path. The target repo must not receive secrets, raw activation responses, device codes, local absolute paths, or machine credentials.

### In Scope

Implement a browser/device activation flow for missing Worker licenses in interactive `shipbysunday install` before repo mutation. The flow should request a device code from the service, show the user code and verification URL, optionally open the browser, poll until the service returns a revocable machine license, validate that license, write it to `license.json` under the Worker home, and resume install preflight.

Harden license validation so `license.json` is a real machine credential document with `status: active`, a non-empty machine credential, and valid optional timestamps. Keep sync-safe outputs free of raw credentials.

Keep dry-run and JSON modes deterministic. Dry-run should remain read-only. Noninteractive modes should block with clear setup instructions when no valid license exists.

Extend tests and package smoke for the activation and packaged install command shape.

### Out Of Scope

Do not add app UI, Clerk flows, Convex schema, provider setup, Stripe changes, CI wiring, publishing automation, binary signing, or real production account provisioning in this slice. The CLI activation client should speak to the expected service contract and prove the behavior with a local test server.

Do not claim bundled Bun provisioning or full native binary distribution is complete unless a later slice implements and proves those paths.

## Plan of Work

First, change the Worker installer preflight so license inspection distinguishes `active`, `missing`, and `invalid` with a reason. Before building the final install plan for a non-dry-run interactive install, if the only blocker preventing progress is a missing license, run the activation flow and then re-inspect. JSON and `--yes` runs should skip activation and report the existing blocked outcome.

Next, add small activation helpers inside the Worker installer workflow or a feature-local module. The helpers should resolve the service URL from a Worker-specific environment variable with the current product URL as the default, start a device activation, print customer-safe instructions to stderr, open the browser when safe, poll with bounded intervals, validate the returned license, and persist it to `<worker-home>/license.json` with restrictive sync-safe contents.

Then, tighten tests. Add a local HTTP activation server for the success path, a noninteractive missing-license test, a malformed-license test, and a JSON stdout safety test. Update existing fixture helper licenses to include a machine credential so tests reflect the new persisted license contract.

Finally, extend `package-smoke.ts` so the packed CLI proves `shipbysunday install --dry-run --json --no-kickoff` works from an installed package against a disposable repo with an isolated Worker home and valid license.

## Milestones

Milestone 1 is activation preflight and license schema hardening. Success means missing licenses activate only in the interactive path, invalid licenses block before repo mutation, dry-runs stay read-only, and focused Worker install tests cover the behavior.

Milestone 2 is package distribution proof. Success means `bun run --cwd packages/local-runner package:smoke` exercises the packed `shipbysunday` install command in addition to the older package smoke coverage.

Milestone 3 is Program closeout for this slice. Success means this ExecPlan and the Worker Foundations Program both describe the landed activation behavior truthfully, validation passes, and the completed plan is moved to `docs/exec-plans/completed/`.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Before implementation, the baseline checks were:

    bun run --cwd packages/local-runner test -- worker-foundations-install.test.ts codex-config-manager.test.ts cli-help.test.ts
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-07-install-worker-foundations.md
    bun run programs:lint

After editing the installer and tests, run:

    bun run --cwd packages/local-runner test -- worker-foundations-install.test.ts codex-config-manager.test.ts cli-help.test.ts
    bun run --cwd packages/local-runner package:smoke

Before completing the plan, run the broader local-runner package checks plus Program and markdown validation listed below.

## Validation and Acceptance

Acceptance requires interactive missing-license installs to use browser/device activation and continue only after a valid machine license is persisted outside the repo. Noninteractive installs must not pretend activation happened. Dry-run must not write `license.json`, `.worker/`, source files, branches, Codex config, or reports. JSON output must remain one sync-safe object. The package smoke must prove the distributed `shipbysunday` bin can reach the Worker install command.

This slice is complete only after the ExecPlan is moved to completed, the Program ledger names the completed child plan, and the Program still stays active unless the later native distribution, bundled/downloaded Bun, checklist, and real-repo smoke acceptance items are also complete.

### Test Commands

Run focused Worker installer and Codex config tests:

    bun run --cwd packages/local-runner test -- worker-foundations-install.test.ts codex-config-manager.test.ts cli-help.test.ts

Run full local-runner validation:

    bun run --cwd packages/local-runner test
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner format:check
    bun run --cwd packages/local-runner build
    bun run --cwd packages/local-runner package:smoke

Run Program and docs validation:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-08-worker-installer-license-activation.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/completed/2026-05-07-sbs-worker-foundations-installer docs/exec-plans/active/2026-05-08-worker-installer-license-activation.md
    git diff --check

Smoke a fresh disposable repo if installer behavior changes:

    env SHIPBYSUNDAY_WORKER_HOME=<isolated-worker-home> bun packages/local-runner/src/cli.ts install --repo ~/Developer/runner-test --dry-run --json --no-kickoff

## Idempotence and Recovery

Activation happens before repository mutation. If activation fails, the installer should exit blocked or failed without creating `shipbysunday/install`, `.worker/`, `apps/worker`, or an install report in the target repo. If a partial license file is written by an interrupted process, the next run must parse and reject it unless it satisfies the license schema.

Existing valid licenses should be kept. Same-version installer repair should continue to rerun the existing install proof without forcing a new activation.

Codex config rollback behavior from the first installer slice must remain intact; this slice should not widen that surface.

## Artifacts and Notes

Baseline validation on 2026-05-08:

    bun run --cwd packages/local-runner test -- worker-foundations-install.test.ts codex-config-manager.test.ts cli-help.test.ts
    Test Files 3 passed (3), Tests 16 passed (16)

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-07-install-worker-foundations.md
    docs/exec-plans/completed/2026-05-07-install-worker-foundations.md: ok

    bun run programs:lint
    Program docs, packets, and prompts: ok

Completion validation on 2026-05-08:

    bun run --cwd packages/local-runner test -- worker-foundations-install.test.ts
    Test Files 1 passed (1), Tests 15 passed (15)

    bun run --cwd packages/local-runner test -- worker-foundations-install.test.ts codex-config-manager.test.ts cli-help.test.ts
    Test Files 3 passed (3), Tests 20 passed (20)

    bun run --cwd packages/local-runner test
    Test Files 24 passed | 2 skipped (26), Tests 162 passed | 7 skipped (169)

    bun run --cwd packages/local-runner lint
    Found 0 warnings and 0 errors.

    bun run --cwd packages/local-runner typecheck
    Passed.

    bun run --cwd packages/local-runner format:check
    All matched files use the correct format.

    bun run --cwd packages/local-runner build
    Built dist/cli.js.

    bun run --cwd packages/local-runner package:smoke
    package smoke passed

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-08-worker-installer-license-activation.md
    docs/exec-plans/active/2026-05-08-worker-installer-license-activation.md: ok

    bun run programs:lint
    Program docs, packets, and prompts: ok

    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-08-worker-installer-license-activation.md docs/programs/completed/2026-05-07-sbs-worker-foundations-installer/program.md
    Both paths ok.

    git diff --check
    Passed.

Runner-test smoke on 2026-05-08:

    env SHIPBYSUNDAY_WORKER_HOME=/tmp/sbs-runner-test-worker-home-BpQhyK bun packages/local-runner/src/cli.ts install --repo /Users/bazelrex/Developer/runner-test --dry-run --json --no-kickoff
    Empty Git repo result: blocked on missing root package.json.

    npm init -y
    git add package.json
    git commit -m "chore: create runner test fixture"

    env SHIPBYSUNDAY_WORKER_HOME=/tmp/sbs-runner-test-worker-home-BpQhyK bun packages/local-runner/src/cli.ts install --repo /Users/bazelrex/Developer/runner-test --dry-run --json --no-kickoff
    Minimal committed package repo result: ready.

    env SHIPBYSUNDAY_WORKER_HOME=/tmp/sbs-runner-test-worker-home-BpQhyK bun packages/local-runner/src/cli.ts install --repo /Users/bazelrex/Developer/runner-test --yes --json --no-kickoff
    Result: installed on shipbysunday/install at commit 45f8d85, with all five proof commands passed.

## Interfaces and Dependencies

The activation service contract for this slice is a start endpoint that returns a device code, customer user code, verification URL, expiry, and polling interval, plus a poll endpoint that returns pending, denied, expired, or an active machine license. The exact URLs should live behind local-runner constants and an environment override for tests.

The persisted license file is `<worker-home>/license.json`. It must contain only machine-level activation data required for later validation, never target repo paths, package script bodies, raw logs, source snippets, or Codex transcripts.

The package distribution proof depends on the existing `packages/local-runner/package.json` `shipbysunday` bin, `bun run --cwd packages/local-runner build`, and `bun run --cwd packages/local-runner package:smoke`.
