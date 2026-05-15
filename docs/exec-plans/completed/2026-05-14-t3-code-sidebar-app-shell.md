---
title: T3 Code Sidebar App Shell
status: complete
created_at: 2026-05-14
completed_at: 2026-05-15
summary: Move the protected AppShell onto a T3 Code-style Sidebar layout while preserving current protected route behavior and AppShell props.
post_build_recap: Protected `viewportMode="app"` AppShell now renders through a T3 Code-style Sidebar shell with workspace, codebase, lesson, local-nav, command, theme, user, billing, skip-link, and mobile Sheet-backed navigation preserved. Sidebar stayed Radix-compatible, gained T3 resize and scroll recipes, and focused unit/integration tests plus desktop/mobile browser proof passed.
program_id: t3-code-source-design-system-port
planning_brief: docs/programs/active/2026-05-14-t3-code-source-design-system-port/planning-brief-5.md
read_when:
  - Resuming the protected AppShell sidebar migration.
  - Reviewing Sidebar resize behavior or AppShell protected-route chrome.
  - Checking why Sidebar was migrated with the first app-shell call site instead of the earlier utility primitive slice.
---

# T3 Code Sidebar App Shell

This document is a living execution plan for the protected app-shell sidebar slice of the T3 Code source design-system port.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday's protected product app still looks like the older shell: a top header, a horizontal primary nav, and an optional route-local rail that sits beside the page. T3 Code's source app uses a sidebar-first shell with a dense left rail, scrollable sidebar content, compact controls, and resizable desktop width. This slice moves the real protected `AppShell` toward that T3 Code structure so Starter and Workers routes start sharing the new app chrome, while the existing product routes, auth checks, entitlement checks, command menu, theme toggle, user menu, support-mode bar, billing banner, and local route navigation keep working.

After this slice, a protected `viewportMode="app"` page should render a `SidebarProvider`, `Sidebar`, `SidebarRail`, and `SidebarInset` around the page content. Desktop users should see the workspace and current-route navigation in the left sidebar, and mobile users should have a sidebar trigger that opens the same navigation through the existing Sheet runtime. The shared Sidebar primitive should stay compatible with existing Radix-style `asChild` call sites and should not add Base UI.

## Progress

- [x] 2026-05-14: Read root and app agent instructions, release workflow, app architecture/conventions, Next App Router layout and Server/Client Component docs, the active Program, planning brief 4, and the current Program next-slice guidance.
- [x] 2026-05-14: Located the T3 Code reference in this environment at `/Users/bazelrex/Developer/oss/t3code` and read `AppSidebarLayout.tsx` plus the T3 Sidebar source.
- [x] 2026-05-14: Added `planning-brief-5.md` for the protected app shell slice and pointed `current-planning-brief.txt` at it.
- [x] 2026-05-14: Created this active ExecPlan with a bounded Sidebar plus AppShell call-site migration strategy.
- [x] 2026-05-14: Validated this active plan with `plans:lint`.
- [x] 2026-05-15: Ported Sidebar resize, scroll content, T3 class recipes, and Radix-compatible state selectors into `apps/web/src/components/ui/sidebar.tsx`.
- [x] 2026-05-15: Moved protected `viewportMode="app"` AppShell rendering to a Sidebar-backed layout while preserving the old document-mode shell.
- [x] 2026-05-15: Added focused tests for Sidebar resize/persistence and AppShell sidebar rendering.
- [x] 2026-05-15: Ran desktop/mobile browser proof and removed the temporary route code.
- [x] 2026-05-15: Ran final format, focused tests, app lint/typecheck, Program/plan/docs lint, repo lint/typecheck, scope checks, and `git diff --check`.
- [x] 2026-05-15: Moved this ExecPlan to completed and updated the Program ledger with the next slice.

## Surprises & Discoveries

The initial Program packet named `/Users/bazelrex/Developer/t3code` as the T3 Code source, but that path is not present in this environment. The available local reference is `/Users/bazelrex/Developer/oss/t3code`, verified by finding `/Users/bazelrex/Developer/oss/t3code/apps/web/src/components/AppSidebarLayout.tsx` and `/Users/bazelrex/Developer/oss/t3code/apps/web/src/components/ui/sidebar.tsx`. A review follow-up updated the active Program metadata to point at `/Users/bazelrex/Developer/oss/t3code`.

`apps/web/src/components/ui/sidebar.tsx` exists but still had no live imports before this slice. This slice creates the first live app-shell call site so Sidebar can be proven through real protected app chrome instead of static primitive churn.

T3 Code's Sidebar imports Base UI `useRender`, Base UI `mergeProps`, and `effect/Schema` for localStorage validation. Ship by Sunday's shared primitive should preserve the current Radix `Slot` and `asChild` API and should use small local number parsing helpers instead of adding an app-level `effect` dependency.

## Decision Log

Decision: Keep Sidebar Radix-compatible and do not add Base UI in this slice.
Rationale: Current shared primitives have deliberately adapted T3 recipes to the existing Radix API surface. The existing Sidebar file already exposes `asChild` for menu buttons and related components through Radix Slot. Adding Base UI now would be an unplanned dependency and API change.
Date: 2026-05-14

Decision: Preserve AppShell props and protected route call sites.
Rationale: The route pages already pass `primaryNav`, `localNav`, `layoutMode`, `billingAttention`, `viewportMode`, and scroll-mode props. This slice should change the shell structure, not force every protected route to change its rendering contract at once.
Date: 2026-05-14

Decision: Keep document-mode AppShell rendering on the old header path for now.
Rationale: The active protected app call sites use `viewportMode="app"`, and moving that mode proves the sidebar shell where the Program needs it. Preserving document mode lowers risk for any legacy caller that still expects the old centered document shell.
Date: 2026-05-14

## Outcomes & Retrospective

This slice made the previously unused shared Sidebar primitive live through the protected app shell. `apps/web/src/components/ui/sidebar.tsx` stayed on the existing Radix Slot/asChild surface and did not add Base UI or Effect. It now accepts T3-compatible `resizable` options, reads and writes a stored desktop width defensively, clamps drag widths, lets callers reject widths that would crowd main content, suppresses the click following a drag, wraps sidebar content in the shared ScrollArea with fade masks and hidden custom scrollbars, and ports T3 rounded, active, badge, skeleton, tooltip, and mobile-width class recipes. `SidebarProvider` now owns `TooltipProvider`, matching the source pattern and preventing call sites from having to know about collapsed-label tooltip plumbing.

`apps/web/src/app/(app)/_components/app-shell.tsx` now uses `SidebarProvider`, `AppShellSidebar`, `SidebarInset`, and `AppShellMobileHeader` for `viewportMode="app"`. The old top-header/local-rail path remains for document mode. The new sidebar composition reuses current AppShell props and current product navigation state: workspace links from `workspaceMenuLinks`, codebase stages from `buildCodebaseStageNavItems`, post-review links/actions from `primaryNav.postReviewItems`, route-local `localNav.desktop`, command menu, theme toggle, user menu, progress summary, billing attention, support-mode bar, skip link, layout controls, and mobile Sheet-backed navigation. Route protection, entitlement, Clerk, Convex, Stripe, and generated-codebase surfaces were not changed.

Focused unit tests prove the Sidebar primitive keeps the Radix-compatible source shape, mounts T3 scroll-fade content, clamps stored widths, persists accepted drag widths, suppresses accidental toggle after dragging, rejects caller-disallowed widths, and does not import Base UI or Effect. Focused integration-ui tests prove protected app viewport sidebar rendering, document-mode compatibility, local-nav collapse/restore behavior, and representative command/workspace/codebase page coverage.

Browser proof used a temporary public local route at `http://localhost:3017/codex-app-shell-sidebar-proof` on a webpack dev server, then deleted the route before final validation. Desktop proof verified `data-slot="sidebar-wrapper"`, `data-slot="sidebar"`, `data-slot="sidebar-inset"`, a `Resize Sidebar` rail, 8 sidebar menu items, scroll-fade class fragments, workspace/codebase/lesson/local navigation, billing attention, and command/theme/user controls. Mobile proof emulated `390x844`, opened the `Open app sidebar` trigger, and verified the Sheet-backed mobile sidebar with the same navigation groups and accessible title/description. Screenshots were saved under ignored `codex-scripts/artifacts/app-shell-sidebar-desktop.png` and `codex-scripts/artifacts/app-shell-sidebar-mobile.png`. Clerk emitted expected local dev-key authorized-party warnings on port 3017, but the proof page rendered and the verified AppShell/Sidebar behavior was unaffected.

Review follow-up on 2026-05-15 fixed mobile Sidebar width CSS, hid the resize rail until the same `md` breakpoint used by `useIsMobile`, flushed a pending resize frame before persisting on pointerup/cancel, suppressed caller `onClick` handlers after drag, and added focused regression tests for those cases.

The next Program slice should migrate the protected operational route surfaces now that the shell foundation is live: make Starter, Workers, settings, support/admin, and course surfaces read as T3 Code-style product tools inside the sidebar shell, while continuing to move avoidable route-local implementation out of underscore folders.

## Context and Orientation

The T3 Code reference files for this slice are `/Users/bazelrex/Developer/oss/t3code/apps/web/src/components/AppSidebarLayout.tsx` and `/Users/bazelrex/Developer/oss/t3code/apps/web/src/components/ui/sidebar.tsx`. T3 Code wraps app content in `SidebarProvider`, renders a left `Sidebar` with `collapsible="offcanvas"` and `resizable` options, and uses `SidebarRail` for desktop resize/toggle interactions. Its Sidebar uses Base UI render props and Effect Schema helpers, which should be adapted rather than copied literally.

The current Ship by Sunday shell starts at `apps/web/src/app/(app)/_components/app-shell.tsx`. It currently renders a top `AppShellHeader`, optional `AppShellLocalNavRail`, `AppShellBillingAttentionBanner`, `SupportModeBar`, and `AppShellFooterRail`. The current header is split into files under `apps/web/src/app/(app)/_components/app-shell/`, including command menu, theme toggle, user menu, primary navigation, workspace brand, and local-nav collapse preferences. Protected pages under `apps/web/src/app/(app)` call `AppShell` directly with `viewportMode="app"` and sometimes pass `localNav` and `primaryNav`.

The shared Sidebar primitive is `apps/web/src/components/ui/sidebar.tsx`. It currently comes from the shadcn/Radix-style implementation and has no live import in app code before this slice. This plan makes it live by wrapping the protected `AppShell` app viewport.

The route protection boundary is `apps/web/src/app/(app)/layout.tsx`, which calls `getServerProductAccess()` and returns `AccessRequiredPage` when access is missing. This slice must not change that boundary. Individual product routes also call `loadWorkspacePageAccess()` and redirect or render access-required UI. This slice must not change those checks.

### In Scope

This plan updates `apps/web/src/components/ui/sidebar.tsx`, `apps/web/src/app/(app)/_components/app-shell.tsx`, and new or existing focused files under `apps/web/src/app/(app)/_components/app-shell/` needed to render the sidebar shell. It may update app-shell focused tests under `apps/web/tests/integration-ui`, this ExecPlan, `planning-brief-5.md`, `current-planning-brief.txt`, and the Program ledger. It may create an ignored browser proof script under `codex-scripts/` and a temporary local proof route that must be deleted before final validation.

### Out Of Scope

This plan does not change Convex schema or functions, Clerk auth, Stripe billing, checkout success, access-required logic, generated-codebase compiler output, starter templates, generated docs, public marketing/docs/blog pages, Telegram widget CSS, or route URLs. It does not remove all old app-shell modules or route-local underscore folders. It does not add `@base-ui/react` or any new app dependency.

## Plan of Work

First, validate this active ExecPlan with `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-14-t3-code-sidebar-app-shell.md`.

Second, update `apps/web/src/components/ui/sidebar.tsx`. Preserve exported names and `asChild` behavior. Add T3-compatible `resizable` options to `Sidebar`, an internal Sidebar instance context, `SidebarRail` pointer drag handling, safe localStorage width persistence, T3 mobile width, T3 scroll-fade `SidebarContent`, rounded-lg sidebar menu recipes, and Radix-compatible data attributes. Keep the existing cookie persistence and keyboard shortcut behavior unless tests show it conflicts.

Third, add a focused sidebar rendering layer for `AppShell`. The new layer should build a left sidebar from current data instead of inventing new product state. It should read the current pathname, reuse `workspaceMenuLinks`, render codebase stage links from `buildCodebaseStageNavItems`, render post-review links/actions from `primaryNav.postReviewItems`, include `localNav.desktop` in the sidebar when supplied, keep command menu/theme/user controls available, and keep the billing and support-mode bars visible in the app shell.

Fourth, modify `apps/web/src/app/(app)/_components/app-shell.tsx` so `viewportMode="app"` uses `SidebarProvider`, `Sidebar`, `SidebarRail`, and `SidebarInset`. Preserve the current document-mode path. Keep `APP_SHELL_MAIN_ID` focus behavior on navigation. Keep `showSkillRail`, `completionCue`, `billingAttention`, `layoutMode`, and `onLayoutModeChange` behavior.

Fifth, add focused tests. The meaningful user-facing risk is P1 core product risk because this changes protected product navigation and shell chrome, but it does not change persisted state, auth, billing, or provider I/O. The source of truth is visible navigation and preserved protected route shell behavior. Must work: Sidebar primitives render T3 slots/classes, resize rail persists accepted widths and suppresses accidental toggle after dragging, AppShell app viewport exposes workspace links and local nav in the sidebar, mobile header exposes a sidebar trigger, and existing command/theme/user controls still render.

Sixth, run browser proof. Use a temporary local route or proof harness that renders `AppShell viewportMode="app"` with sample `primaryNav` and `localNav`, then verify desktop sidebar slots, workspace navigation, local navigation, command/theme/user controls, mobile trigger, and screenshots. Delete the temporary route before final validation.

Seventh, complete this ExecPlan, move it to `docs/exec-plans/completed/2026-05-14-t3-code-sidebar-app-shell.md`, update `docs/programs/active/2026-05-14-t3-code-source-design-system-port/program.md`, and run the final validation commands.

## Milestones

Milestone 1 creates and validates the plan. Success means this file exists under `docs/exec-plans/active`, points at `planning-brief-5.md`, records the T3 source location actually used, and passes `plans:lint`.

Milestone 2 ports the shared Sidebar behavior. Success means the shared primitive still exports the existing Sidebar names, now accepts T3-style `resizable` options, uses ScrollArea for content, and has focused tests proving resize persistence without Base UI.

Milestone 3 migrates the protected app viewport shell. Success means `AppShell viewportMode="app"` renders through Sidebar slots while document mode remains on the old path, and focused tests can find workspace links, route-local navigation, command/theme/user controls, and main content.

Milestone 4 validates and records completion. Success means focused tests, desktop/mobile browser proof, app lint/typecheck, plan/program/markdown lint, repo lint/typecheck, Base UI scope checks, generated-output scope checks, and `git diff --check` pass, then the ExecPlan moves to completed and the Program ledger names the next slice.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Validate this active plan:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-14-t3-code-sidebar-app-shell.md

Edit:

    apps/web/src/components/ui/sidebar.tsx
    apps/web/src/app/(app)/_components/app-shell.tsx
    apps/web/src/app/(app)/_components/app-shell/app-shell-sidebar.tsx
    apps/web/tests/integration-ui/app-shell-sidebar-layout.test.tsx
    apps/web/tests/unit/ui-sidebar-primitive.test.tsx
    docs/exec-plans/active/2026-05-14-t3-code-sidebar-app-shell.md
    docs/programs/active/2026-05-14-t3-code-source-design-system-port/program.md

Run focused validation:

    bun run --cwd apps/web test:unit -- tests/unit/ui-sidebar-primitive.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/app-shell-sidebar-layout.test.tsx tests/integration-ui/app-shell-command-menu.test.tsx tests/integration-ui/workspace-setup-page.test.tsx tests/integration-ui/codebase-page.test.tsx

Run static and docs validation:

    bun run format
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-sidebar-app-shell.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-sidebar-app-shell.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    bun lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck
    git diff --check

If this plan is still active while running intermediate checks, use the active path for `plans:lint` and `markdown:lint`. Once it is moved to completed, use the completed path shown above.

## Validation and Acceptance

Acceptance requires the protected app viewport shell to use T3 Code-style Sidebar slots and behavior without changing protected route access decisions or current AppShell call-site props. The shared Sidebar primitive must remain Radix-compatible, must not import Base UI, and must not require a new dependency. Focused tests must cover Sidebar resize/persistence and AppShell sidebar rendering. Browser proof must cover a desktop and mobile viewport for an AppShell sidebar render or record an exact limitation.

### Test Commands

Validation completed on 2026-05-15 from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run --cwd apps/web test:unit -- tests/unit/ui-sidebar-primitive.test.tsx
    bun run --cwd apps/web test:unit -- tests/unit/ui-sidebar-primitive.test.tsx tests/unit/ui-utility-primitives.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/app-shell-sidebar-layout.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/app-shell-sidebar-layout.test.tsx tests/integration-ui/app-shell-command-menu.test.tsx tests/integration-ui/workspace-setup-page.test.tsx tests/integration-ui/codebase-page.test.tsx
    bun run format
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-sidebar-app-shell.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-sidebar-app-shell.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    bun lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck
    git diff --check

## Idempotence and Recovery

The shell changes are local React and CSS changes. If Sidebar resize creates an unusable width, clamp the width with the `minWidth`, `maxWidth`, and `shouldAcceptWidth` options and add a regression test. If app-shell tests show route navigation changed, preserve the existing `primaryNav` callbacks instead of rewriting route behavior. If mobile Sheet behavior regresses, keep the existing Sheet primitive and only change Sidebar composition. If a temporary proof route is used, delete it before final validation. Do not touch generated output or provider configuration.

## Artifacts and Notes

Important source references:

    /Users/bazelrex/Developer/oss/t3code/apps/web/src/components/AppSidebarLayout.tsx
    /Users/bazelrex/Developer/oss/t3code/apps/web/src/components/ui/sidebar.tsx
    apps/web/src/components/ui/sidebar.tsx
    apps/web/src/app/(app)/_components/app-shell.tsx
    apps/web/src/app/(app)/_components/app-shell/app-shell-props.ts
    apps/web/src/app/(app)/_components/app-shell/app-shell-command-menu.tsx
    apps/web/src/app/(app)/_components/app-shell/app-shell-theme-toggle.tsx
    apps/web/src/app/(app)/_components/app-shell/app-shell-user-menu.tsx
    apps/web/src/app/(app)/layout.tsx

No provider setup or generated customer repository change should be needed.

## Interfaces and Dependencies

This slice depends on Next.js App Router route groups and layouts, React client components for shell interactivity, the current `radix-ui` Slot and Dialog-backed Sheet primitives, the shared T3-style Button, ScrollArea, Tooltip, Separator, Skeleton, and Sidebar primitives, Clerk client hooks inside the user menu and support-mode bar, Convex client hooks inside support/user controls, `next-themes` for theme toggling, and current AppShell props. The app-shell route protection interface remains `apps/web/src/app/(app)/layout.tsx` plus per-route `loadWorkspacePageAccess()` checks; this plan must not change those access boundaries.
