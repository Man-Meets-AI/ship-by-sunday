# Desires

## 2026-05-06 Stripe Link Express Checkout Stall

- Missing context/tool: Production-safe observability for checkout session creation and confirmation start, including request ID, session ID, CTA ID, and fulfillment track without PII.
  Why it would help: Future checkout incidents could correlate a customer screenshot to one stable session quickly instead of reconstructing behavior from Stripe clusters after the fact.

- Missing context/tool: An alert for bursts of same-price custom Checkout Sessions with the same CTA metadata and no PaymentIntent inside a short window.
  Why it would help: Same-second or same-minute session bursts are a high-signal symptom of client-side checkout churn.

- Missing context/tool: A payment proof lane that runs against dev staging with Stripe test-mode card payment, not a production zero-cost checkout or 100% coupon.
  Why it would help: It proves real paid Checkout Session and PaymentIntent behavior without moving production money.

- Missing context/tool: Browser proof for the exact Express Checkout Link failure shape: Express Checkout rendered, Link confirmation started, `onBeforeCheckout` changed parent state, parent rerendered with same checkout intent values, and session creation did not run again.
  Why it would help: Hosted Checkout proof alone cannot catch app-owned custom Express Checkout session churn.
