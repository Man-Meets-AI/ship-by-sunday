# QA Run Report

Date: 2026-03-25
Environment: dev-local
Pack: billing_integration
Slug: dev-billing-integration-rerun
Prepared personas: member_without_access, member_with_access
Scenario IDs: FREEPAID-01, FREEPAID-02

## Scope Tested

Commands run against the local dev stack with hosted Convex dev sync and Stripe sandbox forwarding:

- `bun run qa:personas:prepare -- --pack=billing_integration`
- `bun run --cwd apps/web dev:convex`
- `bun run --cwd apps/web dev:stripe`
- `E2E_RUN_SANDBOX=1 PLAYWRIGHT_USE_LOCAL_SERVER=0 PLAYWRIGHT_BASE_URL=http://localhost:3000 bun run --cwd apps/web test:e2e:sandbox:billing-integration`
- `bun run --cwd apps/web stripe:dev:verify`

## Passed

- `FREEPAID-01` — The no-access QA persona reached Stripe Checkout, completed the Link sandbox verification flow, and returned to `/checkout/success`.
- `FREEPAID-02` — Stripe forwarded the webhook to the hosted Convex HTTP endpoint, the product access grant was written, and the browser auto-forwarded from `/checkout/success` into `/start`.

## Findings

- `low` — `bun run --cwd apps/web stripe:dev:doctor` still reports a Stripe CLI default-account mismatch, even though `dev:stripe` now forces the correct account with `--api-key`. The billing handoff passed anyway, but the doctor output is still noisy until the CLI default account is aligned.

## Blocked

- None.

## Notes

- The real dev webhook target for this repo is `{NEXT_PUBLIC_CONVEX_SITE_URL}/stripe/webhook`, not the `.convex.cloud` client origin. Forwarding Stripe to `.convex.cloud` produced `404` responses for every webhook event.
- The Stripe billing spec is now robust against the current Link sandbox variant because it waits for the Link verification prompt, submits `000000`, and prefers the direct `Pay` action before touching the fallback non-Link UI.
