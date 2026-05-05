# Workflow Packets

This is the internal contract for Ship by Sunday existing-codebase loop packets. Use it before adding or changing a workflow that can inspect, reason about, write, prove, or sync customer repo work.

A workflow packet is the bounded work order between a finding and execution. It is not just a prompt. It names the evidence, customer context, execution surface, authority boundary, allowed touch targets, proof requirements, blocked-proof states, sync policy, delivery path, and revocation behavior for one approved loop.

This slice adds no new external setup. There are no new provider projects, GitHub Apps, OAuth apps, secrets, environment variables, repository secrets, webhooks, callbacks, dependency installs, migrations, CI permissions, or hosted executors to create for this contract refresh.

## Packet Lifecycle

The packet lifecycle starts with diagnosis. A doctor pass or equivalent intake produces sync-safe findings: titles, categories, severity, confidence, buyer impact, proof path, required permission, recommended workflow id, evidence refs, blocked reason, sync sensitivity, and local report refs. Raw source, long logs, screenshots, secrets, and Codex transcripts stay local unless a later sharing approval exists.

The packet then captures user bottleneck context. This can be an explicit answer from the customer, a reported failure, a selected finding, an urgency note, or a support/operator summary. The context must be stored as bounded structured text and must not include secrets, full logs, raw source excerpts, local absolute paths, or unreviewed screenshots.

Deterministic probes come before Codex judgment whenever possible. Probes can read repo shape, package manager, command names, script names, safe Git metadata, test/build command availability, setup state, and prior `.sbs` artifacts. Passive probes can run during Crawl; deep probes, installed scanners, package scripts, provider CLIs, network escalation, migrations, background services, and CI-affecting commands require explicit approval.

Codex interpretation is optional and evidence-bound. It may rank findings, explain why a workflow matters, generate a local plan, or perform approved writes under the selected execution surface. It must not replace deterministic probes or become hidden permission to inspect raw source, run package installs, change providers, push branches, create pull requests, rerun CI, or share transcripts.

The customer approves the packet before Walk, Work, or Run execution. The approval must name workflow id and version, execution surface, profile or permission mode, write lease when writes are possible, branch target when a branch is possible, dirty-state policy, expected outputs, allowed touch targets, disallowed touch targets, proof commands, sync policy, stop conditions, rollback note, local proof refs, and any provider or source-sharing approvals required by the work.

Execution runs on exactly one named surface at a time. Current surfaces are defined in `docs/internal/execution-surfaces.md`: `local_runner`, `codex_cloud_handoff`, `managed_github`, `generated_repo`, and `codex_app_server`. Choosing a surface does not widen authority. Surface-specific permissions still apply.

Optional Codex write jobs must be scoped. A packet can allow no writes, `.sbs` artifacts only, docs/config writes, runtime edits, provider configuration, branch pushes, pull request creation, or CI-affecting commands only if the packet names that authority and the customer approves it. The default existing-codebase path is local runner with local proof and no branch push.

Proof is required. Every packet must define proof commands or a blocked-proof reason when proof commands cannot run. Proof output must state command names, pass/fail/blocked status, touched repo-relative refs, created artifact refs, blocked-proof reasons, rollback instructions, and the next recommended workflow.

Sync is structured by default. Hosted Ship by Sunday state may receive workflow id, version, status, proof status, delivery status, branch name, profile, proof command names and statuses, touched repo-relative refs, created artifact refs, blocked reason, next recommendation, audit events, and customer-approved refs. It must not receive raw source, source excerpts, full logs, secrets, local absolute paths, screenshots, source maps, full Codex transcripts, or provider dashboard contents without separate approval.

Revocation stops future work. Runner revocation, managed GitHub revocation, expired write lease, missing provider setup, refused source-sharing approval, branch protection, dirty worktree, unsafe branch state, rate limit, or disabled execution surface should stop the packet and produce blocked proof instead of falling back to broader authority.

## Required Packet Fields

A new workflow packet or approval model must represent these concepts, even if a specific workflow stores them under a local artifact schema that predates this contract:

- `workflowId` and `workflowVersion`
- `projectId`, `runnerId`, and `findingDocumentId` when the workflow comes from a finding
- `executionSurface` with one of the named surfaces from the execution-surface contract
- `profileName` or permission mode
- `writeLeaseId`, `writeLeaseExpiresAt`, and `writeLeaseDurationMinutes` when writes are possible
- `baseBranch`, `targetBranch`, and `dirtyStatePolicy` when Git branch state matters
- `inputs`, including approved workflow run id, finding id, customer bottleneck context, and deterministic probe refs
- `deterministicProbes`, including names, purpose, local-only or sync-safe classification, and blocked states
- `codexInterpretation`, either disabled, local-only, or approved for structured output
- `codexWritePolicy`, either disabled or narrowed to the approved touch targets
- `localArtifacts`, including workflow packet, proof, sync preview, and any workflow-specific audit refs
- `allowedTouchTargets` and `disallowedTouchTargets`
- `providerAccessPolicy`, including missing provider setup and later approval requirements
- `proofCommands`
- `syncPolicy`
- `stopConditions`
- `approvalRequired`
- `expectedOutputs`
- `rollbackNotes`
- `proofDelivery`, including local proof refs and allowed hosted metadata
- `revocationBehavior`
- `createdAt`

Existing shipped workflows may not yet serialize every key under those exact names. Future workflow changes should move toward this shape rather than expanding the older ad hoc packet forms.

## Shipped Workflow Mapping

`source-truth-agent-readiness` is a local runner Walk packet. It can create an approved local branch, write `.sbs/runs/<workflow-run-id>/**`, write `.sbs/source-truth/**`, and update root agent instructions after terminal confirmation. It disallows runtime app code, env files, dependency manifests, lockfiles, migrations, provider configuration, generated folders, and package scripts. Proof is local Git status, changed file names, diff whitespace, local proof JSON, and sync-safe proof metadata.

`observability-debuggability` is a local runner audit/proof packet. It can create an approved local branch and write `.sbs/runs/<workflow-run-id>/**` plus `.sbs/observability/**`. It inspects repo-local observability signals and records provider or dashboard gaps as blocked proof. It disallows runtime instrumentation, provider setup, dependencies, package scripts, source maps, dashboards, deployment proof, branch pushes, pull requests, CI-affecting commands, raw logs, raw source, and Codex transcripts.

`broken-app-triage` is a local runner read-only diagnostics packet. It can write `.sbs/runs/<workflow-run-id>/**` proof artifacts and run only approved read-only diagnostic commands. It disallows source patching, package installs, tests/builds unless explicitly approved as safe diagnostics, migrations, provider CLIs, branch pushes, pull requests, raw logs, raw source, and automatic repair. A repair patch requires a later packet.

## Future Change Checklist

Before adding or widening a workflow packet, update this document and the customer-facing surface that explains the boundary. The change must name:

- deterministic probes and whether each output is local-only or sync-safe
- user bottleneck context fields and redaction rules
- Codex interpretation mode and transcript policy
- Codex write policy and approved touch targets
- execution surface and surface-specific consent
- provider access and missing-provider blocked proof
- proof commands and expected proof artifacts
- stop conditions and rollback behavior
- sync policy and forbidden sync fields
- revocation behavior
- branch, pull request, CI, and merge authority

If a future change adds external setup, document what to create, where to create it, exact scopes or permissions, environment ownership, where values are stored, how to verify it, and what failure looks like when missing or misconfigured.
