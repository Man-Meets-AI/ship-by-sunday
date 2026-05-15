---
title: T3 Code Protected App Route Closeout
status: complete
created_at: 2026-05-15
completed_at: 2026-05-15
summary: Finish the remaining protected app route-surface migration for Doctor Pass, paid app home, access recovery, codebase flow, mission, and lesson watch surfaces.
post_build_recap: Doctor Pass, paid home, access recovery, codebase overview, mission intro, and lesson watch surfaces now use T3 Code-style protected route headers, panels, and compact typography while preserving behavior-sensitive route actions.
program_id: t3-code-source-design-system-port
planning_brief: docs/programs/completed/2026-05-14-t3-code-source-design-system-port/planning-brief-8.md
read_when:
  - Resuming the protected app route closeout slice.
  - Reviewing Doctor Pass, paid app home, access recovery, codebase flow, mission, or lesson watch T3 Code migration work.
  - Checking final validation for planning brief 8.
---

# T3 Code Protected App Route Closeout

This document is a living execution plan for the protected app route closeout slice of the T3 Code source design-system port.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The protected Sidebar app shell and several protected product pages already use the T3 Code-style dense route surface recipe, but a few high-traffic app routes still show the old page-island system. Doctor Pass, paid app home, access recovery, the codebase authoring overview, the mission intro, and lesson watch shells still use serif headings, loose document-style spacing, or route-local panel recipes that stand apart from the newer app shell.

This slice finishes that protected app pass without changing product behavior. After it lands, those routes should read as compact operational app surfaces: shared protected route headers, quiet panels, dense summaries, and T3 Code-style lesson/watch composition. Route URLs, protected access checks, entitlement behavior, billing/recovery actions, local runner controls, codebase save/review behavior, mission progress, and lesson playback/progression stay intact.

## Progress

- [x] 2026-05-15: Read root and web agent instructions, release workflow, Program contract, ExecPlan contract, active T3 Program, planning brief 8, prior protected route-surface ExecPlans, app architecture/conventions, and relevant Next App Router docs.
- [x] 2026-05-15: Audited the remaining protected old-style route islands and focused tests.
- [x] 2026-05-15: Created this active ExecPlan for planning brief 8.
- [x] 2026-05-15: Validated this active ExecPlan with `plans:lint`.
- [x] 2026-05-15: Migrated Doctor Pass, paid app home, access recovery, codebase flow overview, mission intro, and lesson watch shell surfaces to the shared protected route recipe where appropriate.
- [x] 2026-05-15: Updated focused tests for visible route slots, preserved behavior, and removal of old serif route shells.
- [x] 2026-05-15: Ran focused tests, app lint/typecheck, and desktop/mobile browser proof for Doctor Pass plus access recovery.
- [x] 2026-05-15: Completed this ExecPlan, updated the Program ledger and next-slice note, and ran final validation.

## Surprises & Discoveries

The brief-8 audit found that previous slices already migrated the tutorial index, Worker findings/runs/loops/privacy, Starter home, Workers setup, and settings. The remaining protected islands are narrower than the full app: Doctor Pass, paid home, access recovery, codebase authoring overview, mission intro, and the lesson watch shell. Admin impersonation and generated-codebase work remain outside this slice.

The available browser session was not authenticated into protected routes. Direct `/workers/doctor-pass` navigation redirected to sign-in, so browser proof used temporary public local routes that rendered the production Doctor Pass and access recovery components with fixture data. Those routes were deleted before final validation.

The normal `bun run --cwd apps/web dev` path started `dev:full`, but Turbopack crashed during browser proof with an existing `app_dir must be a directory` panic after unauthenticated redirects. A narrower `bun --cwd apps/web next dev --webpack -p 3021` server rendered the proof routes successfully. App typecheck/build still passed through the production-style `DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck` command.

## Decision Log

Decision: Treat this as a protected app UI-only migration.
Rationale: Planning brief 8 names behavior-sensitive routes, but its desired outcome is visual and structural. Auth, billing, entitlement, Convex, local runner, and lesson progression behavior must be preserved rather than redesigned.
Date: 2026-05-15

Decision: Reuse `apps/web/src/components/app/protected-route-surface.tsx` where a route page or panel boundary exists.
Rationale: The prior protected slices established this module as the T3 Code route-body recipe. Reusing it avoids route-local wrapper drift and gives tests stable `data-slot` evidence.
Date: 2026-05-15

Decision: Keep the current Client Component boundaries.
Rationale: The touched pages use Convex hooks, router hooks, user actions, motion, or browser APIs. Next's App Router docs say Client Components are appropriate for state, event handlers, custom hooks, and browser-only behavior. This slice should change composition and classes, not move server/client boundaries.
Date: 2026-05-15

## Outcomes & Retrospective

This slice migrated the remaining protected route islands named in planning brief 8. `WorkspaceDoctorPassPage` now uses `ProtectedRoutePage`, `ProtectedRouteHeader`, and `ProtectedRoutePanel` for its route header, approval, status, flow, and preview panels while preserving local navigation, approval mutation calls, toast behavior, uploaded links, copy controls, preview digest display, and upload command copy. `PaidAppHomePage` now renders its hub and product paths through protected route headers and panels while preserving secondary links and Starter/Workers CTAs.

Access recovery now uses the shared protected route page/header/panel recipe, removes the old full-page gradient and serif status title, and keeps retry, sign-in, checkout, recovery, and account-detail behavior intact. The codebase authoring route now exposes a protected route page/header around the overview while preserving the section form, progress sidebar, draft assistant, save bar, leave dialog, and review navigation behavior. Mission intro and lesson watch shell now use compact protected route headers and T3 Code typography while preserving mission progress, lesson title/intro, video surface, secondary lesson content, and footer controls.

Focused tests cover the behavior-sensitive paths and the visible route-surface contract. Browser proof used temporary local routes at `/t3-protected-closeout-proof` and `/access-closeout-view` on a webpack dev server at `http://localhost:3021`; both routes were removed before final validation. Desktop and mobile checks confirmed protected route page/header/panel slots, Doctor Pass Sidebar shell, Doctor Pass digest and approval copy, access recovery retry/status copy, and no `font-heading-serif` in the proof markup. Screenshots were saved under ignored `codex-scripts/artifacts/t3-protected-closeout/`.

## Context and Orientation

The active Program is `docs/programs/completed/2026-05-14-t3-code-source-design-system-port/program.md`, and this plan is driven by `docs/programs/completed/2026-05-14-t3-code-source-design-system-port/planning-brief-8.md`.

The shared protected route-surface helpers live in `apps/web/src/components/app/protected-route-surface.tsx`. They provide `ProtectedRoutePage`, `ProtectedRouteHeader`, `ProtectedRouteEyebrow`, `ProtectedRouteTitle`, `ProtectedRouteDescription`, `ProtectedRouteIcon`, `ProtectedRoutePanel`, `ProtectedRoutePanelHeader`, `ProtectedRoutePanelTitle`, `ProtectedRoutePanelDescription`, `ProtectedRoutePanelBody`, `ProtectedRouteSummaryGrid`, and `protectedRoutePanelClassName`.

The route surfaces for this pass are:

    apps/web/src/app/(app)/_components/existing-codebase-doctor-pass/workspace-doctor-pass-page.tsx
    apps/web/src/app/(app)/_components/paid-app-home/paid-app-home-page.tsx
    apps/web/src/app/(app)/_components/access-required/access-required-page.tsx
    apps/web/src/app/(app)/_components/access-required/access-required-shell.tsx
    apps/web/src/app/(app)/_components/access-required/access-required-status-panel.tsx
    apps/web/src/app/(app)/_components/access-required/access-required-path-panel.tsx
    apps/web/src/app/(app)/_components/access-required/access-required-help-panel.tsx
    apps/web/src/app/(app)/_components/codebase-flow/codebase-page-body.tsx
    apps/web/src/app/(app)/_components/codebase-flow/codebase-page-overview.tsx
    apps/web/src/app/(app)/_components/course/mission/components/mission-page.tsx
    apps/web/src/app/(app)/_components/course/mission/components/mission-page-intro.tsx
    apps/web/src/app/(app)/_components/course/lesson/shells/lesson-shell-watch.tsx

The focused tests expected to cover this pass are:

    apps/web/tests/integration-ui/workspace-doctor-pass-page.test.tsx
    apps/web/tests/unit/app-workspace-codebase-review-routes.test.tsx
    apps/web/tests/unit/paid-app-home-page.test.tsx
    apps/web/tests/integration-ui/access-required-page.test.tsx
    apps/web/tests/integration-ui/access-required-page.interactions.test.tsx
    apps/web/tests/integration-ui/codebase-page.test.tsx
    apps/web/tests/unit/mission-page.test.tsx
    apps/web/tests/unit/lesson-shells.test.tsx

### In Scope

This plan may update the protected app UI components listed above, the focused tests listed above, this ExecPlan, and the active T3 Program ledger. It may create a temporary local browser-proof route or ignored browser script if the available browser session cannot authenticate into protected routes, but any temporary app route must be deleted before final validation.

### Out Of Scope

This plan does not change route URLs, protected access checks, Clerk behavior, Stripe checkout or billing recovery semantics, Convex schema/functions, local runner mutations, Doctor Pass upload/approval behavior, codebase save/review mutations, mission state modeling, lesson progress tracking, generated-codebase compiler output, public marketing/docs/blog routes, auth/checkout success routes, Telegram widget CSS, admin policy, provider setup, or dependencies.

## Plan of Work

First, validate this active plan with `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-15-t3-code-protected-app-route-closeout.md`.

Second, migrate Doctor Pass. Replace the route-local wrapper/header and rounded panel recipes with `ProtectedRoutePage`, `ProtectedRouteHeader`, `ProtectedRouteTitle`, `ProtectedRouteDescription`, `ProtectedRoutePanel`, and panel body/header helpers while preserving the summary card, local nav, approval button, uploaded links, preview digest, copy buttons, upload command, and toast behavior.

Third, migrate paid app home and access recovery. Paid home should use the shared route page/header/panel recipe and keep all secondary links and path CTAs. Access recovery should keep its redirect, retry, sign-out, checkout, and recovery behavior while moving the old full-page gradient/document shell to compact T3 Code panels.

Fourth, migrate the codebase flow overview and route frame. Keep the current authoring form, progress sidebar, draft assistant, save bar, leave dialog, and review navigation behavior. Replace the old serif overview with a protected route header/summary feel and keep the form content dense.

Fifth, migrate mission intro and lesson watch shell. Preserve `AppShell viewportMode="app"`, mission prop wiring, current lesson navigation, mission progress labels, footer controls, video surface, copy prompts, transcript, helpful links, and pinned artifacts while replacing serif route headings and overly loose watch-shell typography.

Sixth, update focused tests. Tests should assert preserved behavior and new route-surface evidence such as `data-slot="protected-route-page"`, `data-slot="protected-route-header"`, or `data-slot="protected-route-panel"` where the component renders through the shared recipe. Tests should also assert that touched route markup no longer contains `font-heading-serif`.

Seventh, run focused validation, then browser proof on desktop and mobile for at least one Doctor Pass or codebase surface plus one access or lesson surface. If direct protected routes redirect to sign-in in the available browser context, use a temporary local proof route that renders the same migrated components inside `AppShell viewportMode="app"`, record the limitation, and delete the route before final validation.

Eighth, complete this ExecPlan, move it to `docs/exec-plans/completed/2026-05-15-t3-code-protected-app-route-closeout.md`, update the Program ledger and next slice, and run final validation.

## Milestones

Milestone 1 creates and validates the plan. Success means this file exists under `docs/exec-plans/active`, records planning brief 8, names the bounded protected surfaces, and passes `plans:lint`.

Milestone 2 migrates the remaining protected route bodies. Success means Doctor Pass, paid app home, access recovery, codebase overview, mission intro, and lesson watch shell render with compact T3 Code styling while preserving current labels, links, mutations, AppShell props, and route behavior.

Milestone 3 updates focused tests. Success means the relevant route tests prove the new surface slots and no old serif shell while still covering approval, retry, checkout/recovery, codebase save/review, mission progress, and lesson watch contracts.

Milestone 4 validates and records completion. Success means focused tests, browser proof, app lint/typecheck, Program/plan/markdown lint, repo lint/typecheck, and `git diff --check` pass or exact blockers are recorded.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Validate this active plan:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-15-t3-code-protected-app-route-closeout.md

Edit the route components and focused tests listed in the Context section. Keep edits visual and structural only.

Run focused validation:

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-doctor-pass-page.test.tsx tests/integration-ui/access-required-page.test.tsx tests/integration-ui/access-required-page.interactions.test.tsx tests/integration-ui/codebase-page.test.tsx
    bun run --cwd apps/web test:unit -- tests/unit/app-workspace-codebase-review-routes.test.tsx tests/unit/paid-app-home-page.test.tsx tests/unit/mission-page.test.tsx tests/unit/lesson-shells.test.tsx

Run static and docs validation:

    bun run format
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-15-t3-code-protected-app-route-closeout.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-15-t3-code-protected-app-route-closeout.md docs/programs/completed/2026-05-14-t3-code-source-design-system-port
    bun lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck
    git diff --check

Use the active plan path in the lint commands until this plan is moved to `completed/`.

## Validation and Acceptance

Acceptance requires the touched protected app routes to keep current behavior while adopting the dense T3 Code protected route-surface recipe. Doctor Pass approval and uploaded links, access recovery retry/sign-in/checkout behavior, codebase save/review behavior, mission progress, and lesson watch content must still pass their focused tests. The route markup for touched old islands must no longer include `font-heading-serif`.

Browser proof must cover one Doctor Pass or codebase route and one access or lesson route at desktop and mobile viewport sizes. If the available browser cannot authenticate into protected routes, a temporary proof route is acceptable only if it renders the same production components and is deleted before final validation.

Feature risk for this slice is P1-adjacent because it touches protected access, paid app, Doctor Pass, codebase authoring, and lesson progression surfaces. Source of truth remains existing Convex state, route access helpers, and UI state exposed by the current components. This slice must work for current happy paths and fail safely by preserving existing disabled states, redirects, retry paths, and mutation error handling. The CI gate is baseline app static checks plus focused protected-route UI tests.

### Test Commands

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-15-t3-code-protected-app-route-closeout.md
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-doctor-pass-page.test.tsx tests/integration-ui/access-required-page.test.tsx tests/integration-ui/access-required-page.interactions.test.tsx tests/integration-ui/codebase-page.test.tsx
    bun run --cwd apps/web test:unit -- tests/unit/app-workspace-codebase-review-routes.test.tsx tests/unit/paid-app-home-page.test.tsx tests/unit/mission-page.test.tsx tests/unit/lesson-shells.test.tsx
    bun run format
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-15-t3-code-protected-app-route-closeout.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-15-t3-code-protected-app-route-closeout.md docs/programs/completed/2026-05-14-t3-code-source-design-system-port
    bun lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck
    git diff --check

Passed before completing this plan:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-15-t3-code-protected-app-route-closeout.md
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-doctor-pass-page.test.tsx tests/integration-ui/access-required-page.test.tsx tests/integration-ui/access-required-page.interactions.test.tsx tests/integration-ui/codebase-page.test.tsx
    bun run --cwd apps/web test:unit -- tests/unit/app-workspace-codebase-review-routes.test.tsx tests/unit/paid-app-home-page.test.tsx tests/unit/mission-page.test.tsx tests/unit/lesson-shells.test.tsx
    bun run format
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-15-t3-code-protected-app-route-closeout.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-15-t3-code-protected-app-route-closeout.md docs/programs/completed/2026-05-14-t3-code-source-design-system-port
    bun lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck
    git diff --check

Browser proof passed on `bun --cwd apps/web next dev --webpack -p 3021` with temporary routes that were deleted before final validation. The direct protected Doctor Pass route redirected to sign-in in the unauthenticated browser session, and `/access-required` is a redirect route by design, so fixture proof routes were used for visual verification only.

## Idempotence and Recovery

The code changes are local React composition and class changes. If a focused test fails because a visible label, href, disabled state, mutation call, or redirect changed, restore the original behavior unless this plan is explicitly updated with a deliberate decision. If route protection changes, revert that part immediately and keep only visual changes. If browser proof cannot reach authenticated routes, record the auth limitation, use a temporary local proof route, and delete it before final validation.

## Artifacts and Notes

Important source references:

    apps/web/src/components/app/protected-route-surface.tsx
    /Users/bazelrex/Developer/oss/t3code/apps/web/src/components/AppSidebarLayout.tsx
    /Users/bazelrex/Developer/oss/t3code/apps/web/src/routes/_chat.index.tsx
    /Users/bazelrex/Developer/oss/t3code/apps/web/src/components/ChatView.tsx
    /Users/bazelrex/Developer/oss/t3code/apps/web/src/components/settings/settingsLayout.tsx

No external provider setup, dependency change, generated customer repository change, or Convex schema/function change should be needed.

## Interfaces and Dependencies

This slice depends on Next.js App Router protected route groups, current Client Component boundaries, the shared `AppShell viewportMode="app"` Sidebar implementation, the shared protected route-surface helpers, existing shadcn/T3-compatible primitives, Convex hooks already used by the current components, existing access helpers, existing codebase-flow hooks, current mission and lesson models, and current route configuration. It must not change those data contracts or add a runtime dependency.
