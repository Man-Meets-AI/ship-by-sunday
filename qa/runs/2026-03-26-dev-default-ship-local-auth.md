# QA Run Report

Date: 2026-03-26
Environment: dev-local
Pack: default_ship
Slug: blueprint-funnel-local-auth
Prepared personas: signed_out, member_without_access, member_with_access
Scenario IDs: VIS-01, AUTH-01, AUTH-02, ACCESS-01, ACCESS-02, BLUEPRINT-01, BLUEPRINT-02, BLUEPRINT-03, BLUEPRINT-04, BLUEPRINT-05, BLUEPRINT-06, BLUEPRINT-07, BLUEPRINT-09, SETTINGS-01

## Scope Tested

Commands run against the local dev stack at `http://localhost:3000`:

- `bun run dev:full`
- `bun run qa:validate`
- `PLAYWRIGHT_BASE_URL=http://localhost:3000 bun run qa:personas:prepare -- --pack=default_ship`
- `bun run test:browser-smoke`
- `bun run --cwd apps/web test:integration:ui -- tests/integration-ui/blueprint-start-page.test.tsx tests/integration-ui/blueprint-stage-page.test.tsx tests/integration-ui/blueprint-review-page.test.tsx tests/integration-ui/blueprint-stage-sidebar.test.tsx`
- `PLAYWRIGHT_BASE_URL=http://localhost:3000 bun run --cwd apps/web test:e2e:local-auth:default-ship`

This run uses the new local-auth browser lane instead of the sandbox-only gate. The entitled QA user is seeded with complete blueprint progress during Playwright bootstrap so the canonical blueprint funnel can be exercised deterministically on local dev.

## Passed

- `VIS-01` — Browser smoke confirmed the public landing page still renders the main offer CTA.
- `AUTH-01` — Local-auth Playwright confirmed a signed-out user can sign in with the entitled QA account and land on the preserved protected blueprint route instead of dropping the redirect target.
- `ACCESS-02` — Browser smoke confirmed `/checkout/success` still renders the recovery surface without a live session.
- `AUTH-02` — Local-auth Playwright confirmed signed-out direct entry to `/start` still redirects safely.
- `ACCESS-01` — Local-auth Playwright confirmed the no-access persona still sees inline recovery on `/start`.
- `BLUEPRINT-01` — Local-auth Playwright confirmed the entitled persona reaches the stacked Start kickoff and sees the primary `Continue with ...` CTA.
- `BLUEPRINT-02`, `BLUEPRINT-03`, `BLUEPRINT-04`, `BLUEPRINT-05` — Local-auth Playwright confirmed the entitled persona can traverse the canonical blueprint stage-entry routes for Product, Design, Marketing, and Build Plan.
- `BLUEPRINT-06` — Local-auth Playwright confirmed the entitled persona can reach Review and see the Blueprint download surface.
- `BLUEPRINT-07` — The blueprint integration-ui suite plus the local-auth browser lane kept the full blueprint funnel contract green.
- `BLUEPRINT-09` — The blueprint integration-ui suite kept the locked direct-entry redirect behavior green for both stage pages and Review.
- `SETTINGS-01` — Local-auth Playwright confirmed `/settings` still loads from the protected workspace.

## Findings

- None from the executed local-dev blueprint funnel path.

## Blocked

- None for the executed `default_ship` dev-local blueprint funnel path.

## Notes

- This report supersedes `qa/runs/2026-03-25-dev-default-ship.md` for the current local blueprint funnel UX.
- The `default_ship` pack on local dev now includes browser smoke, the blueprint integration-ui suite, and the local authenticated blueprint-funnel browser lane.
- The QA control plane now treats “all sandbox tests skipped” as missing evidence rather than a green blueprint-browser pass.
