# Web App Architecture

This document is the local architecture contract for `apps/web` and `apps/web/convex`. It copies the ownership model from `~/Developer/next-js-convex-clerk-stripe-template` and expands it for Ship by Sunday's Starter, Workers, and Worker Seal Team 6 products.

Read this with `apps/web/CONVENTIONS.md` before changing routes, billing, auth, Convex modules, provider setup, observability, or transactional email.

## Principles

- Copy the sibling template by default.
- Keep each provider in one lane.
- Model product concepts in Convex before UI or provider routes depend on them.
- Treat provider payloads as sync triggers, not app state.
- Make route ownership obvious from the folder structure.
- Keep billing and fulfillment paths testable from the route handler through Convex state.

## Target Tree

The target shape for this app is:

```text
apps/web/
  src/
    app/
      (marketing)/
      (auth)/
      (app)/
      api/
    components/
      app/
      layout/
      providers/
      ui/
    emails/
    lib/
      analytics/
      app/
      auth/
      billing/
      convex/
      email/
      env/
      sentry/
  convex/
```

Historical route-local `_components/` folders are migration inventory during the T3 Code source migration. New or migrated route implementation should move toward plain source modules under `src/components`, `src/hooks`, and `src/lib`, with route files staying as thin Next.js adapters. Shared product app components belong in `src/components/app`, shared chrome and shells belong in `src/components/layout`, client/server providers belong in `src/components/providers`, and shadcn primitives belong in `src/components/ui`.

## Ownership

### Next.js

Next.js owns route groups, layouts, metadata, route handlers, debug endpoints, and browser-facing integration boundaries. Route groups should move toward the template shape:

- `(marketing)` for public pages: `/`, `/starter`, `/workers`, `/worker-seal-team-6`, blog, and docs.
- `(auth)` for Clerk sign-in and sign-up pages.
- `(app)` for protected product routes, admin routes, billing UI, Starter app routes, and Workers app routes.
- `api/` for integration endpoints only.

Next.js route handlers verify incoming provider requests, derive trusted request origins, create Stripe Checkout and Customer Portal sessions, accept Cal.com webhooks, and call Convex through explicit server-trusted boundaries. Provider-derived billing and booking writes from route handlers must use narrow server-only Convex entry points gated by a shared secret or equivalent server trust check; arbitrary clients must not be able to invoke those writes. Route handlers do not hold durable product truth.

### Convex

Convex owns product data, normalized billing state, service booking mirror state, authorization checks, and entitlement decisions. It should expose query, mutation, action, and internal function boundaries with validators on every function.

Convex code must follow `apps/web/convex/_generated/ai/guidelines.md`. Important local rules are:

- Do not accept a user id as an authorization argument. Derive identity from `ctx.auth.getUserIdentity()`.
- Prefer `identity.tokenIdentifier` for stable auth-linked lookups.
- Put authorization helpers near Convex-owned data instead of duplicating product permissions in components.
- Use indexed queries for growing data and avoid unbounded `.collect()` calls.
- Keep idempotency ledgers for provider events.

### Clerk

Clerk owns identity, session state, sign-in/sign-up UI, and route protection. Clerk does not own workspace truth, billing truth, product roles, or entitlements. Product authorization belongs in Convex.

### Stripe

Stripe owns app-owned Checkout, Customer Portal, invoices, subscription lifecycle, annual license payments, refunds for Starter and Workers, and signed Stripe webhooks.

Stripe webhooks must be verified before any write. Webhook events are sync triggers: the app fetches or reconciles fresh Stripe state, writes normalized state into Convex through a server-trusted boundary, and only then records the provider event as processed.

Starter is not a subscription. Starter purchase and renewal use app-owned Stripe Checkout for one-year license terms. Early renewal extends from the current expiration date; expired renewal starts from verified payment time.

Workers is a subscription product. Workers initial checkout is app-owned. Customer Portal owns plan changes, payment method updates, invoices, and customer-requested cancellation when the portal configuration supports monthly, quarterly, and annual prices plus the required proration policy.

Refunds for this Program are initiated in Stripe or Cal.com provider dashboards. The app mirrors provider truth into Convex. It does not add in-app admin refund actions as part of this Program.

### Cal.com

Cal.com owns Worker Seal Team 6 scheduling: slot selection, timezone handling, intake questions, paid booking, calendar sync, booking confirmation, and rescheduling. The public `/worker-seal-team-6` page embeds Cal.com with a hosted Cal.com fallback link.

Convex mirrors Cal.com booking/payment/refund state for support, fulfillment, internal email workflows, and release proof. Booking a Worker Seal Team 6 call does not create a Clerk account or workspace.

### Resend

Resend owns transactional email delivery through server-only helpers and React Email templates under `src/emails`. Email delivery state is recorded in Convex where idempotency matters.

Customer and internal ops emails are sent from normalized Convex state, not directly from raw webhooks. Stripe and Cal.com still own payment receipts and booking confirmations.

### Sentry

Sentry owns error capture and tracing. Safe context is allowed. Do not attach secrets, webhook signatures, raw provider payloads, payment method details, or sensitive customer content.

### PostHog

PostHog owns product analytics. Stable event names should live in `src/lib/analytics/events.ts`, with client capture in `src/lib/analytics/client.ts` and server capture in `src/lib/analytics/server.ts`.

## Product Routes

The visible public product surface is four landing pages:

- `/` explains the overall offer.
- `/starter` sells the one-time one-year Starter license.
- `/workers` sells the Workers subscription.
- `/worker-seal-team-6` sells the high-ticket paid call/service.

Protected product routes remain product-specific:

- Starter app routes include `/starter/home`, `/starter/generate-codebase`, `/starter/generate-codebase/review`, and Starter learning routes.
- Workers app routes include `/workers/setup`, `/workers/doctor-pass`, `/workers/findings`, `/workers/loops`, `/workers/privacy`, and `/workers/runs`.
- `/billing` is the protected billing-management route. It reads Convex billing state and launches Stripe Customer Portal for authorized Workers subscription management.

## Billing State

Convex should model business state directly instead of hiding it behind one generic access boolean:

- Stripe customer mapping.
- Starter annual licenses with purchase date, term, expiration, renewal behavior, refund status, and active/voided state.
- Workers subscriptions with current period, plan cadence, cancellation intent, `past_due` retry context, recovered-payment context, terminal failure context, refund context, and billing attention state.
- Entitlements derived from valid Starter license and Workers subscription state.
- Worker Seal Team 6 service booking mirrors with Cal.com booking ids, payment references, attendee identity, intake answers, scheduled time, timezone, fulfillment status, refund status, and email delivery state.
- Processed Stripe and Cal.com events for idempotency.

UI reads Convex state. UI does not read raw Stripe, raw Cal.com, route metadata, or cookies as product truth.

## Billing Flows

Starter purchase and renewal use app-owned Stripe Checkout. Renewal checkout creation requires Clerk authentication plus Convex authorization for the target workspace/license. The route should fail closed with 401 for unauthenticated users and 403 for authenticated users without permission.

Workers initial checkout uses the app-owned Stripe Checkout path. Workers plan changes and cancellation use Stripe Customer Portal when the provider configuration supports the final prices and proration policy. Upgrades and longer commitments apply immediately with fair proration. Downgrades and customer-requested cancellation take effect at period end.

Workers failed-payment recovery uses Stripe Smart Retries with 8 retries over 2 weeks, then cancellation if recovery fails. During `past_due`, Workers access remains active. Convex mirrors billing attention state. Owner/admin users see a global non-dismissible app-shell banner while non-billing members are not interrupted.

Refunds are provider-dashboard initiated and mirrored back. Full refunds can change access or future fulfillment by product. Partial refunds are support/accounting state only and do not send automatic product-status or internal ops emails.

## Email Flows

All customer and internal ops emails must be exactly-once from Convex state:

- Workers failed-payment recovery email.
- Workers recovered-payment confirmation email.
- Workers terminal failed-recovery access-ended email.
- Workers cancellation confirmation email.
- Internal billing ops failed/resolved/terminal-closeout emails to `BILLING_OPS_EMAILS`.
- Full-refund customer status email when access or future fulfillment changes.
- Full-refund internal ops closeout email when access or future fulfillment changes.
- Worker Seal Team 6 customer prep email after paid booking sync.
- Worker Seal Team 6 internal ops email after paid booking sync to `WORKER_SEAL_TEAM_6_OPS_EMAILS`.

Webhook acknowledgement must not depend on Resend delivery succeeding.

## Debug And Provider Setup

Development-only debug tools require explicit environment opt-in, not just `NODE_ENV !== "production"`. Every provider integration that adds external setup must document what to create, where values go, how to verify setup, and what breaks when it is missing.

## Migration Status

This document describes the target architecture. The current app now loads the App Router and shared browser source from `apps/web/src`, with `apps/web/src/app`, `apps/web/src/components`, `apps/web/src/lib`, `apps/web/src/platform`, and `apps/web/src/config` as the active source roots. `apps/web/src/platform` remains temporary compatibility debt until later Program slices move provider helpers into named `src/lib/*` lanes. The public landing-page set exists for `/`, `/starter`, `/workers`, and `/worker-seal-team-6`; Worker Seal Team 6 now renders a configured Cal.com embed and hosted fallback link when the public Cal Link is set, and keeps direct scheduling as the missing-config recovery path. The app-origin Cal.com webhook route at `apps/web/src/app/api/cal/worker-seal-team-6/webhook/route.ts` verifies `x-cal-signature-256` and writes normalized booking mirror state through secret-gated Convex billing wrappers. `apps/web/convex` remains at the web root as the backend state and function boundary. Product access implementation lives under `apps/web/convex/entitlements/`, and the public Convex function boundary is `apps/web/convex/entitlements.ts`. The rebuilt billing-domain foundation lives under `apps/web/convex/billing.ts` and `apps/web/convex/billing/`, with additive tables for Stripe customers, Starter license terms, Workers subscriptions, product entitlements, refunds, processed Stripe and Cal.com events, billing email deliveries, and Worker Seal Team 6 booking mirrors. The old `access` module and root checkout validator shims have been removed. A confirm-gated legacy reset migration exists at `apps/web/convex/migrations/legacyBillingReset.ts` for operator-run cleanup before provider routes are rewired to the rebuilt billing model. Use `docs/programs/active/2026-05-13-template-first-web-convex-architecture/architecture-migration-inventory.md` for the current-to-target map and deviation register.
