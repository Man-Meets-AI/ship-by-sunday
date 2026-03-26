# QA Run Report

Date: 2026-03-25
Environment: dev-local
Pack: billing_integration
Slug: dev-local
Prepared personas: member_without_access, member_with_access
Scenario IDs: FREEPAID-01, FREEPAID-02

## Scope Tested

Commands run on the local dev stack with test Stripe enabled:

- `QA_ALLOW_BILLING_INTEGRATION=1 QA_REPORT_ENVIRONMENT=dev-local PLAYWRIGHT_USE_LOCAL_SERVER=0 PLAYWRIGHT_BASE_URL=http://localhost:3000 bun run qa:run-pack -- --pack=billing_integration --slug=dev-local`

## Passed

- The no-access QA persona is now recognized as signed in on the homepage before checkout starts.
- The billing flow reaches Stripe Checkout successfully.
- The Stripe `Pay without Link` bypass is reachable.

## Findings

- `medium` — The billing lane is now blocked inside Stripe Checkout, not by app auth. After `Pay without Link`, the current sandbox UI no longer exposes the old card placeholders (`1234 1234 1234 1234`, `MM / YY`, `CVC`, `ZIP`) that the test expects.
- `medium` — Stripe is rendering the newer Link verification flow first (`Confirm it’s you`, enter `000000`) and then a payment-method surface with `Card` / `Cash App Pay` choices and embedded iframes. The remaining work is Stripe-side interaction maintenance, not Clerk or Convex auth.

## Blocked

- `FREEPAID-02` is blocked by Stripe Link / Checkout automation drift, not by app-side auth or route behavior.

## Notes

- This is a much narrower blocker than the original auth failures.
- Fix the Stripe sandbox selectors next, then rerun the local billing pack before attempting hosted billing evidence.
