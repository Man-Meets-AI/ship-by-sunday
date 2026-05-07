---
title: Worker-Grade Docs Operating System Plan Split Recommendation
summary: Recommended child ExecPlan sequence for installing Worker-grade docs operating-system tooling through the local runner.
docType: program_plan_split
status: active
read_when:
  - Creating child ExecPlans for this Program.
  - Deciding which tooling install slice should happen first.
---

# Worker-Grade Docs Operating System Plan Split Recommendation

## Slice 1: Tooling Install Boundary And Manifest

Create the new authority boundary for non-docs installation. Add the workflow packet shape, confirmation flag, dry-run mode, install-plan schema, same-name conflict states, proof artifact shape, real-repo fixture hooks, and focused tests. The first slice should inspect Worker, Ship by Sunday, Arena CRM, and a sparse repo fixture and produce deterministic install plans without silently mutating package manifests.

## Slice 2: Package Scripts And Dependency Patching

Implement structured package manifest operations. Add or preserve scripts for `programs:lint`, `plans:lint`, `markdown:lint`, `docs:validate`, `docs:refresh-quality`, and `program:write-child-plan` where supported. Handle existing script collisions through explicit operations. Add dependencies only through package-manager-aware patching and update lockfiles when mutation is approved.

## Slice 3: Portable Validator Installation

Install or generate the portable validator files: Program packet lint, ExecPlan lint, path-family markdown lint, docs-spine validation, prompt inventory lint, quality-score freshness checks, docs route checks, stale path checks, and child-plan generation. Prove the generated tooling can run in a target repo or produce exact blocked setup evidence.

## Slice 4: Multi-Repo Acceptance

Run the full flow against Worker, Ship by Sunday, Arena CRM, and sparse fixtures. Acceptance should prove three states: already-installed, installable with structured patches, and honestly blocked because the repo lacks a required portable docs dependency.

## Deferred Out-Of-Scope Programs

Runtime legibility, runtime bootstrap, target-stack health checks, `.runtime/` state, `ASSISTANT_RUNTIME_ROOT`, runtime index files, logs, runtime proof commands, Worker notes, Worker goals, Worker projects, worker role docs, topology, worker-state commands, CI/provider setup, app-stack command conventions, and broad root `AGENTS.md` rewrites are intentionally not in this Program.

## First Child ExecPlan

The first child ExecPlan should be `docs/exec-plans/active/2026-05-06-worker-grade-docs-tooling-install-boundary.md`. It should implement Slice 1 and leave enough proof for later slices to patch package manifests safely.
