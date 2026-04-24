# Normalized Track 5

## Facts

Observability data currently mixes historical shapes, rollup data, event occurrence details, and export helpers across unclear boundaries. This weakens debugging and intake projection.

## Recommendation

Write one data-contract ExecPlan that separates incident occurrence truth from rollup truth, preserves client error details, and moves shared intake contracts to an intentional boundary.

## Risks

The main risk is changing storage shape without a migration or compatibility strategy. The plan should start with model and export tests before any destructive data-shape change.

## Code Seams

Key seams include `apps/web/convex/observability.ts`, `apps/web/convex/observability/model.ts`, `apps/web/convex/schema.ts`, `apps/web/features/observability/export`, and `qa/scripts/lib/engineering-intake-contract.mjs`.

## Proposed Slices

This track maps to `docs/exec-plans/active/2026-04-23-harden-observability-data-contracts.md`.
