---
title: 'UI Design System Alignment Plan Split Recommendation'
summary: 'Recommended child ExecPlan split for the UI design-system alignment Program.'
docType: 'program_plan_split'
status: 'active'
read_when:
  - 'Writing the next child ExecPlan for UI design-system alignment.'
  - 'Checking what belongs in the color-first slice.'
---

# UI Design System Alignment Plan Split Recommendation

The first child ExecPlan should be `Color Token Alignment` at `docs/exec-plans/active/2026-05-03-color-token-alignment.md`. It should audit app color usage, promote needed screenshot-derived roles into the token layer, migrate high-value app surfaces to semantic classes, preserve marketing exceptions, and verify representative light and dark UI.

The second child ExecPlan should be `App Typography And Tracking Alignment`. It should resolve the global negative letter-spacing conflict, normalize app UI text roles around the `14px` default scale, and preserve Instrument Serif and brand wordmark exceptions for editorial surfaces.

The third child ExecPlan should be `Control Geometry And Spacing Alignment`. It should normalize reusable control sizes, input heights, selected-row padding, shell gutters, card radius, and app surface spacing where the screenshots provide a clear target. It should avoid redesigning hero CTAs and marketing sections.

The fourth child ExecPlan should be `Representative Surface Visual Audit`. It should run through protected and public representative routes in light and dark mode, capture browser proof, fix drift found by proof, and update the design library with any durable rule discovered during implementation.

The Program should not create all child ExecPlans up front. Write the next plan only after the previous slice has landed or changed the durable truth, so each child can point at the current planning brief and real implementation state.
