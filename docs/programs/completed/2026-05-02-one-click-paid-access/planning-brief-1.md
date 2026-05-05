---
title: One Click Paid Access Planning Brief 1
program_id: one-click-paid-access
brief_version: 1
status: current
summary: Implement instant paid checkout fulfillment first, then add homepage Express Checkout as a progressive enhancement.
read_when:
  - Authoring or refreshing child ExecPlans for One Click Paid Access.
---

# One Click Paid Access Planning Brief 1

The initiative objective is to make Ship by Sunday payment and access feel finished immediately. The buyer should click the homepage purchase action, pay through the fastest eligible Stripe path, and enter the product through the checkout email without seeing claim mechanics.

The implementation order is fixed for the first pass. First, implement instant paid checkout fulfillment. Second, implement homepage Express Checkout as a progressive enhancement.

The first slice must add a single idempotent fulfillment boundary used by both Stripe webhooks and the checkout success page. It must validate the Checkout Session, confirm product identity, confirm paid or no-payment-required status, extract `customer_details.email`, resolve or create a Clerk user for that email, grant Convex access, and keep pending checkout claims as fallback or audit only. It must also set `customer_creation: "always"` for Checkout Sessions unless Stripe rejects that setting in a focused test.

The second slice must add Express Checkout Element on the homepage and pricing buy surfaces after the first slice is stable. It must render wallet buttons only when Stripe reports availability, keep the existing hosted Checkout button as fallback, use Checkout Sessions API rather than raw PaymentIntents, and reuse the same fulfillment path.

Both slices must update docs if they introduce or change Stripe, Clerk, Convex, Vercel, or env setup. Required provider setup should be documented where operators will look, not left in chat.

Both slices must run focused tests first and then the relevant broad gates from the repo instructions. Because checkout and entitlement changes are release-sensitive, final release proof must include billing integration proof against the intended hosted environment before calling the initiative done.
