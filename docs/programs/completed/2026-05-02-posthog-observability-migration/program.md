---
program_id: posthog-observability-migration
title: PostHog Observability Migration
status: complete
created_at: 2026-05-02
completed_at: 2026-05-02
summary: Migrate Ship by Sunday to PostHog-owned analytics, error tracking, session replay, agent investigation, and Linear bug triage while retiring redundant custom observability.
post_build_recap: Ship by Sunday now initializes PostHog in the Next.js browser and server paths, uploads production source maps through PostHog config, captures a deliberate checkout event, retires the custom client-error ingest route, keeps Convex narrowed to provider-specific/runtime-intake duties, and documents MCP plus draft-only Linear triage operations.
read_when:
  - Reviewing the completed PostHog observability migration.
  - Checking which system owns telemetry, incidents, replay, alerts, and bug triage after the migration.
  - Updating PostHog MCP, Linear triage, Telegram alerting, or Convex observability retirement.
---

# PostHog Observability Migration

This is a completed initiative document. It keeps the durable initiative-level truth for migrating Ship by Sunday to PostHog-owned observability without leaving duplicate custom telemetry behind.

This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

Ship by Sunday now uses PostHog as the primary product analytics, generic error tracking, source-map, and session replay surface. Maintainers can inspect behavior, generic errors, and replays in PostHog; use PostHog MCP or the official PostHog AI plugin from Codex for investigation; and route high-signal bugs into Linear through a draft-first workflow. Telegram remains a thin alert client for the most important issues and no longer justifies preserving a broad custom incident warehouse for generic app telemetry.

The completed state keeps Convex as the product backend and the temporary owner for runtime-intake, Telegram delivery, and provider-specific operational incidents. Generic `next_client` and `next_runtime` collection moved out of Convex so PostHog and Convex do not remain permanent duplicate stores for the same app errors.

## Program Inputs

The completed Program packet lives under `docs/programs/completed/2026-05-02-posthog-observability-migration/`.

The durable research input is `docs/programs/completed/2026-05-02-posthog-observability-migration/research-pass-posthog-observability-migration.md`.

The normalized input is `docs/programs/completed/2026-05-02-posthog-observability-migration/normalized-pass-posthog-observability-migration.md`.

The convergence artifact is `docs/programs/completed/2026-05-02-posthog-observability-migration/converged-decision-packet.md`.

The dependency artifact is `docs/programs/completed/2026-05-02-posthog-observability-migration/dependency-graph.md`.

The plan split artifact is `docs/programs/completed/2026-05-02-posthog-observability-migration/plan-split-recommendation.md`.

The review artifact is `docs/programs/completed/2026-05-02-posthog-observability-migration/cross-repo-review.md`.

The final planning brief is `docs/programs/completed/2026-05-02-posthog-observability-migration/planning-brief-2.md`, with `current-planning-brief.txt` pointing at that final versioned brief.

## Current State

`apps/web/instrumentation-client.ts` initializes PostHog in the browser. `apps/web/lib/observability/posthog-client.ts` owns browser analytics, automatic history-change pageviews, automatic client exception capture, masked session replay defaults, and deliberate product events. `apps/web/app/checkout/_hooks/use-stripe-checkout.ts` captures `checkout_started` when a user enters the Stripe checkout path.

`apps/web/instrumentation.ts` captures generic Node.js Next.js request errors through `apps/web/platform/observability/posthog-server.ts`. The implementation avoids Edge runtime server capture because the installed server SDK path is Node-oriented.

`apps/web/next.config.ts` wraps the Next.js config with `@posthog/nextjs-config` for production source-map upload. The tracked env contract names `NEXT_PUBLIC_POSTHOG_TOKEN`, `NEXT_PUBLIC_POSTHOG_HOST`, `POSTHOG_PROJECT_ID`, and `POSTHOG_API_KEY`; the real Personal API Key remains only in ignored local/operator env and Vercel.

`apps/web/app/api/observability/client-error/route.ts` is retired and returns `410 Gone`. Generic client errors no longer post through a same-origin Convex route. Generic `next_runtime` request errors no longer write to Convex from Next.js instrumentation.

Convex remains authoritative for Clerk webhook incidents, Vercel webhook incidents, Stripe checkout and webhook failures, incident lifecycle status, Telegram delivery, and runtime-intake export until those duties are replaced or explicitly retired.

PostHog MCP remains operator tooling, not application runtime. The recommended setup is OAuth through the official PostHog AI plugin. If a Personal API Key is required, it must be separate from the source-map key and scoped to the `MCP Server` job for the same project.

Linear remains the official durable bug workflow. `.agents/skills/shared/posthog-linear-triage/SKILL.md` defines a PostHog-to-Linear draft workflow that can rank findings and draft issue bodies but cannot mutate Linear without a later action policy.

## Progress

- [x] 2026-05-02 EDT: Ran research passes over the current repo observability stack, PostHog docs and plugin surfaces, OpenAI Codex bug-triage guidance, and Program packet requirements.
- [x] 2026-05-02 EDT: Created the active Program packet and planning briefs.
- [x] 2026-05-02 EDT: Wrote and completed the first child ExecPlan at `docs/exec-plans/completed/2026-05-02-posthog-observability-contract.md`.
- [x] 2026-05-02 EDT: Added tracked PostHog source-map env placeholders and customer-facing setup directions, with the real Ship by Sunday source-map key kept only in ignored local env.
- [x] 2026-05-02 EDT: Installed `posthog-js`, `posthog-node`, and `@posthog/nextjs-config` in `apps/web`.
- [x] 2026-05-02 EDT: Implemented browser PostHog initialization, product event capture, client exception handoff, masked session replay defaults, and removal of duplicate custom client listeners.
- [x] 2026-05-02 EDT: Implemented server-side PostHog exception capture for Node.js Next.js request errors and retired generic Convex `next_runtime` writes.
- [x] 2026-05-02 EDT: Wired production source-map upload through Next.js config and added `bun run posthog:proof`.
- [x] 2026-05-02 EDT: Retired `/api/observability/client-error` as a `410 Gone` compatibility route.
- [x] 2026-05-02 EDT: Added focused unit, integration, and integration-UI tests for the PostHog adapters, instrumentation, retired route, env parsing, and checkout event capture.
- [x] 2026-05-02 EDT: Added the PostHog-to-Linear triage skill and updated the internal Linear and observability runbooks.

## Decision Log

Decision: Use a Program for the PostHog observability migration.
Rationale: The work spans SDKs, error tracking, source maps, replay, MCP, plugin skills, Codex triage, Linear workflow, Telegram, Convex retirement, runtime-intake, and docs.
Date: 2026-05-02

Decision: Keep Convex for provider-specific operational incidents and runtime-intake while moving generic app telemetry to PostHog.
Rationale: Convex still owns useful repo-specific duties, but it should not duplicate PostHog for generic client and server exceptions.
Date: 2026-05-02

Decision: Use PostHog's automatic pageview and exception behavior instead of manual duplicate collectors.
Rationale: The goal is to remove custom telemetry paths that were hard to reason about. The implementation initializes PostHog once and removes custom browser error listeners.
Date: 2026-05-02

Decision: Use separate PostHog Personal API Keys by job.
Rationale: Source-map upload needs only the `Source map upload` scope for project `317852`, while MCP and agent access should use OAuth or a separate project-scoped `MCP Server` key. `All access` is unnecessary and increases blast radius.
Date: 2026-05-02

Decision: Use direct US Cloud ingest for the first implementation.
Rationale: `https://us.i.posthog.com` is sufficient for the first production proof. A managed reverse proxy can be added later if capture reliability becomes a real issue.
Date: 2026-05-02

Decision: Enable replay with a privacy-first default.
Rationale: Session replay is valuable for bug triage, but replay content can leak sensitive app text if masking is incomplete. The implementation masks inputs and names no-capture selectors before any replay-derived AI summary workflow exists.
Date: 2026-05-02

Decision: Keep Codex-to-Linear automation draft-only until proven.
Rationale: OpenAI's bug-triage guidance starts with manual sweeps and prevents mutation in the starter prompt. Ship by Sunday should follow that safety model before scheduled actions create or update Linear issues.
Date: 2026-05-02

Decision: Telegram receives only high-signal production issues.
Rationale: Telegram should be a delivery client for the most important issues, not a telemetry store or a reason to preserve duplicate Convex generic incidents.
Date: 2026-05-02

## Slice Ledger

Completed child ExecPlans:

- `docs/exec-plans/completed/2026-05-02-posthog-observability-contract.md`

Completed implementation slices inside this Program:

- Next.js PostHog instrumentation: `apps/web/instrumentation-client.ts`, `apps/web/lib/observability/posthog-client.ts`, `apps/web/instrumentation.ts`, and `apps/web/platform/observability/posthog-server.ts`.
- Source-map proof: `apps/web/next.config.ts`, `scripts/observability/posthog-proof.mjs`, root `package.json`, `apps/web/.env.local.example`, and app docs.
- Replay privacy: browser SDK config in `apps/web/lib/observability/posthog-client.ts` plus `docs/internal/observability.md`.
- MCP and agent operations: `docs/internal/observability.md` and `.agents/skills/shared/posthog-linear-triage/SKILL.md`.
- Codex-to-Linear bug triage workflow: `docs/internal/linear.md` and `.agents/skills/shared/posthog-linear-triage/SKILL.md`.
- Convex observability retirement boundary: retired client-error route and removed generic Next runtime Convex writes, while preserving provider-specific Convex incidents and runtime-intake.

## Next Slice

No required next slice remains inside this Program.

External/operator follow-up remains outside this Program: add the Vercel env values in the hosted project, install the PostHog AI plugin or MCP access through OAuth, confirm one production symbol set in PostHog after the production build, and manually verify one masked replay before allowing replay content into AI summaries.

## Risks and Watchpoints

Session replay can expose sensitive data if masking is later loosened or sensitive surfaces are added without `ph-mask`, `data-sensitive`, `data-private`, `ph-no-capture`, or `data-ph-no-capture` markers.

MCP can expose real production analytics to agents and can include write-capable tools. Project pinning, OAuth or scoped keys, tool filtering, and human review remain required operator controls.

Codex-to-Linear triage can create noisy tickets if automated too early. The checked-in skill is draft-only by design.

Runtime-intake and Telegram are still deletion blockers for the remaining Convex incident ledger. They either need PostHog-backed replacements, Linear-backed replacements, or explicit retirement before provider-specific Convex observability can be deleted.

The production source-map proof has a local command, but the final symbol-set confirmation happens inside PostHog after the Vercel production build.

## Outcomes & Retrospective

The completed program moved Ship by Sunday from custom generic observability toward PostHog without creating a second permanent telemetry source. Browser analytics, client exceptions, server exceptions, masked session replay defaults, and source-map upload now have PostHog-owned code paths. The old client-error route is intentionally dead, and generic Next runtime errors no longer flow into Convex.

The important tradeoff is that Convex was narrowed rather than fully deleted. That is deliberate: provider webhooks, runtime-intake, incident lifecycle controls, and Telegram delivery still have repo-specific behavior that PostHog does not automatically replace. The resulting boundary is clearer and safer than a broad delete.

The biggest operational lesson is key separation. The browser project token, source-map Personal API Key, and MCP access are different jobs and must stay separate in docs, Vercel, and agent setup.

## Validation and Acceptance

Program-level acceptance is satisfied when the codebase has PostHog runtime adapters, the custom generic client route is retired, generic Next runtime errors are no longer written to Convex, source-map upload is configured and proofable through injected chunk IDs, replay masking defaults exist, MCP and Linear triage instructions are checked in, and docs explain the new ownership boundary.

Focused validation for this Program includes:

- `bun run --cwd apps/web test:unit -- tests/unit/env.test.ts tests/unit/observability-client-report.test.ts tests/unit/observability-posthog-client.test.ts tests/unit/observability-posthog-server.test.ts tests/unit/observability-posthog-instrumentation.test.ts tests/unit/observability-capture-server-error.test.ts tests/unit/observability-ingest.test.ts`
- `bun run --cwd apps/web test:integration:node -- tests/integration/observability-client-error-route.test.ts tests/integration/observability-clerk-route.test.ts tests/integration/observability-vercel-route.test.ts tests/integration/observability-incident-status-route.test.ts`
- `bun run --cwd apps/web test:integration:ui -- tests/integration-ui/checkout-button.test.tsx tests/integration-ui/error-boundary-screen.test.tsx`
- `bun run --cwd apps/web build`
- `bun run posthog:proof`
- `bun run programs:lint`
- `bun run markdown:lint -- --paths docs/programs docs/internal/observability.md docs/internal/linear.md apps/web/content/docs/environment-variables.mdx apps/web/content/docs/deploy-to-vercel.mdx README.md`
- `bun run format`
- `bun run lint`
- `bun run typecheck`
- `git diff --check`

The manual acceptance check after deployment is to confirm one production PostHog issue resolves to readable application frames and one controlled replay is masked before replay content is summarized by agents.

## Artifacts and Notes

Planning brief 1 is `docs/programs/completed/2026-05-02-posthog-observability-migration/planning-brief-1.md`; it produced the completed PostHog observability contract slice.

Planning brief 2 is `docs/programs/completed/2026-05-02-posthog-observability-migration/planning-brief-2.md`; it drove the implementation slice completed in this Program.

The PostHog project id is `317852`, and the region is US Cloud. The actual browser token and Personal API Keys must live only in ignored env files, Vercel, PostHog, or operator credential stores.

The first source-map upload key should be a project-scoped Personal API Key for project `317852` with only the `Source map upload` scope. It should be stored as `POSTHOG_API_KEY` in Vercel and any local production-build env that uploads source maps.

The first MCP key should not be the source-map key. Prefer OAuth via the PostHog AI plugin. If API-key auth is required, create a separate project-scoped Personal API Key for project `317852` using the `MCP Server` scope or preset.

The PostHog MCP server is `https://mcp.posthog.com/mcp`.

The official PostHog AI plugin repository is `https://github.com/PostHog/ai-plugin`.

The OpenAI Codex bug-triage use case is `https://developers.openai.com/codex/use-cases/automation-bug-triage`.

## Interfaces and Dependencies

This Program depends on root `AGENTS.md`, `apps/web/AGENTS.md`, `docs/programs/PROGRAMS.md`, `docs/exec-plans/PLANS.md`, `docs/internal/observability.md`, `docs/internal/linear.md`, PostHog official docs for Next.js, error tracking, source maps, session replay, MCP, the official PostHog AI plugin repository, OpenAI Codex bug-triage guidance, Linear triage/workflow behavior, and the current `apps/web` observability, Convex, release, and docs surfaces.
