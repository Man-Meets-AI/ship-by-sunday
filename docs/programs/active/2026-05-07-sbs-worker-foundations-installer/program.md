---
program_id: sbs-worker-foundations-installer
title: Shipbysunday Worker Foundations Installer
status: active
created_at: 2026-05-07
completed_at: null
summary: Productize the Worker/Arena proof into a native installer that gives another repo visible, repo-local Program, ExecPlan, prompt, validator, and Worker source.
post_build_recap: null
read_when:
  - Planning or implementing the Shipbysunday Worker Foundations installer.
  - Changing local-runner docs operating-system install bundles, Program/ExecPlan tooling, or repo-local Worker installation.
  - Smoke-testing Worker-style planning/runtime setup in Arena CRM or another customer repo.
---

# Shipbysunday Worker Foundations Installer

This Program is a living initiative document for turning the Arena CRM Worker-foundations proof into a repeatable product install path.

This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

The current local runner can install a portable docs operating-system command surface, but the Arena CRM spike showed the higher-value product shape: install visible, repo-local Worker source that a coding agent can inspect, dogfood, adapt, and trust inside the target repo. The product should let someone run `shipbysunday install` from a target codebase, receive the local Worker Foundations substrate, and immediately continue with checked-in Programs, ExecPlans, prompts, validators, commands, and proof.

This initiative is moving correctly when a target repo can receive the default Worker Foundations install, run canonical commands such as `programs:lint`, `plans:lint`, `markdown:lint`, `docs:validate`, `program:write-child-plan`, `execplan:write`, `execplan:grill`, `execplan:build`, `execplan:validate`, and `worker:test`, and prove the install by creating a real Program plus child ExecPlan inside the target repo. The native `shipbysunday` executable should remain the installer and updater, while the installed source should be visible in the repo.

## Program Inputs

The durable packet artifacts for this Program live in `docs/programs/active/2026-05-07-sbs-worker-foundations-installer/`.

The research input is `research-pass-arena-worker-foundations.md`. The normalized product direction is `normalized-pass-worker-foundations-installer.md`. The accepted initiative decision is `converged-decision-packet.md`. Ordering is recorded in `dependency-graph.md` and `plan-split-recommendation.md`. Risk review is recorded in `cross-repo-review.md`. The current immutable implementation brief is `planning-brief-2.md`, and `current-planning-brief.txt` points at that brief. `planning-brief-1.md` records the earlier profile/runtime wording and is superseded by the product-shape decisions captured on 2026-05-08.

Important prior context lives in the completed Program `docs/programs/completed/2026-05-06-worker-grade-docs-operating-system-adoption/program.md`. That Program shipped the portable docs-core wrapper model and explicitly deferred runtime installation. This Program starts where that boundary stopped.

## Current State

Ship by Sunday already has strong Program, ExecPlan, prompt, markdown, and local-runner docs-operating-system primitives. The completed Worker-grade docs Program added package-owned `ship-by-sunday docs-operating-system` commands, wrapper script patching, lockfile proof, quality refresh, native command proof, and local package artifact smoke. That result is useful but still hides the real behavior inside the package and gives target repos thin wrappers rather than a visible local operating system.

Arena CRM proved a different path. The useful spike removed the temporary harness layer, installed Worker-style root scripts, added a forwarding script, created an `apps/runtime` package, added YAML-backed Program and ExecPlan validation modules, added prompt contracts, added `program:write-child-plan`, added bounded ExecPlan commands, and dogfooded the system with a real Program plus child ExecPlans. The productized version should keep the proven behavior but use cleaner public names: `shipbysunday install`, `apps/worker`, `scripts/run-worker.sh`, and `.worker/` local state.

The local-runner now has a first `shipbysunday install` / `shipbysunday i` implementation. It can inspect a target repo, emit sync-safe dry-run JSON, require clean Git state, validate or interactively activate a machine-level license outside the repo, prepare Worker-managed Codex profiles, prepare a Worker-managed Bun toolchain from safe local sources, install visible `apps/worker` source, patch root forwarding scripts, protect `.worker/`, create the starter Program, use the installed `program:write-child-plan` command to create the first child ExecPlan, run proof commands, write `docs/worker/install-report.md`, and create a local commit when proof passes.

This first product path is still not the final customer distribution path. Native executable packaging, grouped interactive checklist polish, broader real-project smoke, and bundled or downloaded Worker-managed Bun provisioning are product gaps. The implementation can use an existing managed Bun, a compatible `bun` on `PATH`, an explicit `SHIPBYSUNDAY_WORKER_BUN`, or the current Bun runtime; it still blocks when there is no usable local Bun source to import into the Worker home.

## Progress

- [x] 2026-05-07: Converted the Arena discovery into an active Program packet so the product direction is durable in the repo.
- [x] 2026-05-07: Chose the first product boundary: a Worker Foundations installer that installs visible repo-local source instead of only hidden package-owned wrappers.
- [x] 2026-05-07: Created the first child ExecPlan, later completed at `docs/exec-plans/completed/2026-05-07-install-worker-foundations.md`.
- [x] 2026-05-08: Interviewed the install design and locked the product-facing shape: native `shipbysunday install`, no user-visible install profile picker, required grouped install checklist, clean branch, proof-gated auto-commit, `apps/worker`, `scripts/run-worker.sh`, `.worker/`, Bun-first Worker package with private Worker-managed Bun provisioning, managed agent instructions, Worker-managed Codex permission profiles for kickoff safety, and a real dogfood Program plus child ExecPlan.
- [x] 2026-05-08: Implemented the first local-runner installer slice with sync-safe dry-run JSON, license and clean-worktree gates, Worker-managed Codex profile setup, `apps/worker` templates, root script patching, `.worker/` protection, dogfood child-plan proof, validation proof, report writing, local commit support, and optional foreground Codex kickoff.
- [x] 2026-05-08: Added fixture coverage for sparse target repos, unknown package-script conflicts, legacy `scripts/run-runtime.sh` script migration, and dogfood proof with `--no-commit --no-kickoff`.
- [x] 2026-05-08: Smoke-tested read-only dry-run against Arena CRM. It stayed sync-safe and read-only, recognized legacy `scripts/run-runtime.sh` commands as managed updates, and blocked only on missing local license activation.
- [x] 2026-05-08: Added Worker-managed Bun toolchain import for existing managed Bun, compatible PATH Bun, explicit `SHIPBYSUNDAY_WORKER_BUN`, and current Bun runtime; fixture proof covers install and dogfood with no `bun` on PATH.
- [x] 2026-05-08: Completed the first installer child ExecPlan and moved it to `docs/exec-plans/completed/2026-05-07-install-worker-foundations.md`.
- [x] 2026-05-08: Completed browser/device license activation and package smoke coverage in `docs/exec-plans/completed/2026-05-08-worker-installer-license-activation.md`; fresh `~/Developer/runner-test` smoke proved empty-repo blocking, minimal-package dry-run readiness, proof-gated install, and commit `45f8d85` on `shipbysunday/install`.
- [ ] 2026-05-08: Started the grouped interactive checklist child ExecPlan at `docs/exec-plans/active/2026-05-08-worker-installer-interactive-checklist.md`.
- [ ] Harden native distribution, grouped checklist polish, bundled/downloaded Bun provisioning, and package-manager fallback after the local installer path is proven.

## Decision Log

Decision: Productize Worker Foundations as visible repo-local source, not as hidden package magic.
Rationale: Arena worked because the target repo contained inspectable runtime source, scripts, prompts, validators, and Program/ExecPlan contracts. The productized install should use `apps/worker`, but the underlying lesson is that agents could reason from local source instead of depending on opaque installed behavior.
Date: 2026-05-07

Decision: Make `shipbysunday install` the customer command.
Rationale: Users should not choose an implementation profile or learn local-runner vocabulary. The first customer path should install Worker Foundations by default, with `shipbysunday i` as the short alias and internal bundle selection hidden behind the installer.
Date: 2026-05-08

Decision: Make the native executable the canonical distribution path.
Rationale: The customer should download and run `shipbysunday` as a licensed native installer. Package-manager delivery can remain a development or bootstrap fallback, but the product should not depend on `bunx` or `npx` as the primary customer experience.
Date: 2026-05-08

Decision: Require license activation before repo mutation.
Rationale: The installer should validate the repo first, then verify a machine-level license under `~/.worker/` before writing source files. License state must not be stored in the target repo.
Date: 2026-05-08

Decision: Use `apps/worker`, `scripts/run-worker.sh`, and `.worker/`.
Rationale: These names are clearer for customers and coding agents than the old `apps/runtime`, `scripts/run-runtime.sh`, `.runtime`, and `.sbs` vocabulary. `apps/worker` is the visible checked-in source package, `scripts/run-worker.sh` is the root command bridge, and `.worker/` is the ignored repo-local proof/state root.
Date: 2026-05-08

Decision: Use `.worker` vocabulary for both repo-local and machine-level Worker state.
Rationale: The installed repo should use `<repo>/.worker/` for ignored install proof and run state, while the native product should use `~/.worker/` for license activation, account state, machine identity, and future non-repo secrets. This keeps the product vocabulary simple without storing license material in the target repo.
Date: 2026-05-08

Decision: Support `SHIPBYSUNDAY_WORKER_HOME` as an internal machine-state override.
Rationale: The customer default should remain `~/.worker/`, but tests, CI, and support smoke need to isolate license/account state without touching a real machine home. The override should not be part of the normal customer path, and `WORKER_HOME` is too generic.
Date: 2026-05-08

Decision: Use browser-based device activation for the v1 license flow.
Rationale: `shipbysunday install` should show a one-time code and open or print a short activation URL where the user signs in through the existing web account/access system. The CLI should poll until the server returns a revocable machine credential stored under `~/.worker/`. Repo pairing tokens remain legacy workspace-runner infrastructure, and pasted license keys can wait as a later support fallback.
Date: 2026-05-08

Decision: Keep Worker dependencies inside `apps/worker`.
Rationale: Root `package.json` should only receive command forwarding scripts. The installed Worker package should carry its own `package.json`, `bun.lock`, runtime tests, and dependencies so the customer app dependency graph is not polluted.
Date: 2026-05-08

Decision: Make the installed Worker package Bun-first for v1.
Rationale: Worker and Arena proved the Bun path. The target repo may use any root package manager, but `apps/worker` should be one deterministic Bun package installed with its committed lockfile.
Date: 2026-05-08

Decision: Provision Bun as a private Worker-managed toolchain when needed.
Rationale: Customers should not have to install Bun globally or switch their app package manager just because Worker Foundations is Bun-first internally. The native installer should prefer an existing compatible `bun` on `PATH`, but if Bun is missing or unsuitable it should provision a pinned Worker-managed Bun runtime under `~/.worker/toolchains/` and make `scripts/run-worker.sh` discover it through `SHIPBYSUNDAY_WORKER_HOME` or the default `~/.worker/` layout. Root package scripts should remain runnable through the target repo's package manager and then forward into the Worker-managed Bun runtime. Toolchain setup must not leak absolute paths into tracked reports or manifests.
Date: 2026-05-08

Decision: Require a root `package.json` for v1.
Rationale: The first install path depends on root package scripts as the agent-facing command surface. Non-JS repos should block with a clear message until a native non-package-script surface exists.
Date: 2026-05-08

Decision: Dogfood during installation through the installed command surface.
Rationale: Copying files is not enough. The installer should create the starter Program packet, then run the installed `program:write-child-plan` command to create the first child ExecPlan, proving the forwarding script, Bun Worker package, Program validation, immutable planning brief resolution, and child-plan writer.
Date: 2026-05-08

Decision: Auto-commit only after proof passes.
Rationale: The default customer experience should end with a local commit on `shipbysunday/install`, but only after all required phases and validation pass. Failed validation should leave uncommitted branch changes plus a report; the installer should not push or open a pull request by default.
Date: 2026-05-08

Decision: Reuse `shipbysunday/install` only when it is safe.
Rationale: The installer may reuse the branch when the current branch is already `shipbysunday/install` with a clean worktree, or when the existing branch is equal to or an ancestor of the current clean base and can be checked out safely. If the branch contains unmerged prior installer work, block and tell the user to review, delete, or merge that branch first.
Date: 2026-05-08

Decision: Keep the public root command surface narrow.
Rationale: v1 should install `programs:lint`, `plans:lint`, `markdown:lint`, `docs:validate`, `program:write-child-plan`, `execplan:write`, `execplan:grill`, `execplan:build`, `execplan:validate`, and `worker:test`. It should not expose `execplan:feature` because the product is installing a strong repo-local operating system for Codex, not running an autonomous feature builder during install.
Date: 2026-05-08

Decision: Add managed agent instructions by default.
Rationale: Root `AGENTS.md` and nested `AGENTS.md` files under `docs/programs/`, `docs/exec-plans/`, and `docs/prompts/` are part of the coding-agent experience. The installer should create them when missing and update only managed Worker sections when present.
Date: 2026-05-08

Decision: Use create-only writes and managed sections for owner content.
Rationale: Reruns should repair or refresh the install without overwriting customer-owned docs, prompts, scripts, or instructions. Unknown same-name files should block with a conflict report.
Date: 2026-05-08

Decision: Track ownership with manifests.
Rationale: `apps/worker/worker-manifest.json` should describe the tracked installed source version and file hashes, while `.worker/install-manifest.json` should hold local install/proof state. Neither should include secrets, raw logs, absolute paths, source snippets, or Codex transcripts.
Date: 2026-05-08

Decision: Keep CI mutation out of v1.
Rationale: The installer should include a suggested CI snippet in `docs/worker/install-report.md`, but it should not patch `.github/workflows/**` by default because CI is repo-policy surface.
Date: 2026-05-08

Decision: Make the customer checklist an all-required install confirmation.
Rationale: Worker Foundations needs every core phase to be useful: Worker source, Worker toolchain, repo commands, agent instructions, Program and ExecPlan docs, prompt contracts, starter Program, validation proof, local commit, Codex safety setup, and auto-kickoff. The interactive surface should preview the required phases and let the user continue or cancel, not create partial installs by deselecting rows. Explicit developer/test flags may skip commit, Codex safety setup, or kickoff, but those are not the normal customer path.
Date: 2026-05-08

Decision: Make noninteractive agent/dev mode a v1 requirement.
Rationale: The default customer path should be interactive, but coding agents, tests, and support smoke need deterministic commands. `shipbysunday install --yes`, `shipbysunday install --json`, `shipbysunday install --repo <path> --yes --json`, and `shipbysunday install --dry-run --json` should run the full required install, fail on conflicts instead of prompting, preserve the same clean-worktree/license/proof gates, and emit machine-readable status. Because auto-commit and auto-kickoff are part of the golden path, `--yes` should commit and kick off after proof passes unless the caller passes explicit developer/test flags such as `--no-commit` or `--no-kickoff`.
Date: 2026-05-08

Decision: Keep `--dry-run` read-only against the target repo and machine.
Rationale: Dry-run should inspect, classify operations, show checklist/conflict state, and exit without branch creation, `.worker/` writes, package installs, lockfile changes, Codex config writes, Worker toolchain downloads, commits, or kickoff. Persistent plan artifacts can be a later explicit `--write-plan` behavior if needed.
Date: 2026-05-08

Decision: Make `--json` stdout a single machine-readable object.
Rationale: Coding agents and tests need a clean contract. In `--json` mode, stdout should contain one JSON object; human progress should go to stderr or be suppressed. The JSON may include repo-relative paths, required phase statuses, conflicts, planned operations, proof command statuses, branch and commit result when applicable, and report/proof refs. It must not include raw logs, absolute paths, secrets, package script bodies, dependency versions, source snippets, or Codex transcripts.
Date: 2026-05-08

Decision: Define stable outcomes and exit codes.
Rationale: Coding agents should not parse prose to decide what happened. Exit code `0` means `ready` for successful dry-run with no blockers or `installed` for successful install/commit. Exit code `1` means `failed` for unexpected errors or validation failures after writes. Exit code `2` means `blocked` for known prerequisites or conflicts before writes, including dirty worktree, missing license, missing root `package.json`, unavailable Worker-managed Bun toolchain, or file conflicts. Exit code `130` means `cancelled` for user cancellation. JSON output should always include the matching `outcome` string.
Date: 2026-05-08

Decision: Support same-version repair/refresh only in v1.
Rationale: Rerunning `shipbysunday install` against the same installed Worker version should repair or refresh managed files and proof. If `apps/worker/worker-manifest.json` reports an older or newer version than the bundled installer version, v1 should block with `upgrade-required` or `version-mismatch` and route to a future `shipbysunday upgrade` path instead of inventing migration semantics during install.
Date: 2026-05-08

Decision: Separate installer version from Worker bundle version.
Rationale: `installerVersion` identifies the native `shipbysunday` executable build. `workerBundleVersion` identifies the installed `apps/worker` template/source version. Repair/refresh should compare `workerBundleVersion`, not the native installer version, so installer fixes can ship without forcing Worker bundle migrations and later Worker bundle upgrades can be explicit.
Date: 2026-05-08

Decision: Keep one tracked current install report.
Rationale: `docs/worker/install-report.md` should be overwritten on same-version repair/refresh so agents have one obvious human-readable install state. Durable run-by-run proof belongs under ignored `.worker/runs/<run-id>/`, not as a growing tracked report history.
Date: 2026-05-08

Decision: Auto-kickoff Codex after successful install.
Rationale: The magic moment is not just leaving a prompt in the report; it is starting the first continuation automatically. After proof and local commit succeed, the installer should start Codex with a repo-relative prompt to read `AGENTS.md`, `docs/worker/install-report.md`, the starter Program, and the first active ExecPlan, then continue from that plan. Auto-kickoff should be a required golden-path phase. It should not run on dry-run, failed proof, or when a developer/test caller passes `--no-kickoff`. The report may record sync-safe kickoff status, but not transcripts.
Date: 2026-05-08

Decision: Require Codex availability for the normal customer install path.
Rationale: Auto-kickoff is part of the customer promise, so the installer should preflight `codex` availability and authentication before repo writes. If Codex is missing or not authenticated, block before creating `shipbysunday/install` and show exact setup instructions. Developer/test callers may pass `--no-kickoff`, but the default product should not report a successful install without the magic moment.
Date: 2026-05-08

Decision: Install Worker-managed Codex permission profiles as an internal safety rail.
Rationale: Codex is a prerequisite and auto-kickoff is part of the customer promise, but the product should not rely on an unknown default Codex configuration. The installer should require `codex` on `PATH`, `codex --version` success, `codex login status` success, and no explicit untrusted state for the target repo, then install or refresh a marked Worker-managed block in `~/.codex/config.toml` before repo mutation. The v1 profile names should be `shipbysunday-worker-readonly` and `shipbysunday-worker-project-write`. The config writer must parse the existing file, preserve unrelated user config, create a backup, update only the managed block, and roll back on failure. It should not use file-based `auth.json` presence as the auth check; keyring-backed auth must work.
Date: 2026-05-08

Decision: Run auto-kickoff Codex in the foreground.
Rationale: After install proof and local commit, the installer should hand the same terminal to Codex so the user can see the continuation, interrupt it, and trust what is happening. The launcher should use the local `codex` CLI with the target repo as cwd, launch with the Worker-managed project-write profile, and pass the kickoff prompt through stdin. It should not detach, daemonize, or capture/store transcripts. The install report should record only sync-safe kickoff status such as `started`, `skipped`, or `blocked` plus the prompt ref/status.
Date: 2026-05-08

Decision: Let auto-kickoff use Codex write capability by default.
Rationale: Auto-kickoff exists to continue the first active ExecPlan, so a read-only launch would feel broken. It should run only after install proof and local commit succeed on the clean `shipbysunday/install` branch. Use the Worker-managed `shipbysunday-worker-project-write` profile so writable filesystem access is scoped to the target project, environment access is denied by default, agent network access is disabled unless a later proof explicitly needs it, and Codex can still ask for its normal approvals. If the profile cannot be installed or refreshed, the normal customer path should block before repo mutation with exact setup instructions; developer/test callers may use `--no-kickoff`.
Date: 2026-05-08

Decision: Dogfood during installation.
Rationale: Copying files is not enough. The installer should prove the installed system by creating a real target-repo Program packet, using the installed command surface to create one child ExecPlan, then running the canonical validation commands.
Date: 2026-05-07

Decision: Treat Arena as the first golden adoption target.
Rationale: Arena exposed the real gap between harness-shaped docs validation and Worker-style Program/ExecPlan operation. The installer must be able to reproduce that migration safely before broader product claims are credible.
Date: 2026-05-07

## Slice Ledger

The first child ExecPlan is complete at `docs/exec-plans/completed/2026-05-07-install-worker-foundations.md`. It carries `program_id: sbs-worker-foundations-installer` and `planning_brief: docs/programs/active/2026-05-07-sbs-worker-foundations-installer/planning-brief-2.md`.

The second child ExecPlan is complete at `docs/exec-plans/completed/2026-05-08-worker-installer-license-activation.md`. It carries `program_id: sbs-worker-foundations-installer` and `planning_brief: docs/programs/active/2026-05-07-sbs-worker-foundations-installer/planning-brief-2.md`.

The third child ExecPlan is active at `docs/exec-plans/active/2026-05-08-worker-installer-interactive-checklist.md`. It carries `program_id: sbs-worker-foundations-installer` and `planning_brief: docs/programs/active/2026-05-07-sbs-worker-foundations-installer/planning-brief-2.md`.

Expected later slices are Worker template extraction and hardening, Arena golden smoke automation, update/idempotence handling for already-installed repos, native distribution and licensing hardening, and optional CI wiring. Worker-specific state, provider setup, app-stack process management, dashboards, Telegram/Discord/control-panel surfaces, and full Worker operating state remain outside this first Program until a later brief explicitly admits them.

## Next Slice

The active child ExecPlan is `docs/exec-plans/active/2026-05-08-worker-installer-interactive-checklist.md`. Its required outcome is that a normal interactive install previews all required phases in a concise grouped checklist, blocks conflicted phases with reasons, allows continue or cancel without partial deselection, and keeps JSON/noninteractive output unchanged.

## Risks and Watchpoints

Do not copy all of Worker. Worker-specific runtime state, notes, goals, projects, topology, worker roles, provider setup, launchd assumptions, Telegram/Discord/control-panel surfaces, and app-stack process commands are not portable Worker Foundations.

Do not regress to hidden wrappers. The package can distribute and update the system, but the target repo must contain the source that future coding agents need to inspect.

Do not let the installer overwrite owner-authored files. Same-name scripts, `apps/worker`, `scripts/run-worker.sh`, `docs/prompts`, Program folders, and `AGENTS.md` sections need parsed conflict handling, managed sections, or explicit blocked states.

Do not call install proof complete because files were copied. Proof requires canonical commands to run or block honestly, and the dogfood Program/ExecPlan path must be exercised.

Do not make Arena-only assumptions canonical. Arena is the first golden target because it exposed the gap, not because every repo should inherit Arena's folder names or temporary harness decisions.

Do not claim bundled or downloaded Bun provisioning is complete yet. The current implementation can import a safe local Bun into `~/.worker/toolchains/`, but the native executable still needs a durable bundled or downloaded toolchain path for machines that have no usable local Bun source.

## Outcomes & Retrospective

This Program is active. The first implementation now installs the seed Worker operating system into another repository and leaves behind local source, commands, proof, and a durable handoff prompt that another agent can use without chat history. Browser/device license activation is complete for the local-runner installer path. The remaining Program work is hardening the customer distribution surface: native executable packaging, bundled or downloaded Bun provisioning, full interactive checklist polish, and broader real-repo smoke.

## Validation and Acceptance

Program-level acceptance requires the installer to support at least one native installer proof and one real target-repo smoke proof. The accepted state should include:

- a documented CLI shape for `shipbysunday install` and `shipbysunday i`
- no user-visible install profile picker in the golden path
- a grouped confirmation checklist that shows all required install phases, blocks conflicted phases with reasons, and allows continue or cancel rather than partial deselection
- noninteractive `--yes`, `--json`, `--repo <path>`, and `--dry-run --json` support for agents, tests, and support smoke
- license activation stored outside the repo under `~/.worker/`
- Codex prerequisite checks and Worker-managed Codex permission profiles installed through a marked, reversible block in `~/.codex/config.toml`
- visible target-repo source for Program, ExecPlan, prompt, validation, and Worker command behavior under `apps/worker`
- `apps/worker/package.json`, `apps/worker/bun.lock`, `apps/worker/worker-manifest.json`, and focused Worker runtime tests
- private Worker-managed Bun toolchain provisioning when the target machine does not already have a compatible Bun runtime
- root package scripts for the canonical Program/ExecPlan validation and lifecycle commands plus `worker:test`
- `scripts/run-worker.sh` loading `.env`, `.env.local`, and optional `.worker/bootstrap.env` without printing values
- `.worker/` protected through `.git/info/exclude` and `.worker/.gitignore`
- same-name conflict handling for scripts, `apps/worker`, `scripts/run-worker.sh`, docs prompts, and instruction surfaces
- dogfood proof that creates a target Program packet and creates the child ExecPlan through installed `program:write-child-plan`
- local proof under `.worker/` and a concise tracked report under `docs/worker/install-report.md`
- a local commit on `shipbysunday/install` only after selected proof passes
- foreground Codex auto-kickoff through the Worker-managed project-write profile after proof and commit
- Arena CRM smoke evidence or an equivalent checked fixture that reproduces the harness-to-Worker-foundations migration

## Artifacts and Notes

Arena CRM's useful reference commits were `2fd0211ccf26c8e987a1979cbbac0e14e2d3d07f`, `143de7e6a5b10bae370922c8599bf4adc9eb69a6`, and `8ad93149d3f2fffdf2d25ee5b783062a9da39208` on the `sbs/worker-foundations` branch. They are research inputs, not files to copy blindly. They used the older `apps/runtime` and `scripts/run-runtime.sh` names; the productized install should use `apps/worker` and `scripts/run-worker.sh`.

The completed Worker-grade docs Program remains the boundary record for what the existing docs runner already shipped and what it intentionally excluded.

Implementation artifacts added in the first child slice:

- `packages/local-runner/src/commands/install.ts`
- `packages/local-runner/src/workflows/worker-foundations-install/`
- `packages/local-runner/tests/worker-foundations-install.test.ts`

Read-only Arena CRM smoke command:

    bun --cwd packages/local-runner src/cli.ts install --repo <arena-crm-checkout> --dry-run --json --no-kickoff

The Arena dry-run produced a sync-safe blocked result without mutating the repo. After legacy script recognition, the remaining blocker was missing local license activation.

The fresh `~/Developer/runner-test` smoke proved the current local-runner path without using Arena CRM: an empty Git repo blocked on missing root `package.json`; after adding and committing a minimal package file, dry-run returned `ready`; the real install with an isolated Worker home returned `installed`, passed all proof commands, and committed `45f8d85` on `shipbysunday/install`.

The first local-runner implementation is in `packages/local-runner/src/commands/install.ts` and `packages/local-runner/src/workflows/worker-foundations-install/`. Its installed Worker source is intentionally minimal but visible and dogfoodable. Treat it as the seed substrate to harden, not as the final full Worker product.

## Interfaces and Dependencies

This Program depends on `packages/local-runner/src/cli.ts`, `packages/local-runner/src/commands/docs-operating-system.ts`, `packages/local-runner/src/workflows/docs-operating-system-adoption/`, local-runner tests under `packages/local-runner/tests/`, the root Program and ExecPlan validators under `scripts/programs/`, `scripts/exec-plan/`, and `scripts/markdown-metadata/`, docs contracts under `docs/programs/` and `docs/exec-plans/`, and the Worker/Arena runtime workflow shapes used as reference inputs.
