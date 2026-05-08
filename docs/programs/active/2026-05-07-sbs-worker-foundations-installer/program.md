---
program_id: sbs-worker-foundations-installer
title: SBS Worker Foundations Installer
status: active
created_at: 2026-05-07
completed_at: null
summary: Productize the Worker/Arena planning-runtime proof into an installer that gives another repo visible, repo-local Program, ExecPlan, prompt, validator, and runtime workflow source.
post_build_recap: null
read_when:
  - Planning or implementing the Worker Foundations installer.
  - Changing local-runner docs operating-system install profiles, Program/ExecPlan tooling, or repo-local runtime installation.
  - Smoke-testing Worker-style planning/runtime setup in Arena CRM or another customer repo.
---

# SBS Worker Foundations Installer

This Program is a living initiative document for turning the Arena CRM Worker-foundations proof into a repeatable product install path.

This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

The current local runner can install a portable docs operating-system command surface, but the Arena CRM spike showed the higher-value product shape: install visible, repo-local Worker planning/runtime source that a coding agent can inspect, dogfood, adapt, and trust inside the target repo. The product should let someone run one command from a target codebase, receive the local Worker Foundations substrate, and immediately continue with checked-in Programs, ExecPlans, prompts, validators, lifecycle commands, and proof.

This initiative is moving correctly when a target repo can receive a cleaned planning-runtime profile, run canonical commands such as `programs:lint`, `plans:lint`, `markdown:lint`, `docs:validate`, `program:write-child-plan`, and `execplan:*`, and prove the install by creating a real Program plus child ExecPlan inside the target repo. The installer package should remain the updater and distributor, while the installed source should be visible in the repo.

## Program Inputs

The durable packet artifacts for this Program live in `docs/programs/active/2026-05-07-sbs-worker-foundations-installer/`.

The research input is `research-pass-arena-worker-foundations.md`. The normalized product direction is `normalized-pass-worker-foundations-installer.md`. The accepted initiative decision is `converged-decision-packet.md`. Ordering is recorded in `dependency-graph.md` and `plan-split-recommendation.md`. Risk review is recorded in `cross-repo-review.md`. The current immutable implementation brief is `planning-brief-1.md`, and `current-planning-brief.txt` points at that brief.

Important prior context lives in the completed Program `docs/programs/completed/2026-05-06-worker-grade-docs-operating-system-adoption/program.md`. That Program shipped the portable docs-core wrapper model and explicitly deferred runtime installation. This Program starts where that boundary stopped.

## Current State

Ship by Sunday already has strong Program, ExecPlan, prompt, markdown, and local-runner docs-operating-system primitives. The completed Worker-grade docs Program added package-owned `ship-by-sunday docs-operating-system` commands, wrapper script patching, lockfile proof, quality refresh, native command proof, and local package artifact smoke. That result is useful but still hides the real behavior inside the package and gives target repos thin wrappers rather than a visible local operating system.

Arena CRM proved a different path. The useful spike removed the temporary harness layer, installed Worker-style root scripts, added `scripts/run-runtime.sh`, created an `apps/runtime` package, added YAML-backed Program and ExecPlan validation modules, added prompt contracts, added `program:write-child-plan`, added `execplan:*` lifecycle commands, and dogfooded the system with a real Program plus child ExecPlans. The key product signal was not any one validator. The key signal was that the target repo contained the ideal source shape, so another agent could inspect and use it without chat memory.

The current local-runner product does not yet expose a `worker install` command, does not model `planning-core` versus `planning-runtime` profiles, does not install repo-local runtime source, does not patch `.gitignore` for `.runtime/`, does not dogfood the target install by creating a Program and first child ExecPlan, and does not use Arena as a golden smoke target.

## Progress

- [x] 2026-05-07: Converted the Arena discovery into an active Program packet so the product direction is durable in the repo.
- [x] 2026-05-07: Chose the first product boundary: a planning-runtime installer that installs visible repo-local source instead of only hidden package-owned wrappers.
- [x] 2026-05-07: Created the first child ExecPlan at `docs/exec-plans/active/2026-05-07-install-worker-foundations-planning-runtime.md`.
- [ ] Implement the first child slice: `ship-by-sunday worker install --profile planning-runtime --repo <path>` with inspect, plan, apply, dogfood, and proof phases.
- [ ] Smoke the installer against Arena CRM or an Arena fixture that contains the harness-shaped starting point and the Worker-foundations target shape.
- [ ] Decide the public package name and distribution lane after local packed-artifact proof covers the installer path.

## Decision Log

Decision: Productize Worker Foundations as visible repo-local source, not as hidden package magic.
Rationale: Arena worked because the target repo contained inspectable `apps/runtime`, scripts, prompts, validators, and Program/ExecPlan contracts. Agents could reason from local source instead of depending on opaque installed behavior.
Date: 2026-05-07

Decision: Make the first install profile `planning-runtime`.
Rationale: `planning-core` is useful, but the new product insight is the repo-local runtime workflow layer around Programs and ExecPlans. `worker-full` should wait until planning-runtime is repeatable and does not copy Worker-specific state into unrelated repos.
Date: 2026-05-07

Decision: Keep the package as installer and updater.
Rationale: The target repo should own the installed operating-system source for inspectability and adaptation, while the published package should handle detection, templating, conflict handling, upgrades, and proof.
Date: 2026-05-07

Decision: Dogfood during installation.
Rationale: Copying files is not enough. The installer should prove the installed system by creating or validating a real target-repo Program packet and one child ExecPlan, then running the canonical validation commands.
Date: 2026-05-07

Decision: Treat Arena as the first golden adoption target.
Rationale: Arena exposed the real gap between harness-shaped docs validation and Worker-style planning-runtime operation. The installer must be able to reproduce that migration safely before broader product claims are credible.
Date: 2026-05-07

## Slice Ledger

The first active child ExecPlan is `docs/exec-plans/active/2026-05-07-install-worker-foundations-planning-runtime.md`. It carries `program_id: sbs-worker-foundations-installer` and `planning_brief: docs/programs/active/2026-05-07-sbs-worker-foundations-installer/planning-brief-1.md`.

Expected later slices are runtime template extraction and hardening, Arena golden smoke automation, update/idempotence handling for already-installed repos, and package distribution naming. Worker-specific state, provider setup, app-stack process management, dashboards, Telegram/Discord/control-panel surfaces, and full Worker operating state remain outside this first Program until a later brief explicitly admits them.

## Next Slice

The active child ExecPlan is `docs/exec-plans/active/2026-05-07-install-worker-foundations-planning-runtime.md`.

The remaining outcome for the next slice is a real installer command that can inspect a target repo, produce a safe install plan, apply the planning-runtime profile, create visible repo-local source, patch root commands and `.gitignore`, dogfood the installed Program loop, and produce sync-safe proof.

## Risks and Watchpoints

Do not copy all of Worker. Worker-specific runtime state, notes, goals, projects, topology, worker roles, provider setup, launchd assumptions, Telegram/Discord/control-panel surfaces, and app-stack process commands are not portable planning-runtime foundations.

Do not regress to hidden wrappers. The package can distribute and update the system, but the target repo must contain the source that future coding agents need to inspect.

Do not let the installer overwrite owner-authored files. Same-name scripts, `apps/runtime`, `scripts/run-runtime.sh`, `docs/prompts`, Program folders, and `AGENTS.md` sections need parsed conflict handling, managed sections, or explicit blocked states.

Do not call install proof complete because files were copied. Proof requires canonical commands to run or block honestly, and the dogfood Program/ExecPlan path must be exercised.

Do not make Arena-only assumptions canonical. Arena is the first golden target because it exposed the gap, not because every repo should inherit Arena's folder names or temporary harness decisions.

## Outcomes & Retrospective

This Program is active. The expected outcome is a productized Worker Foundations installer that can install the planning-runtime operating system into another repository and leave behind local source, commands, proof, and a durable handoff prompt that another agent can use without chat history.

## Validation and Acceptance

Program-level acceptance requires the installer to support at least one local package artifact proof and one real target-repo smoke proof. The accepted state should include:

- a documented CLI shape for `ship-by-sunday worker install --profile planning-runtime --repo <path>`
- profile resolution for `planning-core` and `planning-runtime`, with `worker-full` explicitly deferred
- an install plan artifact under `.sbs/worker-install/**`
- visible target-repo source for Program, ExecPlan, prompt, validation, and runtime workflow behavior
- root package scripts for the canonical Program/ExecPlan validation and lifecycle commands
- `.runtime/` ignored in the target repo
- same-name conflict handling for scripts, `apps/runtime`, `scripts/run-runtime.sh`, docs prompts, and instruction surfaces
- dogfood proof that creates or validates a target Program packet and child ExecPlan
- Arena CRM smoke evidence or an equivalent checked fixture that reproduces the harness-to-Worker-foundations migration

## Artifacts and Notes

Arena CRM's useful reference commits were `2fd0211ccf26c8e987a1979cbbac0e14e2d3d07f`, `143de7e6a5b10bae370922c8599bf4adc9eb69a6`, and `8ad93149d3f2fffdf2d25ee5b783062a9da39208` on the `sbs/worker-foundations` branch. They are research inputs, not files to copy blindly.

The completed Worker-grade docs Program remains the boundary record for what the existing docs runner already shipped and what it intentionally excluded.

## Interfaces and Dependencies

This Program depends on `packages/local-runner/src/cli.ts`, `packages/local-runner/src/commands/docs-operating-system.ts`, `packages/local-runner/src/workflows/docs-operating-system-adoption/`, local-runner tests under `packages/local-runner/tests/`, the root Program and ExecPlan validators under `scripts/programs/`, `scripts/exec-plan/`, and `scripts/markdown-metadata/`, docs contracts under `docs/programs/` and `docs/exec-plans/`, and the Worker/Arena runtime workflow shapes used as reference inputs.
