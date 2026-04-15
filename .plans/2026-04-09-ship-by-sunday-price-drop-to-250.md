---
summary: Reduce the public Ship by Sunday price from $500 to $250 in this branch without leaving checkout, metadata, social previews, scripts, or tests charging or advertising the old amount. Preserve the existing blueprint-first positioning and the current dirty worktree while making the lower price truthful everywhere a buyer can see or pay it.
read_when: Open this when implementing the approved $250 Ship by Sunday price change on the current feature branch and you need the full repository map, Stripe caveats, and validation steps in one place.
plan_status: done
---

# Ship By Sunday Price Drop To 250

This document is a living execution plan. Update it as soon as implementation starts, whenever a decision changes, and at every stopping point so another agent can resume from this file alone.

This ExecPlan must be maintained in accordance with `.plans/PLANS.md`.

## Purpose / Big Picture

The user has already made the pricing decision for this branch: Ship by Sunday should sell for $250 instead of $500. After this change, a signed-out visitor should see `$250` consistently on the homepage pricing section, the Open Graph preview image, and any structured product metadata that exposes price. A checkout session created without an environment-managed Stripe price should also charge 250 USD, not 500 USD. The change matters because a partial price drop is worse than no price drop: it creates trust breaks when the homepage says one number and checkout or metadata says another. The change is working when the public marketing shell, the Stripe line item fallback, the local Stripe helper script, and the relevant tests all agree on `$250`.

## Progress

- [x] 2026-04-09 16:20 EDT — Read `.plans/PLANS.md`, `apps/web/AGENTS.md`, `DESIGN.md`, `.docs/scripts.md`, the homepage configuration docs, the pricing-related source files, and the relevant tests.
- [x] 2026-04-09 16:20 EDT — Confirmed the current branch is `feat/landing-page-video` and the working tree is already dirty, including existing edits to `apps/web/features/marketing/content/home.ts`; this plan assumes those unrelated edits must be preserved.
- [x] 2026-04-09 16:20 EDT — Confirmed that `apps/web/platform/billing/stripe.ts` prefers `STRIPE_PRICE_ID` over the inline `productConfig.priceUsdCents`, which means a code-only price change is not enough if the environment still points at an old Stripe price.
- [x] 2026-04-09 16:24 EDT — Verified that the local environment is configured with managed Stripe product and price identifiers, so the branch billing path is the managed-price path, not the inline fallback path.
- [x] 2026-04-09 16:24 EDT — Ran `bun run stripe:dev:doctor`; Stripe account, CLI project, Convex target, and secret parity all passed, and the only failure was `localhost:3000 unreachable` because the web app was not running during the doctor check.
- [x] 2026-04-09 16:49 EDT — Updated the canonical price in `apps/web/config/product.ts`, updated the fresh-setup Stripe helper in `apps/web/scripts/create-stripe-product.mjs`, and changed the checkout route test fixtures from `50000` to `25000`.
- [x] 2026-04-09 16:49 EDT — Added direct billing-helper coverage in `apps/web/tests/unit/stripe-line-item.test.ts` so the real `getStripeLineItem()` branching logic is now tested.
- [x] 2026-04-09 16:52 EDT — Created a new Stripe test-mode price `price_1TKPZ2ELhKLJkXlWRwr8TyrE` for the existing product `prod_U7g2FeAWP7zVcH`, promoted it to the product default, and updated both local `.env.local` files so `STRIPE_PRICE_ID` points at the new `$250` price.
- [x] 2026-04-09 16:53 EDT — Passed the narrow pricing-focused Vitest slices: unit (`stripe-line-item`, `home-page-content`, `home-page-structured-data`), contracts (`curriculum-contract`), and integration (`stripe-checkout-route`).
- [x] 2026-04-09 16:58 EDT — Passed the repo-required quality gates: `bun run format`, `bun run lint`, and `bun run typecheck`.
- [x] 2026-04-09 17:00 EDT — Completed a real signed-in Stripe Checkout flow against `http://localhost:3000`, confirmed the hosted checkout displayed `$250.00`, completed payment with the Stripe test card, and passed `bun run stripe:dev:verify` on the resulting session `cs_test_b1ss3D7c0rBdp0ovHEGqDHMq7SPTAs4HPhVwDTVkOFmPlZexF7kkvyuaVw`.
- [x] 2026-04-09 17:58 EDT — Added a runtime managed-price guard in `apps/web/platform/billing/stripe.ts` and `apps/web/app/api/stripe/checkout/route.ts` so checkout now fails before session creation if `STRIPE_PRICE_ID` drifts from the canonical `$250` config or the expected product.
- [x] 2026-04-09 17:58 EDT — Strengthened the automated proof: the checkout route integration test now asserts the actual line item and the new guard-failure case; the structured-data test now asserts the numeric offer price; and `apps/web/tests/unit/opengraph-image.test.tsx` now proves the OG image payload includes the canonical `priceDisplay`.
- [x] 2026-04-09 18:00 EDT — Re-ran the focused unit and integration slices plus the repo-required quality gates after the guard/test hardening, then created a fresh guest checkout session through the guarded local API and confirmed it still resolves to the `$250` managed price.
- [x] 2026-04-09 18:00 EDT — Recorded the final outcome, runtime evidence, and validation notes in this ExecPlan.

## Surprises & Discoveries

The most important discovery is architectural, not editorial: `apps/web/platform/billing/stripe.ts` does not always use `productConfig.priceUsdCents`. The function `getStripeLineItem()` returns `serverEnv.STRIPE_PRICE_ID` when that environment variable exists, and only falls back to the inline `price_data.unit_amount` path when no managed price ID is configured. That means the homepage can truthfully advertise `$250` while checkout still charges `$500` unless the implementer either updates the configured Stripe price ID or deliberately tests the fallback path.

This repository does have a working local Stripe CLI path. `bun run stripe:dev:doctor` passed the Stripe account check, the pinned Stripe CLI project check, the Convex dev deployment target, the webhook secret parity, and the Stripe secret-key parity. The only failure was `localhost:3000 unreachable`, which is expected when the web app is not running. A novice implementer should read that result as “Stripe is available; start the app before using the doctor or verify commands that need the web server.”

The branch is already dirty. `git status --short` shows both staged and unstaged changes outside this pricing task, including an existing modification to `apps/web/features/marketing/content/home.ts`. The implementer must layer the price-drop work on top of those changes and must not revert them while making the pricing slice.

The repository also contains a one-off Stripe helper in `apps/web/scripts/create-stripe-product.mjs` with a hardcoded `unit_amount: 50000`. If this script is left untouched, a future developer can accidentally recreate the product at the old amount even after the app advertises `$250`.

The current checkout route integration test does not prove the billing helper changed. `apps/web/tests/integration/stripe-checkout-route.test.ts` mocks `getStripeLineItem()` entirely and hardcodes the mocked `unit_amount` in the test fixture. That test is still useful for the route contract, but it cannot be the only proof that the underlying Stripe line-item amount now resolves to `$250`.

When querying Stripe from the CLI, using `--project-name ship-by-sunday` alone was not enough to guarantee the same account context as the app secret. The product retrieve call only reflected the newly promoted default price consistently once the commands were forced through `--api-key "$STRIPE_SECRET_KEY"`. For this repo, the safe verification rule is to pair the pinned project name with the app secret key whenever product or price state matters.

The review pass surfaced that the original implementation still trusted `STRIPE_PRICE_ID` too much at runtime. The fix was not only better tests; it was a real checkout guard. The local checkout route now validates the configured managed price against the canonical repo price and, when `STRIPE_PRODUCT_ID` is present, against the expected product id too. That means a stale env price id now fails the checkout request instead of silently charging the wrong amount.

## Decision Log

Decision: Treat the scope as a truthful price-drop implementation, not a full offer repositioning or homepage redesign.
Rationale: The user explicitly approved the lower price on this branch and asked for the execution plan now. The implementation must make the current offer truthful at `$250`, but it should not silently widen into a broader messaging overhaul.
Date/Author: 2026-04-09 / Codex

Decision: Preserve the existing blueprint-first positioning and visual system while changing the price.
Rationale: `apps/web/AGENTS.md` and `DESIGN.md` both make the homepage contract clear. This slice should not reframe the product as course-first, done-for-you, or generic starter-ware just because the price moved.
Date/Author: 2026-04-09 / Codex

Decision: Include Stripe environment follow-up inside the plan instead of treating checkout as automatically solved by `config/product.ts`.
Rationale: The code path in `apps/web/platform/billing/stripe.ts` proves that environment-managed Stripe prices can override the inline amount. Leaving that implicit would produce a plan that compiles but does not produce demonstrably correct buyer behavior.
Date/Author: 2026-04-09 / Codex

Decision: Protect unrelated branch edits explicitly.
Rationale: The branch already contains non-pricing work. A novice following this plan needs to understand that the safe path is to make a narrow additive change without cleaning or resetting the worktree.
Date/Author: 2026-04-09 / Codex

Decision: Keep the existing Stripe product id stable and create a new `$250` price under that product instead of rotating to a brand-new product.
Rationale: `apps/web/platform/billing/stripe.ts` and the observability helpers still expose `STRIPE_PRODUCT_ID` as the product anchor. Creating a new product through `apps/web/scripts/create-stripe-product.mjs` is acceptable for a brand-new setup, but it is the wrong migration path for this branch because it forces product-id churn when the actual change is only the price.
Date/Author: 2026-04-09 / Codex

Decision: Add direct test coverage for `getStripeLineItem()` instead of relying only on route tests that mock it away.
Rationale: The route-level integration test protects the checkout request contract, but it does not exercise the real branching logic in `apps/web/platform/billing/stripe.ts`. A direct unit test is the smallest reliable proof that the fallback path now uses `25000` and the managed-price path still returns the configured `price_...` id.
Date/Author: 2026-04-09 / Codex

Decision: Fail checkout early when the managed Stripe price drifts from the canonical product config.
Rationale: Test coverage alone does not stop a stale deployed or local `STRIPE_PRICE_ID` from charging the wrong amount. A runtime guard in the checkout route turns env drift into an explicit error instead of silent misbilling.
Date/Author: 2026-04-09 / Codex

## Outcomes & Retrospective

The branch now advertises and charges `$250` through both the canonical config path and the managed Stripe price path. The tracked code changes stayed focused on the billing slice: `apps/web/config/product.ts`, `apps/web/platform/billing/stripe.ts`, `apps/web/app/api/stripe/checkout/route.ts`, `apps/web/scripts/create-stripe-product.mjs`, `apps/web/tests/integration/stripe-checkout-route.test.ts`, `apps/web/tests/unit/stripe-line-item.test.ts`, `apps/web/tests/unit/home-page-structured-data.test.ts`, and `apps/web/tests/unit/opengraph-image.test.tsx`. The homepage copy file did not require price-specific edits because it already derives `priceDisplay` from `productConfig`.

The managed Stripe product remained `prod_U7g2FeAWP7zVcH`. A new test-mode price `price_1TKPZ2ELhKLJkXlWRwr8TyrE` was created on that existing product, promoted to the product default, and written into both local `.env.local` files as the new `STRIPE_PRICE_ID`. This keeps the product anchor stable while making the runtime checkout path truthful.

Validation was stronger than the original minimum plan. In addition to the focused unit, contract, and integration tests plus `bun run format`, `bun run lint`, and `bun run typecheck`, the checkout route now has an automated guard-failure test, the structured-data test asserts the numeric offer price, and the OG image route has a direct unit test that inspects the rendered `ImageResponse` payload for `productConfig.priceDisplay`. A real signed-in browser checkout was completed against the local app. The hosted Stripe page visibly showed `$250.00`, the Stripe API showed `amount_total: 25000` and the new managed price id on the session line item, and `bun run stripe:dev:verify` passed for that same session, proving the webhook-created access grant still works on the updated price path. After the hardening pass, a fresh guest session created through `POST /api/stripe/checkout` also resolved to the same `$250` managed price id, which proves the guarded route still creates sessions normally when env and Stripe state are aligned.

One caveat remains outside tracked source control: the new `STRIPE_PRICE_ID` lives in the local environment files, not in committed source. Anyone else pulling this branch will need the same env update or an equivalent Stripe price id in their own test environment. The runtime guard reduces the risk of silent drift, but it will surface as an intentional checkout failure until the environment is updated.

## Context and Orientation

The pricing source of truth starts in `apps/web/config/product.ts`. The object `starterConfig.pricing` defines `priceUsdCents`, `priceDisplay`, and `currency`, and `productConfig` re-exports those values for the rest of the app. Every downstream marketing surface reads from `productConfig`, so changing the canonical amount here is necessary but not sufficient.

The homepage copy lives in `apps/web/features/marketing/content/home.ts`. The pricing section reads `productConfig.priceDisplay`, which means the number itself will move automatically once the config changes, but the surrounding explanatory copy is still hand-authored. Read the current file state before editing because the branch already has in-flight changes there. This is also the file that carries the guarantee copy and the offer framing, so any awkward reference that becomes untruthful at `$250` must be adjusted in place rather than overwritten wholesale.

The homepage behavior layer lives in `apps/web/features/marketing/lib/home-page-render-model.ts`, and the machine-readable schema lives in `apps/web/features/marketing/lib/home-page-structured-data.ts`. The structured-data file emits a Schema.org `Offer` whose `price` field is computed from `productConfig.priceUsdCents / 100`. A novice implementer should understand that search and social consumers can still see stale price data even if the visible page looks correct, so this file is part of the price-drop contract.

The social preview image is generated in `apps/web/app/opengraph-image.tsx`. It currently renders `productConfig.priceDisplay` inside the image text. If the config changes, the numeric string changes automatically, but this file still matters because it is a user-visible public surface that should be sanity-checked after the edit.

The checkout amount is assembled in `apps/web/platform/billing/stripe.ts`. The function `getStripeLineItem()` returns one of two shapes. If `STRIPE_PRICE_ID` exists in the environment, checkout uses that managed Stripe price and ignores the inline amount entirely. If `STRIPE_PRICE_ID` is absent, checkout uses `productConfig.priceUsdCents` as `price_data.unit_amount`. This is the single most important integration boundary in the plan.

The developer helper `apps/web/scripts/create-stripe-product.mjs` is a secondary but still important dependency. It hardcodes the current amount in cents when creating a Stripe product. Leaving it stale would recreate the old price for anyone following the local billing workflow later.

The homepage contract and safe edit order are documented in `apps/web/content/docs/configure-the-homepage.mdx`. Use that page as the local repository map for homepage work. It names the exact files and tests that must stay aligned when the public shell changes.

The tests that directly protect this slice are spread across a few surfaces. `apps/web/tests/unit/home-page-content.test.ts`, `apps/web/tests/unit/home-page-render-model.test.ts`, and `apps/web/tests/unit/home-page-structured-data.test.ts` protect marketing and metadata. `apps/web/tests/contracts/curriculum-contract.test.ts` asserts that public marketing content stays aligned with `productConfig.priceDisplay`. `apps/web/tests/integration/stripe-checkout-route.test.ts` protects the checkout route, but it currently mocks `getStripeLineItem()` and hardcodes `50000` in the fixture, so it cannot be the only proof. This plan therefore requires either a new direct unit test such as `apps/web/tests/unit/stripe-line-item.test.ts` or an equivalent extension to the existing Stripe helper tests so the billing module itself is exercised. Depending on whether the implementation also updates copy, `apps/web/tests/integration-ui/home-page-primary-cta.test.tsx` and `apps/web/tests/browser-smoke/app-smoke.spec.ts` are good follow-up reads, though they do not currently pin the numeric price.

The repository-wide validation contract lives in the root `AGENTS.md` and `.docs/scripts.md`. Even though this is a focused price change, done still means the relevant narrow tests pass first, then the broader commands `bun run format`, `bun run lint`, and `bun run typecheck` pass before the work is considered complete.

## Plan of Work

Start by freezing the scope in your head: this plan changes the canonical Ship by Sunday price to `$250` on the current branch and makes every directly affected surface truthful. Do not redesign the homepage and do not “clean up” unrelated branch work. Read the current contents of `apps/web/config/product.ts`, `apps/web/features/marketing/content/home.ts`, `apps/web/app/opengraph-image.tsx`, `apps/web/platform/billing/stripe.ts`, and `apps/web/scripts/create-stripe-product.mjs` before editing so you can layer the price work on top of the current branch state.

Make the canonical price change first in `apps/web/config/product.ts`, setting `priceUsdCents` to `25000` and `priceDisplay` to `$250`. Then audit every file that either hardcodes the old cents value or speaks about the offer in a way that could contradict the lower amount. At minimum, update the hardcoded Stripe helper, add or extend a direct unit test for `getStripeLineItem()`, and update the pricing-related tests that still assert `50000`. Only touch homepage copy where it is necessary to keep the new price credible and internally consistent; avoid opportunistic copy churn.

After the code and tests are updated, handle the Stripe integration boundary explicitly. This branch already uses `STRIPE_PRICE_ID`, so the implementation should assume that the existing Stripe product stays the same while a new `$250` price is created under that product and promoted to the product default. Start the web app in a separate terminal or background session, rerun the Stripe doctor if needed, and document exactly which product id and price id were used. If you cannot change the environment-managed price during implementation, record that limitation in this plan and prove at least the fallback code path with the direct billing-helper unit test. The plan is not complete until the reader knows whether checkout was actually verified end to end or only by test doubles.

Finish by running the narrow pricing tests, then the formatting, lint, and typecheck gates, and finally any broader validation you needed because of checkout behavior. Record results and limitations in the living sections before stopping.

## Milestones

The first milestone is repository alignment. At the end of this milestone, the canonical product config, the public marketing shell, the Open Graph image, and the local Stripe helper all point at `$250` instead of `$500`, and there are no obvious stale hardcoded price values left in the app slice. Run targeted source searches and the homepage-focused unit tests to prove the visible and machine-readable public surfaces now describe the new amount.

The second milestone is checkout truthfulness. At the end of this milestone, the implementation either proves that the branch checkout path charges `$250` through the managed Stripe price path or records a precise blocker that prevents that proof. Success here is not “the code changed”; success is knowing whether the configured `STRIPE_PRICE_ID` now points at a new `$250` price on the existing product and, if it did not, either fixing that or documenting the exact manual follow-up.

The third milestone is regression protection. At the end of this milestone, the relevant tests and required broader gates pass, and the plan contains the final record of what shipped, what was intentionally not changed, and what future contributors should know if they revisit pricing on this branch.

## Concrete Steps

Work from the repository root at `/Users/parkerrex/Developer/ship-by-sunday`.

Begin with a fresh audit so you do not miss stale `$500` references:

    pwd
    git status --short
    rg -n --hidden -S "50000|\\$500|priceDisplay|priceUsdCents" apps/web packages

You should expect to see the canonical config in `apps/web/config/product.ts`, the Stripe helper script in `apps/web/scripts/create-stripe-product.mjs`, the checkout integration test in `apps/web/tests/integration/stripe-checkout-route.test.ts`, and any marketing or metadata surfaces that still derive from `productConfig`.

Edit the canonical config first in `apps/web/config/product.ts`. Set `starterConfig.pricing.priceUsdCents` to `25000` and `starterConfig.pricing.priceDisplay` to `$250`. Do not change `currency` unless the user explicitly asks for a currency change.

Read `apps/web/features/marketing/content/home.ts` in its current branch state before editing. Because this branch already carries edits there, apply only the minimum necessary changes. If the file already derives the number from `productConfig.priceDisplay`, do not rewrite surrounding sections just for style. Only adjust hand-authored price-adjacent copy if it would otherwise mislead a buyer after the price drop.

Update the public machine-readable and asset surfaces by re-reading, then validating, `apps/web/features/marketing/lib/home-page-structured-data.ts` and `apps/web/app/opengraph-image.tsx`. These files already derive from `productConfig`, so they may not need logic changes. The important step is to confirm they remain truthful after the config update.

Update `apps/web/scripts/create-stripe-product.mjs` so `default_price_data.unit_amount` is `25000`. This script is for fresh setups, not the preferred migration path for the existing branch product. If the description string in that file has drifted away from the current homepage promise, leave it alone unless it becomes false; this plan is about price truthfulness, not marketing polish.

Update the tests that still encode the old amount. The minimum likely set is:

    apps/web/tests/integration/stripe-checkout-route.test.ts
    apps/web/tests/contracts/curriculum-contract.test.ts
    apps/web/tests/unit/home-page-content.test.ts
    apps/web/tests/unit/home-page-structured-data.test.ts
    apps/web/tests/unit/stripe-line-item.test.ts (new) or equivalent direct coverage in an existing Stripe helper test

If the branch state has already changed `home.ts`, expect `apps/web/tests/unit/home-page-content.test.ts` to need broader fixture updates than price alone. Keep those edits scoped to aligning the test with the current intended homepage content; do not use the pricing task as a reason to rewrite unrelated test expectations.

Audit the Stripe integration path before claiming checkout is solved:

    rg -n "STRIPE_PRICE_ID" apps/web

Then inspect `apps/web/platform/billing/stripe.ts` and your local environment setup. In this branch, `STRIPE_PRICE_ID` is already in use, so you should expect to create a new `$250` Stripe price for the existing `STRIPE_PRODUCT_ID`, set that new price as the product default, and then repoint `STRIPE_PRICE_ID` to the new price id.

Load the local env first:

    set -a
    source apps/web/.env.local
    set +a

Confirm the current product and default price before changing anything:

    stripe --project-name ship-by-sunday products retrieve "$STRIPE_PRODUCT_ID"

The expected observation is JSON showing the current `id` as your existing product and `default_price` as the old `price_...` value.

Create the new `$250` price on that same product:

    stripe --project-name ship-by-sunday prices create --product "$STRIPE_PRODUCT_ID" --currency usd --unit-amount 25000 --nickname "Ship by Sunday $250" --confirm

Observe the returned JSON and copy the new `price_...` id. Then make that new price the default price for the existing product:

    stripe --project-name ship-by-sunday products update "$STRIPE_PRODUCT_ID" --default-price price_... --confirm

After that, update `apps/web/.env.local` so `STRIPE_PRICE_ID` points at the new `price_...` value and leave `STRIPE_PRODUCT_ID` unchanged.

Do not use `bun run stripe:create-product` as the migration command for this branch, because it creates a brand-new product. Use it only as the fresh-setup helper after its hardcoded amount has been updated to `25000`.

If running that script is not appropriate for this branch or environment, record the exact reason in `Surprises & Discoveries` and `Outcomes & Retrospective`.

Run narrow tests first:

    bun run --cwd apps/web test:unit -- tests/unit/home-page-content.test.ts tests/unit/home-page-structured-data.test.ts
    bun run --cwd apps/web test:contracts -- tests/contracts/curriculum-contract.test.ts
    bun run --cwd apps/web test:integration:node -- tests/integration/stripe-checkout-route.test.ts
    bun run --cwd apps/web test:unit -- tests/unit/stripe-line-item.test.ts

If the script wrappers do not forward file arguments cleanly in your shell, call Vitest directly from `apps/web`:

    cd apps/web
    bunx vitest run --project unit tests/unit/home-page-content.test.ts tests/unit/home-page-structured-data.test.ts
    bunx vitest run --project unit tests/unit/stripe-line-item.test.ts
    bunx vitest run --project contracts tests/contracts/curriculum-contract.test.ts
    bunx vitest run --project integration tests/integration/stripe-checkout-route.test.ts

After the narrow tests pass, run the required broader gates from the repository root:

    bun run format
    bun run lint
    bun run typecheck

If the checkout path changed in a way that deserves a fuller proof and local Stripe is configured, run:

    # Terminal A
    bun run dev:web

    # Terminal B
    bun run stripe:dev:doctor
    bun run stripe:dev:verify

`bun run stripe:dev:doctor` should pass once `localhost:3000` is up. Record exactly what these commands proved.

## Validation and Acceptance

Acceptance is behavioral. A human should be able to inspect the homepage and public metadata and see `$250`, not `$500`. A test-created Stripe checkout session that uses the fallback `price_data` path should use `25000` cents. A future developer running the local Stripe product helper should create a `$250` default price, not accidentally recreate the old amount.

At a minimum, the following must pass before this plan can be marked done:

    bunx vitest run --config apps/web/vitest.config.ts --project unit apps/web/tests/unit/home-page-content.test.ts apps/web/tests/unit/home-page-structured-data.test.ts
    bunx vitest run --config apps/web/vitest.config.ts --project unit apps/web/tests/unit/stripe-line-item.test.ts
    bunx vitest run --config apps/web/vitest.config.ts --project contracts apps/web/tests/contracts/curriculum-contract.test.ts
    bunx vitest run --config apps/web/vitest.config.ts --project integration apps/web/tests/integration/stripe-checkout-route.test.ts
    bun run format
    bun run lint
    bun run typecheck

If homepage copy changed materially beyond the number swap, also run:

    bunx vitest run --config apps/web/vitest.config.ts --project unit apps/web/tests/unit/home-page-render-model.test.ts

If you changed checkout configuration or need stronger confidence in the real payment flow and the environment is ready, run `bun run stripe:dev:verify` and save the result in this plan. If you cannot run it, write down why and do not claim end-to-end checkout verification. The direct billing-helper unit test is required either way; the route integration test alone is not enough because it mocks `getStripeLineItem()`.

The work is only complete when both of these statements are true: every relevant visible or machine-readable price surface in the repo now points at `$250`, and the plan explicitly states whether the real Stripe environment-managed price was updated or remains manual follow-up.

## Idempotence and Recovery

These edits are safe to rerun because they are mostly declarative text and constant updates. If a test fails halfway through, stop and read the current file before retrying so you do not overwrite unrelated branch work. Because the branch is already dirty, do not use destructive git commands to recover. Instead, inspect the current diff with `git diff -- apps/web/config/product.ts` or the specific file you were editing and make the minimum corrective patch.

If you create a new Stripe product or price during testing and then decide not to use it, do not delete production or shared resources impulsively. Record the unused IDs in this plan and leave environment changes out until you know which price should back the branch. If a local environment variable still points at the old Stripe price, changing code alone will not fix checkout; the correct recovery is to update the environment-managed `STRIPE_PRICE_ID` or temporarily unset it while verifying the fallback path.

Because the repository contract still requires `bun run format`, run formatting last and inspect the diff immediately afterwards. If formatting touches files that were clean before this task and are unrelated to pricing, revert only those formatter-only changes. Do not revert or rewrite files that were already dirty before this task, because those edits belong to the branch author.

If the existing edits in `apps/web/features/marketing/content/home.ts` conflict with the pricing change, preserve the branch author’s changes and reapply the price edits after rereading the file. This task must adapt to the current branch state, not reset it.

## Artifacts and Notes

Use short transcripts here as you work. Replace these placeholders with real evidence.

Observed pricing search after implementation:

    $ rg -n --hidden -S "50000|\\$500" apps/web
    no matches

Observed Stripe CLI observations for the preferred migration path:

    $ stripe --project-name ship-by-sunday products retrieve "$STRIPE_PRODUCT_ID"
    {
      "id": "prod_U7g2FeAWP7zVcH",
      "default_price": "price_1TKPZ2ELhKLJkXlWRwr8TyrE",
      ...
    }

    $ stripe --project-name ship-by-sunday prices create --product "$STRIPE_PRODUCT_ID" --currency usd --unit-amount 25000 --nickname "Ship by Sunday $250" --confirm
    {
      "id": "price_1TKPZ2ELhKLJkXlWRwr8TyrE",
      "product": "prod_U7g2FeAWP7zVcH",
      "unit_amount": 25000,
      ...
    }

    $ stripe --project-name ship-by-sunday products update "$STRIPE_PRODUCT_ID" --default-price price_1TKPZ2ELhKLJkXlWRwr8TyrE --confirm
    {
      "id": "prod_U7g2FeAWP7zVcH",
      "default_price": "price_1TKPZ2ELhKLJkXlWRwr8TyrE",
      ...
    }

Observed Stripe doctor output before the web app was started:

    Stripe dev doctor
    - PASS Stripe account: ...
    - PASS Stripe CLI project ship-by-sunday: ...
    - PASS Convex dev deployment target: ...
    - PASS webhook and secret parity checks
    - FAIL Web app: localhost:3000 unreachable
    Summary: FAIL (1)

Observed Stripe doctor output with the local stack running:

    Stripe dev doctor
    - PASS Stripe account: Glaucous Swing (acct_1T9QdGELhKLJkXlW)
    - PASS Stripe CLI project ship-by-sunday: Glaucous Swing (acct_1T9QdGELhKLJkXlW)
    - PASS Convex dev deployment target: dev:fast-echidna-802
    - PASS .env.local webhook secret: whsec_...
    - PASS Convex webhook secret: whsec_...
    - PASS Convex Stripe secret key: present
    - PASS Webhook secret parity: matched
    - PASS Stripe secret key parity: matched
    - PASS Web app: localhost:3000 reachable
    - PASS Convex HTTP endpoint: https://fast-echidna-802.convex.site reachable
    Summary: PASS

Observed checkout integration proof:

    ✓ POST /api/stripe/checkout creates a guest checkout session when the viewer is signed out
    ✓ POST /api/stripe/checkout creates a checkout session with the buyer/access handoff metadata
    ✓ POST /api/stripe/checkout returns a server error when Stripe does not return a checkout URL

Observed direct billing-helper proof:

    ✓ getStripeLineItem returns the managed price id when STRIPE_PRICE_ID is set
    ✓ getStripeLineItem returns inline price_data with unit_amount 25000 when STRIPE_PRICE_ID is absent
    ✓ assertManagedStripePriceMatchesProductConfig rejects an amount mismatch
    ✓ assertManagedStripePriceMatchesProductConfig rejects a product mismatch

Observed metadata / social preview proof:

    ✓ home page structured data exposes Product offers.price = "250"
    ✓ opengraph image payload includes productConfig.priceDisplay

Observed real runtime checkout proof:

    Hosted checkout page displayed:
    - Pay Glaucous Swing
    - $250.00
    - Total due $250.00

    Stripe checkout session retrieve:
    - amount_total: 25000
    - client_reference_id: user_3AtgzqnuTh6Qiour5QwH3Qu2cVD
    - customer_email: test@test.com

    Stripe checkout session line items:
    - price.id: price_1TKPZ2ELhKLJkXlWRwr8TyrE
    - price.unit_amount: 25000

Observed end-to-end verify proof:

    Checkout session: cs_test_b1ss3D7c0rBdp0ovHEGqDHMq7SPTAs4HPhVwDTVkOFmPlZexF7kkvyuaVw
    - PASS Stripe session complete: status=complete, payment_status=paid
    - PASS Metadata present: clerkUserId=user_3AtgzqnuTh6Qiour5QwH3Qu2cVD, courseSlug=ship-by-sunday
    - PASS Convex product access found: status=granted
    - PASS Convex product access granted: status=granted
    - PASS Product access source: source=stripe_webhook
    - PASS Session id linked: cs_test_b1ss3D7c0rBdp0ovHEGqDHMq7SPTAs4HPhVwDTVkOFmPlZexF7kkvyuaVw

Observed guarded-route creation proof after the hardening pass:

    POST /api/stripe/checkout
    status: 200
    sessionId: cs_test_b13mh6TgKpK5L1KF0ugIf8PERsrfcRVyhDUVC35jQtLrgujFGkZk1WgcoC

    Stripe retrieve:
    - amount_total: 25000
    - payment_status: unpaid
    - status: open

    Stripe line items:
    - price.id: price_1TKPZ2ELhKLJkXlWRwr8TyrE
    - price.unit_amount: 25000
    - price.product: prod_U7g2FeAWP7zVcH

## Interfaces and Dependencies

`apps/web/config/product.ts` must continue to export `productConfig.priceUsdCents`, `productConfig.priceDisplay`, and `productConfig.currency`, because the homepage content, Open Graph image, structured data, and billing layer all depend on those names.

`apps/web/platform/billing/stripe.ts` must continue to expose `getStripeLineItem()`. The important contract is that this function either returns a managed Stripe price reference from `STRIPE_PRICE_ID` or an inline `price_data` object using `productConfig.priceUsdCents`. The implementation work in this plan must respect that dual path and document which path was actually verified.

`apps/web/features/marketing/lib/home-page-structured-data.ts` must keep emitting a truthful Schema.org `Offer` price whenever the pricing section is enabled and checkout is still the primary CTA target. If the lower price caused the team to change CTA intent later, the `Product` schema rules in this file would need revalidation, but that is outside the current scope unless the CTA target changes.

`apps/web/scripts/create-stripe-product.mjs` remains a developer-facing helper, not a runtime dependency, but it is still part of the interface surface for fresh local billing setups. Keeping it aligned with the canonical price prevents future drift, but this script should not be used as the migration path for an existing product whose `STRIPE_PRODUCT_ID` must stay stable.

The tests in `apps/web/tests/unit/home-page-content.test.ts`, `apps/web/tests/unit/home-page-structured-data.test.ts`, `apps/web/tests/contracts/curriculum-contract.test.ts`, the new direct `getStripeLineItem()` unit test, and `apps/web/tests/integration/stripe-checkout-route.test.ts` are required dependencies of this plan. The route integration test protects the session-creation contract, while the direct billing-helper test proves that the real price-selection logic now resolves to `$250`.
