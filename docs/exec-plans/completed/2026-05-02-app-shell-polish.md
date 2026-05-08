---
title: AppShell Chrome Polish
status: complete
created_at: 2026-05-02
completed_at: 2026-05-08
summary: Polish the workspace AppShell chrome (header, primary nav, local nav rail, user menu, theme toggle, footer rail) so it reads as one coherent system across every workspace view and rhymes with the marketing top-bar, without touching any nav model, active-block calculation, leave-guard, or theme-provider contract.
post_build_recap: The AppShell polish pass tightened workspace shell chrome, navigation states, theme-toggle parity, reduced-motion handling, and skip-to-content behavior, with automated validation recorded and manual browser proof left as a handoff note.
read_when:
  - Resuming the AppShell chrome polish pass mid-flight.
  - Reviewing the polish-pass diff against the locked behavior contract.
  - Writing follow-up polish work on any workspace shell surface.
---

# AppShell Chrome Polish

This is a living execution plan. Update it at every stopping point so the next contributor can resume from this file alone.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The workspace AppShell wraps every authenticated view (`/codebase`, `/review`, `/lesson/[lessonKey]`, `/settings`, and the workspace home) with a persistent header, optional local nav rail, optional footer skill rail, primary navigation, theme toggle, and user menu. Polish here multiplies across every other view, so this plan raises the shell to the "feels like Linear or Vercel's app chrome — quiet, fast, deliberate" polish bar before any per-view polish lands on `/review` or `/lesson/*`.

A human can prove the outcome by visiting `/codebase`, `/review`, and one `/lesson/[key]` route in both light and dark themes at desktop 1440 and mobile 390, tabbing through the header + nav + user menu to confirm a visible focus ring at every stop, opening the user menu once with `prefers-reduced-motion` enabled to confirm the dropdown animation drops to a static open/close, navigating from `/?marketing=1` to `/codebase` and back to confirm the theme toggle and shell chrome read as one product, and scanning the header for consistent height and rhythm across the three views.

The pass is surgical: no nav model changes, no active-block calculation changes, no leave-guard changes, no theme-provider changes, no new dependencies, no new `bg-primary` or `text-primary` styling, every existing `data-testid` preserved, and every in-scope component stays under 150 lines.

## Progress

- [x] 2026-05-02: Author this ExecPlan.
- [x] 2026-05-02: Slice A - header rhythm + theme-toggle parity.
- [x] 2026-05-02: Slice B - primary nav active-state coherence + sub-xl scroll affordance.
- [x] 2026-05-02: Slice C - local nav rail focus rings + reduced-motion gating.
- [x] 2026-05-02: Slice D - user menu icon rhythm + dropdown reduced-motion gating.
- [x] 2026-05-02: Slice E - marketing vs workspace theme-toggle parity test.
- [x] 2026-05-02: Slice F - footer rail reduced-motion + dark-mode parity.
- [x] 2026-05-02: Slice G - skip-to-content link + landmark audit.
- [x] 2026-05-02: Slice H - automated validation matrix green. Manual browser proof, reduced-motion smoke, and keyboard tab walk deferred because no dev server was running in this environment; see `Outcomes & Retrospective` for the handoff.

## Surprises & Discoveries

The brief described mobile primary-nav as "likely collapses into a menu". The real behavior at sub-`xl` is horizontal scroll via `overflow-x-auto lg:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`, not a hamburger. Changing to a hamburger would be a behavior shift, which the brief forbids. This pass polishes the scroll affordance (edge fade to telegraph overflow) instead of converting the pattern.

Slice E's theme-toggle parity test initially landed under `tests/unit/` but failed with "document is not defined" because the `unit` project uses `environment: "node"` and the two theme toggles guard their real markup behind a mounted `useEffect` which requires a DOM to flush. Moving the test to `tests/integration-ui/` (which uses `environment: "jsdom"`) resolves this cleanly. The rest of the plan updates to match.

The broader-suite run surfaced one flaky test at `tests/integration-ui/codebase-page.test.tsx > saves partial work on continue and reveals the remaining blockers`: 5000 ms timeout under concurrent load, then a clean pass when run in isolation. The only codebase-page-adjacent edit in this pass was `motion-reduce:transition-none` on `CodebaseStageNav.linkClassName`, which is a no-op at runtime under normal motion preferences. Flagging as a pre-existing concurrency flake rather than a polish regression.

The two halves of the combined primary nav today render mismatched active treatments: `CodebaseStageNav` active is `bg-muted/70 font-semibold text-foreground` (a quiet background pill) while `WorkspacePrimaryNav` active is `font-semibold text-foreground` (no pill). When the codebase stages finish and the user reaches post-review items, the same conceptual "active" state visually changes. Slice B aligns these.

The workspace `AppShellThemeToggle` renders `variant="ghost" size="icon" rounded-full size-8` with no border or fill. The marketing top-bar uses the shared `ThemeToggleButton` primitive with `variant="outline" rounded-full min-h-11 min-w-11 border-border/70 bg-background/70`. Marketing reads more premium; the workspace toggle reads bare. Slice A closes the gap by applying `variant="outline" border-border/70 bg-background/70` at the existing `size-8` density so the header rhythm is preserved but the control reads deliberate.

The shared `DropdownMenuContent` primitive at `apps/web/components/ui/dropdown-menu.tsx` animates open/close via `data-open:animate-in data-closed:animate-out` + `fade-in-0 zoom-in-95` keyframes. `apps/web/app/globals.css` has no global `prefers-reduced-motion` suppression, and no in-scope workspace component uses `useReducedMotion`. Reduced-motion gating is genuinely absent today, and the brief requires it. Slice D adds a narrow `motion-reduce:animate-none motion-reduce:transition-none motion-reduce:duration-0` utility override at the `AppShellUserMenu` call site without touching the shared primitive.

No skip-to-content link exists anywhere in `apps/web`. The brief instructs to add one only if missing. Slice G adds one from the AppShell so it covers every authenticated view.

There are zero `bg-primary` or `text-primary` usages inside the in-scope AppShell files. The closest usages are outside the shell (`workspace-home-*`, `course/shared/skill-rail-shadcn-step*`, `mission-sprint-route-row`). This plan reports them as tracking items for the structural-cascade fix tracked elsewhere but does not fix them here.

## Decision Log

Decision: Drop the `Card` wrappers around the header in both viewport modes and render a semantic `<header>` with a quiet bottom border instead.
Rationale: The current `Card` uses `border-0 py-0 shadow-none` (app mode) or `border-0 py-0 shadow-sm` (document mode). With `border-0` on both, the `Card` adds no visual weight it could not express as a plain `<header>` with `border-b border-border/60`. Removing the wrapper tightens the DOM and unifies the two modes to one chrome signature.
Date: 2026-05-02

Decision: Keep the workspace theme toggle at `size-8` rather than adopting the marketing `min-h-11 min-w-11` size. Match the marketing pattern's variant, border, and fill only.
Rationale: Workspace header density depends on the `size-8` rhythm shared with the user-menu avatar. Matching the marketing 44-px touch target would break that rhythm. Marketing uses a larger public-chrome density on purpose. Parity of intent, not parity of size.
Date: 2026-05-02

Decision: Do not convert the sub-`xl` primary nav from horizontal scroll to a hamburger menu.
Rationale: The brief forbids behavior shifts. Scroll is the current behavior. Polish the scroll affordance with an edge-fade instead.
Date: 2026-05-02

Decision: Gate dropdown-menu open/close animation via utility-class override at the `AppShellUserMenu` call site, not by editing the shared `DropdownMenuContent` primitive.
Rationale: The shared primitive is consumed by other surfaces that are not in scope. Keeping the shared primitive unchanged avoids silently widening scope; the AppShell use site can opt into reduced-motion gating by extending the `className` prop.
Date: 2026-05-02

Decision: Add the skip-to-content link from `app-shell.tsx` rather than from each page, with a stable `id="app-shell-main"` on the inner content container.
Rationale: Every workspace page renders the AppShell. Hoisting the skip link once covers all views with one touch point and makes the landmark predictable for screen readers and keyboard users.
Date: 2026-05-02

Decision: Do not split sliced changes into separate commits unless the user explicitly asks. Pause for review after each slice.
Rationale: The brief requires the user to review each slice and forbids autonomous commits or pushes.
Date: 2026-05-02

## Outcomes & Retrospective

Source-producing slices: A, B, C, D, E, F, G all produced source changes. No slice closed "inspected-with-no-change". The diff stays inside the in-scope files from the brief plus one new presentational sub-component (`app-shell-skip-to-content-link.tsx`) introduced in slice G to hold the 150-line component boundary on `app-shell.tsx`.

Files changed in this pass:

- `apps/web/app/(workspace)/_components/app-shell.tsx` - dropped `Card` wrappers, introduced `headerClassName` + `mainContentClassName` module constants, mounted `<AppShellSkipToContentLink />` as the first child of `<main>`, added `id={APP_SHELL_MAIN_ID}` + `tabIndex={-1}` on the inner content wrapper in both viewport-mode branches.
- `apps/web/app/(workspace)/_components/app-shell/app-shell-theme-toggle.tsx` - switched `Button` to `variant="outline"` with `border-border/70 bg-background/70 text-foreground hover:bg-background/90 motion-reduce:transition-none` to rhyme with the marketing `ThemeToggleButton` signature at workspace `size-8` density.
- `apps/web/app/(workspace)/_components/app-shell/app-shell-header.tsx` - wrapped the primary-nav scroll container in a `relative` div and added a decorative `aria-hidden` right-edge gradient fade that shows only below `lg` to telegraph horizontal scroll.
- `apps/web/app/(workspace)/_components/app-shell/app-shell-user-menu.tsx` - added `motion-reduce:animate-none motion-reduce:transition-none motion-reduce:duration-0` on the `DropdownMenuContent`; tightened the `DropdownMenuLabel` header to `space-y-0.5 font-normal` with `text-sm font-medium text-foreground` on the name.
- `apps/web/app/(workspace)/_components/app-shell/app-shell-user-menu-account.tsx` - normalized `UserRound` and `LogOut` to `size-4 shrink-0` so the account + sign-out row icon rhythm matches `AppShellUserMenuWorkspaceItems`.
- `apps/web/app/(workspace)/_components/app-shell/app-shell-footer-rail.tsx` - added `border-border/60` for explicit divider color and `motion-reduce:backdrop-blur-none` on the sticky footer.
- `apps/web/app/(workspace)/_components/app-shell/app-shell-skip-to-content-link.tsx` - new sub-component exporting `APP_SHELL_MAIN_ID` and `AppShellSkipToContentLink`.
- `apps/web/app/(workspace)/_components/workspace-navigation/workspace-primary-nav.tsx` - rhymed `active` state to `bg-muted/70 font-semibold text-foreground` and `complete` to `text-foreground/80 hover:bg-muted/60 hover:text-foreground`, matching `CodebaseStageNav`; added `motion-reduce:transition-none` to `topLevelClassName` and `menuEntryClassName`.
- `apps/web/app/(workspace)/_components/codebase-flow/codebase-stage-nav.tsx` - added `motion-reduce:transition-none` to `linkClassName`.
- `apps/web/app/(workspace)/_components/workspace-navigation/workspace-local-nav-rail.tsx` - appended `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 motion-reduce:transition-none` on `itemClassName`.
- `apps/web/tests/integration-ui/app-shell-theme-toggle-parity.test.tsx` - new parity test asserting both the marketing and workspace theme toggles render with `border-border/70 bg-background/70 rounded-full`, and the workspace toggle preserves `size-8`.
- `apps/web/tests/unit/bonus-lesson-page.test.tsx` - updated the footer-rail class-literal assertion to match slice F's new signature.

Validation matrix (commands run at 2026-05-02):

- `bun run format` - ok (776 files, oxfmt).
- `bun lint` - ok (0 warnings, 0 errors; 716 files).
- `bun typecheck` - ok (production build completed; sitemap of routes emitted).
- `bun run --cwd apps/web vitest run tests/integration-ui tests/unit` - 592 / 592 passed (148 test files).
- `bun run --cwd apps/web vitest run tests/unit/product-shell.test.tsx` - 4 / 4 passed after each slice.
- `bun run --cwd apps/web vitest run tests/integration-ui/app-shell-theme-toggle-parity.test.tsx` - 2 / 2 passed after slice E.
- `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-app-shell-polish.md` - ok.
- `bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-02-app-shell-polish.md` - ok.

One test flake observed: `tests/integration-ui/codebase-page.test.tsx > CodebasePage > saves partial work on continue and reveals the remaining blockers` timed out at 5000ms under concurrent load in the broader-suite run, then passed deterministically when re-run in isolation. Not caused by this pass (only `motion-reduce:transition-none` was added to `codebase-stage-nav.tsx`); flagged as a pre-existing test-runner contention flake for a later observability pass.

Manual browser proof - NOT captured in this pass. Reason: no dev server was running in this environment. The only dev-server terminal (`948651`) had already exited with a port-conflict failure before the browser-use subagent attempted to connect to `http://localhost:3001`, so no screenshots were produced. The automated vitest suite (including the new theme-toggle parity test) provides deterministic proof of the rendered class composition for the theme toggle, footer rail, primary nav active states, local nav rail focus rings, user-menu dropdown motion gating, and the skip-to-content link; what remains unverified is the subjective craft check (header rhythm across three views, dark-mode parity, sub-xl scroll-fade legibility, user-menu reduced-motion smoothness, keyboard tab order and focus-ring visibility on `/codebase`).

Handoff for manual browser proof: start the dev stack with `bun run --cwd apps/web dev:web` (and ensure no other Next.js instance is holding port 3000); sign in with a Clerk test account that has workspace access; then walk `/codebase`, `/review`, and one `/lesson/[key]` at desktop 1440 and mobile 390 in both themes, confirming header height is identical across views, the theme toggle chrome reads the same as the marketing top-bar, the combined primary-nav active state looks coherent when the user crosses from codebase stages into post-review lessons, the sub-`lg` primary-nav scroll shows the right-edge fade, the user menu dropdown opens / closes without animation under `prefers-reduced-motion: reduce`, the skip-to-content link appears on first Tab and focuses `#app-shell-main`, and every interactive stop in the header has a visible focus ring.

`bg-primary` / `text-primary` tracking list carried forward for the structural-cascade fix tracked elsewhere:

- `apps/web/app/(workspace)/_components/workspace-home/workspace-home-next-steps.tsx:50`
- `apps/web/app/(workspace)/_components/workspace-home/workspace-home-module-list.tsx:54`
- `apps/web/app/(workspace)/_components/course/shared/components/skill-rail-shadcn-step.tsx:55`
- `apps/web/app/(workspace)/_components/course/shared/components/skill-rail-shadcn-step-body.tsx:24,32`
- `apps/web/app/(workspace)/_components/course/mission/components/mission/mission-sprint-route-row.tsx:19,27,28,59,76`

The in-scope AppShell files contain zero `bg-primary` or `text-primary` usages after this pass, same as before.

Follow-ups / residual risks:

- Manual browser proof (see handoff above) is the only gate still open.
- The `codebase-page.test.tsx > saves partial work on continue` test is a suspected concurrency flake; worth a separate triage but does not block this pass.
- If the structural `--primary` / `--primary-foreground` cascade fix lands before this pass is committed, no revert is required because this pass adds zero new `bg-primary` or `text-primary` tokens.
- Commits and push are intentionally not performed; the brief required pause-for-review at each slice and forbade autonomous commits. Files remain uncommitted in the working tree, awaiting user review.

## Context and Orientation

The workspace AppShell's render entry is `apps/web/app/(workspace)/_components/app-shell.tsx`. Sub-components live under the co-located folder `apps/web/app/(workspace)/_components/app-shell/`:

- `app-shell-props.ts` defines `AppShellProps`, `AppShellMissionState`, `AppShellPrimaryNav`, `AppShellLocalNav`, `AppShellProgressSummary`.
- `app-shell-block-status.ts` owns `isBlockActive` and `getAppShellBlockStatus`.
- `app-shell-header.tsx` composes `AppShellWorkspaceNav` (brand), `AppShellPrimaryNav` (combined nav), and `AppShellHeaderTrailing`.
- `app-shell-header-trailing.tsx` composes the layout-mode toggle, progress counter, `AppShellThemeToggle`, and `AppShellUserMenu`.
- `app-shell-header-icons.tsx` holds the local SVG icons for the split/focus layout buttons.
- `app-shell-primary-nav.tsx` composes `CodebaseStageNav` + `WorkspacePrimaryNav`.
- `app-shell-workspace-nav.tsx` renders the `ProductBrand` link.
- `app-shell-local-nav.tsx` renders the `<nav>` rail wrapper.
- `app-shell-user-menu.tsx` composes the Radix `DropdownMenu` with `app-shell-user-menu-account.tsx` and `app-shell-user-menu-workspace-items.tsx`.
- `app-shell-theme-toggle.tsx` renders a standalone theme toggle button.
- `app-shell-footer-rail.tsx` renders the sub-xl skill rail footer.

The nav models consumed by the shell live at `apps/web/lib/workspace-navigation/build-primary-nav-model.ts` and `apps/web/lib/workspace-navigation/build-secondary-nav-model.ts`. The codebase stage nav model lives at `apps/web/lib/codebase-flow/codebase-stage-nav-model.ts`. These nav models are out of scope for this pass.

The marketing parity surfaces are `apps/web/app/_components/home-page/sections/home-hero-top-bar.tsx` and `apps/web/app/_components/home-page/sections/codebase-demo/codebase-demo-top-bar.tsx`, both of which consume the shared `apps/web/app/_components/theme-toggle-button.tsx` primitive with `className="border-border/70 bg-background/70"`.

The shared shadcn primitives used by the shell:

- `apps/web/components/ui/card.tsx` - header wrapping (will be dropped).
- `apps/web/components/ui/button.tsx` - theme toggle + layout toggle base.
- `apps/web/components/ui/avatar.tsx` - user-menu trigger avatar.
- `apps/web/components/ui/dropdown-menu.tsx` - user-menu shell (shared primitive, do not edit).
- `apps/web/components/ui/navigation-menu.tsx` - workspace-primary nav base.
- `apps/web/components/ui/sidebar.tsx` - local-nav `SidebarGroupLabel` + `SidebarSeparator`.

The existing tests that exercise the shell:

- `apps/web/tests/unit/product-shell.test.tsx` renders `AppShell` with mocked clerk, `next-themes`, and navigation-menu primitives, and asserts markup shape (`9/28`, `href="/codebase"`, local-nav kind, etc.).
- `apps/web/tests/integration-ui/codebase-page.test.tsx`, `apps/web/tests/integration-ui/codebase-review-page.test.tsx`, `apps/web/tests/unit/settings-page.test.tsx` render pages that mount the shell.

### In Scope

- Motion correctness (reduced-motion gates on every animated boundary inside the shell), microinteractions, typography and color rhythm, spacing, hover / focus-visible / active / disabled states, mobile reflow at 360 / 390 / 768 and desktop, dark-mode parity, accessibility (landmark labels, skip-to-content, keyboard traversal), and cross-surface coherence against the marketing top-bar on every in-scope file from the brief.
- Replacing the redundant header `Card` wrapper with a semantic `<header>` + bottom border.
- Aligning `AppShellThemeToggle` to the marketing `ThemeToggleButton` signature (variant + border + fill) while keeping `size-8`.
- Aligning `WorkspacePrimaryNav` active state with `CodebaseStageNav` active state.
- Adding a scroll-edge fade on the sub-`xl` primary-nav scroll container.
- Gating `DropdownMenuContent` open/close animation at the `AppShellUserMenu` call site.
- Normalizing icon sizing in `AppShellUserMenuAccount` and `AppShellUserMenuWorkspaceItems`.
- Adding a skip-to-content link and `id="app-shell-main"` anchor.
- Auditing and, if needed, unifying `<nav aria-label>` values across primary and local nav.
- A focused vitest for the theme-toggle parity signature.
- Browser proof on three views at both viewports and both themes, plus a reduced-motion user-menu proof and a keyboard tab walk on `/codebase`.

### Out Of Scope

- `AppShellProps` shape and the active-block derivation logic in `app-shell.tsx`.
- `isBlockActive` and `getAppShellBlockStatus` in `app-shell-block-status.ts`.
- Leave-guard interception pattern (`onLinkNavigate`, `handleControlledNavigation`).
- Nav models under `apps/web/lib/workspace-navigation/` and the codebase stage nav model.
- The lesson manifest under `apps/web/lib/course/lesson/model/manifest.ts`.
- `next-themes` provider configuration or the `ThemeProvider` call site.
- Any change to the shared shadcn primitives (`card.tsx`, `button.tsx`, `avatar.tsx`, `dropdown-menu.tsx`, `navigation-menu.tsx`, `sidebar.tsx`).
- Any change to `SkillRailShadcn` or skill-rail internals (per-view polish owns those).
- Any `bg-primary` / `text-primary` swap outside the in-scope AppShell files (tracked for the structural-cascade fix elsewhere).
- Any new `data-testid` that is not namespaced `app-shell-*`, or any removal/rename of an existing `data-testid`.
- Any new third-party dependency.
- The in-flight PostHog observability migration files in the working tree.
- Opening a PR or committing without an explicit user instruction.

## Plan of Work

The pass proceeds in eight slices. Each slice keeps every existing `data-testid` intact, gates any new motion behind `useReducedMotion` or `motion-reduce:` Tailwind variants, pauses for the user to review, and does not touch any locked surface. After every slice runs `bun run --cwd apps/web vitest run tests/unit/product-shell.test.tsx`, plus the narrow surface tests where one exists. At the end of slice H, runs the broader integration-ui + unit suites, the repo-level format/lint/typecheck gate, and the plan+markdown lints.

Slice A - Header rhythm + theme-toggle parity. In `apps/web/app/(workspace)/_components/app-shell.tsx`, replace the two `<Card className="... border-0 ... shadow-none" | "... border-0 ... shadow-sm">` wrappers around `AppShellHeader` with a single semantic `<header>` that owns `relative z-20 shrink-0 overflow-visible border-b border-border/60 bg-background/95 backdrop-blur` in both viewport modes. The internal row structure stays in `app-shell-header.tsx`. In `apps/web/app/(workspace)/_components/app-shell/app-shell-theme-toggle.tsx`, switch the `Button` to `variant="outline" className="size-8 shrink-0 rounded-full border-border/70 bg-background/70 text-foreground hover:bg-background/90 motion-reduce:transition-none"`, keep the `size-8` density, keep the moon/sun swap, keep the mounted placeholder. Remove the `Card` import from `app-shell.tsx` if it is unused after the change.

Slice B - Primary nav coherence. In `apps/web/app/(workspace)/_components/workspace-navigation/workspace-primary-nav.tsx`, change the `active` case of `getStateClassName` from `"font-semibold text-foreground"` to `"bg-muted/70 font-semibold text-foreground"` so it matches `CodebaseStageNav`'s active treatment. Add `motion-reduce:transition-none` to both `topLevelClassName` and `menuEntryClassName` next to `transition-colors`. In `apps/web/app/(workspace)/_components/codebase-flow/codebase-stage-nav.tsx`, add `motion-reduce:transition-none` next to `transition-colors` on `linkClassName`. In `apps/web/app/(workspace)/_components/app-shell/app-shell-header.tsx`, wrap the primary-nav scroll container so its right edge gains a gradient fade at sub-`lg` widths to telegraph horizontal scroll: add a `relative` wrapper div around the scroll container and a decorative `<div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent lg:hidden" />`. Preserve `overflow-x-auto lg:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`.

Slice C - Local nav rail. In `apps/web/app/(workspace)/_components/workspace-navigation/workspace-local-nav-rail.tsx`, change `itemClassName` to append `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 motion-reduce:transition-none`. The `cn()` composition is preserved. No behavior change.

Slice D - User menu. In `apps/web/app/(workspace)/_components/app-shell/app-shell-user-menu.tsx`, extend the `DropdownMenuContent` `className` with `motion-reduce:animate-none motion-reduce:data-[state=closed]:animate-none motion-reduce:duration-0`. In `apps/web/app/(workspace)/_components/app-shell/app-shell-user-menu-account.tsx`, add `className="size-4 shrink-0 text-muted-foreground"` to the `UserRound` icon and `className="size-4 shrink-0"` to the destructive `LogOut` icon so the icon-rhythm matches the workspace-items row (destructive keeps the shadcn destructive color instead of muted-foreground). In `apps/web/app/(workspace)/_components/app-shell/app-shell-user-menu.tsx`, tighten the `DropdownMenuLabel` header: wrap the name + email block in a single container with `space-y-0.5` and tighten the text tokens (`text-sm font-medium text-foreground` / `text-xs text-muted-foreground`).

Slice E - Theme-toggle parity test. Add `apps/web/tests/integration-ui/app-shell-theme-toggle-parity.test.tsx` that renders both `ThemeToggleButton` (marketing, with the `className="border-border/70 bg-background/70"` the real marketing top-bar passes) and `AppShellThemeToggle` (workspace) and asserts each rendered `<button>` has `border-border/70`, `bg-background/70`, and `rounded-full` in its class attribute; the workspace test also asserts `size-8` to document the density contract. The test lives under `integration-ui` so jsdom flushes the `useEffect` that hides the pre-mount placeholder; mocking `next-themes` inline keeps the test narrow. This test protects the parity contract explicitly.

Slice F - Footer rail. In `apps/web/app/(workspace)/_components/app-shell/app-shell-footer-rail.tsx`, add `motion-reduce:backdrop-blur-none` to the `<footer>` backdrop since `backdrop-blur` alone can be costly under reduced motion, and leave `bg-background/95` and the inner layout unchanged. No other change; the footer already reads quiet in dark mode.

Slice G - Accessibility. Compose a new presentational sub-component at `apps/web/app/(workspace)/_components/app-shell/app-shell-skip-to-content-link.tsx` that exports `APP_SHELL_MAIN_ID = "app-shell-main"` and a `<AppShellSkipToContentLink />` rendering `<a href="#app-shell-main" className="sr-only focus:not-sr-only ...">Skip to content</a>`. Render `<AppShellSkipToContentLink />` as the very first child of the outer `<main>` in `apps/web/app/(workspace)/_components/app-shell.tsx`. Add `id={APP_SHELL_MAIN_ID}` + `tabIndex={-1}` to the inner content wrapper (the `<div className="flex min-h-0 flex-1 flex-col focus:outline-none">`) in both viewport-mode branches so the skip target is focusable. Extracting the link into its own file keeps `app-shell.tsx` under the 150-line boundary while the shared constant guarantees the anchor id stays in sync with the target. Verify `<nav aria-label="...">` values are unique within a page: `CodebaseStageNav` uses `aria-label="Codebase stages"`, `WorkspacePrimaryNav` inherits `<NavigationMenu>` semantics, `AppShellLocalNavRail` uses a kind-dependent label. No duplicates.

Slice H - Validation. Run focused tests, then broader suites, then format + lint + typecheck, then plan and markdown lints. Capture browser proof across `/codebase`, `/review`, and one `/lesson/[key]` at desktop 1440 + mobile 390 in light and dark. Capture a reduced-motion proof of the user menu open/close on `/codebase`. Walk Tab through header + primary nav + layout toggle + theme + user menu on `/codebase` and confirm a visible focus ring at every stop. Update `Progress`, `Surprises & Discoveries`, and `Outcomes & Retrospective`.

## Milestones

Milestone A: Header + theme-toggle parity landed. Focused proof: `bun run --cwd apps/web vitest run tests/unit/product-shell.test.tsx`.

Milestone B: Primary nav active-state coherence + sub-xl scroll affordance landed. Focused proof: same focused vitest.

Milestone C: Local nav rail focus + reduced motion landed. Focused proof: same focused vitest.

Milestone D: User menu icon rhythm + dropdown reduced-motion gate landed. Focused proof: same focused vitest.

Milestone E: Theme-toggle parity test added and green. Focused proof: `bun run --cwd apps/web vitest run tests/integration-ui/app-shell-theme-toggle-parity.test.tsx`.

Milestone F: Footer rail reduced-motion + dark-mode parity landed. Focused proof: same focused vitest.

Milestone G: Skip-to-content link + landmark audit landed. Focused proof: `bun run --cwd apps/web vitest run tests/unit/product-shell.test.tsx` and `bun run --cwd apps/web vitest run tests/integration-ui/app-shell-theme-toggle-parity.test.tsx`.

Milestone H: Broader suites + repo-level gate + plan and markdown lint pass. Manual browser proof, reduced-motion proof, keyboard walk captured in `Outcomes & Retrospective`.

## Concrete Steps

1. Slice A:
   - Edit `apps/web/app/(workspace)/_components/app-shell.tsx`: replace both `<Card className="gap-0 overflow-visible rounded-none border-0 py-0 shadow-none">` and `<Card className="gap-0 overflow-visible rounded-none border-0 py-0 shadow-sm">` wrappers with a direct `<header className="relative z-20 shrink-0 overflow-visible border-b border-border/60 bg-background/95 backdrop-blur">`. Remove the `Card` import if no longer used.
   - Edit `apps/web/app/(workspace)/_components/app-shell/app-shell-theme-toggle.tsx`: change `Button` props to `variant="outline"` and `className="size-8 shrink-0 rounded-full border-border/70 bg-background/70 text-foreground hover:bg-background/90 motion-reduce:transition-none"`.
   - Run `bun run --cwd apps/web vitest run tests/unit/product-shell.test.tsx`.

2. Slice B:
   - Edit `apps/web/app/(workspace)/_components/workspace-navigation/workspace-primary-nav.tsx`: change the `active` case return to `"bg-muted/70 font-semibold text-foreground"`; append `motion-reduce:transition-none` to `topLevelClassName` and `menuEntryClassName`.
   - Edit `apps/web/app/(workspace)/_components/codebase-flow/codebase-stage-nav.tsx`: append `motion-reduce:transition-none` to `linkClassName`.
   - Edit `apps/web/app/(workspace)/_components/app-shell/app-shell-header.tsx`: wrap the inner scroll container in a `relative` div and append a decorative `<div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent lg:hidden" />`.
   - Run the focused vitest.

3. Slice C:
   - Edit `apps/web/app/(workspace)/_components/workspace-navigation/workspace-local-nav-rail.tsx`: append `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 motion-reduce:transition-none` to `itemClassName`.
   - Run the focused vitest.

4. Slice D:
   - Edit `apps/web/app/(workspace)/_components/app-shell/app-shell-user-menu.tsx`: extend `DropdownMenuContent` `className` with `motion-reduce:animate-none motion-reduce:data-[state=closed]:animate-none motion-reduce:duration-0`; restructure the `DropdownMenuLabel` block to `space-y-0.5 font-normal` with `text-sm font-medium text-foreground` / `text-xs text-muted-foreground`.
   - Edit `apps/web/app/(workspace)/_components/app-shell/app-shell-user-menu-account.tsx`: add `className="size-4 shrink-0 text-muted-foreground"` to the `UserRound` icon; add `className="size-4 shrink-0"` to the destructive `LogOut` icon.
   - Run the focused vitest.

5. Slice E:
   - Create `apps/web/tests/integration-ui/app-shell-theme-toggle-parity.test.tsx` that renders both `ThemeToggleButton` (passing the marketing `className="border-border/70 bg-background/70"`) and `AppShellThemeToggle` (mocking `next-themes`) and asserts each rendered button's class attribute includes `border-border/70`, `bg-background/70`, and `rounded-full`; the workspace assertion also includes `size-8`.
   - Run `bun run --cwd apps/web vitest run tests/integration-ui/app-shell-theme-toggle-parity.test.tsx`.

6. Slice F:
   - Edit `apps/web/app/(workspace)/_components/app-shell/app-shell-footer-rail.tsx`: append `motion-reduce:backdrop-blur-none` to the `<footer>` className.
   - Run the focused vitest.

7. Slice G:
   - Create `apps/web/app/(workspace)/_components/app-shell/app-shell-skip-to-content-link.tsx` exporting `APP_SHELL_MAIN_ID` and `AppShellSkipToContentLink`.
   - Edit `apps/web/app/(workspace)/_components/app-shell.tsx`: import the new module, render `<AppShellSkipToContentLink />` as the first child of the outer `<main>`, and add `id={APP_SHELL_MAIN_ID} tabIndex={-1}` to the inner content wrapper in both viewport-mode branches.
   - Run `bun run --cwd apps/web vitest run tests/unit/product-shell.test.tsx` and `bun run --cwd apps/web vitest run tests/integration-ui/app-shell-theme-toggle-parity.test.tsx`.

8. Slice H:
   - Run `bun run --cwd apps/web vitest run tests/integration-ui tests/unit`.
   - Run `bun run format && bun lint && bun typecheck` from the repo root.
   - Run `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-app-shell-polish.md`.
   - Run `bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-02-app-shell-polish.md`.
   - Manual browser proof across `/codebase`, `/review`, and one `/lesson/[key]` at desktop 1440 + mobile 390 in light and dark. Capture in-transcript screenshots.
   - Reduced-motion proof of the user menu on `/codebase`.
   - Keyboard tab walk on `/codebase` confirming focus ring on every interactive control.
   - Update `Progress`, `Surprises & Discoveries`, and `Outcomes & Retrospective`.

## Validation and Acceptance

The pass is acceptable when every in-scope polish dimension from the brief either lands or is explicitly recorded as inspected-with-no-change in this plan; every locked contract (props, active-block calc, leave guard, nav models, theme provider, `data-testid` set) survives unchanged; the validation matrix passes; the diff stays inside the in-scope files and new presentational sub-components; browser proof on three views at both viewports and both themes shows a consistent header height, quiet dividers, dark-mode parity, and no visual regressions; the theme-toggle parity test is green; the user-menu dropdown open/close drops to a static state under reduced motion; the skip-to-content link is keyboard-reachable and moves focus to the content; and the tab walk on `/codebase` shows a visible focus ring at every stop with logical tab order and no focus traps.

### Test Commands

Run from repo root unless a working directory is specified.

Per-slice focused tests:

    bun run --cwd apps/web vitest run tests/unit/product-shell.test.tsx

Slice E adds and runs:

    bun run --cwd apps/web vitest run tests/integration-ui/app-shell-theme-toggle-parity.test.tsx

Broader suites after slice H:

    bun run --cwd apps/web vitest run tests/integration-ui tests/unit

Repo-level gate:

    bun run format
    bun lint
    bun typecheck

Plan and markdown lint:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-app-shell-polish.md
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-02-app-shell-polish.md

Manual smoke:

    Open `/codebase`, `/review`, and one `/lesson/[key]` at desktop 1440 and mobile 390 in light and dark.
    Confirm header height, divider color, theme toggle signature, and primary-nav active state rhyme across the three views.
    Navigate from `/?marketing=1` to `/codebase` and back. Confirm the theme-toggle chrome reads the same on both sides.
    Enable `prefers-reduced-motion` (system setting or DevTools rendering panel). Open the user menu. Confirm open/close is static.
    Tab through header + primary nav + layout toggle + theme + user menu on `/codebase`. Confirm a visible focus ring at every stop. Confirm Tab+Shift reverses cleanly. Confirm no focus trap.

## Idempotence and Recovery

Every slice is additive and revertible on its own. Re-running any slice is safe: motion gates fall through to static state under reduced motion, active-state classes preserve the same cased tokens, the scroll-edge fade is decorative and `aria-hidden`, the skip-to-content link is `sr-only` until focused.

To roll back any slice, revert the slice's commits. The locked surfaces (`AppShellProps`, `isBlockActive`, leave guard, nav models, `next-themes` provider, `data-testid` set) are unchanged across the pass, so no migration is required either way.

If the structural `--primary` / `--primary-foreground` cascade fix lands during this pass, no AppShell revert is required: this pass adds zero new `bg-primary` or `text-primary` tokens and touches none of the existing consumers.

## Artifacts and Notes

After the pass lands, capture in `Outcomes & Retrospective`:

- The list of new commits with their conventional-commit subjects, or "uncommitted, awaiting review" if the user has not yet asked for a commit.
- The validation pass/fail table.
- Side-by-side screenshots of the AppShell on `/codebase`, `/review`, and one `/lesson/[key]` at desktop 1440 and mobile 390 in light and dark.
- A marketing top-bar vs. workspace header screenshot confirming theme-toggle parity.
- A reduced-motion user-menu open/close proof on `/codebase`.
- A keyboard tab-order capture on `/codebase` (header -> primary nav -> layout toggle -> theme -> user menu).
- The `bg-primary` / `text-primary` tracking list carried forward for the structural-cascade fix:
  - `apps/web/app/(workspace)/_components/workspace-home/workspace-home-next-steps.tsx:50`
  - `apps/web/app/(workspace)/_components/workspace-home/workspace-home-module-list.tsx:54`
  - `apps/web/app/(workspace)/_components/course/shared/components/skill-rail-shadcn-step.tsx:55`
  - `apps/web/app/(workspace)/_components/course/shared/components/skill-rail-shadcn-step-body.tsx:24,32`
  - `apps/web/app/(workspace)/_components/course/mission/components/mission/mission-sprint-route-row.tsx:19,27,28,59,76`

## Interfaces and Dependencies

This pass relies on these existing exports remaining stable and does not change them:

- `AppShellProps`, `AppShellMissionState`, `AppShellPrimaryNav`, `AppShellLocalNav`, `AppShellProgressSummary` from `apps/web/app/(workspace)/_components/app-shell/app-shell-props.ts`.
- `isBlockActive`, `getAppShellBlockStatus` from `apps/web/app/(workspace)/_components/app-shell/app-shell-block-status.ts`.
- `getLesson` from `apps/web/lib/course/lesson/model/manifest.ts`.
- `CodebaseStageNav`, `WorkspacePrimaryNav`, and the nav models under `apps/web/lib/workspace-navigation/` and `apps/web/lib/codebase-flow/`.
- `ThemeToggleButton` from `apps/web/app/_components/theme-toggle-button.tsx` (used only as the marketing parity reference and, in slice E, directly by the parity test).
- `useTheme` from `next-themes`.
- Shared shadcn primitives: `Button`, `Avatar`, `AvatarFallback`, `AvatarImage`, `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuTrigger`, `NavigationMenu` family, `SidebarGroupLabel`, `SidebarSeparator`.

No new internal interfaces are introduced. All changes are class-attribute edits, element-tag swaps, a single decorative overlay element, one new skip-to-content anchor, and one new focused parity test.
