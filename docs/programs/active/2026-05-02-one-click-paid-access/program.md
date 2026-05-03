---
program_id: one-click-paid-access
title: One Click Paid Access
status: active
created_at: 2026-05-02
completed_at: null
summary: Make Ship by Sunday payments feel like one click while guaranteeing paid access attaches instantly to the purchase email.
post_build_recap: null
read_when:
  - Resuming one-click checkout or paid-access work.
  - Deciding checkout, Link, Clerk, Stripe, or entitlement ordering.
  - Updating the active planning brief for paid access.
---

# One Click Paid Access

This Program is a living initiative document. Update it whenever a child slice lands, the ordering changes, or validation changes the durable truth.

This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

Ship by Sunday should let a buyer click the homepage buy action, pay through the fastest eligible Stripe method, and enter the product without understanding account claims, pending access, or support repair. The customer-facing promise is simple: pay with the email you want to use, prove that email through Clerk when needed, and access is already waiting.

The initiative separates payment speed, access correctness, and identity proof. The first required slice makes every paid Checkout Session fulfill access immediately by purchase email. The second slice adds Stripe's Express Checkout Element so eligible visitors can see a branded `Pay with Link` or wallet button directly on the homepage, with the existing hosted Checkout button kept as fallback. The third slice narrows the post-payment identity handoff so signed-out buyers prove the checkout email through Clerk passwordless auth instead of falling into generic password or Google recovery.

## Program Inputs

The durable packet artifacts for this Program live in `docs/programs/active/2026-05-02-one-click-paid-access/`.

The Stripe and journey research is recorded in `research-pass-stripe-link-and-checkout.md`. The current repository checkout and access flow research is recorded in `research-pass-current-repo-checkout-access.md`. The normalized tracks are `normalized-pass-fulfillment.md` and `normalized-pass-payment-entry.md`. The initiative decision is in `converged-decision-packet.md`. The implementation ordering is in `dependency-graph.md` and `plan-split-recommendation.md`. The review of risk boundaries is in `cross-repo-review.md`. The first immutable implementation brief is `planning-brief-1.md`. The current immutable implementation brief is `planning-brief-2.md`, and `current-planning-brief.txt` points at that brief.

## Current State

The repository already has a public checkout route at `apps/web/app/api/stripe/checkout/route.ts`. It allows signed-out checkout and creates a Stripe Checkout Session through `apps/web/platform/billing/checkout/checkout-session-params.ts`.

The current Checkout Session params use `mode: "payment"`, `success_url`, `cancel_url`, line items, metadata, and `customer_email` only when the buyer is already signed into Clerk. They do not set `customer_creation: "always"`.

The Convex Stripe webhook in `apps/web/convex/stripeWebhook.ts` grants access immediately when the Stripe session carries a Clerk user id. For guest checkout, it stores a `pendingCheckoutClaims` row keyed by `session.customer_details.email`. The success page and access gate then require the browser's current Clerk identity to claim that purchase. This works only when the buyer signs in with the same verified email and understands the handoff.

The recent customer incident showed that this state model was too fragile for the product goal. The 2026-05-02 implementation now fulfills guest paid sessions by checkout email from webhook and success-page retry, with pending claims retained as fallback and audit records.

The remaining UX gap is identity proof after the paid guest checkout. A signed-out buyer can complete Stripe Link, Express Checkout, or hosted Checkout and return to `/checkout/success`, but the app still sends them through a generic sign-in or create-account path that includes password and Google/social branches. The next slice should turn that into a narrow checkout-email passwordless handoff: payment is confirmed for the checkout email, access is waiting for that email, and Clerk email OTP proves the browser owns it.

## Progress

- [x] 2026-05-02: Created the One Click Paid Access Program packet from live incident research, current repo inspection, and Stripe/Clerk official docs research.
- [x] 2026-05-02: Split the initiative into two ordered child ExecPlans: instant paid fulfillment first, Express Link homepage checkout second.
- [x] 2026-05-02: Implement and focused-validate `docs/exec-plans/active/2026-05-02-instant-paid-checkout-fulfillment.md`.
- [x] 2026-05-02: Implement and focused-validate `docs/exec-plans/active/2026-05-02-homepage-express-link-checkout.md`.
- [x] 2026-05-02: Prove a paid Stripe test Checkout Session grants hosted Convex dev access by checkout email.
- [ ] 2026-05-02: Run hosted browser proof and production release billing proof.
- [x] 2026-05-03: Added `planning-brief-2.md` and the checkout-email passwordless auth slice now completed at `docs/exec-plans/completed/2026-05-03-passwordless-checkout-email-handoff.md`.
- [x] 2026-05-03: Implemented and focused-validated `docs/exec-plans/completed/2026-05-03-passwordless-checkout-email-handoff.md`.

## Decision Log

Decision: Keep server-created Stripe Checkout Sessions as the canonical payment source of truth.
Rationale: Checkout Sessions preserve product metadata, success URLs, webhook fulfillment, customer email, and hosted Checkout fallback while also supporting Link and Express Checkout. Static Payment Links reduce code but weaken per-session app reconciliation.
Date: 2026-05-02

Decision: Make paid-session fulfillment the first slice and Express Checkout the second slice.
Rationale: A faster payment button is harmful if access still lands in a pending-claim state. Every payment entry path must converge on a proven idempotent fulfillment function before the homepage grows a direct wallet button.
Date: 2026-05-02

Decision: Treat Stripe Link as payment acceleration, not application authentication.
Rationale: Link can autofill and authenticate payment details, but Clerk remains the app identity boundary. The app may grant entitlements to the Clerk user that owns the checkout email, but the browser session must still prove that email before entering protected routes.
Date: 2026-05-02

Decision: Use Clerk email OTP as the first post-checkout passwordless handoff slice.
Rationale: The app already grants access to the Clerk user for the Stripe checkout email. Email OTP proves that exact email without asking for a password, without inviting Google/social account drift, and without requiring app-owned sign-in-token email delivery in the first pass.
Date: 2026-05-03

Decision: Use Express Checkout as progressive enhancement, not the only purchase path.
Rationale: Express Checkout availability depends on browser, device, payment method setup, HTTPS, Dashboard activation, and domain registration. The existing hosted Checkout button must remain as fallback.
Date: 2026-05-02

## Slice Ledger

The first child slice is `docs/exec-plans/active/2026-05-02-instant-paid-checkout-fulfillment.md`. It owns the backend fulfillment contract for paid Stripe Checkout Sessions, Clerk user resolution or creation by purchase email, idempotent entitlement grants, and success-page fulfillment retry.

The second child slice is `docs/exec-plans/active/2026-05-02-homepage-express-link-checkout.md`. It owns the homepage and pricing Express Checkout integration after fulfillment is stable. It must keep hosted Checkout fallback and reuse the same fulfillment path.

The third child slice is `docs/exec-plans/completed/2026-05-03-passwordless-checkout-email-handoff.md`. It owns the post-payment Clerk identity proof after paid guest checkout. It keeps Stripe Link as payment acceleration only, does not auto-login from the Stripe return URL, and uses Clerk email OTP before considering email-link or sign-in-token variants.

Related predecessor plans from the incident are `docs/exec-plans/active/2026-05-02-paid-checkout-claim-repair.md`, `docs/exec-plans/active/2026-05-02-workspace-access-guard-hardening.md`, and `docs/exec-plans/active/2026-05-02-paid-checkout-account-resolution.md`. They are not Program-linked children because they were written before this Program and handled incident repair, route hardening, and recovery copy.

## Next Slice

There is no remaining implementation child slice in this Program. The checkout handoff now uses checkout-email Clerk email OTP instead of generic password or Google/social recovery. Keep any production proof on the normal release workflow rather than adding a Program-specific hosted proof pass.

## Risks and Watchpoints

Do not treat Link as proof that the current browser owns the app account. Link accelerates payment, while Clerk proves application identity.

Do not remove webhook fulfillment. Stripe explicitly warns that customers may never reach the success URL, so webhooks remain required. The success page can trigger the same fulfillment function to reduce wait time while the buyer is present.

Do not let `pendingCheckoutClaims` return as the normal happy path. It can stay as an audit or fallback state, but user-visible flows should assume a paid session is fulfilled by the server.

Do not implement Express Checkout as a custom PaymentIntent flow unless a later brief deliberately chooses that complexity. Stripe's current guidance favors Checkout Sessions for most integrations, including embedded components.

Do not auto-login from a Stripe success URL alone. That URL can be copied, shared, revisited, or opened on a different device. Only Clerk should mint the app session after the buyer proves the checkout email.

Do not let Google/social auth be the post-checkout recovery path. OAuth may remain for ordinary sign-in if deliberately preserved, but the paid handoff should prove the exact checkout email instead of inviting account drift.

## Outcomes & Retrospective

The first two implementation slices landed on 2026-05-02. The backend now grants paid guest purchases to the Clerk user for the checkout email, creating the Clerk user when needed, and the homepage now has an Express Checkout progressive enhancement over the hosted Checkout fallback.

Focused tests, focused lint, full unit, contract, integration, integration-ui, critical coverage, format check, lint, and `bun run --cwd apps/web typecheck` passed. Hosted Convex dev proof also passed for Stripe Checkout Session `cs_test_b1tqNo11zXV1tWsFn0n5m4HurCHxQsSbYhHPHgMQjUMPPkQNERTMs9wjme`: the session was completed through hosted Stripe Checkout with no Clerk user metadata, fulfillment created the Clerk user for the checkout email, Convex had a granted access row, the row was linked to the Checkout Session id, and the grant source was `stripe_checkout`.

Browser proof was attempted but blocked by local Clerk browser-session behavior. Production release billing proof remains open. The passwordless checkout-email handoff is now planned as the remaining UX slice and has not been implemented yet.

## Validation and Acceptance

At Program completion, a new buyer must be able to start from the homepage, pay through hosted Checkout with Link or an Express Checkout wallet button when eligible, and receive product access tied to the checkout email without support intervention. If the buyer is signed in as the same Clerk user, they should move into the workspace. If the buyer is signed out or in the wrong account, the app should direct them to prove the checkout email through passwordless Clerk auth and then enter already-granted access.

The Program is not complete until focused unit and integration tests pass for checkout params, webhook fulfillment, success-page fulfillment retry, Clerk user resolution, wrong-account handling, homepage fallback behavior, Express Checkout readiness, passwordless checkout-email handoff, SSO exclusion from the checkout path, and access-required recovery. It also needs the repository gates required by the touched slices and the standard release workflow proof selected by release scope.

## Artifacts and Notes

Official Stripe research used for this Program:

- `https://docs.stripe.com/payments/link`
- `https://docs.stripe.com/payments/link/checkout-link`
- `https://docs.stripe.com/elements/express-checkout-element`
- `https://docs.stripe.com/elements/express-checkout-element/accept-a-payment`
- `https://docs.stripe.com/checkout/fulfillment`
- `https://docs.stripe.com/api/checkout/sessions/create`

Official Clerk research used for this Program:

- `https://clerk.com/docs/reference/backend/user/create-user`
- `https://clerk.com/docs/guides/users/inviting`
- `https://clerk.com/docs/expressjs/guides/development/custom-flows/authentication/email-links`
- `https://clerk.com/docs/reference/backend/sign-in-tokens/create-sign-in-token`
- `https://clerk.com/docs/guides/development/custom-flows/authentication/email-sms-otp`
- `https://clerk.com/docs/guides/development/custom-flows/authentication/sign-in-or-up`

The customer incident that motivated this Program had a paid Stripe Checkout Session with no Clerk user id in metadata, so Convex saved a pending claim instead of granting access. This Program turns that failure mode into an immediately fulfilled purchase followed by ordinary email proof.

## Interfaces and Dependencies

The Program depends on Stripe Checkout Sessions, Stripe webhooks, Stripe Link and Express Checkout Dashboard settings, Clerk Backend SDK, Clerk session proof, Convex entitlement mutations, and the existing Next.js App Router checkout surfaces.

The key repository interfaces are `buildStripeCheckoutSessionCreateParams` in `apps/web/platform/billing/checkout/checkout-session-params.ts`, `processStripeWebhook` in `apps/web/convex/stripeWebhook.ts`, checkout claim actions in `apps/web/convex/checkoutClaimsActions.ts`, entitlement mutations in `apps/web/convex/access.ts` and `apps/web/convex/access/model.ts`, the checkout route at `apps/web/app/api/stripe/checkout/route.ts`, and homepage CTA rendering in `apps/web/app/_components/home-page/sections/home-page-primary-cta.tsx`.
