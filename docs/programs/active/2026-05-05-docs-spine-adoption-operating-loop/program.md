---
program_id: docs-spine-adoption-operating-loop
title: Docs Spine Adoption Operating Loop
status: active
created_at: 2026-05-05
completed_at: null
summary: Turn the manual docs-spine audit and setup work into a deterministic local-runner workflow for mature customer repositories.
post_build_recap: null
read_when:
  - Planning or implementing docs-spine adoption for mature repos.
  - Updating local-runner workflow bundle conventions, scanner contracts, or Codex synthesis packets.
  - Running or reviewing the Arena CRM docs-spine adoption pilot.
---

# Docs Spine Adoption Operating Loop

This Program is a living initiative document. Update it whenever a child slice lands, the workflow boundary changes, or validation changes the durable truth.

This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

Ship by Sunday repeatedly does a docs-spine setup pass when auditing a serious codebase: map the repo, identify source-truth docs, install or normalize Program and ExecPlan contracts, wire lint and proof commands, update agent instructions, and leave the next agent with durable memory instead of chat history.

That work should become a repeatable local-runner workflow for existing-codebase customers. A mature repo should be able to approve `docs-spine-adoption`, run the local runner, and receive a repo-specific operating spine that preserves the repo's conventions while adding Programs, ExecPlans, docs routing, prompt loops, quality-score tracking, and proof artifacts.

The initiative is moving in the right direction when Arena CRM can receive this spine without manual tabulation, without generated-starter assumptions, and with proof that the installed files are structurally valid and aligned to the repo's own gate.

## Program Inputs

The durable packet artifacts for this Program live in `docs/programs/active/2026-05-05-docs-spine-adoption-operating-loop/`.

The initial research pass is `research-pass-docs-spine-surfaces.md`. The normalized direction is `normalized-pass-docs-spine-workflow-bundle.md`. The initiative decision is in `converged-decision-packet.md`. Ordering is in `dependency-graph.md` and `plan-split-recommendation.md`. Risk review is in `cross-repo-review.md`. `planning-brief-1.md` drove the completed scaffold slice. `planning-brief-2.md` drove the completed scanner and facts slice. `planning-brief-3.md` drove the completed Codex synthesis packet slice. The current immutable implementation brief is `planning-brief-4.md`, and `current-planning-brief.txt` points at that brief.

Local reference surfaces include Ship by Sunday's `docs/index.md`, `docs/QUALITY_SCORE.md`, `docs/programs/PROGRAMS.md`, `docs/exec-plans/PLANS.md`, `docs/prompts/README.md`, `docs/generated/index.md`, `docs/product-specs/index.md`, `scripts/markdown-metadata/`, `scripts/programs/`, `scripts/exec-plan/`, `packages/local-runner/src/core/mature-repo-adoption-workflow.ts`, and `packages/codebase-compiler/src/repo-generation/render-starter-operating-pack.ts`.

Worker parity surfaces include `docs/exec-plans/AGENTS.md`, `docs/programs/AGENTS.md`, `docs/prompts/AGENTS.md`, `docs/specs/index.md`, `docs/references/README.md`, root `ARCHITECTURE.md` routing, docs-spine structural validation, markdown family routing, `docs:validate`, `proof:ci`, and the quality-score review hook.

The mature-repo pilot target is `~/Developer/arena-crm`. Its current conventions include `.codex/AGENTS.md` as canonical instructions, root `AGENTS.md` as a shim, Bun `1.3.11`, Turbo workspaces, and `bun run gate` as the broad completion gate.

## Current State

Ship by Sunday already has a local-runner workflow system for existing-codebase work. Shipped workflows include `source-truth-agent-readiness`, `observability-debuggability`, `broken-app-triage`, and `mature-repo-adoption`.

`mature-repo-adoption` is the closest predecessor. It audits mature repo conventions and writes `.sbs` adoption audit, Program draft, first ExecPlan draft, proof, and sync preview artifacts. It intentionally does not mutate root docs or install the operating spine.

Generated repos already receive a customer-safe Program and ExecPlan operating pack through the codebase compiler. That renderer is useful reference, but mature repos need an adaptive workflow that preserves existing commands, instructions, docs, CI, and release habits.

The missing capability is an approved workflow that turns scanner facts and bounded Codex synthesis into actual repo docs, prompt assets, lint/proof scripts, Program packets, ExecPlans, and instruction routing on a local branch.

## Progress

- [x] 2026-05-05: Identified `docs-spine-adoption` as the next workflow after `mature-repo-adoption`.
- [x] 2026-05-05: Researched Ship by Sunday and Worker docs-spine surfaces, including root docs, Program and ExecPlan contracts, prompt assets, lint scripts, proof commands, quality-score docs, and instruction routing.
- [x] 2026-05-05: Inspected Arena CRM conventions and confirmed it should preserve `.codex/AGENTS.md`, root shim behavior, Bun/Turbo scripts, existing docs, CI workflows, and `bun run gate`.
- [x] 2026-05-05: Decided v1 stays Bun and TypeScript, with JSON phase boundaries for future Go scanner replacement if measured performance requires it.
- [x] 2026-05-05: Created this Program packet and the first child ExecPlan for the workflow bundle scaffold.
- [x] 2026-05-05: Ran a parity pass against the older Worker docs-spine, ExecPlan, Program, markdown-frontmatter, and quality-score plans plus the Ship by Sunday generated operating pack and mature-repo adoption lane.
- [x] 2026-05-05: Completed the first child ExecPlan. `docs-spine-adoption` now has a local-runner scaffold, exact approval packet contract, `.sbs`-only proof artifacts, CLI/daemon dispatch, workspace read-model visibility, and focused tests.
- [x] 2026-05-05: Completed the scanner and facts child ExecPlan. `docs-spine-adoption` now writes source-truth, command-proof, docs-gap, architecture, security, quality-score, instruction, skill, generated, validation, and performance artifacts without raw source or script bodies.
- [x] 2026-05-05: Completed the Codex synthesis packet child ExecPlan. `docs-spine-adoption` now writes bounded local draft packets under `.sbs/docs-spine-adoption/drafts/**` without model calls, docs application, raw source, script bodies, or transcripts.

## Decision Log

Decision: Ship `docs-spine-adoption` as a separate workflow after `mature-repo-adoption`.
Rationale: The existing mature-repo workflow is intentionally audit-only and `.sbs`-only. Applying the docs spine needs wider write authority, stronger proof, and an explicit approval boundary.
Date: 2026-05-05

Decision: Keep v1 in Bun and TypeScript.
Rationale: The existing local runner, approval packet validation, CLI, daemon, Convex integration, and tests are TypeScript-owned. JSON phase boundaries preserve a future Go replacement path without delaying the first product slice.
Date: 2026-05-05

Decision: Make the workflow deterministic at the controller layer.
Rationale: Parallel Codex agents are useful for research and draft synthesis, but they cannot own file application or authority. The workflow controller must own phase order, allowed paths, validation, proof, and sync.
Date: 2026-05-05

Decision: Install a quality-score contract before populating scored tables.
Rationale: A score table is only trustworthy after scanner evidence exists. V1 should create the quality-score landing surface and blocked proof for missing score evidence.
Date: 2026-05-05

## Slice Ledger

Active child ExecPlans:

- None yet.

Recommended future child ExecPlans:

- `docs-spine-apply-and-proof`
- `arena-crm-docs-spine-pilot`

Completed child ExecPlans:

- `docs/exec-plans/completed/2026-05-05-docs-spine-workflow-bundle-scaffold.md`
- `docs/exec-plans/completed/2026-05-05-docs-spine-scanner-and-facts-model.md`
- `docs/exec-plans/completed/2026-05-05-docs-spine-codex-synthesis-packets.md`

## Next Slice

The next child ExecPlan should be `docs-spine-apply-and-proof`.

It should validate the local draft artifacts, apply approved docs-spine files on the local branch, and prove the result with structural docs checks and repo-native gate handling. It should still avoid package mutation, CI mutation, provider setup, branch pushes, pull requests, and the Arena CRM pilot until apply mechanics are stable.

## Risks and Watchpoints

Do not let the workflow become an unbounded agent swarm. Subagents may produce facts, drafts, and critiques. The deterministic controller applies files and records proof.

Do not assume generated-repo conventions in mature repos. Preserve the customer repo's package manager, instructions, docs, CI, release habits, and broad gate.

Do not mutate package scripts, CI workflows, dependencies, lockfiles, migrations, providers, runtime code, branch remotes, or pull requests in the first scaffold.

Do not populate fake quality scores. Name missing score evidence as blocked proof until a real quality-score audit exists.

## Outcomes & Retrospective

This Program is active. Fill this section when the docs-spine adoption loop has shipped, the Arena CRM pilot has produced proof or blocked proof, and no required implementation slice remains inside the Program.

## Validation and Acceptance

Program-level acceptance requires customer-approved local-runner workflows that can scan, draft, apply, and prove the docs spine in a mature repo. `docs-spine-adoption` owns `.sbs` scanner and draft artifacts; `docs-spine-apply-and-proof` owns any later approved repo file application. The workflows must preserve repo conventions, produce local proof artifacts, sync only structured metadata, and run structural docs proof plus the repo-native broad gate when available.

For Arena CRM, acceptance means the workflow preserves `.codex/AGENTS.md` as canonical, keeps root `AGENTS.md` as a shim, installs Program and ExecPlan contracts, installs the first active Program and child ExecPlan, wires or documents markdown and planning lint proof without unsafe package-script mutation, runs or blocks honestly on `bun run gate`, and records proof under `.sbs/runs/<workflow-run-id>/`.

Acceptance also requires an explicit parity checklist covering first-hop docs, specs or product specs, generated-output docs, references, design docs, Program and ExecPlan contracts, Program and ExecPlan lane-local instruction files, prompt assets, skill-trigger resolution, markdown metadata linting, docs-spine structural validation, planning lint, quality-score review, native release or proof docs, root README routing, assistant shims, and repo-native broad gates.

## Artifacts and Notes

The first workflow bundle should write local artifacts under `.sbs/docs-spine-adoption/**` and `.sbs/runs/<workflow-run-id>/**`.

Expected scanner artifacts include `repo-facts.json`, `source-truth-map.json`, `command-proof-map.json`, `docs-gap-report.json`, `architecture-signals.json`, `security-signals.json`, `quality-score-baseline.json`, `instruction-surface-map.json`, `skill-trigger-map.json`, `generated-surface-map.json`, `validation-surface-map.json`, and `performance-timings.json`.

Expected proof artifacts include `workflow-packet.json`, `proof.json`, `sync-preview.json`, and `parity-checklist.json`.

## Interfaces and Dependencies

This Program depends on local-runner workflow dispatch, workflow approval packets, Convex workflow-run resolution, runner events, `.sbs` local artifact storage, Program and ExecPlan contracts, markdown metadata linting, and repo-native proof commands discovered from the customer repo.

The first pilot depends on Arena CRM's current Bun/Turbo monorepo, `.codex/AGENTS.md`, root `AGENTS.md` shim, `.github/workflows/`, existing docs under `docs/`, and `bun run gate`.
