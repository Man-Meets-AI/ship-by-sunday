---
title: T3 Code Popover And Tooltip Primitives
status: complete
created_at: 2026-05-14
completed_at: 2026-05-14
summary: Move Popover and Tooltip toward T3 Code popup recipes while preserving current Radix compatibility.
post_build_recap: Popover now exists as a Radix-backed shared primitive with T3 popup aliases, Tooltip now uses the T3 popup surface while keeping current exports and Radix instant/delayed open states, and focused unit, app lint/typecheck, and desktop/mobile browser proof passed.
program_id: t3-code-source-design-system-port
planning_brief: docs/programs/active/2026-05-14-t3-code-source-design-system-port/planning-brief-4.md
read_when:
  - Resuming the Popover and Tooltip primitive slice.
  - Reviewing whether popup primitives should stay Radix-backed during the T3 Code migration.
  - Checking shared popup surface compatibility before migrating menus, dialogs, sheets, or command surfaces.
---

# T3 Code Popover And Tooltip Primitives

This document is a living execution plan for the Popover and Tooltip primitive slice of the T3 Code source design-system port.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday already moved several shared controls to T3 Code visual recipes, but its Tooltip primitive still uses the older dark foreground bubble and there is no shared Popover wrapper in `apps/web/src/components/ui`. T3 Code treats Popover and Tooltip as the direct popup and positioner source for later Select, menu, model picker, sidebar, and settings surfaces. This slice gives Ship by Sunday the same compact popup surface, border, before-shadow, viewport, and alias shape while keeping the current Radix `asChild` API that the live sidebar tooltip already depends on.

After this slice, existing tooltip call sites should keep compiling, future route code can import a shared Popover primitive from `@/components/ui/popover`, and both primitives should expose T3 Code slot names and class recipes that later app-shell and menu migrations can compose.

## Progress

- [x] 2026-05-14: Read root and app agent instructions, docs index, Program packet, planning brief 4, Program and ExecPlan contracts, completed primitive plans, current Tooltip, missing current Popover, T3 Code Popover and Tooltip, current call sites, package dependencies, and focused test patterns.
- [x] 2026-05-14: Created this active ExecPlan and recorded the Radix-adapter strategy before coding.
- [x] 2026-05-14: Validate this plan with `plans:lint`.
- [x] 2026-05-14: Add the Popover wrapper and migrate Tooltip class recipes.
- [x] 2026-05-14: Add focused primitive tests.
- [x] 2026-05-14: Run focused tests, app lint/typecheck, and desktop/mobile browser proof.
- [x] 2026-05-14: Run final format, repo lint/typecheck, Program/plan/docs lint, markdown lint, and `git diff --check`.
- [x] 2026-05-14: Move this ExecPlan to completed and update the Program ledger with the next slice.
- [x] 2026-05-14: Repaired Tooltip open-state selectors after review found copied Base UI `data-open` selectors did not match Radix `data-state="instant-open"` output.

## Surprises & Discoveries

The current app has `apps/web/src/components/ui/tooltip.tsx` backed by the bundled `radix-ui` package. Its live usage is in `apps/web/src/components/ui/sidebar.tsx`, where `SidebarMenuButton` renders `TooltipTrigger asChild` around a button while the sidebar is collapsed. That current `asChild` contract is a real compatibility constraint.

There is no current `apps/web/src/components/ui/popover.tsx` file and no current `Popover` imports under `apps/web/src`. Adding Popover is therefore additive, but it should still preserve the standard Radix export shape because future shadcn-style call sites are likely to expect `Popover`, `PopoverTrigger`, `PopoverContent`, and `PopoverClose`.

T3 Code's Popover and Tooltip source files use `@base-ui/react` and export `PopoverPopup`, `TooltipPopup`, and create-handle helpers. Ship by Sunday does not have `@base-ui/react` in `apps/web/package.json`. Previous primitive slices deliberately adapted T3 recipes onto Radix to avoid a dependency and call-site migration before the heavier popup family had a shared strategy.

The first browser proof attempt used an underscore-prefixed temporary route segment. Next treated that segment as private route inventory and returned a 404. The proof route was moved to `/codex-popup-proof`, verified with the webpack dev server, and then deleted before final validation.

## Decision Log

Decision: Keep Popover and Tooltip Radix-backed in this slice.
Rationale: The live Tooltip usage depends on Radix `asChild`, Ship by Sunday has no Base UI dependency, and there is no current Popover call site that requires Base UI semantics. Copying the T3 Code class recipes onto Radix gives the needed visual migration without forcing a dependency and API migration before Dialog, Sheet, Menu, Command, and Toast are addressed.
Date: 2026-05-14

Decision: Add T3-style popup aliases but do not fake Base UI create-handle exports.
Rationale: `PopoverPopup` and `TooltipPopup` are cheap aliases for the content wrappers and help future T3-style call sites. Base UI create handles are real Base UI APIs, and exporting fake handles from a Radix adapter would create a misleading contract.
Date: 2026-05-14

## Outcomes & Retrospective

This slice kept Popover and Tooltip Radix-backed while copying T3 Code's popup surface recipes into the shared UI layer. `apps/web/src/components/ui/popover.tsx` now exists and exports `Popover`, `PopoverTrigger`, `PopoverPortal`, `PopoverAnchor`, `PopoverClose`, `PopoverContent`, `PopoverPopup`, `PopoverTitle`, and `PopoverDescription`. `PopoverPopup` is the implementation, and `PopoverContent` is the compatibility alias. It forwards `forceMount` through both Radix portal and content, and it lets existing shadcn-style `className` padding control reach the inner viewport while also exposing `viewportClassName` for explicit viewport-only overrides. `apps/web/src/components/ui/tooltip.tsx` now uses a relative bordered `bg-popover` surface with T3 before-shadow tokens, no foreground-color arrow bubble, `sideOffset = 4`, Radix `data-state="delayed-open"` and `"instant-open"` animation selectors, and `TooltipPopup` as an alias for the existing `TooltipContent` export.

The focused unit test proves export compatibility, Popover helper rendering, Popover `asChild` opening, side/align forwarding, closed `forceMount`, viewport className spacing control, Tooltip `asChild`, Tooltip `hidden`, Radix instant-open state compatibility, and T3 popup surface tokens through rendered DOM. Browser proof used a temporary local route that rendered both primitives forced open on desktop and mobile, verified `data-slot="popover-popup"`, `data-slot="popover-viewport"`, `data-slot="tooltip-popup"`, and required class fragments, then captured screenshots under ignored `codex-scripts/artifacts/`. No dependency or lockfile change was needed. The heavier follow-up should migrate Dialog and Sheet or the menu family using the same Radix-adapter strategy unless a later slice deliberately adopts Base UI.

## Context and Orientation

The T3 Code source app is `/Users/bazelrex/Developer/t3code/apps/web`. The relevant source files are `/Users/bazelrex/Developer/t3code/apps/web/src/components/ui/popover.tsx` and `/Users/bazelrex/Developer/t3code/apps/web/src/components/ui/tooltip.tsx`. T3 Code uses Base UI `Positioner`, `Popup`, and `Viewport` components, with popup classes that define rounded bordered `bg-popover` surfaces, subtle before-shadows, `not-dark:bg-clip-padding`, `origin-(--transform-origin)`, compact text, and viewport padding.

The target files are `apps/web/src/components/ui/popover.tsx` and `apps/web/src/components/ui/tooltip.tsx`. `tooltip.tsx` already exists and currently exports `Tooltip`, `TooltipContent`, `TooltipProvider`, and `TooltipTrigger`. `popover.tsx` does not exist yet. The live Tooltip call site is `apps/web/src/components/ui/sidebar.tsx`, which imports `Tooltip`, `TooltipContent`, and `TooltipTrigger`.

### In Scope

This plan updates `apps/web/src/components/ui/tooltip.tsx`, adds `apps/web/src/components/ui/popover.tsx`, adds a focused unit test under `apps/web/tests/unit`, and updates this ExecPlan plus `docs/programs/active/2026-05-14-t3-code-source-design-system-port/program.md`. The implementation should preserve existing Tooltip exports, add `TooltipPopup` as an alias, expose the standard Popover Radix exports, and add `PopoverPopup` as a T3-style alias for `PopoverContent`.

### Out Of Scope

This plan does not add `@base-ui/react`, migrate Dialog, Sheet, DropdownMenu, NavigationMenu, Command, Toast, Sidebar shell structure, generated codebase templates, Telegram widget CSS, auth behavior, checkout behavior, Convex code, or route-level page layout. It does not change existing sidebar behavior beyond the shared Tooltip surface classes. The temporary `/codex-popup-proof` route used for browser proof is not part of the shipped change and must not remain in the final diff.

## Plan of Work

First, validate this active plan with `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-14-t3-code-popover-tooltip-primitives.md`.

Second, add `apps/web/src/components/ui/popover.tsx`. Use the existing `radix-ui` package's Popover primitive. Export `Popover`, `PopoverTrigger`, `PopoverPortal`, `PopoverContent`, `PopoverPopup`, `PopoverClose`, `PopoverAnchor`, `PopoverTitle`, and `PopoverDescription` where those map cleanly to Radix or plain elements. Copy the T3 Code popup recipe onto Radix `Content`, using Radix CSS variables such as `--radix-popover-content-transform-origin` and `--radix-popover-content-available-height` where the Base UI source uses `--transform-origin` and `--available-height`. Preserve standard Radix props such as `side`, `align`, `sideOffset`, `alignOffset`, `forceMount`, `className`, and `asChild`; forward `forceMount` to both portal and content, and keep viewport padding overrideable through existing `className` plus explicit `viewportClassName`.

Third, update `apps/web/src/components/ui/tooltip.tsx`. Keep Radix `TooltipProvider`, `Tooltip`, and `TooltipTrigger`, but replace the current dark foreground bubble with the T3 Code bordered `bg-popover` popup recipe. Set the default offset to match T3 Code, keep `side`, `align`, `hidden`, `className`, and `asChild` compatibility, add `TooltipPopup` as an alias for `TooltipContent`, and keep the current export names.

Fourth, add `apps/web/tests/unit/ui-popover-tooltip-primitives.test.tsx`. The tests should prove the existing Tooltip exports compile, `TooltipPopup` is available, Popover exports compile, Popover aliases are available, rendered Popover opens through `asChild`, forwards side and align state, keeps `forceMount` content mounted while closed, lets className remove viewport padding for shadcn-style content, and rendered Tooltip preserves `asChild`, `hidden`, `TooltipContent`, and T3-only class tokens such as `not-dark:bg-clip-padding`, `before:shadow-[0_1px_--theme(--color-black/4%)]`, `data-[state=open]:animate-in`, and `data-[state=delayed-open]:animate-in`.

Fifth, run focused and static validation. The meaningful user-facing risk is P2 normal product risk because sidebar tooltips are shared navigation UI, but this slice does not change auth, checkout, billing, persistent state, or external I/O. The source of truth is visible popup markup and TypeScript compatibility for current imports. Must work: `TooltipTrigger asChild`, current `TooltipContent` imports, new Popover imports, side and align props, `forceMount`, and custom `className` passthrough. Must fail safely: hidden tooltips remain hidden through Radix props and disabled triggers keep Radix behavior. Tests are focused render checks, app lint, app typecheck, and representative browser proof if a local route exposes collapsed sidebar tooltips without additional setup.

Sixth, record the validation results, complete this ExecPlan, move it to `docs/exec-plans/completed/2026-05-14-t3-code-popover-tooltip-primitives.md`, and update the Program progress, completed ledger, and next slice.

## Milestones

Milestone 1 creates and validates the active ExecPlan. Success means the plan links to `planning-brief-4.md`, names the exact primitive files, and records the Radix compatibility decision.

Milestone 2 adds the Popover wrapper and migrates Tooltip. Success means Tooltip keeps current export names and Popover becomes available from `@/components/ui/popover`, while both files carry T3 Code popup slot names and surface classes.

Milestone 3 adds focused primitive tests. Success means the test suite proves export compatibility and the presence of T3 popup recipe tokens without needing protected route state.

Milestone 4 validates and records completion. Success means focused tests, app lint/typecheck, plan/program/docs lint, browser proof or an exact limitation, and `git diff --check` pass, then the ExecPlan moves to completed and the Program ledger names the next slice.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Validate this plan before implementation:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-14-t3-code-popover-tooltip-primitives.md

Edit:

    apps/web/src/components/ui/popover.tsx
    apps/web/src/components/ui/tooltip.tsx
    apps/web/tests/unit/ui-popover-tooltip-primitives.test.tsx
    docs/exec-plans/completed/2026-05-14-t3-code-popover-tooltip-primitives.md
    docs/programs/active/2026-05-14-t3-code-source-design-system-port/program.md

Run focused validation:

    bun run --cwd apps/web test:unit -- tests/unit/ui-popover-tooltip-primitives.test.tsx

Run static and docs validation:

    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-popover-tooltip-primitives.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-popover-tooltip-primitives.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    git diff --check

If the plan is still active while running intermediate checks, use the active path for `plans:lint` and `markdown:lint`. Once it is moved to completed, use the completed path shown above.

## Validation and Acceptance

Acceptance requires Tooltip to keep its existing Radix-backed exports and current sidebar compatibility while its content surface uses the T3 Code popup recipe. Acceptance also requires a new shared Popover primitive that can be imported from `@/components/ui/popover`, supports the standard Radix wrapper shape, exposes `PopoverPopup` as a T3-compatible alias, and carries T3 Code popup tokens. No package or lockfile change should be needed. Focused tests must prove export compatibility, rendered popup behavior, `asChild`, `forceMount`, className viewport control, and T3-only class tokens. App lint and typecheck must pass. Browser proof should cover a representative route that renders sidebar tooltip UI if a local authenticated route is available; otherwise, record the exact reason browser proof was not meaningful.

### Test Commands

Run these commands from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run --cwd apps/web test:unit -- tests/unit/ui-popover-tooltip-primitives.test.tsx
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-popover-tooltip-primitives.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-popover-tooltip-primitives.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    git diff --check

## Idempotence and Recovery

The primitive edits are local and deterministic. If a T3 selector does not compile in this app, replace only that selector with the closest Tailwind-supported equivalent and record it in the Decision Log. If a current call-site type breaks, preserve the existing Radix public API instead of changing route call sites. Do not add `@base-ui/react` in this slice without updating this plan first, adding dependency and lockfile changes, and running dependency validation. Do not touch generated-codebase output or Telegram widget CSS.

## Artifacts and Notes

Important source references:

    /Users/bazelrex/Developer/t3code/apps/web/src/components/ui/popover.tsx
    /Users/bazelrex/Developer/t3code/apps/web/src/components/ui/tooltip.tsx
    apps/web/src/components/ui/tooltip.tsx
    apps/web/src/components/ui/sidebar.tsx
    apps/web/package.json
    bun.lock

No package or lockfile change was needed because this slice deliberately avoids Base UI.

Plan lint before coding:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-14-t3-code-popover-tooltip-primitives.md
    docs/exec-plans/active/2026-05-14-t3-code-popover-tooltip-primitives.md: ok

Validation completed on 2026-05-14:

    bun run format
    Finished in 363ms on 1032 files using 12 threads.

    bun run --cwd apps/web test:unit -- tests/unit/ui-popover-tooltip-primitives.test.tsx
    1 file passed, 6 tests passed.

    bun run --cwd apps/web lint
    Found 0 warnings and 0 errors.

    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    Next.js production build compiled, typechecked, and generated 103 static pages.

    bun lint
    App and package lint passed with 0 warnings and 0 errors.

    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck
    App production build, app typecheck, and package typechecks passed.

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-popover-tooltip-primitives.md
    docs/exec-plans/completed/2026-05-14-t3-code-popover-tooltip-primitives.md: ok

    bun run programs:lint
    Program docs, packets, and prompts passed.

    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-popover-tooltip-primitives.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    Markdown metadata lint passed for the completed plan and Program.

    git diff --check
    No whitespace errors.

Browser proof used the webpack dev server and a temporary route deleted before final validation:

    PLAYWRIGHT_BASE_URL=http://localhost:3011 node codex-scripts/prove-popover-tooltip-browser.mjs
    status: ok
    desktop URL: http://localhost:3011/codex-popup-proof
    mobile URL: http://localhost:3011/codex-popup-proof
    verified slots: tooltip-popup, popover-popup, popover-viewport
    verified class fragments: not-dark:bg-clip-padding, before:shadow-[0_1px_--theme(--color-black/4%)], data-[side=bottom]:slide-in-from-top-2, data-[state=open]:animate-in, data-[state=delayed-open]:animate-in, [--viewport-inline-padding:--spacing(4)]
    screenshots: codex-scripts/artifacts/popover-tooltip-desktop.png and codex-scripts/artifacts/popover-tooltip-mobile.png

Review repair validation completed on 2026-05-14:

    ./node_modules/.bin/oxfmt -c ../../.oxfmtrc.json src/components/ui/popover.tsx src/components/ui/tooltip.tsx tests/unit/ui-popover-tooltip-primitives.test.tsx
    Finished in 13ms on 3 files using 12 threads.

    bun run --cwd apps/web test:unit -- tests/unit/ui-popover-tooltip-primitives.test.tsx
    1 file passed, 6 tests passed.

    bun run --cwd apps/web lint
    Found 0 warnings and 0 errors.

    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    Next.js production build compiled, typechecked, and generated 103 static pages.

    bun lint
    App and package lint passed with 0 warnings and 0 errors.

    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck
    App production build, app typecheck, and package typechecks passed.

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-popover-tooltip-primitives.md
    docs/exec-plans/completed/2026-05-14-t3-code-popover-tooltip-primitives.md: ok

    bun run programs:lint
    Program docs, packets, and prompts passed.

    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-popover-tooltip-primitives.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    Markdown metadata lint passed for the completed plan and Program.

    git diff --check
    No whitespace errors.

Radix open-state selector repair validation completed on 2026-05-14:

    bun run --cwd apps/web test:unit -- tests/unit/ui-popover-tooltip-primitives.test.tsx
    1 file passed, 6 tests passed.

## Interfaces and Dependencies

This slice depends on the existing `radix-ui` package, React 19, Tailwind CSS v4 selector support, `tailwind-merge` through `cn`, and the T3 Code token foundation in `apps/web/src/app/globals.css`. Tooltip remains part of the shared sidebar primitive surface. Popover becomes a new shared primitive interface for future app-shell, settings, menu, and model-picker slices.
