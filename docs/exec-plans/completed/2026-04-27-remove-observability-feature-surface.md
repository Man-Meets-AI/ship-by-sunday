---
title: Remove Observability Feature Surface
status: complete
created_at: 2026-04-27
completed_at: 2026-04-27
summary: Delete the observability feature folder by moving route UI, shared incident models, server observability helpers, and runtime export code to explicit owners without changing reporting behavior.
post_build_recap: App error UI now lives under app private components, shared observability models and export helpers live under lib, server reporting helpers live under platform observability, and the old observability feature folder is deleted. Focused observability tests, app format/lint/typecheck, Program/ExecPlan lint, markdown lint, and diff checks passed.
program_id: remove-feature-folder-surface
planning_brief: docs/programs/completed/2026-04-26-remove-feature-folder-surface/planning-brief-10.md
read_when:
  - Resuming the observability feature-folder removal slice.
  - Checking why observability helpers live under lib and platform owners.
  - Validating that no features/observability references remain.
---

# Remove Observability Feature Surface

This is a living execution plan for deleting the observability feature folder.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Observability is cross-cutting platform infrastructure, not a product feature folder. After this slice, App Router error UI should live beside the app, client-safe incident models should live under `apps/web/lib/observability`, and server ingest/capture helpers should live under `apps/web/platform/observability`. The visible and operational behavior must not change: error screens still render, client and server errors still normalize to the same incident shape, webhook adapters still produce the same incidents, request IDs still propagate, and runtime intake exports still group incidents the same way.

## Progress

- [x] 2026-04-27 EDT: Created branch `codex/remove-observability-feature-surface` from verified `main` at `5f6b1c3`.
- [x] 2026-04-27 EDT: Read `docs/release-workflow.md` earlier in this delivery run and reread Convex generated AI guidelines because this slice updates Convex runtime imports.
- [x] 2026-04-27 EDT: Confirmed `features/observability` contains sixteen files: two app error UI components, shared incident and error-event models, client reporting, Stripe webhook incident helpers, server capture and ingest helpers, request ID helpers, source adapters, incident status update, Telegram rendering, and runtime intake export helpers.
- [x] 2026-04-27 EDT: Created planning brief 10 and this active child ExecPlan.
- [x] 2026-04-27 EDT: Moved app error UI to `apps/web/app/_components`, shared observability helpers to `apps/web/lib/observability`, and server helpers to `apps/web/platform/observability`.
- [x] 2026-04-27 EDT: Deleted `apps/web/features/observability`; old-path import scans returned no app or script matches, and Convex schema/generated files remain untouched.
- [x] 2026-04-27 EDT: Focused observability unit, integration, and integration-ui tests passed, followed by app format check, app lint, app typecheck, and `git diff --check`.
- [x] 2026-04-27 EDT: Completed ExecPlan lint, Program lint, and markdown lint after archiving the plan.

## Surprises & Discoveries

Local focused tests that render motion-backed observability screens can load nested React peer dependencies from `motion` or `framer-motion`. This is a local test-runner dependency-layout issue, not intended app behavior. The focused UI tests should mock `motion/react` so they validate observability rendering and reporting without depending on a second React renderer.

`apps/web/convex/http.ts`, `apps/web/convex/observability/model.ts`, and `apps/web/convex/observability/validators.ts` import shared incident helpers from `features/observability`. This slice may update those imports to `apps/web/lib/observability`, but must not edit `apps/web/convex/schema.ts` or generated Convex files.

## Decision Log

Decision: Move route error UI to `apps/web/app/_components`.
Rationale: `ErrorBoundaryScreen` and `NotFoundScreen` are app-level route UI used by App Router error and not-found files, not observability domain state.
Date: 2026-04-27

Decision: Move shared incident models and pure helpers to `apps/web/lib/observability`.
Rationale: These modules are imported by client code, server code, Convex runtime files, tests, and scripts. They must remain environment-neutral and client-safe unless a specific helper is server-only.
Date: 2026-04-27

Decision: Move server capture, ingest, request ID, API response, source adapter, and incident status helpers to `apps/web/platform/observability`.
Rationale: These helpers coordinate server-only reporting, route handler responses, external delivery, and source-specific adapters. Platform ownership makes that operational boundary explicit.
Date: 2026-04-27

## Outcomes & Retrospective

This slice is complete. `apps/web/features/observability` was deleted. App error UI now lives under `apps/web/app/_components`. Client-safe incident models, client reporting, Stripe webhook incident helpers, Telegram rendering, and runtime intake export helpers now live under `apps/web/lib/observability`. Server capture, ingest, request ID, API response, source adapter, and incident status helpers now live under `apps/web/platform/observability`. Error UI, incident normalization, server capture, source adapters, Convex incident ingest, Telegram rendering, runtime intake export behavior, Convex schema, and generated Convex files were intentionally unchanged.

## Context and Orientation

`apps/web/features/observability/components/error-boundary-screen.tsx` and `not-found-screen.tsx` are client components consumed by App Router error and not-found files. They use shared UI buttons, route config, workspace display config, `motion/react`, and client reporting.

`apps/web/features/observability/lib` contains client-safe incident and error-event models plus client error reporting and Stripe webhook incident mapping. These are imported by app code, Convex runtime files, tests, and scripts.

`apps/web/features/observability/server` contains route-handler and server reporting helpers. `capture-server-error.ts` and `ingest-error-event.ts` already start with `import "server-only"` and must keep that guard. Source adapters for Clerk, Stripe, and Vercel build incident payloads for release and webhook surfaces.

`apps/web/features/observability/export/runtime-intake.mjs` builds the engineering intake export used by `apps/web/scripts/export-runtime-intake.mjs`. `apps/web/features/observability/telegram/render-incident-message.ts` formats incident notifications used by Convex observability delivery.

### In Scope

Move app error UI to `apps/web/app/_components`.

Move shared observability models, client reporting, Stripe webhook incident helpers, Telegram rendering, and runtime intake export helpers to `apps/web/lib/observability`.

Move server observability helpers and source adapters to `apps/web/platform/observability`.

Update first-party imports in app routes, API routes, Convex runtime files, tests, scripts, instrumentation, proxy, and coverage config, then delete `apps/web/features/observability`.

### Out Of Scope

Do not change billing, checkout, Stripe checkout, webhook behavior, pricing, promotion-code behavior, environment behavior, Convex schema, generated Convex files, AppShell, route screen behavior, shared UI inventory, incident payload schemas, incident status values, Telegram message content, runtime intake schema, or production release proof semantics.

## Plan of Work

Create `apps/web/app/_components`, `apps/web/lib/observability`, `apps/web/lib/observability/telegram`, and `apps/web/platform/observability/source-adapters` if needed. Move the two app UI components into the App Router component folder and update App Router error/not-found imports.

Move client-safe shared helpers into `apps/web/lib/observability`. Update relative imports inside those files so `error-event.ts`, `client-error-report.ts`, `stripe-webhook-incident.ts`, and `telegram/render-incident-message.ts` reference the new library owner.

Move server helpers into `apps/web/platform/observability`. Keep `import "server-only"` at the top of `capture-server-error.ts` and `ingest-error-event.ts`. Update source adapters to import shared incident types and Stripe webhook mapping from the new library owner.

Update all first-party imports and test mocks away from `@/features/observability` or relative Convex feature paths. Update `apps/web/vitest.config.ts` coverage includes from the old feature folder to the new app, library, and platform owners. Add focused test mocks for `motion/react` where local tests render motion-backed error UI.

Delete `apps/web/features/observability`, run old-path scans, and run focused validation.

## Milestones

The first milestone is route UI ownership. It is complete when error and not-found screens live under `apps/web/app/_components` and App Router files import them from there.

The second milestone is library and platform ownership. It is complete when shared incident models and client-safe helpers live under `apps/web/lib/observability`, server helpers live under `apps/web/platform/observability`, and Convex runtime imports point only at the shared library owner.

The third milestone is feature-folder deletion. It is complete when `apps/web/features/observability` is absent and no app, script, or test code imports `@/features/observability` or relative `features/observability` paths.

The fourth milestone is validation. It is complete when focused observability unit, integration, and UI tests pass, followed by app format check, app lint, app typecheck, plan lint, Program lint, markdown lint, and `git diff --check`.

## Concrete Steps

From repo root, confirm branch and status:

    git status --short --branch

Run import scans after edits:

    rg '@/features/observability|features/observability|\\.\\./features/observability|\\.\\./\\.\\./features/observability' apps/web scripts
    find apps/web/features/observability -maxdepth 4 -type f

The first scan should return no app or script matches. The second command should fail because the folder was deleted.

## Validation and Acceptance

Acceptance requires `apps/web/features/observability` to be deleted, old observability feature imports to be gone from app and script code, server-only guards to remain on capture and ingest helpers, Convex schema/generated files to remain untouched, and focused tests to prove request IDs, API error responses, capture/ingest, source adapters, incident models, runtime intake, route handlers, proxy capture, and error UI still work.

### Test Commands

Run these commands from repo root:

    bun run --cwd apps/web test:unit -- tests/unit/not-found-screen.test.tsx tests/unit/observability-api-error-response.test.ts tests/unit/observability-capture-server-error.test.ts tests/unit/observability-client-report.test.ts tests/unit/observability-error-event.test.ts tests/unit/observability-incident-helpers.test.ts tests/unit/observability-incident-status.test.ts tests/unit/observability-ingest.test.ts tests/unit/observability-request-id.test.ts tests/unit/observability-source-adapters.test.ts tests/unit/proxy-protected-routes.test.ts tests/unit/runtime-intake-export.test.ts tests/unit/stripe-observability.test.ts tests/unit/clerk-webhook-adapter.test.ts tests/unit/vercel-webhook-adapter.test.ts
    bun run --cwd apps/web test:integration -- tests/integration/observability-client-error-route.test.ts tests/integration/observability-clerk-route.test.ts tests/integration/observability-vercel-route.test.ts tests/integration/observability-incident-status-route.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/error-boundary-screen.test.tsx
    bun run --cwd apps/web format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-27-remove-observability-feature-surface.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/active/2026-04-26-remove-feature-folder-surface docs/exec-plans/completed/2026-04-27-remove-observability-feature-surface.md
    git diff --check

After this PR merges, inspect the `Production Release Proof` run for the merged `main` commit and confirm `default_ship` passes. `billing_integration` is not expected unless release scope marks the slice billing-sensitive through changed checkout, Stripe, entitlement, webhook, or access-handoff paths.

## Idempotence and Recovery

These are file moves and import updates. If a scan finds old paths, update the consumer to the new app, library, or platform owner instead of adding compatibility re-exports. If Convex runtime typechecking fails, keep the shared incident model in `apps/web/lib/observability` and update relative imports from Convex runtime files without touching `apps/web/convex/schema.ts` or generated Convex files.

If local UI tests fail with invalid hook calls from `motion` or `framer-motion`, mock `motion/react` in the focused test file rather than changing runtime UI behavior. If route handler tests fail, compare response status, request ID headers, and captured incident payloads to the previous tests before changing behavior.

## Artifacts and Notes

Implementation import scan:

    rg '@/features/observability|features/observability|\.\./features/observability|\.\./\.\./features/observability' apps/web scripts

The scan returns no matches. `git diff --name-only -- apps/web/convex/schema.ts apps/web/convex/_generated` also returns no matches, confirming this slice did not touch Convex schema or generated files.

## Interfaces and Dependencies

Observability depends on Next.js App Router error and not-found files, `next/server` responses, `next/navigation` pathname reads, Clerk and Vercel webhook payloads, Stripe webhook result mapping, Convex HTTP actions and internal observability functions, `apps/web/platform/env/server.ts`, `apps/web/platform/billing/stripe.ts`, `apps/web/scripts/export-runtime-intake.mjs`, `scripts/release/lib/engineering-intake-contract.mjs`, and production release proof workflows that consume incident and runtime export evidence.
