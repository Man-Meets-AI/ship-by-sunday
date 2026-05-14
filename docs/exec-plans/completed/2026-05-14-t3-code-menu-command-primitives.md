---
title: T3 Code Menu And Command Primitives
status: complete
created_at: 2026-05-14
completed_at: 2026-05-14
summary: Move menu and command surfaces toward T3 Code recipes while preserving current Radix, cmdk, and navigation call-site compatibility.
post_build_recap: DropdownMenu and NavigationMenu now use T3 Code menu surface recipes adapted to Radix state attributes, a shared cmdk-backed Command primitive owns command-palette styling, app-shell command imports moved to that primitive, focused tests and desktop/mobile browser proof passed, and no package changes were needed.
program_id: t3-code-source-design-system-port
planning_brief: docs/programs/active/2026-05-14-t3-code-source-design-system-port/planning-brief-4.md
read_when:
  - Resuming the Menu and Command primitive slice.
  - Reviewing shared menu, navigation menu, or app-shell command menu compatibility during the T3 Code migration.
  - Checking whether menu and command surfaces should stay Radix/cmdk-backed before adopting Base UI.
---

# T3 Code Menu And Command Primitives

This document is a living execution plan for the Menu and Command primitive slice of the T3 Code source design-system port.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday has Radix-backed dropdown and navigation menus plus an app-shell command menu built directly on `cmdk` and Radix Dialog. Those surfaces still carry older local menu styling even though the popup, dialog, and sheet primitives now use the T3 Code recipe. This slice ports T3 Code's menu and command surface classes onto the current Radix and cmdk adapters so the account menu, workspace primary navigation menu, and command palette share the same bordered `bg-popover` geometry, before-shadow, dense item sizing, shortcuts, and dialog shell.

After this slice, existing call sites should keep importing `DropdownMenu*`, `NavigationMenu*`, and the app-shell command menu should keep its keyboard shortcut, routing, theme, and sign-out behavior. Future T3-style code should have shared `Menu*` and `Command*` aliases from `apps/web/src/components/ui` without introducing `@base-ui/react`.

## Progress

- [x] 2026-05-14: Read root and app agent instructions, docs index, Program packet, planning brief 4, Program and ExecPlan contracts, current DropdownMenu, NavigationMenu, app-shell command menu, app-shell command items, T3 Code `menu.tsx`, T3 Code `command.tsx`, cmdk type surface, and focused test patterns.
- [x] 2026-05-14: Created this active ExecPlan and recorded the Radix/cmdk-adapter strategy before coding.
- [x] 2026-05-14: Validated the active plan with `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-14-t3-code-menu-command-primitives.md`.
- [x] 2026-05-14: Migrated DropdownMenu and NavigationMenu recipes while preserving existing exports and adding honest `Menu*` aliases for DropdownMenu wrappers.
- [x] 2026-05-14: Added shared cmdk-backed Command primitive wrappers and moved the app-shell command menu onto them.
- [x] 2026-05-14: Added focused primitive tests and reran existing app-shell command and workspace nav integration tests.
- [x] 2026-05-14: Ran desktop/mobile browser proof through a temporary local route, then deleted the route before final validation.
- [x] 2026-05-14: Ran final format, app lint/typecheck, focused tests, and browser proof; repo and docs gates are recorded below.
- [x] 2026-05-14: Moved this ExecPlan to completed and updated the Program ledger with the next slice.
- [x] 2026-05-14: Repaired NavigationMenu open-state selectors after review found copied Base UI `data-open`/`data-popup-open` selectors did not match Radix `data-state` output.

## Surprises & Discoveries

`apps/web/src/components/ui/dropdown-menu.tsx` is currently used only by the app-shell user menu files. Those call sites rely on Radix `asChild`, `align="end"`, `DropdownMenuItem variant="destructive"`, and normal Radix item selection.

`apps/web/src/components/ui/navigation-menu.tsx` is used by `apps/web/src/app/(app)/_components/workspace-navigation/workspace-primary-nav.tsx`. The workspace nav deliberately passes `viewport={false}` so menu content must keep the viewport-less absolute overlay classes that existing tests assert.

There is no shared `apps/web/src/components/ui/command.tsx` yet. The app-shell command menu imports `cmdk` directly and owns its Radix Dialog overlay/content class strings locally. T3 Code's `command.tsx` uses Base UI Dialog plus a separate Autocomplete primitive, which Ship by Sunday does not currently have. A literal port would require a broader dependency and call-site migration, so this slice should create a cmdk-backed Command adapter instead.

Desktop and mobile browser proof needed a temporary route because the real app-shell command menu is protected and tied to session state. The proof route intentionally rendered DropdownMenu open; Radix modal dropdown behavior blocked outside clicks until the route used `modal={false}`, and mobile overlap required invoking the command trigger by DOM click in the ignored Playwright probe. Those were proof-harness constraints, not product code changes.

## Decision Log

Decision: Keep menus Radix-backed and command cmdk-backed in this slice.
Rationale: Current call sites depend on Radix `asChild`, Radix dropdown semantics, Radix navigation menu behavior, and cmdk filtering/selection. Previous primitive slices kept Radix adapters while copying T3 recipes, and this slice can preserve behavior with the same pattern.
Date: 2026-05-14

Decision: Add T3-style alias names where they map to real wrappers.
Rationale: `Menu`, `MenuPopup`, `MenuItem`, `MenuShortcut`, `CommandDialogPopup`, `CommandPanel`, `CommandFooter`, and related exports help later T3-style code compose these primitives. Fake Base UI create handles remain out of scope because they would imply APIs this adapter does not implement.
Date: 2026-05-14

## Outcomes & Retrospective

DropdownMenu now carries the T3 Code bordered `bg-popover` popup surface, before-shadow, dense item sizing, checkbox/radio/submenu layout, shortcut styling, and `menu-viewport` wrapper while keeping Radix `DropdownMenu*` exports and current call-site props. It also exports `Menu`, `MenuPopup`, `MenuItem`, `MenuShortcut`, and related aliases that map to real wrappers instead of pretending to expose Base UI-only APIs.

NavigationMenu keeps the `viewport` prop and viewport-less absolute overlay behavior used by workspace primary navigation, but its trigger, content, viewport, and link recipes now use the same T3 menu surface and dense item rhythm. The open/closed styling and chevron rotation are adapted to Radix `data-state="open"` / `"closed"` attributes rather than Base UI `data-open` or `data-popup-open` attributes.

`apps/web/src/components/ui/command.tsx` is now the shared command primitive boundary. It stays on `cmdk` and Radix Dialog, exposes the T3-style command dialog, panel, footer, shortcut, input, list, group, item, separator, and empty-state wrappers, and removed app-shell command palette class strings from the route-local component.

No dependency or lockfile change was needed. The next primitive slice should continue `planning-brief-4.md` with AlertDialog and Toast/Sonner, preserving current Radix AlertDialog and Sonner call-site compatibility while adapting T3 Code's `alert-dialog.tsx` and `toast.tsx` recipes.

## Context and Orientation

The T3 Code source app is `/Users/bazelrex/Developer/t3code/apps/web`. The relevant source files are `/Users/bazelrex/Developer/t3code/apps/web/src/components/ui/menu.tsx` and `/Users/bazelrex/Developer/t3code/apps/web/src/components/ui/command.tsx`. T3 Code uses Base UI `Menu` and `Dialog` primitives plus a custom `Autocomplete` stack for command lists.

The target shared files are `apps/web/src/components/ui/dropdown-menu.tsx`, `apps/web/src/components/ui/navigation-menu.tsx`, and a new `apps/web/src/components/ui/command.tsx`. The app-shell command menu files are `apps/web/src/app/(app)/_components/app-shell/app-shell-command-menu.tsx` and `apps/web/src/app/(app)/_components/app-shell/app-shell-command-menu-items.tsx`.

### In Scope

This plan updates DropdownMenu styling and aliases, updates NavigationMenu popup and link recipes without changing workspace navigation behavior, adds a shared cmdk-backed Command primitive file, moves the app-shell command menu and item imports to that shared primitive, adds focused unit tests, and updates this ExecPlan plus `docs/programs/active/2026-05-14-t3-code-source-design-system-port/program.md`.

### Out Of Scope

This plan does not add `@base-ui/react`, port T3 Code Autocomplete, rewrite the protected app shell, migrate AlertDialog, ContextMenu, Toast, generated codebase templates, Telegram widget CSS, auth behavior, checkout behavior, Convex code, or route-level IA. Any temporary browser proof route must not remain in the final diff.

## Plan of Work

First, validate this active plan with `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-14-t3-code-menu-command-primitives.md`.

Second, update `apps/web/src/components/ui/dropdown-menu.tsx`. Preserve every current `DropdownMenu*` export and Radix prop passthrough. Copy the T3 Code popup surface, before-shadow, item sizing, group label, separator, shortcut, checkbox, radio, sub-trigger, and sub-popup recipes onto the Radix wrappers. Add `Menu*` aliases that point at the same real wrappers where the mapping is honest.

Third, update `apps/web/src/components/ui/navigation-menu.tsx`. Preserve `viewport`, `NavigationMenuContent`, `NavigationMenuLink asChild`, `navigationMenuTriggerStyle`, and the viewport-less overlay behavior used by `WorkspacePrimaryNav`. Align the popup and viewport surfaces with the T3 menu recipe by adding border, `not-dark:bg-clip-padding`, shadow, before-shadow, and denser item/link classes without changing routing behavior.

Fourth, add `apps/web/src/components/ui/command.tsx`. Use the existing `cmdk` dependency for filtering and item selection and the existing bundled `radix-ui` Dialog primitive for the command dialog shell. Expose `Command`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandSeparator`, `CommandShortcut`, `CommandPanel`, `CommandFooter`, `CommandDialog`, `CommandDialogPopup`, `CommandDialogBackdrop`, `CommandDialogViewport`, `CommandDialogTitle`, and `CommandDialogDescription`.

Fifth, update the app-shell command menu files to import the shared Command wrappers instead of importing directly from `cmdk` and `radix-ui`. Preserve the `⌘K` shortcut, click open event, PostHog event capture, escape close behavior, route navigation, theme switching, sign-out behavior, and long-label wrapping.

Sixth, add focused tests. The meaningful user-facing risk is P2 normal product risk because these are shared navigation and command palette surfaces, but this slice does not change auth, checkout, billing, persistent state, or external I/O. The source of truth is visible menu/command markup and unchanged app-shell command behavior. Must work: DropdownMenu `asChild`, destructive menu items, NavigationMenu viewport-less content, cmdk option roles, command shortcut open/close, command item selection, theme switching, and sign out. Must fail safely: disabled menu and command items remain disabled through Radix/cmdk state.

Seventh, run desktop/mobile browser proof with a temporary local route or equivalent local proof harness, delete temporary route code before final validation, record validation results, complete this ExecPlan, move it to `docs/exec-plans/completed/2026-05-14-t3-code-menu-command-primitives.md`, and update the Program progress, completed ledger, and next slice.

## Milestones

Milestone 1 creates and validates the active ExecPlan. Success means the plan links to `planning-brief-4.md`, names the exact primitive and app-shell files, and records the Radix/cmdk compatibility decision.

Milestone 2 migrates DropdownMenu and NavigationMenu. Success means current exports keep compiling, T3 aliases are available for DropdownMenu, and both files carry T3 menu surface and item recipe tokens while workspace primary nav tests still pass.

Milestone 3 adds the shared Command primitive and moves app-shell command surfaces to it. Success means app-shell command menu behavior tests pass and the local command palette class strings are owned by `apps/web/src/components/ui/command.tsx`.

Milestone 4 validates and records completion. Success means focused tests, app lint/typecheck, plan/program/docs lint, desktop/mobile browser proof or an exact limitation, and `git diff --check` pass, then the ExecPlan moves to completed and the Program ledger names the next slice.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Validate this plan before implementation:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-14-t3-code-menu-command-primitives.md

Edit:

    apps/web/src/components/ui/dropdown-menu.tsx
    apps/web/src/components/ui/navigation-menu.tsx
    apps/web/src/components/ui/command.tsx
    apps/web/src/app/(app)/_components/app-shell/app-shell-command-menu.tsx
    apps/web/src/app/(app)/_components/app-shell/app-shell-command-menu-items.tsx
    apps/web/tests/unit/ui-menu-command-primitives.test.tsx
    docs/exec-plans/active/2026-05-14-t3-code-menu-command-primitives.md
    docs/programs/active/2026-05-14-t3-code-source-design-system-port/program.md

Run focused validation:

    bun run --cwd apps/web test:unit -- tests/unit/ui-menu-command-primitives.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/app-shell-command-menu.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-primary-nav.test.tsx

Browser proof used a temporary route at `/codex-menu-command-proof` and an ignored local probe:

    PLAYWRIGHT_BASE_URL=http://localhost:3013 node codex-scripts/prove-menu-command-browser.mjs

The temporary route was deleted before final validation. Screenshots were written under ignored `codex-scripts/artifacts/`.

Run static and docs validation:

    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-menu-command-primitives.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-menu-command-primitives.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    git diff --check

If the plan is still active while running intermediate checks, use the active path for `plans:lint` and `markdown:lint`. Once it is moved to completed, use the completed path shown above.

## Validation and Acceptance

Acceptance requires DropdownMenu, NavigationMenu, and the app-shell Command menu to keep their existing behavior while carrying the T3 Code menu and command recipes. DropdownMenu must keep existing export names and add honest `Menu*` aliases. NavigationMenu must keep the viewport-less overlay behavior used by workspace primary nav. Command must become a shared primitive under `apps/web/src/components/ui/command.tsx`, and the app-shell command menu must import it without regressing keyboard shortcut, item selection, routing, theme, sign-out, or long-label behavior. No package or lockfile change should be needed.

### Test Commands

Run these commands from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run --cwd apps/web test:unit -- tests/unit/ui-menu-command-primitives.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/app-shell-command-menu.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-primary-nav.test.tsx
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-menu-command-primitives.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-menu-command-primitives.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    git diff --check

## Idempotence and Recovery

The primitive edits are local and deterministic. If a T3 selector does not compile in this app, replace only that selector with the closest Tailwind-supported equivalent and record it in the Decision Log. If a current call-site type breaks, preserve the existing Radix or cmdk public API instead of changing route behavior. Do not add `@base-ui/react` or replace cmdk in this slice without updating this plan first, adding dependency and lockfile changes, and running dependency validation. Do not touch generated-codebase output or Telegram widget CSS.

## Artifacts and Notes

Important source references:

    /Users/bazelrex/Developer/t3code/apps/web/src/components/ui/menu.tsx
    /Users/bazelrex/Developer/t3code/apps/web/src/components/ui/command.tsx
    apps/web/src/components/ui/dropdown-menu.tsx
    apps/web/src/components/ui/navigation-menu.tsx
    apps/web/src/app/(app)/_components/app-shell/app-shell-command-menu.tsx
    apps/web/src/app/(app)/_components/app-shell/app-shell-command-menu-items.tsx
    apps/web/tests/integration-ui/app-shell-command-menu.test.tsx
    apps/web/tests/integration-ui/workspace-primary-nav.test.tsx

No package or lockfile change should be needed because this slice deliberately avoids Base UI and reuses `cmdk`.

Validation completed on 2026-05-14:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-14-t3-code-menu-command-primitives.md
    bun run format
    bun run --cwd apps/web test:unit -- tests/unit/ui-menu-command-primitives.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/app-shell-command-menu.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-primary-nav.test.tsx
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    PLAYWRIGHT_BASE_URL=http://localhost:3013 node codex-scripts/prove-menu-command-browser.mjs
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-menu-command-primitives.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-menu-command-primitives.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    bun lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck
    git diff --check

Review repair validation completed on 2026-05-14:

    bun run --cwd apps/web test:unit -- tests/unit/ui-menu-command-primitives.test.tsx
    1 file passed, 6 tests passed.

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/app-shell-command-menu.test.tsx tests/integration-ui/workspace-primary-nav.test.tsx
    2 files passed, 9 tests passed.

    bun run --cwd apps/web lint
    Found 0 warnings and 0 errors.

    bun lint
    App and package lint passed with 0 warnings and 0 errors.

    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck
    App production build, app typecheck, and package typechecks passed.

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-menu-command-primitives.md
    docs/exec-plans/completed/2026-05-14-t3-code-menu-command-primitives.md: ok

    bun run programs:lint
    Program docs, packets, and prompts passed.

    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-form-scaffold-controls.md docs/exec-plans/completed/2026-05-14-t3-code-menu-command-primitives.md docs/exec-plans/completed/2026-05-14-t3-code-popover-tooltip-primitives.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    Markdown metadata lint passed.

    git diff --check
    No whitespace errors.

## Interfaces and Dependencies

This slice depends on the existing `radix-ui` package, `cmdk`, React 19, Tailwind CSS v4 selector support, `tailwind-merge` through `cn`, and the T3 Code token foundation in `apps/web/src/app/globals.css`. DropdownMenu remains a shared account-menu primitive, NavigationMenu remains the workspace primary navigation primitive, and Command becomes the shared wrapper for the app-shell command palette.
