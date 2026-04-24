# Normalized Track 3

## Facts

The product route contract is unclear across app routes, docs, QA, navigation, and legacy course wording. The mismatch is now a source of bad evidence and confusing implementation targets.

## Recommendation

Write one route-contract ExecPlan that establishes the canonical protected flow and updates docs, QA, redirects, and navigation to match.

## Risks

The main risk is implementing product changes while only intending to reconcile contract truth. The plan should define the route contract first and keep UI redesign out of scope.

## Code Seams

Key seams include `apps/web/app/(workspace)`, `apps/web/content/docs/route-map.mdx`, `apps/web/features/workspace-navigation`, `qa/journeys.csv`, `qa/coverage.csv`, and post-review destination helpers.

## Proposed Slices

This track maps to `docs/exec-plans/active/2026-04-23-reconcile-product-route-contract.md`.
