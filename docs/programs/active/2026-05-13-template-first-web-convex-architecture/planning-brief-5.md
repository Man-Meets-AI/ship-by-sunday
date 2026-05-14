---
title: Template First Web Convex Planning Brief 5
program_id: template-first-web-convex-architecture
brief_version: 5
status: current
summary: "Fifth planning brief for the Convex billing domain rebuild."
read_when:
  - "Writing or resuming the Convex billing domain rebuild child ExecPlan."
  - "Adding Starter annual license, Workers subscription, refund, email-delivery, provider-event, or Worker Seal Team 6 booking state."
  - "Checking which billing concepts must exist before route, webhook, email, and UI slices depend on them."
---

# Template First Web Convex Planning Brief 5

## Slice

Convex billing domain rebuild.

## Desired Outcome

Add the Convex-owned billing domain model that later route, webhook, UI, Cal.com, Stripe, and Resend slices can use without carrying forward the legacy generic access-grant shape. After this slice, Convex should have explicit schema, validators, model helpers, and focused tests for Starter annual license terms, Workers subscription lifecycle state, owner billing attention, refund mirror state, provider event idempotency, email delivery idempotency, and Worker Seal Team 6 Cal.com booking mirror state.

This slice establishes the domain and derivation rules. It does not need to replace the current checkout route, move the Stripe webhook endpoint, send Resend emails, embed Cal.com, or run destructive production migrations.

## Scope

In scope:

- Add additive Convex schema tables for the rebuilt billing model.
- Add validators and narrow TypeScript helpers under `apps/web/convex/billing/`.
- Add a public viewer billing-state query and internal Convex mutations for future trusted sync callers.
- Preserve the current legacy `productAccessGrants`, `checkoutPurchaseIntents`, `pendingCheckoutClaims`, and `stripeWebhookEvents` paths until later route/webhook slices remove or reset them.
- Model Starter as annual license terms, not subscriptions.
- Model Starter renewal term calculation so early renewal extends from the current expiration date and expired renewal starts from verified payment time.
- Model Workers subscription status, cadence, period, scheduled cancellation, `past_due` retry context, terminal failed-payment context, and billing attention derivation.
- Keep Workers access active during `past_due` while the retry/access-through window is still active.
- Model Stripe and Cal.com full/partial refund mirror records with product-state-change flags.
- Model Worker Seal Team 6 paid booking mirrors with Cal.com booking identifiers, attendee, schedule, payment, refund, fulfillment, and prep/ops email state references.
- Model processed Stripe and Cal.com events as idempotency ledgers for the rebuilt billing domain.
- Model email deliveries with dedicated idempotency keys for the future Resend customer and internal ops sends.
- Add focused unit tests for billing derivation and idempotent domain writes.
- Update the Program and architecture inventory after implementation.

Out of scope:

- Replacing `apps/web/convex/stripeWebhook.ts` or `apps/web/convex/http.ts`.
- Moving the Stripe webhook from Convex `.site` to a Next.js route.
- Creating `/api/billing/*`, `/api/stripe/webhook`, or `/api/cal/webhook` route handlers.
- Adding Stripe Customer Portal route behavior, live Stripe API reconciliation, or Stripe dashboard setup changes.
- Adding Cal.com embed UI, Cal.com webhook verification, or Cal.com dashboard setup changes.
- Adding Resend packages, React Email templates, or actual email sending.
- Adding Sentry packages or debug routes.
- Running the destructive legacy billing/access reset migration.
- Adding in-app admin refund actions.
- Replacing all current product access checks with the rebuilt billing domain. Later slices can bridge old access checks to the new domain once route/webhook fulfillment exists.

## Inputs

- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/program.md`
- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/architecture-migration-inventory.md`
- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/planning-brief-4.md`
- `docs/exec-plans/completed/2026-05-13-convex-entitlement-hard-rename-and-reset-migration.md`
- `apps/web/AGENTS.md`
- `apps/web/ARCHITECTURE.md`
- `apps/web/CONVENTIONS.md`
- `apps/web/convex/_generated/ai/guidelines.md`
- `docs/release-workflow.md`
- `docs/exec-plans/PLANS.md`
- Convex migration helper guidance in `.agents/skills/convex-migration-helper/`
- Sibling template Convex billing source: `~/Developer/next-js-convex-clerk-stripe-template/convex`

## Acceptance

- The child ExecPlan records `program_id: "template-first-web-convex-architecture"` and this planning brief path.
- New schema changes are additive and do not require migrating existing rows before deploy.
- Billing validators live under `apps/web/convex/billing/validators.ts` or focused files under `apps/web/convex/billing/`.
- Billing model helpers live under `apps/web/convex/billing/model.ts` or focused files under `apps/web/convex/billing/`.
- The public billing function module exists at `apps/web/convex/billing.ts` and exposes a viewer billing-state query without exposing sensitive sync writes to arbitrary clients.
- Internal sync/write functions exist for Starter license terms, Workers subscriptions, Worker Seal Team 6 booking mirrors, provider event receipts, refund mirrors, and email-delivery records.
- Starter license derivation grants access only when the term is active, not voided, and not fully refunded.
- Starter renewal term calculation extends early renewals from the active term expiration and starts expired renewals from verified payment time.
- Workers entitlement derivation keeps access active for `active`, `trialing`, and still-in-window `past_due` subscriptions, keeps access through `cancel_at_period_end`, and removes access for terminal canceled/unpaid/incomplete states.
- Workers billing attention derivation returns a non-dismissible owner/admin attention state for `past_due`.
- Refund records distinguish full and partial refunds, record whether product access or future fulfillment changed, and do not imply an in-app refund initiation path.
- Worker Seal Team 6 booking mirror state records paid confirmation separately from booking creation, so later prep/ops email sends can require paid state.
- Processed Stripe and Cal.com event helpers are idempotent by provider event id.
- Email-delivery helpers are idempotent by dedicated idempotency key and do not send email in this slice.
- Focused unit tests prove the derivation and idempotent upsert behavior.
- No external provider setup changes are introduced in this slice.

## Watchpoints

- This is P0 billing foundation work. Keep provider payloads out of primary state and avoid raw event-shaped tables as the main domain model.
- Do not force Starter into a subscription schema. Starter is annual license terms with explicit expiration and fresh-checkout renewal.
- Do not grant Workers access forever during `past_due`; access stays active only during the provider retry/access-through window mirrored in Convex.
- Do not add dismiss or snooze state for billing attention.
- Do not let email-delivery state imply webhook acknowledgement depends on Resend delivery. Later webhook routes must acknowledge independently.
- Do not accept a user id from an arbitrary client for authorization. Viewer-facing queries derive the Clerk identity from Convex auth. Internal sync functions may store owner Clerk ids because future server-trusted provider routes need to mirror provider state.
- Current code still keys product access by `identity.subject`; migrating to `identity.tokenIdentifier` is a separate auth/data migration.
- Adding new tables is safe without the Convex migrations component. Changing required fields on existing tables, backfilling, or deleting old rows still requires a separate migration plan.
