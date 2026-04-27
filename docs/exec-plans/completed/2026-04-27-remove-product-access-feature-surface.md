---
title: Remove Product Access Feature Surface
status: complete
created_at: 2026-04-27
completed_at: 2026-04-27
summary: Delete the product-access feature folder by moving shared access types and server access orchestration to explicit owners without changing entitlement behavior.
post_build_recap: Product access types now live under apps/web/lib, server-only access orchestration now lives under apps/web/platform/access, and the old feature folder is deleted. Focused access tests, app format/lint/typecheck, Program/ExecPlan lint, markdown lint, and diff checks passed.
program_id: remove-feature-folder-surface
planning_brief: docs/programs/completed/2026-04-26-remove-feature-folder-surface/planning-brief-7.md
read_when:
  - Resuming the product-access feature-folder removal slice.
  - Checking why product access server orchestration lives under platform access.
  - Validating that no features/product-access references remain.
---

# Remove Product Access Feature Surface

This is a living execution plan for deleting the product-access feature folder.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Product access is an entitlement boundary, not a standalone UI feature. After this slice, client-safe access types should live in `apps/web/lib`, and server-only access orchestration should live under `apps/web/platform/access` with its `server-only` guard intact. The visible behavior should be unchanged: protected workspace routes still gate access, homepage visitors with access still resume correctly, checkout recovery still claims pending sessions, and Codex route helpers still reject unauthorized access.

## Progress

- [x] 2026-04-27 EDT: Created branch `codex/remove-product-access-feature-surface` from `main` at `3030b03`.
- [x] 2026-04-27 EDT: Read `docs/release-workflow.md` because product access is route-access and entitlement-sensitive.
- [x] 2026-04-27 EDT: Confirmed `features/product-access` contains one shared type file and one server-only orchestration file, with consumers in homepage redirect, workspace layout/access-required UI, checkout success, Codex route helpers, and unit tests.
- [x] 2026-04-27 EDT: Created planning brief 7 and this active child ExecPlan.
- [x] 2026-04-27 EDT: Moved shared product access types to `apps/web/lib/product-access.ts` and server-only access orchestration to `apps/web/platform/access/product-access.ts`.
- [x] 2026-04-27 EDT: Deleted `apps/web/features/product-access`; `rg '@/features/product-access|features/product-access' apps/web` returned no matches and `find apps/web/features/product-access -maxdepth 3 -type f` confirmed the folder is absent.
- [x] 2026-04-27 EDT: Focused access unit tests and integration-ui tests passed, followed by app format check, app lint, app typecheck, completed ExecPlan lint, Program lint, markdown lint, and `git diff --check`.

## Surprises & Discoveries

No surprises yet.

## Decision Log

Decision: Move shared product access types to `apps/web/lib/product-access.ts`.
Rationale: These types are imported by client and server code, so they must remain client-safe and cannot live beside a `server-only` guard.
Date: 2026-04-27

Decision: Move server product access orchestration to `apps/web/platform/access/product-access.ts`.
Rationale: The helper coordinates Clerk/Convex auth, Convex access reads, checkout session recovery, and resume redirects. `apps/web/platform/access` makes the platform entitlement boundary explicit while preserving the existing server-only guard.
Date: 2026-04-27

## Outcomes & Retrospective

This slice is complete. `apps/web/features/product-access` was deleted, client-safe product access types now live in `apps/web/lib/product-access.ts`, and server-only access orchestration now lives in `apps/web/platform/access/product-access.ts` with the `server-only` guard preserved. The focused proof covered server product-access behavior, protected layout wiring, access-required consumers, Codex route helper authorization, checkout success access-type consumers, app lint/typecheck, plan validation, and old-path import scans. Entitlement, checkout recovery, and route behavior were intentionally unchanged.

## Context and Orientation

`apps/web/features/product-access/lib/product-access.ts` defines `StoredProductAccessStatus`, `ProductAccessStatus`, and `ProductAccess`. These types are imported by client UI, server helpers, Codex route helpers, checkout success UI, and tests.

`apps/web/features/product-access/server/product-access.ts` starts with `import "server-only"`. It reads the current Convex-authenticated session, checks `api.access.viewerProductAccess`, claims pending checkout sessions when possible, reads the resume destination, and redirects already-granted homepage visitors. It imports checkout session recovery from `apps/web/features/checkout/server/checkout-session-recovery.ts`, the generated Convex API, and `getConvexServerSession` from `apps/web/platform/auth/convex-auth.ts`.

### In Scope

Move product access types to `apps/web/lib/product-access.ts`.

Move server product access orchestration to `apps/web/platform/access/product-access.ts`.

Update first-party imports in app routes, Codex route helpers, checkout success UI, access-required UI, and tests, then delete `apps/web/features/product-access`.

### Out Of Scope

Do not change billing, checkout, Stripe, webhook, pricing, promotion codes, environment behavior, Convex schema, generated Convex files, route screens, AppShell, shared UI inventory, checkout recovery semantics, entitlement semantics, or hosted release-proof behavior in this slice.

## Plan of Work

Create `apps/web/platform/access` if needed. Move the type file to `apps/web/lib/product-access.ts` and the server file to `apps/web/platform/access/product-access.ts`. Keep `import "server-only"` as the first statement in the server file and update its type import to the new library path.

Update all consumers from `@/features/product-access/lib/product-access` to `@/lib/product-access` and all consumers from `@/features/product-access/server/product-access` to `@/platform/access/product-access`. Keep checkout recovery imports unchanged.

Delete `apps/web/features/product-access` after all imports resolve, then run old-path scans and focused validation.

## Milestones

The first milestone is type ownership. It is complete when client and server consumers import product access types from `apps/web/lib/product-access.ts`.

The second milestone is server ownership. It is complete when homepage redirect, workspace layout, and tests import server access functions from `apps/web/platform/access/product-access.ts`, with the server-only guard preserved.

The third milestone is validation. It is complete when focused access tests, app format check, app lint, app typecheck, plan lint, Program lint, markdown lint, and `git diff --check` pass.

## Concrete Steps

From repo root, confirm branch and status:

    git status --short --branch

Run import scans after edits:

    rg '@/features/product-access|features/product-access' apps/web
    find apps/web/features/product-access -maxdepth 3 -type f

The first scan should return no matches. The second command should fail because the folder was deleted.

## Validation and Acceptance

Acceptance requires `apps/web/features/product-access` to be deleted, no old product-access feature imports to remain, and focused tests to prove server access, protected layout wiring, access-required consumers, and authorization behavior still work.

### Test Commands

Run these commands from repo root:

    bun run --cwd apps/web test:unit -- tests/unit/course-access.test.ts tests/unit/app-protected-layout.test.tsx tests/unit/access-required-page.test.tsx tests/unit/codex-route-helpers.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/access-required-page.test.tsx tests/integration-ui/checkout-success-view.test.tsx
    bun run --cwd apps/web format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-27-remove-product-access-feature-surface.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/active/2026-04-26-remove-feature-folder-surface docs/exec-plans/completed/2026-04-27-remove-product-access-feature-surface.md
    git diff --check

After this PR merges, inspect the `Production Release Proof` run for the merged `main` commit and confirm whether `billing_integration` ran or was intentionally skipped by release scope.

## Idempotence and Recovery

These are file moves and import updates. If a scan finds old paths, update the consumer to the new library or platform access owner instead of adding compatibility re-exports. If a server/client boundary fails, keep `ProductAccess` types in the client-safe library file and keep all functions that read cookies, call Convex with server tokens, or call `redirect` in the server-only platform file.

## Artifacts and Notes

Baseline import scan:

    rg '@/features/product-access|features/product-access|ProductAccess|getServerProductAccess|redirectGrantedHomeVisitor' apps/web/app apps/web/features apps/web/tests

The scan found consumers in `apps/web/app/page.tsx`, workspace layout/access-required UI, checkout success UI, Codex route helpers, and focused unit tests.

## Interfaces and Dependencies

Product access depends on `apps/web/platform/auth/convex-auth.ts`, Convex `api.access.viewerProductAccess`, Convex `api.blueprint.getBlueprintResumeDestination`, checkout session recovery in `apps/web/features/checkout/server/checkout-session-recovery.ts`, Next.js `redirect`, and the release workflow rule that checkout, entitlement, and access-handoff behavior need production proof after merge.
