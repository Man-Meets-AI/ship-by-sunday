---
title: 'Plan Split Recommendation'
summary: 'Recommended child ExecPlan split for one-click paid access.'
docType: 'program_plan_split'
status: 'active'
read_when:
  - 'Choosing or revising child ExecPlans.'
---

# Plan Split Recommendation

Use two child ExecPlans.

The first child ExecPlan is `docs/exec-plans/active/2026-05-02-instant-paid-checkout-fulfillment.md`. It is required first because it removes the paid-but-pending happy path. It owns Checkout Session params, webhook fulfillment, success-page fulfillment retry, Clerk user resolution, entitlement idempotency, fallback claims, tests, and docs for external setup.

The second child ExecPlan is `docs/exec-plans/active/2026-05-02-homepage-express-link-checkout.md`. It is required second because it depends on the first slice's fulfillment contract. It owns Stripe.js dependencies, embedded Checkout Session creation if needed, Express Checkout Element rendering on homepage and pricing surfaces, ready-state fallback, browser tests, and provider setup docs.

Do not merge these into one large implementation slice. The backend access guarantee needs its own validation and production proof before the homepage adds a new payment entry surface.

Do not split by provider. A Stripe-only slice without Clerk and Convex fulfillment would leave the customer journey broken. A Clerk-only slice without Stripe Session validation would grant access from insufficient evidence. Each child should own a user-observable outcome.
