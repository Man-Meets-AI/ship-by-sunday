# QA Run Report

Date: 2026-03-25
Environment: prod-www.man-meets-ai.com
Pack: billing_integration
Slug: prod-automatic-rerun
Prepared personas: temp_prod_billing_qa_existing, member_with_access
Scenario IDs: FREEPAID-01, FREEPAID-02

## Scope Tested

Post-fix automatic production verification after the webhook repair:

- signed into prod as the previously created temporary QA buyer with product access already granted from the repaired replay
- created a fresh live Checkout Session from the authenticated app context with `POST /api/stripe/checkout`
- applied a fresh single-use live `100% off` promotion code
- completed the hosted Checkout order without replaying the event afterward
- waited for the browser to auto-forward back into `/start`
- verified the existing `productAccessGrants` row patched to the new live Checkout Session ID
- verified `access:viewerProductAccess` still returned `status: "granted"`

## Passed

- `FREEPAID-01` — Production still creates a live Checkout Session for the signed-in buyer.
- `FREEPAID-02` — After the live webhook endpoint and Convex prod Stripe env were fixed, a fresh live no-cost order completed and auto-forwarded back into `/start` without any webhook replay.
- Production Convex patched the existing `stripe_webhook` grant row to the new session `cs_live_b10eiCJMyOmTZnkY2CvzYpurkwJUPVYqz3ImhFNKd4XIURLZBLUpgl5Fv2`.
- `access:viewerProductAccess` on prod remained `hasAccess: true` and `status: "granted"` after the automatic rerun.

## Findings

- `low` — Freshly created live Clerk QA users were flaky for immediate headless sign-in during this run and sometimes rendered client-side validation like `Email is missing`. Using the already-proven temporary QA buyer avoided that auth-timing noise and let the billing handoff itself be verified cleanly.

## Blocked

- None for the repaired automatic prod billing handoff.

## Notes

- The promotion code used for this rerun was deactivated after the order completed.
- This report is the strongest current production billing proof in the repo because it exercises real automatic Stripe delivery after the live endpoint repair, not just replay.
