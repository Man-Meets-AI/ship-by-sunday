---
title: 'Dependency Graph'
summary: 'Ordering and dependency graph for the one-click paid access Program.'
docType: 'program_dependency_graph'
status: 'active'
read_when:
  - 'Checking slice ordering or dependencies.'
---

# Dependency Graph

The first dependency is product identity. Every payment path must carry `courseSlug`, Stripe Checkout Session id, PaymentIntent id when present, Stripe Customer id when present, and signed-in Clerk user id when present. This already exists for hosted Checkout except for guest customer creation.

The second dependency is paid-session fulfillment. Webhook and success-page flows must call the same idempotent fulfillment boundary. This boundary depends on Stripe Session retrieval, email extraction, product validation, Clerk user lookup or creation, and Convex entitlement grant.

The third dependency is UX state simplification. Once fulfillment is immediate, checkout success and access-required pages can stop treating pending claim as the happy path. They still need wrong-account and sign-in-required states, but the copy should say the purchase is already attached to the checkout email.

The fourth dependency is Express Checkout. The homepage can show a direct wallet button only after the fulfillment boundary is stable, because Express Checkout changes how quickly a customer can complete payment but should not introduce a different entitlement model.

The final dependency is release proof. Because this touches checkout, Stripe, entitlement, and auth, final validation must include focused tests and release-owned billing proof against the intended environment.
