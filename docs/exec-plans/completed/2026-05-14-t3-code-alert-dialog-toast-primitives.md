---
title: T3 Code Alert Dialog And Toast Primitives
status: complete
created_at: 2026-05-14
completed_at: 2026-05-14
summary: Move AlertDialog and toast surfaces toward T3 Code recipes while preserving current Radix and Sonner call-site compatibility.
post_build_recap: AlertDialog now carries T3 Code backdrop, viewport, popup, panel, media, title, description, and footer recipes on a Radix adapter, while Sonner keeps the toast runtime and receives exported T3-style toast class recipes with focused tests and desktop/mobile browser proof passing.
program_id: t3-code-source-design-system-port
planning_brief: docs/programs/active/2026-05-14-t3-code-source-design-system-port/planning-brief-4.md
read_when:
  - Resuming the AlertDialog and Toast primitive slice.
  - Reviewing destructive confirmation or toast compatibility during the T3 Code migration.
  - Checking whether AlertDialog or toast should stay Radix/Sonner-backed before adopting Base UI.
---

# T3 Code Alert Dialog And Toast Primitives

This document is a living execution plan for the AlertDialog and Toast primitive slice of the T3 Code source design-system port.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday still has a Radix-backed AlertDialog wrapper and a thin Sonner Toaster wrapper that carry older local styling. T3 Code defines richer alert dialog and toast recipes around backdrop, viewport, popup, footer, dense body, icon, action, and dismiss affordances. This slice adapts those recipes to Ship by Sunday's current Radix AlertDialog and Sonner APIs so destructive confirmation dialogs and runtime notifications visually match the T3 primitive system without changing existing call sites.

After this slice, existing AlertDialog imports should keep working, `toast.success`, `toast.error`, and related Sonner calls should keep their invocation behavior, and future T3-style code should be able to import honest aliases such as `AlertDialogPopup`, `AlertDialogBackdrop`, and `toastClassNames`.

## Progress

- [x] 2026-05-14: Read root and app agent instructions, Program packet, planning brief 4, Program and ExecPlan contracts, current AlertDialog and Sonner files, current call sites, Sonner type surface, and T3 Code `alert-dialog.tsx`, `toast.tsx`, `toast.logic.ts`, and `toastHelpers.ts`.
- [x] 2026-05-14: Created this active ExecPlan and recorded the Radix/Sonner adapter strategy before coding.
- [x] 2026-05-14: Validated the active plan with `plans:lint`.
- [x] 2026-05-14: Migrated AlertDialog recipes while preserving current exports and adding T3 aliases.
- [x] 2026-05-14: Migrated Sonner Toaster styling and exported class recipe helpers while preserving current toast invocation behavior.
- [x] 2026-05-14: Added focused primitive tests and reran existing toast/alert-dialog behavior tests.
- [x] 2026-05-14: Ran desktop/mobile browser proof through a temporary local route, then deleted the route before final validation.
- [x] 2026-05-14: Ran final format, app lint/typecheck, focused tests, and browser proof; repo and docs gates are recorded below.
- [x] 2026-05-14: Moved this ExecPlan to completed and updated the Program ledger with the next slice.

## Surprises & Discoveries

T3 Code uses Base UI for both alert dialogs and toasts. Ship by Sunday currently uses the bundled `radix-ui` package for AlertDialog and `sonner` for notification calls. Existing app code imports `AlertDialogContent`, `AlertDialogAction`, and `AlertDialogCancel`, while toast call sites import `toast` directly from `sonner`.

Sonner exposes class slots for toast, title, description, close button, icon, content, action button, and status variants. That means this slice can copy the visible T3 toast surface into the shared Toaster wrapper without wrapping or replacing every `toast.*` call.

The Browser plugin skill was available, but the required Node REPL JavaScript tool for the in-app browser was not exposed after tool discovery. Browser proof therefore used the repo's existing Playwright proof pattern with a temporary local route and ignored `codex-scripts/` artifacts.

## Decision Log

Decision: Keep AlertDialog Radix-backed in this slice.
Rationale: Current call sites rely on Radix `AlertDialogContent`, action/cancel semantics, portal behavior, and controlled open state. The preceding primitive slices copied T3 recipes onto Radix adapters, and AlertDialog can follow the same pattern without a dependency migration.
Date: 2026-05-14

Decision: Keep toast invocation on Sonner in this slice.
Rationale: App code imports `toast` directly from `sonner` in several runtime and test surfaces. Replacing those calls with T3 Code's Base UI toast manager would widen scope into route-level behavior and thread-specific T3 app code. Sonner class slots are enough to migrate the shared visible surface now.
Date: 2026-05-14

## Outcomes & Retrospective

This slice kept AlertDialog Radix-backed while copying T3 Code's alert dialog surface recipes into the shared UI layer. `apps/web/src/components/ui/alert-dialog.tsx` now exposes `AlertDialogBackdrop`, `AlertDialogOverlay`, `AlertDialogViewport`, `AlertDialogPopup`, `AlertDialogContent`, `AlertDialogPanel`, and `AlertDialogClose`, keeps `AlertDialogAction`, `AlertDialogCancel`, `AlertDialogMedia`, and `size`, and adds the T3 mobile bottom-stick behavior through `bottomStickOnMobile`.

This slice kept toast calls on Sonner while moving the visible shared Toaster surface toward T3 Code. `apps/web/src/components/ui/sonner.tsx` now exports `toastRootClassName`, `toastClassNames`, `toastStyle`, icon/action/description/title/close class constants, and uses Sonner `toastOptions.classNames` plus `closeButton` to render the bordered `bg-popover` toast surface, type-colored icons, dense title/description, T3 button actions, and dismiss orb.

The focused unit test proves export compatibility, real Radix AlertDialog render output, real Sonner toast render output, source recipe tokens, and absence of `@base-ui/react`. Existing codebase-page, Doctor Pass toast watcher, and Codex connection action tests passed. Browser proof used a temporary `/codex-alert-toast-proof` route that was deleted before final validation. No dependency or lockfile change was needed.

## Context and Orientation

The T3 Code source app is `/Users/bazelrex/Developer/t3code/apps/web`. The relevant source files are `/Users/bazelrex/Developer/t3code/apps/web/src/components/ui/alert-dialog.tsx`, `/Users/bazelrex/Developer/t3code/apps/web/src/components/ui/toast.tsx`, `/Users/bazelrex/Developer/t3code/apps/web/src/components/ui/toast.logic.ts`, and `/Users/bazelrex/Developer/t3code/apps/web/src/components/ui/toastHelpers.ts`.

The target shared files are `apps/web/src/components/ui/alert-dialog.tsx` and `apps/web/src/components/ui/sonner.tsx`. AlertDialog is used by codebase leave and Codex disconnect confirmation flows. Sonner's `Toaster` is mounted in `apps/web/src/app/layout.tsx`, while application code calls `toast` directly from `sonner`.

### In Scope

This plan updates `apps/web/src/components/ui/alert-dialog.tsx`, updates `apps/web/src/components/ui/sonner.tsx`, adds focused tests under `apps/web/tests/unit`, reruns relevant existing integration tests, and updates this ExecPlan plus `docs/programs/active/2026-05-14-t3-code-source-design-system-port/program.md`.

### Out Of Scope

This plan does not add `@base-ui/react`, replace Sonner's toast manager, change `toast.*` call sites, migrate generated codebase templates, update Telegram widget CSS, touch auth or checkout behavior, rewrite app-shell routes, or migrate route-level confirmation workflows beyond shared primitive rendering. Any temporary browser proof route must not remain in the final diff.

## Plan of Work

First, validate this active plan with `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-14-t3-code-alert-dialog-toast-primitives.md`.

Second, update `apps/web/src/components/ui/alert-dialog.tsx`. Keep the Radix root, trigger, portal, action, cancel, title, and description wrappers. Add `AlertDialogBackdrop`, `AlertDialogViewport`, `AlertDialogPopup`, `AlertDialogPanel`, and aliases that match T3 naming while keeping `AlertDialogContent` as the compatible content export. Preserve the existing `size` prop, `AlertDialogMedia`, action/cancel `variant` and `size` props, `className`, and data-slot passthrough behavior.

Third, update `apps/web/src/components/ui/sonner.tsx`. Keep the `Toaster` export and Sonner dependency. Add exported class recipe constants for toast root, content, title, description, icon, close button, action button, cancel button, loader, and type slots. Use Sonner `toastOptions.classNames`, icons, variables, `closeButton`, bottom-right positioning, and T3-style bordered `bg-popover` surface classes to approximate the T3 Code toast recipe without replacing the toast manager.

Fourth, add focused tests. The meaningful user-facing risk is P2 normal product risk because these shared primitives affect confirmation and notification UX, but this slice does not change persisted state, auth, checkout, billing, or external I/O. The source of truth is visible markup, class recipes, and existing toast call behavior. Must work: existing AlertDialog imports, action/cancel semantics, `size`, `AlertDialogMedia`, T3 alias imports, Toaster render with Sonner slots, Sonner toast invocations from existing watcher tests, and no Base UI dependency.

Fifth, run desktop/mobile browser proof with a temporary local route or equivalent local proof harness, delete temporary route code before final validation, record validation results, complete this ExecPlan, move it to `docs/exec-plans/completed/2026-05-14-t3-code-alert-dialog-toast-primitives.md`, and update the Program progress, completed ledger, and next slice.

## Milestones

Milestone 1 creates and validates the active ExecPlan. Success means the plan links to `planning-brief-4.md`, names the exact primitive files, and records the Radix/Sonner compatibility decision.

Milestone 2 migrates AlertDialog and Sonner. Success means current exports keep compiling, T3 aliases are available, AlertDialog carries T3 modal surface recipes, and Sonner carries T3 toast surface class recipes while app calls still use `sonner`.

Milestone 3 adds focused primitive tests and behavior checks. Success means tests prove export compatibility, visible slot classes, and existing toast/AlertDialog call sites still work.

Milestone 4 validates and records completion. Success means focused tests, app lint/typecheck, plan/program/docs lint, desktop/mobile browser proof or an exact limitation, and `git diff --check` pass, then the ExecPlan moves to completed and the Program ledger names the next slice.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Validate this plan before implementation:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-14-t3-code-alert-dialog-toast-primitives.md

Edit:

    apps/web/src/components/ui/alert-dialog.tsx
    apps/web/src/components/ui/sonner.tsx
    apps/web/tests/unit/ui-alert-dialog-toast-primitives.test.tsx
    docs/exec-plans/active/2026-05-14-t3-code-alert-dialog-toast-primitives.md
    docs/programs/active/2026-05-14-t3-code-source-design-system-port/program.md

Run focused validation:

    bun run --cwd apps/web test:unit -- tests/unit/ui-alert-dialog-toast-primitives.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/codebase-page.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-doctor-pass-toast-watcher.test.tsx

Run static and docs validation:

    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-alert-dialog-toast-primitives.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-alert-dialog-toast-primitives.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    git diff --check

If the plan is still active while running intermediate checks, use the active path for `plans:lint` and `markdown:lint`. Once it is moved to completed, use the completed path shown above.

## Validation and Acceptance

Acceptance requires AlertDialog to keep its existing Radix-backed API and current call-site compatibility while carrying T3 Code alert dialog surface recipes. It must expose `AlertDialogContent` and `AlertDialogPopup` as compatible content exports, plus `AlertDialogBackdrop`, `AlertDialogOverlay`, `AlertDialogViewport`, and `AlertDialogPanel`. Sonner must keep the `Toaster` export and current `sonner` toast invocation behavior while providing T3-style toast classes through Sonner's class slots. No package or lockfile change should be needed.

### Test Commands

Run these commands from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run --cwd apps/web test:unit -- tests/unit/ui-alert-dialog-toast-primitives.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/codebase-page.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-doctor-pass-toast-watcher.test.tsx
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-alert-dialog-toast-primitives.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-alert-dialog-toast-primitives.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    git diff --check

## Idempotence and Recovery

The primitive edits are local and deterministic. If a T3 selector does not compile in this app, replace only that selector with the closest Tailwind-supported equivalent and record it in the Decision Log. If a current call-site type breaks, preserve the existing Radix or Sonner public API instead of changing route behavior. Do not add `@base-ui/react` or replace Sonner in this slice without updating this plan first, adding dependency and lockfile changes, and running dependency validation. Do not touch generated-codebase output or Telegram widget CSS.

## Artifacts and Notes

Important source references:

    /Users/bazelrex/Developer/t3code/apps/web/src/components/ui/alert-dialog.tsx
    /Users/bazelrex/Developer/t3code/apps/web/src/components/ui/toast.tsx
    /Users/bazelrex/Developer/t3code/apps/web/src/components/ui/toast.logic.ts
    /Users/bazelrex/Developer/t3code/apps/web/src/components/ui/toastHelpers.ts
    apps/web/src/components/ui/alert-dialog.tsx
    apps/web/src/components/ui/sonner.tsx
    apps/web/src/app/layout.tsx
    apps/web/src/app/(app)/_components/codebase-flow/codebase-stage-leave-dialog.tsx
    apps/web/src/app/(app)/_components/codex-connection-card/codex-connection-card-disconnect-dialog.tsx
    apps/web/src/app/(app)/_components/existing-codebase-doctor-pass/workspace-doctor-pass-toast-watcher.tsx

No package or lockfile change should be needed because this slice deliberately avoids Base UI and reuses Radix plus Sonner.

Plan lint before coding:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-14-t3-code-alert-dialog-toast-primitives.md
    docs/exec-plans/active/2026-05-14-t3-code-alert-dialog-toast-primitives.md: ok

Validation completed on 2026-05-14:

    bun run format
    Finished in 363ms on 1036 files using 12 threads.

    bun run --cwd apps/web test:unit -- tests/unit/ui-alert-dialog-toast-primitives.test.tsx
    1 file passed, 5 tests passed.

    bun run --cwd apps/web test:unit -- tests/unit/ui-alert-dialog-toast-primitives.test.tsx tests/unit/codex-connection-card-actions.test.tsx
    2 files passed, 7 tests passed.

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/codebase-page.test.tsx tests/integration-ui/workspace-doctor-pass-toast-watcher.test.tsx
    2 files passed, 7 tests passed.

    bun run --cwd apps/web lint
    Found 0 warnings and 0 errors.

    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    Next.js production build compiled, typechecked, and generated 103 static pages.

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-alert-dialog-toast-primitives.md
    docs/exec-plans/completed/2026-05-14-t3-code-alert-dialog-toast-primitives.md: ok

    bun run programs:lint
    Program docs, packets, and prompts passed.

    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-alert-dialog-toast-primitives.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    Markdown metadata lint passed for the completed plan and Program.

    bun lint
    App and package lint passed with 0 warnings and 0 errors.

    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck
    App production build, app typecheck, and package typechecks passed.

    git diff --check
    No whitespace errors.

Browser proof used the webpack dev server and a temporary route deleted before final validation:

    PLAYWRIGHT_BASE_URL=http://localhost:3014 node codex-scripts/prove-alert-toast-browser.mjs
    status: ok
    URL: http://localhost:3014/codex-alert-toast-proof
    verified slots: alert-dialog-backdrop, alert-dialog-viewport, alert-dialog-popup, alert-dialog-panel, toast-root, toast-icon, toast-close
    screenshots: codex-scripts/artifacts/alert-toast-desktop-alert-dialog.png, codex-scripts/artifacts/alert-toast-desktop-toast.png, codex-scripts/artifacts/alert-toast-mobile-alert-dialog.png, and codex-scripts/artifacts/alert-toast-mobile-toast.png

## Interfaces and Dependencies

This slice depends on the existing `radix-ui` package, `sonner`, `next-themes`, React 19, Tailwind CSS v4 selector support, `tailwind-merge` through `cn`, and the T3 Code token foundation in `apps/web/src/app/globals.css`. AlertDialog remains a shared confirmation primitive, and Sonner remains the shared notification runtime mounted by the root layout.
