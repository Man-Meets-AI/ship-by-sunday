# PostHog Observability Migration Dependency Graph

## Dependency Order

The Program starts with the contract slice because all later work depends on a clear ownership map. Implementation must not wire a second telemetry stack before the deletion and coexistence rules are explicit.

`PostHog Observability Contract` precedes `Next.js PostHog Instrumentation` because the SDK setup needs env names, identity rules, event taxonomy, duplicate-capture rules, and the decision about which current Convex capture paths remain during the proof window.

`PostHog Observability Contract` also precedes `Session Replay Privacy And Proof` because replay settings and masking selectors depend on the privacy and surface-classification policy.

`Next.js PostHog Instrumentation` precedes `Session Replay Privacy And Proof` because replay depends on the browser SDK and project settings being present.

`Next.js PostHog Instrumentation` precedes `PostHog MCP And Agent Operations` because agent triage is useful only after real PostHog events, errors, source maps, and at least one controlled replay exist.

`PostHog MCP And Agent Operations` precedes `Codex Linear Bug Triage Workflow` because Codex needs stable access to PostHog MCP or the PostHog AI plugin before the Sentry-style triage example can be adapted to PostHog.

`Codex Linear Bug Triage Workflow` precedes `Convex Observability Retirement` because the old runtime-intake and Telegram paths should not be deleted until the new PostHog-to-operator and PostHog-to-Linear workflows can carry the debugging and routing load.

`Convex Observability Retirement` is last because it deletes or narrows the old system. It depends on proof from every earlier slice and must preserve release/runtime-intake truth or explicitly retire it.

## Cross-Cutting Dependencies

Identity connects all slices. The app must use one stable Clerk-backed user ID across frontend `identify`, server-side PostHog capture, error tracking, and Linear evidence. Without this, backend events, replays, and error issues are orphaned.

Source maps connect error capture to useful triage. The source-map slice must be in place before the workflow expects Codex or humans to rely on PostHog stack traces.

Privacy masking connects replay to MCP. Replays must be privacy-reviewed before agents summarize or cite replay content. A triage report may link to a replay before it may summarize raw replay details.

Linear Triage connects automation to durable workflow. Codex should draft and deduplicate; Linear owns statuses, priorities, labels, assignees, projects, and cycles.

Telegram connects only to alert delivery. It should depend on the final alert source and should not drive where telemetry is stored.

## Resolved Planning Inputs

Direct `https://us.i.posthog.com` capture is acceptable for the first release. A managed reverse proxy is a later reliability optimization, not a blocker.

The first implementation should not add a blocking consent banner unless legal review requires one. Replay still requires aggressive masking, sampling or trigger controls, no network bodies, no console logs, and no-capture rules for sensitive surfaces.

Runtime-intake remains until a later retirement slice proves a PostHog or Linear replacement or explicitly retires the contract.

Telegram should eventually be fed by PostHog alerts or workflows for P0/P1-style production exceptions and spikes. A short-lived bridge is acceptable only during migration.

Use separate project-scoped PostHog Personal API Keys: `Source map upload` for Vercel source maps and `MCP Server` for API-key-based MCP. Prefer OAuth for MCP when possible. Do not use `All access`.
