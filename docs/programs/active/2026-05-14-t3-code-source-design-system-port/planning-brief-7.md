---
title: "T3 Code Remaining Protected Surfaces Planning Brief 7"
program_id: "t3-code-source-design-system-port"
brief_version: 7
status: "current"
summary: "Next slice for applying the protected route-surface recipe to remaining Worker findings/runs, support/admin, and course/tutorial app surfaces."
read_when:
  - "Writing the next protected route-surface child ExecPlan after the Starter/Workers setup/settings pass."
  - "Changing Worker findings/runs, support/admin, or course/tutorial protected app surfaces during the T3 Code migration."
---

# T3 Code Remaining Protected Surfaces Planning Brief 7

## Slice

Remaining protected operational surface sweep: apply the proven protected route-surface recipe to the protected Worker findings/runs, support/admin, and course/tutorial surfaces that still read as older route-local islands after the Starter home, Workers setup, and settings pass.

## Desired Outcome

The protected app should feel coherent inside the Sidebar shell across the remaining high-traffic app routes. Worker findings/runs, support/admin, and course/tutorial pages should use compact headers, quiet T3 panels, dense rows, and shared primitives instead of old page islands or serif document styling. Ship by Sunday's product language, route URLs, access checks, support-mode behavior, billing affordances, Clerk/Convex runtime behavior, and AppShell props must remain intact.

This slice should build on `apps/web/src/components/app/protected-route-surface.tsx`. It should migrate existing content structure without broad product rewrites, backend changes, generated-codebase output, public marketing/docs/blog work, auth/checkout work, or dependency changes.

## Scope

In scope:

- audit remaining protected routes that render inside `AppShell viewportMode="app"` and were not touched by the Starter/Workers setup/settings slice
- migrate representative Worker findings/runs surfaces to the shared protected route-surface helpers
- migrate representative support/admin or support-mode surfaces that are safe to touch without changing policy behavior
- migrate representative course/tutorial protected surfaces where route-local content still uses old visual recipes
- reduce avoidable route-local bespoke chrome only where a touched surface needs it
- preserve route protection, entitlement checks, support-mode policy, billing attention, command menu, theme/user controls, and navigation behavior
- add focused tests for changed visible contracts and behavior-sensitive routes
- run desktop and mobile browser proof on at least one Worker findings/runs route and one support/admin or course/tutorial route inside the Sidebar shell
- update the Program ledger and a completed child ExecPlan

Out of scope:

- generated-codebase compiler, templates, starter app output, or `docs/generated`
- public marketing, docs, blog, auth, checkout success, or Telegram widget migration
- Convex schema/functions, Clerk setup, Stripe setup, provider configuration, support-mode policy changes, or billing behavior changes
- broad deletion of app-shell modules that still have live callers
- dependency changes or a Base UI migration

## Inputs

- `docs/programs/active/2026-05-14-t3-code-source-design-system-port/program.md`
- `docs/exec-plans/completed/2026-05-15-t3-code-protected-route-surfaces.md`
- `docs/programs/active/2026-05-14-t3-code-source-design-system-port/planning-brief-6.md`
- `/Users/bazelrex/Developer/oss/t3code/apps/web/src/routes`
- `/Users/bazelrex/Developer/oss/t3code/apps/web/src/components/settings/settingsLayout.tsx`
- `apps/web/src/components/app/protected-route-surface.tsx`
- `apps/web/src/app/(app)/workers`
- `apps/web/src/app/(app)/admin`
- `apps/web/src/app/(app)/tutorials`
- `apps/web/src/app/(app)/lesson`
- `apps/web/tests/integration-ui`
- `apps/web/tests/unit`

## Acceptance

- The child ExecPlan records `program_id: "t3-code-source-design-system-port"` and this planning brief path.
- Touched protected routes keep current route URLs, access boundaries, data loading, AppShell props, support/admin policy behavior, and user-visible actions.
- Touched Worker findings/runs and support/admin or course/tutorial surfaces render through the shared protected route-surface recipe where appropriate.
- Old serif/hero/page-island styling is removed from touched surfaces without introducing landing-page composition inside the app shell.
- Focused tests cover changed visible contracts and any behavior-sensitive route path touched.
- Desktop and mobile browser proof verifies at least one Worker findings/runs route and one support/admin or course/tutorial route inside the Sidebar shell.
- `bun run format`, focused app tests, `bun run --cwd apps/web lint`, `DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck`, Program/plan lint, markdown lint, repo lint/typecheck, scope checks, and `git diff --check` pass or exact blockers are recorded.

## Watchpoints

- Do not loosen protected route access, support-mode policy, admin checks, entitlement checks, or billing behavior while changing visuals.
- Do not start generated-codebase, public surface, auth/checkout, or Telegram work in this slice.
- Keep route content dense and operational; avoid hero-style rewrites, decorative card stacks, or one-note palettes.
- Preserve current command/menu/theme/user behavior from the Sidebar app shell.
- Prefer the shared protected route-surface helpers before adding new route-local wrappers.
