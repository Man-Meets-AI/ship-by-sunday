---
program_id: local-runner-node-effect-migration
title: Local Runner Node And Effect Migration
status: complete
created_at: 2026-05-13
completed_at: 2026-05-14
summary: Port `packages/local-runner` from Bun-shaped runtime and Worker defaults to a Node-first CLI, then migrate orchestration boundaries to Effect with the vendored Effect repo as read-only agent reference.
post_build_recap: The local-runner package now ships as a Node-first CLI, Worker installs default blank targets to Node/npm, and the main process, Codex, event, workflow API, filesystem state, Worker proof/event sync, and Program run-slice orchestration boundaries use injectable Effect services with promise adapters preserved.
read_when:
  - "Starting work on the local-runner Node runtime cutover."
  - "Planning the Effect migration for packages/local-runner."
  - "Reviewing the hard Worker Node/npm cutover before adding Effect."
---

# Local Runner Node And Effect Migration

This Program is a living initiative document for moving `packages/local-runner` to a Node-first runtime and then porting its orchestration boundaries to Effect.

This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

`packages/local-runner` is the operational CLI behind Ship by Sunday Worker setup, local workflow execution, doctor passes, docs operating-system commands, and Program automation. Today it is shaped around Bun: the package bin is built with Bun, the CLI shebang names Bun, package smoke relies on Bun paths, and Worker Foundations install defaults blank target repositories to Bun-owned scripts and toolchains.

The migration should make the shipped local runner and generated Worker surface boring to install and run on Node/npm. This is a hard cutover: old Bun-shaped Worker installs do not get a compatibility migration. After the Node contract is stable, Effect should own the async boundaries that are currently hand-rolled: process execution, timeouts, filesystem state, event outbox delivery, HTTP workflow APIs, Codex execution, and larger workflow orchestration.

When this Program is complete, `ship-by-sunday` and `shipbysunday` should run without requiring Bun, Worker install should no longer make Bun the default customer runtime for blank or unclaimed repos, and the local-runner internals should use Effect where it clarifies dependencies, failures, retries, cancellation, and testability.

## Program Inputs

The original local-runner runtime shape is recorded in `research-pass-current-local-runner-runtime.md`. The remaining Effect migration pass is recorded in `research-pass-remaining-effect-migration.md`. The Node and Effect boundary model is normalized in `normalized-pass-node-effect-boundary.md`. Canonical decisions are recorded in `converged-decision-packet.md`. Ordering is recorded in `dependency-graph.md` and `plan-split-recommendation.md`. Cross-repo and vendored-reference boundaries are recorded in `cross-repo-review.md`. The first child slice used `planning-brief-1.md`, the completed Effect scaffold slice used `planning-brief-2.md`, the completed process, Codex, event, and workflow API slice used `planning-brief-3.md`, the completed filesystem state slice used `planning-brief-4.md`, the completed Worker workflow module split used `planning-brief-5.md`, the completed Worker workflow event-sync Effect boundary used `planning-brief-6.md`, the completed Worker process boundary slice used `planning-brief-7.md`, the completed runner orchestration slice used `planning-brief-8.md`, and the final completion and docs hardening slice should use `planning-brief-9.md`; `current-planning-brief.txt` points at that brief.

This Program depends on the read-only Effect reference subtree at `repos/effect/`, root guidance in `AGENTS.md`, the local-runner package under `packages/local-runner/`, Worker Foundations install templates in `packages/local-runner/src/workflows/worker-foundations-install/workflow.ts`, and validation commands documented in `packages/local-runner/README.md`.

## Current State

The Effect reference repository has already been vendored under `repos/effect/` as a squashed subtree. Root agent guidance now says to treat that subtree as read-only reference material and to import only published packages such as `effect` and `@effect/platform-node` from production code. VS Code excludes `repos/**` from search, file watching, and TypeScript auto-import candidates.

`packages/local-runner` now runs as a Node-shaped package. Its package scripts use `jiti` for source-mode command execution, build a single Node-targeted `dist/cli.js` with esbuild, and run smoke scripts through Node-compatible package execution. The CLI source starts with `#!/usr/bin/env node`, and the installed bin entrypoint compares real paths so npm `.bin` symlinks execute the CLI instead of importing and exiting.

Worker Foundations install now generates Node/npm Worker output. Blank and Bun-shaped target repos cut over to `packageManager: npm@11.12.1`; generated `scripts/run-worker.sh` runs `node src/worker-cli.mjs` and `node --test tests/*.mjs`; generated `apps/worker/package.json` scripts use Node commands; tests assert the Node/npm proof command labels. The installer still recognizes a managed legacy `apps/worker/bun.lock` only so reruns can delete it cleanly.

Effect dependencies are now installed in `packages/local-runner`: `effect@3.21.2`, `@effect/platform@0.96.1`, and `@effect/platform-node@0.106.0`. The first scaffold is intentionally small. `packages/local-runner/src/effect/runtime.ts` runs fully provided effects and unwraps failed exits so promise adapters preserve existing thrown errors. `packages/local-runner/src/effect/node-platform-runtime.ts` exposes the Node platform layer with per-run managed-runtime disposal. `packages/local-runner/src/core/bounded-process.ts`, `packages/local-runner/src/core/codex-exec-runner.ts`, `packages/local-runner/src/core/runner-events.ts`, `packages/local-runner/src/core/workflow-run-api.ts`, `packages/local-runner/src/core/repository-boundary.ts`, `packages/local-runner/src/core/local-project-state.ts`, `packages/local-runner/src/core/local-runner-home.ts`, `packages/local-runner/src/core/doctor-pass/artifacts.ts`, and `packages/local-runner/src/core/codex-config-manager.ts` now route external I/O or filesystem state through injectable Effect services while preserving public promise-returning APIs.

The completed scaffold child ExecPlan is archived at `docs/exec-plans/completed/2026-05-13-effect-dependency-and-boundary-scaffold.md`. The completed process, Codex, event, and workflow API child ExecPlan is archived at `docs/exec-plans/completed/2026-05-13-effect-process-codex-and-event-boundaries.md`. The completed filesystem state child ExecPlan is archived at `docs/exec-plans/completed/2026-05-13-effect-filesystem-state-boundaries.md`. The completed Worker workflow module split child ExecPlan is archived at `docs/exec-plans/completed/2026-05-13-worker-workflow-module-split.md`. The completed Worker workflow event-sync Effect boundary child ExecPlan is archived at `docs/exec-plans/completed/2026-05-13-worker-workflow-effect-migration.md`. The completed Worker proof process boundary child ExecPlan is archived at `docs/exec-plans/completed/2026-05-14-worker-process-and-file-effect-boundaries.md`. The completed runner orchestration child ExecPlan is archived at `docs/exec-plans/completed/2026-05-14-runner-orchestration-runtime-migration.md`. The completed closeout child ExecPlan is archived at `docs/exec-plans/completed/2026-05-14-runner-effect-completion-and-docs-hardening.md`. `packages/local-runner/src/workflows/worker-foundations-install/workflow.ts` is now a stable orchestration entry point backed by feature-local modules for inspect, plan, apply, proof, report, generated templates, license, kickoff, confirmation, environment, result, constants, types, and utilities. Worker install result/event sync now uses an injected Effect boundary over runner-home credential lookup and runner event queue/flush. Worker install proof command and dogfood child-plan process execution now expose Effect helpers backed by `BoundedProcessService` while preserving promise adapters. Program run-slice orchestration now exposes `runProgramRunSliceEffect` and `NodeProgramRunSliceServicesLive`; the command-facing `runProgramRunSlice` promise adapter delegates through the live services, and focused coverage injects `BoundedProcessService` across a full slice run. `packages/local-runner/README.md` now documents the Node-first shipped runtime, npm Worker default, and migrated Effect boundaries. No required child slice remains in this Program.

## Progress

- [x] 2026-05-13: Read the Effect article recommending a vendored upstream reference repository for coding agents.
- [x] 2026-05-13: Added `repos/effect/` as a squashed subtree from upstream Effect commit `e71ba68273026a1a2c1ace7218bdb206b0d3386d`.
- [x] 2026-05-13: Updated root `AGENTS.md` and `.vscode/settings.json` so agents and editor tooling treat `repos/effect/` as read-only reference, not source imports.
- [x] 2026-05-13: Mapped the local-runner Bun surfaces and Worker install Bun defaults that must be handled before the Effect migration.
- [x] 2026-05-13: Created this Program packet and planning brief 1 for the Node runtime and distribution cutover.
- [x] 2026-05-13: Completed the Node/npm cutover child ExecPlan. The local-runner package builds and smokes as a Node CLI, generated Worker installs use Node/npm, and compatibility smoke now cuts legacy Bun-shaped inputs over to npm.
- [x] 2026-05-13: Created planning brief 2 and the active `Effect Dependency And Boundary Scaffold` ExecPlan for the first Effect dependency and process-boundary slice.
- [x] 2026-05-13: Added the first Effect scaffold in `packages/local-runner`, routed bounded process execution through an injectable Effect service with interruption cleanup, and passed focused bounded-process tests plus local-runner format, lint, typecheck, and build checks.
- [x] 2026-05-13: Archived the completed Effect scaffold ExecPlan, researched the remaining migration surfaces, created planning brief 3, and opened the process, Codex, event, and workflow API Effect boundary ExecPlan.
- [x] 2026-05-13: Completed the process, Codex, event, and workflow API Effect boundary slice. Codex execution, runner event queue/read/flush, and workflow-run claim/resolve now have injectable Effect services with promise adapters preserved. Focused tests, local-runner format, lint, typecheck, and build passed.
- [x] 2026-05-13: Created planning brief 4 for the next filesystem state boundary slice and moved `current-planning-brief.txt` to that brief.
- [x] 2026-05-13: Opened the active `Effect Filesystem State Boundaries` ExecPlan from planning brief 4.
- [x] 2026-05-13: Completed the filesystem state Effect boundary slice. Repository path safety, local `.sbs` state, runner-home credentials, doctor artifacts, and Codex config files now have injectable Effect services with promise adapters preserved. Focused tests, full local-runner tests, local-runner format, lint, typecheck, and build passed.
- [x] 2026-05-13: Created planning brief 5 for the next Worker workflow module split and moved `current-planning-brief.txt` to that brief.
- [x] 2026-05-13: Opened the active `Worker Workflow Module Split` ExecPlan from planning brief 5.
- [x] 2026-05-13: Completed the Worker workflow module split. The Worker Foundations workflow now has feature-local modules while preserving public workflow entry points and passing focused Worker tests, compatibility smoke, package smoke, local-runner static checks, and docs validation.
- [x] 2026-05-13: Created planning brief 6 for the next Worker workflow Effect migration and moved `current-planning-brief.txt` to that brief.
- [x] 2026-05-13: Opened the active `Worker Workflow Effect Migration` ExecPlan from planning brief 6.
- [x] 2026-05-13: Completed the Worker workflow event-sync Effect boundary. `finishAndMaybeSyncResult` now runs through `finishAndMaybeSyncResultEffect`, and a focused Worker test injects runner-home and runner-event services without touching a real runner home or event outbox.
- [x] 2026-05-13: Created planning brief 7 for the next Worker process and file boundary slice and moved `current-planning-brief.txt` to that brief.
- [x] 2026-05-14: Opened the active `Worker Process And File Effect Boundaries` ExecPlan from planning brief 7.
- [x] 2026-05-14: Completed the Worker proof process Effect boundary. `runDogfoodChildPlanEffect` and `runProofCommandsEffect` now use injected `BoundedProcessService`, and focused Worker tests prove proof ordering, failure stop behavior, and child-plan command arguments without spawning real processes.
- [x] 2026-05-14: Created planning brief 8 for the next runner orchestration runtime slice and moved `current-planning-brief.txt` to that brief.
- [x] 2026-05-14: Completed the runner orchestration runtime slice. `runProgramRunSliceEffect`, `runProgramRunSliceProofCommandsEffect`, and `NodeProgramRunSliceServicesLive` now compose the lower-level Effect services for Program run-slice orchestration, and a focused test injects `BoundedProcessService` without launching a real proof command.
- [x] 2026-05-14: Created planning brief 9 for the final completion and docs hardening slice and moved `current-planning-brief.txt` to that brief.
- [x] 2026-05-14: Completed the final docs hardening slice. `packages/local-runner/README.md` now describes the Node-first shipped runtime, Node/npm Worker target contract, and Effect service boundary map; broad local-runner tests, static checks, build, Worker compatibility smoke, package smoke, plan lint, markdown lint, and whitespace checks passed.
- [x] 2026-05-14: Closed this Program with a retrospective and moved it to the completed Program lane.

## Decision Log

Decision: Port `packages/local-runner` to Node before porting internals to Effect.
Rationale: Effect's Node platform layer fits this CLI's process, filesystem, HTTP, and cancellation boundaries. Keeping Bun as the runtime while introducing Effect would preserve the wrong distribution contract.
Date: 2026-05-13.

Decision: Keep `repos/effect/` as read-only reference material.
Rationale: The subtree helps agents inspect real Effect patterns locally, but production code should depend on published packages and lockfile-managed versions.
Date: 2026-05-13.

Decision: Preserve the one-file bin distribution contract if practical.
Rationale: `packages/local-runner/package.json` currently publishes only `dist/cli.js`. A Node-targeted bundled bin is a smaller customer-facing change than emitting a multi-file runtime tree.
Date: 2026-05-13.

Decision: Use Node/npm as the default for blank or unclaimed Worker target repositories.
Rationale: Parker explicitly does not want Bun as the required Worker runtime. The Worker install contract should create and run Node/npm-managed Worker scripts.
Date: 2026-05-13.

Decision: Do not preserve Bun Worker compatibility during the Node cutover.
Rationale: The current priority is a clean Node/npm Worker contract. Old Bun-shaped Worker installs may be cut over in place or blocked by managed-file conflict checks; they are not a migration target for this Program.
Date: 2026-05-13.

Decision: Add Effect only after Node package smoke is green.
Rationale: A runtime migration and an Effect architecture migration have different failure modes. Stabilizing Node first makes later Effect regressions easier to attribute.
Date: 2026-05-13.

Decision: Start the Effect migration at external I/O boundaries.
Rationale: The highest-value boundaries are process execution, Codex execution, event outbox delivery, workflow API calls, and filesystem state. Pure CLI parsing and string templates can remain ordinary TypeScript until there is real benefit.
Date: 2026-05-13.

Decision: Split the Worker install workflow before deep Effect conversion.
Rationale: `worker-foundations-install/workflow.ts` is large enough that converting it wholesale would hide behavior changes. The better sequence is inspect/plan/apply/proof module boundaries first, then migrate those boundaries to Effect.
Date: 2026-05-13.

Decision: Prove the first Effect scaffold at the bounded process boundary.
Rationale: `bounded-process.ts` is a small external I/O boundary already used by higher-level workflows. It can demonstrate service injection and behavior preservation before larger Codex, event, workflow API, or Worker install migrations.
Date: 2026-05-13.

Decision: Keep the Node platform runtime scaffold separate from the bounded process implementation for now.
Rationale: The bounded process helper can preserve its existing `execFile` behavior behind an Effect service without pulling broader Node platform modules into the CLI bundle. The Node platform layer is still present and tested for later filesystem, terminal, HTTP, and process migrations. Its managed runtime is created and disposed per run until a future slice has a reason to own a longer-lived lifecycle explicitly.
Date: 2026-05-13.

Decision: Make process cancellation part of the first Effect boundary.
Rationale: Future Effect callers will compose process execution with timeouts and races. Passing Effect interruption through to Node `execFile` prevents the new boundary from returning early while child process work continues.
Date: 2026-05-13.

Decision: Track the remaining migration as testable child slices instead of one broad Effect rewrite.
Rationale: The runner has several independent I/O clusters with different risks. A tabulated slice ledger keeps every step visible, gives each child ExecPlan a focused validation target, and avoids mixing Codex process behavior, event outbox delivery, Worker installer refactors, and orchestration runtime cleanup in one change.
Date: 2026-05-13.

Decision: Preserve promise adapters while adding Effect helpers and services.
Rationale: Current commands and workflows already call promise-returning functions. Keeping those adapters stable lets each boundary migrate behind the scenes while later orchestration slices adopt Effect directly when the supporting services are ready.
Date: 2026-05-13.

Decision: Preserve original thrown errors when promise adapters run failing Effect services.
Rationale: Current callers and tests depend on concrete error messages for invalid workflow packets, non-2xx workflow API responses, fetch failures, malformed JSON, and missing Codex executables. The Effect runtime helper now unwraps failed exits and the live services map rejected promises back to the original thrown value instead of surfacing generic Effect unknown errors.
Date: 2026-05-13.

## Slice Ledger

Active child ExecPlans:

- None.

Planned child ExecPlans:

- None.

Completed child ExecPlans:

- `docs/exec-plans/completed/2026-05-13-local-runner-node-worker-cutover.md`: hard Node/npm cutover for the local-runner package and generated Worker runtime contract.
- `docs/exec-plans/completed/2026-05-13-effect-dependency-and-boundary-scaffold.md`: published Effect dependencies, minimal runtime scaffold, and bounded-process Effect service proof.
- `docs/exec-plans/completed/2026-05-13-effect-process-codex-and-event-boundaries.md`: Codex execution, runner event queue/read/flush, and workflow-run claim/resolve moved behind injectable Effect services with promise adapters preserved.
- `docs/exec-plans/completed/2026-05-13-effect-filesystem-state-boundaries.md`: repository path safety, local `.sbs` state, runner-home credentials, doctor artifacts, and Codex config files moved behind injectable Effect services with promise adapters preserved.
- `docs/exec-plans/completed/2026-05-13-worker-workflow-module-split.md`: Worker Foundations workflow split into inspect, plan, apply, proof, report, generated-template, license, kickoff, confirmation, environment, result, constants, types, and utility modules without behavior changes.
- `docs/exec-plans/completed/2026-05-13-worker-workflow-effect-migration.md`: Worker install result/event sync moved behind `finishAndMaybeSyncResultEffect` with runner-home and runner-event service injection.
- `docs/exec-plans/completed/2026-05-14-worker-process-and-file-effect-boundaries.md`: Worker install proof command and dogfood child-plan process execution moved behind Effect helpers that reuse `BoundedProcessService` with promise adapters preserved.
- `docs/exec-plans/completed/2026-05-14-runner-orchestration-runtime-migration.md`: Program run-slice orchestration moved behind `runProgramRunSliceEffect` with live service-layer wiring, Effect proof command execution, Effect Codex execution, and focused process-service injection coverage.
- `docs/exec-plans/completed/2026-05-14-runner-effect-completion-and-docs-hardening.md`: local-runner README/runtime docs hardened, broad package validation recorded, and this Program closed.

## Next Slice

No required next slice remains inside this Program. Future local-runner work should open a new Program or ExecPlan only when it changes behavior beyond this completed Node and Effect migration.

## Risks and Watchpoints

Do not turn this into a repo-wide package-manager migration. The root app still uses Bun today; this Program is scoped to the local-runner distribution and Worker install runtime contract.

Do not spend implementation effort preserving Bun Worker compatibility. This cutover may stop detecting Bun as a supported Worker package manager and should not generate Bun-managed Worker files.

Do not import from `repos/effect/`. It is reference material only.

Do not introduce Effect as a wrapper around every line of code. Use it where typed dependencies, failure modes, retries, concurrency, cancellation, or test injection improve the local-runner.

Do not introduce a long-lived `ManagedRuntime` for broad Node platform services without documenting and owning its disposal lifecycle.

Do not rewrite Worker Foundations install in one pass. It is a high-blast-radius path with package smoke and customer setup consequences.

Do not migrate orchestration before the lower-level process, event, API, and filesystem services exist. Otherwise the orchestration code will just wrap raw promises in Effect without improving dependency boundaries.

Do not force `@effect/platform/Command` or `@effect/platform/HttpClient` into a boundary when the published API cannot preserve the local-runner behavior under test. A behavior-preserving local Effect service around Node APIs is acceptable when it is smaller and safer.

Do not hide build or smoke failures behind broad compatibility claims. Package smoke must prove the shipped artifact path, not only source-level tests.

Do not edit generated mirrors or customer setup docs incidentally. Update docs only where the Node or Worker runtime contract actually changes.

## Outcomes & Retrospective

This Program is complete. It cut `packages/local-runner` and generated Worker installs over to a Node/npm contract, added published Effect dependencies and runtime scaffolding, migrated the important external I/O and state boundaries to injectable Effect services, split the Worker installer into feature-local modules before deeper migration, moved Worker result/event sync and proof command execution behind Effect helpers, and moved Program run-slice orchestration onto the service layer. The final closeout updated the local-runner README and proved the package with full local-runner tests, static checks, build, Worker compatibility smoke, package smoke, plan lint, markdown lint, Program lint, scoped whitespace checks, and repo-level format, lint, and typecheck.

## Validation and Acceptance

At Program completion, `packages/local-runner` should build, pack, and smoke-test as a Node-first CLI. The package smoke should prove `npx` or installed package execution without depending on Bun for the shipped runtime. Focused tests should prove command behavior, Worker install compatibility, event outbox delivery, Codex execution parsing, workflow API calls, and failure modes after each Effect migration slice.

The Program is not complete until the local-runner README and any customer-facing Worker install docs describe the Node-first contract, blank Worker target repos no longer receive Bun defaults, Effect dependencies are lockfile-managed, and the migrated Effect boundaries have regression tests that catch real timeout, retry, parse, delivery, filesystem, workflow, and proof failures.

## Artifacts and Notes

Effect reference subtree:

    repos/effect/
    git-subtree-split: e71ba68273026a1a2c1ace7218bdb206b0d3386d

Node-cutover local-runner surfaces:

    packages/local-runner/package.json
    packages/local-runner/src/cli.ts
    packages/local-runner/tests/package-smoke.ts
    packages/local-runner/tests/worker-install-compatibility-smoke.ts

Node-cutover Worker install surfaces:

    packages/local-runner/src/workflows/worker-foundations-install/workflow.ts
    packages/local-runner/tests/worker-foundations-install.test.ts
    packages/local-runner/README.md

Candidate first Effect boundaries:

    packages/local-runner/src/core/bounded-process.ts
    packages/local-runner/src/core/codex-exec-runner.ts
    packages/local-runner/src/core/runner-events.ts
    packages/local-runner/src/core/workflow-run-api.ts

Effect scaffold surfaces:

    packages/local-runner/src/effect/runtime.ts
    packages/local-runner/src/effect/node-platform-runtime.ts
    packages/local-runner/src/core/bounded-process.ts
    packages/local-runner/tests/bounded-process.test.ts

Effect scaffold validation evidence from 2026-05-13:

    bun run --cwd packages/local-runner test -- bounded-process
    Test Files  1 passed (1)
    Tests  7 passed (7)

    bun run --cwd packages/local-runner format:check
    All matched files use the correct format.

    bun run --cwd packages/local-runner lint
    Found 0 warnings and 0 errors.

    bun run --cwd packages/local-runner typecheck
    exited with code 0

    bun run --cwd packages/local-runner build
    dist/cli.js  1.6mb
    Done

    git diff --check -- bun.lock packages/local-runner/package.json packages/local-runner/src/core/bounded-process.ts packages/local-runner/tests/bounded-process.test.ts docs/programs/completed/2026-05-13-local-runner-node-effect-migration/current-planning-brief.txt docs/programs/completed/2026-05-13-local-runner-node-effect-migration/program.md MISTAKES.md
    exited with code 0

    no-index whitespace checks for new slice files
    exited with code 0

Remaining Effect migration tracking table:

| Step | Child ExecPlan | Primary Surfaces | Focused Validation |
| --- | --- | --- | --- |
| 2 | `docs/exec-plans/completed/2026-05-13-effect-process-codex-and-event-boundaries.md` | Codex execution, runner events, workflow-run API | `codex-exec-runner`, `runner-events`, `workflow-run-api`, `program-run-slice` |
| 3 | `docs/exec-plans/completed/2026-05-13-effect-filesystem-state-boundaries.md` | `.sbs` state, runner home, repository boundaries, Codex config, doctor artifacts | `local-state`, `codex-config-manager`, setup checks, doctor-pass artifacts |
| 4 | `docs/exec-plans/completed/2026-05-13-worker-workflow-module-split.md` | Worker install inspect, plan, apply, proof, report, templates, license, kickoff | `worker-foundations-install`, compatibility smoke, package smoke |
| 5 | `docs/exec-plans/completed/2026-05-13-worker-workflow-effect-migration.md` | Worker install result/event sync | `worker-foundations-install`, compatibility smoke, package smoke |
| 6 | `docs/exec-plans/completed/2026-05-14-worker-process-and-file-effect-boundaries.md` | Worker proof/process boundary | Worker install focused tests, compatibility smoke, package smoke, build |
| 7 | `docs/exec-plans/completed/2026-05-14-runner-orchestration-runtime-migration.md` | Program run slice orchestration | `program-run-slice`, format, lint, typecheck, build |
| 8 | `Runner Effect Completion And Docs Hardening` | Program packet, README, completed ExecPlans, full validation | full local-runner test, format, lint, typecheck, build, Worker compatibility smoke, package smoke, docs lint |

Filesystem state validation evidence from 2026-05-13:

    bun run --cwd packages/local-runner test -- local-state codex-config-manager doctor-pass setup-check bounded-process codex-exec-runner runner-events workflow-run-api
    Test Files  8 passed (8)
    Tests  62 passed (62)

    bun run --cwd packages/local-runner test
    Test Files  27 passed | 2 skipped (29)
    Tests  239 passed | 7 skipped (246)

    bun run --cwd packages/local-runner format:check
    All matched files use the correct format.

    bun run --cwd packages/local-runner lint
    Found 0 warnings and 0 errors.

    bun run --cwd packages/local-runner typecheck
    exited with code 0

    bun run --cwd packages/local-runner build
    dist/cli.js  1.7mb
    Done

Process, Codex, event, and workflow API validation evidence from 2026-05-13:

    bun run --cwd packages/local-runner test -- codex-exec-runner runner-events workflow-run-api bounded-process program-run-slice
    Test Files  5 passed (5)
    Tests  59 passed (59)

    bun run --cwd packages/local-runner test
    Test Files  27 passed | 2 skipped (29)
    Tests  232 passed | 7 skipped (239)

    bun run --cwd packages/local-runner format:check
    All matched files use the correct format.

    bun run --cwd packages/local-runner lint
    Found 0 warnings and 0 errors.

    bun run --cwd packages/local-runner typecheck
    exited with code 0

    bun run --cwd packages/local-runner build
    dist/cli.js  1.7mb
    Done

Worker workflow module split validation evidence from 2026-05-13:

    bun run --cwd packages/local-runner test -- worker-foundations-install
    Test Files  1 passed (1)
    Tests  36 passed (36)

    bun run --cwd packages/local-runner worker:compatibility-smoke
    worker install compatibility smoke passed (11 scenarios)

    bun run --cwd packages/local-runner build && bun run --cwd packages/local-runner package:smoke
    dist/cli.js  1.7mb
    package smoke passed

    bun run --cwd packages/local-runner format:check
    All matched files use the correct format.

    bun run --cwd packages/local-runner lint
    Found 0 warnings and 0 errors.

    bun run --cwd packages/local-runner typecheck
    exited with code 0

    bun run --cwd packages/local-runner build
    dist/cli.js  1.7mb
    Done

Worker workflow event-sync Effect boundary validation evidence from 2026-05-13:

    bun run --cwd packages/local-runner test -- worker-foundations-install
    Test Files  1 passed (1)
    Tests  37 passed (37)

    bun run --cwd packages/local-runner worker:compatibility-smoke
    worker install compatibility smoke passed (11 scenarios)

    bun run --cwd packages/local-runner build && bun run --cwd packages/local-runner package:smoke
    dist/cli.js  1.7mb
    package smoke passed

    bun run --cwd packages/local-runner format:check
    All matched files use the correct format.

    bun run --cwd packages/local-runner lint
    Found 0 warnings and 0 errors.

    bun run --cwd packages/local-runner typecheck
    exited with code 0

    bun run --cwd packages/local-runner build
    dist/cli.js  1.7mb
    Done

Runner orchestration runtime migration validation evidence from 2026-05-14:

    bun run --cwd packages/local-runner test -- program-run-slice
    Test Files  1 passed (1)
    Tests  19 passed (19)

    bun run --cwd packages/local-runner format:check
    All matched files use the correct format.

    bun run --cwd packages/local-runner lint
    Found 0 warnings and 0 errors.

    bun run --cwd packages/local-runner typecheck
    exited with code 0

    bun run --cwd packages/local-runner build
    dist/cli.js  1.7mb
    Done

Final docs hardening and closeout validation evidence from 2026-05-14:

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

This Program depends on `docs/programs/PROGRAMS.md`, `docs/exec-plans/PLANS.md`, `AGENTS.md`, `.vscode/settings.json`, `repos/effect/AGENTS.md`, `packages/local-runner/package.json`, `packages/local-runner/README.md`, `packages/local-runner/src/cli.ts`, `packages/local-runner/src/core/`, `packages/local-runner/src/workflows/worker-foundations-install/`, `packages/local-runner/tests/`, and the workspace lockfile.

Implementation slices that touch dependency manifests must update the matching lockfile and run the package dependency validation required by the repo instructions.
