# Observability Runbook

This is the canonical internal guide for the Ship by Sunday observability path. Use it when you need to understand how browser errors, Clerk webhooks, Vercel webhooks, Stripe failures, incident status control, and Telegram delivery fit together in this repo.

The public docs intentionally stay short. This file keeps the full operational story in one place so a maintainer does not have to reconstruct the same `.convex.site` and incident-control rules from multiple pages.

## System Map

The observability entrypoints are small but distributed:

- `apps/web/app/api/observability/client-error/route.ts` accepts same-origin client error reports, normalizes them, and forwards them to Convex through `ingestErrorEvent`.
- `apps/web/app/api/observability/clerk/route.ts` verifies Clerk webhooks, turns them into incidents with `buildClerkWebhookIncident`, and forwards them to Convex.
- `apps/web/app/api/observability/vercel/route.ts` verifies the `x-vercel-signature` header, turns Vercel deploy events into incidents with `buildVercelWebhookIncident`, and forwards them to Convex.
- `apps/web/app/api/observability/incidents/[incidentId]/status/route.ts` is the maintainer-only app route for incident control. It validates `acked`, `muted`, `resolved`, or `firing`, then calls `updateIncidentStatus`.
- `apps/web/features/observability/server/ingest-error-event.ts` is the shared Next.js client for Convex ingest.
- `apps/web/features/observability/server/update-incident-status.ts` is the shared Next.js client for incident status updates.
- `apps/web/features/observability/server/request-id.ts` adds and propagates `x-request-id` so responses can be correlated across the app and Convex.
- `apps/web/features/observability/lib/incident.ts` defines the incident types, status values, normalization rules, and defaults.
- `apps/web/features/observability/server/source-adapters/clerk-webhook.ts`, `apps/web/features/observability/server/source-adapters/vercel-webhook.ts`, and `apps/web/features/observability/server/source-adapters/stripe-failure.ts` translate source-specific events into the shared incident shape.
- `apps/web/convex/http.ts` exposes `/stripe/webhook`, `/observability/events`, and `/observability/incidents/status` on the Convex HTTP-actions origin.
- `apps/web/convex/observability.ts` and `apps/web/convex/observability/model.ts` store incidents, update status, and deliver Telegram notifications.

The important distinction is that the browser-facing app origin and the Convex HTTP-actions origin are not the same thing. The observability clients prefer `NEXT_PUBLIC_CONVEX_SITE_URL` and only fall back to `NEXT_PUBLIC_CONVEX_URL` if the site URL is missing. In production, the site URL should be present so the app talks to the real HTTP-actions host directly.

## Environment Contract

The observability path depends on these values:

- `NEXT_PUBLIC_CONVEX_URL` for the browser-facing Convex client URL.
- `NEXT_PUBLIC_CONVEX_SITE_URL` for Convex HTTP actions such as `/observability/events`, `/observability/incidents/status`, and `/stripe/webhook`.
- `OBSERVABILITY_INGEST_TOKEN` to authenticate the Next.js app when it posts incidents into Convex.
- `OBSERVABILITY_INCIDENT_CONTROL_TOKEN` to protect the maintainer-only incident status route.
- `CLERK_WEBHOOK_SIGNING_SECRET` to verify Clerk webhooks.
- `OBSERVABILITY_VERCEL_WEBHOOK_SECRET` to verify Vercel webhooks.
- `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to let the Stripe webhook handler verify and process paid checkouts.
- `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` to deliver incident blueprints to Telegram.

The runtime helpers read these values from `apps/web/platform/env/server.ts` on the Next.js side and `apps/web/convex/env.ts` on the Convex side. If either side is missing the expected value, the route should fail early instead of pretending the transport is healthy.

## Incident Lifecycle

An incident is the normalized operational record stored in the Convex `incidents` table. Every matching event increments `occurrenceCount`. Telegram delivery increments `deliveryCount` only when a message is actually sent or edited.

The status values matter:

- `firing` means the incident is active and may notify.
- `acked` means a human has acknowledged the incident, so repeat delivery stays suppressed.
- `muted` means the incident should stay quiet, even if it keeps recurring.
- `resolved` means the current incident is closed.
- `regressed` means the same fingerprint came back after a resolution.

The control route can set `acked`, `muted`, `resolved`, or `firing`. It cannot set `regressed` directly; Convex sets that automatically when a resolved fingerprint reappears.

The delivery behavior is driven by `apps/web/convex/observability/model.ts`:

- fresh incidents are stored with `status = firing`
- `acked` and `muted` suppress repeat delivery
- medium-severity incidents wait until the third occurrence before the first delivery
- a resolved incident that reappears becomes `regressed`
- the Telegram delivery action retries by editing an existing incident message when possible

That means the verification signal you care about is not only whether a row exists. You also want to compare `status`, `occurrenceCount`, `deliveryCount`, `deliveryStatus`, and `lastDeliveryAt`.

## Local Validation

When you need the narrow observability check from the repo docs, run:

```bash
bunx vitest run tests/unit/observability-*.test.ts tests/unit/clerk-webhook-adapter.test.ts tests/unit/vercel-webhook-adapter.test.ts tests/unit/stripe-observability.test.ts tests/unit/stripe-webhook-action.test.ts tests/integration/observability-client-error-route.test.ts tests/integration/observability-clerk-route.test.ts tests/integration/observability-vercel-route.test.ts tests/integration/observability-incident-status-route.test.ts tests/integration/stripe-checkout-route.test.ts
```

Use that command when you want fast confidence that the core observability routes, adapters, and Stripe incident path still behave as expected.

For backend inspection, read the incident rows directly from Convex:

```bash
bunx convex data incidents --format jsonLines
```

Use the same command with `--prod` when you are verifying a production deployment.

If you need browser-backed proof, use the QA control plane after the narrow tests:

```bash
bun run qa:validate
bun run qa:run-pack -- --pack=default_ship
```

On production releases, the same proof should run against `apps/web/.env.production` and the live site URL.

## Incident Control Drill

When you need to suppress or re-arm a live incident, use the app route rather than patching the Convex table by hand. The route is:

`POST /api/observability/incidents/<incidentId>/status`

It requires the `OBSERVABILITY_INCIDENT_CONTROL_TOKEN` bearer token and accepts one of `acked`, `muted`, `resolved`, or `firing`.

Example:

```bash
curl -X POST "http://localhost:3000/api/observability/incidents/<incidentId>/status" \
  -H "Authorization: Bearer $OBSERVABILITY_INCIDENT_CONTROL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"acked"}'
```

If the route returns `503`, check `OBSERVABILITY_INCIDENT_CONTROL_TOKEN` first and then `OBSERVABILITY_INGEST_TOKEN`. The route needs both.

## Recovery Notes

If client errors or provider webhooks stop creating incidents, check these in order:

1. Confirm the app has `NEXT_PUBLIC_CONVEX_SITE_URL`, not only `NEXT_PUBLIC_CONVEX_URL`.
2. Confirm the relevant signing secret exists for the source you are testing.
3. Confirm the shared ingest token is identical in the Next.js app and Convex.
4. Inspect `bunx convex data incidents --format jsonLines` for a fresh row and compare `occurrenceCount`, `deliveryCount`, and `status`.
5. If Telegram delivery fails, look for a follow-up incident with `source = telegram_delivery`.

If a resolved incident starts firing again, that is expected behavior for the same fingerprint. Treat it as a regression, not as a duplicate row bug.

## What Good Looks Like

The observability path is healthy when a same-origin client error, a verified Clerk webhook, or a verified Vercel webhook creates a durable incident in Convex, the incident can be acked or muted through the app route, and a later replay changes the row in a way that matches the intended suppression behavior.
