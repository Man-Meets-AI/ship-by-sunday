---
title: Make Billing And Stripe Boundaries Auditable
status: complete
created_at: 2026-04-26
completed_at: 2026-04-26
summary: Separate Stripe checkout route orchestration from checkout session parameter assembly without changing checkout, promo, webhook, environment, or proof behavior.
post_build_recap: The checkout route now delegates Stripe Checkout Session parameters to a checkout server helper, platform billing no longer imports the course registry for course slug metadata, and focused plus app validation passed without changing billing behavior.
program_id: app-structure-refactor
planning_brief: docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-10.md
read_when:
  - Resuming the billing boundary cleanup.
  - Checking why the checkout route delegates Stripe session parameter assembly.
  - Validating that Stripe checkout, active promo, webhook, environment, and release proof behavior remain unchanged.
---

# Make Billing And Stripe Boundaries Auditable

This is a living execution plan. It describes the tenth implementation slice for the app structure refactor Program.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The checkout path works, but its ownership is hard to audit because `apps/web/app/api/stripe/checkout/route.ts` builds the full Stripe Checkout Session parameter object inline while also handling request orchestration, observability, cookies, and errors. The billing platform helper also imports the course registry only to read a course slug that is already product config.

After this slice, the route will stay responsible for the HTTP request boundary, and a checkout server helper will own the Stripe Checkout Session creation parameters. The user-visible checkout flow must not change: signed-out and signed-in buyers should still get the same Stripe redirect URL behavior, the active promotion code should still be auto-applied, and product-access handoff metadata should stay the same.

## Progress

- [x] 2026-04-26 EDT: Confirmed the first nine child ExecPlans are complete and the Program names billing and Stripe boundary auditability as the next recommended slice.
- [x] 2026-04-26 EDT: Read `apps/web/AGENTS.md`, `docs/release-workflow.md`, `docs/exec-plans/PLANS.md`, `docs/programs/PROGRAMS.md`, and the local Next route handler docs before changing checkout route code.
- [x] 2026-04-26 EDT: Inspected the checkout route, product pricing config, server env loader, checkout hook, checkout success server helpers, Convex webhook ownership, billing release scope detection, billing proof planner, and focused billing tests.
- [x] 2026-04-26 EDT: Wrote planning brief 10 and opened this active child ExecPlan.
- [x] 2026-04-26 EDT: Extracted checkout session parameter assembly into `apps/web/features/checkout/server/checkout-session-params.ts`.
- [x] 2026-04-26 EDT: Removed the billing platform helper dependency on the course registry by using `productConfig.courseSlug` for inline Stripe price metadata.
- [x] 2026-04-26 EDT: Added focused checkout session parameter tests and updated line-item and observability tests for the server-only billing helper boundary.
- [x] 2026-04-26 EDT: Static scans found no remaining course-registry import in platform billing and no inline Stripe session parameter assembly in the checkout route.
- [x] 2026-04-26 EDT: Focused unit and checkout route integration tests passed.
- [x] 2026-04-26 EDT: App format check, app lint, and app typecheck passed.
- [x] 2026-04-26 EDT: Active-path plan lint, Program lint, markdown lint, and `git diff --check` passed.
- [x] 2026-04-26 EDT: Archived this ExecPlan and updated the Program handoff.
- [x] 2026-04-26 EDT: Completed-path plan lint, Program lint, markdown lint, and `git diff --check` passed after archival.

## Surprises & Discoveries

2026-04-26 EDT: `apps/web/convex/http.ts` owns the production Stripe webhook path at `/stripe/webhook`; this slice must not add or move a Next webhook route.

2026-04-26 EDT: `apps/web/platform/billing/stripe.ts` imports `COURSE_SLUG` from `apps/web/features/course/lesson/model/registry` only for inline price metadata. `apps/web/config/product.ts` already exposes the same product-level course slug through `productConfig.courseSlug`.

2026-04-26 EDT: The route test already asserts the active promotion-code behavior that matters most: when checkout discounts exist, the Stripe Session includes `discounts` and does not include `allow_promotion_codes`.

2026-04-26 EDT: Adding `server-only` to the new checkout session parameter helper required direct unit tests for billing helpers to mock the package, matching the existing server-only test pattern in route and environment tests.

## Decision Log

Decision: Extract only Stripe Checkout Session parameter assembly, not Stripe client creation or response handling.
Rationale: The route should still own the request boundary, Clerk lookup, app base URL, cookie write, and error response. The checkout feature can own the stable session contract without changing runtime behavior.
Date: 2026-04-26

Decision: Use `productConfig.courseSlug` in billing platform code instead of importing the course registry.
Rationale: Billing metadata belongs to the product configuration contract. Importing the lesson registry from platform billing hides a course-domain dependency in a Stripe helper.
Date: 2026-04-26

Decision: Leave webhook, promo, environment, and release-proof behavior untouched.
Rationale: Those surfaces are billing-sensitive and already have dedicated proof paths. This slice should make ownership clearer while preserving the existing contract.
Date: 2026-04-26

## Outcomes & Retrospective

This plan is complete. The checkout route now delegates Stripe Checkout Session parameter assembly to `apps/web/features/checkout/server/checkout-session-params.ts`, and platform billing now uses `productConfig.courseSlug` instead of importing the course registry. The route still owns request ID handling, Clerk lookup, app base URL, managed Stripe price assertion, Stripe client call, missing URL handling, pending checkout cookie writes, and unexpected error responses.

Focused tests proved the signed-in and guest Checkout Session parameter shapes still include the same URLs, metadata, line items, active promotion-code discounts, and payment intent metadata. App format, lint, typecheck, plan lint, Program lint, markdown lint, and diff validation passed. This slice did not change Stripe checkout behavior, webhook behavior, pricing, promo code behavior, billing proof behavior, environment behavior, Convex schema or generated files, public Convex function names, route screens, AppShell, shared UI inventory, or the unrelated stashed scrollbar styling.

## Context and Orientation

Ship by Sunday's web app lives in `apps/web`. Buyer checkout starts at the client hook `apps/web/features/checkout/hooks/use-stripe-checkout.ts`, which posts to `apps/web/app/api/stripe/checkout/route.ts`. The route gets Clerk auth state, validates the managed Stripe price through `apps/web/platform/billing/stripe.ts`, creates a Stripe Checkout Session, stores `sbs_pending_checkout_session`, and returns the redirect URL.

The canonical product and pricing contract lives in `apps/web/config/product.ts`. It defines `productConfig.courseSlug`, `productConfig.priceUsdCents`, `productConfig.currency`, `productConfig.activeOffer`, `routeConfig.checkoutCancel`, and `getCheckoutSuccessHref`.

The production Stripe webhook is not a Next route. It is Convex HTTP code in `apps/web/convex/http.ts`, which routes `POST /stripe/webhook` to `apps/web/convex/stripeWebhook.ts`. Product access is granted through Convex access mutations. This slice may inspect those files, but it must not change their behavior.

Billing release proof lives outside the app route in `scripts/release/lib/billing-integration-step-planner.mjs`, `scripts/release/run-release-proof.mjs`, and app scripts such as `apps/web/scripts/verify-hosted-stripe-checkout.mjs`. This slice must not change those commands or their behavior.

### In Scope

Create `apps/web/features/checkout/server/checkout-session-params.ts` as a server-only checkout helper that builds the Stripe Checkout Session creation parameters currently assembled inline by `apps/web/app/api/stripe/checkout/route.ts`.

Update `apps/web/app/api/stripe/checkout/route.ts` to call the new helper while preserving the same request orchestration, managed price assertion, Stripe client call, missing URL error handling, pending checkout cookie, and unexpected error handling.

Update `apps/web/platform/billing/stripe.ts` so inline Stripe price metadata uses `productConfig.courseSlug` instead of importing `COURSE_SLUG` from the course registry.

Add or update focused tests for checkout session params, Stripe line-item metadata, and checkout route behavior.

Update this ExecPlan, the owning Program, and the current planning brief pointer to match the actual change.

### Out Of Scope

Do not add a Next Stripe webhook route, move Convex HTTP routes, modify `apps/web/convex/schema.ts`, modify generated Convex files, rename or delete feature folders, move route screens, move AppShell, change Stripe checkout behavior, webhook behavior, pricing, promo code behavior, billing proof behavior, environment behavior, public Convex function names, shared UI inventory, or the unrelated stashed scrollbar styling change.

Do not change the active pricing offer, Stripe promotion-code requirement, allow-promotion-code fallback, Checkout Session URL format, metadata keys, cookie name, cookie options, or product-access handoff semantics.

## Plan of Work

Start by adding `apps/web/features/checkout/server/checkout-session-params.ts`. It should import `server-only`, use Stripe types, read `getCheckoutSuccessHref`, `productConfig`, and `routeConfig` from `apps/web/config/product.ts`, and call the existing `getStripeLineItem` and `getStripeCheckoutDiscounts` helpers. It should export a single function that accepts the app base URL, Clerk user ID, and customer email. The returned object must match the existing route object exactly.

Update `apps/web/app/api/stripe/checkout/route.ts` by removing inline session parameter assembly and passing the helper result to `stripe.checkout.sessions.create`. Keep `assertManagedStripePriceMatchesProductConfig`, `getStripe`, request ID handling, observability context, response JSON, and pending checkout cookie behavior where they are.

Update `apps/web/platform/billing/stripe.ts` by removing the course registry import and using `productConfig.courseSlug` in inline price metadata.

Update focused tests. Add direct helper coverage for the session params, update the Stripe line-item test to assert `productConfig.courseSlug`, and keep the route integration test proving signed-out and signed-in Checkout Session creation still sends the same parameter shape.

Finally run focused proof before broad validation. Keep this plan and the Program current after implementation and after validation.

## Milestones

The first milestone is plan and baseline evidence. It is complete when planning brief 10 and this ExecPlan exist, and the plan records the checkout route, billing platform, Convex webhook, pricing, environment, and billing proof boundaries.

The second milestone is checkout helper extraction. It is complete when the route delegates session parameter assembly to `apps/web/features/checkout/server/checkout-session-params.ts`, and focused tests prove the generated parameters still include the same metadata, URLs, discounts, line items, customer email, and payment intent metadata.

The third milestone is billing-to-course dependency removal. It is complete when `apps/web/platform/billing/stripe.ts` no longer imports the course registry and line-item tests prove inline price metadata still uses the Ship by Sunday course slug.

The fourth milestone is validation and archival. It is complete when focused tests, app gates, plan lint, Program lint, markdown lint, and `git diff --check` pass, this ExecPlan moves to `docs/exec-plans/completed/`, and the Program names the next slice.

## Concrete Steps

From repo root, confirm branch and status:

    git status --short --branch

Read the Program, current planning brief, and this plan:

    sed -n '1,280p' docs/programs/completed/2026-04-26-app-structure-refactor/program.md
    sed -n '1,220p' docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-10.md
    sed -n '1,360p' docs/exec-plans/active/2026-04-26-make-billing-and-stripe-boundaries-auditable.md

Record baseline billing imports and inline checkout assembly:

    rg 'COURSE_SLUG|features/course/lesson/model/registry' apps/web/platform/billing/stripe.ts apps/web/tests/unit/stripe-line-item.test.ts
    rg 'checkout.sessions.create\\(\\{|allow_promotion_codes|payment_intent_data|line_items|success_url' apps/web/app/api/stripe/checkout/route.ts

After implementation, prove the boundary:

    rg 'COURSE_SLUG|features/course/lesson/model/registry' apps/web/platform/billing/stripe.ts apps/web/tests/unit/stripe-line-item.test.ts
    rg 'checkout.sessions.create\\(\\{|allow_promotion_codes|payment_intent_data|line_items|success_url' apps/web/app/api/stripe/checkout/route.ts

Run focused tests:

    bun run --cwd apps/web test:unit -- tests/unit/checkout-session-params.test.ts tests/unit/stripe-line-item.test.ts tests/unit/checkout-session.test.ts tests/unit/hosted-stripe-checkout-proof.test.ts tests/unit/stripe-observability.test.ts
    bun run --cwd apps/web test:integration -- tests/integration/stripe-checkout-route.test.ts

Then run app and plan checks:

    bun run format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-26-make-billing-and-stripe-boundaries-auditable.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/completed/2026-04-26-app-structure-refactor docs/exec-plans/completed/2026-04-26-make-billing-and-stripe-boundaries-auditable.md
    git diff --check

## Validation and Acceptance

This slice is accepted when the checkout route no longer contains inline Stripe session parameter assembly, a checkout server helper owns that parameter shape, platform billing no longer imports the course registry, and focused route plus helper tests prove the Stripe Checkout Session parameters did not change.

Signed-out checkout must still create a session without `client_reference_id` or `customer_email`, with course metadata, line item, and auto-applied discount. Signed-in checkout must still include Clerk metadata, `client_reference_id`, `customer_email`, the success and cancel URLs, line item, payment intent metadata, and active discount. When discounts are present, the session must still omit `allow_promotion_codes`.

### Test Commands

Run these commands from repo root after implementation:

    rg 'COURSE_SLUG|features/course/lesson/model/registry' apps/web/platform/billing/stripe.ts apps/web/tests/unit/stripe-line-item.test.ts
    rg 'checkout.sessions.create\\(\\{|allow_promotion_codes|payment_intent_data|line_items|success_url' apps/web/app/api/stripe/checkout/route.ts
    bun run --cwd apps/web test:unit -- tests/unit/checkout-session-params.test.ts tests/unit/stripe-line-item.test.ts tests/unit/checkout-session.test.ts tests/unit/hosted-stripe-checkout-proof.test.ts tests/unit/stripe-observability.test.ts
    bun run --cwd apps/web test:integration -- tests/integration/stripe-checkout-route.test.ts
    bun run format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-26-make-billing-and-stripe-boundaries-auditable.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/completed/2026-04-26-app-structure-refactor docs/exec-plans/completed/2026-04-26-make-billing-and-stripe-boundaries-auditable.md
    git diff --check

## Idempotence and Recovery

The extraction is safe to retry because it is a pure code move around a tested parameter object. If a route test fails, compare the object passed to `stripe.checkout.sessions.create` with the pre-extraction test expectations and preserve the existing route behavior.

If a helper test fails because `STRIPE_PROMOTION_CODE_ID` is missing, keep the active-offer requirement. Do not disable the offer or weaken the environment guard to make a test pass.

If Convex or billing proof files appear tempting to adjust, stop. This slice is complete when ownership is clearer and behavior is unchanged, not when the whole billing stack is reorganized.

## Artifacts and Notes

Source Program packet:

    docs/programs/completed/2026-04-26-app-structure-refactor/

Current planning brief:

    docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-10.md

Expected new checkout helper:

    apps/web/features/checkout/server/checkout-session-params.ts

Boundary scans passed with no matches:

    rg 'COURSE_SLUG|features/course/lesson/model/registry' apps/web/platform/billing/stripe.ts apps/web/tests/unit/stripe-line-item.test.ts
    no matches

    rg 'checkout.sessions.create\\(\\{|allow_promotion_codes|payment_intent_data|line_items|success_url' apps/web/app/api/stripe/checkout/route.ts
    no matches

Focused unit validation passed:

    bun run --cwd apps/web test:unit -- tests/unit/checkout-session-params.test.ts tests/unit/stripe-line-item.test.ts tests/unit/checkout-session.test.ts tests/unit/hosted-stripe-checkout-proof.test.ts tests/unit/stripe-observability.test.ts
    Test Files  5 passed (5)
    Tests  39 passed (39)

Focused integration validation passed:

    bun run --cwd apps/web test:integration -- tests/integration/stripe-checkout-route.test.ts
    Test Files  1 passed (1)
    Tests  4 passed (4)

App-level validation passed:

    bun run format:check
    All matched files use the correct format.

    bun run --cwd apps/web lint
    Found 0 warnings and 0 errors.

    bun run --cwd apps/web typecheck
    Compiled successfully.

Plan and Program validation passed after archival:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-26-make-billing-and-stripe-boundaries-auditable.md
    docs/exec-plans/completed/2026-04-26-make-billing-and-stripe-boundaries-auditable.md: ok

    bun run programs:lint
    app-structure-refactor: ok

    bun run markdown:lint -- --paths docs/programs/completed/2026-04-26-app-structure-refactor docs/exec-plans/completed/2026-04-26-make-billing-and-stripe-boundaries-auditable.md
    docs/exec-plans/completed/2026-04-26-make-billing-and-stripe-boundaries-auditable.md: ok
    docs/programs/completed/2026-04-26-app-structure-refactor/program.md: ok

    git diff --check
    no output

Focused validation targets:

    apps/web/tests/unit/checkout-session-params.test.ts
    apps/web/tests/unit/stripe-line-item.test.ts
    apps/web/tests/unit/checkout-session.test.ts
    apps/web/tests/unit/hosted-stripe-checkout-proof.test.ts
    apps/web/tests/unit/stripe-observability.test.ts
    apps/web/tests/integration/stripe-checkout-route.test.ts

## Interfaces and Dependencies

This plan depends on `docs/programs/completed/2026-04-26-app-structure-refactor/program.md`, `docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-10.md`, `docs/exec-plans/PLANS.md`, `docs/programs/PROGRAMS.md`, `docs/release-workflow.md`, `apps/web/app/api/stripe/checkout/route.ts`, `apps/web/features/checkout/server/checkout-session.ts`, `apps/web/features/checkout/server/checkout-session-recovery.ts`, `apps/web/platform/billing/stripe.ts`, `apps/web/config/product.ts`, `apps/web/convex/http.ts`, `apps/web/convex/stripeWebhook.ts`, `scripts/release/lib/billing-integration-step-planner.mjs`, `scripts/release/lib/release-scope.mjs`, and focused tests under `apps/web/tests`.
