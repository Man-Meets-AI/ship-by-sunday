# Normalized Track 4

## Facts

Blueprint and workbench code has the highest maintainability burden. Large hooks and components combine state, validation, upload behavior, rendering, and navigation in ways that make small product changes risky.

## Recommendation

Write one structural refactor ExecPlan for blueprint and workbench systems. It should split controllers and consolidate repeated primitives while preserving current product behavior.

## Risks

The main risk is turning a refactor into a redesign. The plan should require tests around preserved behavior and forbid layout or product-flow redesign unless it is needed for the split.

## Code Seams

Key seams include `apps/web/features/blueprint-flow/hooks/use-blueprint-page-state.ts`, `apps/web/features/course/lesson/workbench`, and shared upload helpers.

## Proposed Slices

This track maps to `docs/exec-plans/active/2026-04-23-split-blueprint-and-workbench-systems.md`.
