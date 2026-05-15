---
title: "Worker Seal Team 6 Booking Research"
summary: "Research note for using Cal.com as the paid booking flow behind the Worker Seal Team 6 offer."
docType: "research_note"
status: "active"
read_when:
  - "Designing the Worker Seal Team 6 booking and checkout flow."
  - "Adding Cal.com paid booking, webhooks, Stripe sync, or service fulfillment."
---

# Worker Seal Team 6 Booking Research

## Research Question

Worker Seal Team 6 is a $500 one-hour hands-on service. The booking flow should be excellent for the customer and low-risk for the codebase.

The decision is now to use Cal.com for the booking surface instead of building a custom Google Calendar API scheduler.

## Primary Source Findings

Cal.com supports paid bookings through its Stripe app. The Cal.com help docs describe enabling Stripe, connecting a Stripe account, and setting the price on a paid event type.

Cal.com supports embedding booking pages. Its embed docs describe inline embeds, popup embeds, floating-button popup embeds, and embedding event-type links.

Cal.com exposes API and webhook surfaces for bookings, event types, schedules, calendars, selected/destination calendars, Stripe, and webhooks. Its webhook docs include booking lifecycle triggers such as booking created, booking cancelled, booking paid, booking payment initiated, and booking rescheduled. Webhooks can be configured with a secret for verification.

Cal.com event type configuration supports scheduling policy knobs that map to this Program's decisions, including minimum booking notice and rescheduling controls. API docs expose `disableRescheduling` with `minutesBefore`, which matches the 24-hour self-serve reschedule cutoff.

Cal.com's hosted pricing page currently shows an individual free tier with unlimited event types/calendars and accepting Stripe/PayPal payments, plus paid per-user team and organization tiers. Stripe processing fees still apply. Final setup must verify the exact Cal.com plan, Stripe payment routing, branding, and fee terms at implementation time.

## Chosen Target Shape

Use Cal.com for Worker Seal Team 6 booking and paid scheduling.

Target flow:

1. Public `/worker-seal-team-6` markets the offer under the template-style `(marketing)` group.
2. The booking CTA opens an embedded Cal.com module on the Ship by Sunday page; the hosted Cal.com booking page remains the fallback link if the embed cannot load.
3. Cal.com handles slot selection, timezone display, intake questions, payment collection through connected Stripe, calendar invite creation, and self-serve rescheduling.
4. Cal.com sends booking lifecycle webhooks to the app.
5. The app verifies Cal.com webhooks, records idempotent processed events, and mirrors the booking/payment state into Convex.
6. Resend sends one branded customer prep email and one internal ops email after the paid booking syncs.
7. Any internal app view reads Convex's mirrored booking state for support, fulfillment, and release proof; the customer manages the meeting through Cal.com links.

Starter and Workers stay on the template-owned Stripe/Convex billing path. Worker Seal Team 6 should not use `/api/billing/checkout` unless a later implementation slice rejects Cal.com.

The embed must not look like a pasted third-party widget. The page should own the premium framing, offer context, trust/proof, and post-booking state, while Cal.com owns the actual booking controls. If the embed's visual limitations make the offer feel cheap, that is a product requirement failure and should trigger either deeper Cal.com theming/embedding work or the custom scheduler fallback.

Worker Seal Team 6 should not require Clerk sign-in before booking, and booking should not trigger a Clerk invite or workspace setup. The public page and embedded Cal.com flow should let a qualified buyer book and pay for a meeting. If that buyer later purchases Starter or Workers, the normal product billing/auth flow creates or attaches the app account and workspace then.

After a paid booking syncs, Ship by Sunday should send exactly one branded Resend prep email. The email should reinforce the premium service experience and include booking context, what happens during the call, what the customer should have ready, the Cal.com reschedule link, and a support contact. It must not include Clerk sign-in, workspace setup, dashboard links, or app onboarding language.

The prep email must be gated on paid confirmation mirrored in Convex. Cal.com booking-created and payment-initiated events can update booking mirror state, but they are not enough to send the prep email. The email dispatch should use a durable idempotency key tied to the Cal.com booking and paid state so duplicate or out-of-order Cal.com and Stripe events cannot send multiple messages.

The internal ops email uses the same paid-confirmed Convex trigger, but it must have a separate template and idempotency key from the customer prep email. It should include attendee, company URL, scheduled time, intake answers, Cal.com booking link, payment status, and support notes so the operator can prepare without depending only on Cal.com host notifications.

Ops recipients should come from `WORKER_SEAL_TEAM_6_OPS_EMAILS`, parsed as a comma-separated email list. Production must require at least one valid recipient. Local and preview may leave it unset unless a test, smoke, or debug route exercises the ops-email path, in which case the app should fail or skip explicitly rather than silently pretending an ops notification was sent.

## Cal.com Event Configuration

The Worker Seal Team 6 Cal.com event type should be configured as:

- One-hour duration.
- $500 paid booking through the Cal.com Stripe app connected to the Ship by Sunday Stripe account.
- Operator-owned calendar connection for availability and destination events.
- Customer as attendee.
- Required intake questions:
  - Company URL.
  - Biggest current pain.
  - Desired outcome.
  - Optional notes.
- Self-serve rescheduling enabled until 24 hours before the call.
- Cancellations/refunds handled manually through support/admin process; there is no self-serve refund flow.
- Booking lifecycle webhooks enabled for created, paid, rescheduled, cancelled, and payment initiated events where available.
- Prep email dispatch gated on paid confirmation, not created or payment-initiated events.

Any Cal.com limitation against those requirements should be recorded as an explicit deviation, with a compensating app/support workflow.

## Convex State

Convex should mirror, not own, Worker Seal Team 6 booking truth:

- `serviceBookings`: Cal.com booking ID/UID, booking status, scheduled UTC start/end, attendee/customer data needed for support and fulfillment, intake answers, reschedule/cancellation status, and source event IDs.
- `serviceBookingPayments`: Cal.com booking ID, Stripe payment references when available, amount, currency, payment status, refund status, and support/admin notes.
- `processedCalEvents`: Cal.com webhook IDs or deterministic event keys for idempotency.
- `processedStripeEvents`: Stripe reconciliation events when Cal.com-connected Stripe payments are visible to the app webhook and useful to verify payment state.

Cal.com is the booking system. Stripe is the payment processor. Convex is the app's durable mirror for support, fulfillment, internal workflows, and release proof.

Refund state should mirror both Cal.com booking state and Stripe refund state when available. Refunds are initiated in Cal.com or Stripe provider dashboards for this Program; the app does not add in-app admin refund actions. Refund approval stays manual/support/admin-owned. A full refund before the call marks the booking refunded/canceled, cancels future fulfillment, sends one branded customer status email saying the booking was refunded and canceled, and sends one internal ops closeout to `BILLING_OPS_EMAILS` plus `WORKER_SEAL_TEAM_6_OPS_EMAILS`. A full refund after the call keeps the delivered fulfillment record and marks the booking refunded for support/accounting. Partial refunds are support/accounting state only and do not cancel the booking or fulfillment or send automatic product-status or internal ops email.

## App Boundaries

Next.js owns:

- `/worker-seal-team-6` marketing page.
- Premium Cal.com embed integration, including a hosted Cal.com fallback link.
- Cal.com webhook route.
- Internal support/ops views over mirrored booking state, if the implementation slice needs them.

Cal.com owns:

- Slot selection.
- Timezone display.
- Intake form.
- Paid booking collection through Stripe.
- Calendar event creation.
- Guest/customer booking emails unless intentionally replaced.
- Self-serve rescheduling.

Convex owns:

- Idempotent webhook processing.
- Mirrored service booking and booking-payment state.
- Internal support/admin state.
- Any entitlements or customer-facing app state derived from the service booking.

Resend owns:

- One branded Worker Seal Team 6 customer prep email after paid booking sync.
- One internal Worker Seal Team 6 ops email after paid booking sync.

Sentry owns:

- Webhook processing errors, sync failures, and provider setup failures.

## Custom Scheduler Fallback

The previously researched custom shadcn/Google Calendar/Mobbin flow is fallback/reference only.

Reactivate the custom path only if Cal.com fails a requirement that matters more than the integration cost, such as:

- unacceptable payment/fee terms
- inability to connect the desired Stripe account cleanly
- insufficient webhook/payment identity for Convex sync
- unacceptable branding or embed limitations
- inability to enforce the 24-hour reschedule cutoff
- weak support for required intake fields

Fallback shape remains: shadcn booking UI inspired by the Apollo Mobbin flow, Google Calendar FreeBusy/Event APIs, app-owned Stripe Checkout, Convex booking holds, and custom fulfillment.

## Failure Modes To Design For

- Cal.com booking webhook is duplicated, delayed, or arrives out of order.
- Cal.com payment webhook says paid but Stripe reconciliation is delayed or missing.
- Stripe sees a payment/refund that Cal.com webhook sync has not mirrored yet.
- Full and partial refunds arrive out of order relative to Cal.com cancellation webhooks.
- Duplicate or out-of-order webhooks try to send duplicate prep or ops emails.
- Booking-created or payment-initiated webhooks arrive before paid confirmation and must not send the prep or ops email.
- Resend is misconfigured or unavailable after the paid booking sync.
- `WORKER_SEAL_TEAM_6_OPS_EMAILS` is missing or invalid in production.
- Paid booking email contains a typo or belongs to someone other than the intended attendee, requiring support correction in Cal.com and Convex mirror state.
- Customer reschedules in Cal.com and Convex mirror is stale.
- Customer cancels or requests refund through support/admin path.
- A refund is issued after the call has already been delivered and must not erase the fulfillment record.
- Cal.com embed fails to load, third-party scripts are blocked, or the embedded surface looks materially cheaper than the service price point.
- Cal.com Stripe app or connected account is misconfigured.
- Cal.com event type settings drift from the documented service policy.
- Cal.com webhook secret is missing or incorrect.

## Setup Contract

The implementation slice must document:

- Cal.com account/workspace ownership.
- Event type name, slug, duration, price, currency, hosted URL, and embed target.
- Stripe connection path inside Cal.com and how to verify money routes to the Ship by Sunday Stripe account.
- Calendar connection used by Cal.com for availability and destination events.
- Required intake fields and their exact labels.
- Reschedule cutoff setting and how it maps to 24 hours.
- Webhook endpoint URL, subscribed events, and secret location.
- The explicit rule that WST6 booking does not create a Clerk account or workspace, plus the support correction path for attendee email mistakes.
- Branded Resend customer prep email template name, sender, subject, required fields, idempotency key, and resend/support behavior if delivery fails.
- Branded Resend full-refund customer status email template name, sender, subject, required fields, idempotency key, and resend/support behavior if an undelivered booking is refunded/canceled.
- Internal Resend full-refund ops closeout email template name, recipients from `BILLING_OPS_EMAILS` plus `WORKER_SEAL_TEAM_6_OPS_EMAILS`, subject, required fields, idempotency key, and resend/support behavior if an undelivered booking is refunded/canceled.
- Internal Resend ops email template name, `WORKER_SEAL_TEAM_6_OPS_EMAILS` recipient env key, subject, required fields, idempotency key, and resend/support behavior if delivery fails.
- Production requirement for `WORKER_SEAL_TEAM_6_OPS_EMAILS`, plus local/preview behavior when unset.
- Local, preview, and production env values for Cal.com webhook verification and API access if needed.
- How to verify a test booking, paid booking, reschedule, cancellation/refund mirror, and duplicate webhook.
- What the app shows when Cal.com embed or webhook sync is unavailable, including the hosted Cal.com fallback link.

## Sources

- Cal.com paid bookings: https://cal.com/help/bookings/paid-bookings
- Cal.com paid event setup with Stripe: https://cal.com/help/event-types/how-to-receive-payments
- Cal.com pricing: https://cal.com/pricing
- Cal.com embed docs: https://cal.com/docs/core-features/embed/install-with-react
- Cal.com API v2 introduction: https://cal.com/docs/api-reference/v2/introduction
- Cal.com webhooks: https://cal.com/help/webhooks
- Cal.com event type API settings: https://cal.com/docs/api-reference/v2/orgs-teams-event-types/create-an-event-type
- Cal.com reschedule booking API: https://cal.com/docs/api-reference/v2/bookings/reschedule-a-booking
- Stripe refunds: https://docs.stripe.com/refunds
- Mobbin Apollo booking flow fallback reference: https://mobbin.com/explore/flows/c4eb307e-93c6-47e1-91c9-04ea75ef035a
