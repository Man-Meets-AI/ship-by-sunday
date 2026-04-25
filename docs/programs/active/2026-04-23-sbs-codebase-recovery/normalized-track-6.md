# Normalized Track 6

## Facts

The app has design-system and dependency sprawl. The issue is lower urgency than runtime or route correctness, but it still affects bundle risk, visual consistency, and maintenance.

## Recommendation

Write one cleanup ExecPlan that audits and removes unused heavy visuals, standardizes icon usage, and cleans operational surfaces without redesigning the product.

## Risks

The main risk is deleting a visual dependency that is generated or dynamically imported. The plan should require import scans and build proof before removal.

## Code Seams

Key seams include `apps/web/features/marketing`, blueprint theme preview components, `apps/web/package.json`, global styles, and product docs that mention design tokens.

## Proposed Slices

This track maps to `docs/exec-plans/active/2026-04-23-reduce-design-dependency-sprawl.md`.
