---
title: Remove Codex Feature Surface
status: complete
created_at: 2026-04-27
completed_at: 2026-04-27
summary: Delete the Codex feature folder by moving Codex connection UI and app-server route/runtime helpers into explicit workspace, API, and platform owners without changing Codex behavior.
post_build_recap: Codex connection UI now lives under workspace private components, Codex API helpers live beside the API route tree, app-server runtime boundaries live under platform/codex, the old Codex feature folder is deleted, and focused Codex tests plus app format/lint/typecheck and plan validation passed.
program_id: remove-feature-folder-surface
planning_brief: docs/programs/completed/2026-04-26-remove-feature-folder-surface/planning-brief-12.md
read_when:
  - Resuming the Codex feature-folder removal slice.
  - Checking why Codex UI lives under workspace private folders.
  - Checking why Codex app-server helpers live under app API and platform folders.
  - Validating that no features/codex references remain.
---

# Remove Codex Feature Surface

This is a living execution plan for deleting the Codex feature folder.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Codex account connection and generation should be easy to find from the surfaces that own them. The connection card is workspace UI used by settings and workspace home. The API route helpers belong beside the `app/api/codex` route handlers, and the app-server client is a platform runtime adapter because it spawns the Codex binary and owns per-user process state. After this slice, `apps/web/features/codex` should be gone while the Settings card, workspace home card, Codex account routes, Codex generation route, app-server disabled-runtime handling, runtime incident classification, and production proof behavior remain unchanged.

## Progress

- [x] 2026-04-27 EDT: Created branch `codex/remove-codex-feature-surface` from verified `main` at `76578bf`.
- [x] 2026-04-27 EDT: Confirmed `features/codex` contains eleven files: five connection-card components, one client hook, one card state helper, and four server/app-server modules.
- [x] 2026-04-27 EDT: Read the repo Program and ExecPlan contracts, `apps/web/AGENTS.md`, `docs/release-workflow.md`, and local Next 16.2.0 docs for route handlers, private folders, and server-only boundaries. The app-local `apps/web/node_modules/next/dist/docs` path is absent because Next is hoisted at the repo root, so the equivalent docs were read from `node_modules/next/dist/docs`.
- [x] 2026-04-27 EDT: Created planning brief 12 and this active child ExecPlan.
- [x] 2026-04-27 EDT: Moved the Codex connection card, hook, and card model to `apps/web/app/(workspace)/_components/codex-connection-card`.
- [x] 2026-04-27 EDT: Moved Codex API route helpers to `apps/web/app/api/codex/_server/route-helpers.ts` and moved app-server contracts, service, and runtime to `apps/web/platform/codex`.
- [x] 2026-04-27 EDT: Deleted `apps/web/features/codex`; old-path import scans returned no app or script matches and Convex schema/generated files remained untouched.
- [x] 2026-04-27 EDT: Focused Codex route helper, runtime, settings, and workspace-home unit tests passed: 4 files and 14 tests.
- [x] 2026-04-27 EDT: Focused Codex route-handler integration test passed: 1 file and 29 tests.
- [x] 2026-04-27 EDT: App format check, app lint, and app typecheck passed. The typecheck build output still includes all Codex API routes under `/api/codex`.
- [x] 2026-04-27 EDT: ExecPlan lint, Program lint, markdown lint, Convex schema/generated diff check, and `git diff --check` passed.

## Surprises & Discoveries

`apps/web/node_modules/next/dist/docs` does not exist in this hoisted Bun install. The Next 16.2.0 package is at `node_modules/next`, and the relevant docs are available under `node_modules/next/dist/docs`. The guidance still applies: route handlers live under `app`, private `_folder` directories do not create URL segments, and `server-only` prevents accidental client imports of modules that depend on server credentials or runtime APIs.

The Codex app-server route split from the previous runtime-boundary work is important to preserve. `app-server-service.ts` owns the one ignored dynamic import of the spawn-capable runtime module; route handlers should keep importing that thin service boundary rather than importing the `node:child_process` runtime directly.

## Decision Log

Decision: Move the Codex connection card into `apps/web/app/(workspace)/_components/codex-connection-card`.
Rationale: The card is rendered only inside workspace home and settings surfaces. A workspace route-private component folder makes ownership explicit without creating a route segment.
Date: 2026-04-27

Decision: Move Codex API route helpers into `apps/web/app/api/codex/_server`.
Rationale: These helpers call Clerk, Convex, product-access checks, and route response helpers for the Codex API routes. Keeping them under the Codex API route tree clarifies that they are route-server helpers, not reusable client UI.
Date: 2026-04-27

Decision: Move Codex app-server contracts, service, and runtime client into `apps/web/platform/codex`.
Rationale: The app-server client is a platform adapter around the local Codex binary, per-user `CODEX_HOME`, JSON-RPC transport, runtime incidents, and environment-gated availability. It is not a product feature folder.
Date: 2026-04-27

## Outcomes & Retrospective

This slice is complete. `apps/web/features/codex` was deleted. The Codex connection card now lives under `apps/web/app/(workspace)/_components/codex-connection-card`, Codex route helpers live under `apps/web/app/api/codex/_server`, and Codex app-server contracts, the route-facing service, and the spawn-capable runtime client live under `apps/web/platform/codex`. Route handlers, settings, workspace home, tests, coverage config, and Next config now import the explicit owners. No Codex API response shape, route URL, runtime enablement behavior, Convex schema, generated Convex file, checkout path, or billing proof semantics changed.

## Context and Orientation

`apps/web/app/(workspace)/settings/_components/settings-page.tsx` and `apps/web/app/(workspace)/_components/workspace-home/workspace-home-setup-cards.tsx` render the Codex connection card. The card is a client component that calls Codex account API endpoints from `apps/web/app/api/_lib/api-route-config.ts`.

`apps/web/app/api/codex/account/login/start/route.ts`, `apps/web/app/api/codex/account/login/poll/route.ts`, `apps/web/app/api/codex/account/logout/route.ts`, `apps/web/app/api/codex/account/read/route.ts`, `apps/web/app/api/codex/account/rate-limits/route.ts`, and `apps/web/app/api/codex/generate/route.ts` are the route handlers that own the Codex HTTP surface. They run in the Node.js runtime and must keep their current response shapes, request-id headers, auth error mapping, product-access checks, run recording, and runtime incident handling.

`apps/web/features/codex/server/app-server-contracts.ts` currently contains route-visible protocol types, unavailable-runtime copy, and runtime error helpers. `apps/web/features/codex/server/app-server-service.ts` currently imports those contracts and owns the single `turbopackIgnore` dynamic import into the spawn-capable runtime. `apps/web/features/codex/server/app-server.ts` currently spawns the Codex binary, manages JSON-RPC requests, persists per-user state under a hashed home directory, and reports runtime incidents through platform observability. These boundaries must remain intact after the file move.

### In Scope

Move Codex connection card components, hook, and card state helpers to `apps/web/app/(workspace)/_components/codex-connection-card`, with domain-specific filenames and imports.

Move Codex API route helpers to `apps/web/app/api/codex/_server/route-helpers.ts`.

Move Codex app-server contracts, service boundary, and spawn-capable runtime client to `apps/web/platform/codex`, preserving server-only guards and the centralized ignored dynamic runtime import.

Update route handlers, workspace consumers, tests, coverage config, Next config, docs references, and import scans away from `@/features/codex`, then delete `apps/web/features/codex`.

### Out Of Scope

Do not change route URLs, API methods, response shapes, Codex app-server JSON-RPC method names, login polling semantics, runtime enablement environment variables, per-user state hashing, request-id behavior, observability incident semantics, product-access rules, Convex schema, generated Convex files, checkout, Stripe, pricing, promotion-code behavior, billing proof, AppShell, or production release proof semantics.

Do not move `apps/web/features/auth`, `apps/web/features/blueprint-flow`, `apps/web/features/course`, `apps/web/features/execute-ship`, `apps/web/features/marketing`, or `apps/web/features/workspace-shell` in this slice.

## Plan of Work

Create `apps/web/app/(workspace)/_components/codex-connection-card` and move the connection card component files there. Move the current card state helper into that folder as `codex-connection-card-model.ts`, and update the hook and child components to import from the new model file.

Create `apps/web/app/api/codex/_server/route-helpers.ts` and move the route helper module there. Keep `import "server-only"` at the top and preserve all exported functions and error constants so route handlers and tests can update their imports without behavior changes.

Create `apps/web/platform/codex` and move `app-server-contracts.ts`, `app-server-service.ts`, and `app-server.ts` there. Add `import "server-only"` to the service and runtime modules because they are server-only boundaries. Update the service dynamic import, runtime contract imports, route helper type import, Next config ignored path, Vitest coverage include, route handlers, and tests.

Delete `apps/web/features/codex`, run old-path scans, then run focused tests followed by app and Program validation.

## Milestones

The first milestone is workspace UI ownership. It is complete when the Codex connection card, hook, and model live under the workspace private component folder and settings/workspace home consumers import the new owner.

The second milestone is API and platform ownership. It is complete when route helpers live under `apps/web/app/api/codex/_server`, app-server contracts/service/runtime live under `apps/web/platform/codex`, and route handlers import only the thin service and route helper boundaries.

The third milestone is feature-folder deletion. It is complete when `apps/web/features/codex` is absent and import scans return no old Codex feature references under app code or scripts.

The fourth milestone is validation. It is complete when focused Codex, settings, and workspace-home tests pass, app format check, app lint, app typecheck, plan lint, Program lint, markdown lint, and `git diff --check` all pass.

## Concrete Steps

From repo root, confirm branch and status:

    git status --short --branch

After edits, run import scans:

    rg '@/features/codex|features/codex|\\.\\./features/codex|\\.\\./\\.\\./features/codex' apps/web scripts
    find apps/web/features/codex -maxdepth 4 -type f

The first scan should return no app or script matches. The second command should fail because the folder was deleted.

## Validation and Acceptance

Acceptance requires `apps/web/features/codex` to be deleted, all old Codex feature imports to be gone, server-only guards to protect Codex route helpers and platform app-server modules, the Codex route tests to prove account and generation behavior, and settings/workspace-home tests to prove the connection card consumer surface still renders. App typecheck must still build Codex API routes.

### Test Commands

Run these commands from repo root:

    bun run --cwd apps/web test:unit -- tests/unit/codex-route-helpers.test.ts tests/unit/codex-app-server-runtime.test.ts tests/unit/settings-page.test.tsx tests/unit/workspace-home-page.test.tsx
    bun run --cwd apps/web test:integration -- tests/integration/codex-route-handlers.test.ts
    bun run --cwd apps/web format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-27-remove-codex-feature-surface.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/active/2026-04-26-remove-feature-folder-surface docs/exec-plans/completed/2026-04-27-remove-codex-feature-surface.md
    git diff --check

After this PR merges, inspect the `Production Release Proof` run for the merged `main` commit and confirm `default_ship` and `release_gate` pass. `billing_integration` is not expected unless release scope marks the slice billing-sensitive through changed checkout, Stripe, entitlement, webhook, or access-handoff paths.

## Idempotence and Recovery

These are file moves and import updates. If a scan finds old paths, update the consumer to the new workspace, API, or platform owner instead of adding compatibility re-exports. If typecheck fails because a client component imports a server-only module, keep the server-only guard and move the shared type or model into the workspace card model or platform contract module rather than removing the guard.

If Codex route tests fail, compare the changed imports against the pre-move boundaries before changing route logic. The API response body, status codes, request-id headers, and persistence calls should not change in this slice.

## Artifacts and Notes

Initial import scan:

    rg '@/features/codex|features/codex|\.\./features/codex|\.\./\.\./features/codex' apps/web scripts docs

The scan shows consumers in Next config, Vitest coverage config, Codex API route handlers, connection-card internals, settings/workspace home consumers, focused Codex tests, and historical docs. App and script references should move to new owners. Historical completed plans and generated audit mirrors may keep old-path history unless a current docs surface needs an ownership update.

The final app/script scan should return no matches. `find apps/web/features/codex -maxdepth 4 -type f` should fail with `No such file or directory`. `git diff --name-only -- apps/web/convex/schema.ts apps/web/convex/_generated` should return no matches.

## Interfaces and Dependencies

The Codex connection surface depends on Next.js App Router private-folder conventions, the workspace settings and home screens, shadcn-style UI primitives, `apps/web/app/api/_lib/api-route-config.ts`, Clerk server auth, Convex `fetchQuery` and `fetchMutation`, product-access checks, `apps/web/platform/env/server.ts`, `apps/web/platform/observability`, the Codex app-server JSON-RPC protocol, `CODEX_APP_SERVER_ENABLED`, `CODEX_APP_SERVER_HOME_ROOT`, `CODEX_BINARY`, `CODEX_APP_SERVER_MODEL`, `CODEX_APP_SERVER_TIMEOUT_MS`, Vercel's Node.js runtime, and production release proof for the merged `main` commit.
