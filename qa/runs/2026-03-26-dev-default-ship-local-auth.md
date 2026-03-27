# QA Run Report

Date: 2026-03-26
Environment: dev-local
Pack: default_ship
Slug: packet-funnel-local-auth
Prepared personas: signed_out, member_without_access, member_with_access
Scenario IDs: VIS-01, AUTH-01, AUTH-02, ACCESS-01, ACCESS-02, PACKET-01, PACKET-02, PACKET-03, PACKET-04, PACKET-05, PACKET-06, PACKET-07, PACKET-09, SETTINGS-01

## Scope Tested

Commands run against the local dev stack at `http://localhost:3000`:

- `bun run dev:full`
- `bun run qa:validate`
- `PLAYWRIGHT_BASE_URL=http://localhost:3000 bun run qa:personas:prepare -- --pack=default_ship`
- `bun run test:browser-smoke`
- `bun run --cwd apps/web test:integration:ui -- tests/integration-ui/packet-start-page.test.tsx tests/integration-ui/packet-stage-page.test.tsx tests/integration-ui/packet-review-page.test.tsx tests/integration-ui/packet-stage-sidebar.test.tsx`
- `PLAYWRIGHT_BASE_URL=http://localhost:3000 bun run --cwd apps/web test:e2e:local-auth:default-ship`

This run uses the new local-auth browser lane instead of the sandbox-only gate. The entitled QA user is seeded with complete packet progress during Playwright bootstrap so the canonical packet funnel can be exercised deterministically on local dev.

## Passed

- `VIS-01` — Browser smoke confirmed the public landing page still renders the main offer CTA.
- `AUTH-01` — Local-auth Playwright confirmed a signed-out user can sign in with the entitled QA account and land on the preserved protected packet route instead of dropping the redirect target.
- `ACCESS-02` — Browser smoke confirmed `/checkout/success` still renders the recovery surface without a live session.
- `AUTH-02` — Local-auth Playwright confirmed signed-out direct entry to `/start` still redirects safely.
- `ACCESS-01` — Local-auth Playwright confirmed the no-access persona still sees inline recovery on `/start`.
- `PACKET-01` — Local-auth Playwright confirmed the entitled persona reaches the stacked Start kickoff and sees the primary `Continue with ...` CTA.
- `PACKET-02`, `PACKET-03`, `PACKET-04`, `PACKET-05` — Local-auth Playwright confirmed the entitled persona can traverse the canonical packet stage-entry routes for Product, Design, Marketing, and Build Plan.
- `PACKET-06` — Local-auth Playwright confirmed the entitled persona can reach Review and see the Starter Snapshot download surface.
- `PACKET-07` — The packet integration-ui suite plus the local-auth browser lane kept the full packet funnel contract green.
- `PACKET-09` — The packet integration-ui suite kept the locked direct-entry redirect behavior green for both stage pages and Review.
- `SETTINGS-01` — Local-auth Playwright confirmed `/settings` still loads from the protected workspace.

## Findings

- None from the executed local-dev packet funnel path.

## Blocked

- None for the executed `default_ship` dev-local packet funnel path.

## Notes

- This report supersedes `qa/runs/2026-03-25-dev-default-ship.md` for the current local packet funnel UX.
- The `default_ship` pack on local dev now includes browser smoke, the packet integration-ui suite, and the local authenticated packet-funnel browser lane.
- The QA control plane now treats “all sandbox tests skipped” as missing evidence rather than a green packet-browser pass.
