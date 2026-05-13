---
title: "Template First Web Convex Decision Packet"
summary: "Canonical decisions for moving apps/web and Convex to the sibling template architecture."
docType: "decision_packet"
status: "active"
read_when:
  - "Checking what this Program has already decided."
  - "Deciding whether to preserve current web architecture or follow the sibling template."
---

# Template First Web Convex Decision Packet

## Decisions

Decision: Follow the sibling template's architecture and conventions as the default.

Rationale: The user explicitly prefers that architecture, and the comparison shows clearer provider ownership, route ownership, billing tests, and Convex boundaries.

Decision: Do not ask for confirmation before copying a template pattern.

Rationale: Copying the template is the baseline. Interview questions should be reserved for product-specific expansion, customer-experience tradeoffs, or deliberate deviations from the template.

Decision: Do not let current checkout and webhook code bias the target architecture.

Rationale: Payment mistakes are the motivating failure. Existing behavior must be audited for product requirements, but its shape should not be treated as inherently safer.

Decision: Scope the Program to `apps/web` and `apps/web/convex`.

Rationale: These are the runtime web and backend surfaces that need the architecture reset. Other repo areas may need docs or proof updates, but they are dependencies, not the Program's primary product surface.

Decision: Adopt a `src/` tree in `apps/web`.

Rationale: Matching the sibling template reduces reader overhead and makes route, component, and provider ownership more obvious.

Decision: Use `(marketing)`, `(auth)`, `(app)`, and `api/` as the target route structure.

Rationale: The template route groups describe product intent better than the current route names and provide a clean split between public, auth, protected app, and integration surfaces.

Decision: Do not preserve current customer-facing URLs by default.

Rationale: Historical paths should not shape the future app. The migration should choose template-style, future-facing route names and only add temporary redirects when a live customer, provider callback, or release cutover explicitly requires them.

Decision: Keep `/starter` and `/workers` public.

Rationale: They are product marketing pages and should live in `(marketing)`. Protected app routes should use child paths that do not collide with those public product pages.

Decision: Add `/worker-seal-team-6` as a public marketing page.

Rationale: The hands-on one-hour service is a separate customer decision with separate pricing, checkout, and fulfillment expectations. It should be a first-class route, not a subsection hidden under the Workers subscription.

Decision: Treat `/`, `/starter`, `/workers`, and `/worker-seal-team-6` as the four public landing pages.

Rationale: The home page remains the main marketing entry. The three offer pages keep Starter, Workers, and Worker Seal Team 6 distinct for copy, pricing, analytics, checkout, and SEO.

Decision: Move provider and domain helpers toward named folders under `src/lib/`.

Rationale: `src/lib/billing`, `src/lib/auth`, `src/lib/convex`, `src/lib/email`, `src/lib/env`, and `src/lib/sentry` are more discoverable than broad adapter layers.

Decision: Treat `platform/` as migration debt.

Rationale: It can remain temporarily while files move, but the desired final architecture is closer to the template's provider/domain folders.

Decision: Model Workers subscriptions and Starter annual licenses directly in Convex; mirror Worker Seal Team 6 service bookings from Cal.com.

Rationale: Recurring subscription access and one-year license access belong in the app-owned Stripe/Convex billing model. Worker Seal Team 6 is now a Cal.com-backed booking service, so Convex should mirror booking/payment/fulfillment state from Cal.com and Stripe events rather than owning the scheduler.

Decision: Renew Starter through fresh app-owned Stripe Checkout.

Rationale: Starter is a one-time one-year license, not a subscription. Renewal should create a new Checkout Session and, after verified payment, a new license term in Convex. Stripe Customer Portal should stay focused on Workers subscriptions, where it belongs for payment method, invoice, cancellation, and subscription-management flows.

Decision: Extend early Starter renewals from the current expiration date.

Rationale: Early renewal should not burn paid time. If the existing Starter license is active, the renewed term starts at the current expiration. If it is expired, the renewed term starts at verified payment time.

Decision: Require Clerk authentication and Convex authorization for Starter renewal.

Rationale: Starter renewal mutates app-owned billing, license, and entitlement state. The renewal checkout route should verify the signed-in user can manage the target workspace/license before creating Stripe Checkout. Unauthenticated users get 401; authenticated users without permission get 403.

Decision: Use Stripe Customer Portal for Workers plan changes.

Rationale: Workers is a subscription product, so changes between monthly, quarterly, and annual should use Stripe's subscription-management surface when the Customer Portal configuration supports the three prices and desired proration behavior. The app should create portal sessions and sync normalized Convex state from webhooks, not hand-roll subscription mutations unless the portal cannot satisfy the final contract.

Decision: Apply Workers upgrades and longer commitments immediately; schedule downgrades for period end.

Rationale: Immediate upgraded access is the best customer experience when someone chooses a higher-value plan or longer commitment, and Stripe can handle fair proration. Downgrades should wait until the current paid period ends so access and billing do not surprise the customer.

Decision: Handle Workers cancellation through Stripe Customer Portal and keep access through the paid period.

Rationale: Cancellation is subscription management, so Stripe should own the customer flow. The portal should cancel Workers subscriptions at period end by setting `cancel_at_period_end`, not by immediately cutting off access. Convex should mirror cancellation intent and period end from Stripe webhooks, keep subscription-derived entitlements active until the paid period ends, and remove those entitlements only after Stripe marks the subscription canceled.

Decision: Send one branded Resend email when Workers cancellation is scheduled.

Rationale: Cancellation is a customer trust moment. After Convex mirrors `cancel_at_period_end`, Resend should send exactly one confirmation email with the access-through date, support contact, and portal/manage link when available. The email should use a dedicated idempotency key and avoid guilt-trip retention copy.

Decision: Keep Workers access active during Stripe's failed-payment retry window.

Rationale: Failed renewal payments are often recoverable, so immediate access removal would create unnecessary customer pain. Stripe Billing should own Smart Retries or the configured retry schedule. Convex should mirror `past_due`, invoice retry context, and the final `unpaid` or `canceled` state from Stripe. Workers entitlements stay active during the retry/grace window, the app shows billing attention, and access is removed only after Stripe reaches the chosen terminal failed-payment state.

Decision: Configure Workers failed-payment recovery as Stripe Smart Retries, 8 retries over 2 weeks, then cancel.

Rationale: Stripe documents Smart Retries as the recommended retry strategy and lists 8 tries within 2 weeks as the default setting. That is long enough to recover common failed renewals without leaving the subscription in indefinite `past_due`. The intended provider setting is cancellation after retry exhaustion; Convex still treats unexpected `unpaid` as terminal for access defense.

Decision: Send one branded customer Resend recovery email after a Workers renewal payment fails.

Rationale: A single branded email makes the billing issue clear without competing with Stripe's retry/payment-update system. The template does not include failed-payment email, so this is a product-specific expansion. It must still follow the template's billing rule: verified Stripe events are sync triggers, fresh Stripe state is normalized into Convex through the secret-gated billing boundary, and provider payloads are not primary app state. The trigger is Convex first mirroring `past_due` for a failed renewal invoice. The idempotency key should be per failed invoice, and the email should include the 2-week recovery window, hosted payment update or recovery link when available, and support contact. Do not add a custom multi-email dunning sequence unless later evidence proves one is needed. Webhook acknowledgement should not depend on Resend delivery.

Decision: Send one branded customer recovered-payment confirmation email after a Workers renewal payment recovers.

Rationale: The recovery confirmation closes the loop for the customer and confirms no action is needed. It should send only after Convex mirrors `invoice.paid` or recovered subscription state for a renewal invoice that previously entered failed-payment recovery. The idempotency key must be separate from the failed-payment action email. The content should say payment recovered and access stayed active, but it should not duplicate Stripe receipts, invoice line items, tax/payment metadata, or payment method details.

Decision: Send one internal Resend billing ops email after a Workers renewal payment fails.

Rationale: Billing ops should know when a customer enters failed-payment recovery so support can be proactive without adding more customer-facing dunning. The trigger should be the same Convex state that first mirrors `past_due` for a failed renewal invoice, but the ops email needs a separate template and idempotency key from the customer recovery email. It should go to `BILLING_OPS_EMAILS` and include the workspace/account, customer identity when available, plan, Stripe customer/subscription/invoice references, retry window, next payment attempt when available, hosted invoice or recovery link, and support notes. It must follow the template's sync-first rule: no direct sends from raw webhook payloads, and webhook acknowledgement does not depend on Resend delivery.

Decision: Configure billing ops recipients through `BILLING_OPS_EMAILS`.

Rationale: Billing ops recipients are external setup. Billing ops means the maintainer-owned internal recipient list for payment issues; day one that is the operator/support email, and later it can become a shared billing inbox or small team list. It is not a Clerk role, workspace membership concept, customer-facing role, or separate admin UI requirement. Production should require at least one valid recipient for billing ops notifications. Local and preview may leave it unset unless a test, smoke, or debug route exercises the path, where missing config should fail or skip explicitly.

Decision: Send one internal Resend billing ops resolved email after a Workers renewal payment recovers.

Rationale: The maintainer needs a matching resolved signal after the failed-payment alert so they do not manually chase a customer whose payment already recovered. The trigger should be Convex mirroring `invoice.paid` or recovered subscription state for a renewal invoice that previously entered failed-payment recovery. It should go to `BILLING_OPS_EMAILS`, use a separate template and idempotency key from the failed-payment ops alert and customer recovered-payment confirmation, include the workspace/account, customer identity when available, Stripe references, recovery timestamp, and no-action-needed status, and follow the template sync-first rule.

Decision: Send one final branded customer access-ended email when Workers failed-payment recovery ends in cancellation.

Rationale: Retry-exhausted cancellation is provider-driven, not customer-requested. After Convex mirrors a terminal `canceled` subscription that was already in failed-payment recovery, Resend should send exactly one customer email saying payment recovery failed, Workers access has ended, no further charges are planned, and the customer can restart through checkout or contact support. It needs a dedicated idempotency key separate from the failed-payment action email, recovered-payment confirmation, and normal cancellation confirmation, and it must follow the template sync-first rule.

Decision: Send one internal Resend billing ops closeout email when Workers failed-payment recovery ends in cancellation.

Rationale: Billing ops needs closure for every failed-payment recovery branch: alert when recovery starts, resolved when it recovers, and closed-unrecovered when Stripe cancels after retries fail. After Convex mirrors a terminal `canceled` subscription that was already in failed-payment recovery, Resend should send exactly one closeout email to `BILLING_OPS_EMAILS`. It should use a template and idempotency key separate from the failed-payment ops alert, recovered-payment ops resolved email, and customer access-ended email, include Stripe references and customer/workspace context, and state that access ended, the customer was notified, no further charges are planned, and manual follow-up is optional.

Decision: Mirror refunds and let full refunds affect entitlement or fulfillment by product.

Rationale: Refunds are provider events that should be normalized into Convex before UI, entitlement, or fulfillment changes. Full refunds change app state when they void the paid product: Starter license terms are voided, Workers access is removed only when the subscription is also canceled/terminal or voided for the refunded period, and undelivered Worker Seal Team 6 fulfillment is canceled/refunded. Partial refunds are mirrored for support and accounting only and do not change access or fulfillment. Refund approval is a manual/support/admin process, not a self-serve customer path. This keeps the customer experience fair, avoids brittle refund special cases, and follows the template rule that provider payloads are sync triggers rather than app state.

Decision: Send one branded customer status email when a full refund changes access or fulfillment.

Rationale: A full refund that voids access or future fulfillment changes the customer's relationship to the product. After Convex mirrors that product-state change, Resend should send exactly one concise status email explaining what changed: Starter license access ended, Workers access ended, or Worker Seal Team 6 booking was refunded and canceled. The email should not duplicate Stripe or Cal.com receipt details, should include support contact, and should use a dedicated idempotency key. Partial refunds and delivered-service refunds do not send automatic product-status emails because they do not change access or future fulfillment.

Decision: Send one internal ops closeout email when a full refund changes access or fulfillment.

Rationale: A full refund that changes product state should close the loop for the operator too. After Convex mirrors the state change, Resend should send exactly one internal closeout email with product, customer/workspace or attendee, Stripe and Cal.com references when relevant, access or fulfillment change, customer status email state, refund timestamp, and support notes. Starter and Workers closeouts go to `BILLING_OPS_EMAILS`; Worker Seal Team 6 undelivered-booking closeouts go to `BILLING_OPS_EMAILS` and `WORKER_SEAL_TEAM_6_OPS_EMAILS` so billing and service prep stay aligned. Partial refunds and delivered-service refunds do not send this automatic closeout.

Decision: Do not send automatic internal ops email for partial refunds.

Rationale: Partial refunds are mirrored support/accounting facts and do not change access or future fulfillment. Convex should record provider references and support/admin notes, but the operator who approves the partial refund owns any manual follow-up. The automated internal Resend path stays limited to full refunds that change product state and the explicit failed-payment lifecycle.

Decision: Initiate refunds in Stripe or Cal.com provider dashboards, not in an app admin UI.

Rationale: Refund issuance is a P0 money-moving operation and should not be added as incidental scope during the template migration. For this Program, Stripe and Cal.com remain the operator surfaces for issuing refunds. The app verifies webhooks, reconciles fresh provider state, mirrors refund facts into Convex, derives access or fulfillment effects, and sends exactly-once emails from Convex state. No in-app admin refund actions, refund buttons, or custom approval workflow belong in this Program.

Decision: Show Workers `past_due` billing attention globally to owners/admins.

Rationale: The template already makes billing role-aware and has UI read normalized Convex billing state. Ship by Sunday should expand that into a non-blocking app-shell banner while Workers is in failed-payment recovery. The banner should appear only for owner/admin or equivalent billing-management roles, preserve product access, explain the retry/access-through context, and route to Stripe Customer Portal or a hosted invoice/payment recovery link. Non-billing members should not be asked to solve billing, and `/billing` remains the detailed state surface.

Decision: Do not make the Workers `past_due` billing attention banner dismissible.

Rationale: A dismiss or snooze action would create a local UI state that can hide a P0 billing recovery problem while Stripe still reports `past_due`. The banner should stay low-height and non-blocking, but it should persist for billing-management roles until provider-derived Convex state clears it through successful payment recovery, recovered subscription state, or terminal cancellation after retry exhaustion.

Decision: Use Cal.com for Worker Seal Team 6 booking and paid scheduling.

Rationale: Cal.com already provides the customer booking surface, calendar sync, timezone handling, forms, paid bookings through Stripe, rescheduling, and booking lifecycle webhooks. This reduces custom high-risk booking code and improves the customer/booker experience.

Decision: Embed Cal.com on `/worker-seal-team-6`, with hosted Cal.com as fallback.

Rationale: The customer should stay in the Ship by Sunday buying context for a premium $2500 service. The implementation should use a premium page frame around the Cal.com embed, keep the hosted Cal.com URL available when the embed fails, and treat cheap-looking embed limitations as a product requirement failure.

Decision: Do not require Clerk sign-in before Worker Seal Team 6 booking.

Rationale: Booking should feel like buying a premium meeting, not opening an app account. Cal.com should collect attendee identity, intake, and payment. Convex mirrors the meeting for support, fulfillment, reconciliation, and proof; it should not trigger Clerk account creation or workspace setup unless the customer later buys Starter or Workers through the normal product path.

Decision: Send one branded Resend prep email after Worker Seal Team 6 paid booking sync.

Rationale: Cal.com owns confirmation and rescheduling, but Ship by Sunday should still create a polished post-payment touchpoint for a $2500 service. The email should tell the customer what to expect, what to prepare, how to reschedule through Cal.com, and how to reach support. It must not include app onboarding, Clerk sign-in, or workspace setup.

Decision: Do not send the Worker Seal Team 6 prep email on booking creation or payment initiation.

Rationale: Created and payment-initiated events do not prove the service is paid. They can update Convex mirror state, but the prep email should only send after paid confirmation is mirrored with a durable idempotency key.

Decision: Send one internal Resend ops email after Worker Seal Team 6 paid booking sync.

Rationale: The service quality depends on the operator showing up prepared. The ops email should use the same paid-confirmed Convex trigger as the customer prep email, but a separate idempotency key and template. It should include attendee, company URL, scheduled time, intake answers, Cal.com booking link, payment status, and support notes.

Decision: Configure Worker Seal Team 6 ops recipients through `WORKER_SEAL_TEAM_6_OPS_EMAILS`.

Rationale: Ops recipients are provider setup, not hardcoded logic. Production should require at least one valid recipient and fail clearly when missing. Local and preview can leave the env var unset unless exercising the ops-email path or debug tools.

Decision: Keep template-style Stripe routes for Starter and Workers, not Worker Seal Team 6.

Rationale: The template route tests still prove the subscription and annual-license lanes. Worker Seal Team 6 should use Cal.com's paid booking flow connected to our Stripe account, with app-side Convex sync from Cal.com webhooks and Stripe reconciliation where available.

Decision: Treat the custom shadcn/Google Calendar/Mobbin booking plan as fallback/reference only.

Rationale: The prior custom flow analysis remains useful if Cal.com fails a product, branding, payment, or data requirement. It is no longer the primary target while Cal.com can satisfy the service-booking contract.

Decision: Configure Cal.com to enforce the accepted Worker Seal Team 6 policy.

Rationale: The Cal.com event should be one hour, paid at $2500, connected to the operator calendar, include required intake questions, allow self-serve rescheduling, close self-serve rescheduling 24 hours before the call, and leave cancellations/refunds manual/support-handled. Any limitation becomes an explicit deviation with a compensating app/support workflow.

Decision: Use Next.js billing routes and route tests in the style of the sibling template.

Rationale: Billing route tests are a direct answer to the current trust problem. The route layer must be proven rather than inferred from lower-level helpers.

Decision: Keep fulfillment idempotent and Convex-backed.

Rationale: Stripe webhooks can be duplicated, delayed, and reordered. Convex should persist processed event and entitlement state so retries are safe.

Decision: Add Sentry as the error and tracing provider.

Rationale: The sibling template has a complete Sentry setup, and first-class error tracing is part of the desired architecture.

Decision: Add Resend as the transactional email provider.

Rationale: The user explicitly brought Resend back into scope. Email setup should follow the template rather than being bolted on later.

Decision: Use an app-wide debug-tools env gate.

Rationale: The template's debug controls provide a clear operator contract for Sentry and email test endpoints while preventing production exposure.

Decision: Update release workflow and setup docs in the same Program.

Rationale: Provider endpoints and env contracts are external setup. Leaving old docs in place would create production misconfiguration risk.
