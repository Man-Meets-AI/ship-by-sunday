---
title: 'Normalized Fulfillment Track'
summary: 'Normalized backend fulfillment track for one-click paid access.'
docType: 'program_normalized_track'
status: 'active'
read_when:
  - 'Implementing the instant paid fulfillment child ExecPlan.'
---

# Normalized Fulfillment Track

The fulfillment track owns correctness. Its goal is that a paid Stripe Checkout Session for Ship by Sunday always becomes an entitlement for the Clerk account associated with the checkout email, without requiring the customer to manually claim the purchase.

The track must add a single idempotent function that accepts a Stripe Checkout Session id or already-retrieved Session, validates payment and product ownership, extracts the checkout email, resolves or creates the Clerk user for that email, and grants access by calling the existing Convex entitlement mutation. Idempotent means duplicate webhooks, browser refreshes, and success-page retries produce the same final grant without duplicate active grants or conflicting ownership.

The function must run from the webhook path and from the success page. The webhook remains the reliable path for customers who close their tab. The success page is the fast path for customers who are present and waiting to enter the product.

The track must keep Clerk as the authentication boundary. It is acceptable for the server to create or resolve a Clerk user by checkout email and grant access to that user id. It is not acceptable to let the current browser enter protected product routes until Clerk proves that same email through an authenticated session.

The track may keep `pendingCheckoutClaims` as a fallback and audit record. It should not leave pending claims as the happy path for ordinary paid guest purchases.

The track must document external setup if it changes Clerk, Stripe, Convex, Vercel, or Dashboard requirements. At minimum, the docs should explain required Stripe Link and dynamic payment settings, webhook events, Clerk email sign-in settings, and any new environment variables.
