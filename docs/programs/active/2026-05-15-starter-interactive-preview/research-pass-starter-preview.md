---
title: "Starter Interactive Preview Research"
summary: "Research pass for restoring a Starter-specific interactive preview on `/starter` without bringing back the old homepage."
docType: "research_pass"
status: "active"
read_when:
  - "Planning the Starter interactive preview."
  - "Checking which old codebase-demo pieces can be reused."
  - "Verifying why the old homepage stack must not return."
---

# Starter Interactive Preview Research

This research pass records the current facts around the public Starter route, the old homepage codebase demo, checkout boundaries, and the current T3 Code public visual system.

## Required Context

Root `AGENTS.md` and `apps/web/AGENTS.md` require web work to preserve the nearest owner instructions, the T3 Code design Program, and the release workflow when public routes or checkout-adjacent surfaces are involved. `apps/web/src/content/docs/configure-the-homepage.mdx` says `/` is the Man Meets AI brand page, `/starter` is the public Starter offer page, `/workers` is the public Workers offer page, and Starter checkout must use offer id `starter` and route buyers to `/starter/home`.

The completed T3 Code Program at `docs/programs/completed/2026-05-14-t3-code-source-design-system-port/program.md` is now the source of truth for web UI visual decisions. Public pages should use compact DM Sans typography, zinc semantic tokens, blue primary accents, quiet borders, restrained motion, and the shared public route-surface recipe. The old large serif homepage language is not the active visual contract.

## Current Starter Route

The current `/starter` route lives at `apps/web/src/app/(marketing)/starter/page.tsx`. It is a Server Component that renders `PublicRoutePage`, `PublicSiteHeader`, `PublicRouteSection`, `PublicRouteContainer`, public route headers, public panels, and a `CheckoutButton` with `offerId="starter"` and `testId="starter-checkout-cta"`.

The route is intentionally small and public. It describes two Starter paths: guided product questions for a customized repo path, and a direct template plus guided videos path. It links existing-codebase visitors to `/workers`. Its metadata title is `Starter`.

The file is already near the component-size guidance. Adding the interactive preview inline would push the route over the 150-line rule and would mix page assembly with client state. The implementation should add a focused component under a plain source folder such as `apps/web/src/components/starter/` and keep the route file as assembly.

## Old Interactive Preview

The old interactive preview exists under `apps/web/src/app/_components/home-page/sections/codebase-demo/`. The full wrapper is `codebase-demo-section.tsx`. That wrapper includes a dark full-screen leverage hero, a toggle between an idea branch and an existing-codebase branch, a sticky sidebar, Foundation/Design/Pricing interactive cards, locked cards for the remaining Codebase sections, and a sticky checkout CTA.

The full wrapper should not be reused on `/starter`. It would bring back the old homepage structure, the large dark hero, and the Workers/existing-codebase branch. That conflicts with the current public route surface and with the product split that keeps `/starter` focused on new builders.

The useful reusable pieces are narrower:

- `home-page-codebase-draft-storage.ts` stores a local draft under `sbs:home-codebase-draft:v1`.
- `use-home-page-codebase-draft.ts` builds and persists draft fields for product facts, design preset, and pricing.
- `codebase-demo-foundation-card.tsx`, `codebase-demo-design-card.tsx`, and `codebase-demo-pricing-card.tsx` contain the interactive form controls.
- `codebase-demo-sidebar.tsx` shows section progress.
- `codebase-demo-locked-card.tsx` previews locked post-checkout sections.
- `codebase-demo-cta-bar.tsx` saves the draft before checkout.

The old code is still referenced by `apps/web/src/app/_components/home-page/home-page.tsx` and covered by `apps/web/tests/integration-ui/home-page-product-preview.test.tsx`. Any extraction must keep those tests working or update them to the new shared imports without changing old compatibility behavior.

## Draft Handoff

The local draft is not decorative. `apps/web/src/lib/codebase-flow/use-codebase-local-draft-seeder.ts` reads the stored preview fields after authentication and seeds protected Starter workspace facts when the workspace is empty. This means the public preview can safely reuse the existing storage contract. A new storage key would break the existing post-checkout seeding path unless the protected seeder were updated too.

Because checkout is involved, the preview CTA should explicitly use `offerId="starter"`. Relying on the old homepage CTA default of `starter` is avoidable ambiguity. The implementation should use the same app-owned `CheckoutButton` path as the current route and preserve the route's existing hero checkout CTA.

## Tests And Proof

Current public marketing coverage lives in `apps/web/tests/unit/public-marketing-surfaces.test.tsx`. It already mocks `CheckoutButton` and asserts `/starter` renders a `starter-checkout-cta` with `data-offer-id="starter"`.

The old preview has integration-ui coverage in `apps/web/tests/integration-ui/home-page-product-preview.test.tsx`. It asserts the canonical seven Codebase sections, draft persistence before checkout, leverage hero toggle behavior, no Express Checkout session creation during render, and locked card copy.

The new slice should add focused public Starter preview coverage rather than relying only on the old homepage demo tests. Useful assertions are: `/starter` renders a Starter-specific preview test id, it does not render the old codebase branch CTA, editing Foundation/Design/Pricing persists to the existing storage key before checkout, and every preview checkout button uses `starter`.

Browser proof should capture `/starter` at desktop and mobile sizes. The T3 public surfaces Program recorded a local Turbopack panic and used `bun --cwd apps/web next dev --webpack -p <port>` for browser proof; that fallback is acceptable if the same local issue appears.

## Research Conclusions

This should become a Program only because the work has multiple product and implementation boundaries: public Starter messaging, visual-system alignment, extraction from old homepage compatibility code, checkout-adjacent preservation, local draft handoff, and browser proof. The first child ExecPlan should be a focused implementation slice that adds the preview while keeping checkout, Stripe offer IDs, protected Starter flows, Workers pages, Worker Seal Team 6, Cal.com, Telegram mounting, and MDX cleanup out of scope.
