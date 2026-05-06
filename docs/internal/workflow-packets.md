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

`mature-repo-adoption` is a local runner adoption audit packet. It can create an approved local branch and write `.sbs/runs/<workflow-run-id>/**` plus `.sbs/mature-repo/**`. It inspects sync-safe repo convention metadata such as package manager, package script names, dependency names, docs refs, agent instruction refs, CI refs, and release refs. It emits an adoption audit, adoption Program draft, first child ExecPlan draft, proof, and sync preview. It disallows generated-starter rewrites, root docs mutation, runtime code edits, env files, dependency manifests, lockfiles, migrations, provider configuration, CI changes, package scripts, branch pushes, pull requests, raw logs, raw source, and Codex transcripts.

`docs-spine-adoption` is a local runner docs scaffold packet. It writes only `.sbs/runs/<workflow-run-id>/**` plus `.sbs/docs-spine-adoption/**`; the approved branch name is metadata for a later apply workflow, not authority to mutate Git refs in this scaffold. It baselines pre-existing Git dirt and allows unrelated user work outside `.sbs`; dirty `.sbs` runner artifacts outside the current run or docs-spine adoption roots still block. It inspects sync-safe repo facts such as package manager, manifest names, workspace package refs, dependency names, agent instruction refs, docs refs, Program and ExecPlan refs, prompt/spec refs, generated-doc refs, validation refs, CI refs, release refs, and package script names. Scanner artifacts include provenance, repo-relative path normalization, redaction flags, cache boundaries, bounded parallel read boundaries, and performance budgets; they do not store raw source, raw logs, package script bodies, dependency versions, or local absolute paths. It emits a docs spine adoption manifest, repo facts, source-truth map, command-proof map, docs gap report, architecture signals, security signals, quality-score baseline, instruction-surface map, skill-trigger map, generated-surface map, validation-surface map, performance timings, parity checklist, bounded Codex synthesis packet, local draft artifacts, proof, and sync preview metadata. The generated Program bundle now follows the Worker Program packet primitive: Program README and nested AGENTS routing when missing, the Program contract, active/completed indexes when missing, one active Program folder with `program.md`, `track-1-*.md`, `normalized-track-1.md`, convergence artifacts, `planning-brief-1.md`, and the one-line `current-planning-brief.txt` pointer. The generated ExecPlan bundle includes the ExecPlan landing/index files, nested AGENTS routing when missing, the contract, active/completed indexes when missing, and the first Program-linked child ExecPlan. The prompt bundle includes the prompt inventory, nested prompt AGENTS routing when missing, `program-create.md`, the full Program Funnel and refresh prompt family, and ExecPlan writer/grill/execute/validate prompts. Validation/proof docs name the expected planning primitive scripts (`programs:lint`, `plans:lint`, `markdown:lint`, `docs:validate`, and `program:write-child-plan`) and require blocked proof when a target repo has not installed those scripts. Draft artifacts stay under `.sbs/docs-spine-adoption/drafts/**` and describe target refs, source artifact refs, blocked reasons, privacy boundaries, and apply readiness; they are not applied Markdown docs. The quality eval rejects generated docs that route source, test, public, static, asset, hidden-noise, stale prior docs-spine, or local absolute path refs as primary docs-spine guidance, and it fails Program/ExecPlan output that omits the required packet artifacts, prompt family, immutable planning brief frontmatter, or current-brief pointer. It reserves later artifacts for Semgrep profile and AST inventory. It disallows docs spine Markdown application, root agent instruction edits, runtime code edits, env files, dependency manifests, lockfiles, migrations, provider configuration, generated folders, package scripts, CI changes, CI-affecting commands, branch pushes, pull requests, raw logs, raw source, docs drafts sync, and Codex transcripts.

`docs-spine-apply-and-proof` is a local runner docs mutation packet. It requires `--confirm-docs-spine-apply`, creates or checks out an approved docs-spine apply branch, and supports both dated `sbs/docs-spine-apply-YYYYMMDD-HHMM` branches and the static `sbs/docs-spine-apply` branch. It baselines pre-existing Git dirt, blocks dirty approved docs targets and unsafe `.sbs` runner artifacts, and allows unrelated user work to remain untouched. It reads apply-ready draft packets under `.sbs/docs-spine-adoption/drafts/**` and only writes files whose draft includes explicit `proposedFiles` entries with `targetRef` and Markdown content. The approved write roots are `.sbs/runs/<workflow-run-id>/**`, `.sbs/docs-spine-adoption/**`, `docs/index.md`, `docs/programs/**`, `docs/exec-plans/**`, `docs/prompts/**`, `docs/QUALITY_SCORE.md`, `docs/proof.md`, and `docs/validation.md`; Markdown files are approved under those roots, and `docs/programs/<active|completed>/<YYYY-MM-DD-program-id>/current-planning-brief.txt` is the only approved non-Markdown text target. New docs files are created directly; existing docs files receive or replace a managed `sbs-docs-spine` Markdown section so owner-written content is preserved and repeated applies update only the managed section. Dirty existing target files block before writing unless they are recognized replaceable prior docs-spine output, so a customer file with the same name is not silently overwritten. Apply runs quality before writes, writes only approved targets, re-scans after writes, re-evaluates the actual Markdown or pointer text on disk, and stores the post-apply quality report. A post-apply quality regression blocks proof with the applied refs recorded so repeated approved runs can iterate without widening the touched-file set. Proof includes Git status, changed file names, diff whitespace, a structural Markdown heading check, the post-apply docs-spine quality report, pre-existing dirty-file refs for local audit, and a bounded repo-native gate candidate. It disallows root agent instruction edits, runtime code edits, env files, dependency manifests, lockfiles, migrations, provider configuration, generated folders, package scripts, CI changes, CI-affecting commands, branch pushes, pull requests, raw logs, raw source, Markdown content sync, and Codex transcripts.

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
