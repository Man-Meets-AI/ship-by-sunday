# PostHog Observability Migration Research Pass

## Scope

This research pass preserves the evidence for replacing Ship by Sunday's homegrown generic observability collection with PostHog while keeping the parts that still provide repo-specific value. It covers PostHog analytics, error tracking, source maps, session replay, PostHog MCP, the official PostHog AI plugin and skills, Telegram as a thin alert client, and Codex-driven bug triage into Linear.

## Repo Evidence

The current client error path starts in `apps/web/instrumentation-client.ts`, `apps/web/app/error.tsx`, `apps/web/app/global-error.tsx`, `apps/web/app/(workspace)/error.tsx`, and `apps/web/app/_components/error-boundary-screen.tsx`. Those paths call `apps/web/lib/observability/client-error-report.ts`, which sends same-origin reports to `apps/web/app/api/observability/client-error/route.ts`; that route normalizes the event and posts it into Convex.

The current server error path starts in `apps/web/instrumentation.ts` through Next `onRequestError` and in shared route helpers such as `apps/web/platform/observability/capture-server-error.ts`, `apps/web/platform/observability/api-error-response.ts`, and `apps/web/platform/observability/request-id.ts`. Server captures currently normalize into the same Convex-backed incident model.

The Convex observability ledger lives in `apps/web/convex/schema.ts`, `apps/web/convex/observability.ts`, and `apps/web/convex/observability/model.ts`. It owns the `incidents` rollup table, `incidentOccurrences` event table, issue status values, notification suppression, Telegram delivery, and runtime-intake query seams. The legacy `errorEvents` schema still exists but has no active writer in the current repo search.

Telegram alert rendering lives in `apps/web/lib/observability/telegram/render-incident-message.ts`. Delivery and delivery-failure incidents live in `apps/web/convex/observability/model.ts`. Telegram is valuable as a thin operator notification client, but it should not remain the reason generic browser and server exceptions are stored in Convex after PostHog becomes primary.

Runtime-intake export currently reads Convex incident rows through `apps/web/scripts/export-runtime-intake.mjs` and `apps/web/lib/observability/runtime-intake.mjs`. `scripts/release/lib/engineering-intake-contract.mjs` describes SBS observability incidents as source, lifecycle, ack, and resolve ownership. This means the migration cannot delete Convex incident ownership until runtime-intake has a PostHog-backed replacement or a formally retired contract.

`docs/internal/observability.md` is behaviorally useful but stale in path names. It still references old `features/observability/*` surfaces even though current owners are under `apps/web/lib/observability/*` and `apps/web/platform/observability/*`.

## PostHog Evidence

PostHog's current Next.js guidance recommends `posthog-js` in `instrumentation-client.ts` for Next.js 15.3+ with the US Cloud host `https://us.i.posthog.com` and the recommended defaults flag. Source: `https://posthog.com/docs/libraries/next-js`.

PostHog error tracking for Next.js supports client exception autocapture, manual `posthog.captureException(error)` from App Router `error.tsx` and `global-error.tsx`, server-side capture with `posthog-node`, and server request error capture through Next `instrumentation.ts` `onRequestError`. Source: `https://posthog.com/docs/error-tracking/installation/nextjs`.

PostHog source-map upload for Next.js uses `@posthog/nextjs-config` in `next.config.js` with `POSTHOG_API_KEY`, `POSTHOG_PROJECT_ID`, and `NEXT_PUBLIC_POSTHOG_HOST`. The PostHog config package injects and uploads source maps during production builds. Source: `https://posthog.com/docs/error-tracking/upload-source-maps/nextjs`.

PostHog Node SDK guidance says server-side events need a `distinct_id` matching the frontend identity, and serverless or short-lived functions should flush immediately or shut down after capture. Source: `https://posthog.com/docs/libraries/node`.

PostHog session replay is high-signal but privacy-sensitive. Inputs are masked by default, while non-input text requires explicit masking such as `maskTextSelector`, `maskTextFn`, or `ph-no-capture`. Source: `https://posthog.com/docs/session-replay/privacy`.

PostHog MCP is hosted at `https://mcp.posthog.com/mcp`. It supports OAuth, API-key auth with the MCP Server preset, organization or project pinning, feature or exact-tool filtering, and tools for error tracking, session replays, insights, SDK doctor, logs, workflows, and more. Source: `https://posthog.com/docs/model-context-protocol`.

The official PostHog AI plugin repository is `https://github.com/PostHog/ai-plugin`. It declares Codex support, includes MCP server config, and ships task-specific skills for PostHog best practices, including session replay diagnostics and SDK instrumentation. The older standalone `PostHog/mcp` repository is archived; the active MCP server lives under the PostHog monorepo.

OpenAI's Codex bug-triage guidance says to run one manual sweep in a single Codex thread, tune the report there, then schedule it. The starter prompt is draft-only and tells Codex not to post, create, assign, label, close, rerun, or edit anything during the first sweep. Source: `https://developers.openai.com/codex/use-cases/automation-bug-triage`.

## Findings

PostHog should become the primary source for product analytics, pageviews, funnels, client and server exceptions, source-mapped stack traces, and privacy-reviewed session replay.

Convex should remain product backend state. It should not store generic browser and server exceptions after PostHog is proven. It may temporarily keep provider-specific operational incidents, runtime-intake export ownership, and Telegram delivery while the migration defines replacement contracts.

Session replay must be included in the first durable contract, not bolted on later. The default stance should be privacy-first: authenticated app surfaces mask all inputs and sensitive text, checkout/auth/billing/secrets/customer-content panels use `ph-no-capture` unless reviewed, network bodies and console logs stay off by default, and sampling or trigger-based recording is preferred over recording everything.

PostHog MCP and the PostHog AI plugin are operator tooling, not app runtime. They belong in docs, agent setup, and triage workflows. MCP credentials must not be committed, logged, placed in `NEXT_PUBLIC_*`, or described as durable repo secrets. Project pinning and tool filtering should be part of the setup contract.

Codex-to-Linear triage should adapt the OpenAI Sentry example by replacing Sentry sources with PostHog Error Tracking issues, PostHog alerts, session replay links, SDK Doctor output, and PostHog MCP queries. Codex should start as a read-only analyst and issue drafter. Linear should own the durable workflow: Triage inbox, labels, priority policy, assignees, project/cycle fields, and duplicate handling.

## Constraints

Do not implement PostHog by simply adding another sink beside the current Convex generic incident collection and leaving both forever. The Program must plan deletion or retirement of redundant Convex paths.

Do not remove Convex incident storage until runtime-intake export and Telegram alert ownership are replaced, narrowed, or explicitly retired.

Do not give agents unrestricted PostHog write access. The first operator setup should allow read-oriented docs, insights, error tracking, session replay, SDK Doctor, and entity search; writes such as feature flag changes, experiment changes, workflow changes, dashboard edits, replay deletion, and broad SQL should require explicit human approval.

Do not capture payment, auth, account, billing, secrets, or customer-content screens in session replay by default.

Do not let scheduled Codex triage create or mutate Linear issues until the manual sweep output has been tuned and the action policy is written.

## First Slice Finding

The first child slice should be `PostHog Observability Contract`. It should define the ownership map, event taxonomy, identity policy, env contract, privacy-safe replay policy, MCP/plugin operator policy, Codex-to-Linear triage policy, and deletion criteria for the current Convex generic observability paths before implementation wires any SDKs.
