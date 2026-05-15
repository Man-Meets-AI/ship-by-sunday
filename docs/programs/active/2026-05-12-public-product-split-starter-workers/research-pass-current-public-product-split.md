---
title: "Current Public Product Split Research"
summary: "Research pass mapping the current public routes, paid app surfaces, checkout access, docs, blog, and generated-repo coupling before the Starter and Workers split."
docType: "research_pass"
status: "active"
read_when:
  - "Planning the Man Meets AI, Starter, and Workers public split."
  - "Checking why `/workers` cannot become public without route protection changes."
  - "Checking why generated repos currently risk carrying Worker local-runner code."
---

# Current Public Product Split Research

This research pass records repository facts gathered before implementation. It combines local code inspection and earlier 5.5 high subagent research passes.

## Public Site

The public root is `apps/web/app/page.tsx`. It renders the current homepage for anonymous users and redirects entitled users to `/home` unless `?marketing=1` is present.

The homepage contract is split across `apps/web/config/product.ts`, `apps/web/app/_content/home-page.ts`, `apps/web/app/_lib/home-page-render-model.ts`, `apps/web/app/_lib/home-page-structured-data.ts`, and `apps/web/app/_components/home-page/`. Current copy mixes Ship by Sunday, generated codebase, tutorial, Worker, Programs, PLANS, and checkout material into one page. The Program and Plan explanation content is likely better as blog material.

There is no `/starter` route today.

## Workers Route Conflict

Historical pre-split note: `/workers` was part of the protected paid app and lived at `apps/web/app/(workspace)/workers/page.tsx`; the current protected route group is `apps/web/app/(protected)/`, while public `/workers` lives outside it.

That means `/workers` cannot be made public by copy work alone. The protected Worker application surface must live below explicit subroutes such as `/workers/setup`, `/workers/doctor-pass`, `/workers/findings`, `/workers/loops`, `/workers/runs`, and `/workers/privacy`.

## Starter And Tutorials

The paid app currently presents Starter and Workers as top-level product cards on `/home`. Starter owns generated-codebase and lesson work under `/starter/*`, with lesson compatibility data under `apps/web/app/(protected)/tutorials/_lib/`.

The current direction changes that hierarchy. Starter owns the generator and videos. Protected Starter work should move under `/starter/home`, `/starter/lessons`, and `/starter/generate-codebase`, while `/starter` remains the public marketing page. Tutorials may remain as an internal implementation route during migration, but they should stop being marketed or presented as a separate top-level product.

## Docs And Blog

`/blog` already exists through `apps/web/app/blog/[[...slug]]/page.tsx`, but blog content is manually enumerated in `apps/web/app/blog/_server/blog-content.ts` and `apps/web/content/blog/_meta.ts`. Only a small number of posts are wired today.

`/docs` exists and the docs content under `apps/web/content/docs/` is mostly relevant to generated-codebase customers: local setup, Clerk and Convex, Stripe, homepage configuration, generated codebase, and video pipeline guidance. Docs navigation currently promotes home, pricing, and sign-in links. The new direction says docs should be available when useful, but not promoted as a product path.

## Checkout And Access

Checkout currently runs through app-owned Stripe Checkout Session creation and records an `mma_checkout_v1` metadata packet for `paid_app_access`. Managed Stripe config is built around one configured price and product. Access capabilities exist as `generate_codebase`, `tutorials`, and `worker`, but legacy missing capabilities can resolve broadly.

The new product split needs two working purchase paths: Starter grants generator and videos; Workers grants Worker access. Because there are only three existing paid customers, manual migration is acceptable for existing grants. New checkout paths still need durable metadata and capability mapping so app access works after purchase.

The current checkout implementation uses one `STRIPE_PRICE_ID`, one `STRIPE_PRODUCT_ID`, one `STRIPE_PROMOTION_CODE_ID`, and `productConfig.priceUsdCents` as the managed price proof source. `buildStripeCheckoutSessionCreateParams` always uses one `getStripeLineItem()` result and does not yet accept an offer key. `checkoutPurchaseIntents` record checkout surface and buyer identity, but not purchased offer or default success route. The split checkout implementation must therefore add a small explicit offer representation, offer-specific price lookup, metadata/purchase-intent offer storage, and offer-specific access fulfillment.

## Generated Repo Coupling

The codebase compiler output is still close to a snapshot of the current repo plus overrides. `packages/codebase-compiler/src/repo-generation/repo-download-source-contract.ts` includes broad app directories and package sources. `packages/codebase-compiler/src/repo-generation/materialize-repo-snapshot.ts` collects that source and overlays rendered starter files.

Because broad app folders are included, generated repos can inherit protected Worker routes, runner API paths, and other core-app implementation details unless the snapshot contract excludes them. The target should be cleaner: generate a template app shaped by intake answers, with a starter operating spine for future Programs and ExecPlans, and without Worker local-runner code.

## Existing Program Conflict

`docs/programs/active/2026-05-05-worker-generate-tutorials-ia/` records an older direction where `/home` shows Generate Codebase, Tutorials, and Worker as three product surfaces. Parts of that Program already shipped and remain relevant to current code. Its product destination model is now superseded where it conflicts with Starter owning the generator and videos, public `/workers`, and unpromoted docs.

## Research Conclusions

The first implementation slice should fix the visible IA and route protection before deep compiler work. Public `/workers` has a hard route guard conflict. `/starter` does not exist, and protected Starter app routes do not yet exist under `/starter/*`. Paid `/home` still teaches Tutorials as a peer product. Checkout and access need a minimal split so public CTAs do not become dead ends.

The compiler extraction should be its own major slice. It has a larger blast radius than page copy because the current generator contract depends on broad repo snapshot inclusion and generated operating-pack assumptions.
