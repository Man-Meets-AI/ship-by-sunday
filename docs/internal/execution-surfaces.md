# Execution Surfaces

This is the internal contract for Ship by Sunday's codebase execution surfaces. Use it before adding a paid loop, provider integration, customer handoff, or operator workflow that can inspect, run, or modify customer code.

The current rule is simple: no surface receives broader authority by implication. A customer must be able to see which surface is in use, what it may sync, what it may run, where source can be visible, who owns provider setup, how proof is delivered, and how the surface can be revoked or blocked.

This slice adds no new external setup. There are no new GitHub Apps, OAuth apps, provider secrets, environment variables, Vercel values, Convex values, callbacks, webhooks, or repository secrets to create for this contract refresh.

## Surface Summary

### `local_runner`

`local_runner` is the default privacy-forward existing-codebase lane. The customer runs the Ship by Sunday runner in their own repository and local Codex runs on the customer's machine.

Customer consent: Pairing the runner is explicit. Doctor-pass sync requires sync-preview approval. Write workflows require a workflow approval packet plus local terminal confirmation for the risky action named by the workflow.

Repo access and provider access: Ship by Sunday does not receive repository credentials in this mode. The customer's local machine owns Git, `gh`, Codex auth, package manager access, and provider CLIs. The hosted app receives only structured events and approved sync records.

Storage policy: Local `.sbs/` artifacts stay on the customer machine. The hosted app stores runner identity, setup state, approved findings, proof status, workflow ids, repo-relative refs, command names, blocked-proof summaries, and next recommendations. It does not store source clones, raw logs, secrets, Codex transcripts, or local absolute paths by default.

Command authority: Crawl is branchless and passive. Walk and Work commands run only from approved workflow packets. Package installs, migrations, provider CLIs, dependency changes, package script edits, background services, destructive Git operations, network escalation, raw-log sharing, raw-source sharing, and screenshots require later explicit approval.

PR authority: No branch push or pull request authority exists by default. Local workflows may create approved local branches. Pushing a branch or creating a pull request is a later approval and must name the repository, branch, proof status, and rollback or revoke path.

Raw-source visibility: Raw source stays local by default. Synced evidence refs may include repo-relative paths, line numbers, command names, artifact ids, titles, scores, and proof summaries. Source excerpts, full terminal logs, screenshots, and transcripts require explicit sharing approval.

Proof delivery: Local proof lives under `.sbs/runs/<workflow-run-id>/`. The hosted app receives structured proof status, proof command names, pass/fail/blocked states, touched repo-relative refs, and next recommendation metadata.

Revocation and failure states: Runner revocation stops new local events and future approvals for that runner. Missing auth, dirty worktree, expired write lease, unsafe branch, missing proof command, or missing provider setup must produce blocked proof instead of silent continuation.

Allowed sync: Structured findings, workflow status, proof metadata, blocked-proof metadata, repo-relative refs, and audit events after approval.

Forbidden sync without later approval: Raw source, source excerpts, full logs, secrets, local absolute paths, screenshots, Codex transcripts, source maps, provider dashboards, or cloned repository content.

### `codex_cloud_handoff`

`codex_cloud_handoff` is a future or manual customer-owned handoff into Codex cloud. Ship by Sunday may give the customer a workflow packet, findings context, proof expectations, and review checklist, but the customer owns Codex cloud and GitHub connector setup.

Customer consent: The customer chooses to use Codex cloud and connects repositories through their ChatGPT/Codex GitHub connector flow. Ship by Sunday must not represent that as hidden SBS repository access.

Repo access and provider access: Official Codex docs describe connecting repositories through the ChatGPT GitHub Connector or Codex GitHub App. They state that Codex uses short-lived, least-privilege GitHub App installation tokens for each operation and respects the user's existing repository permissions and branch protection rules. That access belongs to the customer-owned Codex setup, not to Ship by Sunday.

Storage policy: Ship by Sunday stores only the handoff packet, structured findings, proof requirements, and customer-provided proof links or summaries. Codex cloud storage, repository clone behavior, and GitHub connector authorization remain in the customer's OpenAI and GitHub accounts.

Command authority: Ship by Sunday cannot run Codex cloud commands, install dependencies, run CI-affecting commands, or mutate the repo from this surface. The handoff can recommend commands and proof expectations for the customer to run inside their own Codex cloud environment.

PR authority: Ship by Sunday has no pull request, branch push, CI rerun, or merge authority through this surface. Any pull request created by Codex cloud is customer-owned and governed by the customer's GitHub permissions and branch protections.

Raw-source visibility: Raw source visibility is between the customer, Codex cloud, and GitHub connector configuration. Ship by Sunday receives no raw source unless the customer separately shares it.

Proof delivery: Proof comes back as customer-provided links, summaries, commit refs, pull request refs, screenshots, or copied proof metadata, depending on what a later handoff flow explicitly asks the customer to return.

Revocation and failure states: The customer revokes Codex/GitHub connector access in ChatGPT, OpenAI, or GitHub. Missing connector installation, insufficient repo permissions, branch protection, Codex cloud quota, or customer refusal should become blocked handoff proof.

Allowed sync: Handoff packet ids, structured findings, proof checklist status, customer-returned proof refs, and customer-provided summary metadata.

Forbidden sync without later approval: Raw source, full Codex transcripts, hidden GitHub access tokens, provider secrets, full cloud logs, or automatic branch or pull request actions by Ship by Sunday.

### `managed_github`

`managed_github` is a premium or concierge surface. The current product implements consent and audit state only; it does not execute GitHub operations.

Customer consent: The customer must request concierge review for a selected GitHub repository. Later execution still requires explicit approval for the specific action, such as source inspection, branch creation, pull request creation, proof command, CI rerun, or source sharing.

Repo access and provider access: The consent packet is selected-repository only. The initial permissions named by the current UI are metadata/read, contents/read, pull request write, checks/read, actions/read, and statuses/read as the maximum planned envelope, not an installed token in this slice.

Storage policy: The planned clone policy is ephemeral until delivery or revocation. The hosted app stores consent status, repository label, selected-repo scope, proof metadata, pull request refs when later approved, and audit events. Ship by Sunday must not store customer secrets.

Command authority: Consent alone grants no command execution. Proof commands, CI commands, branch creation, pull request creation, source inspection, and raw-source sharing require later visible approval naming the action and scope.

PR authority: Branch creation, pull request creation, and CI reruns are approval-required. Merge authority is never granted.

Raw-source visibility: Assigned concierge operators may inspect source only after consent and only for the selected scope. Raw-source sharing and transcript storage remain disabled until explicit sharing approval.

Proof delivery: Proof can include structured proof status, proof command names, blocked-proof notes, branch refs, and pull request refs after later action approval. Raw logs and source excerpts require separate sharing approval.

Revocation and failure states: Revocation stops managed GitHub eligibility and requires a new consent packet before use resumes. Missing GitHub App installation, insufficient permissions, branch protection, dirty or conflicting branch state, failed proof command, or refused raw-source approval must become blocked proof.

Allowed sync: Consent status, selected repository label, installation-scope metadata, audit events, proof metadata, branch refs, and pull request refs after approval.

Forbidden sync without later approval: Broad organization access, unselected repositories, hidden tokens, raw source, full logs, secrets, automatic branch pushes, automatic pull request creation, automatic CI reruns, or merge actions.

### `generated_repo`

`generated_repo` is the generated-codebase delivery lane for customers who start from an idea. Ship by Sunday generates a customer-owned starter repository artifact from product truth and generated operating-pack contracts.

Customer consent: The customer enters the generated-codebase flow through checkout or protected app access and reviews the generated codebase at `/review` before download or handoff.

Repo access and provider access: Ship by Sunday does not inspect an existing customer repo in this lane. Provider setup is whatever the generated app docs ask the customer to create after review, such as Stripe, Clerk, Convex, Vercel, or PostHog setup.

Storage policy: Ship by Sunday stores product facts, generated artifact state, review readiness, and download metadata. Generated customer repositories exclude internal Program archives, internal ExecPlan archives, operator history, local secrets, and `.codex/**`.

Command authority: The app compiles and packages generated code from owned source templates. It does not run commands inside an existing customer repo, install customer dependencies, run customer migrations, or use customer provider accounts.

PR authority: No customer repository pull request authority exists unless a later generated-repo publication flow explicitly asks for it and documents repository access.

Raw-source visibility: The generated source is produced by Ship by Sunday and is intentionally visible to the customer at review and download. It is not raw source from an existing customer repo.

Proof delivery: Proof is generated-codebase readiness: generated files, Build Pack readiness, review/download handoff, generated Program/ExecPlan validators, package scripts, and compiler tests.

Revocation and failure states: Access revocation or missing entitlement blocks review/download. Missing generated facts, failed compiler validation, or unsafe generated artifacts should block delivery until fixed.

Allowed sync: Product truth, generated artifact metadata, review readiness, generated repo files, and customer-safe operating-pack outputs.

Forbidden sync without later approval: Existing customer source, provider secrets, internal Ship by Sunday archives, completed internal ExecPlans, release evidence, operator notes, hidden postinstall mutation, or customer account tokens.

### `codex_app_server`

`codex_app_server` is the current paid-user in-app Codex connection surface. It supports account status and generation flows through `codex app-server`; it is not the default existing-codebase doctor-pass or repair executor.

Customer consent: Paid users explicitly connect their ChatGPT/Codex subscription in the app. This does not grant existing-repo repair authority, GitHub access, or managed execution rights.

Repo access and provider access: The current surface is app-server account and generation oriented. It does not receive existing customer repository access, GitHub installation scope, provider dashboards, or provider secrets by default.

Storage policy: The implementation stores per-user Codex state under a hashed home directory and records account status plus rate-limit snapshots in Convex. Production on Vercel remains disabled unless `CODEX_APP_SERVER_ENABLED` is explicitly enabled.

Command authority: App-server generation commands are limited to the existing in-app generation contract. They must not become package installs, migrations, provider CLI runs, branch pushes, pull request creation, or CI-affecting commands without a later approved execution-surface expansion.

PR authority: No branch, pull request, CI rerun, or merge authority exists in this surface.

Raw-source visibility: Do not route existing customer repo source through this surface by default. Any later source-sharing bridge requires explicit approval, storage rules, transcript policy, and proof boundaries.

Proof delivery: Current proof is account connection, rate-limit status, and generated output flow behavior. Existing-codebase proof belongs to local runner, managed GitHub, or a later named handoff.

Revocation and failure states: Missing app-server binary, disabled production flag, expired account, rate limits, failed startup, or unavailable transport should fail the app-server feature without falling back to hidden repo execution.

Allowed sync: Account status, app-server health, rate-limit snapshots, and generated-output metadata already supported by the app-server flow.

Forbidden sync without later approval: Existing repo source, raw logs, Codex transcripts, provider secrets, GitHub tokens, branch pushes, pull request refs, CI actions, or managed repair outputs.

## Future Change Checklist

Before a future slice changes any execution surface, update this document and the customer-facing surface that exposes the boundary. The change must name:

- customer consent text and where it appears
- repository access and installation scope
- provider access and setup owner
- storage policy and retention
- command authority and forbidden commands
- pull request, branch, CI, and merge authority
- raw-source and transcript visibility
- proof delivery and blocked-proof shape
- audit log and revocation behavior
- exactly what may sync to Ship by Sunday

If a future change adds external setup, document what to create, where to create it, exact scopes or permissions, environment ownership, where values are stored, how to verify it, and what failure looks like when missing or misconfigured.
