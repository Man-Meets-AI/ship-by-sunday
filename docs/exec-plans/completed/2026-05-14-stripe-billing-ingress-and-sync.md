---
title: Stripe Billing Ingress And Sync
status: complete
created_at: 2026-05-14
completed_at: 2026-05-14
summary: Move Stripe webhook ingress and Checkout success retries onto a template-style Next.js route that syncs paid billing state into the rebuilt Convex billing domain.
post_build_recap: Added `/api/stripe/webhook`, server-only Stripe event/sync helpers, secret-gated Convex billing sync wrappers, Workers subscription checkout mode, Checkout success billing sync retry, app-origin Stripe preflight/docs, and focused tests. The legacy Convex `/stripe/webhook` remains compatibility-only.
program_id: "template-first-web-convex-architecture"
planning_brief: "docs/programs/active/2026-05-13-template-first-web-convex-architecture/planning-brief-7.md"
read_when:
  - "Resuming the Stripe billing ingress migration."
  - "Changing /api/stripe/webhook, Checkout success synchronization, or Convex billing sync wrappers."
  - "Validating provider setup docs for the migrated Stripe endpoint."
---

# Stripe Billing Ingress And Sync

This document is a living execution plan for the first Stripe route migration slice in the template-first web and Convex architecture Program.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Buyers should be able to pay through Stripe and have Ship by Sunday record durable product-specific billing state in Convex, not just a legacy generic access grant. This slice introduces the app-origin Stripe webhook route and Checkout success retry path that write paid Starter and Workers state into the rebuilt billing domain. A maintainer can see it working through route tests, pure sync-mapping tests, and docs that name the new provider endpoint contract.

## Progress

- [x] 2026-05-14: Read the Program packet, Program rules, ExecPlan rules, app architecture docs, Convex AI guidelines, release workflow docs, local Next.js route-handler docs, sibling template billing route code, and official Stripe webhook guidance.
- [x] 2026-05-14: Wrote immutable Program planning brief 7 and pointed `current-planning-brief.txt` at it.
- [x] 2026-05-14: Added the Next.js app-origin Stripe webhook route and template-style billing helpers.
- [x] 2026-05-14: Added secret-gated Convex billing sync wrappers and regenerated/deployed hosted Convex dev functions with `bunx convex codegen`.
- [x] 2026-05-14: Wired Checkout success into the same billing-domain sync path without changing the visible success UI contract.
- [x] 2026-05-14: Updated provider setup docs, route docs, Program docs, release workflow docs, local Stripe helper scripts, and architecture inventory.
- [x] 2026-05-14: Ran focused tests, plan/program markdown lint, app static checks, and repo-level format/lint/typecheck gates.

## Surprises & Discoveries

The current production contract still intentionally points Stripe at the Convex `.site` HTTP action and explicitly rejects enabled app-origin `/api/stripe/webhook` endpoints during release preflight. This slice must update docs and preflight expectations in the same change as the route, or operators will have contradictory setup instructions.

## Decision Log

Decision: Keep legacy checkout fulfillment during this slice while adding new billing-domain sync.
Rationale: Current protected access checks still depend on legacy product-access records. Removing that lane before the rebuilt billing domain powers access checks would regress paid buyers. Date: 2026-05-14.

Decision: Use `CONVEX_WEBHOOK_MUTATION_SECRET` for app-to-Convex billing sync.
Rationale: This matches the sibling template pattern, describes a server-trusted webhook mutation boundary, and avoids expanding the old checkout retry secret into unrelated subscription and provider-event writes. Date: 2026-05-14.

Decision: Do not implement Customer Portal, Resend, Sentry, Cal.com, or refund closeouts in this child plan.
Rationale: The first durable migration step is webhook ingress plus billing-domain state sync. Absorbing every remaining billing requirement would make validation too broad and leave no clean checkpoint. Date: 2026-05-14.

## Outcomes & Retrospective

The migrated route now verifies Stripe signatures at `POST /api/stripe/webhook` from the raw request body, classifies Checkout, subscription, invoice, and unsupported events, and syncs fresh Stripe state into the rebuilt Convex billing domain through `CONVEX_WEBHOOK_MUTATION_SECRET`-gated wrappers. Starter Checkout sessions sync annual license terms; Workers Checkout and subscription/invoice events sync subscription state, cadence, invoice/recovery fields, and processed Stripe event receipts. Refund events remain outside this first ingress slice until the dedicated refund reconciliation path can update product state instead of acknowledging a no-op.

Workers Checkout now uses Stripe subscription mode. Managed Stripe preflight requires Workers prices to be recurring, expects the Stripe Dashboard endpoint at `{APP_BASE_URL}/api/stripe/webhook`, rejects wildcard event lists, and treats enabled Convex `.site` `/stripe/webhook` endpoints as stale.

The old Convex `/stripe/webhook` route remains compatibility-only for this slice because legacy product-access fulfillment still exists. Follow-up slices still need Customer Portal, `/api/billing/*` route reshaping, Resend billing email sends, Cal.com webhook sync, refund closeouts, and eventual removal of the legacy Convex webhook after provider dashboards and release proof no longer depend on it.

Validation passed:

- `bun run --cwd apps/web test:unit -- tests/unit/stripe-billing-webhooks.test.ts tests/unit/stripe-billing-sync.test.ts tests/unit/convex-billing-sync-boundary.test.ts tests/unit/checkout-session-params.test.ts tests/unit/stripe-line-item.test.ts`
- `bun run --cwd apps/web test:integration -- tests/integration/stripe-webhook-route.test.ts tests/integration/stripe-checkout-route.test.ts`
- `bun run format:check`
- `bun lint`
- `DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck`
- `bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-stripe-billing-ingress-and-sync.md`
- `bun run programs:lint`
- `bun run markdown:lint -- --paths docs/programs/active/2026-05-13-template-first-web-convex-architecture docs/exec-plans/completed/2026-05-14-stripe-billing-ingress-and-sync.md docs/release-workflow.md apps/web/src/content/docs`
- `git diff --check`

## Context and Orientation

The current checkout creation route is `apps/web/src/app/api/stripe/checkout/route.ts`, with Express Checkout at `apps/web/src/app/api/stripe/checkout/express/route.ts`. Both create Checkout Sessions with metadata from `apps/web/src/platform/billing/checkout/checkout-session-params.ts` and `apps/web/src/platform/billing/checkout/checkout-metadata.ts`.

The current Stripe webhook receiver is the Convex HTTP action in `apps/web/convex/http.ts` at `POST /stripe/webhook`. It calls `apps/web/convex/stripeWebhook.ts`, which writes legacy access and checkout-claim state. The rebuilt billing domain from the previous Program slice lives in `apps/web/convex/billing.ts` and `apps/web/convex/billing/model.ts`, with tables in `apps/web/convex/schema.ts` for `starterLicenseTerms`, `workersSubscriptions`, `stripeCustomers`, `processedStripeEvents`, refunds, email deliveries, and Worker Seal Team 6 bookings.

This slice adds the template-style app-origin route at `apps/web/src/app/api/stripe/webhook/route.ts` and new sync helpers under `apps/web/src/lib/billing/`. The route must read the raw request body with `request.text()` before calling Stripe signature verification. Convex sync wrappers must be public only because Next.js needs to call them; each wrapper must verify `CONVEX_WEBHOOK_MUTATION_SECRET` before writing.

### In Scope

This plan covers `/api/stripe/webhook`, server-only Stripe event targeting and sync helpers, secret-gated Convex billing sync wrappers, Checkout success sync retry, the Stripe provider setup docs, the release workflow endpoint contract, and focused tests for those surfaces.

### Out Of Scope

This plan does not add Workers cadence selection UI, Stripe Customer Portal routes, Resend email sending, Sentry setup, Cal.com integration, refund access-removal closeouts, destructive migrations, or in-app admin refund actions. It also does not delete the old Convex `/stripe/webhook` compatibility route.

## Plan of Work

First, add Convex environment support for `CONVEX_WEBHOOK_MUTATION_SECRET` in `apps/web/convex/env.ts` and `apps/web/src/platform/env/server.ts`. Then extend `apps/web/convex/billing.ts` with public secret-gated wrappers for Starter license sync, Workers subscription sync, processed Stripe event recording, and Stripe customer owner lookup.

Next, add template-style billing helpers under `apps/web/src/lib/billing/`. One helper should classify verified Stripe events into checkout-session, subscription, invoice, ignored, or skipped targets. Another helper should fetch fresh Stripe state, call the legacy checkout fulfillment compatibility action when a paid Checkout Session needs an owner, map Starter sessions into annual license terms, map Workers subscription state into Convex fields, and record skipped provider events.

Then add `apps/web/src/app/api/stripe/webhook/route.ts`. The handler should read `request.text()`, require `stripe-signature`, construct the Stripe event with `STRIPE_WEBHOOK_SECRET`, call the sync helper, and return JSON. Invalid signatures return 400. Sync failures return a non-2xx response so Stripe can retry.

After that, update `apps/web/src/app/checkout/success/page.tsx` so a paid Checkout Session can attempt the same billing-domain sync as a retry path after the existing success-state resolution. This must not replace the visible checkout-success behavior.

Finally, update `apps/web/src/app/api/_lib/api-route-config.ts`, `apps/web/src/platform/billing/managed-stripe-config.ts`, `apps/web/.env.local.example`, `apps/web/src/content/docs/environment-variables.mdx`, `apps/web/src/content/docs/stripe-checkout-webhook.mdx`, `apps/web/src/content/docs/route-map.mdx`, `apps/web/src/content/docs/troubleshooting/stripe-convex.mdx`, `docs/release-workflow.md`, the Program, and the architecture inventory.

## Milestones

Milestone 1 adds the Convex sync boundary. It is complete when Next.js can call billing-domain sync wrappers only with `CONVEX_WEBHOOK_MUTATION_SECRET`, and tests prove unauthorized calls fail.

Milestone 2 adds event targeting and state mapping. It is complete when pure tests prove Checkout, subscription, invoice, and unsupported events route to the right sync behavior, and Workers cadence mapping fails fast for unsupported recurring intervals.

Milestone 3 adds the app-origin webhook route. It is complete when route tests prove missing signatures and invalid signatures fail before sync, supported verified events sync, and sync failures return retryable responses.

Milestone 4 wires Checkout success retry and provider docs. It is complete when `/checkout/success` attempts billing-domain sync without changing the current success UI, docs name the new endpoint, and release preflight expectations match the new route.

## Concrete Steps

From the repository root, inspect the files before editing:

    sed -n '1,220p' apps/web/convex/billing.ts
    sed -n '1,220p' apps/web/src/app/api/stripe/checkout/route.ts
    sed -n '1,220p' apps/web/src/platform/billing/managed-stripe-config.ts

After implementation, run the focused tests first:

    bun run --cwd apps/web test:unit -- tests/unit/stripe-billing-sync.test.ts tests/unit/stripe-billing-webhooks.test.ts tests/unit/convex-billing-sync-boundary.test.ts
    bun run --cwd apps/web test:integration -- tests/integration/stripe-webhook-route.test.ts tests/integration/stripe-checkout-route.test.ts

Then run plan and Program validation:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-stripe-billing-ingress-and-sync.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/active/2026-05-13-template-first-web-convex-architecture docs/exec-plans/completed/2026-05-14-stripe-billing-ingress-and-sync.md docs/release-workflow.md apps/web/src/content/docs
    git diff --check

Finish with narrow app static checks and broaden only if the focused surface passes:

    bun run --cwd apps/web format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck

## Validation and Acceptance

The implementation is accepted when verified Stripe webhook requests at `/api/stripe/webhook` can synchronize paid Starter and Workers billing state into Convex through the new secret-gated wrappers; missing signatures, invalid signatures, and unconfigured sync secrets fail clearly; unsupported events are recorded as skipped where possible; `/checkout/success` retries the same sync path without changing the visible success contract; and provider docs name the app-origin webhook endpoint.

### Test Commands

Run these commands from the repository root:

    bun run --cwd apps/web test:unit -- tests/unit/stripe-billing-sync.test.ts tests/unit/stripe-billing-webhooks.test.ts tests/unit/convex-billing-sync-boundary.test.ts
    bun run --cwd apps/web test:integration -- tests/integration/stripe-webhook-route.test.ts tests/integration/stripe-checkout-route.test.ts
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-stripe-billing-ingress-and-sync.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/active/2026-05-13-template-first-web-convex-architecture docs/exec-plans/completed/2026-05-14-stripe-billing-ingress-and-sync.md docs/release-workflow.md apps/web/src/content/docs
    git diff --check
    bun run --cwd apps/web format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck

## Idempotence and Recovery

Stripe may deliver duplicate events and `/checkout/success` may retry after the webhook already ran. Sync functions must converge on the same Starter license term by `stripeCheckoutSessionId`, the same Workers subscription by `stripeSubscriptionId`, and the same processed Stripe event by `stripeEventId`. If a webhook sync fails after signature verification, return a retryable non-2xx response instead of recording a false applied event.

If provider setup is incomplete, the route should fail with a clear missing-env error in local tests or logs. Do not add fallback secrets or unauthenticated Convex writes.

## Artifacts and Notes

The official Stripe webhook guidance says signature verification depends on the raw request body, the `Stripe-Signature` header, and the endpoint secret. The local Next.js route-handler docs confirm route handlers live under the `app` directory and support native `Request` and `Response` APIs.

The dirty working tree currently includes unrelated `packages/codebase-compiler` and `templates/starter-app` changes. This plan must not touch or revert those files.

## Interfaces and Dependencies

This plan depends on the official Stripe Node SDK already installed in `apps/web`, Next.js App Router route handlers, `convex/nextjs` server calls, Clerk-backed checkout fulfillment compatibility actions, `apps/web/convex/billing.ts`, `apps/web/convex/billing/model.ts`, `apps/web/convex/schema.ts`, `apps/web/src/platform/billing/stripe.ts`, `apps/web/src/platform/billing/checkout/checkout-metadata.ts`, `apps/web/src/platform/billing/checkout/checkout-offers.ts`, `apps/web/src/platform/env/server.ts`, and provider setup values `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CHECKOUT_FULFILLMENT_RETRY_SECRET`, and `CONVEX_WEBHOOK_MUTATION_SECRET`.
