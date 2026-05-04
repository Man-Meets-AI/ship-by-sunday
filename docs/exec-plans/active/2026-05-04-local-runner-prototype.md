---
title: Local Runner Prototype
status: active
created_at: 2026-05-04
completed_at: null
summary: Build the Bun-first local runner prototype that pairs an existing repo with Ship by Sunday, checks local readiness, manages SBS Codex profiles safely, and exposes daemon and one-shot execution boundaries.
post_build_recap: The prototype now ships a Bun-first `packages/local-runner` package named `ship-by-sunday`, narrow token-authenticated runner pair/event API routes, repo-local non-secret `.sbs/` state, user-home runner credentials, sync-safe queued event delivery, setup checks, Codex config preview/apply, foreground daemon, one-shot, and a tested `codex exec --json` wrapper boundary.
program_id: customer-agentic-operating-system
planning_brief: docs/programs/active/2026-05-02-customer-agentic-operating-system/planning-brief-2.md
read_when:
  - Implementing `bunx ship-by-sunday setup pair <token>` or the local runner package.
  - Designing local `.sbs/` state, runner pairing, daemon mode, one-shot mode, `gh` readiness, SBS Codex profiles, or Codex config patching.
  - Verifying that the runner prototype stays separate from doctor-pass probes, findings upload, workflow approval, managed GitHub, and worker queues.
---

# Local Runner Prototype

This is a living execution plan. Keep it current as implementation, validation, discoveries, and decisions change.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Existing-codebase setup becomes real only when the customer can run one local command in their repo and see Ship by Sunday detect a paired runner. After this change, a customer should be able to run `bunx ship-by-sunday setup pair <token>` from a repository, have the command write safe local runner state, verify Machine Setup and Project Setup readiness, install or preview the SBS-managed Codex profile block with explicit approval, start a foreground daemon or bounded one-shot fallback, and send sync-safe status events to the hosted app.

The visible proof is not a full doctor pass. The proof is that the runner can pair, identify the repo, check `codex`, `gh`, Git, package manager, and safe command readiness, produce local `.sbs/` state without committing secrets, send heartbeat and setup events through the hosted backend, and construct the right `codex exec` invocation boundary for later doctor and workflow plans. This plan deliberately excludes passive probes, Top 9 findings, workflow approval, branch creation, PR delivery, managed GitHub, and recurring worker queues.

## Progress

- [x] 2026-05-04 EDT: Created this child ExecPlan from `planning-brief-2.md`.
- [x] 2026-05-04 EDT: Reviewed local Codex source under `~/Developer/codex` for `codex exec` JSONL behavior, app-server transports and protocol, config/profile/trust handling, auth storage, and package validation patterns.
- [x] 2026-05-04 EDT: Inspected root package/workspace structure, current `packages/*`, removed helper CLI history, Codex app-server platform code, `.sbs/codebase-intake.README.md`, workspace data/events outputs, setup UI outputs, Convex guidelines, Next route handler docs, and release workflow rules immediately before implementation.
- [x] 2026-05-04 EDT: Created `packages/local-runner` as a new package with `ship-by-sunday` binary shape, TypeScript config, Vitest config, explicit command parser, source entrypoint, and package smoke script. The retired helper CLI was not recreated.
- [x] 2026-05-04 EDT: Implemented `setup pair`, `setup check`, foreground `daemon start/status/stop`, and `one-shot`; repo-local non-secret `.sbs/config.json`; local `.sbs/` ignore protection through `.sbs/.gitignore` plus `.git/info/exclude`; user-home `~/.ship-by-sunday/runner/credentials.json` with restrictive mode; sync-safe event outbox retry; Machine Setup checks; Project Setup checks; and `gh` readiness checks.
- [x] 2026-05-04 EDT: Implemented Codex readiness checks, SBS managed `~/.codex/config.toml` block inspection, parse-backed preview, timestamped backup, apply, rollback, and explicit preservation of Codex `untrusted` project state. The prototype does not read Codex credential values.
- [x] 2026-05-04 EDT: Implemented the `codex exec --json` wrapper with command-array construction, stdin prompt input, timeout handling, stderr as local diagnostics, JSONL event parsing, `thread.started.thread_id` capture, and final `agent_message` JSON parsing when `--output-schema` is used.
- [x] 2026-05-04 EDT: Added narrow hosted backend bridge routes `POST /api/workspace/runner/pair` and `POST /api/workspace/runner/events`, with Convex mutations for pairing by setup token and event ingestion by hashed runner credential. The raw runner token is returned only once to the CLI and is never sent to Convex or stored in `.sbs/`.
- [x] 2026-05-04 EDT: Updated package naming so the monorepo root stays private as `ship-by-sunday-site`, while the local runner workspace package owns the customer-visible `ship-by-sunday` package name. Updated `bun.lock` with the new workspace.
- [x] 2026-05-04 EDT: Focused local runner validation passed: `bun run --cwd packages/local-runner test`, `bun run --cwd packages/local-runner lint`, `bun run --cwd packages/local-runner typecheck`, `bun run --cwd packages/local-runner format:check`, `bun run --cwd packages/local-runner build`, `bun run --cwd packages/local-runner ship-by-sunday -- --help`, and `bun run --cwd packages/local-runner package:smoke`.
- [x] 2026-05-04 EDT: Focused app validation for touched API/Convex surfaces passed: `bun run --cwd apps/web test:unit -- tests/unit/workspace-data-model.test.ts tests/unit/workspace-runner-events.test.ts`, `bun run --cwd apps/web test:integration -- tests/integration/workspace-runner-api.test.ts`, `bun run --cwd apps/web lint`, and `bun run --cwd apps/web typecheck`.
- [x] 2026-05-04 EDT: Planning and diff validation passed: `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-04-local-runner-prototype.md`, `bun run programs:lint`, `bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-04-local-runner-prototype.md docs/programs/active/2026-05-02-customer-agentic-operating-system support-codebases.md`, and `git diff --check`.
- [x] 2026-05-04 EDT: Fixed review findings after implementation review. Runner credential hashes are now redacted from public workspace state, setup pairing tokens are consumed on first bind, `setup pair` refuses a different local pairing token unless `--repair` is explicit, setup probes use bounded subprocess timeouts, the managed Codex block uses current `[profiles.<name>]` plus nested `[permissions.<name>.filesystem/network]` schema, `codex exec` thread ids persist under local `.sbs/runs/`, and package smoke exercises packed `bunx --package <tgz>` plus `npx --package <tgz>` command paths.
- [x] 2026-05-04 EDT: Review-fix focused validation passed: `bun run --cwd packages/local-runner test`, `bun run --cwd packages/local-runner lint`, `bun run --cwd packages/local-runner typecheck`, `bun run --cwd packages/local-runner format:check`, `bun run --cwd packages/local-runner build`, `bun run --cwd packages/local-runner ship-by-sunday -- --help`, `bun run --cwd packages/local-runner package:smoke`, `bun run --cwd apps/web test:unit -- tests/unit/workspace-data-model.test.ts tests/unit/workspace-runner-events.test.ts`, `bun run --cwd apps/web test:integration -- tests/integration/workspace-runner-api.test.ts`, `bun run --cwd apps/web lint`, and `bun run --cwd apps/web typecheck`.
- [x] 2026-05-04 EDT: Review-fix planning and repo validation passed: `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-04-local-runner-prototype.md`, `bun run programs:lint`, `bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-04-local-runner-prototype.md docs/programs/active/2026-05-02-customer-agentic-operating-system support-codebases.md`, `bun run format:check`, `bun lint`, `bun typecheck`, and `git diff --check`.

## Surprises & Discoveries

The current repository no longer has `packages/ship-by-sunday-cli` or `bin/sbs`. Historical completed Program records under `docs/programs/completed/2026-04-24-sbs-codex-release-reset/` explain that the old helper CLI was retired. This runner must be a new customer-facing local execution package, not a revival of the retired generated-repo helper CLI.

Official OpenAI Codex docs checked through the OpenAI developer documentation MCP on 2026-05-04 confirmed the implementation constraints this plan relies on. `codex exec` is the scripted or CI-style path for non-interactive runs; it supports `--cd`, `--json`, `--output-schema`, `--profile`, `--sandbox`, `--config`, and prompt input. Codex user config lives in `~/.codex/config.toml`; project-scoped `.codex/config.toml` is loaded only for trusted projects. Sandbox mode and approval policy are separate security layers, and CLI/IDE defaults restrict network and workspace writes unless configured otherwise.

Local Codex source confirmed that `codex exec --json` emits newline-delimited events to stdout and sends non-event diagnostics to stderr. The event model includes thread, turn, item, command execution, file change, and error events. `--output-schema` constrains the final assistant output, but the runner still has to parse the final `agent_message` text as JSON and validate it against the SBS schema. The wrapper should store `thread.started.thread_id` and resume exact threads when needed; automation should not depend on `resume --last`. `--ephemeral` is appropriate only for runs that intentionally have no resume/history requirement.

Local Codex source also confirmed that `ConfigProfile` and permission profiles are separate concepts. SBS profile names such as `sbs-doctor-readonly` belong under `[profiles.<name>]` for model, reasoning, tools, and approval posture, while granular filesystem and network posture belongs under root-level `[permissions.<name>]` plus `default_permissions` or runtime permission selection. Project-local `.codex/config.toml` cannot set important user-level profile, provider, notify, or endpoint fields because Codex strips those keys until trust and denylist rules allow only safe project config.

Codex project trust is path-sensitive and should be respected. The runner may explain and request trust for the canonical repository root when a write-capable workflow needs it, but it must not blindly override an explicit `untrusted` state. Read-only doctor-pass execution should work without requiring project trust; workspace-write or branch workflows can ask for trust or use explicit runtime permissions after approval.

Codex auth storage is also user machine state. `cli_auth_credentials_store` may be `file`, `keyring`, `auto`, or `ephemeral`; successful keyring storage can remove the fallback `auth.json`. Setup checks can detect storage mode and warn about file-based credential storage, but the runner must not read credential values, sync auth files, or promise that a `codex-config` backup contains portable credentials.

Codex package tests validate the customer-visible packaged command, not only source entrypoints. The local runner should copy that bar: stage or pack the runner package, invoke the packed binary through the same command shape the customer will run, test against a structured fake pairing API, assert durable local state, and prove idempotence.

Implementation found that the workspace backend already generated setup pairing tokens but did not have a token-authenticated local-runner bridge. The prototype added only the narrow missing surface: a pair route that converts a one-time setup token into a runner credential, and an events route that authenticates by hashing the bearer credential before delegating to Convex.

The TOML manager stayed dependency-free for this prototype. It uses a small structural parser for table and assignment syntax before replacing only the SBS-owned marker block. That is enough for the current managed block and tests, but a future broader Codex config editor should use a full TOML parser before touching arbitrary user config.

The package-name collision called out in this plan was real. The monorepo root package was renamed back to the private `ship-by-sunday-site` identity already reflected in `bun.lock`, and the new runner workspace package owns the customer-visible `ship-by-sunday` package name.

The local runner intentionally writes `.git/info/exclude` in the paired repository when a Git checkout is present. This keeps `.sbs/` local without editing customer root `.gitignore`; `.sbs/.gitignore` remains as a second guard inside the state directory.

The review pass found that a stored runner credential hash must be treated as a bearer-equivalent secret. Public setup and project state now return redacted runner binding documents, and the browser no longer receives `runnerCredentialHash`.

The review pass also exposed that package smoke was not proving the customer install path. `package:smoke` now creates a tarball with `bun pm pack` and executes pairing through both `bunx --package <tgz> ship-by-sunday ...` and `npx --package <tgz> ship-by-sunday ...`; direct `dist/cli.js` execution is no longer the package proof.

## Decision Log

Decision: Create a new local runner package instead of reviving the retired helper CLI.
Rationale: The old `packages/ship-by-sunday-cli` surface was removed from active code and docs. The existing-codebase runner has different responsibilities: pairing a customer machine, checking local readiness, relaying events, managing local `.sbs/` state, and invoking Codex safely. Reusing retired helper CLI assumptions would mix generated-repo draft tooling with local existing-codebase execution.
Date: 2026-05-04

Decision: Preserve the target setup command shape as `bunx ship-by-sunday setup pair <token>`, with `npx ship-by-sunday setup pair <token>` as fallback.
Rationale: The setup UI needs one short command that feels normal to copy. The package implementation should be shaped for that command even if public npm publishing is a later release step. If the implementation needs to rename the private monorepo root package to avoid a workspace package-name collision, it should do so explicitly and update the lockfile.
Date: 2026-05-04

Decision: Default to a foreground user-space daemon in the prototype, with one-shot mode as a bounded fallback.
Rationale: A persistent daemon gives the web UI live heartbeat, setup status, event retry, and future approved workflow capability. For the prototype, foreground daemon mode is enough; launchd, systemd, login items, auto-start installers, and background service managers can wait. One-shot mode exists for blocked environments and exits after setup checks and the later doctor pass path.
Date: 2026-05-04

Decision: Keep secrets out of repo-local `.sbs/` files.
Rationale: `.sbs/` will hold local reports and runner metadata that may include sensitive repo facts. Durable runner credentials should live under a user-owned runner home such as `~/.ship-by-sunday/runner/` with restrictive file permissions or a later keychain implementation. Repo-local `.sbs/config.json` should contain non-secret project and runner metadata only, and the runner should add local ignore protection without editing root project files unless approved.
Date: 2026-05-04

Decision: Manage only an SBS-marked block in `~/.codex/config.toml` during Crawl.
Rationale: User Codex config is personal machine state. The runner may preview, back up, apply, verify, and rollback an SBS-managed block for profiles, permissions, sandbox, and approval posture, but it must preserve everything outside the markers. Whole-config optimization is later.
Date: 2026-05-04

Decision: Use `codex exec` as the local Codex execution boundary.
Rationale: Official Codex docs identify `codex exec` as the non-interactive scripted path, with flags for workspace root, JSON events, output schema, profile, and sandbox. This lets SBS workflow packets run local Codex through explicit profiles instead of depending on the experimental app-server path.
Date: 2026-05-04

Decision: Treat `codex exec --json` JSONL as the first automation contract, and treat direct app-server relay as a later daemon capability.
Rationale: Local source shows `codex exec` already starts an in-process app-server client, emits a typed JSONL event stream, supports output schemas, and gives SBS a narrow process boundary. Direct app-server integration is more powerful, but it requires initialize handshakes, bidirectional JSON-RPC routing for server requests, thread-scoped subscriptions, auth, reconnect behavior, and careful transport choice. Crawl can move faster and safer through `codex exec`; Work and Run can add an SBS daemon relay later.
Date: 2026-05-04

Decision: Model SBS Codex setup as named Codex profiles plus named permission profiles.
Rationale: Codex source separates `[profiles.<name>]` from `[permissions.<name>]`, and custom permission profiles require explicit selection through `default_permissions` or runtime permission selection. SBS should not overload one profile table with both model behavior and filesystem/network policy.
Date: 2026-05-04

Decision: Respect Codex project trust and explicit untrusted state.
Rationale: Codex computes trust by canonical project or Git root path, disables project-local config for unknown or untrusted projects, and preserves explicit `untrusted`. SBS setup can request trust when a write-capable workflow needs it, but read-only Crawl should not make trust mutation a prerequisite.
Date: 2026-05-04

Decision: Validate the packed local runner command before advertising setup copy.
Rationale: Codex's package workflow proves the installed command path, subprocess behavior, and durable artifacts. SBS should stage or pack `ship-by-sunday`, run the customer-visible pairing command against a fake backend, and inspect outbound requests and local state before the setup UI treats the command as ready.
Date: 2026-05-04

Decision: Require `gh` readiness for existing-codebase runner setup.
Rationale: The product wants PR handoff, private `codex-config` backup, branch review, and eventual GitHub proof. Even if Crawl can diagnose without pushing, the local runner should identify missing or unauthenticated `gh` early so the customer understands which later handoffs are blocked.
Date: 2026-05-04

Decision: Send runner events through the hosted backend, never directly to the browser.
Rationale: The web UI should derive state from durable backend rows and sync-safe events. The browser should not read customer files, call the daemon over localhost, or receive raw terminal streams.
Date: 2026-05-04

Decision: Add token-authenticated Next route handlers for runner pairing and event ingestion.
Rationale: Setup tokens existed in Convex state, but the local runner cannot rely on Clerk browser auth. The narrow bridge lets `setup pair <token>` exchange a setup token for a runner credential, then sends events through `POST /api/workspace/runner/events` with a bearer token that is hashed before Convex sees it.
Date: 2026-05-04

Decision: Treat setup pairing tokens as one-use and runner credential hashes as server-only.
Rationale: A hashed runner credential can authenticate event ingestion if exposed, so public workspace state must redact it. Setup tokens must also be consumed after the first successful bind so replay cannot rotate or invalidate the durable runner credential.
Date: 2026-05-04

Decision: Require explicit `setup pair --repair` before replacing an existing local runner credential with a different setup token.
Rationale: Pairing is idempotent only when the same local setup token digest and runner credential are already present. A different token may represent another project or a repair operation, so the CLI must fail closed unless the user explicitly asks to repair stale or revoked credentials.
Date: 2026-05-04

Decision: Keep the local runner package dependency-free for the prototype.
Rationale: The required surface can be implemented with Bun/Node built-ins and the repo's existing TypeScript/Vitest/Oxlint/Oxfmt toolchain. Avoiding a CLI parser or TOML dependency keeps the first package smaller, while tests still prove command parsing, structured config block replacement, and package smoke behavior.
Date: 2026-05-04

Decision: Rename the private monorepo package identity to `ship-by-sunday-site` and reserve `ship-by-sunday` for the local runner workspace package.
Rationale: The customer setup command depends on `bunx ship-by-sunday`. The monorepo root is private and already had `ship-by-sunday-site` in the lockfile, so the public package name should belong to the runner package instead of the repository root.
Date: 2026-05-04

## Outcomes & Retrospective

Implemented the Local Runner Prototype end-to-end for the current Crawl boundary. The actual package is `packages/local-runner` with package name `ship-by-sunday` and binary `ship-by-sunday`. The implemented commands are `setup pair <token>`, `setup check`, `setup check --codex-config-preview`, `setup check --apply-codex-config`, `daemon start/status/stop`, and `one-shot`.

Repo-local state now lives under `.sbs/` and intentionally stores no runner token. The durable token lives in the user-owned runner home at `~/.ship-by-sunday/runner/credentials.json` by default, with `SBS_RUNNER_HOME` override support and restrictive file permissions where the platform supports them. Event delivery uses `.sbs/events/outbox.jsonl`, retrying failed sync-safe events until the hosted endpoint accepts them.

The hosted bridge is `POST /api/workspace/runner/pair` and `POST /api/workspace/runner/events`. Pairing stores only a hashed runner credential in Convex, consumes the setup pairing token on first bind, and redacts the stored hash from public workspace state. Event ingestion authenticates by hashed bearer token and reuses the existing workspace event validation and derived-state path.

The SBS Codex config block currently installs `sbs-doctor-readonly`, `sbs-workspace-write`, `sbs-readonly`, and `sbs-workspace-write` profile/permission entries using profile-level sandbox/default permission selection plus nested filesystem and network permission tables. Broader Crawl profiles such as proof, PR delivery, and network-needed remain future expansion; this slice proved the safe preview/apply/backup/rollback boundary and Codex untrusted-state preservation.

The prototype intentionally does not implement doctor-pass probes, Top 9 findings, sync preview generation, workflow approval, branches, PRs, write leases, managed GitHub, launchd/systemd installers, keychain storage, or public package publishing. Those remain in later ExecPlans.

## Context and Orientation

The repository is a Bun monorepo with root `package.json` workspaces for `apps/web` and `packages/*`. The web app lives in `apps/web`, generated-repo compiler code lives in `packages/codebase-compiler`, and there is no active runner package today. Historical completed docs mention a removed `packages/ship-by-sunday-cli`; those records are history and must not be treated as current package structure.

The current in-app Codex account surface is separate from the local runner. `apps/web/platform/codex/app-server.ts`, `apps/web/platform/codex/app-server-service.ts`, and `apps/web/platform/codex/app-server-contracts.ts` spawn `codex app-server` for paid-user account and generation flows on compatible server runtimes. That surface can tell the app about ChatGPT/Codex connection state, but it does not scan a customer's local repo, manage `.sbs/` state, patch `~/.codex/config.toml`, or run local `codex exec` jobs inside the customer's project.

The scratch deterministic scanner lives at `.sbs/codebase-intake.py` with `.sbs/codebase-intake.README.md`. It is useful context for later doctor-pass probes, but this plan does not productize it. The runner can copy or stage it only in a later `doctor-pass-and-sync-preview` plan. This prototype may define where scanner artifacts will live, such as `.sbs/reports/`, but it should not implement Top 9 findings or Markdown report generation.

The existing-codebase backend data contract is owned by `docs/exec-plans/active/2026-05-04-existing-codebase-workspace-data-model-and-events.md`. That plan defines workspace projects, runner bindings, repository bindings, doctor-pass runs, findings, workflow runs, and sync-safe runner events. The setup UI contract is owned by `docs/exec-plans/active/2026-05-04-existing-codebase-setup-ui.md`. This runner plan should implement the local side of those contracts and should update the upstream plans if the needed pairing token, event ingestion, or setup-health shape is missing.

OpenAI Codex configuration must follow official docs as checked through the OpenAI developer docs MCP. User-level config is `~/.codex/config.toml`. Project `.codex/config.toml` layers are loaded only after project trust. `codex exec` is the non-interactive execution command, and sandbox plus approval policy are the relevant safety controls. The runner must not rely on `codex app-server` as the local execution foundation.

Before implementation changes `apps/web`, read `apps/web/AGENTS.md`; before Convex changes, read `apps/web/convex/_generated/ai/guidelines.md`; before package or compiler changes, read the nearest package `AGENTS.md`; before changing Codex-specific behavior, use the OpenAI developer docs MCP again and refresh this plan if docs changed.

### In Scope

This plan includes a new local runner package, package manifest and binary shape, command parser, pairing command, setup check command, foreground daemon command, one-shot command shape, local state layout, local ignore protection, event client, event outbox retry, Machine Setup checks, Project Setup checks, `gh` readiness checks, Codex availability checks, Codex config inspection, SBS-managed Codex profile patch preview, backup, apply, verify, drift detection, rollback, and a testable `codex exec` wrapper.

The package should be shaped for `bunx ship-by-sunday setup pair <token>`. If a workspace package named `ship-by-sunday` conflicts with the current private root package name, implementation should either rename the root package to a monorepo-specific private name or update this plan and the setup UI plan with a scoped package command before shipping customer copy. Do not silently publish the wrong command.

The first runner commands should cover `setup pair`, `setup check`, `daemon start`, `daemon status`, `daemon stop`, `one-shot`, and a Codex boundary smoke or dry-run command. Exact command spelling can change during implementation if tests and setup UI are updated together, but the customer-facing pairing command stays the anchor.

The runner should write repo-local non-secret state under `.sbs/`, such as `.sbs/config.json`, `.sbs/status.json`, `.sbs/events/outbox.jsonl`, `.sbs/reports/`, and `.sbs/runs/`. Durable runner credentials and tokens should live outside the repo under a per-user runner home with restrictive permissions. The runner should protect `.sbs/` from accidental commits with local ignore behavior and clear terminal output.

### Out Of Scope

This plan does not implement doctor-pass probes, `codebase-intake` JSON output, local Markdown reports, sync preview generation, findings upload, Top 9 findings UI, `/workspace/doctor-pass`, `/workspace/findings`, `/workspace/findings/[findingId]`, workflow approval sheets, workflow packets, write leases, branch creation, PR delivery, managed GitHub, recurring worker queues, package/update-channel mechanics, or generated-repo operating pack work.

This plan does not install launchd agents, systemd services, login items, background auto-start daemons, operating-system keychain integration, public npm publishing, package signing, self-update channels, or cross-platform installers. The prototype can define future hooks for those behaviors, but it should prove the foreground daemon and one-shot paths first.

This plan must not read Codex credential contents, sync raw source, sync raw terminal logs, sync local absolute paths, sync secrets, or sync Codex transcripts. It must not edit root `AGENTS.md`, root `.gitignore`, package scripts, lockfiles, app source, provider configs, migrations, or project docs inside the customer's repo during Crawl unless a later approved workflow owns that mutation.

## Plan of Work

Start by creating the package surface. Add a new workspace package under `packages/local-runner/` with a TypeScript source tree, package scripts for build, test, lint, format, and typecheck, and a binary named `ship-by-sunday`. Keep the command parser small and explicit, using the existing Bun and TypeScript toolchain before adding parser dependencies. If the package needs a TOML parser to safely validate Codex config, add one narrow dependency to that package and update the lockfile in the same change.

Next, implement local state and pairing. `setup pair <token>` should discover the current Git repository root, validate that the token is present and not malformed, call the backend pairing endpoint defined by the workspace data/events slice, receive a runner binding, write non-secret repo-local metadata to `.sbs/config.json`, write secret runner credentials outside the repo, add local ignore protection for `.sbs/`, emit `runner.paired`, and either start the foreground daemon or explain the next command. Pairing must be idempotent: rerunning with the same project should update stale metadata safely, while pairing a different project into the same repo should require explicit confirmation.

Then implement setup checks. Machine Setup should check that `codex` exists, `codex exec --help` is available, ChatGPT/Codex auth appears available without reading credential contents, `gh` exists, `gh auth status` succeeds, `~/.codex/config.toml` is readable or can be created with approval, SBS profiles are installed or pending, and daemon health is known. Project Setup should check that the current directory is a Git repository, a remote exists, dirty state is detected, package manager and scripts are detected, `.sbs/` state is present, safe read-only mode is available, and proof-command candidates can be listed without running them.

After setup checks, implement the Codex config manager. It should render the intended SBS-managed TOML block for `sbs-doctor-readonly`, `sbs-proof`, `sbs-loop-branch`, `sbs-pr-delivery`, and `sbs-network-needed`; show a diff; create a timestamped local backup; apply only between SBS markers after explicit terminal confirmation; verify the resulting config can still be parsed or accepted by Codex; detect drift on later checks; and rollback to the backup on failure. It should warn when file-based `auth.json` or file-based MCP OAuth storage is detected, recommend keychain or keyring storage, and never print or read credential values.

The config manager must parse and rewrite TOML structurally, preserving unrelated user keys and comments where practical. If comment markers are used to make the SBS-owned section human-readable, they are ownership hints, not a substitute for parsing. The intended config should use `[profiles.<name>]` for SBS model, reasoning, tools, sandbox, and approval defaults, and root-level `[permissions.<name>]` for filesystem and network permission posture. If a custom permissions table is installed, the resulting config must include a valid `default_permissions` or the runtime command must select the intended permission profile explicitly. Setup should run verification from the actual canonical repo root so Codex project trust and project-local layers are evaluated the same way the later runner will evaluate them.

Next, implement daemon and one-shot boundaries. The daemon can be a foreground long-running process in the prototype. It should load local state, send heartbeat events, flush the sync-safe event outbox, recompute setup health on request, and expose status through the hosted backend rather than through a browser-local socket. One-shot mode should pair if needed, run setup checks, flush events, and exit; later doctor-pass behavior can plug into the same one-shot command in the next plan.

The future app-server daemon path should be designed but not required for Crawl. If Work later needs live browser control, the browser should connect to the SBS daemon or hosted backend, not directly to Codex app-server. The SBS daemon can then bridge to Codex over stdio, loopback websocket, or preferably a private Unix socket on macOS/Linux. That relay must send `initialize` once per connection, preserve bidirectional JSON-RPC for approvals and elicitation, route events by thread and turn id, handle reconnect or resume explicitly, and terminate connection-scoped command executions on disconnect.

Then implement the `codex exec` wrapper as an execution boundary, not a full workflow engine. The wrapper should build command arrays such as `codex exec --cd <repoRoot> --profile sbs-doctor-readonly --sandbox read-only --json --output-schema <schemaPath> -`, feed prompt text through stdin when needed, parse newline-delimited JSON events, enforce timeouts, redact prompts and local paths from synced events, and write full local output only under `.sbs/runs/`. Unit tests should use a fake Codex binary and must not require a real ChatGPT/Codex login.

The wrapper should accept both `--json` and its `--experimental-json` alias in tests because Codex supports both, but customer commands should use `--json`. It should treat stdout as the JSONL event stream and stderr as local diagnostics. It should parse events defensively by `type`, persist `thread_id` from `thread.started`, track `turn.completed` and `turn.failed`, and parse the final assistant message text as the schema-constrained output. It should avoid `--skip-git-repo-check` except for intentional non-Git smoke fixtures, avoid `--dangerously-bypass-approvals-and-sandbox`, and use `--ephemeral` only for no-resume diagnostic runs. Because headless `codex exec` defaults approval to non-interactive behavior, SBS profiles and prompts must not assume a human approval prompt will appear mid-run.

Finally, wire validation and docs. Add focused tests for command parsing, repo root detection, local state writes, idempotent pairing, event outbox retry, setup checks with mocked binaries, Codex config diff/apply/rollback, Codex wrapper spawn behavior, and package binary execution. Update `support-codebases.md`, this Program, route/setup docs if command spelling changes, and any package docs needed for the future customer setup contract.

Package validation must include a packed-artifact smoke, not only `bun run` against the source tree. The smoke should run in a temp Git repo with a fake pairing API, fake or mocked `codex`, fake or mocked `gh`, isolated `SBS_HOME`, isolated `CODEX_HOME`, and assertions for invalid token, expired token, wrong repo root, network failure, already-paired state, duplicate rerun idempotence, no secret leakage, and durable local file permissions where the platform supports them.

## Milestones

The first milestone is package and command shape. It is complete when `packages/local-runner` exists, the binary can print help, tests can invoke the command parser, and the package is shaped for the eventual `bunx ship-by-sunday setup pair <token>` customer command without depending on the retired helper CLI.

The second milestone is pairing and local state. It is complete when `setup pair <token>` can pair against a mocked backend, write non-secret `.sbs/` metadata, keep credentials outside the repo, protect `.sbs/` from accidental commits, emit `runner.paired`, and rerun idempotently.

The third milestone is setup checks. It is complete when `setup check --json` returns Machine Setup and Project Setup statuses with `blocked`, `warning`, and `ready` rows for Codex, `gh`, Git, package manager, dirty state, command map, and safe read-only posture.

The fourth milestone is Codex profile management. It is complete when the runner can preview, back up, apply, verify, detect drift, and rollback an SBS-managed `~/.codex/config.toml` block while preserving everything outside the markers.

The fifth milestone is daemon and one-shot prototype. It is complete when a foreground daemon can heartbeat and flush sync-safe events, and one-shot mode can pair, check readiness, flush events, and exit cleanly.

The sixth milestone is `codex exec` boundary proof. It is complete when the runner can construct and run a mocked `codex exec` command with the right `--cd`, `--profile`, `--sandbox`, `--json`, and optional `--output-schema` flags, parse JSON events, time out cleanly, and keep full output local.

The seventh milestone is packed command proof. It is complete when the runner package can be staged or packed and the customer-visible command can run against a temp repo and fake backend without importing source-only paths.

The eighth milestone is validation and Program refresh. It is complete when focused runner tests, package binary smoke, app or Convex tests for any touched backend endpoints, plan lint, Program lint, markdown lint, and diff checks pass, and this ExecPlan records evidence.

## Concrete Steps

From the repo root, inspect current package and Codex surfaces before editing:

    sed -n '1,260p' package.json
    find packages -maxdepth 2 -type f | sort
    sed -n '1,220p' apps/web/platform/codex/app-server-contracts.ts
    sed -n '1,240p' apps/web/platform/codex/app-server.ts
    sed -n '1,220p' .sbs/codebase-intake.README.md
    sed -n '1,180p' docs/design-docs/integrations.md

Read the active dependency plans before implementation:

    sed -n '1,260p' docs/exec-plans/active/2026-05-04-existing-codebase-workspace-data-model-and-events.md
    sed -n '1,260p' docs/exec-plans/active/2026-05-04-existing-codebase-setup-ui.md

Refresh official Codex docs through the OpenAI developer docs MCP before changing Codex-specific behavior. The relevant docs to confirm are the Codex CLI reference for `codex exec`, the Codex config reference for `~/.codex/config.toml`, and the sandbox and approvals guide.

Expected implementation ownership is:

    packages/local-runner/package.json
    packages/local-runner/tsconfig.json
    packages/local-runner/vitest.config.ts
    packages/local-runner/src/cli.ts
    packages/local-runner/src/commands/setup-pair.ts
    packages/local-runner/src/commands/setup-check.ts
    packages/local-runner/src/commands/daemon.ts
    packages/local-runner/src/commands/one-shot.ts
    packages/local-runner/src/core/repository-root.ts
    packages/local-runner/src/core/local-runner-home.ts
    packages/local-runner/src/core/local-project-state.ts
    packages/local-runner/src/core/runner-events.ts
    packages/local-runner/src/core/machine-setup.ts
    packages/local-runner/src/core/project-setup.ts
    packages/local-runner/src/core/github-readiness.ts
    packages/local-runner/src/core/codex-readiness.ts
    packages/local-runner/src/core/codex-config-manager.ts
    packages/local-runner/src/core/codex-config-toml.ts
    packages/local-runner/src/core/codex-exec-runner.ts
    packages/local-runner/src/core/redaction.ts
    packages/local-runner/tests/

If backend HTTP wrappers are not already implemented by the workspace data/events plan, add only the narrow route handlers needed for pairing and event ingestion. Expected web ownership would be under:

    apps/web/app/api/workspace/runner/pair/route.ts
    apps/web/app/api/workspace/runner/events/route.ts

Those route handlers must delegate to Convex functions from the data/events plan and must not accept raw source, logs, local absolute paths, secrets, or Codex transcripts.

Run focused runner validation:

    bun run --cwd packages/local-runner test
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner format:check

Run package binary proof. The exact command may change with the package script names, but it must prove the real binary entrypoint:

    bun run --cwd packages/local-runner build
    bun run --cwd packages/local-runner ship-by-sunday -- --help
    bun run --cwd packages/local-runner package:smoke
    temp_repo="$(mktemp -d /tmp/sbs-runner-repo-XXXXXX)"
    git -C "$temp_repo" init
    bun run --cwd packages/local-runner ship-by-sunday -- setup check --repo "$temp_repo" --json

If the implementation touches app API or Convex event ingestion, run the focused web checks named by those slices, plus:

    bun run --cwd apps/web test:unit -- tests/unit/workspace-data-model.test.ts tests/unit/workspace-runner-events.test.ts
    bun run --cwd apps/web test:integration -- tests/integration/workspace-runner-api.test.ts
    bun run --cwd apps/web typecheck
    bun run --cwd apps/web lint

Run planning validation:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-04-local-runner-prototype.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-04-local-runner-prototype.md docs/programs/active/2026-05-02-customer-agentic-operating-system support-codebases.md
    git diff --check

If a real `codex` binary and authenticated account are available in the implementation environment, add an optional local smoke that runs a harmless read-only `codex exec` command in a temporary Git repo. If Codex is unavailable, record that limitation and rely on the fake-binary integration proof.

## Validation and Acceptance

The runner prototype is accepted when a real package binary can run `setup pair` against a mocked or dev backend, write safe local state, and send sync-safe events. A human should be able to inspect `.sbs/config.json` and see no secrets, inspect the runner home and see restrictive credential storage, run `setup check --json`, and see Machine Setup and Project Setup rows with exact causes and statuses.

Codex profile management is accepted when the runner previews the SBS-managed config block, creates a backup, applies only inside the markers after confirmation, detects drift, rolls back on failure, and preserves unrelated user config. It must warn about file-based credential storage without reading credential contents.

The `codex exec` boundary is accepted when tests prove the command array uses the selected SBS profile, repo root, sandbox, JSON output, optional output schema, timeout, redaction, and local output path correctly. The synced event payloads must never contain raw source, raw logs, local absolute paths, secrets, or transcript text.

Daemon and one-shot behavior is accepted when the foreground daemon heartbeats and flushes events until stopped, and one-shot mode runs the same setup checks, flushes events, and exits without leaving a background worker, write lease, branch, PR, findings upload, or queue job behind.

### Test Commands

Run these commands from the repo root:

    bun run --cwd packages/local-runner test
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner format:check
    bun run --cwd packages/local-runner build
    bun run --cwd packages/local-runner ship-by-sunday -- --help
    bun run --cwd packages/local-runner package:smoke
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-04-local-runner-prototype.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-04-local-runner-prototype.md docs/programs/active/2026-05-02-customer-agentic-operating-system support-codebases.md
    git diff --check

If web API or Convex surfaces are touched, also run:

    bun run --cwd apps/web test:unit -- tests/unit/workspace-data-model.test.ts tests/unit/workspace-runner-events.test.ts
    bun run --cwd apps/web test:integration -- tests/integration/workspace-runner-api.test.ts
    bun run --cwd apps/web typecheck
    bun run --cwd apps/web lint

If package naming, root package naming, or dependencies change, update the matching lockfile and add the package-manager validation that proves the workspace still installs cleanly.

## Idempotence and Recovery

Pairing must be safe to rerun. If the same project and runner are already paired, the runner should refresh local metadata and keep going. If a different project is already paired in the repo, the runner should stop and require explicit confirmation before overwriting `.sbs/config.json`.

Local writes should be atomic. Write `.sbs/config.json`, status files, event outbox files, and Codex config backups through same-directory temp files followed by rename where practical. If a temp file remains after interruption, the runner should either recover it or report an exact local repair path.

Codex config patching must be reversible. Always create a timestamped backup before applying the SBS block. If verification fails, restore the backup automatically and report the failure. Never delete or rewrite content outside SBS markers.

Event delivery must tolerate offline use. Queue sync-safe events locally, retry with backoff, dedupe by event id on the backend, and keep enough local state to explain what was not synced. Do not drop blocked setup state just because the network is down.

Stopping the foreground daemon should not delete local state or revoke the runner. Revocation is an explicit backend-backed action owned by setup or privacy surfaces. `daemon stop` only stops the local process.

## Artifacts and Notes

Owning Program: `docs/programs/active/2026-05-02-customer-agentic-operating-system/program.md`.

Planning brief: `docs/programs/active/2026-05-02-customer-agentic-operating-system/planning-brief-2.md`.

Prior child plans:

    docs/exec-plans/active/2026-05-04-existing-codebase-checkout-intent-routing.md
    docs/exec-plans/active/2026-05-04-existing-codebase-workspace-data-model-and-events.md
    docs/exec-plans/active/2026-05-04-existing-codebase-setup-ui.md

Scratch note: `support-codebases.md`.

Primary target command:

    bunx ship-by-sunday setup pair <token>

Fallback target command:

    npx ship-by-sunday setup pair <token>

First SBS Codex profile names:

    sbs-doctor-readonly
    sbs-proof
    sbs-loop-branch
    sbs-pr-delivery
    sbs-network-needed

First SBS Codex permission profile names:

    sbs-readonly
    sbs-proof-readonly
    sbs-workspace-write
    sbs-pr-network
    sbs-network-readonly

Official Codex docs checked for this plan:

    https://developers.openai.com/codex/cli/reference#codex-exec
    https://developers.openai.com/codex/config-reference#configtoml
    https://developers.openai.com/codex/agent-approvals-security#sandbox-and-approvals

Local Codex source references checked for this plan:

    /Users/bazelrex/Developer/codex/codex-rs/exec/src/lib.rs
    /Users/bazelrex/Developer/codex/codex-rs/exec/src/exec_events.rs
    /Users/bazelrex/Developer/codex/codex-rs/config/src/config_toml.rs
    /Users/bazelrex/Developer/codex/codex-rs/config/src/profile_toml.rs
    /Users/bazelrex/Developer/codex/codex-rs/config/src/permissions_toml.rs
    /Users/bazelrex/Developer/codex/codex-rs/config/src/loader/mod.rs
    /Users/bazelrex/Developer/codex/codex-rs/login/src/auth/storage.rs
    /Users/bazelrex/Developer/codex/codex-rs/app-server-protocol/src/protocol/v2.rs
    /Users/bazelrex/Developer/codex/codex-cli/bin/codex.js

## Interfaces and Dependencies

This plan depends on `package.json`, `packages/`, `apps/web/platform/codex/app-server.ts`, `apps/web/platform/codex/app-server-service.ts`, `apps/web/platform/codex/app-server-contracts.ts`, `.sbs/codebase-intake.py`, `.sbs/codebase-intake.README.md`, `docs/design-docs/integrations.md`, `docs/exec-plans/active/2026-05-04-existing-codebase-workspace-data-model-and-events.md`, `docs/exec-plans/active/2026-05-04-existing-codebase-setup-ui.md`, and `docs/programs/active/2026-05-02-customer-agentic-operating-system/planning-brief-2.md`.

The runner package should expose a binary named `ship-by-sunday`, command modules for setup, daemon, one-shot, and Codex smoke boundaries, and core modules for local state, event outbox, setup checks, GitHub readiness, Codex readiness, Codex config management, and `codex exec` spawning. If app API endpoints are needed, they must use the workspace data/events Convex functions and preserve the sync-safe event contract.

Downstream plans depend on this runner but must not be absorbed into it. `doctor-pass-and-sync-preview` owns passive probes, local Markdown reports, sync-safe findings JSON, and sync preview approval. `findings-ledger-and-decision-screens` owns UI for doctor pass progress and Top 9 findings. `source-truth-agent-readiness-workflow` owns branch creation, write leases, workflow packets, proof, local diff, and optional `Open PR`. Work-phase workers own queues and recurring jobs.
