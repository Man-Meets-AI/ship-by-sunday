---
title: T3 Code Dialog And Sheet Primitives
status: complete
created_at: 2026-05-14
completed_at: 2026-05-14
summary: Move Dialog and Sheet toward T3 Code modal recipes while preserving current Radix call-site compatibility.
post_build_recap: Dialog and Sheet now carry T3 Code backdrop, viewport, popup, panel, close-button, header, title, description, and footer recipes on Radix adapters, with focused tests, app compatibility tests, guarded typecheck, and desktop/mobile browser proof passing.
program_id: t3-code-source-design-system-port
planning_brief: docs/programs/active/2026-05-14-t3-code-source-design-system-port/planning-brief-4.md
read_when:
  - Resuming the Dialog and Sheet primitive slice.
  - Reviewing shared modal primitive compatibility during the T3 Code migration.
  - Checking whether Dialog or Sheet should stay Radix-backed before migrating command, menu, or alert-dialog surfaces.
---

# T3 Code Dialog And Sheet Primitives

This document is a living execution plan for the Dialog and Sheet primitive slice of the T3 Code source design-system port.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday already has Radix-backed Dialog and Sheet wrappers, but their surfaces still use the older local modal styling. T3 Code defines richer modal recipes around backdrop, viewport, popup, close-button, panel, header, and footer slots. This slice ports those visual and structural recipes onto the current Radix wrappers so existing app call sites keep their `asChild`, `DialogContent`, `SheetContent`, and close-button behavior while future T3-style route code can import the alias names used by the source design system.

After this slice, Dialog and Sheet should expose T3-compatible slot names and aliases, keep Radix accessibility and focus behavior, and preserve the mobile sidebar Sheet contract that currently hides the built-in close button through `className` selectors.

## Progress

- [x] 2026-05-14: Read root and app agent instructions, docs index, Program packet, planning brief 4, Program and ExecPlan contracts, current Dialog and Sheet files, T3 Code Dialog and Sheet source files, current call sites, and nearby focused test patterns.
- [x] 2026-05-14: Created this active ExecPlan and recorded the Radix-adapter strategy before coding.
- [x] 2026-05-14: Validated this plan with `plans:lint`.
- [x] 2026-05-14: Migrated Dialog and Sheet recipes while preserving existing exports.
- [x] 2026-05-14: Added focused primitive tests and app-level compatibility checks.
- [x] 2026-05-14: Ran desktop/mobile browser proof for the shared primitives.
- [x] 2026-05-14: Ran final format, repo lint/typecheck, Program/plan/docs lint, markdown lint, and `git diff --check`.
- [x] 2026-05-14: Moved this ExecPlan to completed and updated the Program ledger with the next slice.

## Surprises & Discoveries

The current Dialog and Sheet wrappers already use the bundled `radix-ui` package and current app code imports their standard shadcn-style names. Dialog call sites use `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, and `DialogFooter`. Sheet is live in the mobile sidebar, where `SheetContent` receives custom `data-slot="sidebar"`, `data-mobile="true"`, `side={side}`, `style`, and `className="[&>button]:hidden"` props.

T3 Code's Dialog and Sheet source files use Base UI. Ship by Sunday does not currently depend on `@base-ui/react`, and the previous primitive slices deliberately adapted T3 recipes onto Radix to avoid a dependency and call-site migration before the popup family has a broader shared strategy.

The admin Dialog compatibility command in the initial plan used the stale script name `test:integration-ui`. The app's actual script is `test:integration:ui`, and the corrected admin test passed.

## Decision Log

Decision: Keep Dialog and Sheet Radix-backed in this slice.
Rationale: Radix already provides the focus management, escape handling, `asChild` triggers, portal behavior, and content API used by current call sites. Copying the T3 Code recipes onto Radix preserves behavior while moving the visual system forward.
Date: 2026-05-14

Decision: Add T3-style aliases only where they map cleanly to real components.
Rationale: `DialogBackdrop`, `DialogPopup`, `DialogPanel`, `DialogViewport`, `SheetBackdrop`, `SheetPopup`, and `SheetPanel` are useful compatibility names for future T3-style imports. Fake Base UI create handles would imply semantics this adapter does not provide, so they remain out of scope.
Date: 2026-05-14

## Outcomes & Retrospective

This slice kept Dialog and Sheet Radix-backed while copying T3 Code's modal and sheet surface recipes into the shared UI layer. `apps/web/src/components/ui/dialog.tsx` now exposes `DialogBackdrop`, `DialogOverlay`, `DialogViewport`, `DialogPopup`, `DialogContent`, and `DialogPanel`, keeps `showCloseButton`, and adds T3-style footer variants while preserving the current `DialogContent` import path. `apps/web/src/components/ui/sheet.tsx` now exposes `SheetBackdrop`, `SheetOverlay`, `SheetViewport`, `SheetPopup`, `SheetContent`, and `SheetPanel`, keeps `side`, `showCloseButton`, `className`, `style`, and custom data attributes, and supports the T3 inset variant.

The focused test proves export alias compatibility, real Radix render output for Dialog and Sheet, source recipe tokens, and mobile-sidebar `data-slot` passthrough. Existing draft-assistant and admin impersonation tests still pass against real Dialog call sites. Browser proof used a temporary `/codex-dialog-sheet-proof` route that was deleted before final validation, opened Dialog and Sheet at desktop and mobile viewports, verified required slots and class fragments, and saved ignored screenshots under `codex-scripts/artifacts/`. No dependency or lockfile change was needed.

## Context and Orientation

The T3 Code source app is `/Users/bazelrex/Developer/t3code/apps/web`. The relevant source files are `/Users/bazelrex/Developer/t3code/apps/web/src/components/ui/dialog.tsx` and `/Users/bazelrex/Developer/t3code/apps/web/src/components/ui/sheet.tsx`. T3 Code uses Base UI dialog primitives with explicit backdrop, viewport, popup, close-button, footer, and panel recipes.

The target files are `apps/web/src/components/ui/dialog.tsx` and `apps/web/src/components/ui/sheet.tsx`. Both already exist and are Radix-backed. Current app call sites rely on `DialogContent`, `SheetContent`, `showCloseButton`, `side`, `className`, `style`, and `asChild` passthrough behavior.

### In Scope

This plan updates `apps/web/src/components/ui/dialog.tsx`, `apps/web/src/components/ui/sheet.tsx`, adds a focused unit test under `apps/web/tests/unit`, and updates this ExecPlan plus `docs/programs/active/2026-05-14-t3-code-source-design-system-port/program.md`. The implementation should preserve existing exports, add T3-style aliases for popup/backdrop/panel surfaces, and carry the T3 modal and sheet class recipes.

### Out Of Scope

This plan does not add `@base-ui/react`, migrate AlertDialog, Command, DropdownMenu, NavigationMenu, ContextMenu, Toast, generated codebase templates, Telegram widget CSS, auth behavior, checkout behavior, Convex code, or route-level page layout. It does not change the mobile sidebar workflow beyond the shared Sheet classes. Any temporary browser proof route must not remain in the final diff.

## Plan of Work

First, validate this active plan with `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-14-t3-code-dialog-sheet-primitives.md`.

Second, update `apps/web/src/components/ui/dialog.tsx`. Keep the Radix root, trigger, portal, close, title, and description wrappers. Replace the old centered fixed content structure with a T3-style `DialogViewport` wrapper, `DialogBackdrop` alias for overlay, `DialogPopup` implementation aliased as `DialogContent`, optional close button, `DialogPanel`, and footer variants. Preserve `showCloseButton`, `className`, and standard Radix content props.

Third, update `apps/web/src/components/ui/sheet.tsx`. Keep Radix root, trigger, close, and portal wrappers. Add `SheetBackdrop` as an overlay alias, `SheetPopup` as the implementation aliased to `SheetContent`, `SheetPanel`, and T3-style side and inset variant recipes. Preserve `side`, `showCloseButton`, `className`, `style`, custom data attributes, and the mobile sidebar ability to hide the built-in close button.

Fourth, add `apps/web/tests/unit/ui-dialog-sheet-primitives.test.tsx`. The tests should prove export compatibility, T3 alias availability, source recipe tokens for viewport/backdrop/popup/panel/footer surfaces, side handling for Sheet, and static rendering of plain panel/footer helpers.

Fifth, run focused validation. The meaningful user-facing risk is P2 normal product risk because these are shared UI primitives used by the mobile sidebar and confirmation dialogs, but this slice does not change auth, checkout, billing, persistent state, or external I/O. The source of truth is visible dialog/sheet markup and TypeScript compatibility for current imports. Must work: existing Dialog and Sheet imports, `showCloseButton`, `SheetContent side`, custom `data-slot` passthrough, and T3 alias imports. Must fail safely: Radix dismissal and focus behavior remain owned by Radix; hidden built-in close buttons remain hideable by existing selectors.

Sixth, run desktop/mobile browser proof with a temporary local route or an equivalent local proof harness, delete temporary route code before final validation, record the validation results, complete this ExecPlan, move it to `docs/exec-plans/completed/2026-05-14-t3-code-dialog-sheet-primitives.md`, and update the Program progress, completed ledger, and next slice.

## Milestones

Milestone 1 creates and validates the active ExecPlan. Success means the plan links to `planning-brief-4.md`, names the exact primitive files, and records the Radix compatibility decision.

Milestone 2 migrates Dialog and Sheet. Success means current exports keep compiling, T3 aliases are available, and both files carry T3 Code backdrop, viewport, popup, panel, close-button, and footer class recipes.

Milestone 3 adds focused primitive tests and app compatibility checks. Success means the test suite proves export compatibility and source recipe tokens, while existing app tests still render the Dialog/Sheet call sites they own.

Milestone 4 validates and records completion. Success means focused tests, app lint/typecheck, plan/program/docs lint, desktop/mobile browser proof or an exact limitation, and `git diff --check` pass, then the ExecPlan moves to completed and the Program ledger names the next slice.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Validate this plan before implementation:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-14-t3-code-dialog-sheet-primitives.md

Edit:

    apps/web/src/components/ui/dialog.tsx
    apps/web/src/components/ui/sheet.tsx
    apps/web/tests/unit/ui-dialog-sheet-primitives.test.tsx
    docs/exec-plans/active/2026-05-14-t3-code-dialog-sheet-primitives.md
    docs/programs/active/2026-05-14-t3-code-source-design-system-port/program.md

Run focused validation:

    bun run --cwd apps/web test:unit -- tests/unit/ui-dialog-sheet-primitives.test.tsx
    bun run --cwd apps/web test:unit -- tests/unit/codebase-section-draft-assistant.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/admin-impersonation-page.test.tsx

Run static and docs validation:

    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-dialog-sheet-primitives.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-dialog-sheet-primitives.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    git diff --check

If the plan is still active while running intermediate checks, use the active path for `plans:lint` and `markdown:lint`. Once it is moved to completed, use the completed path shown above.

## Validation and Acceptance

Acceptance requires Dialog and Sheet to keep their existing Radix-backed APIs and current call-site compatibility while carrying the T3 Code modal and sheet surface recipes. Dialog must expose `DialogContent` and `DialogPopup` as compatible content exports, plus `DialogBackdrop`, `DialogOverlay`, `DialogViewport`, and `DialogPanel`. Sheet must expose `SheetContent` and `SheetPopup` as compatible content exports, plus `SheetBackdrop`, `SheetOverlay`, `SheetPortal`, and `SheetPanel`. No package or lockfile change should be needed. Focused tests must prove export compatibility and T3-only class tokens. App lint and typecheck must pass. Browser proof should cover representative desktop and mobile render states.

### Test Commands

Run these commands from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run --cwd apps/web test:unit -- tests/unit/ui-dialog-sheet-primitives.test.tsx
    bun run --cwd apps/web test:unit -- tests/unit/codebase-section-draft-assistant.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/admin-impersonation-page.test.tsx
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-dialog-sheet-primitives.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-dialog-sheet-primitives.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    git diff --check

## Idempotence and Recovery

The primitive edits are local and deterministic. If a T3 selector does not compile in this app, replace only that selector with the closest Tailwind-supported equivalent and record it in the Decision Log. If a current call-site type breaks, preserve the existing Radix public API instead of changing route call sites. Do not add `@base-ui/react` in this slice without updating this plan first, adding dependency and lockfile changes, and running dependency validation. Do not touch generated-codebase output or Telegram widget CSS.

## Artifacts and Notes

Important source references:

    /Users/bazelrex/Developer/t3code/apps/web/src/components/ui/dialog.tsx
    /Users/bazelrex/Developer/t3code/apps/web/src/components/ui/sheet.tsx
    apps/web/src/components/ui/dialog.tsx
    apps/web/src/components/ui/sheet.tsx
    apps/web/src/components/ui/sidebar.tsx

No package or lockfile change should be needed because this slice deliberately avoids Base UI.

Plan lint before coding:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-14-t3-code-dialog-sheet-primitives.md
    docs/exec-plans/active/2026-05-14-t3-code-dialog-sheet-primitives.md: ok

Validation completed on 2026-05-14:

    bun run format
    Finished in 423ms on 1033 files using 12 threads.

    bun run --cwd apps/web test:unit -- tests/unit/ui-dialog-sheet-primitives.test.tsx
    1 file passed, 5 tests passed.

    bun run --cwd apps/web test:unit -- tests/unit/codebase-section-draft-assistant.test.tsx
    1 file passed, 7 tests passed.

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/admin-impersonation-page.test.tsx
    1 file passed, 2 tests passed.

    bun run --cwd apps/web lint
    Found 0 warnings and 0 errors.

    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    Next.js production build compiled, typechecked, and generated 103 static pages.

    bun lint
    App and package lint passed with 0 warnings and 0 errors.

    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck
    App production build, app typecheck, and package typechecks passed.

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-dialog-sheet-primitives.md
    docs/exec-plans/completed/2026-05-14-t3-code-dialog-sheet-primitives.md: ok

    bun run programs:lint
    Program docs, packets, and prompts passed.

    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-dialog-sheet-primitives.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    Markdown metadata lint passed for the completed plan and Program.

    git diff --check
    No whitespace errors.

Browser proof used the webpack dev server and a temporary route deleted before final validation:

    PLAYWRIGHT_BASE_URL=http://localhost:3012 node codex-scripts/prove-dialog-sheet-browser.mjs
    status: ok
    URL: http://localhost:3012/codex-dialog-sheet-proof
    verified slots: dialog-backdrop, dialog-viewport, dialog-popup, dialog-panel, sheet-backdrop, sheet-viewport, sheet-popup, sheet-panel
    verified class fragments: bg-popover, not-dark:bg-clip-padding, before:shadow-[0_1px_--theme(--color-black/4%)], data-[state=open]:animate-in, rounded-2xl, bg-white/48, dark:bg-black/28, max-w-md, sm:rounded-2xl, justify-end, sm:p-4
    screenshots: codex-scripts/artifacts/dialog-sheet-desktop-dialog.png, codex-scripts/artifacts/dialog-sheet-desktop-sheet.png, codex-scripts/artifacts/dialog-sheet-mobile-dialog.png, and codex-scripts/artifacts/dialog-sheet-mobile-sheet.png

## Interfaces and Dependencies

This slice depends on the existing `radix-ui` package, React 19, Tailwind CSS v4 selector support, `tailwind-merge` through `cn`, and the T3 Code token foundation in `apps/web/src/app/globals.css`. Dialog and Sheet remain shared UI primitives used by app confirmation flows and the responsive sidebar.
