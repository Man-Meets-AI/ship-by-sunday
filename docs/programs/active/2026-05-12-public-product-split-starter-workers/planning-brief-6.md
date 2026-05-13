---
title: Protected Route Group Rename Planning Brief 6
program_id: public-product-split-starter-workers
brief_version: 6
status: current
summary: Rename the paid app Next.js route group from `(workspace)` to `(protected)` without changing URLs or access behavior.
read_when:
  - Resuming the protected route group rename.
  - Checking why the paid app route folder is named `(protected)`.
  - Validating that public Starter and Workers URLs stayed public.
---

# Protected Route Group Rename Planning Brief 6

Date: 2026-05-13.

This brief drives the child ExecPlan for renaming the paid app Next.js route group from `apps/web/app/(workspace)/` to `apps/web/app/(protected)/`.

## Outcome

The route folder name should make the pay-guarded boundary obvious. After the slice, runtime protected app routes live under `apps/web/app/(protected)/`, public marketing and support routes stay outside that group, and URLs remain unchanged because Next.js route groups are pathless.

## Scope

Move `apps/web/app/(workspace)/` to `apps/web/app/(protected)/`.

Update imports, test mocks, dynamic imports, docs references for current active docs, and route-boundary tests that name the route group path.

Update the Program and child ExecPlan after validation.

## Boundaries

Do not rename customer-facing URLs. `/home`, `/starter/home`, `/starter/lessons`, `/starter/generate-codebase`, `/workers/setup`, `/workers/doctor-pass`, `/workers/findings`, `/workers/loops`, `/workers/runs`, and `/workers/privacy` must remain the same.

Do not move public `/`, `/starter`, `/workers`, `/blog`, or `/docs` into the protected route group.

Do not rename domain concepts such as Workspace findings, Workspace setup, or Workspace read models unless a compile error proves the name is now misleading at an API boundary. This slice is about the route group folder, not a product-wide vocabulary migration.

Do not reopen checkout, entitlement grants, Worker local-runner boundaries, generated app extraction, or existing customer migration.

## Acceptance

The codebase should have no runtime imports or active app tests that reference `@/app/(workspace)`.

`apps/web/app/(workspace)/` should no longer exist. `apps/web/app/(protected)/layout.tsx` should remain the pay-guarded layout.

Focused tests should prove public `/starter` and `/workers` remain public, while protected Starter and Worker app routes still require the app access layer.

Repo-level validation should pass with formatting, lint, typecheck, and route/access-focused tests.
