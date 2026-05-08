---
title: Install Worker Foundations
status: complete
created_at: 2026-05-07
completed_at: 2026-05-08
summary: Add the first native Worker Foundations installer path that installs visible repo-local Worker source into a target repo and proves it by dogfooding the Program loop.
post_build_recap: The local runner now exposes `shipbysunday install` and `shipbysunday i`, installs visible Worker Foundations source into target repos, dogfoods the Program-to-child-ExecPlan loop, records sync-safe proof, supports proof-gated local commits, and can run Worker proof through a managed Bun toolchain imported from safe local sources.
program_id: sbs-worker-foundations-installer
planning_brief: docs/programs/active/2026-05-07-sbs-worker-foundations-installer/planning-brief-2.md
read_when:
  - Reviewing the first completed Worker Foundations installer slice.
  - Changing local-runner install bundles, Worker Foundations templates, or Arena smoke proof.
  - Planning follow-up license activation, native distribution, or bundled Bun provisioning work.
---

# Install Worker Foundations

This is a living execution plan for the first Worker Foundations installer slice.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The current docs operating-system runner can install or expose useful docs commands, but Arena CRM showed that the more valuable product is a visible repo-local Worker operating system. After this slice, Ship by Sunday should have a first native `shipbysunday install` path that can inspect a clean target repo, verify license state, present a grouped checklist, apply safe repo-local source, dogfood the installed Program loop, record proof, and auto-commit the result when proof passes.

The visible user outcome is simple: from a target repo, a user or agent can run `shipbysunday install` or `shipbysunday i` and receive local files, scripts, prompts, validators, and a first Program/ExecPlan proof that future agents can inspect without chat history.

## Progress

- [x] 2026-05-07: Created the owning Program packet and this child ExecPlan from `planning-brief-1.md`.
- [x] 2026-05-08: Inspected the current local-runner CLI, docs operating-system command surface, package smoke, install-plan helpers, Codex config manager, and Arena-shaped starting point before changing code.
- [x] 2026-05-08: Locked the revised product contract through design interview: native `shipbysunday install`, no user-visible install profile picker, `apps/worker`, `scripts/run-worker.sh`, `.worker/`, Bun-first self-contained Worker package with private Worker-managed Bun provisioning, root `package.json` requirement, grouped interactive checklist, managed agent instructions, Worker-managed Codex permission profiles, proof-gated auto-commit, and no public `execplan:feature` in v1.
- [x] 2026-05-08: Defined the `shipbysunday install` command shape, `shipbysunday i` short alias, internal Worker Foundations bundle model, and noninteractive agent/dev flags.
- [x] 2026-05-08: Implemented sync-safe inspect and dry-run JSON. Real installs write ignored `.worker/runs/<run-id>/install-proof.json` and tracked `docs/worker/install-report.md`; dry-run remains read-only.
- [x] 2026-05-08: Implemented conflict-aware apply for the first Worker Foundations source subset, including root scripts, `scripts/run-worker.sh`, visible `apps/worker` source, managed `AGENTS.md` blocks, docs contracts, `.git/info/exclude`, and `.worker/.gitignore`.
- [x] 2026-05-08: Added dogfood proof that creates the starter Program packet and uses the installed `program:write-child-plan` command to create a Program-linked child ExecPlan with immutable planning-brief provenance.
- [x] 2026-05-08: Added fixture coverage for sparse package repos, same-name package script blockers without body leaks, legacy `scripts/run-runtime.sh` script migration, and successful dogfood proof with `--no-commit --no-kickoff`.
- [x] 2026-05-08: Ran a read-only Arena CRM dry-run smoke. It recognized legacy runtime scripts as managed updates and blocked only on missing local license activation.
- [x] 2026-05-08: Ran final local-runner tests, build, package smoke, lint, typecheck, format check, Program lint, ExecPlan lint, markdown metadata lint, and diff check.
- [x] 2026-05-08: Added Worker-managed Bun toolchain preparation for existing managed Bun, compatible PATH Bun, explicit `SHIPBYSUNDAY_WORKER_BUN`, and current Bun runtime import; added a no-global-Bun fixture proving install and dogfood can run through `~/.worker/toolchains/bun/bin/bun`.
- [x] 2026-05-08: Re-ran full local-runner validation, package smoke, Program lint, ExecPlan lint, markdown lint, diff check, and Arena dry-run smoke after the toolchain work.
- [x] 2026-05-08: Moved this ExecPlan to `docs/exec-plans/completed/` after the implementation landed in `927c152a` and the remaining work was narrowed to follow-up product hardening slices.

## Surprises & Discoveries

Worker and Arena used `apps/runtime`, `scripts/run-runtime.sh`, `.runtime`, and Bun. The productized install keeps the Bun runtime path but intentionally renames the customer-facing installed source to `apps/worker`, `scripts/run-worker.sh`, and `.worker/`.

The old `.sbs` local-runner artifact root is not a compatibility target for this greenfield install path. New Worker Foundations installs should use `.worker/` for repo-local hidden proof and state.

The installer can now prepare a Worker-managed Bun toolchain when a safe local Bun executable is available through `SHIPBYSUNDAY_WORKER_BUN` or the current Bun runtime. It still does not download or unpack a bundled Bun runtime in the native executable. That remaining native distribution work is a narrower product gap than the earlier global-Bun blocker.

Arena CRM currently carries legacy `scripts/run-runtime.sh` forwarding scripts for the planning commands. The installer treats those exact legacy commands as managed updates to `scripts/run-worker.sh` rather than conflicts, while still blocking unknown owner-authored package script bodies without printing them.

The no-global-Bun fixture exposed that `scripts/run-worker.sh` cannot rely on external shell utilities such as `dirname` when PATH is intentionally stripped. The script now uses shell parameter expansion and prepends the managed Bun directory to PATH so nested `bun` package scripts can resolve consistently.

## Decision Log

Decision: Install visible source for Worker Foundations behavior.
Rationale: Arena worked because the target repo contained inspectable local source. Keeping all behavior inside the package would repeat the wrapper-only limitation.
Date: 2026-05-07

Decision: Treat dogfood as part of install proof.
Rationale: Copying files does not prove the operating system works. A real target Program and child ExecPlan prove the installed loop can be used by the next agent.
Date: 2026-05-07

Decision: Use `shipbysunday install` as the golden path.
Rationale: Users should not need to understand profiles or old local-runner namespaces. The short alias is `shipbysunday i`; bundle selection is internal.
Date: 2026-05-08

Decision: Use a licensed native executable as the primary customer delivery path.
Rationale: Native install gives the cleanest customer experience. Package-manager distribution can remain a development or bootstrap fallback, but customer docs and smoke should assume `shipbysunday`.
Date: 2026-05-08

Decision: Store machine-level Worker state under `~/.worker/`.
Rationale: Repo-local install proof and run state belongs under `<repo>/.worker/`, while license activation, account state, machine identity, and future non-repo secrets belong under `~/.worker/`. This keeps the `.worker` vocabulary consistent without storing license material in the target repo.
Date: 2026-05-08

Decision: Support `SHIPBYSUNDAY_WORKER_HOME` as an internal machine-state override.
Rationale: Tests, CI, and support smoke need isolated machine-level license/account state. The customer default remains `~/.worker/`, and the installer should avoid the generic `WORKER_HOME` name because it may collide with other tooling.
Date: 2026-05-08

Decision: Use browser/device-code activation for v1 licensing.
Rationale: The installer should show a one-time code, open or print a short activation URL, and poll until the existing web account/access system returns a revocable machine credential for `~/.worker/`. Repo pairing tokens remain legacy workspace-runner infrastructure, and license-key paste can be a later support fallback.
Date: 2026-05-08

Decision: Install into `apps/worker`, forward through `scripts/run-worker.sh`, and store local proof under `.worker/`.
Rationale: These names are clearer than the old `runtime` and `.sbs` vocabulary and line up with the user's mental model that the installed source is the Worker.
Date: 2026-05-08

Decision: Keep Worker dependencies self-contained.
Rationale: Root `package.json` should only receive forwarding scripts. `apps/worker` should carry its own `package.json`, committed `bun.lock`, tests, manifests, and dependencies.
Date: 2026-05-08

Decision: Make the installed Worker package Bun-first for v1.
Rationale: Worker and Arena proved Bun. The target repo may use another package manager for app code, but the Worker package should use one deterministic runtime path.
Date: 2026-05-08

Decision: Provision Bun as a private Worker-managed toolchain when needed.
Rationale: Customers should not have to install Bun globally or switch their app package manager just because Worker Foundations is Bun-first internally. The native installer should prefer an existing compatible `bun` on `PATH`, but if Bun is missing or unsuitable it should provision a pinned Worker-managed Bun runtime under `~/.worker/toolchains/` and make `scripts/run-worker.sh` discover it through `SHIPBYSUNDAY_WORKER_HOME` or the default `~/.worker/` layout. Root package scripts should remain runnable through the target repo's package manager and then forward into the Worker-managed Bun runtime. Toolchain setup must not leak absolute paths into tracked reports or manifests.
Date: 2026-05-08

Decision: Auto-commit after proof.
Rationale: The installer should create or reuse `shipbysunday/install`, run selected proof, and commit locally with `feat(worker): install planning operating system` only when proof passes. It should not push or open a PR by default.
Date: 2026-05-08

Decision: Block unsafe existing install branches.
Rationale: `shipbysunday/install` may be reused only when the current branch is already that branch with a clean worktree, or when the existing branch is equal to or an ancestor of the current clean base and checkout is safe. If it contains unmerged prior installer work, the installer should block and ask the user to review, delete, or merge that branch first.
Date: 2026-05-08

Decision: Exclude `execplan:feature` from the v1 public root script surface.
Rationale: The product is installing a strong repo-local operating system so Codex can work correctly; it is not running an automatic feature builder during install.
Date: 2026-05-08

Decision: Make every customer install phase required.
Rationale: A partial Worker Foundations install would be a broken product surface. The interactive checklist should show required phases and blocked reasons, then let the user continue or cancel. Worker source, Worker toolchain, repo commands, agent instructions, Program and ExecPlan docs, prompt contracts, starter Program, validation proof, local commit, Codex safety setup, and auto-kickoff are all part of the golden path. Developer/test flags can skip commit, Codex safety setup, or kickoff, but the normal customer flow should not.
Date: 2026-05-08

Decision: Make noninteractive agent/dev mode a v1 requirement.
Rationale: Agents, fixture tests, and support smoke need deterministic output. `shipbysunday install --yes`, `shipbysunday install --json`, `shipbysunday install --repo <path> --yes --json`, and `shipbysunday install --dry-run --json` should run the full required install, fail on conflicts rather than prompting, preserve the same clean-worktree/license/proof gates, and emit machine-readable status. Since auto-commit and auto-kickoff are part of the golden path, `--yes` should commit and kick off after proof passes unless the caller passes explicit developer/test flags such as `--no-commit` or `--no-kickoff`.
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

## Outcomes & Retrospective

This plan is complete. The first implementation makes Worker Foundations installation a runnable product path rather than only a research conclusion. It shipped the local-runner command surface, first visible Worker source templates, sync-safe plan/result artifacts, dogfood Program and child ExecPlan proof, proof-gated commit support, managed Bun import from safe local sources, and Arena read-only dry-run smoke. The intentionally deferred gaps are native executable packaging, browser/device license activation, bundled or downloaded Bun provisioning, full interactive checklist polish, CI patching, and non-JS repo support; those belong in later Program slices rather than this completed ExecPlan.

## Context and Orientation

The local-runner package lives under `packages/local-runner/`. The current CLI enters through `packages/local-runner/src/cli.ts` and still uses the old `ship-by-sunday` package/bin name. This slice should move the customer-facing installer toward `shipbysunday install` and `shipbysunday i`, while preserving whatever internal package compatibility is needed during implementation. The completed docs operating-system command surface lives in `packages/local-runner/src/commands/docs-operating-system.ts` and related workflow modules under `packages/local-runner/src/workflows/docs-operating-system-adoption/`. Tests live under `packages/local-runner/tests/`.

The existing root docs validators live outside the local-runner package under `scripts/markdown-metadata/`, `scripts/programs/`, and `scripts/exec-plan/`. The completed Worker-grade docs Program under `docs/programs/completed/2026-05-06-worker-grade-docs-operating-system-adoption/` explains the existing wrapper-only docs operating-system boundary and why runtime install was deferred.

Arena CRM is the proof spike. Its useful branch installed Worker-style contracts, a forwarding script, a Bun runtime package, root planning scripts, prompt contracts, validators, and dogfood Program/ExecPlan files. Treat those commits as reference behavior, not as a blind copy source. The productized names are `scripts/run-worker.sh`, `apps/worker`, and `.worker/`.

### In Scope

Add a customer-facing `shipbysunday install` command and `shipbysunday i` alias that run from the target repo root by default. A `--repo <path>` mode may exist for testing and support, but it should not be the primary customer path.

Add install-plan artifacts under `.worker/**` that record target repo facts, operations, conflicts, proof commands, dogfood state, and sync-safe summaries.

Install or template visible Worker source into the target repo, including Program/ExecPlan contracts and prompts, validators, `program:write-child-plan`, `execplan:write`, `execplan:grill`, `execplan:build`, `execplan:validate`, `scripts/run-worker.sh`, `apps/worker`, package scripts, and `.worker/` ignore protection.

Add conflict-aware handling for package scripts, `apps/worker`, `scripts/run-worker.sh`, docs prompts, Program indexes, `.git/info/exclude`, and instruction surfaces.

Add dogfood proof that creates a Program packet and then uses the installed `program:write-child-plan` command to create a Program-linked child ExecPlan using immutable planning-brief provenance.

Add focused local-runner tests and fixture coverage for sparse package.json repos, already-partial docs-core repos, and an Arena-harness-shaped repo.

### Out Of Scope

Do not finish the full native distribution channel, package signing, or app download surface unless required for the local installer proof.

Do not install Worker-full state such as notes, goals, projects, topology, worker role docs, provider integrations, Telegram/Discord, Browser Harness, Things, launchd, dashboards, control panels, target app-stack process commands, or `execplan:feature`.

Do not configure CI, providers, environment variables, app servers, Convex, Clerk, Stripe, PostHog, Vercel, GitHub, or other external systems. The install report may include a suggested CI snippet, but the installer should not patch `.github/workflows/**` in v1.

Do not overwrite owner-authored target repo files because their names match templates.

Do not touch `.worktrees/`.

## Plan of Work

Start by reading the current local-runner command and workflow structure. Identify the shared helpers from docs operating-system adoption that can be reused for package-manager detection, sync-safe proof, package script patching, and package smoke, then create a Worker Foundations-specific workflow boundary instead of overloading the docs operating-system command.

Add CLI parsing for `shipbysunday install` and `shipbysunday i`. The default repo is the current Git repository. The command should inspect first, require a clean worktree before mutation, verify license state under `~/.worker/` after basic repo validation, support `SHIPBYSUNDAY_WORKER_HOME` for isolated tests/support smoke, run browser/device-code activation in interactive mode when no credential exists, install or refresh the internal Worker-managed Codex permission profiles, present the grouped interactive checklist, and support noninteractive agent/dev flags such as `--yes`, `--json`, and `--repo <path>` where they make implementation and smoke tests deterministic.

Create a new workflow module under a feature-specific path such as `packages/local-runner/src/workflows/worker-foundations-install/`. Keep inspect, plan, apply, dogfood, and proof as separate functions so tests can exercise each phase without touching a real repo.

Define internal bundle metadata without exposing profiles to users. The default bundle is Worker Foundations. Later bundles can exist internally, but the v1 customer path should not ask the user to choose a profile.

Add fixture templates or renderer functions for the first source subset. Prefer rendering from typed data where target repo values differ, and use static templates only for stable files. Do not embed Arena-specific folder names or project assumptions in the templates.

Implement structured patching. Parse root `package.json`, patch root package scripts by exact key, write `.git/info/exclude` and `.worker/.gitignore` idempotently, create directories only when safe, and write source files through create-or-managed-update helpers. Unknown same-name files should produce conflicts before writes.

Implement dogfood proof. After apply, create a real Worker Foundations adoption Program packet for the install handoff, then run installed `program:write-child-plan` to create one Program-linked child ExecPlan. The child ExecPlan must point at a versioned planning brief file.

Implement proof-gated local commit. The installer should create or safely reuse `shipbysunday/install`, run validation, write `docs/worker/install-report.md`, and create `feat(worker): install planning operating system` only after selected proof passes. Existing branch reuse must block if the branch contains unmerged prior installer work. If proof fails, leave changes uncommitted and name the failing commands.

Update docs and Program truth after implementation. Keep this ExecPlan's `Progress`, `Surprises & Discoveries`, `Decision Log`, `Outcomes & Retrospective`, and `Artifacts and Notes` current.

## Milestones

The first milestone is command shape and plan-only proof. At the end, `shipbysunday install --repo <fixture> --dry-run --json` or the equivalent local test invocation inspects a fixture repo and writes a sync-safe install plan without source mutation. Tests prove planned operations, required phase rows, unsupported target handling, and sync-safe artifact shape.

The second milestone is conflict-aware apply for the first source subset. At the end, the installer patches `package.json`, `.git/info/exclude`, Program/ExecPlan docs, prompts, `scripts/run-worker.sh`, and `apps/worker` source in a fixture repo when safe, while blocking unknown same-name content. Tests prove idempotent reruns and conflict states.

The third milestone is dogfood proof. At the end, the installed target repo can run the canonical validation commands or report blocked proof, and the installer creates a Program packet plus Program-linked child ExecPlan through the installed command surface with immutable planning-brief provenance.

The fourth milestone is proof-gated commit and Arena-shaped smoke coverage. At the end, a fixture or disposable Arena clone that starts with harness-shaped validation is migrated to the Worker Foundations surface, proof passes, and the installer creates a local commit on `shipbysunday/install`.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Read the planning and implementation context:

    sed -n '1,220p' docs/programs/active/2026-05-07-sbs-worker-foundations-installer/program.md
    sed -n '1,220p' docs/programs/active/2026-05-07-sbs-worker-foundations-installer/planning-brief-2.md
    sed -n '1,220p' docs/programs/completed/2026-05-06-worker-grade-docs-operating-system-adoption/program.md
    sed -n '1,220p' packages/local-runner/src/cli.ts
    sed -n '1,260p' packages/local-runner/src/commands/docs-operating-system.ts
    find packages/local-runner/src/workflows/docs-operating-system-adoption -maxdepth 2 -type f -print | sort

Inspect package and test conventions:

    sed -n '1,220p' packages/local-runner/package.json
    find packages/local-runner/tests -maxdepth 1 -type f -print | sort

After implementing command parsing and workflow phases, run focused tests:

    bun run --cwd packages/local-runner test -- worker-foundations-install.test.ts cli-help.test.ts

After implementing apply and dogfood behavior, run docs operating-system regression tests as well:

    bun run --cwd packages/local-runner test -- docs-operating-system-command.test.ts docs-operating-system-install-plan.test.ts docs-operating-system-package-script-patching.test.ts

Before closeout, run build, package, and docs validation:

    bun run --cwd packages/local-runner build
    bun run --cwd packages/local-runner package:smoke
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-07-install-worker-foundations.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/active/2026-05-07-sbs-worker-foundations-installer docs/exec-plans/active/2026-05-07-install-worker-foundations.md
    git diff --check

## Validation and Acceptance

Acceptance requires observable installer behavior. A fixture target repo with no Worker Foundations install should receive an install plan, visible Worker source under `apps/worker`, root forwarding package scripts, `.worker/` ignore protection, and dogfood Program/ExecPlan proof. A fixture target repo with same-name owner-authored files should block or manage those changes without overwriting content. An Arena-harness-shaped fixture should migrate to canonical Worker commands and no longer expose a parallel harness as the primary validation surface.

The installed target repo should be able to run or honestly block these commands through its detected root package manager after apply:

- `<package-manager> run programs:lint`
- `<package-manager> run plans:lint`
- `<package-manager> run markdown:lint`
- `<package-manager> run docs:validate`
- `<package-manager> run program:write-child-plan -- --program-id <id> --plan <path>`
- `<package-manager> run execplan:validate` or another bounded ExecPlan validation command
- `<package-manager> run worker:test`

Proof artifacts must not include raw logs, raw source, package script bodies, local absolute paths, secrets, dependency versions, or Codex transcripts. Successful proof should create a local commit and should not push or open a pull request.

### Test Commands

Run the focused local-runner test suite for this slice:

    bun run --cwd packages/local-runner test -- worker-foundations-install.test.ts cli-help.test.ts

Run regression tests for the existing docs operating-system command surface:

    bun run --cwd packages/local-runner test -- docs-operating-system-command.test.ts docs-operating-system-install-plan.test.ts docs-operating-system-package-script-patching.test.ts

Run package build and smoke when CLI packaging changes:

    bun run --cwd packages/local-runner build
    bun run --cwd packages/local-runner package:smoke

Run planning docs validation:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-07-install-worker-foundations.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/active/2026-05-07-sbs-worker-foundations-installer docs/exec-plans/active/2026-05-07-install-worker-foundations.md
    git diff --check

## Idempotence and Recovery

The installer must be safe to rerun. Dry-run should only refresh `.worker/**` artifacts. Apply should keep recognized managed files stable, avoid duplicate script entries, avoid duplicate ignore entries, and block if an owner changes a managed target unexpectedly.

If apply fails after partial writes, proof should name touched repo-relative paths and the phase that failed. Recovery should be ordinary Git review of the target repo plus rerunning the installer after conflicts are resolved.

The dogfood Program and child ExecPlan creation path should be create-only unless the target repo already has a recognized installer-managed handoff Program. If a target path already exists and is not recognized as managed, block rather than overwrite.

## Artifacts and Notes

Reference Program packet:

    docs/programs/active/2026-05-07-sbs-worker-foundations-installer/

Arena research commits:

    2fd0211ccf26c8e987a1979cbbac0e14e2d3d07f
    143de7e6a5b10bae370922c8599bf4adc9eb69a6
    8ad93149d3f2fffdf2d25ee5b783062a9da39208

Keep final proof snippets short and sync-safe in this section after implementation.

First implementation files:

- `packages/local-runner/src/commands/install.ts`
- `packages/local-runner/src/workflows/worker-foundations-install/manifest.ts`
- `packages/local-runner/src/workflows/worker-foundations-install/workflow.ts`
- `packages/local-runner/tests/worker-foundations-install.test.ts`

Read-only Arena CRM smoke:

    bun --cwd packages/local-runner src/cli.ts install --repo <arena-crm-checkout> --dry-run --json --no-kickoff

Result: sync-safe blocked dry-run, no target mutation, Bun available on PATH, legacy `scripts/run-runtime.sh` scripts planned as managed updates, blocked on missing local license activation.

## Interfaces and Dependencies

This slice depends on the local-runner CLI in `packages/local-runner/src/cli.ts`, the existing docs operating-system implementation in `packages/local-runner/src/commands/docs-operating-system.ts`, workflow helpers under `packages/local-runner/src/workflows/docs-operating-system-adoption/`, package tests under `packages/local-runner/tests/`, package metadata in `packages/local-runner/package.json`, Program validators under `scripts/programs/`, ExecPlan validators under `scripts/exec-plan/`, markdown validators under `scripts/markdown-metadata/`, and the docs contracts in `docs/programs/PROGRAMS.md` and `docs/exec-plans/PLANS.md`.

The target repo-facing interface is the installed command surface: root package scripts, `scripts/run-worker.sh`, `apps/worker`, Program and ExecPlan docs, prompt docs, validators, `.worker/` ignore entries, `.worker/**` proof artifacts, and `docs/worker/install-report.md`.
