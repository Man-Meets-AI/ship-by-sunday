---
title: "T3 Code Protected App Shell Planning Brief 5"
program_id: "t3-code-source-design-system-port"
brief_version: 5
status: "superseded"
summary: "Next slice for moving the protected app shell from the old top-header/local-rail layout toward T3 Code's sidebar-first app chrome."
read_when:
  - "Writing the protected app shell child ExecPlan for the T3 Code migration."
  - "Changing the protected AppShell, Sidebar primitive, workspace navigation, or app-shell browser proof."
---

# T3 Code Protected App Shell Planning Brief 5

## Slice

Sidebar and protected app-shell migration: adapt T3 Code's sidebar-first shell shape into Ship by Sunday's protected app chrome while preserving current route protection, entitlements, workspace navigation behavior, and Radix-compatible shared primitive APIs.

## Desired Outcome

The protected product app should stop presenting as a top-header shell with an optional route-local rail and should begin presenting like the T3 Code source app: a dense left sidebar, compact app controls, scrollable sidebar content, and a resizable desktop rail. Ship by Sunday's brand, product route names, access checks, Clerk/Convex runtime behavior, and current customer paths must remain intact.

The first shell slice should be bounded. It should port the T3 Code Sidebar behavior that matters for a real call site, then make `AppShell` use that Sidebar on protected `viewportMode="app"` surfaces. It should not rewrite every route page, redesign public marketing, alter checkout/auth behavior, or move generated-codebase output. The old local navigation components may still exist, but the visible protected app chrome should prove the sidebar-first direction on real Starter and Workers routes.

## Scope

In scope:

- adapt T3 Code's `sidebar.tsx` behavior onto `apps/web/src/components/ui/sidebar.tsx` without adding Base UI or undeclared app dependencies
- add desktop resizable Sidebar support with safe localStorage persistence
- make `apps/web/src/app/(app)/_components/app-shell.tsx` render a Sidebar-backed shell for `viewportMode="app"`
- add app-shell sidebar components or helpers needed to render workspace links, codebase stages, post-review links/actions, current local navigation, command/theme/user controls, billing attention, and support-mode bars
- preserve the existing `AppShell` public props and current route call sites
- focused unit or integration-ui tests for Sidebar resizing/persistence and protected AppShell sidebar rendering
- desktop and mobile browser proof on a temporary local route or protected route harness
- Program progress, next-slice updates, and a completed child ExecPlan

Out of scope:

- generated-codebase compiler, template, or `docs/generated` changes
- public marketing, docs, blog, auth, checkout success, Telegram widget, or generated customer app migration
- route protection, entitlement, Clerk, Convex, Stripe, or provider setup changes
- deleting old route-local AppShell modules before all dependent tests and routes are migrated
- adding `@base-ui/react` or copying T3 Code's Base UI `render` API into this app
- removing Next.js route groups

## Inputs

- `docs/programs/active/2026-05-14-t3-code-source-design-system-port/program.md`
- `docs/programs/active/2026-05-14-t3-code-source-design-system-port/structure-map-t3-code-to-ship-by-sunday.md`
- `/Users/bazelrex/Developer/oss/t3code/apps/web/src/components/AppSidebarLayout.tsx`
- `/Users/bazelrex/Developer/oss/t3code/apps/web/src/components/ui/sidebar.tsx`
- `apps/web/src/components/ui/sidebar.tsx`
- `apps/web/src/components/ui/scroll-area.tsx`
- `apps/web/src/app/(app)/_components/app-shell.tsx`
- `apps/web/src/app/(app)/_components/app-shell/*`
- `apps/web/src/app/(app)/layout.tsx`
- protected Starter and Workers route call sites under `apps/web/src/app/(app)`
- `apps/web/tests/integration-ui`

## Acceptance

- The child ExecPlan records `program_id: "t3-code-source-design-system-port"` and this planning brief path.
- The shared Sidebar primitive stays Radix-backed and does not add Base UI.
- `SidebarProvider`, `Sidebar`, `SidebarRail`, and `SidebarContent` carry T3 Code behavior or documented Radix-compatible adaptations, including scroll-fade content and desktop resize persistence.
- `AppShell` keeps its current props and route call sites, but protected app viewport surfaces render through `data-slot="sidebar-wrapper"`, `data-slot="sidebar"`, and `data-slot="sidebar-inset"` instead of the old top-header/local-rail grid.
- Workspace links, codebase stage links, post-review navigation, local route navigation, command menu, theme toggle, user menu, support-mode bar, billing attention banner, skip link, and mobile sidebar trigger remain available.
- Focused app-shell/sidebar tests pass.
- Desktop and mobile browser proof verifies the sidebar shell on a local proof route or a protected route harness.
- `bun run format`, focused app tests, `bun run --cwd apps/web lint`, `DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck`, Program/plan lint, markdown lint, repo lint/typecheck, and `git diff --check` pass or exact blockers are recorded.

## Watchpoints

- T3 Code's Sidebar uses Base UI `render`, `mergeProps`, and `effect/Schema`; Ship by Sunday should preserve current `asChild` APIs and avoid undeclared app dependencies.
- Sidebar resize must not make the main content unusably narrow.
- Dragging a resize rail must not also toggle the sidebar after pointerup.
- Mobile sidebar must use the existing Sheet/Dialog runtime and keep accessible title/description text.
- AppShell changes are protected-route visual changes. They must not loosen `getServerProductAccess`, `loadWorkspacePageAccess`, Clerk auth, support-mode, billing attention, or entitlement behavior.
- Keep generated customer repository work out of this slice.
