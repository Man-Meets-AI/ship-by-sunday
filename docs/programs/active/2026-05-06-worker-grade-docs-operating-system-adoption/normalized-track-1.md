---
title: Worker-Grade Docs Operating System Normalized Track
summary: Normalized direction for expanding docs-spine adoption into portable docs tooling and validation.
docType: program_normalized_pass
status: active
read_when:
  - Choosing how to split the runner's Worker-grade docs operating-system install.
  - Deciding which Worker surfaces are portable docs core versus out of scope.
---

# Worker-Grade Docs Operating System Normalized Track

## Direction

The runner should install a Worker-grade docs operating system through explicit profiles and authority boundaries. The completed docs-spine apply workflow should remain the docs-only path. A new tooling install path should own portable docs scripts, package dependencies, validator files, and proof.

The target result is not a clone of Worker content. The target result is parity of docs operating behavior: a fresh agent can read the docs spine, create Programs and ExecPlans, run validators, understand blocked setup, and inspect proof artifacts.

## Portable Core

The portable core should be available to serious customer repos by default:

- Program packets with immutable planning briefs and `current-planning-brief.txt`
- ExecPlans with Program linkage and strict section validation
- prompt docs for Program funnel and ExecPlan writer, grill, execute, and validate flows
- docs routing and navigation, including `docs/index.md`, root README routing, and tightly scoped instruction routing when explicitly approved
- path-family markdown linting with family-specific schemas
- docs-spine validation for required docs, route maps, stale paths, and generated-doc freshness
- package scripts for `programs:lint`, `plans:lint`, `markdown:lint`, `docs:validate`, and child-plan writing when supported
- proof artifacts under `.sbs/runs/<workflow-run-id>/`

## Out Of Scope

The runner should not install these surfaces in this Program:

- runtime bootstrap, runtime health, `.runtime` state, gateway/process supervision, or `ASSISTANT_RUNTIME_ROOT`
- Worker-specific operating state such as `workspace/notes/**`, `workspace/goals/**`, `workspace/projects/**`, worker role docs, `system/topology.json`, or worker-state commands
- CI/provider setup
- customer app-stack command conventions such as "run the dev server", except as discovered native proof
- broad root `AGENTS.md` rewrites

Out of scope means no install operation and no module in the first schema. The runner may report that a surface was detected or deferred, but it must not copy Worker-specific state into a customer repo.

## Authority Model

The current docs workflow can continue to write approved Markdown docs and one Program pointer file. It should not write `package.json`, lockfiles, runtime code, CI, provider settings, or root instruction files.

The new tooling workflow should require a distinct confirmation and produce a structured install plan. That plan should list proposed operations for package scripts, dependencies, validator files, conflicts, proof commands, and rollback notes.

The apply step should be deterministic. It should parse structured files, apply only declared operations, preserve existing user changes, and record conflicts instead of guessing.

Artifacts for the new workflow should live under `.sbs/docs-operating-system-adoption/**`. This keeps the existing docs-spine adoption namespace focused on the old docs-only workflow and gives the broader operating-system workflow room for separate `facts`, `docs-drafts`, `docs-apply`, `tooling-plan`, `tooling-apply`, and `proof` lanes.

## Same-Name Policy

Same-name behavior should be part of the contract:

- previous runner-owned docs can be replaced when recognized
- existing owner docs get managed sections when safe
- structured files get parsed patches
- package script collisions become keep, rename, replace-with-approval, or blocked
- runtime files, Worker-specific state files, CI/provider files, app-stack command wiring, and broad root `AGENTS.md` rewrites are out of scope and should be reported as deferred rather than installed

This policy must be tested with real files, not only described in docs.

## Install Flow

The expected end-to-end flow is:

1. Scan the repo for package manager, scripts, dependencies, docs, instructions, validators, and native gate.
2. Generate or apply the docs spine using the existing docs authority.
3. Generate a tooling install plan with proposed operations and conflict classifications.
4. Apply the tooling plan only with stronger confirmation.
5. Run installed validators and native proof commands.
6. Record passed, failed, and blocked proof under `.sbs/runs/<workflow-run-id>/`.
7. Refresh Program state and write the next child planning brief if more slices remain.

The workflow packet should separate execution permission from install selection. `profileName` remains the Codex or runner permission mode; `installProfile` selects the docs operating-system bundle.

Install profiles are presets, not monoliths. `worker-grade` should resolve into explicit portable docs modules such as docs spine, Programs, ExecPlans, prompts, markdown lint, docs validation, planning scripts, and proof artifacts. Each module should record whether it is already present, installable, selected, skipped, blocked, or in conflict.

The first `worker-grade` preset should have one tier: portable docs core modules.

Runtime modules and Worker-specific operating-state modules are deferred. Worker uses `apps/runtime` and Worker-owned state surfaces; another repo may use different process management or no matching state concept at all. That variability needs a separate design before the runner installs anything outside the portable docs core.

## First Slice

The first child ExecPlan should implement the tooling install boundary and manifest for portable docs core modules only. The slice should prove that the runner can inspect Worker, Ship by Sunday, Arena CRM, and sparse fixtures, then produce a deterministic install plan with correct same-name conflict handling.
