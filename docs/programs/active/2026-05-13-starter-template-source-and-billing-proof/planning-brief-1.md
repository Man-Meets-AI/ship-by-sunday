---
title: Hosted Billing Proof Offer Parameterization Planning Brief 1
program_id: starter-template-source-and-billing-proof
brief_version: 1
status: superseded
summary: Parameterize hosted billing proof so Starter and Workers offers can both be proven through the app checkout path.
read_when:
  - "Writing the first child ExecPlan for this Program."
  - "Implementing product-specific billing proof for Starter and Workers."
  - "Checking the first slice boundary before template-source work begins."
---

# Hosted Billing Proof Offer Parameterization Planning Brief 1

Date: 2026-05-13.

This brief drives the first child ExecPlan for making hosted billing proof product-specific.

## Outcome

The hosted billing proof should accept an offer choice and prove that specific product. Starter should remain the default. Workers should become a first-class proof target. The proof should verify checkout request `offerId`, Stripe Checkout Session metadata, PaymentIntent metadata, amount, post-checkout destination, and access expectations for the selected offer.

## Scope

Update `apps/web/scripts/lib/hosted-stripe-checkout-proof.mjs` to define a narrow proof offer model for Starter and Workers.

Update `apps/web/scripts/verify-hosted-stripe-checkout.mjs` and `apps/web/scripts/verify-dev-stripe-card-payment.mjs` so they parse `--offer=starter|workers` or an equivalent explicit argument, default to Starter, and use offer-specific path, amount, and destination expectations.

Update release proof planning if needed so `billing_integration` can run Starter by default and can be invoked for Workers. Do not require both offers in every local proof command unless the release workflow explicitly asks for the expanded proof.

Update unit tests and docs so the harness proves both offers without duplicating large test bodies.

## Boundaries

Do not change actual Stripe prices, checkout offer definitions, product-page copy, or access grant semantics in this slice unless a proof failure exposes a real bug.

Do not begin the Starter template-source work in this slice.

Do not perform live Stripe proof during implementation. Keep live proof as an operator/release command that is documented and gated by existing billing-approval controls.

## Acceptance

The proof helper tests should cover Starter and Workers offer config, metadata, destination, and amount expectations.

The checkout route integration tests should still prove missing `offerId` fails and explicit offer checkout succeeds.

Release docs should state how to run Starter and Workers billing proof.

The existing `billing_integration` safety gate should remain in place so Stripe checkout cannot run accidentally.
