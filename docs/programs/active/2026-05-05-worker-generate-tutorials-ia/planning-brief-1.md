---
title: Worker Generate Tutorials Planning Brief 1
program_id: worker-generate-tutorials-ia
brief_version: 1
status: current
summary: Hard-switch the product IA to Generate Codebase, Tutorials, and Worker in one coherent first slice.
read_when:
  - "Creating the first child ExecPlan for the Worker IA migration."
  - "Implementing the first hard-switch product IA slice."
---

# Worker Generate Tutorials Planning Brief 1

The first child ExecPlan should be titled `Hard Switch Product IA To Generate Codebase Tutorials And Worker`.

The goal is to cut the customer-facing app IA from the old route and lane model to Generate Codebase, Tutorials, and Worker. A paid customer should be authorized for Generate Codebase, Tutorials, and Worker independently instead of being locked into one scalar `fulfillmentTrack`, and the visible app should use `/generate-codebase`, `/tutorials`, and `/workers` without teaching `/codebase`, `/review`, `/lesson/*`, or `/workspace/*` as supported product routes.

Exact scope: update the product access model in `apps/web/convex/access/model.ts`, validators in `apps/web/convex/access/validators.ts`, checkout intent handling in `apps/web/platform/billing/checkout/checkout-intent.ts` only as needed for migration inputs, `apps/web/lib/product-access.ts`, `apps/web/platform/access/product-access.ts`, `apps/web/config/product.ts`, route files under `apps/web/app/(workspace)/`, proxy protected route configuration, checkout success routing, resume destination routing, AppShell navigation, Command-K, user menu links, and route/UI tests for the touched surfaces.

The implementation may read old persisted checkout values as migration inputs, but it must not preserve them as current product authority. Existing `generated_codebase` grants should map to Generate Codebase and Tutorials. Existing `existing_codebase_doctor` grants should map to Worker and Tutorials if the product decision is that all paid customers can watch tutorials. If that product decision changes, the plan must record the alternate mapping before implementation.

The implementation should add tests proving generated-only, worker-only, tutorial-capable, dual-capable, and unresolved users. It should prove that route guards check capabilities instead of the scalar track and that existing checkout grants resolve to the new route families.

This first slice should add `/generate-codebase`, `/tutorials`, and `/workers` as the product route families and should stop presenting `/codebase`, `/review`, `/lesson/*`, and `/workspace/*` as product routes. Do not rename owned API paths, Convex tables, local-runner command language, or the generated Codebase artifact in this slice unless a small route-boundary rename is required for the app to compile. Those runtime contract changes belong to the next slice.

Focused validation should start with access model unit tests, route guard tests, checkout success view-model tests, route tests, Command-K tests, and app shell navigation tests. Include a scan for old product routes in touched app surfaces. Broader validation should include app lint and typecheck after the focused tests pass.
