---
title: T3 Code Display Primitives
status: complete
created_at: 2026-05-14
completed_at: 2026-05-14
summary: Move Card, Alert, Skeleton, and Kbd toward T3 Code class recipes while preserving current call-site APIs.
post_build_recap: Card, Alert, Skeleton, and Kbd now use T3 Code display recipes with compatibility aliases and focused render plus browser proof.
program_id: t3-code-source-design-system-port
planning_brief: docs/programs/active/2026-05-14-t3-code-source-design-system-port/planning-brief-4.md
read_when:
  - Resuming the display primitive slice of the T3 Code migration.
  - Reviewing Card, Alert, Skeleton, or Kbd compatibility during the T3 Code migration.
  - Validating low-state shared primitives before broader Base UI adoption.
---

# T3 Code Display Primitives

This document is a living execution plan for the next shared primitive slice of the T3 Code source design-system port.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The app foundation and Button/Badge slice moved the common action surfaces onto T3 Code tokens and recipes. The next safe primitive family is display chrome: `Card`, `Alert`, `Skeleton`, and `Kbd`. These primitives appear across marketing, checkout, admin, protected app, course, and codebase-flow screens, but they do not require a Base UI state machine. This slice copies T3 Code's class recipes and exported component shape where possible while preserving current Ship by Sunday call-site variants and exports.

## Progress

- [x] 2026-05-14: Read planning brief 4, current Program state, T3 Code display primitive sources, current display primitive sources, and current call-site usage.
- [x] 2026-05-14: Port Card, Alert, Skeleton, and Kbd recipes with compatibility adapters.
- [x] 2026-05-14: Add focused render tests that prove T3 Code tokens/classes and compatibility behavior.
- [x] 2026-05-14: Run focused tests, app lint/typecheck, Program/plan/docs checks, whitespace checks, and representative browser proof.

## Surprises & Discoveries

T3 Code's `Card` exports `CardPanel` and aliases it as `CardContent`, with `data-slot="card-panel"`. Current Ship by Sunday call sites import `CardContent` and do not appear to target `data-slot="card-content"` outside the primitive, so the alias can move to the T3 slot while preserving the import name.

Current `Alert` call sites use `variant="destructive"`, while T3 Code names the destructive status `error`. This slice should keep `destructive` as an alias to the T3 Code error recipe so route call sites do not need a bulk update.

The initially chosen `/starter` browser surface rendered shared Buttons but no shared Cards. The card proof moved to `/checkout/cancel/confirmed`, which is public, static, and renders shared Card and Button instances without needing authenticated state.

## Decision Log

Decision: Port these display primitives without adding `@base-ui/react`.
Rationale: T3 Code uses `useRender` for `Card`, but these primitives do not need Base UI behavior. Copying the recipes into simple React components gives the visual source of truth without introducing dependency and API churn.
Date: 2026-05-14

Decision: Preserve existing import names and destructive Alert variant.
Rationale: `CardContent` and `variant="destructive"` are already used across risky app and checkout surfaces. Keeping aliases confines this slice to primitive visual behavior.
Date: 2026-05-14

## Outcomes & Retrospective

This slice moved `apps/web/src/components/ui/card.tsx`, `alert.tsx`, `skeleton.tsx`, and `kbd.tsx` onto T3 Code display primitive recipes while preserving current call-site compatibility. `Card` now uses T3 Code's rounded bordered surface with before-shadow treatment, `CardFrame` exports are available, and `CardContent` remains available as an alias for the T3 `CardPanel` slot. `Alert` now exposes T3 Code status treatments for `error`, `info`, `success`, and `warning`, while `destructive` remains an alias for existing call sites. `Skeleton` uses T3 Code's shimmer animation and globals now include the matching `--animate-skeleton` keyframe token. `Kbd` and `KbdGroup` now match T3 Code's compact keyboard recipe.

Focused render tests prove the T3-only class tokens and compatibility aliases. Browser proof on public pages proved the shared Card and Button surfaces render without horizontal overflow on desktop and mobile.

## Context and Orientation

Source files:

    /Users/bazelrex/Developer/t3code/apps/web/src/components/ui/card.tsx
    /Users/bazelrex/Developer/t3code/apps/web/src/components/ui/alert.tsx
    /Users/bazelrex/Developer/t3code/apps/web/src/components/ui/skeleton.tsx
    /Users/bazelrex/Developer/t3code/apps/web/src/components/ui/kbd.tsx

Target files:

    apps/web/src/components/ui/card.tsx
    apps/web/src/components/ui/alert.tsx
    apps/web/src/components/ui/skeleton.tsx
    apps/web/src/components/ui/kbd.tsx
    apps/web/tests/unit/ui-display-primitives.test.tsx

### In Scope

This plan updates only `Card`, `Alert`, `Skeleton`, and `Kbd` primitive classes, exports, compatibility aliases, and focused render tests. It may add `CardFrame`, `CardFrameHeader`, `CardFrameTitle`, `CardFrameDescription`, `CardFrameFooter`, and `CardPanel` exports because those are part of T3 Code's Card source.

### Out Of Scope

This plan does not change inputs, textareas, dialogs, sheets, menus, command surfaces, route shells, generated-codebase primitives, Telegram widget CSS, auth behavior, checkout behavior, or any Convex-backed data flow.

## Plan of Work

First, update `Card` to use T3 Code's bordered, rounded, before-shadow card recipe and add T3 Code's `CardFrame` family. Preserve the existing `CardContent` export by aliasing or wrapping the T3 `CardPanel` implementation.

Second, update `Alert` to use T3 Code's compact status recipe, adding `error`, `info`, `success`, and `warning` variants while preserving `destructive` as an alias.

Third, update `Skeleton` and `Kbd` to use T3 Code's shimmer and keyboard recipes. Keep `KbdGroup` available.

Fourth, add focused server-render tests under `apps/web/tests/unit` that prove the T3-only class tokens, compatibility aliases, and current destructive alert variant.

Fifth, run focused unit tests, app lint/typecheck, plan/program/docs lint, whitespace checks, and a representative browser smoke on `/starter` because that route renders shared cards.

## Milestones

Milestone 1 creates this child ExecPlan and validates it with `plans:lint`.

Milestone 2 updates the four display primitives. Success means existing call-site imports still compile and the T3 recipes are present.

Milestone 3 adds focused primitive tests. Success means server-render tests prove card, alert, skeleton, and kbd recipe adoption plus compatibility aliases.

Milestone 4 validates and records completion. Success means focused tests, app lint/typecheck, plan/program/docs lint, browser proof, and `git diff --check` pass, then the plan moves to `docs/exec-plans/completed/` and the Program ledger names the next primitive follow-up.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Validate this plan before implementation:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-display-primitives.md

Edit:

    apps/web/src/components/ui/card.tsx
    apps/web/src/components/ui/alert.tsx
    apps/web/src/components/ui/skeleton.tsx
    apps/web/src/components/ui/kbd.tsx
    apps/web/tests/unit/ui-display-primitives.test.tsx

Run focused validation:

    bun run --cwd apps/web test:unit -- tests/unit/ui-display-primitives.test.tsx

Run static validation:

    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-display-primitives.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-display-primitives.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    git diff --check

If the plan is completed and moved, rerun plan lint against the completed path.

## Validation and Acceptance

Acceptance requires these primitives to expose T3 Code recipes while existing call sites using `CardContent`, `Alert variant="destructive"`, `Skeleton className`, and `KbdGroup` still typecheck. Focused tests must prove at least one T3-only class token on each primitive, `CardContent` renders the T3 panel slot, `destructive` maps to the T3 error treatment, and `CardFrame` exports render.

### Test Commands

Run these commands from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run --cwd apps/web test:unit -- tests/unit/ui-display-primitives.test.tsx
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-display-primitives.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-display-primitives.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    git diff --check

## Idempotence and Recovery

The primitive edits are local and deterministic. If a T3 selector does not compile in this app, replace only that selector with the closest Tailwind-supported equivalent and record it in the Decision Log. If a call-site type breaks, preserve the existing public prop value instead of changing route call sites. Do not add dependencies in this slice.

## Artifacts and Notes

No package or lockfile change was needed.

Validation completed on 2026-05-14:

    bun run --cwd apps/web test:unit -- tests/unit/ui-display-primitives.test.tsx
    1 file passed, 4 tests passed.

    bun run --cwd apps/web test:unit -- tests/unit/ui-button-badge-primitives.test.tsx tests/unit/ui-display-primitives.test.tsx
    2 files passed, 8 tests passed.

    bun run --cwd apps/web lint
    Found 0 warnings and 0 errors.

    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    Next.js production build compiled, typechecked, and generated 103 static pages.

    Browser proof through the webpack dev server:
    `/starter` at 1440x1000 rendered four shared Button instances with T3 Button surface treatment and no horizontal overflow.
    `/checkout/cancel/confirmed` at 1440x1000 and 390x844 rendered one shared Card and two shared Button instances with T3 Card/Button surface treatment and no horizontal overflow.

## Interfaces and Dependencies

This slice depends on `class-variance-authority`, `tailwind-merge` through `cn`, Tailwind CSS v4 selector support, and the T3 Code token foundation now present in `apps/web/src/app/globals.css`. It deliberately avoids the Base UI `useRender` interface until a later primitive adapter slice.
