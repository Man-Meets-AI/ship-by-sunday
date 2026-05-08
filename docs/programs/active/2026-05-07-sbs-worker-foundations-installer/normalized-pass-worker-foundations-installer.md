---
title: Worker Foundations Installer Normalized Direction
summary: Normalized product direction for installing a visible Worker planning-runtime operating system into another repo.
docType: program_normalized_pass
status: active
read_when:
  - Choosing the first Worker Foundations installer slice.
  - Separating planning-runtime installation from full Worker runtime/state installation.
---

# Worker Foundations Installer Normalized Direction

## Direction

Ship by Sunday should add a Worker Foundations installer that installs visible, repo-local planning-runtime source into another codebase. The installer package owns discovery, templating, conflict classification, updates, and proof. The target repo owns the installed source after apply.

The first meaningful profile is `planning-runtime`. It includes the Program and ExecPlan docs contracts, prompt inventory, markdown/Program/ExecPlan validators, `program:write-child-plan`, ExecPlan lifecycle commands, `scripts/run-runtime.sh`, `apps/runtime`, target package scripts, `.runtime/` ignores, and dogfood proof. It does not include all Worker-specific runtime state.

## Profiles

`planning-core` should mean durable docs memory and validation without the lifecycle runtime package. It is useful for smaller repos and as an upgrade base.

`planning-runtime` should mean `planning-core` plus repo-local runtime command forwarding and lifecycle workflows. This is the Arena-proven profile and should be the first product target.

`worker-full` should remain deferred. It may later install Worker state, legibility, dashboard, control-panel, topology, provider, or app-stack process surfaces, but those are not portable enough for the first Program.

## Install Flow

The installer should run in explicit phases:

1. Inspect the target repo for package manager, scripts, docs layout, active Programs, ExecPlans, prompts, instruction files, `.gitignore`, existing runtime source, and same-name conflicts.
2. Write a sync-safe install plan under `.sbs/worker-install/**`.
3. Apply docs contracts, prompts, validators, runtime source, root scripts, and ignore entries only where the plan says the operation is safe.
4. Dogfood the installed system by writing or validating a Program packet and child ExecPlan through the installed command surface.
5. Run proof commands and record passed, failed, and blocked outcomes without raw logs, secrets, package script bodies, or local absolute paths.
6. Emit a handoff prompt that tells the next coding agent how to continue inside the target repo.

## Source Ownership

Repo-local source is the product requirement. Target repos should receive inspectable modules rather than opaque command wrappers for the planning-runtime behavior. This lets agents adapt the local runtime, fix validation drift, and understand the command surface without reading Ship by Sunday internals.

The package still matters. It should create the install plan, copy cleaned templates, patch structured files, classify conflicts, run updates, and produce proof.

## Boundary

The first slice should not publish a public package, install provider secrets, start target app processes, configure CI, or add Worker's stateful operating surfaces. It should add the command shape and implementation path for local installation, with tests and a smoke target proving it can produce the Arena-style result from a harness-shaped repo.
