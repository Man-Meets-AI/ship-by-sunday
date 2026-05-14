---
title: T3 Code Structural Source Adoption
status: complete
created_at: 2026-05-14
completed_at: 2026-05-14
summary: Retire old UI doctrine as active guidance and prove the T3 Code app-shape migration by moving one route-local underscore implementation set into plain feature modules.
post_build_recap: Moved the Worker Seal Team 6 Cal booking component and logic from route-local underscore folders into plain `src/components/workerSealTeam6` modules, updated route/test imports, aligned app structure docs, and advanced the Program to the app foundation brief.
program_id: t3-code-source-design-system-port
planning_brief: docs/programs/active/2026-05-14-t3-code-source-design-system-port/planning-brief-2.md
read_when:
  - Resuming the first structural T3 Code migration proof.
  - Moving implementation out of apps/web underscore folders.
  - Checking why Next.js route groups are kept while underscore implementation folders are targeted.
---

# T3 Code Structural Source Adoption

This document is a living execution plan for the first structural proof in the T3 Code source migration.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The T3 Code migration is not only a visual token change. It should also move Ship by Sunday's browser app toward T3 Code's source shape: plain `src/components`, `src/hooks`, `src/lib`, and colocated logic/test modules instead of deep route-local underscore implementation folders. After this slice, the repo guidance points UI and structure work at the T3 Program, and one real public route dependency proves that a bounded underscore-folder migration can land without changing URLs or route groups.

The user-visible page stays `/worker-seal-team-6`. The implementation proof moves its Cal.com booking component and booking-config helper out of `apps/web/src/app/(marketing)/worker-seal-team-6/_components` and `_lib` into `apps/web/src/components/workerSealTeam6` with a colocated `.logic.ts` helper. Tests and imports prove the route still uses the same behavior.

## Progress

- [x] 2026-05-14: Read root `AGENTS.md`, `apps/web/AGENTS.md`, the active T3 Program, `planning-brief-2.md`, the structure map, `apps/web/ARCHITECTURE.md`, `apps/web/CONVENTIONS.md`, and `docs/exec-plans/PLANS.md`.
- [x] 2026-05-14: Chose the Worker Seal Team 6 Cal booking module as the first proof because it is bounded, public, already tested, and avoids auth, checkout, Stripe, Convex, and docs/blog pipelines.
- [x] 2026-05-14: Created this Program-linked child ExecPlan.
- [x] 2026-05-14: Moved the Cal booking component and config helper into `apps/web/src/components/workerSealTeam6`, updated the page and focused test imports, and removed the tracked route-local underscore files.
- [x] 2026-05-14: Updated `apps/web/ARCHITECTURE.md`, `apps/web/CONVENTIONS.md`, and the Program structure map so route-local underscore folders are migration inventory rather than current guidance.
- [x] 2026-05-14: Ran focused UI test, app lint, app typecheck/build, plan lint, Program lint, targeted markdown lint, and whitespace validation.
- [x] 2026-05-14: Added `planning-brief-3.md` for the app foundation slice and pointed `current-planning-brief.txt` at it.

## Surprises & Discoveries

The existing `apps/web/ARCHITECTURE.md` and `apps/web/CONVENTIONS.md` still allowed route-local `_components` folders, even after the active T3 Program made those folders migration inventory. This slice updated those two docs narrowly so they no longer invite new underscore implementation folders in migrated areas.

## Decision Log

Decision: Keep `(marketing)` and `/worker-seal-team-6` unchanged.
Rationale: The user clarified that Next.js route groups are not the problem. The target is underscore implementation folders, not framework route organization.
Date: 2026-05-14.

Decision: Move the Cal booking component and config into `apps/web/src/components/workerSealTeam6`.
Rationale: T3 Code keeps feature components under plain `src/components` directories and often colocates support logic beside components. This is a small proof with direct test coverage.
Date: 2026-05-14.

Decision: Put booking config in `WorkerSealTeam6CalBooking.logic.ts`.
Rationale: The helper is pure support logic for the booking component, and T3 Code uses `.logic.ts` files for component-adjacent behavior.
Date: 2026-05-14.

## Outcomes & Retrospective

This slice landed the first structural proof. `/worker-seal-team-6` keeps the same route group, URL, metadata, page copy, and Cal.com behavior, but its Cal booking implementation now lives in plain feature modules under `apps/web/src/components/workerSealTeam6`. The page imports `WorkerSealTeam6CalBooking` and `createWorkerSealTeam6CalBookingConfig` from those modules, and the focused integration UI test imports the component from the same plain component path.

The app structure docs now say historical route-local underscore folders are migration inventory during the T3 Code source migration. The parent Program records this child slice as completed and advances the current planning brief to app foundation work.

Validation passed:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-structural-source-adoption.md
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/worker-seal-team-6-cal-booking.test.tsx
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-structural-source-adoption.md docs/programs/active/2026-05-14-t3-code-source-design-system-port AGENTS.md apps/web/AGENTS.md apps/web/ARCHITECTURE.md apps/web/CONVENTIONS.md DESIGN.md docs/DESIGN.md docs/FRONTEND.md docs/index.md docs/ship-by-sunday/design-pack/AGENTS.md docs/ship-by-sunday/design-pack/README.md
    git diff --check

## Context and Orientation

The active Program is `docs/programs/active/2026-05-14-t3-code-source-design-system-port/program.md`. This completed plan was written from `planning-brief-2.md`, which says the migration should keep useful Next.js route groups while targeting `_components`, `_hooks`, `_lib`, `_server`, `_styles`, `_content`, `_fonts`, and `_metadata`. The Program pointer has since advanced to `planning-brief-3.md` for app foundation work.

The structural map is `docs/programs/active/2026-05-14-t3-code-source-design-system-port/structure-map-t3-code-to-ship-by-sunday.md`. It recommends moving reusable or cross-route UI toward `apps/web/src/components/<feature>` and colocating pure logic as `.logic.ts` when useful.

The proof route is `apps/web/src/app/(marketing)/worker-seal-team-6/page.tsx`. It now imports `WorkerSealTeam6CalBooking` from `@/components/workerSealTeam6/WorkerSealTeam6CalBooking` and `createWorkerSealTeam6CalBookingConfig` from `@/components/workerSealTeam6/WorkerSealTeam6CalBooking.logic`. The focused UI test is `apps/web/tests/integration-ui/worker-seal-team-6-cal-booking.test.tsx`.

### In Scope

Update the existing docs guidance that was already redirected in this Program slice. Move the Worker Seal Team 6 Cal booking component and config helper into a plain `apps/web/src/components/workerSealTeam6` feature directory. Update the page and test imports. Update this ExecPlan and the Program after validation.

### Out Of Scope

Do not remove `(marketing)`, `(auth)`, or `(app)`. Do not change the `/worker-seal-team-6` URL, metadata, copy, styling, Cal.com behavior, environment variables, webhook route, billing code, Convex code, generated repo output, Telegram widget, shared primitives, or global tokens in this slice. Do not do a repo-wide underscore cleanup.

## Plan of Work

First, create `apps/web/src/components/workerSealTeam6/WorkerSealTeam6CalBooking.tsx` from the current route-local booking component and `apps/web/src/components/workerSealTeam6/WorkerSealTeam6CalBooking.logic.ts` from the current config helper. Delete the old route-local files.

Next, update `apps/web/src/app/(marketing)/worker-seal-team-6/page.tsx` to import both exports from the new component feature directory. Update the focused integration UI test to import the component from the new path.

Then, run the focused integration UI test, app lint, app typecheck, plan lint, Program lint, markdown lint, and whitespace validation. If typecheck or lint exposes import-boundary issues, fix them inside this slice rather than adding compatibility re-exports under the old underscore folders.

Finally, update this ExecPlan's progress and outcomes and update the parent Program's progress, slice ledger, and next slice so the next Program step is app foundation rather than repeating the structural proof.

## Milestones

Milestone 1 creates the child plan and confirms the proof target. Success means this ExecPlan exists, names the exact files, and records that Next route groups are preserved while underscore implementation folders are targeted.

Milestone 2 moves the Worker Seal Team 6 booking implementation. Success means the old `_components` and `_lib` imports are gone for this route, the new files live under `apps/web/src/components/workerSealTeam6`, and the route still imports the same behavior without URL or copy changes.

Milestone 3 validates and records the slice. Success means focused tests and static checks pass, the Program records this child plan, and the next planning brief points at the app foundation slice.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Validate the plan:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-structural-source-adoption.md

Run the focused UI test after moving imports:

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/worker-seal-team-6-cal-booking.test.tsx

Run app static checks:

    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck

Run Program, docs, and whitespace checks:

    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-structural-source-adoption.md docs/programs/active/2026-05-14-t3-code-source-design-system-port AGENTS.md apps/web/AGENTS.md apps/web/ARCHITECTURE.md apps/web/CONVENTIONS.md DESIGN.md docs/DESIGN.md docs/FRONTEND.md docs/index.md docs/ship-by-sunday/design-pack/AGENTS.md docs/ship-by-sunday/design-pack/README.md
    git diff --check

## Validation and Acceptance

Acceptance requires `/worker-seal-team-6` to keep the same public route and page behavior while its Cal.com booking implementation no longer lives in route-local underscore folders. The test for the booking component should still prove direct scheduling fallback, embed script loading, hosted booking fallback, and direct backup link behavior.

Acceptance also requires the Program to identify this child slice and point the next slice toward app foundation work.

The test brief for this slice is: Feature: structural source proof for Worker Seal Team 6 booking implementation. Risk: P3 because the route behavior and UI are unchanged, but the route import path is user-facing public marketing infrastructure. Source of truth: the route imports, the component test, and TypeScript route compilation. Must work: direct fallback, Cal embed setup, hosted booking fallback, public route import. Must fail safely: old underscore paths must not linger as compatibility shims for this proof. Tests: focused integration UI, app lint, app typecheck, plan lint, Program lint, markdown lint, whitespace validation. CI gate: app lint/typecheck plus focused integration UI.

### Test Commands

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-structural-source-adoption.md
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/worker-seal-team-6-cal-booking.test.tsx
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-structural-source-adoption.md docs/programs/active/2026-05-14-t3-code-source-design-system-port AGENTS.md apps/web/AGENTS.md apps/web/ARCHITECTURE.md apps/web/CONVENTIONS.md DESIGN.md docs/DESIGN.md docs/FRONTEND.md docs/index.md docs/ship-by-sunday/design-pack/AGENTS.md docs/ship-by-sunday/design-pack/README.md
    git diff --check

## Idempotence and Recovery

This is a file move and import update. If a moved file breaks unexpectedly, move only this feature module back or add a short-lived import update in the route while preserving public route behavior. Do not reintroduce a permanent compatibility re-export under the old underscore path unless validation proves an external import cannot be updated in this slice.

The old route-local directories should become empty and can disappear from Git automatically after tracked files move out. If a test imports the old path, update the test to the new source path rather than preserving the old path.

## Artifacts and Notes

Moved files:

    apps/web/src/app/(marketing)/worker-seal-team-6/_components/worker-seal-team-6-cal-booking.tsx
    apps/web/src/app/(marketing)/worker-seal-team-6/_lib/worker-seal-team-6-cal-config.ts

New files:

    apps/web/src/components/workerSealTeam6/WorkerSealTeam6CalBooking.tsx
    apps/web/src/components/workerSealTeam6/WorkerSealTeam6CalBooking.logic.ts

Focused test:

    apps/web/tests/integration-ui/worker-seal-team-6-cal-booking.test.tsx

## Interfaces and Dependencies

`apps/web/src/app/(marketing)/worker-seal-team-6/page.tsx` remains the Next.js route entry. It should stay a thin route adapter importing feature implementation from plain source modules.

`apps/web/src/components/workerSealTeam6/WorkerSealTeam6CalBooking.tsx` is a client component because it loads the Cal.com embed script in a browser effect.

`apps/web/src/components/workerSealTeam6/WorkerSealTeam6CalBooking.logic.ts` is pure configuration logic that normalizes Cal.com environment values for the route.
