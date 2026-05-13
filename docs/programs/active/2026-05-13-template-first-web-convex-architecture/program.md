---
program_id: "template-first-web-convex-architecture"
title: "Template First Web And Convex Architecture"
status: "active"
created_at: "2026-05-13"
completed_at: null
summary: "Move apps/web and its Convex backend toward the sibling Next.js Convex Clerk Stripe template's architecture, conventions, route groups, observability, email, billing, and tests."
post_build_recap: null
read_when:
  - "Planning or executing the apps/web architecture migration."
  - "Changing web app routing, Convex modules, billing, Sentry, Resend, or provider env conventions."
  - "Deciding whether current Ship by Sunday web architecture or the sibling template should win."
---

# Template First Web And Convex Architecture

This Program is the living initiative document for moving the Ship by Sunday web app and Convex backend to a template-first architecture.

Maintain this Program in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

The current `apps/web` architecture is not trusted enough for the next billing era. This Program exists to move the web app and its Convex backend as close as practical to `~/Developer/next-js-convex-clerk-stripe-template`, especially the logic in that template's `ARCHITECTURE.md` and `CONVENTIONS.md`.

The target is not a light cleanup. The sibling template is the default source of gravity for routing, provider ownership, Convex module shape, env validation, debug tools, Sentry, Resend, Stripe billing routes, webhook handling, and route tests. Current code should only win when a concrete product requirement, data migration requirement, or release safety constraint proves that the template pattern needs an intentional adaptation.

Standing interview rule: do not ask whether to copy a template pattern. Copy it. Only ask when the decision is a product-specific expansion, a customer-experience tradeoff, or a deliberate deviation from the template.

The billing target is a three-offer catalog across four public landing pages: `/` as the main marketing entry, `/starter` for the one-time one-year Starter license, `/workers` for the Workers subscription with monthly, quarterly, and annual variants, and `/worker-seal-team-6` for the $2500 hands-on one-hour service. Completion means the app has a clearer file tree, a smaller provider boundary surface, durable billing and fulfillment state in Convex, audited Stripe fulfillment paths, route-level billing tests, first-class Sentry and Resend setup, and docs that tell future agents which conventions are now law.

Plain-English framing: this began as four landing pages, but each page points at a different product, payment model, fulfillment path, and provider boundary. The Program ships those pages by adopting the better template architecture underneath them, because these routes are tied to revenue flows the app cannot afford to keep messy. The visible output is stronger product pages; the durable outcome is cleaner architecture, safer billing, clearer provider ownership, better customer communications, and better agent/developer ergonomics.

## Program Inputs

- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/research-pass-template-and-current-web-convex.md`
- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/normalized-pass-template-first-target.md`
- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/converged-decision-packet.md`
- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/dependency-graph.md`
- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/plan-split-recommendation.md`
- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/cross-repo-review.md`
- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/planning-brief-1.md`
- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/architecture-migration-inventory.md`
- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/worker-seal-team-6-booking-research.md`
- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/current-planning-brief.txt`
- Sibling template source: `~/Developer/next-js-convex-clerk-stripe-template`
- Current app source: `apps/web`
- Current Convex source: `apps/web/convex`

## Current State

The sibling template has the architecture this Program wants to adopt: `src/app/(marketing)`, `src/app/(auth)`, `src/app/(app)`, explicit `api/` integration routes, `src/components/app`, `src/components/layout`, `src/components/providers`, `src/lib/{analytics,app,auth,billing,convex,email,env,sentry}`, `src/emails`, and small Convex domain modules. Its docs define crisp ownership: Next.js owns routes and integration endpoints, Convex owns product data/domain/authorization, Clerk owns identity, Stripe owns checkout/portal/subscription lifecycle, Resend owns transactional email, PostHog owns product analytics, and Sentry owns errors/tracing.

The current app has useful production logic, but its shape fights that model. It has no `src/` boundary, route groups such as `(identity)` and `(protected)` rather than the template's `(auth)` and `(app)`, a broad `platform/` layer, PostHog-only error handling, no first-class Resend integration, and Stripe fulfillment split across current checkout routes plus a Convex HTTP webhook contract. Billing is also entering a new product model, so preserving the current route and webhook structure by default would carry forward the exact area the team does not trust.

## Progress

- [x] 2026-05-13: Compared the sibling template architecture and conventions against the current `apps/web` and Convex setup.
- [x] 2026-05-13: Reframed the initiative around a template-first migration instead of a current-code-preserving cleanup.
- [x] 2026-05-13: Confirmed billing must support Starter as a one-time one-year license, Workers as monthly/quarterly/annual subscription variants, and Worker Seal Team 6 as a $2500 one-hour service offer.
- [x] 2026-05-13: Confirmed Sentry and Resend are in scope.
- [x] 2026-05-13: Created this Program packet for the web app and Convex migration.
- [x] 2026-05-13: Set the interview and implementation default to copy template patterns without re-confirming them.
- [x] 2026-05-13: Researched the Worker Seal Team 6 booking branch around shadcn calendar/form UI, Google Calendar FreeBusy/events, Stripe Checkout fulfillment, and Convex-owned service state, then replaced it with a Cal.com-first service booking target.
- [x] 2026-05-13: Selected Cal.com as the primary Worker Seal Team 6 booking and paid-scheduling surface, demoting the custom Google Calendar/shadcn booking build to fallback.
- [x] 2026-05-13: Selected embedded Cal.com as the primary Worker Seal Team 6 booking surface, with the hosted Cal.com booking page retained as a fallback link.
- [x] 2026-05-13: Decided Worker Seal Team 6 booking should not require Clerk sign-in or post-booking workspace setup; it is a paid meeting, not app onboarding.
- [x] 2026-05-13: Decided Worker Seal Team 6 should send one branded Resend prep email after paid booking sync, without onboarding or workspace language.
- [x] 2026-05-13: Decided Worker Seal Team 6 prep email dispatch requires paid booking confirmation mirrored in Convex; created/payment-initiated events are not enough.
- [x] 2026-05-13: Decided Worker Seal Team 6 should send one internal Resend ops email after paid booking sync, using a separate idempotency key from the customer prep email.
- [x] 2026-05-13: Decided `WORKER_SEAL_TEAM_6_OPS_EMAILS` is the ops-recipient env contract and is required in production.
- [x] 2026-05-13: Decided Starter license renewal is a fresh app-owned Stripe Checkout purchase, not Stripe Customer Portal renewal.
- [x] 2026-05-13: Decided early Starter renewal extends from the current expiration date; expired renewal starts from verified payment time.
- [x] 2026-05-13: Decided Starter renewal requires Clerk authentication and Convex authorization for the workspace/license being renewed.
- [x] 2026-05-13: Decided Workers plan changes between monthly, quarterly, and annual should use Stripe Customer Portal when the portal configuration supports the three prices and desired proration behavior.
- [x] 2026-05-13: Decided Workers upgrades and longer commitments apply immediately with fair proration, while downgrades take effect at the end of the current billing period.
- [x] 2026-05-13: Decided Workers cancellation is Stripe Customer Portal-owned, with access retained until the paid period ends.
- [x] 2026-05-13: Decided Workers cancellation should trigger one branded Resend confirmation email after Convex mirrors period-end cancellation.
- [x] 2026-05-13: Decided Workers keeps access during Stripe's failed-payment retry window, mirrors `past_due`, and removes access only after Stripe moves the subscription to `unpaid` or `canceled`.
- [x] 2026-05-13: Decided Workers failed-payment recovery uses Stripe Smart Retries with 8 retries over 2 weeks, then cancels the subscription if recovery fails.
- [x] 2026-05-13: Decided Workers failed-payment recovery sends one branded customer Resend email per failed renewal invoice after Convex first mirrors `past_due`, without a custom multi-email dunning sequence.
- [x] 2026-05-13: Rechecked the sibling template billing/email implementation and aligned failed-payment recovery with its sync-first webhook and server-only email boundaries.
- [x] 2026-05-13: Decided Workers failed-payment recovery also sends one internal Resend billing ops email when Convex first mirrors `past_due`, using `BILLING_OPS_EMAILS`.
- [x] 2026-05-13: Decided Workers `past_due` billing attention appears as a global non-blocking app-shell banner for owners/admins, with detailed state on `/billing`.
- [x] 2026-05-13: Decided the Workers `past_due` billing attention banner is not dismissible or snoozable while Convex still reports active billing attention.
- [x] 2026-05-13: Decided Workers sends one branded customer recovered-payment confirmation email after Convex mirrors recovery for a previously failed renewal invoice.
- [x] 2026-05-13: Clarified `BILLING_OPS_EMAILS` means a maintainer-owned internal recipient list, initially the operator/support email, not a Clerk or workspace role.
- [x] 2026-05-13: Decided recovered Workers failed payments also send one internal resolved email to `BILLING_OPS_EMAILS`.
- [x] 2026-05-13: Decided terminal Workers failed-payment recovery cancellation sends one final branded customer access-ended email after Convex mirrors the provider-driven cancellation.
- [x] 2026-05-13: Decided terminal Workers failed-payment recovery cancellation also sends one internal billing ops closeout email to `BILLING_OPS_EMAILS`.
- [x] 2026-05-13: Decided full refunds update Convex access or fulfillment state, while partial refunds are mirrored for support/accounting without changing access.
- [x] 2026-05-13: Decided full refunds that change access or fulfillment send one branded customer status email, while refunds remain manual/support-approved rather than easy or self-serve.
- [x] 2026-05-13: Decided full refunds that change access or fulfillment also send one internal ops closeout email after Convex mirrors the refund state change.
- [x] 2026-05-13: Decided partial refunds do not trigger automatic internal ops email; they remain support/accounting mirror state.
- [x] 2026-05-13: Decided refunds are initiated in Stripe or Cal.com provider dashboards for this Program; the app mirrors provider truth into Convex and does not add in-app admin refund actions.
- [x] 2026-05-13: Added `program-example-use-case.md` at the repo root and refreshed this Program's high-level framing.
- [x] 2026-05-13: Completed child ExecPlan 1, `docs/exec-plans/completed/2026-05-13-web-convex-architecture-contract-and-inventory.md`, adding `apps/web/ARCHITECTURE.md`, `apps/web/CONVENTIONS.md`, an `apps/web/AGENTS.md` pointer, and `architecture-migration-inventory.md`.

## Decision Log

Decision: Treat the sibling template as the source of gravity.
Rationale: Its architecture and conventions are clearer, especially around provider ownership and billing state. Current Ship by Sunday code should not bias the target when the user has explicitly identified it as untrusted.

Decision: Do not re-ask whether to copy a template pattern.
Rationale: The user has repeatedly made the template-first rule explicit. Future questions should focus only on product-specific expansions, customer-experience tradeoffs, or intentional deviations.

Decision: Scope this Program to `apps/web` and `apps/web/convex`.
Rationale: The runtime web app and its Convex backend are the failing surfaces. Generated customer repo work, compiler output, and broader product packaging can reference this Program later but are not the owning scope here.

Decision: Prefer the template file and folder structure.
Rationale: A close structural match makes the codebase easier to read, easier to compare with the template, and easier for future agents to navigate. Deviations require an explicit decision and reason.

Decision: Move route groups toward `(marketing)`, `(auth)`, `(app)`, and `api/`.
Rationale: The template groups routes by product intent and integration boundary. That is clearer than preserving current route group names for familiarity.

Decision: Do not preserve current customer-facing URLs by default.
Rationale: The target architecture should not carry historical route shape forward for continuity alone. Template route conventions and the best future product IA win unless a later slice proves a temporary migration bridge is required for a live provider callback, active customer, or release cutover.

Decision: Keep `/starter` and `/workers` as public marketing pages under `(marketing)`.
Rationale: Product sales pages belong in the marketing route group. Protected product work can live under product-specific child paths without colliding with the public product pages.

Decision: Add `/worker-seal-team-6` as a public marketing page under `(marketing)`.
Rationale: The hands-on service is a distinct customer-facing offer with its own promise, price, checkout/fulfillment expectations, and customer handoff. It should be modeled as a first-class landing page rather than hidden inside the Workers subscription page.

Decision: Treat `/`, `/starter`, `/workers`, and `/worker-seal-team-6` as the target public landing-page set.
Rationale: The home page is the main marketing entry, while each paid offer gets a focused route. This keeps customer decisions clear and gives future agents stable places to attach pricing, checkout, SEO, analytics, and proof.

Decision: Retire `platform/` as a permanent architecture boundary unless a slice proves a concrete need to keep part of it.
Rationale: The template uses direct, named domain/provider folders under `src/lib/`, which is easier to scan than a broad adapter layer.

Decision: Rebuild billing around Stripe customer, subscription, annual license, entitlement, and processed-event state in Convex for Starter and Workers.
Rationale: Workers subscriptions and Starter annual licenses need explicit domain state. Worker Seal Team 6 is now a Cal.com-backed service booking and should be mirrored in Convex through Cal.com/Stripe events rather than forced through the app-owned subscription/license model.

Decision: Renew Starter through fresh app-owned Stripe Checkout, not Customer Portal.
Rationale: Starter is a one-time one-year license, not a subscription. Renewal should be modeled as a new app-created Checkout Session for a new license term. Convex should keep the old license record, create the new term after verified payment, and derive entitlement from the active term. Stripe Customer Portal should be reserved for Workers subscription management: payment methods, invoices, cancellation, and plan changes where supported.

Decision: Extend early Starter renewals from the current expiration date.
Rationale: A customer should never lose paid time by renewing early. If a Starter license is still active when renewal payment is verified, the renewed term starts at the current license expiration. If the license is already expired, the renewed term starts at the verified payment time. This gives customers the fairest result and keeps term calculation deterministic.

Decision: Require authenticated ownership/permission for Starter renewal.
Rationale: Starter renewal mutates app-owned license and entitlement state, so it belongs behind Clerk auth plus Convex authorization. The renewal route should verify the signed-in user can manage the target workspace/license before creating Stripe Checkout. The webhook still verifies payment and finalizes the term, but checkout creation must fail closed with 401 for unauthenticated users and 403 for authenticated users who do not own or manage the target license.

Decision: Use Cal.com for Worker Seal Team 6 booking and paid scheduling.
Rationale: Cal.com already owns the hard scheduling surface: availability, Google Calendar sync, timezone handling, booking forms, paid bookings through Stripe, invites, rescheduling, and booking lifecycle webhooks. Using it reduces custom P0/P1 booking code and makes the customer/booker flow easier.

Decision: Keep Starter and Workers on the template Stripe/Convex billing path; do not build a separate app-owned Stripe checkout for Worker Seal Team 6 unless Cal.com fails product or provider requirements.
Rationale: The template route pattern still owns subscriptions and annual licenses. Worker Seal Team 6 should use Cal.com's paid booking surface connected to our Stripe account, with Convex mirroring booking/payment state from Cal.com webhooks and Stripe reconciliation where available.

Decision: Use Stripe Customer Portal for Workers plan changes.
Rationale: Workers is a subscription product, so plan changes between monthly, quarterly, and annual belong in Stripe's subscription-management surface when portal configuration supports the three Workers prices and the desired proration behavior. The app should own initial checkout and normalized Convex subscription state, not hand-rolled subscription mutation flows. If Stripe Customer Portal cannot support the final Workers price/proration contract cleanly, the implementation slice must document that deviation before adding app-owned upgrade/downgrade logic.

Decision: Apply Workers upgrades and longer commitments immediately; schedule downgrades for period end.
Rationale: Customers should get upgraded value as soon as they choose it, with Stripe applying fair proration for the remaining period. Downgrades should not surprise customers with mid-period access changes or refund complexity, so they take effect at the end of the current billing period. Stripe Customer Portal configuration must support this policy before portal-owned plan changes are considered live.

Decision: Handle Workers cancellation through Stripe Customer Portal and keep access through the paid period.
Rationale: Cancellation is subscription management, so Stripe should own the customer flow. The portal should cancel Workers subscriptions at period end by setting `cancel_at_period_end`, not by immediately cutting off access. Convex should mirror cancellation intent and period end from Stripe webhooks, keep subscription-derived entitlements active until the paid period ends, and remove those entitlements only after Stripe marks the subscription canceled at the end of the period.

Decision: Send one branded Resend email when Workers cancellation is scheduled.
Rationale: The customer should get a clear Ship by Sunday confirmation that cancellation is scheduled, access remains active through the paid period, and subscription management remains available through the portal. The send trigger should be Convex state proving `cancel_at_period_end` has been mirrored, with an idempotency key separate from Stripe event IDs so duplicate webhooks cannot resend it. The email should include the access-through date, support contact, and portal/manage link when available, without guilt-trip retention copy.

Decision: Keep Workers access active during Stripe's failed-payment retry window.
Rationale: Failed renewal payments are often involuntary and recoverable. Stripe Billing should own Smart Retries or the configured retry schedule, while Convex mirrors billing health from Stripe webhooks. A Workers subscription in `past_due` should keep subscription-derived entitlements active during the configured retry/grace window, show an in-app billing attention state, and store retry context such as latest invoice, attempt count, and next payment attempt when Stripe provides it. Entitlements should be removed only after Stripe marks the subscription `unpaid` or `canceled`, or after another explicit terminal state chosen in the provider setup.

Decision: Configure Workers failed-payment recovery as Stripe Smart Retries, 8 retries over 2 weeks, then cancel.
Rationale: Stripe recommends Smart Retries and lists 8 retries within 2 weeks as the default retry setting. That gives recoverable failed payments a fair window without leaving stale access or ambiguous `past_due` subscriptions around indefinitely. Provider setup should configure Workers subscriptions so failed renewal payments use Smart Retries with 8 attempts over 2 weeks and transition to `canceled` when recovery fails. Convex should still treat unexpected `unpaid` as a terminal access-removal state defensively, but the intended provider setting is cancellation after retry exhaustion.

Decision: Send one branded customer Resend recovery email after a Workers renewal payment fails.
Rationale: A failed renewal is a customer trust moment, but the app should not duplicate Stripe's retry engine or create a noisy dunning sequence. This is an intentional expansion of the template, because the template tracks subscription lifecycle events but does not ship a failed-payment email. The implementation should still copy the template's shape: `invoice.payment_failed` is a verified trigger, the app syncs fresh Stripe customer/subscription/invoice state into Convex through the secret-gated billing boundary, and the raw webhook payload does not become primary state. After Convex first mirrors `past_due` for a failed renewal invoice, Resend should send exactly one branded email for that invoice through the server-only email helper. It should explain that access remains active during the 2-week Smart Retries window, include the Stripe-hosted payment update or recovery link when available, include support contact, and avoid pressure copy. Stripe owns retry timing and hosted payment update; Convex owns idempotency and delivery state. Webhook acknowledgement should not depend on email delivery succeeding.

Decision: Send one branded customer recovered-payment confirmation email after a Workers renewal payment recovers.
Rationale: Recovery is a customer trust moment too. After Convex mirrors `invoice.paid` or recovered subscription state for a renewal invoice that previously entered failed-payment recovery, Resend should send exactly one short confirmation email for that recovered failed invoice. The email should say payment recovered, access stayed active, and no further action is needed. It should not duplicate Stripe receipt details, invoice line items, or tax/payment metadata, because Stripe owns receipts. The send must use a separate idempotency key from the failed-payment action email and must follow the template's sync-first rule: no direct sends from raw webhook payloads, and webhook acknowledgement does not depend on Resend delivery.

Decision: Send one internal Resend billing ops email after a Workers renewal payment fails.
Rationale: Failed payment is also an operator trust moment. The app should give billing ops enough context to support the customer without creating a noisy manual dunning workflow. The send trigger should be the same Convex state that first mirrors `past_due` for a failed renewal invoice, but the internal ops email needs its own template and idempotency key separate from the customer recovery email. It should go to `BILLING_OPS_EMAILS`, include the workspace/account, customer identity when available, plan, Stripe customer/subscription/invoice references, retry window, next payment attempt when available, hosted invoice or payment recovery link, and support notes. It must follow the template's sync-first rule: no send directly from the raw webhook payload, and webhook acknowledgement must not depend on ops email delivery.

Decision: Configure billing ops recipients through `BILLING_OPS_EMAILS`.
Rationale: Billing alert recipients are environment setup, not hardcoded product logic. Billing ops means the maintainer-owned internal recipient list for payment issues; day one that is the operator/support email, and later it can become a shared billing inbox or small team list. It is not a Clerk role, workspace membership concept, customer-facing role, or separate admin UI requirement. Production must require at least one valid recipient for billing ops notifications. Local and preview may leave it unset unless exercising the billing-ops email path or debug tools, where missing config should produce a clear skipped/blocked result rather than silently pretending delivery happened.

Decision: Send one internal Resend billing ops resolved email after a Workers renewal payment recovers.
Rationale: Since billing ops receives the failed-payment alert, billing ops also needs a clear resolved signal so the maintainer does not manually chase a customer whose payment already recovered. The trigger should be Convex mirroring `invoice.paid` or recovered subscription state for a renewal invoice that previously entered failed-payment recovery. The email should go to `BILLING_OPS_EMAILS`, use a separate template and idempotency key from the failed-payment ops alert and customer recovered-payment confirmation, include the workspace/account, customer identity when available, Stripe customer/subscription/invoice references, recovery timestamp, and a no-action-needed status. It should not duplicate Stripe receipts and must follow the template's sync-first rule.

Decision: Send one final branded customer access-ended email when Workers failed-payment recovery ends in cancellation.
Rationale: A provider-driven cancellation after Smart Retries fail is different from a customer-requested period-end cancellation. After Convex mirrors a terminal `canceled` subscription that was already in failed-payment recovery, Resend should send exactly one calm customer email saying payment recovery failed, Workers access has ended, no further charges are planned, and the customer can restart through checkout or contact support. The send must use a dedicated idempotency key separate from the failed-payment action email, recovered-payment confirmation, and customer-requested cancellation confirmation. It should follow the template sync-first rule and must not block Stripe webhook acknowledgement.

Decision: Send one internal Resend billing ops closeout email when Workers failed-payment recovery ends in cancellation.
Rationale: Billing ops gets the first failed-payment alert and the recovered-payment resolved email, so it also needs a closed-unrecovered signal when the retry window ends without recovery. After Convex mirrors a terminal `canceled` subscription that was already in failed-payment recovery, Resend should send exactly one internal closeout email to `BILLING_OPS_EMAILS`. The email should include the workspace/account, customer identity when available, Stripe customer/subscription/invoice references, canceled timestamp, confirmation that Workers access ended, confirmation that the customer access-ended email was queued or sent, no-further-charges status, restart/support links, and whether manual follow-up is optional. It must use a dedicated template and idempotency key separate from the failed-payment ops alert, recovered-payment ops resolved email, and customer access-ended email. It follows the template sync-first rule and must not block Stripe webhook acknowledgement.

Decision: Mirror refunds from Stripe and Cal.com and apply product-specific full-refund rules in Convex.
Rationale: Refunds are billing events with entitlement and fulfillment consequences, so the app should not treat them as support notes. Stripe refund events should verify at the webhook, fetch or sync fresh Stripe state, and write normalized refund state into Convex through the template-style billing boundary. Cal.com cancellation and booking-payment state should also be mirrored for Worker Seal Team 6. A full Starter refund voids the associated license term and removes any entitlement derived from that term. A full Workers refund removes subscription-derived access only when Stripe state also shows the subscription canceled, terminal, or otherwise voided for the refunded paid period; refund alone should not fight an otherwise active subscription. A full Worker Seal Team 6 refund marks the booking refunded and cancels future fulfillment if the service has not been delivered; if the call was already delivered, Convex keeps the fulfillment record and marks it refunded for support/accounting. Partial refunds are mirrored for support and accounting only and do not change access or fulfillment. Refund approval remains a manual/support/admin process, not a self-serve customer path or easy refund surface. Refund handling must be idempotent, distinguish full from partial refunds, and should not depend on raw provider payloads as app state.

Decision: Send one branded customer status email when a full refund changes access or fulfillment.
Rationale: A refund that voids a license, ends subscription access, or cancels a paid service booking changes the customer's product state and should not be left to a Stripe receipt alone. After Convex mirrors the full refund and product-state change, Resend should send exactly one concise customer status email through the template-style email boundary. Starter email says the license was refunded and access from that license ended. Workers email says the subscription access ended because the refunded paid period is no longer active. Worker Seal Team 6 email says the booking was refunded and canceled when the service has not been delivered. These emails should not duplicate Stripe or Cal.com receipt/payment details, should include support contact, and should use dedicated idempotency keys. Partial refunds and delivered-service refunds do not send automatic product-status email, because they do not change access or future fulfillment; support can communicate manually when the refund policy or relationship context requires it.

Decision: Send one internal ops closeout email when a full refund changes access or fulfillment.
Rationale: Full refunds that void access or future service fulfillment are operator-visible state changes. After Convex mirrors the full refund and product-state change, Resend should send exactly one internal closeout email with a dedicated template and idempotency key separate from the customer status email. Starter and Workers refund closeouts go to `BILLING_OPS_EMAILS`. Worker Seal Team 6 undelivered-booking refund closeouts go to `BILLING_OPS_EMAILS` and `WORKER_SEAL_TEAM_6_OPS_EMAILS` so billing and service prep both stop from the same state change. The email should include product, customer/workspace or attendee, Stripe references, Cal.com booking references when relevant, access or fulfillment change, customer status email state, refund timestamp, and support notes. Partial refunds and delivered-service refunds are mirrored for support/accounting and do not send this automatic closeout.

Decision: Do not send automatic internal ops email for partial refunds.
Rationale: Partial refunds are accounting/support state, not a product-state closeout. They do not change access, cancel fulfillment, or require an automatic billing workflow. Convex should still mirror them with provider references and support/admin notes, but the human approving or recording the partial refund owns any needed follow-up outside the webhook-triggered Resend path. Automated internal email stays reserved for full refunds that change access or future fulfillment, failed-payment recovery, and other explicit provider-derived product-state changes.

Decision: Initiate refunds in Stripe or Cal.com provider dashboards, not in an app admin UI.
Rationale: Refund issuance is a P0 money-moving action, and this Program is already large enough with architecture, billing, email, Sentry, Cal.com, and route migration work. For this template-first migration, Stripe and Cal.com dashboards should remain the operator surfaces for approving and issuing refunds. Ship by Sunday should verify webhook signatures, reconcile fresh provider state, mirror refund facts into Convex, derive product state from that mirror, and send the approved customer/internal emails from Convex state. Do not add in-app admin refund mutations, refund buttons, or custom refund approval workflow in this Program. A future admin workflow can be designed later with its own P0 authorization, audit, idempotency, and provider-reconciliation plan if there is evidence it is worth the risk.

Decision: Show Workers `past_due` billing attention globally to owners/admins.
Rationale: The customer should not lose access during Stripe's retry window, but the accountable billing users should see the issue without having to discover it on `/billing`. The app shell should show a non-blocking banner only to roles that can manage billing, matching the template's role-aware billing boundary. Non-billing members should not be nagged or asked to solve payment. The banner should read normalized Convex billing attention state, mention that access remains active during the retry window, show the retry/access-through context when available, and route the CTA to Stripe Customer Portal or the hosted invoice/payment recovery link, with `/billing` as the detailed fallback.

Decision: Do not make the Workers `past_due` billing attention banner dismissible.
Rationale: Dismiss or snooze state would add a second, user-mutable truth source to a P0 billing recovery flow. The banner should be low-height and non-blocking, but it should persist for owners/admins while Convex reports active billing attention. It clears only when Stripe recovery or terminal-state webhooks sync into Convex, such as successful renewal payment, recovered subscription state, or final cancellation after retry exhaustion. This keeps the customer experience calm while avoiding hidden payment risk.

Decision: Cal.com owns Worker Seal Team 6 booking UX; Ship by Sunday owns the public landing page and post-booking app state.
Rationale: `/worker-seal-team-6` should still be a Ship by Sunday marketing page under `(marketing)`, but the appointment selection, intake fields, timezone display, confirmation, and reschedule controls should come from Cal.com. The primary customer path should be an embedded Cal.com booking module inside a premium Ship by Sunday page, not a cheap-looking iframe dump; the hosted Cal.com booking URL remains the fallback when embed loading fails or third-party scripts are blocked. The prior shadcn/Mobbin custom booking flow remains a fallback reference if Cal.com is rejected later.

Decision: Do not require Clerk sign-in before Worker Seal Team 6 booking.
Rationale: Worker Seal Team 6 is a paid meeting, not a workspace purchase. Cal.com collects attendee identity, intake, payment, confirmations, and rescheduling. Convex mirrors the booking for support, fulfillment, reconciliation, and proof, but the app should not invite the booker into Clerk or ask them to set up a workspace unless they later buy Starter or Workers through the normal product path.

Decision: Send one branded Resend prep email after Worker Seal Team 6 paid booking sync.
Rationale: Cal.com remains the official booking and rescheduling system, but one Ship by Sunday email can make the service feel more premium and reduce meeting friction. The email should contain receipt/context, what happens during the call, what to have ready, the Cal.com reschedule link, and support contact. It must not include Clerk sign-in, workspace setup, or product onboarding language.

Decision: Gate the Worker Seal Team 6 prep email on paid confirmation, not booking creation.
Rationale: Cal.com `booking.created` and payment-initiated events can update mirror state, but they must not send the customer prep email. The send trigger should be Convex state that proves the booking is paid, with a durable idempotency key so duplicate or out-of-order Cal.com and Stripe events cannot send multiple emails.

Decision: Send one internal Resend ops email after Worker Seal Team 6 paid booking sync.
Rationale: A $2500 hands-on meeting needs the operator prepared before the call. The ops email should use the same paid-confirmed Convex trigger as the customer prep email, but a separate idempotency key and template. It should include attendee, company URL, scheduled time, intake answers, Cal.com booking link, payment status, and support notes.

Decision: Configure Worker Seal Team 6 ops recipients through `WORKER_SEAL_TEAM_6_OPS_EMAILS`.
Rationale: Ops notification recipients are environment setup, not hardcoded product logic. Production must fail clearly if `WORKER_SEAL_TEAM_6_OPS_EMAILS` is missing or invalid. Local and preview may leave it unset unless exercising the ops-email path or debug tools, where missing config should produce a clear skipped/blocked result rather than silently pretending delivery happened.

Decision: Configure Cal.com for the accepted booking policy.
Rationale: Cal.com should enforce or approximate the decisions already made: one-hour paid booking, operator-owned calendar connection, customer as attendee, required intake fields, self-serve reschedule, 24-hour reschedule cutoff, and manual/support-handled cancellations/refunds. Any Cal.com limitation becomes an explicit deviation with a compensating support/admin path.

Decision: Use template-style Next.js billing and webhook route tests as the default target.
Rationale: The template's billing route tests are exactly the kind of proof this codebase needs. Any adaptation for Convex durability must preserve idempotency, signature verification, route coverage, and entitlement assertions.

Decision: Bring Sentry and Resend into the first-class architecture.
Rationale: The template includes both as normal provider lanes. The current app should not leave error tracing or transactional email as later bolt-ons.

Decision: Keep external setup documented in the same migration.
Rationale: Sentry, Resend, Stripe, Clerk, Convex, and Vercel env values are part of the shipped contract, not chat memory or dashboard tribal knowledge.

## Slice Ledger

Completed child ExecPlans:

- `docs/exec-plans/completed/2026-05-13-web-convex-architecture-contract-and-inventory.md` - completed the architecture contract and migration inventory slice by adding local app architecture/conventions docs, an app instruction pointer, and a Program-owned current-to-target map.

Remaining planned slices:

- App tree and route group migration: introduce the `src/` structure, move route groups toward `(marketing)`, `(auth)`, `(app)`, add the app-shell billing attention surface, and keep public/protected behavior intact.
- Convex module reshape: reorganize Convex files around domain modules and shared auth helpers matching the template's conventions.
- Billing domain rebuild: model Workers subscription state, failed-payment retry/grace state, billing attention state, failed-payment customer recovery email state, recovered-payment customer confirmation email state, failed-payment internal billing ops alert state, recovered-payment internal billing ops resolved email state, terminal failed-recovery customer access-ended email state, terminal failed-recovery internal billing ops closeout email state, full/partial refund state, full-refund customer status email state, full-refund internal ops closeout email state, scheduled cancellation email state, Starter annual license state and authorized fresh-checkout renewal terms, Cal.com-mirrored Worker Seal Team 6 service booking state, and entitlements in Convex as product concepts rather than scattered route flags.
- Stripe route and webhook migration: adopt template-style billing routes, webhook ingress, Starter checkout and authorized renewal checkout, success sync, Workers portal subscription-management, plan-change, period-end cancellation configuration, Smart Retries with 8 retries over 2 weeks and cancellation on failure, `invoice.payment_failed`, `invoice.paid`, and refund events as sync-first triggers, failed-payment retry/recovery status, terminal failed-recovery cancellation handling, refund handling, and route tests while preserving durable fulfillment.
- Worker Seal Team 6 Cal.com integration: configure the Cal.com paid booking event, embed it from `/worker-seal-team-6` with a hosted Cal.com fallback link, sync Cal.com webhooks into Convex for meeting fulfillment/support, mirror cancellation/refund state, send one branded customer prep email and one internal ops email after paid sync, send one full-refund customer status email and one internal ops closeout when an undelivered booking is refunded/canceled, and add failure-mode tests.
- Sentry and Resend integration: add provider packages, env validation, setup docs, debug gates, Workers failed-payment customer recovery email, Workers recovered-payment customer confirmation email, Workers terminal failed-recovery access-ended email, Workers failed-payment internal billing ops alert/resolved/closeout emails, full-refund customer status emails, full-refund internal ops closeout emails, Workers cancellation confirmation email, and smoke tests.
- Release/docs/proof cleanup: update release workflow, docs, and proof scripts so old webhook URLs, route names, and provider assumptions cannot linger.

## Next Slice

The next slice is `App src tree and route group migration`.

That slice should use `apps/web/ARCHITECTURE.md`, `apps/web/CONVENTIONS.md`, and `docs/programs/active/2026-05-13-template-first-web-convex-architecture/architecture-migration-inventory.md` as the starting contract. It should introduce the `src/` tree, move route groups toward `(marketing)`, `(auth)`, `(app)`, and `api/`, keep public and protected behavior intact, and avoid changing billing provider endpoints until the billing route/webhook slice is ready to update release docs and provider setup docs in the same change.

A new immutable planning brief should be written before the second child ExecPlan starts.

## Risks and Watchpoints

- Billing is P0. Stripe webhooks, Checkout redirects, entitlement writes, and duplicate event handling need idempotency and failure-mode tests.
- Auth and authorization cannot be weakened during route group moves. Clerk route protection and Convex authorization helpers must both be verified.
- Current release docs name the Convex `.site` webhook endpoint as canonical. This Program intentionally reopens that contract, so release docs and provider setup docs must change when the endpoint changes.
- Current public and protected URLs are not preservation constraints. Do not add compatibility redirects unless a slice documents the live dependency and removal path.
- Resend and Sentry add external setup work. Their env vars, dashboard setup, debug routes, and missing-config failure modes need durable documentation.
- Refund issuance intentionally stays in provider dashboards for this Program. Do not hide a new app-owned P0 money mutation inside the template migration.
- A mechanical `src/` move can hide behavior regressions. Each slice should validate the exact production path it touches before broader gates.
- The annual license lane must not be forced into a subscription-only schema. It needs explicit term, expiration, authenticated/authorized fresh-checkout renewal, early-renewal extension, and entitlement behavior. Customer Portal must not become the Starter renewal surface.
- Worker Seal Team 6 now depends on Cal.com setup. Event type configuration, Stripe connection, webhooks, reschedule cutoff, and booking/payment state mirroring need proof so the app does not silently drift from the service policy.
- Cal.com does not remove app responsibility. Convex still needs idempotent webhook processing, support/admin mirror state, and clear failure modes when Cal.com, Stripe, or webhook delivery is misconfigured.
- Avoid half-adopting the template. Mixed old/new architecture is acceptable during slices, but not as the final Program outcome.

## Outcomes & Retrospective

This section remains future-facing while the Program is active. The final retrospective should record the final route tree, Convex module tree, billing endpoint contract, provider setup docs, tests added, and any intentional deviations from the sibling template.

## Validation and Acceptance

This Program can move to completed only when:

- `apps/web` uses the template-style `src/` tree or every deviation is documented and justified.
- App-level architecture and conventions docs exist and reflect the sibling template's ownership model.
- Next.js routes are grouped around `(marketing)`, `(auth)`, `(app)`, and `api/` or documented equivalents.
- Convex modules are domain-named, small enough to scan, and own authorization checks for product data.
- Public marketing routes exist for `/`, `/starter`, `/workers`, and `/worker-seal-team-6` under the template-style route groups.
- Billing supports Starter annual licenses and fresh-checkout renewals, including early-renewal extension from current expiration, plus Workers subscription variants with Stripe Customer Portal plan changes, immediate prorated upgrades/longer commitments, period-end downgrades and cancellations, access through Stripe Smart Retries with 8 retries over 2 weeks, global non-dismissible owner/admin billing attention during `past_due`, cancellation after failed recovery, provider-dashboard refund initiation with no in-app admin refund actions, manual/support-approved full-refund entitlement and fulfillment handling, partial-refund support/accounting mirroring, exactly-once branded full-refund customer status emails when access or fulfillment changes, exactly-once internal full-refund ops closeout emails when access or fulfillment changes, exactly-once branded failed-payment customer recovery email, exactly-once branded recovered-payment customer confirmation email, exactly-once branded terminal failed-recovery access-ended email, exactly-once internal billing ops failed/resolved/terminal-closeout emails to `BILLING_OPS_EMAILS`, exactly-once branded cancellation confirmation email, normalized Convex state, entitlements, idempotent Stripe event processing, and route/webhook tests.
- Worker Seal Team 6 booking is powered by an embedded Cal.com flow that feels premium inside the Ship by Sunday page, with no pre-booking Clerk gate, no post-booking workspace setup, a hosted Cal.com fallback link, paid booking configured, Cal.com webhooks verified, Convex meeting mirror state synced idempotently, one branded customer prep email and one internal ops email sent after paid sync, one branded full-refund customer status email and one internal ops closeout email sent when an undelivered booking is refunded/canceled, rescheduling policy proven, and cancellation/refund support/admin paths documented.
- Sentry and Resend are installed, configured, documented, and gated by env/debug conventions.
- Release workflow docs, setup docs, and proof scripts no longer point at stale route names or webhook endpoints.
- Relevant P0/P1 tests pass, including route tests for billing, Convex tests for entitlement behavior, and a browser or integration proof for protected billing UI.
- Repo-level completion gates pass or any skipped checks are documented with exact blockers.

## Artifacts and Notes

The sibling template docs should remain the reference while this Program is active:

- `~/Developer/next-js-convex-clerk-stripe-template/ARCHITECTURE.md`
- `~/Developer/next-js-convex-clerk-stripe-template/CONVENTIONS.md`
- `~/Developer/next-js-convex-clerk-stripe-template/AGENTS.md`

The target app shape should stay close to:

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

## Interfaces and Dependencies

- Next.js App Router route groups, route handlers, middleware/proxy, instrumentation, and `next.config.ts`.
- Clerk auth and route protection.
- Convex schema, queries, mutations, actions, HTTP actions if retained, and generated API types.
- Stripe Checkout, Starter renewal Checkout, Customer Portal for Workers subscription management, plan changes, period-end cancellation, failed-payment retry and recovery lifecycle, refund lifecycle, full-refund customer status emails, full-refund internal ops closeout emails, Workers failed-payment customer recovery email, Workers recovered-payment customer confirmation email, Workers terminal failed-recovery access-ended email, Workers failed-payment internal billing ops alert/resolved/closeout emails, Workers cancellation confirmation email, webhooks, subscription lifecycle, annual license fulfillment, Cal.com-mirrored service booking fulfillment, and event idempotency.
- Sentry Next.js SDK setup.
- Resend transactional email setup and React Email templates.
- Cal.com paid booking, Google Calendar sync through Cal.com, booking lifecycle webhooks, and Worker Seal Team 6 fulfillment state.
- Vercel env, Convex env, local `.env.local.example`, and provider dashboard configuration.
- `docs/release-workflow.md`, user-facing setup docs, and release proof scripts that assert billing or provider contracts.
