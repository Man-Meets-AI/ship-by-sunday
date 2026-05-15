---
title: T3 Code Protected Route Surfaces
status: complete
created_at: 2026-05-15
completed_at: 2026-05-15
summary: Migrate representative protected Starter, Workers setup, and settings route content to dense T3 Code-style operational surfaces inside the Sidebar-backed app shell.
post_build_recap: Added shared protected route-surface helpers and migrated Starter home, Workers existing-codebase setup, and settings onto compact T3 Code-style headers, panels, and summary rows while preserving protected route behavior and AppShell props. Focused route/settings/setup tests, browser proof through a temporary local AppShell route, app lint/typecheck, and docs validation passed.
program_id: t3-code-source-design-system-port
planning_brief: docs/programs/active/2026-05-14-t3-code-source-design-system-port/planning-brief-6.md
read_when:
  - Resuming the protected route-surface migration.
  - Reviewing why shared protected route surface helpers were introduced.
  - Checking how Starter, Workers setup, and settings routes were visually migrated after the Sidebar app shell.
---

# T3 Code Protected Route Surfaces

This document is a living execution plan for the protected route-surface slice of the T3 Code source design-system port.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The protected app shell now renders through a T3 Code-style Sidebar, but many protected route bodies still read like the older Ship by Sunday page system: wide document islands, serif display headings, decorative card stacks, and bespoke route-local chrome. This slice moves representative protected product content toward the T3 Code operational surface pattern: compact headers, quiet panels, dense rows, direct controls, and shared surface primitives.

The first pass stays deliberately bounded. It migrates the Starter home, Workers existing-codebase setup, and settings surfaces because together they cover a protected Starter route, a Workers/setup route with route-local navigation and runtime state, and a settings route with account/provider controls. It preserves route URLs, AppShell props, access checks, data loading, command/theme/user controls, billing/support affordances, and current product behavior. It does not start public marketing, auth/checkout, generated-codebase, Telegram, Convex, Clerk, Stripe, or provider work.

## Progress

- [x] 2026-05-15: Read root and app agent instructions, release workflow, app architecture/conventions, Next App Router docs, the active Program, and planning brief 6.
- [x] 2026-05-15: Read the completed Sidebar app-shell ExecPlan and T3 Code settings/app route references.
- [x] 2026-05-15: Created this active ExecPlan for the protected route-surface pass.
- [x] 2026-05-15: Validated this active plan with `plans:lint`.
- [x] 2026-05-15: Added shared protected route-surface helpers under `apps/web/src/components/app`.
- [x] 2026-05-15: Migrated Starter home, Workers existing-codebase setup, and settings content onto compact T3-style route headers, panels, and summaries.
- [x] 2026-05-15: Added focused regression assertions for route-surface slots and preserved Starter/setup/settings behavior.
- [x] 2026-05-15: Ran desktop and mobile browser proof through a temporary local AppShell proof route, then deleted the route.
- [x] 2026-05-15: Ran focused tests, app lint/typecheck, final format, Program/plan/docs lint, repo lint/typecheck, and `git diff --check`.
- [x] 2026-05-15: Moved this ExecPlan to completed, added planning brief 7, and updated the Program ledger with the next slice.

## Surprises & Discoveries

The Program packet still has several future protected surfaces in scope, including support/admin and course/tutorial routes. This slice intentionally proves the route-body recipe on representative high-traffic pages first. Later slices can apply the same helpers to the remaining protected routes without mixing every protected workflow into one diff.

The available browser context was not signed in to the protected app; direct navigation to `/starter/home` redirected to `/sign-in?redirect_url=...`. Browser proof therefore used a temporary public local route at `/codex-protected-route-surfaces-proof` that rendered the live `AppShell viewportMode="app"` and the migrated protected route-surface recipe for Starter and Workers content. The production protected routes stayed covered by focused route tests, and the temporary proof route was deleted before final validation.

## Decision Log

Decision: Introduce shared protected route-surface helpers before rewriting individual route pages.
Rationale: The old protected route bodies repeat page wrappers, hero-like headings, summary islands, and panel styling. A small shared helper set lets the migration match T3 Code's dense page-header and panel rhythm while keeping route-specific behavior local.
Date: 2026-05-15

Decision: Keep this pass on Starter home, Workers existing-codebase setup, and settings.
Rationale: Planning brief 6 requires at least one Starter route and one Workers route browser-proven inside the Sidebar shell. Settings adds a representative account/provider surface. Support/admin/course can follow once the shared route surface recipe is proven.
Date: 2026-05-15

Decision: Do not change protected access or provider behavior.
Rationale: This is a visual/source-shape slice. Auth, entitlement, Convex, Clerk, Stripe, and generated-codebase behavior are higher-risk surfaces and are outside this pass.
Date: 2026-05-15

## Outcomes & Retrospective

This slice added `apps/web/src/components/app/protected-route-surface.tsx` as the shared route-body recipe for protected app pages. It exposes stable `data-slot` names for the route page, header, eyebrow, title, description, panels, panel headers/bodies, and summary grids, using T3 Code-style compact spacing and rounded card surfaces without adding Base UI or changing Radix primitive APIs.

`apps/web/src/app/(app)/starter/home/page.tsx` now renders a compact protected route header, Starter summary, and two route panels while preserving the access check, redirect behavior, `AppShell viewportMode="app"`, generated-codebase link, lessons link, and direct starter template download link. `apps/web/src/app/(app)/_components/existing-codebase-setup/existing-codebase-setup-page.tsx` now uses the same header/summary recipe, and the route-local setup panels use the shared protected panel class while preserving local navigation, Convex mutations/queries, pairing, install, readiness, doctor-pass, destination, and privacy behavior. `apps/web/src/app/(app)/settings/_components/settings-page.tsx` now uses the shared page/header rhythm while preserving the settings shell, Codex card, account card, and TOC anchors.

Focused tests prove the changed behavior surface: Starter home still renders the direct template download and lessons href while exposing protected route slots and not reintroducing `font-heading-serif`; Workers setup still renders pairing/install/readiness/privacy behavior and now exposes protected route page/summary slots; settings still renders the Codex/account cards in order with its TOC anchors and no old serif heading class.

Browser proof ran on a local webpack dev server at `http://localhost:3018`. Desktop proof verified `data-slot="sidebar-wrapper"`, `data-slot="sidebar"`, `data-slot="sidebar-inset"`, `data-slot="protected-route-page"`, one protected route summary, two protected route panels, Starter content, Workers setup content, and no old serif/negative-tracking class. Mobile proof emulated `390x844`, verified the protected route body, opened the `Open app sidebar` trigger, and confirmed the Sheet-backed mobile sidebar retained workspace and proof local navigation. Screenshots were saved under ignored `codex-scripts/artifacts/protected-route-surfaces-desktop.png` and `codex-scripts/artifacts/protected-route-surfaces-mobile.png`.

No generated customer repository work, public surface work, auth/checkout work, provider setup, dependency change, or unrelated primitive migration was introduced. Remaining protected support/admin/course and Worker findings/runs surfaces are intentionally deferred to the next Program slice.

## Context and Orientation

The active Program is `docs/programs/active/2026-05-14-t3-code-source-design-system-port/program.md`, and the current brief is `docs/programs/active/2026-05-14-t3-code-source-design-system-port/planning-brief-6.md`. The prior shell slice is `docs/exec-plans/completed/2026-05-14-t3-code-sidebar-app-shell.md`.

The T3 Code references for this slice are `/Users/bazelrex/Developer/oss/t3code/apps/web/src/routes/_chat.index.tsx`, `/Users/bazelrex/Developer/oss/t3code/apps/web/src/routes/settings.tsx`, and `/Users/bazelrex/Developer/oss/t3code/apps/web/src/components/settings/settingsLayout.tsx`. These references use a Sidebar inset, compact page headers, restrained card/panel surfaces, and dense setting rows.

The Ship by Sunday route surfaces for this pass are:

    apps/web/src/app/(app)/starter/home/page.tsx
    apps/web/src/app/(app)/_components/existing-codebase-setup/existing-codebase-setup-page.tsx
    apps/web/src/app/(app)/settings/_components/settings-page.tsx

Focused tests are expected in the current app test suites for these pages:

    apps/web/tests/unit/app-workspace-codebase-review-routes.test.tsx
    apps/web/tests/integration-ui/workspace-setup-page.test.tsx
    apps/web/tests/unit/settings-page.test.tsx

### In Scope

This plan may add a shared protected route-surface component module under `apps/web/src/components/app`, update the three route surfaces above, update focused tests for their visible contracts, update this ExecPlan, and update the Program ledger. It may create an ignored browser proof script or temporary proof route under `codex-scripts/` or app source, but any temporary route must be removed before final validation.

### Out Of Scope

This plan does not change generated-codebase compiler output, starter templates, public marketing/docs/blog routes, auth routes, checkout routes, Telegram widget CSS, Convex schema/functions, Clerk setup, Stripe setup, provider API calls, route URLs, protected route access checks, AppShell prop contracts, or the Sidebar primitive itself. It does not broadly migrate every support/admin/course surface in this diff.

## Plan of Work

First, validate this active ExecPlan with `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-15-t3-code-protected-route-surfaces.md`.

Second, introduce shared protected route-surface helpers. The helpers should expose stable `data-slot` names, use T3 Code-style compact page spacing, restrained panel styling, dense summary rows, and support actions without adding a new dependency or changing Radix primitive APIs.

Third, migrate the Starter home route content. Keep the direct starter template download link, lessons link, route URL, and AppShell props intact. Remove the old serif hero/card-island styling and replace it with compact operational header and path panels.

Fourth, migrate the Workers existing-codebase setup route content. Keep route-local navigation, workspace summary data, install readiness, pairing, privacy, destination, and doctor behavior intact. Replace the old heading and summary islands with the shared route header and dense summary surfaces.

Fifth, migrate the settings content. Keep the settings shell, table of contents anchors, Codex connection card, account card, and access behavior intact. Replace the old document heading/wrapper with the shared route page/header rhythm and denser section layout.

Sixth, update focused tests for behavior that matters: preserved Starter template download, route-surface slots/classes, Workers setup route content and summary, settings anchors and card order, and no route URL/access contract changes.

Seventh, run desktop and mobile browser proof against at least one Starter route and one Workers setup route inside the Sidebar shell. If local auth blocks direct protected routes, use a temporary local proof route that renders the same migrated protected surfaces inside `AppShell viewportMode="app"`, record the limitation, and delete the route before final validation.

Eighth, complete this ExecPlan, move it to `docs/exec-plans/completed/2026-05-15-t3-code-protected-route-surfaces.md`, update the Program ledger and next-slice note, and run final validation.

## Milestones

Milestone 1 creates and validates the plan. Success means this file exists under `docs/exec-plans/active`, points at planning brief 6, names the bounded route surfaces, and passes `plans:lint`.

Milestone 2 adds the shared protected route surface helpers. Success means the helpers compile, expose `data-slot` names, use T3 Code-style dense recipes, and do not add Base UI or generated-codebase changes.

Milestone 3 migrates the three route surfaces. Success means Starter home, Workers existing-codebase setup, and settings render with compact route headers and quiet panels while preserving current links, labels, data, AppShell props, and tests.

Milestone 4 validates and records completion. Success means focused tests, browser proof, app lint/typecheck, Program/plan/markdown lint, repo lint/typecheck, scope checks, and `git diff --check` pass or exact blockers are recorded.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Validate this active plan:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-15-t3-code-protected-route-surfaces.md

Edit:

    apps/web/src/components/app/protected-route-surface.tsx
    apps/web/src/app/(app)/starter/home/page.tsx
    apps/web/src/app/(app)/_components/existing-codebase-setup/existing-codebase-setup-page.tsx
    apps/web/src/app/(app)/settings/_components/settings-page.tsx
    apps/web/tests/unit/app-workspace-codebase-review-routes.test.tsx
    apps/web/tests/integration-ui/workspace-setup-page.test.tsx
    apps/web/tests/unit/settings-page.test.tsx
    docs/exec-plans/active/2026-05-15-t3-code-protected-route-surfaces.md
    docs/programs/active/2026-05-14-t3-code-source-design-system-port/program.md

Run focused validation:

    bun run --cwd apps/web test:unit -- tests/unit/app-workspace-codebase-review-routes.test.tsx tests/unit/settings-page.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-setup-page.test.tsx

Run static and docs validation:

    bun run format
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-15-t3-code-protected-route-surfaces.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-15-t3-code-protected-route-surfaces.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    bun lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck
    git diff --check

If this plan is still active while running intermediate checks, use the active path for `plans:lint` and `markdown:lint`. Once it is moved to completed, use the completed path shown above.

## Validation and Acceptance

Acceptance requires the touched protected routes to keep current route behavior and AppShell integration while adopting the dense T3 Code operational surface recipe. The shared helper module must not add Base UI, must not introduce generated customer repo work, and must not widen into unrelated primitives. Browser proof must cover desktop and mobile for a Starter route and a Workers route inside the Sidebar shell or record an exact auth/proof limitation.

### Test Commands

Validation completed on 2026-05-15 from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-15-t3-code-protected-route-surfaces.md
    bun run --cwd apps/web test:unit -- tests/unit/app-workspace-codebase-review-routes.test.tsx tests/unit/settings-page.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-setup-page.test.tsx
    bun run format
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-15-t3-code-protected-route-surfaces.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-15-t3-code-protected-route-surfaces.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    bun lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck
    git diff --check

## Idempotence and Recovery

The changes are local React and CSS changes. If a route test fails because a visible label changed, restore the user-facing label unless the new label is intentionally recorded in this plan. If a protected route redirects or access behavior changes, revert the route behavior change and keep only visual composition changes. If local browser proof cannot reach authenticated routes, use a temporary local proof route, record why, delete it before final validation, and keep the production route diff unchanged.

## Artifacts and Notes

Important source references:

    /Users/bazelrex/Developer/oss/t3code/apps/web/src/routes/_chat.index.tsx
    /Users/bazelrex/Developer/oss/t3code/apps/web/src/routes/settings.tsx
    /Users/bazelrex/Developer/oss/t3code/apps/web/src/components/settings/settingsLayout.tsx
    apps/web/src/app/(app)/starter/home/page.tsx
    apps/web/src/app/(app)/_components/existing-codebase-setup/existing-codebase-setup-page.tsx
    apps/web/src/app/(app)/settings/_components/settings-page.tsx
    apps/web/src/app/(app)/_components/app-shell.tsx

No external provider setup or generated customer repository change should be needed.

## Interfaces and Dependencies

This slice depends on Next.js App Router protected route groups, the current `AppShell viewportMode="app"` Sidebar implementation, React Server and Client Components, the shared Button/Card/Badge/Kbd primitives, Clerk and Convex hooks already used by the existing route surfaces, and the current route-level access helpers. It must not change those access helpers or add a new UI runtime dependency.
