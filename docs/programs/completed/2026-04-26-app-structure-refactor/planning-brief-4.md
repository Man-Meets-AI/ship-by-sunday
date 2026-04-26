---
title: App Structure Refactor Planning Brief 4
program_id: app-structure-refactor
brief_version: 4
status: current
summary: Move identity route wrapper screens into private App Router folders without changing Clerk, checkout recovery, or sign-in behavior.
read_when:
  - Writing the fourth child ExecPlan for the app structure refactor Program.
  - Continuing route ownership after the first workspace route colocation slice.
  - Preserving identity, checkout, billing, Convex, and API boundaries during route colocation.
---

# App Structure Refactor Planning Brief 4

## Planning Refresh

This is the fourth planning brief for the app structure refactor Program.

The first child ExecPlan is complete at `docs/exec-plans/completed/2026-04-26-make-app-structure-boundaries-explicit.md`. It made selected cross-feature imports explicit, moved shared assertion helpers to `apps/web/lib/assert.ts`, added server-only guards to true server helper modules, and passed focused and app-level validation.

The second child ExecPlan is complete at `docs/exec-plans/completed/2026-04-26-extract-workspace-shell-from-course.md`. It moved the shared AppShell implementation into `apps/web/features/workspace-shell`, updated first-party imports, kept temporary compatibility exports at the old course-owned shell path, and passed focused and app-level validation.

The third child ExecPlan is complete at `docs/exec-plans/completed/2026-04-26-make-route-ownership-visible.md`. It moved the protected workspace access gate and legacy blueprint redirect helper into private `apps/web/app/(workspace)` folders, updated first-party imports and tests, kept temporary compatibility exports, and passed focused and app-level validation.

## What The Previous Slice Unblocked

The App Router now owns the first route-local workspace surfaces. That proves the compatibility-export pattern works for route colocation without deleting feature folders or changing behavior.

The remaining broad route-ownership recommendation is still too large to execute safely as one slice. Identity route wrappers are the next smallest viable part because they are visible App Router screens with focused tests and can move without changing sign-in route utilities, checkout success behavior, Stripe recovery, review preload, Convex state, or API route contracts.

## Next Plan Recommendation

Exact next plan title: `Make Identity Route Ownership Visible`.

Exact scope: move the route-owned identity wrapper screens and support shell from `apps/web/features/auth/sign-in/auth-page-shell.tsx`, `apps/web/features/auth/sign-in/auth-page-support-panel.tsx`, `apps/web/features/auth/sign-in/identity-route-panel-content.ts`, `apps/web/features/auth/sign-in/sign-in-page.tsx`, `apps/web/features/auth/sign-in/sso-callback-page.tsx`, and `apps/web/features/auth/sign-up/post-checkout-sign-up-page.tsx` into private folders under `apps/web/app/(identity)/`. Update first-party route imports and focused tests to the new App Router paths, while leaving temporary compatibility re-exports at the old feature paths.

Exact implementation boundaries: do not move `apps/web/features/auth/sign-in/sign-in-route-utils.ts`, sign-in form components, sign-up form components, auth hooks, checkout recovery helpers, checkout success screens, review route logic, API route contracts, course lesson registry or manifest files, route pages themselves, Convex schema or generated files, Stripe checkout, webhook, pricing, promo code, billing proof, or environment behavior. Do not delete `components/ui` inventory or include the unrelated stashed scrollbar styling change.

Exact validation boundaries: run focused identity route unit tests and identity integration-ui tests first. Then run `bun run format:check`, `bun run --cwd apps/web lint`, `bun run --cwd apps/web typecheck`, plan lint, Program lint, markdown lint, and `git diff --check`.

Why it is next: the identity wrapper screens are currently consumed by the identity App Router pages and their tests. Moving only those wrappers makes route ownership more visible while keeping the durable auth route utilities and form logic in the auth feature, where checkout success, product access, and other route surfaces still depend on them.

## Risks To Carry Forward

Keep `apps/web/features/auth/sign-in/sign-in-route-utils.ts` in the auth feature for this slice. It is consumed by sign-in, sign-up, SSO callback, protected access, and checkout success surfaces, so moving it under `app/(identity)` would make non-identity features depend on a route-private module.

Keep checkout success and sign-up recovery behavior unchanged. The sign-up page may import a moved route wrapper, but Stripe session recovery helpers, checkout email validation, paid-session checks, and redirects must stay as they are.

Keep compatibility exports temporary and obvious. Later slices should remove old feature-path re-exports only after import scans prove first-party code no longer uses them.

Do not use this slice to alter Clerk task handling, sign-in redirects, Google SSO behavior, password reset routing, checkout handoff, review auto-download behavior, or API request contracts.
