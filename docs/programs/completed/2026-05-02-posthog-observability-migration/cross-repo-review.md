# PostHog Observability Migration Cross-Repo Review

## Review Scope

This review considers the Ship by Sunday repo, PostHog official docs and repositories, OpenAI Codex bug-triage guidance, and Linear workflow expectations. It is not an implementation review because no code has landed for this Program yet.

## Findings

Finding: The current Ship by Sunday observability path has source-of-truth risk if PostHog is added without retirement work.

Evidence: Client and server errors currently flow into Convex incident rollups and occurrences. PostHog will also group, store, and expose these errors. Without a contract, maintainers will not know whether Convex, PostHog, Telegram, or Linear is the authoritative state for an issue.

Required response: The first child ExecPlan must define temporary coexistence and final ownership. Generic `next_client` and `next_runtime` Convex incident collection must have deletion criteria.

Finding: Session replay needs privacy work before it can become triage evidence.

Evidence: PostHog masks inputs by default but does not mask all non-input text by default. Ship by Sunday includes auth, checkout, workspace, account, generated content, and potentially AI-related surfaces where text or network details can be sensitive.

Required response: The replay slice must add a privacy-first masking policy, no-capture markers, and a manual replay proof that confirms sensitive surfaces are excluded or masked.

Finding: MCP and plugin access must be treated as privileged operator access.

Evidence: PostHog MCP exposes read and write tools across error tracking, session recordings, insights, workflows, feature flags, experiments, persons, dashboards, and more. PostHog warns that LLMs can be tricked by prompt injection and that tool calls should be reviewed.

Required response: The MCP slice must pin the project, restrict tools where possible, prefer OAuth for users, keep API keys out of tracked files, and classify write tools as approval-only.

Finding: Codex-to-Linear triage should not start by creating issues automatically.

Evidence: OpenAI's bug-triage guidance starts with an on-demand sweep, tunes the report in one thread, and keeps the starter prompt draft-only. Linear should own durable statuses and routing.

Required response: The triage slice must define a draft report first, duplicate detection against existing Linear issues, priority thresholds, and a human approval policy before scheduled runs mutate Linear.

Finding: Runtime-intake export is the main deletion blocker for Convex observability.

Evidence: The current runtime-intake code reads Convex incidents and the release engineering-intake contract names SBS observability incidents as lifecycle source. Deleting the incident ledger without a replacement would break that contract.

Required response: The retirement slice must either migrate runtime-intake to PostHog or explicitly retire the contract with docs and validation.

## Review Conclusion

The Program is warranted and should begin with a contract slice. Installing PostHog first would be easy but would increase source drift. The safest route is to freeze the ownership model, then instrument, then prove replay and agent workflows, then delete or narrow the old Convex observability paths.
