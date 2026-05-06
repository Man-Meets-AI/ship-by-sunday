---
program_id: docs-spine-adoption-operating-loop
title: Docs Spine Adoption Operating Loop
status: complete
created_at: 2026-05-05
completed_at: 2026-05-05
summary: Turn the manual docs-spine audit and setup work into a deterministic local-runner workflow for mature customer repositories.
post_build_recap: The docs-spine loop now scans, drafts, applies, and proves a mature repo docs spine through separate local-runner adoption and apply workflows, with Arena CRM pilot proof and blocked native-gate evidence recorded.
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

The durable packet artifacts for this Program live in `docs/programs/completed/2026-05-05-docs-spine-adoption-operating-loop/`.

The initial research pass is `research-pass-docs-spine-surfaces.md`. The normalized direction is `normalized-pass-docs-spine-workflow-bundle.md`. The initiative decision is in `converged-decision-packet.md`. Ordering is in `dependency-graph.md` and `plan-split-recommendation.md`. Risk review is in `cross-repo-review.md`. `planning-brief-1.md` drove the completed scaffold slice. `planning-brief-2.md` drove the completed scanner and facts slice. `planning-brief-3.md` drove the completed Codex synthesis packet slice. `planning-brief-4.md` drove the completed apply-and-proof scaffold slice, and `current-planning-brief.txt` still points at that brief until the next immutable brief is written.

Local reference surfaces include Ship by Sunday's `docs/index.md`, `docs/QUALITY_SCORE.md`, `docs/programs/PROGRAMS.md`, `docs/exec-plans/PLANS.md`, `docs/prompts/README.md`, `docs/generated/index.md`, `docs/product-specs/index.md`, `scripts/markdown-metadata/`, `scripts/programs/`, `scripts/exec-plan/`, `packages/local-runner/src/core/mature-repo-adoption-workflow.ts`, and `packages/codebase-compiler/src/repo-generation/render-starter-operating-pack.ts`.

Worker parity surfaces include `docs/exec-plans/AGENTS.md`, `docs/programs/AGENTS.md`, `docs/prompts/AGENTS.md`, `docs/specs/index.md`, `docs/references/README.md`, root `ARCHITECTURE.md` routing, docs-spine structural validation, markdown family routing, `docs:validate`, `proof:ci`, and the quality-score review hook.

The mature-repo pilot target is `~/Developer/arena-crm`. Its current conventions include `.codex/AGENTS.md` as canonical instructions, root `AGENTS.md` as a shim, Bun `1.3.11`, Turbo workspaces, and `bun run gate` as the broad completion gate.

## Current State

Ship by Sunday already has a local-runner workflow system for existing-codebase work. Shipped workflows include `source-truth-agent-readiness`, `observability-debuggability`, `broken-app-triage`, and `mature-repo-adoption`.

`mature-repo-adoption` is the closest predecessor. It audits mature repo conventions and writes `.sbs` adoption audit, Program draft, first ExecPlan draft, proof, and sync preview artifacts. It intentionally does not mutate root docs or install the operating spine.

Generated repos already receive a customer-safe Program and ExecPlan operating pack through the codebase compiler. That renderer is useful reference, but mature repos need an adaptive workflow that preserves existing commands, instructions, docs, CI, and release habits.

The completed v1 loop has two approved workflow boundaries. `docs-spine-adoption` scans mature repos and writes local `.sbs` facts and draft packets with explicit `proposedFiles` Markdown. `docs-spine-apply-and-proof` applies those draft files to approved docs roots, preserves existing docs by replacing only managed sections, writes local proof artifacts, and runs Git proof plus a structural Markdown heading check.

The Arena CRM pilot ran on local branch `sbs/docs-spine-apply-20260505-2250`. The adoption proof passed, the apply proof passed, and `bun run gate` was attempted. The native gate failed because the repo environment is missing Biome for Ultracite lint and `happy-dom` for the test setup; that is recorded as blocked native-gate evidence rather than a docs-spine apply failure.

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
- [x] 2026-05-05: Completed the apply-and-proof child ExecPlan. `docs-spine-apply-and-proof` now has a separate exact approval packet, `--confirm-docs-spine-apply`, checked-out-branch guard, managed-section docs writes from explicit `proposedFiles` Markdown, local proof artifacts, CLI and daemon dispatch, workspace read-model visibility, Convex proof ref guards, and focused tests.
- [x] 2026-05-05: Hardened the final v1 loop. Adoption synthesis now emits deterministic apply-ready Markdown, apply preserves existing docs with managed sections, and proof includes a structural Markdown check.
- [x] 2026-05-05: Ran the Arena CRM pilot. `docs-spine-adoption` and `docs-spine-apply-and-proof` both produced passed local proof under `.sbs/runs/`; `bun run gate` was attempted and blocked on missing repo-local tooling dependencies.

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

Decision: Use managed Markdown sections for existing docs and keep root agent instruction edits out of v1.
Rationale: Existing docs can be updated safely when the workflow owns only a marked section and preserves owner-written content. Root instruction routing is a higher-risk authority class than docs Markdown and should remain outside this v1 Program.
Date: 2026-05-05

## Slice Ledger

Active child ExecPlans:

- None. This Program is complete.

Recommended future child ExecPlans:

- None required inside this Program. Future work can open a new Program for root agent instruction routing, package-script mutation, or generated docs-spine content that uses live Codex model calls.

Completed child ExecPlans:

- `docs/exec-plans/completed/2026-05-05-docs-spine-workflow-bundle-scaffold.md`
- `docs/exec-plans/completed/2026-05-05-docs-spine-scanner-and-facts-model.md`
- `docs/exec-plans/completed/2026-05-05-docs-spine-codex-synthesis-packets.md`
- `docs/exec-plans/completed/2026-05-05-docs-spine-apply-and-proof.md`

## Next Slice

No required next slice remains inside this Program. The v1 loop can scan, draft, apply, and prove a mature repo docs spine with deterministic local-runner controllers.

Future adjacent work should be tracked separately if it widens authority into root agent instructions, package scripts, CI mutation, provider setup, branch pushes, pull requests, or live Codex Markdown synthesis.

## Risks and Watchpoints

Do not let the workflow become an unbounded agent swarm. Subagents may produce facts, drafts, and critiques. The deterministic controller applies files and records proof.

Do not assume generated-repo conventions in mature repos. Preserve the customer repo's package manager, instructions, docs, CI, release habits, and broad gate.

Do not mutate package scripts, CI workflows, dependencies, lockfiles, migrations, providers, runtime code, branch remotes, pull requests, or root agent instructions in this v1 loop.

Do not populate fake quality scores. Name missing score evidence as blocked proof until a real quality-score audit exists.

## Outcomes & Retrospective

This Program shipped the v1 docs-spine adoption operating loop. The local runner now has a deterministic scan-and-draft workflow and a separate apply-and-proof workflow. The hosted approval surfaces, Convex packet validation, CLI, daemon, proof refs, docs, tests, and Program packet all agree on the authority boundary.

The Arena CRM pilot proved the loop on a mature repo. The adoption pass wrote scanner facts and draft packets under `.sbs/docs-spine-adoption/**`; the apply pass wrote `docs/index.md`, Program and ExecPlan contracts, a first active Program, a first active ExecPlan, prompt README, quality-score notes, validation notes, and proof notes. Local apply proof passed with Git and structural Markdown checks. The repo-native `bun run gate` was attempted and failed on missing Biome and `happy-dom`, which is a customer repo setup/tooling blocker rather than an apply workflow failure.

## Validation and Acceptance

Program-level acceptance requires customer-approved local-runner workflows that can scan, draft, apply, and prove the docs spine in a mature repo. `docs-spine-adoption` owns `.sbs` scanner and draft artifacts; `docs-spine-apply-and-proof` owns approved repo file application. The workflows must preserve repo conventions, produce local proof artifacts, sync only structured metadata, and run structural docs proof plus the repo-native broad gate when available.

For Arena CRM, acceptance means the workflow preserves `.codex/AGENTS.md` as canonical, keeps root `AGENTS.md` as a shim, installs Program and ExecPlan contracts, installs the first active Program and child ExecPlan, wires or documents markdown and planning lint proof without unsafe package-script mutation, runs or blocks honestly on `bun run gate`, and records proof under `.sbs/runs/<workflow-run-id>/`. The pilot met this: root instructions were not mutated, docs-spine files were applied under approved docs roots, local proof passed, and the native gate blocker was captured.

Acceptance also requires an explicit parity checklist covering first-hop docs, specs or product specs, generated-output docs, references, design docs, Program and ExecPlan contracts, Program and ExecPlan lane-local instruction files, prompt assets, skill-trigger resolution, markdown metadata linting, docs-spine structural validation, planning lint, quality-score review, native release or proof docs, root README routing, assistant shims, and repo-native broad gates.

## Artifacts and Notes

The first workflow bundle should write local artifacts under `.sbs/docs-spine-adoption/**` and `.sbs/runs/<workflow-run-id>/**`.

Expected scanner artifacts include `repo-facts.json`, `source-truth-map.json`, `command-proof-map.json`, `docs-gap-report.json`, `architecture-signals.json`, `security-signals.json`, `quality-score-baseline.json`, `instruction-surface-map.json`, `skill-trigger-map.json`, `generated-surface-map.json`, `validation-surface-map.json`, and `performance-timings.json`.

Expected adoption proof artifacts include `workflow-packet.json`, `proof.json`, `sync-preview.json`, and `parity-checklist.json`.

Expected apply proof artifacts include `.sbs/runs/<workflow-run-id>/workflow-packet.json`, `.sbs/runs/<workflow-run-id>/proof.json`, `.sbs/runs/<workflow-run-id>/sync-preview.json`, and `.sbs/docs-spine-adoption/apply/apply-summary.json`.

Arena CRM pilot refs:

- Branch: `sbs/docs-spine-apply-20260505-2250`
- Adoption proof: `/Users/bazelrex/Developer/arena-crm/.sbs/runs/arena_docs_spine_adoption_pilot/proof.json`
- Apply proof: `/Users/bazelrex/Developer/arena-crm/.sbs/runs/arena_docs_spine_apply_pilot/proof.json`
- Apply summary: `/Users/bazelrex/Developer/arena-crm/.sbs/docs-spine-adoption/apply/apply-summary.json`
- Native gate: `bun run gate` failed because `ultracite` could not spawn Biome and tests could not resolve `happy-dom` from `test-setup.ts`.

## Interfaces and Dependencies

This Program depends on local-runner workflow dispatch, workflow approval packets, Convex workflow-run resolution, runner events, `.sbs` local artifact storage, Program and ExecPlan contracts, markdown metadata linting, and repo-native proof commands discovered from the customer repo.

The first pilot depends on Arena CRM's current Bun/Turbo monorepo, `.codex/AGENTS.md`, root `AGENTS.md` shim, `.github/workflows/`, existing docs under `docs/`, and `bun run gate`.
