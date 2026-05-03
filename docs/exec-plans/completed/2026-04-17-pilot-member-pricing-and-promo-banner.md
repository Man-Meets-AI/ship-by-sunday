---
title: Pilot Member Pricing And Promo Banner
status: complete
created_at: 2026-04-17
completed_at: 2026-04-17
summary: Make Ship by Sunday present a $500 list price with a 50% off Pilot Member discount that is auto-applied at checkout and shown consistently in the homepage banner, pricing section, metadata, and Stripe validation path.
post_build_recap: Ship by Sunday now presents a $500 list price with a 50% Pilot Member offer that renders through shared homepage banner components, applies automatically in Stripe Checkout through STRIPE_PROMOTION_CODE_ID, reflects the discounted checkout amount in schema/Open Graph, and is documented in the tracked env contract with explicit local test-mode guidance.
read_when:
  - Reviewing the finished Pilot Member pricing implementation.
  - Revalidating Stripe checkout discount behavior.
  - Provisioning matching test Stripe assets for local checkout parity.
---

# Pilot Member Pricing And Promo Banner

This document is a living execution plan for landing the Ship by Sunday Pilot Member pricing slice without letting homepage copy, Stripe checkout behavior, metadata, or tests drift apart.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

After this change, a visitor should see Ship by Sunday presented as a `$500` product with a Pilot Member `50%` discount that brings the payable price to `$250`, and Stripe Checkout should apply that discount automatically instead of asking the buyer to discover or type a code. The public homepage should show the offer in the same restrained, editorial system already defined by `DESIGN.md`: one ecommerce-style banner at the top, one pricing stack with a struck-through `$500`, one visible current price, and truthful supporting text that explains the discount is auto-applied. The change matters because the current repo is split between pricing truth in `apps/web/config/product.ts`, marketing copy in `apps/web/features/marketing/content/home.ts`, and checkout behavior in `apps/web/app/api/stripe/checkout/route.ts`. The result only counts as complete when all of those surfaces agree and the checkout tests prove the offer is actually applied.

## Progress

- [x] 2026-04-17 11:11 EDT — Read `AGENTS.md`, `apps/web/AGENTS.md`, `DESIGN.md`, `apps/web/content/docs/configure-the-homepage.mdx`, and `docs/exec-plans/PLANS.md`, then inspected the live pricing, homepage, metadata, Stripe, and test surfaces.
- [x] 2026-04-17 11:11 EDT — Confirmed the current `price-fixes` worktree already contains a partial implementation: `apps/web/config/product.ts` now models a base price plus `activeOffer`, `apps/web/platform/billing/stripe.ts` and `apps/web/app/api/stripe/checkout/route.ts` now attempt auto-applied promotion-code discounts, and a new reusable banner component exists at `apps/web/features/marketing/components/promo-banner.tsx`.
- [x] 2026-04-17 11:27 EDT — Attempted to verify the live Stripe promotion code via plugin-backed access, but this session does not expose callable Stripe connector tools and the fallback browser check landed on `https://dashboard.stripe.com/login?redirect=%2Ftest%2Fcoupons` instead of an authenticated dashboard. The plan now treats the human-readable code string as unresolved dashboard state and the repo-owned contract as `STRIPE_PROMOTION_CODE_ID`.
- [x] 2026-04-17 11:33 EDT — Verified live and test Stripe account facts through the local Stripe CLI. Live mode already has an active `50%` promotion code `OGPRICE5050` with promotion-code ID `promo_1RpCneCgIdJ1QglPK7WywWrV` backed by coupon `rAscfQsS`, while the more on-the-nose `EARLYSHIP` code exists but is inactive. The live managed price in `apps/web/.env.production` is already `$500`, but the test managed price in `apps/web/.env.local` is still `$250` and the test account has no coupons or promotion codes at all.
- [x] 2026-04-17 11:34 EDT — Finished the canonical pricing contract and copy pass. `apps/web/config/product.ts` now treats `$500` as the list price, `$250` as the active checkout price derived from `activeOffer`, and the shared homepage/Open Graph content now uses explicit Pilot Member wording instead of the earlier generic “limited-time” copy.
- [x] 2026-04-17 11:34 EDT — Reconciled the remaining homepage, metadata, environment-doc, and test surfaces. `apps/web/content/docs/environment-variables.mdx` and `apps/web/.env.local.example` now document `STRIPE_PROMOTION_CODE_ID`, warn against hard-coding guessed coupon strings, and tell local builders to leave `STRIPE_PRICE_ID` unset until matching test Stripe assets exist.
- [x] 2026-04-17 11:34 EDT — Ran focused validation successfully from `apps/web`: `bunx oxlint --deny-warnings ...`, `bunx vitest --config vitest.config.ts run --project unit tests/checkout/stripe-line-item.test.ts tests/marketing/home-page-content.test.ts tests/marketing/home-page-structured-data.test.ts tests/marketing/opengraph-image.test.tsx`, `bunx vitest --config vitest.config.ts run --project integration tests/checkout/stripe-checkout-route.integration.test.ts`, and `bunx vitest --config vitest.config.ts run --project contracts tests/course/curriculum.contract.test.ts`.
- [x] 2026-04-17 11:37 EDT — Ran the browser smoke and the required repo quality gates. `PLAYWRIGHT_USE_LOCAL_SERVER=1 bun run test:e2e -- --grep "homepage drives visitors into the buyer journey entry points|marketing and editorial pages ship the public metadata contract"`, `bun run format`, `bun lint`, and `bun run typecheck` all passed. The remaining follow-up is operator-only: create a matching test promotion code if local checkout needs full Stripe parity instead of the documented inline-price fallback.

## Surprises & Discoveries

The most important discovery is that this branch is not starting from scratch. The working tree already contains the core shape of the intended solution: `apps/web/config/product.ts` now derives `productConfig.priceDisplay`, `productConfig.checkoutPriceDisplay`, and `productConfig.activeOffer`; `apps/web/app/api/stripe/checkout/route.ts` now calls `getStripeCheckoutDiscounts()` and disables `allow_promotion_codes` when the discount is auto-applied; and `apps/web/features/marketing/components/promo-banner.tsx` already extracts the banner visuals into a reusable component. The plan therefore must treat those local edits as the starting state and focus the implementation on finishing and validating them rather than re-planning a different architecture.

The second discovery is that the repository does not currently expose a durable, git-tracked reference to a human-readable promotion code like `EARLY`. The codebase only knows about Stripe resource identifiers such as `STRIPE_PRICE_ID` and, in the current local worktree, `STRIPE_PROMOTION_CODE_ID`. That means the safe repo contract is to use an environment variable for the existing Stripe promotion code ID and let operators map that to whatever customer-facing code exists in Stripe. The repository should not hard-code the word `EARLY` unless a separate product requirement explicitly says it must appear in UI copy.

The third discovery is that structured data and Open Graph content already started drifting toward the discounted price on this branch. `apps/web/tests/marketing/home-page-structured-data.test.ts` now expects `productConfig.checkoutPriceUsdCents`, while `apps/web/app/opengraph-image.tsx` tries to render both the current and regular prices. That is directionally right for public offer copy, but it means the implementation must make an explicit choice about what schema should claim: the list price or the currently payable price. This plan resolves that below instead of leaving it implicit.

The fourth discovery is operational rather than code-local. An attempted Stripe dashboard verification from this environment hit the unauthenticated login screen, but the local Stripe CLI was sufficient to query both test and live accounts. That removed one ambiguity and exposed a more important one: live and test mode are no longer aligned. Live mode already has the desired `$500` managed price and an active `50%` promotion code named `OGPRICE5050`, while test mode still has a stale `$250` managed price and no promotion codes at all.

The fifth discovery is that the originally guessed code family is misleading. There is a live promotion code named `EARLYSHIP`, but it is inactive and already redeemed once. The only currently active reusable live `50%` code is `OGPRICE5050`, backed by promotion-code ID `promo_1RpCneCgIdJ1QglPK7WywWrV` and coupon `rAscfQsS`. Any implementation or documentation that assumes “the existing code is EARLY” would be wrong today.

The sixth discovery is that the repo’s Playwright flow has a local-server toggle that the draft plan did not account for. `bun run test:e2e` points at `http://127.0.0.1:3100` by default and will fail with `ERR_CONNECTION_REFUSED` unless `PLAYWRIGHT_USE_LOCAL_SERVER=1` is set or another server is already running. The original grep strings in the plan also did not match the current spec titles, so the finished plan records the exact test names that actually prove the homepage CTA and metadata paths.

## Decision Log

2026-04-17 — Decision: the canonical product price for this slice is a `$500` list price plus one active public offer worth `50%` off, not a canonical `$250` product price with optional promos layered on top. Rationale: the user explicitly wants the product to behave as “$500 with 50% off,” and the homepage pricing presentation should match that product story.

2026-04-17 — Decision: the repository will consume an existing Stripe promotion code through `STRIPE_PROMOTION_CODE_ID` instead of hard-coding a public coupon string such as `EARLY`. Rationale: promotion-code strings are operational dashboard state, while the repo needs a durable server-side identifier it can apply automatically in Checkout.

2026-04-17 — Decision: the public homepage should keep exactly one ecommerce-style banner surface at the top and one matching offer banner inside the pricing block, both powered from one pricing config source. Rationale: this matches the user’s request and preserves the design system rule that marketing accent moments should be intentional, sparse, and driven by composition instead of multiplying decorative promo chrome.

2026-04-17 — Decision: the homepage structured-data `Offer` should reflect the currently payable checkout amount while the visible UI still shows the regular price as the struck-through comparison point. Rationale: the schema should stay truthful to the transaction a visitor can complete right now, while the visual UI can still explain that the current price comes from a Pilot Member discount.

2026-04-17 — Decision: do not expose or promise the inactive `EARLYSHIP` code in repo code or plan text. Rationale: live Stripe verification showed that `EARLYSHIP` exists but is inactive, while the active reusable `50%` code is `OGPRICE5050`.

2026-04-17 — Decision: this implementation must account for test-mode Stripe drift explicitly. Rationale: live mode already matches the intended pricing shape, but test mode still points at a stale `$250` managed price and has no promotion-code assets, which would make local checkout fail or misrepresent the intended offer.

2026-04-17 — Decision: the visible marketing language should say “Pilot Member” rather than the earlier generic “limited-time offer.” Rationale: the user asked for Pilot Member pricing specifically, and using that language in the shared pricing source keeps the homepage banner, pricing panel, and Open Graph copy aligned to the intended offer story.

2026-04-17 — Decision: resolve test-mode managed-price drift in the tracked env contract instead of mutating Stripe assets from this coding session. Rationale: the repo can safely stop relying on the stale `$250` test price by documenting that `STRIPE_PRICE_ID` should stay unset locally until a matching `$500` test asset exists, while creating or editing real Stripe dashboard assets is an operator action outside the repo.

## Outcomes & Retrospective

The implementation landed with the intended contract. `apps/web/config/product.ts` is now the clear pricing source of truth: `$500` is the list price, `$250` is the current checkout amount derived from `activeOffer`, and the shared offer label is Pilot Member pricing. Checkout now builds from the regular price while applying the promotion code server-side through `STRIPE_PROMOTION_CODE_ID`, so the buyer is not asked to discover or type a code.

The public surfaces now agree on that same story. The hero top bar and pricing block both render through the shared `PromoBanner` primitive, the pricing section shows the struck-through regular price plus the current payable amount, `apps/web/features/marketing/lib/home-page-structured-data.ts` emits the discounted checkout amount as the `Offer` price, and `apps/web/app/opengraph-image.tsx` now references the Pilot Member pricing story instead of a one-price-only card.

The remaining gap is operational, not code-local. This session did not create test-mode Stripe promotion-code assets. Instead, the tracked env contract now explicitly tells local builders to leave `STRIPE_PRICE_ID` unset until their test Stripe account has a matching `$500` managed price, which removes the stale `$250` managed-price dependency. A full live-like local checkout still requires an operator to create a matching test promotion code and set `STRIPE_PROMOTION_CODE_ID`.

## Context and Orientation

The pricing control plane for this repo lives in `apps/web/config/product.ts`. That file feeds both `starterConfig` and `productConfig`, which in turn flow into marketing copy, metadata, checkout, Open Graph, and tests. The homepage content layer lives in `apps/web/features/marketing/content/home.ts`, which should describe the offer in words but should not become the source of truth for pricing math. The pricing visuals live in `apps/web/features/marketing/components/home-page/home-hero-top-bar.tsx`, `apps/web/features/marketing/components/home-page/pricing-footer-sections.tsx`, and now the extracted reusable banner at `apps/web/features/marketing/components/promo-banner.tsx`.

Checkout starts in `apps/web/app/api/stripe/checkout/route.ts`, which builds the Checkout Session from helpers in `apps/web/platform/billing/stripe.ts`. That Stripe helper module currently owns price validation, line-item construction, and, on this branch, the auto-applied checkout discounts. Environment variables are normalized in `apps/web/platform/env/server.ts`. The critical requirement for this feature is that any active public offer must change both the visible price story and the Checkout Session construction, or else the repo will claim an offer that Stripe does not actually honor.

Stripe state now splits into two concrete environments that the implementer must not conflate. The live account, queried through `apps/web/.env.production`, currently uses managed price `price_1T9EvvCgIdJ1QglPnfbBpPQI` for `$500` and has active promotion code `OGPRICE5050` with ID `promo_1RpCneCgIdJ1QglPK7WywWrV`. The test account, queried through `apps/web/.env.local`, currently uses managed price `price_1TKPZ2ELhKLJkXlWRwr8TyrE` for `$250` and has no test coupons or promotion codes at all. A newcomer following this plan must either provision matching test assets or stop relying on the stale test managed price during local checkout.

Schema and social preview surfaces are close enough to checkout truth that they must be updated in the same slice. `apps/web/features/marketing/lib/home-page-structured-data.ts` emits the homepage JSON-LD `Offer`, and `apps/web/app/opengraph-image.tsx` emits the public social card. Pricing assertions already exist in `apps/web/tests/marketing/home-page-structured-data.test.ts`, `apps/web/tests/marketing/opengraph-image.test.tsx`, `apps/web/tests/course/curriculum.contract.test.ts`, `apps/web/tests/checkout/stripe-line-item.test.ts`, and `apps/web/tests/checkout/stripe-checkout-route.integration.test.ts`. The plan must keep those files aligned rather than updating only the rendered UI.

### In Scope

This plan covers the public pricing and offer control plane in `apps/web/config/product.ts`; the homepage banner and pricing-section presentation in `apps/web/features/marketing/components/**` and `apps/web/features/marketing/content/home.ts`; the Stripe Checkout auto-apply discount path in `apps/web/app/api/stripe/checkout/route.ts`, `apps/web/platform/billing/stripe.ts`, and `apps/web/platform/env/server.ts`; the truthful schema and social preview surfaces in `apps/web/features/marketing/lib/home-page-structured-data.ts` and `apps/web/app/opengraph-image.tsx`; the focused tests that prove the behavior; the test-vs-live Stripe parity problem that the current CLI inspection exposed; and the smallest necessary docs updates for any new required Stripe environment variable or homepage contract change.

### Out Of Scope

This plan does not cover adding email support, reworking the docs spine or ExecPlan spine more broadly, changing the post-checkout funnel, redesigning the whole homepage, renaming the existing Stripe dashboard code, or simplifying the entire test harness. If product later decides the public-facing code must literally become `EARLY` or `EARLYSHIP`, that is a dashboard operation outside this repo. The repo’s responsibility is to consume the identifier safely, keep copy truthful, and either provision or explicitly document any missing test-mode Stripe assets needed for local checkout parity.

## Plan of Work

The work should begin by freezing the pricing contract in `apps/web/config/product.ts`. That file should keep a base list price of `$500`, derive a discounted checkout price from one optional active offer, and expose enough fields for other layers to render both the regular and discounted states without recomputing them ad hoc. The current branch already moves in that direction, so the first step is to stabilize the naming and make sure the public config exposes only the smallest necessary fields: regular price, checkout price, active offer label, and discount percentage.

The next step is to harden the Stripe path. `apps/web/platform/billing/stripe.ts` should make two separate truths explicit: the Stripe line item reflects the regular price, while `getStripeCheckoutDiscounts()` reflects the active offer. The route in `apps/web/app/api/stripe/checkout/route.ts` should build a Checkout Session that auto-applies the promotion code when an active offer exists and should disable user-entered promotion codes only in that mode. The implementation should keep failing loudly when the active offer exists but `STRIPE_PROMOTION_CODE_ID` is missing so the repo cannot silently present a discount that Stripe will not honor. This pass must also decide how local/test checkout reaches parity with live production truth, because the current test managed price is still `$250`.

Once the pricing and checkout contract is stable, the marketing surfaces should be reconciled. `apps/web/features/marketing/content/home.ts` should describe Pilot Member pricing in content derived from `productConfig`, not hard-coded month-based copy. `apps/web/features/marketing/components/promo-banner.tsx` should stay the only reusable banner primitive. `apps/web/features/marketing/components/home-page/home-hero-top-bar.tsx` should render the top ecommerce-style banner only when an active offer exists. `apps/web/features/marketing/components/home-page/pricing-footer-sections.tsx` should render the struck-through `$500`, the discounted `$250`, and one short supporting message explaining that the discount is auto-applied at checkout.

The final implementation pass should reconcile metadata and docs. `apps/web/features/marketing/lib/home-page-structured-data.ts` and `apps/web/app/opengraph-image.tsx` must reflect the same effective price story as the homepage. The smallest doc surfaces that explain the new environment variable or homepage pricing contract should be updated at the end, most likely `apps/web/content/docs/environment-variables.mdx`, `apps/web/content/docs/configure-the-homepage.mdx`, or another directly relevant pricing doc if the implementation proves it is needed. That docs pass must describe the operational contract precisely: the repo expects a Stripe promotion-code ID, the currently verified active live code string is `OGPRICE5050`, the inactive code `EARLYSHIP` must not be referenced as live truth, and test-mode parity may still require a dashboard or CLI provisioning step.

## Milestones

Milestone 1 stabilizes the pricing control plane. At the end of this milestone, `apps/web/config/product.ts` exposes one clear list price and one clear active offer-derived checkout price, and no downstream code needs to guess which number is “real.” The proof is that the pricing tests and curriculum contract tests can read those fields without hard-coded `$250` remnants. If this milestone is correct, a fresh reader should be able to open `product.ts` and immediately understand that the product is sold as `$500` with an optional Pilot Member discount.

Milestone 2 hardens the Stripe discount path. At the end of this milestone, the Checkout Session is created from a `$500` price plus a server-applied promotion code when the offer is active, and the checkout tests show the exact `discounts` payload sent to Stripe. The proof is that `apps/web/tests/checkout/stripe-line-item.test.ts` and `apps/web/tests/checkout/stripe-checkout-route.integration.test.ts` pass with the new contract and that missing `STRIPE_PROMOTION_CODE_ID` fails with a clear error instead of silently charging full price or silently omitting the offer. This milestone also resolves how test mode behaves: either matching test assets are provisioned, or the local runtime is intentionally changed so it no longer depends on the stale `$250` managed test price.

Milestone 3 reconciles the public presentation and metadata. At the end of this milestone, the top promo banner, pricing block, JSON-LD `Offer`, and Open Graph card all tell the same Pilot Member pricing story, and the tests prove there is no split-brain between public content and checkout truth. The proof is that the marketing tests pass and a local browser smoke shows the banner and struck-through price rendering as intended.

## Concrete Steps

From `/Users/parkerrex/Developer/ship-by-sunday`, first inspect the current worktree before editing further so the partial implementation is understood rather than overwritten.

    git status --short
    git diff -- apps/web/config/product.ts apps/web/platform/billing/stripe.ts apps/web/app/api/stripe/checkout/route.ts apps/web/features/marketing/content/home.ts apps/web/features/marketing/components/home-page/home-hero-top-bar.tsx apps/web/features/marketing/components/home-page/pricing-footer-sections.tsx apps/web/features/marketing/components/promo-banner.tsx

Expected observation: the branch already contains edits in all of those files, plus matching test changes.

To complete Milestone 1, update the pricing control plane and its direct dependents.

    cd /Users/parkerrex/Developer/ship-by-sunday/apps/web
    bunx oxlint --deny-warnings config/product.ts features/marketing/content/home.ts tests/course/curriculum.contract.test.ts
    bunx vitest --config vitest.config.ts run --project contracts tests/course/curriculum.contract.test.ts

Expected observation: no hard-coded `$250` assumptions remain in the control-plane contract unless they are derived from the active offer.

To complete Milestone 2, finish the Stripe auto-apply path and its environment contract.

    cd /Users/parkerrex/Developer/ship-by-sunday/apps/web
    bunx vitest --config vitest.config.ts run --project unit tests/checkout/stripe-line-item.test.ts
    bunx vitest --config vitest.config.ts run --project integration tests/checkout/stripe-checkout-route.integration.test.ts

Expected observation: the checkout route test shows `discounts: [{ promotion_code: "<id>" }]` when the offer is active, `allow_promotion_codes: false` in that case, and a clear failure when `STRIPE_PROMOTION_CODE_ID` is missing.

If local/test parity is handled through dashboard or CLI asset creation, capture that proof explicitly before treating the milestone as complete.

    zsh -lc 'source apps/web/.env.local >/dev/null 2>&1 && stripe promotion_codes list --limit 20 --api-key "$STRIPE_SECRET_KEY"'
    zsh -lc 'source apps/web/.env.local >/dev/null 2>&1 && stripe prices retrieve "$STRIPE_PRICE_ID" --api-key "$STRIPE_SECRET_KEY"'

Expected observation: either test-mode assets now reflect the intended `$500` plus `50%` off shape, or the implementation has intentionally stopped relying on the stale test managed price.

To complete Milestone 3, finish the marketing and metadata alignment.

    cd /Users/parkerrex/Developer/ship-by-sunday/apps/web
    bunx vitest --config vitest.config.ts run --project unit tests/marketing/home-page-content.test.ts tests/marketing/home-page-structured-data.test.ts tests/marketing/opengraph-image.test.tsx

If the pricing banner visuals or CTA treatment changed meaningfully, run a local browser proof afterward.

    cd /Users/parkerrex/Developer/ship-by-sunday/apps/web
    PLAYWRIGHT_USE_LOCAL_SERVER=1 bun run test:e2e -- --grep "homepage drives visitors into the buyer journey entry points|marketing and editorial pages ship the public metadata contract"

Expected observation: the homepage still renders the CTA and schema path successfully, and the top-of-page banner plus struck-through pricing stack are visible in the local browser or Playwright screenshots.

After the narrow checks pass, run the required repo quality gates from the repository root.

    bun run format
    bun lint
    bun run typecheck

Expected observation: all three commands pass without widening the diff beyond the pricing-offer slice.

## Validation and Acceptance

Acceptance is behavior-first. A visitor to the homepage should see one top promo banner advertising Pilot Member pricing, one pricing section that shows `$500` with a strike-through and `$250` as the current payable amount, and supporting text that makes clear the discount is auto-applied at checkout. A checkout request should create a Stripe Checkout Session that starts from the regular `$500` price and applies the existing Stripe promotion code automatically, without requiring the buyer to type a coupon. The JSON-LD `Offer` and Open Graph card should not contradict the currently payable amount. The repo should also fail loudly if the active offer is enabled but `STRIPE_PROMOTION_CODE_ID` is missing. No acceptance criterion should require the UI to print an incorrect or inactive coupon string such as `EARLYSHIP`.

The final operational confirmation is narrower now. Live Stripe has already been verified from the CLI: the active reusable `50%` code is `OGPRICE5050`, and the inactive `EARLYSHIP` code should not be used as live truth. This implementation took the repo-owned parity path: the tracked env contract now tells local builders to leave `STRIPE_PRICE_ID` unset until matching test assets exist, which removes the stale `$250` managed-price dependency. A fully live-like local checkout still requires a test promotion code and `STRIPE_PROMOTION_CODE_ID`.

### Test Commands

    cd /Users/parkerrex/Developer/ship-by-sunday/apps/web
    bunx vitest --config vitest.config.ts run --project contracts tests/course/curriculum.contract.test.ts
    bunx vitest --config vitest.config.ts run --project unit tests/checkout/stripe-line-item.test.ts tests/marketing/home-page-content.test.ts tests/marketing/home-page-structured-data.test.ts tests/marketing/opengraph-image.test.tsx
    bunx vitest --config vitest.config.ts run --project integration tests/checkout/stripe-checkout-route.integration.test.ts
    zsh -lc 'source apps/web/.env.production >/dev/null 2>&1 && stripe promotion_codes list --limit 20 --api-key "$STRIPE_SECRET_KEY"'
    zsh -lc 'source apps/web/.env.production >/dev/null 2>&1 && stripe prices retrieve "$STRIPE_PRICE_ID" --api-key "$STRIPE_SECRET_KEY"'
    cd /Users/parkerrex/Developer/ship-by-sunday/apps/web
    PLAYWRIGHT_USE_LOCAL_SERVER=1 bun run test:e2e -- --grep "homepage drives visitors into the buyer journey entry points|marketing and editorial pages ship the public metadata contract"
    bun run format
    bun lint
    bun run typecheck

## Idempotence and Recovery

This slice should stay additive and safe to rerun. Re-running the tests or the checkout route after a failed edit should not mutate durable state because the integration tests mock Stripe, Clerk, and app URL boundaries. If the implementation gets stuck midway, revert only the pricing-offer files touched by this plan and keep the rest of the branch intact. If Checkout fails because the offer is active but `STRIPE_PROMOTION_CODE_ID` is missing, do not paper over it by falling back to full-price checkout. Leave the failure explicit, set the environment variable correctly, and rerun the focused checkout tests. If local checkout still points at the stale `$250` test managed price, either provision matching test assets or remove that dependency explicitly before claiming the slice is done. If an operator later wants the public-facing code name to change from `OGPRICE5050` to something more product-shaped, that should be corrected in Stripe dashboard state or in product copy, not by pretending the inactive `EARLYSHIP` code is current truth. If a browser smoke fails while the unit and integration pricing tests are green, inspect the rendered homepage components first before touching Stripe logic again; that usually indicates a presentation or metadata mismatch rather than a checkout-contract failure.

## Artifacts and Notes

Current branch evidence already points at the intended implementation direction:

    apps/web/config/product.ts
      pricing.basePriceUsdCents: 50000
      pricing.activeOffer.percentOff: 50

    apps/web/platform/billing/stripe.ts
      throw new Error("Missing STRIPE_PROMOTION_CODE_ID. The active pricing offer requires an auto-applied Stripe promotion code.")

    apps/web/app/api/stripe/checkout/route.ts
      allow_promotion_codes: checkoutDiscounts ? false : true
      ...(checkoutDiscounts ? { discounts: checkoutDiscounts } : {})

That evidence means the plan should finish and validate the partial implementation rather than replacing it with a separate pricing architecture.

Verified Stripe account evidence from this session:

    Live promotion codes:
      active 50% code: OGPRICE5050
      promotion_code.id: promo_1RpCneCgIdJ1QglPK7WywWrV
      coupon.id: rAscfQsS

      inactive 50% code: EARLYSHIP
      promotion_code.id: promo_1THWHGCgIdJ1QglPN4hYBlOT
      coupon.id: BS9LC1gT

    Live managed price:
      price_1T9EvvCgIdJ1QglPnfbBpPQI = 50000 cents

    Test managed price:
      price_1TKPZ2ELhKLJkXlWRwr8TyrE = 25000 cents

    Test coupons and promotion codes:
      none present

Finished validation evidence from this session:

    apps/web focused tests
      18 unit tests passed across checkout + marketing surfaces
      4 integration tests passed for /api/stripe/checkout
      4 contract tests passed for the curriculum/homepage contract

    apps/web browser smoke
      2 Playwright specs passed with PLAYWRIGHT_USE_LOCAL_SERVER=1
      homepage drives visitors into the buyer journey entry points
      marketing and editorial pages ship the public metadata contract

    repo quality gates
      bun run format
      bun lint
      bun run typecheck
      all passed on 2026-04-17

That evidence means the remaining high-impact risk is no longer “what is the live code?” It is limited to the operator step of creating matching test Stripe promotion-code assets when full local checkout parity is needed.

## Interfaces and Dependencies

The key interface is `productConfig` in `apps/web/config/product.ts`. It must continue to provide stable fields for the product name, promise, currency, list price, checkout price, and active offer details because the homepage, metadata, Open Graph card, and tests all depend on it. The pricing-offer contract should remain small and explicit so downstream code does not need to know how percentages are calculated.

`apps/web/platform/billing/stripe.ts` is the Stripe boundary. It depends on `Stripe` from the official Stripe SDK, the normalized server environment from `apps/web/platform/env/server.ts`, and the product contract from `apps/web/config/product.ts`. The required environment dependency for this plan is `STRIPE_PROMOTION_CODE_ID`, which is documented in both `apps/web/.env.local.example` and `apps/web/content/docs/environment-variables.mdx` as the Stripe promotion-code ID rather than the customer-facing code string. For the currently verified live account, that ID is `promo_1RpCneCgIdJ1QglPK7WywWrV`, which corresponds to public code `OGPRICE5050`. `apps/web/app/api/stripe/checkout/route.ts` depends on that helper to create a truthful Checkout Session. The homepage rendering path depends on `apps/web/features/marketing/content/home.ts`, `apps/web/features/marketing/components/promo-banner.tsx`, `apps/web/features/marketing/components/home-page/home-hero-top-bar.tsx`, and `apps/web/features/marketing/components/home-page/pricing-footer-sections.tsx`, while schema and social surfaces depend on `apps/web/features/marketing/lib/home-page-structured-data.ts` and `apps/web/app/opengraph-image.tsx`. The additional operational dependency for this plan is Stripe asset parity between `apps/web/.env.local` and `apps/web/.env.production`, because the current test-mode managed price and promotion-code inventory do not match live mode. The repo now handles that safely by documenting that local builders should leave `STRIPE_PRICE_ID` unset until matching test assets exist.
