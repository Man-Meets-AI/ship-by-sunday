# PostHog Observability Migration Converged Decision Packet

## Decisions

Decision: Use a Program for the PostHog observability migration.

Rationale: The initiative spans Next.js analytics, client and server error tracking, source maps, session replay privacy, PostHog MCP, the PostHog AI plugin, Codex automation, Linear triage, Telegram alerts, Convex incident retirement, runtime-intake, and documentation. A single ExecPlan would either be too large or would lose initiative-level truth after the first slice.

Decision: Make `PostHog Observability Contract` the first child ExecPlan.

Rationale: The riskiest choice is not how to call `posthog.init`; it is deciding which system owns each signal. The first slice must define ownership, taxonomy, identity, privacy, MCP access, triage, and deletion criteria before implementation creates a second permanent telemetry stack.

Decision: PostHog is the primary source for analytics, errors, and session replay.

Rationale: PostHog is the selected product suite for analytics, error tracking, source-mapped stack traces, replay, and AI-agent access. The homegrown Convex generic incident ledger should not remain the durable source for `next_client` and `next_runtime` once PostHog proof exists.

Decision: Convex remains backend product state, not the generic telemetry warehouse.

Rationale: Convex is the application backend. It may keep temporary or intentionally narrow operational incident duties during migration, especially where runtime-intake or Telegram still depends on it, but it should not duplicate PostHog generic exception storage indefinitely.

Decision: Telegram stays thin.

Rationale: Telegram is useful as a notification client, but the repo should not keep a custom incident ledger solely to feed Telegram. Later slices should either drive Telegram from PostHog alerts or narrow the bridge to the smallest source-specific path that still earns its keep.

Decision: Session replay is in scope and privacy-first.

Rationale: Replay is part of the requested PostHog product surface and is valuable for bug triage, but it can expose sensitive UI. The plan must mask authenticated app content aggressively, avoid network bodies and console logs by default, and add explicit no-capture markers to auth, checkout, billing, account, secrets, and customer-content surfaces before broad usage.

Decision: PostHog MCP and the PostHog AI plugin are operator tooling.

Rationale: MCP and plugin skills should help Codex inspect PostHog data, SDK health, errors, replays, and docs. They should not be embedded into the production app, and their credentials should be treated as operator secrets outside repo-tracked env files.

Decision: Codex-to-Linear triage starts draft-only.

Rationale: OpenAI's bug-triage pattern starts with a manual sweep, tunes the report in one thread, and only later schedules it. The PostHog variant must follow the same rule: no scheduled run creates, assigns, labels, comments, closes, or mutates Linear issues until a written action policy and duplicate checks are proven.

## First Slice Acceptance

The first child ExecPlan is accepted when it produces a checked-in contract that names every observability source, owner, env variable, privacy rule, MCP/plugin access rule, Linear triage rule, Telegram ownership rule, runtime-intake dependency, deletion criterion, and validation command needed for later implementation slices.
