---
title: AppShell Chrome Level Up
status: active
created_at: 2026-05-02
completed_at: null
summary: Lift the workspace AppShell chrome from the Linear/Vercel parity baseline that the prior polish pass landed (`docs/exec-plans/active/2026-05-02-app-shell-polish.md`) to a level where a returning user navigating between `/blueprint`, `/review`, and `/lesson/*` notices a perceptible smoothness lift — a ⌘K command menu, a scroll-aware header shadow, route-change focus restoration, persistent shell preferences with a working local-nav collapse, a shared theme-toggle view transition, dropdown reduced-motion gated at the shared primitive, and a synthesized compact local-nav fallback so every mobile view has a usable local nav.
post_build_recap: null
read_when:
  - Resuming the AppShell level-up pass mid-flight.
  - Reviewing the level-up diff against the locked behavior contract.
  - Writing follow-up polish work on the workspace shell or the marketing top-bar.
---

# AppShell Chrome Level Up

This is a living execution plan. Update it at every stopping point so the next contributor can resume from this file alone.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The workspace AppShell wraps every authenticated view with a persistent header, optional local nav rail, optional footer skill rail, primary navigation, theme toggle, and user menu. The prior polish pass (`docs/exec-plans/active/2026-05-02-app-shell-polish.md`) landed the parity baseline (semantic header, outline theme toggle, combined primary-nav active state, focus rings, reduced-motion gating on the user menu, footer rail dark-mode parity, skip-to-content link). This level-up pass keeps that contract and adds the missing premium affordances so the shell stops reading as "clean shadcn" and starts reading as a deliberate product surface.

A human can prove the outcome by visiting `/blueprint`, `/review`, and one `/lesson/[key]` route, pressing `⌘K` to open the new command menu and arrow-key + Enter to navigate to a stage, watching the header grow a quiet `shadow-sm` only after scrolling, clicking a primary-nav link and seeing focus land on `#app-shell-main` (the skip-to-content target) rather than on the link itself, collapsing the xl+ local nav rail with the new chevron toggle and reloading to confirm the collapse persists, toggling between light and dark and seeing a cross-fade rather than a hard flip when the API supports it, and resizing to mobile to confirm `/review` and `/lesson/*` now render a `<details>` disclosure for the local nav rather than nothing.

The pass remains surgical: no `AppShellProps` shape change, no nav-model edits, no active-block calculation changes, no leave-guard changes, no theme-provider changes, no new `bg-primary` or `text-primary` styling. One new third-party dependency: `cmdk` pinned at `1.1.1`. Every existing `data-testid` is preserved; new ones are namespaced `app-shell-*`. Every in-scope component stays under 150 lines.

## Progress

- [x] 2026-05-02: Author this ExecPlan.
- [x] 2026-05-02: Slice 1 — shared theme view transition (`apps/web/lib/theme/start-theme-transition.ts` + workspace and marketing toggles).
- [x] 2026-05-02: Slice 2 — scroll-aware header shadow (`use-header-scroll-shadow` hook + integration-ui test).
- [x] 2026-05-02: Slice 3 — shell preferences hook (`app-shell-preferences-store` + `use-app-shell-preferences` + integration-ui test).
- [x] 2026-05-02: Slice 4 — local-nav collapse + compact fallback (xl+ chevron toggle, synthesized `<details>` compact disclosure when `compact` is missing, `data-testid="app-shell-local-nav-collapse"`).
- [x] 2026-05-02: Slice 5 — route-change focus restoration via `usePathname()` + ref + `focus({ preventScroll: true })`.
- [x] 2026-05-02: Slice 6 — dropdown reduced-motion lifted to `DropdownMenuContent` + `DropdownMenuSubContent` in the shared primitive; redundant call-site override removed from `app-shell-user-menu.tsx`.
- [x] 2026-05-02: Slice 7 — command menu (`cmdk@1.1.1` pinned, `AppShellCommandMenu` + `AppShellCommandMenuItems` mounted in `AppShellHeaderTrailing`, ⌘K keybinding bound at the shell trigger, `app_shell_command_menu_opened` PostHog event with `source: "keyboard" | "click"`, integration-ui test green).
- [x] 2026-05-02: Slice 0 + Slice 8 — automated validation matrix green (focused tests + repo-level format/lint/typecheck). Manual browser proof of the prior pass and of the new affordances was attempted via a backgrounded browser-use subagent against the running dev server; see `Outcomes & Retrospective` for what was captured and what remains pending due to the hosted-Convex / Clerk auth gate that protects the workspace routes.

## Surprises & Discoveries

The brief lists the new hook tests under `tests/unit/`, but the `unit` project in `apps/web/vitest.config.ts` runs in `environment: "node"`. Both `useHeaderScrollShadow` and `useAppShellPreferences` need a DOM (the former listens on `window` and a real element; the latter touches `localStorage` and dispatches `storage` events). Per the prior pass's same surprise, both new hook tests live under `tests/integration-ui/` (which is `environment: "jsdom"`). The behavior coverage requested by the brief is preserved.

`cmdk@1.1.1`'s internal `scrollIntoView` call hits jsdom's "not implemented" stub when the menu opens. Adding a no-op `Element.prototype.scrollIntoView` to `apps/web/tests/setup/jsdom.ts` (gated behind `typeof Element.prototype.scrollIntoView !== "function"`) fixes the new command-menu test without affecting any other test. This is a benign jsdom shim.

The `cmdk` ships its own `CommandDialog` wrapper, but it does not render a `Dialog.Title`, so Radix logs an a11y warning ("`DialogContent` requires a `DialogTitle`"). Switching to a hand-rolled `Dialog.Root + Portal + Overlay + Content + Title (sr-only) + Description (sr-only) + Command` composition silences the warning, gives the menu a real accessible name, and lets the menu reuse the same `motion-reduce:` overrides the rest of the shell's animated surfaces use.

The blueprint stage IDs in `packages/blueprint-compiler` are `"blueprint" | "review"` (not `north-star | audience | design`), and `BlueprintStageStatus` requires `currentStepIndex` and `missingFactKeys`. The first draft of the command-menu test fixture invented stage IDs and missed those required fields; aligning the fixture to the real shape made the test pass cleanly.

The broader `tests/integration-ui tests/unit` run surfaced three pre-existing test timeouts in the working tree: `tests/integration-ui/blueprint-page.test.tsx > saves partial work on continue and reveals the remaining blockers`, `tests/integration-ui/blueprint-page.test.tsx > re-seeds the design fields when a curated preset is selected`, and several cases in `tests/unit/app-workspace-lesson-page.test.tsx`. A clean bisect confirmed the failures reproduce with all my changes stashed (so they are not caused by this pass). The prior pass already flagged the first one as a concurrency flake; the rest of the new timeouts come from working-tree changes added since the prior pass shipped (the `?? apps/web/tests/unit/app-workspace-blueprint-review-routes.test.tsx` and `M apps/web/tests/unit/app-workspace-lesson-page.test.tsx` files in `git status` belong to other in-flight work). Flagged as inherited flakes, not regressions.

The audit of `localNav` callers found that both `/review` (`apps/web/app/(workspace)/review/_components/blueprint-review-page.tsx`) and `/lesson/[key]` (`apps/web/app/(workspace)/_components/execute-ship/bonus-lesson-page.tsx`) provide `desktop` only and no `compact`. Rather than asking each page to invent its own compact rail, this pass synthesizes a `<details>` disclosure inside `AppShellLocalNavRail` when `compact` is missing. The disclosure renders the same `desktop` tree wrapped in a `<details>`/`<summary>` so the same nav model drives both densities. This is the brief's "preferred" path applied as a single canonical fallback at the rail boundary rather than per-page duplication.

The product-shell snapshot test (`tests/unit/product-shell.test.tsx`) asserts on the literal aside `className`. The xl+ collapse toggle in slice 4 was therefore added as an additive `mb-2 hidden xl:flex …` button row above the rail content, with the existing aside `className` preserved character-for-character in the default (`collapsed === false`) state so the snapshot test continues to match. The `cn()` order `cn("hidden min-h-0 min-w-0 xl:sticky xl:top-3 xl:block xl:self-start", collapsed ? "xl:pr-0" : "xl:border-r xl:border-border/60 xl:pr-6")` produces exactly `"hidden min-h-0 min-w-0 xl:sticky xl:top-3 xl:block xl:self-start xl:border-r xl:border-border/60 xl:pr-6"` when not collapsed.

## Decision Log

Decision: Keep `layoutMode` per-lesson in `apps/web/app/(workspace)/_hooks/course/lesson/use-lesson-chrome-state.ts` and use `useAppShellPreferences()` only for genuinely global preferences (`localNavCollapsed` today, `layoutMode` reserved as a default seed for future caller-controlled pages without per-lesson policy).
Rationale: `useLessonChromeState` runs `normalizeLayoutModeForLesson` (some lessons force `focus`). Replacing per-lesson `layoutMode` with one global key would silently override lesson-designer intent. Convex-backed state stays untouched.
Date: 2026-05-02

Decision: Ship `localNavCollapsed` with a real UI affordance (a chevron toggle in the xl+ aside, plus a "Toggle local navigation" item in the command menu).
Rationale: A persisted preference with no on-page control is invisible to users. The chevron gives keyboard + pointer parity; the command-menu twin gives ⌘K access without leaving the keyboard.
Date: 2026-05-02

Decision: Synthesize a `<details>` disclosure in `AppShellLocalNavRail` when `compact` is missing, instead of requiring every caller to provide a custom compact tree.
Rationale: The brief allows either path. One canonical fallback at the rail boundary keeps the nav model authoritative (the `desktop` tree is reused) and removes a class of "this view has nav holes on mobile" bugs without scattering compact-rail decisions across the workspace.
Date: 2026-05-02

Decision: Replace `cmdk`'s `CommandDialog` wrapper with a hand-rolled `radix-ui` `Dialog.Root + Portal + Overlay + Content + Title + Description + Command` composition.
Rationale: `cmdk@1.1.1`'s `CommandDialog` does not render a `Dialog.Title`, which fires Radix's a11y console warning. Composing the dialog ourselves gives an sr-only accessible name + description, lets us reuse the workspace `motion-reduce:` token set, and avoids depending on an internal cmdk layout choice.
Date: 2026-05-02

Decision: Lift the dropdown reduced-motion override from the `AppShellUserMenu` call site into `DropdownMenuContent` + `DropdownMenuSubContent` in the shared primitive at `apps/web/components/ui/dropdown-menu.tsx`.
Rationale: The override only fires under `prefers-reduced-motion: reduce`; in normal motion preferences it is a no-op. The blast radius is small: in `apps/web` the only consumer is the user-menu surface (`apps/web/app/(workspace)/_components/app-shell/app-shell-user-menu.tsx`, `app-shell-user-menu-account.tsx`, `app-shell-user-menu-workspace-items.tsx`). Lifting the gate now preserves the prior pass's intent without rewriting it at every future call site.
Date: 2026-05-02

Decision: Mount the command-menu trigger inside `AppShellHeaderTrailing`, between the layout toggle / progress span and the theme toggle, and pipe `primaryNav` from `AppShellHeader` into the trailing component.
Rationale: The trailing component already owns the workspace-personal controls (layout toggle, theme toggle, user menu); the command menu is the keyboard-first counterpart of that surface. Threading `primaryNav` through is the smallest change that lets the menu reuse the existing nav model without duplicating it.
Date: 2026-05-02

Decision: Bind the global `⌘K` keybinding inside `AppShellCommandMenu` itself rather than at the shell root.
Rationale: The menu is always mounted via `AppShellHeaderTrailing` whenever the shell renders. Owning the keybinding inside the menu keeps the open/close state, the shortcut, and the PostHog telemetry in one self-contained component, and avoids polluting `app-shell.tsx` with key handlers it does not otherwise need.
Date: 2026-05-02

Decision: Pin `cmdk` exactly at `1.1.1` (no caret) in `apps/web/package.json`.
Rationale: The brief says one new dependency only and asks for an explicit pin. `1.1.1` is the latest published as of 2026-05-02 and matches the React 18/19 peer range the repo runs on. Lockfile updated.
Date: 2026-05-02

Decision: Extract `startThemeTransition` into `apps/web/lib/theme/start-theme-transition.ts` and consume it from both `AppShellThemeToggle` and the marketing `ThemeToggleButton`. Keep the helper a non-hook function that takes `{ apply, allowAnimation }`; let each consumer compute its own `useReducedMotion()` gate.
Rationale: The helper is a small SSR-safe seam (`typeof document` guard + `document.startViewTransition?` invocation). Keeping it a non-hook avoids cascading the hook rules into a presentational primitive and lets server-only render paths import it harmlessly.
Date: 2026-05-02

## Outcomes & Retrospective

Source-producing slices: 1, 2, 3, 4, 5, 6, 7 all produced source changes. Slices 0 and 8 are validation-and-writeback slices.

Files changed in this pass:

- `apps/web/lib/theme/start-theme-transition.ts` — new helper exporting `startThemeTransition({ apply, allowAnimation })`, gated on `typeof document` and `document.startViewTransition`, falls through to `apply()` when motion is reduced or the API is absent.
- `apps/web/app/(workspace)/_components/app-shell/app-shell-theme-toggle.tsx` — calls `startThemeTransition` with `allowAnimation: !prefersReducedMotion` (using `useReducedMotion` from `motion/react`).
- `apps/web/app/_components/theme-toggle-button.tsx` — same shared transition helper applied to the marketing toggle.
- `apps/web/app/(workspace)/_hooks/app-shell/use-header-scroll-shadow.ts` — new client hook that listens on both `window` (covers `appScrollMode === "page"` and sub-xl content scroll) and `#app-shell-main` (covers `viewportMode === "app" + appScrollMode === "viewport"` xl-overflow-hidden case), `requestAnimationFrame`-throttled.
- `apps/web/app/(workspace)/_hooks/app-shell/use-app-shell-preferences.ts` — new client hook over the new store using `useSyncExternalStore`, exposes `{ preferences, setPreferences, toggleLocalNavCollapsed }`.
- `apps/web/app/(workspace)/_components/app-shell/app-shell-preferences-store.ts` — single `localStorage` boundary; namespaced key `ship-by-sunday:app-shell-preferences`, in-tab cache, `storage` event listener for cross-tab updates, `resetAppShellPreferencesForTests()` helper.
- `apps/web/app/(workspace)/_components/app-shell.tsx` — wires `useHeaderScrollShadow` (toggling `border-border/60 shadow-none` ↔ `border-border/30 shadow-sm` with `transition-shadow duration-200 motion-reduce:transition-none`), wires `useAppShellPreferences` (resizing the xl+ grid track to `3rem` when collapsed), and adds the route-change focus effect against `usePathname()` (skipping the initial mount via `useRef`, calling `focus({ preventScroll: true })`).
- `apps/web/app/(workspace)/_components/app-shell/app-shell-local-nav.tsx` — accepts `collapsed` and `onToggleCollapsed` props, renders the xl+ chevron toggle (`data-testid="app-shell-local-nav-collapse"`, `aria-expanded`, `aria-controls="app-shell-local-nav-content"`, `aria-label` flips between "Collapse local navigation" and "Expand local navigation"), and synthesizes a `<details>` compact disclosure when `localNav.compact` is undefined.
- `apps/web/components/ui/dropdown-menu.tsx` — appends `motion-reduce:duration-0 motion-reduce:data-open:animate-none motion-reduce:data-closed:animate-none` to `DropdownMenuContent` and `DropdownMenuSubContent`, lifting the prior call-site gate into the shared primitive.
- `apps/web/app/(workspace)/_components/app-shell/app-shell-user-menu.tsx` — drops the now-redundant `motion-reduce:animate-none motion-reduce:transition-none motion-reduce:duration-0` className from `DropdownMenuContent`.
- `apps/web/app/(workspace)/_components/app-shell/app-shell-header.tsx` — pipes `primaryNav` into `AppShellHeaderTrailing`.
- `apps/web/app/(workspace)/_components/app-shell/app-shell-header-trailing.tsx` — accepts `primaryNav`, mounts `<AppShellCommandMenu primaryNav={primaryNav} />` between the layout toggle and the theme toggle.
- `apps/web/app/(workspace)/_components/app-shell/app-shell-command-menu.tsx` — new component. Outline trigger button with a `⌘K` `<kbd>`, hand-rolled Radix Dialog (Root + Portal + Overlay + Content + sr-only Title + sr-only Description) wrapping a cmdk `Command` with `loop`, listens once for `⌘K` / `Ctrl+K` globally, fires `capturePostHogProductEvent({ event: "app_shell_command_menu_opened", properties: { source: "keyboard" | "click" } })` on open, closes on Escape and overlay click.
- `apps/web/app/(workspace)/_components/app-shell/app-shell-command-menu-items.tsx` — new component. Composes from existing nav models without duplicating them: `buildBlueprintStageNavItems(...)` (filtered to `state === "active" | "available"`), `primaryNav.postReviewItems` (links flattened, menu children flattened, the `showLessonMap` action surfaced as a Map item), `workspaceMenuLinks(pathname)`, theme set (Light / Dark / System through `startThemeTransition`), `Toggle local navigation` (calls the preferences hook), `Sign out` (Clerk `signOut({ redirectUrl: routeConfig.home })`).
- `apps/web/tests/setup/jsdom.ts` — adds a no-op `Element.prototype.scrollIntoView` shim so cmdk works in jsdom.
- `apps/web/tests/integration-ui/use-header-scroll-shadow.test.ts` — new test covering the `0 → 40 → 0` transition both via `window.scrollY` and via inner-element `scrollTop`.
- `apps/web/tests/integration-ui/use-app-shell-preferences.test.ts` — new test covering default, `localStorage` hydration, malformed-input fallback, write-through, toggle helper, multi-hook subscribe propagation, and the SSR-safe direct-read default.
- `apps/web/tests/integration-ui/app-shell-command-menu.test.tsx` — new test covering `⌘K` open + Escape close, click-trigger open + click PostHog event, ⌘K open + keyboard PostHog event, blueprint stage navigation via the router, theme item invokes `setTheme`, and Sign out invokes Clerk's `signOut`.
- `apps/web/package.json` + `bun.lock` — `cmdk@1.1.1` pinned.

Validation matrix (commands run at 2026-05-02):

- `bun run format` — ok (841 files, oxfmt).
- `bun lint` — ok (0 warnings, 0 errors).
- `bun typecheck` — ok (production build completed; full route sitemap emitted).
- `bun run --cwd apps/web vitest run tests/unit/product-shell.test.tsx tests/integration-ui/use-header-scroll-shadow.test.ts tests/integration-ui/use-app-shell-preferences.test.ts tests/integration-ui/app-shell-theme-toggle-parity.test.tsx tests/integration-ui/app-shell-command-menu.test.tsx` — 21 / 21 passed.
- `bun run --cwd apps/web vitest run tests/integration-ui tests/unit` — 658 / 661 passed (3 pre-existing flakes documented in `Surprises & Discoveries`; bisect-confirmed not regressions).

Manual browser proof — captured for the prior pass at the existing running dev server. The browser-use subagent signed in with `test-entitled@test.com` (credentials live in `.agents/skills/QA-Browser/references/internal-test-accounts.json`) and produced the following screenshots under `/var/folders/z4/0mjj1q8n0v17xyfyfvc11vx40000gn/T/cursor/screenshots/`:

- `marketing-home-dark-fullpage.png`, `marketing-home-light-fullpage.png` (marketing homepage at desktop 1440x900 in both themes)
- `marketing-header-dark.png`, `marketing-header-light.png` (top-bar crops in both themes)
- `workspace-blueprint-light-desktop.png`, `workspace-blueprint-dark-desktop.png` (`/blueprint` at desktop 1440x900 in both themes)
- `workspace-blueprint-header-light-desktop.png`, `workspace-blueprint-header-dark-desktop.png` (workspace header crops in both themes)
- `workspace-blueprint-dark-mobile.png` (`/blueprint` at mobile 390x844 in dark mode)
- `workspace-user-menu-open-dark-desktop.png` (user menu open with the prior pass's name + email + Workspace / Review / Settings / Account / Sign out items visible)

The subagent reported "no visible regressions observed" against the prior pass's locked contract. The `?marketing=1` variant rendered identically to `/`. The marketing → workspace handoff (theme toggle chrome, header height, primary-nav active state, user-menu items) read as one product across the captures.

What this pass did NOT capture and remains pending for the next operator:

- `/review` and `/lesson/[key]` at desktop 1440 + mobile 390 in light + dark.
- Mobile light-mode `/blueprint` (only mobile dark was captured).
- Keyboard Tab walk sequence (skip-link → brand → stage nav → post-review nav → layout toggle → command menu → theme toggle → user menu) with the focus ring visible at every stop.
- User menu opened under `prefers-reduced-motion: reduce` (Chrome DevTools rendering panel emulation).
- Footer rail dark-mode parity at sub-xl widths.
- All five new affordances from this level-up pass: command menu open via ⌘K and click (normal motion + reduced motion), header shadow rest vs scrolled on `/blueprint`, theme-toggle cross-fade frames (before / during / after), `#app-shell-main` outline visible after a primary-nav click, local-nav collapse persisted across reload, the `<details>` disclosure on `/review` and `/lesson/*` at mobile 390.

Handoff for the remaining manual browser proof: keep the dev stack on port 3000 (or restart with `bun run --cwd apps/web dev:web`), sign in with `test-entitled@test.com` (password in `.agents/skills/QA-Browser/references/internal-test-accounts.json`), then walk the routes above. Compare each frame to the locked behavior contract in the prior pass's `Outcomes & Retrospective`. If any premium affordance reads worse than the parity baseline (header shadow flickers, focus-restoration steals scroll, command menu pops in late, dropdown animation under reduced motion still plays), repair with the narrowest possible surface change and append a `Surprises & Discoveries` entry here.

`bg-primary` / `text-primary` tracking list, carried forward verbatim from `docs/exec-plans/active/2026-05-02-app-shell-polish.md` (Slice 0 of this pass added zero new occurrences, since the new components use only `text-foreground`, `text-muted-foreground`, `bg-popover`, `bg-background`, `border-border/*`, and `bg-muted/*`):

- `apps/web/app/(workspace)/_components/workspace-home/*` — outside this shell pass.
- `apps/web/app/(workspace)/_components/course/shared/skill-rail-shadcn-step*` — outside this shell pass.
- `apps/web/app/(workspace)/_components/mission-sprint-route-row.tsx` — outside this shell pass.

Lessons learned: the brief asked the new hook tests to live in `tests/unit/`, but the unit project runs in node; integration-ui (jsdom) is the only correct project for hooks that touch DOM/window/storage. The cmdk default `CommandDialog` is fine for unstyled prototypes but not for production accessibility — a hand-rolled Radix Dialog wrapper is the right level of glue. The synthesized `<details>` disclosure in `AppShellLocalNavRail` is a small but high-leverage win: every workspace view at sub-xl now ships a real local-nav fallback for free, with no per-page work. Pinning third-party deps with no caret is repo-aligned; the bun.lock diff stays minimal.

## Context and Orientation

The workspace AppShell lives at `apps/web/app/(workspace)/_components/app-shell.tsx` and is consumed by every authenticated page under `apps/web/app/(workspace)/`. The shell composes a header (`apps/web/app/(workspace)/_components/app-shell/app-shell-header.tsx`) with a primary nav (`apps/web/app/(workspace)/_components/app-shell/app-shell-primary-nav.tsx` driven by the nav models in `apps/web/lib/blueprint-flow/blueprint-stage-nav-model.ts` and `apps/web/lib/workspace-navigation/build-primary-nav-model.ts`), a trailing block with the layout toggle, the new command menu, the theme toggle, and the user menu (`apps/web/app/(workspace)/_components/app-shell/app-shell-header-trailing.tsx`), an optional local nav rail (`apps/web/app/(workspace)/_components/app-shell/app-shell-local-nav.tsx`), and an optional footer skill rail (`apps/web/app/(workspace)/_components/app-shell/app-shell-footer-rail.tsx`).

The marketing top-bar lives at `apps/web/app/_components/topbar.tsx` and consumes the shared theme-toggle primitive at `apps/web/app/_components/theme-toggle-button.tsx`. Shell-local theme work in this pass also touches the marketing primitive so both surfaces share the same view-transition seam at `apps/web/lib/theme/start-theme-transition.ts`.

Persisted shell preferences live entirely inside `apps/web/app/(workspace)/_components/app-shell/app-shell-preferences-store.ts` (the only module that touches `localStorage`) and are read through `apps/web/app/(workspace)/_hooks/app-shell/use-app-shell-preferences.ts` (a `useSyncExternalStore` wrapper).

Telemetry uses `capturePostHogProductEvent({ event, properties })` exported from `apps/web/lib/observability/posthog-client.ts`. Hosted Convex dev / Clerk middleware gate every workspace route at the dev server.

### In Scope

- One new dependency: `cmdk@1.1.1` pinned in `apps/web/package.json` and `bun.lock`.
- New helper, hooks, store, components, and test files as enumerated in `Outcomes & Retrospective`.
- Behavior changes inside `AppShellLocalNavRail`, `AppShellHeader`, `AppShellHeaderTrailing`, `AppShellThemeToggle`, the marketing `ThemeToggleButton`, the AppShell root, the shared `DropdownMenu` primitive, and the user-menu call site.
- A synthesized `<details>` compact local-nav fallback applied to every existing caller without per-page edits.

### Out Of Scope

- Any change to `AppShellProps`, the active-block calculation, the leave-guard pattern, the nav models in `apps/web/lib/workspace-navigation/` or `apps/web/lib/blueprint-flow/`, the lesson manifest, the `next-themes` provider config, or the Convex schema.
- Any new `bg-primary` or `text-primary` styling.
- Any sub-`lg` primary-nav behavior shift (the horizontal scroll pattern from the prior pass is preserved). The brief lists "replace the sub-`lg` primary-nav with a disclosure menu tied to the command menu" as stretch only; it is deferred.
- Any notification surface in the header. Listed as stretch only; deferred.
- Any change to the Convex-backed lesson `layoutMode` persistence in `apps/web/app/(workspace)/_hooks/course/lesson/use-lesson-chrome-state.ts`.

## Plan of Work

Slice 1: extract the shared `startThemeTransition` helper into `apps/web/lib/theme/start-theme-transition.ts` and have both `AppShellThemeToggle` and the marketing `ThemeToggleButton` route their `setTheme` call through it, with `allowAnimation: !prefersReducedMotion`.

Slice 2: add `useHeaderScrollShadow` at `apps/web/app/(workspace)/_hooks/app-shell/use-header-scroll-shadow.ts`, listening on both `window` and `#app-shell-main` with `requestAnimationFrame` throttling. Apply the boolean to the header `className` in `app-shell.tsx` so a quiet `shadow-sm` lifts on scroll. Test the `0 → 40 → 0` transition both via window scroll and via inner-element scroll under jsdom.

Slice 3: add `apps/web/app/(workspace)/_components/app-shell/app-shell-preferences-store.ts` (the only module that touches `localStorage`) and `apps/web/app/(workspace)/_hooks/app-shell/use-app-shell-preferences.ts` (a `useSyncExternalStore` wrapper). SSR-safe default `{ layoutMode: "split", localNavCollapsed: false }`. Cover hydration, malformed-input fallback, write-through, toggle helper, and cross-hook subscribe propagation.

Slice 4: add an xl+ chevron toggle to `app-shell-local-nav.tsx` wired to `useAppShellPreferences().toggleLocalNavCollapsed`. Synthesize a `<details>` compact disclosure when `localNav.compact` is undefined so `/review` and `/lesson/*` get a real local nav at mobile widths.

Slice 5: add a `usePathname()`-driven `useEffect` in `app-shell.tsx` that focuses `#app-shell-main` on path change, skipping the initial mount via a `useRef` and using `focus({ preventScroll: true })`.

Slice 6: lift the user-menu reduced-motion override into `DropdownMenuContent` and `DropdownMenuSubContent` in the shared primitive at `apps/web/components/ui/dropdown-menu.tsx`. Drop the now-redundant override at the call site in `app-shell-user-menu.tsx`.

Slice 7: pin `cmdk@1.1.1`. Build `app-shell-command-menu.tsx` (trigger + Radix Dialog wrapper + cmdk `Command` + ⌘K binding + PostHog event) and `app-shell-command-menu-items.tsx` (composed from the existing nav models). Mount in `AppShellHeaderTrailing` with `primaryNav` piped through. Cover with an integration-ui test.

Slice 8: motion sweep (every new transition is gated by `useReducedMotion` or `motion-reduce:`), focused tests, broader suites, repo-level format/lint/typecheck, plan + markdown lints, and writeback to this ExecPlan.

## Milestones

Milestone 1 — Theme transition seam (Slice 1). At the end, both the workspace and marketing theme toggles share `startThemeTransition`. Run `bun run --cwd apps/web vitest run tests/integration-ui/app-shell-theme-toggle-parity.test.tsx`. Success: parity test green; toggling theme in a browser cross-fades when supported.

Milestone 2 — Scroll-aware header shadow (Slice 2). At the end, `useHeaderScrollShadow` ships and the header className flips on the inner main scroll or window scroll. Run the new hook test plus `tests/unit/product-shell.test.tsx`. Success: 0 → 40 → 0 transitions deterministic; product-shell snapshot still matches.

Milestone 3 — Persistent preferences (Slice 3). At the end, `useAppShellPreferences` is the only place outside `app-shell-preferences-store.ts` that touches the namespaced `localStorage` key. Run the new hook test. Success: 7 of 7 cases green covering default, hydrate, malformed, write-through, toggle, propagate, SSR-safe.

Milestone 4 — Local-nav UX (Slice 4). At the end, the xl+ rail collapses on demand and persists across reloads, and every sub-xl view ships a `<details>` disclosure local nav. Run `tests/unit/product-shell.test.tsx` to confirm the literal aside className still matches in the default state. Success: snapshot test green; manual browser sweep on `/review` mobile shows a `<details>` summary with the rail content inside.

Milestone 5 — Route-change focus (Slice 5). At the end, clicking a primary-nav link lands focus on `#app-shell-main` rather than on the link itself. Run `tests/unit/product-shell.test.tsx`. Success: snapshot test green; manual keyboard walk shows a focus ring on the main wrapper after navigation.

Milestone 6 — Dropdown reduced-motion in the primitive (Slice 6). At the end, every dropdown across `apps/web` honors `prefers-reduced-motion` without per-call-site overrides. Run the integration-ui suite. Success: every existing dropdown consumer keeps working; the user-menu test still asserts the rendered markup that the prior pass added.

Milestone 7 — Command menu (Slice 7). At the end, ⌘K opens a real command palette with all the items the brief listed, the open event reaches PostHog, and the test covers the open/close/select cases. Success: 6 of 6 command-menu test cases green.

Milestone 8 — Validation and writeback (Slice 8). At the end, the focused tests, broader suites, and repo gates are green or accompanied by a documented limitation, and this ExecPlan is current.

## Concrete Steps

The Concrete Steps for each slice are documented one-to-one in `Outcomes & Retrospective` (the file map under "Files changed in this pass") and in the validation matrix immediately below it. The two attached references are:

- `docs/exec-plans/active/2026-05-02-app-shell-polish.md` — the parity baseline this pass builds on. Read its `Decision Log` and `Outcomes & Retrospective` before changing any of the in-scope shell files.
- `apps/web/AGENTS.md` — workspace-specific instructions for the Next.js code in this repo. Read before changing App Router boundaries, server / client splits, route handlers, or middleware.

## Validation and Acceptance

Acceptance: `bun run format`, `bun lint`, `bun typecheck`, the focused tests, and the broader integration-ui + unit suites are green or paired with a documented pre-existing flake. The ExecPlan is up to date. The cmdk dependency is pinned in both `apps/web/package.json` and `bun.lock`. The new components, hooks, helpers, and tests exist under the paths listed in `Outcomes & Retrospective`. The browser proof remaining in this pass is documented for the next operator.

### Test Commands

Run from the repo root:

    bun run --cwd apps/web vitest run \
      tests/unit/product-shell.test.tsx \
      tests/integration-ui/use-header-scroll-shadow.test.ts \
      tests/integration-ui/use-app-shell-preferences.test.ts \
      tests/integration-ui/app-shell-theme-toggle-parity.test.tsx \
      tests/integration-ui/app-shell-command-menu.test.tsx

    bun run --cwd apps/web vitest run tests/integration-ui tests/unit

    bun run format
    bun lint
    bun typecheck

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-app-shell-level-up.md
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-02-app-shell-level-up.md

Manual browser proof (cannot run as a command; requires authenticated dev session):

    bun run --cwd apps/web dev:web
    # ensure nothing else holds :3000
    # sign in via Clerk test account (bun run --cwd apps/web clerk:test-user:check / :create)
    # walk /blueprint, /review, /lesson/[key] at desktop 1440 and mobile 390 in light + dark
    # capture: ⌘K open + click open, reduced-motion vs full-motion, scroll shadow rest/scrolled,
    # theme cross-fade frames, focus ring on #app-shell-main after primary-nav click,
    # local-nav collapse persisted across reload, <details> disclosure on /review and /lesson at mobile

## Idempotence and Recovery

All file edits in this pass are idempotent. Re-running the same edits over the resulting tree is a no-op. The `app-shell-preferences-store.ts` module exposes `resetAppShellPreferencesForTests()` so test setup can clear the in-memory cache between runs. The `localStorage` key is namespaced (`ship-by-sunday:app-shell-preferences`); a stuck or malformed value can be cleared from the browser dev tools without touching code.

If a partial run lands a subset of the slices, the next agent should run the focused test commands above to determine which slice is incomplete (a missing module fails import resolution; a half-wired component fails its integration-ui test). The slice descriptions and decision log entries above carry enough detail to resume from any in-flight slice.

## Artifacts and Notes

Focused-suite transcript:

    Test Files  5 passed (5)
    Tests  21 passed (21)

Broader-suite transcript:

    Test Files  3 failed | 154 passed (157)
    Tests  3 failed | 658 passed (661)

The 3 failures are pre-existing in the working tree (bisect-confirmed) and are documented in `Surprises & Discoveries`.

PostHog event payload (one of the integration-ui test assertions):

    {
      event: "app_shell_command_menu_opened",
      properties: { source: "keyboard" }
    }

## Interfaces and Dependencies

Public types and modules introduced or modified by this plan:

- `apps/web/lib/theme/start-theme-transition.ts` exports `startThemeTransition({ apply: () => void; allowAnimation: boolean })`. Pure function; no React hooks.
- `apps/web/app/(workspace)/_components/app-shell/app-shell-preferences-store.ts` exports `AppShellPreferences`, `APP_SHELL_PREFERENCES_KEY`, `APP_SHELL_PREFERENCES_DEFAULT`, `getAppShellPreferences()`, `getServerAppShellPreferences()`, `setAppShellPreferences(partial)`, `subscribeAppShellPreferences(listener)`, `resetAppShellPreferencesForTests()`. The only `localStorage` boundary in the workspace shell.
- `apps/web/app/(workspace)/_hooks/app-shell/use-app-shell-preferences.ts` exports `useAppShellPreferences()` returning `{ preferences, setPreferences, toggleLocalNavCollapsed }`.
- `apps/web/app/(workspace)/_hooks/app-shell/use-header-scroll-shadow.ts` exports `useHeaderScrollShadow({ mainId })` returning `boolean`.
- `apps/web/app/(workspace)/_components/app-shell/app-shell-command-menu.tsx` exports `AppShellCommandMenu({ primaryNav })`. Takes the same `AppShellPrimaryNav | undefined` shape that `AppShellHeader` already receives.
- `apps/web/app/(workspace)/_components/app-shell/app-shell-command-menu-items.tsx` exports `AppShellCommandMenuItems({ primaryNav, onSelect })`. Composes from `buildBlueprintStageNavItems`, `primaryNav.postReviewItems`, `workspaceMenuLinks`, the shared theme transition helper, the preferences hook, and Clerk's `useClerk().signOut`.

External dependencies:

- `cmdk` pinned at `1.1.1` (in both `apps/web/package.json` and `bun.lock`). Re-uses the workspace's existing `@radix-ui/react-dialog` peer through the cmdk dependency tree, plus the workspace's existing `radix-ui` monolithic package for the hand-rolled Dialog composition.
- No other new dependencies. All other libraries used (`motion/react`, `next-themes`, `next/navigation`, `@clerk/nextjs`, `posthog-js`) already exist in the workspace.
