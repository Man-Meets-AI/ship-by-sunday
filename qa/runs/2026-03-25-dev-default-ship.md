# QA Run Report

Date: 2026-03-25
Environment: dev-local
Pack: default_ship
Slug: dev-local
Prepared personas: signed_out, member_without_access, member_with_access
Scenario IDs: VIS-01, AUTH-01, AUTH-02, ACCESS-01, ACCESS-02, BLUEPRINT-01, BLUEPRINT-02, BLUEPRINT-03, BLUEPRINT-04, BLUEPRINT-05, BLUEPRINT-06, BLUEPRINT-07, SETTINGS-01

## Scope Tested

Commands run on local dev after fixing the Convex dev auth provider:

- `bun run dev:full`
- `bun run qa:validate`
- `bun run qa:personas:prepare -- --pack=default_ship`
- `PLAYWRIGHT_USE_LOCAL_SERVER=1 PLAYWRIGHT_BASE_URL=http://localhost:3000 bun run --cwd apps/web test:browser-smoke`
- `E2E_RUN_SANDBOX=1 PLAYWRIGHT_USE_LOCAL_SERVER=0 PLAYWRIGHT_BASE_URL=http://localhost:3000 bun run --cwd apps/web test:e2e:sandbox:default-ship`

## Passed

- Local signed-out blueprint entry redirects correctly.
- Local no-access recovery renders correctly on `/start`.
- Local entitled-member blueprint entry renders and the blueprint funnel plus settings route can be exercised.
- Local browser-smoke remains green.

## Findings

- `high` — The original local `NoAuthProvider` failure was caused by the hosted Convex dev environment trusting the live Clerk frontend URL while local dev was using the test Clerk instance. Updating `CLERK_FRONTEND_API_URL` on the hosted Convex dev deployment to `https://amused-cattle-61.clerk.accounts.dev` fixed the runtime mismatch.
- `medium` — The custom Clerk sign-in flow had two bugs that masked the real state: it used the wrong `signIn.password()` field name and it did not reliably activate the created session after a successful password response.

## Blocked

- None for `default_ship` on local dev after the auth-provider and session-activation fixes.

## Notes

- Local `default_ship` is now the canonical first debug step before any hosted/prod QA rerun.
- The remaining QA work should build from this dev-local green state outward.
