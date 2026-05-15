---
title: "Template First Web Convex Research"
summary: "Research pass comparing the sibling template's architecture with the current Ship by Sunday web and Convex setup."
docType: "research_pass"
status: "active"
read_when:
  - "Re-entering the template-first web and Convex architecture Program."
  - "Checking why the sibling template is the preferred source shape."
---

# Template First Web Convex Research

## Sibling Template

The sibling repo at `~/Developer/next-js-convex-clerk-stripe-template` is organized around a clear provider and product ownership model. Its `ARCHITECTURE.md` says to keep each vendor in one lane, model product concepts in Convex first, keep integration boundaries thin, and make route ownership obvious. Its `CONVENTIONS.md` says billing state belongs in Convex, provider payloads should not become primary app state, auth rules belong in Convex helpers, optional environment variables are validated where they are used, debug routes must be disabled in production, and observability should be initialized through the framework-supported entry points.

The file tree reinforces those rules:

- `src/app/(marketing)` for public product pages.
- `src/app/(auth)` for Clerk sign-in and sign-up pages.
- `src/app/(app)` for authenticated product routes.
- `src/app/api` for integration endpoints.
- `src/components/app`, `src/components/layout`, `src/components/providers`, and `src/components/ui` for focused presentation boundaries.
- `src/lib/analytics`, `src/lib/app`, `src/lib/auth`, `src/lib/billing`, `src/lib/convex`, `src/lib/email`, `src/lib/env`, and `src/lib/sentry` for named provider/domain helpers.
- `src/emails` for React Email templates.
- `convex` modules such as `auth.ts`, `billing.ts`, `stripe_customers.ts`, `subscriptions.ts`, `entitlements.ts`, and domain feature files.

The billing flow is especially relevant. The template routes users through `/api/billing/checkout`, resolves auth and Convex state, creates Stripe Checkout, syncs state on success, verifies Stripe webhooks, writes normalized Stripe state into Convex through a server boundary, and lets UI read Convex state. Its route tests cover checkout, portal, success, and webhook behavior. The template tracks Checkout and subscription lifecycle webhooks, not failed-payment invoice emails. It also treats `past_due` as active for entitlement purposes through its billing status helpers. The template's protected billing UI is a dedicated `/billing` page that reads Convex state and gates checkout/portal actions by billing-management role; it does not include a global `past_due` banner.

The template also treats Sentry and Resend as ordinary providers. Sentry is wired through `@sentry/nextjs`, `next.config.ts`, instrumentation files, server/edge config files, and a debug route gated by env. Resend owns transactional email helpers and test/debug email routes.

## Current Web App

The current `apps/web` app has no `src/` tree. It uses top-level `app`, `components`, `config`, `content`, `convex`, `lib`, and `platform` directories. Route grouping is based on current product history rather than the template's conventions, with groups such as `(identity)` and `(protected)` and several public feature routes outside those groups.

The current provider boundaries are mixed. `platform/` contains env, auth, billing, Convex, and Next adapters. `lib/` contains durable domain logic, but the distinction between durable domain code and adapter code is not as obvious as the sibling template's named provider folders.

Current checkout work includes useful validation, rate limiting, support-mode blocks, purchase-intent state, and managed price handling. Webhook handling is currently exposed through Convex HTTP under a Convex `.site` URL, and release docs declare that endpoint canonical. That contract may have been appropriate for the current app, but it should not be treated as a constraint on the future architecture when billing is the exact area that needs a stronger reset.

Observability currently leans on PostHog for analytics and generic error/source-map ownership. Sentry is not first-class in `apps/web/package.json`, and Resend is not installed as a web app provider. Debug controls exist in narrower forms, but the template's `ENABLE_DEBUG_TOOLS` style gives a cleaner app-wide operator boundary.

## Billing Direction

The future product model is a three-offer catalog: Starter as a one-time one-year license, Workers as monthly/quarterly/annual subscription variants, and Worker Seal Team 6 as a $500 hands-on one-hour paid booking. The template's subscription model is a strong base, but it must be expanded to include an annual license lane and a Cal.com-mirrored service booking lane rather than forcing every paid offer through subscriptions.

Stripe should remain the provider source for the app-owned Starter and Workers checkout, Workers portal, invoice/payment/subscription/license events, refund events, and webhook signatures. Starter renewal should be a fresh app-owned Stripe Checkout purchase for a new one-year license term, not a Customer Portal renewal; early renewal extends from the current expiration date, while expired renewal starts from verified payment time. Starter renewal checkout creation must require Clerk authentication and Convex authorization for the target workspace/license. Workers plan changes between monthly, quarterly, and annual should use Stripe Customer Portal when the portal is configured for the three prices and desired proration behavior: upgrades and longer commitments apply immediately with fair proration, while downgrades take effect at the end of the current billing period. Workers cancellation should also use Customer Portal, retain access through the paid period, mirror `cancel_at_period_end` plus final canceled state in Convex, and trigger one branded Resend confirmation email after scheduled cancellation is mirrored. Failed Workers renewal payments should use Stripe Smart Retries with 8 retries over 2 weeks, keep access active during that recovery window while Convex mirrors `past_due`, retry context, billing attention, one branded customer recovery email per failed renewal invoice, one branded recovered-payment confirmation email after a previously failed renewal invoice recovers, one final branded customer access-ended email when failed-payment recovery ends in cancellation, one internal billing ops alert email per failed renewal invoice to `BILLING_OPS_EMAILS`, one internal billing ops resolved email after recovery, and one internal billing ops closeout email after retry-exhausted cancellation. `BILLING_OPS_EMAILS` is a maintainer-owned internal recipient list for payment issues, initially the operator/support email, not a Clerk role or workspace concept. The app should remove entitlements when Stripe cancels the subscription after failed recovery, then send the terminal failed-recovery access-ended email and internal billing ops closeout email from Convex-mirrored state with dedicated idempotency keys separate from normal cancellation confirmation and recovery emails. Refunds should also use the same sync-first rule: refunds are initiated in Stripe or Cal.com provider dashboards for this Program, refund events and Cal.com cancellation/refund-related booking state trigger fresh provider reconciliation, then Convex applies product-specific full-refund rules. The app should not add in-app admin refund actions in this Program. Refund approval stays manual/support/admin-owned rather than easy or self-serve. Full Starter refunds void the associated license term; full Workers refunds remove subscription-derived access only when Stripe also reports the subscription canceled, terminal, or voided for the refunded period; full undelivered Worker Seal Team 6 refunds mark service fulfillment canceled/refunded; and partial refunds are mirrored for support/accounting without access or fulfillment changes. Full refunds that change access or future fulfillment should send exactly one branded customer status email from Convex-mirrored state, without duplicating Stripe or Cal.com receipt details, plus exactly one internal ops closeout email. Starter and Workers refund closeouts go to `BILLING_OPS_EMAILS`; Worker Seal Team 6 undelivered-booking refund closeouts go to both `BILLING_OPS_EMAILS` and `WORKER_SEAL_TEAM_6_OPS_EMAILS`. Partial refunds do not send automatic internal ops email in this target program. The failed-payment UI should expand the template's role-aware `/billing` pattern with a global non-blocking app-shell banner for owners/admins only, while `/billing` remains the detailed state surface. The banner should not have dismiss or snooze state while Convex still reports active billing attention; it clears from Stripe-derived Convex state after recovery or terminal cancellation. The failed-payment email path is an intentional expansion of the template, but it should keep the template's sync-first webhook rule: `invoice.payment_failed` and `invoice.paid` verify at the route, trigger fresh Stripe state sync, write normalized Convex state through the secret-gated boundary, and never turn the raw invoice payload into primary app state. Cal.com should own Worker Seal Team 6 slot selection, payment collection through its Stripe connection, booking lifecycle, rescheduling, and calendar sync. Convex should own normalized customer, subscription, license, refund, Worker Seal Team 6 booking mirror, entitlement or fulfillment, processed Stripe event, processed Cal.com event, and email delivery state. UI and authorization should read Convex state, not raw provider payloads or ad hoc route metadata.

The first billing implementation slice should assume duplicate webhooks, delayed events, success-page retries, missing provider config, expired licenses, canceled subscriptions, unsynced Cal.com bookings, refund events, and partially completed checkout or booking flows. Those are the real failure modes that have hurt customers.

## Research Conclusion

The right initiative shape is a template-first migration Program for `apps/web` and `apps/web/convex`. It should not optimize for minimal churn in the current folder tree. It should use the sibling template's docs and structure as the default and make deviations explicit.

The migration should be split into several child ExecPlans because the surface spans P0 billing, P0/P1 auth and authorization, provider setup, route restructuring, Convex schema changes, and release docs. The first slice should write the app-level architecture/conventions contract and migration inventory so later file moves and billing rebuilds have one checked-in source of truth.
