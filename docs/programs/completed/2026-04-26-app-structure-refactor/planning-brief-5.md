---
title: App Structure Refactor Planning Brief 5
program_id: app-structure-refactor
brief_version: 5
status: current
summary: Finish the current route-ownership visibility pass for checkout success, review, and API route path contracts without changing billing, Convex, or request behavior.
read_when:
  - Writing the fifth child ExecPlan for the app structure refactor Program.
  - Finishing route ownership after workspace and identity route colocation.
  - Preserving checkout, review, API, Convex, and billing behavior during route colocation.
---

# App Structure Refactor Planning Brief 5

## Planning Refresh

This is the fifth planning brief for the app structure refactor Program.

The first child ExecPlan is complete at `docs/exec-plans/completed/2026-04-26-make-app-structure-boundaries-explicit.md`. It made selected cross-feature imports explicit, moved shared assertion helpers to `apps/web/lib/assert.ts`, added server-only guards to true server helper modules, and passed focused and app-level validation.

The second child ExecPlan is complete at `docs/exec-plans/completed/2026-04-26-extract-workspace-shell-from-course.md`. It moved the shared AppShell implementation into `apps/web/features/workspace-shell`, updated first-party imports, kept temporary compatibility exports at the old course-owned shell path, and passed focused and app-level validation.

The third child ExecPlan is complete at `docs/exec-plans/completed/2026-04-26-make-route-ownership-visible.md`. It moved the protected workspace access gate and legacy blueprint redirect helper into private `apps/web/app/(workspace)` folders, updated first-party imports and tests, kept temporary compatibility exports, and passed focused and app-level validation.

The fourth child ExecPlan is complete at `docs/exec-plans/completed/2026-04-26-make-identity-route-ownership-visible.md`. It moved identity route wrapper screens and support shell code into private `apps/web/app/(identity)` folders, updated first-party imports and tests, kept temporary compatibility exports, and passed focused and app-level validation.

## What The Previous Slice Unblocked

The identity route wrappers no longer block the remaining route-ownership work. The remaining route-local candidates are checkout success wrappers, review route wrappers, and the API route path contract that currently lives inside broad product configuration.

This slice should finish the current route-ownership visibility pass without becoming the later billing, Convex, shared UI, course, or final feature-folder cleanup work.

## Next Plan Recommendation

Exact next plan title: `Finish Route Ownership Visibility`.

Exact scope: move checkout success wrapper UI and view-model files from `apps/web/features/checkout/components/checkout-success-*` into private folders under `apps/web/app/checkout/success/`. Move the review route wrapper, review handoff bridge, review handoff card, and review auto-download hook from `apps/web/features/blueprint-flow/components/blueprint-review-page.tsx`, `apps/web/features/blueprint-flow/components/review/*`, and `apps/web/features/blueprint-flow/hooks/use-review-download-handoff.ts` into private folders under `apps/web/app/(workspace)/review/`. Move the Next API route path contract out of `apps/web/config/product.ts` into `apps/web/app/api/_lib/api-route-config.ts`, update first-party imports, and keep a compatibility export from `apps/web/config/product.ts`.

Exact implementation boundaries: do not change checkout session creation, Stripe checkout parameters, Stripe webhook handling, pricing, promo code behavior, billing proof, checkout recovery helpers, Convex schema or generated files, Convex preload queries, review download URLs, route pages themselves, course lesson registry or manifest files, shared UI inventory, environment behavior, or the unrelated stashed scrollbar styling change.

Exact validation boundaries: run focused checkout success, review handoff, API route, and API client tests first. Then run `bun run format:check`, `bun run --cwd apps/web lint`, `bun run --cwd apps/web typecheck`, plan lint, Program lint, markdown lint, and `git diff --check`.

Why it is next: checkout success and review are the remaining route-owned wrapper screens named by the Program packet, and the API route path contract is the remaining route-ownership visibility issue that can move without changing request parsing or billing behavior. The later billing slice should still own checkout session interpretation and Stripe/Convex behavior.

## Risks To Carry Forward

Keep `apps/web/features/checkout/components/checkout-button.tsx`, `apps/web/features/checkout/hooks/use-stripe-checkout.ts`, and checkout server helpers in checkout feature/platform boundaries except for importing the new API route path contract. Checkout start behavior and Stripe session recovery must not change.

Keep `apps/web/features/blueprint-flow/lib/review-download-handoff.ts` in the blueprint-flow feature for this slice. Its constants and pure helpers are consumed by review, blueprint page state, Execute / Ship tracks, and tests; moving it into a route-private folder would make durable feature code import a route-private module.

Keep the current Stripe webhook contract outside Next API routes. The Stripe webhook is a Convex HTTP action at `/stripe/webhook`; do not add or imply a Next route handler for it.

Keep compatibility exports temporary and obvious. Later slices should remove old feature-path and product-config re-exports only after import scans prove first-party code no longer uses them.
