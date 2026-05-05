---
title: Instant Paid Checkout Fulfillment
status: complete
created_at: 2026-05-02
completed_at: 2026-05-02
summary: Make every paid Stripe Checkout Session fulfill access immediately for the checkout email instead of making guest buyers manually claim purchases.
post_build_recap: Paid guest Checkout Sessions now fulfill by checkout email through webhook and success-page retry, resolving or creating the Clerk user and granting Convex product access idempotently while retaining pending claims as fallback audit records.
program_id: one-click-paid-access
planning_brief: docs/programs/completed/2026-05-02-one-click-paid-access/planning-brief-1.md
read_when:
  - Implementing paid checkout fulfillment.
  - Changing Stripe webhook, checkout success, Clerk account, or entitlement behavior.
  - Validating the first One Click Paid Access slice.
---

# Instant Paid Checkout Fulfillment

This is a living execution plan. Update it at every stopping point so the next contributor can resume from this file alone.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Buyers should not need to understand pending checkout claims. After this plan, when Stripe confirms a Ship by Sunday Checkout Session is paid, the server resolves the checkout email to a Clerk user, grants that user product access, and records the Stripe identifiers idempotently. A signed-in buyer with the matching account should go from `/checkout/success` into the product. A signed-out or wrong-account buyer should see that access is ready for the checkout email and only need to prove that email through Clerk.

## Progress

- [x] 2026-05-02: Authored this ExecPlan from the One Click Paid Access Program packet.
- [x] 2026-05-02: Add Checkout Session customer creation and tests.
- [x] 2026-05-02: Implement the paid-session fulfillment boundary and tests.
- [x] 2026-05-02: Wire fulfillment into Stripe webhook and checkout success.
- [x] 2026-05-02: Update operator docs for the new source of truth.
- [x] 2026-05-02: Prove a paid Stripe test Checkout Session grants hosted Convex dev access by checkout email.
- [x] 2026-05-02: Leave release billing proof to the standard release workflow for the deployed checkout release scope.

## Surprises & Discoveries

The current webhook intentionally saved guest purchases as `pendingCheckoutClaims`. That was a reasonable first model for signed-out checkout, but it contradicted the desired customer journey. Pending claims now remain as fallback and audit records while happy-path access moves to server fulfillment.

Convex fulfillment needs `CLERK_SECRET_KEY` in addition to Stripe secrets. The local Stripe webhook sync helper now pushes that Clerk secret into hosted Convex dev so local billing QA exercises the same dependency as production.

## Decision Log

Decision: Fulfill from paid Checkout Session email before adding faster payment buttons.
Rationale: Payment speed is not useful unless every paid session becomes access without manual support.
Date: 2026-05-02

Decision: Use Checkout Session id as the fulfillment entry point.
Rationale: Stripe recommends webhook fulfillment for Checkout, success URLs already carry `session_id`, and both webhook and landing page can converge on this identifier.
Date: 2026-05-02

Decision: Resolve or create Clerk users by checkout email, but keep Clerk sign-in as the route-access proof.
Rationale: Stripe proves payment for an email. Clerk proves the browser owns the app identity for that email.
Date: 2026-05-02

## Outcomes & Retrospective

Implemented on 2026-05-02.

Checkout Sessions now set `customer_creation: "always"`. Guest paid sessions are fulfilled by checkout email through `checkoutClaimsActions.fulfillCheckoutSessionByEmail`, which validates the Stripe session, persists a pending claim as fallback, resolves or creates the Clerk user for the checkout email, and grants access through the existing product-access path. Stripe webhook and `/checkout/success` both call this fulfillment path, so webhook delay does not strand the buyer.

Validation run:

    bun run --cwd apps/web vitest run tests/unit/checkout-session-params.test.ts tests/integration/stripe-checkout-route.test.ts tests/unit/home-page-primary-cta.test.tsx tests/unit/checkout-session.test.ts tests/unit/checkout-claims-actions.test.ts tests/unit/checkout-claims.test.ts tests/unit/stripe-webhook-action.test.ts
    bun run --cwd apps/web vitest run tests/unit/observability-source-adapters.test.ts tests/unit/stripe-observability.test.ts tests/unit/observability-convex.test.ts tests/unit/stripe-webhook-action.test.ts
    bun test:coverage:critical
    bun run --cwd apps/web typecheck

Hosted Convex dev proof was run against fresh Stripe Checkout Session `cs_test_b1tqNo11zXV1tWsFn0n5m4HurCHxQsSbYhHPHgMQjUMPPkQNERTMs9wjme` after syncing `CLERK_SECRET_KEY` into the hosted Convex dev deployment. This session was completed through hosted Stripe Checkout with no Clerk user id in session metadata or `client_reference_id`, matching the original incident shape. `checkoutClaimsActions.fulfillCheckoutSessionByEmail` returned `kind: "fulfilled"` for checkout email `codex-proof-1777764028702@example.com`, created Clerk user `user_3DBn6r6b5SatdTvpB8H2eq9oQNh`, and inserted a product access grant. `bun stripe:dev:verify -- --session-id cs_test_b1tqNo11zXV1tWsFn0n5m4HurCHxQsSbYhHPHgMQjUMPPkQNERTMs9wjme` then passed every check: Stripe session paid, course metadata present with missing Clerk metadata accepted, Convex product access found, access status granted, access source `stripe_checkout`, and Checkout Session id linked.

Production release billing proof has not been run from this plan yet.

## Context and Orientation

Checkout starts at `apps/web/app/api/stripe/checkout/route.ts`, which calls `buildStripeCheckoutSessionCreateParams` in `apps/web/platform/billing/checkout/checkout-session-params.ts`. The current params do not set `customer_creation: "always"`, so guest one-time payments may remain guest customer sessions in Stripe.

Stripe webhook processing lives in `apps/web/convex/stripeWebhook.ts`. It currently grants directly when the session contains a Clerk user id and saves a pending checkout claim when the session does not.

Checkout success state lives in `apps/web/platform/billing/checkout/checkout-session.ts`. The success page can retrieve a Stripe session by `session_id`, determine whether it is this product and paid, and currently asks the signed-in viewer to claim the purchase when no Clerk id is present.

Claim and repair logic lives in `apps/web/convex/checkoutClaimsActions.ts` and `apps/web/convex/checkoutClaims.ts`. Entitlement writes live in `apps/web/convex/access.ts` and `apps/web/convex/access/model.ts`. Clerk server-side account helpers already exist in `apps/web/scripts/repair-paid-checkout-customer.mjs`; reuse its production-learned account resolution ideas, but move durable app behavior into production code rather than operator-only script logic.

The exact Clerk Backend SDK API surface should be verified in local dependencies before editing. Official Clerk docs show `users.createUser` supports `emailAddress` and `skipPasswordRequirement`, and that emails created through `createUser` are automatically marked verified. If that behavior is not appropriate for this product, use Clerk invitations or email-link onboarding instead and record the decision here before implementation.

### In Scope

Add a reusable paid Checkout Session fulfillment boundary. Update Checkout Session params, Stripe webhook behavior, checkout success behavior, entitlement writes, tests, and docs required to make paid access attach automatically to the checkout email. Keep signed-in direct checkout working.

### Out Of Scope

Do not add Express Checkout or homepage wallet buttons in this slice. Do not replace Clerk with Stripe Link as app auth. Do not build a broad support dashboard. Do not silently transfer a Stripe purchase between two different existing Clerk users.

## Plan of Work

First, update `apps/web/platform/billing/checkout/checkout-session-params.ts` so one-time Checkout Sessions request a Stripe Customer for guest purchases with `customer_creation: "always"`. Keep `customer_email` for signed-in users. Add or update tests in `apps/web/tests/unit/checkout-session-params.test.ts`.

Next, introduce a fulfillment module with a domain-specific name such as `apps/web/platform/billing/checkout/paid-checkout-fulfillment.ts` or the nearest existing platform location. The module should expose a function that takes a Stripe Checkout Session id plus source context, retrieves or accepts the Stripe session, validates product and paid status, extracts the checkout email, and returns a narrow result union. Keep Stripe API calls and Clerk API calls behind obvious boundaries so they can be unit-tested with fakes.

Add a Clerk account resolver in production code. It should normalize the checkout email, look up existing Clerk users by email, choose a single safe user when exactly one matches, create or invite a user when none exists according to the decision recorded here, and return explicit failure states for multiple conflicting users or provider errors. Do not hide ambiguous identity states behind fallback defaults.

Add a Convex mutation or action boundary that can grant by resolved Clerk user id and Stripe identifiers. Reuse `internal.access.grantProductAccessFromStripe` where possible. If that mutation needs stricter idempotency or conflict reporting, update `apps/web/convex/access/model.ts` and its tests rather than layering string checks around it.

Wire `apps/web/convex/stripeWebhook.ts` so guest paid sessions call the new fulfillment path instead of only saving `pendingCheckoutClaims`. Preserve a fallback record when fulfillment cannot finish because of a missing email, ambiguous Clerk state, or provider failure.

Wire `apps/web/platform/billing/checkout/checkout-session.ts` so `/checkout/success` attempts the same fulfillment for a paid session before rendering final state. This is the customer-present fast path. It must not replace webhook fulfillment.

Update checkout success and access-required copy only as much as needed to reflect the new state: access is already attached to the checkout email, and the buyer should sign in with that email. Avoid broad visual redesign in this slice.

Update docs under `apps/web/content/docs/stripe-checkout-webhook.mdx` or the nearest active billing setup doc so future operators know the new fulfillment model, required Stripe webhook events, Clerk email settings, and failure symptoms.

## Milestones

Milestone 1 makes Checkout Sessions more useful for reconciliation. Success means `customer_creation: "always"` is present, signed-in metadata still exists, and focused checkout param tests pass.

Milestone 2 builds and tests the fulfillment boundary without wiring it to live paths. Success means unit tests cover paid session, unpaid session, wrong product, missing email, existing Clerk user, created or invited Clerk user, ambiguous Clerk users, and duplicate Stripe identifiers.

Milestone 3 wires webhook fulfillment. Success means guest paid webhook events grant access instead of producing only pending claims, while invalid or ambiguous events produce explicit failure states.

Milestone 4 wires success-page fulfillment retry. Success means a paid buyer who reaches `/checkout/success?session_id=...` can trigger fulfillment even if webhook delivery is delayed.

Milestone 5 updates docs and validates the full flow. Success means tests and docs prove that pending claims are fallback or audit, not the main customer journey.

## Concrete Steps

Start from the repo root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Read the required instructions and current flow:

    sed -n '1,220p' docs/release-workflow.md
    sed -n '1,180p' apps/web/AGENTS.md
    sed -n '1,180p' apps/web/convex/_generated/ai/guidelines.md
    sed -n '1,140p' apps/web/platform/billing/checkout/checkout-session-params.ts
    sed -n '120,260p' apps/web/convex/stripeWebhook.ts
    sed -n '100,190p' apps/web/platform/billing/checkout/checkout-session.ts
    sed -n '227,390p' apps/web/convex/checkoutClaimsActions.ts

Inspect Clerk SDK types before coding:

    rg -n "createUser|skipPasswordRequirement|getUserList|emailAddress" apps/web/node_modules/@clerk -S

Run focused tests before the first edit to establish baseline:

    bun run --cwd apps/web vitest run tests/unit/checkout-session-params.test.ts tests/unit/checkout-session.test.ts tests/unit/checkout-claims-actions.test.ts tests/unit/checkout-claims.test.ts

After each milestone, rerun the focused tests for the files touched. At the end, run every command listed in `Validation and Acceptance`.

## Validation and Acceptance

Acceptance is behavioral. A paid guest Checkout Session for this product with `customer_details.email` should produce a granted access row for the Clerk user that owns that email without the buyer manually claiming the session. The same fulfillment call can be retried from webhook and success page without duplicate grants or ownership drift.

A signed-in checkout should continue to grant directly by Clerk user id. An unpaid or wrong-product session should not grant. A missing checkout email should not grant. Multiple conflicting Clerk users for the same email should not grant silently.

The UI should no longer suggest a duplicate purchase when the system has already fulfilled or can identify the paid checkout email. It should tell the buyer to sign in with the checkout email.

### Test Commands

Run these from the repo root:

    bun run --cwd apps/web vitest run tests/unit/checkout-session-params.test.ts tests/unit/checkout-session.test.ts tests/unit/checkout-claims-actions.test.ts tests/unit/checkout-claims.test.ts
    bun run --cwd apps/web vitest run tests/integration/stripe-checkout-route.test.ts
    bun run --cwd apps/web vitest run tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx tests/integration-ui/access-required-page.test.tsx tests/integration-ui/access-required-page.interactions.test.tsx
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-02-instant-paid-checkout-fulfillment.md
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-02-instant-paid-checkout-fulfillment.md docs/programs/completed/2026-05-02-one-click-paid-access
    bun run format
    bun lint
    bun typecheck
    git diff --check

After deployment, run the release billing proof required by `docs/release-workflow.md` for checkout, Stripe, entitlement, and access-handoff changes.

## Idempotence and Recovery

The fulfillment function must be safe to run repeatedly for the same Checkout Session id. Webhook retries, browser refreshes, and manual support reruns should converge on the same grant result.

If Clerk user creation succeeds but Convex grant fails, rerunning fulfillment should find the existing Clerk user and finish the grant. If Convex grant succeeds but pending claim cleanup fails, rerunning should patch the claim state without creating a second grant.

If an existing Stripe identifier is already attached to a different Clerk user, stop and return an explicit conflict state. Do not move paid access across users automatically in this slice.

If `customer_creation: "always"` causes a Stripe API error in this repo's Stripe SDK or account mode, revert that single parameter and keep the fulfillment work based on `customer_details.email`; record the observed error here.

## Artifacts and Notes

The current bad path is:

    signed-out buyer pays
    Stripe session has customer_details.email but no clerkUserId
    webhook saves pendingCheckoutClaims
    buyer must sign in with exact verified email and trigger claim
    wrong account or unclear email creates support work

The target path is:

    signed-out buyer pays
    webhook or success page validates paid session
    server resolves or creates Clerk user for customer_details.email
    Convex access grant exists for that Clerk user
    buyer signs in with checkout email and enters product

## Interfaces and Dependencies

This plan depends on Stripe Checkout Sessions, Stripe webhook event verification, Clerk Backend SDK, Convex internal mutations and actions, and the existing Next.js checkout success route.

The main interfaces to preserve are `CheckoutSessionState`, `claimCheckoutSessionForViewer`, `grantProductAccessFromStripe`, and the public `/api/stripe/checkout` response shape. Add new result unions instead of broad booleans so tests can prove every supported state.
