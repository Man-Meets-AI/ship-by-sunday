---
title: Worker Foundations Installer Normalized Direction
summary: Normalized product direction for installing a visible Worker operating system into another repo.
docType: program_normalized_pass
status: active
read_when:
  - Choosing the first Worker Foundations installer slice.
  - Separating the Worker Foundations install from full Worker state installation.
---

# Worker Foundations Installer Normalized Direction

## Direction

Ship by Sunday should add a Worker Foundations installer that installs visible, repo-local Worker source into another codebase. The native `shipbysunday` executable owns discovery, templating, conflict classification, updates, and proof. The target repo owns the installed source after apply.

The golden customer path is `shipbysunday install`, with `shipbysunday i` as the short alias. Users should not pick an install profile. The default Worker Foundations bundle includes the Program and ExecPlan docs contracts, prompt inventory, markdown/Program/ExecPlan validators, `program:write-child-plan`, bounded ExecPlan commands, `scripts/run-worker.sh`, `apps/worker`, target package scripts, `.worker/` local-state protection, agent instructions, install report, dogfood proof, and internal Worker-managed Codex permission profiles for the foreground kickoff safety rail. It does not include all Worker-specific runtime state.

## Install Bundle

The v1 bundle should be intentionally small and strong. It installs `programs:lint`, `plans:lint`, `markdown:lint`, `docs:validate`, `program:write-child-plan`, `execplan:write`, `execplan:grill`, `execplan:build`, `execplan:validate`, and `worker:test`. It does not expose `execplan:feature`.

The installed Worker package is Bun-first and self-contained under `apps/worker`. Root `package.json` only forwards commands through `scripts/run-worker.sh`; the customer app package manager is otherwise left alone. The native installer should provision a private Worker-managed Bun runtime under `~/.worker/toolchains/` when the machine lacks a compatible Bun on `PATH`, so customers do not have to install Bun globally.

Full Worker state remains deferred. It may later install Worker state, legibility, dashboard, control-panel, topology, provider, or app-stack process surfaces, but those are not portable enough for the first Program.

## Install Flow

The installer should run in explicit phases:

1. Inspect the target repo for package manager, scripts, docs layout, active Programs, ExecPlans, prompts, instruction files, ignore state, existing Worker source, and same-name conflicts.
2. Verify license state outside the target repo under `~/.worker/` before source writes.
3. Present the grouped confirmation checklist with all install phases required; blocked rows show reasons, and the user can continue or cancel rather than partially deselect.
4. Create or reuse `shipbysunday/install`.
5. Write sync-safe local proof under `.worker/**`.
6. Apply docs contracts, prompts, validators, Worker source, root scripts, agent instructions, and ignore protection only where the plan says the operation is safe.
7. Dogfood the installed system by creating a Program packet and child ExecPlan through the installed command surface.
8. Run proof commands and record passed, failed, and blocked outcomes without raw logs, secrets, package script bodies, or local absolute paths.
9. Write `docs/worker/install-report.md`.
10. Auto-commit locally only after selected proof passes.

## Source Ownership

Repo-local source is the product requirement. Target repos should receive inspectable modules rather than opaque command wrappers for the Worker behavior. This lets agents adapt the local Worker package, fix validation drift, and understand the command surface without reading Ship by Sunday internals.

The native installer still matters. It should create the install plan, copy cleaned templates, patch structured files, classify conflicts, run updates, and produce proof.

## Boundary

The first slice should not finish app download distribution, install provider secrets, start target app processes, configure CI, or add Worker's stateful operating surfaces. It should add the command shape and implementation path for local installation, with tests and a smoke target proving it can produce the Arena-style result from a harness-shaped repo.
