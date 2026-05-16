---
title: "Starter Interactive Preview Dependency Graph"
summary: "Ordering and dependency map for adding the Starter preview while preserving old demo compatibility and checkout behavior."
docType: "dependency_graph"
status: "active"
read_when:
  - "Splitting the Starter preview into child ExecPlans."
  - "Checking implementation order and validation dependencies."
---

# Starter Interactive Preview Dependency Graph

## Nodes

Node: Public Starter route contract.

`apps/web/src/app/(marketing)/starter/page.tsx` owns the current public route composition, metadata, public header, hero copy, and hero checkout CTA. This route should remain a Server Component that assembles public sections and imports a client preview component.

Node: T3 public route visual system.

`apps/web/src/components/layout/public-route-surface.tsx` and the completed T3 Code Program define the look and structure for public pages. The preview should compose with those helpers rather than reintroducing the old homepage visual language.

Node: Old codebase-demo behavior.

`apps/web/src/app/_components/home-page/sections/codebase-demo/` contains the old implementation. The first slice depends on its storage, draft hook, interactive cards, sidebar, locked cards, and CTA save behavior. It must not depend on the old full wrapper as the new route component.

Node: Protected draft seeding.

`apps/web/src/lib/codebase-flow/use-codebase-local-draft-seeder.ts` reads the public draft storage and writes initial protected Starter facts when the workspace is empty. The preview must preserve this contract unless a later slice explicitly migrates both sides together.

Node: Checkout button and billing offer.

`apps/web/src/app/checkout/_components/checkout-button.tsx` and `apps/web/src/platform/billing/checkout/checkout-offers.ts` own the app-backed checkout surface. The preview depends on `CheckoutButton offerId="starter"` and should not change billing internals.

Node: Tests and browser proof.

`apps/web/tests/unit/public-marketing-surfaces.test.tsx`, `apps/web/tests/integration-ui/home-page-product-preview.test.tsx`, checkout button tests, and browser screenshots prove the route and old demo still work.

## Ordering

First, write the child ExecPlan so the extraction boundary is explicit before editing old compatibility code.

Second, build a Starter-specific preview component that can be imported by `/starter` without making the page itself a Client Component. The component should receive serialized content and own browser-only draft state.

Third, extract or reuse old codebase-demo internals with compatibility preserved. If imports move, update both the new preview and the old homepage demo tests in the same slice.

Fourth, integrate the preview below or near the `/starter` hero and keep the current hero CTA unchanged.

Fifth, validate public route markup, draft persistence, checkout offer IDs, old demo compatibility, desktop layout, and mobile layout.

## Blocking Relationships

The preview component cannot be finalized until the visual boundary is chosen. A full old-wrapper reuse would block acceptance because it conflicts with the T3 public route system.

The CTA cannot be finalized until the preview uses explicit `offerId="starter"`. Relying on homepage defaults is too implicit for a public checkout entry.

Browser proof should happen after focused tests pass. Screenshots are useful only once the core behavior and route markup are stable.
