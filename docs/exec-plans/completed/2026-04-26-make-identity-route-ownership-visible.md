---
title: Make Identity Route Ownership Visible
status: complete
created_at: 2026-04-26
completed_at: 2026-04-26
summary: Move identity route wrapper screens into App Router private folders without changing Clerk, checkout recovery, or sign-in behavior.
post_build_recap: Identity route wrapper screens and support shell now live under apps/web/app/(identity) private folders with old auth feature paths kept as compatibility exports and focused plus app validation passed.
program_id: app-structure-refactor
planning_brief: docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-4.md
read_when:
  - Reviewing the completed identity route ownership slice.
  - Checking why auth route utilities and form logic stayed in the auth feature.
  - Validating that Clerk, checkout recovery, and identity route behavior stayed unchanged.
---

# Make Identity Route Ownership Visible

This is a living execution plan. It describes the fourth implementation slice for the app structure refactor Program.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The identity routes should be readable from the App Router tree. Today the sign-in, post-checkout sign-up, SSO callback, reset-password shell, and their shared identity support panel live under broad auth feature paths even though they are wrappers for `apps/web/app/(identity)` routes. After this slice, those route wrappers will live under private `apps/web/app/(identity)` folders, so a reader inspecting the route group can find the UI boundary that each identity route renders.

This slice is behavior-neutral. It should not change Clerk authentication, sign-in redirects, Google SSO handling, password reset tasks, checkout recovery, Stripe session validation, billing, route aliases, Convex state, or environment behavior.

## Progress

- [x] 2026-04-26 EDT: Confirmed the first three child ExecPlans are complete and the Program has no active child ExecPlan for the next route ownership slice.
- [x] 2026-04-26 EDT: Inspected identity route pages, identity wrapper consumers, focused identity tests, release workflow guidance, and local Next App Router server/client component documentation before editing.
- [x] 2026-04-26 EDT: Wrote planning brief 4 and opened this active child ExecPlan for identity route ownership.
- [x] 2026-04-26 EDT: Moved identity wrapper screens, support shell, and support panel content into private `apps/web/app/(identity)` folders.
- [x] 2026-04-26 EDT: Updated first-party identity routes and focused tests to import the new App Router private paths.
- [x] 2026-04-26 EDT: Left temporary compatibility re-exports at the old auth feature paths.
- [x] 2026-04-26 EDT: Focused identity unit tests passed.
- [x] 2026-04-26 EDT: Focused identity integration-ui tests passed.
- [x] 2026-04-26 EDT: App format check, lint, and typecheck passed after the identity route wrapper moves.
- [x] 2026-04-26 EDT: Completed-path plan lint, Program lint, markdown lint, and `git diff --check` passed after archival.

## Surprises & Discoveries

2026-04-26 EDT: `apps/web/features/auth/sign-in/sign-in-route-utils.ts` is not route-private identity UI. It is used by sign-in, sign-up, SSO callback, protected access behavior, checkout success behavior, and tests, so it must stay in the auth feature for this slice.

2026-04-26 EDT: The identity wrapper files have a clean route-local boundary. `SignInPage`, `SsoCallbackPage`, `PostCheckoutSignUpPage`, `AuthPageShell`, `AuthPageSupportPanel`, and `identity-route-panel-content.ts` are consumed by identity route pages and focused tests. The deeper auth forms, hooks, and route utility modules remain durable auth feature code.

2026-04-26 EDT: The local Next docs are installed under `node_modules/next/dist/docs`, not under `apps/web/node_modules/next/dist/docs` as the app instruction file names. The relevant App Router docs say pages are Server Components by default, Client Components need a top-level `"use client"` directive, and a client directive marks the client module boundary for imported dependencies.

2026-04-26 EDT: After the move, the focused old-path scan over `apps/web/app`, `apps/web/tests`, and `apps/web/features` produced no matches. The old auth feature files now contain compatibility re-exports to `@/app/(identity)/...` paths.

## Decision Log

Decision: Split identity route ownership out from checkout success, review, and API route contracts.
Rationale: Identity wrappers can move with focused route and integration-ui tests. Checkout success touches billing handoff, review touches Convex-backed preload behavior, and API route contracts need separate request-boundary proof.
Date: 2026-04-26

Decision: Keep `sign-in-route-utils.ts` in the auth feature.
Rationale: The module is shared by identity, access, and checkout surfaces. Moving it under `app/(identity)` would make non-identity features import a route-private module and would hide a durable auth-routing contract.
Date: 2026-04-26

Decision: Keep temporary compatibility exports at the old feature paths.
Rationale: This Program is still mid-migration. Re-exports make hidden imports less disruptive while first-party code is moved to the App Router path.
Date: 2026-04-26

## Outcomes & Retrospective

This plan is complete. First-party identity route code and tests now import `SignInPage`, `SsoCallbackPage`, `PostCheckoutSignUpPage`, `AuthPageShell`, and identity support panel content from private `apps/web/app/(identity)` paths. The old auth feature paths remain as thin compatibility re-exports.

Focused identity unit tests, identity integration-ui tests, app format check, app lint, and app typecheck passed. The implementation did not move route pages, durable auth route utilities, auth hooks, sign-in or sign-up form components, checkout success screens, checkout recovery helpers, review route logic, API route contracts, course registry or manifest files, Convex schema or generated files, Stripe checkout or billing behavior, UI inventory, or the unrelated stashed scrollbar styling.

## Context and Orientation

Ship by Sunday's web app lives in `apps/web`. The App Router lives under `apps/web/app`. Durable feature code lives under `apps/web/features`. The Program's boundary rule is that route entrypoints, route-level wrappers, route-only UI shells, and route-only support content should live near the route that uses them.

The identity route group is `apps/web/app/(identity)`. The sign-in route page is `apps/web/app/(identity)/sign-in/[[...sign-in]]/page.tsx`; it currently imports `SignInPage` from `apps/web/features/auth/sign-in/sign-in-page.tsx`. The post-checkout sign-up page is `apps/web/app/(identity)/sign-up/[[...sign-up]]/page.tsx`; it currently imports `PostCheckoutSignUpPage` from `apps/web/features/auth/sign-up/post-checkout-sign-up-page.tsx`. The SSO callback page is `apps/web/app/(identity)/sso-callback/page.tsx`; it currently imports `SsoCallbackPage` from `apps/web/features/auth/sign-in/sso-callback-page.tsx`. The reset-password task page is `apps/web/app/(identity)/session-tasks/reset-password/page.tsx`; it currently imports the identity shell and support panel content from `apps/web/features/auth/sign-in`.

The route wrappers compose durable auth feature logic. `SignInPage` uses `apps/web/features/auth/sign-in/use-sign-in-flow.ts` and sign-in form components. `PostCheckoutSignUpPage` uses `apps/web/features/auth/sign-up/use-post-checkout-sign-up-flow.ts` and post-checkout sign-up form components. `SsoCallbackPage` uses Clerk hooks and shared auth route utilities. Those durable auth hooks, form components, and route utilities are not moved in this slice.

### In Scope

Move `apps/web/features/auth/sign-in/auth-page-shell.tsx`, `apps/web/features/auth/sign-in/auth-page-support-panel.tsx`, `apps/web/features/auth/sign-in/identity-route-panel-content.ts`, `apps/web/features/auth/sign-in/sign-in-page.tsx`, `apps/web/features/auth/sign-in/sso-callback-page.tsx`, and `apps/web/features/auth/sign-up/post-checkout-sign-up-page.tsx` into private folders under `apps/web/app/(identity)/`.

Update first-party identity route files and focused tests to import the moved modules from the new App Router private paths.

Leave temporary compatibility re-exports in the old feature paths.

Update this ExecPlan, the owning Program, the current planning brief pointer, and only plan surfaces required by the actual changes.

### Out Of Scope

Do not move route pages themselves.

Do not move `apps/web/features/auth/sign-in/sign-in-route-utils.ts`, sign-in form components, sign-in page content, sign-up form components, auth hooks, Clerk utility helpers, checkout recovery helpers, checkout success screens, review route control, API route request contracts, course lesson registry files, course manifest files, Convex schema, generated Convex files, public Convex function names, hosted Convex configuration, Stripe checkout, webhook behavior, pricing, promo code behavior, billing proof, or environment behavior.

Do not delete top-level feature folders or `components/ui` inventory.

Do not include the unrelated stashed scrollbar styling change.

## Plan of Work

Start by confirming the current import fan-in for the identity wrapper modules. Record the baseline in this plan so later reviewers can see why these files are route-owned and why `sign-in-route-utils.ts` stays in the auth feature.

Create `apps/web/app/(identity)/_components/` and `apps/web/app/(identity)/_lib/`.

Move the identity shell and support content files into private App Router folders. `AuthPageShell`, `AuthPageSupportPanel`, `SignInPage`, `SsoCallbackPage`, and `PostCheckoutSignUpPage` should live under `apps/web/app/(identity)/_components/`. `identity-route-panel-content.ts` should live under `apps/web/app/(identity)/_lib/`.

Update imports inside the moved files to use local relative imports for moved identity route wrappers and to continue using `@/features/auth/...` imports for durable auth forms, hooks, page content, and route utilities.

Update `apps/web/app/(identity)/sign-in/[[...sign-in]]/page.tsx`, `apps/web/app/(identity)/sign-up/[[...sign-up]]/page.tsx`, `apps/web/app/(identity)/sso-callback/page.tsx`, and `apps/web/app/(identity)/session-tasks/reset-password/page.tsx` to import moved wrappers from the new App Router private paths.

Update focused identity tests and test mocks to import the moved wrappers from the new App Router private paths.

Replace the old feature wrapper files with compatibility re-exports from the new route-local paths. Keep `"use client"` in old compatibility files that re-export Client Components.

Keep plan and Program documents current as work proceeds. If validation reveals a hidden durable consumer, record it in `Surprises & Discoveries` before changing the approach.

## Milestones

The first milestone is plan and baseline evidence. It is complete when planning brief 4 and this ExecPlan exist, lint cleanly, and the baseline import scan proves which production files and tests consume the identity wrapper modules.

The second milestone is identity wrapper colocation. It is complete when identity wrapper files live under `apps/web/app/(identity)` private folders, first-party identity routes and tests import the new paths, and old feature paths are compatibility re-exports.

The third milestone is validation. It is complete when focused identity route tests, focused identity integration-ui tests, format check, app lint, app typecheck, plan lint, Program lint, markdown lint, and diff checks pass.

The fourth milestone is archival. It is complete when this ExecPlan records the completed outcome, moves from `docs/exec-plans/active/` to `docs/exec-plans/completed/`, and the Program names the next slice.

## Concrete Steps

From repo root, confirm branch and status:

    git status --short --branch

Read the Program, the current planning brief, and this plan:

    sed -n '1,220p' docs/programs/completed/2026-04-26-app-structure-refactor/program.md
    sed -n '1,220p' docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-4.md
    sed -n '1,260p' docs/exec-plans/active/2026-04-26-make-identity-route-ownership-visible.md

Record baseline imports:

    rg 'features/auth/sign-(in|up)/(auth-page-shell|auth-page-support-panel|identity-route-panel-content|sign-in-page|sso-callback-page|post-checkout-sign-up-page)' apps/web --glob '!node_modules'
    rg 'features/auth/sign-in/sign-in-route-utils' apps/web --glob '!node_modules'

After the moves and import updates, prove first-party consumers use the App Router paths and old feature paths are compatibility exports:

    rg 'features/auth/sign-(in|up)/(auth-page-shell|auth-page-support-panel|identity-route-panel-content|sign-in-page|sso-callback-page|post-checkout-sign-up-page)' apps/web/app apps/web/tests --glob '!node_modules'
    rg 'app/\\(identity\\)/(_components/(auth-page-shell|auth-page-support-panel|sign-in-page|sso-callback-page|post-checkout-sign-up-page)|_lib/identity-route-panel-content)' apps/web --glob '!node_modules'

Run focused identity tests:

    bun run --cwd apps/web test:unit -- tests/unit/sign-in-route.test.ts tests/unit/sign-up-route.test.ts tests/unit/sign-in-route-utils.test.ts tests/unit/route-metadata.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/sign-in-page.test.tsx tests/integration-ui/sso-callback-page.test.tsx tests/integration-ui/post-checkout-sign-up-page.test.tsx tests/integration-ui/reset-password-page.test.tsx

Then run app and plan checks:

    bun run format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-26-make-identity-route-ownership-visible.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/completed/2026-04-26-app-structure-refactor docs/exec-plans/completed/2026-04-26-make-identity-route-ownership-visible.md
    git diff --check

## Validation and Acceptance

This slice is accepted because the identity wrapper screens and identity support shell live under `apps/web/app/(identity)` private folders, first-party identity routes and tests import those App Router paths, old feature paths are compatibility re-exports only, durable auth hooks and route utilities remain in `apps/web/features/auth`, and focused plus app-level validation passed.

Identity route behavior must remain unchanged. Unit tests must still prove sign-in and sign-up server route decisions, redirect sanitization, metadata, and route utility behavior. Integration-ui tests must still prove sign-in, SSO callback, post-checkout sign-up, and reset-password UI behavior.

Checkout recovery behavior must remain unchanged. This slice may move the wrapper rendered by the post-checkout sign-up route, but it must not change Stripe session recovery helpers, paid-session checks, checkout email handling, or redirect destinations.

### Test Commands

Run these commands from repo root after implementation:

    bun run --cwd apps/web test:unit -- tests/unit/sign-in-route.test.ts tests/unit/sign-up-route.test.ts tests/unit/sign-in-route-utils.test.ts tests/unit/route-metadata.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/sign-in-page.test.tsx tests/integration-ui/sso-callback-page.test.tsx tests/integration-ui/post-checkout-sign-up-page.test.tsx tests/integration-ui/reset-password-page.test.tsx
    bun run format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-26-make-identity-route-ownership-visible.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/completed/2026-04-26-app-structure-refactor docs/exec-plans/completed/2026-04-26-make-identity-route-ownership-visible.md
    git diff --check

## Idempotence and Recovery

The moves are safe to retry because the old feature files become compatibility re-exports. If a path rewrite misses a test mock or static import, fix the import and rerun the focused tests.

If typecheck shows that a moved wrapper is imported by a durable non-route feature, stop and record the consumer before deciding whether to keep a compatibility export or move that wrapper back. Do not broaden the slice into checkout success, review preload, API route contracts, course registry, Convex, or billing.

If identity tests fail, compare imports and client boundaries first. This slice should not change logic or copy. Repair path and module-boundary issues before considering behavior changes.

## Artifacts and Notes

Source Program packet:

    docs/programs/completed/2026-04-26-app-structure-refactor/

Current planning brief:

    docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-4.md

Baseline route-owned identity wrapper fan-in:

    apps/web/app/(identity)/sign-in/[[...sign-in]]/page.tsx
    apps/web/app/(identity)/sign-up/[[...sign-up]]/page.tsx
    apps/web/app/(identity)/sso-callback/page.tsx
    apps/web/app/(identity)/session-tasks/reset-password/page.tsx
    apps/web/tests/unit/sign-in-route.test.ts
    apps/web/tests/unit/sign-up-route.test.ts
    apps/web/tests/integration-ui/sign-in-page.test.tsx
    apps/web/tests/integration-ui/sso-callback-page.test.tsx
    apps/web/tests/integration-ui/post-checkout-sign-up-page.test.tsx
    apps/web/tests/integration-ui/reset-password-page.test.tsx

Focused validation passed:

    bun run --cwd apps/web test:unit -- tests/unit/sign-in-route.test.ts tests/unit/sign-up-route.test.ts tests/unit/sign-in-route-utils.test.ts tests/unit/route-metadata.test.ts
    Test Files  4 passed (4)
    Tests  14 passed (14)

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/sign-in-page.test.tsx tests/integration-ui/sso-callback-page.test.tsx tests/integration-ui/post-checkout-sign-up-page.test.tsx tests/integration-ui/reset-password-page.test.tsx
    Test Files  4 passed (4)
    Tests  20 passed (20)

App validation passed:

    bun run format:check
    All matched files use the correct format.

    bun run --cwd apps/web lint
    Found 0 warnings and 0 errors.

    bun run --cwd apps/web typecheck
    Compiled successfully, finished TypeScript, generated 71 static pages, and produced the App Router route graph.

Plan and diff validation passed after archival:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-26-make-identity-route-ownership-visible.md
    docs/exec-plans/completed/2026-04-26-make-identity-route-ownership-visible.md: ok

    bun run programs:lint
    app-structure-refactor: ok

    bun run markdown:lint -- --paths docs/programs/completed/2026-04-26-app-structure-refactor docs/exec-plans/completed/2026-04-26-make-identity-route-ownership-visible.md
    docs/exec-plans/completed/2026-04-26-make-identity-route-ownership-visible.md: ok
    docs/programs/completed/2026-04-26-app-structure-refactor/program.md: ok

    git diff --check
    no output

## Interfaces and Dependencies

This plan depends on `apps/web/app/(identity)`, `apps/web/features/auth/sign-in`, `apps/web/features/auth/sign-up`, `apps/web/features/checkout/server/checkout-session-recovery.ts`, Clerk's Next.js components and hooks, local Next App Router server and client component behavior, `docs/release-workflow.md`, `apps/web/AGENTS.md`, the root `AGENTS.md`, `docs/programs/PROGRAMS.md`, and `docs/exec-plans/PLANS.md`.
