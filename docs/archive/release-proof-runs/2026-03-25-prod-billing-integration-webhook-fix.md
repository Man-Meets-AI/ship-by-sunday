# QA Run Report

Date: 2026-03-25
Environment: prod-www.man-meets-ai.com
Pack: billing_integration
Slug: prod-webhook-fix
Prepared personas: temp_prod_billing_qa, member_with_access
Scenario IDs: FREEPAID-01, FREEPAID-02

## Scope Tested

Commands and production actions used for the live no-cost verification:

- created a temporary live Clerk QA buyer with no access
- created a single-use live `100% off` promotion code and completed a real live no-cost Checkout Session
- verified the first completed live session reached Stripe successfully but did not create a product-access grant
- inspected live Stripe webhook endpoints and found the only enabled endpoint pointed at `https://www.man-meets-ai.com/api/stripe/webhook`
- confirmed that dead endpoint returned `404`
- created a new live Stripe webhook endpoint at `https://helpful-meadowlark-297.convex.site/stripe/webhook`
- disabled the stale endpoint at `https://www.man-meets-ai.com/api/stripe/webhook`
- set live Convex production `STRIPE_WEBHOOK_SECRET` to the new endpoint signing secret
- discovered live Convex production was missing `STRIPE_SECRET_KEY`
- set live Convex production `STRIPE_SECRET_KEY` from `apps/web/.env.production`
- replayed the real completed Stripe event for session `cs_live_b10KmMaSxyPZPdHbjsTM1Nos11bfyT9FCle3y54ttoQbWdOqq0BbG1FeBU` against the corrected live Convex webhook
- verified the resulting `productAccessGrants` row and `access:viewerProductAccess` state in production Convex

## Passed

- `FREEPAID-01` — Live prod Checkout Session creation still works for the signed-in buyer.
- `FREEPAID-02` — After repairing the live webhook endpoint and Convex prod Stripe env, replaying the real completed Stripe event returned `200` with `grantResult.inserted`.
- Production Convex now contains a `productAccessGrants` row for the temporary buyer with `source: "stripe_webhook"` and the live checkout session ID.
- `access:viewerProductAccess` on prod now returns `hasAccess: true` and `status: "granted"` for the temporary buyer.

## Findings

- `high` — The only enabled live Stripe webhook endpoint was misconfigured to `https://www.man-meets-ai.com/api/stripe/webhook`, which returned `404`. Live Checkout could complete while access grant never happened.
- `high` — The production Convex deployment was missing `STRIPE_SECRET_KEY`, so even after the endpoint URL was corrected the webhook still failed with `Missing required environment variable: STRIPE_SECRET_KEY`.
- `medium` — The canonical repo config was stale. `apps/web/config/product.ts` still declared `stripeWebhook: "/api/stripe/webhook"` even though the real webhook handler lives at Convex `POST /stripe/webhook`.

## Blocked

- None for the repaired live webhook/access-grant path.
- Optional follow-up only: run one brand-new post-fix live no-cost order if you want redundant proof of automatic Stripe delivery after the endpoint repair, rather than proof via replay of the real completed event.

## Notes

- Both temporary live promotion codes created for this run were deactivated after use.
- The canonical no-access QA persona was not mutated. A temporary live buyer account was used instead.
- The repaired live Stripe endpoint is `https://helpful-meadowlark-297.convex.site/stripe/webhook`.
