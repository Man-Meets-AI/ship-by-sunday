---
title: "T3 Code Auth Checkout Edge Surface Planning Brief 10"
program_id: "t3-code-source-design-system-port"
brief_version: 10
status: "current"
summary: "Next slice for migrating auth, checkout, access, error, and remaining behavior-sensitive edge surfaces after public route migration."
read_when:
  - "Writing the next auth, checkout, or edge-surface child ExecPlan after public surface migration."
  - "Changing sign-in, sign-up, reset-password, checkout success/cancel/recovery, not-found, access, or support-adjacent edge screens during the T3 Code migration."
---

# T3 Code Auth Checkout Edge Surface Planning Brief 10

## Slice

Auth, checkout, and edge-surface sweep: migrate the remaining behavior-sensitive public or semi-public route islands that a buyer, blocked user, or recovering user sees before or around protected app access.

## Desired Outcome

Sign-in, sign-up, reset-password, checkout success/cancel/recovery, not-found, error, access-adjacent, and support edge screens should no longer fall back to the old visual system after the protected app and public marketing pages have moved to T3 Code. These routes should use the shared T3 Code tokens, DM Sans, compact headers, quiet panels, clear states, and stable action rows while keeping all auth, checkout, entitlement, redirect, and recovery behavior intact.

This slice should make the fragile purchase-to-access and auth-adjacent surfaces visually consistent without changing who gets access, where checkout returns, which Clerk factors are used, which Stripe offer is selected, or how protected redirects are enforced.

## Scope

In scope:

- audit `(auth)`, checkout, cancel/success/recovery, reset-password, not-found, error, access-adjacent, and remaining support edge screens for old serif, old route-local panel, and old document-shell styling
- migrate the touched screens to T3 Code-style shared shells or focused local wrappers
- preserve Clerk sign-in/sign-up behavior, passwordless recovery behavior, checkout success finalization, cancel recovery, protected route redirects, access-required behavior, Stripe offer selection, and support affordances
- add focused tests for behavior-sensitive redirects, visible states, and no old serif/legacy route shells
- run browser proof for at least one auth route and one checkout/access edge route at desktop and mobile sizes
- update the Program ledger and a completed child ExecPlan

Out of scope:

- changing Clerk, Stripe, Convex, Cal.com, or provider configuration
- changing checkout session creation, webhook behavior, billing fulfillment, entitlements, or protected-route policy
- generated-codebase compiler, starter template output, generated customer docs, or `docs/generated`
- Telegram widget visual migration
- broad copy rewrite, new offers, or route IA changes

## Inputs

- `docs/programs/active/2026-05-14-t3-code-source-design-system-port/program.md`
- `docs/exec-plans/completed/2026-05-15-t3-code-public-surfaces.md`
- `docs/release-workflow.md`
- `apps/web/src/app/(auth)`
- `apps/web/src/app/checkout`
- `apps/web/src/app/(app)/_components/access-required`
- `apps/web/src/app/_components/theme-toggle-button.tsx`
- `apps/web/tests/unit`
- `apps/web/tests/integration-ui`

## Acceptance

- The child ExecPlan records `program_id: "t3-code-source-design-system-port"` and this planning brief path.
- Touched auth, checkout, access, and edge routes keep current route URLs, redirects, Clerk behavior, Stripe offer selection, checkout success/cancel behavior, entitlement checks, and recovery paths.
- Old serif/document shells are removed from touched edge surfaces without hiding required recovery information.
- Focused tests cover changed visible states and behavior-sensitive auth/checkout/access contracts.
- Desktop and mobile browser proof verifies one auth route and one checkout/access edge route.
- `bun run format`, focused app tests, `bun run --cwd apps/web lint`, `DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck`, Program/plan lint, markdown lint, repo lint/typecheck, scope checks, and `git diff --check` pass or exact blockers are recorded.

## Watchpoints

- Auth and checkout are P0/P1-adjacent even for visual work. Preserve behavior first and styling second.
- Read the relevant Next.js App Router docs before changing route files, layouts, redirects, metadata, server/client boundaries, or route handlers.
- Do not change provider setup. If a missing setup issue appears, record it and update setup docs only when the slice intentionally changes the shipped setup contract.
- Do not start generated-codebase, Telegram widget, or compiler/template work in this slice.
- Do not add docs to primary public navigation or re-open public homepage offer structure while sweeping edge routes.
