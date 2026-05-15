---
title: "T3 Code Protected Route Surfaces Planning Brief 6"
program_id: "t3-code-source-design-system-port"
brief_version: 6
status: "superseded"
summary: "Next slice for migrating protected Starter, Workers, settings, support, admin, and course surfaces inside the new Sidebar-backed app shell."
read_when:
  - "Writing the next protected route-surface child ExecPlan for the T3 Code migration."
  - "Changing Starter, Workers, settings, support/admin, or course surfaces after the Sidebar app shell migration."
---

# T3 Code Protected Route Surfaces Planning Brief 6

## Slice

Protected operational route surface migration: with the Sidebar-backed app shell live, migrate the high-traffic protected route content so Starter, Workers, settings, support/admin, and course screens read as T3 Code-style product tools instead of old Ship by Sunday page islands.

## Desired Outcome

Protected app pages should look and behave like dense T3 Code operational surfaces inside the new sidebar shell: compact page headers, quiet panels, restrained cards, tighter control rows, T3 primitives, and less route-local bespoke chrome. Ship by Sunday's product language, access checks, route URLs, Clerk/Convex runtime behavior, and billing/support affordances must remain intact.

The slice should stay bounded to visible protected route content and route-local structure. It should not rewrite public marketing/docs/blog, auth/checkout, Telegram widget CSS, generated customer output, or backend/provider behavior. It should continue the Program's structure goal by moving avoidable route-local implementation out of underscore folders only when that is needed for the touched surfaces.

## Scope

In scope:

- audit protected routes that now render inside `AppShell viewportMode="app"`
- migrate representative Starter/codebase, Workers/setup/findings/runs, settings, support/admin, and course/tutorial content surfaces to T3 Code visual density using the already-ported primitives
- reduce old top-header/local-rail assumptions left inside route content
- preserve route protection, entitlement, support-mode, billing attention, command menu, and navigation behavior
- add focused tests for any changed route behavior or shell-content contract
- run desktop and mobile browser proof on at least one Starter route and one Workers route inside the new sidebar shell
- update the Program ledger and a completed child ExecPlan

Out of scope:

- generated-codebase compiler/templates/docs
- public marketing, docs, blog, auth, checkout success, or Telegram widget migration
- Convex schema/functions, Clerk setup, Stripe setup, or provider configuration changes
- broad deletion of app-shell modules that still have live callers
- dependency changes or a Base UI migration

## Inputs

- `docs/programs/active/2026-05-14-t3-code-source-design-system-port/program.md`
- `docs/programs/active/2026-05-14-t3-code-source-design-system-port/planning-brief-5.md`
- `docs/exec-plans/completed/2026-05-14-t3-code-sidebar-app-shell.md`
- `/Users/bazelrex/Developer/oss/t3code/apps/web/src/routes`
- `/Users/bazelrex/Developer/oss/t3code/apps/web/src/components/AppSidebarLayout.tsx`
- `/Users/bazelrex/Developer/oss/t3code/apps/web/src/components/settings/settingsLayout.tsx`
- `apps/web/src/app/(app)`
- `apps/web/src/app/(app)/_components/app-shell.tsx`
- `apps/web/src/components/ui`
- `apps/web/tests/integration-ui`

## Acceptance

- The child ExecPlan records `program_id: "t3-code-source-design-system-port"` and this planning brief path.
- Touched protected routes keep their current route URLs, access boundaries, data loading, and AppShell props.
- Starter and Workers surfaces proven in this slice render inside `data-slot="sidebar-wrapper"` and do not reintroduce old top-header/local-rail chrome.
- Touched route content uses T3 primitive recipes and product-tool density rather than marketing-style cards or old visual islands.
- Focused tests cover changed route behavior and one or more live route render paths.
- Desktop and mobile browser proof verifies at least one Starter route and one Workers route with the sidebar shell.
- `bun run format`, focused app tests, `bun run --cwd apps/web lint`, `DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck`, Program/plan lint, markdown lint, repo lint/typecheck, scope checks, and `git diff --check` pass or exact blockers are recorded.

## Watchpoints

- Do not loosen protected route access or entitlement checks while changing visuals.
- Do not start generated-codebase work in this slice.
- Avoid widening into public marketing/docs/blog or auth/checkout unless the child ExecPlan explicitly scopes it.
- Keep route content dense and operational; avoid landing-page heroes, decorative card stacks, or one-note palettes.
- Preserve current command/menu/theme/user behavior from the Sidebar app shell.
