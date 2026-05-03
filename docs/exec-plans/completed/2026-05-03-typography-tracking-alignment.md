---
title: Typography Tracking Alignment
status: complete
created_at: 2026-05-03
completed_at: 2026-05-03
summary: Align inherited operational UI letter spacing with the screenshot-grounded typography library while preserving homepage and editorial type exceptions.
post_build_recap: Operational app, identity, access-required, and checkout shell boundaries now apply normal tracking; design docs record the rule and explicit typography exceptions, with focused tests, broad gates, and browser proof passing.
program_id: ui-design-system-alignment
planning_brief: docs/programs/completed/2026-05-03-ui-design-system-alignment/planning-brief-2.md
read_when:
  - Reviewing the finished typography and tracking slice.
  - Changing app shell, identity, checkout, or access-required typography.
  - Deciding whether tracking utilities are drift or intentional exceptions.
---

# Typography Tracking Alignment

This is a living execution plan. Update it at every stopping point so the next contributor can resume from this file alone.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday operational UI should read like a compact desktop tool, not like a marketing page with globally tightened copy. The design library says app UI letter spacing should be `0`, but `apps/web/app/globals.css` still applies negative tracking to `body`, which makes ordinary controls, forms, panels, and route copy inherit a display treatment unless a component overrides it.

After this plan, the main operational shell boundaries apply normal tracking while homepage, blog, docs, wordmark, code, number, and explicitly art-directed typography remain preserved. A reviewer should be able to inspect reachable app-adjacent routes and see inherited text tracking resolve to `normal`, with durable docs no longer contradicting that rule.

## Progress

- [x] 2026-05-03: Created this ExecPlan from `docs/programs/completed/2026-05-03-ui-design-system-alignment/planning-brief-2.md`.
- [x] 2026-05-03: Inventory typography and tracking usage and classify operational drift versus intentional exceptions.
- [x] 2026-05-03: Patch operational shell boundaries to use normal tracking.
- [x] 2026-05-03: Reconcile root `DESIGN.md`, the design library, and Program docs.
- [x] 2026-05-03: Run focused checks, broad gates, and desktop/mobile browser proof.

## Surprises & Discoveries

Initial inventory found the systemic tracking drift in `apps/web/app/globals.css`, where `body` applies `letter-spacing: -0.02em`. The same file already resets code-like text to `0`, applies `-0.04em` for `.font-heading-serif`, keeps `.font-home-option-serif` at `0`, and applies `-0.02em` for `.font-home-inter`.

The typography inventory also found many explicit tracking utilities. Those are mixed: wordmarks and all-caps metadata often intentionally use wider tracking, while some app headings use `tracking-tight`. The first implementation should not mass-rewrite explicit utilities because that would become a route-by-route typography redesign.

The current app has clear shell boundaries for protected workspace UI, identity UI, access-required UI, checkout success UI, and checkout cancel UI. Those boundaries can absorb the first normal-tracking reset without changing the named custom homepage editorial files.

## Decision Log

Decision: Keep the first typography slice focused on inherited tracking.
Rationale: Removing inherited negative tracking from operational shell boundaries fixes a systemic readability issue without turning the slice into a full font-size and heading redesign.
Date: 2026-05-03

Decision: Do not remove the global `body` tracking rule in this slice.
Rationale: Global removal would indirectly restyle public homepage and editorial surfaces, including the named custom sections Parker asked not to normalize. Shell-boundary resets are the safer first patch.
Date: 2026-05-03

Decision: Preserve explicit tracking utilities unless a touched shell boundary proves them wrong.
Rationale: Explicit tracking often marks wordmarks, all-caps labels, mono metadata, keyboard shortcuts, or editorial headings. Those need separate route-level judgment.
Date: 2026-05-03

## Outcomes & Retrospective

This plan completed the inherited tracking reset for operational UI without removing the global body rule. `apps/web/app/(workspace)/_components/app-shell.tsx`, `apps/web/app/(workspace)/_components/access-required/access-required-page.tsx`, `apps/web/app/(identity)/layout.tsx`, `apps/web/app/checkout/success/_components/checkout-success-view-surface.tsx`, and `apps/web/app/checkout/cancel/page.tsx` now apply `tracking-normal` at their shell roots.

Root `DESIGN.md` now says operational app, identity, checkout, and access-required UI use normal tracking at shell boundaries, and `docs/design-docs/ui-design-library.md` records the implementation rule and explicit exceptions. The global `body` negative tracking remains in place for now so this slice does not indirectly restyle homepage and editorial surfaces.

Remaining typography work is intentionally deferred. Some operational headings still use explicit `tracking-tight` and some surfaces use arbitrary text sizes such as `text-[13.5px]`; those require route-level typography judgment rather than a global inherited-tracking fix.

## Context and Orientation

The detailed typography target is `docs/design-docs/ui-design-library.md`. It defines default app text as `14px` with `20px` line height and says operational UI letter spacing should be `0`. Root `DESIGN.md` is the high-level design source and currently contains an older rule saying Inter UI text uses `-0.02em` globally. This slice must reconcile that contradiction.

The implementation source for inherited tracking is `apps/web/app/globals.css`. The `body` rule sets the global font family, default text size, and current negative letter spacing. The same file owns utility classes for the wordmark, heading serif, home option serif, number font, and home Inter typography.

Protected workspace routes render through `apps/web/app/(workspace)/_components/app-shell.tsx` when the user has access. Users without access render `apps/web/app/(workspace)/_components/access-required/access-required-page.tsx`. Identity routes render through `apps/web/app/(identity)/layout.tsx`. Checkout success renders through `apps/web/app/checkout/success/_components/checkout-success-view-surface.tsx`. Checkout cancel renders directly in `apps/web/app/checkout/cancel/page.tsx`.

Hard homepage exclusions remain unchanged from the Program: do not edit or indirectly normalize the custom typography or graphics for `Install leverage` / `the loop repeats TOMORROW`, `Exec Loops: OpenAI's WEAPON of choice`, or worker/how-workers-work sections.

### In Scope

Patch shell-boundary classes for workspace, identity, access-required, and checkout handoff/cancel UI so ordinary inherited app text uses normal tracking. Update root `DESIGN.md`, `docs/design-docs/ui-design-library.md` if needed, this ExecPlan, and the owning Program. Run focused tests and browser proof for reachable routes.

### Out Of Scope

Do not change homepage custom graphics, homepage custom type treatments, docs article typography, blog typography, generated preview/demo typography, route behavior, auth behavior, checkout behavior, entitlement logic, Convex data, provider setup, dependencies, copy, or customer generated docs. Do not normalize every explicit `tracking-tight`, `tracking-wide`, or arbitrary `text-[...]` class in one pass.

## Plan of Work

Start by confirming the Program brief, design library, root design source, app owner instructions, and typography inventory. Classify the tracking findings as inherited operational drift, explicit app typography to review later, intentional wordmark or all-caps label tracking, code or number typography, homepage/editorial exception, docs/blog editorial exception, or generated preview/demo typography.

Patch the operational shell boundaries with Tailwind `tracking-normal`. The expected files are `apps/web/app/(workspace)/_components/app-shell.tsx`, `apps/web/app/(workspace)/_components/access-required/access-required-page.tsx`, `apps/web/app/(identity)/layout.tsx`, `apps/web/app/checkout/success/_components/checkout-success-view-surface.tsx`, and `apps/web/app/checkout/cancel/page.tsx`. Keep the patch to inherited tracking only.

Reconcile documentation after the code proves the boundary. Update root `DESIGN.md` so UI body type uses normal tracking in operational surfaces while explicit editorial, heading, wordmark, code, number, and homepage utilities remain allowed. Update `docs/design-docs/ui-design-library.md` implementation notes if a durable shell-boundary rule is added. Update the Program so the active next slice points at this ExecPlan while it is active and then moves on after completion.

Finally, run focused checks, broad gates, and browser proof. Because protected `/settings` may redirect without local auth, use reachable identity and checkout fixture routes for direct browser proof and rely on integration tests for protected workspace rendering when auth blocks visual access.

## Milestones

Milestone 1 inventories typography usage and records the classification in this plan. Success means a later contributor can tell why global inherited tracking is being patched at shell boundaries instead of removed from `body`.

Milestone 2 applies normal tracking to operational shell boundaries. Success means the touched shells still render the same structure, but inherited ordinary text resolves to `letter-spacing: normal`.

Milestone 3 reconciles docs. Success means root `DESIGN.md`, `docs/design-docs/ui-design-library.md`, this ExecPlan, and the Program no longer contradict the implementation rule.

Milestone 4 validates the slice. Success means focused tests, broad gates, docs lints, `git diff --check`, and desktop/mobile browser proof pass or any blocker is recorded with exact cause.

## Concrete Steps

Start from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Check the worktree and preserve unrelated changes:

    git status --short

Read required sources:

    sed -n '1,220p' DESIGN.md
    sed -n '1,220p' docs/design-docs/ui-design-library.md
    sed -n '1,180p' apps/web/AGENTS.md
    sed -n '1,180p' docs/ship-by-sunday/design-pack/AGENTS.md
    sed -n '1,180p' docs/programs/completed/2026-05-03-ui-design-system-alignment/planning-brief-2.md

Inventory typography and tracking:

    rg -n "letter-spacing|tracking-\[|tracking-(tighter|tight|normal|wide|wider|widest)|text-\[[0-9.]+(px|rem)|text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)" apps/web/app apps/web/components apps/web/lib -S

Inspect the expected shell boundaries:

    sed -n '1,230p' 'apps/web/app/(workspace)/_components/app-shell.tsx'
    sed -n '1,120p' 'apps/web/app/(workspace)/_components/access-required/access-required-page.tsx'
    sed -n '1,120p' 'apps/web/app/(identity)/layout.tsx'
    sed -n '1,120p' apps/web/app/checkout/success/_components/checkout-success-view-surface.tsx
    sed -n '1,120p' apps/web/app/checkout/cancel/page.tsx

Patch with `apply_patch`. Use only shell-boundary `tracking-normal` changes unless the inventory proves another narrow edit is required.

After implementation, run the test commands below.

For browser proof, prefer a fresh build-backed server if an existing dev server is stale:

    bun run --cwd apps/web start -- -p 3002

Check reachable desktop and mobile routes such as `/sign-in` and `/checkout/success?fixture=ready`. If protected `/settings` redirects to `/sign-in`, record that auth blocker instead of claiming protected visual proof.

## Validation and Acceptance

The implementation is acceptable when operational shell roots apply normal tracking, docs agree on the inherited app tracking rule, homepage/editorial exceptions remain preserved, and tests plus browser proof show reachable app-adjacent UI renders without overflow or theme regressions.

Acceptance is not "every explicit tracking class is gone." Explicit tracking remains allowed for wordmarks, uppercase labels, mono metadata, editorial headings, docs/blog typography, homepage art direction, and generated previews. Acceptance is that ordinary app UI no longer inherits global negative tracking by accident.

### Test Commands

Run these from the repo root:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-03-typography-tracking-alignment.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-03-typography-tracking-alignment.md docs/programs/completed/2026-05-03-ui-design-system-alignment docs/design-docs/ui-design-library.md DESIGN.md
    bun run format
    bun lint
    bun typecheck
    git diff --check

Focused UI checks:

    bun run --cwd apps/web vitest run --project unit tests/unit/settings-page.test.tsx tests/unit/access-required-page.test.tsx tests/unit/sign-in-route.test.ts tests/unit/sign-up-route.test.ts --project integration-ui tests/integration-ui/access-required-page.test.tsx tests/integration-ui/sign-in-page.test.tsx tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx
    bun run --cwd apps/web test:integration:ui

## Idempotence and Recovery

Shell-boundary `tracking-normal` changes are additive and safe to rerun. If a route looks visually wrong after the patch, remove the smallest shell-boundary class and record why that route needs a different explicit typography rule.

If a validation command fails because of pre-existing changes from another slice, record the exact command and output before deciding whether it belongs to this slice. Do not revert unrelated user changes.

If browser proof is blocked by auth, Clerk, Convex, or a stale dev server, record the blocker and use reachable routes plus focused tests for the touched protected surfaces.

## Artifacts and Notes

Initial inventory categories:

    Inherited operational drift: apps/web/app/globals.css body letter-spacing: -0.02em.
    Code and mono exception: globals.css resets code, kbd, pre, and samp to letter-spacing: 0.
    Heading/editorial exception: .font-heading-serif uses -0.04em.
    Homepage exception: .font-home-inter uses -0.02em and named homepage editorial sections remain out of scope.
    Wordmark exception: productWordmarkClassName and related brand labels use explicit wider tracking.
    App label exception: many uppercase labels and mono metadata use wide tracking intentionally.
    Explicit app heading drift: some operational headings use tracking-tight, but they are deferred to a later route-level typography pass.

Record implementation proof here as the slice proceeds.

Implementation patch:

    apps/web/app/(workspace)/_components/app-shell.tsx adds tracking-normal to all AppShell root class variants.
    apps/web/app/(workspace)/_components/access-required/access-required-page.tsx adds tracking-normal to the access-required main shell.
    apps/web/app/(identity)/layout.tsx adds tracking-normal to the identity main shell.
    apps/web/app/checkout/success/_components/checkout-success-view-surface.tsx adds tracking-normal to the checkout success main shell.
    apps/web/app/checkout/cancel/page.tsx adds tracking-normal to the checkout cancel main shell.
    DESIGN.md and docs/design-docs/ui-design-library.md now document normal operational shell tracking and explicit typography exceptions.

Validation proof:

    bun run format
    bun run format:check
    bun lint
    bun typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-03-typography-tracking-alignment.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-03-typography-tracking-alignment.md docs/programs/completed/2026-05-03-ui-design-system-alignment docs/design-docs/ui-design-library.md DESIGN.md
    bun run --cwd apps/web vitest run --project unit tests/unit/settings-page.test.tsx tests/unit/access-required-page.test.tsx tests/unit/sign-in-route.test.ts tests/unit/sign-up-route.test.ts --project integration-ui tests/integration-ui/access-required-page.test.tsx tests/integration-ui/sign-in-page.test.tsx tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx
    bun run --cwd apps/web test:integration:ui
    git diff --check

All listed commands passed. The focused Vitest run passed 8 files and 42 tests. The full integration UI suite passed 27 files and 113 tests. `bun typecheck` completed the serialized Next production build and TypeScript pass.

Browser proof used a fresh `next start` server on `http://localhost:3002`. Desktop `1440x900` light proof on `/sign-in` showed the identity shell `main` computes `letter-spacing: normal`, while `body` still computes the old negative tracking. Desktop dark proof on `/checkout/success` showed the checkout success shell `main` computes `letter-spacing: normal`. Mobile `390x844` proof on `/checkout/success` in dark mode and `/sign-in` in light mode showed no horizontal overflow and normal shell tracking. The only console warning was Clerk's expected development-key warning.

## Interfaces and Dependencies

This plan depends on Tailwind utilities, `apps/web/app/globals.css`, app shell boundaries under `apps/web/app`, root `DESIGN.md`, `docs/design-docs/ui-design-library.md`, and the owning Program packet under `docs/programs/completed/2026-05-03-ui-design-system-alignment/`.

Do not add dependencies. Do not change external provider setup. Do not change routing, auth, checkout, entitlement, or Convex behavior.
