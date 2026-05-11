---
title: Worker Generate Tutorials Planning Brief 2
program_id: worker-generate-tutorials-ia
brief_version: 2
status: current
summary: Hard-switch the paid app IA to Home, Generate Codebase, Tutorials, and Worker while cleaning up Stripe checkout handoff metadata and webhook proof.
read_when:
  - "Creating the first child ExecPlan for the Worker IA migration."
  - "Implementing the first hard-switch product IA and checkout handoff slice."
---

# Worker Generate Tutorials Planning Brief 2

The first child ExecPlan should be titled `Hard Switch Paid App IA And Checkout Handoff To Home Generate Codebase Tutorials And Worker`.

The goal is to cut the customer-facing paid app IA from the old route and lane model to a real protected Home plus Generate Codebase, Tutorials, and Worker. A paid customer should land on `/home` after checkout, see first-purchase treatment from app-owned state, and be able to move between `/generate-codebase`, `/tutorials`, and `/workers` according to explicit capabilities instead of being locked into one scalar `fulfillmentTrack`. The visible app should stop teaching `/workspace/choose`, `/codebase`, `/review`, `/lesson/*`, or `/workspace/*` as supported product routes.

Exact scope: update the product access model in `apps/web/convex/access/model.ts`, validators in `apps/web/convex/access/validators.ts`, checkout intent and metadata handling in `apps/web/platform/billing/checkout/`, durable checkout purchase-intent storage in Convex, `apps/web/lib/product-access.ts`, `apps/web/platform/access/product-access.ts`, `apps/web/config/product.ts`, route files under `apps/web/app/(workspace)/`, proxy protected route configuration, checkout success routing, auth fallback and checkout-welcome detection, resume destination routing, AppShell logo navigation, Command-K, user menu links, and route/UI tests for the touched surfaces.

The implementation must replace `/workspace/choose` with protected `/home`. `/home` owns the first-purchase state, welcome treatment, and three main path affordances: Generate Codebase, Tutorials, and Worker. First-time purchaser UI must come from app state tied to the checkout handoff or purchase intent, not from Stripe metadata. Public `/` remains the marketing homepage. Do not reuse `routeConfig.home` for the paid app without first separating public marketing home from protected app home.

The implementation may read old persisted checkout values as migration inputs, but it must not preserve them as current product authority. Existing `generated_codebase` grants should map to Generate Codebase and Tutorials. Existing `existing_codebase_doctor` grants should map to Worker and Tutorials if the product decision is that all paid customers can watch tutorials. If that product decision changes, the ExecPlan must record the alternate mapping before implementation.

The Stripe checkout handoff must stop using `courseSlug` as the main reconciliation primitive. Create a durable app-side purchase intent before creating the Stripe Checkout Session, and include a compact metadata packet on both `Checkout.Session.metadata` and `payment_intent_data.metadata`:

```ts
{
	metadataSchema: "mma_checkout_v1",
	app: "man_meets_ai",
	accessProduct: "paid_app_access",
	purchaseIntentId: "<app-owned-purchase-intent-id>",
	checkoutSurface: "<domain-specific-checkout-surface>",
	clerkUserId: "<signed-in-user-id-if-present>"
}
```

Do not put path choice, `/home`, first-time flags, lesson ids, raw UI state, email addresses, names, or sensitive data in Stripe metadata. The app database owns purchase state, first-run state, capability resolution, and the buyer's default surface.

Stripe webhook proof must align with Stripe's best practices. Release preflight should reject `enabled_events: ["*"]` and require only the event types this integration needs. The webhook endpoint should acknowledge Stripe quickly after signature verification and durable event recording, then perform fulfillment through a queued or equivalent asynchronous path. Fulfillment must remain idempotent by Stripe Checkout Session id and by logical duplicate event key: Stripe object id plus event type. The current inline fulfillment and idempotent ledger are acceptable as migration inputs, but the target design should not make Clerk/account creation latency part of the webhook response path.

This first slice should add `/home`, `/generate-codebase`, `/tutorials`, and `/workers` as the product route families and should stop presenting `/workspace/choose`, `/codebase`, `/review`, `/lesson/*`, and `/workspace/*` as product routes. Do not rename owned Worker API paths, Convex tables, local-runner command language, or the generated Codebase artifact in this slice unless a small route-boundary rename is required for the app to compile. Those runtime contract changes belong to the next slice.

Focused validation should start with Stripe checkout metadata unit tests, purchase-intent persistence tests, webhook preflight tests, webhook idempotency and async-processing tests, access model unit tests, route guard tests, checkout success view-model tests, route tests, Command-K tests, and app shell navigation tests. Include a scan for old product routes in touched app surfaces. Broader validation should include app lint and typecheck after the focused tests pass.
