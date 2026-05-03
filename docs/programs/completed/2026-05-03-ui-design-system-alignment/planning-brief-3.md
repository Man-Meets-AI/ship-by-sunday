---
title: UI Design System Alignment Planning Brief 3
program_id: ui-design-system-alignment
brief_version: 3
status: current
summary: Write and execute the control geometry and spacing alignment child ExecPlan across reusable app UI.
read_when:
  - Writing the control geometry and spacing alignment child ExecPlan.
  - Continuing the UI design-system alignment Program after color and inherited tracking slices.
---

# UI Design System Alignment Planning Brief 3

## Planning Context

The first child slice, `docs/exec-plans/completed/2026-05-03-color-token-alignment.md`, established initial semantic app color roles. The second child slice, `docs/exec-plans/completed/2026-05-03-typography-tracking-alignment.md`, reset inherited operational tracking at app shell boundaries and reconciled typography docs. The next slice should address the remaining UI density and geometry drift without rewriting route layouts wholesale.

The detailed audit target is `docs/design-docs/ui-design-library.md`. It defines compact button heights, icon button sizes, input heights, nav row rhythm, card radii, shell gutters, and app spacing expectations.

The Program packet lives at `docs/programs/active/2026-05-03-ui-design-system-alignment/`.

## Next Plan Recommendation

Exact next plan title: `Control Geometry And Spacing Alignment`.

Exact target path: `docs/exec-plans/active/2026-05-03-control-geometry-spacing-alignment.md`.

Exact scope: audit reusable control sizes, shell gutters, nav row geometry, card radii, app page spacing, and nested card patterns; normalize the smallest high-value shared primitives or shell boundaries; preserve homepage custom graphics and editorial sections; update design docs with durable rules; and prove desktop plus mobile rendering for reachable app routes.

Exact implementation boundaries: prefer shared primitives and shell-level spacing before route-specific rewrites. Likely surfaces include `apps/web/components/ui/button.tsx`, `input.tsx`, `textarea.tsx`, `card.tsx`, `item.tsx`, `sidebar.tsx`, app shell navigation components, checkout success/cancel handoff surfaces, and focused protected app panels only when drift is clearly reusable. Do not change product routing, auth, checkout behavior, entitlement, Convex data, provider setup, package dependencies, generated customer docs, homepage section order, marketing copy, or the named custom homepage editorial sections.

Exact validation boundaries: run focused tests for touched primitives and routes, run `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-03-control-geometry-spacing-alignment.md`, run `bun run programs:lint`, run markdown lint for the Program and child ExecPlan, run `bun run format`, `bun lint`, `bun typecheck`, `git diff --check`, and capture desktop plus mobile browser proof for reachable routes and any protected routes that local auth permits.

## Required Third-Slice Decisions

The child ExecPlan must decide whether a geometry drift belongs in a shared primitive, a shell boundary, or a route-specific component. Prefer shared primitive fixes only when the primitive itself violates the design library or the same drift repeats across surfaces.

The child ExecPlan must not convert every panel into a card or every card into plain layout. It should use the design library's "no nested cards" and "cards only when they frame a real tool or repeated item" guidance, then apply the smallest safe changes.

The child ExecPlan must keep button size and mobile tap target tradeoffs explicit. Desktop controls should remain compact, but mobile hit targets still need practical touch size where the component is interactive.

The child ExecPlan must continue treating the named homepage editorial sections as out of scope even if their spacing, card radii, graphics, or control sizes differ from the app UI design library.

## Success Criteria

The slice succeeds when high-value reusable controls and app shell geometry move closer to the screenshot-grounded library, route-specific churn stays low, homepage/editorial exceptions are preserved, focused tests and broad gates pass, and browser proof shows desktop plus mobile UI remains readable and tappable.
