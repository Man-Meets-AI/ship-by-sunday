---
title: Rename Workspace Route Group To Protected
status: complete
created_at: 2026-05-13
completed_at: 2026-05-13
summary: Rename the paid app Next.js route group from `(workspace)` to `(protected)` without changing URLs or access behavior.
post_build_recap: The paid app route group now lives under `apps/web/app/(protected)/`; live imports, tests, active docs, and Program references use the protected path, while public and protected URLs remain unchanged.
program_id: public-product-split-starter-workers
planning_brief: docs/programs/active/2026-05-12-public-product-split-starter-workers/planning-brief-6.md
read_when:
  - Resuming the protected route group rename.
  - Validating that public Starter and Workers routes stayed public.
  - Checking why `apps/web/app/(protected)/` owns the pay-guarded app area.
---

# Rename Workspace Route Group To Protected

This document is a living execution plan for renaming the paid app route group from `(workspace)` to `(protected)`.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The product split now has public marketing routes and protected app routes that share URL prefixes, especially `/starter` and `/workers`. The folder previously named `apps/web/app/(workspace)/` is the pay-guarded app boundary, not merely a workspace concept. Renaming it to `apps/web/app/(protected)/` lets future agents see the access boundary directly while preserving all customer-facing URLs.

## Progress

- [x] 2026-05-13: Read `apps/web/AGENTS.md`, `docs/release-workflow.md`, `docs/exec-plans/PLANS.md`, and the installed Next.js route group documentation.
- [x] 2026-05-13: Created planning brief 6 and this active child ExecPlan.
- [x] 2026-05-13: Moved `apps/web/app/(workspace)/` to `apps/web/app/(protected)/` and rewrote live imports, tests, active ExecPlans, current product docs, and Program references.
- [x] 2026-05-13: Ran focused route/access tests, integration-ui smoke tests, plan lint, Program lint, markdown lint, format, lint, typecheck, and whitespace checks.
- [x] 2026-05-13: Completed this ExecPlan and updated the parent Program.

## Surprises & Discoveries

Next.js route group documentation confirms that folders wrapped in parentheses are omitted from the URL path. This means `apps/web/app/(workspace)/workers/setup/page.tsx` and `apps/web/app/(protected)/workers/setup/page.tsx` both own `/workers/setup`; the rename should not change route URLs.

`DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run typecheck` rewrote `apps/web/next-env.d.ts` from the tracked dev route type import to the build output route type import. That generated churn was restored before committing, matching prior repository behavior.

## Decision Log

Decision: Rename only the route group folder and import paths, not all `Workspace*` domain names.
Rationale: `workspace` is still a meaningful product concept for Worker findings, setup, read models, and UI copy. The misleading part is the route group folder acting as the pay-guarded boundary.
Date: 2026-05-13.

Decision: Do not change public or protected URL strings in this slice.
Rationale: Next.js route groups are pathless. A URL change would widen this cleanup into a product migration and risk breaking checkout success, proxy rules, and existing direct links.
Date: 2026-05-13.

## Outcomes & Retrospective

Completed the route group cleanup. The protected paid app folder is now `apps/web/app/(protected)/`, live imports and tests reference `@/app/(protected)`, and the Next build route manifest still exposes the same URLs, including public `/starter` and `/workers` plus protected app subroutes such as `/starter/home` and `/workers/setup`.

## Context and Orientation

The app uses Next.js App Router under `apps/web/app`. Public routes such as `apps/web/app/starter/page.tsx` and `apps/web/app/workers/page.tsx` are visible without app access. Protected routes previously lived under `apps/web/app/(workspace)/`; after this slice they live under `apps/web/app/(protected)/`, which contains `layout.tsx`. That layout checks product access and renders `AccessRequiredPage` when the viewer is signed in but lacks product access.

The proxy in `apps/web/proxy.ts` handles sign-in protection for protected URL families. The route group folder name does not appear in URLs, so moving files between `(workspace)` and `(protected)` should not require changing `routeConfig` or public route constants.

### In Scope

Move `apps/web/app/(workspace)/` to `apps/web/app/(protected)/`. Update imports, mocks, dynamic imports, active docs, and tests that reference the old route group path. Preserve all route URLs and all access gates.

### Out Of Scope

Do not rename the product concept `Workspace` everywhere. Do not move public marketing routes into the protected group. Do not change checkout prices, checkout success routing, access grants, Worker local-runner behavior, generated repo output, or existing-customer migration notes.

## Plan of Work

First, use `git mv` to rename `apps/web/app/(workspace)/` to `apps/web/app/(protected)/`.

Second, mechanically rewrite `@/app/(workspace)` imports and active code/test path references to `@/app/(protected)`. Runtime code, unit tests, integration-ui tests, active ExecPlans, current product docs, and the parent Program should point at the new folder. Older completed ExecPlans and immutable earlier Program briefs can keep historical references.

Third, update the parent Program so the next slice no longer asks for this cleanup, and then complete this ExecPlan once validation passes.

## Milestones

The first milestone is the mechanical route group rename. It is complete when the old folder no longer exists, the new folder exists, and `rg "@/app/\\(workspace\\)|apps/web/app/\\(workspace\\)|app/\\(workspace\\)" apps/web docs/exec-plans/active docs/internal docs/programs/active/2026-05-12-public-product-split-starter-workers/program.md apps/web/content/docs` shows only historical or deliberately preserved references.

The second milestone is behavior validation. It is complete when focused tests for protected route imports, proxy rules, public metadata routes, and app route pages pass.

The third milestone is final validation and documentation. It is complete when formatting, lint, typecheck, Program lint, plan lint, markdown lint, and whitespace checks pass, and the ExecPlan has a completed retrospective.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Rename the route group:

    git mv 'apps/web/app/(workspace)' 'apps/web/app/(protected)'

Update live references:

    rg -l '@/app/\(workspace\)|app/\(workspace\)|apps/web/app/\(workspace\)' apps/web docs/exec-plans/active docs/internal docs/programs/active/2026-05-12-public-product-split-starter-workers/program.md apps/web/content/docs | xargs perl -pi -e 's#@/app/\(workspace\)#@/app/(protected)#g; s#apps/web/app/\(workspace\)#apps/web/app/(protected)#g; s#app/\(workspace\)#app/(protected)#g'

Run focused validation, then broad validation. If typecheck rewrites `apps/web/next-env.d.ts` to build output route types, restore the tracked dev route type import before committing.

## Validation and Acceptance

Acceptance requires the rename to be path-only. Public `/starter` and `/workers` must stay outside the protected route group. Protected `/starter/home`, `/starter/generate-codebase`, `/starter/lessons`, `/workers/setup`, and related app routes must still render behind the same access boundary.

The test brief for this slice is: Feature: protected route group naming. Risk: P1 core product because route grouping and access guards affect paid app entry. Source of truth: Next route tree, proxy protected route tests, and server component route tests. Must work: public marketing routes remain public and protected app routes remain protected. Must fail safely: missing product access still renders access required or redirects according to capability. Tests: focused unit/integration-ui route tests, static lint, typecheck, and build route manifest through typecheck. CI gate: static and integration.

### Test Commands

    bun run --cwd apps/web test:unit -- tests/unit/proxy-protected-routes.test.ts tests/unit/app-protected-layout.test.tsx tests/unit/app-workspace-codebase-review-routes.test.tsx tests/unit/app-workspace-tutorial-routes.test.tsx tests/unit/public-metadata-routes.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/access-required-page.test.tsx tests/integration-ui/app-shell-command-menu.test.tsx
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-rename-workspace-route-group-to-protected.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-rename-workspace-route-group-to-protected.md docs/programs/active/2026-05-12-public-product-split-starter-workers
    bun run format
    bun lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run typecheck
    git diff --check

## Idempotence and Recovery

The folder rename is safe to retry by checking whether `apps/web/app/(protected)/` already exists. If imports break, run `rg "(workspace)" apps/web` to find stale references. If route behavior changes unexpectedly, revert only the route group rename and import rewrite, not the earlier product split commit.

## Artifacts and Notes

The relevant Next.js documentation is installed at `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route-groups.md`. It states that a route group is created with parentheses and is not included in the URL path.

Validation completed on 2026-05-13:

    bun run --cwd apps/web test:unit -- tests/unit/proxy-protected-routes.test.ts tests/unit/app-protected-layout.test.tsx tests/unit/app-workspace-codebase-review-routes.test.tsx tests/unit/app-workspace-tutorial-routes.test.tsx tests/unit/public-metadata-routes.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/access-required-page.test.tsx tests/integration-ui/app-shell-command-menu.test.tsx
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-rename-workspace-route-group-to-protected.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-rename-workspace-route-group-to-protected.md docs/programs/active/2026-05-12-public-product-split-starter-workers
    bun run format
    bun lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run typecheck
    git diff --check

## Interfaces and Dependencies

This slice depends on the former `apps/web/app/(workspace)/` route group, the target `apps/web/app/(protected)/` route group, `apps/web/proxy.ts`, route constants in `apps/web/config/product.ts`, route/access tests under `apps/web/tests/`, and the active Program packet under `docs/programs/active/2026-05-12-public-product-split-starter-workers/`.
