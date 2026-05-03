# PostHog Observability Migration Plan Split Recommendation

## Recommended Program Split

1. PostHog Observability Contract.
   Define the source-of-truth map, event taxonomy, user identity policy, env contract, source-map policy, session replay privacy policy, PostHog MCP and plugin access policy, Codex-to-Linear triage policy, Telegram ownership rule, runtime-intake dependency, and deletion criteria for Convex generic observability.

2. Next.js PostHog Instrumentation.
   Install PostHog SDK dependencies, type env vars, initialize `posthog-js` once in `apps/web/instrumentation-client.ts`, add Node-runtime server capture through `posthog-node`, configure source-map upload in `apps/web/next.config.ts`, and prove pageviews plus client and server exceptions reach PostHog without duplicate capture.

3. Session Replay Privacy And Proof.
   Enable replay with conservative settings, add masking selectors and `ph-no-capture` markers to sensitive surfaces, keep network bodies and console logs off by default, document sampling and trigger policy, verify SDK Doctor health, and prove one controlled replay can be found and linked.

4. PostHog MCP And Agent Operations.
   Document and validate the PostHog AI plugin for Codex, project-pinned MCP auth, allowed read tools, denied or approval-only write tools, operator secret handling, and how agents should use PostHog MCP and skills during bug investigation.

5. Codex Linear Bug Triage Workflow.
   Adapt OpenAI's Sentry-oriented bug-triage pattern to PostHog Error Tracking, alerts, session replays, SDK Doctor, Linear existing bugs, GitHub checks, and deploy logs. Start draft-only, define duplicate detection, priority thresholds, Linear Triage fields, and the review gate before scheduled automation can create or update issues.

6. Convex Observability Retirement.
   Replace or retire runtime-intake and Telegram dependencies, delete redundant `next_client` and `next_runtime` Convex collection, remove stale client-error routes and legacy schema, update docs, and prove no release, runtime-intake, or Telegram path depends on the deleted generic incident ledger.

## First Child ExecPlan

The first child ExecPlan should be `docs/exec-plans/active/2026-05-02-posthog-observability-contract.md`.

## Boundary Rules

Keep the first child planning and docs focused. It should not install SDKs, touch app runtime files, create Linear issues, change PostHog project settings, or delete Convex observability. It should write the contract that makes those later changes safe.

Do not create scheduled Codex automation until at least one manual PostHog-to-Linear triage sweep has been reviewed and tuned.

Do not delete Convex incident tables until runtime-intake and Telegram ownership are resolved.
