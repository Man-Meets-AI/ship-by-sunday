---
title: Remove Auth Feature Surface
status: complete
created_at: 2026-04-27
completed_at: 2026-04-27
summary: Delete the auth feature folder by moving identity route UI into the identity route group and shared auth route helpers into platform auth without changing Clerk or checkout handoff behavior.
post_build_recap: Identity UI now lives under app/(identity) private folders, shared auth route helpers live under platform/auth, post-checkout sign-up release-scope classification points at the new owner, the old auth feature folder is deleted, and focused auth plus app validation passed.
program_id: remove-feature-folder-surface
planning_brief: docs/programs/active/2026-04-26-remove-feature-folder-surface/planning-brief-13.md
read_when:
  - Resuming the auth feature-folder removal slice.
  - Checking why identity UI lives under app/(identity).
  - Checking why auth route URL helpers live under platform/auth.
  - Validating that no features/auth references remain.
---

# Remove Auth Feature Surface

This is a living execution plan for deleting the auth feature folder.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The app-owned identity routes should own their own UI instead of reaching into a broad auth feature folder. At the same time, the URL helpers for `/sign-in`, `/sign-up`, `/sso-callback`, and Clerk session tasks are used outside the identity route group by root layout, workspace access, checkout success, and tests, so they should live in a neutral platform auth module. After this slice, `apps/web/features/auth` should be gone while sign-in, sign-up, SSO callback, reset-password task redirects, protected-route sign-in redirects, checkout-success sign-up links, and post-checkout sign-up behavior stay the same.

## Progress

- [x] 2026-04-27 EDT: Created branch `codex/remove-auth-feature-surface` from verified `main` at `bdb7d9c`.
- [x] 2026-04-27 EDT: Confirmed `features/auth` contains eighteen files: one identity layout header, fifteen sign-in components/helpers/hooks/types, and two post-checkout sign-up files.
- [x] 2026-04-27 EDT: Confirmed `sign-in-route-utils.ts` is consumed by identity routes, root layout, workspace access, checkout success, sign-up flow, and tests, so it must move to a shared platform auth home instead of an identity private folder.
- [x] 2026-04-27 EDT: Confirmed `scripts/release/lib/release-scope.mjs` treats the old `apps/web/features/auth/sign-up/` prefix as billing sensitive, so this slice must update release-scope classification for the new post-checkout sign-up owner.
- [x] 2026-04-27 EDT: Created planning brief 13 and this active child ExecPlan.
- [x] 2026-04-27 EDT: Moved the identity layout header, sign-in UI, sign-in flow hook, sign-in content helpers, and post-checkout sign-up UI into `apps/web/app/(identity)` private component folders.
- [x] 2026-04-27 EDT: Moved shared auth route URL and Clerk task helpers to `apps/web/platform/auth/auth-route-utils.ts`.
- [x] 2026-04-27 EDT: Updated release-scope classification and focused release-scope tests so the new post-checkout sign-up owners remain billing sensitive.
- [x] 2026-04-27 EDT: Deleted `apps/web/features/auth`; old-path import scans returned no app or script matches and Convex schema/generated files remained untouched.
- [x] 2026-04-27 EDT: Focused auth route utility, route, metadata, proxy, and release-scope unit tests passed: 6 files and 19 tests.
- [x] 2026-04-27 EDT: Focused sign-in, post-checkout sign-up, SSO callback, access-required, and checkout-success integration-ui tests passed: 6 files and 36 tests.
- [x] 2026-04-27 EDT: App format check, app lint, and app typecheck passed. The typecheck build output still includes `/sign-in`, `/sign-up`, `/sso-callback`, `/session-tasks/reset-password`, and `/checkout/success`.
- [x] 2026-04-27 EDT: ExecPlan lint, Program lint, markdown lint, Convex schema/generated diff check, and `git diff --check` passed.

## Surprises & Discoveries

The prior identity route ownership slice deliberately left `sign-in-route-utils.ts` under the auth feature because it was not route-private identity UI. That remains true, but the replacement owner is now clearer: `apps/web/platform/auth` already owns Clerk middleware bypass, authorized party, and Convex auth helpers, and the route utility module defines app-wide auth path semantics consumed by multiple surfaces.

The old auth sign-up feature folder is part of billing-sensitive release classification. Moving those files without updating `scripts/release/lib/release-scope.mjs` would make future post-checkout sign-up changes less visible to production proof. This slice must update the classifier and focused unit test as part of preserving, not changing, the proof contract.

The draft Test Commands initially used `test:integration-ui`, but the actual app script is `test:integration:ui`. The plan was corrected before final validation. Running the sign-in integration-ui test also exposed an existing duplicate-React edge in the third-party `input-otp` dependency. The sign-in test now mocks `@/components/ui/input-otp` locally because this slice needs to prove auth flow behavior, not the internals of the shared OTP primitive.

## Decision Log

Decision: Move identity route UI, sign-in forms, sign-in flow hooks, sign-in content helpers, and post-checkout sign-up UI into `apps/web/app/(identity)` private component folders.
Rationale: These files are rendered only by the app-owned identity route group and are not durable product-domain modules.
Date: 2026-04-27

Decision: Move shared auth URL and Clerk task redirect helpers to `apps/web/platform/auth/auth-route-utils.ts`.
Rationale: These helpers define app-wide auth URL semantics and are consumed by root layout, checkout success, protected workspace access, sign-up flow, SSO callback, and identity routes.
Date: 2026-04-27

Decision: Preserve billing-sensitive release classification for post-checkout sign-up code at the new path.
Rationale: The old `features/auth/sign-up` prefix was billing sensitive because sign-up owns checkout-account handoff. Moving the files must not weaken production proof selection.
Date: 2026-04-27

## Outcomes & Retrospective

This slice is complete. `apps/web/features/auth` was deleted. Identity route UI, sign-in forms, sign-in flow hooks, sign-in content helpers, and post-checkout sign-up UI now live under `apps/web/app/(identity)` private component folders. Shared auth URL and Clerk task redirect helpers now live under `apps/web/platform/auth/auth-route-utils.ts`. Release-scope classification now treats the new post-checkout sign-up owners as billing sensitive. Route URLs, query parameters, redirect sanitization, Clerk task handling, checkout session recovery, Convex schema, generated Convex files, and Stripe behavior were intentionally unchanged.

## Context and Orientation

`apps/web/app/(identity)` owns app routes for `/sign-in`, `/sign-up`, `/sso-callback`, and `/session-tasks/reset-password`. Existing route-local wrappers already live in `apps/web/app/(identity)/_components` and `apps/web/app/(identity)/_lib`, but they still import sign-in forms, sign-in client flow hooks, sign-in copy helpers, and post-checkout sign-up code from `apps/web/features/auth`.

`apps/web/features/auth/sign-in/sign-in-route-utils.ts` builds and sanitizes auth URLs, maps the `purchase_required` auth error, exposes Clerk task URLs for `ClerkProvider`, and completes Clerk task redirects. It is used by `apps/web/app/layout.tsx`, `apps/web/app/(workspace)/_hooks/use-access-required-controller.ts`, `apps/web/app/checkout/success/_lib/checkout-success-view-model.ts`, identity route files, sign-in and sign-up hooks, and tests.

`apps/web/features/auth/sign-up/post-checkout-sign-up-form.tsx` and `apps/web/features/auth/sign-up/use-post-checkout-sign-up-flow.ts` are part of the checkout-to-account handoff. The release-scope classifier currently treats the old sign-up feature folder as billing sensitive, so the new owner must remain billing sensitive.

### In Scope

Move `apps/web/features/auth/identity/identity-layout-header.tsx` to `apps/web/app/(identity)/_components/identity-layout-header.tsx`.

Move sign-in UI components, sign-in flow hook, sign-in page content, sign-in verification copy, and sign-in flow types to `apps/web/app/(identity)/_components/sign-in`.

Move post-checkout sign-up form and hook to `apps/web/app/(identity)/_components/sign-up`.

Move shared auth route URL helpers to `apps/web/platform/auth/auth-route-utils.ts`, with the `SignInAuthError` type owned by that module.

Update route pages, root layout, workspace access, checkout success, tests, release-scope classification, Program/ExecPlan docs, and import scans away from `@/features/auth`, then delete `apps/web/features/auth`.

### Out Of Scope

Do not change route URLs, query parameter names, redirect sanitization behavior, Clerk environment behavior, Clerk middleware behavior, checkout session recovery, Stripe checkout, pricing, promo code behavior, Convex schema, generated Convex files, AppShell, protected route policy, public auth copy, sign-in/sign-up form behavior, or production release proof semantics.

Do not move `apps/web/features/blueprint-flow`, `apps/web/features/course`, `apps/web/features/execute-ship`, `apps/web/features/marketing`, or `apps/web/features/workspace-shell` in this slice.

## Plan of Work

Create private folders under `apps/web/app/(identity)/_components/sign-in` and `apps/web/app/(identity)/_components/sign-up`. Move sign-in presentation files, sign-in content helpers, verification helpers, and the sign-in flow hook into the sign-in folder. Move the post-checkout sign-up form and hook into the sign-up folder. Move the identity layout header into the existing identity `_components` folder.

Create `apps/web/platform/auth/auth-route-utils.ts` from the old `sign-in-route-utils.ts`, define `SignInAuthError` in that module, and move the remaining sign-in UI state types into the sign-in private folder. Update all consumers to import auth URL helpers from platform auth and identity UI types from the new sign-in private folder.

Update `scripts/release/lib/release-scope.mjs` so post-checkout sign-up code at its new owner remains billing sensitive, and update `apps/web/tests/unit/release-scope.test.ts` to prove the new path is classified.

Delete `apps/web/features/auth`, run old-path scans, then run focused auth, checkout handoff, access redirect, release-scope, app, and Program validation.

## Milestones

The first milestone is identity UI ownership. It is complete when sign-in/sign-up UI, hooks, content helpers, and the identity header live under `apps/web/app/(identity)` private folders and route wrappers import the new owners.

The second milestone is shared auth route ownership. It is complete when app-wide auth URL helpers live under `apps/web/platform/auth/auth-route-utils.ts` and all non-identity consumers import that neutral module.

The third milestone is billing-sensitive proof preservation. It is complete when release-scope classification names the new post-checkout sign-up owner and focused unit tests prove it.

The fourth milestone is feature-folder deletion. It is complete when `apps/web/features/auth` is absent and import scans return no old auth feature references under app code or scripts.

The fifth milestone is validation. It is complete when focused auth and handoff tests pass, app format check, app lint, app typecheck, plan lint, Program lint, markdown lint, and `git diff --check` all pass.

## Concrete Steps

From repo root, confirm branch and status:

    git status --short --branch

After edits, run import scans:

    rg '@/features/auth|features/auth|\\.\\./features/auth|\\.\\./\\.\\./features/auth' apps/web scripts
    find apps/web/features/auth -maxdepth 4 -type f

The first scan should return no app or script matches. The second command should fail because the folder was deleted.

## Validation and Acceptance

Acceptance requires `apps/web/features/auth` to be deleted, all old auth feature imports to be gone, identity routes to keep their current behavior, checkout-success sign-up links and post-checkout sign-up flow to remain stable, protected-route sign-in redirects to remain stable, and release-scope classification to keep post-checkout sign-up code billing sensitive at the new path. App typecheck must still build `/sign-in`, `/sign-up`, `/sso-callback`, `/session-tasks/reset-password`, `/checkout/success`, and protected workspace routes.

### Test Commands

Run these commands from repo root:

    bun run --cwd apps/web test:unit -- tests/unit/sign-in-route-utils.test.ts tests/unit/sign-in-route.test.ts tests/unit/sign-up-route.test.ts tests/unit/release-scope.test.ts tests/unit/route-metadata.test.ts tests/unit/proxy-protected-routes.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/sign-in-page.test.tsx tests/integration-ui/post-checkout-sign-up-page.test.tsx tests/integration-ui/sso-callback-page.test.tsx tests/integration-ui/access-required-page.test.tsx tests/integration-ui/access-required-page.interactions.test.tsx tests/integration-ui/checkout-success-view.test.tsx
    bun run --cwd apps/web format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-27-remove-auth-feature-surface.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/active/2026-04-26-remove-feature-folder-surface docs/exec-plans/completed/2026-04-27-remove-auth-feature-surface.md
    git diff --check

After this PR merges, inspect the `Production Release Proof` run for the merged `main` commit and confirm `default_ship`, `billing_integration`, and `release_gate` pass unless the release-scope job explicitly proves billing proof is not required.

## Idempotence and Recovery

These are file moves and import updates. If a scan finds old paths, update the consumer to the new identity private owner or platform auth owner instead of adding compatibility re-exports. If a non-identity consumer would need to import from `app/(identity)/_components`, stop and move the needed shared helper to `apps/web/platform/auth` instead.

If sign-in, sign-up, checkout success, or access-required tests fail, compare route utility behavior before changing UI or Clerk flow code. The route URLs, query parameters, redirect sanitization, and Clerk task handling should not change in this slice.

## Artifacts and Notes

Initial import scan:

    rg '@/features/auth|features/auth|\.\./features/auth|\.\./\.\./features/auth' apps/web scripts docs

The scan shows consumers in root layout, identity route wrappers, workspace access, checkout success, focused tests, the release-scope classifier, and historical docs. App and script references should move to new owners. Historical completed plans and older docs may keep old-path history unless a current docs surface needs an ownership update.

The final app/script scan should return no matches. `find apps/web/features/auth -maxdepth 4 -type f` should fail with `No such file or directory`. `git diff --name-only -- apps/web/convex/schema.ts apps/web/convex/_generated` should return no matches.

## Interfaces and Dependencies

The auth slice depends on Next.js App Router private-folder conventions, Clerk's `ClerkProvider`, `useSignIn`, `useSignUp`, `useClerk`, and `TaskResetPassword`, the app-owned identity route group, checkout session recovery, protected workspace access redirects, `apps/web/platform/auth`, `apps/web/platform/billing/checkout/checkout-session-recovery.ts`, release-scope classification, and production release proof for the merged `main` commit.
