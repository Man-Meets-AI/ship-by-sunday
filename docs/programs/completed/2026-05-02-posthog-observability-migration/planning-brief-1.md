---
title: PostHog Observability Contract Planning Brief 1
program_id: posthog-observability-migration
brief_version: 1
status: superseded
summary: Define the first child slice that freezes PostHog, replay, MCP, Telegram, Linear, and Convex observability ownership before implementation.
read_when:
  - Writing or resuming the PostHog observability contract child ExecPlan.
  - Checking first-slice boundaries for the PostHog observability migration Program.
  - Auditing the original contract-slice input after planning brief 2 became current.
---

# PostHog Observability Contract Planning Brief 1

## Planning Brief

This is the first planning brief for the PostHog observability migration Program.

Ship by Sunday currently has a Convex-backed observability path that collects generic client and server exceptions, stores incident rollups and occurrences, manages Telegram delivery, and feeds runtime-intake export. The team intends to adopt PostHog for analytics, errors, session replay, MCP-backed investigation, PostHog AI plugin skills, and Codex-to-Linear bug triage. The first implementation slice must prevent duplicate telemetry ownership before SDK installation begins.

## Converged Decisions

PostHog is the primary future owner for product analytics, pageviews, product events, client and server exceptions, source-mapped stack traces, and privacy-reviewed session replay.

Convex remains the product backend. It may temporarily keep runtime-intake, provider-specific incidents, or Telegram bridge duties, but it should not keep generic `next_client` and `next_runtime` incident collection after PostHog proof exists.

Telegram remains a thin delivery surface if it still helps the operator. It should not force the repo to keep a broad custom incident ledger.

PostHog MCP and the PostHog AI plugin are operator and agent tooling, not app runtime. Their credentials are operator secrets and must not enter tracked env examples or `NEXT_PUBLIC_*`.

Codex-to-Linear triage starts draft-only. The workflow must adapt OpenAI's Sentry example by using PostHog Error Tracking issues, alerts, session replay links, SDK Doctor, Linear existing bugs, GitHub checks, and deploy/log evidence.

## Open Questions

Resolved: the first implementation should use direct US Cloud ingest at `https://us.i.posthog.com`. A managed PostHog reverse proxy is not required before the first launch. Revisit a managed reverse proxy only if browser capture is materially blocked or production proof shows reliability loss.

Resolved: the first implementation should not add a blocking consent banner as part of this engineering slice. Analytics may initialize normally with the public project token and documented privacy posture. Session replay may be enabled only with aggressive masking, sampling or trigger controls, no network bodies, no console logs, and no-capture rules for auth, checkout, billing, account, secrets, invite links, customer content, and admin-only surfaces. If legal review later requires consent gating, add it as a separate policy-driven slice.

Resolved for now: runtime-intake remains until a later retirement slice proves a PostHog or Linear replacement. The first implementation slices must not delete `apps/web/scripts/export-runtime-intake.mjs`, `apps/web/lib/observability/runtime-intake.mjs`, or the engineering-intake contract.

Resolved target: Telegram is only for the most important issues. Prefer PostHog alerts or workflows as the eventual source for P0/P1-style production exceptions and spikes. A short-lived bridge is acceptable during migration, but Telegram must not justify keeping broad Convex generic incident storage.

Resolved default: use the primary Ship by Sunday product engineering Linear team and its Triage intake. If the exact team key is ambiguous during implementation, the triage slice must resolve it through the Linear connector before creating any issue. Default labels are `bug`, `posthog`, `production`, and `observability` when applicable. P0 and P1 findings always draft Linear issues. P2 findings draft issues only when recurring, affecting paying users, or blocking checkout/access. P3 findings stay in the report unless explicitly selected.

Resolved PostHog API key policy: use separate Personal API Keys by job. For source-map upload, create a project-scoped key for project `317852` with the `Source map upload` scope only; this becomes `POSTHOG_API_KEY` in Vercel and local production-build env. For Codex or MCP, prefer OAuth through the PostHog AI plugin. If a key is required, create a separate project-scoped key for project `317852` with the `MCP Server` preset or scope only. Do not use `All access`, and do not reuse the source-map key for MCP or triage.

## Next Plan Recommendation

Exact next plan title: `PostHog Observability Contract`.

Exact scope: write a self-contained contract for PostHog source ownership, event naming, identity, env variables, source maps, session replay privacy and masking, MCP/plugin operator access, Codex-to-Linear triage, Telegram alert ownership, runtime-intake dependency, migration phases, deletion criteria, and validation commands.

Exact implementation boundaries: do not install packages, edit runtime code, change PostHog project settings, create or mutate Linear issues, schedule Codex automation, or delete Convex observability in this first child slice.

Exact validation boundaries: run `bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-02-posthog-observability-contract.md`, `bun run programs:lint`, `bun run markdown:lint -- --paths docs/programs/completed/2026-05-02-posthog-observability-migration docs/exec-plans/completed/2026-05-02-posthog-observability-contract.md`, and `git diff --check` after writing the child plan.

Why it is next: the contract creates the source-of-truth map that later SDK, replay, MCP, triage, and deletion slices need. Without it, a PostHog install would risk becoming a permanent duplicate beside Convex observability.

## Risks To Carry Forward

Do not let PostHog and Convex both remain canonical for generic exceptions.

Do not enable replay broadly before sensitive surfaces have masking and no-capture rules.

Do not put MCP credentials in app env examples or tracked repo config.

Do not let scheduled Codex runs create or mutate Linear issues before the draft workflow and duplicate checks are proven.

Do not delete runtime-intake or Telegram dependencies until the replacement path is documented and validated.
