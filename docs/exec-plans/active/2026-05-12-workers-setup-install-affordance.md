---
title: Workers Setup Install Affordance
status: active
created_at: 2026-05-12
completed_at: null
summary: Add a gated Worker install stage to `/workers/setup` and sync safe install preview, completion, and blocked events from the local runner.
post_build_recap: null
program_id: worker-generate-tutorials-ia
planning_brief: docs/programs/active/2026-05-05-worker-generate-tutorials-ia/planning-brief-2.md
read_when:
  - Resuming the Worker setup install affordance slice.
  - Changing Worker Foundations install event sync.
  - Validating `/workers/setup` pairing-to-install handoff behavior.
---

# Workers Setup Install Affordance

This document is a living execution plan for adding a clean Worker install stage to `/workers/setup` and syncing safe local-runner install status back into the app.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

After this change, a customer pairing a local runner on `/workers/setup` can see the next install stage in the same screen instead of guessing which command to run after pairing. The install stage stays gated until pairing completes, recommends a JSON dry-run preview, offers the real install command that commits by default on `shipbysunday/install`, and explains the installed Worker handoff. The setup page also reflects the latest runner sync-backed install status from new sync-safe local-runner events, so the browser can show previewed, installed, or blocked state without syncing raw source, logs, local absolute paths, secrets, package script bodies, dependency versions, or Codex transcripts.

## Progress

- [x] 2026-05-12: Read root `AGENTS.md`, `apps/web/AGENTS.md`, `docs/exec-plans/PLANS.md`, Program guidance, the current Program packet, Convex AI guidelines, UI design guidance, Next.js App Router server/client docs, and the relevant local-runner, Convex, setup-page, and test files.
- [x] 2026-05-12: Created this Program-linked child ExecPlan at `docs/exec-plans/active/2026-05-12-workers-setup-install-affordance.md`.
- [x] 2026-05-12: Implemented local-runner Worker install events from `runWorkerFoundationsInstall`, including paired-only best-effort queue and immediate flush behavior.
- [x] 2026-05-12: Taught Convex workspace runner events about Worker install preview, completion, and blocked payloads, including setup-state projection.
- [x] 2026-05-12: Added the gated install panel to `/workers/setup`, extracted package-runner command UI shared with pairing, and made pairing commands explicit about `--repo .`.
- [x] 2026-05-12: Added focused local-runner, Convex event, readiness-model, and setup-page UI tests for the new install affordance and event sync.
- [x] 2026-05-12: Updated the active Program ledger with this child ExecPlan.
- [x] 2026-05-12: Ran focused validation, package smoke, formatting checks, program lint, broad lint, guarded typecheck, and whitespace validation.

## Surprises & Discoveries

The active Program's `Next Slice` still names broad Worker runtime and generated-output naming cleanup, but this request narrows the next child slice to Worker setup install affordance and install event sync. The Program should be updated after this child plan is created or advanced so later workers do not assume the broader runtime rename slice is still the immediate next step.

The current setup page already has a package-runner switcher in `apps/web/app/(workspace)/_components/existing-codebase-setup/setup-pairing-panel.tsx`, but it is local to the pairing component. The install panel should extract that command rendering rather than duplicate it.

The Worker install workflow already returns a sync-safe report with `createdRefs`, `changedRefs`, `reportRef`, `localProofRef`, branch, commit, proof command statuses, and blockers. That report is the right source for the new event payload, but event delivery must remain best-effort and cannot change the install exit code.

The setup pairing CLI already supports `--repo <path>`, so the setup page can make pairing and install commands consistently explicit with `--repo .` without adding CLI surface area.

## Decision Log

Decision: Keep pairing and install as separate stages on the same setup page.
Rationale: Pairing creates runner credentials and browser-visible readiness; install mutates the customer's repo. Showing install after pairing but gating command actions until pairing is complete keeps that boundary explicit.
Date: 2026-05-12.

Decision: Emit Worker install runner events from `runWorkerFoundationsInstall`, not from the CLI command wrapper.
Rationale: The workflow is the durable behavior boundary and is used by packaged, native, and direct call paths. Emitting from the CLI would miss non-CLI callers and would make event delivery depend on presentation logic.
Date: 2026-05-12.

Decision: Treat install event delivery as best-effort only when runner credentials exist.
Rationale: Clean unpaired installs must still succeed locally, and network or API failures must leave queued events without changing the installer exit code.
Date: 2026-05-12.

Decision: Use `/workers/setup` as the customer guidance surface for this slice and avoid `apps/web/content/docs`.
Rationale: The user explicitly scoped setup guidance to the product page. Editing docs content would widen the slice.
Date: 2026-05-12.

## Outcomes & Retrospective

Implemented the Worker setup install affordance and sync-safe runner event path. The local runner now emits `worker.install.previewed`, `worker.install.completed`, and `worker.install.blocked` from `runWorkerFoundationsInstall` when paired runner credentials exist. Event delivery is best-effort: unpaired installs skip sync, failed flushes leave events queued, and sync failure does not change the install result. The app now validates and stores those events, includes them in setup state, and derives a runner sync-backed install stage for `/workers/setup`.

The setup page now renders a Worker install panel after pairing. It is visible before pairing but command actions are gated until pairing completes. It shows the required Bun-default package-runner variants, explicit `--repo .` commands, default commit behavior on `shipbysunday/install`, no automatic Doctor Pass, concise generated summary, capped synced refs, and installed handoff actions. Pairing commands also include `--repo .` because the setup-pair CLI already supports that option.

Validation passed:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-12-workers-setup-install-affordance.md
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-12-workers-setup-install-affordance.md
    bun run --cwd packages/local-runner test -- worker-foundations-install
    bun run --cwd packages/local-runner package:smoke
    bun run --cwd apps/web test:unit -- tests/unit/workspace-data-model.test.ts tests/unit/workspace-runner-events.test.ts tests/unit/workspace-setup-readiness-model.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-setup-page.test.tsx
    bun run format
    bun run format:check
    bun run programs:lint
    git diff --check
    bun run lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run typecheck

The prompt's app unit command used `bun run --cwd apps/web test -- ...`, but `apps/web` does not define a `test` script. The supported focused invocation is `bun run --cwd apps/web test:unit -- ...`, which is the command recorded above. No Doctor Pass automation, `apps/web/content/docs`, or existing `workspace*` internals were changed.

## Context and Orientation

The local installer lives in `packages/local-runner/src/workflows/worker-foundations-install/workflow.ts`. Its exported `runWorkerFoundationsInstall` function resolves the repository root, performs preflight, optionally activates the license, writes Worker-managed files, runs proof commands, writes `docs/worker/install-report.md`, optionally commits on `shipbysunday/install`, and returns a sync-safe `WorkerInstallResult`. The CLI wrapper in `packages/local-runner/src/commands/install.ts` only parses arguments and prints the result; do not emit events there.

Local runner credentials are stored by `packages/local-runner/src/core/local-runner-home.ts`. `readRunnerCredential` returns `null` when the repo is not paired. `packages/local-runner/src/core/runner-events.ts` owns event creation, local outbox queueing under `.sbs/events/outbox.jsonl`, and immediate flush to the paired runner event endpoint. Its `assertSyncSafeRunnerEvent` must continue rejecting unsafe field names, secrets, and local absolute paths.

The app ingests runner events through `apps/web/app/api/workspace/runner/events/route.ts`, which delegates to `apps/web/app/api/workspace/runner/_server/runner-bridge.ts` and then to Convex `ingestWorkspaceRunnerEventByCredential`. Convex event types, payload types, validators, sync-safety checks, and setup state projection live in `apps/web/convex/workspace/types.ts`, `apps/web/convex/workspace/validators.ts`, `apps/web/convex/workspace/events.ts`, and `apps/web/convex/workspace/model.ts`.

The setup page is `/workers/setup`, implemented by `apps/web/app/(workspace)/workers/setup/page.tsx` and rendered by `apps/web/app/(workspace)/_components/existing-codebase-setup/existing-codebase-setup-page.tsx`. Its client model lives in `apps/web/app/(workspace)/_lib/workspace-setup-readiness-model.ts`. The pairing command UI currently lives inside `setup-pairing-panel.tsx` and should be extracted into a feature-local reusable command component near the other setup components.

### In Scope

This slice adds three sync-safe runner event types: `worker.install.previewed`, `worker.install.completed`, and `worker.install.blocked`. The local-runner install workflow should queue and immediately flush those events only when paired runner credentials exist. Payloads should include only outcome/status, summary, branch, short commit hash when available, `reportRef`, repo-relative `localProofRef` when sync-safe, `createdRefs`, `changedRefs`, blocker ids and reasons for blocked events, and proof command labels plus statuses from `passed`, `failed`, `blocked`, or `skipped`.

This slice updates `/workers/setup` to show a Worker install panel after the pairing panel. The panel should be visible before pairing but gated until pairing is complete. It should keep the package-runner toggle with Bun as the default and npm, pnpm, and yarn alternatives. It should show the preview command as recommended, the install command as primary, the no-commit command as secondary or collapsed, and the interactive license fallback. It must say the install commits by default on `shipbysunday/install`, preview is recommended but not required, no Doctor Pass starts automatically after install, and the installed handoff is to open `docs/worker/install-report.md`, read the active Worker Program, continue from the first active ExecPlan, run `./scripts/run-worker.sh --help`, run the selected package manager's `docs:validate`, and run the selected package manager's `worker:test`.

This slice updates focused tests for the local runner install workflow, Convex runner event ingestion and setup-state projection, setup readiness model, and setup page UI.

### Out Of Scope

Do not add or edit `apps/web/content/docs` docs. Do not include Doctor Pass auto-start after install. Do not rename existing `workspace*` internals, Convex table names, API paths, or existing route group internals in this slice. Do not do the broader Worker runtime contract rename or generated-output hard switch. Do not sync logs, stdout, stderr, raw source, local absolute paths, script bodies, package script bodies, dependency versions, secrets, or Codex transcripts.

## Plan of Work

First, extend `packages/local-runner/src/core/runner-events.ts` with Worker install event types and payload definitions. Add narrow payload types instead of a broad object bag so TypeScript and sync-safety checks constrain the event shape.

Next, update `packages/local-runner/src/workflows/worker-foundations-install/workflow.ts`. Import runner credential and event helpers, build a sync-safe Worker install payload from the existing `WorkerInstallReport`, and call the emitter from every normal result path produced by `runWorkerFoundationsInstall`. The emitter should return immediately without doing anything when `readRunnerCredential` returns `null`. If credentials exist, it should queue the event and call `flushRunnerEvents`. Every read, queue, or flush failure should be caught so the original install result and exit code are unchanged.

Next, teach Convex about the new event types. Add type and validator cases in `apps/web/convex/workspace/types.ts` and `apps/web/convex/workspace/validators.ts`. Add allowed payload fields in `apps/web/convex/workspace/events.ts`. In `apps/web/convex/workspace/model.ts`, include the latest Worker install events in setup state and patch the runner's `lastEventAt` when those events arrive. The UI can derive install status from the returned event documents without adding a new table.

Next, update `apps/web/app/(workspace)/_lib/workspace-setup-readiness-model.ts`. Add a `workerInstall` model that derives `waiting`, `ready`, `previewed`, `installed`, or `blocked` from pairing state and the latest Worker install event. It should preserve full sync-safe `createdRefs` and `changedRefs` arrays in the model while leaving display capping to the component.

Next, extract the package-runner command switcher from `setup-pairing-panel.tsx` into a new reusable component under `apps/web/app/(workspace)/_components/existing-codebase-setup/`. Refactor the pairing panel to use it, then add a new `setup-worker-install-panel.tsx` that renders the gated install commands, generated summary, collapsible advanced details, and installed handoff.

Finally, update tests and Program progress. Add local-runner tests for paired dry-run, installed, blocked, unpaired no-op, and flush failure behavior. Add Convex tests for ingesting the new event types, rejecting unsafe payload fields, and returning install events in setup state. Add readiness-model tests for waiting, ready, previewed, installed, and blocked statuses. Add integration UI tests proving the install panel renders after pairing, keeps command actions gated before pairing, uses the package-runner toggle, says commits happen by default on `shipbysunday/install`, and shows capped refs with `and N more`.

## Milestones

Milestone 1 adds local-runner event emission. Success means `runWorkerFoundationsInstall` emits `worker.install.previewed`, `worker.install.completed`, and `worker.install.blocked` only when credentials exist, leaves installs successful when credentials are absent, and leaves events queued when flush fails.

Milestone 2 adds Convex ingestion and setup-state projection. Success means the new event payloads pass validators, unsafe fields still fail closed, duplicate event ids remain idempotent, and `/workers/setup` query state can see the latest install event.

Milestone 3 adds the setup page install UI. Success means the pairing command component is reused, the install stage appears after pairing, is gated before pairing, and shows the required preview/install/no-commit/fallback commands and installed handoff copy.

Milestone 4 completes tests, Program updates, and validation. Success means focused local-runner, Convex, model, and UI tests pass, the plan and Program lint, and the diff stays scoped to the requested surfaces.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Validate the new plan after creating or revising it:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-12-workers-setup-install-affordance.md
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-12-workers-setup-install-affordance.md

Run the local-runner focused install tests after event emission changes:

    bun run --cwd packages/local-runner test -- worker-foundations-install

Run packaged CLI smoke if package-distribution behavior changes:

    bun run --cwd packages/local-runner package:smoke

Run the app focused unit tests after Convex and readiness model changes:

    bun run --cwd apps/web test -- tests/unit/workspace-runner-events.test.ts tests/unit/workspace-setup-readiness-model.test.ts

Run the setup page UI integration test after component changes:

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-setup-page.test.tsx

Run whitespace validation:

    git diff --check

Broaden only if shared contracts were touched:

    bun run lint
    bun run typecheck

## Validation and Acceptance

Acceptance requires an unpaired local install to keep succeeding locally without runner event delivery. A paired dry run should queue and attempt to flush `worker.install.previewed` with status `ready` and the sync-safe generated plan/report metadata. A paired install should queue and attempt to flush `worker.install.completed` with status `installed`, branch `shipbysunday/install`, short commit hash when a commit exists, `docs/worker/install-report.md`, repo-relative proof refs, changed refs, created refs, and command proof statuses. A blocked or failed paired install should queue and attempt to flush `worker.install.blocked` with blocker ids and blocker reasons but no raw command output or source.

Convex acceptance requires the new event types to be validated, persisted idempotently by `eventId`, rejected when payload discriminators mismatch, rejected when unsafe fields or local absolute paths appear, and returned in setup state so the setup page can derive the latest status.

UI acceptance requires `/workers/setup` to show the install stage after the pairing panel, keep install command copy actions disabled until pairing is complete, offer Bun/npm/pnpm/yarn package-runner variants, present the preview command as recommended but not required, present the install command as primary, say the install commits by default on `shipbysunday/install`, keep the no-commit command secondary or collapsed, show the interactive license fallback, show the concise generated summary, cap displayed refs with `and N more`, and describe status as runner sync-backed rather than instant live updates.

The test brief for this feature is: Feature: Worker setup install handoff. Risk: P1 core product, because it affects customer setup and local repo mutation guidance but does not itself mutate from the browser. Source of truth: local-runner event outbox/API delivery, Convex `workspaceRunnerEvents`, and visible `/workers/setup` status. Must work: unpaired local install, paired preview, paired default install, blocked install, package-runner command variants, and installed handoff. Must fail safely: missing credentials, failed flush, unsafe payload fields, local absolute paths, and preflight blockers. Tests: local-runner unit/integration, Convex unit, setup model unit, setup page integration UI, and package smoke if distribution behavior changes. CI gate: app unit, app integration UI, local-runner package test, and baseline lint/typecheck if shared contracts are touched.

### Test Commands

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-12-workers-setup-install-affordance.md
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-12-workers-setup-install-affordance.md
    bun run --cwd packages/local-runner test -- worker-foundations-install
    bun run --cwd packages/local-runner package:smoke
    bun run --cwd apps/web test -- tests/unit/workspace-runner-events.test.ts tests/unit/workspace-setup-readiness-model.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-setup-page.test.tsx
    git diff --check

Run these broader checks if the final diff touches shared contracts or if focused validation indicates a type or lint risk:

    bun run lint
    bun run typecheck

## Idempotence and Recovery

Runner event emission is append-only. If delivery fails, `flushRunnerEvents` should leave events queued in `.sbs/events/outbox.jsonl` for a later runner flush. Rerunning install should produce a new event with a new event id and should not reuse stale delivery state. If event queueing fails because local `.sbs` state cannot be written, the install result should still return normally and the final summary should report the install outcome, not the telemetry failure.

Convex event ingestion remains idempotent by `eventId`. Duplicate Worker install events with the same `eventId` return the existing event document and do not reapply derived runner state. Unsafe payloads must fail before insertion.

UI changes are additive inside the existing setup page. If the install panel renders incorrectly, revert only the new panel and command extraction while preserving existing pairing behavior. Do not revert unrelated dirty files. The existing `MISTAKES.md` and `.deepsec/` dirty entries observed at plan creation are unrelated and must be left alone.

## Artifacts and Notes

Primary install commands:

    bunx ship-by-sunday install --repo . --dry-run --json --no-kickoff
    bunx ship-by-sunday install --repo . --yes --json --no-kickoff
    bunx ship-by-sunday install --repo . --yes --json --no-kickoff --no-commit
    bunx ship-by-sunday install --repo . --no-kickoff

Default generated summary for the install panel:

    apps/worker local Worker app
    scripts/run-worker.sh launcher
    docs/worker/install-report.md handoff report
    README.md, AGENTS.md, package.json managed updates
    local .worker/ state excluded from Git

Installed handoff actions:

    open docs/worker/install-report.md
    read the active Worker Program
    continue from the first active ExecPlan
    ./scripts/run-worker.sh --help
    <package manager> run docs:validate
    <package manager> run worker:test

## Interfaces and Dependencies

`packages/local-runner/src/core/runner-events.ts` is the local event schema source for the packaged runner. Keep it aligned with Convex event types in `apps/web/convex/workspace/types.ts` and validators in `apps/web/convex/workspace/validators.ts`.

`packages/local-runner/src/workflows/worker-foundations-install/workflow.ts` owns install behavior and should remain the event emission boundary. `packages/local-runner/src/commands/install.ts` should not gain event behavior.

`apps/web/convex/workspace/events.ts` is the sync-safety boundary for runner event payloads. Add only explicit allowed fields for Worker install events.

`apps/web/app/(workspace)/_lib/workspace-setup-readiness-model.ts` is the client model boundary for `/workers/setup`. The new setup panel should consume this model rather than re-deriving event state in JSX.

`apps/web/app/(workspace)/_components/existing-codebase-setup/` owns the feature-local setup components. New command UI and install panel components belong there, not in shared `components/ui`, because they are specific to Worker setup.
