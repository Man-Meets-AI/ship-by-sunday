---
title: Worker Seal Team 6 Cal.com Booking Foundation
status: complete
created_at: 2026-05-14
completed_at: 2026-05-14
summary: Add the Cal.com embed, hosted fallback, verified webhook route, and Convex booking mirror foundation behind the Worker Seal Team 6 public page.
post_build_recap: Added configured Cal.com embed/fallback UI on /worker-seal-team-6, verified Cal.com webhook ingress, secret-gated Convex booking mirror sync, provider setup docs, focused tests, and desktop/mobile proof while leaving Resend/Sentry/refund closeout to later slices.
program_id: "template-first-web-convex-architecture"
planning_brief: "docs/programs/active/2026-05-13-template-first-web-convex-architecture/planning-brief-8.md"
read_when:
  - "Resuming the Worker Seal Team 6 Cal.com booking foundation."
  - "Changing the /worker-seal-team-6 booking surface or Cal.com webhook route."
  - "Validating Cal.com provider setup docs, signature verification, or booking mirror state."
---

# Worker Seal Team 6 Cal.com Booking Foundation

This document is a living execution plan for adding the first Cal.com booking foundation behind the Worker Seal Team 6 service page.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Worker Seal Team 6 is a $2,500 hands-on service for teams with a live codebase. The public page exists, but it still tells visitors that Cal.com is future work and sends them to a direct Telegram inquiry. After this slice, the page can render a configured Cal.com booking module and a hosted Cal.com fallback link while keeping the truthful direct fallback for environments that are not configured yet.

The backend side should also be ready for provider truth. Cal.com owns scheduling and paid booking, but Ship by Sunday needs a verified webhook route that mirrors booking lifecycle state into Convex so later Resend and Sentry slices have durable app state to work from.

## Progress

- [x] 2026-05-14: Read the active Program, planning brief inputs, app architecture/conventions, Convex AI guidelines, release workflow, local Next.js route-handler docs, homepage configuration docs, design instructions, current Worker Seal Team 6 route, billing-domain model, route tests, and official Cal.com embed/webhook/paid-booking docs.
- [x] 2026-05-14: Created immutable Program planning brief 8 and this child ExecPlan.
- [x] 2026-05-14: Added Cal.com public booking configuration and route-local embed/fallback UI.
- [x] 2026-05-14: Added server-only Cal.com webhook parsing, signature verification, and event mapping helpers.
- [x] 2026-05-14: Added secret-gated Convex Cal.com sync wrappers and app-origin webhook route.
- [x] 2026-05-14: Added focused tests for UI configuration, event mapping, route signatures, Convex wrapper auth, and booking mirror behavior.
- [x] 2026-05-14: Updated setup docs, Program docs, architecture inventory, design notes, and this plan with validation evidence.
- [x] 2026-05-14: Passed the focused test suite, plan/Program/docs lint, git whitespace check, root format, root lint, root typecheck, and configured/unconfigured desktop/mobile browser proof.

## Surprises & Discoveries

The rebuilt Convex billing domain already has `processedCalEvents` and `workerSealTeam6Bookings`, plus model helpers for booking sync and paid-booking readiness. The missing pieces are the app-origin Cal.com route, server-trusted public Convex wrappers, public embed configuration, and provider setup docs.

Official Cal.com docs currently document inline embeds using an element selector and Cal Link slug, and webhook verification with an HMAC-SHA256 digest in `x-cal-signature-256` over the raw body. That matches the Next.js route-handler pattern already used for Stripe: read the raw body first, verify before parsing, then normalize and sync.

The repo's `unknown-boundary-lint` rejects `unknown` even inside parser internals, so the webhook parser uses the repo `JsonValue` and `MutableJsonObject` boundary types instead of zod-style `unknown` parsing. The final typecheck also caught that `parseCalWebhookEnvelope` needed an explicit `ParsedCalWebhookEnvelope` return type so optional provider fields remained visible after validation.

The Browser plugin's Node REPL workflow was unavailable in this session, so browser proof used a local Playwright probe under ignored `codex-scripts/`. The proof still opened the real dev server route at desktop and mobile viewports in both configured and unconfigured Cal.com states.

## Decision Log

Decision: Use a public Cal Link slug env value for the embed rather than adding `@calcom/embed-react`.
Rationale: Cal.com's documented embed snippet supports inline embeds through the hosted embed script and a Cal Link slug. Avoiding a new package keeps the dependency surface and lockfile unchanged for this foundation slice.
Date: 2026-05-14.

Decision: Keep the direct Telegram fallback when the Cal.com link is missing.
Rationale: The service page must stay truthful in local, preview, or production environments where the Cal.com event type is not configured yet. A missing provider should not render a dead booking box.
Date: 2026-05-14.

Decision: Use the existing `CONVEX_WEBHOOK_MUTATION_SECRET` for Next.js-to-Convex booking mirror writes.
Rationale: Stripe billing sync already uses this server-trusted boundary. Cal.com webhooks still verify their own provider secret first, then use the shared Convex mutation secret for trusted app-origin writes.
Date: 2026-05-14.

Decision: Do not send Worker Seal Team 6 customer prep or ops emails in this slice.
Rationale: The Program separates Resend setup and exactly-once transactional email delivery from this foundation. This slice should produce normalized Convex booking state that the email slice can consume later.
Date: 2026-05-14.

## Outcomes & Retrospective

The public `/worker-seal-team-6` page now has a route-local Cal.com booking boundary. When `NEXT_PUBLIC_WORKER_SEAL_TEAM_6_CAL_LINK` is set, the booking section loads Cal.com's inline embed script, renders a stable embed target, and keeps a hosted Cal.com fallback plus a direct recovery link. When the Cal Link is not set, the page skips script injection and shows the direct scheduling fallback truthfully.

The app now exposes `POST /api/cal/worker-seal-team-6/webhook`. The route reads the raw body, requires `x-cal-signature-256`, verifies HMAC-SHA256 with `CAL_WEBHOOK_SECRET`, maps supported Cal.com booking triggers, and returns retryable failures for bad syncs. Server-only helpers normalize booking uid, attendee, schedule, intake answers, payment status, paid/canceled timestamps, and provider URLs before writing to Convex.

Convex now has secret-gated public wrappers for app-origin Cal.com booking sync and processed-event writes. The wrappers reuse `CONVEX_WEBHOOK_MUTATION_SECRET` after the Cal.com provider signature has already been verified by Next.js.

Docs now record the external setup contract: the exact Cal.com event type, required intake questions, paid-booking configuration, webhook endpoint and triggers, env values, verification command, route map, and failure modes. Program and architecture docs record that this foundation landed while Resend emails, Sentry, refund closeout, and remaining Workers portal/recovery slices are still future Program work.

Validation passed on 2026-05-14:

- `bun run --cwd apps/web test:unit -- tests/unit/worker-seal-team-6-cal-webhook.test.ts tests/unit/convex-billing-sync-boundary.test.ts tests/unit/convex-billing-domain.test.ts`
- `bun run --cwd apps/web test:integration:node -- tests/integration/cal-worker-seal-team-6-webhook-route.test.ts`
- `bun run --cwd apps/web test:integration:ui -- tests/integration-ui/worker-seal-team-6-cal-booking.test.tsx`
- `bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-worker-seal-team-6-cal-com-booking-foundation.md`
- `bun run programs:lint`
- `bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-worker-seal-team-6-cal-com-booking-foundation.md docs/programs/active/2026-05-13-template-first-web-convex-architecture apps/web/src/content/docs docs/ship-by-sunday/design-pack/documentation.md`
- `git diff --check`
- `bun run format`
- `bun lint`
- `bun typecheck`
- `bun codex-scripts/worker-seal-team-6-cal-proof.mjs http://localhost:3100/worker-seal-team-6` against an unconfigured dev server
- `bun codex-scripts/worker-seal-team-6-cal-proof.mjs http://localhost:3101/worker-seal-team-6` against a configured dev server

The dev-server browser proof showed the landing page rendered at desktop and mobile sizes with no horizontal overflow, a visible hero, a loaded first-viewport image, the direct fallback in the unconfigured state, and the configured Cal.com booking surface plus hosted fallback in the configured state. The dev server emitted the existing Clerk development-key warning during proof, but the public route rendered successfully.

## Context and Orientation

The public service page lives at `apps/web/src/app/(marketing)/worker-seal-team-6/page.tsx`. It already uses the shared `PublicSiteHeader`, `Button`, `assetPaths`, `routeConfig`, and `supportContactConfig`. This slice should keep that page as a landing page, not turn the hero into a booking dashboard. The embed belongs in the existing booking section after the first viewport.

Next.js route handlers live under `apps/web/src/app/api`. The existing Stripe webhook route at `apps/web/src/app/api/stripe/webhook/route.ts` is the local pattern: read `request.text()`, verify the signature, call a server-only sync helper, return JSON, and return a retryable non-2xx response when sync fails.

The rebuilt Convex billing domain lives in `apps/web/convex/billing.ts` and `apps/web/convex/billing/model.ts`. `syncWorkerSealTeam6BookingHandler` already upserts booking mirror state by `calBookingUid`; `recordProcessedCalEventHandler` already records Cal.com event idempotency. This slice adds public secret-gated wrappers so a trusted Next.js route can call those handlers through `convex/nextjs`.

Cal.com webhook payloads are external input. The route must verify `x-cal-signature-256` with `CAL_WEBHOOK_SECRET` over the raw request body before JSON parsing. Supported triggers for this slice are `BOOKING_CREATED`, `BOOKING_PAYMENT_INITIATED`, `BOOKING_PAID`, `BOOKING_RESCHEDULED`, and `BOOKING_CANCELLED`.

### In Scope

This plan covers `NEXT_PUBLIC_WORKER_SEAL_TEAM_6_CAL_LINK`, optional `NEXT_PUBLIC_WORKER_SEAL_TEAM_6_CAL_ORIGIN`, the route-local Cal.com embed component, `POST /api/cal/worker-seal-team-6/webhook`, server-only Cal.com helper modules, public secret-gated Convex wrappers for Cal.com event and booking sync, focused tests, provider setup docs, Program docs, architecture inventory, and design documentation.

### Out Of Scope

This plan does not create Cal.com event types through the API, add Cal.com OAuth, add Resend packages or email templates, send emails, add Sentry setup, add app-owned Stripe checkout for Worker Seal Team 6, create Clerk accounts or workspaces for bookers, remove the direct Telegram fallback, or implement full refund closeout behavior.

## Plan of Work

First, add a small route-local Cal.com booking component under `apps/web/src/app/(marketing)/worker-seal-team-6/_components/`. It should accept a Cal Link slug, origin, hosted URL, and direct fallback URL. When the slug is configured, it should load the Cal.com embed script on the client, attach an inline booking surface to a stable element, apply restrained UI settings, and show a hosted Cal.com fallback link. When the slug is absent, it should render the existing direct scheduling fallback without injecting the script.

Second, update `apps/web/src/app/(marketing)/worker-seal-team-6/page.tsx` so the hero primary CTA scrolls to `#booking`, the booking section uses the new component, and the copy reflects the actual configured-or-fallback state. Read the Cal link config from `process.env.NEXT_PUBLIC_WORKER_SEAL_TEAM_6_CAL_LINK` and default the origin from `process.env.NEXT_PUBLIC_WORKER_SEAL_TEAM_6_CAL_ORIGIN` to `https://cal.com`.

Third, extend `apps/web/src/platform/env/server.ts`, `apps/web/convex/env.ts` if needed, and `apps/web/.env.local.example` with Cal.com env values. `CAL_WEBHOOK_SECRET` is server-only. Public embed values are safe to expose because they are already public booking links.

Fourth, add `apps/web/src/lib/cal/worker-seal-team-6-webhook.ts`. It should export pure helpers for verifying the signature, parsing and normalizing supported Cal.com webhook payloads, deriving deterministic event ids when Cal.com does not provide one, mapping event triggers into booking/payment status, and syncing to Convex through `api.billing.recordProcessedCalEventFromServer` and `api.billing.syncWorkerSealTeam6BookingFromServer`.

Fifth, add `apps/web/src/app/api/cal/worker-seal-team-6/webhook/route.ts`. The handler should read the raw body once, require `x-cal-signature-256`, verify the signature, call the sync helper, and return `{ received: true, result: ... }`. Missing or invalid signatures return `400`. Sync errors return `500` so Cal.com can retry.

Sixth, update docs and Program truth. The provider setup docs must say what to create in Cal.com, which event triggers to subscribe to, which env values to set, how to verify the embed and webhook, and what failure looks like. The Program and architecture inventory must record that the embed and webhook mirror foundation landed while Resend/Sentry/refund closeouts remain.

## Milestones

Milestone 1 is public booking UI. It is complete when `/worker-seal-team-6` renders a Cal.com inline booking placeholder and hosted fallback link when configured, and a direct inquiry fallback when unconfigured. Focused integration-ui tests should prove both paths.

Milestone 2 is webhook parsing and Convex boundary. It is complete when pure unit tests prove valid signatures, invalid signatures, supported event mapping, paid readiness, and skipped unsupported events, and when Convex wrapper tests prove the shared secret is enforced.

Milestone 3 is route integration. It is complete when integration tests prove missing and invalid signatures fail before sync, verified supported events call sync, and sync failures return a retryable response.

Milestone 4 is durable documentation and validation. It is complete when env docs, route map docs, homepage configuration docs, Program docs, architecture inventory, design notes, and this ExecPlan are updated and all focused plus relevant broad checks pass.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Inspect these files before editing:

    sed -n '1,280p' 'apps/web/src/app/(marketing)/worker-seal-team-6/page.tsx'
    sed -n '900,1405p' apps/web/convex/billing/model.ts
    sed -n '1,180p' apps/web/src/app/api/stripe/webhook/route.ts

Edit these files or nearby feature-local files:

    apps/web/src/app/(marketing)/worker-seal-team-6/page.tsx
    apps/web/src/app/(marketing)/worker-seal-team-6/_components/worker-seal-team-6-cal-booking.tsx
    apps/web/src/app/api/cal/worker-seal-team-6/webhook/route.ts
    apps/web/src/lib/cal/worker-seal-team-6-webhook.ts
    apps/web/src/platform/env/server.ts
    apps/web/convex/env.ts
    apps/web/convex/billing.ts
    apps/web/.env.local.example
    apps/web/src/content/docs/environment-variables.mdx
    apps/web/src/content/docs/route-map.mdx
    apps/web/src/content/docs/configure-the-homepage.mdx
    docs/programs/active/2026-05-13-template-first-web-convex-architecture/program.md
    docs/programs/active/2026-05-13-template-first-web-convex-architecture/architecture-migration-inventory.md
    docs/ship-by-sunday/design-pack/documentation.md

Run focused validation first:

    bun run --cwd apps/web test:unit -- tests/unit/worker-seal-team-6-cal-webhook.test.ts tests/unit/convex-billing-sync-boundary.test.ts tests/unit/convex-billing-domain.test.ts
    bun run --cwd apps/web test:integration:node -- tests/integration/cal-worker-seal-team-6-webhook-route.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/worker-seal-team-6-cal-booking.test.tsx

Run docs and plan validation:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-worker-seal-team-6-cal-com-booking-foundation.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-worker-seal-team-6-cal-com-booking-foundation.md docs/programs/active/2026-05-13-template-first-web-convex-architecture apps/web/src/content/docs docs/ship-by-sunday/design-pack/documentation.md
    git diff --check

Run app static checks:

    bun run format
    bun lint
    bun typecheck

If the UI changed materially, start the app and verify desktop and mobile:

    bun run --cwd apps/web dev:web:webpack -- -p 3100

Open `http://localhost:3100/worker-seal-team-6` with and without `NEXT_PUBLIC_WORKER_SEAL_TEAM_6_CAL_LINK` configured. Success means the first viewport still reads as a service landing page, the booking section does not overlap, the configured state shows the Cal.com container plus hosted fallback, and the unconfigured state shows the direct inquiry fallback.

## Validation and Acceptance

Acceptance is behavior-based. A visitor should be able to open `/worker-seal-team-6`; if the Cal.com link is configured, the booking section should present the embedded scheduling surface and a hosted Cal.com fallback link. If the link is not configured, the page should clearly offer the direct scheduling line without implying that paid booking is live. Cal.com webhook requests should fail closed when unsigned or incorrectly signed, and verified supported events should update Convex booking mirror state idempotently.

Feature: Worker Seal Team 6 Cal.com booking foundation. Risk: P0-adjacent provider and paid-booking mirror work because the route accepts paid booking lifecycle events, even though this slice does not directly move money or send email. Source of truth: Cal.com provider webhook signature, normalized Convex `workerSealTeam6Bookings`, and `processedCalEvents`. Must work: configured embed, hosted fallback, unconfigured direct fallback, signed created/payment-initiated/paid/rescheduled/cancelled event sync, duplicate convergence, and paid-readiness only after paid confirmation. Must fail safely: missing env, missing signature, invalid signature, unsupported event, missing booking uid, malformed attendee data, and Convex sync failure. Tests: unit, integration route, integration-ui, docs lint, plan/Program lint, app lint/typecheck, and browser proof. CI gate: app static, integration, and generated API typecheck once Convex codegen updates.

### Test Commands

    bun run --cwd apps/web test:unit -- tests/unit/worker-seal-team-6-cal-webhook.test.ts tests/unit/convex-billing-sync-boundary.test.ts tests/unit/convex-billing-domain.test.ts
    bun run --cwd apps/web test:integration:node -- tests/integration/cal-worker-seal-team-6-webhook-route.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/worker-seal-team-6-cal-booking.test.tsx
    bun run format
    bun lint
    bun typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-worker-seal-team-6-cal-com-booking-foundation.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-worker-seal-team-6-cal-com-booking-foundation.md docs/programs/active/2026-05-13-template-first-web-convex-architecture apps/web/src/content/docs docs/ship-by-sunday/design-pack/documentation.md
    git diff --check

## Idempotence and Recovery

The embed configuration is additive and safe to leave unset. If a Cal.com link is wrong, the page should still expose the hosted fallback and direct line. If the embed script is blocked, the hosted fallback remains visible.

Cal.com webhooks may be duplicated, delayed, or out of order. The route should record events by deterministic event id and upsert bookings by `calBookingUid`. If Convex sync fails, return `500` so Cal.com can retry instead of recording a false success. If a payload cannot be mapped but has enough event identity to record, record it as skipped; otherwise return a clear error.

Do not delete or rewrite the existing direct Telegram support path. It is the recovery path for missing Cal.com setup and failed embeds.

## Artifacts and Notes

Official references checked on 2026-05-14:

- Cal.com embed docs: inline embeds attach an embed to an element with `elementOrSelector` and a Cal Link slug, and Cal Link values do not need the full `https://cal.com/...` URL.
- Cal.com webhook docs: webhook authenticity uses an HMAC-SHA256 digest in `x-cal-signature-256` over the received payload body.
- Cal.com paid booking docs: paid events use Cal.com's Stripe app connected to the account.
- Next.js route-handler docs: route handlers live under `app`, use Web `Request` and `Response`, and are not cached for non-GET methods.

## Interfaces and Dependencies

This slice depends on Next.js App Router route handlers, `crypto` HMAC verification, the Cal.com embed script, `convex/nextjs` `fetchMutation`, `api.billing.recordProcessedCalEventFromServer`, `api.billing.syncWorkerSealTeam6BookingFromServer`, `CAL_WEBHOOK_SECRET`, `CONVEX_WEBHOOK_MUTATION_SECRET`, `NEXT_PUBLIC_WORKER_SEAL_TEAM_6_CAL_LINK`, `NEXT_PUBLIC_WORKER_SEAL_TEAM_6_CAL_ORIGIN`, the existing `workerSealTeam6Bookings` and `processedCalEvents` Convex tables, and the existing public `/worker-seal-team-6` page. It intentionally does not depend on Resend, Sentry, Clerk sign-in, app-owned Stripe checkout for Worker Seal Team 6, or Cal.com API write access.
