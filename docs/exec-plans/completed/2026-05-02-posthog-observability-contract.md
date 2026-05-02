---
title: PostHog Observability Contract
status: complete
created_at: 2026-05-02
completed_at: 2026-05-02
summary: Define the durable source-of-truth contract for PostHog analytics, errors, replay, MCP, Linear triage, Telegram, and Convex observability retirement.
post_build_recap: The internal observability runbook now names PostHog, Convex, Telegram, Linear, MCP, source maps, replay privacy, and retirement validation ownership before SDK implementation begins.
program_id: posthog-observability-migration
planning_brief: docs/programs/completed/2026-05-02-posthog-observability-migration/planning-brief-1.md
read_when:
  - Resuming the first PostHog observability migration slice.
  - Checking ownership before implementing PostHog SDKs, replay, MCP, Linear triage, Telegram, or Convex observability deletion.
  - Validating that the migration has a clear contract before runtime code changes.
---

# PostHog Observability Contract

This is a living execution plan. It defines the first bounded slice of the PostHog observability migration.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday is moving to PostHog for product analytics, error tracking, source-mapped stack traces, privacy-reviewed session replay, MCP-backed investigation, PostHog AI plugin skills, and Codex-to-Linear bug triage. Today, the repo also has a custom Convex-backed observability control plane that stores generic client and server errors, manages incident lifecycle, sends Telegram alerts, and feeds runtime-intake export.

This slice does not install PostHog SDKs. It writes the contract that prevents the migration from becoming duplicate collection. After this plan is complete, a later implementer should know exactly which system owns each signal, which old paths can eventually be deleted, which privacy rules protect session replay, how agents may use PostHog MCP, and how PostHog evidence flows into Linear.

## Progress

- [x] 2026-05-02 EDT: Created the Program packet, now completed at `docs/programs/completed/2026-05-02-posthog-observability-migration/`.
- [x] 2026-05-02 EDT: Created this first child ExecPlan from `planning-brief-1.md`.
- [x] 2026-05-02 EDT: Added tracked PostHog env placeholders and deployment instructions for source-map upload, with the real source-map key kept only in ignored local env.
- [x] 2026-05-02 EDT: Drafted the observability ownership contract in `docs/internal/observability.md`.
- [x] 2026-05-02 EDT: Updated environment and README guidance to separate PostHog app/source-map env from operator MCP credentials.
- [x] 2026-05-02 EDT: Defined validation evidence for the later SDK, replay, MCP, triage, and retirement slices.
- [x] 2026-05-02 EDT: Prepared this plan for completion and moved the next implementation slice into Program planning brief 2.
- [x] 2026-05-02 EDT: Ran plan, Program, markdown, and whitespace validation.

## Surprises & Discoveries

PostHog MCP is broader than a read-only analytics helper. It exposes read and write tools across error tracking, session recordings, insights, dashboards, workflows, feature flags, experiments, persons, logs, SQL, SDK Doctor, and more. The contract must treat MCP access as privileged operator access and define allowed, denied, and approval-only tool categories before agents rely on it.

The current runtime-intake export is the main blocker to deleting Convex generic incidents. `apps/web/scripts/export-runtime-intake.mjs` and `apps/web/lib/observability/runtime-intake.mjs` read Convex incident rows, and `scripts/release/lib/engineering-intake-contract.mjs` currently names SBS observability incidents as lifecycle source.

The internal runbook was a better contract home than a new PostHog-only internal doc because it already explains Convex incidents, Telegram delivery, runtime-intake, and incident control. Keeping the migration contract above the legacy system map makes the temporary and target ownership rules visible in the same operator surface.

## Decision Log

Decision: The first slice is contract-only.
Rationale: Installing PostHog before ownership rules are documented risks permanent duplicate collection beside the Convex incident ledger.
Date: 2026-05-02

Decision: PostHog is the target owner for generic analytics, exceptions, stack traces, and replay.
Rationale: These are the PostHog products the team is adopting. Convex should remain product backend state, not a generic telemetry warehouse.
Date: 2026-05-02

Decision: Codex-to-Linear triage begins draft-only.
Rationale: OpenAI's Codex bug-triage guidance starts with a manual sweep and the starter prompt forbids creating, assigning, labeling, closing, rerunning, or editing anything.
Date: 2026-05-02

Decision: Telegram remains thin.
Rationale: Telegram is useful for receiving alerts, but it should not force the repo to keep broad custom incident storage after PostHog is primary.
Date: 2026-05-02

Decision: Use separate PostHog Personal API Keys for source maps and MCP.
Rationale: PostHog source-map upload needs a project-scoped key with only the `Source map upload` scope for project `317852`. MCP should use OAuth through the PostHog AI plugin when possible, or a separate project-scoped `MCP Server` key. `All access` is unnecessary.
Date: 2026-05-02

Decision: Use direct US Cloud ingest before considering a reverse proxy.
Rationale: The first implementation can use `https://us.i.posthog.com`. A managed reverse proxy should be revisited only if production capture reliability proves it is needed.
Date: 2026-05-02

Decision: Treat replay as privacy-safe by default, not broad capture by default.
Rationale: Replay should support debugging without exposing auth, checkout, billing, account, secrets, invite links, customer content, or admin-only surfaces. Network bodies and console logs stay off by default.
Date: 2026-05-02

## Outcomes & Retrospective

This slice completed as a docs and planning contract. `docs/internal/observability.md` now says PostHog is the target owner for product analytics, pageviews, product events, generic client exceptions, generic server exceptions, source-mapped stack traces, and privacy-reviewed session replay. It also says Convex remains temporary owner for runtime-intake, provider-specific operational incidents, incident status, and Telegram delivery until replacement or retirement proof exists.

The contract separates app runtime credentials from operator credentials. The source-map upload key is project-scoped with only `Source map upload`; MCP uses OAuth through the PostHog AI plugin when possible or a separate project-scoped `MCP Server` key. Telegram is explicitly thin, Linear remains durable workflow truth, and Codex-to-Linear triage starts draft-only.

The main follow-up risk is that runtime code still has no PostHog SDK integration. The next child slice must install and wire Next.js PostHog instrumentation without adding manual pageview double-counting or deleting Convex runtime-intake dependencies too early.

## Context and Orientation

The current observability path is distributed across the web app, Convex, docs, and release support code. Client errors are captured from `apps/web/instrumentation-client.ts`, `apps/web/app/error.tsx`, `apps/web/app/global-error.tsx`, `apps/web/app/(workspace)/error.tsx`, and `apps/web/app/_components/error-boundary-screen.tsx`, then posted through `apps/web/lib/observability/client-error-report.ts` and `apps/web/app/api/observability/client-error/route.ts`.

Server errors are captured through `apps/web/instrumentation.ts`, `apps/web/platform/observability/capture-server-error.ts`, `apps/web/platform/observability/api-error-response.ts`, and route call sites such as Stripe checkout, Clerk/Vercel observability routes, Codex routes, and proxy failures.

Convex observability lives in `apps/web/convex/schema.ts`, `apps/web/convex/observability.ts`, `apps/web/convex/observability/model.ts`, and `apps/web/convex/http.ts`. It currently stores `incidents` and `incidentOccurrences`, controls status transitions, and drives Telegram delivery.

The internal runbook is `docs/internal/observability.md`. It is the natural place to update the durable operator story, but it currently contains stale path names from an older `features/observability/*` layout. If the final contract becomes too long, create a new `docs/internal/posthog-observability.md` and link it from `docs/internal/observability.md`; otherwise update the existing runbook directly.

The completed Program packet is `docs/programs/completed/2026-05-02-posthog-observability-migration/`. This ExecPlan is linked to `planning-brief-1.md` in its frontmatter.

### In Scope

This slice defines docs and planning contracts only. It may update `docs/internal/observability.md`, `apps/web/content/docs/environment-variables.mdx`, `apps/web/content/docs/deploy-to-vercel.mdx`, this ExecPlan, and the Program packet now completed under `docs/programs/completed/2026-05-02-posthog-observability-migration/`.

The contract must define the PostHog source-of-truth map, event taxonomy, user identity policy, app env variables, operator MCP credentials, source-map requirements, session replay privacy and masking rules, PostHog MCP and plugin access rules, Codex-to-Linear triage rules, Telegram ownership, runtime-intake dependency, migration order, and deletion criteria for Convex generic observability.

### Out Of Scope

Do not install `posthog-js`, `posthog-node`, or `@posthog/nextjs-config` in this slice.

Do not edit `apps/web/instrumentation-client.ts`, `apps/web/instrumentation.ts`, `apps/web/next.config.ts`, Convex runtime code, route handlers, or tests in this slice unless a documentation import or lint issue makes it unavoidable.

Do not create PostHog project settings, Linear issues, Linear workflow changes, scheduled Codex automations, Telegram bot changes, or production secrets in this slice.

Do not delete Convex observability paths in this slice.

## Plan of Work

First, update `docs/internal/observability.md` so it names PostHog as the future primary owner for analytics, generic client exceptions, generic server exceptions, source-mapped stacks, and privacy-reviewed session replay. The same doc should name Convex's remaining temporary duties and the conditions for retiring generic `next_client` and `next_runtime` incident storage.

Next, add an env and credential section that separates app runtime env from operator access. App runtime env should include public PostHog project token and host names, source-map upload env, and any future server capture env. The source-map upload key should be a project-scoped PostHog Personal API Key for project `317852` with only `Source map upload`, stored as `POSTHOG_API_KEY` in Vercel and any local production-build env that uploads source maps. Operator MCP access should prefer OAuth through the PostHog AI plugin; if a key is required, it should be a separate project-scoped key for project `317852` with the `MCP Server` preset or scope. Do not use `All access`, do not reuse the source-map key for MCP, and do not store actual PostHog MCP secrets in tracked docs.

Then add a session replay privacy policy. It should require sensitive surfaces to be masked or marked no-capture before replay is broadly trusted. It should keep network bodies and console log recording off by default. The first implementation should not add a blocking consent banner unless legal review requires one; instead, it should document the privacy posture and use aggressive replay masking, sampling or trigger controls, and no-capture rules.

Then add the agent operations and triage contract. It should document the PostHog AI plugin, PostHog MCP endpoint, read-oriented agent uses, approval-only write tools, and the draft-first Codex-to-Linear bug triage flow adapted from OpenAI's Sentry-oriented example. The default Linear policy is to use the primary Ship by Sunday product engineering team's Triage intake, resolve the exact team key through the Linear connector before issue creation, label drafted issues with `bug`, `posthog`, `production`, and `observability` when applicable, always draft P0/P1 findings, draft P2 only when recurring or customer-blocking, and leave P3 in the report unless selected.

Finally, update the Program packet progress and slice ledger to mark this child ExecPlan active, then run validation.

## Milestones

Milestone 1 establishes the source-of-truth map. At the end, `docs/internal/observability.md` or a linked internal doc explains which system owns analytics, errors, replay, Telegram alerts, runtime-intake, and Linear triage during and after the migration.

Milestone 2 establishes the privacy and operator access contract. At the end, the docs explain replay masking, no-capture surfaces, MCP credentials, project pinning, tool filtering, and approval-only operations.

Milestone 3 establishes the triage, Telegram, and retirement contract. At the end, the docs explain how Codex reads PostHog and drafts Linear work, when automation can mutate Linear, how Telegram receives only high-signal P0/P1-style production issues through PostHog alerts or workflows, and when Convex generic incident paths can be deleted.

## Concrete Steps

From the repo root, read the current internal observability runbook:

    sed -n '1,260p' docs/internal/observability.md

Update `docs/internal/observability.md` or create a linked `docs/internal/posthog-observability.md` with these sections in prose:

    Current ownership
    Target ownership
    PostHog app env
    PostHog MCP and operator access
    Session replay privacy
    Codex-to-Linear bug triage
    Telegram alert delivery
    Runtime-intake and Convex retirement
    Validation gates for later slices

Update `apps/web/content/docs/environment-variables.mdx` only for durable app env names that belong to implementation, not for operator-only MCP secrets.

Update `apps/web/content/docs/deploy-to-vercel.mdx` only if source-map upload or Vercel env requirements need deployment documentation before the implementation slice.

Update `docs/programs/completed/2026-05-02-posthog-observability-migration/program.md` so `Slice Ledger` names this ExecPlan as complete and `Progress` records the completed contract work.

Run validation:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-02-posthog-observability-contract.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/internal/observability.md docs/programs/completed/2026-05-02-posthog-observability-migration docs/exec-plans/completed/2026-05-02-posthog-observability-contract.md
    git diff --check

If implementation docs under `apps/web/content/docs/` are changed, include those paths in the markdown lint command.

## Validation and Acceptance

Acceptance requires a human maintainer to be able to read the updated docs and answer these questions without chat history: what PostHog owns, what Convex still owns, how session replay is protected, how Codex may use PostHog MCP and plugin skills, how PostHog issues become draft Linear work, how Telegram receives alerts, what happens to runtime-intake, and when the old generic Convex incident paths can be removed.

The plan is not complete until the contract explicitly says that PostHog and Convex must not remain permanent duplicate canonical stores for generic client and server exceptions.

The plan is not complete until the contract explicitly says that the source-map upload key uses only `Source map upload`, MCP uses OAuth or a separate `MCP Server` key, and no `All access` PostHog key is required for the planned migration.

### Test Commands

Run these from the repository root:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-02-posthog-observability-contract.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/internal/observability.md docs/programs/completed/2026-05-02-posthog-observability-migration docs/exec-plans/completed/2026-05-02-posthog-observability-contract.md
    git diff --check

If this slice changes app content docs, also run markdown lint on those exact paths.

## Idempotence and Recovery

This slice is documentation-only and can be rerun safely. If the internal runbook becomes too broad, move the PostHog-specific contract into a new `docs/internal/posthog-observability.md` and leave `docs/internal/observability.md` as the map and legacy-runbook bridge.

If validation fails because the Program packet is inconsistent, fix `program.md`, `planning-brief-1.md`, `current-planning-brief.txt`, or packet artifact names before changing implementation docs.

If the child plan scope starts drifting into SDK installation, stop and move that work to the next planned ExecPlan, `Next.js PostHog Instrumentation`.

## Artifacts and Notes

The Program research pass is `docs/programs/completed/2026-05-02-posthog-observability-migration/research-pass-posthog-observability-migration.md`.

The current planning brief is `docs/programs/completed/2026-05-02-posthog-observability-migration/planning-brief-1.md`.

The relevant official docs are:

    https://posthog.com/docs/libraries/next-js
    https://posthog.com/docs/error-tracking/installation/nextjs
    https://posthog.com/docs/error-tracking/upload-source-maps/nextjs
    https://posthog.com/docs/session-replay/privacy
    https://posthog.com/docs/model-context-protocol
    https://github.com/PostHog/ai-plugin
    https://developers.openai.com/codex/use-cases/automation-bug-triage

## Interfaces and Dependencies

This plan depends on root `AGENTS.md`, `apps/web/AGENTS.md`, `docs/exec-plans/PLANS.md`, `docs/programs/PROGRAMS.md`, `docs/internal/observability.md`, `apps/web/content/docs/environment-variables.mdx`, `apps/web/content/docs/deploy-to-vercel.mdx`, the current `apps/web` observability code, PostHog official docs, OpenAI Codex bug-triage docs, and Linear's triage/workflow model.
