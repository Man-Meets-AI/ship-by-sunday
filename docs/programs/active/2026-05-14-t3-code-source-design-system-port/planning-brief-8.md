---
title: "T3 Code Protected App Route Closeout Planning Brief 8"
program_id: "t3-code-source-design-system-port"
brief_version: 8
status: "current"
summary: "Next slice for closing out remaining protected app route islands after the Worker findings/support/tutorial sweep."
read_when:
  - "Writing the next protected route-surface child ExecPlan after the Worker findings/support/tutorial sweep."
  - "Changing Doctor Pass, paid app home, access recovery, codebase flow overview, mission, or lesson protected app surfaces during the T3 Code migration."
---

# T3 Code Protected App Route Closeout Planning Brief 8

## Slice

Protected app route closeout: migrate the remaining protected app route islands that still use old serif/document styling after the Sidebar shell, Starter home, Workers setup/settings, and Worker findings/support/tutorial sweeps.

## Desired Outcome

The protected app should no longer have obvious old page-island styling in high-traffic app routes. Doctor Pass, paid home, access recovery, codebase flow overview, mission intro, and lesson watch surfaces should use compact T3 Code-style headers, quiet panels, dense operational rows, and shared primitives where appropriate.

Ship by Sunday product language, route URLs, protected access checks, entitlement handling, billing/support affordances, local navigation, command/theme/user controls, AppShell props, Convex behavior, and tutorial/lesson progression must remain intact.

## Scope

In scope:

- audit remaining `AppShell viewportMode="app"` protected surfaces with `font-heading-serif`, old negative tracking, or route-local rounded-xl panel recipes
- migrate Doctor Pass route content and local panels without changing runner pairing, sync preview, upload, or toast behavior
- migrate paid app home and access recovery surfaces without changing entitlement, billing, or recovery behavior
- migrate codebase flow overview, mission intro, and lesson watch shell content where old protected-app typography remains
- reuse `apps/web/src/components/app/protected-route-surface.tsx` before adding any route-local wrappers
- preserve existing route URLs, AppShell props, navigation models, data loading, mutations, and UI actions
- add focused tests for changed visible contracts and behavior-sensitive paths
- run desktop and mobile browser proof for at least one Doctor Pass or codebase flow route and one course/lesson/access route
- update the Program ledger and a completed child ExecPlan

Out of scope:

- public marketing, docs, blog, auth, checkout success, or Telegram widget migration
- generated-codebase compiler, templates, starter app output, or `docs/generated`
- Convex schema/functions, Clerk setup, Stripe setup, provider configuration, support-mode policy changes, billing behavior changes, or dependency changes
- Base UI migration
- broad route/module relocation beyond what the touched surfaces require

## Inputs

- `docs/programs/active/2026-05-14-t3-code-source-design-system-port/program.md`
- `docs/exec-plans/completed/2026-05-15-t3-code-protected-route-surfaces.md`
- `docs/exec-plans/completed/2026-05-15-t3-code-remaining-protected-surfaces.md`
- `apps/web/src/components/app/protected-route-surface.tsx`
- `apps/web/src/app/(app)/_components/existing-codebase-doctor-pass/workspace-doctor-pass-page.tsx`
- `apps/web/src/app/(app)/_components/paid-app-home/paid-app-home-page.tsx`
- `apps/web/src/app/(app)/_components/access-required`
- `apps/web/src/app/(app)/_components/codebase-flow`
- `apps/web/src/app/(app)/_components/course`
- `apps/web/tests/integration-ui`
- `apps/web/tests/unit`

## Acceptance

- The child ExecPlan records `program_id: "t3-code-source-design-system-port"` and this planning brief path.
- Touched protected routes keep current route URLs, access boundaries, data loading, AppShell props, entitlement behavior, mutation behavior, and user-visible actions.
- Touched protected surfaces render through the shared protected route-surface recipe where appropriate.
- Old serif/hero/page-island styling is removed from touched protected app surfaces without introducing marketing-style composition inside the app shell.
- Focused tests cover changed visible contracts and any behavior-sensitive route path touched.
- Desktop and mobile browser proof verifies at least one Doctor Pass or codebase flow route and one course/lesson/access route inside the Sidebar shell.
- `bun run format`, focused app tests, `bun run --cwd apps/web lint`, `DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck`, Program/plan lint, markdown lint, repo lint/typecheck, scope checks, and `git diff --check` pass or exact blockers are recorded.

## Watchpoints

- Do not loosen protected route access, entitlement checks, billing behavior, support-mode policy, local runner controls, or workflow/sync behavior while changing visuals.
- Doctor Pass and codebase generation surfaces are P1/P0-adjacent; preserve action labels, disabled states, mutation calls, and recovery paths.
- Course/lesson surfaces carry progression and access assumptions; preserve routing, completion cues, pinned artifacts, and video behavior.
- Keep route content dense and operational; avoid public landing-page composition inside protected app routes.
- Do not start generated-codebase, public surface, auth/checkout, or Telegram work in this slice.
