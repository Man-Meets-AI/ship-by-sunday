---
title: Template First Web Convex Planning Brief 8
program_id: template-first-web-convex-architecture
brief_version: 8
status: current
summary: "Eighth planning brief for the Worker Seal Team 6 Cal.com booking foundation."
read_when:
  - "Writing or resuming the Worker Seal Team 6 Cal.com booking child ExecPlan."
  - "Changing the /worker-seal-team-6 booking surface, Cal.com embed configuration, or Cal.com webhook route."
  - "Checking what belongs in the first Cal.com integration slice before Resend, Sentry, or refund closeout work."
---

# Template First Web Convex Planning Brief 8

## Slice

Worker Seal Team 6 Cal.com booking foundation.

## What Landed

The previous child slice migrated Stripe billing ingress to `POST /api/stripe/webhook`, added server-only Stripe billing sync helpers, added secret-gated Convex billing wrappers, updated Checkout success sync retry, switched Workers Checkout to Stripe subscription mode, and updated provider setup docs and release proof expectations. The public Worker Seal Team 6 landing page already exists at `/worker-seal-team-6`, but it still uses the interim direct Telegram scheduling handoff.

## Initiative Facts That Changed

The app now has all four public landing pages and an app-origin Stripe webhook path. The next unresolved landing-page/provider gap is Worker Seal Team 6 booking. The page should no longer say Cal.com is merely future work once a configured Cal.com event type exists. It should render a premium embedded booking surface with a hosted Cal.com fallback link, and the app should verify Cal.com webhook signatures before writing normalized booking mirror state into Convex.

Official Cal.com docs currently say inline embeds attach the Cal.com booking surface to an element by `elementOrSelector` and a Cal Link slug, webhook subscriptions can include a secret, webhook authenticity is verified by comparing an HMAC-SHA256 digest in `x-cal-signature-256` against the raw body, and paid bookings use Cal.com's Stripe app connected to the account. This slice should use those documented behaviors without adding a Cal.com API write path.

## Desired Outcome

After this slice, `/worker-seal-team-6` can show a real Cal.com booking module when the event link is configured, while still showing a truthful direct inquiry fallback when it is not. Cal.com can send booking lifecycle webhooks to a Next.js app route, the route can verify the raw-body signature, map created, payment-initiated, paid, rescheduled, and cancelled booking events into the rebuilt Convex billing domain, and record duplicate or unsupported events idempotently.

The customer prep email, internal ops email, Sentry capture, and refund-closeout email flows remain required Program work, but they should not be silently absorbed into this foundation slice. This slice should leave the Convex state ready for those follow-up sends.

## Scope

In scope:

- Add a configured Cal.com embed/fallback surface on `/worker-seal-team-6`.
- Use `NEXT_PUBLIC_WORKER_SEAL_TEAM_6_CAL_LINK` as the public Cal Link slug, with `NEXT_PUBLIC_WORKER_SEAL_TEAM_6_CAL_ORIGIN` defaulting to `https://cal.com`.
- Keep direct Telegram scheduling visible when the Cal.com link is absent.
- Add `POST /api/cal/worker-seal-team-6/webhook`.
- Verify `x-cal-signature-256` from the raw request body with `CAL_WEBHOOK_SECRET`.
- Add server-only Cal.com webhook parsing and mapping helpers under `apps/web/src/lib/cal/`.
- Add secret-gated public Convex wrappers for `processedCalEvents` and `workerSealTeam6Bookings` using the existing `CONVEX_WEBHOOK_MUTATION_SECRET` server trust boundary.
- Map `BOOKING_CREATED`, `BOOKING_PAYMENT_INITIATED`, `BOOKING_PAID`, `BOOKING_RESCHEDULED`, and `BOOKING_CANCELLED` into service booking mirror state.
- Record unsupported or unmappable verified Cal.com events as skipped where possible.
- Update env docs, route map docs, homepage configuration docs, Program docs, architecture inventory, app architecture/conventions docs if needed, and design-pack notes.
- Add focused unit/integration tests for signature verification, event mapping, route behavior, duplicate-safe Convex wrappers, and configured/unconfigured booking UI.

Out of scope:

- Creating or updating Cal.com event types through the Cal.com API.
- Adding a Cal.com OAuth flow or API key management path.
- Adding Resend packages, React Email templates, or email sending.
- Adding Sentry package setup or Sentry capture.
- Mirroring Stripe refunds for Cal.com payments beyond the booking webhook facts available in this slice.
- Sending Worker Seal Team 6 prep, ops, refund status, or refund closeout emails.
- Adding Clerk sign-in, workspace setup, or entitlement changes after a booking.
- Removing the direct Telegram fallback entirely.
- Adding app-owned Stripe checkout for Worker Seal Team 6.

## Inputs

- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/program.md`
- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/architecture-migration-inventory.md`
- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/worker-seal-team-6-booking-research.md`
- `docs/exec-plans/completed/2026-05-13-convex-billing-domain-rebuild.md`
- `docs/exec-plans/completed/2026-05-14-worker-seal-team-6-public-landing-page.md`
- `docs/release-workflow.md`
- `apps/web/AGENTS.md`
- `apps/web/ARCHITECTURE.md`
- `apps/web/CONVENTIONS.md`
- `apps/web/convex/_generated/ai/guidelines.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
- `docs/exec-plans/PLANS.md`
- Official Cal.com embed, webhook, API, and paid-booking docs.

## Acceptance

- The child ExecPlan records `program_id: "template-first-web-convex-architecture"` and this planning brief path.
- `/worker-seal-team-6` renders a Cal.com inline booking surface when `NEXT_PUBLIC_WORKER_SEAL_TEAM_6_CAL_LINK` is configured.
- `/worker-seal-team-6` renders the direct inquiry fallback and does not inject the embed script when no Cal.com link is configured.
- The page includes a hosted Cal.com fallback link when the booking link is configured.
- `POST /api/cal/worker-seal-team-6/webhook` rejects missing or invalid Cal.com signatures before parsing or sync.
- Verified supported Cal.com events write normalized service booking state through `api.billing.syncWorkerSealTeam6BookingFromServer`.
- Verified supported Cal.com events record `processedCalEvents` through `api.billing.recordProcessedCalEventFromServer`.
- Duplicate Cal.com events converge through the existing processed-event and booking idempotency model.
- Created and payment-initiated events do not mark `paidBookingReady`; paid events do.
- Provider setup docs name the Cal.com event type, embed config, webhook URL, subscribed events, `CAL_WEBHOOK_SECRET`, `CONVEX_WEBHOOK_MUTATION_SECRET`, and verification steps.
- Focused tests cover configured/unconfigured page behavior, route signature behavior, event mapping, paid-readiness mapping, and skipped-event behavior.
- The Program and architecture inventory record that Cal.com embed and webhook mirror foundation landed, while Resend/Sentry/refund closeout work remains.

## Watchpoints

- This is paid-booking provider work. Treat it as P0-adjacent even though this slice does not move money directly. Signature verification, idempotency, and failure-mode tests matter.
- Do not parse JSON before verifying the raw-body HMAC.
- Do not trust Cal.com payloads as durable app state without validation and normalization.
- Do not expose `CAL_WEBHOOK_SECRET` or `CONVEX_WEBHOOK_MUTATION_SECRET` to the browser.
- Do not require Clerk sign-in or create a workspace for Worker Seal Team 6 bookings.
- Do not send customer or ops emails from raw webhooks. Email sends must wait for the Resend slice and normalized Convex state.
- Keep the direct Telegram fallback until live Cal.com setup is proven in each hosted environment.
