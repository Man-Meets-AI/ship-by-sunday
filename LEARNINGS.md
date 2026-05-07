# Learnings

## 2026-05-06 Stripe Link Express Checkout Stall

- Fact: For Stripe custom Checkout Sessions, `payment_intent=null` on repeated `open` / `unpaid` sessions means confirmation did not progress far enough to create a PaymentIntent.
  Verified by: `docs/archive/incidents/2026-05-06-stripe-link-express-checkout-stall-postmortem.md`, which compared live Stripe Checkout Sessions, related events, PaymentIntents, Charges, and customer records.

- Fact: The production homepage purchase CTAs should use hosted Checkout, not app-owned custom Express Checkout, for the revenue-critical Link handoff.
  Verified by: PR #213 validation in the post-mortem, where production proof passed after homepage CTAs moved to `/api/stripe/checkout` and no longer precreated Express Checkout Sessions.

- Fact: `dev.man-meets-ai.com` is the dev-staging payment environment backed by the `dev` Vercel Preview branch and Preview environment variables.
  Verified by: PR #214 validation in the post-mortem, including the dev staging payment proof run that paid a Stripe test-mode US$250 Checkout Session.

- Fact: Production billing proof may use zero-cost hosted Checkout to avoid moving real money; dev staging covers the full paid card path in Stripe test mode.
  Verified by: The post-mortem validation and residual-risk sections.
