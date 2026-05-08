---
title: Polish Worker Installer Interactive Checklist
status: active
created_at: 2026-05-08
completed_at: null
summary: Make normal shipbysunday install show a grouped all-required checklist before confirmation while preserving JSON and noninteractive contracts.
post_build_recap: null
program_id: sbs-worker-foundations-installer
planning_brief: docs/programs/active/2026-05-07-sbs-worker-foundations-installer/planning-brief-2.md
read_when:
  - Changing the human confirmation surface for shipbysunday install.
  - Verifying grouped checklist behavior for Worker Foundations installer phases.
  - Resuming the Worker Foundations installer Program after license activation.
---

# Polish Worker Installer Interactive Checklist

This is a living execution plan for the next Worker Foundations installer customer-experience slice.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The installer now has the core technical gates: repo preflight, license activation, Worker source installation, proof, report writing, commit, and optional Codex kickoff. The normal interactive surface still asks a single yes/no confirmation without showing the all-required phase checklist promised by the Program.

After this slice, a human running `shipbysunday install` should see a concise grouped checklist of required phases before confirmation. The checklist should make clear what will be added, what will be refreshed, what is already available, and what is blocked. It should allow continue or cancel only; partial deselection remains out of scope. JSON, dry-run JSON, and `--yes` behavior must stay machine-readable and prompt-free.

## Progress

- [x] 2026-05-08: Created this Program-linked child ExecPlan after completing the license activation slice.
- [ ] Implement the grouped interactive checklist rendering boundary.
- [ ] Add focused tests for checklist output, cancellation, and no checklist in JSON/`--yes` mode.
- [ ] Run focused local-runner validation and fresh `runner-test` smoke for the interactive surface.

## Surprises & Discoveries

None yet.

## Decision Log

Decision: Keep the checklist all-required.
Rationale: The Program explicitly rejected partial phase selection for v1. The checklist is a preview and confirmation boundary, not a configuration UI.
Date: 2026-05-08

Decision: Keep checklist text out of JSON stdout.
Rationale: `--json` must remain one sync-safe machine-readable object for coding agents and tests.
Date: 2026-05-08

## Outcomes & Retrospective

This plan is active. Fill this section with the implemented checklist behavior, validation evidence, and remaining Program gaps before moving the plan to `docs/exec-plans/completed/`.

## Context and Orientation

The command entry point is `packages/local-runner/src/commands/install.ts`. The install orchestration and confirmation prompt live in `packages/local-runner/src/workflows/worker-foundations-install/workflow.ts`. The focused tests live in `packages/local-runner/tests/worker-foundations-install.test.ts`.

The current confirmation function prints one sentence and waits for `y`. It runs only when the install is non-dry-run, has no blockers, is not JSON, and does not use `--yes`. That is the right behavioral boundary; this slice should improve the content shown at that boundary without moving prompts into JSON or noninteractive modes.

### In Scope

Render a grouped checklist for the normal interactive confirmation path. Include preflight, toolchain, repo command, managed file, proof, commit, and kickoff groups as appropriate for the current plan and options. Preserve the existing all-required continue/cancel behavior.

Add focused tests for checklist rendering, cancellation before repo mutation, and prompt suppression in JSON and `--yes` modes.

### Out Of Scope

Do not add a selectable checklist, install profiles, terminal UI framework, native packaging, Bun download provisioning, Codex behavior changes, or app/service UI. Do not change JSON schema fields unless a current test proves the checklist needs a new machine-readable status.

## Plan of Work

First, add a small rendering function for the grouped checklist. It should derive groups from the already-built `WorkerInstallPlan`, proof commands, and install options. Keep it feature-local to the Worker installer workflow unless the structure clearly needs tests through exported helpers.

Next, replace the one-line confirmation prompt with a checklist plus the same continue/cancel prompt. Keep shallow control flow and avoid introducing configurable phase selection.

Then, add focused tests by stubbing `process.stdin.isTTY`, `process.stdin.once`, `process.stdout.write`, and `console.log` as needed. Prove that interactive installs show grouped checklist text before confirmation, cancellation returns exit code 130 without repo mutation, JSON installs do not print checklist text, and `--yes` installs remain prompt-free.

Finally, run focused validation and smoke the fresh `~/Developer/runner-test` repo in a controlled way. If the repo already has Worker Foundations installed, use dry-run or create a new branch/reset only if explicitly safe; do not touch unrelated real projects.

## Milestones

Milestone 1 is checklist rendering. Success means the normal interactive path shows grouped phase information and blocker details before asking for confirmation.

Milestone 2 is prompt-boundary coverage. Success means focused tests prove cancellation happens before repo mutation, `--yes` remains prompt-free, and `--json` stdout remains one JSON object without checklist prose.

Milestone 3 is validation and Program truth. Success means local-runner checks pass, this ExecPlan moves to completed, and the Program ledger names the completed checklist slice while keeping the initiative active for native distribution and Bun provisioning.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Inspect the current confirmation boundary:

    rg -n "confirmInstall|buildInstallPlan|WorkerInstallPlan" packages/local-runner/src/workflows/worker-foundations-install/workflow.ts

Implement the checklist in the Worker installer workflow and tests:

    packages/local-runner/src/workflows/worker-foundations-install/workflow.ts
    packages/local-runner/tests/worker-foundations-install.test.ts

Run focused validation:

    bun run --cwd packages/local-runner test -- worker-foundations-install.test.ts codex-config-manager.test.ts cli-help.test.ts
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner format:check

Complete the plan only after docs validation passes:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-08-worker-installer-interactive-checklist.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-08-worker-installer-interactive-checklist.md docs/programs/active/2026-05-07-sbs-worker-foundations-installer/program.md
    git diff --check

## Validation and Acceptance

Acceptance requires normal interactive installs to show a grouped all-required checklist before confirmation, with clear phase labels and blocker reasons when present. Cancel must still return `cancelled` / exit code 130 before repo mutation. JSON and `--yes` paths must remain prompt-free. Existing proof, report, commit, activation, and package smoke behavior must not regress.

### Test Commands

Run focused tests:

    bun run --cwd packages/local-runner test -- worker-foundations-install.test.ts codex-config-manager.test.ts cli-help.test.ts

Run package checks touched by this slice:

    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner format:check

Run Program and docs validation:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-08-worker-installer-interactive-checklist.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-08-worker-installer-interactive-checklist.md docs/programs/active/2026-05-07-sbs-worker-foundations-installer/program.md
    git diff --check

## Idempotence and Recovery

This slice should not change repo mutation semantics. If the user cancels, no branch, report, `.worker/`, or source files should be written. If the checklist renders incorrectly, `--yes --json` remains the recovery path for deterministic agent/test installs.

## Artifacts and Notes

The prior license activation slice completed at `docs/exec-plans/completed/2026-05-08-worker-installer-license-activation.md`.

## Interfaces and Dependencies

The checklist depends on `WorkerInstallPlan`, phase semantics in `buildPhaseSummary`, proof command lists from the manifest, and the existing confirmation boundary in `runWorkerFoundationsInstall`.
