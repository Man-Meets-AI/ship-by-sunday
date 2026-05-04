---
title: Control Geometry And Spacing Alignment
status: complete
created_at: 2026-05-03
completed_at: 2026-05-03
summary: Align reusable control sizes and high-value app spacing with the screenshot-grounded UI design library while preserving homepage editorial exceptions.
post_build_recap: Shared buttons now use the documented compact size ladder, protected review/access spacing and panel radii were tightened, design docs record the implemented rules, stale auth-handoff test expectations were repaired, and focused tests, broad gates, and browser proof passed.
program_id: ui-design-system-alignment
planning_brief: docs/programs/completed/2026-05-03-ui-design-system-alignment/planning-brief-3.md
read_when:
  - Resuming the control geometry and spacing slice.
  - Changing shared app controls, shell gutters, or compact workspace spacing.
  - Deciding whether large radii, oversized buttons, or nested panels are drift.
---

# Control Geometry And Spacing Alignment

This is a living execution plan. Update it at every stopping point so the next contributor can resume from this file alone.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday app UI should feel like one compact desktop tool. The color and inherited tracking slices already reduced two major sources of drift; this slice makes shared controls, row geometry, and high-value app spacing match the screenshot-grounded design library more closely.

After this plan, reusable buttons and nearby app-shell controls should land on the documented `28px`, `32px`, and `40px` size ladder, app spacing rules should be documented where implementation now depends on them, and homepage art-directed sections should remain untouched. A reviewer should be able to inspect representative routes on desktop and mobile and see compact, readable, tappable controls without route-wide redesign churn.

## Progress

- [x] 2026-05-03: Created this ExecPlan from `docs/programs/completed/2026-05-03-ui-design-system-alignment/planning-brief-3.md`.
- [x] 2026-05-03: Inventory reusable control sizes, shell gutters, card radii, and high-risk spacing drift.
- [x] 2026-05-03: Patch the smallest shared primitives or app shell boundaries that clearly violate the design library.
- [x] 2026-05-03: Update design docs and Program state with durable geometry rules and explicit exceptions.
- [x] 2026-05-03: Run focused tests, broad gates, and desktop/mobile browser proof.

## Surprises & Discoveries

Initial scan showed that `apps/web/components/ui/button.tsx` is close to the target ladder for default buttons and icon-only default buttons, but `size="lg"` currently renders `36px` high instead of the documented `40px`, and `size="icon-sm"` currently renders `32px` instead of the documented `28px`.

The same scan found many oversized controls and large radii in homepage, blog, docs, error, and editorial surfaces. Those are not automatically bugs. The named homepage editorial sections, hero/pricing CTAs, docs chrome, and blog reading chrome can intentionally use larger rhythm than compact app UI.

`input.tsx`, `textarea.tsx`, `card.tsx`, and `item.tsx` were already close to the documented compact ladder. `textarea.tsx` keeps `text-base md:text-sm`, which is an intentional mobile input-zoom avoidance pattern rather than density drift.

The protected review handoff and lesson-map surfaces had route-specific oversized radii of `32px` and `28px`. Those are operational app handoff panels, not homepage/editorial surfaces, so this slice tightened them to `rounded-2xl` instead of leaving them for the later representative proof pass.

Validation uncovered stale expectations from the concurrent checkout-email handoff branch. The route now sends `/sign-up?session_id=...` into `/checkout/email-handoff`, and checkout success recovery sends paid checkout-email proof through the same route. Updating those tests was required to keep the focused and repo-level gates honest; no visual behavior was invented by this slice.

## Decision Log

Decision: Start with shared `Button` geometry before route-specific spacing edits.
Rationale: The button primitive is the broadest reusable source of control sizing truth, and two variants currently contradict the design library directly. Fixing those variants avoids broad route churn.
Date: 2026-05-03

Decision: Do not normalize homepage, blog, docs, or named editorial section geometry in this slice.
Rationale: Root `DESIGN.md` separates compact operational app UI from marketing and editorial expression, and Parker explicitly excluded the custom homepage graphics, typography, and styles from normalization.
Date: 2026-05-03

Decision: Treat mobile tap targets as a route/shell responsibility when the compact desktop primitive is visually smaller than `44px`.
Rationale: The design library calls for compact desktop controls but practical mobile tap areas. The shared primitive should keep the documented visual ladder, while callers can add min-height or surrounding hit area when a mobile surface needs it.
Date: 2026-05-03

## Outcomes & Retrospective

This plan completed the compact control geometry slice. `apps/web/components/ui/button.tsx` now follows the documented `28px`, `32px`, and `40px` button ladder and the `24px`, `28px`, and `32px` icon-only ladder. The protected review handoff, review page stack, lesson-map surface, and access-required shell now use tighter operational spacing and radii rather than oversized marketing-card geometry.

The root design docs now record the implemented button ladder, operational panel radius rule, and access-state spacing baseline. The named homepage editorial sections were not touched. The final representative browser proof was folded into this slice rather than split into a fourth child ExecPlan because the remaining proof work was route verification, not a new implementation slice.

## Context and Orientation

The main design target is `docs/design-docs/ui-design-library.md`. It defines a `4px` spacing grid, compact app button heights, icon-only button sizes, input heights, card radii, nav row rhythm, and audit rules such as "flag buttons that are not `28px`, `32px`, or `40px` high" and "flag card radii above `20px`."

Root `DESIGN.md` is the high-level source of truth. It says shared controls default to `rounded-lg`, cards default to `rounded-xl`, and marketing CTAs or docs/editorial panels can intentionally use larger silhouettes.

The highest-leverage implementation surface is `apps/web/components/ui/button.tsx`. It owns the shared button variants and sizes used across workspace, identity, checkout, settings, codebase, and course surfaces. Nearby primitives include `apps/web/components/ui/input.tsx`, `apps/web/components/ui/textarea.tsx`, `apps/web/components/ui/card.tsx`, `apps/web/components/ui/item.tsx`, and `apps/web/components/ui/sidebar.tsx`.

Workspace shell geometry lives under `apps/web/app/(workspace)/_components/app-shell/` and `apps/web/app/(workspace)/_components/app-shell.tsx`. Identity routes live under `apps/web/app/(identity)/`. Checkout handoff routes live under `apps/web/app/checkout/`.

Hard homepage exclusions remain unchanged from the Program: do not edit or indirectly normalize the custom graphics, font treatments, color choices, or layout styles for the `Install leverage` / `the loop repeats TOMORROW`, `Exec Loops: OpenAI's WEAPON of choice`, or worker/how-workers-work sections.

### In Scope

Audit reusable control sizes, icon button sizes, input and textarea density, card radii, item row rhythm, shell gutters, app page spacing, and nested card patterns. Patch only shared primitives or shell/app surfaces where the current implementation clearly contradicts the design library and the fix can stay small. Update `DESIGN.md`, `docs/design-docs/ui-design-library.md`, this ExecPlan, and the owning Program as needed.

### Out Of Scope

Do not change product routing, auth behavior, checkout behavior, entitlement logic, Convex data, package dependencies, external provider setup, generated customer docs, homepage section order, marketing copy, blog/docs editorial rhythm, hero/pricing CTAs, error-page marketing treatments, or the named custom homepage editorial sections. Do not rewrite every route-level card or spacing pattern in one pass.

## Plan of Work

Start by inventorying size and geometry usage under `apps/web/app` and `apps/web/components`. Classify each finding as shared primitive drift, app shell drift, route-specific operational drift, intentional homepage/editorial exception, docs/blog exception, or mobile tap-target override.

Patch `apps/web/components/ui/button.tsx` if the inventory confirms the initial finding: make the large button variant visually `40px` high with appropriate horizontal padding, and make the small icon-only variant visually `28px` high. Keep default `32px` button and icon behavior intact. Avoid changing labels, routing, mutations, or behavior.

Inspect `input.tsx`, `textarea.tsx`, `card.tsx`, `item.tsx`, and `sidebar.tsx`. If they already match the documented ladder, record that and leave them alone. If a small shared primitive change is needed, make it only when it improves more than one operational surface.

Review app shell and representative workspace surfaces for a narrow spacing fix after the primitive patch. Prefer one shell or shared component change over route-specific rewrites. If no safe route-level spacing change is justified, record that the slice intentionally stops at the primitive baseline.

Reconcile docs after implementation. Update `docs/design-docs/ui-design-library.md` with any implemented geometry notes and update the Program so the active slice and completion state are true.

Finally, run focused checks, broad gates, and browser proof on reachable app-adjacent routes. Because protected routes may redirect without local auth, use integration UI tests for protected rendering and reachable identity/checkout routes for direct browser proof when needed.

## Milestones

Milestone 1 inventories current geometry. Success means this plan records which findings are real shared drift and which are intentional exceptions.

Milestone 2 patches the smallest reusable control baseline. Success means shared controls render on the documented size ladder without changing app behavior.

Milestone 3 updates durable design docs and the Program. Success means future work can tell what geometry rules are implemented and what remains intentionally route-specific.

Milestone 4 validates the slice. Success means focused tests, broad gates, docs lints, `git diff --check`, and desktop/mobile browser proof pass or any blocker is recorded with exact cause.

## Concrete Steps

Start from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Check the worktree and preserve unrelated changes:

    git status --short

Read required sources:

    sed -n '1,260p' DESIGN.md
    sed -n '1,320p' docs/design-docs/ui-design-library.md
    sed -n '1,180p' apps/web/AGENTS.md
    sed -n '1,220p' docs/ship-by-sunday/design-pack/AGENTS.md
    sed -n '1,220p' docs/ship-by-sunday/design-pack/surfaces/app-surface.md
    sed -n '1,220p' docs/programs/completed/2026-05-03-ui-design-system-alignment/planning-brief-3.md

Inventory geometry and spacing:

    rg -n "size=\"(icon-sm|icon-xs|icon|lg|sm)\"|h-14|h-16|h-11|h-12|size-10|rounded-2xl|rounded-3xl|rounded-4xl|rounded-full|p-6|px-6|py-6|gap-8|gap-10|space-y-8|space-y-10" apps/web/app apps/web/components -S

Inspect the shared primitives:

    sed -n '1,220p' apps/web/components/ui/button.tsx
    sed -n '1,160p' apps/web/components/ui/input.tsx
    sed -n '1,160p' apps/web/components/ui/textarea.tsx
    sed -n '1,180p' apps/web/components/ui/card.tsx
    sed -n '1,180p' apps/web/components/ui/item.tsx
    sed -n '240,510p' apps/web/components/ui/sidebar.tsx

Patch with `apply_patch`. Keep edits constrained to the smallest primitive or shell changes needed to satisfy the documented ladder.

After implementation, run the test commands below.

For browser proof, prefer a fresh build-backed server if an existing dev server is stale:

    bun run --cwd apps/web start -- -p 3002

Check reachable desktop and mobile routes such as `/sign-in` and `/checkout/success?fixture=ready`. If protected `/settings` redirects to `/sign-in`, record that auth blocker instead of claiming protected visual proof.

## Validation and Acceptance

The implementation is acceptable when reusable controls that were clear drift align with the documented visual size ladder, app spacing docs reflect the implemented state, homepage/editorial exceptions remain untouched, and tests plus browser proof show reachable routes remain readable and tappable on desktop and mobile.

Acceptance does not require every large homepage CTA, docs pill, blog nav item, or route-specific card to match compact app UI. Those surfaces need separate judgment.

### Test Commands

Run these from the repo root:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-03-control-geometry-spacing-alignment.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-03-control-geometry-spacing-alignment.md docs/programs/completed/2026-05-03-ui-design-system-alignment docs/design-docs/ui-design-library.md DESIGN.md
    bun run format
    bun lint
    bun typecheck
    git diff --check

Focused UI checks:

    bun run --cwd apps/web vitest run --project unit tests/unit/settings-page.test.tsx tests/unit/access-required-page.test.tsx tests/unit/sign-in-route.test.ts tests/unit/sign-up-route.test.ts --project integration-ui tests/integration-ui/access-required-page.test.tsx tests/integration-ui/sign-in-page.test.tsx tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx
    bun run --cwd apps/web test:integration:ui

## Idempotence and Recovery

Shared primitive class changes are additive and safe to rerun. If a visual proof shows a high-value control became too small on mobile, prefer adding a route-level or shell-level tap-area wrapper where the mobile interaction needs it instead of undoing the documented desktop control ladder.

If a validation command fails because of pre-existing changes from another slice, record the exact command and output before deciding whether it belongs to this slice. Do not revert unrelated user changes.

If browser proof is blocked by auth, Clerk, Convex, or a stale dev server, record the blocker and use reachable routes plus focused tests for touched protected surfaces.

## Artifacts and Notes

Initial inventory categories:

    Shared primitive drift: Button large is currently 36px rather than 40px; Button icon-sm is currently 32px rather than 28px.
    Shared primitive near-match: Button default and icon default are already 32px; input default is 32px; shared card radius is rounded-xl.
    Mobile/input exception: input and textarea use text-base on mobile and md:text-sm to avoid iOS zoom while keeping desktop density.
    Intentional larger surface exceptions: homepage hero/pricing CTAs, blog/docs chrome, error screens, and named homepage editorial sections.
    Route-specific review needed: codebase/review and course surfaces have some large panels and button overrides that need route-level judgment rather than a shared primitive rewrite.

Record implementation proof here as the slice proceeds.

Implementation patch:

    apps/web/components/ui/button.tsx now maps sm/default/lg to 28px/32px/40px, maps icon-xs/icon-sm/icon to 24px/28px/32px, uses 13px compact button text, and keeps default button geometry unchanged.
    apps/web/app/(workspace)/review/_components/codebase-review-handoff-card.tsx now uses rounded-2xl, tighter padding, compact app heading/body scale, and the shared lg button geometry instead of a 56px CTA override.
    apps/web/app/(workspace)/review/_components/codebase-review-page.tsx reduces the review page vertical stack from 48px to 32px and bottom padding from 80px to 64px.
    apps/web/app/(workspace)/_components/execute-ship/lesson-map-surface.tsx now uses rounded-2xl and 20px/24px padding instead of a 28px radius with larger padding.
    apps/web/app/(workspace)/_components/access-required/access-required-shell.tsx now uses 32px major spacing and a 40px desktop split gap instead of repeated 40px/48px gaps.
    DESIGN.md and docs/design-docs/ui-design-library.md document the implemented button ladder, operational panel radius rule, and access-state spacing baseline.

Validation proof:

    bun run format
    bun run format:check
    bun lint
    bun typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-03-control-geometry-spacing-alignment.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-03-control-geometry-spacing-alignment.md docs/programs/completed/2026-05-03-ui-design-system-alignment docs/design-docs/ui-design-library.md DESIGN.md
    bun run --cwd apps/web vitest run --project unit tests/unit/settings-page.test.tsx tests/unit/access-required-page.test.tsx tests/unit/sign-in-route.test.ts tests/unit/sign-up-route.test.ts --project integration-ui tests/integration-ui/access-required-page.test.tsx tests/integration-ui/sign-in-page.test.tsx tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx
    bun run --cwd apps/web test:integration:ui
    git diff --check

All listed commands passed. The focused Vitest run passed 8 files and 42 tests. The final full integration UI suite passed 27 files and 117 tests. `bun typecheck` completed the serialized Next production build and TypeScript pass.

During validation, the first focused run exposed stale auth-route expectations from the checkout-email handoff branch. `apps/web/tests/unit/sign-up-route.test.ts`, `apps/web/tests/integration-ui/checkout-success-view.test.tsx`, `apps/web/tests/integration-ui/checkout-success-view.interactions.test.tsx`, and `apps/web/tests/integration-ui/sign-in-page.test.tsx` were updated to match the existing email-handoff route contract. A transient `bun typecheck` failure also exposed the active branch's missing checkout-email handoff view-model branch; the file already contained the branch by the time it was re-read, and the final typecheck passed after the stale tests were repaired.

Browser proof used a fresh `next start` server on `http://localhost:3002`. Desktop `1440x900` and mobile `390x844` light proof on `/sign-in` showed no horizontal overflow, `main` tracking as `normal`, the Home small button at `28px`, and the default Sign in button at `32px`. Desktop dark proof on `/checkout/success` showed no horizontal overflow, `main` tracking as `normal`, and the primary checkout button at `32px`. Mobile dark proof on `/checkout/cancel` showed no horizontal overflow, `main` tracking as `normal`, and the primary checkout button at `32px`. Direct `/access-required` browser access redirected to sign-in under local auth, so protected access/review rendering is covered by the focused integration tests rather than claimed as direct browser proof.

## Interfaces and Dependencies

This plan depends on Tailwind utilities, `class-variance-authority`, `apps/web/components/ui/button.tsx`, shared UI primitives under `apps/web/components/ui/`, app shell surfaces under `apps/web/app/(workspace)/`, root `DESIGN.md`, `docs/design-docs/ui-design-library.md`, and the owning Program packet under `docs/programs/completed/2026-05-03-ui-design-system-alignment/`.

Do not add dependencies. Do not change external provider setup. Do not change routing, auth, checkout, entitlement, or Convex behavior.
