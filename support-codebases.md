---
title: Support Codebases
summary: Scratch notes for turning Ship by Sunday into a codebase-supporting agent doctor with local Codex execution, structured findings, and repeatable loops.
docType: note
status: scratch
---

# Support Codebases

Scratch note from the 2026-05-04 planning discussion about supporting customers with existing codebases while preserving the generated-codebase lane.

## Core Direction

Ship by Sunday should become the agent doctor and loop operating layer for web apps.

The product should not lead with a course, a prompt library, or generic setup. The first screen can look like setup, but setup is the tax before value. The buyer-facing value is diagnosis, prioritization, consented execution, proof, and the next recommendation.

The two visible entry points should be:

- `I have an idea`: turn product facts into a worker-ready generated repo with setup docs, Codex-ready loops, bootstrap scripts, and the first doctor/recommendation pass.
- `I have a codebase`: attach a consented execution surface, run a doctor pass on the existing repo, return the top findings, and let the customer approve the first loop.

Both lanes should converge on the same artifact trail:

- source-truth snapshot
- findings ledger
- selected loop
- work plan or ExecPlan
- proof or blocked proof
- next-loop recommendation

## Technical Reality

The current app has a Codex app-server bridge, but it is not yet a full repo orchestration engine.

Current app-server bridge can:

- start ChatGPT/Codex login
- read account state
- read rate limits
- start a Codex thread
- send a prompt
- capture agent text
- record account and run metadata in Convex

Current app-server bridge does not yet:

- scan arbitrary customer repos
- select a customer local project folder from the hosted web app
- connect GitHub/Codex cloud environments
- create PRs
- run repeatable doctor loops against an external repo
- preserve a full proof artifact model for repo work

OpenAI docs currently support several Codex surfaces:

- Codex app
- Codex IDE extension
- Codex CLI
- Codex cloud with GitHub environments
- `codex exec` as stable non-interactive execution
- `codex app-server` as experimental local development/debugging infrastructure

The strongest architecture should not bet everything on `codex app-server`. Ship by Sunday should model execution as a first-class product concept and support multiple execution surfaces. It should also model loops as workflow packets, not as Codex prompts. A workflow can include deterministic probes, user context, Codex interpretation, Codex write work, proof commands, stop conditions, and sync policy.

## Codex Source Research Notes

Local Codex source under `/Users/bazelrex/Developer/codex` changes the near-term implementation plan in useful ways.

`codex exec --json` is the right first local automation boundary:

- it emits newline-delimited typed events to stdout
- it sends diagnostics to stderr
- it already uses an in-process app-server client internally
- it supports `--cd`, `--profile`, `--sandbox`, `--output-schema`, and stdin prompts
- it exposes `thread.started.thread_id`, so SBS can persist exact resume handles
- it returns schema-constrained final assistant text that SBS still needs to parse and validate

Direct `codex app-server` integration is a later daemon capability, not the Crawl blocker:

- transports include stdio, websocket, Unix socket, and off
- browser-style `Origin` headers are rejected by Codex websocket
- auth on websocket is explicit and must not be skipped
- each connection needs initialization
- approvals and elicitation can be bidirectional server requests, not only event notifications
- events are thread-scoped, so reconnect and resume need explicit handling

Codex config setup has to respect the real config model:

- user config lives at `~/.codex/config.toml`
- project `.codex/config.toml` cannot set key user-level profile/provider fields
- `[profiles.<name>]` handles model, reasoning, tools, sandbox, and approval defaults
- `[permissions.<name>]` handles filesystem and network posture
- custom permission profiles require explicit default or runtime selection
- project trust is based on canonical paths and explicit `untrusted` must be preserved
- read-only Crawl should not require trust mutation
- write-capable Walk workflows can request trust or explicit runtime permissions after approval

Auth storage should be inspected only as state, not as data:

- `cli_auth_credentials_store` can be `file`, `keyring`, `auto`, or `ephemeral`
- keyring-backed auth can remove fallback `auth.json`
- SBS can warn when file-based auth storage is detected
- SBS must not read, print, sync, or back up credential contents
- a `codex-config` backup is a config hygiene artifact, not a portable auth backup

The local runner should copy Codex's packaging discipline:

- validate the customer-visible packed command, not only source modules
- run a fake pairing API in tests and assert request shape
- use temp repo, temp runner home, and temp Codex home fixtures
- prove idempotence and failure modes such as invalid token, expired token, wrong repo root, network failure, already paired state, and no secret leakage
- commit generated contract schemas or fixtures for web/backend/runner boundaries when the pairing and event contracts become shared

## Execution Surfaces

Use one explicit execution-surface model instead of treating Codex app-server as the whole product.

Recommended surfaces:

- `local_runner`: customer runs a lightweight Ship by Sunday runner inside their repo. It invokes deterministic probes, local Codex, usually through `codex exec`, and syncs only approved structured findings back to Ship by Sunday.
- `codex_cloud_handoff`: Ship by Sunday generates the workflow packet, prompt, loop contract, and proof contract; the customer runs it in Codex cloud or through GitHub-connected Codex.
- `managed_github`: customer grants Ship by Sunday repo access. This is the most hands-off and most capable hosted path, but it has the largest trust and privacy surface, so it should be premium or concierge rather than the default.
- `generated_repo`: Ship by Sunday generates the repo and operating pack, then runs or guides the same doctor and loop system against that controlled repo.
- `codex_app_server`: useful for paid-user in-app generation and possibly future local-control integrations, but not the primary foundation until the protocol and product runtime are stable enough.

Managed GitHub requires an explicit contract before use:

- GitHub app or token scope
- repository selection
- branch naming
- PR authority
- CI visibility
- stored artifact policy
- audit log
- raw-source visibility rules
- operator access boundaries
- revocation path

It should not be required for the first local doctor pass.

## Workflow Packets And Deterministic Probes

Loops should be typed workflows, not "send this prompt to Codex."

A workflow packet can include:

- deterministic probes
- buyer bottleneck answers
- local-only probe artifacts
- Codex interpretation
- Codex write job
- proof commands
- permission profile
- write lease
- stop conditions
- sync policy

Codex should reason over evidence and write approved patches where useful. It should not be the only scanner.

`.sbs/codebase-intake.py` is the first good deterministic probe shape:

- default mode is passive and read-only
- skips `.env*`, lockfiles, dependency folders, generated folders, scanner files, `.codex`, `.cursor`, and `.claude`
- reads Git churn when available
- detects stack, commands, test surface, repo shape, hotspots, passive risks, and stack-specific findings
- writes an interpretive Markdown report
- has `--deep` for installed scanners and project commands

Product requirement: full Markdown reports stay local by default. The product needs a JSON companion or extraction layer with stable finding ids, severity, confidence, line references, recommended loops, and sync-safe summaries.

Deep mode requires separate approval because it runs local tools and project commands.

## Top 9 Finding Schema

The sync-safe Top 9 findings schema should drive the UI and workflow approval without requiring raw source.

Each finding should include:

- `id`
- `title`
- `category`
- `severity`
- `confidence`
- `buyerImpact`
- `blastRadius`
- `proofPath`
- `permissionRequired`
- `recommendedWorkflowId`
- `whyThisNow`
- `evidenceRefs`
- `blockedReason`
- `syncSensitivity`
- `localReportRef`

`evidenceRefs` should default to file paths, line numbers, command names, and artifact ids only. Raw source excerpts, full logs, screenshots with sensitive data, and Codex transcript excerpts require explicit sharing approval.

## Privacy Model

For the existing-codebase local mode, the truthful privacy claim is:

> Local mode runs Codex on your machine against your repo. Ship by Sunday stores only the structured report you choose to sync: findings, rankings, proof status, command summaries, and file references. Raw repo files and Codex session history stay local unless you explicitly share them.

Default synced report should include:

- finding title
- score
- affected area
- file path and optional line reference
- proof command
- command status
- recommended loop
- permission needed
- blocked reason, when blocked

Default synced report should not include:

- raw source files
- long code snippets
- full terminal logs
- Codex transcript
- secrets or environment values

The product can still say "we do not read your codebase" for local mode, but only with the attached explanation that Codex runs locally and Ship by Sunday receives approved structured findings, not raw repo contents.

## Existing-Codebase User Journey

Ideal existing-codebase journey:

1. Customer chooses `I have a codebase`.
2. Checkout stores `buyerStartingPoint=existing_codebase`.
3. Checkout success routes them to `/workspace/setup`.
4. Setup asks for the execution surface:
   - local Codex runner
   - Codex cloud handoff
   - managed GitHub
   - concierge/manual for early beta
5. Customer chooses local runner for privacy.
6. Web app shows a short pairing command:

   ```bash
   bunx ship-by-sunday setup pair <token>
   ```

7. Runner starts or connects to a local daemon and verifies Machine Setup:
   - Codex installed and authenticated
   - ChatGPT/Codex account available
   - `gh` installed and authenticated
   - `~/.codex/config.toml` readable
   - SBS execution profiles installed
   - config diff backed up and approved
   - optional sanitized `codex-config` backup
8. Runner verifies Project Setup:
   - repo root
   - Git remote
   - clean or intentionally dirty git status
   - package manager
   - script map
   - safe read-only mode available
9. While setup and bottleneck questions are in progress, runner executes safe deterministic probes locally.
10. Runner executes read-only doctor workflows locally:

   ```bash
   codex exec \
     --cd /path/to/repo \
     --sandbox read-only \
     --output-schema top-nine.schema.json \
     "<repo-doctor-top-nine prompt>"
   ```

11. Runner syncs approved structured findings.
12. Web app renders the Top 9 findings ledger.
13. Customer approves the first recommended workflow.
14. Runner creates a branch, obtains a write lease, runs the write workflow under the selected SBS profile, runs proof commands, and either leaves a local diff or opens a PR depending on the selected execution surface.

Generated-repo buyers continue to `/codebase`. Missing or legacy intent routes to a small choice screen. The protected existing-codebase workspace should start with:

- `/workspace/setup`
- `/workspace/doctor-pass`
- `/workspace/findings`
- `/workspace/findings/[findingId]`
- `/workspace/loops`
- `/workspace/runs`
- `/workspace/privacy`

## Privacy UI

The first `/workspace/privacy` version should be a control and status surface for local execution and sync boundaries, not a legal-copy page.

Show:

- connected runner identity
- selected project and repo binding
- local execution mode
- what stays local
- what can sync
- last sync preview
- raw source sharing disabled by default
- raw terminal log sharing disabled by default
- Codex transcript sharing disabled by default
- per-project sync settings
- revoke runner
- delete synced findings or report
- managed GitHub and off-machine execution disabled unless explicitly enabled later

Primary actions:

- `Review sync policy`
- `Revoke runner`
- `Delete synced report`
- `Export local instructions`

The screen should make it obvious that Ship by Sunday is coordinating local Codex work and approved structured findings, not browsing the customer's source. Do not include a raw source viewer in the first version.

## Existing-Codebase Backend Model

Do not overload the generated-repo `/codebase` tables for existing-codebase support. Current generated-codebase state such as `projectDefinitions` and `codebaseWorkflowStates` should remain focused on product facts, generated repo readiness, and review handoff.

Create a separate existing-codebase workspace model:

- `workspaceProjects`
- `workspaceRunnerBindings`
- `workspaceRepositoryBindings`
- `doctorPassRuns`
- `codebaseFindings`
- `workflowRuns`

First-version synced state should include only sync-safe fields:

- project identity
- fulfillment track
- runner status
- runner mode
- repository remote or display label
- setup health
- doctor-pass status
- findings metadata
- sync preview state
- workflow/proof status
- revocation and deletion timestamps

Do not store raw source, raw logs, local absolute paths, secrets, or Codex transcripts by default. Store evidence refs as paths or repo-relative refs only after sync preview approval, and keep full local reports in `.sbs/`.

## Runner Event Protocol

The first runner-to-web protocol should be a small typed event stream from the local runner to the hosted backend. The browser should subscribe to hosted backend state and events; it should not talk directly to the local daemon or read local files.

Every event should be append-only and sync-safe:

- `eventId`
- `projectId`
- `runnerId`
- `runId`
- `eventType`
- `createdAt`
- `schemaVersion`
- narrow payload

First event types:

- `runner.paired`
- `runner.heartbeat`
- `setup.check.started`
- `setup.check.completed`
- `doctor.stage.started`
- `doctor.probe.completed`
- `doctor.sync_preview.ready`
- `doctor.findings.approved`
- `workflow.approval.requested`
- `workflow.started`
- `workflow.proof.completed`
- `workflow.blocked`
- `runner.revoked`

Events must not contain raw source, raw logs, local absolute paths, secrets, or Codex transcripts. UI state should be derived from durable rows plus this event stream, so reconnects, refreshes, and audit history work without trusting browser-local daemon state.

## No-Codebase User Journey

Ideal new-codebase journey:

1. Customer chooses `I have an idea`.
2. Checkout stores `buyerStartingPoint=no_codebase`.
3. Checkout success routes them to `/codebase`.
4. Customer completes the product facts.
5. Ship by Sunday generates the repo.
6. Generated repo includes:
   - `AGENTS.md`
   - loop catalog
   - starter skills
   - setup docs
   - bootstrap script
   - proof commands
   - first doctor-pass prompt
7. Bootstrap installs the app and recommended Codex skills.
8. The same doctor/loop system starts against the generated repo.
9. Customer sees that they answered product questions, got a repo, and immediately had workers recommending the next high-leverage move.

## First-Screen Product Interface

The first paid codebase screen should resemble a setup console but be framed around the doctor pass.

Suggested sections:

- Setup
  - ChatGPT/Codex connection
  - execution surface
  - local runner pairing
- Machine Setup
  - Codex auth
  - `gh` auth
  - SBS profiles
  - config backup
  - daemon health
- Project
  - selected repo/project
  - Git remote
  - branch status
  - package manager
  - last synced report
- Health
  - runner online/offline
  - machine setup
  - project setup
  - queue
  - proof
  - sync
  - permissions
- Audit
  - `command-proof-map`
  - `codebase-intake`
  - `source-truth-agent-readiness`
  - `repo-doctor-top-nine`
  - optional `ux-conversion-snapshot`
  - optional `revenue-path-audit`
- Findings
  - Top 9 findings ledger
  - confidence
  - blast radius
  - proof path
  - required permission
  - recommended first loop
  - finding detail decision screen
- Doctor Pass
  - live stage progress
  - probe rows
  - bottleneck questions
  - sync preview approval
- Approval
  - approve read-only report sync
  - approve write loop
  - approve PR creation

The customer should feel that they are pointing the product at their repo and immediately receiving leverage, not configuring software for its own sake.

## Setup UI

The first `/workspace/setup` version should split readiness into:

- `Machine Setup`
- `Project Setup`

Each check should use:

- `blocked`
- `warning`
- `ready`

Show:

- Codex/ChatGPT connection
- local runner pairing command
- daemon status
- privacy and sync defaults
- default open destination
- primary CTA: `Run doctor pass`

Machine Setup checks:

- Codex auth
- `gh` auth
- SBS profiles
- config diff and backup
- optional `codex-config`
- daemon health

Project Setup checks:

- repo root
- Git remote
- dirty state
- package manager
- command map
- safe read-only mode

`Run doctor pass` is disabled only on blockers. Warnings stay visible but allow Crawl.

Do not show findings, loop setup, or worker queue on this screen.

## Local Runner Pairing UI

Before the daemon is connected, show:

- one copyable primary command
- pairing status
- token expiry
- expected repo root
- fallback commands

Primary command:

```bash
bunx ship-by-sunday setup pair <token>
```

Fallback command:

```bash
npx ship-by-sunday setup pair <token>
```

After the command starts, show states:

- `waiting`
- `runner detected`
- `verifying machine`
- `verifying project`
- `paired`

Actions:

- `Regenerate token`
- `Use one-shot mode`
- `Cancel pairing`

Do not show daemon internals unless expanded.

## One-Shot Mode

One-shot mode is a bounded fallback when the daemon cannot stay running.

It should run a single command session that:

1. pairs
2. checks Machine Setup
3. checks Project Setup
4. runs the doctor pass
5. writes local reports
6. opens the local sync preview
7. exits

It should not support:

- queue jobs
- always-on workers
- background approvals
- write leases beyond the current command

The web UI should mark runner health as:

- `one-shot complete`
- `one-shot disconnected`

Explain that recurring workers require the daemon.

## Runs UI

In Crawl, `/workspace/runs` should show doctor-pass run history only:

- run id
- started time
- runner mode
- probes
- sync status
- findings count
- blocked reason
- local report ref

In Walk, it should also show approved workflow runs:

- workflow id
- branch
- profile
- lease status
- proof status
- delivery status
- next recommendation
- `Open local proof`

No queue controls yet.

The empty state should say runs appear after the doctor pass. Do not market always-on workers prematurely.

## Loops UI

Before recurring workers exist, `/workspace/loops` should show a workflow catalog filtered by what the doctor pass found, not a runnable always-on loop center.

Each workflow row should show:

- name
- category
- when useful
- required permission
- typical proof
- risk level
- status: available now, recommended, blocked, or future

Rows should link back to relevant findings.

Primary action only appears when a workflow is tied to a finding:

- `Review finding`

Do not show `Run loop` unless the workflow has an approved finding and workflow packet.

## Setup Blocker Resolution

Each blocked row should show:

- exact cause
- why it blocks the doctor pass
- local command or action needed
- `Retry check`

For local mutations, show:

- `Fix in terminal`
- `Preview diff`

Warnings should show:

- `Review`
- `Dismiss for this run`
- `Fix later`

Config and profile changes should always show the diff and require terminal confirmation.

Do not use a generic `setup failed` state.

## Doctor Pass UI

The first `/workspace/doctor-pass` version should show live stage progress, not raw logs.

Stages:

- runner connected
- Machine Setup checked
- Project Setup checked
- passive probes running
- Codex interpretation running
- sync preview ready
- findings ready

Each probe row should show:

- status
- duration
- local-only or sync-safe classification

While probes run, show a small bottleneck question panel that can improve ranking.

Do not stream raw terminal logs by default.

Safe actions:

- `View local report`, routed through the local runner
- `Approve sync preview`, before findings are sent to the web app

## Finding Detail UI

The first `/workspace/findings` version should use dense ranked rows, not cards.

Each row should show:

- rank
- title
- category
- severity
- confidence
- buyer impact
- proofability
- required permission
- recommended workflow
- status: `ready`, `blocked`, `needs approval`, `running`, or `done`

The top row should be marked:

- `Recommended first`

Useful controls:

- category filter
- status filter
- `Run doctor pass again`

Do not put abstract loop setup on this screen.

The first `/workspace/findings/[findingId]` version should be a decision screen, not a report page.

Show:

- finding title
- category
- severity
- confidence
- buyer impact
- why now
- evidence refs
- proof path
- required permission
- recommended workflow
- expected outputs
- allowed touch targets
- disallowed touch targets
- sync policy
- blocked conditions

Primary action:

- `Approve workflow`

Secondary actions:

- `Back to findings`
- `Copy local evidence ref`
- `Not now`

No raw source by default.

## Local Runner Contract

Use `bunx` first and `npx` as fallback:

```bash
bunx ship-by-sunday setup pair <token>
bunx ship-by-sunday daemon start
bunx ship-by-sunday project doctor
```

The first SBS Codex profile set should be:

- `sbs-doctor-readonly`
- `sbs-proof`
- `sbs-loop-branch`
- `sbs-pr-delivery`
- `sbs-network-needed`

Profile setup edits only a marked SBS-managed block in `~/.codex/config.toml` after diff preview, backup, and approval. The optional private `codex-config` backup is a sanitized SBS-managed snapshot repository, not a Git repo over all `~/.codex`; its local working copy should live at `~/.codex/.sbs/codex-config`.

Runner health should not be one online dot. Model it as:

- `Runner`
- `MachineHealth`
- `ProjectBinding`
- `ProjectHealth`

The UI can summarize those into runner, machine setup, project setup, queue, proof, sync, and permissions.

## Setup Readiness

Hard blockers:

- Codex unavailable
- ChatGPT/Codex auth missing
- `gh` missing or unauthenticated
- no Git repo
- SBS profiles not installed
- Codex config unreadable
- config patch refused

Warnings that can continue with degraded readiness:

- file-based `auth.json`
- skipped private `codex-config` sync
- imperfect sandbox defaults outside SBS profiles
- missing optional MCP servers
- no keychain/keyring preference
- noisy history or log settings
- dirty worktree during Crawl

Setup remediation can run before codebase loops when it directly affects execution quality.

## Approval Boundaries

Crawl is branchless. The doctor pass can run passive probes and safe read-only proof discovery, but it does not create branches, write files, install packages, start long-running services, run migrations, use provider CLIs, or push anything.

High-risk actions need explicit approval, and the riskiest local actions should require terminal confirmation:

- editing Codex config outside the SBS block
- changing credential storage
- creating or pushing `codex-config`
- network escalation
- installs or upgrades
- migrations or database commands
- provider CLI actions
- background workers
- branch pushes or PR creation
- raw log or source sharing
- destructive Git operations
- danger-level sandbox changes

Auto-approval is only acceptable inside narrow SBS profiles and workflow contracts. It should never become blanket network, install, migration, provider, destructive Git, or danger-full-access approval.

Dirty Git is a Crawl warning. Walk write work requires a clean worktree or an explicit checkpoint/branch decision.

## First Loop Catalog

The fastest credible AHA is a read-only doctor pass fed by deterministic probes:

- `codebase-intake`: safely detect repo shape, stack, commands, churn, hotspots, passive risks, and first inspection targets.
- `repo-doctor-top-nine`: rank the top nine findings with value, confidence, blast radius, proof path, required permission, and recommended workflow.
- `command-proof-map`: discover install, dev, lint, typecheck, test, build, release, and browser proof commands.
- `source-truth-agent-readiness`: audit `AGENTS.md`, docs, planning files, skills, and source-truth boundaries.
- `broken-app-triage`: reproduce an error, localize it, propose the smallest patch, and prove or block honestly.
- `revenue-path-audit`: inspect auth, checkout, billing, entitlement, webhook, and environment contracts.
- `ux-conversion-snapshot`: use screenshots or browser proof to rank activation, conversion, and design risks.
- `release-readiness-audit`: inspect release commands, CI, deploy docs, and proof workflow.
- `observability-debuggability-audit`: answer whether production failures are debuggable.
- `test-hardening-target-picker`: choose the smallest high-value test to add.
- `ai-readiness-eval-audit`: inspect AI feature boundaries, prompts, evals, and cost/rate-limit risks.

Run immediately after setup:

1. `codebase-intake`
2. `command-proof-map`
3. Codex setup audit
4. `repo-doctor-top-nine`
5. `source-truth-agent-readiness`
6. `ux-conversion-snapshot`, when the app can boot or screenshots exist
7. `revenue-path-audit`, when auth, checkout, billing, or entitlement exists
8. `broken-app-triage`, when the customer arrived with a failure

Default Crawl probes:

- `codebase-intake`
- `command-proof-map`
- `codex-setup-audit`
- `repo-doctor-top-nine`
- `source-truth-agent-readiness`

Conditional Crawl probes:

- `broken-app-triage`, when the customer reports a failure or provides an error
- `revenue-path-audit`, when auth, billing, entitlement, checkout, or webhook surfaces are detected
- `ux-conversion-snapshot`, when the app can boot or screenshots exist

Later loop packs:

- observability implementation
- test hardening
- dependency upgrades
- migrations
- package installs
- provider setup
- background workers
- browser automation
- PR delivery
- always-on monitoring

Later loop packs require approval because they mutate state, run heavier commands, or increase privacy and permission surface.

The Top 9 findings ledger should recommend one default first workflow while allowing override. Pick the default by leverage, safety, proofability, low blast radius, visible value, and fit with the buyer's stated bottleneck.

## First Write Workflow

The first proof-backed write workflow after the Top 9 findings ledger should be `source-truth-agent-readiness`.

Why:

- low blast radius
- improves every later Codex loop
- usually touches docs, command maps, agent instructions, and workflow packets instead of runtime code
- produces straightforward proof through repo instructions, command map, workflow packet, validated proof commands, and a clearer runner contract

The likely second write workflow is `observability-debuggability`, especially for fragile apps. It should come after source truth and command proof because it can require provider keys, runtime changes, dependency installs, deploy proof, and production-policy decisions.

`broken-app-triage` is the conditional first write workflow when the customer arrives with a concrete failure. It should still start with read-only reproduction before patching.

## `source-truth-agent-readiness` Workflow Packet

Required fields:

- `workflowId`
- `workflowVersion`
- `projectId`
- `runnerId`
- `profileName`
- `writeLeaseId`
- `repoRoot`
- `baseBranch`
- `targetBranch`
- `dirtyStatePolicy`
- `inputs`
- `localArtifacts`
- `allowedTouchTargets`
- `disallowedTouchTargets`
- `commandsToInspect`
- `proofCommands`
- `syncPolicy`
- `stopConditions`
- `approvalRequired`
- `expectedOutputs`
- `rollbackNotes`

Allowed touch targets for this first write workflow:

- approved root agent instructions
- `.sbs/**`
- command maps
- proof maps
- workflow packet artifacts
- relevant README or setup docs

Disallowed touch targets unless a later workflow explicitly approves them:

- runtime app code
- env files
- lockfiles
- dependency manifests
- migrations
- provider configs
- generated folders
- package scripts

## First Write Approval UX

Before `source-truth-agent-readiness` creates a branch or writes files, show a compact approval sheet with:

- exact branch name
- SBS profile
- write lease duration
- allowed touch targets
- disallowed touch targets
- expected files and artifacts
- proof commands
- sync policy
- stop conditions
- rollback note

Primary action:

- `Create branch and run workflow`

The terminal should mirror the same approval. Require local confirmation if root agent instructions or Codex config are touched. The customer is approving a concrete work boundary, not a vague "let the AI proceed."

Branch and lease defaults:

- branch name: `sbs/source-truth-readiness-<YYYYMMDD-HHMM>`
- timestamp timezone: customer's local timezone when available, UTC fallback
- default write lease: 30 minutes
- renewal: once from the approval sheet when the runner is still active
- expiry behavior: stop before new writes and leave local proof or blocked proof explaining what happened

## First Write Proof Output

Local proof for `source-truth-agent-readiness` should include:

- `diffSummary`
- `touchedFiles`
- `createdArtifacts`
- `proofCommandsRun`
- `proofCommandResults`
- `blockedProof`
- `rollbackInstructions`
- `nextRecommendedWorkflow`

Synced output should be narrower:

- workflow id and version
- branch
- profile
- touched file paths
- artifact names
- proof command names and status
- blocked reason
- next recommendation

Do not sync full generated docs, source excerpts, command logs, or Codex transcript by default.

## First Write Delivery

After `source-truth-agent-readiness` completes, default delivery should be:

- local branch
- local diff
- local proof

PR creation should be a second explicit approval action:

- `Open PR`

If `gh` is ready and the customer approved PR delivery during setup, the first workflow approval sheet can preselect `open PR after proof passes`, but the choice must stay visible. The first workflow should not silently push. Early trust is better served by local diff first, with PR delivery as an approved handoff.

## Next Recommendation Priority

After `source-truth-agent-readiness`, recommend the next workflow by highest proof-backed customer pain:

1. Concrete breakage the customer reported.
2. `observability-debuggability`, when the app is fragile or production failures are hard to inspect.
3. Proof harness, when commands, tests, or builds are missing or unreliable.
4. Revenue path, when billing, auth, or entitlements exist and look risky.
5. UX or conversion, when the app boots and has obvious activation or landing issues.
6. Test hardening, when there is a narrow high-value behavior to cover.

This keeps the second workflow adaptive while making observability the default for fragile-codebase customers.

## Implementation Sequence

Keep one Program and split implementation into dependency-ordered child ExecPlans. Use the repo date when each ExecPlan file is created.

1. `existing-codebase-checkout-intent-routing`
   - `buyerStartingPoint=no_codebase | existing_codebase | unspecified`
   - `checkoutCtaId`
   - `fulfillmentTrack`
   - Stripe metadata
   - Convex pending checkout claim
   - Convex product access grant
   - generated buyers to `/codebase`
   - existing-codebase buyers to `/workspace/setup`
   - missing or legacy intent to a small choice screen
2. `existing-codebase-workspace-data-model-and-events`
   - separate workspace tables
   - runner bindings
   - repository bindings
   - doctor-pass runs
   - findings
   - append-only sync-safe runner event stream
3. `existing-codebase-setup-ui`
   - `/workspace/setup`
   - Machine Setup
   - Project Setup
   - local runner pairing states
   - blockers and warnings
   - privacy defaults
   - `Run doctor pass`
4. `local-runner-prototype`
   - `bunx ship-by-sunday setup pair <token>`
   - `npx` fallback
   - daemon mode
   - one-shot mode
   - local `.sbs/` state
   - `gh` readiness
   - SBS Codex profiles
   - config diff/backup/approval
   - `codex exec` boundaries
5. `doctor-pass-and-sync-preview`
   - `/workspace/doctor-pass` stage progress and sync preview
   - passive probes
   - sync-safe `codebase-intake` JSON
   - local Markdown report
   - branchless doctor pass
   - sync preview approval
6. `findings-ledger-and-decision-screens`
   - `/workspace/findings`
   - `/workspace/findings/[findingId]`
   - dense Top 9 findings
   - no raw source by default
   - `Approve workflow`
7. `source-truth-agent-readiness-workflow`
   - workflow packet
   - approval sheet
   - SBS profile selection
   - write lease
   - timestamped branch
   - docs and `.sbs/` write boundary
   - local proof
   - local diff
   - explicit `Open PR`
8. `workspace-support-surfaces`
   - `/workspace/runs`
   - `/workspace/loops`
   - `/workspace/privacy`
   - run history
   - finding-filtered workflow catalog
   - local execution and sync boundaries
9. `existing-codebase-work-phase-workers`
   - approved queue
   - recurring jobs
   - heartbeat
   - pause and stop controls
   - proof sync
   - blocked-state reporting
   - one active write lease per project
10. `broken-app-rescue-loop`
   - concrete failure intake
   - read-only reproduction
   - root-cause localization
   - patch only after approval
11. `managed-github-run-phase`
   - premium or concierge mode
   - explicit repo access
   - branch and PR authority
   - CI visibility
   - audit log
   - revocation
12. `generated-repo-operating-pack`
   - customer-safe Program/ExecPlan file set
   - explicit generated-repo bootstrap
   - prompts, skills, package scripts, tests
   - no hidden `postinstall`

## Copy Boundaries

Safe language:

- "Run Codex locally on your machine and sync only the report you approve."
- "Attach your execution surface."
- "Every loop ends with proof or an honest blocked-proof report."
- "Ship by Sunday prepares Codex-ready worker instructions, proof paths, and structured reports."

Avoid until implemented:

- "PRs start happening."
- "We support any existing repo automatically."
- "Zero setup."
- "We never read anything" without specifying local mode and structured report sync.
- "Autonomous workers run all the time" before approval gates, runner persistence, and rollback rules exist.
- "OpenAI-compliant" as a vague claim; use "OpenAI-documented Codex best practices" or "Codex-aligned" when supported.

## Resolved Setup Decisions

- Use `bunx` by default, with `npx` fallback.
- Require local `gh` readiness for the existing-codebase lane.
- Install SBS execution profiles into a marked `~/.codex/config.toml` block only after diff, backup, and approval.
- Use `sbs-doctor-readonly`, `sbs-proof`, `sbs-loop-branch`, `sbs-pr-delivery`, and `sbs-network-needed` as the first profile names.
- Keep whole-config optimization as a later advanced flow.
- Offer private `codex-config` backup as optional, sanitized SBS-managed snapshots only, with local state under `~/.codex/.sbs/codex-config`.
- Split setup into reusable Machine Setup and per-repo Project Setup.
- Use a local daemon by default, with one-shot CLI fallback.
- Treat loops as workflow packets with deterministic probes, not prompt-only jobs.
- Treat Crawl as branchless; branch creation starts only after the first approved workflow.
- Model runner health as `Runner`, `MachineHealth`, `ProjectBinding`, and `ProjectHealth`.
- Recommend one Top 9 default first workflow, but let the customer override it.
- Use a sync-safe Top 9 findings schema with `id`, `title`, `category`, `severity`, `confidence`, `buyerImpact`, `blastRadius`, `proofPath`, `permissionRequired`, `recommendedWorkflowId`, `whyThisNow`, `evidenceRefs`, `blockedReason`, `syncSensitivity`, and `localReportRef`.
- Keep Crawl probes passive by default: `codebase-intake`, `command-proof-map`, `codex-setup-audit`, `repo-doctor-top-nine`, and `source-truth-agent-readiness`.
- Treat `broken-app-triage`, `revenue-path-audit`, and `ux-conversion-snapshot` as conditional Crawl probes.
- Move mutating or heavy workflows into later approved loop packs.
- Treat `managed_github` as a premium or concierge execution mode because it requires broader repo trust.
- Use `source-truth-agent-readiness` as the default first proof-backed write workflow after Top 9.
- Treat `observability-debuggability` as the likely second write workflow.
- Let `broken-app-triage` become the first write workflow only when the customer arrives with a concrete failure.
- Require `source-truth-agent-readiness` workflow packets to include identity, version, runner, profile, write lease, branch targets, dirty-state policy, touch boundaries, proof commands, sync policy, stop conditions, approvals, outputs, and rollback notes.
- Keep the first `source-truth-agent-readiness` write boundary to docs and local SBS artifacts only.
- Show a concrete first-write approval sheet with branch, profile, write lease duration, touch boundaries, expected artifacts, proof commands, sync policy, stop conditions, and rollback note.
- Use `sbs/source-truth-readiness-<YYYYMMDD-HHMM>` for the first branch name.
- Use a 30-minute write lease for the first docs/config workflow, renewable once from the approval sheet.
- Keep first-write proof rich locally and sync only workflow id/version, branch, profile, touched file paths, artifact names, proof command names/status, blocked reason, and next recommendation.
- Default first workflow delivery to local branch and diff plus proof; make `Open PR` a second explicit approval.
- Rank the post-source-truth next workflow by proof-backed customer pain: concrete breakage, observability/debuggability, proof harness, revenue path, UX/conversion, then test hardening.
- Make `/workspace/setup` a Machine Setup / Project Setup readiness screen with blockers, warnings, and `Run doctor pass`.
- Make local runner pairing show one copyable `bunx` command, `npx` fallback, token expiry, expected repo root, connection states, regenerate, one-shot mode, and cancel.
- Make one-shot mode run setup checks, doctor pass, local reports, sync preview, and exit, without queue jobs or always-on workers.
- Make `/workspace/runs` show doctor-pass and approved workflow run history during Crawl and Walk, without queue controls.
- Make `/workspace/loops` a finding-filtered workflow catalog until approved workflow packets exist.
- Make setup blocker resolution row-level with exact cause, impact, local action, `Retry check`, and terminal/diff gates for local mutations.
- Make `/workspace/findings` dense ranked rows with `Recommended first`, category/status filters, and `Run doctor pass again`.
- Make `/workspace/findings/[findingId]` a workflow decision screen with `Approve workflow` as the primary action and no raw source by default.
- Make `/workspace/doctor-pass` a stage-progress screen with probe rows, bottleneck questions, local report access, and explicit sync preview approval.
- Make `/workspace/privacy` a local-execution and sync-boundary control page with runner identity, project binding, last sync preview, raw source/log/transcript sharing disabled by default, revoke/delete controls, and managed GitHub disabled unless explicitly enabled later.
- Keep existing-codebase state in separate workspace tables instead of overloading generated-codebase `projectDefinitions` and `codebaseWorkflowStates`.
- Use an append-only, sync-safe runner event stream from local runner to hosted backend; derive UI state from backend rows and events instead of browser-daemon access.
- Split implementation into child ExecPlans in this order: checkout intent, workspace data/events, setup UI, local runner, doctor pass, findings, source-truth workflow, support surfaces, Work-phase workers, broken-app rescue, managed GitHub Run phase, and generated-repo operating pack.
- Create the first new existing-codebase child ExecPlan at `docs/exec-plans/active/2026-05-04-existing-codebase-checkout-intent-routing.md`, scoped only to intent persistence and routing.
- Create the second new existing-codebase child ExecPlan at `docs/exec-plans/active/2026-05-04-existing-codebase-workspace-data-model-and-events.md`, scoped to Convex workspace tables, validators, sync-safe event ingestion, and backend-derived state.
- Create the third new existing-codebase child ExecPlan at `docs/exec-plans/active/2026-05-04-existing-codebase-setup-ui.md`, scoped to `/workspace/setup`, Machine Setup, Project Setup, pairing states, blockers, warnings, privacy defaults, default open destination, and `Run doctor pass`.
- Create the fourth new existing-codebase child ExecPlan at `docs/exec-plans/active/2026-05-04-local-runner-prototype.md`, scoped to the new local runner package, `bunx`/`npx` pairing, foreground daemon, one-shot boundary, local `.sbs/` state, `gh` readiness, SBS Codex profiles, config diff/backup/approval, and `codex exec` boundaries.
- Create the fifth new existing-codebase child ExecPlan at `docs/exec-plans/active/2026-05-04-doctor-pass-and-sync-preview.md`, scoped to passive probes, `.sbs/codebase-intake.py` sync-safe JSON plus local Markdown, branchless doctor pass through local runner and `codex exec`, local reports, sync preview approval, and findings upload only after approval.

## Open Questions

- Should the sixth existing-codebase child ExecPlan be created now for findings ledger and decision screens, or wait until checkout intent, workspace data/events, setup UI, local runner, and doctor-pass implementation start?
