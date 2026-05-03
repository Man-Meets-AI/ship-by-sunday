---
title: 'UI Design System Alignment Dependency Graph'
summary: 'Dependency ordering for UI design-system alignment slices.'
docType: 'program_dependency_graph'
status: 'active'
read_when:
  - 'Checking slice order for UI design-system alignment.'
  - 'Deciding whether a child ExecPlan can start safely.'
---

# UI Design System Alignment Dependency Graph

The Program depends on the design documentation slice that already landed: `docs/design-docs/ui-design-library.md`, root `DESIGN.md`, `docs/DESIGN.md`, and `docs/design-docs/index.md`.

The first implementation dependency is color token alignment. It reads the design library, inspects `apps/web/app/globals.css`, audits hard-coded color usage, and migrates shared app surfaces to semantic roles. Later slices should not normalize typography or spacing until the color roles are stable enough to avoid repeated churn in the same class strings.

The second dependency is typography and tracking alignment. It depends on the color slice only because app surfaces should be visually stable before type roles move. It should decide whether `body` keeps negative letter spacing globally or whether app surfaces reset operational tracking to `0`.

The third dependency is spacing and control geometry alignment. It depends on color and typography because button heights, input heights, radius, line height, and density can only be judged accurately after text and color stop drifting.

The fourth dependency is route-level visual proof. It depends on the previous three slices because screenshot proof should validate the finished system, not an intermediate state.

No external provider setup is expected for this Program. If a later child ExecPlan unexpectedly changes Clerk, Convex, Stripe, PostHog, Vercel, GitHub, email, storage, analytics, or observability setup, that child plan must update the active setup docs in the same change.
