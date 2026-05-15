---
title: Template First Web Convex Planning Brief 7
program_id: template-first-web-convex-architecture
brief_version: 7
status: current
summary: "Seventh planning brief for the Stripe app-origin webhook and billing-domain synchronization foundation."
read_when:
  - "Writing or resuming the Stripe billing ingress and sync child ExecPlan."
  - "Changing Stripe webhook endpoints, Checkout success synchronization, or Convex billing-domain sync wrappers."
  - "Checking what belongs in the first Stripe route migration slice before Customer Portal, Resend, Cal.com, or refund closeout work."
---

# Template First Web Convex Planning Brief 7

## Slice

Stripe billing ingress and synchronization foundation.

## What Landed

The previous child slice added the public `/worker-seal-team-6` marketing route and wired it into public navigation, robots, sitemap, homepage docs, Program notes, and browser proof. The Program now has all four public landing pages: `/`, `/starter`, `/workers`, and `/worker-seal-team-6`.

## Initiative Facts That Changed

The app no longer needs another public-page slice before returning to provider work. The next risk is billing architecture: Stripe still enters through the older Convex `.site` webhook path and the current Checkout flow still writes legacy generic product-access records before the rebuilt Convex billing-domain tables are the durable source of truth.

The immediate migration target is a Next.js app-origin Stripe webhook route at `/api/stripe/webhook`, with raw-body signature verification, explicit event targeting, secret-gated Convex billing-domain writes, and a Checkout success synchronization path that can converge billing state even when webhook delivery lags.

## Desired Outcome

Add the first real Stripe route migration slice. After this slice, verified app-origin Stripe webhook events and `/checkout/success` retries should both synchronize paid Starter and Workers checkout state into the rebuilt Convex billing-domain tables through narrow server-trusted wrappers. The old fulfillment path may remain as a temporary compatibility lane so current protected access checks keep working, but new billing state must no longer be only theoretical.

This slice also changes provider setup truth. Documentation and preflight logic should stop naming `{NEXT_PUBLIC_CONVEX_SITE_URL}/stripe/webhook` as the canonical Stripe endpoint for the migrated path and should name `{APP_BASE_URL}/api/stripe/webhook` plus the shared Convex sync secret as the active target.

## Scope

In scope:

- Add a Next.js `POST /api/stripe/webhook` route under `apps/web/src/app/api/stripe/webhook/route.ts`.
- Verify Stripe signatures from the raw request body before any event processing.
- Add template-style billing helpers under `apps/web/src/lib/billing/` for Stripe event targeting and sync orchestration.
- Add a server-only Convex billing sync secret based on the template's `CONVEX_WEBHOOK_MUTATION_SECRET` pattern.
- Add secret-gated public Convex wrappers that call the rebuilt billing-domain handlers for Starter license terms, Workers subscriptions, processed Stripe events, and Stripe customer owner lookup.
- Keep the current legacy checkout fulfillment path running during this slice so protected access does not regress before access checks move to the rebuilt billing domain.
- Sync paid Starter Checkout Sessions into `starterLicenseTerms`.
- Sync paid Workers Checkout Sessions with Stripe subscriptions into `workersSubscriptions`.
- Sync subscription lifecycle and renewal invoice events when the Stripe customer can be resolved to an existing Convex billing owner.
- Record skipped or unsupported verified Stripe events in the rebuilt processed-event ledger where possible.
- Trigger the same billing-domain Checkout Session sync from `/checkout/success` as a retry path when webhooks lag.
- Update Stripe provider setup docs, route map docs, environment docs, release workflow docs, and app route config for the new endpoint contract.
- Add focused route and pure-helper tests.
- Update the Program, architecture inventory, and child ExecPlan after implementation.

Out of scope:

- Adding the Workers monthly, quarterly, and annual checkout selector UI.
- Adding Stripe Customer Portal routes for Workers plan changes, cancellation, invoices, or payment method updates.
- Implementing the full Smart Retries email workflow.
- Implementing Resend packages, React Email templates, or any email sending.
- Implementing Sentry package setup.
- Implementing Cal.com embed or Cal.com webhooks.
- Applying full-refund access removal, service fulfillment cancellation, or refund email closeouts.
- Removing the old Convex `/stripe/webhook` route or legacy product-access tables.
- Running destructive billing reset migrations.
- Adding in-app admin refund actions.

## Inputs

- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/program.md`
- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/architecture-migration-inventory.md`
- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/planning-brief-5.md`
- `docs/exec-plans/completed/2026-05-13-convex-billing-domain-rebuild.md`
- `docs/release-workflow.md`
- `apps/web/AGENTS.md`
- `apps/web/ARCHITECTURE.md`
- `apps/web/CONVENTIONS.md`
- `apps/web/convex/_generated/ai/guidelines.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
- `docs/exec-plans/PLANS.md`
- Sibling template Stripe route and billing helpers under `~/Developer/next-js-convex-clerk-stripe-template/src/app/api/stripe/webhook/route.ts` and `~/Developer/next-js-convex-clerk-stripe-template/src/lib/billing/`.
- Stripe documentation for webhook raw-body signature verification and subscription webhook handling.

## Acceptance

- The child ExecPlan records `program_id: "template-first-web-convex-architecture"` and this planning brief path.
- `/api/stripe/webhook` exists and rejects missing or invalid `stripe-signature` requests before sync work starts.
- Verified supported events use fresh Stripe API reads or normalized event-derived identifiers before writing Convex state.
- Convex billing-domain sync writes are gated by `CONVEX_WEBHOOK_MUTATION_SECRET`, not exposed as arbitrary client mutations.
- Paid Starter Checkout Sessions write idempotent `starterLicenseTerms` records.
- Paid Workers subscription Checkout Sessions write idempotent `workersSubscriptions` records when a Stripe subscription is present.
- Subscription and invoice lifecycle events can resolve an existing Stripe customer owner from Convex and sync the latest subscription state.
- Unsupported or unresolvable verified events are recorded as skipped instead of pretending to apply.
- `/checkout/success` attempts the same billing-domain Checkout Session sync as a retry path without replacing the current user-facing success state.
- Provider docs name `{APP_BASE_URL}/api/stripe/webhook`, `STRIPE_WEBHOOK_SECRET`, and `CONVEX_WEBHOOK_MUTATION_SECRET` as the new endpoint contract.
- Release workflow and Stripe preflight expectations no longer reject the app-origin endpoint as stale for this migrated path.
- Focused tests cover route signature behavior, event targeting, Starter sync args, Workers subscription mapping, and skipped-event behavior.
- The slice records exact validation results and any skipped broad gates.

## Watchpoints

- This is P0 billing work. State sync failure should be visible and retriable; do not silently claim a provider event was applied when Convex writes failed.
- Stripe signature verification requires the raw request body. Do not call `request.json()` before `stripe.webhooks.constructEvent`.
- `CONVEX_WEBHOOK_MUTATION_SECRET` must exist in both the Next.js runtime and the target Convex deployment for production, preview, and any hosted billing proof environment that exercises this path.
- The old product-access fulfillment path remains only as compatibility. Do not add new feature behavior that depends on the legacy generic grant as the final source of truth.
- Workers subscription sync needs a Stripe subscription id. If the current Workers checkout remains a one-time payment in an environment, record the event as skipped or blocked rather than inventing subscription state.
- Do not widen this slice into Customer Portal, Resend, Sentry, Cal.com, refund closeouts, or Workers cadence selection. Those remain required Program slices.
