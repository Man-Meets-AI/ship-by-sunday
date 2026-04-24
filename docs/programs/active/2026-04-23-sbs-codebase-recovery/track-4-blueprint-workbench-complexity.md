# Blueprint Workbench Complexity Research

This research pass captures the biggest maintainability hotspots.

## Findings

`apps/web/features/blueprint-flow/hooks/use-blueprint-page-state.ts` has grown into a large controller that owns saved values, draft values, validation, save behavior, focus, unlock behavior, and navigation. It is hard to change safely because multiple user-visible behaviors live in one hook.

Workbench components repeat upload lifecycle, checklist rendering, preview state, and error handling across reference galleries, sketch uploads, brand kit image inputs, and prompt import surfaces. There is already some shared upload storage code, but several fields still reimplement direct upload behavior.

Several TSX components exceed the repository component-size standard. The issue is not the exact line count by itself; it is that stateful behavior, data transformation, and rendering are mixed together, which makes feature work slower and riskier.

## Durable Implication

The fourth child ExecPlan should split blueprint and workbench behavior by responsibility. It should create smaller controllers and shared upload/checklist primitives without redesigning the product UI.
