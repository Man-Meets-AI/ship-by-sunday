---
title: Template First Web Convex Planning Brief 1
program_id: template-first-web-convex-architecture
brief_version: 1
status: current
summary: "First planning brief for the architecture contract and migration inventory slice."
read_when:
  - "Writing the first child ExecPlan for this Program."
  - "Starting the web and Convex template-first migration."
---

# Template First Web Convex Planning Brief 1

## Slice

Architecture contract and migration inventory.

## Desired Outcome

Create the checked-in contract that later implementation slices must follow when moving `apps/web` and `apps/web/convex` toward the sibling template. The four landing pages are the visible customer-facing surface, but the slice should make the template's `ARCHITECTURE.md` and `CONVENTIONS.md` logic local to this app, then map current files, route groups, Convex modules, billing flows, provider setup, and tests to the target structure.

## Scope

In scope:

- App-level architecture and conventions docs for `apps/web`.
- Current-to-target path inventory for routes, components, provider helpers, env files, Convex modules, tests, and docs.
- Deviation register for anything not matching the sibling template.
- Target billing and fulfillment domain summary for Starter annual licenses, Workers subscription variants, and Cal.com-backed Worker Seal Team 6 bookings.
- Decision that Starter annual license renewal uses fresh app-owned Stripe Checkout and not Stripe Customer Portal.
- Decision that early Starter renewal extends from the current expiration date, while expired renewal starts from verified payment time.
- Decision that Starter renewal checkout requires Clerk authentication and Convex authorization for the target workspace/license.
- Decision that Workers plan changes between monthly, quarterly, and annual use Stripe Customer Portal when configured for the three prices and desired proration behavior.
- Decision that Workers upgrades and longer commitments apply immediately with fair proration, while downgrades take effect at the end of the current billing period.
- Decision that Workers cancellation uses Stripe Customer Portal, keeps access active through the paid period, mirrors `cancel_at_period_end`, and removes entitlements only after Stripe reports cancellation.
- Decision that Workers cancellation sends one branded Resend confirmation email after Convex mirrors scheduled cancellation.
- Decision that Workers failed-payment retries keep access active while Convex mirrors `past_due`, shows billing attention, and removes access only after Stripe reports `unpaid` or `canceled`.
- Decision that Workers failed-payment recovery uses Stripe Smart Retries with 8 retries over 2 weeks, then cancels the subscription when recovery fails.
- Decision that Workers failed-payment recovery sends exactly one branded customer Resend email per failed renewal invoice after Convex first mirrors `past_due`, with no custom multi-email dunning sequence.
- Decision that Workers failed-payment email is an intentional template expansion and must still use the template sync-first webhook pattern, not raw webhook payloads as app state.
- Decision that Workers sends exactly one branded recovered-payment confirmation email after Convex mirrors `invoice.paid` or recovered subscription state for a previously failed renewal invoice.
- Decision that Workers failed-payment recovery also sends one internal Resend billing ops email to `BILLING_OPS_EMAILS` when Convex first mirrors `past_due`, using a separate template and idempotency key from the customer email.
- Decision that `BILLING_OPS_EMAILS` is a maintainer-owned internal recipient list for payment issues, initially the operator/support email, not a Clerk role or workspace concept.
- Decision that recovered Workers failed payments send one internal Resend billing ops resolved email to `BILLING_OPS_EMAILS`, with a separate idempotency key from the failed-payment ops alert and customer confirmation.
- Decision that terminal Workers failed-payment recovery cancellation sends one final branded customer access-ended email after Convex mirrors provider-driven cancellation, separate from normal customer-requested cancellation confirmation.
- Decision that terminal Workers failed-payment recovery cancellation also sends one internal Resend billing ops closeout email to `BILLING_OPS_EMAILS`, separate from the failed-payment alert, recovered-payment resolved email, and customer access-ended email.
- Decision that full refunds update Convex entitlement or fulfillment state by product, while partial refunds are mirrored for support/accounting without changing access.
- Decision that full refunds that change access or future fulfillment send exactly one branded customer status email, while refunds remain manual/support-approved rather than easy or self-serve.
- Decision that full refunds that change access or future fulfillment send exactly one internal ops closeout email after Convex mirrors the product-state change.
- Decision that partial refunds do not trigger automatic internal ops email; the approving operator owns any follow-up.
- Decision that refunds are initiated in Stripe or Cal.com provider dashboards for this Program; the app mirrors provider truth into Convex and does not add in-app admin refund actions.
- Decision that Workers `past_due` billing attention appears as a global non-blocking app-shell banner for owners/admins, while `/billing` remains the detailed state surface.
- Decision that the Workers `past_due` billing attention banner is not dismissible or snoozable while Convex reports active billing attention.
- Worker Seal Team 6 Cal.com research branch summary, including paid booking setup, Stripe connection, Cal.com webhooks, Convex mirror state, and fallback custom scheduler criteria.
- Decision that Worker Seal Team 6 uses Cal.com for booking and paid scheduling rather than an app-owned Google Calendar/shadcn scheduler.
- Decision that Worker Seal Team 6 embeds Cal.com on `/worker-seal-team-6`, keeps the hosted Cal.com URL as fallback, and treats a cheap-looking embed as a product requirement failure.
- Decision that Worker Seal Team 6 does not require Clerk sign-in before booking and does not trigger post-booking workspace setup; it remains a paid meeting unless the customer later buys Starter or Workers.
- Decision that Worker Seal Team 6 sends exactly one branded Resend prep email after paid booking sync, with no app onboarding or workspace language.
- Decision that Worker Seal Team 6 prep email dispatch requires paid confirmation mirrored in Convex; created/payment-initiated events can update state but cannot send the email.
- Decision that Worker Seal Team 6 sends one internal Resend ops email after paid booking sync, with a separate template and idempotency key from the customer prep email.
- Decision that Worker Seal Team 6 ops recipients are configured through production-required `WORKER_SEAL_TEAM_6_OPS_EMAILS`.
- Decision that Starter and Workers stay on the template Stripe/Convex billing path, while Worker Seal Team 6 mirrors Cal.com booking/payment state into Convex.
- Decision that Cal.com must be configured for the accepted service policy: one-hour duration, $2500 paid booking, required intake questions, self-serve reschedule until 24 hours before the call, and manual/support-handled cancellations/refunds.
- Test and proof inventory for later billing, auth, Convex, Sentry, Resend, and route migration slices.
- Explicit statement that `platform/` is migration debt unless a later slice justifies keeping a specific piece.

Out of scope:

- Moving the full app into `src/`.
- Rewriting checkout or webhooks.
- Changing Convex schema.
- Adding Sentry or Resend packages.
- Changing provider dashboard endpoints.

## Inputs

- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/program.md`
- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/research-pass-template-and-current-web-convex.md`
- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/normalized-pass-template-first-target.md`
- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/converged-decision-packet.md`
- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/dependency-graph.md`
- `~/Developer/next-js-convex-clerk-stripe-template/ARCHITECTURE.md`
- `~/Developer/next-js-convex-clerk-stripe-template/CONVENTIONS.md`
- `apps/web/AGENTS.md`
- `apps/web/convex/_generated/ai/guidelines.md`
- `docs/release-workflow.md`

## Acceptance

- The child ExecPlan records `program_id: "template-first-web-convex-architecture"` and this planning brief path.
- The app has checked-in architecture/conventions docs that future web and Convex work can follow.
- The migration inventory names concrete current paths and target paths.
- The deviation register has no vague entries; every deviation has a reason and owner.
- The billing target model names Starter annual licenses, authenticated/authorized fresh-checkout Starter renewals with early-renewal extension, Workers subscription variants with Customer Portal plan changes, immediate prorated upgrades/longer commitments, period-end downgrades and cancellations with access through paid period, Workers Smart Retries state with 8 retries over 2 weeks and cancellation after failed recovery, owner/admin global non-dismissible billing attention during `past_due`, Workers failed-payment customer recovery email state, Workers recovered-payment customer confirmation email state, Workers terminal failed-recovery customer access-ended email state, Workers failed-payment internal billing ops alert state, Workers recovered-payment internal billing ops resolved email state, Workers terminal failed-recovery internal billing ops closeout email state, Workers cancellation confirmation email state, provider-dashboard refund initiation with no in-app admin refund actions, manual/support-approved full/partial refund mirror state with product-specific entitlement and fulfillment effects, full-refund customer status email state, full-refund internal ops closeout email state, Cal.com-backed Worker Seal Team 6 booking mirrors, entitlements or fulfillment state where appropriate, Stripe events including `invoice.payment_failed`, `invoice.paid`, and refund events as sync-first triggers, Cal.com events, no-workspace side effects for service bookings, customer prep and internal ops email delivery state, production-required maintainer-owned `BILLING_OPS_EMAILS` and Worker Seal Team 6 ops recipient config, and idempotency behavior.
- The inventory captures the Worker Seal Team 6 Cal.com branch and explicitly separates Cal.com, Stripe, Convex, Resend, and Sentry responsibilities.
- The booking branch records Cal.com event type setup, premium embed requirement, hosted fallback link, paid booking policy, webhook sync, reschedule/cancel/refund ownership, and fallback custom scheduler criteria.
- The next implementation slices are concrete enough to write without redoing the analysis.
- `bun run programs:lint` and the relevant docs lint/check command pass, or blockers are recorded.

## Watchpoints

- Do not soften the template-first decision into a neutral comparison.
- Do not ask whether to copy a template pattern; copy it and ask only about product-specific expansions or deliberate deviations.
- Do not use the current webhook endpoint as a default just because release docs currently name it.
- Do not preserve historical URLs by default; route names should come from the target product IA and template conventions.
- Do not let the annual license or service-purchase products disappear into subscription terminology.
- Do not create a doc that future agents cannot execute against; include path maps and concrete deviations.
