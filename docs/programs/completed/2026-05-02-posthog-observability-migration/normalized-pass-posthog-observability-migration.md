# PostHog Observability Migration Normalized Pass

## Normalized Problem

Ship by Sunday has a custom Convex-backed observability control plane that now overlaps with the PostHog products the team intends to adopt. The current system captures generic browser and server exceptions, stores incident rollups and occurrences in Convex, manages lifecycle statuses, sends Telegram alerts, and feeds a runtime-intake export. If PostHog is added without retiring or narrowing this system, the app will have duplicate analytics and error sources that are expensive to reason about and easy to distrust.

The team also wants more than basic analytics. The durable target includes session replays, PostHog MCP, the official PostHog AI plugin and skills, and a Codex bug-triage workflow that uses PostHog as the error source and drafts or routes issues into Linear.

## Normalized Target

PostHog becomes the primary analytics, error tracking, session replay, and product-debugging surface. Browser pageviews, product events, client exceptions, server exceptions, source-mapped stacks, and privacy-reviewed session replay live in PostHog. Convex remains the application backend and stores product state, not generic telemetry.

Telegram remains a thin alert delivery client if it continues to provide value, but the alert source should be PostHog or a small bridge rather than a permanent custom incident ledger. Linear remains the durable bug workflow system. Codex uses PostHog MCP, the PostHog AI plugin, Linear, GitHub, and any configured logs to produce draft-first triage reports before scheduled or write-capable automation is allowed.

## Normalized Slice Order

The first slice is the PostHog observability contract. It defines the source-of-truth map, event taxonomy, identity rules, privacy policy, session replay masking, MCP/plugin access policy, and the cutover criteria for Convex observability. It does not install SDKs.

The second slice instruments the Next.js app with PostHog analytics, error tracking, and source maps. It initializes `posthog-js` once in `instrumentation-client.ts`, uses `posthog-node` only from Node runtime, configures env typing, preserves request-id properties, and proves client plus server captures reach PostHog without double pageview or duplicate exception capture.

The third slice adds privacy-safe session replay. It defines masking selectors and `ph-no-capture` classes, blocks sensitive surfaces by default, leaves network body and console log capture off, verifies SDK Doctor health, and proves one controlled replay can be found and linked to an error or session.

The fourth slice handles MCP, plugin, and agent operations. It documents PostHog AI plugin installation for Codex, project-pinned MCP auth, allowed read tools, high-risk write tools, and how Codex should use PostHog MCP and skills during investigation without exposing secrets or raw sensitive replay content.

The fifth slice implements the Codex-to-Linear bug triage workflow. It adapts OpenAI's Sentry example to PostHog Error Tracking and session replays, defines draft-only prompts, duplicate detection, priority rules, Linear Triage fields, and approval gates before any scheduled automation creates or updates issues.

The sixth slice retires redundant Convex observability. It either migrates runtime-intake and Telegram to PostHog-backed sources or explicitly narrows Convex to provider-specific operational incidents. It deletes legacy generic `next_client` and `next_runtime` storage, stale routes, stale schema, stale docs, and workspace UI copy only after replacement proof exists.

## Normalized Boundaries

This Program may touch `apps/web/instrumentation-client.ts`, `apps/web/instrumentation.ts`, `apps/web/next.config.ts`, `apps/web/platform/env/*`, `apps/web/lib/observability/*`, `apps/web/platform/observability/*`, `apps/web/app/api/observability/*`, `apps/web/convex/observability*`, `apps/web/convex/schema.ts`, `docs/internal/observability.md`, `apps/web/content/docs/environment-variables.mdx`, `apps/web/content/docs/deploy-to-vercel.mdx`, Codex/agent setup docs, release/runtime-intake docs, and Program-linked ExecPlans.

This Program must not change checkout behavior, Clerk auth behavior, Convex product data models, product UX, release tag semantics, or Linear workspace configuration directly unless a child ExecPlan explicitly scopes and validates that work.

## Normalized Proof

The Program is complete when a maintainer can see PostHog receiving pageviews, key product events, client exceptions, server exceptions, source-mapped stack traces, and a controlled privacy-safe session replay; Codex can use the PostHog plugin or MCP to inspect PostHog errors and replay links during a draft-only triage sweep; Linear issue drafts include PostHog evidence and duplicate checks; Telegram delivery is either backed by PostHog or intentionally narrowed; and the redundant Convex generic incident collection has been deleted or formally retired with docs and tests updated.
