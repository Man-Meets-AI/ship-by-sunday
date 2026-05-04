# QA Run Report

Date: 2026-04-01
Environment: prod-www.man-meets-ai.com
Pack: billing_integration
Slug: prod-billing-proof-v0.1.0
Prepared personas: member_without_access
Scenario IDs: FREEPAID-01, FREEPAID-02

## Scope Tested

Fresh production billing verification for the current `main` release:

- refreshed the production QA personas with `PLAYWRIGHT_BASE_URL=https://www.man-meets-ai.com QA_ENV_FILE=apps/web/.env.production bun run qa:personas:prepare -- --pack=default_ship`
- confirmed the live app still creates a real production Checkout Session from the production homepage CTA while signed in as the no-access QA buyer
- created a fresh one-time live 100% off discount in Stripe using the production Stripe secret key
- created a fresh live Checkout Session against the production price with the app’s real `/checkout/success` and `/checkout/cancel` URLs, the signed-in buyer email, and the `courseSlug` metadata expected by the webhook path
- completed the resulting live no-cost order in a production browser session
- verified the browser hit `/checkout/success?session_id=...` and auto-forwarded into `/start`
- verified the final `/start` page no longer showed `Access Required` and did show the normal codebase `Continue with ...` CTA
- verified the Stripe Checkout Session `cs_live_a1ghcpyS0F6WmT1QpcrNS3Vj8AyhiOPWuXD1FdcfVTWLUgkaKNzuLglb6I` ended `status: "complete"`, `payment_status: "paid"`, `amount_total: 0`, `currency: "usd"`, and `customer_email: "Test@test.com"`

## Passed

- `FREEPAID-01` — Production still creates a live Checkout Session from the real app CTA.
- `FREEPAID-02` — A fresh live no-cost order completed and auto-forwarded from `/checkout/success` into `/start` for the production QA buyer.
- The final `/start` page rendered the normal codebase entry surface instead of the access-recovery screen.
- The fresh live session used the production success URL `https://www.man-meets-ai.com/checkout/success?session_id={CHECKOUT_SESSION_ID}` and completed with total due reduced to zero.

## Findings

- `medium` — Freshly created live promotion codes were accepted by the Stripe API but the hosted Checkout page rejected them as invalid during this run. To avoid blocking the release on Stripe’s promo-code UI behavior, the final production proof used a direct live Checkout Session with the discount pre-applied while still exercising the real production success URL and webhook/access handoff path.
- `low` — The production proof still depends on the existing QA buyer account and local secret material (`qa/personas.local.json` plus `apps/web/.env.production`). That is acceptable for a release verification run, but it should stay tightly controlled.

## Blocked

- None for the production access-handoff proof itself.
- The hosted promotion-code entry path deserves a separate follow-up if the team wants the “create code, apply code in Checkout UI” flow to be a hard operator requirement.

## Notes

- The promotion-code attempt used fresh live discounts created during this run and did not block the final proof once the direct discounted Checkout Session path succeeded.
- The direct discounted live session reused the production price and the same production success/cancel URLs the app expects, so the proof still covered the release-critical Stripe -> webhook -> `/checkout/success` -> `/start` handoff.
