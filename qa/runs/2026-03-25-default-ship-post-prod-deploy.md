# QA Run Report

Date: 2026-03-25
Environment: prod-www.man-meets-ai.com
Pack: default_ship
Slug: post-prod-deploy
Prepared personas: signed_out, member_without_access, member_with_access
Scenario IDs: VIS-01, AUTH-01, AUTH-02, ACCESS-01, ACCESS-02, PACKET-01, PACKET-02, PACKET-03, PACKET-04, PACKET-05, PACKET-06, PACKET-07, SETTINGS-01

## Scope Tested

Commands run after the latest production deploy:

- `bun run qa:validate`
- `PLAYWRIGHT_BASE_URL=https://www.man-meets-ai.com bunx playwright test --project=browser-smoke`
- `E2E_RUN_SANDBOX=1 PLAYWRIGHT_BASE_URL=https://www.man-meets-ai.com bun run --cwd apps/web test:e2e:sandbox:default-ship`
- One-off direct prod sign-in probe for the non-entitled QA account against `https://www.man-meets-ai.com/sign-in`

## Passed

- Hosted `browser-smoke` is fully green on `https://www.man-meets-ai.com`.
- `AUTH-02` signed-out users are redirected off the protected packet workspace on prod.
- `ACCESS-02` checkout-success recovery without a session still renders correctly.

## Findings

- `high` — Hosted authenticated QA personas are still not establishing a usable prod session. The latest hosted sandbox rerun now fails explicitly during auth bootstrap with: `Failed to establish a QA session for member-no-access@example.test ... Identifier is invalid.`
- `high` — With `QA_ENV_FILE=apps/web/.env.production`, the old test-vs-live Clerk mismatch is gone. The remaining blocker is the live QA user state itself: `Test@test.com` still cannot establish a prod session even when the live Clerk env is loaded.
- `high` — `ACCESS-01` remains blocked on prod because the `member_without_access` persona does not stay authenticated long enough to reach the access-recovery surface.
- `high` — `PACKET-01` and `PACKET-07` remain blocked on prod for the same reason: the packet-first start surface is never reached for the hosted QA personas.
- `medium` — Local `browser-smoke` remains green on current `main`, which suggests the remaining problem is prod persona/auth setup rather than the public shell.

## Blocked

- `PACKET-02` through `PACKET-06` remain blocked behind the unresolved hosted authenticated-persona setup.
- `AUTH-01` is still not directly asserted as a hosted redirect-preservation scenario.

## Notes

- This report supersedes the earlier baseline only for the post-deploy prod state.
- The next highest-value fix is to inspect or reset the actual live QA Clerk users before treating packet-stage failures as route bugs.
