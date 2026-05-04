---
program_id: customer-agentic-operating-system
title: Customer Agentic Operating System
status: active
created_at: 2026-05-02
completed_at: null
summary: Make Ship by Sunday the agent doctor and loop operating layer for web-app builders across generated repos, broken apps, and mature existing codebases.
post_build_recap: null
read_when:
  - Planning generated customer repo Program and ExecPlan support.
  - Designing mature repo adoption for existing customer codebases.
  - Writing or refreshing child ExecPlans for the customer agentic operating system.
---

# Customer Agentic Operating System

This is a living initiative document. It keeps the durable initiative-level truth for turning Ship by Sunday into the agent doctor and loop operating layer for generated customer repos, broken existing apps, and mature existing codebases.

This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

Ship by Sunday should not merely hand customers a starter repo. The buyer-facing product is an agent doctor for web apps: diagnose the app or repo, rank the highest-leverage findings, attach a consented execution surface, run the first recommended worker loop, produce proof, and update source truth for the next recommendation. Programs, ExecPlans, validation commands, review evidence, and source-truth docs are the operating substrate that make those workers reliable instead of one-off agents trapped in chat history.

The commercial thesis is that the existing `$250` offer, soon moving toward `$500`, should stay the simple flagship purchase: doctor pass, top findings, the first recommended worker loop, proof, and the next recommendation. The loop catalog is fulfillment inventory and positioning proof, not a public SKU maze. New app builders, broken vibe-coded app owners, indie SaaS founders, agencies, operators, and mature teams can all understand the same promise: diagnose what is blocking the web app, run the highest-leverage loop inside the paid engagement, review proof, and receive the next recommendation.

Two buyer modes should stay visible in every later slice. New builders want an awesome worker-ready codebase from their idea: product truth, generated repo, setup docs, Build Pack readiness, and a first loop that proves the app can start moving. Existing app owners, founders, agencies, and operators want an agent doctor pass on a repo they already value: debugging, design, billing, auth, growth, performance, release, observability, support ops, and mature-repo acceleration without replacing the stack. Both modes converge on the same artifact trail: source-truth snapshot, findings ledger, selected loop, ExecPlan or work plan, proof, and next recommendation.

The most capable version of this product is a multi-surface execution system, not a single Codex integration. Ship by Sunday should treat `local_runner`, `codex_cloud_handoff`, `managed_github`, `generated_repo`, and `codex_app_server` as distinct execution surfaces with different consent, privacy, storage, proof, and PR-delivery properties. Local runner mode is the preferred privacy-forward codebase lane: Codex works on the customer's machine, while Ship by Sunday stores only the structured findings, proof status, and next-loop metadata the customer approves syncing. `managed_github` should be a higher-trust premium or concierge mode, not the default existing-codebase lane; it can be more hands-off, but it requires explicit repo access, install scope, storage policy, PR authority, audit logs, raw-source visibility rules, and revocation.

The near-term Program focus is existing codebases, in crawl/walk/work/run order. Crawl means a buyer can pick the existing-codebase lane, complete Machine Setup and Project Setup, run safe deterministic probes plus a local Codex doctor pass, and see a useful Top 9 findings ledger without Ship by Sunday reading raw source. Walk means the customer can approve one scoped workflow packet from that ledger, receive a local diff or PR handoff, and get proof or blocked proof. Work means the local runner can stay paired, run approved queue jobs over time, show queue/history/heartbeat/proof state, and pause or stop cleanly. Run means hosted or managed automation: managed GitHub, parallel workers, richer scheduling, and business packaging. Framework, package, dependency, and prompt-pack update-channel mechanics remain later strategy, not the current Program build.

The canonical existing-codebase UX spine is `Homepage intent -> Checkout -> Existing Codebase Setup -> Pair Local Runner -> Run Doctor Pass -> Top 9 Findings -> Approve First Loop -> Run Proof -> Worker Home`. The homepage should split intent and sell the outcome, not expose setup settings. The existing-codebase CTA should promise a private codebase doctor pass. Setup after purchase should feel like guided onboarding for the doctor pass, not a generic preferences page. Loop setup should not appear before diagnosis; the doctor pass should identify which loops matter, then the customer approves one concrete loop from a finding detail screen.

The first routing contract should be explicit. Generated-repo buyers route to `/codebase`, existing-codebase buyers route to `/workspace/setup`, and missing or legacy intent routes to a small choice screen instead of guessing. The existing-codebase workspace should live under the protected `/workspace/*` namespace with `/workspace/setup`, `/workspace/doctor-pass`, `/workspace/findings`, `/workspace/findings/[findingId]`, `/workspace/loops`, `/workspace/runs`, and `/workspace/privacy`. `Loop Setup` is not a first-run destination; it becomes relevant only after the doctor pass recommends a concrete finding.

The initiative is moving in the right direction when a newly generated repo contains a customer-safe Program and ExecPlan operating pack, when an existing or broken web app can receive a doctor pass with the top nine leverage findings, and when customers can buy repeatable loops that respect their current stack instead of forcing the starter workflow onto them. The plain-language promise is "agent doctor for web apps"; the durable machinery underneath remains Programs, ExecPlans, source truth, proof loops, and worker roles.

## Program Inputs

The Program packet lives under `docs/programs/active/2026-05-02-customer-agentic-operating-system/`.

The durable research inputs are `research-pass-generated-repo-operating-system.md`, `research-pass-mature-repo-adoption.md`, `research-pass-packaging-validation.md`, `research-pass-product-ux.md`, `research-pass-market-expansion.md`, `research-pass-loop-catalog-and-monetization.md`, and `research-pass-positioning-and-landing-page.md`.

The normalized input is `normalized-pass-agentic-operating-system.md`.

The convergence artifact is `converged-decision-packet.md`.

The dependency artifact is `dependency-graph.md`.

The plan split artifact is `plan-split-recommendation.md`.

The review artifact is `cross-repo-review.md`.

The codebase-support scratch note is `support-codebases.md` at the repository root. It is not a formal Program packet artifact, but it captures the 2026-05-04 product and technical discussion about local Codex execution, structured findings sync, existing-codebase setup, and the multi-surface execution model.

The package and update-channel scratch note is `package-discussion.md` at the repository root. It is a later strategic reference for recurring value and trusted upgrade authority. It must not pull the near-term Program away from existing-codebase doctor-pass support.

The current planning brief is `planning-brief-2.md`, with `current-planning-brief.txt` pointing at the current versioned brief. `planning-brief-1.md` still owns the active generated-repo source-contract child ExecPlan. `planning-brief-2.md` owns the existing-codebase child ExecPlan split for checkout intent, workspace state, local runner setup, doctor pass, findings, first workflow approval, and later workers.

## Current State

Ship by Sunday already has a strong internal Program and ExecPlan system under `docs/programs/`, `docs/exec-plans/`, `docs/prompts/`, and `scripts/`. Generated customer repos already receive Build Pack readiness, first-slice planning, root agent instructions, onboarding docs, local starter skills, and testing guidance.

The public product surface is already close to worker-first language. `apps/web/config/product.ts` sets the live flagship price to `$500` with a 50 percent active offer, so checkout displays the current `$250` Pilot Member purchase. `starterConfig.homePage.heroPrimaryCta` and `pricingPrimaryCta` both target checkout, and `apps/web/app/_content/home-page.ts` currently sells "Build the worker layer," "Ship codebases that convert," "Generate my codebase," exec loops, role packets, channel handoffs, and QA. The unresolved product issue is that the current customer journey still reads primarily as a generated-codebase path, while the highest-leverage market also includes broken vibe-coded apps, mature codebases, agencies, and operators who need diagnosis and loop execution before they care about methodology.

The live app flow is codebase-first. `apps/web/AGENTS.md`, `apps/web/content/docs/route-map.mdx`, and the routes under `apps/web/app/(workspace)/codebase` and `apps/web/app/(workspace)/review` make `/codebase` the canonical protected workspace and `/review` the customer-facing download handoff. Checkout is owned by `apps/web/app/api/stripe/checkout/route.ts`, `apps/web/platform/billing/checkout/checkout-session-params.ts`, the Stripe webhook docs under `apps/web/content/docs/stripe-checkout-webhook.mdx`, and the success path under `apps/web/app/checkout/success/`. That means the next commercial copy slice can change homepage narrative and offer framing, but it must not pretend the app already has mature-repo upload, repo audit, or arbitrary repair flows.

The homepage issue is similar. The product should not sound like abstract agentic engineering, a course, or a prompt library. The first explanation should be normal-buyer language: Ship by Sunday is the agent doctor for web apps. It diagnoses blockers, ranks the highest-leverage fixes, runs named AI worker loops, and ends every loop with proof or an honest blocked-proof report. The homepage should explain the two major buyer modes quickly: "start with my idea" for a generated worker-ready repo and "bring my app" for diagnosis-first existing or broken app help. It should then show the loop catalog as examples of what the flagship can route into, not as a checkout shelf.

The current design direction for the existing-codebase app shell is a focused setup console, but it should be framed as onboarding rather than settings. A left rail should use product-stage labels such as `Setup`, `Doctor Pass`, `Findings`, `Loops`, and `Runs`, instead of leading with a vague `General` page. The first screen should show ChatGPT/Codex connection, local runner pairing, selected repo or project, privacy and sync controls, default open destination such as Cursor or VS Code, runner status, and a primary `Run doctor pass` action. The screen can visually resemble a settings surface, but the copy and progression should make clear that setup exists to start diagnosis.

The first `/workspace/setup` version should split readiness into `Machine Setup` and `Project Setup`, with `blocked`, `warning`, and `ready` states. It should show Codex/ChatGPT connection, local runner pairing command, daemon status, Machine Setup checks for Codex auth, `gh` auth, SBS profiles, config diff and backup, optional `codex-config`, and daemon health, plus Project Setup checks for repo root, Git remote, dirty state, package manager, command map, and safe read-only mode. It should also show privacy and sync defaults, default open destination, and primary CTA `Run doctor pass`. `Run doctor pass` should be disabled only by blockers. Warnings stay visible but allow Crawl. The setup screen should not show findings, loop setup, or worker queue.

Before the daemon is connected, the local runner pairing flow should show one copyable primary command, pairing status, token expiry, expected repo root, and fallback commands. The primary command should be `bunx ship-by-sunday setup pair <token>`, with `npx ship-by-sunday setup pair <token>` as the fallback. After the command starts, setup should show states `waiting`, `runner detected`, `verifying machine`, `verifying project`, and `paired`. It should include `Regenerate token`, `Use one-shot mode`, and `Cancel pairing`. Daemon internals should be hidden unless expanded.

One-shot mode should be a bounded fallback when the daemon cannot stay running. It should run a single command session that pairs, checks Machine Setup and Project Setup, runs the doctor pass, writes local reports, opens the local sync preview, and exits. It should not support queue jobs, always-on workers, background approvals, or write leases beyond the current command. The web UI should mark runner health as `one-shot complete` or `one-shot disconnected` and explain that recurring workers require the daemon.

The setup blocker resolution UX should be row-level and concrete. Each blocked row should show the exact cause, why it blocks the doctor pass, the local command or action needed, and `Retry check`. For local mutations, the UI should show `Fix in terminal` or `Preview diff` rather than pretending the browser can edit local files directly. Warnings should show `Review`, `Dismiss for this run`, or `Fix later`. Config and profile changes should always show the diff and require terminal confirmation. There should be no generic `setup failed` state.

Loop setup belongs after the doctor pass produces a real finding. The user should not configure abstract loops up front. The `Top 9 Findings` screen should be the first AHA moment, with each finding linking to a detail view that explains impact, confidence, blast radius, proof path, required permission, expected output, evidence summary, file references without raw source by default, and the recommended workflow. The workflow approval screen should then set permission mode, expected touched areas, proof requirements, required secrets or provider access, stop condition, and output handoff. That keeps the flow buyer-led: first diagnose, then approve work.

The first `/workspace/findings` version should render dense ranked rows, not cards. Each row should show rank, title, category, severity, confidence, buyer impact, proofability, required permission, recommended workflow, and status such as `ready`, `blocked`, `needs approval`, `running`, or `done`. The top row should be visibly marked `Recommended first`. The screen should include category and status filters plus `Run doctor pass again`, but it should not include abstract loop setup.

The first `/workspace/findings/[findingId]` version should be a decision screen, not a report page. It should show finding title, category, severity, confidence, buyer impact, why now, evidence refs, proof path, required permission, recommended workflow, expected outputs, allowed and disallowed touch targets, sync policy, and blocked conditions. The primary action should be `Approve workflow`. Secondary actions should be `Back to findings`, `Copy local evidence ref`, and `Not now`. Raw source should not appear by default.

The first `/workspace/doctor-pass` version should show live stage progress, not raw logs. Stages should be runner connected, Machine Setup checked, Project Setup checked, passive probes running, Codex interpretation running, sync preview ready, and findings ready. Each probe should render as a row with status, duration, and whether it is local-only or sync-safe. While probes run, the screen should include a small bottleneck question panel that can improve ranking. Raw terminal logs should not stream by default. The safe actions are `View local report`, routed through the local runner, and `Approve sync preview` before findings are sent to the web app.

The first `/workspace/runs` version should show run history, not worker queue controls. In Crawl, it should show doctor-pass run history only: run id, started time, runner mode, probes, sync status, findings count, blocked reason, and local report ref. In Walk, it should also show approved workflow runs: workflow id, branch, profile, lease status, proof status, delivery status, next recommendation, and `Open local proof`. Queue controls should wait for the Work phase. The empty state should say runs appear after the doctor pass, not market always-on workers prematurely.

The first `/workspace/loops` version should be a workflow catalog filtered by what the doctor pass found, not a runnable always-on loop center. Each workflow row should show name, category, when useful, required permission, typical proof, risk level, and status: available now, recommended, blocked, or future. Rows should link back to relevant findings. A primary action should appear only when a workflow is tied to a finding: `Review finding`. There should be no `Run loop` button unless the workflow has an approved finding and workflow packet.

Internally, a loop should be modeled as a workflow packet, not as a Codex prompt alone. A workflow packet can include deterministic probes, user bottleneck context, local-only probe artifacts, optional Codex interpretation, optional Codex write work, proof commands, sync policy, and stop conditions. Codex is the local reasoning and writing layer on top of evidence; it is not the only scanner. Safe deterministic probes can run while the customer is completing setup or answering onboarding questions so that the first recommendation is based on machine readiness, repo shape, stack signals, command/proof availability, and the buyer's stated bottleneck.

The app already has an optional Codex app-server connection surface for paid users to connect their ChatGPT/Codex subscription for in-app generation. The current implementation lives in `apps/web/platform/codex/app-server.ts`, `apps/web/platform/codex/app-server-service.ts`, `apps/web/platform/codex/app-server-contracts.ts`, `apps/web/app/api/codex/`, and `apps/web/app/(workspace)/_components/codex-connection-card/`. It is protected by product access, stores per-user Codex state under a hashed home directory, spawns `codex app-server`, and records account status plus rate-limit snapshots in Convex. It is disabled by default on Vercel unless `CODEX_APP_SERVER_ENABLED` says otherwise, and the generated production env template sets `CODEX_APP_SERVER_ENABLED=false`.

Official OpenAI developer docs, checked through the OpenAI developer documentation MCP server during the 2026-05-03 and 2026-05-04 refreshes, support Codex through app, IDE extension, CLI, and cloud surfaces. They also describe ChatGPT or API-key sign-in, GitHub-connected Codex cloud environments, project-scoped `.codex/config.toml` only after trust, Apps SDK MCP tools plus optional UI, and app-review requirements around privacy, tool annotations, and test cases. The 2026-05-04 technical read also confirmed that `codex exec` is the stable non-interactive path for running Codex against a chosen workspace, while `codex app-server` is experimental and best treated as one surface, not the foundation of all codebase support. This means "bring your own AI" should be a real strategy, but the Program must frame it as explicit, consented execution surfaces rather than implying silent attachment to a user's Codex account.

The existing-codebase lane should be designed around local privacy by default and greater hosted capability by consent. In local runner mode, the customer runs Ship by Sunday pairing code inside their repo, Codex runs on their machine, and Ship by Sunday receives only approved structured reports: top-nine findings, scores, proof command summaries, file references, permission requirements, blocked-proof states, selected loop ids, and next recommendations. Raw source files, long code snippets, full terminal logs, secrets, and Codex transcripts should stay local unless the customer explicitly shares them. Managed GitHub and Codex cloud handoff can become more hands-off modes, but they must name the repo access, storage, PR, and review boundaries before they are used for paid loops. Managed GitHub should not be required for the first doctor pass.

In practice, the first local runner should be a Bun-first CLI plus local `.sbs/` state, not repo docs as the executable surface. The expected first command shape is `bunx ship-by-sunday setup pair <token>` with `npx` as a fallback, followed by daemon-backed project commands such as `bunx ship-by-sunday project doctor`. The runner should split setup into Machine Setup and Project Setup. Machine Setup verifies local Codex availability, ChatGPT/Codex auth, `gh` availability and authentication, readable `~/.codex/config.toml`, SBS execution profiles, config hygiene, optional sanitized `codex-config` backup, and local daemon health. Project Setup verifies repository root, Git remote, package manager, script map, dirty state, `.sbs/` pairing state, safe read-only execution, and proof-command availability. The runner should write local artifacts such as `.sbs/config.json`, `.sbs/reports/doctor-pass.json`, `.sbs/reports/doctor-pass.md`, `.sbs/runs/<run-id>/workflow-packet.json`, `.sbs/runs/<run-id>/prompt.md`, `.sbs/runs/<run-id>/output.json`, `.sbs/runs/<run-id>/proof.json`, and `.sbs/runs/<run-id>/sync-preview.json`. It should not add or edit a root `AGENTS.md` during Crawl; existing repo instructions should be read when present, and durable repo artifacts should be opt-in later.

SBS execution profiles should be first-class local Codex configuration. The first named profile set should be `sbs-doctor-readonly`, `sbs-proof`, `sbs-loop-branch`, `sbs-pr-delivery`, and `sbs-network-needed`. The runner should install an SBS-managed block in `~/.codex/config.toml` only after showing a diff, creating a local backup, and receiving explicit approval. The first-pass setup should own only that marked block, detect drift, and preserve everything outside it. Later advanced optimization can inspect and propose changes across the whole Codex config, but the Crawl contract should be reversible and narrowly owned. Setup should warn on file-based `auth.json` or MCP credential storage and recommend OS keychain/keyring storage, but it should not read credential contents. A private `codex-config` GitHub repo can be offered through local `gh`, but the first-pass backup should contain only sanitized SBS-managed snapshots, diffs, and README material, not the full `~/.codex` directory or full `config.toml`. The local working copy for that backup should live under `~/.codex/.sbs/codex-config`.

The runner should default to a user-space daemon for the polished web UX while preserving one-shot commands for fallback and recovery. The hosted Ship by Sunday web app and backend act as the pairing and event relay: the browser creates a setup token, the local daemon verifies it, the daemon streams structured events through the backend, and the web UI renders health, diffs, approvals, queue state, proof state, and sync previews. The browser should not claim to edit local files directly. Durable runner identity should persist beyond setup, be revocable, rotate tokens, and support multiple machines with one active write lease per project.

Runner status should be modeled as typed health state, not a single online dot. The first contract should distinguish `Runner`, `MachineHealth`, `ProjectBinding`, and `ProjectHealth`. The web UI can render those as status groups for runner, machine setup, project setup, queue, proof, sync, and permissions. Multiple machines can be paired to one account or project, but only one runner can hold an active write lease for a project at a time.

The current `.sbs/codebase-intake.py` scratch scanner is the shape of the first deterministic Crawl probe. Its default mode is read-only, skips dependency/generated folders, local env files, lockfiles, scanner files, and agent/editor tooling, reads Git churn when available, detects stack and commands, runs passive risk and stack-specific checks, and emits an interpretive Markdown report. Productizing it requires a structured JSON companion with stable finding ids, severities, confidence, line references, recommended loops, and sync-safe summaries. The full Markdown report should stay local by default because it includes repo tree, file paths, line references, and short samples.

The default Crawl probe set should stay passive and read-only: `codebase-intake`, `command-proof-map`, `codex-setup-audit`, `repo-doctor-top-nine`, and `source-truth-agent-readiness`. Conditional Crawl probes can run only when their trigger is present: `broken-app-triage` when the customer reports a failure or provides an error, `revenue-path-audit` when auth, billing, entitlement, checkout, or webhook surfaces are detected, and `ux-conversion-snapshot` when the app can boot or screenshots exist. Later loop packs should own observability implementation, test hardening, dependency upgrades, migrations, package installs, provider setup, background workers, browser automation, PR delivery, always-on monitoring, and other workflows that mutate state, run heavier commands, or increase privacy and permission surface.

Crawl must stay branchless and approval-light. The doctor pass can run passive probes and safe read-only proof discovery, but it does not create a branch, write files, install packages, start long-running services, run migrations, use provider CLIs, or push anything. Those actions require explicit approval. A dirty worktree is a Crawl warning, not a blocker, because diagnosis can still be useful. Walk requires a clean worktree or an explicit checkpoint/branch decision before write work starts.

Setup readiness should separate hard blockers from warnings. Blockers are missing Codex, missing ChatGPT/Codex auth, missing or unauthenticated `gh`, no Git repository, refused SBS profile patch, unreadable Codex config, or missing SBS execution profiles. Warnings can continue with degraded readiness: file-based `auth.json`, skipped `codex-config` sync, imperfect sandbox defaults outside SBS profiles, missing optional MCP servers, no keychain/keyring preference, noisy history or log settings, and dirty Project Setup during Crawl. Setup remediation can run before codebase loops when it directly affects execution quality.

High-risk approvals must have a local enforcement point. Editing Codex config outside the SBS block, changing credential storage, creating or pushing `codex-config`, escalating network, installing or upgrading dependencies, running migrations or database commands, starting background workers, pushing branches, opening PRs, sharing raw logs or source, and danger-level sandbox changes need explicit approval, with terminal confirmation for the riskiest local actions. Auto-approval is only acceptable inside narrow SBS profiles and loop contracts; it must never become blanket network, install, migration, provider, destructive Git, or danger-full-access approval.

The Top 9 findings ledger should recommend one default first workflow while allowing customer override. The default should be chosen by leverage, safety, proofability, low blast radius, visible value, and fit with the buyer's stated bottleneck. The first approved workflow should create a branch only after approval, run under the selected SBS profile and write lease, and produce a local diff or PR handoff according to GitHub readiness and execution surface.

The sync-safe Top 9 findings schema should be useful enough to drive the product without requiring raw source. Each finding should include `id`, `title`, `category`, `severity`, `confidence`, `buyerImpact`, `blastRadius`, `proofPath`, `permissionRequired`, `recommendedWorkflowId`, `whyThisNow`, `evidenceRefs`, `blockedReason`, `syncSensitivity`, and `localReportRef`. `evidenceRefs` should default to file paths, line numbers, command names, and artifact ids only. Raw source excerpts, full logs, screenshots with sensitive data, and Codex transcript excerpts require explicit sharing approval.

The first proof-backed write workflow after the Top 9 findings ledger should be `source-truth-agent-readiness`. It is low blast radius, improves every later Codex loop, usually touches docs or config rather than runtime code, and produces straightforward proof: repo instructions, command map, workflow packet, validated proof commands, and a clearer runner contract. `observability-debuggability` should be the likely second write workflow because it is extremely valuable for fragile apps, but it can require provider keys, runtime changes, dependency installs, deployment proof, and production-policy decisions. `broken-app-triage` remains a conditional high-value path when the customer arrives with a concrete failure, not the default first write workflow for every repo.

The `source-truth-agent-readiness` workflow packet should include `workflowId`, `workflowVersion`, `projectId`, `runnerId`, `profileName`, `writeLeaseId`, `repoRoot`, `baseBranch`, `targetBranch`, `dirtyStatePolicy`, `inputs`, `localArtifacts`, `allowedTouchTargets`, `disallowedTouchTargets`, `commandsToInspect`, `proofCommands`, `syncPolicy`, `stopConditions`, `approvalRequired`, `expectedOutputs`, and `rollbackNotes`. For this workflow, allowed touch targets should be docs and local SBS artifacts only: root agent instructions when approved, `.sbs/**`, command and proof maps, workflow packet artifacts, and relevant README or setup docs. Runtime app code, env files, lockfiles, dependency manifests, migrations, provider configs, generated folders, and package scripts are disallowed unless a later workflow explicitly approves them.

The approval UX before `source-truth-agent-readiness` creates a branch should be a compact approval sheet, not a vague AI permission prompt. It should show the exact branch name, SBS profile, write lease duration, allowed touch targets, disallowed touch targets, expected files and artifacts, proof commands, sync policy, stop conditions, and rollback note. The primary action should be `Create branch and run workflow`. The terminal should mirror the same approval, and local confirmation should be required if root agent instructions or Codex config are touched. The customer approves a concrete work boundary, not an open-ended agent.

The first branch naming convention should be `sbs/source-truth-readiness-<YYYYMMDD-HHMM>`, using the customer's local timezone when available and UTC as fallback. The default write lease for Crawl-to-Walk docs/config workflows should be 30 minutes, renewable once from the approval sheet when the runner is still active. If the lease expires, the runner must stop before new writes and leave local proof or blocked proof explaining what happened.

The local proof output for `source-truth-agent-readiness` should include `diffSummary`, `touchedFiles`, `createdArtifacts`, `proofCommandsRun`, `proofCommandResults`, `blockedProof`, `rollbackInstructions`, and `nextRecommendedWorkflow`. The synced output should be narrower: workflow id and version, branch, profile, touched file paths, artifact names, proof command names and status, blocked reason, and next recommendation. The runner should not sync full generated docs, source excerpts, command logs, or Codex transcript by default.

After `source-truth-agent-readiness` completes, the default delivery should be a local branch and diff plus proof. Opening a PR should be a second explicit approval action named `Open PR`. If `gh` is ready and the customer approved PR delivery during setup, the first workflow approval sheet can preselect "open PR after proof passes," but that choice must remain visible. The first workflow must not silently push. Early trust is better served by local diff first, with PR delivery as an approved handoff.

The next recommendation after `source-truth-agent-readiness` should optimize for the highest proof-backed customer pain once the repo is agent-ready. The priority order should be concrete breakage the customer reported, `observability-debuggability` when the app is fragile or production failures are hard to inspect, proof harness when commands, tests, or builds are missing or unreliable, revenue path when billing, auth, or entitlements exist and look risky, UX or conversion when the app boots and has obvious activation or landing issues, and test hardening when there is a narrow high-value behavior to cover. This keeps the second workflow adaptive while making observability the default for fragile-codebase customers.

Generated customer repos do not yet receive the canonical Program and ExecPlan folder model. The customer-safe snapshot contract currently excludes internal `docs/programs/**`, `docs/exec-plans/**`, `docs/PLANS.md`, `docs/prompts/program-*.md`, `.codex/**`, internal release workflow notes, and source instruction packs. It ships or renders `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.agents/**`, `docs/testing/**`, generated onboarding, local starter skills, `docs/build/**`, and `execplan-*` prompt assets. That protects customers from internal history but also means the best agentic operating practices are not yet installed in the generated repo.

The generated-repo flow is concretely owned by `apps/web/app/api/download/repo/route.ts`, `apps/web/app/api/download/repo/_server/downloads.ts`, `packages/codebase-compiler/src/bundle/build-review-download-zip.ts`, `packages/codebase-compiler/src/repo-generation/materialize-repo-snapshot.ts`, `packages/codebase-compiler/src/repo-generation/render-generalized-starter-files.ts`, `packages/codebase-compiler/src/repo-generation/render-starter-project-onboarding.ts`, `packages/codebase-compiler/src/repo-generation/render-starter-skills.ts`, `packages/codebase-compiler/src/repo-generation/starter-root-package-json.ts`, and materialization tests under `packages/codebase-compiler/tests/`. Current generated root scripts include `bootstrap`, `codex:skills:install`, app dev/build/check/test scripts, and `test:compiler`; they do not yet include `plans:lint`, `programs:lint`, or `agentic:check`.

Mature existing codebases have no first-class product lane yet. The current product flow is codebase-first and generated-repo-first. The mature-repo lane needs a separate audit and adoption workflow that preserves each customer's conventions. The broken-app rescue wedge needs an even sharper contract: reproduce the failure, identify root causes, rank leverage, patch only after review, and prove the app moved from stuck to safer. Until those contracts exist, public copy can sell diagnosis-first existing-app help as planned or concierge/beta, but it must not imply automated mature-repo transformation is live.

The package/update-channel idea is valuable but later. `package-discussion.md` argues that Ship by Sunday can eventually become a trusted update channel for agent-built SaaS through manifests, migrations, prompt pack refreshes, production-pattern updates, and generated upgrade PRs. That is a strong recurring-value path, but it depends on the same foundations the existing-codebase lane needs first: repo detection, source ownership boundaries, local execution, structured reports, proof, rollback, customer-approved patches, and repeated worker-loop demand. The Program should therefore treat the update channel as a later strategic expansion after Crawl, Walk, and Work are proven, not the current product target.

## Progress

- [x] 2026-05-02 EDT: Researched `Man-Meets-AI/plans-and-programs` and confirmed its strongest portable practices are Programs, ExecPlans, immutable planning briefs, thin skills, prompt loops, and structural validation.
- [x] 2026-05-02 EDT: Mapped current Ship by Sunday generated repo surfaces, customer-safe snapshot exclusions, prompt pack wiring, starter onboarding, local skills, package scripts, and compiler tests.
- [x] 2026-05-02 EDT: Created this active Program packet and the first planning brief.
- [x] 2026-05-02 EDT: Created the first child ExecPlan for reconciling the generated-repo agentic source contract.
- [x] 2026-05-02 EDT: Incorporated subagent critiques about prompt naming drift, skill trigger drift, package-script promises, product-lane overreach, and mature-repo adoption boundaries.
- [x] 2026-05-02 EDT: Incorporated the worker-first product thesis and the new-codebase versus existing-codebase customer journey into the Program packet.
- [x] 2026-05-02 EDT: Added market-expansion research that reframes the Program around the agent doctor wedge, top-nine findings pass, loop catalog, BYO execution surface, and broken-app rescue lane.
- [x] 2026-05-02 EDT: Added loop catalog and monetization research that expands the sellable inventory across diagnostic, rescue, revenue, growth, product, operations, AI, and agency loops.
- [x] 2026-05-02 EDT: Added positioning and landing-page research that makes the first explanation "agent doctor for web apps" instead of abstract agentic methodology.
- [x] 2026-05-03 EDT: Refreshed the Program against current homepage, checkout, codebase, Codex, OpenAI docs, and generated-repo compiler surfaces; tightened the strategy around one flagship offer, two buyer modes, consented execution, proof promises, and reality boundaries.
- [x] 2026-05-04 EDT: Captured the codebase-support scratch note in `support-codebases.md` and updated the Program around local runner privacy, structured findings sync, multi-surface execution, checkout intent, and codebase setup as the path to the doctor pass rather than the product itself.
- [x] 2026-05-04 EDT: Reviewed `package-discussion.md` and clarified that trusted update-channel mechanics are later strategy, separate from the near-term Crawl, Walk, and Work phases. The immediate Program target is existing-codebase Crawl: setup, local execution surface, read-only doctor pass, structured findings, and Top 9 findings ledger.
- [x] 2026-05-04 EDT: Split always-on local workers from package/update-channel strategy by adding a Work phase between Walk and Run.
- [x] 2026-05-04 EDT: Baked in the existing-codebase UX spine: homepage intent split, setup as guided onboarding, local runner as Bun-first CLI plus `.sbs/` local state, doctor pass before loop setup, Top 9 finding detail, first loop approval, proof, and later Worker Home.
- [x] 2026-05-04 EDT: Refined the existing-codebase architecture around workflow packets, deterministic probes, Machine Setup, Project Setup, SBS-managed Codex execution profiles, required local `gh` readiness, a persistent local daemon, runner health, and sync-safe probe outputs.
- [x] 2026-05-04 EDT: Created `planning-brief-2.md`, refreshed `plan-split-recommendation.md`, and split existing-codebase implementation into child ExecPlan slugs for checkout intent, workspace data/events, setup UI, local runner, doctor pass, findings, first workflow approval, support surfaces, Work-phase workers, broken-app rescue, managed GitHub Run phase, and generated-repo operating pack.
- [ ] Implement the first generated-repo source-contract slice.
- [ ] Refresh the Program with generated-repo proof and choose the commercial doctor-pass slice.
- [ ] Define the existing-codebase Crawl contract: buyer intent, Machine Setup, Project Setup, local runner pairing, Codex profile/config hygiene, required `gh` readiness, deterministic probes, read-only doctor pass, structured report schema, sync preview, and Top 9 findings ledger.
- [ ] Define the execution-surface contract for local runner first, then Codex cloud handoff, managed GitHub, generated repo, and app-server paths.
- [ ] Define the loop workflow-packet contract for deterministic probes, user bottleneck context, Codex interpretation, Codex write jobs, proof commands, stop conditions, and sync policy.
- [ ] Build the local runner prototype around `bunx ship-by-sunday setup pair`, daemon-backed status events, `codex exec`, SBS execution profiles, local `.sbs/` reports, structured report schemas, sync preview, and approved findings sync.
- [ ] Ship codebase setup and Top 9 findings ledger before write loops or worker recurrence.
- [ ] Ship the Walk phase around `source-truth-agent-readiness` first: first-loop approval, local diff or PR handoff, proof or blocked-proof output, and next-loop recommendation.
- [ ] Ship `observability-debuggability` as the likely second write workflow after source truth and command proof make runtime work safer.
- [ ] Ship the Work phase: persistent local worker pairing, approved loop queue, run history, heartbeat, pause or stop controls, proof sync, and blocked-state reporting.
- [ ] Ship broken-app rescue as the conditional high-value path for customers who arrive with a concrete failure.
- [ ] Design and implement the mature-repo adoption lane.

## Decision Log

Decision: Use one Program for generated repos, broken apps, and mature existing repos.
Rationale: The product promise is one operating system with several customer lanes. A single Program keeps shared packaging, validation, prompt, skill, execution-surface, and narrative decisions coherent while child ExecPlans keep implementation slices bounded.
Date: 2026-05-02

Decision: Treat workers as the purchased outcome and Programs, ExecPlans, and loops as the worker substrate.
Rationale: Customers want reliable workers more than they want abstract agent methodology. The methodology matters because it makes the worker layer durable: workers get role packets, source truth, plan state, proof loops, and recurrence instead of depending on a single prompt.
Date: 2026-05-02

Decision: Lead with the agent doctor and loop catalog commercially.
Rationale: The widest web-app market includes new app builders, broken vibe-coded app owners, mature repo owners, agencies, and operators. They buy diagnosis, leverage, repair, and proof before they buy planning doctrine. Programs and ExecPlans should show the work and preserve memory, while the top-level product sells doctor passes and loop execution.
Date: 2026-05-02

Decision: Treat the loop catalog as the sellable inventory and rank loops by money.
Rationale: The most valuable loops combine urgent pain, willingness to pay, clear proof, bounded risk, repeatability, and natural next-purchase pull. The near-term catalog should lead with doctor pass, broken-app rescue, billing/auth hardening, conversion/activation, release proof, observability, design, performance, and test hardening.
Date: 2026-05-02

Decision: Make the doctor pass output a Top 9 findings ledger.
Rationale: The Top 9 schema gives every lane the same conversion artifact: buyer value, expected revenue or speed impact, confidence, blast radius, proof path, required permissions, recommended workflow, package or price language, next action, and blocked-proof state.
Date: 2026-05-02

Decision: Use plain landing-page language before operating-system language.
Rationale: A normal web-app builder should understand the product in under 10 seconds. "The agent doctor for web apps" explains the buyer value faster than "agentic engineering operating system"; Programs, ExecPlans, and source-truth loops should appear as proof machinery deeper in the page and docs.
Date: 2026-05-02

Decision: Keep the public first purchase anchored to the `$250` soon-`$500` flagship offer.
Rationale: The buyer should not have to choose from a SKU maze. The flagship offer should include the doctor pass, Top 9 findings report, selected first loop, proof output, blocked-proof report when needed, and next-loop recommendation. Additional loops, subscriptions, retainers, emergency rescue, agency tier, and concierge review are follow-on or higher-touch shapes, not the main first-purchase story.
Date: 2026-05-02

Decision: Treat bring-your-own AI as a consented execution surface.
Rationale: Ship by Sunday already has optional Codex app-server connection code, and Codex supports ChatGPT or API-key sign-in across local and cloud surfaces. The product should let customers attach ChatGPT/Codex, API keys, GitHub environments, or local repo runners explicitly, then run loops against that authorized surface.
Date: 2026-05-02

Decision: Make generated repo source-contract reconciliation the first implementation lane.
Rationale: Generated repos are controlled by `packages/codebase-compiler`, already use Bun, already include Build Pack readiness, and can be proven through existing materialization tests. Subagent review found prompt naming drift and skill trigger drift, so reconciliation should precede full operating-pack shipment.
Date: 2026-05-02

Decision: Keep mature-repo adoption separate from generated-repo bootstrap.
Rationale: Mature repos need read-only audit, package-manager preservation, source-truth mapping, and safe patch delivery. They should not inherit generated-starter assumptions.
Date: 2026-05-02

Decision: Avoid hidden `postinstall` or silent bootstrap mutation.
Rationale: Customers should explicitly ask the repo to create or refresh agentic Program artifacts. Hidden mutation makes setup surprising and harder to review.
Date: 2026-05-02

Decision: Separate public offer language from fulfillment routing.
Rationale: The public purchase should read as one flagship web-app progress pass: diagnose the app, rank the top findings, run the first recommended loop, prove or report the block, and recommend the next loop. Internally the loop catalog routes fulfillment across new-app generation, broken-app rescue, billing/auth, growth, performance, release, observability, support ops, and mature-repo acceleration, but the buyer should not have to choose among many SKUs before trust exists.
Date: 2026-05-03

Decision: State live capability and future capability separately.
Rationale: Today the repo proves a codebase-first generated-repo purchase and an optional paid-user Codex app-server connection for in-app generation. It does not yet prove mature-repo ingestion, arbitrary existing-repo patching, GitHub-connected doctor execution, API-key loop execution, or self-serve broken-app rescue. The Program should sell the commercial direction while forcing each later slice to name the files, permissions, proof commands, and blocked-proof states that make a claim real.
Date: 2026-05-03

Decision: Make proof and blocked proof part of the flagship output.
Rationale: A normal buyer can understand proof more quickly than methodology. The flagship should end with either command/browser/dashboard evidence for the selected loop or a blocked-proof report naming the missing permission, environment, secret, provider access, reproduction, or review decision. That makes failure truthful and sets up the next recommendation without pretending unsupported automation succeeded.
Date: 2026-05-03

Decision: Build codebase support around execution surfaces, not a single Codex app-server dependency.
Rationale: The most capable service needs privacy-forward local work, hosted GitHub/PR automation, Codex cloud handoffs, generated-repo execution, and current app-server generation to coexist behind explicit contracts. `codex app-server` is useful but experimental and currently only powers account and generation flows in this repo. The product should model `local_runner`, `codex_cloud_handoff`, `managed_github`, `generated_repo`, and `codex_app_server` separately so each lane can define consent, storage, permissions, proof, cost/rate-limit behavior, and failure states.
Date: 2026-05-04

Decision: Make the local runner the default privacy-forward existing-codebase path.
Rationale: For customers who want Ship by Sunday to avoid reading their codebase, the repo work should run on the customer's machine through local Codex, preferably through stable non-interactive `codex exec` where possible. Ship by Sunday should sync only the structured findings the customer approves: finding scores, proof summaries, file references, permission requirements, blocked states, loop ids, and next recommendations. Raw source, secrets, long logs, and Codex transcripts should not be synced by default.
Date: 2026-05-04

Decision: Treat managed GitHub as a premium or concierge execution mode.
Rationale: Managed GitHub can deliver the most hands-off branch, PR, CI, and hosted coordination experience, but it requires broader repo trust than the local runner. It should require explicit repo access, install scope, storage policy, PR authority, audit logs, raw-source visibility rules, and revocation before it is sold or used. The default paid existing-codebase path should remain local runner until the doctor pass and first approved workflow are proven.
Date: 2026-05-04

Decision: Treat codebase setup as the route to the doctor pass, not the product.
Rationale: The first paid existing-codebase screen can show ChatGPT/Codex connection, project selection, local runner pairing, and audit choices, but the AHA must be the Top 9 findings ledger and the first approved loop. Setup-only UX is weaker than the course; diagnosis, proof, and the next loop are the commercial payload.
Date: 2026-05-04

Decision: Persist buyer starting point through checkout before routing fulfillment differently.
Rationale: The current Stripe and Convex access flow does not durably know whether a buyer entered from `I have an idea` or `I have a codebase`. Before the app can fulfill those promises differently, checkout should persist `buyerStartingPoint`, `checkoutCtaId`, and `fulfillmentTrack` through Stripe metadata, pending checkout claims, product access grants, and success routing.
Date: 2026-05-04

Decision: Route existing-codebase fulfillment into a protected `/workspace/*` spine.
Rationale: Generated-repo buyers should continue to `/codebase`, while existing-codebase buyers need `/workspace/setup` as a separate onboarding path. The protected workspace should include `/workspace/setup`, `/workspace/doctor-pass`, `/workspace/findings`, `/workspace/findings/[findingId]`, `/workspace/loops`, `/workspace/runs`, and `/workspace/privacy`, with missing or legacy intent falling back to a choice screen. This keeps setup, diagnosis, finding review, loop approval, runs, and privacy controls legible without treating loop setup as the first screen.
Date: 2026-05-04

Decision: Defer the package/update-channel strategy until existing-codebase support works.
Rationale: `package-discussion.md` is directionally valuable because recurring trust can come from best-practice migrations, prompt updates, production recipes, and upgrade PRs. However, it is a later business model. Crawl, Walk, and Work must first prove that a customer can point Ship by Sunday at an existing repo, keep raw code local by default, receive a useful doctor report, approve useful loop work, and keep a local worker running with proof. Without that, an update registry would be premature infrastructure.
Date: 2026-05-04

Decision: Sequence existing-codebase support as crawl, walk, work, then run.
Rationale: Crawl is read-only diagnosis and structured findings. Walk is one approved loop with proof or blocked proof. Work is the always-on local worker layer: approved queue, heartbeat, run history, pause or stop, proof sync, and blocked-state reporting. Run is broader hosted or managed automation such as managed GitHub, parallel workers, richer scheduling, and business packaging. Package/update-channel mechanics are later strategy. This sequencing keeps always-on workers in scope without forcing premature update-registry infrastructure into the first existing-codebase AHA.
Date: 2026-05-04

Decision: Make the homepage an intent split and outcome promise, not the setup UI.
Rationale: The homepage currently needs to capture whether the buyer has an idea or an existing codebase, then route checkout and fulfillment accordingly. It should sell `Run a private codebase doctor pass` for existing repos, while the actual setup surface appears after purchase or sign-in. Showing setup affordances too early would make the product feel like configuration software before the buyer understands the payoff.
Date: 2026-05-04

Decision: Treat existing-codebase setup as guided onboarding.
Rationale: The setup screen can use a settings-like visual structure, but its job is to get to the doctor pass. The durable navigation should be `Setup`, `Doctor Pass`, `Findings`, `Loops`, and `Runs`. The setup surface should show Codex connection, local runner pairing, project selection, privacy and sync controls, default open destination, runner status, and a primary `Run doctor pass` action.
Date: 2026-05-04

Decision: Split `/workspace/setup` into Machine Setup and Project Setup readiness.
Rationale: Setup needs to explain whether the machine can run workers and whether the selected repo can be diagnosed. The first setup screen should show Codex/ChatGPT connection, local runner pairing command, daemon status, Machine Setup checks, Project Setup checks, privacy and sync defaults, default open destination, and `Run doctor pass`. It should use `blocked`, `warning`, and `ready` states. Blockers disable `Run doctor pass`; warnings remain visible but allow Crawl. Findings, loop setup, and worker queue belong on later screens.
Date: 2026-05-04

Decision: Keep local runner pairing focused on the command and connection state.
Rationale: Before the daemon is connected, the browser should not expose low-level daemon details or imply it can access local files directly. The pairing UI should show one copyable primary command, `bunx ship-by-sunday setup pair <token>`, the `npx` fallback, pairing status, token expiry, expected repo root, and states for `waiting`, `runner detected`, `verifying machine`, `verifying project`, and `paired`. It should include `Regenerate token`, `Use one-shot mode`, and `Cancel pairing`, with daemon internals hidden unless expanded.
Date: 2026-05-04

Decision: Make one-shot mode a bounded doctor-pass fallback.
Rationale: One-shot mode should rescue setup when a daemon cannot stay running without implying always-on worker capability. It should pair, check Machine Setup and Project Setup, run the doctor pass, write local reports, open the sync preview, and exit. It should not support queue jobs, always-on workers, background approvals, or write leases beyond the current command. Runner health should report `one-shot complete` or `one-shot disconnected`, with recurring workers clearly requiring the daemon.
Date: 2026-05-04

Decision: Make setup blocker resolution row-level and local-action explicit.
Rationale: Customers should never see a vague setup failure. Each blocked setup row should show exact cause, why it blocks the doctor pass, the local command or action needed, and `Retry check`. Local mutations should use `Fix in terminal` or `Preview diff`; config and profile changes must show a diff and require terminal confirmation. Warnings should support `Review`, `Dismiss for this run`, or `Fix later`.
Date: 2026-05-04

Decision: Run diagnosis before asking the customer to configure loops.
Rationale: Abstract loop setup before repo diagnosis asks the customer to understand Ship by Sunday's internal catalog too early. The doctor pass should produce the Top 9 findings ledger first. Only then should the customer see finding detail, choose the first loop, set permission mode, confirm proof requirements, and approve work.
Date: 2026-05-04

Decision: Make finding detail a workflow decision screen.
Rationale: `/workspace/findings/[findingId]` should help the customer decide whether to approve the recommended workflow, not bury them in a report. The first version should show finding title, category, severity, confidence, buyer impact, why now, evidence refs, proof path, required permission, recommended workflow, expected outputs, allowed and disallowed touch targets, sync policy, and blocked conditions. The primary action should be `Approve workflow`; secondary actions should be `Back to findings`, `Copy local evidence ref`, and `Not now`. Raw source should stay hidden by default.
Date: 2026-05-04

Decision: Make the Top 9 findings ledger dense and ranked.
Rationale: `/workspace/findings` should be a fast triage surface, not a card gallery or loop configuration page. The first version should render ranked rows with rank, title, category, severity, confidence, buyer impact, proofability, required permission, recommended workflow, and status. The top row should be marked `Recommended first`. Category and status filters plus `Run doctor pass again` are useful; abstract loop setup belongs downstream of finding detail and approval.
Date: 2026-05-04

Decision: Make `/workspace/doctor-pass` a stage-progress screen, not a log stream.
Rationale: During the doctor pass, the customer needs to understand what is happening without seeing raw terminal output or source-adjacent details. The screen should show stages for runner connected, Machine Setup checked, Project Setup checked, passive probes running, Codex interpretation running, sync preview ready, and findings ready. Probe rows should show status, duration, and local-only versus sync-safe classification. A small bottleneck question panel can run in parallel. Raw logs stay local by default, with `View local report` and `Approve sync preview` as explicit actions.
Date: 2026-05-04

Decision: Keep `/workspace/runs` as history until Work-phase queues exist.
Rationale: Crawl and Walk need auditability, not premature always-on controls. In Crawl, `/workspace/runs` should show doctor-pass run history with run id, started time, runner mode, probes, sync status, findings count, blocked reason, and local report ref. In Walk, it should add approved workflow runs with workflow id, branch, profile, lease status, proof status, delivery status, next recommendation, and `Open local proof`. Queue controls belong to the Work phase after persistent workers are real.
Date: 2026-05-04

Decision: Keep `/workspace/loops` as a catalog until approved workflow packets exist.
Rationale: Before recurring workers exist, loops should help customers understand what the doctor pass can route into without implying always-on execution. `/workspace/loops` should show a workflow catalog filtered by findings, with name, category, when useful, required permission, typical proof, risk level, and status. Rows should link to relevant findings. The only primary action before approval should be `Review finding`; `Run loop` requires an approved finding and workflow packet.
Date: 2026-05-04

Decision: Make `/workspace/privacy` a local-execution and sync-boundary control page.
Rationale: Privacy is part of the existing-codebase promise, but the first version should not become a legal-copy page or raw-source viewer. `/workspace/privacy` should show runner identity, project and repo binding, local execution mode, what stays local, what can sync, last sync preview, per-project sync settings, and controls to review sync policy, revoke the runner, delete synced findings or reports, and export local instructions. Raw source, raw terminal logs, and Codex transcripts stay disabled by default. Managed GitHub and other off-machine execution modes should remain visibly disabled unless explicitly enabled later.
Date: 2026-05-04

Decision: Create a separate existing-codebase workspace data model.
Rationale: The current `/codebase` backend tables are for generated-repo product facts and review readiness. Existing-codebase support needs durable state for local runner pairing, repo bindings, doctor-pass runs, findings, sync previews, and later workflow runs without overloading `projectDefinitions` or `codebaseWorkflowStates`. The first model should add `workspaceProjects`, `workspaceRunnerBindings`, `workspaceRepositoryBindings`, `doctorPassRuns`, `codebaseFindings`, and later `workflowRuns`. These tables should store sync-safe state only by default: project identity, fulfillment track, runner status and mode, repo remote or display label, setup health, doctor-pass status, findings metadata, sync preview state, workflow/proof status, and revocation or deletion timestamps. Raw source, raw logs, local absolute paths, secrets, and Codex transcripts must stay local unless explicitly approved.
Date: 2026-05-04

Decision: Use an append-only sync-safe runner event protocol through the hosted backend.
Rationale: The web app needs live setup, doctor-pass, and workflow status without reading local files or talking directly to the customer's daemon. The first protocol should be a typed event stream from the local runner to the hosted backend, with the browser subscribing to backend-derived state. Each event should include `eventId`, `projectId`, `runnerId`, `runId`, `eventType`, `createdAt`, `schemaVersion`, and a narrow payload. First event types should cover pairing, heartbeat, setup check start and completion, doctor stage start, probe completion, sync preview readiness, approved findings, workflow approval request, workflow start, proof completion, blocked workflow, and runner revocation. Events must not include raw source, raw logs, local absolute paths, secrets, or Codex transcripts.
Date: 2026-05-04

Decision: Make the first local runner a Bun-first CLI with local `.sbs/` state.
Rationale: A command such as `bunx ship-by-sunday setup pair <token>` is the preferred low-friction pairing path for an existing repo, with `npx` as a fallback for machines without Bun. Local `.sbs/` artifacts give the customer a reviewable report, exact workflow packet, prompt, output, proof, and sync preview without mutating existing repo instructions. Root `AGENTS.md`, package scripts, and durable repo docs can be optional later installs after trust exists.
Date: 2026-05-04

Decision: Treat existing-codebase loops as workflow packets instead of prompt packets.
Rationale: The best doctor pass combines deterministic probes, customer bottleneck context, Codex interpretation, optional Codex writes, proof commands, stop conditions, and sync policy. This lets Ship by Sunday run safe scans while setup is happening, then use local Codex for judgment and work only where it adds leverage. It also makes non-LLM probes first-class loop inventory instead of incidental helper scripts.
Date: 2026-05-04

Decision: Split setup into reusable Machine Setup and per-repo Project Setup.
Rationale: The machine must be capable before codebase workers can be trusted. Machine Setup owns Codex auth, `gh` auth, SBS profiles, Codex config hygiene, optional config backup, daemon identity, and runner health. Project Setup owns repo binding, Git remote, package manager, script map, dirty state, deterministic intake, doctor reports, proof paths, and sync preview. This lets one machine support multiple projects while making "machine healthy, project blocked" legible.
Date: 2026-05-04

Decision: Require local GitHub CLI readiness for the existing-codebase lane.
Rationale: The paid existing-codebase promise is not only "scan my repo"; it is "turn diagnosis into branches, PRs, and repeatable worker delivery." Setup should therefore require `gh` to be installed and authenticated before the lane is treated as ready, while private `codex-config` backup remains explicitly skippable with a local-backup-only state.
Date: 2026-05-04

Decision: Make SBS execution profiles first-class local Codex configuration.
Rationale: Profiles let the runner choose permission and execution posture per job. The first profile set should be `sbs-doctor-readonly`, `sbs-proof`, `sbs-loop-branch`, `sbs-pr-delivery`, and `sbs-network-needed`. The first setup should install only a marked SBS-managed block in `~/.codex/config.toml` after diff preview, local backup, and approval. Whole-config optimization is valuable later, but Crawl must be reversible and narrowly owned.
Date: 2026-05-04

Decision: Use a persistent local daemon with one-shot command fallback.
Rationale: A daemon gives the web app live setup status, runner health, queue state, diffs, approvals, proof status, and always-on worker readiness while local execution stays on the customer's machine. One-shot commands remain necessary for fallback and recovery. Durable runner identity should be revocable, support heartbeat and token rotation, and enforce one active write lease per project.
Date: 2026-05-04

Decision: Keep Crawl branchless and separate hard setup blockers from warnings.
Rationale: The doctor pass should run passive probes and read-only proof discovery without creating a branch or writing files. Missing Codex, missing ChatGPT/Codex auth, missing or unauthenticated `gh`, no Git repo, refused SBS profile patch, unreadable Codex config, and missing SBS profiles block readiness. File-based `auth.json`, skipped `codex-config` sync, imperfect non-SBS sandbox defaults, missing optional MCP servers, no keychain/keyring preference, noisy history/log settings, and dirty status during Crawl should warn but not erase diagnostic value. Walk can require a clean worktree or explicit checkpoint before writes.
Date: 2026-05-04

Decision: Gate high-risk local actions at approval boundaries.
Rationale: The local runner can only be trusted if customers know when it will mutate their machine or repo. Editing Codex config outside the SBS block, changing credential storage, creating or pushing `codex-config`, escalating network, installing or upgrading dependencies, running migrations or provider CLIs, starting background workers, pushing branches, opening PRs, sharing raw source or logs, destructive Git operations, and danger-level sandbox changes need explicit approval and local enforcement. Auto-approval belongs only inside narrow SBS profiles and workflow contracts.
Date: 2026-05-04

Decision: Make Top 9 choose a default first workflow while preserving customer override.
Rationale: The AHA should not leave the customer staring at nine equal choices. The ledger should recommend one first workflow using leverage, safety, proofability, low blast radius, visible value, and the buyer's stated bottleneck. The customer can override that recommendation, but branch creation and write work still happen only after approval, profile selection, and write lease.
Date: 2026-05-04

Decision: Use `source-truth-agent-readiness` as the first proof-backed write workflow.
Rationale: The first write workflow should improve the customer's repo and the runner's future effectiveness without taking a runtime dependency risk. `source-truth-agent-readiness` usually touches docs, command maps, agent instructions, workflow packets, and proof contracts rather than app behavior, so it is low blast radius and easy to prove. `observability-debuggability` should likely come second because fragile apps need it, but it can require provider keys, runtime changes, dependency installs, deployment proof, and production-policy decisions. `broken-app-triage` remains the conditional first write path when the customer arrives with a concrete failure.
Date: 2026-05-04

Decision: Require an explicit workflow packet and docs/config-only boundary for `source-truth-agent-readiness`.
Rationale: The first write workflow should be safe enough for fragile repos and still useful enough to improve all later loops. Its packet should include identity, version, project, runner, profile, write lease, repo and branch targets, dirty-state policy, inputs, local artifacts, touch boundaries, inspected commands, proof commands, sync policy, stop conditions, approvals, expected outputs, and rollback notes. Its default write set should stay in docs and local SBS artifacts: approved root agent instructions, `.sbs/**`, command/proof maps, workflow packet artifacts, README, and setup docs. Runtime app code, env files, lockfiles, dependency manifests, migrations, provider configs, generated folders, and package scripts require later workflow approval.
Date: 2026-05-04

Decision: Show a concrete approval sheet before the first write workflow.
Rationale: Customers should approve a bounded workflow, not a vague agent action. Before `source-truth-agent-readiness` creates a branch, the UI should show exact branch name, SBS profile, write lease duration, allowed and disallowed touch targets, expected files and artifacts, proof commands, sync policy, stop conditions, and rollback note. The primary action should be `Create branch and run workflow`. The terminal should mirror the same approval, with local confirmation required when root agent instructions or Codex config are touched.
Date: 2026-05-04

Decision: Use timestamped SBS branches and short renewable write leases.
Rationale: The first write workflow should be easy to identify, review, and stop. Branch names should use `sbs/source-truth-readiness-<YYYYMMDD-HHMM>`, using the customer's local timezone when available and UTC as fallback. Crawl-to-Walk docs/config workflows should get a 30-minute write lease that can be renewed once from the approval sheet while the runner is active. On lease expiry, the runner must stop before new writes and leave proof or blocked proof explaining the stop.
Date: 2026-05-04

Decision: Keep first-write proof rich locally and narrower when synced.
Rationale: Customers need enough local proof to inspect exactly what the workflow did, but Ship by Sunday does not need raw generated docs, logs, source excerpts, or transcripts to render status and next recommendations. Local proof for `source-truth-agent-readiness` should include `diffSummary`, `touchedFiles`, `createdArtifacts`, `proofCommandsRun`, `proofCommandResults`, `blockedProof`, `rollbackInstructions`, and `nextRecommendedWorkflow`. Synced proof should include workflow id and version, branch, profile, touched file paths, artifact names, proof command names and status, blocked reason, and next recommendation.
Date: 2026-05-04

Decision: Default first workflow delivery to local branch and diff, with PR as a second approval.
Rationale: The first write workflow is also a trust-building moment. It should not silently push or open a PR. After `source-truth-agent-readiness` completes, the default output should be a local branch, local diff, and proof. The UI can show `Open PR` as the next explicit action. If `gh` is ready and the customer approved PR delivery during setup, "open PR after proof passes" can be preselected in the approval sheet, but the choice must remain visible and revocable.
Date: 2026-05-04

Decision: Rank the next workflow by proof-backed customer pain after source-truth readiness.
Rationale: The second workflow should not be one-size-fits-all. After `source-truth-agent-readiness`, the recommendation engine should prefer concrete breakage the customer reported, then `observability-debuggability` for fragile or hard-to-inspect production apps, then proof harness for missing or unreliable commands, then revenue path for risky billing/auth/entitlement surfaces, then UX or conversion for bootable apps with obvious activation problems, then test hardening for narrow high-value behaviors. This makes observability the default for fragile-codebase customers without ignoring stronger evidence from the doctor pass.
Date: 2026-05-04

Decision: Use a sync-safe Top 9 finding schema that can drive workflow approval without source upload.
Rationale: The app needs enough structured data to rank findings, explain the recommendation, request the right permission, and instantiate a workflow packet, but local mode must not require raw source, long logs, or transcripts. Each finding should include `id`, `title`, `category`, `severity`, `confidence`, `buyerImpact`, `blastRadius`, `proofPath`, `permissionRequired`, `recommendedWorkflowId`, `whyThisNow`, `evidenceRefs`, `blockedReason`, `syncSensitivity`, and `localReportRef`, with evidence refs limited by default to paths, line numbers, command names, and artifact ids.
Date: 2026-05-04

Decision: Keep Crawl probes passive by default and move mutating or heavy work into later loop packs.
Rationale: Crawl needs to create the first AHA without surprising customers or damaging fragile repos. The default read-only probe set should be `codebase-intake`, `command-proof-map`, `codex-setup-audit`, `repo-doctor-top-nine`, and `source-truth-agent-readiness`. `broken-app-triage`, `revenue-path-audit`, and `ux-conversion-snapshot` are conditional Crawl probes based on customer input or detected surfaces. Observability implementation, test hardening, dependency upgrades, migrations, package installs, provider setup, background workers, browser automation, PR delivery, always-on monitoring, and similar work belong to approved later loop packs.
Date: 2026-05-04

Decision: Model runner health as separate runner, machine, project binding, and project health state.
Rationale: A single online/offline dot hides the difference between a healthy daemon, a broken Codex setup, an unbound repo, a missing proof command, and a write lease conflict. The first health model should expose `Runner`, `MachineHealth`, `ProjectBinding`, and `ProjectHealth`, then render runner, machine setup, project setup, queue, proof, sync, and permissions in the web app.
Date: 2026-05-04

Decision: Split existing-codebase implementation into dependency-ordered child ExecPlans.
Rationale: The product is too broad for one mega-plan, but it should remain one Program so routing, privacy, runner, findings, workflow, and future worker decisions stay coherent. The accepted split is checkout intent routing; workspace data model and events; setup UI; local runner prototype; doctor pass and sync preview; findings ledger and decision screens; `source-truth-agent-readiness` workflow; runs, loops, and privacy support surfaces; Work-phase workers; broken-app rescue; managed GitHub Run phase; and generated-repo operating pack. Crawl depends on the first six existing-codebase slices, Walk starts with source-truth readiness, Work starts after one approved workflow works, and Run waits for proven local demand.
Date: 2026-05-04

## Slice Ledger

Active child ExecPlans:

- `docs/exec-plans/active/2026-05-02-reconcile-customer-agentic-source-contract.md`
- `docs/exec-plans/active/2026-05-04-existing-codebase-checkout-intent-routing.md`

Completed child ExecPlans:

- None.

Recommended future child ExecPlans:

- `existing-codebase-workspace-data-model-and-events`: add separate existing-codebase workspace tables plus the append-only sync-safe runner event stream through the hosted backend.
- `existing-codebase-setup-ui`: build `/workspace/setup` with Machine Setup, Project Setup, pairing states, blockers, warnings, privacy defaults, default open destination, and `Run doctor pass`.
- `local-runner-prototype`: build `bunx ship-by-sunday setup pair <token>`, `npx` fallback, daemon and one-shot mode, local `.sbs/` state, `gh` readiness, SBS Codex profiles, config diff/backup/approval, and `codex exec` boundaries.
- `doctor-pass-and-sync-preview`: productize passive probes, including `.sbs/codebase-intake.py` as sync-safe JSON plus local Markdown, and gate findings upload behind sync preview approval.
- `findings-ledger-and-decision-screens`: build `/workspace/doctor-pass`, `/workspace/findings`, and `/workspace/findings/[findingId]` around stage progress, dense Top 9 rows, finding detail, evidence refs without raw source, permissions, and `Approve workflow`.
- `source-truth-agent-readiness-workflow`: ship the first Walk workflow packet, approval sheet, SBS profile selection, write lease, timestamped branch, docs and `.sbs/` write boundary, proof output, local diff, and explicit `Open PR`.
- `workspace-support-surfaces`: build `/workspace/runs`, `/workspace/loops`, and `/workspace/privacy` for Crawl and Walk status, finding-filtered workflow catalog, local execution boundaries, revocation, and deletion controls.
- `existing-codebase-work-phase-workers`: add approved queue, recurring jobs, heartbeat, run history, pause and stop controls, proof sync, blocked-state reporting, multi-machine support, and one active write lease per project.
- `broken-app-rescue-loop`: add the conditional concrete-failure workflow with read-only reproduction before patch approval.
- `managed-github-run-phase`: add premium or concierge managed GitHub execution after local Crawl, Walk, and Work prove demand.
- `generated-repo-operating-pack`: after the active generated-repo source-contract plan lands, ship the customer-safe Program and ExecPlan file set, explicit generated-repo bootstrap, prompts, skills, package scripts, and tests.
- Explore package/update-channel mechanics only after existing-codebase Crawl, Walk, and Work prove repeated worker demand.

## Next Slice

Two active child ExecPlans now exist. `docs/exec-plans/active/2026-05-02-reconcile-customer-agentic-source-contract.md` should reconcile generated-repo source truth and customer-safety boundaries because current customer output must not point to missing prompts, skills, scripts, or unsafe planning archives. `docs/exec-plans/active/2026-05-04-existing-codebase-checkout-intent-routing.md` is the first existing-codebase child plan. It should persist `buyerStartingPoint`, `checkoutCtaId`, and `fulfillmentTrack` through the homepage CTA, Stripe checkout metadata, pending checkout claims, product access grants, checkout success, and the fulfillment router. It should keep generated buyers on `/codebase`, send existing-codebase buyers to `/workspace/setup`, and send missing or legacy intent to a small choice screen. It must not build runner UI, daemon behavior, doctor pass, findings, workflow approval, or worker queue controls.

The following slice is `existing-codebase-workspace-data-model-and-events`. It should add the separate existing-codebase tables and sync-safe event protocol that later setup, runner, doctor pass, findings, and workflow UI depend on. Only after those contracts exist should `/workspace/setup`, the local runner prototype, doctor pass, findings ledger, first workflow approval, support surfaces, Work-phase workers, broken-app rescue, and managed GitHub Run-phase work proceed in the dependency order recorded in `plan-split-recommendation.md` and `planning-brief-2.md`.

The generated-repo source-contract plan can still land first if protecting current output is urgent. The checkout-intent plan can run in parallel because it is narrow and uses `planning-brief-2.md`, while the active generated-repo source-contract plan continues to use `planning-brief-1.md`.

## Risks and Watchpoints

Do not ship internal Program archives, completed ExecPlans, release evidence, or local operator assumptions into customer repos.

Do not duplicate Build Pack readiness truth. Generated Program and ExecPlan guidance should point to readiness and use it as input rather than conflicting with it.

Do not hide Program creation inside `postinstall`. Use explicit commands and reviewable generated artifacts.

Do not overfit mature-repo adoption to Bun, Next.js, Convex, Stripe, Linear, or the generated starter route map.

Do not let product messaging imply mature repos become production-ready automatically. The truthful promise is worker-readiness: clearer source truth, safer plans, validation, review loops, and a first adoption Program that lets agents behave like durable workers inside the customer's actual repo.

Do not sell "attach your Codex" as a hidden or automatic action. The customer must explicitly connect the ChatGPT/Codex account, API key, GitHub repo, local runner, and permission mode used by any loop.

Do not use `codex app-server` as the assumed foundation for every codebase feature. It is one useful surface for account connection and generation, but the existing-codebase product should also support stable CLI/local-runner execution, Codex cloud handoff, and managed GitHub where the customer consents to broader access.

Do not claim local privacy without naming the report boundary. Local mode can truthfully say Ship by Sunday does not read the codebase only if raw files, secrets, long logs, and transcripts stay local by default and the app stores only approved structured findings.

Do not let structured findings become source leakage. File paths, line references, short titles, command summaries, scores, and blocked-proof reasons are acceptable defaults; raw source excerpts and full logs require explicit customer approval.

Do not let the loop catalog become a grab bag. Each monetized loop needs a named input contract, output artifact, proof standard, rollback or review boundary, and honest failure state.

Do not let homepage copy sell the internal method instead of the buyer outcome. The first screen should make clear this is for web apps, works for new and existing or broken apps, diagnoses before acting, runs named loops, proves results, and requires consent for BYO Codex, AI, GitHub, API-key, or local execution surfaces.

Do not turn the homepage into setup. The homepage should capture buyer intent and sell the private doctor-pass outcome. Setup belongs after checkout or sign-in, when the user has context for pairing a runner.

Do not make codebase setup feel like generic preferences. Avoid `General` as the leading product concept for the existing-codebase lane; the screen should be framed as `Setup` for the doctor pass and should lead toward `Run doctor pass`.

Do not ask customers to configure abstract loops before diagnosis. Loop setup should be downstream of Top 9 findings, where the customer can approve a concrete objective with proof and permission boundaries.

Do not mutate existing repo instructions during Crawl. A local `.sbs/` report folder and sync preview are acceptable defaults; root `AGENTS.md`, package scripts, generated docs, or durable repo instructions should be optional later installs after explicit approval.

Do not treat Codex as the only scanner. Deterministic probes, local scripts, command discovery, and stack-specific audits are first-class workflow steps. Codex should interpret evidence and execute approved work where useful, not replace safe passive intake.

Do not sync full deterministic probe reports by default. Markdown reports such as codebase intake can include repo trees, file paths, line references, command names, and short samples. The app should receive a sync-safe structured ledger unless the customer explicitly shares the full report.

Do not run deep probes without a separate approval. Passive read-only scans are appropriate during setup. Deep mode, installed scanners, package scripts, tests, build commands, migrations, network, provider CLIs, and long-running services need an explicit command policy and approval.

Do not initialize Git across the whole `~/.codex` directory. Codex home can contain credentials, logs, history, SQLite state, MCP auth, and other sensitive files. If a private `codex-config` backup exists, it should begin with sanitized SBS-managed snapshots and diffs only.

Do not silently optimize the customer's whole Codex config during Crawl. Installing the SBS-managed profile block after diff, backup, and approval is acceptable. Whole-config optimization belongs behind a later advanced flow with its own preview and approval gates.

Do not fragment the first purchase into too many SKUs. The public offer should stay the current `$250`, soon `$500`, flagship promise. Doctor pass, selected loop, and proof are included; additional loop purchases, subscription, emergency rescue, agency tier, and concierge review should appear only where fulfillment, checkout, entitlement, and support can honestly handle them.

Do not let the homepage imply the current generated-repo checkout already includes self-serve mature-repo ingestion or automatic repair. The truthful public story can say the system is being aimed at ideas, broken apps, existing SaaS repos, and client apps, but each lane must be labeled according to actual proof: live generated-repo path, planned doctor-pass contract, concierge/beta existing-app support, or future mature-repo adoption.

Do not let `package-discussion.md` turn into current scope. Trusted update-channel mechanics are valuable later, but the existing-codebase Program must first prove local setup, read-only diagnosis, structured findings, one approved loop, and always-on local worker demand.

## Outcomes & Retrospective

This Program is active. It should complete only after generated repos ship the customer-safe operating pack, after the doctor pass and loop catalog can rank and execute real work with proof, and after the mature or broken-repo adoption lane has a durable, validated product path or a deliberately scoped first release with remaining work recorded.

## Validation and Acceptance

At the Program level, acceptance requires proof across all lanes.

Generated-repo acceptance requires materialized customer repos to include the operating pack, root validation scripts, prompt assets, skills, and customer-safe docs without internal archive leakage. Compiler tests must prove the output structurally, not only through substring checks.

Mature-repo acceptance requires an adoption workflow that audits an existing repo, preserves its conventions, emits a Program packet and first child ExecPlan, and reports blocked proof or missing facts honestly.

Commercial acceptance requires a normal web-app builder with an existing codebase to understand why they should run the doctor pass before trusting broader worker claims. The homepage must split `I have an idea` from `I have a codebase`, the existing-codebase CTA must promise a private codebase doctor pass, and the first proof promise must cover local/privacy-forward diagnosis, top findings, proof or blocked-proof fields, and one recommended next action without introducing update-channel complexity.

Doctor-pass acceptance requires a Top 9 findings schema that can score buyer value, expected revenue or speed impact, confidence, blast radius, proof path, required permissions, recommended workflow, price or package language, next action, and blocked-proof state from product and repo truth. Loop acceptance requires `source-truth-agent-readiness` to produce a reviewable local diff or PR and proof or blocked-proof report without assuming the starter stack. `observability-debuggability` should be the likely second write loop, and broken-app rescue should be available as the conditional first write loop when a customer arrives with a concrete failure.

BYO execution acceptance requires the product to distinguish `local_runner`, `codex_cloud_handoff`, `managed_github`, `generated_repo`, and `codex_app_server` modes. Each mode must document consent, storage, permissions, report schema, cost or rate-limit implications, failure states, proof delivery, and PR or local-diff behavior before the product relies on it for paid loops. Local-runner acceptance also requires SBS execution profiles to be first-class: profile install, drift detection, permission mode, approval policy, config backup, and high-risk escalation rules must be named before write jobs rely on them.

Managed GitHub acceptance additionally requires premium or concierge positioning, explicit GitHub app or token scope, repository selection, branch and PR authority, CI visibility, stored artifact policy, audit log, raw-source visibility rules, operator access boundaries, and revocation. It must not be required for the first local doctor pass.

Existing-codebase Crawl acceptance requires checkout or entry intent for `existing_codebase`, success routing into setup, a setup surface with Machine Setup, Project Setup, Codex connection, local runner pairing, required `gh` readiness, repo/project selection, privacy and sync controls, default open destination, runner health, and `Run doctor pass`, a local-runner pairing contract, a persistent daemon or one-shot fallback, passive deterministic probes, a read-only doctor loop that can run through local Codex against a customer repo, local `.sbs/` report artifacts, a structured report schema that avoids raw-source leakage by default, a sync preview, an approval step before syncing findings, and a Top 9 findings ledger in the app. Crawl also requires the first deterministic intake to produce a sync-safe JSON output or extraction layer distinct from its local Markdown report.

The first setup screen must split Machine Setup and Project Setup readiness. It should show Codex/ChatGPT connection, runner pairing command, daemon status, Codex auth, `gh` auth, SBS profiles, config diff and backup, optional `codex-config`, repo root, Git remote, dirty state, package manager, command map, safe read-only mode, privacy and sync defaults, default open destination, and `Run doctor pass`. It must disable `Run doctor pass` only for blockers, while warnings remain visible and allow Crawl. It must not show findings, loop setup, or worker queue.

The setup pairing section must show the primary `bunx ship-by-sunday setup pair <token>` command, `npx` fallback, pairing status, token expiry, expected repo root, and connection states from waiting to paired. It must include regenerate, one-shot mode, and cancel actions, while hiding daemon internals unless expanded.

One-shot mode must run only the current setup and doctor-pass command session: pair, check Machine Setup, check Project Setup, run doctor pass, write local reports, open sync preview, and exit. It must not expose queue jobs, always-on workers, background approvals, or durable write leases.

Setup blocker resolution must be exact and actionable. Blocked rows must name cause, doctor-pass impact, local command or action, and `Retry check`. Warning rows must support review, dismiss-for-this-run, or fix-later behavior. Local mutations must route through terminal confirmation or diff preview, not silent browser-side edits.

The first doctor-pass screen must expose stage progress without raw log streaming. It should show runner connected, Machine Setup checked, Project Setup checked, passive probes running, Codex interpretation running, sync preview ready, and findings ready, plus per-probe status, duration, and local-only or sync-safe classification. It should support bottleneck answers during scanning and require `Approve sync preview` before uploading findings.

The first Top 9 findings ledger must use dense ranked rows with rank, title, category, severity, confidence, buyer impact, proofability, required permission, recommended workflow, and status. It must mark `Recommended first`, support category and status filtering, include `Run doctor pass again`, and avoid abstract loop setup.

The first runs screen must show history, not queue controls. Crawl run history covers doctor-pass runs and sync status. Walk run history adds approved workflow proof and delivery state. Work-phase queue controls are out of scope until persistent workers exist.

The first loops screen must show a workflow catalog filtered by findings, not queue controls or a runnable always-on loop center. It should show workflow name, category, when useful, required permission, typical proof, risk level, status, and links to relevant findings. `Run loop` requires an approved finding and workflow packet.

The first privacy screen must show local execution and sync boundaries, not raw source. It should expose runner identity, selected project and repo binding, local execution mode, what stays local, what can sync, last sync preview, per-project sync settings, raw source/log/transcript sharing disabled by default, controls to review sync policy, revoke the runner, delete synced findings or reports, and export local instructions. Managed GitHub and off-machine execution stay disabled unless explicitly enabled later.

The first existing-codebase backend model must be separate from generated-codebase `projectDefinitions` and `codebaseWorkflowStates`. It should add durable workspace tables for projects, runner bindings, repository bindings, doctor-pass runs, findings, and later workflow runs. Stored fields should be limited to sync-safe project identity, fulfillment track, runner status and mode, repo remote or display label, setup health, doctor-pass status, finding metadata, sync preview state, workflow/proof status, and revocation or deletion timestamps. Raw source, raw logs, local absolute paths, secrets, and Codex transcripts stay local by default.

Runner-to-web state must flow through the hosted backend as append-only sync-safe events plus durable rows. First events should include runner pairing and heartbeat, setup check start and completion, doctor stage start, probe completion, sync preview readiness, approved findings, workflow approval request, workflow start, proof completion, blocked workflow, and runner revocation. The browser must derive UI state from backend state instead of direct daemon access, and events must not contain raw source, raw logs, local absolute paths, secrets, or Codex transcripts.

The Crawl contract also requires exact fulfillment routing and safety boundaries: generated-repo buyers route to `/codebase`, existing-codebase buyers route to `/workspace/setup`, missing intent routes to a choice screen, and the protected workspace exposes setup, doctor pass, findings, finding detail, loops, runs, and privacy surfaces. The doctor pass must not create branches or mutate repo files. Passive read-only probes can run during setup, but installs, builds, tests, migrations, provider commands, background services, network escalation, config changes outside the SBS block, pushes, PRs, raw-source sharing, and destructive Git operations require explicit approval according to the profile and workflow contract.

The Top 9 findings schema must be sync-safe by default and contain enough structure to drive the finding UI and next workflow: `id`, `title`, `category`, `severity`, `confidence`, `buyerImpact`, `blastRadius`, `proofPath`, `permissionRequired`, `recommendedWorkflowId`, `whyThisNow`, `evidenceRefs`, `blockedReason`, `syncSensitivity`, and `localReportRef`. Evidence refs should not include source excerpts unless explicitly approved.

Existing-codebase Walk acceptance requires one selected finding from the Top 9 findings ledger to open a finding detail view with impact, confidence, blast radius, proof path, required permission, expected output, evidence summary, file references without raw source by default, and recommended workflow. That finding must become an approved workflow packet with permission mode, SBS profile, write lease, expected touched areas, proof requirements, stop condition, local diff or PR handoff, proof or blocked-proof output, and a next-loop recommendation.

The finding detail UI must be a workflow decision surface. It should expose finding title, category, severity, confidence, buyer impact, why now, evidence refs, proof path, required permission, recommended workflow, expected outputs, touch boundaries, sync policy, and blocked conditions, with `Approve workflow` as the primary action and no raw source by default.

The Top 9 findings ledger must recommend a default first workflow based on leverage, safety, proofability, low blast radius, visible value, and the buyer's stated bottleneck, while still allowing customer override. Walk write work requires the selected SBS profile, a write lease, and either a clean worktree or an explicit checkpoint/branch decision before mutation.

The default first Walk workflow should be `source-truth-agent-readiness`. Its packet must include `workflowId`, `workflowVersion`, `projectId`, `runnerId`, `profileName`, `writeLeaseId`, `repoRoot`, `baseBranch`, `targetBranch`, `dirtyStatePolicy`, `inputs`, `localArtifacts`, `allowedTouchTargets`, `disallowedTouchTargets`, `commandsToInspect`, `proofCommands`, `syncPolicy`, `stopConditions`, `approvalRequired`, `expectedOutputs`, and `rollbackNotes`. The approval sheet must show the branch, profile, write lease duration, touch boundaries, expected artifacts, proof commands, sync policy, stop conditions, and rollback note before the branch is created. The first branch name should follow `sbs/source-truth-readiness-<YYYYMMDD-HHMM>`, and the default write lease should be 30 minutes with one approval-sheet renewal. Its local proof should include `diffSummary`, `touchedFiles`, `createdArtifacts`, `proofCommandsRun`, `proofCommandResults`, `blockedProof`, `rollbackInstructions`, and `nextRecommendedWorkflow`; its sync-safe output should include only workflow id and version, branch, profile, touched file paths, artifact names, proof command names and status, blocked reason, and next recommendation. Delivery defaults to local branch and diff plus proof, with `Open PR` as a second explicit approval. Its default write boundary is docs and local SBS artifacts only. The next workflow should be ranked by proof-backed customer pain: reported breakage, observability/debuggability for fragile or opaque production apps, proof harness, revenue path, UX/conversion, then test hardening. If the customer entered with a concrete breakage, `broken-app-triage` can override the default. Otherwise, `observability-debuggability` is the next likely write workflow for fragile-codebase customers after source truth is in place.

Existing-codebase Work acceptance requires a paired local worker that can run approved queue jobs over time, expose queue status, run history, heartbeat, machine health, project health, proof sync, blocked-state reporting, approval prompts, and pause or stop controls without syncing raw source by default. It must support multiple machines while enforcing one active write lease per project.

Run-phase acceptance covers hosted or managed automation such as managed GitHub, parallel workers, richer scheduling, and business packaging. Package/update-channel acceptance is intentionally deferred until repeated Work-phase demand exists.

Program completion also requires `bun run programs:lint`, relevant `plans:lint` checks, markdown lint for touched planning docs, focused compiler or product tests, and broader repo gates as dictated by child ExecPlans.

## Artifacts and Notes

The current planning brief is `docs/programs/active/2026-05-02-customer-agentic-operating-system/planning-brief-2.md`.

The first child ExecPlan is `docs/exec-plans/active/2026-05-02-reconcile-customer-agentic-source-contract.md`.

The most relevant prior Program is `docs/programs/completed/2026-05-01-generated-repo-first-slice-autonomy/`.

The market-expansion research pass is `docs/programs/active/2026-05-02-customer-agentic-operating-system/research-pass-market-expansion.md`.

The loop-catalog and monetization research pass is `docs/programs/active/2026-05-02-customer-agentic-operating-system/research-pass-loop-catalog-and-monetization.md`.

The positioning and landing-page research pass is `docs/programs/active/2026-05-02-customer-agentic-operating-system/research-pass-positioning-and-landing-page.md`.

The codebase-support scratch note is `support-codebases.md`.

The later package/update-channel scratch note is `package-discussion.md`.

The 2026-05-03 source refresh inspected `apps/web/config/product.ts`, `apps/web/app/_content/home-page.ts`, `apps/web/app/_lib/home-page-render-model.ts`, `apps/web/content/docs/configure-the-homepage.mdx`, `apps/web/content/docs/route-map.mdx`, `apps/web/content/docs/build-your-product.mdx`, `apps/web/content/docs/the-build-loop.mdx`, `apps/web/content/docs/stripe-checkout-webhook.mdx`, `apps/web/content/docs/customize-the-starter.mdx`, `apps/web/app/api/stripe/checkout/route.ts`, `apps/web/platform/billing/checkout/checkout-session-params.ts`, `apps/web/app/(workspace)/codebase/page.tsx`, `apps/web/app/(workspace)/review/_components/codebase-review-page.tsx`, `apps/web/platform/codex/`, `apps/web/app/api/codex/`, `apps/web/app/(workspace)/_components/codex-connection-card/`, `packages/codebase-compiler/AGENTS.md`, `packages/codebase-compiler/src/repo-generation/`, `packages/codebase-compiler/src/codebases/render-prompt-pack.ts`, `packages/codebase-compiler/src/server/template-loader.ts`, and generated-repo tests.

The 2026-05-04 codebase-support refresh inspected the current Codex app-server bridge, OpenAI Codex CLI/app-server docs, local `codex app-server --help`, local `codex exec --help`, checkout intent gaps, the screenshot-driven codebase setup concept, and the later package/update-channel discussion. It concluded that the highest-capability service should build around execution surfaces, with local runner mode as the default privacy-forward codebase path, always-on local workers as a Work phase after the first approved loop, and package/update-channel mechanics as later strategy after existing-codebase Crawl, Walk, and Work are proven.

The 2026-05-04 UX strategy refresh concluded that the first existing-codebase app flow should be `Homepage intent -> Checkout -> Existing Codebase Setup -> Pair Local Runner -> Run Doctor Pass -> Top 9 Findings -> Approve First Loop -> Run Proof -> Worker Home`. The setup design should use a left rail of `Setup`, `Doctor Pass`, `Findings`, `Loops`, and `Runs`; setup should include ChatGPT/Codex connection, local runner pairing, selected repo, privacy and sync controls, default open destination, runner status, and `Run doctor pass`; loop setup should appear only after a diagnosed finding; and the local runner should begin as a Bun-first CLI with local `.sbs/` state and sync preview rather than a repo-wide docs mutation.

The 2026-05-04 runner architecture refresh concluded that setup should split into Machine Setup and Project Setup; local GitHub CLI readiness should be required for the existing-codebase lane; SBS execution profiles should be installed as a marked `~/.codex/config.toml` block with diff, backup, and approval; the web app should receive daemon health and structured events through the hosted backend rather than editing local files directly; loops should be workflow packets rather than prompts; and deterministic probes such as `.sbs/codebase-intake.py` should run locally, produce sync-safe structured findings, and keep full Markdown reports local by default.

## Interfaces and Dependencies

This Program depends on root `AGENTS.md`, `support-codebases.md`, `package-discussion.md` as later strategy only, `.sbs/codebase-intake.py`, `.sbs/codebase-intake.README.md`, `docs/programs/PROGRAMS.md`, `docs/exec-plans/PLANS.md`, `docs/prompts/README.md`, `packages/codebase-compiler/AGENTS.md`, `packages/codebase-compiler/src/repo-generation/customer-safe-snapshot-contract.ts`, `packages/codebase-compiler/src/repo-generation/render-generalized-starter-files.ts`, `packages/codebase-compiler/src/repo-generation/render-starter-project-onboarding.ts`, `packages/codebase-compiler/src/repo-generation/render-starter-skills.ts`, `packages/codebase-compiler/src/repo-generation/starter-root-package-json.ts`, `apps/web/app/_content/home-page.ts`, `apps/web/app/_lib/home-page-render-model.ts`, checkout code under `apps/web/app/api/stripe/checkout/`, `apps/web/platform/billing/checkout/`, and `apps/web/app/checkout/success/`, `apps/web/platform/codex/app-server.ts`, `apps/web/platform/codex/app-server-contracts.ts`, `apps/web/app/(workspace)/_components/codex-connection-card/`, `apps/web/app/api/codex/`, future codebase setup, doctor-pass, findings-ledger, workflow-packet, loop-approval, runner-health, run-history, daemon, local runner, pairing, event relay, and CLI package surfaces, and generated repo materialization tests.
