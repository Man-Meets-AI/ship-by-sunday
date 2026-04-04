# QA Run Report

Date: 2026-03-25
Environment: prod-www.man-meets-ai.com
Pack: default_ship
Slug: baseline
Prepared personas: signed_out, member_without_access, member_with_access
Scenario IDs: VIS-01, AUTH-01, AUTH-02, ACCESS-01, ACCESS-02, BLUEPRINT-01, BLUEPRINT-02, BLUEPRINT-03, BLUEPRINT-04, BLUEPRINT-05, BLUEPRINT-06, BLUEPRINT-07, SETTINGS-01

## Scope Tested

Commands run from `/Users/parkerrex/Projects/ship-by-sunday`:

- `bun run qa:validate`
- `bun run qa:personas:prepare -- --pack=default_ship`
- `cd apps/web && PLAYWRIGHT_BASE_URL=https://www.man-meets-ai.com bunx playwright test --project=browser-smoke`
- `E2E_RUN_SANDBOX=1 PLAYWRIGHT_BASE_URL=https://www.man-meets-ai.com bun run --cwd apps/web test:e2e:sandbox:default-ship`

The public browser-smoke lane passed on `https://www.man-meets-ai.com`. The hosted default-ship sandbox lane failed on all four assertions tied to the blueprint-first protected workspace.

## Passed

- `VIS-01` landing CTA and public offer content loaded on the public domain.
- `ACCESS-02` checkout-success recovery without a session rendered correctly on the public domain.
- Out-of-pack confirmations: `VIS-02` public crawl and homepage schema plus `DOCS-01` docs canonical/noindex behavior also passed in the hosted browser-smoke lane.

## Findings

- `high` — `AUTH-02` failed on the public domain. A signed-out visit to `/start` stayed on `https://www.man-meets-ai.com/start` and rendered `Page not found` instead of redirecting to `/sign-in`.
- `high` — `ACCESS-01` failed on the public domain. `member_without_access` hitting `/start` saw the same `Page not found` surface instead of access recovery.
- `high` — `BLUEPRINT-01`, `BLUEPRINT-07`, and `SETTINGS-01` failed for `member_with_access` because the blueprint-first workspace did not render. The failure snapshot showed `Open workspace` linking to `/mission`, which strongly suggests the live deployment is still serving the older mission-based contract.
- `high` — `BLUEPRINT-02` through `BLUEPRINT-06` remain unverified on the public domain because the canonical entry surface itself is missing.
- `medium` — `AUTH-01` is still not directly asserted in the hosted default-ship pack. Persona bootstrap sign-in succeeded, but redirect-preservation is not yet covered by a dedicated hosted assertion.

## Blocked

- None for this pack. The hosted public domain was reachable, so the failure state is real evidence rather than an execution blocker.

## Notes

- Public evidence came from `https://www.man-meets-ai.com`, because the recent preview deployment aliases were unavailable during the run.
- Local blueprint-first sandbox attempts uncovered useful runner issues and auth-bootstrap bugs, but they were not treated as release evidence once the public-domain run was available.
