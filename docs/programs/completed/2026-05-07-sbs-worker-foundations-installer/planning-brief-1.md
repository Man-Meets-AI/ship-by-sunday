---
title: 'Planning Brief 1: Install Worker Foundations Planning Runtime'
program_id: sbs-worker-foundations-installer
brief_version: 1
status: superseded
summary: Implement the first Worker Foundations installer slice for a visible repo-local planning-runtime profile.
read_when:
  - Authoring or implementing the first Worker Foundations installer child ExecPlan.
  - Changing local-runner command shapes for installing planning-runtime foundations into another repo.
---

# Planning Brief 1: Install Worker Foundations Planning Runtime

The first child ExecPlan should be titled `Install Worker Foundations Planning Runtime`.

The goal is to add a real product command that starts the transition from wrapper-only docs tooling to visible repo-local Worker Foundations. The command shape should be `ship-by-sunday worker install --profile planning-runtime --repo <path>`. If the implementation keeps the package name as `ship-by-sunday`, the command namespace should still be `worker install`; a later distribution slice can decide whether `sbs-worker` becomes a package alias.

The first slice should implement the profile and install-plan model, inspect target repos, write a sync-safe install plan under `.sbs/worker-install/**`, apply the planning-runtime profile where conflict-free, and run proof commands. It should install visible target-repo source for the planning-runtime substrate, not just thin wrappers that hide behavior inside the package.

The `planning-runtime` profile should include the cleaned subset needed for the Arena-proven flow: Program/ExecPlan docs and prompts, markdown/Program/ExecPlan validators, `program:write-child-plan`, `execplan:write`, `execplan:grill`, `execplan:build`, `execplan:validate`, `execplan:feature`, `scripts/run-runtime.sh`, an `apps/runtime` package, root script aliases, and `.runtime/` ignore entries. It should explicitly exclude Worker-specific notes, goals, projects, topology, worker roles, provider integrations, launchd, dashboard/control-panel surfaces, Telegram/Discord, Browser Harness, Things, yt-dlp/ASR/OpenCut assumptions, CI/provider setup, and target app-stack process conventions.

The installer should have phases for inspect, plan, apply, dogfood, proof, and handoff. Dogfood means the target repo either already has a valid active Program plus child ExecPlan path or the installer creates a minimal real Program packet and one Program-linked child ExecPlan through the installed command surface. Child ExecPlans must stamp `program_id` and an immutable `planning_brief` path, never `current-planning-brief.txt`.

Same-name conflicts are part of the first slice. The installer should classify existing package scripts, `apps/runtime`, `scripts/run-runtime.sh`, docs prompt files, Program indexes, `.gitignore`, and instruction surfaces before writing. Unknown owner content should block or require a managed merge; it should not be overwritten.

Implementation should start in `packages/local-runner/src/cli.ts` and new local-runner workflow modules under `packages/local-runner/src/workflows/worker-foundations-install/` or an equivalently specific name. Tests should cover inspect/plan/apply behavior with sparse fixtures, existing docs-core fixtures, and an Arena-harness fixture. Avoid writing to the real Arena checkout in automated tests unless the command is explicitly pointed at a disposable clone or fixture.

Focused validation should include local-runner tests for the new command, docs operating-system regression tests, local-runner build, package smoke when the binary shape changes, Program lint, plan lint, markdown lint for this Program and child plan, and `git diff --check`.
