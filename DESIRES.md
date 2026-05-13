# Desires

## 2026-05-13 Mobbin Flow Access

- Missing context/tool: Authenticated Mobbin MCP access for shared flow URLs.
  Why it would help: The Mobbin MCP currently requires auth in this session, so shared flow analysis had to fall back to the public Mobbin page instead of fetching the exact flow through MCP.

## 2026-05-07 Passwordless Checkout Account Handoff

- Missing context/tool: A Clerk configuration audit that checks dev and production for buyer-auth invariants: email sign-in enabled, email verification code enabled, password not required for buyer sign-in, MFA optional, and Client Trust not required.
  Why it would help: The app would fail CI or release proof before shipping a custom auth UI that asks Clerk for a disabled factor.

- Missing context/tool: A first-class browser + mailbox E2E test skill for paid-buyer login, with a stable test inbox and safe OTP handling.
  Why it would help: The exact customer path from checkout to inbox code to `/workspace/choose` could be rerun without improvised Gmail/plugin setup during an incident.

- Missing context/tool: Release proof that asserts forbidden UX states after checkout: no `/checkout/email-handoff`, no claim page, no password field for buyer sign-in, and exactly one customer-facing error surface for invalid OTP.
  Why it would help: It turns the product decisions from this incident into durable regression checks.

- Missing context/tool: A fulfillment-race probe that runs webhook and success-page retry for the same Checkout Session concurrently.
  Why it would help: Stripe webhooks and browser success-page finalization naturally race; proving the race makes Clerk user creation and Convex access grants stay idempotent.

## 2026-05-06 Stripe Link Express Checkout Stall

- Missing context/tool: Production-safe observability for checkout session creation and confirmation start, including request ID, session ID, CTA ID, and fulfillment track without PII.
  Why it would help: Future checkout incidents could correlate a customer screenshot to one stable session quickly instead of reconstructing behavior from Stripe clusters after the fact.

- Missing context/tool: An alert for bursts of same-price custom Checkout Sessions with the same CTA metadata and no PaymentIntent inside a short window.
  Why it would help: Same-second or same-minute session bursts are a high-signal symptom of client-side checkout churn.

- Missing context/tool: A payment proof lane that runs against dev staging with Stripe test-mode card payment, not a production zero-cost checkout or 100% coupon.
  Why it would help: It proves real paid Checkout Session and PaymentIntent behavior without moving production money.

- Missing context/tool: Browser proof for the exact Express Checkout Link failure shape: Express Checkout rendered, Link confirmation started, `onBeforeCheckout` changed parent state, parent rerendered with same checkout intent values, and session creation did not run again.
  Why it would help: Hosted Checkout proof alone cannot catch app-owned custom Express Checkout session churn.
