# QA Run Report

Date: 2026-03-25
Environment: prod-www.man-meets-ai.com
Pack: billing_integration
Slug: blocked
Prepared personas: member_without_access, member_with_access
Scenario IDs: FREEPAID-01, FREEPAID-02

## Scope Tested

Commands run from `/Users/parkerrex/Projects/manmeetsai-workspace`:

- `bun run qa:validate`
- `bun run qa:personas:prepare -- --pack=billing_integration`

No Stripe checkout confirmation was executed in this slice.

## Passed

- Persona preparation for `member_without_access` and `member_with_access` completed locally, which confirms the QA control plane can provision the required identities.

## Findings

- `medium` — The repository now has a tagged `@billing_integration` browser flow, but it was not safe to execute against the currently reachable public environment.

## Blocked

- `FREEPAID-01` blocked: the public domain was not explicitly confirmed as a Stripe test-only environment, so starting a real checkout would have been unsafe.
- `FREEPAID-02` blocked: the packet-first preview deployments for `mma-shipbysunday` were unavailable, and the public domain appears to be serving the older mission-based workspace contract.
- The local packet-first sandbox was not stable enough to use for payment confirmation during this slice because the focus was on proving the QA control plane and capturing public-domain evidence without risking a live charge.

## Notes

- Do not run the billing-integration browser pack until there is a confirmed test-only environment and `QA_ALLOW_BILLING_INTEGRATION=1` is set.
- Once a safe environment exists, the intended command is `PLAYWRIGHT_BASE_URL=<safe_test_url> QA_ALLOW_BILLING_INTEGRATION=1 bun run qa:run-pack -- --pack=billing_integration`.
