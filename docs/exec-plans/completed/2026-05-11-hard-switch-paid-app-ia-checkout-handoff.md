---
title: Hard Switch Paid App IA And Checkout Handoff To Home Generate Codebase Tutorials And Worker
status: complete
created_at: 2026-05-11
completed_at: 2026-05-11
summary: Replace the paid app's workspace choice flow with a protected Home, canonical product routes, durable checkout purchase intents, and tighter Stripe webhook proof.
post_build_recap: The paid app now lands checkout and app-home redirects on `/home`, exposes Generate Codebase, Tutorials, and Worker as capability-gated paid surfaces, writes app-owned `mma_checkout_v1` purchase intent metadata to Stripe, rejects wildcard webhook subscriptions, and queues webhook fulfillment after durable event recording.
program_id: worker-generate-tutorials-ia
planning_brief: docs/programs/active/2026-05-05-worker-generate-tutorials-ia/planning-brief-2.md
read_when:
  - Resuming the Home, Generate Codebase, Tutorials, Worker IA cutover.
  - Changing checkout, access, route guards, or Stripe webhook fulfillment.
  - Validating the first Program implementation slice.
---

# Hard Switch Paid App IA And Checkout Handoff To Home Generate Codebase Tutorials And Worker

This document is a living execution plan for replacing the old workspace-choice paid app path with one protected Home, three canonical paid surfaces, and a safer Stripe checkout handoff.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

After this change, a buyer who completes checkout should land on `/home`, see a clear paid app hub, and choose between Generate Codebase, Tutorials, and Worker without being trapped by an old `fulfillmentTrack` lane. The app should use `/generate-codebase`, `/tutorials`, and `/workers` as the product route families, while Stripe metadata carries only compact reconciliation keys, especially an app-owned `purchaseIntentId`. Stripe webhook release proof should fail wildcard event subscriptions, and webhook delivery should acknowledge Stripe after signature verification plus durable event recording instead of doing Clerk/account fulfillment inside the synchronous response path.

## Progress

- [x] 2026-05-11: Created the Program-linked ExecPlan from `planning-brief-2.md` after reading the repo, release, Stripe, Convex, Next.js, and design contracts.
- [x] 2026-05-11: Implemented protected `/home`, moved generated-codebase routes to `/generate-codebase`, moved existing-repo routes to `/workers`, deleted `/workspace/choose`, and pointed logo/user-menu/Command-K to Home, Generate Codebase, Tutorials, and Worker.
- [x] 2026-05-11: Added paid-surface capabilities (`generate_codebase`, `tutorials`, `worker`) and changed route guards so legacy `fulfillmentTrack` no longer blocks paid app surface navigation.
- [x] 2026-05-11: Added Convex checkout purchase intents, wrote `mma_checkout_v1` metadata to Checkout Session and PaymentIntent metadata, rejected wildcard Stripe webhook subscriptions, and queued webhook fulfillment after durable ledger recording.
- [x] 2026-05-11: Updated release docs, app docs, focused route/checkout/webhook/navigation tests, and route scans for the hard-switch paths.
- [x] 2026-05-11: Completed focused and broad validation: app unit, integration-node, integration-ui, format check, lint, typecheck, plans lint, programs lint, diff whitespace check, route/metadata scans, and a desktop/mobile browser smoke of `/home` redirecting signed-out users to sign-in with the `/home` redirect preserved.

## Surprises & Discoveries

The repo already has an unused starter-style protected home model under `apps/web/app/(workspace)/_components/workspace-home/`, but that model is starter-module oriented rather than the new paid app hub. It can inform layout boundaries, but the paid Home needs product-path copy and first-purchase treatment instead of starter diagnostics.

The current `/tutorials` and `/tutorials/[lessonKey]` routes already exist. The older Program research was stale on that point, so this slice should preserve that route family and only update navigation/access around it.

The current Stripe webhook handler already verifies signatures and keeps an idempotent ledger in `apps/web/convex/stripeWebhookEvents.ts`. The unsafe part is not duplicate handling; it is that `apps/web/convex/stripeWebhook.ts` may call Clerk lookup/create and product-access grant work before the HTTP action in `apps/web/convex/http.ts` returns to Stripe.

The compiler-owned Codebase stage definitions still expose the historical `/codebase` and `/review` routes. The app now maps those stage ids through `apps/web/lib/codebase-flow/codebase-stage-nav-model.ts` so compiler route metadata cannot leak into paid app navigation.

The local browser connector was unavailable and the Chrome DevTools connector was blocked by a profile lock, so browser proof used a local Playwright smoke script against the dev server. The smoke confirmed signed-out `/home` redirects to sign-in with the `/home` destination preserved at desktop and mobile sizes. The local server logged Clerk development-key refresh-loop warnings from the current local Clerk environment, but the page rendered and the Playwright check saw no page console errors.

## Decision Log

Decision: Keep public `/` as the marketing homepage and add protected `/home` for paid app navigation.
Rationale: `routeConfig.home` already means public marketing home, and overloading it would make checkout, sign-in, docs, and marketing CTAs ambiguous.
Date: 2026-05-11.

Decision: Keep legacy `fulfillmentTrack` fields as migration inputs but stop using them as the paid-surface authority.
Rationale: Existing data and tests still know about `generated_codebase`, `existing_codebase_doctor`, and `unspecified`, but the product direction is that paid users can navigate the main paid surfaces through explicit capabilities.
Date: 2026-05-11.

Decision: Use a Convex checkout purchase intent as the durable app-side reconciliation object.
Rationale: Stripe IDs describe Stripe objects, but the app needs its own purchase handoff record to connect Checkout Session creation, webhook processing, success-page recovery, access grants, and first-purchase Home treatment.
Date: 2026-05-11.

Decision: New Stripe Checkout metadata uses `metadataSchema`, `app`, `accessProduct`, `purchaseIntentId`, `checkoutSurface`, and optional `clerkUserId`.
Rationale: That packet is small, non-sensitive, and enough for reconciliation. Product path choice, first-time UI state, lesson IDs, emails, names, and secrets remain in the app database.
Date: 2026-05-11.

Decision: Webhook release preflight must reject `enabled_events: ["*"]`.
Rationale: Stripe allows wildcard subscriptions, but recommends subscribing only to required event types. Release proof should enforce that production and dev-staging endpoints listen only to the Checkout events this integration consumes.
Date: 2026-05-11.

## Outcomes & Retrospective

The implementation cut over the paid app handoff to protected `/home`, with `/generate-codebase`, `/tutorials`, `/workers`, and `/workers/*` as the canonical paid route families. New checkout sessions now carry the compact `mma_checkout_v1` metadata packet with an app-owned `purchaseIntentId`; the purchase intent is created before Stripe session creation and fulfilled by webhook processing after the Stripe session is attached. Stripe webhook preflight now fails wildcard endpoint subscriptions, and verified paid checkout events are recorded then queued for async fulfillment.

Focused validation passed for checkout metadata/session construction, Stripe line item and managed webhook preflight, webhook event ledger and queued fulfillment, checkout route integration, auth redirects, protected route metadata, access capability guards, Codebase navigation, Worker pages, checkout success, app shell navigation, and support/access copy. Broad validation passed with `bun run --cwd apps/web test:unit`, `bun run --cwd apps/web test:integration:node`, `bun run --cwd apps/web test:integration:ui`, `bun run format:check`, `bun run lint`, `DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run typecheck`, `bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-11-hard-switch-paid-app-ia-checkout-handoff.md`, `bun run programs:lint`, and `git diff --check`.

One operational caveat from validation is that the first typecheck run was started without disabling PostHog source map upload, so the Next build hook uploaded source maps before the later `DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run typecheck` run. The successful typecheck proof used the disabled-upload environment variable.

## Context and Orientation

The protected app currently lives under the Next.js App Router route group `apps/web/app/(workspace)/`. That route group does not affect URLs, so folders inside it become real paths such as `/codebase`, `/workspace/setup`, and `/tutorials`. Access gating starts in `apps/web/app/(workspace)/layout.tsx`, which calls `getServerProductAccess` from `apps/web/platform/access/product-access.ts`.

The public marketing homepage is configured through `apps/web/config/product.ts`, where `routeConfig.home` is `/`. Do not change that public homepage contract in this slice. Add a separate protected app route, `/home`, for the paid customer hub.

Product access is stored in Convex. The schema is in `apps/web/convex/schema.ts`, access logic is in `apps/web/convex/access/model.ts`, validators are in `apps/web/convex/access/validators.ts`, and the client/server product access type is in `apps/web/lib/product-access.ts`. The current scalar `fulfillmentTrack` can say `generated_codebase`, `existing_codebase_doctor`, or `unspecified`. That scalar should remain readable for old data but should no longer block a paid user from the other paid surfaces.

Stripe Checkout creation enters through `apps/web/app/api/stripe/checkout/route.ts` and `apps/web/app/api/stripe/checkout/express/route.ts`. Both use `apps/web/platform/billing/checkout/checkout-session-params.ts` to build Checkout Session parameters. Success-page recovery uses `apps/web/platform/billing/checkout/checkout-session.ts` and `apps/web/platform/billing/checkout/checkout-session-recovery.ts`.

Stripe webhook delivery is a Convex HTTP action in `apps/web/convex/http.ts`. It calls `internal.stripeWebhook.processStripeWebhook` from `apps/web/convex/stripeWebhook.ts`, which currently verifies the signature and then performs fulfillment before returning. The idempotent ledger lives in `apps/web/convex/stripeWebhookEvents.ts`.

Release billing preflight lives in `apps/web/platform/billing/managed-stripe-config.ts` and is tested in `apps/web/tests/unit/stripe-line-item.test.ts`. The release operator contract that names Stripe setup lives in `docs/release-workflow.md`.

### In Scope

This slice adds `/home`, moves the codebase route family to `/generate-codebase`, moves the existing-repo route family to `/workers`, updates protected route matching, updates checkout success and auth fallback redirects to `/home`, updates app shell logo/user-menu/Command-K navigation, adds paid-surface capabilities to access grants, creates durable checkout purchase-intent records, writes `mma_checkout_v1` metadata to both Checkout Session and PaymentIntent, rejects wildcard Stripe webhook subscriptions in preflight, and moves webhook fulfillment to an asynchronously scheduled path after durable event recording.

This slice updates focused tests for checkout metadata, purchase-intent persistence, webhook idempotency/async behavior, route guards, checkout success, app shell navigation, and release billing preflight. It also updates release documentation for the new `/home` handoff and Stripe webhook event requirements.

### Out Of Scope

Do not rename the generated Codebase artifact or package compiler language. Do not rename Ship by Sunday-owned Worker runtime API paths, Convex workspace tables, local-runner command language, or customer runner protocol in this first slice unless a route boundary cannot compile without a small adapter. Do not change the public marketing homepage design or checkout CTA strategy. Do not put path choice, first-run flags, lesson IDs, raw UI state, emails, names, or secrets into Stripe metadata.

## Plan of Work

First, add protected app route constants in `apps/web/config/product.ts`: keep `routeConfig.home` as `/`, add `routeConfig.appHome` as `/home`, point the codebase route constants at `/generate-codebase`, point existing-repo route constants at `/workers/*`, and update auth fallback to `/home`.

Next, create the paid Home route and model under `apps/web/app/(workspace)/home/page.tsx` and feature-local components. Home should be a restrained app surface inside `AppShell`, with a checkout welcome state when `?welcome=checkout` is present and three clear action cards: Generate Codebase, Tutorials, and Worker. Keep cards limited to the path affordances and utility sections.

Next, move route files so the App Router exposes `/generate-codebase`, `/generate-codebase/review`, `/workers`, and `/workers/*`. Update server redirects that currently send users to `/workspace/choose`, `/codebase`, or `/workspace/setup` so they go to `/home`, `/generate-codebase`, or `/workers/setup` as appropriate.

Next, change product access to return explicit paid-surface capabilities. New grants should receive Generate Codebase, Tutorials, and Worker capabilities. Legacy grants without stored capabilities should resolve to all paid capabilities for now because there are no production users and the product decision is one paid app with three primary surfaces. Existing `fulfillmentTrack` should be kept for migration and audit, not for route blocking.

Next, add checkout purchase intents to `apps/web/convex/checkoutClaims.ts` and `apps/web/convex/schema.ts`. The checkout API routes should create a purchase intent before calling Stripe, pass its id into `buildStripeCheckoutSessionCreateParams` or `buildStripeExpressCheckoutSessionCreateParams`, and attach the Stripe Checkout Session id after Stripe returns it.

Next, add a checkout metadata helper under `apps/web/platform/billing/checkout/`. The helper should build and parse the `mma_checkout_v1` packet, and legacy `courseSlug` checks should become fallback compatibility only. Checkout Session and PaymentIntent metadata must match.

Next, refactor Stripe webhook processing. Keep signature verification in the synchronous webhook path. After verification, record or update the Stripe event ledger and schedule an internal action for fulfillment. The HTTP endpoint should return success for queued, duplicate, ignored, and payment-pending states, and should only return `400` for invalid signatures or malformed required event data. The scheduled action should reuse the existing grant and email-fulfillment behavior, update the ledger idempotently, and record failures without making Stripe wait on Clerk/account work.

Finally, update tests and release docs. The focused tests should assert `/home` redirects, metadata packet shape, purchase intent ids, wildcard webhook rejection, async webhook queuing, route paths, and navigation copy.

## Milestones

Milestone 1 creates the route and access skeleton. At the end, `/home`, `/generate-codebase`, and `/workers` route files exist, protected route matching includes them, and app shell navigation points at the new routes. Focused route and navigation tests should pass.

Milestone 2 changes product access authority. At the end, paid users have explicit capabilities, route guards use those capabilities, and the old `fulfillmentTrack` no longer blocks Generate Codebase versus Worker navigation. Access model tests should pass.

Milestone 3 changes checkout handoff and Stripe metadata. At the end, checkout APIs create purchase intents and write the `mma_checkout_v1` packet to both Stripe metadata surfaces. Checkout route and checkout parameter tests should pass.

Milestone 4 changes webhook proof and processing. At the end, wildcard event subscriptions fail release preflight, webhook processing queues fulfillment after durable recording, and the scheduled fulfillment action preserves idempotent grants. Webhook and release billing tests should pass.

Milestone 5 updates durable docs and runs validation. At the end, `docs/release-workflow.md`, Program/ExecPlan progress, focused tests, lints, and typecheck reflect the new behavior.

## Concrete Steps

Work from the repository root at `/Users/bazelrex/Developer/ship-by-sunday`.

Create and maintain this plan:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-11-hard-switch-paid-app-ia-checkout-handoff.md

After route/access edits, run focused route and UI tests:

    bun run --cwd apps/web test:unit -- tests/unit/proxy-protected-routes.test.ts tests/unit/sign-in-route-utils.test.ts tests/unit/access-required-page.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/app-shell-command-menu.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx

After checkout metadata edits, run focused billing tests:

    bun run --cwd apps/web test:unit -- tests/unit/checkout-session-params.test.ts tests/unit/checkout-session.test.ts tests/unit/stripe-line-item.test.ts
    bun run --cwd apps/web test:integration:node -- tests/integration/stripe-checkout-route.test.ts

After webhook edits, run focused Convex webhook tests:

    bun run --cwd apps/web test:unit -- tests/unit/stripe-webhook-action.test.ts tests/unit/stripe-webhook-events.test.ts

Before completion, run the broader required gates for this risky slice:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-11-hard-switch-paid-app-ia-checkout-handoff.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-11-hard-switch-paid-app-ia-checkout-handoff.md docs/programs/active/2026-05-05-worker-generate-tutorials-ia docs/release-workflow.md
    git diff --check
    bun run format
    bun run lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run typecheck

## Validation and Acceptance

Acceptance requires a paid customer to land on `/home` after checkout and see the three paid app paths without a `/workspace/choose` detour. Header logo, user menu, and Command-K must include Home plus Generate Codebase, Tutorials, and Worker. `/generate-codebase`, `/tutorials`, and `/workers` must be protected paid surfaces that do not redirect a paid user away based on old `fulfillmentTrack` lane values.

Checkout acceptance requires every new Checkout Session to have metadata `{ metadataSchema: "mma_checkout_v1", app: "man_meets_ai", accessProduct: "paid_app_access", purchaseIntentId, checkoutSurface, clerkUserId? }` on both `metadata` and `payment_intent_data.metadata`. The purchase intent must exist in Convex before Stripe session creation and must be attached to the Stripe Checkout Session id after creation.

Webhook acceptance requires release preflight to fail `enabled_events: ["*"]`, accept only explicit required Checkout events, verify Stripe signatures before any event recording, record the event durably, return quickly for queued/duplicate/ignored/payment-pending outcomes, retry failed or stale queued fulfillment internally, and fulfill grants asynchronously with the existing idempotent Stripe object plus event-type duplicate guard.

Documentation acceptance requires `docs/release-workflow.md` to name `/home` as the post-checkout paid handoff and require explicit Stripe event subscriptions rather than wildcard subscriptions.

### Test Commands

    bun run --cwd apps/web test:unit -- tests/unit/checkout-session-params.test.ts tests/unit/checkout-session.test.ts tests/unit/stripe-line-item.test.ts tests/unit/stripe-webhook-action.test.ts tests/unit/stripe-webhook-events.test.ts tests/unit/proxy-protected-routes.test.ts tests/unit/sign-in-route-utils.test.ts tests/unit/access-required-page.test.tsx
    bun run --cwd apps/web test:integration:node -- tests/integration/stripe-checkout-route.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/app-shell-command-menu.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-11-hard-switch-paid-app-ia-checkout-handoff.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-11-hard-switch-paid-app-ia-checkout-handoff.md docs/programs/active/2026-05-05-worker-generate-tutorials-ia docs/release-workflow.md
    git diff --check
    bun run format
    bun run lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run typecheck
    node codex-scripts/verify-paid-app-browser-smoke.mjs

## Idempotence and Recovery

Route moves are source changes only. If a move breaks imports, use `rg` to find stale route constants and update the route constant rather than adding ad hoc string redirects. Do not delete unrelated dirty files in the working tree.

Checkout purchase intent creation is additive. If Stripe session creation fails after intent creation, keep the intent record as failed or abandoned rather than trying to erase it. If attaching the session id fails, fail the checkout API response before sending the buyer to Stripe so operators do not create an unreconciled buyer handoff.

Webhook scheduling must be idempotent. Exact Stripe event ids and logical duplicates by Stripe Checkout Session id plus event type must not schedule duplicate fulfillment after a terminal result. Failed async fulfillment is retried by the internal retry mutation, and stale queued or processing attempts are rescheduled by the watchdog mutation before final failure is recorded.

## Artifacts and Notes

Important source guidance loaded for this slice:

    docs/programs/active/2026-05-05-worker-generate-tutorials-ia/planning-brief-2.md
    docs/release-workflow.md
    apps/web/AGENTS.md
    apps/web/convex/_generated/ai/guidelines.md
    node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md
    node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md
    node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md
    node_modules/next/dist/docs/01-app/02-guides/redirecting.md
    DESIGN.md
    docs/ship-by-sunday/design-pack/AGENTS.md
    docs/ship-by-sunday/design-pack/surfaces/app-surface.md

## Interfaces and Dependencies

The route constants in `apps/web/config/product.ts` are the app-wide route source of truth. Use them instead of raw path strings except in App Router folder names and tests that intentionally assert URL behavior.

The public checkout API routes depend on `convex/nextjs` `fetchAction` plus the server-only `CHECKOUT_FULFILLMENT_RETRY_SECRET` to create and attach purchase intents through secret-gated Convex actions. Any new Convex functions referenced from Next.js should be exported from an existing generated API module such as `apps/web/convex/checkoutClaims.ts`, or Convex generated API types must be regenerated.

The Stripe metadata helper must be imported by Checkout creation, Checkout recovery, Convex checkout claims, and Convex webhook code so the app has one definition of `mma_checkout_v1`.

The Convex webhook HTTP action in `apps/web/convex/http.ts` must keep using the raw request body for Stripe signature verification. Do not parse JSON before verifying the `stripe-signature` header.

The release preflight helper in `apps/web/platform/billing/managed-stripe-config.ts` must keep the expected endpoint at `{NEXT_PUBLIC_CONVEX_SITE_URL}/stripe/webhook` and must continue rejecting stale app-origin `/api/stripe/webhook` endpoints.
