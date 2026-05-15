---
title: T3 Code App Foundation
status: complete
created_at: 2026-05-14
completed_at: 2026-05-14
summary: Install the T3 Code app font, light and dark tokens, radius semantics, and tracked-app root layout boundary in apps/web.
post_build_recap: apps/web now loads DM Sans as the canonical sans font, exposes T3 Code light and dark token semantics, and no longer injects generated-design CSS from the root layout.
program_id: t3-code-source-design-system-port
planning_brief: docs/programs/completed/2026-05-14-t3-code-source-design-system-port/planning-brief-3.md
read_when:
  - Resuming the app foundation slice.
  - Reviewing the tracked-app font, token, or root layout boundary.
  - Validating the T3 Code migration before starting primitive work.
---

# T3 Code App Foundation

This document is a living execution plan for the tracked-app foundation slice of the T3 Code source design-system port.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday's tracked Next.js app should stop letting the old generated design-system bridge and old type stack define the global visual baseline. After this slice, every current `apps/web` screen inherits DM Sans through the canonical `font-sans` path, T3 Code-compatible light and dark semantic tokens, additive radius values, and class-based `.dark` behavior that still works with `next-themes`. The user-visible proof is that the app root layout compiles without the old generated style block and the global CSS exposes the T3 Code palette and typography for existing routes while leaving route-level visual rewrites for later Program slices.

## Progress

- [x] 2026-05-14: Read root and app instructions, the active Program, planning brief 3, the structure map, local Next.js font/layout/CSS docs, T3 Code `src/index.css`, T3 Code `components.json`, and T3 Code `src/hooks/useTheme.ts`.
- [x] 2026-05-14: Inspected `apps/web/src/app/fonts.ts`, `apps/web/src/app/globals.css`, `apps/web/src/app/layout.tsx`, `apps/web/src/lib/generated-design-system-css.ts`, and generated-design CSS tests.
- [x] 2026-05-14: Update `fonts.ts`, `globals.css`, and `layout.tsx` for the T3 Code app foundation.
- [x] 2026-05-14: Update this ExecPlan and the owning Program with the completed slice and next slice.
- [x] 2026-05-14: Run focused tests, app lint/typecheck, browser smoke, Program/plan lint, markdown lint, and whitespace checks.

## Surprises & Discoveries

T3 Code applies `body { overflow: hidden; }` and a `#root` full-height shell because it is a Vite desktop-style app. Planning brief 3 explicitly excludes copying that global overflow lock into Ship by Sunday's Next app because marketing and docs routes need normal document scrolling.

Next.js local docs say the root layout must define `<html>` and `<body>` and should not manually add `<head>` tags for title/meta concerns. The current Ship by Sunday root layout uses `<head>` only to inject the generated-design style block, so removing that block also removes the manual head element from this layout.

The `buildGeneratedDesignSystemCss` helper is still tested and may still be useful for generated output or later compiler work. This slice should stop the tracked app from injecting its output, not delete the helper.

The default Turbopack dev server returned pages but repeatedly emitted a fatal HMR panic, `Failed to write app endpoint /page` caused by `app_dir must be a directory`, while Playwright was trying to inspect pages. The production build passed, and the browser smoke was completed against `bun run --cwd apps/web dev:web:webpack -- --port 3000`.

## Decision Log

Decision: Keep compatibility font exports and utilities for now while making DM Sans canonical.
Rationale: Many unmigrated route islands still reference `font-heading-serif`, `font-home-inter`, `font-product-wordmark`, and `font-number`. Planning brief 3 excludes deleting compatibility utilities until route-level migrations remove those call sites.
Date: 2026-05-14

Decision: Remove the tracked app root style injection instead of changing the generated-design helper.
Rationale: The Program needs the tracked app to stop overriding T3 Code tokens, while generated-codebase output is explicitly out of scope for this slice. Keeping the helper unchanged avoids silently changing generated output.
Date: 2026-05-14

Decision: Copy T3 Code token semantics but omit Vite/Electron-only global shell constraints.
Rationale: `overflow: hidden`, `#root`, drag regions, window control overlay variants, and desktop bridge theme sync are not safe global assumptions for a Next.js marketing/docs/product app.
Date: 2026-05-14

## Outcomes & Retrospective

This slice installed the tracked-app foundation for the T3 Code migration. `apps/web/src/app/fonts.ts` now exports `dmSans` from `next/font/google` and includes it first in `projectFontVariables`. `apps/web/src/app/globals.css` now makes DM Sans the canonical `font-sans`, switches `font-mono` to the SF Mono stack, adopts T3 Code-compatible light and dark semantic tokens, adds `info`, `success`, and `warning` status tokens, changes radii to additive T3 Code values, supports `.dark` with `next-themes`, adds the no-transition and noise-overlay foundation, and keeps normal document scrolling. `apps/web/src/app/layout.tsx` no longer imports or injects generated design-system CSS, so the tracked app is not overridden by the old generated design bridge.

Generated-codebase output was intentionally untouched. Shared primitives, route-level visual islands, Telegram widget styling, and generated customer app templates remain later Program slices.

## Context and Orientation

The source design app is `/Users/bazelrex/Developer/t3code/apps/web`. Its relevant source files for this slice are `/Users/bazelrex/Developer/t3code/apps/web/src/index.css`, `/Users/bazelrex/Developer/t3code/apps/web/components.json`, and `/Users/bazelrex/Developer/t3code/apps/web/src/hooks/useTheme.ts`. T3 Code uses Tailwind v4 CSS tokens, DM Sans, additive radius values, a blue primary accent, semantic `info`, `success`, `warning`, and `destructive` tokens, `.dark` class mode, a noise overlay, thin scrollbars, and a transition-suppression class during theme changes.

The current tracked app files are `apps/web/src/app/fonts.ts`, `apps/web/src/app/globals.css`, and `apps/web/src/app/layout.tsx`. `fonts.ts` currently loads Inter, Bebas Neue, Instrument Serif, and local Berkeley Mono through `next/font`. `globals.css` currently declares old neutral tokens, old radius multiplication, duplicate Berkeley `@font-face` rules, and negative body letter spacing. `layout.tsx` currently imports `generatedDesignSystem`, builds CSS with `buildGeneratedDesignSystemCss`, and injects it with a `<style id="generated-design-system">` inside a manual `<head>`.

The helper `apps/web/src/lib/generated-design-system-css.ts` renders CSS from generated design-system facts. It is currently tested by `apps/web/tests/unit/generated-design-system-css.test.ts`. This helper should remain intact in this slice unless a compile failure requires a narrow compatibility update.

### In Scope

This plan edits `apps/web/src/app/fonts.ts` to load DM Sans as the primary UI font while preserving old font variables for compatibility. It edits `apps/web/src/app/globals.css` to adopt T3 Code token semantics, status tokens, additive radius values, class-based dark selectors, DM Sans `font-sans`, SF Mono `font-mono`, safe body styles, no-transition support, the noise overlay, and T3 Code scrollbar sizing without copying the global overflow lock. It edits `apps/web/src/app/layout.tsx` to remove the old generated-design style injection while keeping Clerk, `next-themes`, Convex, and Toaster provider order intact. It updates the Program ledger and this ExecPlan as work completes.

### Out Of Scope

This plan does not port T3 Code Base UI primitives, rewrite the app shell, rebuild marketing/docs/tutorial/auth/checkout/worker routes, migrate generated customer repositories, change `packages/codebase-compiler`, change `templates/starter-app`, change `packages/telegram-chat-widget`, remove all old underscore implementation folders, or delete compatibility font utilities still referenced by unmigrated routes. It also does not apply T3 Code's global `body { overflow: hidden; }` or desktop-window theme bridge to the Next app.

## Plan of Work

First, update `apps/web/src/app/fonts.ts` so `DM_Sans` is imported from `next/font/google`, exported as `dmSans`, and placed first in `projectFontVariables`. Keep the existing Inter, Instrument Serif, Bebas Neue, and Berkeley Mono exports so current routes continue compiling.

Second, update `apps/web/src/app/globals.css`. Remove the duplicate Berkeley `@font-face` declarations because `next/font/local` already provides the compatibility variable. Change the dark custom variant to match T3 Code's `.dark` behavior. In `@theme inline`, set `--font-sans` to DM Sans literal family names and `--font-mono` to the SF Mono stack, add `info`, `success`, and `warning` color aliases, and replace multiplicative radii with T3 Code additive radii. Replace the root and dark semantic tokens with T3 Code-compatible values while preserving legacy aliases like `--accent-info`, `--state-success`, and `--state-warning`. Keep chart and sidebar aliases available for existing call sites. Change base body letter spacing to `0`, keep normal document scrolling, add `.no-transitions`, add T3 Code noise overlay, and resize scrollbars to 6px.

Third, update `apps/web/src/app/layout.tsx` by deleting the generated-design imports, the generated CSS constant, and the manual `<head>` style block. Keep the root layout as a server component with `<html lang="en" className={projectFontVariables} suppressHydrationWarning>` and leave provider nesting unchanged.

Fourth, run focused tests and static checks. If generated-design helper tests fail because expectations assumed tracked-app injection, update only the test language or helper boundary needed to preserve generated-output behavior. If app lint/typecheck fails because of the root layout import cleanup, repair the narrow failure before moving on.

Fifth, update this ExecPlan to complete, move it to `docs/exec-plans/completed/`, and update `docs/programs/completed/2026-05-14-t3-code-source-design-system-port/program.md` plus `current-planning-brief.txt` and a new planning brief if the next slice is clear.

## Milestones

Milestone 1 creates the foundation plan and validates it with `plans:lint`. Success means the active ExecPlan has Program linkage to planning brief 3 and names the exact tracked-app boundary.

Milestone 2 updates fonts, global CSS, and root layout. Success means `DM_Sans` is loaded once through `next/font`, `font-sans` is DM Sans, `.dark` remains class-based, generated design CSS is no longer injected into the root layout, and the generated-design helper remains available for generated-output work.

Milestone 3 validates the slice. Success means focused generated-design and theme tests pass, app lint and typecheck pass, Program and ExecPlan lint pass, markdown lint passes for touched docs, and `git diff --check` reports no whitespace errors.

Milestone 4 records the completed slice. Success means the ExecPlan is moved to `docs/exec-plans/completed/`, the Program ledger names it as completed, and the Program's next slice points to shared primitive migration or another explicit T3 Code follow-up.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Validate this plan before implementation:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-14-t3-code-app-foundation.md

Edit the app foundation files:

    apps/web/src/app/fonts.ts
    apps/web/src/app/globals.css
    apps/web/src/app/layout.tsx

Run focused tests:

    bun run --cwd apps/web test:unit -- tests/unit/generated-design-system-css.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/public-theme-toggle.test.tsx tests/integration-ui/app-shell-theme-toggle-parity.test.tsx

Run app static checks:

    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck

Run planning and docs checks:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-14-t3-code-app-foundation.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-14-t3-code-app-foundation.md docs/programs/completed/2026-05-14-t3-code-source-design-system-port
    git diff --check

If the plan is completed and moved, rerun plan lint against the completed path:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-app-foundation.md

## Validation and Acceptance

Acceptance requires the tracked app root to compile with DM Sans as the canonical sans font, T3 Code-compatible semantic tokens for light and dark mode, additive radii, and no old generated-design style tag in the root layout. `next-themes` must still use class mode, the existing generated-design CSS helper tests must still pass, and generated customer output must not be changed by this slice. Program and ExecPlan documents must be current.

### Test Commands

Run these commands from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run --cwd apps/web test:unit -- tests/unit/generated-design-system-css.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/public-theme-toggle.test.tsx tests/integration-ui/app-shell-theme-toggle-parity.test.tsx
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-app-foundation.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-app-foundation.md docs/programs/completed/2026-05-14-t3-code-source-design-system-port
    git diff --check

Browser visual proof for this slice used the webpack dev server after the default Turbopack dev server panicked in HMR. The proof route was `/starter` at desktop `1440x900` and mobile `390x844`, with external Clerk, Cal, PostHog, and Sentry calls blocked for stability. Light and dark runs both showed no `#generated-design-system` style tag, DM Sans body font, radius `0.625rem`, T3 Code primary tokens, and no horizontal overflow. A later primitive or route rewrite slice should capture screenshot artifacts.

## Idempotence and Recovery

The app edits are deterministic. If a partial edit fails, restore only the in-progress hunks you made in `fonts.ts`, `globals.css`, or `layout.tsx` by re-reading the file and applying a narrower patch; do not reset unrelated dirty files. Removing the root generated-design style injection is reversible by restoring the deleted imports, constant, and `<style>` tag, but that should only happen if validation proves a real blocker. If validation fails in a generated-design helper test, keep the helper behavior stable and repair tests or boundary wording rather than changing generated output.

## Artifacts and Notes

Important source references:

    /Users/bazelrex/Developer/t3code/apps/web/src/index.css
    /Users/bazelrex/Developer/t3code/apps/web/components.json
    /Users/bazelrex/Developer/t3code/apps/web/src/hooks/useTheme.ts
    apps/web/src/app/fonts.ts
    apps/web/src/app/globals.css
    apps/web/src/app/layout.tsx
    apps/web/src/lib/generated-design-system-css.ts
    apps/web/tests/unit/generated-design-system-css.test.ts

Expected layout boundary after implementation:

    layout.tsx should not import generatedDesignSystem.
    layout.tsx should not import buildGeneratedDesignSystemCss.
    layout.tsx should not render style id="generated-design-system".

Validation completed on 2026-05-14:

    bun run --cwd apps/web test:unit -- tests/unit/generated-design-system-css.test.ts
    1 file passed, 2 tests passed.

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/public-theme-toggle.test.tsx tests/integration-ui/app-shell-theme-toggle-parity.test.tsx
    2 files passed, 4 tests passed.

    bun run --cwd apps/web lint
    Found 0 warnings and 0 errors.

    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    Next.js production build compiled, typechecked, and generated 103 static pages.

    bun lint
    App and package lint passed.

    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck
    App production build and all package typechecks passed.

    bun run format:check
    All matched apps/web files use the correct format.

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-app-foundation.md
    Plan lint passed.

    bun run programs:lint
    Program docs, packets, and prompts passed.

    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-app-foundation.md docs/programs/completed/2026-05-14-t3-code-source-design-system-port
    Markdown metadata lint passed for the touched plan and Program.

    git diff --check
    No whitespace errors.

## Interfaces and Dependencies

This slice depends on Next.js App Router root layout semantics, `next/font/google`, `next/font/local`, Tailwind CSS v4 `@theme inline`, `next-themes` class mode, Clerk's `ClerkProvider`, Convex client provider wiring, and existing app primitives that consume shadcn-style CSS variables. The generated-design helper depends on `@shipbysunday/codebase-compiler` and remains available for later generated-codebase migration work.
