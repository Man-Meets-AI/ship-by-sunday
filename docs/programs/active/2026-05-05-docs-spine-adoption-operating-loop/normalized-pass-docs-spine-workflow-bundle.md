---
title: Docs Spine Workflow Bundle Normalized Pass
summary: Normalized implementation direction for a deterministic docs-spine adoption workflow bundle.
docType: program_normalized_pass
status: active
read_when:
  - Translating docs-spine adoption research into implementation slices.
  - Checking why v1 stays Bun and TypeScript.
---

# Docs Spine Workflow Bundle Normalized Pass

## Target Model

`docs-spine-adoption` is a workflow bundle, not one prompt. It lives under the local-runner workflow system and owns a manifest, phases, schemas, prompt packets, renderers, proof commands, and tests.

The bundle runs as a deterministic state machine. Scanner phases produce normalized JSON. Codex synthesis phases consume that JSON and return structured drafts with evidence refs. `docs-spine-adoption` validates and stores those local artifacts without applying files; `docs-spine-apply-and-proof` owns any later approved file application. Proof records command names, statuses, touched file refs, created artifacts, blocked proof, rollback notes, and the next recommended workflow.

## V1 Language Decision

Use Bun and TypeScript for v1. The existing local runner, approval packet validation, CLI dispatch, daemon work queue, tests, and generated operating-pack renderer are already TypeScript-owned. That makes TypeScript the fastest route to a working customer loop.

Do not hard-code TypeScript as the permanent scanner engine. Every scanner and synthesis phase must communicate through JSON artifacts under `.sbs/docs-spine-adoption/`. If the Arena CRM pilot shows inventory and deterministic scans are too slow, a later child ExecPlan can replace selected scanner phases with a Go binary without changing hosted approval or proof contracts.

## Required Bundle Shape

The implementation should create a feature-local workflow bundle such as:

    packages/local-runner/src/workflows/docs-spine-adoption/
      manifest.ts
      workflow.ts
      phases/
      schemas/
      prompts/
      renderers/
      tests/

The manifest should declare workflow id, version, phases, scanner dependencies, Codex packet names, allowed touch targets, disallowed touch targets, required confirmations, local artifact refs, proof commands, sync policy, rollback notes, and performance budgets.

## Target Spine Inventory

The workflow should treat the docs spine as an inventory with required, adaptable, and repo-specific surfaces.

Required surfaces are root agent routing, `docs/index.md`, architecture, reliability, security, product sense, quality score, Program contracts, ExecPlan contracts, active and completed indexes, prompt routing, markdown validation, planning validation, proof commands, and a first Program plus first child ExecPlan when adoption is applying the spine.

Adaptable surfaces include frontend docs, design docs, root `DESIGN.md`, docs-local `DESIGN.md`, specs or product specs, generated-output docs, references, internal docs, release workflow docs, root README routing, compatibility shims such as `ARCHITECTURE.md` or `docs/PLANS.md`, and assistant shims such as `CLAUDE.md` or `GEMINI.md` when the target repo already uses them.

Repo-specific surfaces include nested instruction files such as `docs/exec-plans/AGENTS.md`, `docs/programs/AGENTS.md`, `docs/prompts/AGENTS.md`, app or package `AGENTS.md` files, local skill folders such as `.agents/skills/` or `.codex/skills/`, existing CI workflow docs, native release evidence, and the repo's own broad gate.

## Scanner Contract

The scanner layer should prefer `git ls-files` over broad filesystem crawling. It should read bounded file sizes, skip generated and dependency folders, and produce facts for package manager, package scripts, workspace topology, docs surfaces, agent instruction files, CI workflows, release scripts, proof commands, app/package boundaries, Semgrep findings, AST-derived source signals, and missing docs-spine surfaces.

The scanner output should include `repo-facts.json`, `source-truth-map.json`, `command-proof-map.json`, `docs-gap-report.json`, `architecture-signals.json`, `security-signals.json`, `quality-score-baseline.json`, `instruction-surface-map.json`, `skill-trigger-map.json`, `generated-surface-map.json`, and `validation-surface-map.json`.

## Codex Contract

Codex should synthesize drafts from facts, not inspect the repo freely. Each Codex packet should name the target doc, input fact refs, evidence requirements, forbidden claims, and output schema. Outputs should include the target path, draft body, claims, evidence refs, and blocked facts.

Draft writers may cover architecture, reliability, security, frontend/design, product sense, quality score, specs, references, generated docs, Program packet, first ExecPlan, prompt inventory, lane-local instruction files, skill-trigger manifest updates, and canonical instruction routing.

## Apply Contract

Inside the customer repo, the workflow may write docs and workflow-local `.sbs` artifacts only. Customer runtime code, provider config, env files, dependency manifests, lockfiles, migrations, generated folders, CI changes, branch pushes, pull requests, raw source sync, raw logs, and Codex transcripts are out of scope for v1.

Package script wiring should be conservative. The workflow can create validator scripts under an approved docs-spine path, but package script changes require explicit approval and should be skipped if the repo already has a canonical gate such as Arena CRM's `bun run gate`.

Apply proof must include a parity checklist against Worker and Ship by Sunday source surfaces. The checklist should explicitly record whether each target lane was installed, preserved, adapted, deferred, or blocked by missing facts.
