# Observability Runbook

This is the canonical internal guide for the Ship by Sunday observability path. Use it when you need to understand how browser errors, Clerk webhooks, Vercel webhooks, Stripe failures, incident status control, and Telegram delivery fit together in this repo.

The public docs intentionally stay short. This file keeps the full operational story in one place so a maintainer does not have to reconstruct the same `.convex.site` and incident-control rules from multiple pages.

## PostHog Migration Contract

Ship by Sunday uses PostHog as the primary owner for product analytics, pageviews, funnels, generic client exceptions, generic server exceptions, source-mapped stack traces, and privacy-reviewed session replay. Convex remains the product backend. It should not remain the long-term generic telemetry warehouse after PostHog proof exists.

During migration, the Convex incident ledger stays in place for provider-specific operational incidents, runtime-intake export, and Telegram delivery until a later retirement slice replaces or explicitly retires those duties. The durable rule is that PostHog and Convex must not remain permanent duplicate canonical stores for generic `next_client` and `next_runtime` exceptions.

### Current Ownership

PostHog owns browser analytics, automatic pageviews, deliberate product events, same-origin client exceptions, Node.js Next.js runtime request errors, source-map upload, and masked session replay. The first deliberate product event is `checkout_started`, captured from the checkout button path.

The old same-origin client-error endpoint at `apps/web/app/api/observability/client-error/route.ts` is intentionally retired and returns `410 Gone`. `apps/web/instrumentation-client.ts` initializes PostHog instead of installing custom `window.error` and `unhandledrejection` listeners. `apps/web/instrumentation.ts` sends generic `next_runtime` request errors to PostHog on the Node.js runtime instead of writing them to Convex.

The remaining custom Convex path owns Clerk webhook incidents, Vercel webhook incidents, Stripe checkout and webhook failures, incident lifecycle status, Telegram delivery, and runtime-intake export.

The current path is still authoritative for runtime-intake until the `runtime-intake.v1` contract is replaced or retired. It is also still authoritative for Telegram delivery until PostHog alerts, PostHog workflows, Linear notifications, or a narrow bridge takes over.

### Target Ownership

PostHog owns browser analytics, automatic pageviews, deliberate product events, client exceptions, server exceptions, source-mapped stack traces, and session replay. The app uses direct US Cloud ingest at `https://us.i.posthog.com`; a managed reverse proxy is a later reliability optimization, not a launch blocker.

Convex owns product state and product backend behavior. It may keep narrow provider-specific operational incidents during migration, but generic `next_client` and `next_runtime` incident collection should be deleted after PostHog receives and proves the same classes of errors.

Linear owns durable bug workflow: triage status, labels, priority, owner, project, cycle, duplicate handling, and acceptance or closure. Codex may draft or recommend Linear changes, but Linear remains the source of workflow truth.

Telegram is only a thin high-signal alert delivery client. The target is P0/P1-style production exceptions and spikes from PostHog alerts or workflows. Telegram should not drive telemetry storage design.

### PostHog App Environment

The app and production build use these PostHog values:

- `NEXT_PUBLIC_POSTHOG_TOKEN`: public browser project token, safe to expose through a `NEXT_PUBLIC_` variable.
- `NEXT_PUBLIC_POSTHOG_HOST`: browser ingest host. Ship by Sunday uses `https://us.i.posthog.com`.
- `POSTHOG_PROJECT_ID`: numeric PostHog project id used by source-map upload tooling.
- `POSTHOG_API_KEY`: secret PostHog personal API key used only for source-map uploads.

`POSTHOG_API_KEY` must be a project-scoped key for the Ship by Sunday PostHog project with only the `Source map upload` scope. Do not use `All access`, and do not reuse this key for MCP, analytics queries, Linear triage, or agent tooling.

The browser project token is not a Personal API Key. Do not use a Personal API Key in browser code.

### PostHog MCP And Operator Access

PostHog MCP is operator tooling, not application runtime. The hosted endpoint is:

`https://mcp.posthog.com/mcp`

Use OAuth through the official PostHog AI plugin when possible. If API-key auth is required, create a separate project-scoped Personal API Key for the same PostHog project with only the `MCP Server` preset or scope. Do not put MCP credentials in tracked repo files, `NEXT_PUBLIC_*` values, screenshots, or generated customer docs.

Pin MCP sessions to the intended project when the client supports project headers or query parameters. Restrict tools where possible. Read-oriented tools for docs, insights, error tracking, session replays, SDK Doctor, search, and data schema are acceptable for investigation. Write tools for feature flags, experiments, dashboards, workflows, persons, project settings, replay deletion, broad SQL changes, and subscriptions require explicit human approval.

The official PostHog AI plugin repository is `https://github.com/PostHog/ai-plugin`. It provides MCP configuration and task-specific PostHog skills for agent workflows. Installing the plugin is a developer/operator setup step, not an app dependency.

### Session Replay Privacy

Session replay is enabled with a privacy-sensitive default. The implementation does not add a blocking consent banner unless legal review requires one. The engineering default is privacy-first capture:

- mask all inputs
- mask sensitive authenticated text where possible
- add `ph-no-capture`, `data-ph-no-capture`, `data-sensitive`, `data-private`, or `ph-mask` exclusion and masking markers to auth, checkout, billing, account, secrets, invite links, customer content, and admin-only surfaces
- keep network request and response bodies off
- keep console log recording off
- use sampling, URL triggers, event triggers, or minimum-duration rules from PostHog settings if production replay volume or privacy review requires tighter capture

Raw replay content should not be summarized into an AI context until sensitive surfaces have been reviewed. A triage report may link to a replay before it may quote or summarize sensitive replay details.

### Codex-To-Linear Bug Triage

The Codex bug-triage workflow adapts OpenAI's Sentry-oriented pattern to PostHog. PostHog Error Tracking issues, PostHog alerts, session replay links, SDK Doctor output, Linear existing issues, GitHub checks, deploy logs, and support or chat sources are the triage inputs.

Start with one manual Codex thread. The first runs are draft-only: Codex may rank findings, group duplicates, cite evidence, recommend priority, and draft Linear issue bodies, but it must not create, assign, label, close, comment, rerun, or edit anything until an action policy is written and reviewed.

Use the primary Ship by Sunday product engineering Linear team's Triage intake. If the exact team key is ambiguous, resolve it through the Linear connector before issue creation. Default labels are `bug`, `posthog`, `production`, and `observability` when applicable. P0 and P1 findings always draft Linear issues. P2 findings draft issues only when recurring, affecting paying users, or blocking checkout or access. P3 findings stay in the report unless explicitly selected.

Every drafted Linear issue should include the PostHog issue URL, any relevant replay URL, stack or route evidence, affected surface, observed facts, assumptions, severity rationale, duplicate check, and recommended next action.

Repo-local draft workflow instructions live at `.agents/skills/shared/posthog-linear-triage/SKILL.md`. The skill is intentionally draft-only until a separate action policy approves Linear mutation.

### Runtime-Intake And Convex Retirement

Runtime-intake remains repo-owned until a later slice proves a replacement or explicitly retires the contract. Do not delete `apps/web/scripts/export-runtime-intake.mjs`, `apps/web/lib/observability/runtime-intake.mjs`, `scripts/release/lib/engineering-intake-contract.mjs`, or the Convex incident query seams while runtime-intake still reads Convex incidents.

The retirement slice may delete or narrow Convex generic incident storage only after these are true:

- PostHog receives client exceptions, server exceptions, and source-mapped stack traces in production proof.
- Telegram high-signal alerts are backed by PostHog alerts, PostHog workflows, Linear notifications, or a deliberately narrow bridge.
- Runtime-intake is migrated, replaced, or retired with docs and validation.
- Tests no longer depend on Convex as the generic `next_client` and `next_runtime` incident store.
- Docs no longer describe Convex as the canonical owner for generic app exceptions.

### Validation Gates

The PostHog instrumentation path must prove browser pageviews, at least one deliberate product event, client exception capture, server request error capture, and source-map upload. It must also prove no manual pageview code double-counts PostHog's automatic pageview capture.

The replay path must prove one controlled session replay can be found and linked without exposing sensitive surfaces. It must document the exact replay masking and no-capture surfaces.

The MCP and agent path must prove Codex or another approved client can reach project-pinned PostHog MCP or the official PostHog AI plugin with the intended tool restrictions.

The Linear triage path must prove a manual draft-only sweep can produce a ranked report, detect duplicates against existing Linear issues, and draft a Linear issue with PostHog evidence without mutating Linear automatically.

The retirement path must prove runtime-intake, Telegram, tests, and docs no longer rely on the generic Convex incident ledger before deleting remaining generic Convex storage.

After a production build, run:

```bash
bun run posthog:proof
```

This proof checks PostHog env presence and injected source-map chunk IDs without printing secret values. Source maps may be deleted locally after successful upload. Operators still need to confirm the uploaded symbol set and source-mapped issue in PostHog after the build finishes.

## System Map

The observability entrypoints are small but distributed:

- `apps/web/instrumentation-client.ts` initializes the PostHog browser SDK.
- `apps/web/lib/observability/posthog-client.ts` owns browser analytics, exception capture, replay masking defaults, and deliberate product events.
- `apps/web/instrumentation.ts` captures Node.js Next.js request errors through PostHog.
- `apps/web/platform/observability/posthog-server.ts` owns lazy server-side PostHog capture and flushing.
- `apps/web/next.config.ts` wires PostHog source-map upload for production builds.
- `apps/web/app/api/observability/client-error/route.ts` is a retired compatibility route that returns `410 Gone`; do not add new callers.
- `apps/web/app/api/observability/clerk/route.ts` verifies Clerk webhooks, turns them into incidents with `buildClerkWebhookIncident`, and forwards them to Convex.
- `apps/web/app/api/observability/vercel/route.ts` verifies the `x-vercel-signature` header, turns Vercel deploy events into incidents with `buildVercelWebhookIncident`, and forwards them to Convex.
- `apps/web/app/api/observability/incidents/[incidentId]/status/route.ts` is the maintainer-only app route for incident control. It validates `acked`, `muted`, `resolved`, or `firing`, then calls `updateIncidentStatus`.
- `apps/web/platform/observability/ingest-error-event.ts` is the shared Next.js client for provider-specific Convex ingest.
- `apps/web/platform/observability/update-incident-status.ts` is the shared Next.js client for incident status updates.
- `apps/web/platform/observability/request-id.ts` adds and propagates `x-request-id` so responses can be correlated across the app and Convex.
- `apps/web/lib/observability/incident.ts` defines the incident types, status values, normalization rules, and defaults.
- `apps/web/platform/observability/source-adapters/clerk-webhook.ts`, `apps/web/platform/observability/source-adapters/vercel-webhook.ts`, and `apps/web/platform/observability/source-adapters/stripe-failure.ts` translate source-specific events into the shared incident shape.
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
- `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` to deliver incident codebases to Telegram.
- `NEXT_PUBLIC_POSTHOG_TOKEN`, `NEXT_PUBLIC_POSTHOG_HOST`, `POSTHOG_PROJECT_ID`, and `POSTHOG_API_KEY` to run PostHog analytics, error tracking, replay, and source-map upload.

The runtime helpers read these values from `apps/web/platform/env/server.ts` on the Next.js side and `apps/web/convex/env.ts` on the Convex side. If either side is missing the expected value, the route should fail early instead of pretending the transport is healthy.

## Incident Ledger

The Convex observability ledger has two tables with different jobs. `incidents` is the rollup table. One row represents one stable fingerprint for a product and environment, and every matching event increments `occurrenceCount`, updates `firstSeenAt` or `lastSeenAt`, and drives status and delivery decisions. `incidentOccurrences` is the event table. One row represents one reported request, browser session, webhook event, or delivery failure, with the request id, path, stack, details, and links that arrived with that occurrence.

Keep the distinction sharp. Rollup fields answer "how often and what state is this class of issue in?" Occurrence fields answer "what happened on this specific request or event?" The `incidents` table still mirrors the latest request-specific fields for compatibility with existing Telegram and export code, but `latestOccurrenceId` points at the durable latest occurrence row and new occurrence-specific behavior should read `incidentOccurrences`.

The engineering-intake runtime export reads `incidents` as the lifecycle source of truth and includes `incidentOccurrences:<id>` source record references when `latestOccurrenceId` is available. Legacy incident rows without `latestOccurrenceId` remain supported; they export with the incident document and fingerprint references only.

## Incident Lifecycle

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
bun run --cwd apps/web test:unit -- tests/unit/observability-*.test.ts tests/unit/clerk-webhook-adapter.test.ts tests/unit/vercel-webhook-adapter.test.ts tests/unit/stripe-observability.test.ts tests/unit/stripe-webhook-action.test.ts
bun run --cwd apps/web test:integration:node -- tests/integration/observability-client-error-route.test.ts tests/integration/observability-clerk-route.test.ts tests/integration/observability-vercel-route.test.ts tests/integration/observability-incident-status-route.test.ts tests/integration/stripe-checkout-route.test.ts
bun run --cwd apps/web test:integration:ui -- tests/integration-ui/checkout-button.test.tsx tests/integration-ui/error-boundary-screen.test.tsx
```

Use that command when you want fast confidence that the core observability routes, adapters, and Stripe incident path still behave as expected.

For backend inspection, read the incident rows directly from Convex:

```bash
bunx convex data incidents --format jsonLines
```

To inspect request-specific occurrence details, read the occurrence rows:

```bash
bunx convex data incidentOccurrences --format jsonLines
```

Use the same command with `--prod` when you are verifying a production deployment.

For the SBS-owned engineering-intake export over those same incidents, run:

```bash
bun run engineering:intake:runtime -- --output tmp/runtime-intake.v1.json
```

That command reads the hosted Convex `incidents` ledger through the observability-owned query seam, groups repeated rows by the export-time canonical identity, references latest occurrences when available, and writes the frozen `runtime-intake.v1` contract. It is read-only: it does not mutate incident state, delivery metadata, occurrence rows, or Telegram controls. The runtime-intake contract helpers live under `scripts/release/lib/engineering-intake-contract.mjs`; `scripts/release/fixtures/engineering-intake/` contains compatibility fixtures, not the owning implementation.

If you need browser-backed proof, use the release proof commands after the narrow tests:

```bash
bun run release:proof -- --proof=default_ship --dry-run
bun run release:proof -- --proof=default_ship
bun run posthog:proof
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

If PostHog client or server exceptions stop appearing in PostHog, check these first:

1. Confirm `NEXT_PUBLIC_POSTHOG_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` are both present.
2. Confirm `POSTHOG_PROJECT_ID` and the source-map-only `POSTHOG_API_KEY` are present for production builds.
3. Confirm `apps/web/instrumentation-client.ts`, `apps/web/instrumentation.ts`, and `apps/web/next.config.ts` are present in the production bundle path.
4. Run `bun run posthog:proof` after a production build and then confirm the uploaded symbol set in PostHog.

If provider webhooks stop creating Convex incidents, check these in order:

1. Confirm the app has `NEXT_PUBLIC_CONVEX_SITE_URL`, not only `NEXT_PUBLIC_CONVEX_URL`.
2. Confirm the relevant signing secret exists for the source you are testing.
3. Confirm the shared ingest token is identical in the Next.js app and Convex.
4. Inspect `bunx convex data incidents --format jsonLines` for a fresh row and compare `occurrenceCount`, `deliveryCount`, and `status`.
5. If Telegram delivery fails, look for a follow-up incident with `source = telegram_delivery`.

If a resolved incident starts firing again, that is expected behavior for the same fingerprint. Treat it as a regression, not as a duplicate row bug.

## What Good Looks Like

The PostHog path is healthy when browser pageviews, the `checkout_started` product event, generic client exceptions, generic server request exceptions, source-mapped stack traces, and masked session replay appear in the intended PostHog project without duplicate generic Convex incident writes.

The remaining Convex observability path is healthy when a verified Clerk webhook, verified Vercel webhook, or Stripe failure creates a durable provider-specific incident in Convex, the incident can be acked or muted through the app route, and a later replay changes the row in a way that matches the intended suppression behavior.

The engineering-intake runtime export is healthy when `bun run engineering:intake:runtime` produces a contract-valid JSON document that groups repeated `_rsc` or volatile-path variants into one stable downstream record while preserving SBS lifecycle ownership.
