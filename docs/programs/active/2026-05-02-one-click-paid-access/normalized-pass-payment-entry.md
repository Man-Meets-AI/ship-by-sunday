---
title: 'Normalized Payment Entry Track'
summary: 'Normalized payment-entry track for Link, hosted Checkout, and Express Checkout.'
docType: 'program_normalized_track'
status: 'active'
read_when:
  - 'Implementing the homepage Express Link child ExecPlan.'
---

# Normalized Payment Entry Track

The payment-entry track owns speed and simplicity. Its goal is that the homepage and pricing surfaces show the fastest eligible payment entry while keeping a reliable fallback for every visitor.

Hosted Stripe Checkout remains the canonical fallback. It is simple, already wired into the repository, supports Link through dynamic payment methods, and keeps Stripe responsible for payment UI, receipts, 3DS, and method eligibility.

Express Checkout Element is the progressive enhancement. When Stripe.js reports available wallet methods, the homepage can show a branded Link, Apple Pay, Google Pay, or other eligible wallet button. If no methods are available, the existing buy button remains visible. The app must not show a dead empty wallet area.

The payment-entry track should use Checkout Sessions API and embedded components. It should not introduce a custom PaymentIntent flow unless a future planning brief explicitly changes direction. The Express Checkout path must produce the same Session metadata, product identity, success handoff, and fulfillment behavior as hosted Checkout.

The track must handle setup and browser constraints. Express Checkout requires HTTPS, Dashboard payment method activation, domain registration in test and live modes, and a publishable key on the client. The UI needs a ready-state fallback because supported methods vary by browser, device, country, currency, and customer wallet setup.

The track must stay visually restrained. The homepage should not become a checkout form. The direct wallet button should sit where the primary buy action belongs, with hosted Checkout as the dependable fallback or secondary action.
