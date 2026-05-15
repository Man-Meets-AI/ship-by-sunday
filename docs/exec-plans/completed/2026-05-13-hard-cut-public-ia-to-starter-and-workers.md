---
title: Hard Cut Public IA To Man Meets AI Starter And Workers
status: complete
created_at: 2026-05-13
completed_at: 2026-05-13
summary: Make the public site, protected app routes, checkout, and access grants reflect the new Man Meets AI, Starter, and Workers split.
post_build_recap: "Completed the first hard-cut public IA slice: public Man Meets AI, Starter, Workers, and Blog routing; protected Starter app routes; public Workers marketing with protected Worker operations; explicit Starter and Workers checkout offers; offer-specific success routing and access grants; updated docs, tests, and validation."
program_id: public-product-split-starter-workers
planning_brief: docs/programs/active/2026-05-12-public-product-split-starter-workers/planning-brief-1.md
read_when:
  - Resuming the first public product split implementation slice.
  - Changing public routes, protected Starter routes, Worker route protection, checkout offers, or product access grants.
  - Validating the finished Man Meets AI, Starter, and Workers hard cut.
---

# Hard Cut Public IA To Man Meets AI Starter And Workers

This document is a living execution plan for making the resolved public product split real in routes, checkout, access, and the paid app.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

After this change, anonymous visitors can understand Man Meets AI at `/`, choose the Starter offer at `/starter`, choose the Workers offer at `/workers`, and keep using `/blog` without seeing docs, tutorials, or generated-codebase surfaces promoted as separate products. Starter buyers should buy the `$297` Starter offer and land in `/starter/home`, where the generator and lessons live together. Workers buyers should buy the `$600` Workers offer and land in `/workers/setup`, while `/workers` itself remains public marketing. Existing broad-access customers and multi-product customers should still have a protected `/home` recovery hub that only presents Starter and Workers as product families.

The observable result is a working site and app where the route map matches the product decision: Starter owns generator and videos, Workers owns existing-repo setup and later worker operations, docs stay reachable but unpromoted, and checkout grants the right capabilities for each offer.

## Progress

- [x] 2026-05-13: Read root `AGENTS.md`, `apps/web/AGENTS.md`, `docs/release-workflow.md`, `docs/exec-plans/PLANS.md`, the active Program packet, public homepage docs, design guidance, Convex AI guidelines, and the relevant Next.js App Router, redirect, proxy, and metadata docs.
- [x] 2026-05-13: Created this Program-linked child ExecPlan from `planning-brief-1.md`.
- [x] 2026-05-13: Updated the Program Slice Ledger so this child ExecPlan is registered as the first active slice.
- [x] 2026-05-13: Implemented public `/`, `/starter`, `/workers`, and public navigation.
- [x] 2026-05-13: Moved protected Starter work under `/starter/home`, `/starter/lessons`, `/starter/lessons/[lessonKey]`, `/starter/generate-codebase`, and `/starter/generate-codebase/review`.
- [x] 2026-05-13: Redirected old `/generate-codebase`, `/generate-codebase/review`, `/tutorials`, and `/tutorials/[lessonKey]` routes to their new Starter locations.
- [x] 2026-05-13: Changed route protection so `/workers` is public while Worker operational subroutes remain protected.
- [x] 2026-05-13: Split checkout into explicit Starter and Workers offers with offer-specific price config, metadata, purchase intents, success routing, and access grants.
- [x] 2026-05-13: Updated `/home` so single-product users auto-forward and multi-product or legacy users see only Starter and Workers.
- [x] 2026-05-13: Updated focused tests, setup docs for changed external Stripe configuration, and validation records.
- [x] 2026-05-13: Browser smoke found the original `/start(.*)` proxy matcher accidentally captured `/starter`; changed the compatibility matcher to exact `/start` and reran route/browser proof.
- [x] 2026-05-13: Ran full unit, integration, format, lint, and typecheck gates after the final proxy fix.

## Surprises & Discoveries

The first implementation slice needs to move the generator review route as well as the generator start route. The Program names `/starter/generate-codebase`, but the existing app has `/generate-codebase/review`; leaving that review route behind would keep Starter split across two top-level route families. The implementation should add `/starter/generate-codebase/review` and redirect `/generate-codebase/review` there.

`apps/web/proxy.ts` currently protects the entire `routeConfig.workers` family. Because `routeConfig.workers` is `/workers`, this makes the public Workers landing page impossible until protection changes to explicit operational subroutes such as `/workers/setup`, `/workers/doctor-pass`, `/workers/findings`, `/workers/loops`, `/workers/runs`, and `/workers/privacy`.

## Decision Log

Decision: Keep this first implementation as a hard cut, not a compatibility redesign.
Rationale: The product decisions are already resolved. Redirecting old protected routes is enough compatibility for the first pass, especially with only three existing paid customers.
Date: 2026-05-13.

Decision: Add `/starter/generate-codebase/review` in this slice.
Rationale: The current generator has a review page, and Starter should own the full generator flow. Redirecting only `/generate-codebase` would strand the review step in the old route family.
Date: 2026-05-13.

Decision: Use a narrow typed offer split instead of a broad offer framework.
Rationale: The product owner explicitly wants this ripped together and working. A typed `starter` and `workers` split is enough to make Stripe metadata, purchase intents, success routing, and capability grants explicit without inventing a generalized brand or pricing system.
Date: 2026-05-13.

## Outcomes & Retrospective

Implemented the first hard-cut slice. `/` is now the public Man Meets AI brand and routing page. `/starter` is the public Starter sales page with the `$297` Starter checkout CTA. `/workers` is the public Workers sales page with the `$600` Workers checkout CTA. `/blog` stays public and linked. Public navigation now routes to Man Meets AI, Starter, Workers, Blog, and Sign in, without promoting docs, tutorials, generated-codebase, or pricing as separate top-level destinations.

Protected Starter routes now live under `/starter/home`, `/starter/generate-codebase`, `/starter/generate-codebase/review`, `/starter/lessons`, and `/starter/lessons/[lessonKey]`. Old `/generate-codebase`, `/generate-codebase/review`, `/tutorials`, and `/tutorials/[lessonKey]` routes redirect to the matching Starter routes. `/workers` is public, while `/workers/setup`, `/workers/doctor-pass`, `/workers/findings`, `/workers/loops`, `/workers/runs`, and `/workers/privacy` remain protected.

Checkout now carries an explicit offer id from button to Stripe session metadata, Convex purchase intent storage, webhook/success-page fulfillment, and product access grant. Starter grants `generate_codebase` and `tutorials`, then routes to `/starter/home`. Workers grants `worker`, then routes to `/workers/setup`. Legacy broad-access rows remain compatible through the existing missing-capability behavior. The Stripe setup docs and product creation script now describe the two managed price IDs: `STRIPE_STARTER_PRICE_ID` and `STRIPE_WORKERS_PRICE_ID`.

Remaining follow-up work is outside this slice: separate the codebase compiler/template output from Worker local-runner code, decide the later `/codebase-doctor` public option, extract blog material from `plan.md` and `program.md`, and manually handle the three existing paid customers.

Validation completed on 2026-05-13:

    bun run --cwd apps/web test:unit -- tests/unit/proxy-protected-routes.test.ts
    bun run --cwd apps/web test:unit
    bun run --cwd apps/web test:integration
    bun run format
    bun run lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run typecheck
    bun --cwd apps/web playwright screenshot --viewport-size=390,844 http://localhost:3000/starter /tmp/ship-by-sunday-starter-mobile.png

Browser smoke against the local dev server confirmed `/`, `/starter`, `/workers`, and `/blog` remain public, do not redirect to sign-in, and expose the expected Man Meets AI, Starter `$297`, Workers `$600`, and Blog surfaces without promoted Docs navigation. The initial browser smoke exposed a `/starter` redirect regression caused by the old `/start(.*)` proxy compatibility matcher; the matcher was narrowed to exact `/start`, the focused proxy test passed, and `/starter` then loaded publicly.

Mobile screenshot proof at `390x844` confirmed the Starter public page keeps the hero, CTAs, and first product cards readable without text overlap.

## Context and Orientation

The public app is a Next.js App Router application under `apps/web/app`. Route groups such as `apps/web/app/(workspace)` do not appear in URLs, so a file at `apps/web/app/(workspace)/workers/page.tsx` still owns `/workers`. A public `/workers` page outside the route group cannot coexist with that protected page; the protected Worker app must live only on concrete subroutes under `apps/web/app/(workspace)/workers/`.

Core route constants live in `apps/web/config/product.ts` as `routeConfig`. The existing homepage contract is split between `starterConfig.homePage` in that file, copy in `apps/web/app/_content/home-page.ts`, behavior in `apps/web/app/_lib/home-page-render-model.ts`, rendering components under `apps/web/app/_components/home-page/`, and structured data in `apps/web/app/_lib/home-page-structured-data.ts`. Public navigation and app navigation may reference the same route constants.

Protected access is enforced by Clerk middleware/proxy logic in `apps/web/proxy.ts` and by the workspace layout in `apps/web/app/(workspace)/layout.tsx`. The proxy decides which path families require authentication before a page renders. The workspace layout decides whether an authenticated user has product access before rendering protected product routes.

Product capabilities are modeled in `apps/web/platform/access/product-surface-capabilities.ts`. Existing missing capability metadata resolves to broad access for legacy compatibility. New Starter purchases should grant generator and lessons access. New Workers purchases should grant Worker access only.

Checkout uses Stripe helpers under `apps/web/platform/billing/`. The current managed Stripe config supports a single price via `STRIPE_PRICE_ID` and related product/promotion fields. Checkout session creation and metadata live under `apps/web/platform/billing/checkout/`. Purchase intent storage and fulfillment touch Convex files under `apps/web/convex/`, including checkout claims and Stripe webhook processing. This slice must make the offer key travel from the public CTA through session creation, metadata, purchase intent storage, webhook fulfillment, and access grant.

### In Scope

This plan owns the first working public IA and checkout split. It includes public `/`, `/starter`, `/workers`, `/blog` navigation, protected Starter app routes, redirects from old protected generator and tutorial routes, public `/workers` with protected Worker operational subroutes, `/home` single-product forwarding and two-card fallback, explicit Starter and Workers checkout offers, offer-specific success destinations, offer-specific access grants, focused tests, and setup docs for changed Stripe environment variables.

This plan also owns removing public promotion of docs, tutorials, generated-codebase, and pricing as top-level routes. `/docs` remains reachable by direct link. `/blog` remains linked and usable, but new blog content extraction is not required.

### Out Of Scope

Do not rewrite the codebase compiler in this slice unless the route hard cut exposes a hard blocker. Do not remove Worker local-runner code from generated output yet; that belongs to the next child ExecPlan. Do not create new blog posts from `plan.md` or `program.md` material. Do not mass-migrate the three existing paid customers. Do not build a generalized brand, offer, or pricing configuration system. Do not delete old generator or tutorial routes; redirect them for this pass.

## Plan of Work

First, register this child ExecPlan in the active Program packet so the Program ledger no longer says no child plans exist.

Next, update route constants in `apps/web/config/product.ts` to name public Starter, protected Starter app routes, the generator review route under Starter, and the fact that `/workers` is public. Keep Worker operational routes explicit. Update any route maps or sitemap helpers that rely on those constants.

Next, change public route pages. Replace the mixed homepage with a Man Meets AI brand/thesis routing page. Add `/starter` as the public Starter offer page with the `Ship your idea by Sunday.` hero and `$297` CTA. Add `/workers` as the public Workers offer page with the `Install AI workers into your existing codebase.` hero and `$600` CTA. Keep `/blog` public and linked. Public nav should contain Man Meets AI, Starter, Workers, Blog, and Sign in only.

Next, move protected Starter routes. Add `/starter/home` as the protected Starter dashboard with two first-run choices: guided questions for a customized repo, and template plus guided videos. Add `/starter/lessons` and `/starter/lessons/[lessonKey]` by reusing the existing tutorial data and components. Add `/starter/generate-codebase` and `/starter/generate-codebase/review` by reusing the current generator and review implementations. Replace old `/generate-codebase`, `/generate-codebase/review`, `/tutorials`, and `/tutorials/[lessonKey]` pages with server redirects to the new protected Starter routes.

Next, change protection and app routing. In `apps/web/proxy.ts`, stop protecting all of `/workers`; protect only the Worker operational subroutes and the protected Starter app subroutes. Remove or repurpose any protected page that currently owns `/workers`. Update app shell navigation and paid home models to link Starter to `/starter/home` and Workers to `/workers/setup`, not to old peer routes.

Next, implement the narrow checkout split. Add a typed offer key for `starter` and `workers`, offer-specific price env variables, offer-specific line item creation, offer-specific metadata and purchase intent fields, and offer-specific success destinations. Starter fulfillment should grant generator and tutorial capabilities. Workers fulfillment should grant only Worker capability. Keep legacy missing capability metadata broad for existing customers, but do not grant broad access for new offer-specific purchases.

Next, update `/home`. Single-product Starter users should redirect to `/starter/home`. Single-product Worker users should redirect to `/workers/setup`. Multi-product, unresolved, or legacy broad-access users should see only Starter and Workers product cards. The old Tutorials and Generate Codebase cards should disappear as peer destinations.

Finally, update tests, docs, and validation. Route protection tests should prove public `/workers`, public `/starter`, protected Starter app routes, protected Worker subroutes, and old redirects. Checkout tests should prove Starter and Workers price selection, metadata, purchase intent storage, success routing, and capability grants. UI tests should prove public pages and paid home rendering. External setup docs must describe any new Stripe env vars and verification steps.

## Milestones

Milestone 1 creates the route and navigation hard cut. Success means `/`, `/starter`, `/workers`, `/blog`, protected Starter routes, protected Worker subroutes, and old redirects all compile and route to the intended pages. Focused route tests and proxy tests should pass before checkout work begins.

Milestone 2 creates the split checkout/access path. Success means the public Starter CTA creates a Starter checkout session for `$297`, records a Starter offer, and grants Starter capabilities on fulfillment, while the Workers CTA creates a Workers checkout session for `$600`, records a Workers offer, and grants Worker capability only. Focused billing, Convex, webhook, and access tests should pass before broad validation.

Milestone 3 updates paid-home behavior and customer recovery. Success means single-product users are routed into the purchased product and multi-product or legacy users see a two-card `/home` that no longer promotes Generate Codebase or Tutorials as peer products.

Milestone 4 completes docs and validation. Success means changed external setup is documented, the ExecPlan and Program lint cleanly, focused tests pass, broad static checks pass, and a browser smoke confirms the public pages and protected home behavior.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

After creating or changing this plan, validate it:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-hard-cut-public-ia-to-starter-and-workers.md
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-hard-cut-public-ia-to-starter-and-workers.md docs/programs/active/2026-05-12-public-product-split-starter-workers docs/programs/README.md docs/programs/active/index.md

Inspect the current route, checkout, and access surfaces before editing:

    rg --files apps/web/app apps/web/platform apps/web/convex apps/web/tests | rg 'checkout|access|home|tutorial|generate-codebase|workers|proxy'

Run focused route and paid-home tests after route changes:

    bun run --cwd apps/web test:unit -- tests/unit/proxy-protected-routes.test.ts tests/unit/tutorial-routes.test.ts tests/unit/legacy-codebase-route-redirects.test.ts tests/unit/app-workspace-tutorial-routes.test.tsx tests/unit/app-workspace-codebase-review-routes.test.tsx tests/unit/public-metadata-routes.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/app-shell-command-menu.test.tsx

Run focused checkout and access tests after offer changes:

    bun run --cwd apps/web test:unit -- tests/unit/checkout-session-params.test.ts tests/unit/checkout-session.test.ts tests/unit/checkout-claims.test.ts tests/unit/checkout-claims-actions.test.ts tests/unit/convex-product-access-grant.test.ts tests/unit/course-access.test.ts
    bun run --cwd apps/web test:integration -- tests/integration/stripe-checkout-route.test.ts

Run focused homepage/public-page tests after public UI changes:

    bun run --cwd apps/web test:unit -- tests/unit/home-page-content.test.ts tests/unit/home-page-render-model.test.ts tests/unit/home-page-structured-data.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/home-page-primary-cta.test.tsx tests/integration-ui/home-page-product-preview.test.tsx tests/integration-ui/checkout-button.test.tsx

Run repo-level completion checks after focused tests pass:

    bun run format
    bun run lint
    bun run typecheck
    git diff --check

Use browser tooling after the dev server is available to smoke `/`, `/starter`, `/workers`, `/blog`, and `/home` on desktop and mobile. For signed-out protected routes, success is redirecting to sign-in. For signed-in routes, success is product-specific routing or the two-card fallback depending on local test access.

## Validation and Acceptance

Acceptance requires `/` to be a public Man Meets AI brand/thesis page with clear routing to Starter and Workers, not a direct pricing page. `/starter` must be public and sell Starter at `$297`. `/workers` must be public and sell Workers at `$600`. `/blog` must remain public and linked. Public nav must include Man Meets AI, Starter, Workers, Blog, and Sign in, with no docs, tutorials, generated-codebase, or pricing link.

Protected Starter acceptance requires `/starter/home`, `/starter/lessons`, `/starter/lessons/[lessonKey]`, `/starter/generate-codebase`, and `/starter/generate-codebase/review` to require authentication and product access. Old `/generate-codebase`, `/generate-codebase/review`, `/tutorials`, and `/tutorials/[lessonKey]` should redirect to the matching Starter route while preserving lesson keys. Protected Worker acceptance requires `/workers/setup`, `/workers/doctor-pass`, `/workers/findings`, `/workers/loops`, `/workers/runs`, and `/workers/privacy` to stay protected while `/workers` is public.

Checkout acceptance requires Starter and Workers to use offer-specific checkout sessions, line items, metadata, purchase intents, success destinations, and grants. Starter must grant generator and lessons access and route successful buyers to `/starter/home`. Workers must grant Worker access only and route successful buyers to `/workers/setup`. New offer-specific purchases must not inherit the old shared promotion behavior.

Paid-home acceptance requires Starter-only users to auto-forward to `/starter/home`, Worker-only users to auto-forward to `/workers/setup`, and multi-product or legacy broad-access users to see only Starter and Workers as product cards. Existing legacy broad access must not be locked out accidentally.

The test brief for this feature is: Feature: public product split and split checkout. Risk: P1 core product, because it changes checkout entry, access grants, onboarding routes, and public product navigation. Source of truth: visible routes, Stripe checkout session parameters, Convex purchase intent and access records, and redirect behavior. Must work: anonymous public page access, signed-out protected-route redirects, Starter checkout, Workers checkout, webhook grant fulfillment, single-product `/home` forwarding, and legacy `/home` fallback. Must fail safely: unknown offer keys, missing offer price config, mismatched Stripe metadata, signed-out protected access, wrong product capabilities, and old route redirects. Tests: route/proxy unit tests, checkout unit and integration tests, Convex access tests, public page UI tests, paid-home UI tests, browser smoke, and repo static gates. CI gate: app unit, app integration, app integration UI, lint, typecheck, format, markdown/program/plan lint.

### Test Commands

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-hard-cut-public-ia-to-starter-and-workers.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-hard-cut-public-ia-to-starter-and-workers.md docs/programs/active/2026-05-12-public-product-split-starter-workers docs/programs/README.md docs/programs/active/index.md
    bun run --cwd apps/web test:unit -- tests/unit/proxy-protected-routes.test.ts tests/unit/tutorial-routes.test.ts tests/unit/legacy-codebase-route-redirects.test.ts tests/unit/app-workspace-tutorial-routes.test.tsx tests/unit/app-workspace-codebase-review-routes.test.tsx tests/unit/public-metadata-routes.test.ts
    bun run --cwd apps/web test:unit -- tests/unit/checkout-session-params.test.ts tests/unit/checkout-session.test.ts tests/unit/checkout-claims.test.ts tests/unit/checkout-claims-actions.test.ts tests/unit/convex-product-access-grant.test.ts tests/unit/course-access.test.ts
    bun run --cwd apps/web test:integration -- tests/integration/stripe-checkout-route.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/app-shell-command-menu.test.tsx tests/integration-ui/home-page-primary-cta.test.tsx tests/integration-ui/home-page-product-preview.test.tsx tests/integration-ui/checkout-button.test.tsx
    bun run format
    bun run lint
    bun run typecheck
    git diff --check

## Idempotence and Recovery

Route changes are recoverable by restoring old pages from git and leaving redirects in place. Do not delete old paths until the new route family is proven. If a public page conflicts with a route group page, resolve the conflict by moving or deleting only the old protected page that owned the same URL, not by protecting the public page again.

Checkout changes must fail closed. If an unknown offer key appears, session creation should reject it rather than falling back to a default product. If a required offer price env var is missing, the error should identify the missing offer-specific config. If webhook metadata is missing an offer key for legacy records, fulfillment should preserve existing broad-access compatibility rather than blindly downgrading customer access.

Convex schema and access changes must be forward compatible with existing records. Missing capabilities on old paid access records should continue to mean broad legacy access. New offer-specific records should store explicit capabilities. Do not write a blind customer migration.

If focused tests fail, repair the failing surface before broad validation. If browser smoke cannot run because a required dev server or environment variable is unavailable, record the exact limitation in this plan and the final summary instead of claiming full browser proof.

## Artifacts and Notes

Expected public route shape after this plan:

    /                 public Man Meets AI brand/thesis routing page
    /starter          public Starter offer page
    /workers          public Workers offer page
    /blog             public blog index
    /docs             public direct-link docs, not promoted
    /home             protected fallback hub
    /starter/home     protected Starter home
    /starter/lessons  protected Starter lesson library
    /starter/generate-codebase protected Starter generator
    /workers/setup    protected Worker setup

Expected old-route redirects:

    /generate-codebase        -> /starter/generate-codebase
    /generate-codebase/review -> /starter/generate-codebase/review
    /tutorials                -> /starter/lessons
    /tutorials/<lessonKey>    -> /starter/lessons/<lessonKey>

Expected first-pass prices:

    Starter: $297
    Workers: $600

## Interfaces and Dependencies

The implementation depends on Next.js App Router pages, layouts, and redirects. Server redirects should use Next's `redirect()` helper in route/page code where preserving protected-route behavior is useful. Proxy route matching should stay explicit and should not fetch slow data.

The implementation depends on Clerk for authentication and Convex for product access state. Protected routes should continue using existing app access helpers rather than adding page-local auth checks.

The implementation depends on Stripe Checkout. The new offer key must be present in checkout request validation, session parameter construction, metadata, purchase intent storage, webhook fulfillment, and success routing. Offer-specific env vars must be documented where maintainers configure Stripe for local, preview, and production.

The implementation depends on the existing tutorial lesson data, generator components, Worker setup pages, and product access capability resolver. Reuse those pieces where possible so this slice is an IA and checkout hard cut rather than a generator or Worker rewrite.
