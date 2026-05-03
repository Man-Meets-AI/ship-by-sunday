---
title: 'Current Repo Checkout Access Research Pass'
summary: 'Repository findings for the current Ship by Sunday checkout, webhook, claim, and access handoff.'
docType: 'program_research'
status: 'active'
read_when:
  - 'Re-entering the checkout/access code for One Click Paid Access.'
  - 'Checking why pending checkout claims exist.'
---

# Current Repo Checkout Access Research Pass

Checkout begins in `apps/web/app/api/stripe/checkout/route.ts`. The route allows signed-out checkout. It reads the current Clerk user id when present, creates a Stripe client, asserts the managed Stripe price matches product config, and calls `buildStripeCheckoutSessionCreateParams`.

`apps/web/platform/billing/checkout/checkout-session-params.ts` creates a Checkout Session with `mode: "payment"`, `billing_address_collection: "auto"`, promotion code behavior, success and cancel URLs, the line item, and metadata. It sets `client_reference_id` and metadata `clerkUserId` only when a Clerk user is already signed in. It sets `customer_email` only from the signed-in Clerk user's primary email. It does not set `customer_creation: "always"`.

`apps/web/convex/stripeWebhook.ts` processes `checkout.session.completed` and asynchronous payment success events. If the session has a Clerk user id in metadata or `client_reference_id`, it calls `internal.access.grantProductAccessFromStripe`. If the session has no Clerk user id, it reads `session.customer_details.email` and calls `internal.checkoutClaims.upsertPendingCheckoutClaimFromStripe`. That guest branch is the current normal path for signed-out buyers.

`apps/web/platform/billing/checkout/checkout-session.ts` powers `/checkout/success`. For a paid guest session, it returns `sign_in_required` when there is no current Clerk session, or calls `claimCheckoutSessionForViewer` when signed in. This means the success page can only finish access after the buyer authenticates as a Clerk user whose verified email matches the checkout email.

`apps/web/convex/checkoutClaimsActions.ts` retrieves the Stripe Checkout Session again, saves or updates a pending checkout claim for paid guest sessions, then calls `internal.checkoutClaims.claimPendingCheckoutClaim`. The claim mutation in `apps/web/convex/checkoutClaims.ts` requires the authenticated identity's verified email to match the normalized checkout email.

Recent local incident work added operator repair support, route-level access guards, and clearer UX for sign-in-required and wrong-account states. Those changes reduce confusion and support burden, but they do not remove the core issue: guest checkout still defaults to pending claim instead of automatic server fulfillment by purchase email.

The durable change should introduce one fulfillment boundary used by webhook and success page. That boundary should validate that the Stripe Session is paid, belongs to this product, and has an email. Then it should resolve or create the Clerk user for that email, grant access idempotently by Stripe identifiers and Clerk user id, and mark any pending claim as claimed or fallback-only.
