---
title: T3 Code Button Badge Primitives
status: complete
created_at: 2026-05-14
completed_at: 2026-05-14
summary: Move the shared Button and Badge primitives toward T3 Code class recipes while preserving current call-site APIs.
post_build_recap: Button and Badge now use T3 Code class recipes while preserving Radix asChild compatibility, current variants, current sizes, and focused render proof.
program_id: t3-code-source-design-system-port
planning_brief: docs/programs/active/2026-05-14-t3-code-source-design-system-port/planning-brief-4.md
read_when:
  - Resuming the first shared primitive migration slice.
  - Reviewing Button or Badge compatibility during the T3 Code migration.
  - Validating primitive changes before broader Base UI adoption.
---

# T3 Code Button Badge Primitives

This document is a living execution plan for the first shared primitive slice of the T3 Code source design-system port.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday's shared `Button` and `Badge` primitives are used across public marketing, auth, checkout, protected app, admin, worker, course, and codebase-flow screens. After the app foundation landed, these primitives should stop using the old Ship by Sunday neutral/shadcn class recipes and start using T3 Code's compact `base-mira` treatment. This slice makes that first visible primitive move while preserving the current `asChild`, `variant`, and `size` API shape so existing routes continue to compile and behave.

## Progress

- [x] 2026-05-14: Read planning brief 4, T3 Code `components.json`, T3 Code `button.tsx` and `badge.tsx`, current `apps/web` `button.tsx` and `badge.tsx`, and current call-site usage.
- [x] 2026-05-14: Copy T3 Code Button and Badge class recipes into the current primitives with compatibility adapters.
- [x] 2026-05-14: Add focused render tests that prove T3 Code tokens/classes and compatibility behavior.
- [x] 2026-05-14: Run focused tests, app lint/typecheck, Program/plan/docs checks, whitespace checks, and desktop/mobile `/starter` browser proof.

## Surprises & Discoveries

T3 Code's Button and Badge use Base UI `render` and `useRender`, but their value for this first slice is mostly the class recipe, size scale, state selectors, focus treatment, and status variants. Ship by Sunday still has many Radix `asChild` call sites, so this slice should keep `Slot.Root` and not add `@base-ui/react`.

Current app call sites use Button variants `default`, `outline`, `secondary`, `ghost`, `destructive`, and `link`; sizes `default`, `sm`, `lg`, `icon-xs`, `icon-sm`, and `icon`. Current Badge call sites use `default`, `secondary`, and `outline`. Adding T3 Code's extra sizes and status variants is safe if the existing values remain.

The first lint run failed because the focused test used an internal `/starter` anchor to prove `asChild`; `eslint-plugin-next(no-html-link-for-pages)` correctly requires `next/link` for internal navigation. The test now uses `https://example.com` because it is only proving Slot anchor composition, not app navigation.

## Decision Log

Decision: Port Button and Badge recipes without adding Base UI in this slice.
Rationale: The user wants the T3 Code look. Copying the class recipes provides immediate visual alignment while avoiding a dependency and API migration that belongs to a broader primitive adapter slice.
Date: 2026-05-14

Decision: Preserve `asChild` and existing variant names.
Rationale: Many existing call sites rely on Radix Slot composition with Next links and buttons. Breaking those call sites would widen this first primitive slice into a route migration.
Date: 2026-05-14

## Outcomes & Retrospective

This slice moved the shared `Button` and `Badge` primitives toward the T3 Code source without adding `@base-ui/react`. `apps/web/src/components/ui/button.tsx` now uses T3 Code's dense Button base recipe, focus-ring offset, inset-shadow treatment, icon sizing, `destructive-outline` variant, and expanded size scale while preserving Radix `asChild`, existing variant names, existing size names, and a safe `type="button"` default for real buttons. `apps/web/src/components/ui/badge.tsx` now uses T3 Code's Badge recipe, compact radius, pointer-coarse hit area rules for button/anchor badges, size variants, and `error`, `info`, `success`, and `warning` status variants while preserving existing call-site variants.

The focused render test proves the T3 class tokens and compatibility behavior. The next primitive pass should continue with Card, Input, Textarea, Alert, or a deliberate Base UI adapter decision for heavier primitives.

## Context and Orientation

The source files are `/Users/bazelrex/Developer/t3code/apps/web/src/components/ui/button.tsx` and `/Users/bazelrex/Developer/t3code/apps/web/src/components/ui/badge.tsx`. T3 Code imports Base UI helpers, but the class recipes are plain `class-variance-authority` definitions using the tokens already installed by the app foundation slice.

The target files are `apps/web/src/components/ui/button.tsx` and `apps/web/src/components/ui/badge.tsx`. Both currently import `Slot` from `radix-ui` to support `asChild`. The app already depends on `class-variance-authority`, `tailwind-merge`, and `radix-ui`, so no dependency or lockfile change is needed for this slice.

### In Scope

This plan updates only `Button` and `Badge` primitive class recipes, props, compatibility defaults, and focused primitive tests. It adds T3 Code Button sizes `xs`, `xl`, `icon-lg`, `icon-xl`, and T3 Code Badge sizes `sm`, `default`, and `lg`, plus Badge status variants `error`, `info`, `success`, and `warning`. Existing variant and size names must continue to typecheck.

### Out Of Scope

This plan does not add `@base-ui/react`, port dialogs, menus, inputs, cards, sheets, command surfaces, toasts, sidebars, route shells, generated-codebase primitives, or the Telegram widget. It does not remove `asChild`, rewrite call sites, or change auth/checkout behavior.

## Plan of Work

First, update `apps/web/src/components/ui/button.tsx` by replacing the old `buttonVariants` classes with the T3 Code recipe, adding the extra T3 sizes and `destructive-outline` variant, preserving `asChild`, preserving `data-slot`, `data-variant`, and `data-size`, and setting `type="button"` only when rendering a real button without an explicit type.

Second, update `apps/web/src/components/ui/badge.tsx` by replacing the old `badgeVariants` classes with the T3 Code recipe, adding the `size` prop and status variants, preserving `asChild`, preserving current variants, and emitting `data-size` for parity with Button.

Third, add a focused unit test under `apps/web/tests/unit` that renders Button and Badge with `react-dom/server`. The test should prove the T3 Code recipe tokens are present, existing `asChild` behavior still renders an anchor without a button `type`, and new Badge status variants render.

Fourth, run focused unit tests, app lint/typecheck, Program and plan lint, markdown lint, and whitespace checks. If Tailwind rejects any T3 Code selector syntax, narrow the class recipe to the equivalent syntax that builds in this repo and record the decision.

## Milestones

Milestone 1 creates this child ExecPlan and validates it with `plans:lint`. Success means the active plan links to planning brief 4 and names Button and Badge as the bounded first primitive family.

Milestone 2 updates Button and Badge. Success means existing call-site prop values still compile and new T3 Code class recipes are in the shared primitive source.

Milestone 3 adds focused primitive tests. Success means render tests prove class-recipe adoption and `asChild` compatibility without needing a browser route.

Milestone 4 validates and records completion. Success means focused tests, app lint/typecheck, plan/program/docs lint, and `git diff --check` pass, then the plan moves to `docs/exec-plans/completed/` and the Program ledger names the next primitive follow-up.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Validate this plan before implementation:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-14-t3-code-button-badge-primitives.md

Edit:

    apps/web/src/components/ui/button.tsx
    apps/web/src/components/ui/badge.tsx
    apps/web/tests/unit/ui-button-badge-primitives.test.tsx

Run focused validation:

    bun run --cwd apps/web test:unit -- tests/unit/ui-button-badge-primitives.test.tsx

Run static validation:

    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-14-t3-code-button-badge-primitives.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-14-t3-code-button-badge-primitives.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    git diff --check

If the plan is completed and moved, rerun plan lint against the completed path.

## Validation and Acceptance

Acceptance requires `Button` and `Badge` to expose T3 Code class recipes while existing call sites using current variants, current sizes, and `asChild` still typecheck. Focused tests must prove at least one T3-only class token on each primitive, a real Button gets `type="button"` by default, an `asChild` Button renders an anchor without `type="button"`, and Badge status variants compile and render.

### Test Commands

Run these commands from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run --cwd apps/web test:unit -- tests/unit/ui-button-badge-primitives.test.tsx
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-button-badge-primitives.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-button-badge-primitives.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    git diff --check

## Idempotence and Recovery

The primitive edits are local and deterministic. If a selector from T3 Code does not compile in this app, replace only that selector with the closest Tailwind-supported equivalent and record it in the Decision Log. If a call-site type breaks, preserve the existing public prop value instead of changing the route call site. Do not add dependencies in this slice unless Button or Badge cannot compile without them.

## Artifacts and Notes

Important source references:

    /Users/bazelrex/Developer/t3code/apps/web/src/components/ui/button.tsx
    /Users/bazelrex/Developer/t3code/apps/web/src/components/ui/badge.tsx
    apps/web/src/components/ui/button.tsx
    apps/web/src/components/ui/badge.tsx

No package or lockfile change is expected.

Validation completed on 2026-05-14:

    bun run --cwd apps/web test:unit -- tests/unit/ui-button-badge-primitives.test.tsx
    1 file passed, 4 tests passed.

    bun run --cwd apps/web lint
    Found 0 warnings and 0 errors.

    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    Next.js production build compiled, typechecked, and generated 103 static pages.

    bun run format:check
    Checked 1323 files in 210ms. No fixes applied.

    Browser proof on http://localhost:3000/starter through the webpack dev server
    completed for desktop 1440x1000 and mobile 390x844. Both runs found three
    rendered Button instances, T3 primary shadow treatment, T3 outline surface
    treatment, focus offset classes, sm/default/lg sizes, and no horizontal
    overflow.

## Interfaces and Dependencies

This slice depends on `class-variance-authority`, `radix-ui` Slot, `tailwind-merge` through `cn`, Tailwind CSS v4 selector support, and the T3 Code token foundation now present in `apps/web/src/app/globals.css`. It deliberately avoids the Base UI `render` interface until a later primitive adapter slice.
