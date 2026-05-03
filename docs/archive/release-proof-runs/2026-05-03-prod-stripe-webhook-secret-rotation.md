# QA Run Report

Date: 2026-05-03
Environment: prod-www.man-meets-ai.com
Pack: billing_integration
Slug: prod-stripe-webhook-secret-rotation

## Scope Tested

- Investigated the production incident `stripe_webhook_invalid_signature` raised for `POST /stripe/webhook` at `2026-05-03T01:01:47.836Z`.
- Confirmed the failed Stripe event was the production billing proof checkout event `evt_1TSoPnCgIdJ1QglPpDT3LWdT` for Checkout Session `cs_live_a1mDKG3r58EEb2tyO8Qsu9FAuhXpyD9Dm5vbxwDcwGFFJP9McsM2XnnaiX`.
- Confirmed Stripe had exactly one enabled live webhook endpoint before repair, pointing at `https://helpful-meadowlark-297.convex.site/stripe/webhook`.
- Confirmed local `apps/web/.env.production` and Convex production had matching `STRIPE_WEBHOOK_SECRET` values, so the drift was between Stripe's endpoint signing secret and Convex production.
- Created replacement live Stripe webhook endpoint `we_1TSoVOCgIdJ1QglPkVvucpOe` for `https://helpful-meadowlark-297.convex.site/stripe/webhook` with events `checkout.session.completed` and `checkout.session.async_payment_succeeded`.
- Set Convex production `STRIPE_WEBHOOK_SECRET` to the replacement endpoint signing secret.
- Disabled old live endpoint `we_1TF2xvCgIdJ1QglPUGUtTsqs`.
- Replayed failed event `evt_1TSoPnCgIdJ1QglPpDT3LWdT` to the replacement endpoint.
- Sent a signed Stripe-style probe payload to `https://helpful-meadowlark-297.convex.site/stripe/webhook` and confirmed Convex returned `200` with `{"ignored":true}`.

## Passed

- Convex production accepts payloads signed with the replacement webhook secret.
- Stripe now has a single enabled live webhook endpoint for the Convex webhook URL.
- The replacement endpoint uses the expected event set: `checkout.session.completed` and `checkout.session.async_payment_succeeded`.
- The old app-origin endpoint `https://www.man-meets-ai.com/api/stripe/webhook` remains disabled.

## Findings

- `high` - The live Stripe endpoint signing secret had drifted from Convex production even though local `.env.production` and Convex production matched each other.
- `medium` - The billing proof still reached protected workspace access because `/checkout/success` can recover and grant access after Stripe redirects back. That recovery path is useful, but it can hide webhook delivery failures if release proof only checks product access.
- `medium` - `productAccessGrants.source` can read `stripe_webhook` for grants created by checkout-success recovery because the recovery path reuses `grantProductAccessFromStripe`. That label is not enough by itself to prove Stripe webhook delivery succeeded.

## Notes

- The original event can still show one pending webhook in Stripe because the failed delivery remains attached to the old disabled endpoint. After replay, the pending count dropped from `2` to `1`, consistent with the replacement endpoint delivery succeeding while the historical failed delivery remains.
- Do not rotate this endpoint in Stripe without immediately copying the new one-time signing secret into Convex production `STRIPE_WEBHOOK_SECRET`.
