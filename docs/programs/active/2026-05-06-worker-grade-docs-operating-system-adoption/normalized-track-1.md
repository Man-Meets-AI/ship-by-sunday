---
title: Worker-Grade Docs Operating System Normalized Track
summary: Normalized direction for expanding docs-spine adoption into portable tooling, validation, runtime bootstrap, and optional operating-surface installation.
docType: program_normalized_pass
status: active
read_when:
  - Choosing how to split the runner's Worker-grade docs operating-system install.
  - Deciding which Worker surfaces are portable core versus optional modules.
---

# Worker-Grade Docs Operating System Normalized Track

## Direction

The runner should install a Worker-grade docs operating system through explicit profiles and authority boundaries. The completed docs-spine apply workflow should remain the docs-only path. A new tooling install path should own scripts, package dependencies, validator files, runtime wrappers, runtime bootstrap, optional operating-surface modules, and proof.

The target result is not a clone of Worker content. The target result is parity of operating behavior: a fresh agent can read the docs spine, create Programs and ExecPlans, run validators, understand blocked setup, bootstrap runtime state when selected, and inspect proof artifacts.

## Portable Core

The portable core should be available to serious customer repos by default:

- Program packets with immutable planning briefs and `current-planning-brief.txt`
- ExecPlans with Program linkage and strict section validation
- prompt docs for Program funnel and ExecPlan writer, grill, execute, and validate flows
- path-family markdown linting with family-specific schemas
- docs-spine validation for required docs, route maps, stale paths, and generated-doc freshness
- package scripts for `programs:lint`, `plans:lint`, `markdown:lint`, `docs:validate`, and child-plan writing when supported
- proof artifacts under `.sbs/runs/<workflow-run-id>/`

## Optional Modules

The optional modules should be installed only when selected or when target evidence supports them:

- `workspace/notes/**` with `notes:lint`
- `workspace/goals/**` with `goals:validate`
- `workspace/projects/**` with `projects:validate`
- worker role docs with `workers:validate`
- `system/topology.json` with `topology:validate`
- runtime legibility commands such as `runtime:bootstrap`, `runtime:up`, `runtime:health`, `runtime:down`, and `worker-state:current`

Optional means honest. If a repo does not have a worker-state concept, the runner should not invent one just to match Worker.

## Authority Model

The current docs workflow can continue to write approved Markdown docs and one Program pointer file. It should not write `package.json`, lockfiles, runtime code, CI, provider settings, or root instruction files.

The new tooling workflow should require a distinct confirmation and produce a structured install plan. That plan should list proposed operations for package scripts, dependencies, validator files, runtime wrapper files, optional modules, conflicts, proof commands, and rollback notes.

The apply step should be deterministic. It should parse structured files, apply only declared operations, preserve existing user changes, and record conflicts instead of guessing.

## Same-Name Policy

Same-name behavior should be part of the contract:

- previous runner-owned docs can be replaced when recognized
- existing owner docs get managed sections when safe
- structured files get parsed patches
- package script collisions become keep, rename, replace-with-approval, or blocked
- unknown runtime files block until explicitly approved

This policy must be tested with real files, not only described in docs.

## Install Flow

The expected end-to-end flow is:

1. Scan the repo for package manager, scripts, dependencies, docs, instructions, validators, runtime state, and native gate.
2. Generate or apply the docs spine using the existing docs authority.
3. Generate a tooling install plan with proposed operations and conflict classifications.
4. Apply the tooling plan only with stronger confirmation.
5. Run installed validators and runtime bootstrap commands.
6. Record passed, failed, and blocked proof under `.sbs/runs/<workflow-run-id>/`.
7. Refresh Program state and write the next child planning brief if more slices remain.

## First Slice

The first child ExecPlan should implement the tooling install boundary and manifest before it tries to install every validator or runtime module. The slice should prove that the runner can inspect Worker, Ship by Sunday, Arena CRM, and sparse fixtures, then produce a deterministic install plan with correct same-name conflict handling.
