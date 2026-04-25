---
title: Remove Runtime Footguns
status: complete
created_at: 2026-04-23
completed_at: 2026-04-24
summary: Remove recurring runtime failure classes around client observability, bonus lesson tracking, Codex API imports, sitemap dependencies, and docs route behavior.
post_build_recap: This oversized implementation plan was retired as a single execution contract and superseded by a dedicated runtime-boundary Program that will split observability transport, bonus lesson tracking, Codex app-server boundaries, and public metadata routes into smaller child slices.
read_when:
  - Resuming runtime hardening work.
  - Investigating recurring client observability, Codex route, public metadata, or bonus lesson incidents.
  - Validating the next Ship by Sunday recovery slice after CI/CD correction.
program_id: sbs-codebase-recovery
planning_brief: docs/programs/active/2026-04-23-sbs-codebase-recovery/planning-brief-1.md
---

# Remove Runtime Footguns

This is a living execution plan. Keep it current as implementation, proof, and discoveries change the runtime hardening path.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The runtime should fail in ordinary, diagnosable ways. The review found recurring classes where the app can instead produce self-amplifying telemetry noise, auth timing failures, bundling crashes, or public-route breakage caused by heavy dependency graphs. After this plan, client error reporting should not create new unhandled errors, bonus lesson viewed tracking should not depend on client Convex auth hydration, Codex API routes should not crash from fragile imports, and public metadata routes should have smaller, explicit runtime boundaries.

This plan is retired as a single execution contract. Execution moved to `docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/`, which splits this source brief into focused child ExecPlans for client observability transport, bonus lesson tracking, Codex app-server route boundaries, and public metadata routes.

## Progress

- [x] 2026-04-23 EDT: Identified runtime footguns from the read-only review and prior incident patterns.
- [x] 2026-04-24 EDT: Selected this as the next recovery slice after CI/CD correction because release/intake control-plane repair is deferred to a dedicated Program.
- [x] 2026-04-24 EDT: Ran a parallel read-only Codex reference analysis against `/Users/parkerrex/Developer/Codex` and folded the app-server, observability, runtime-boundary, and SBS readiness findings into this plan.
- [x] 2026-04-24 EDT: Retired this oversized ExecPlan as a single implementation contract because a dedicated runtime-boundary Program now owns the smaller child slices.
- [x] 2026-04-24 EDT: Closure validation: `bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-23-remove-runtime-footguns.md` passed; `bun run markdown:lint -- --paths docs/programs/active/2026-04-23-sbs-codebase-recovery/program.md docs/programs/active/2026-04-23-sbs-codebase-recovery/dependency-graph.md docs/exec-plans/completed/2026-04-23-remove-runtime-footguns.md docs/exec-plans/active/2026-04-23-reconcile-product-route-contract.md` passed for this plan; `git diff --check -- docs/programs/active/2026-04-23-sbs-codebase-recovery/program.md docs/programs/active/2026-04-23-sbs-codebase-recovery/dependency-graph.md docs/exec-plans/completed/2026-04-23-remove-runtime-footguns.md docs/exec-plans/active/2026-04-23-reconcile-product-route-contract.md` passed. `bun run programs:lint` reported the owning `sbs-codebase-recovery` packet as ok but failed on the unrelated active `sbs-codex-release-reset` packet.
- [x] 2026-04-24 EDT: Superseding Program validation: `bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-23-remove-runtime-footguns.md` passed after this file was linked to `docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/`. The requested active-path lint failed with `ENOENT` because this file now lives under `docs/exec-plans/completed/`.
- [ ] Deferred to the dedicated runtime-boundary Program: harden client observability browser transport.
- [ ] Deferred to the dedicated runtime-boundary Program: move bonus lesson viewed tracking to an authenticated server write path.
- [ ] Deferred to the dedicated runtime-boundary Program: replace fragile Codex route dynamic imports.
- [ ] Deferred to the dedicated runtime-boundary Program: reduce public sitemap dependencies and make docs route behavior explicit.
- [ ] Deferred to the dedicated runtime-boundary Program: run focused runtime tests, route smoke where practical, and repo closeout checks.

## Surprises & Discoveries

The review found that several known incident patterns still exist together. None of them requires a product redesign. They are boundary problems: client reporting should be safe when offline, server writes should own auth-sensitive mutations, route handlers should import stable server modules, and public metadata routes should avoid private or heavy graphs.

The Codex reference analysis showed the useful pattern to copy. Codex keeps protocol shapes, transport parsing, request dispatch, thread or turn ownership, event translation, telemetry, and process execution in separate modules. It also treats analytics and observability as best-effort side channels with bounded queues, timeouts, and warning-only failure paths. Apply that shape here: route handlers should authenticate and validate first, call narrow server-owned adapters, and return explicit status or error categories. They should not dynamically import spawn-capable runtime modules or let observability failures create the next user-visible failure.

The original plan named `apps/web/features/course/lesson/components/bonus-lesson-view-tracker.tsx`, but that path does not exist. The live tracker is `apps/web/features/execute-ship/components/bonus-lesson-view-tracker.tsx`, and the existing test is `apps/web/tests/integration-ui/bonus-lesson-view-tracker.test.tsx`.

## Decision Log

Decision: Keep runtime hardening separate from route-contract reconciliation.
Rationale: These fixes should make current behavior stable without first deciding the product route model.
Date: 2026-04-23

Decision: Prefer server-authenticated bonus lesson tracking over a client Convex mutation.
Rationale: The failure mode is an auth hydration race. Moving the write to a server boundary removes the race instead of hiding it with retries.
Date: 2026-04-23

Decision: Keep telemetry transport fire-and-forget.
Rationale: Observability must never create user-visible failures or recursive unhandled rejections.
Date: 2026-04-23

Decision: Execute runtime footgun removal before release/intake repair.
Rationale: Release and intake control-plane repair is deferred to a dedicated Program, while runtime hardening can proceed independently after the CI/CD correction and creates a better foundation for later observability data-contract work.
Date: 2026-04-24

Decision: Follow Codex's runtime boundary split instead of merely replacing dynamic imports with static imports.
Rationale: Static-importing the current monolithic `apps/web/features/codex/server/app-server.ts` into every route would preserve too much route-level coupling to process spawning, JSON-RPC transport, and incident capture. Codex separates typed protocol contracts from runtime process ownership, so this slice should first split a lightweight Codex app-server contract or service boundary from the spawn-capable runtime client, then have routes import only the thin boundary.
Date: 2026-04-24

Decision: Treat observability transport as a best-effort side channel.
Rationale: Codex analytics uses bounded queues, timeout-protected sends, and warning-only failures. Ship by Sunday's browser error reporting should follow the same invariant: reporting can explain a failure, but it must never create another unhandled rejection or block the user action.
Date: 2026-04-24

Decision: Retire this ExecPlan as a single implementation contract.
Rationale: The plan contains four distinct implementation lanes with different write sets and validation risks. A dedicated runtime-boundary Program can coordinate those lanes without turning one ExecPlan into a broad cleanup vehicle.
Date: 2026-04-24

## Outcomes & Retrospective

This ExecPlan is complete as a retired planning artifact, not as implemented runtime behavior. The implementation work moved to a dedicated runtime-boundary Program so client observability transport, bonus lesson tracking, Codex app-server route boundaries, and public metadata route hardening can each land as smaller child slices with focused validation. No runtime code was changed by closing this ExecPlan.

## Context and Orientation

The runtime surfaces in scope are distributed across client observability, bonus lesson tracking, App Router route handlers, and public metadata routes. The main review seams are `apps/web/features/observability/lib/client-error-report.ts`, `apps/web/features/execute-ship/components/bonus-lesson-view-tracker.tsx`, `apps/web/app/api/codex/*/route.ts`, `apps/web/app/sitemap.ts`, and `apps/web/app/docs/[[...mdxPath]]/page.tsx`.

Client observability reports browser errors to the app. Bonus lesson view tracking marks bonus lessons viewed. Codex routes expose local app-server behavior through route handlers. Sitemap and docs routes are public surfaces and should keep their dependency graph small.

### In Scope

In scope is hardening browser error-report fetches, adding or using a server-authenticated path for bonus lesson viewed tracking, splitting the Codex app-server contract from the spawn-capable runtime client before replacing fragile dynamic route imports, reducing sitemap dependency graph risk, and making docs catch-all static behavior explicit.

### Out Of Scope

Out of scope is redesigning the lesson experience, changing the product route contract, refactoring all App Router layouts, replacing the observability data model, or changing public marketing content beyond what is needed for runtime stability.

## Plan of Work

Start with observability transport because it is the smallest and safest runtime fix. Update the fallback fetch path in `apps/web/features/observability/lib/client-error-report.ts` so it is explicitly fire-and-forget and catches network failures with `.catch(() => undefined)`. Extend `apps/web/tests/unit/observability-client-report.test.ts` with a rejected-fetch regression so a future transport failure cannot become an `unhandledrejection`.

Next move bonus lesson viewed tracking to a server-authenticated write. Inspect `apps/web/convex/_generated/ai/guidelines.md` before changing any Convex code. Add a narrow route handler or server action that authenticates the viewer, validates the `lessonKey`, and calls the existing idempotent Convex mutation or a new server-side mutation helper. Update `apps/web/features/execute-ship/components/bonus-lesson-view-tracker.tsx` to call the server boundary instead of `useConvexAuth` and `useMutation` on mount. Keep the component focused on lifecycle triggering, not auth ownership. The server boundary owns the authoritative viewed result; the client trigger can be best-effort, but it must not depend on Convex auth hydration.

Then update Codex API route imports by splitting the server boundary first. Do not static-import the current monolithic `apps/web/features/codex/server/app-server.ts` from every route. Move `CodexRateLimitsResponse`, `CODEX_APP_SERVER_DISABLED_ERROR`, `CodexAppServerRuntimeError`, `isCodexAppServerRuntimeError`, and the unavailable-message copy into a lightweight server module that has no `node:child_process`, `node:fs`, `homedir`, spawn, or observability side effects. Keep the spawn and JSONL client in a separate runtime module. Ensure `apps/web/features/codex/server/route-helpers.ts` does not type-import from the spawn-capable runtime module. Then replace the local `importCodexAppServer()` helpers in `apps/web/app/api/codex/**/route.ts` with static imports into a thin route or service boundary. Test that unauthorized, forbidden, malformed, unavailable-runtime, and successful paths return normal responses without route-level dynamic imports or module-resolution crashes.

Finally simplify public metadata routes. Keep `apps/web/app/sitemap.ts` dependent only on what it needs to generate URLs and last-modified data. If the current blog or docs loaders pull in rendering, Nextra, customer repo, entitlement, or other heavy runtime graphs, introduce a lightweight route-metadata or filesystem-index helper and have sitemap consume that instead. Set explicit docs catch-all behavior in `apps/web/app/docs/[[...mdxPath]]/page.tsx` so the route does not rely on hidden defaults.

## Milestones

Milestone 1 makes observability transport safe. At the end, failed client error reporting cannot create another unhandled client error, and a focused test or manual proof demonstrates that failure is swallowed.

Milestone 2 moves bonus lesson tracking to a server boundary. At the end, the client no longer uses Convex auth timing to mark viewed state, and tests or a route probe prove unauthorized, forbidden, valid, and idempotent behavior.

Milestone 3 stabilizes Codex route imports and boundaries. At the end, route handlers import only a thin server boundary, protocol and error contracts are separated from the spawn-capable runtime client, no `importCodexAppServer` or route-level `turbopackIgnore` dynamic imports remain under `apps/web/app/api/codex`, and unauthenticated probes return normal responses without touching the runtime client.

Milestone 4 hardens public metadata routes. At the end, sitemap and docs route behavior is explicit, metadata routes avoid heavy rendering graphs, and focused tests or build-backed proof cover `/sitemap.xml` and `/docs/local-setup`.

Milestone 5 validates the runtime slice. At the end, focused tests, build or route probes, plan lint, markdown lint, and repo quality checks have passed or blockers are recorded.

## Concrete Steps

1. Confirm the current touched files and avoid reverting unrelated dirty work:

       cd /Users/parkerrex/Developer/ship-by-sunday
       git status --short

2. Add a focused rejected-fetch test in `apps/web/tests/unit/observability-client-report.test.ts`. Then update `apps/web/features/observability/lib/client-error-report.ts` so every browser `fetch` path catches failures.

3. Inspect `apps/web/convex/_generated/ai/guidelines.md` before changing Convex code. Add the narrow server route or helper needed for bonus lesson viewed tracking, then update `apps/web/features/execute-ship/components/bonus-lesson-view-tracker.tsx` to call it. Update `apps/web/tests/integration-ui/bonus-lesson-view-tracker.test.tsx` and add route-level tests for the new server boundary.

4. Split the Codex app-server boundary before changing route imports. Create or update a lightweight contract/service module for protocol types, runtime error helpers, and unavailable-message copy. Keep process spawning, per-user `CODEX_HOME` creation, JSONL parsing, pending request tracking, stderr escalation, and incident capture in the runtime module. Update `apps/web/features/codex/server/route-helpers.ts` so it does not import from the spawn-capable runtime module. Then replace all route-local `importCodexAppServer()` helpers with static imports into the thin boundary. Run `rg -n "importCodexAppServer|turbopackIgnore" apps/web/app/api/codex apps/web/features/codex/server` and confirm the only remaining `turbopackIgnore` references, if any, are inside the spawn-capable runtime module.

5. Slim `apps/web/app/sitemap.ts` imports and set explicit docs catch-all behavior. Verify the metadata routes through build-backed tests or route probes for `/sitemap.xml` and `/docs/local-setup`.

6. Run focused validation:

       cd /Users/parkerrex/Developer/ship-by-sunday
       bun run --cwd apps/web test:unit -- tests/unit/observability-client-report.test.ts
       bun run --cwd apps/web test:integration:ui -- tests/integration-ui/bonus-lesson-view-tracker.test.tsx
       bun run --cwd apps/web test:integration:node -- tests/integration/codex-route-handlers.test.ts
       rg -n "importCodexAppServer|turbopackIgnore" apps/web/app/api/codex apps/web/features/codex/server
       bun run --cwd apps/web typecheck

   If implementation adds different focused route tests for bonus lesson tracking, sitemap, or docs routing, run those exact files too and record the commands in `Progress`. The `rg` command should show no route-level `importCodexAppServer` helper and no route-level `turbopackIgnore` dynamic import under `apps/web/app/api/codex`.

7. Run plan and closeout validation:

       cd /Users/parkerrex/Developer/ship-by-sunday
       bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-23-remove-runtime-footguns.md
       bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-23-remove-runtime-footguns.md
       git diff --check
       bun run format
       bun run lint
       bun run typecheck

## Validation and Acceptance

This slice is complete when failed client observability requests are swallowed, bonus lesson viewed tracking is server-authenticated, Codex routes no longer depend on fragile dynamic alias imports or a monolithic route-imported runtime module, sitemap and docs public routes have explicit low-risk runtime boundaries, and focused tests or route probes prove the behavior.

Acceptance for the Codex route work includes unauthorized, forbidden, and malformed requests returning normal `401`, `403`, and `400` responses without touching the Codex runtime client. Unavailable runtime paths must return a clear unavailable response instead of a module-resolution crash. The final diff must have no `importCodexAppServer` helper and no route-level `turbopackIgnore` dynamic import under `apps/web/app/api/codex`.

### Test Commands

Run these commands from `/Users/parkerrex/Developer/ship-by-sunday`:

       bun run --cwd apps/web test:unit -- tests/unit/observability-client-report.test.ts
       bun run --cwd apps/web test:integration:ui -- tests/integration-ui/bonus-lesson-view-tracker.test.tsx
       bun run --cwd apps/web test:integration:node -- tests/integration/codex-route-handlers.test.ts
       rg -n "importCodexAppServer|turbopackIgnore" apps/web/app/api/codex apps/web/features/codex/server
       bun run --cwd apps/web typecheck
       bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-23-remove-runtime-footguns.md
       bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-23-remove-runtime-footguns.md
       git diff --check
       bun run format
       bun run lint
       bun run typecheck

Also run the focused test files added or touched by this slice, especially any new bonus tracking route tests and sitemap/docs route proof. Record the exact commands in `Progress` before closing the plan.

## Idempotence and Recovery

The observability and route-handler changes should be additive and safe to rerun. Server-side bonus lesson tracking must not double-count or fail if the lesson is already marked viewed. If public metadata changes break the build, back out the dependency graph change and keep the explicit route behavior until a smaller import boundary is identified.

## Artifacts and Notes

Program source for this plan:

       docs/programs/active/2026-04-23-sbs-codebase-recovery/planning-brief-1.md

Superseding Program:

       docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/program.md

High-signal files from the review:

       apps/web/features/observability/lib/client-error-report.ts
       apps/web/features/execute-ship/components/bonus-lesson-view-tracker.tsx
       apps/web/app/api/codex/
       apps/web/app/sitemap.ts
       apps/web/app/docs/[[...mdxPath]]/page.tsx

Codex reference surfaces that shaped this plan:

       /Users/parkerrex/Developer/Codex/codex-rs/app-server-protocol/src/jsonrpc_lite.rs
       /Users/parkerrex/Developer/Codex/codex-rs/app-server-protocol/src/protocol/common.rs
       /Users/parkerrex/Developer/Codex/codex-rs/app-server/src/lib.rs
       /Users/parkerrex/Developer/Codex/codex-rs/app-server/src/transport/mod.rs
       /Users/parkerrex/Developer/Codex/codex-rs/app-server/src/codex_message_processor.rs
       /Users/parkerrex/Developer/Codex/codex-rs/app-server/src/bespoke_event_handling.rs
       /Users/parkerrex/Developer/Codex/codex-rs/analytics/src/client.rs
       /Users/parkerrex/Developer/Codex/codex-rs/analytics/src/events.rs
       /Users/parkerrex/Developer/Codex/sdk/typescript/src/exec.ts
       /Users/parkerrex/Developer/Codex/sdk/typescript/src/thread.ts

## Interfaces and Dependencies

This plan depends on Next App Router route-handler behavior, the hosted Convex dev model, Clerk authentication, and the existing course and observability APIs. Before changing Convex code, read `apps/web/convex/_generated/ai/guidelines.md` as required by the repo.
