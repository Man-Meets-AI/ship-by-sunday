---
summary: "Living execution plan for completing observability incident delivery to Telegram, including incident modeling, provider adapters, lifecycle control, and rollout evidence. It records completed work and the remaining Codex live-smoke gap."
read_when: "Open this when working on observability incidents, Telegram delivery, lifecycle state, or the remaining live-smoke verification."
plan_status: "done"
---

# Complete Observability Incident Delivery to Telegram

This is a living execution plan for finishing the observability incident delivery work that has already been partially implemented in this repository. It must be updated whenever progress, discoveries, or scope decisions change so that a fresh coding agent can resume from this file alone.

This ExecPlan follows the repository root `PLANS.md` contract and must be maintained in accordance with it.

## Purpose / Big Picture

The user-visible goal is simple: when the product is failing, Telegram should tell the maintainer exactly what is broken, which system produced the incident, whether it is a repeat, and what to check next. That already works for the current app-side paths, Clerk webhook verification and `session.revoked`, and Codex app-server runtime failures. The remaining work is to finish the provider-native coverage and rollout path so observability incident delivery is operationally complete rather than merely technically interesting.

After the remaining work in this plan is complete, a maintainer should be able to trigger or receive incidents from the supported sources, see compact Telegram packets that dedupe correctly, change the incident lifecycle state intentionally, and trust a documented dev-to-prod rollout path. The easiest proof will be a live smoke flow that exercises the app-side path, the Clerk webhook path, the Codex runtime path, and the next provider-native adapter added after this plan update.

## Progress

- [x] 2026-03-23 ET: Read project-level instructions, planning templates, and the original incident-bus outline.
- [x] 2026-03-24 09:16 ET: Replace the narrow `errorEvents -> Telegram` path with a first-class `incidents` model in `features/observability/lib/incident.ts`, `convex/schema.ts`, `convex/observability/model.ts`, `convex/observability.ts`, and `convex/http.ts`.
- [x] 2026-03-24 09:16 ET: Move Telegram packet rendering into `features/observability/telegram/render-incident-message.ts` and keep edit-in-place behavior with `telegramMessageId`.
- [x] 2026-03-24 09:16 ET: Extend app-side capture so `instrumentation.ts`, `instrumentation-client.ts`, `proxy.ts`, Stripe checkout, Stripe webhook failures, and Codex route failures all enter the new incident path.
- [x] 2026-03-24 09:16 ET: Add Codex app-server runtime incidents in `features/codex/server/app-server.ts` and suppress duplicate generic route capture when a typed runtime incident already exists.
- [x] 2026-03-24 09:16 ET: Add Clerk webhook ingress at `app/api/observability/clerk/route.ts`, with `CLERK_WEBHOOK_SIGNING_SECRET` and a narrow high-signal adapter in `features/observability/server/source-adapters/clerk-webhook.ts`.
- [x] 2026-03-24 09:16 ET: Add internal incident lifecycle mutation wiring through `convex/observability.ts` and `convex/observability/model.ts`, including `acked`, `muted`, `resolved`, and `regressed` state handling.
- [x] 2026-03-24 09:16 ET: Validate the current incident/Codex/Clerk slice with targeted Vitest coverage and a successful `bun run build`.
- [x] 2026-03-24 ET: Grill the ExecPlan, resolve the remaining design branches, and lock the finishing scope before more implementation.
- [x] 2026-03-24 12:10 ET: Re-ran the Milestone 1 baseline gate successfully before new edits: the existing targeted observability/Codex/Clerk/Stripe Vitest suite still passed and `bun run build` still succeeded.
- [x] 2026-03-24 12:10 ET: Add the next provider-native adapter with `app/api/observability/vercel/route.ts`, `features/observability/server/source-adapters/vercel-webhook.ts`, `OBSERVABILITY_VERCEL_WEBHOOK_SECRET`, focused Vercel tests, and a passing `bun run build`.
- [x] 2026-03-24 12:21 ET: Add the deliberate incident control entrypoint at `app/api/observability/incidents/[incidentId]/status/route.ts`, protected by `OBSERVABILITY_INCIDENT_CONTROL_TOKEN`, with a thin Next.js-to-Convex transport that reuses the existing ingest channel and focused route/helper coverage.
- [x] 2026-03-24 12:32 ET: Persist Telegram delivery failures as dedicated `telegram_delivery` incidents in `convex/observability/model.ts`, suppress automatic Telegram redelivery for those incidents, classify outage-style versus source-specific failures, and validate the behavior with Convex unit coverage, `bunx convex codegen`, the full observability-targeted Vitest suite, and `bun run build`.
- [x] 2026-03-24 13:18 ET: Add narrow Stripe incident enrichment through `features/observability/server/source-adapters/stripe-failure.ts`, extend checkout failures with Stripe dashboard links and configuration context, convert webhook `invalid_signature`, `missing_clerk_user`, and `grant_failed` results into enriched incidents, and validate with targeted Stripe plus observability suites, `bunx convex codegen`, and `bun run build`.
- [x] 2026-03-24 13:30 ET: Unblock production observability persistence by fixing the eager Convex env loader in `convex/env.ts`, deploying the backend to `helpful-meadowlark-297`, adding `NEXT_PUBLIC_CONVEX_SITE_URL` to Vercel production, and confirming that live Clerk and Vercel smoke incidents persist and deliver.
- [x] 2026-03-24 13:30 ET: Validate the production incident control path by setting the live Vercel smoke incident to `acked`, replaying the same webhook, and confirming the incident stayed `acked` while `occurrenceCount` increased from `1` to `2` and `deliveryCount` stayed at `1`.
- [ ] Capture the remaining Codex runtime live-smoke evidence, or explicitly close the plan with that path marked as the only unverified live behavior.

## Surprises & Discoveries

The original plan is stale in one important way: the repository no longer uses `errorEvents` as the active incident path. The canonical path now starts in `features/observability/lib/incident.ts`, crosses `features/observability/server/ingest-error-event.ts`, lands in `convex/http.ts` at `POST /observability/events`, and persists into the `incidents` table in `convex/schema.ts`. The old `errorEvents` table still exists in the schema as legacy baggage, but the active path is incident-shaped now.

The product identity in code is still `ship-by-sunday`, not `manmeetsai`. `config/product.ts` drives the `product` field stored on incidents and the product name shown in Telegram packets, so the plan must describe the repository as it exists today rather than the older naming used in the first draft.

The build now succeeds, but Turbopack still emits a non-blocking NFT tracing warning through `features/codex/server/app-server.ts` because that file uses filesystem and child-process APIs from a route path. This is not a build blocker right now, but it is a real operational note for future packaging work.

The Clerk webhook adapter is intentionally narrow. It verifies signatures and only escalates `session.revoked` today. Everything else is ignored on purpose so normal auth lifecycle traffic does not become incident noise. That means the next provider-native adapter must follow the same discipline instead of importing a whole event catalog.

The Vercel slice exposed one implementation drift that was not obvious from the plan alone. `convex/observability/model.ts` still had a handwritten `RecordIncidentArgs` union for incident sources, so adding `vercel` to the canonical incident source list was not enough by itself. `bun run build` and `bunx convex codegen` both failed until that local type stopped re-declaring the source union and reused the shared incident types instead.

The incident-control slice exposed a different repository-specific constraint: any new environment variable referenced inside Convex functions must already exist in the hosted Convex deployment before `bunx convex codegen` can finish. Attempting to read `OBSERVABILITY_INCIDENT_CONTROL_TOKEN` from Convex caused codegen to fail immediately because the remote deployment did not have that variable yet. The fix was to keep `OBSERVABILITY_INCIDENT_CONTROL_TOKEN` as the maintainer-facing Next.js route secret, but reuse the already-configured `OBSERVABILITY_INGEST_TOKEN` for the internal Next.js-to-Convex transport through a dedicated Convex HTTP route.

The live smoke phase is now blocked by deployment state rather than code correctness. The production host defined in `.env.production`, `https://www.man-meets-ai.com`, resolves and serves the app, but it still returns `404` for `/api/observability/clerk` and `/api/observability/vercel` while older routes such as `/api/stripe/checkout` and `/api/codex/generate` respond normally. The `api.man-meets-ai.com` host used in the user’s webhook configuration does not resolve from this environment at all. That means the signed webhook smoke cannot complete until the current branch is deployed to a reachable hostname or the correct already-deployed hostname is provided.

That blocker is now resolved for the main production paths. The public app still uses `NEXT_PUBLIC_CONVEX_URL=https://helpful-meadowlark-297.convex.cloud` for browser data access, but observability ingest and incident-control HTTP actions require the matching `.convex.site` origin. Adding `NEXT_PUBLIC_CONVEX_SITE_URL=https://helpful-meadowlark-297.convex.site` to Vercel production, then redeploying, made the app post into the working HTTP-actions endpoint instead of the `.convex.cloud` client origin.

The production Convex deploy issue turned out to be repository-specific rather than infrastructure-specific. `convex/auth.config.ts` imports `requireConvexEnv()` from `convex/env.ts`, and the original `convex/env.ts` eagerly parsed every Convex env variable at module import time. That meant a deploy that only needed `CLERK_FRONTEND_API_URL` still failed if `STRIPE_SECRET_KEY` was not visible in the local shell during bundle evaluation. Switching the loader to validate only the requested key removed that deploy-time failure and allowed `bunx convex deploy -y` against `helpful-meadowlark-297` to succeed.

The remaining live-smoke gap is now narrow: the Codex runtime path has strong automated coverage and a local shell trigger that emits the expected runtime error, but it has not yet been proven end to end through a real authenticated route execution in a live environment.

Evidence from that discovery is concise:

    bunx convex codegen
    ✖ Environment variable OBSERVABILITY_INCIDENT_CONTROL_TOKEN is used in auth config file but its value was not set.
    Go to the Convex dashboard environment variables page to set it up.

Evidence from the Vercel implementation loop is concise and worth preserving here:

    bunx vitest run tests/unit/vercel-webhook-adapter.test.ts tests/integration/observability-vercel-route.test.ts tests/unit/observability-error-event.test.ts
    Test Files  3 passed (3)
    Tests       14 passed (14)

    bunx vitest run tests/unit/observability-*.test.ts tests/unit/clerk-webhook-adapter.test.ts tests/unit/vercel-webhook-adapter.test.ts tests/unit/codex-route-helpers.test.ts tests/unit/codex-app-server-runtime.test.ts tests/integration/observability-client-error-route.test.ts tests/integration/observability-clerk-route.test.ts tests/integration/observability-vercel-route.test.ts tests/integration/stripe-checkout-route.test.ts tests/integration/codex-route-handlers.test.ts
    Test Files  16 passed (16)
    Tests       80 passed (80)

    bunx vitest run tests/unit/observability-incident-status.test.ts tests/integration/observability-incident-status-route.test.ts tests/unit/observability-convex.test.ts
    Test Files  3 passed (3)
    Tests       11 passed (11)

    bunx vitest run tests/unit/observability-*.test.ts tests/unit/clerk-webhook-adapter.test.ts tests/unit/vercel-webhook-adapter.test.ts tests/unit/codex-route-helpers.test.ts tests/unit/codex-app-server-runtime.test.ts tests/integration/observability-client-error-route.test.ts tests/integration/observability-clerk-route.test.ts tests/integration/observability-vercel-route.test.ts tests/integration/observability-incident-status-route.test.ts tests/integration/stripe-checkout-route.test.ts tests/integration/codex-route-handlers.test.ts
    Test Files  18 passed (18)
    Tests       88 passed (88)

    bunx vitest run tests/unit/observability-convex.test.ts
    Test Files  1 passed (1)
    Tests       5 passed (5)

    bunx vitest run tests/unit/stripe-observability.test.ts tests/unit/stripe-webhook-action.test.ts tests/integration/stripe-checkout-route.test.ts tests/unit/observability-api-error-response.test.ts
    Test Files  4 passed (4)
    Tests       16 passed (16)

    bunx vitest run tests/unit/observability-*.test.ts tests/unit/clerk-webhook-adapter.test.ts tests/unit/vercel-webhook-adapter.test.ts tests/unit/stripe-observability.test.ts tests/unit/stripe-webhook-action.test.ts tests/unit/codex-route-helpers.test.ts tests/unit/codex-app-server-runtime.test.ts tests/integration/observability-client-error-route.test.ts tests/integration/observability-clerk-route.test.ts tests/integration/observability-vercel-route.test.ts tests/integration/observability-incident-status-route.test.ts tests/integration/stripe-checkout-route.test.ts tests/integration/codex-route-handlers.test.ts
    Test Files  20 passed (20)
    Tests       100 passed (100)

    bunx convex data incidents --prod --limit 5 --format jsonLines
    There are no documents in this table.

Evidence from the current validation run is concise and worth preserving here:

    bunx vitest run tests/unit/observability-*.test.ts tests/unit/clerk-webhook-adapter.test.ts tests/unit/codex-route-helpers.test.ts tests/unit/codex-app-server-runtime.test.ts tests/integration/observability-client-error-route.test.ts tests/integration/observability-clerk-route.test.ts tests/integration/stripe-checkout-route.test.ts tests/integration/codex-route-handlers.test.ts
    Test Files  14 passed (14)
    Tests       73 passed (73)

    bun run build
    ✓ Compiled successfully
    Finished TypeScript
    ✓ Generating static pages
    Route (app) includes /api/observability/clerk and the Codex routes

## Decision Log

2026-03-23 — Keep Convex as the control plane for incident state. The rationale was that Convex already owned dedupe and Telegram delivery and could be broadened without inventing a new operational store.

2026-03-24 — Treat `incidents`, not `errorEvents`, as the active domain model. The rationale was that the user explicitly did not care about preserving the old shape as the conceptual baseline, and the code is now cleaner when new work references the real incident model directly.

2026-03-24 — Preserve `errorEvents` in the schema for now even though the active path no longer uses it. The rationale was to avoid mixing historical data cleanup with current incident-bus completion work.

2026-03-24 — Use `features/observability/telegram/render-incident-message.ts` as the single Telegram packet renderer. The rationale was to keep delivery formatting isolated from Convex persistence logic.

2026-03-24 — Preserve `acked` and `muted` on repeat incidents and only convert `resolved` incidents back to `regressed`. The rationale was that an acknowledged or muted incident should remain intentionally suppressed until a human changes it, while a resolved incident should reopen if it reappears.

2026-03-24 — Use `verifyWebhook` from `@clerk/backend/webhooks` in `app/api/observability/clerk/route.ts` with `CLERK_WEBHOOK_SIGNING_SECRET`. The rationale was that the backend verifier accepts the standard `Request` object used by the route without the extra `RequestLike` typing friction of the Next.js wrapper.

2026-03-24 — Keep Clerk webhook coverage narrow at first and escalate only `session.revoked` plus hard failures such as missing config and bad signatures. The rationale was to prove the ingress pattern without creating auth lifecycle spam.

2026-03-24 — Keep incident state transitions internal for now through `internal.observability.updateIncidentStatus`. The rationale was that lifecycle semantics were needed immediately, while the safest external incident control surface still needs a deliberate access model.

2026-03-24 — The first public incident control surface will be a secret-protected Next.js route rather than a local-only script or a larger authenticated admin UI. The rationale was that a narrow bearer-token route is the smallest remote maintainer surface that still works in real environments.

2026-03-24 — The incident control route will use a dedicated secret, `OBSERVABILITY_INCIDENT_CONTROL_TOKEN`, rather than reusing `OBSERVABILITY_INGEST_TOKEN`. The rationale was that incident creation and incident state mutation are different privileges and should not share blast radius.

2026-03-24 — The first public lifecycle contract allows only `acked`, `muted`, `resolved`, and `firing`. The rationale was that maintainers need a clean way to reopen suppressed incidents, while `regressed` should remain system-owned.

2026-03-24 — `telegram_delivery` incidents will be stored but never auto-delivered back through Telegram, and any replay or resend control is explicitly deferred beyond this ExecPlan. The rationale was to avoid recursive delivery loops and keep the incident control surface smaller in this phase.

2026-03-24 — `telegram_delivery` incidents will dedupe globally by failure class for outage-style failures such as rate limits or authorization loss, but dedupe per source incident for content-specific failures such as malformed edits or overlong messages. The rationale was to collapse true channel outages without losing source-specific packet-debugging detail.

2026-03-24 — The first Vercel adapter will use signed deployment webhooks only, scoped to production deployment failures or cancellations. Preview deployments are ignored and later successful deployments do not auto-resolve incidents in this phase. The rationale was to keep the first Vercel slice narrow, high-signal, and free of premature lifecycle automation.

2026-03-24 — The Vercel webhook secret is named `OBSERVABILITY_VERCEL_WEBHOOK_SECRET`. The rationale was to keep observability-owned secrets visually grouped with the rest of the incident system and avoid ambiguity with Vercel-provided system environment variables.

2026-03-24 — Vercel deployment incidents use `source=vercel` and `surface=health`, while Vercel route-boundary failures such as bad signatures or missing configuration stay `surface=webhook` or `surface=config_drift`. The rationale was to keep provider deployment failures distinct from the webhook ingress problems that would block those failures from entering the incident bus.

2026-03-24 — The public incident control route keeps `OBSERVABILITY_INCIDENT_CONTROL_TOKEN` at the Next.js boundary only, while the internal hop into Convex reuses `OBSERVABILITY_INGEST_TOKEN` through `POST /observability/incidents/status`. The rationale was that hosted Convex codegen blocks on brand-new Convex-side environment variables, while the public maintainer-facing privilege still needed to stay separate from the general ingest privilege.

2026-03-24 — `telegram_delivery` incidents are created inside the Telegram delivery action itself after the source incident is marked failed, and they are always stored with `source=telegram_delivery` and `surface=delivery` but never eligible for another Telegram send. The rationale was to make delivery outages visible in the same incident model without creating recursive notification loops.

2026-03-24 — Stripe enrichment stays limited to the current checkout and webhook failure branches, but those branches now include native Stripe dashboard links and configuration context. The rationale was to make existing billing incidents easier to diagnose without broadening the incident bus into routine payment telemetry.

2026-03-24 — `convex/env.ts` now validates only the requested env key instead of parsing the full env object at import time. The rationale was that `convex/auth.config.ts` only needs `CLERK_FRONTEND_API_URL`, and eager validation of unrelated keys such as `STRIPE_SECRET_KEY` was blocking deployment of the backend actually used by production.

2026-03-24 — Production Vercel must set `NEXT_PUBLIC_CONVEX_SITE_URL` to the matching `.convex.site` origin for observability ingest and incident control, even while `NEXT_PUBLIC_CONVEX_URL` stays on the `.convex.cloud` client origin. The rationale was proven directly: `.convex.cloud/observability/events` returned `404`, while `.convex.site/observability/events` accepted the same payload and persisted an incident.

2026-03-24 — Stripe enrichment is limited to the Stripe failure paths already represented in the repo: checkout session creation failures, webhook verification failures, missing `clerkUserId`, and grant or persistence failures. The rationale was to improve existing signal quality without widening into billing telemetry or customer-decline noise.

2026-03-24 — Dev live smoke is the completion gate for this ExecPlan, while production rollout is documented follow-through rather than a mandatory implementation-completion requirement. The rationale was to require real end-to-end proof without forcing risky production-trigger work into the coding completion bar.

## Outcomes & Retrospective

This section must remain future-facing until the remaining milestones are done, but the current state is already materially better than the original plan assumed. The app now has a normalized incident model, a dedicated Telegram renderer, Codex runtime capture, Clerk webhook ingress, Vercel deployment-failure ingress, reachable incident lifecycle controls, Telegram delivery failure incidents, Stripe incident enrichment, a passing build, a production Vercel deployment carrying the new route surface, and a production Convex deployment that now persists and delivers the live webhook incidents exercised in this plan.

Milestone 2 is functionally complete in code and automated validation. Milestone 3 is complete in code and automated validation. The Stripe enrichment follow-up is complete in code and automated validation. Milestone 4 is mostly complete with real production evidence for client, Clerk, Vercel, Telegram delivery, and incident status control. The remaining gap is Codex runtime live evidence.

Success at the end of this updated plan means the lifecycle controls are reachable through an intentional incident control path, Telegram delivery failures produce their own incidents, and a human can run a live smoke checklist with real credentials and see every promised behavior.

If the remaining work stalls, the most likely failure mode is widening scope again by trying to ingest too many provider-native events at once. This plan should be treated as a finishing plan, not a reason to reopen the original architecture debate.

## Context and Orientation

An incident in this repository is the normalized record stored in the `incidents` table in `convex/schema.ts`. It has a `product`, a normalized `environment` of `dev` or `prod`, a `source` such as `next_runtime`, `stripe`, `clerk`, `codex`, or `telegram_delivery`, a `surface` such as `runtime_error`, `auth`, `billing`, `webhook`, `delivery`, `health`, or `config_drift`, a `severity`, a lifecycle `status`, a fingerprint for dedupe, timestamps, delivery metadata, and operator-facing text such as `title`, `summary`, and `nextAction`.

The active app-side ingress path is spread across a few files. `instrumentation.ts`, `instrumentation-client.ts`, `proxy.ts`, `app/api/stripe/checkout/route.ts`, and the Codex route handlers produce incidents through `features/observability/server/capture-server-error.ts` or `features/observability/server/ingest-error-event.ts`. Those normalized payloads are posted to `POST /observability/events` in `convex/http.ts`, which calls `internal.observability.recordIncident` and, when thresholds allow, `internal.observability.deliverIncidentNotification`.

Convex is the durable incident coordinator. `convex/observability/model.ts` owns dedupe, lifecycle persistence, delivery state, status transitions, and Telegram delivery. `convex/observability.ts` exposes the internal mutation and action entrypoints. `features/observability/telegram/render-incident-message.ts` produces the compact packet text consumed by the delivery action.

Codex runtime coverage is separate from normal route-level capture. `features/codex/server/app-server.ts` defines `CodexAppServerRuntimeError`, reports process-level failures through the incident path, and preserves that typed runtime error back to the route boundary. The Codex routes under `app/api/codex/` now pass request context into the app-server client and suppress generic duplicate capture when the runtime layer already emitted the more specific incident.

Clerk webhook coverage now lives at `app/api/observability/clerk/route.ts`. That route verifies the signed Clerk request, ignores routine event types, and converts `session.revoked` into a high-signal auth incident through `features/observability/server/source-adapters/clerk-webhook.ts`. The environment contract for that path is `CLERK_WEBHOOK_SIGNING_SECRET` in `platform/env/server.ts`, `.env.local.example`, `README.md`, and `content/docs/environment-variables.mdx`.

Vercel deployment coverage now lives at `app/api/observability/vercel/route.ts`. That route reads the raw request body, verifies the `x-vercel-signature` HMAC using `OBSERVABILITY_VERCEL_WEBHOOK_SECRET`, ignores non-production and non-escalated deployment events, and converts `deployment.error` plus `deployment.canceled` into incident input through `features/observability/server/source-adapters/vercel-webhook.ts`. The adapter deliberately maps provider deployment failures to `source=vercel` and `surface=health`, while ingress failures on the route itself are captured as Vercel webhook incidents with `surface=webhook` or `surface=config_drift`.

Incident control now lives at `app/api/observability/incidents/[incidentId]/status/route.ts`. That route checks the inbound bearer token against `OBSERVABILITY_INCIDENT_CONTROL_TOKEN`, accepts only `acked`, `muted`, `resolved`, and `firing`, and then forwards the change through `features/observability/server/update-incident-status.ts` into the Convex HTTP path `POST /observability/incidents/status`. That internal hop intentionally reuses `OBSERVABILITY_INGEST_TOKEN`, and the Convex HTTP action immediately calls `internal.observability.updateIncidentStatus` so lifecycle semantics still live in one place.

The most important legacy fact is that `convex/schema.ts` still contains `errorEvents`. That is not the active implementation path anymore. A newcomer should treat `features/observability/lib/incident.ts`, `convex/schema.ts` `incidents`, `convex/http.ts`, and `convex/observability/model.ts` as the current system.

## Plan of Work

The remaining work should proceed in four deliberate movements. First, preserve and document the already-finished baseline so that no one reopens completed incident-model work accidentally. Second, keep the new provider-native adapter narrow and documented so it remains a stable pattern rather than a new expansion point. Third, finish the operational seams by turning Telegram delivery failures into first-class Telegram delivery incidents and by exposing a safe incident control entrypoint for lifecycle changes through a dedicated bearer-token route. Fourth, run live smoke validation in `dev`, document production rollout follow-through, and capture the evidence back into this plan.

The immediate next slice is not more implementation for the incident bus itself. It is either to prove the Codex runtime path through a real authenticated live route exercise, or to close the plan with that one path explicitly marked unverified while the rest of the system is now demonstrated live.

Stripe enrichment comes after that, not before, because Stripe is already represented in the incident bus. The remaining job there is to make those incidents better, not louder. That means stronger context and links on the existing checkout and webhook failure paths, not a wide ingest of every payment event or subscription event.

## Milestones

### Milestone 1 — Foundation baseline complete

This milestone is already complete and serves as the baseline for the rest of the plan. The repository now has a first-class `incidents` model, a dedicated Telegram renderer, Clerk webhook ingress, Codex runtime capture, internal lifecycle status updates, targeted test coverage, and a passing production build. Anyone resuming the work should begin by verifying that this baseline still holds before starting new implementation.

The files that define this baseline are `features/observability/lib/incident.ts`, `features/observability/telegram/render-incident-message.ts`, `convex/schema.ts`, `convex/http.ts`, `convex/observability.ts`, `convex/observability/model.ts`, `features/codex/server/app-server.ts`, `app/api/observability/clerk/route.ts`, and `features/observability/server/source-adapters/clerk-webhook.ts`. Success for this milestone is already proven by the passing build and the current targeted tests.

### Milestone 2 — Add the next provider-native adapter through the same ingress pattern

This milestone is complete in code and automated validation. The repository now contains `app/api/observability/vercel/route.ts`, the small adapter module `features/observability/server/source-adapters/vercel-webhook.ts`, the dedicated secret `OBSERVABILITY_VERCEL_WEBHOOK_SECRET` in the environment contract, and focused tests that prove both verification and normalization behavior.

The implementation intentionally froze a narrow event subset. Only production `deployment.error` and `deployment.canceled` events are escalated through the signed route. Preview and other deployment events are ignored. The route verifies `x-vercel-signature` against the raw request body before parsing JSON, then normalizes the accepted payload into the existing incident path. Success is now demonstrated by focused unit and integration coverage plus the passing build, with the route inventory showing `/api/observability/vercel`.

### Milestone 3 — Finish operational seams

This milestone is complete in code and automated validation. The lifecycle mutation is reachable from the deliberate incident control surface, and Telegram delivery failures now create dedicated Telegram delivery incidents instead of only updating the failed source incident.

The implemented incident control surface is the narrow Next.js route `POST /api/observability/incidents/[incidentId]/status`, protected by `OBSERVABILITY_INCIDENT_CONTROL_TOKEN`. It allows only `acked`, `muted`, `resolved`, and `firing`, and it does not expose replay or resend. The Telegram delivery path now records first-class `telegram_delivery` incidents, deduping globally for outage-style failures such as rate limits or authorization loss while staying source-specific for content rejections or generic send failures. Those incidents are deliberately suppressed from Telegram delivery so the channel can fail without recursive alert storms.

### Milestone 4 — Live environment smoke and rollout evidence

This milestone proves the system outside unit and integration tests. At the end of it, this plan should contain concise evidence showing a successful `dev` smoke run for the app-side path, the Clerk webhook path, the Codex runtime path, and the next provider-native adapter added after this rewrite. Production rollout should also be documented, but it is follow-through guidance rather than the hard completion bar for the implementation work itself.

Success is not “tests still pass.” Success is a real incident reaching Telegram with the right packet shape, dedupe behavior, and lifecycle semantics, plus a short record in this plan of what was triggered, what was observed, and which environment variables were required.

## Concrete Steps

Start every future implementation session from the repository root.

    cd /Users/parkerrex/Projects/manmeetsai-workspace

Before editing anything, confirm the current baseline still holds.

    bunx vitest run tests/unit/observability-*.test.ts tests/unit/clerk-webhook-adapter.test.ts tests/unit/codex-route-helpers.test.ts tests/unit/codex-app-server-runtime.test.ts tests/integration/observability-client-error-route.test.ts tests/integration/observability-clerk-route.test.ts tests/integration/stripe-checkout-route.test.ts tests/integration/codex-route-handlers.test.ts
    bun run build

The expected observation is the same as the evidence already captured in `Surprises & Discoveries`: the targeted suite passes cleanly and `bun run build` succeeds.

The Vercel provider-native adapter now follows the Clerk pattern exactly. The route file is `app/api/observability/vercel/route.ts`, the adapter module is `features/observability/server/source-adapters/vercel-webhook.ts`, the env contract is `OBSERVABILITY_VERCEL_WEBHOOK_SECRET`, and the focused tests are `tests/unit/vercel-webhook-adapter.test.ts` plus `tests/integration/observability-vercel-route.test.ts`. The route verifies the external request before it creates an incident. The adapter maps the provider payload into one `IncidentEventInput` or returns `null` if the event is intentionally ignored. The adapter does not call Convex directly.

When revalidating the completed Vercel slice, use the narrow tests first:

    bunx vitest run tests/unit/vercel-webhook-adapter.test.ts tests/integration/observability-vercel-route.test.ts tests/unit/observability-error-event.test.ts

Then run the broader milestone gate:

    bunx vitest run tests/unit/observability-*.test.ts tests/unit/clerk-webhook-adapter.test.ts tests/unit/vercel-webhook-adapter.test.ts tests/unit/codex-route-helpers.test.ts tests/unit/codex-app-server-runtime.test.ts tests/integration/observability-client-error-route.test.ts tests/integration/observability-clerk-route.test.ts tests/integration/observability-vercel-route.test.ts tests/integration/stripe-checkout-route.test.ts tests/integration/codex-route-handlers.test.ts
    bun run build

When revalidating the completed incident-control slice, use the narrow tests first:

    bunx vitest run tests/unit/observability-incident-status.test.ts tests/integration/observability-incident-status-route.test.ts tests/unit/observability-convex.test.ts

The route contract is now fixed: reuse `internal.observability.updateIncidentStatus` through the thin transport at `features/observability/server/update-incident-status.ts`, protect the external entrypoint with `OBSERVABILITY_INCIDENT_CONTROL_TOKEN`, accept only `acked`, `muted`, `resolved`, and `firing`, and leave replay or resend out of scope for this plan.

When running live smoke checks, add a short note to `Artifacts and Notes` with the exact trigger, the exact Telegram header observed, and whether it created a new message or edited an existing one.

If the production host still returns `404` for `/api/observability/clerk` or `/api/observability/vercel`, stop and record that the deployment does not yet include the observability routes. Do not continue pretending the live smoke failed for application reasons when the reachable deployment simply lacks the routes.

If the production host returns `202` from the app routes but `bunx convex data incidents` remains empty, check the actual `NEXT_PUBLIC_CONVEX_URL` from the Vercel production env pull, verify whether the matching Convex deployment serves `/observability/events`, and confirm that `bunx convex function-spec` on that deployment includes the `observability` functions. A `202` from the Next.js route is not proof of incident persistence because `features/observability/server/ingest-error-event.ts` currently ignores non-OK downstream responses.

## Validation and Acceptance

The work in this updated plan is accepted only when four things are true. First, the current baseline remains green: the targeted tests still pass and `bun run build` still succeeds. Second, the next provider-native adapter proves the narrow ingress pattern works again by receiving a real or well-controlled sample payload and producing one high-signal incident in the existing observability incident path. Third, Telegram delivery failures become visible as their own incidents instead of disappearing into a delivery status field alone, without recursively attempting Telegram delivery. Fourth, a maintainer or script can intentionally change incident lifecycle state through the dedicated incident control route and observe the consequences on repeats.

Use the following validation commands from the repository root as the baseline gate for any continuation of this work:

    bunx vitest run tests/unit/observability-*.test.ts tests/unit/clerk-webhook-adapter.test.ts tests/unit/vercel-webhook-adapter.test.ts tests/unit/codex-route-helpers.test.ts tests/unit/codex-app-server-runtime.test.ts tests/integration/observability-client-error-route.test.ts tests/integration/observability-clerk-route.test.ts tests/integration/observability-vercel-route.test.ts tests/integration/observability-incident-status-route.test.ts tests/integration/stripe-checkout-route.test.ts tests/integration/codex-route-handlers.test.ts
    bun run build

Acceptance for the live smoke is behavioral. The maintainer should be able to point at one Telegram packet and say which source produced it, why it is there, what the next action is, whether it is a repeat, and whether the lifecycle state was preserved or changed as intended. `Dev` live smoke is the completion gate for this ExecPlan. Production rollout evidence should be documented in this file, but it is not a mandatory blocker for calling the implementation work complete.

## Idempotence and Recovery

This work is deliberately additive and should stay that way. New provider-native adapters must be isolated to their own route and source-adapter module, new environment variables must be optional until the adapter is enabled, and the existing app-side incident path must remain intact while new coverage is added.

If a new adapter becomes noisy, disable the route or its verification secret, leave the already-stored incidents alone, and revert only that adapter path. Do not roll back the `incidents` model or the Telegram renderer to solve adapter noise. For the first Vercel slice, remember that preview deployments are intentionally ignored; if preview noise shows up, the adapter is wrong and should be narrowed, not tuned.

If Telegram delivery fails during future work, do not silently swallow it. The recovery path should be to persist a Telegram delivery incident, keep the source incident intact, and retry only after the underlying bot or chat problem is understood. Outage-style failures such as bot authorization loss or rate limiting should collapse into one globally deduped `telegram_delivery` incident per environment and failure class. Packet-content failures such as malformed edits or overlong messages should stay tied to the source incident that produced them.

If a partially completed rollout leaves lifecycle state changes exposed through a route that is not safely protected, remove that route entirely and keep using the internal mutation until a proper incident control boundary is ready. Internal state control is safer than a rushed public control surface. Reusing `OBSERVABILITY_INGEST_TOKEN` is not an acceptable fallback; if `OBSERVABILITY_INCIDENT_CONTROL_TOKEN` is not ready, the public incident control route should not ship.

## Artifacts and Notes

Current baseline validation evidence should stay here until newer evidence replaces it:

    bunx vitest run tests/unit/observability-*.test.ts tests/unit/clerk-webhook-adapter.test.ts tests/unit/vercel-webhook-adapter.test.ts tests/unit/codex-route-helpers.test.ts tests/unit/codex-app-server-runtime.test.ts tests/integration/observability-client-error-route.test.ts tests/integration/observability-clerk-route.test.ts tests/integration/observability-vercel-route.test.ts tests/integration/observability-incident-status-route.test.ts tests/integration/stripe-checkout-route.test.ts tests/integration/codex-route-handlers.test.ts
    Test Files  18 passed (18)
    Tests       88 passed (88)

    bunx convex codegen
    Uploading functions to Convex...
    Generating TypeScript bindings...
    Running TypeScript...

    bun run build
    ✓ Compiled successfully
    Finished TypeScript
    ✓ Generating static pages
    Route (app) includes /api/observability/clerk, /api/observability/vercel, and /api/observability/incidents/[incidentId]/status

Current live-smoke blocker evidence:

    /usr/bin/curl -X OPTIONS https://www.man-meets-ai.com/api/observability/clerk
    204

    /usr/bin/curl -X OPTIONS https://www.man-meets-ai.com/api/observability/vercel
    204

    /usr/bin/curl -X OPTIONS https://www.man-meets-ai.com/api/observability/incidents/test/status
    204

    production signed smoke requests after Vercel + Convex parity
    client 202 {"ok":true}
    clerk 202 {"ok":true,"recorded":true,"type":"session.revoked"}
    vercel 202 {"ok":true,"recorded":true,"type":"deployment.error"}

    live persisted incidents on helpful-meadowlark-297
    clerk incident id js72ctb9w0wjqz0mk0knbmyhrd83gcy3
    code=clerk_session_revoked
    deliveryStatus=delivered
    telegramMessageId=11

    vercel incident id js7dwzvddje355bwc11nh1g63n83g9fb
    code=vercel_deployment_failed
    deliveryStatus=delivered
    telegramMessageId=12

    incident control live check
    POST /api/observability/incidents/js7dwzvddje355bwc11nh1g63n83g9fb/status
    200 {"ok":true,"incidentId":"js7dwzvddje355bwc11nh1g63n83g9fb","status":"acked",...}

    replay same Vercel webhook after ack
    occurrenceCount=2
    status=acked
    deliveryCount=1

The route inventory that matters today is `app/api/observability/client-error/route.ts`, `app/api/observability/clerk/route.ts`, `app/api/observability/vercel/route.ts`, `app/api/observability/incidents/[incidentId]/status/route.ts`, the Stripe checkout and webhook paths, and the Codex routes under `app/api/codex/`. Any future provider-native adapter should be added beside these rather than hidden elsewhere.

## Interfaces and Dependencies

The canonical normalization interface is `normalizeIncidentEvent(input)` in `features/observability/lib/incident.ts`. Any new adapter should produce one `IncidentEventInput` and pass it through this function before calling `ingestErrorEvent(...)`. Do not add provider-specific persistence shortcuts around this interface.

The durable incident interface is `internal.observability.recordIncident` and the delivery interface is `internal.observability.deliverIncidentNotification`, both exposed from `convex/observability.ts` and implemented in `convex/observability/model.ts`. New sources must enter through that path so dedupe and delivery logic stay centralized.

The lifecycle interface is `internal.observability.updateIncidentStatus`. The external incident control surface now reaches it through `features/observability/server/update-incident-status.ts`, which posts to `POST /observability/incidents/status` in `convex/http.ts`, and the maintainer-facing Next.js route `app/api/observability/incidents/[incidentId]/status/route.ts`, which enforces `OBSERVABILITY_INCIDENT_CONTROL_TOKEN`. In this phase, the public route accepts only `acked`, `muted`, `resolved`, and `firing`.

The current provider-native adapter pattern is represented by `buildClerkWebhookIncident(event)` in `features/observability/server/source-adapters/clerk-webhook.ts`, `buildVercelWebhookIncident(event)` in `features/observability/server/source-adapters/vercel-webhook.ts`, and the matching route files under `app/api/observability/`. Future adapters should copy this split: route handler for verification and request boundary handling, adapter module for payload interpretation, normalized incident for ingress into Convex. The Vercel adapter is intentionally production-deployment-webhook-only, with `OBSERVABILITY_VERCEL_WEBHOOK_SECRET` and no preview handling.

The environment dependencies currently required by the live system are `OBSERVABILITY_INGEST_TOKEN`, `OBSERVABILITY_INCIDENT_CONTROL_TOKEN`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `CLERK_WEBHOOK_SIGNING_SECRET`, and `OBSERVABILITY_VERCEL_WEBHOOK_SECRET`, with Codex runtime behavior also depending on the existing Codex app-server environment variables already documented in `.env.local.example`, `README.md`, and `content/docs/environment-variables.mdx`. The incident control route uses `OBSERVABILITY_INCIDENT_CONTROL_TOKEN` at the public Next.js boundary, while the internal route-to-Convex hop still authenticates with `OBSERVABILITY_INGEST_TOKEN`.
