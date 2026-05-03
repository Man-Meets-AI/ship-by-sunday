---
title: Harden Workspace Access Guards
status: active
created_at: 2026-05-02
completed_at: null
summary: Stop protected workspace pages from throwing Convex access errors when a signed-in customer lacks product access.
post_build_recap: null
read_when:
  - Fixing Access required errors on workspace routes.
  - Changing protected page data loading.
  - Validating checkout recovery after a paid customer lacks access.
---

# Harden Workspace Access Guards

This is a living execution plan. Update it at every stopping point so the next contributor can resume from this file alone.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

A customer who lacks product access should see the access recovery page, not a server error. The current workspace layout checks access, but child server pages can still start protected Convex queries and throw `Access required`. After this plan is implemented, every protected workspace route checks access before fetching protected workspace data, so no-access customers get a controlled recovery screen and production observability stops seeing these avoidable server errors.

The visible proof is that a signed-in account without access can visit `/blueprint`, `/review`, `/mission`, `/execute`, and protected lesson routes. Each route should render the access-required experience or redirect only after access is confirmed. None should throw a Next request error from a Convex `Access required` response.

## Progress

- [x] 2026-05-02: Authored this ExecPlan from the production error research.
- [x] 2026-05-02: Mapped protected workspace server routes that call Convex before access is guaranteed: `apps/web/app/(workspace)/blueprint/page.tsx`, `apps/web/app/(workspace)/review/page.tsx`, `apps/web/app/(workspace)/mission/page.tsx`, `apps/web/app/(workspace)/execute/page.tsx`, `apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx`, and the lesson route loader at `apps/web/app/(workspace)/lesson/[lessonKey]/_server/load-bonus-route-access.ts`.
- [x] 2026-05-02: Added `apps/web/app/(workspace)/_server/load-workspace-page-access.ts` as the reusable leaf-route server access guard.
- [x] 2026-05-02: Applied the guard to `/blueprint`, `/review`, `/mission`, `/execute`, and protected lesson routes before any protected Convex fetches run.
- [x] 2026-05-02: Added focused no-access route tests proving the guarded pages render recovery and do not call protected Convex query mocks.
- [x] 2026-05-02: Ran focused route, access-required, blueprint UI, plan lint, markdown lint, focused formatting, broad lint, broad typecheck, and diff whitespace validation.

## Surprises & Discoveries

Production errors after the paid checkout were application access errors, not Stripe webhook errors. The observed stack pointed at the `/blueprint` page calling `api.blueprint.getBlueprintWorkspaceState`, which eventually calls a Convex access requirement and throws.

The parent workspace layout in `apps/web/app/(workspace)/layout.tsx` renders `AccessRequiredPage` when `getServerProductAccess` returns no access. That is not enough protection for child server component work. The child page must not assume the parent layout has already stopped its data load.

The route audit found no protected server Convex fetches in the compatibility redirect pages such as `/start`, `/product`, `/design`, `/marketing`, `/build-plan`, or `/artifacts`. The protected server fetches for this slice were concentrated in the five routes listed in Progress, plus the lesson-specific server loader those routes call.

The local Next.js docs were installed at `node_modules/next/dist/docs`, not `apps/web/node_modules/next/dist/docs`. Reading `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`, `05-server-and-client-components.md`, `06-fetching-data.md`, and `02-guides/redirecting.md` confirmed that App Router pages are server components by default and can perform independent server data loading.

`bun run format:check` failed on `apps/web/app/checkout/success/_lib/checkout-success-view-model.ts`, which is outside this worker's write scope and part of parallel checkout work. The workspace guard files were formatted directly with `oxfmt`, and this worker did not edit the checkout success file.

## Decision Log

Decision: Add leaf-route access guards before protected Convex fetches.
Rationale: This directly prevents the observed error. Catching Convex errors after they throw would still make the protected query the first thing the page does and would make expected no-access behavior look like exceptional control flow.
Date: 2026-05-02

Decision: Keep the layout gate in place.
Rationale: The layout still owns the shared workspace shell behavior and remains useful for access-required rendering. Leaf guards are an additional protection for server data loading, not a replacement for the layout.
Date: 2026-05-02

Decision: Validate no-access behavior at the route module boundary instead of only at shared UI components.
Rationale: The production failure was caused by route-level server data loading order. Route tests that mock `getServerProductAccess` and `fetchAuthenticatedQuery` prove the intended ordering directly: access check first, protected query second only when access is granted.
Date: 2026-05-02

## Outcomes & Retrospective

Completed on 2026-05-02. Workspace leaf routes now call `loadWorkspacePageAccess` before protected Convex data loading. No-access users on `/blueprint`, `/review`, `/mission`, `/execute`, and valid protected lesson routes render the existing `AccessRequiredPage` surface instead of starting protected Convex queries that can throw `Access required`.

The route tests now include explicit no-access assertions for all affected routes, and the new blueprint/review route test also confirms granted users still proceed to the protected workspace query. Checkout/account resolution behavior was not changed.

## Context and Orientation

The protected workspace routes live under `apps/web/app/(workspace)/`. The layout at `apps/web/app/(workspace)/layout.tsx` calls `getServerProductAccess` from `apps/web/platform/access/product-access.ts`. If access is missing, it returns `AccessRequiredPage`.

The issue is that server components under the same route group can fetch data before or alongside parent layout rendering. The `/blueprint` page currently calls `fetchAuthenticatedQuery(api.blueprint.getBlueprintWorkspaceState, {})` immediately in `apps/web/app/(workspace)/blueprint/page.tsx`. That Convex query requires granted product access. When the user does not have access, the query throws instead of allowing the access-required page to render cleanly.

Other workspace routes use similar protected data paths. `apps/web/app/(workspace)/review/page.tsx` fetches blueprint workspace state. `apps/web/app/(workspace)/mission/page.tsx`, `apps/web/app/(workspace)/execute/page.tsx`, and `apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx` also load protected course or blueprint state before rendering or redirecting. Each route must be audited before the implementation is considered complete.

### In Scope

Add or reuse a server helper that checks product access before protected workspace page fetches. Apply it to the workspace server pages that can be reached without access. Add tests for no-access behavior on the affected pages. Preserve the existing `AccessRequiredPage` UI and recovery controller unless a small prop is needed to pass initial access state.

### Out Of Scope

Do not redesign the access-required page in this plan. Do not change Stripe checkout, Clerk auth, or Convex entitlement semantics. Do not swallow arbitrary Convex errors. This plan only converts expected no-access states into controlled access-required rendering before protected data loads.

## Plan of Work

Create a small server-side helper under `apps/web/app/(workspace)/_server/`, for example `load-workspace-access.ts`. It should call `getServerProductAccess` and return a discriminated union such as `{ kind: "granted"; access: ProductAccess }` or `{ kind: "access_required"; access: ProductAccess }`. It should not redirect and should not fetch protected blueprint data.

Update `apps/web/app/(workspace)/blueprint/page.tsx` so it calls this helper before `fetchAuthenticatedQuery(api.blueprint.getBlueprintWorkspaceState, {})`. If the helper returns `access_required`, return `<AccessRequiredPage initialAccess={access} />`. If it returns `granted`, continue with the existing blueprint workspace-state, resume-destination, and bonus-mission fetches.

Apply the same pattern to `apps/web/app/(workspace)/review/page.tsx`. For redirect-like pages such as `mission`, `execute`, and lesson routes, check access before protected data fetches or redirects that require protected state. If no access exists, render `AccessRequiredPage` instead of running the protected query.

Add unit tests in the existing route test files under `apps/web/tests/unit/`, including `app-workspace-mission-page.test.tsx`, `app-workspace-execute-page.test.tsx`, and `app-workspace-lesson-page.test.tsx`. Add a focused test for the blueprint page if none exists at the page boundary. The tests should mock `getServerProductAccess` or the new helper to return no access, render the page, and assert that the protected query mock was not called.

## Milestones

Milestone 1 maps the protected server routes. Success means the implementation notes list every route under `apps/web/app/(workspace)/` that can call protected Convex APIs during server render.

Milestone 2 adds the shared guard and patches `/blueprint` and `/review`. Success means no-access tests for those pages render access-required content and assert the protected blueprint query is not called.

Milestone 3 patches redirect and lesson routes. Success means no-access tests for `/mission`, `/execute`, and lesson routes do not call protected Convex queries and do not throw.

Milestone 4 validates production-like behavior. Success means focused tests, typecheck, and a browser or server smoke against a signed-in no-access account show access-required UI instead of an error.

## Concrete Steps

Start from the repo root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Audit workspace routes:

    rg -n "fetchAuthenticatedQuery|fetchQuery|api\\.blueprint|api\\.course|getServerProductAccess" "apps/web/app/(workspace)" apps/web/platform/access

Read the known failing route and access gate:

    sed -n '1,180p' "apps/web/app/(workspace)/blueprint/page.tsx"
    sed -n '1,180p' "apps/web/app/(workspace)/layout.tsx"
    sed -n '1,220p' apps/web/platform/access/product-access.ts

Add the guard helper, then patch each affected server page one at a time. After each page, run its focused tests. Example focused commands:

    bun run --cwd apps/web vitest run tests/unit/app-protected-layout.test.tsx
    bun run --cwd apps/web vitest run tests/unit/app-workspace-mission-page.test.tsx
    bun run --cwd apps/web vitest run tests/unit/app-workspace-execute-page.test.tsx
    bun run --cwd apps/web vitest run tests/unit/app-workspace-lesson-page.test.tsx

If adding a new blueprint page test, run it directly by path. Then run the broader unit and integration-ui access checks:

    bun run --cwd apps/web vitest run tests/integration-ui/access-required-page.test.tsx tests/integration-ui/access-required-page.interactions.test.tsx tests/unit/access-required-page.test.tsx

## Validation and Acceptance

The fix is accepted only when a no-access signed-in user can hit each protected workspace URL without a server error. Tests must prove the protected Convex query is not called in no-access cases. The existing happy path for granted users must keep loading workspace data.

No-access behavior must render the same access-required recovery surface that the layout already uses. It should not redirect to checkout unless the access-required component's existing action asks the user to start checkout.

### Test Commands

Run these before considering the implementation complete:

    bun run --cwd apps/web vitest run tests/unit/app-protected-layout.test.tsx tests/unit/app-workspace-mission-page.test.tsx tests/unit/app-workspace-execute-page.test.tsx tests/unit/app-workspace-lesson-page.test.tsx
    bun run --cwd apps/web vitest run tests/integration-ui/access-required-page.test.tsx tests/integration-ui/access-required-page.interactions.test.tsx tests/unit/access-required-page.test.tsx
    bun run --cwd apps/web vitest run tests/integration-ui/blueprint-page.test.tsx tests/integration-ui/blueprint-review-page.test.tsx
    bun run format
    bun lint
    bun typecheck
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-workspace-access-guard-hardening.md
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-02-workspace-access-guard-hardening.md
    git diff --check

## Idempotence and Recovery

This change is additive and safe to apply route by route. If a route patch breaks the granted happy path, revert only that route's guard change and keep the helper and other successful route patches. Do not remove the layout gate while debugging leaf-route behavior.

If a test proves a protected query still runs before the guard, move the guard higher in that page's server function. The intended shape is always guard first, protected fetch second.

## Artifacts and Notes

The motivating production symptom was:

    Route: /blueprint
    Error class: next_request_error
    Convex message: Access required
    Root behavior: protected query ran while customer had no productAccessGrant

The desired replacement symptom is no error. A customer without access should see the access-required page and support should see no new server incident for that route visit.

Coordinator validation after all parallel slices landed:

    bun run --cwd apps/web vitest run tests/unit/checkout-claims.test.ts tests/unit/checkout-claims-actions.test.ts tests/unit/checkout-session.test.ts tests/unit/course-access.test.ts tests/unit/access-required-page.test.tsx tests/unit/app-workspace-blueprint-review-routes.test.tsx tests/unit/app-workspace-mission-page.test.tsx tests/unit/app-workspace-execute-page.test.tsx tests/unit/app-workspace-lesson-page.test.tsx tests/unit/app-protected-layout.test.tsx
    Test Files  10 passed (10)
    Tests  68 passed (68)

    bun run --cwd apps/web vitest run tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx tests/integration-ui/access-required-page.test.tsx tests/integration-ui/access-required-page.interactions.test.tsx tests/integration/stripe-checkout-route.test.ts tests/unit/checkout-session-params.test.ts
    Test Files  6 passed (6)
    Tests  28 passed (28)

The first combined route test run saw the new lesson no-access test time out while several Vitest groups were running in parallel. The same full workspace route test set immediately passed on rerun:

    bun run --cwd apps/web vitest run tests/unit/app-workspace-blueprint-review-routes.test.tsx tests/unit/app-workspace-mission-page.test.tsx tests/unit/app-workspace-execute-page.test.tsx tests/unit/app-workspace-lesson-page.test.tsx tests/unit/app-protected-layout.test.tsx
    Test Files  5 passed (5)
    Tests  16 passed (16)

Validation completed during implementation:

    bun run --cwd apps/web vitest run tests/unit/app-workspace-blueprint-review-routes.test.tsx tests/unit/app-workspace-mission-page.test.tsx tests/unit/app-workspace-execute-page.test.tsx tests/unit/app-workspace-lesson-page.test.tsx tests/unit/app-protected-layout.test.tsx
    Test Files  5 passed (5)
    Tests  16 passed (16)

    bun run --cwd apps/web vitest run tests/integration-ui/access-required-page.test.tsx tests/integration-ui/access-required-page.interactions.test.tsx tests/unit/access-required-page.test.tsx
    Test Files  3 passed (3)
    Tests  14 passed (14)

    bun run --cwd apps/web vitest run tests/integration-ui/blueprint-page.test.tsx tests/integration-ui/blueprint-review-page.test.tsx
    Test Files  2 passed (2)
    Tests  9 passed (9)

    ./node_modules/.bin/oxfmt -c .oxfmtrc.json apps/web/app/(workspace)/_server/load-workspace-page-access.ts apps/web/app/(workspace)/blueprint/page.tsx apps/web/app/(workspace)/review/page.tsx apps/web/app/(workspace)/mission/page.tsx apps/web/app/(workspace)/execute/page.tsx apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx apps/web/tests/unit/app-workspace-blueprint-review-routes.test.tsx apps/web/tests/unit/app-workspace-mission-page.test.tsx apps/web/tests/unit/app-workspace-execute-page.test.tsx apps/web/tests/unit/app-workspace-lesson-page.test.tsx
    Finished in 16ms on 10 files using 12 threads.

    ./node_modules/.bin/oxlint -c .oxlintrc.json --deny-warnings apps/web/app/(workspace)/_server/load-workspace-page-access.ts apps/web/app/(workspace)/blueprint/page.tsx apps/web/app/(workspace)/review/page.tsx apps/web/app/(workspace)/mission/page.tsx apps/web/app/(workspace)/execute/page.tsx apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx apps/web/tests/unit/app-workspace-blueprint-review-routes.test.tsx apps/web/tests/unit/app-workspace-mission-page.test.tsx apps/web/tests/unit/app-workspace-execute-page.test.tsx apps/web/tests/unit/app-workspace-lesson-page.test.tsx
    Found 0 warnings and 0 errors.

    bun lint
    Found 0 warnings and 0 errors.

    bun typecheck
    Compiled successfully.
    Finished TypeScript.

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-workspace-access-guard-hardening.md
    docs/exec-plans/active/2026-05-02-workspace-access-guard-hardening.md: ok

    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-02-workspace-access-guard-hardening.md
    docs/exec-plans/active/2026-05-02-workspace-access-guard-hardening.md: ok

    git diff --check
    Passed.

Validation limitation from this run:

    bun run format:check
    Format issues found in apps/web/app/checkout/success/_lib/checkout-success-view-model.ts.

This formatting failure is outside the workspace access guard write scope and was left untouched.

## Interfaces and Dependencies

This plan depends on `getServerProductAccess` in `apps/web/platform/access/product-access.ts`, `AccessRequiredPage` in `apps/web/app/(workspace)/_components/access-required/access-required-page.tsx`, and the protected page files under `apps/web/app/(workspace)/`. It also depends on Next.js App Router server component behavior: pages must guard their own protected data loads because parent layout rendering is not a sufficient synchronization boundary.
