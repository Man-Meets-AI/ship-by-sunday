---
title: App Structure Refactor Planning Brief 11
program_id: app-structure-refactor
brief_version: 11
status: current
summary: Finish the app structure refactor by removing unused route-local compatibility exports and syncing durable docs.
read_when:
  - Writing the final child ExecPlan for the app structure refactor Program.
  - Removing only proven-unused compatibility exports after the route, shared UI, course, and billing slices.
  - Closing the app structure refactor Program without changing route, billing, Convex, shared UI inventory, or AppShell behavior.
---

# App Structure Refactor Planning Brief 11

## Planning Refresh

This is the eleventh planning brief for the app structure refactor Program.

The first ten child ExecPlans are complete. They made boundary imports explicit, extracted the shared workspace shell, moved route-owned wrapper surfaces into App Router private folders, moved marketing-only effects and a blueprint-only hook out of generic shared locations, moved persisted completion field IDs into the lesson model, moved lesson URL construction out of the curriculum model, kept stage-unlock model summaries route-neutral, and made checkout session parameter assembly feature-owned.

The current Program recommendation is final features reduction and docs sync. Inspection found that several old route-local compatibility files are now unused by first-party code: identity route wrappers under `apps/web/features/auth`, access-required route wrappers under `apps/web/features/product-access`, review route wrappers under `apps/web/features/blueprint-flow`, checkout-success wrappers under `apps/web/features/checkout/components`, and the old global `apps/web/hooks/use-keyboard-shortcut.ts` re-export. Inspection also found that `apps/web/config/product.ts` still re-exports `apiRouteConfig`, but all first-party consumers now import it directly from `apps/web/app/api/_lib/api-route-config.ts`.

## What The Previous Slice Unblocked

The billing slice removed the last planned billing boundary smell without changing behavior. With route ownership, shared shell ownership, shared UI ownership, course-domain boundaries, and billing boundaries now visible, the final slice can clean up only compatibility files that are proven unused and sync durable docs to describe the resulting structure.

The final slice should not delete compatibility layers that are still intentionally out of scope. In particular, keep the `apps/web/components/ui` inventory and the old AppShell re-export layer under `apps/web/features/course/shared/components/app-shell` intact.

## Next Plan Recommendation

Exact next plan title: `Finalize App Structure Refactor Docs And Compatibility Cleanup`.

Exact scope: delete unused route-local compatibility files that static scans prove have no first-party imports: old identity wrapper exports, old access-required wrapper exports, old review wrapper exports, old checkout-success wrapper exports, and the old global keyboard hook export. Remove the unused `apiRouteConfig` compatibility export from `apps/web/config/product.ts`. Update `docs/ARCHITECTURE.md` and `docs/FRONTEND.md` with a concise current app-structure map. Update Program docs and indexes, and if validation passes, close and move the Program packet to `docs/programs/completed/`.

Exact implementation boundaries: do not delete `apps/web/components/ui` compatibility files, do not delete or change the old AppShell compatibility exports, do not move route screens, do not rename or delete feature folders, do not modify Convex schema or generated files, do not change Stripe checkout, webhook, pricing, promo code, billing proof, environment, route behavior, public Convex function names, shared UI inventory, AppShell behavior, or the unrelated stashed scrollbar styling change.

Exact validation boundaries: run static scans proving no first-party imports use the deleted compatibility paths, and no consumer imports `apiRouteConfig` from `apps/web/config/product.ts`. Run focused tests for identity route pages, access-required route pages, review download handoff, checkout-success view, checkout route, blueprint page, keyboard shortcut, route metadata, and billing helper coverage. Then run `bun run format:check`, `bun run --cwd apps/web lint`, `bun run --cwd apps/web typecheck`, plan lint, Program lint, markdown lint, and `git diff --check`.

Why it is next: it is the Program's final cleanup and documentation slice. It removes proven-dead compatibility files without touching the riskier shared UI and AppShell compatibility layers, then records the final ownership map in durable docs.

## Risks To Carry Forward

Do not delete compatibility files just because they look old. Only delete paths with no first-party consumers in app code or tests.

Do not edit historical completed ExecPlans to chase old path mentions. Completed plan archives are evidence of prior states and should remain stable unless a linter requires a metadata fix.

Do not treat docs sync as permission to rewrite product behavior or public route semantics. This slice is structure documentation and dead compatibility cleanup only.
