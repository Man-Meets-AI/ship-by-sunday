---
title: Homepage Express Link Checkout
status: active
created_at: 2026-05-02
completed_at: null
summary: Add a homepage and pricing Express Checkout path so eligible buyers can pay with Link or wallets directly while hosted Checkout remains the fallback.
post_build_recap: null
program_id: one-click-paid-access
planning_brief: docs/programs/active/2026-05-02-one-click-paid-access/planning-brief-1.md
read_when:
  - Implementing homepage Link or Express Checkout.
  - Changing Stripe.js, homepage CTA, or pricing purchase behavior.
  - Validating the second One Click Paid Access slice.
---

# Homepage Express Link Checkout

This is a living execution plan. Update it at every stopping point so the next contributor can resume from this file alone.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Eligible buyers should see the fastest Stripe payment button directly on the homepage, such as `Pay with Link`, while every other buyer still has a clear hosted Checkout button. After this plan, the homepage and pricing CTA areas can render Stripe's Express Checkout Element when wallet methods are available, create the same product purchase, and send the buyer through the same instant paid fulfillment path.

## Progress

- [x] 2026-05-02: Authored this ExecPlan from the One Click Paid Access Program packet.
- [x] 2026-05-02: Confirm the instant paid fulfillment slice has landed and record its proof here.
- [x] 2026-05-02: Add Stripe.js dependencies and embedded Checkout Session creation as needed.
- [x] 2026-05-02: Render Express Checkout as progressive enhancement in homepage and pricing CTA surfaces.
- [x] 2026-05-02: Add fallback, readiness, route, and UI tests.
- [x] 2026-05-02: Update provider setup docs and run focused validation.
- [x] 2026-05-02: Confirm the shared paid-session fulfillment proof passed against hosted Convex dev.
- [ ] 2026-05-02: Run hosted browser proof with valid local Clerk env.

## Surprises & Discoveries

Stripe's current docs describe `ui_mode: "elements"`, but the installed Stripe Node SDK types for this repo expose Checkout Sessions custom UI as `ui_mode: "custom"`. The implementation follows the installed SDK and uses `return_url` plus `client_secret`, leaving hosted Checkout on the original route.

Local browser proof against the dev server was blocked by a Clerk session refresh redirect loop in the current local env. Focused UI tests and production build/typecheck passed; rerun browser proof after repairing local Clerk env parity.

## Decision Log

Decision: Depend on `docs/exec-plans/active/2026-05-02-instant-paid-checkout-fulfillment.md`.
Rationale: Express Checkout changes the payment entry speed but must not create a second entitlement model.
Date: 2026-05-02

Decision: Use Express Checkout as progressive enhancement.
Rationale: Browser, wallet, currency, domain, and Dashboard eligibility vary, so the existing hosted Checkout button remains necessary.
Date: 2026-05-02

Decision: Prefer Checkout Sessions API and embedded components over raw PaymentIntents.
Rationale: Stripe's current Express Checkout docs recommend Checkout Sessions for most integrations, and this repo already reconciles purchases by Checkout Session.
Date: 2026-05-02

## Outcomes & Retrospective

Implemented on 2026-05-02.

The homepage checkout CTA now mounts `ExpressCheckoutButton` as a progressive enhancement. It creates a custom Checkout Session through `POST /api/stripe/checkout/express`, initializes Stripe.js from the returned publishable key, renders `ExpressCheckoutElement` when Stripe reports available methods, and falls back to the hosted Checkout button when the direct wallet path is unavailable or errors.

Hosted Checkout remains the fallback and still uses `POST /api/stripe/checkout`. The Express Checkout route carries the same product metadata, Clerk metadata, Stripe Customer creation setting, discount handling, pending checkout cookie, and `/checkout/success` handoff.

Validation run:

    bun run --cwd apps/web lint -- platform/env/server.ts platform/billing/stripe.ts platform/billing/checkout/checkout-session-params.ts app/api/_lib/api-route-config.ts app/api/stripe/checkout/express/route.ts app/checkout/_components/express-checkout-button.tsx app/_components/home-page/sections/home-page-checkout-cta.tsx app/_components/home-page/sections/home-page-primary-cta.tsx scripts/local-stripe-webhook.mjs tests/unit/checkout-session-params.test.ts tests/integration/stripe-checkout-route.test.ts tests/unit/home-page-primary-cta.test.tsx
    bun run --cwd apps/web vitest run tests/unit/checkout-session-params.test.ts tests/integration/stripe-checkout-route.test.ts tests/unit/home-page-primary-cta.test.tsx
    bun run --cwd apps/web test:integration:ui
    bun run --cwd apps/web typecheck

The shared fulfillment contract was proven against hosted Convex dev with Stripe Checkout Session `cs_test_b1tqNo11zXV1tWsFn0n5m4HurCHxQsSbYhHPHgMQjUMPPkQNERTMs9wjme`. The session was completed through hosted Stripe Checkout with only checkout email plus course metadata and no Clerk user id. `bun stripe:dev:verify -- --session-id cs_test_b1tqNo11zXV1tWsFn0n5m4HurCHxQsSbYhHPHgMQjUMPPkQNERTMs9wjme` passed with a granted Convex access row linked to the session and source `stripe_checkout`.

Browser proof attempted against `http://127.0.0.1:3000/` with the Express Checkout route intercepted to avoid creating Stripe test sessions, but the page did not reach `DOMContentLoaded` because local Clerk reported a session-token refresh loop. Repair local Clerk key parity and rerun desktop/mobile visual proof before release.

## Context and Orientation

The homepage CTA rendering boundary is `apps/web/app/_components/home-page/sections/home-page-primary-cta.tsx`. It currently switches between a hosted checkout button and a normal link. `CheckoutButton` lives under `apps/web/app/checkout/_components/checkout-button` and calls the existing `/api/stripe/checkout` route.

Homepage behavior is configured through `starterConfig.homePage` in `apps/web/config/product.ts`, homepage content in `apps/web/app/_content/home-page.ts`, and render-model code in `apps/web/app/_lib/home-page-render-model.ts`. The root instructions say not to scatter checkout behavior across sections.

The app does not currently depend on `@stripe/stripe-js` or `@stripe/react-stripe-js`. This plan may need to add those packages and update the lockfile. If a Stripe client dependency already exists by the time this plan runs, reuse the existing one.

Stripe Express Checkout Element requires a client-side Stripe.js integration. It can show Link and other one-click methods when available, but it requires HTTPS, payment method activation, and registered payment method domains in test and live environments. It must expose a ready-state fallback so buyers never lose the hosted Checkout path.

### In Scope

Add a direct Express Checkout path to homepage and pricing purchase surfaces. Add the required Stripe client integration, route support, UI states, tests, docs, and setup notes. Keep hosted Checkout as fallback and reuse instant paid fulfillment from the first child ExecPlan.

### Out Of Scope

Do not implement this before instant paid fulfillment is merged and validated. Do not redesign the homepage. Do not replace hosted Checkout. Do not introduce a raw PaymentIntent flow unless this plan is revised with a recorded decision. Do not make Stripe Link the app's auth system.

## Plan of Work

First, confirm the dependency slice is complete. Read `docs/exec-plans/active/2026-05-02-instant-paid-checkout-fulfillment.md` and record the exact proof that paid-session fulfillment now works.

Next, read the Next.js docs relevant to any App Router route handlers or client/server boundaries touched by this plan, plus `DESIGN.md`, `docs/ship-by-sunday/design-pack/AGENTS.md`, and `apps/web/content/docs/configure-the-homepage.mdx` because this changes user-facing homepage purchase UI.

Add Stripe client dependencies only if they are not already installed. Use the repo's existing package manager and update the lockfile in the same change.

Add a server route or adapt the existing checkout route to create a Checkout Session suitable for Express Checkout embedded components. The route must carry the same product metadata, signed-in Clerk metadata when present, success handoff, and fulfillment compatibility as hosted Checkout. Keep hosted Checkout creation intact.

Create a focused client component for Express Checkout, near the checkout or homepage CTA boundary. The component should initialize Stripe.js with the publishable key, create or fetch the embedded Checkout Session client secret, mount `ExpressCheckoutElement`, listen for the ready event, and report whether wallet methods are available. When no methods are available or initialization fails, it should hide itself and leave the existing hosted Checkout button visible.

Integrate the component through `HomePagePrimaryCta` or a nearby feature-local boundary so checkout behavior remains centralized. The homepage should show Express Checkout when available and hosted Checkout as fallback. Pricing should follow the same pattern if it uses the same CTA target.

Add tests that prove the fallback remains visible, the Express Checkout mount path receives the right route data, unavailable wallets hide the direct button without blocking purchase, and errors do not strand the buyer.

Update setup docs to list required Stripe Dashboard payment methods, Link activation, payment method domain registration for test and live, required publishable key env, and verification steps.

## Milestones

Milestone 1 verifies dependencies and setup. Success means instant fulfillment is complete, required docs have been read, Stripe client packages and env requirements are known, and no homepage edit starts from stale assumptions.

Milestone 2 creates the Express Checkout session path. Success means the server can create a Checkout Session compatible with embedded Express Checkout while preserving hosted Checkout.

Milestone 3 renders Express Checkout as progressive enhancement. Success means eligible browsers see wallet buttons and ineligible browsers still see the normal hosted Checkout CTA.

Milestone 4 validates UI and provider setup docs. Success means tests cover ready, unavailable, and error states, docs describe external setup, and browser proof confirms desktop and mobile layout.

## Concrete Steps

Start from the repo root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Confirm the dependency slice:

    sed -n '1,260p' docs/exec-plans/active/2026-05-02-instant-paid-checkout-fulfillment.md

Read required docs before UI and route edits:

    sed -n '1,220p' docs/release-workflow.md
    sed -n '1,180p' apps/web/AGENTS.md
    sed -n '1,220p' DESIGN.md
    sed -n '1,180p' docs/ship-by-sunday/design-pack/AGENTS.md
    sed -n '1,220p' apps/web/content/docs/configure-the-homepage.mdx

Inspect current homepage and checkout surfaces:

    sed -n '1,140p' apps/web/app/_components/home-page/sections/home-page-primary-cta.tsx
    sed -n '1,180p' apps/web/app/checkout/_components/checkout-button.tsx
    sed -n '1,140p' apps/web/app/api/stripe/checkout/route.ts
    sed -n '1,140p' apps/web/platform/billing/checkout/checkout-session-params.ts
    rg -n "@stripe/react-stripe-js|@stripe/stripe-js|ExpressCheckoutElement|CheckoutElementsProvider" apps/web -S

Run current tests before editing:

    bun run --cwd apps/web vitest run tests/integration/stripe-checkout-route.test.ts tests/unit/checkout-session-params.test.ts

After implementation, run the test commands listed below.

## Validation and Acceptance

The homepage purchase path is acceptable when an eligible browser can render an Express Checkout wallet button and complete a purchase that reaches the same success and fulfillment path as hosted Checkout. An ineligible browser must still show the normal hosted Checkout buy CTA and remain fully purchasable.

The UI must not flash a broken wallet area, hide the fallback, or require the buyer to understand payment method availability. Provider setup must be documented clearly enough for a future operator to verify Stripe Dashboard and domain registration.

### Test Commands

Run these from the repo root:

    bun run --cwd apps/web vitest run tests/integration/stripe-checkout-route.test.ts tests/unit/checkout-session-params.test.ts
    bun run --cwd apps/web vitest run tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx
    bun run --cwd apps/web vitest run tests/integration-ui/home-page*.test.tsx tests/unit/home-page*.test.ts
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-homepage-express-link-checkout.md
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-02-homepage-express-link-checkout.md docs/programs/active/2026-05-02-one-click-paid-access
    bun run format
    bun lint
    bun typecheck
    git diff --check

Run browser proof for at least one desktop and one mobile viewport after starting the local dev server. Because Express Checkout availability depends on browser wallet setup, record whether the proof shows live wallet buttons or fallback-only behavior and why.

## Idempotence and Recovery

If Express Checkout initialization fails, the component should leave hosted Checkout visible and log or surface a non-blocking error for observability. Refreshing the homepage should not create a paid session by itself; only an intentional wallet confirmation should do that.

If adding Stripe client packages causes dependency or build problems, revert only the dependency and Express Checkout code while keeping fulfillment work intact.

If Dashboard domain registration is missing, Express Checkout may not show methods. The documented recovery is to register the production and test domains in Stripe payment method domains, then retry the browser proof.

## Artifacts and Notes

The intended customer-visible hierarchy is:

    Eligible visitor: Pay with Link or another wallet directly on the homepage.
    Ineligible visitor: Click the normal hosted Checkout buy button.
    Both visitors: Stripe confirms payment, instant fulfillment grants access by checkout email, Clerk proves email before protected routes.

## Interfaces and Dependencies

This plan depends on the completed instant fulfillment slice, Stripe.js, Stripe Checkout Sessions API, Express Checkout Element, the homepage CTA boundary, and provider Dashboard setup.

Preserve the existing `/api/stripe/checkout` hosted Checkout response unless a separate route is introduced. If a new route is introduced for embedded Checkout, give it a specific name and tests that prove it cannot create arbitrary products or prices from client input.
