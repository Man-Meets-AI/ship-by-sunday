---
title: Shipping Evidence Production Preflight Planning Brief 3
program_id: shipping-evidence-hardening
brief_version: 3
status: current
summary: Third planning brief for production preflight hardening around Vercel alias binding and Stripe webhook configuration.
read_when:
  - Writing or resuming the production preflight child ExecPlan.
  - Changing hosted production billing proof, Stripe webhook setup checks, or release preflight workflows.
---

# Shipping Evidence Production Preflight Planning Brief 3

Create the next child ExecPlan for production preflight hardening. This slice should make the existing hosted proof fail closed on the config drift that has historically broken checkout access without moving provider-backed checks into every pull request.

Start with the highest-signal checks that already have nearby infrastructure. Production proof already waits for a same-commit Vercel deployment, but it should also require the `www.man-meets-ai.com` alias on that same deployment. Billing proof already verifies the Stripe key mode, product, price, promo code, and app checkout route; extend that verifier to also prove the Stripe dashboard webhook endpoint is enabled, targets `{NEXT_PUBLIC_CONVEX_SITE_URL}/stripe/webhook`, uses the expected test/live mode, and subscribes to `checkout.session.completed` plus `checkout.session.async_payment_succeeded` or `*`.

Keep this broke-startup-friendly. The new provider checks belong in dev staging, production proof, and the release billing doctor. PR CI should remain cheap source proof. Do not rewrite the tag release evidence system in this slice; record that as the next child slice after the preflight artifact exists.

Also close the no-live-card safety gap in the production hosted billing script. Live production proof should only use the restricted zero-cost Checkout Session it creates intentionally. If the created live session is not zero-cost, or live Checkout presents card collection fields, the proof should fail instead of entering test card details.

The result should answer which exact deployment alias, Stripe mode, Stripe objects, webhook endpoint, webhook events, and live no-card invariant are now verified before hosted billing proof. Update `program.md`, this child ExecPlan, and release/operator docs where the proof contract changes.
