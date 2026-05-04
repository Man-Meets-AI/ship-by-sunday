# QA Run Report

Date: 2026-03-25
Environment: prod-www.man-meets-ai.com
Pack: default_ship
Slug: prod-rerun
Prepared personas: signed_out, member_without_access, member_with_access
Scenario IDs: VIS-01, AUTH-01, AUTH-02, ACCESS-01, ACCESS-02, CODEBASE-01, CODEBASE-02, CODEBASE-03, CODEBASE-04, CODEBASE-05, CODEBASE-06, CODEBASE-07, SETTINGS-01

## Scope Tested

Commands run against the public production domain:

- `PLAYWRIGHT_USE_LOCAL_SERVER=0 PLAYWRIGHT_BASE_URL=https://www.man-meets-ai.com bun run --cwd apps/web test:browser-smoke:hosted`
- `E2E_RUN_SANDBOX=1 PLAYWRIGHT_USE_LOCAL_SERVER=0 PLAYWRIGHT_BASE_URL=https://www.man-meets-ai.com bun run --cwd apps/web test:e2e:sandbox:default-ship`
- One-off manual auth smoke on `https://www.man-meets-ai.com/sign-in?redirect_url=%2Fstart` with the non-entitled QA user

## Passed

- `VIS-01` and `ACCESS-02` still pass on prod through `browser-smoke`.
- `AUTH-01` manual auth smoke accepted the non-entitled QA credentials and preserved the redirect into `/start`.
- `AUTH-02` direct signed-out entry to the protected codebase workspace still redirects safely.
- `ACCESS-01` now passes on prod: the signed-in no-access persona reaches `/start` and sees the inline recovery state.
- `CODEBASE-01` through `CODEBASE-07` now pass on prod for the entitled QA persona, including the full codebase funnel and `/settings`.

## Findings

- None.

## Blocked

- None for `default_ship` on prod in this rerun.

## Notes

- This report supersedes `qa/runs/2026-03-25-default-ship-post-prod-deploy.md` for the current prod `default_ship` state.
- The earlier prod auth blocker did not reproduce on rerun. The live QA users now establish sessions successfully on the hosted sign-in flow.
