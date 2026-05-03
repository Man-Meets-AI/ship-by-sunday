---
title: 'Converged Decision Packet'
summary: 'Final initiative decision for one-click paid access.'
docType: 'program_decision'
status: 'active'
read_when:
  - 'Checking why fulfillment precedes Express Checkout.'
  - 'Deciding whether to use Payment Links, hosted Checkout, or Express Checkout.'
---

# Converged Decision Packet

The Program will keep server-created Stripe Checkout Sessions as the canonical purchase object, add immediate paid-session fulfillment by checkout email, and then add Express Checkout as a homepage progressive enhancement.

Static Stripe Payment Links are not the chosen path. They are useful for no-code selling, but Ship by Sunday needs per-session product metadata, Clerk user metadata when signed in, a success URL with `session_id`, webhook fulfillment, local tests, and a reliable hosted Checkout fallback. Server-created Checkout Sessions already satisfy those needs.

Hosted Checkout with Link is the immediate customer-journey improvement. Enabling Link through dynamic payment methods and setting `customer_creation: "always"` reduces payment friction while preserving the current integration's simplicity.

Express Checkout is the second improvement. It can put a `Pay with Link` button directly on the homepage when available, but it adds client-side Stripe Elements integration, HTTPS and domain setup requirements, browser eligibility states, and additional tests. It should only land after the backend guarantees that every paid session becomes access.

The access policy is purchase-email first. The checkout email is the identity that owns the purchase. If a Clerk user already exists for that email, access is granted to that user. If no Clerk user exists, the system creates or invites a Clerk user for that email and grants access to that user id. The browser may enter protected routes only after Clerk proves the same email.
