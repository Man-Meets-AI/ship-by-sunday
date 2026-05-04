---
title: Finish Route Ownership Visibility
status: complete
created_at: 2026-04-26
completed_at: 2026-04-26
summary: Move remaining checkout success, review, and API route path contract surfaces into App Router private folders without changing billing, Convex, or request behavior.
post_build_recap: Checkout success wrappers, review route wrappers, and API route path constants now live under App Router private folders with old feature and product-config paths kept as compatibility exports and focused plus app validation passed.
program_id: app-structure-refactor
planning_brief: docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-5.md
read_when:
  - Reviewing the completed checkout, review, and API route ownership slice.
  - Checking why checkout behavior, review download constants, and Stripe webhook behavior stayed out of this slice.
  - Validating that billing, Convex preload, and API request behavior stayed unchanged.
---

# Finish Route Ownership Visibility

This is a living execution plan. It describes the fifth implementation slice for the app structure refactor Program.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The App Router should show the route-specific UI and route path contracts that make the product work. After earlier slices, workspace access and identity wrappers are visible under `apps/web/app`, but checkout success, review handoff UI, and API route path constants still sit in broad feature or product configuration files. After this slice, checkout success wrappers will live under `apps/web/app/checkout/success`, review wrappers will live under `apps/web/app/(workspace)/review`, and Next API route path constants will live under `apps/web/app/api`.

This slice is behavior-neutral. It should not change checkout session creation, Stripe checkout parameters, Stripe webhook handling, checkout recovery, review auto-download URLs, Convex preload queries, API request parsing, billing proof, pricing, promo codes, or environment behavior.

## Progress

- [x] 2026-04-26 EDT: Confirmed the first four child ExecPlans are complete and the Program names checkout, review, and API contracts as the next route-ownership slice.
- [x] 2026-04-26 EDT: Inspected checkout success, review route, API route path, focused tests, release workflow guidance, and local Next route-handler/client-boundary documentation before editing.
- [x] 2026-04-26 EDT: Wrote planning brief 5 and opened this active child ExecPlan.
- [x] 2026-04-26 EDT: Moved checkout success wrapper UI and view-model files into private `apps/web/app/checkout/success` folders.
- [x] 2026-04-26 EDT: Moved review route wrapper UI and the review auto-download hook into private `apps/web/app/(workspace)/review` folders.
- [x] 2026-04-26 EDT: Moved API route path constants into `apps/web/app/api/_lib/api-route-config.ts` and kept `apps/web/config/product.ts` as a compatibility export.
- [x] 2026-04-26 EDT: Updated first-party imports and focused tests to the new App Router paths.
- [x] 2026-04-26 EDT: Left temporary compatibility re-exports at the old checkout, review, hook, and product-config paths.
- [x] 2026-04-26 EDT: Focused checkout and review integration-ui tests passed.
- [x] 2026-04-26 EDT: Focused review handoff and route metadata unit tests passed.
- [x] 2026-04-26 EDT: Focused API route integration tests passed after adding the missing `server-only` mock to the Stripe checkout route test.
- [x] 2026-04-26 EDT: Focused API client tests passed.
- [x] 2026-04-26 EDT: App format check and lint passed.
- [x] 2026-04-26 EDT: App typecheck passed after the checkout, review, and API route contract moves.
- [x] 2026-04-26 EDT: Completed-path plan lint, Program lint, markdown lint, and `git diff --check` passed after archival.

## Surprises & Discoveries

2026-04-26 EDT: `apps/web/features/codebase-flow/lib/review-download-handoff.ts` is not route-private. It is consumed by the review route, codebase page state, Execute / Ship track constants, and focused tests, so it stays in the codebase-flow feature for this slice.

2026-04-26 EDT: `apiRouteConfig.stripeWebhook` points at the Convex HTTP webhook path `/stripe/webhook`, not a Next route under `apps/web/app/api`. The new API route config must keep that distinction explicit so this route-ownership work does not imply a Next Stripe webhook.

2026-04-26 EDT: The local Next docs are installed under `node_modules/next/dist/docs`, not under `apps/web/node_modules/next/dist/docs` as the app instruction file names. The relevant docs say route handlers use Web `Request` and `Response` APIs, and client components need a top-level `"use client"` boundary.

2026-04-26 EDT: After the move, the old checkout-success and review wrapper import scan over `apps/web/app` and `apps/web/tests` produced no matches. The old feature files now contain compatibility re-exports to `@/app/checkout/success/...` and `@/app/(workspace)/review/...` paths.

2026-04-26 EDT: `apps/web/config/product.ts` now only re-exports `apiRouteConfig`; first-party app route handlers and API clients import the route path contract from `@/app/api/_lib/api-route-config`.

2026-04-26 EDT: The focused checkout/review integration-ui run emitted two `Not implemented: navigation to another Document` jsdom warnings while still passing. This is a test-environment limitation around browser navigation, not a failed assertion.

2026-04-26 EDT: The first API route test batch failed only in `tests/integration/stripe-checkout-route.test.ts` because the route imports server-only modules and that test did not mock the `server-only` package. This slice added the same `vi.mock("server-only", () => ({}))` test guard already used by other route-handler tests.

## Decision Log

Decision: Finish this route-ownership pass with checkout success wrappers, review wrappers, and API route path constants.
Rationale: These are the remaining route-owned surfaces named by the Program packet that can move without changing checkout, billing, Convex, or API request behavior.
Date: 2026-04-26

Decision: Keep checkout session creation, checkout recovery, and Stripe helpers out of this slice.
Rationale: Those files are part of the release-sensitive billing cluster and belong in the later billing and Stripe boundary slice.
Date: 2026-04-26

Decision: Keep `review-download-handoff.ts` in the codebase-flow feature.
Rationale: It is a durable review contract consumed by multiple feature surfaces, while the hook and visual handoff wrappers are route-local to the review route.
Date: 2026-04-26

Decision: Keep compatibility exports at old feature and product-config paths.
Rationale: This Program is still mid-migration. Re-exports make hidden imports less disruptive while first-party code is moved to the App Router paths.
Date: 2026-04-26

## Outcomes & Retrospective

This plan is complete. Checkout success wrapper UI and view-model code now live under `apps/web/app/checkout/success`, review route wrapper UI and the review auto-download hook now live under `apps/web/app/(workspace)/review`, and API route path constants now live under `apps/web/app/api/_lib/api-route-config.ts`. The old checkout feature paths, review feature paths, review hook path, and `apps/web/config/product.ts` API route export remain as temporary compatibility surfaces.

Focused checkout, review, API route, API client, format, app lint, and app typecheck validation passed. The implementation did not move route pages, checkout session creation, checkout recovery helpers, Stripe checkout parameters, Stripe webhook behavior, pricing, promo code behavior, billing proof, Convex schema or generated files, review download URLs, review preload query selection, API request parsing, API response bodies, course registry or manifest files, shared UI inventory, or the unrelated stashed scrollbar styling.

## Context and Orientation

Ship by Sunday's web app lives in `apps/web`. The App Router lives under `apps/web/app`. Durable feature code lives under `apps/web/features`. The Program's boundary rule is that route entrypoints, route-level wrappers, route-control behavior, and route-only UI should live near the route that uses them.

The checkout success route is `apps/web/app/checkout/success/page.tsx`. It preloads checkout session state and product access, then renders `CheckoutSuccessView` from `apps/web/features/checkout/components/checkout-success-view.tsx`. The view and its checkout-success helper components are route-local UI for this page. Checkout session creation, checkout session interpretation, Stripe helpers, and checkout recovery helpers remain in their existing server/platform homes.

The review route is `apps/web/app/(workspace)/review/page.tsx`. It preloads the codebase workspace state, optional post-review targets, and optional bonus mission state, then renders `CodebaseReviewPage` from `apps/web/features/codebase-flow/components/codebase-review-page.tsx`. The review page, download bridge, handoff card, and auto-download hook are route-local review UI/control. The pure review download constants in `apps/web/features/codebase-flow/lib/review-download-handoff.ts` remain in the codebase-flow feature because other feature code consumes them.

The API route tree is `apps/web/app/api`. Next API path constants currently live in `apps/web/config/product.ts` as `apiRouteConfig`, beside homepage, pricing, product, asset, and metadata configuration. This slice moves that route path contract to `apps/web/app/api/_lib/api-route-config.ts` and keeps a compatibility export from `apps/web/config/product.ts`.

### In Scope

Move `apps/web/features/checkout/components/checkout-success-view.tsx`, `checkout-success-view-surface.tsx`, `checkout-success-main-panel.tsx`, `checkout-success-help-panel.tsx`, and `checkout-success-view-model.ts` into private folders under `apps/web/app/checkout/success/`.

Move `apps/web/features/codebase-flow/components/codebase-review-page.tsx`, `apps/web/features/codebase-flow/components/review/codebase-review-download-bridge.tsx`, `apps/web/features/codebase-flow/components/review/codebase-review-handoff-card.tsx`, and `apps/web/features/codebase-flow/hooks/use-review-download-handoff.ts` into private folders under `apps/web/app/(workspace)/review/`.

Create `apps/web/app/api/_lib/api-route-config.ts` for the Next API route path contract and the explicit Convex HTTP webhook path contract. Update first-party imports to use that route-contract path. Keep `apps/web/config/product.ts` exporting `apiRouteConfig` as a compatibility surface.

Update first-party route files and focused tests to import the moved checkout and review modules from the new App Router private paths.

Leave temporary compatibility re-exports in the old feature paths.

Update this ExecPlan, the owning Program, the current planning brief pointer, and only plan surfaces required by the actual changes.

### Out Of Scope

Do not move route pages themselves.

Do not change `apps/web/app/api/stripe/checkout/route.ts` behavior, Stripe checkout parameters, Stripe helper logic, checkout session state interpretation, checkout recovery helpers, Stripe webhook behavior, pricing, promo code behavior, billing proof, environment behavior, Convex schema, generated Convex files, public Convex function names, hosted Convex configuration, review download URLs, review preload query selection, API request parsing, API response bodies, course lesson registry files, course manifest files, shared UI inventory, or top-level feature folder names.

Do not add a Next Stripe webhook route. The current production webhook contract belongs to Convex HTTP actions at `/stripe/webhook`.

Do not include the unrelated stashed scrollbar styling change.

## Plan of Work

Start by confirming the import fan-in for checkout success wrappers, review wrappers, review download handoff helpers, and `apiRouteConfig`. Record the baseline in this plan so later reviewers can see which files are route-owned and which helpers stay durable features.

Create `apps/web/app/checkout/success/_components/` and `apps/web/app/checkout/success/_lib/`. Move the checkout success view and surface components into `_components`, and move the checkout success view model into `_lib`. Update local imports and update the checkout success page plus focused tests to use the new App Router paths. Replace old checkout success feature files with compatibility re-exports.

Create `apps/web/app/(workspace)/review/_components/` and `apps/web/app/(workspace)/review/_hooks/`. Move the review page, review download bridge, and review handoff card into `_components`, and move the review auto-download hook into `_hooks`. Update local imports and update the review route page plus focused tests to use the new App Router paths. Replace old review feature files and hook with compatibility re-exports.

Create `apps/web/app/api/_lib/api-route-config.ts`. Move the API path constant values out of `apps/web/config/product.ts` into that file, keeping the Convex Stripe webhook path explicitly named as a Convex HTTP route rather than a Next route. Update app route handlers and feature API clients to import `apiRouteConfig` from the new path. Keep `apps/web/config/product.ts` re-exporting `apiRouteConfig` for compatibility.

Keep plan and Program documents current as work proceeds. If validation reveals a hidden durable consumer, record it in `Surprises & Discoveries` before changing the approach.

## Milestones

The first milestone is plan and baseline evidence. It is complete when planning brief 5 and this ExecPlan exist, lint cleanly, and baseline scans prove the checkout, review, and API route consumers.

The second milestone is checkout success colocation. It is complete when checkout success wrapper UI and view-model code live under `apps/web/app/checkout/success`, first-party imports use the new paths, and old feature paths are compatibility re-exports.

The third milestone is review colocation. It is complete when review route wrapper UI and the review auto-download hook live under `apps/web/app/(workspace)/review`, first-party imports use the new paths, and old feature paths are compatibility re-exports.

The fourth milestone is API route path contract visibility. It is complete when API route path constants live under `apps/web/app/api/_lib`, first-party route handlers and API clients import them from there, and `apps/web/config/product.ts` keeps only a compatibility export for `apiRouteConfig`.

The fifth milestone is validation. It is complete when focused checkout, review, API route, API client, format, app lint, app typecheck, plan lint, Program lint, markdown lint, and diff checks pass.

The sixth milestone is archival. It is complete when this ExecPlan records the completed outcome, moves from `docs/exec-plans/active/` to `docs/exec-plans/completed/`, and the Program names the next slice.

## Concrete Steps

From repo root, confirm branch and status:

    git status --short --branch

Read the Program, the current planning brief, and this plan:

    sed -n '1,260p' docs/programs/completed/2026-04-26-app-structure-refactor/program.md
    sed -n '1,220p' docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-5.md
    sed -n '1,320p' docs/exec-plans/active/2026-04-26-finish-route-ownership-visibility.md

Record baseline imports:

    rg 'features/checkout/components/checkout-success|features/codebase-flow/components/codebase-review-page|features/codebase-flow/components/review/codebase-review|features/codebase-flow/hooks/use-review-download-handoff|apiRouteConfig' apps/web --glob '!node_modules'

After the moves and import updates, prove first-party consumers use the App Router paths and old feature paths are compatibility exports:

    rg 'features/checkout/components/checkout-success|features/codebase-flow/components/codebase-review-page|features/codebase-flow/components/review/codebase-review|features/codebase-flow/hooks/use-review-download-handoff' apps/web/app apps/web/tests --glob '!node_modules'
    rg 'app/(checkout/success|\\(workspace\\)/review|api)/_.*(checkout-success|codebase-review|use-review-download-handoff|api-route-config)|app/api/_lib/api-route-config' apps/web --glob '!node_modules'

Run focused checkout and review tests:

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx tests/integration-ui/codebase-review-page.test.tsx
    bun run --cwd apps/web test:unit -- tests/unit/review-download-handoff.test.tsx tests/unit/route-metadata.test.ts

Run focused API route and API client tests:

    bun run --cwd apps/web test:integration -- tests/integration/stripe-checkout-route.test.ts tests/integration/codex-route-handlers.test.ts tests/integration/observability-client-error-route.test.ts tests/integration/observability-clerk-route.test.ts tests/integration/observability-vercel-route.test.ts tests/integration/observability-incident-status-route.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/checkout-button.test.tsx
    bun run --cwd apps/web test:unit -- tests/unit/codebase-problem-statement-optimizer.test.tsx

Then run app and plan checks:

    bun run format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-26-finish-route-ownership-visibility.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/completed/2026-04-26-app-structure-refactor docs/exec-plans/completed/2026-04-26-finish-route-ownership-visibility.md
    git diff --check

## Validation and Acceptance

This slice is accepted because checkout success wrapper UI and view-model code live under `apps/web/app/checkout/success`, review route wrapper UI and the review auto-download hook live under `apps/web/app/(workspace)/review`, API route path constants live under `apps/web/app/api/_lib`, first-party route files and tests import those App Router paths, old feature and product-config paths are compatibility exports, and focused plus app-level validation passed.

Checkout success behavior must remain unchanged. Focused tests must still prove pending access, ready access, sign-in recovery, account mismatch, payment pending, invalid session, missing session, redirect arming, and rotating status copy.

Review behavior must remain unchanged. Focused tests must still prove the review handoff, fallback download link, one-time auto-download, local nav, Build Lessons CTA, and locked review redirect behavior.

API request behavior must remain unchanged. Focused tests must still prove Stripe checkout route behavior, Codex route handlers, observability route handlers, checkout button API client calls, and codebase problem-statement optimizer API client calls.

### Test Commands

Run these commands from repo root after implementation:

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx tests/integration-ui/codebase-review-page.test.tsx
    bun run --cwd apps/web test:unit -- tests/unit/review-download-handoff.test.tsx tests/unit/route-metadata.test.ts
    bun run --cwd apps/web test:integration -- tests/integration/stripe-checkout-route.test.ts tests/integration/codex-route-handlers.test.ts tests/integration/observability-client-error-route.test.ts tests/integration/observability-clerk-route.test.ts tests/integration/observability-vercel-route.test.ts tests/integration/observability-incident-status-route.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/checkout-button.test.tsx
    bun run --cwd apps/web test:unit -- tests/unit/codebase-problem-statement-optimizer.test.tsx
    bun run format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-26-finish-route-ownership-visibility.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/completed/2026-04-26-app-structure-refactor docs/exec-plans/completed/2026-04-26-finish-route-ownership-visibility.md
    git diff --check

## Idempotence and Recovery

The moves are safe to retry because old feature and product-config files become compatibility re-exports. If a path rewrite misses a test mock or static import, fix the import and rerun the focused tests.

If typecheck shows that a moved checkout or review wrapper is imported by durable non-route feature code, stop and record the consumer before deciding whether to keep a compatibility export or move that wrapper back.

If checkout, review, or API route tests fail, compare imports first. This slice should not change business logic, request parsing, response bodies, route URLs, or copy. Repair path and module-boundary issues before considering behavior changes.

Do not broaden recovery into billing, Convex, course registry, shared UI cleanup, or final feature-folder deletion.

## Artifacts and Notes

Source Program packet:

    docs/programs/completed/2026-04-26-app-structure-refactor/

Current planning brief:

    docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-5.md

Baseline route-owned checkout wrapper fan-in:

    apps/web/app/checkout/success/page.tsx
    apps/web/tests/integration-ui/checkout-success-view.test.tsx
    apps/web/tests/integration-ui/checkout-success-view.interactions.test.tsx
    apps/web/tests/unit/route-metadata.test.ts

Baseline route-owned review wrapper fan-in:

    apps/web/app/(workspace)/review/page.tsx
    apps/web/tests/integration-ui/codebase-review-page.test.tsx
    apps/web/tests/unit/review-download-handoff.test.tsx

Baseline API route path contract fan-in includes App Router route handlers, feature API clients, checkout button tests, Codex route tests, observability route tests, and Stripe checkout route tests.

Focused checkout and review validation passed:

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx tests/integration-ui/codebase-review-page.test.tsx
    Test Files  3 passed (3)
    Tests  14 passed (14)

    bun run --cwd apps/web test:unit -- tests/unit/review-download-handoff.test.tsx tests/unit/route-metadata.test.ts
    Test Files  2 passed (2)
    Tests  4 passed (4)

Focused API route and API client validation passed:

    bun run --cwd apps/web test:integration -- tests/integration/stripe-checkout-route.test.ts tests/integration/codex-route-handlers.test.ts tests/integration/observability-client-error-route.test.ts tests/integration/observability-clerk-route.test.ts tests/integration/observability-vercel-route.test.ts tests/integration/observability-incident-status-route.test.ts
    Test Files  6 passed (6)
    Tests  49 passed (49)

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/checkout-button.test.tsx
    Test Files  1 passed (1)
    Tests  3 passed (3)

    bun run --cwd apps/web test:unit -- tests/unit/codebase-problem-statement-optimizer.test.tsx
    Test Files  1 passed (1)
    Tests  3 passed (3)

App validation passed:

    bun run format:check
    All matched files use the correct format.

    bun run --cwd apps/web lint
    Found 0 warnings and 0 errors.

    bun run --cwd apps/web typecheck
    Compiled successfully, finished TypeScript, generated 71 static pages, and produced the App Router route graph.

Plan and diff validation passed after archival:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-26-finish-route-ownership-visibility.md
    docs/exec-plans/completed/2026-04-26-finish-route-ownership-visibility.md: ok

    bun run programs:lint
    app-structure-refactor: ok

    bun run markdown:lint -- --paths docs/programs/completed/2026-04-26-app-structure-refactor docs/exec-plans/completed/2026-04-26-finish-route-ownership-visibility.md
    docs/exec-plans/completed/2026-04-26-finish-route-ownership-visibility.md: ok
    docs/programs/completed/2026-04-26-app-structure-refactor/program.md: ok

    git diff --check
    no output

## Interfaces and Dependencies

This plan depends on `apps/web/app/checkout/success`, `apps/web/app/(workspace)/review`, `apps/web/app/api`, `apps/web/features/checkout`, `apps/web/features/codebase-flow`, `apps/web/features/codex`, `apps/web/features/observability`, `apps/web/config/product.ts`, Clerk, Convex React hooks, local Next App Router route-handler and client-component behavior, `docs/release-workflow.md`, `apps/web/AGENTS.md`, the root `AGENTS.md`, `docs/programs/PROGRAMS.md`, and `docs/exec-plans/PLANS.md`.
