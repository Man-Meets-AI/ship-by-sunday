---
title: App Structure Refactor Planning Brief 3
program_id: app-structure-refactor
brief_version: 3
status: current
summary: Make the first route-owned workspace surfaces visible under the App Router without changing access, checkout, or redirect behavior.
read_when:
  - Writing the third child ExecPlan for the app structure refactor Program.
  - Checking the first route-ownership move after AppShell extraction.
  - Preserving route, billing, Convex, and course registry boundaries during route colocation.
---

# App Structure Refactor Planning Brief 3

## Planning Refresh

This is the third planning brief for the app structure refactor Program.

The first child ExecPlan is complete at `docs/exec-plans/completed/2026-04-26-make-app-structure-boundaries-explicit.md`. It made selected cross-feature imports explicit, moved shared assertion helpers to `apps/web/lib/assert.ts`, added server-only guards to true server helper modules, and passed focused and app-level validation.

The second child ExecPlan is complete at `docs/exec-plans/completed/2026-04-26-extract-workspace-shell-from-course.md`. It moved the shared AppShell implementation into `apps/web/features/workspace-shell`, updated first-party imports, kept temporary compatibility exports at the old course-owned shell path, and passed focused and app-level validation.

## What The Previous Slice Unblocked

The workspace shell no longer blocks route-local colocation. The App Router can now start owning route-specific wrappers and small route helpers without making the route tree depend on a course-owned shell.

The Program packet says the next broad slice is `Make Route Ownership Visible`. That slice should start small because identity and checkout surfaces are release-sensitive, review preload reaches Convex state, and API route contracts need their own focused proof.

## Next Plan Recommendation

Exact next plan title: `Make Route Ownership Visible`.

Exact scope: move the route-owned workspace access gate UI from `apps/web/features/product-access/components`, `apps/web/features/product-access/hooks/use-access-required-controller.ts`, and `apps/web/features/product-access/lib/access-required-view-model.ts` into private folders under `apps/web/app/(workspace)/`. Move the legacy blueprint redirect helper from `apps/web/features/blueprint-flow/lib/legacy-blueprint-route-redirects.ts` into `apps/web/app/(workspace)/_lib/`. Update first-party imports and tests to the new App Router paths, while leaving temporary compatibility re-exports at the old feature paths.

Exact implementation boundaries: do not move identity sign-in or sign-up screens, checkout success screens, review preload logic, API route contracts, course lesson registry or manifest files, route pages themselves, Convex schema or generated files, Stripe checkout, webhook, pricing, promo code, billing proof, or environment behavior. Do not delete `components/ui` inventory or include the unrelated stashed scrollbar styling change.

Exact validation boundaries: run focused access-required unit and integration-ui tests, protected layout tests, and legacy redirect tests first. Then run `bun run format:check`, `bun run --cwd apps/web lint`, `bun run --cwd apps/web typecheck`, plan lint, Program lint, markdown lint, and `git diff --check`.

Why it is next: the access gate UI is currently used by the protected workspace layout and has no durable feature consumers beyond route tests. The legacy redirect helper is used only by App Router compatibility routes and its focused test. Moving these two surfaces makes route ownership more visible while avoiding billing, identity, Convex, and course-domain risk.

## Risks To Carry Forward

Keep `apps/web/features/product-access/server/product-access.ts` and `apps/web/features/product-access/lib/product-access.ts` in the product-access feature. They are durable access-domain code used outside the route-local access gate UI.

Keep compatibility exports temporary and obvious. Later slices should remove old feature-path re-exports only after import scans prove first-party code no longer uses them.

Do not use this slice to alter checkout handoff, auth redirects, Clerk task handling, protected-route coverage, review auto-download behavior, or route alias semantics.
