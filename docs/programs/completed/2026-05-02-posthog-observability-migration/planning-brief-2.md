---
title: PostHog Observability Migration Planning Brief 2
program_id: posthog-observability-migration
brief_version: 2
status: current
summary: Define the Next.js PostHog instrumentation slice for analytics, error tracking, source-map upload, and SDK boundaries after the ownership contract landed.
read_when:
  - Writing or resuming the Next.js PostHog instrumentation child ExecPlan.
  - Checking runtime implementation boundaries before installing PostHog SDK packages.
  - Validating that PostHog browser and server capture do not duplicate legacy Convex telemetry permanently.
---

# PostHog Observability Migration Planning Brief 2

## Planning Brief

This is the second planning brief for the PostHog observability migration Program. Planning brief 1 produced the ownership contract in `docs/internal/observability.md`. The next slice should make the app actually send the first PostHog signals while keeping the old Convex observability path only as a temporary bridge.

Ship by Sunday needs browser analytics, client exception capture, server exception capture, and source-mapped stack traces in PostHog before session replay, MCP operations, Linear triage, Telegram alert replacement, or Convex retirement can be proven. This slice is the first runtime implementation step.

## Converged Decisions

Use PostHog's official Next.js integration pattern for the app. The expected packages are `posthog-js` for browser capture, `posthog-node` for server capture, and `@posthog/nextjs-config` for source-map upload integration if it fits the current Next.js config.

Use the existing app env names that were added in the contract slice: `NEXT_PUBLIC_POSTHOG_TOKEN`, `NEXT_PUBLIC_POSTHOG_HOST`, `POSTHOG_PROJECT_ID`, and `POSTHOG_API_KEY`. The browser token is public. `POSTHOG_API_KEY` is secret, exists only for source-map upload, and must not be used in browser code or for MCP.

Use direct US Cloud ingest first with `NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com`. Do not add a reverse proxy in this slice.

Let PostHog own automatic pageviews unless the SDK docs and app behavior prove that a manual capture is required. Search for any existing manual pageview analytics before adding new pageview code, and do not double-count route changes.

Keep the existing Convex observability paths during this slice. They remain temporary until PostHog production proof, Telegram replacement or retirement, runtime-intake replacement or retirement, and test/doc cleanup are complete.

## Required Local Context

Before editing Next.js App Router or instrumentation files, read the local Next.js docs installed in this repo because the app may be on a version with behavior that differs from memory:

- `apps/web/node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/instrumentation-client.md`
- `apps/web/node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/instrumentation.md`
- `apps/web/node_modules/next/dist/docs/01-app/02-guides/analytics.md`

Before editing web app files, read `apps/web/AGENTS.md`. If touching Convex code is unexpectedly required, read `apps/web/convex/_generated/ai/guidelines.md` first and use hosted Convex dev only.

## Next Plan Recommendation

Exact next plan title: `Next.js PostHog Instrumentation`.

Exact scope: install and wire the official PostHog Next.js runtime path for browser analytics, client error capture, server error capture, and source-map upload. Validate env boundaries, avoid duplicate pageview capture, add focused tests or probes for the touched instrumentation seams, and update docs that describe how to configure PostHog for a deployed customer repo.

Exact implementation boundaries: do not enable broad session replay in this slice unless the SDK requires a minimal disabled or masked default. Do not create PostHog dashboards, PostHog alerts, MCP configuration, Linear automation, Telegram bridges, or Convex deletion. Do not put real PostHog secrets in tracked files.

Exact validation boundaries: run package install with Bun if dependencies are added, update the matching lockfile, run focused tests for the instrumentation and env surfaces, then run `bun run format`, `bun run lint`, and `bun run typecheck` unless the child ExecPlan records a narrower justified gate. Also run `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-nextjs-posthog-instrumentation.md`, `bun run programs:lint`, markdown lint for touched docs and Program files, and `git diff --check`.

Why it is next: later replay, MCP, Linear triage, Telegram alert replacement, and Convex retirement slices all depend on evidence that PostHog is receiving the base analytics and error signals from the production app.

## Risks To Carry Forward

Do not let PostHog and Convex become permanent duplicate owners for generic exceptions. It is acceptable for this slice to run both temporarily, but the next retirement criteria must remain visible.

Do not accidentally upload source maps with an all-access PostHog key. The only source-map key should be project-scoped to project `317852` with `Source map upload`.

Do not introduce a Personal API Key into client code. Browser code uses only `NEXT_PUBLIC_POSTHOG_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST`.

Do not enable broad session replay before masking and no-capture surfaces are implemented and verified.

Do not rely on memory for Next.js instrumentation file behavior. Read the repo's installed Next.js docs before implementation.
