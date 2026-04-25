---
title: Split Codex App-Server Route Boundary
status: complete
created_at: 2026-04-24
completed_at: 2026-04-24
summary: Separate lightweight Codex protocol, error, and service contracts from the spawn-capable runtime client used by App Router routes.
post_build_recap: Codex route handlers now import a route-facing service and lightweight contracts instead of defining route-local app-server dynamic import helpers. Runtime protocol and error contracts live outside the spawn-capable client, the runtime client remains the only process execution owner, and focused Codex route tests cover auth, malformed, unavailable-runtime, and success paths.
read_when:
  - Resuming the Codex app-server route boundary slice.
  - Changing Codex API route imports or app-server runtime modules.
program_id: sbs-runtime-boundary-hardening
planning_brief: docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/planning-brief-1.md
---

# Split Codex App-Server Route Boundary

This is a living execution plan. Keep it current as implementation, proof, and discoveries change the Codex route boundary.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Codex API routes should import lightweight server contracts, not route-local dynamic helpers that reach into spawn-capable runtime modules. After this slice, route handlers can return normal auth, validation, and unavailable-runtime responses without route-level `importCodexAppServer` helpers or `turbopackIgnore` dynamic imports.

## Progress

- [x] 2026-04-24 EDT: Created this child ExecPlan from `docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/planning-brief-1.md`.
- [x] 2026-04-24 EDT: Mapped six route-level `importCodexAppServer` helpers under `apps/web/app/api/codex/` and confirmed `app-server.ts` mixed contracts with spawn/process execution.
- [x] 2026-04-24 EDT: Split lightweight Codex app-server contracts into `apps/web/features/codex/server/app-server-contracts.ts`.
- [x] 2026-04-24 EDT: Added `apps/web/features/codex/server/app-server-service.ts` as the route-facing service boundary and removed route-level dynamic import helpers from all Codex API routes.
- [x] 2026-04-24 EDT: Added focused unavailable-runtime coverage to `apps/web/tests/integration/codex-route-handlers.test.ts`; route tests now cover auth, malformed payloads, disabled runtime, and successful generation/login/account paths.
- [x] 2026-04-24 EDT: Closed this plan after focused tests, lint, and diff checks. `bun run typecheck` compiled successfully but failed during TypeScript checking on unrelated dirty blueprint-flow work at `apps/web/features/blueprint-flow/components/blueprint-page-progress-sidebar.tsx:4`.

## Surprises & Discoveries

The source brief records the Codex reference pattern: protocol schema, transport parsing, dispatch, lifecycle ownership, telemetry, and process execution live in separate modules.

Initial static re-export from the route service still caused Turbopack to trace `app-server.ts` into Codex routes during `bun run typecheck`. Moving route-visible client shapes into the lightweight contract module removed the type dependency, and centralizing the ignored dynamic runtime import inside `app-server-service.ts` removed the Codex NFT trace warnings while keeping route files free of route-level dynamic import helpers.

## Decision Log

Decision: Split the boundary before replacing imports.
Rationale: Static-importing the current monolithic runtime module into every route would preserve the coupling that caused the footgun.
Date: 2026-04-24

Decision: Keep one server-owned runtime loader in `app-server-service.ts`.
Rationale: Route files should not own spawn-capable imports or Turbopack ignore comments, but routes that execute Codex still need a runtime call boundary. The service centralizes that loader while lightweight contracts remain importable without `node:child_process`, `node:fs`, `homedir`, spawn, or observability side effects.
Date: 2026-04-24

## Outcomes & Retrospective

Completed on 2026-04-24. Codex app-server protocol, account/rate-limit response shapes, runtime error copy, disabled-runtime sentinel, and route-visible client contract now live in `apps/web/features/codex/server/app-server-contracts.ts`. `apps/web/features/codex/server/app-server.ts` now retains process execution, JSON-RPC transport, pending request lifecycle, per-user home setup, stderr escalation, and incident capture.

The route handlers under `apps/web/app/api/codex/` no longer define `importCodexAppServer` helpers and no route file contains a route-level `turbopackIgnore` dynamic import. Routes statically import `withCodexAppServerClient`, unavailable copy, and runtime-error classification from `apps/web/features/codex/server/app-server-service.ts`; that service owns the single ignored runtime import.

## Context and Orientation

The relevant route handlers live under `apps/web/app/api/codex/`. Shared server code lives under `apps/web/features/codex/server/`. The source brief specifically names `CodexRateLimitsResponse`, `CODEX_APP_SERVER_DISABLED_ERROR`, `CodexAppServerRuntimeError`, `isCodexAppServerRuntimeError`, and unavailable-message copy as candidates for a lightweight module.

The spawn-capable runtime client owns process execution, per-user `CODEX_HOME`, JSONL parsing, pending requests, stderr escalation, and incident capture. Routes should not import those responsibilities just to understand protocol shapes or unavailable-runtime errors.

### In Scope

In scope is separating lightweight Codex protocol, error, and route service contracts from the spawn-capable runtime client, removing route-level `importCodexAppServer` helpers, removing route-level `turbopackIgnore` dynamic imports, and focused route validation.

### Out Of Scope

Out of scope is rewriting the full Codex app-server runtime, changing product-level Codex UX, changing local process supervision semantics beyond route import boundaries, or removing runtime incident capture.

## Plan of Work

Start by mapping every `importCodexAppServer` and `turbopackIgnore` reference under `apps/web/app/api/codex` and `apps/web/features/codex/server`. Split lightweight protocol and error contracts into a server module with no `node:child_process`, `node:fs`, `homedir`, spawn, or observability side effects. Keep process execution and JSONL client code in the runtime module. Update route helpers and route handlers to import only the thin boundary. Then run focused route tests or add them where missing.

## Milestones

Milestone 1 maps current coupling. At the end, the plan records which routes import the runtime and which symbols need the lightweight boundary.

Milestone 2 creates the lightweight boundary. At the end, protocol and error symbols can be imported without process-spawn dependencies.

Milestone 3 updates routes. At the end, route-level `importCodexAppServer` helpers and `turbopackIgnore` dynamic imports are gone from `apps/web/app/api/codex`.

Milestone 4 validates behavior. At the end, unauthorized, forbidden, malformed, unavailable-runtime, and successful paths return normal responses through focused tests or route probes.

## Concrete Steps

1. Confirm the worktree and map current imports:

       cd /Users/parkerrex/Developer/ship-by-sunday
       git status --short
       rg -n "importCodexAppServer|turbopackIgnore" apps/web/app/api/codex apps/web/features/codex/server

2. Inspect the app-server runtime and route helpers:

       sed -n '1,260p' apps/web/features/codex/server/app-server.ts
       sed -n '1,260p' apps/web/features/codex/server/route-helpers.ts

3. Create or update a lightweight Codex server contract module and move protocol and error symbols there.

4. Update route helpers and route handlers to import only the lightweight boundary unless the route intentionally executes the runtime through a server-owned service.

5. Run focused validation and record the exact results in this plan.

## Validation and Acceptance

This slice is complete when Codex API routes no longer define route-level `importCodexAppServer` helpers, no route under `apps/web/app/api/codex` uses a route-level `turbopackIgnore` dynamic import, lightweight protocol and error contracts are separated from process execution, and focused proof covers normal auth and runtime-unavailable responses.

### Test Commands

Run these commands from `/Users/parkerrex/Developer/ship-by-sunday`:

       rg -n "importCodexAppServer|turbopackIgnore" apps/web/app/api/codex apps/web/features/codex/server
       bun run --cwd apps/web test:integration:node -- tests/integration/codex-route-handlers.test.ts
       bun run --cwd apps/web typecheck
       bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-split-codex-app-server-route-boundary.md
       bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-24-split-codex-app-server-route-boundary.md
       git diff --check

If the existing route test filename differs, run the actual focused Codex route test and record the exact command before closing the plan.

### Validation Results

Commands run from `/Users/parkerrex/Developer/ship-by-sunday`:

       rg -n "importCodexAppServer|turbopackIgnore" apps/web/app/api/codex apps/web/features/codex/server

Result: passed for the route boundary. No `importCodexAppServer` references remain, and no `turbopackIgnore` references remain under `apps/web/app/api/codex`. Remaining matches are the centralized service loader at `apps/web/features/codex/server/app-server-service.ts:19` and existing spawn/runtime internals in `apps/web/features/codex/server/app-server.ts`.

       bun run --cwd apps/web test:integration:node -- tests/integration/codex-route-handlers.test.ts

Result: passed. 1 test file and 29 tests passed.

       bun run --cwd apps/web test:unit -- tests/unit/codex-app-server-runtime.test.ts

Result: passed. 1 test file and 2 tests passed.

       bun run format:check

Result: passed. All matched files use the correct format.

       bun run lint

Result: passed. Found 0 warnings and 0 errors.

       bun run typecheck

Result: failed on unrelated dirty blueprint-flow work after the Next build compiled successfully. Error: `apps/web/features/blueprint-flow/components/blueprint-page-progress-sidebar.tsx:4` imports missing `BlueprintPageSectionStatus` from `@/features/blueprint-flow/hooks/use-blueprint-page-state`.

       bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-split-codex-app-server-route-boundary.md

Result: passed. The completed child ExecPlan linted `ok`.

       bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-24-split-codex-app-server-route-boundary.md docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/program.md docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/dependency-graph.md

Result: passed. The completed child ExecPlan and Program document linted `ok`; the dependency graph path produced no lint error.

       bun run programs:lint

Result: passed. Program docs, packets, and prompt inventory all linted `ok`.

       git diff --check

Result: passed.

## Idempotence and Recovery

The safest path is additive: introduce the lightweight boundary, move imports, then delete obsolete route helpers after tests pass. If a static import unexpectedly pulls in process-spawn code, stop and split the module further instead of adding another dynamic import workaround.

## Artifacts and Notes

Program source:

       docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/planning-brief-1.md

Codex reference principle:

       Protocol schema, transport, dispatch, lifecycle ownership, telemetry, and process execution stay separate.

## Interfaces and Dependencies

This plan depends on Next App Router route handlers, the local Codex app-server runtime, the web app's Codex server modules, and the focused integration or route-handler test runner.
