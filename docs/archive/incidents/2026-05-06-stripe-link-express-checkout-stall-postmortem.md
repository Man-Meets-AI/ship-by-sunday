# Post-mortem: Stripe Link Express Checkout Stall on 2026-05-06

Status: closed, fixed live after second pass
Severity: P1 revenue-blocking checkout incident
Customer: Customer A (redacted in tracked docs)
Product: Pay Man Meets AI
Attempted amount: US$250.00
Affected surface: homepage Express Checkout through Stripe Link
First-pass fix PR: <https://github.com/Man-Meets-AI/ship-by-sunday/pull/212>
Final production fix PR: <https://github.com/Man-Meets-AI/ship-by-sunday/pull/213>
Dev payment proof PR: <https://github.com/Man-Meets-AI/ship-by-sunday/pull/214>
Final production fix commit: `3d68fc62bc34579d27cd2e9f3f583979f548fb43`
Dev payment proof commit: `779e85557513b9e678e74aec997fa9e3ccec97d0`

Customer identifiers were extracted out of this tracked archive. The local-only
private evidence file is gitignored at
`tmp/sensitive-incidents/2026-05-06-stripe-link-express-checkout-stall-private-evidence.md`.

Timeline entries below show EDT and UTC together. Discord screenshots showed
local times that align with EDT and the live Stripe session timestamps.

## Executive Summary

A buyer attempted to pay US$250 through Stripe Link. The Link popup at
`checkout.link.com` showed the buyer's Link account and saved card label, then
remained on `Processing...` for roughly four minutes. Stripe later confirmed no
payment went through.

The root cause was app-side Express Checkout session churn during the Link
handoff. The homepage generated-codebase checkout CTA passed an inline
`checkoutIntent` object into `ExpressCheckoutButton`. The component created a
custom Checkout Session from a `useEffect` keyed on that object identity. During
Link confirmation, the CTA ran `onBeforeCheckout` to persist the homepage draft;
that state update re-rendered the parent and produced a new same-value object.
Before PR #212, the component treated that as a new checkout intent and created a
new custom Checkout Session/client secret while Link was in its payment handoff.

The live Stripe shape matched that failure mode: bursts of duplicate US$250
custom Checkout Sessions, all `open` / `unpaid` with `payment_intent=null`, and
no matching Checkout Session, PaymentIntent, Charge, customer, or event for
the redacted checkout email. Stripe accepted the Checkout Sessions and metadata;
the flow stalled before a PaymentIntent existed.

We did not fix this by disabling Link. Link, Apple Pay, and Google Pay remain
available. PR #212 stabilized the Express Checkout session lifecycle by
normalizing checkout intent once and keying session creation on primitive intent
fields instead of object identity.

That first pass was not the final fix. The original postmortem was written after
PR #212 and overstated closure. The second pass in PR #213 removed the custom
Express Checkout surface from homepage purchase CTAs and routes those CTAs
through hosted Checkout, where Link still appears and is handled by Stripe's
hosted flow. PR #214 then added a real dev-staging payment lane on
`dev.man-meets-ai.com` so we can prove card payment behavior in test mode
without touching production money or issuing a 100% discount.

## Customer Impact

- Known impacted customer: Customer A.
- Known failed revenue: one attempted US$250 purchase.
- Known payment result: no paid Stripe Checkout Session, PaymentIntent, Charge,
  or webhook fulfillment for the redacted checkout email.
- Potentially affected path: buyers using the generated-codebase homepage CTA
  and selecting an Express Checkout wallet after PR #200 merged and before
  the final production fix in PR #213 reached production.
- Hosted Checkout/card fallback was not the observed failure path, and the
  post-payment fulfillment path did not run for Customer A because Stripe never
  created a PaymentIntent.

## Timeline

| Time | Event |
| --- | --- |
| 2026-05-02 20:48 EDT / 2026-05-03 00:48 UTC | PR #175 introduced the initial Express Checkout button surface. At that point the custom Checkout Session was prepared once on mount. |
| 2026-05-05 11:00 EDT / 15:00 UTC | PR #200 merged as `7a7c2848` and activated the risky combination: homepage checkout intent metadata, the generated-codebase checkout CTA, draft persistence before checkout, and `ExpressCheckoutButton` preparing sessions from `checkoutIntentInput` object identity. |
| 2026-05-06 10:32:32 EDT / 14:32:32 UTC | First saved live evidence cluster in the incident window: two US$250 custom Checkout Sessions created, both `open` / `unpaid` with `payment_intent=null`. |
| 2026-05-06 10:33:15 EDT / 14:33:15 UTC | Three more US$250 custom sessions created in the same second, with generated, hero, and pricing CTA metadata. |
| 2026-05-06 10:33:46-10:33:53 EDT / 14:33:46-14:33:53 UTC | Ten US$250 custom sessions created across eight seconds, mostly `codebase_demo_generated`. |
| 2026-05-06 10:35 EDT / 14:35 UTC | Customer screenshot: Link popup stuck on `Processing...` for the last four minutes. Visible details included the redacted checkout email, saved card label, and US$250.00. |
| 2026-05-06 10:35:52 EDT / 14:35:52 UTC | Four more US$250 custom sessions created in the same second. |
| 2026-05-06 10:38:53 EDT / 14:38:53 UTC | Four more US$250 custom sessions created in the same second. |
| 2026-05-06 10:44:58-10:45:06 EDT / 14:44:58-14:45:06 UTC | Eight more US$250 custom sessions created, again with generated, hero, and pricing CTA metadata. |
| 2026-05-06 10:46:50 EDT / 14:46:50 UTC | PR #211 opened with `wallet_options.link.display = "never"`. This would have hidden Link but did not address the app-side session churn. |
| 2026-05-06 10:48:54 EDT / 14:48:54 UTC | Three more US$250 custom sessions created in the same second. |
| 2026-05-06 10:52:40 EDT / 14:52:40 UTC | PR #211 closed as the wrong product fix. |
| 2026-05-06 10:56 EDT / 14:56 UTC | Customer confirmed a non-US location. |
| 2026-05-06 11:02 EDT / 15:02 UTC | Customer screenshot: retry still had no joy. The app overlay showed "Complete your payment in the open Link window, or close Link to continue paying another way." The saved Stripe evidence did not show a new US$250 session in 14:55-15:10 UTC, so this looks like the same stalled Link handoff state rather than a completed new payment attempt. |
| 2026-05-06 11:23:35 EDT / 15:23:35 UTC | PR #212 opened: `fix(checkout): stabilize Express Link session handoff`. |
| 2026-05-06 11:36:15 EDT / 15:36:15 UTC | PR #212 CI reran on the final branch commit. |
| 2026-05-06 11:38:21 EDT / 15:38:21 UTC | PR #212 `integration` check passed. |
| 2026-05-06 11:39:37 EDT / 15:39:37 UTC | PR #212 `static` check passed. |
| 2026-05-06 11:41:46 EDT / 15:41:46 UTC | PR #212 merged to `main` as `d1bd5aa2`. |
| 2026-05-06 11:42:31 EDT / 15:42:31 UTC | Convex production deploy workflow completed successfully for `d1bd5aa2`. |
| 2026-05-06 11:43:52 EDT / 15:43:52 UTC | Production release proof found the matching Vercel production deployment for `d1bd5aa2`. |
| 2026-05-06 11:45:04 EDT / 15:45:04 UTC | Main push CI completed successfully. |
| 2026-05-06 11:45:17 EDT / 15:45:17 UTC | Hosted `default_ship` production proof job completed successfully. |
| 2026-05-06 11:47:28 EDT / 15:47:28 UTC | Hosted `billing_integration` production proof reported PASS: hosted Checkout complete/paid, success redirect reached, workspace reached, Convex product access granted, source `stripe_webhook`. |
| 2026-05-06 11:47:49 EDT / 15:47:49 UTC | Production release proof workflow completed successfully for PR #212. This proved the first-pass lifecycle stabilization but was later judged insufficient as the final operating fix. |
| 2026-05-06 13:26:15 EDT / 17:26:15 UTC | PR #213 merged to `main` as `3d68fc62`: `fix(checkout): stop homepage Link session stalls`. Homepage purchase CTAs moved to hosted Checkout; Link remained available inside hosted Checkout. |
| 2026-05-06 13:26:19 EDT / 17:26:19 UTC | Production release proof run `25450632774` started for `3d68fc62`. |
| 2026-05-06 13:31:23 EDT / 17:31:23 UTC | Production release proof run `25450632774` completed successfully for the final production fix. |
| 2026-05-06 14:32:36 EDT / 18:32:36 UTC | PR #214 merged to `main` as `779e8555`: `ci: add dev staging payment proof`. |
| 2026-05-06 14:32:56 EDT / 18:32:56 UTC | `dev` was synced to the new main tree as `df2d584b` for `dev.man-meets-ai.com` preview payment staging. |
| 2026-05-06 14:33:03 EDT / 18:33:03 UTC | Dev staging payment proof run `25453794875` started on `dev`. |
| 2026-05-06 14:35:50 EDT / 18:35:50 UTC | Dev staging payment proof run `25453794875` completed successfully with a test-mode paid card Checkout Session. |
| 2026-05-06 14:38:04 EDT / 18:38:04 UTC | Production release proof run `25453775930` completed successfully for `779e8555`, preserving the final production payment proof after the dev-staging CI change. |

## Live Stripe Evidence

Evidence was collected from live Stripe with API version `2026-02-25.clover`.
The query used:

- Lookback: 2026-05-05 14:00:00 UTC through 2026-05-06 23:59:59 UTC.
- Incident window: 2026-05-06 14:20:00 UTC through 14:55:00 UTC.
- Incident email: redacted checkout email.
- Incident amount: 25000 cents.
- Mode: live.

Summary counts:

| Query result | Count |
| --- | ---: |
| Checkout Sessions in lookback | 275 |
| US$250 Checkout Sessions in lookback | 271 |
| Sessions in incident window | 40 |
| US$250 sessions in incident window | 39 |
| US$250 `open` / `unpaid` sessions with `payment_intent=null` in lookback | 262 |
| Sessions matching the redacted checkout email by customer email, customer details email, or expanded customer email | 0 |
| Customer objects matching the redacted checkout email | 0 |
| Related events matching incident objects or email | 0 |
| Related PaymentIntents | 0 |
| Related Charges | 0 |

Incident-window CTA distribution for the 39 US$250 sessions:

| `checkoutCtaId` | Count | First seen | Last seen |
| --- | ---: | --- | --- |
| `codebase_demo_generated` | 22 | 14:32:32 | 14:48:54 |
| `hero_primary` | 8 | 14:32:32 | 14:48:54 |
| `pricing_primary` | 8 | 14:32:33 | 14:48:54 |
| `codebase_demo_existing` | 1 | 14:32:37 | 14:32:37 |

Incident-window session clusters:

| Created UTC | Count | CTA mix |
| --- | ---: | --- |
| 14:32:32 | 2 | generated 1, hero 1 |
| 14:32:33 | 1 | pricing 1 |
| 14:32:37 | 1 | existing 1 |
| 14:33:15 | 3 | generated 1, hero 1, pricing 1 |
| 14:33:39 | 1 | generated 1 |
| 14:33:40 | 1 | generated 1 |
| 14:33:46 | 1 | generated 1 |
| 14:33:47 | 3 | generated 3 |
| 14:33:48 | 2 | generated 2 |
| 14:33:53 | 4 | generated 2, hero 1, pricing 1 |
| 14:34:16 | 1 | generated 1 |
| 14:35:52 | 4 | generated 2, hero 1, pricing 1 |
| 14:38:53 | 4 | generated 2, hero 1, pricing 1 |
| 14:44:58 | 4 | generated 2, hero 1, pricing 1 |
| 14:45:04 | 3 | generated 2, hero 1 |
| 14:45:06 | 1 | pricing 1 |
| 14:48:54 | 3 | generated 1, hero 1, pricing 1 |

Important interpretation details:

- `customer_email=null` and `customer_details.email=null` on these custom
  sessions does not contradict the customer screenshot. For signed-out custom
  Checkout Sessions, the app did not know the Link email before Link completed
  the handoff.
- `payment_intent=null` is the key signal. Stripe custom Checkout Sessions do
  not create a PaymentIntent until confirmation progresses far enough. This
  incident did not reach that point.
- The metadata values prove Stripe accepted the checkout intent metadata. This
  was not a malformed metadata rejection.
- No related events, PaymentIntents, or Charges were found, so webhook
  fulfillment never had anything to process for Customer A.

## Root Cause

The app broke the stable session contract required by Stripe's custom Checkout
Session + Express Checkout flow.

The affected execution path was:

```text
CodebaseDemoSectionBlock
-> CodebaseDemoCtaBar
-> HomePagePrimaryCta
-> HomePageCheckoutCta
-> ExpressCheckoutButton
-> POST /api/stripe/checkout/express
-> buildStripeExpressCheckoutSessionCreateParams
-> stripe.checkout.sessions.create(ui_mode=custom)
-> CheckoutElementsProvider
-> ExpressCheckoutElement
-> Link confirmation
```

PR #200 introduced checkout intent metadata and routed it through both hosted
and Express Checkout. The generated-codebase CTA passed:

```ts
checkoutIntent: {
  buyerStartingPoint: "no_codebase",
  checkoutCtaId: "codebase_demo_generated",
}
```

That value was constructed inline. Before PR #212, `ExpressCheckoutButton`
prepared its custom Checkout Session inside an effect with this dependency:

```ts
useEffect(() => {
  // POST /api/stripe/checkout/express
}, [checkoutIntentInput]);
```

React treats a new object reference as a changed dependency, even when its
fields are identical.

During Link confirmation, `ExpressCheckoutElementController` runs
`onBeforeCheckout` before calling `checkout.confirm(...)`. On the generated
codebase path, `onBeforeCheckout` is `draft.persistNow`. Persisting the draft
updates homepage state. That re-renders the CTA, creates a new same-value
`checkoutIntent` object, and retriggers the Express Checkout session preparation
effect. The app then creates a new custom Checkout Session/client secret during
the Link handoff.

That explains the user-facing failure:

- Link had enough state to show the customer email and saved card label.
- Stripe had accepted many custom Checkout Sessions.
- Stripe never created a PaymentIntent, Charge, or completed Checkout Session.
- The customer remained in Link's `Processing...` state because the app-side
  custom Checkout session/client secret was being replaced during confirmation.

## How We Know This Was the Cause

The conclusion is based on code behavior, live Stripe evidence, and regression
tests lining up:

1. The live Stripe clusters match React session churn. Multiple custom US$250
   sessions appeared in the same second or retry minute, especially for
   `codebase_demo_generated`.
2. Every relevant session was `ui_mode=custom`, `status=open`,
   `payment_status=unpaid`, and `payment_intent=null`. That is exactly what we
   expect when the app creates Checkout Sessions but confirmation does not reach
   PaymentIntent creation.
3. The customer screenshot time, 10:35 EDT, lands on top of the 14:32-14:35 UTC
   Stripe clusters.
4. The generated-codebase CTA is the path that combines an inline checkout
   intent with `onBeforeCheckout={draft.persistNow}`.
5. The pre-fix code keyed session creation on the object reference, not the
   primitive checkout intent values.
6. The fix added a regression test that reproduces the exact failure shape: a
   same-value inline checkout intent re-render must not create another Express
   Checkout Session.
7. The fix added a second regression test for the Link-specific trigger:
   draft persistence during confirmation must keep the same session and
   `returnUrl`.

No single piece of evidence alone proves the whole story, but the combined
shape is coherent and specific. The alternative explanation, "Stripe/Link hung
with a stable app session," does not explain the repeated same-second custom
session creation.

## What Was Not the Cause

- Link was not disabled or unsupported. We intentionally kept Link enabled.
- Apple Pay and Google Pay were not disabled. The Express Checkout config still
  orders `link`, `applePay`, and `googlePay`; it does not hide wallets.
- Checkout intent metadata was not rejected. Stripe created sessions with the
  metadata.
- Hosted Checkout was not the failing surface in the screenshots. The observed
  customer path was Express Checkout opening Link.
- Post-checkout fulfillment was not the failing step for this customer. There
  was no PaymentIntent, Charge, or completed Checkout Session to fulfill.
- PR #211, which hid Link with `wallet_options.link.display = "never"`, would
  have avoided Link but not fixed the underlying app session lifecycle bug.

## Fix History

### First Pass: PR #212

PR #212 made a real app-side fix, but it was not the final incident fix:

- normalized the checkout intent once at the top of `ExpressCheckoutButton`;
- keyed custom Express Checkout session creation on primitive intent fields
  instead of the input object reference;
- preserved checkout intent metadata;
- kept Link, Apple Pay, and Google Pay enabled;
- added regression coverage for same-value inline checkout intent rerenders and
  draft persistence during Link confirmation.

That corrected the session-lifecycle bug. It was still too narrow as an
operating fix because homepage purchase CTAs continued to depend on custom
Express Checkout, and we still lacked a dedicated dev-staging lane that could
prove a paid card Checkout Session end to end without charging production money.

### Final Production Fix: PR #213

PR #213 changed the buyer-facing homepage payment path:

- `HomePageCheckoutCta` now renders `CheckoutButton`, which posts to
  `/api/stripe/checkout` and redirects to Stripe hosted Checkout.
- Homepage hero, generated-codebase, existing-codebase, and pricing purchase
  CTAs no longer precreate custom Express Checkout Sessions.
- Link remains enabled through Stripe hosted Checkout, so buyers can still use
  Link without our app owning the Link popup's custom-session handoff.
- The hosted checkout flow preserves checkout intent metadata, including
  `buyerStartingPoint`, `checkoutCtaId`, and `fulfillmentTrack`.
- Hosted proof now asserts that homepage checkout CTAs do not hit
  `/api/stripe/checkout/express` before checkout.

This is the ultimate production mitigation: keep Link working, but move the
revenue-critical homepage purchase surface onto Stripe's hosted Checkout flow.

### Permanent Proof: PR #214

PR #214 added a real dev-staging payment proof lane:

- `dev.man-meets-ai.com` is backed by the `dev` Vercel Preview branch and
  Preview environment variables.
- The dev proof pulls branch-scoped Vercel env, primes the Vercel automation
  bypass cookie, opens the real preview app, clicks the generated-codebase CTA,
  reaches hosted Checkout, confirms Link is accepted, pays with Stripe's test
  card, verifies the test-mode Checkout Session and PaymentIntent succeeded,
  and confirms the success redirect returns to dev staging.
- The proof fails if homepage checkout precreates Express Checkout Sessions or
  if the CTA metadata is wrong.

This lets us test payment behavior without a production charge and without
issuing a 100% off coupon.

## Validation

First-pass PR #212 validation:

- PR #212 `integration` passed at 2026-05-06 15:38:21 UTC.
- PR #212 `static` passed at 2026-05-06 15:39:37 UTC.
- PR #212 merged to `main` as `d1bd5aa2` at 2026-05-06 15:41:46 UTC.
- Production release proof completed successfully at 2026-05-06 15:47:49 UTC.

Final production PR #213 validation:

- PR #213 merged to `main` as `3d68fc62` at 2026-05-06 17:26:15 UTC.
- Production release proof run `25450632774` completed successfully at
  2026-05-06 17:31:23 UTC.
- `release_scope`, `default_ship`, `billing_integration`, and `release_gate`
  jobs all passed.
- `billing_integration` completed at 2026-05-06 17:31:12 UTC.

PR #213 production billing proof specifically verified:

- production Stripe environment and checkout route were live-mode compatible;
- a zero-cost hosted Checkout Session completed with `status=complete`,
  `payment_status=paid`, and `amount_total=0`;
- the app checkout route created a hosted Checkout Session and the proof expired
  that smoke session;
- homepage loading did not precreate Express Checkout Sessions;
- `/checkout/success` redirected to the protected workspace;
- `/workspace/choose` was reached;
- Convex product access was granted from `stripe_webhook`;
- the access row linked back to the Checkout Session ID.

Dev-staging PR #214 validation:

- PR #214 merged to `main` as `779e8555` at 2026-05-06 18:32:36 UTC.
- `dev` synced to `df2d584b` at 2026-05-06 18:32:56 UTC.
- Dev staging payment proof run `25453794875` completed successfully at
  2026-05-06 18:35:50 UTC.
- The proof paid test Checkout Session
  `cs_test_a1yAdGDTJ5aPCUh7ilLSwR4rWYiD0QmXtAKI6OmpK2rqNwfmhp3keMwI7O` for
  US$250.00 on `dev.man-meets-ai.com`.
- The proof verified Link was accepted in hosted Checkout, no Express Checkout
  requests were precreated, generated-codebase CTA metadata was preserved, the
  Stripe PaymentIntent succeeded, and Checkout returned to dev staging.

Post-PR #214 production validation:

- Production release proof run `25453775930` completed successfully at
  2026-05-06 18:38:04 UTC.
- `release_scope`, `default_ship`, `billing_integration`, and `release_gate`
  jobs all passed again on `779e8555`.

## What Billing Proof Did Not Catch Earlier

The original production billing proof covered hosted Checkout, webhook
fulfillment, product-access grant, and post-checkout workspace handoff. That
proved the "after they pay" path, but it did not exercise the browser-specific
custom Express Checkout Link handoff from the homepage.

The missing first-pass test shape was:

```text
Express Checkout rendered
-> Link confirm started
-> onBeforeCheckout changed parent state
-> parent re-rendered with same checkout intent values but a new object
-> session creation must not run again
```

PR #212 added that regression coverage. PR #213 then removed that risky custom
Express Checkout path from homepage purchase CTAs entirely. PR #214 added the
paid dev-staging hosted Checkout proof that we were missing.

## Customer Retry Guidance

The final production payment path was live and production-proofed after
2026-05-06 17:31:23 UTC / 13:31:23 EDT. The latest production proof after the
dev-staging CI change also passed at 2026-05-06 18:38:04 UTC / 14:38:04 EDT.

For Customer A or any affected buyer:

1. Close any old Link popup or stale checkout tab from before that timestamp.
2. Reload `https://www.man-meets-ai.com`.
3. Start checkout again from the homepage.
4. Link should remain available inside hosted Checkout. Normal card checkout
   remains available if the buyer chooses another payment method.
5. If Link hangs again, collect the exact timestamp, screenshot, visible payment
   label, email, and whether the buyer closed or retried the same Link window.
   Then inspect whether the homepage used hosted Checkout and whether any
   Express Checkout route was hit.

## Residual Risk

- We still cannot fully automate a real live Link payment with a customer's
  saved production card from CI. The deployed proofs validate hosted Link
  availability, production hosted payment fulfillment, post-checkout access, and
  test-mode paid card behavior on dev staging.
- If hosted Checkout Link hangs with a stable hosted Checkout Session and Stripe
  request/event evidence points inside Link, treat it as a provider-side Link
  incident and escalate with Stripe.
- Production live proof uses a zero-cost hosted Checkout Session to avoid moving
  real money. Dev staging covers the full US$250 paid card path in Stripe test
  mode.

## Follow-up Actions

| Status | Action | Why |
| --- | --- | --- |
| Done in PR #213 | Move homepage purchase CTAs to hosted Checkout while keeping Link enabled. | Removes our custom Link handoff from the revenue-critical homepage path. |
| Done in PR #213 | Add hosted proof assertions that homepage loading does not precreate Express Checkout Sessions. | Catches regressions back to the session-churn shape. |
| Done in PR #214 | Add dev-staging paid card proof on `dev.man-meets-ai.com`. | Proves real payment behavior in Stripe test mode without production charges or coupons. |
| Done in PR #214 | Document dev staging as the payment test branch/domain in `docs/release-workflow.md`. | Future payment tests have an actual environment contract. |
| Open | Add a production-safe observability event for checkout session creation and confirmation start, including request ID, session ID, CTA ID, and fulfillment track without PII. | Future incidents should correlate a customer screenshot to one stable session quickly. |
| Open | Consider an alert for bursts of same-price custom Checkout Sessions with the same CTA metadata and no PaymentIntent inside a short time window. | Same-second or same-minute session bursts are a high-signal symptom of client churn. |
