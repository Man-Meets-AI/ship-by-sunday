---
title: Install Worker Foundations Planning Runtime
status: active
created_at: 2026-05-07
completed_at: null
summary: Add the first Worker Foundations installer path that installs visible repo-local planning-runtime source into a target repo and proves it by dogfooding the Program loop.
post_build_recap: null
program_id: sbs-worker-foundations-installer
planning_brief: docs/programs/active/2026-05-07-sbs-worker-foundations-installer/planning-brief-1.md
read_when:
  - Implementing `ship-by-sunday worker install --profile planning-runtime`.
  - Changing local-runner install profiles, Worker Foundations templates, or Arena smoke proof.
  - Reviewing how repo-local planning-runtime installation differs from the wrapper-only docs operating-system runner.
---

# Install Worker Foundations Planning Runtime

This is a living execution plan for the first Worker Foundations installer slice.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The current docs operating-system runner can install or expose useful docs commands, but Arena CRM showed that the more valuable product is a visible repo-local planning/runtime operating system. After this slice, Ship by Sunday should have a first `worker install` path that can inspect a target repo, plan a `planning-runtime` install, apply safe repo-local source, dogfood the installed Program loop, and record proof.

The visible user outcome is simple: from a target repo, a user or agent can run a Ship by Sunday installer command and receive local files, scripts, prompts, validators, and a first Program/ExecPlan proof that future agents can inspect without chat history.

## Progress

- [x] 2026-05-07: Created the owning Program packet and this child ExecPlan from `planning-brief-1.md`.
- [ ] Inspect the current local-runner CLI, docs operating-system command surface, package smoke, and install-plan helpers before changing code.
- [ ] Define the `worker install` command shape and `planning-core` / `planning-runtime` profile model.
- [ ] Implement sync-safe inspect and install-plan artifacts under `.sbs/worker-install/**`.
- [ ] Implement conflict-aware apply for the first planning-runtime source subset.
- [ ] Add dogfood proof that creates or validates a Program packet and Program-linked child ExecPlan in the target repo.
- [ ] Add Arena-harness or equivalent fixture coverage.
- [ ] Run focused local-runner, Program, ExecPlan, markdown, and diff validation.

## Surprises & Discoveries

No implementation discoveries have been recorded yet. Update this section after inspecting the current local-runner code and the Worker/Arena runtime source shapes.

## Decision Log

Decision: Install visible source for planning-runtime behavior.
Rationale: Arena worked because the target repo contained inspectable local source. Keeping all behavior inside the package would repeat the wrapper-only limitation.
Date: 2026-05-07

Decision: Start with `planning-runtime`, not `worker-full`.
Rationale: Program/ExecPlan lifecycle, prompts, validators, runtime command forwarding, and dogfood proof are portable. Worker-specific state, providers, dashboards, topology, and app-stack commands are not.
Date: 2026-05-07

Decision: Treat dogfood as part of install proof.
Rationale: Copying files does not prove the operating system works. A real target Program and child ExecPlan prove the installed loop can be used by the next agent.
Date: 2026-05-07

## Outcomes & Retrospective

This plan is active. The intended outcome is a first implementation that makes Worker Foundations installation a runnable product path rather than a research conclusion. The retrospective should compare the shipped behavior against the Arena manual proof and name any intentionally deferred runtime or distribution gaps.

## Context and Orientation

The local-runner package lives under `packages/local-runner/`. The current CLI enters through `packages/local-runner/src/cli.ts`. The completed docs operating-system command surface lives in `packages/local-runner/src/commands/docs-operating-system.ts` and related workflow modules under `packages/local-runner/src/workflows/docs-operating-system-adoption/`. Tests live under `packages/local-runner/tests/`.

The existing root docs validators live outside the local-runner package under `scripts/markdown-metadata/`, `scripts/programs/`, and `scripts/exec-plan/`. The completed Worker-grade docs Program under `docs/programs/completed/2026-05-06-worker-grade-docs-operating-system-adoption/` explains the existing wrapper-only docs operating-system boundary and why runtime install was deferred.

Arena CRM is the proof spike. Its useful branch installed Worker-style contracts, `scripts/run-runtime.sh`, `apps/runtime`, root planning scripts, prompt contracts, validators, and dogfood Program/ExecPlan files. Treat those commits as reference behavior, not as a blind copy source.

### In Scope

Add a local-runner `worker install` command namespace with a `planning-runtime` profile and a documented `planning-core` profile boundary.

Add install-plan artifacts under `.sbs/worker-install/**` that record target repo facts, selected profile, operations, conflicts, proof commands, dogfood state, and sync-safe summaries.

Install or template visible planning-runtime source into the target repo, including Program/ExecPlan contracts and prompts, validators, `program:write-child-plan`, `execplan:*` lifecycle commands, `scripts/run-runtime.sh`, `apps/runtime`, package scripts, and `.runtime/` ignore entries as the first cleaned subset allows.

Add conflict-aware handling for package scripts, `.gitignore`, `apps/runtime`, `scripts/run-runtime.sh`, docs prompts, Program indexes, and instruction surfaces.

Add dogfood proof that creates or validates a Program packet and Program-linked child ExecPlan using immutable planning-brief provenance.

Add focused local-runner tests and fixture coverage for sparse repos, already-partial docs-core repos, and an Arena-harness-shaped repo.

### Out Of Scope

Do not publish a public package, choose the final `sbs-worker` package name, configure release automation, or add package signing.

Do not install Worker-full state such as notes, goals, projects, topology, worker role docs, provider integrations, Telegram/Discord, Browser Harness, Things, launchd, dashboards, control panels, or target app-stack process commands.

Do not configure CI, providers, environment variables, app servers, Convex, Clerk, Stripe, PostHog, Vercel, GitHub, or other external systems.

Do not overwrite owner-authored target repo files because their names match templates.

Do not touch `.worktrees/`.

## Plan of Work

Start by reading the current local-runner command and workflow structure. Identify the shared helpers from docs operating-system adoption that can be reused for package-manager detection, sync-safe proof, package script patching, and package smoke, then create a Worker Foundations-specific workflow boundary instead of overloading the docs operating-system command.

Add CLI parsing for `ship-by-sunday worker install`. The command should require `--profile planning-runtime` for the first implementation, accept `--repo <path>`, and support dry-run or plan-only behavior before source writes. If existing CLI conventions require a different flag name for mutation confirmation, follow the local pattern and record it here.

Create a new workflow module under a feature-specific path such as `packages/local-runner/src/workflows/worker-foundations-install/`. Keep inspect, plan, apply, dogfood, and proof as separate functions so tests can exercise each phase without touching a real repo.

Define profile metadata. `planning-core` should be represented even if it is not fully implemented in this slice. `planning-runtime` should resolve into explicit modules and file operations. `worker-full` should be a recognized deferred profile that returns a clear blocked or unsupported status rather than silently doing nothing.

Add fixture templates or renderer functions for the first source subset. Prefer rendering from typed data where target repo values differ, and use static templates only for stable files. Do not embed Arena-specific folder names or project assumptions in the templates.

Implement structured patching. Parse `package.json`, patch `.gitignore` idempotently, create directories only when safe, and write source files through create-or-managed-update helpers. Unknown same-name files should produce conflicts before writes.

Implement dogfood proof. After apply, run the installed commands from the target repo root where possible. If the target repo has no active Program packet, create a minimal real Program packet for the install handoff and one Program-linked child ExecPlan. The child ExecPlan must point at a versioned planning brief file.

Update docs and Program truth after implementation. Keep this ExecPlan's `Progress`, `Surprises & Discoveries`, `Decision Log`, `Outcomes & Retrospective`, and `Artifacts and Notes` current.

## Milestones

The first milestone is command shape and plan-only proof. At the end, `ship-by-sunday worker install --profile planning-runtime --repo <fixture> --dry-run` or the equivalent local-runner syntax inspects a fixture repo and writes a sync-safe install plan without source mutation. Tests prove selected profile modules, unsupported profile handling, and sync-safe artifact shape.

The second milestone is conflict-aware apply for the first source subset. At the end, the installer patches `package.json`, `.gitignore`, Program/ExecPlan docs, prompts, `scripts/run-runtime.sh`, and `apps/runtime` source in a fixture repo when safe, while blocking unknown same-name content. Tests prove idempotent reruns and conflict states.

The third milestone is dogfood proof. At the end, the installed target repo can run the canonical validation commands or report blocked proof, and the installer creates or validates a Program packet plus Program-linked child ExecPlan with immutable planning-brief provenance.

The fourth milestone is Arena-shaped smoke coverage. At the end, a fixture or disposable Arena clone that starts with harness-shaped validation is migrated to the Worker Foundations planning-runtime surface, with proof showing the canonical commands and dogfood Program loop.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Read the planning and implementation context:

    sed -n '1,220p' docs/programs/active/2026-05-07-sbs-worker-foundations-installer/program.md
    sed -n '1,220p' docs/programs/active/2026-05-07-sbs-worker-foundations-installer/planning-brief-1.md
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
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-07-install-worker-foundations-planning-runtime.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/active/2026-05-07-sbs-worker-foundations-installer docs/exec-plans/active/2026-05-07-install-worker-foundations-planning-runtime.md
    git diff --check

## Validation and Acceptance

Acceptance requires observable installer behavior. A fixture target repo with no Worker Foundations install should receive an install plan, visible planning-runtime source, package scripts, `.runtime/` ignore entries, and dogfood Program/ExecPlan proof. A fixture target repo with same-name owner-authored files should block or manage those changes without overwriting content. An Arena-harness-shaped fixture should migrate to canonical Worker/SBS commands and no longer expose a parallel harness as the primary validation surface.

The installed target repo should be able to run or honestly block these commands after apply:

- `bun run programs:lint`
- `bun run plans:lint`
- `bun run markdown:lint`
- `bun run docs:validate`
- `bun run program:write-child-plan -- --program-id <id> --plan <path>`
- at least one `bun run execplan:*` help or dry-run command

Proof artifacts must not include raw logs, raw source, package script bodies, local absolute paths, secrets, dependency versions, or Codex transcripts.

### Test Commands

Run the focused local-runner test suite for this slice:

    bun run --cwd packages/local-runner test -- worker-foundations-install.test.ts cli-help.test.ts

Run regression tests for the existing docs operating-system command surface:

    bun run --cwd packages/local-runner test -- docs-operating-system-command.test.ts docs-operating-system-install-plan.test.ts docs-operating-system-package-script-patching.test.ts

Run package build and smoke when CLI packaging changes:

    bun run --cwd packages/local-runner build
    bun run --cwd packages/local-runner package:smoke

Run planning docs validation:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-07-install-worker-foundations-planning-runtime.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/active/2026-05-07-sbs-worker-foundations-installer docs/exec-plans/active/2026-05-07-install-worker-foundations-planning-runtime.md
    git diff --check

## Idempotence and Recovery

The installer must be safe to rerun. Dry-run should only refresh `.sbs/worker-install/**` artifacts. Apply should keep recognized managed files stable, avoid duplicate script entries, avoid duplicate `.gitignore` entries, and block if an owner changes a managed target unexpectedly.

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

## Interfaces and Dependencies

This slice depends on the local-runner CLI in `packages/local-runner/src/cli.ts`, the existing docs operating-system implementation in `packages/local-runner/src/commands/docs-operating-system.ts`, workflow helpers under `packages/local-runner/src/workflows/docs-operating-system-adoption/`, package tests under `packages/local-runner/tests/`, package metadata in `packages/local-runner/package.json`, Program validators under `scripts/programs/`, ExecPlan validators under `scripts/exec-plan/`, markdown validators under `scripts/markdown-metadata/`, and the docs contracts in `docs/programs/PROGRAMS.md` and `docs/exec-plans/PLANS.md`.

The target repo-facing interface is the installed command surface: root package scripts, `scripts/run-runtime.sh`, `apps/runtime`, Program and ExecPlan docs, prompt docs, validators, `.runtime/` ignore entries, and `.sbs/worker-install/**` proof artifacts.
