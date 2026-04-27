---
title: Remove Checkout Feature Surface
status: complete
created_at: 2026-04-27
completed_at: 2026-04-27
summary: Delete the checkout feature folder by moving checkout route UI and server billing helpers to explicit owners without changing Stripe checkout behavior.
post_build_recap: Checkout UI now lives under app checkout private folders, server-only checkout helpers now live under platform billing checkout, release-scope detection follows the new billing owner, and the old checkout feature folder is deleted. Focused checkout tests, app format/lint/typecheck, Program/ExecPlan lint, markdown lint, and diff checks passed.
program_id: remove-feature-folder-surface
planning_brief: docs/programs/completed/2026-04-26-remove-feature-folder-surface/planning-brief-9.md
read_when:
  - Resuming the checkout feature-folder removal slice.
  - Checking why checkout UI lives under app checkout private folders.
  - Validating that billing-sensitive checkout proof still runs after the move.
---

# Remove Checkout Feature Surface

This is a living execution plan for deleting the checkout feature folder.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Checkout is a billing and route handoff boundary, not a generic feature bucket. After this slice, buyer-facing checkout UI should live beside the `/checkout` route, and server-only Stripe Checkout session helpers should live under platform billing. The visible behavior must not change: checkout still creates the same Stripe Session parameters, pending checkout cookies still use the same name and options, checkout success still recovers or claims sessions the same way, and production release proof still treats checkout changes as billing-sensitive.

## Progress

- [x] 2026-04-27 EDT: Created branch `codex/remove-checkout-feature-surface` from `main` at `b1c3800`.
- [x] 2026-04-27 EDT: Read `docs/release-workflow.md` because checkout is billing, route, and release-proof sensitive.
- [x] 2026-04-27 EDT: Read local Next.js App Router docs for private folders, Server/Client Components, route handlers, and cookies.
- [x] 2026-04-27 EDT: Confirmed `features/checkout` contains six files: the checkout button, client checkout hook, pending checkout cookie helper, checkout session params builder, checkout session state interpreter, and checkout session recovery helpers.
- [x] 2026-04-27 EDT: Created planning brief 9 and this active child ExecPlan.
- [x] 2026-04-27 EDT: Moved checkout UI to `apps/web/app/checkout` private folders and checkout server helpers to `apps/web/platform/billing/checkout`.
- [x] 2026-04-27 EDT: Deleted `apps/web/features/checkout`; `rg '@/features/checkout|features/checkout' apps/web scripts` returned no matches and `find apps/web/features/checkout -maxdepth 3 -type f` returned no files.
- [x] 2026-04-27 EDT: Updated release-scope detection so `apps/web/platform/billing/checkout/` remains billing-sensitive.
- [x] 2026-04-27 EDT: Focused checkout unit, route integration, and integration-ui tests passed, followed by app format check, app lint, and app typecheck.
- [x] 2026-04-27 EDT: Completed ExecPlan lint, Program lint, markdown lint, old-path scans, and `git diff --check`.

## Surprises & Discoveries

`scripts/release/lib/release-scope.mjs` currently treats `apps/web/features/checkout/` as a billing-sensitive prefix. This slice must replace that deleted owner with the new `apps/web/platform/billing/checkout/` owner, otherwise future checkout helper changes could skip hosted `billing_integration` after merge.

The local integration-ui runner loaded nested React copies from peer dependency folders under `node_modules`, which caused invalid hook calls in tests using `@testing-library/react`. The slice now pins the jsdom test setup and Vitest resolver to the root React and React DOM packages so focused checkout interaction tests can run against one renderer. This is test harness behavior only and does not change app runtime code.

## Decision Log

Decision: Move checkout button and client checkout hook under `apps/web/app/checkout` private folders.
Rationale: The button and hook are route-facing checkout UI and browser behavior. App Router private folders make that route ownership explicit without adding routes.
Date: 2026-04-27

Decision: Move checkout server helpers under `apps/web/platform/billing/checkout`.
Rationale: These helpers assemble Stripe Checkout parameters, read and clear pending checkout cookies, retrieve Stripe sessions, and claim checkout access through Convex server tokens. Platform billing is the explicit owner for server-side billing orchestration.
Date: 2026-04-27

Decision: Replace the release-scope checkout feature prefix with the new platform billing checkout prefix.
Rationale: The old feature folder is being deleted, and the production proof classifier must still force `billing_integration` for future checkout helper changes under the new platform billing path.
Date: 2026-04-27

Decision: Pin integration-ui tests to one root React renderer in the Vitest setup.
Rationale: The hoisted Bun install contains nested React peer copies under test and UI dependencies. Focused checkout UI proof needs `@testing-library/react`, source components, and React DOM to share the same React module.
Date: 2026-04-27

## Outcomes & Retrospective

This slice is complete. `apps/web/features/checkout` was deleted. The checkout button and client checkout hook now live under `apps/web/app/checkout` private folders. The pending checkout cookie helper, checkout session parameter builder, checkout session state interpreter, and checkout session recovery helpers now live under `apps/web/platform/billing/checkout`, with `server-only` guards preserved on the server-only modules. Release-scope detection now treats the new platform billing checkout owner as billing-sensitive, so future checkout helper changes still force hosted `billing_integration`. Stripe checkout parameters, pending checkout cookie behavior, checkout success recovery, auth recovery, product-access handoff, pricing, promotion-code behavior, webhook assumptions, and environment behavior were intentionally unchanged.

## Context and Orientation

`apps/web/features/checkout/components/checkout-button.tsx` is a client component used by the homepage CTA and protected access-required UI. It calls `useStripeCheckout`, renders the existing shared button and alert primitives, and posts to the Stripe checkout route through the client hook.

`apps/web/features/checkout/hooks/use-stripe-checkout.ts` is browser-only because it uses React state, `fetch`, and `window.location.assign`. It imports `apiRouteConfig` from the route API library and `assert` from `apps/web/lib/assert.ts`.

`apps/web/features/checkout/lib/pending-checkout-session-cookie.ts` defines the `sbs_pending_checkout_session` cookie name and its options. The Stripe checkout route sets this cookie after creating a session, and checkout recovery reads and clears it.

`apps/web/features/checkout/server/checkout-session-params.ts`, `checkout-session.ts`, and `checkout-session-recovery.ts` all start with `import "server-only"`. They build Stripe Checkout Session parameters, classify checkout success state, retrieve Stripe sessions, read and delete cookies through `next/headers`, use Clerk auth, and call Convex server actions or queries with server tokens. These files must stay out of the client bundle.

`scripts/release/lib/release-scope.mjs` decides whether `Production Release Proof` must run hosted `billing_integration`. Because checkout helper ownership is changing, this classifier and its unit test must be updated in the same slice.

### In Scope

Move checkout button UI to `apps/web/app/checkout/_components/checkout-button.tsx`.

Move the client checkout hook to `apps/web/app/checkout/_hooks/use-stripe-checkout.ts`.

Move pending checkout cookie and server checkout helpers to `apps/web/platform/billing/checkout`.

Update first-party imports and tests, update release-scope detection for the new checkout path, then delete `apps/web/features/checkout`.

### Out Of Scope

Do not change Stripe checkout parameters, webhook behavior, pricing, promotion-code behavior, billing proof behavior except for preserving release-scope detection, pending checkout cookie semantics, product-access behavior, auth route behavior, Convex schema, generated Convex files, AppShell, route screens, route groups, marketing feature ownership, auth feature ownership, shared UI inventory, or environment variable behavior in this slice.

## Plan of Work

Create `apps/web/app/checkout/_components`, `apps/web/app/checkout/_hooks`, and `apps/web/platform/billing/checkout` if needed. Move the checkout button and hook into the checkout App Router private folders. Update the button to import the hook from the new route-owned hook path.

Move the pending checkout cookie helper and all three server checkout helpers into `apps/web/platform/billing/checkout`. Keep `import "server-only"` as the first statement in the three server-only files. Update server helper imports to use the new platform billing checkout paths.

Update all app and test imports from `@/features/checkout/...` to either `@/app/checkout/...` for checkout UI or `@/platform/billing/checkout/...` for server and cookie helpers. Update `apps/web/vitest.config.ts` coverage include for the moved checkout session file. Update `scripts/release/lib/release-scope.mjs` and `apps/web/tests/unit/release-scope.test.ts` so the new platform checkout path remains billing-sensitive.

Keep the integration-ui test setup in `apps/web/tests/setup/jsdom.ts` pinned to one root React renderer. This prevents local nested peer dependency copies from invalidating hook-based tests and lets the focused checkout UI tests exercise the moved component and hook directly.

Delete `apps/web/features/checkout` after all imports resolve, then run old-path scans and focused validation.

## Milestones

The first milestone is route UI ownership. It is complete when checkout button and the client checkout hook live under `apps/web/app/checkout` private folders and all UI consumers import the new component owner.

The second milestone is platform billing ownership. It is complete when pending cookie, session params, session state, and recovery helpers live under `apps/web/platform/billing/checkout` with server-only guards preserved.

The third milestone is release-proof preservation. It is complete when the release-scope classifier treats the new platform billing checkout path as billing-sensitive and its unit test proves that behavior.

The fourth milestone is validation. It is complete when focused checkout, route, access, and release-scope tests pass, followed by app format check, app lint, app typecheck, plan lint, Program lint, markdown lint, and `git diff --check`.

## Concrete Steps

From repo root, confirm branch and status:

    git status --short --branch

Run import scans after edits:

    rg '@/features/checkout|features/checkout' apps/web scripts docs/programs/active/2026-04-26-remove-feature-folder-surface docs/exec-plans/completed/2026-04-27-remove-checkout-feature-surface.md
    find apps/web/features/checkout -maxdepth 3 -type f

The first scan should return no first-party app or script imports after the plan and historical docs references are accounted for. The second command should fail because the folder was deleted.

## Validation and Acceptance

Acceptance requires `apps/web/features/checkout` to be deleted, no old checkout feature imports to remain in app or script code, checkout session params and session-state tests to pass, checkout route and UI consumers to pass, release-scope tests to prove the new checkout owner triggers billing proof, and the app to pass lint and typecheck.

### Test Commands

Run these commands from repo root:

    bun run --cwd apps/web test:unit -- tests/unit/checkout-session-params.test.ts tests/unit/checkout-session.test.ts tests/unit/sign-in-route.test.ts tests/unit/sign-up-route.test.ts tests/unit/route-metadata.test.ts tests/unit/course-access.test.ts tests/unit/release-scope.test.ts
    bun run --cwd apps/web test:integration -- tests/integration/stripe-checkout-route.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/checkout-button.test.tsx tests/integration-ui/access-required-page.test.tsx tests/integration-ui/access-required-page.interactions.test.tsx tests/integration-ui/home-page-primary-cta.test.tsx tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx
    bun run --cwd apps/web format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-27-remove-checkout-feature-surface.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/active/2026-04-26-remove-feature-folder-surface docs/exec-plans/completed/2026-04-27-remove-checkout-feature-surface.md
    git diff --check

After this PR merges, inspect the `Production Release Proof` run for the merged `main` commit and confirm `default_ship` and `billing_integration` both passed.

## Idempotence and Recovery

These are file moves and import updates. If a scan finds old paths, update the consumer to the route UI owner or platform billing checkout owner instead of adding compatibility re-exports. If a server/client boundary fails, keep browser-only React and `window` code under the `"use client"` hook and keep cookie, Stripe, Clerk server auth, and Convex server-token logic in `server-only` platform billing files.

If release-scope tests fail after moving paths, fix the classifier path list rather than weakening production proof. If checkout session tests fail, compare the returned Stripe parameter object against the previous behavior and repair the move without changing price, discount, metadata, customer email, success URL, cancel URL, or payment intent metadata semantics.

## Artifacts and Notes

Import scan after implementation:

    rg '@/features/checkout|features/checkout' apps/web scripts docs/programs/active/2026-04-26-remove-feature-folder-surface docs/exec-plans/active

The app and script scan now returns no matches. Current Program and ExecPlan docs still mention the old path only as historical context for this slice.

## Interfaces and Dependencies

Checkout depends on Next.js App Router private folders, Next.js route handlers, Next.js async `cookies()`, Clerk server auth, Stripe Checkout Sessions, Convex server actions and queries, `apps/web/platform/billing/stripe.ts`, `apps/web/platform/auth/convex-auth.ts`, `apps/web/config/product.ts`, `apps/web/app/api/_lib/api-route-config.ts`, `apps/web/lib/assert.ts`, the checkout success route under `apps/web/app/checkout/success`, identity routes under `apps/web/app/(identity)`, protected access UI under `apps/web/app/(workspace)/_components/access-required`, homepage CTA code under `apps/web/features/marketing`, the production release-scope classifier under `scripts/release/lib/release-scope.mjs`, and the integration-ui jsdom setup under `apps/web/tests/setup/jsdom.ts`.
