---
title: 'Cross Repo Review'
summary: 'Risk review for applying one-click paid access patterns safely.'
docType: 'program_review'
status: 'active'
read_when:
  - 'Reviewing risks before implementation.'
---

# Cross Repo Review

This Program changes a production payment and entitlement boundary. The primary review risk is accidental access grant from weak evidence. The implementation must require a paid or no-payment-required Stripe Checkout Session that belongs to the Ship by Sunday product before resolving Clerk users or granting access.

The second risk is duplicate or conflicting grants. Webhooks can retry and success pages can refresh. The implementation must be idempotent by Stripe Checkout Session id, PaymentIntent id when present, and Clerk user id. If an existing active grant belongs to a different Clerk user for the same Stripe identifiers, the code must fail into an explicit support state instead of silently moving ownership.

The third risk is conflating Link and Clerk. Link can authenticate payment details, but it does not create the app session. Protected routes must continue to use Clerk and Convex auth. The customer can be told that access is ready for their checkout email, but they still need to sign in or follow an email link for that email.

The fourth risk is Express Checkout availability. Wallet methods vary by device and browser. The homepage must always keep a reliable hosted Checkout fallback. Tests should assert that no-wallet ready states do not hide the purchase path.

The fifth risk is external setup drift. Express Checkout and Link depend on Stripe Dashboard payment method activation and payment method domain registration. Clerk email-link or invitation behavior depends on Clerk Dashboard settings. The same change must update active operator docs so future maintainers know what must exist outside source control.
