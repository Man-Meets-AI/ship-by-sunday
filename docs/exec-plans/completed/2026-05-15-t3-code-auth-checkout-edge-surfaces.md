---
title: T3 Code Auth Checkout Edge Surfaces
status: complete
created_at: 2026-05-15
completed_at: 2026-05-15
summary: Move auth, checkout recovery, global error, and missing-route edge screens onto T3 Code-style surfaces without changing Clerk, Stripe, access, or redirect behavior.
post_build_recap: Auth, checkout success framing, checkout cancel confirmation, checkout clear-pending, not-found, and error boundary screens now use a shared T3 Code edge route surface while preserving Clerk, Stripe, access, metadata, and telemetry behavior.
program_id: t3-code-source-design-system-port
planning_brief: docs/programs/active/2026-05-14-t3-code-source-design-system-port/planning-brief-10.md
read_when:
  - Resuming the auth, checkout, or edge-surface migration slice.
  - Changing sign-in, reset-password, checkout success, checkout cancel, checkout clear-pending, not-found, or error boundary UI during the T3 Code migration.
  - Checking validation for planning brief 10.
---

# T3 Code Auth Checkout Edge Surfaces

This document is a living execution plan for the auth, checkout, and edge-surface slice of the T3 Code source design-system port.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The protected app, public pages, docs, and blog now use T3 Code-style route surfaces, but buyers and recovering users can still hit older visual islands while signing in, recovering a checkout, clearing stale checkout state, seeing a canceled checkout, or landing on a global error or missing route. After this slice, those edge screens should feel like the same product as the migrated public and protected routes. The observable behavior must stay the same: Clerk passwordless sign-in and reset tasks still run through Clerk, Stripe checkout success still syncs and redirects as before, checkout cancel still clears pending checkout state before showing the cancel confirmation, direct `/access-required` visits still redirect to app home, and error boundaries still report telemetry and expose retry actions.

## Progress

- [x] 2026-05-15: Read root and web agent instructions, release workflow, app architecture and conventions, Program contract, ExecPlan contract, planning brief 10, the completed public-surface plan, and relevant Next.js App Router guidance for pages, layouts, auth, errors, and not-found screens.
- [x] 2026-05-15: Audited `(auth)`, checkout success/cancel/clear-pending, access-required, global not-found, root/protected/global error screens, and the focused tests that cover those surfaces.
- [x] 2026-05-15: Created this active ExecPlan.
- [x] 2026-05-15: Added shared edge route-surface helpers under `apps/web/src/components/layout/edge-route-surface.tsx`.
- [x] 2026-05-15: Migrated auth, checkout success framing, checkout cancel confirmation, checkout clear-pending, global not-found, and error boundary screens to the shared edge surface while preserving behavior.
- [x] 2026-05-15: Added and updated focused tests for route slots, old serif removal, Clerk task preservation, checkout handoff behavior, cancel recovery, and error telemetry/retry behavior.
- [x] 2026-05-15: Focused unit and integration-UI tests passed for auth, checkout, access-required, route metadata, not-found, and error-boundary surfaces.
- [x] 2026-05-15: App lint and Next build/typecheck passed.
- [x] 2026-05-15: Browser proof passed on the webpack dev server for desktop and mobile sign-in plus desktop and mobile checkout cancel confirmation; all checked pages rendered edge slots and zero `.font-heading-serif` matches.
- [x] 2026-05-15: Completed this ExecPlan, moved it to `docs/exec-plans/completed/`, updated the Program ledger, added planning brief 11, and pointed the Program at the Telegram widget visual migration.
- [x] 2026-05-15: Final plan, Program, markdown, repo lint, repo typecheck, and whitespace validation passed.

## Surprises & Discoveries

The previous public-surface slice left an uncommitted local change in `apps/web/src/components/layout/public-route-surface.tsx`: `PublicRoutePanelTitle` gained an `as` prop and `PublicRouteListPanel` now uses the distinct `data-slot="public-route-list-panel"` slot. This slice should preserve and validate that work instead of reverting it.

The access-required screen has already been migrated onto `ProtectedRoutePage`, `ProtectedRouteHeader`, and `ProtectedRoutePanel` slots. It remains behavior-sensitive, but it does not need a broad visual rewrite in this slice unless validation reveals a mismatch.

Checkout success already uses T3 Code `Card` primitives and behavior-focused tests. It should gain the same edge-page framing and slot coverage as the other checkout edge pages, but its polling, sign-in-required, wrong-account, fulfillment-failed, and auto-redirect behavior must not change.

## Decision Log

Decision: Treat this as a visual and shell migration around behavior-sensitive routes, not a provider or entitlement rewrite.
Rationale: Planning brief 10 requires preserving Clerk behavior, Stripe offer selection, checkout success/cancel behavior, entitlement checks, redirects, and recovery paths. The old styling is the problem this slice owns.
Date: 2026-05-15

Decision: Add one shared edge route-surface helper rather than copying route-local card shells.
Rationale: Auth, checkout recovery, checkout cancel, clear-pending, not-found, and error screens share the same buyer-adjacent edge-state shape: compact page framing, a clear status header, one or two quiet panels, and action rows. A shared helper keeps slot tests simple and avoids another route-local visual island.
Date: 2026-05-15

Decision: Leave full auth flow relocation out of this slice.
Rationale: The custom sign-in flow under `apps/web/src/app/(auth)/_components/sign-in/` contains Clerk hook orchestration and many behavior tests. Moving it while changing the visual shell would increase auth risk without improving the user-visible surface enough for this slice. Later structural cleanup can move those modules after the shell migration is proven.
Date: 2026-05-15

## Outcomes & Retrospective

This slice added `apps/web/src/components/layout/edge-route-surface.tsx` as the shared edge route recipe and moved the auth frame, auth shell, reset-password shell, checkout success framing, checkout cancel confirmation, checkout clear-pending, app not-found, root error, protected app error, and global error presentation onto that compact T3 Code surface. The old `font-heading-serif`, `bg-ink`, oversized clamp headings, scanline overlays, and round cinematic action buttons were removed from the touched edge screens.

Behavior-sensitive contracts stayed intact. Sign-in still uses the passwordless Clerk email-code flow, reset password still renders Clerk `TaskResetPassword` with the safe completion redirect, sign-up still redirects instead of rendering a local account-creation page, checkout success still syncs the Stripe session and redirects sign-in-required users to the purchased product success path, checkout cancel still clears pending checkout state before the confirmation page, direct `/access-required` still redirects to app home, and error boundaries still report client telemetry and call `reset` from the retry action.

The full auth flow modules remain under `apps/web/src/app/(auth)/_components/sign-in/` by design because they carry Clerk hook orchestration and many behavior tests. That structural cleanup is deferred to a later underscore-folder cleanup slice rather than mixed into this visual and recovery-surface migration.

## Context and Orientation

The active Program is `docs/programs/active/2026-05-14-t3-code-source-design-system-port/program.md`, and this plan is driven by `docs/programs/active/2026-05-14-t3-code-source-design-system-port/planning-brief-10.md`. The immediate predecessor slice is `docs/exec-plans/completed/2026-05-15-t3-code-public-surfaces.md`, which added `apps/web/src/components/layout/public-route-surface.tsx` and `apps/web/src/components/layout/public-site-header.tsx`.

The auth routes live under `apps/web/src/app/(auth)`. `apps/web/src/app/(auth)/layout.tsx` wraps the group in `IdentityPageFrame`. `apps/web/src/app/(auth)/sign-in/[[...sign-in]]/page.tsx` preserves safe redirect behavior, bypass behavior, and pending checkout email locking before rendering the custom `SignInPage`. `apps/web/src/app/(auth)/sign-up/[[...sign-up]]/page.tsx` redirects sign-up attempts to either the safe redirect target or checkout success. `apps/web/src/app/(auth)/session-tasks/reset-password/page.tsx` renders Clerk `TaskResetPassword` with `redirectUrlComplete` derived from the route query.

Checkout edge routes live under `apps/web/src/app/checkout`. `checkout/success/page.tsx` validates or recovers the Stripe Checkout Session id, rate-limits recovery by session id, syncs the billing domain through `syncStripeCheckoutSessionToConvex`, redirects sign-in-required users to the preserved offer success path, and renders `CheckoutSuccessView`. `checkout/cancel/page.tsx` redirects through `buildClearPendingCheckoutSessionHref(routeConfig.checkoutCancelConfirmed)` so the pending checkout cookie is cleared before the confirmation screen. `checkout/cancel/confirmed/page.tsx` is the visible canceled-checkout recovery page. `checkout/clear-pending/page.tsx` auto-submits `ClearPendingCheckoutForm`, which posts to `checkout/clear-pending/submit/route.ts` and must keep rejecting unsafe redirect targets through the existing route test.

The global edge screens are `apps/web/src/app/not-found.tsx`, `apps/web/src/app/_components/not-found-screen.tsx`, `apps/web/src/app/error.tsx`, `apps/web/src/app/(app)/error.tsx`, `apps/web/src/app/global-error.tsx`, and `apps/web/src/app/_components/error-boundary-screen.tsx`. `ErrorBoundaryScreen` is a client component because Next.js error boundaries must be client components and because it reports client telemetry with `reportClientError`.

Direct `/access-required` visits are intentionally redirected by `apps/web/src/app/access-required/page.tsx` to `routeConfig.appHome`. The actual access recovery UI lives under `apps/web/src/app/(app)/_components/access-required/` and already uses protected route-surface slots.

### In Scope

This plan may add shared edge route-surface helpers under `apps/web/src/components/layout/`, update auth shell/frame/support presentation, update checkout success/cancel/clear-pending presentation, update not-found and error boundary presentation, and update focused tests. It may update this ExecPlan and the active T3 Program ledger.

### Out Of Scope

This plan must not change Clerk provider setup, sign-in factors, sign-up policy, passwordless recovery behavior, Stripe checkout session creation, Stripe webhook behavior, billing fulfillment, Convex schema/functions, entitlement policy, access-required redirect behavior, checkout offer ids, checkout success/cancel URLs, metadata/robots policy, public homepage offers, generated-codebase compiler/templates, generated customer docs, Telegram widget styling, or dependencies.

## Plan of Work

First, validate this plan with `bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-15-t3-code-auth-checkout-edge-surfaces.md`.

Second, add `apps/web/src/components/layout/edge-route-surface.tsx`. It should expose an edge page, container, header, eyebrow, title, description, panel, panel header, panel title, panel description, panel body, action row, and small status/list primitives with stable `data-slot` attributes. The classes should follow the existing T3 Code card and route-surface recipe: DM Sans through the global font stack, compact type, quiet borders, `rounded-2xl` panel geometry, token colors, shallow shadows, and no serif or old cinematic dark shell.

Third, migrate the auth frame and shell in `apps/web/src/app/(auth)/_components/identity-page-frame.tsx`, `auth-page-shell.tsx`, `auth-page-support-panel.tsx`, and `identity-layout-header.tsx`. Keep `SignInPage`, `SignInEmailCodeForm`, Clerk hook behavior, safe redirect logic, and reset-password task rendering intact. The auth shell must no longer render `font-heading-serif` and should expose edge route slots in tests.

Fourth, migrate checkout edge presentation. Update `checkout/success/_components/checkout-success-view-surface.tsx` to use the shared edge page and container while preserving `data-checkout-fixture`, polling, redirect, and view-model behavior. Update `checkout/cancel/confirmed/page.tsx` and `checkout/clear-pending/page.tsx` to use the shared edge page and panels while keeping hrefs, redirect targets, form action, and noindex metadata unchanged. Use the shared `Button` primitive for the clear-pending form button instead of a raw one-off class recipe.

Fifth, migrate `NotFoundScreen` and `ErrorBoundaryScreen` away from the old `bg-ink`, `font-heading-serif`, oversized clamp headings, round pill buttons, scanline overlays, and old animation-only shell. Keep `ErrorBoundaryScreen` as a client component, keep its `reportClientError` call and severity rules, keep safe fallback rendering for unknown pathname and digest, and keep a retry button that calls `reset`.

Sixth, update focused tests. Existing tests should continue covering Clerk behavior, checkout success behavior, access-required behavior, checkout clear-pending route safety, and error telemetry. Add assertions that auth, checkout success/cancel/clear-pending, not-found, and error screens render edge route slots and do not contain `font-heading-serif`. Update tests that intentionally asserted old 404/error copy to assert the new route-surface copy.

Seventh, run browser proof on a local webpack dev server for one auth route and one checkout or edge route at desktop and mobile sizes. Use the existing webpack fallback if Turbopack panics in this environment.

Eighth, complete this ExecPlan, move it to `docs/exec-plans/completed/2026-05-15-t3-code-auth-checkout-edge-surfaces.md`, update `docs/programs/active/2026-05-14-t3-code-source-design-system-port/program.md` to record completion and point to the next recommended slice, and run final validation.

## Milestones

Milestone 1 created the plan and shared edge route helper. Success means the plan lints, the helper exists under `apps/web/src/components/layout/`, and it provides stable edge route slots without touching provider logic.

Milestone 2 migrates auth and checkout edge shells. Success means sign-in, reset-password, checkout success, checkout cancel confirmation, and checkout clear-pending render through edge route page and panel slots, preserve existing redirect and action contracts, and contain no old serif route-shell classes.

Milestone 3 migrates global not-found and error screens. Success means 404, root error, protected-app error, and global error boundaries use compact T3 Code edge-state panels, still expose home/retry actions, still report telemetry from the error boundary, and no longer use old dark cinematic shells.

Milestone 4 validates and records completion. Success means focused tests, browser proof, app lint/typecheck, Program/plan/markdown lint, repo lint/typecheck, and `git diff --check` pass or exact blockers are recorded.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Validate this completed plan:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-15-t3-code-auth-checkout-edge-surfaces.md

Edit the files named in the Plan of Work. Preserve route URLs, metadata exports, redirect helpers, Clerk task props, Stripe checkout success sync, access-required redirect behavior, and checkout clear-pending form action behavior.

Run focused validation:

    bun run --cwd apps/web test:unit -- tests/unit/not-found-screen.test.tsx tests/unit/checkout-edge-surfaces.test.tsx tests/unit/route-metadata.test.ts tests/unit/access-required-route.test.ts tests/unit/checkout-clear-pending-route.test.ts tests/unit/public-marketing-surfaces.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/sign-in-page.test.tsx tests/integration-ui/reset-password-page.test.tsx tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx tests/integration-ui/access-required-page.test.tsx tests/integration-ui/access-required-page.interactions.test.tsx tests/integration-ui/error-boundary-screen.test.tsx

Run static and docs validation:

    bun run format
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-15-t3-code-auth-checkout-edge-surfaces.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-15-t3-code-auth-checkout-edge-surfaces.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    bun lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck
    git diff --check

Use the completed plan path in lint commands now that this plan has been moved to `completed/`.

## Validation and Acceptance

Acceptance requires the touched auth, checkout, and edge screens to keep their behavior while adopting the T3 Code edge route-surface recipe. Sign-in must still render the passwordless Clerk email-code flow without password, sign-up, or legal copy. Reset password must still render Clerk `TaskResetPassword` with the preserved redirect target. Checkout success must still render all existing states, redirect to `/home?welcome=checkout` when access is live, send wrong-account users through sign-in with the checkout email path, and avoid second-checkout copy on paid recovery states. Checkout cancel must still clear pending checkout state before the confirmed cancellation page. Checkout clear-pending must still post to the existing submit route with the safe redirect path. Direct `/access-required` visits must still redirect to app home. Error boundaries must still report client errors and call `reset` when the retry action is clicked.

The route markup touched by this slice must include the new edge route slots and must not include `font-heading-serif`, `bg-ink`, the old scanline overlay, or old oversized clamp heading classes. Browser proof must cover at least one auth route and one checkout or edge route at desktop and mobile sizes.

Feature risk for this slice is P1-adjacent because it changes auth, checkout, and recovery surfaces while preserving behavior. Source of truth remains current route metadata, redirect helpers, Clerk hook/task behavior, Stripe checkout session state, pending checkout cookies, and Convex entitlement query results. The CI gate is baseline app static checks plus focused auth, checkout, access, route metadata, not-found, error-boundary, and visual contract tests.

### Test Commands

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-15-t3-code-auth-checkout-edge-surfaces.md
    bun run --cwd apps/web test:unit -- tests/unit/not-found-screen.test.tsx tests/unit/checkout-edge-surfaces.test.tsx tests/unit/route-metadata.test.ts tests/unit/access-required-route.test.ts tests/unit/checkout-clear-pending-route.test.ts tests/unit/public-marketing-surfaces.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/sign-in-page.test.tsx tests/integration-ui/reset-password-page.test.tsx tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx tests/integration-ui/access-required-page.test.tsx tests/integration-ui/access-required-page.interactions.test.tsx tests/integration-ui/error-boundary-screen.test.tsx
    bun run format
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-15-t3-code-auth-checkout-edge-surfaces.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-15-t3-code-auth-checkout-edge-surfaces.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    bun lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck
    git diff --check

## Idempotence and Recovery

The implementation is local React composition and CSS class changes. If a focused test shows that a redirect path, Clerk task prop, checkout href, pending checkout form action, telemetry payload, or metadata rule changed, restore the original behavior and keep only the visual migration. If browser proof cannot run through the default dev server because of the known Turbopack panic, use `bun --cwd apps/web next dev --webpack -p <port>` and record the fallback.

If a check fails after moving the plan to `completed/`, move the plan back to `active/`, set `status: active`, set `completed_at: null`, and record the blocker in Progress before repairing the implementation.

## Artifacts and Notes

Important references:

    docs/programs/active/2026-05-14-t3-code-source-design-system-port/planning-brief-10.md
    docs/exec-plans/completed/2026-05-15-t3-code-public-surfaces.md
    docs/release-workflow.md
    apps/web/src/app/(auth)
    apps/web/src/app/checkout
    apps/web/src/app/access-required/page.tsx
    apps/web/src/app/_components/not-found-screen.tsx
    apps/web/src/app/_components/error-boundary-screen.tsx
    apps/web/src/components/app/protected-route-surface.tsx
    apps/web/src/components/layout/public-route-surface.tsx

Passed focused validation:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-15-t3-code-auth-checkout-edge-surfaces.md
    bun run --cwd apps/web test:unit -- tests/unit/not-found-screen.test.tsx tests/unit/checkout-edge-surfaces.test.tsx tests/unit/route-metadata.test.ts tests/unit/access-required-route.test.ts tests/unit/checkout-clear-pending-route.test.ts tests/unit/public-marketing-surfaces.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/sign-in-page.test.tsx tests/integration-ui/reset-password-page.test.tsx tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx tests/integration-ui/access-required-page.test.tsx tests/integration-ui/access-required-page.interactions.test.tsx tests/integration-ui/error-boundary-screen.test.tsx
    bun run format
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-15-t3-code-auth-checkout-edge-surfaces.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-15-t3-code-auth-checkout-edge-surfaces.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    bun lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck
    git diff --check

Browser proof passed on `bun --cwd apps/web next dev --webpack -p 3023`:

    http://localhost:3023/sign-in
    http://localhost:3023/checkout/cancel/confirmed

Screenshots:

    codex-scripts/artifacts/t3-auth-checkout-edge/sign-in-desktop.png
    codex-scripts/artifacts/t3-auth-checkout-edge/sign-in-mobile.png
    codex-scripts/artifacts/t3-auth-checkout-edge/checkout-cancel-desktop.png
    codex-scripts/artifacts/t3-auth-checkout-edge/checkout-cancel-mobile.png

No external provider setup, dependency change, generated customer repository change, or Convex schema/function change should be needed.

## Interfaces and Dependencies

This slice depends on Next.js App Router `page.tsx`, `layout.tsx`, `error.tsx`, `global-error.tsx`, and `not-found.tsx` file conventions; Clerk `@clerk/nextjs` passwordless sign-in hooks and `TaskResetPassword`; current `routeConfig` and redirect helpers; the Stripe checkout session recovery helpers; Convex entitlement query results; shared T3 Code-compatible UI primitives; and the existing public and protected route-surface recipes. It must not change provider APIs, route handlers, Convex function signatures, or checkout/access data models.
