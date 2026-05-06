---
title: Docs Spine Source Truth Scanner Repair
status: complete
created_at: 2026-05-05
completed_at: 2026-05-05
summary: Repair docs-spine source-truth scanning so canonical repo evidence outranks hidden historical noise and local skills.
post_build_recap: Reworked docs-spine scanner instruction classification, priority-based ref limiting, native gate discovery, app topology facts, and tests for Arena-style root shims and hidden folders.
program_id: docs-spine-adoption-quality-reset
planning_brief: docs/programs/completed/2026-05-05-docs-spine-adoption-quality-reset/planning-brief-2.md
read_when:
  - Reviewing source-truth scanner behavior for docs-spine adoption.
  - Updating instruction classification, hidden-noise exclusion, native gate discovery, or scanner facts.
  - Debugging why docs-spine synthesis selected the wrong repo guidance.
---

# Docs Spine Source Truth Scanner Repair

This is a completed execution plan for the second Docs Spine Adoption Quality Reset slice.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The first docs-spine adoption loop treated hidden logs and local skill files as primary repo guidance. That made the Arena CRM output noisy and generic. This slice repairs the scanner so canonical source-truth files drive synthesis: real `AGENTS.md` instruction surfaces, root shims, package manifests, workspace packages, CI, existing docs, native gates, and app topology.

The user-visible result is that a runner install has better facts before rendering begins. Arena-style repos now classify root `AGENTS.md` as a shim to `.codex/AGENTS.md`, keep `.codex/skills/**` as skills, and keep `.agents/daily-audit`, `.ai`, and `.claude` artifacts out of primary docs routes.

## Progress

- [x] 2026-05-05: Read planning brief 2, scanner code, schemas, and focused tests.
- [x] 2026-05-05: Added scanner instruction classification for canonical instructions, shims, secondary instructions, ignored hidden refs, and skill refs.
- [x] 2026-05-05: Replaced arbitrary tracked-ref limiting with priority-based limiting so root docs, instructions, package manifests, CI, docs, app package refs, and app roots survive large repos.
- [x] 2026-05-05: Excluded hidden instruction noise from docs and validation refs while preserving it as ignored evidence where available.
- [x] 2026-05-05: Expanded native gate discovery to include `gate`, `check`, `test`, `lint`, `typecheck`, `build`, `proof`, and `ci`.
- [x] 2026-05-05: Added app root facts and instruction-routing facts to scanner artifacts.
- [x] 2026-05-05: Updated focused tests for Arena-style root shim behavior, local skill classification, hidden-noise exclusion, and native gate discovery.

## Surprises & Discoveries

The scanner did not need a full parser to detect the Arena-style shim. A conservative first pass is enough: when root `AGENTS.md` references `.codex/AGENTS.md` or calls itself a shim, and `.codex/AGENTS.md` exists, the root file is classified as a shim and `.codex/AGENTS.md` becomes canonical.

The original `MAX_REPO_REFS` problem was not only the cap. It was the cap before evidence ranking. Priority sorting now keeps high-value refs before the cap while still storing a deterministic sorted list for downstream artifacts.

## Decision Log

Decision: Keep local skills out of `agentInstructionRefs`.
Rationale: Skill files are useful trigger surfaces, but they are not primary repo guidance. Mixing them into agent instructions caused noisy docs routing.
Date: 2026-05-05

Decision: Preserve hidden historical refs only as ignored evidence, not primary docs refs.
Rationale: The workflow should explain why hidden noise was ignored without letting those files pollute first-hop docs.
Date: 2026-05-05

Decision: Use priority-based ref limiting instead of removing the cap.
Rationale: Large customer repos still need bounded scanner artifacts, but canonical files must survive the bound.
Date: 2026-05-05

## Outcomes & Retrospective

Complete. `packages/local-runner/src/workflows/docs-spine-adoption/scanner.ts` now emits better source-truth facts and instruction classifications. `DocsSpineRepoFacts` carries canonical instruction refs, shim refs, secondary instruction refs, ignored instruction refs, and skill refs. Source-truth and instruction-surface artifacts include an `instructionRouting` object. Architecture signals now include app roots. Native gate discovery includes the common broad validation scripts the Program named.

This does not make the generated Markdown good yet. It gives the renderer the facts needed for the next slice.

## Context and Orientation

The scanner is the deterministic first phase for `docs-spine-adoption`. `packages/local-runner/src/core/docs-spine-adoption-workflow.ts` calls `buildDocsSpineScannerBundle()` and writes its facts under `.sbs/docs-spine-adoption/facts/**`.

The scanner output feeds `packages/local-runner/src/workflows/docs-spine-adoption/synthesis.ts` and the quality evaluator in `packages/local-runner/src/workflows/docs-spine-adoption/quality-eval.ts`.

### In Scope

This slice changed scanner evidence ranking, instruction classification, hidden-noise handling, native gate discovery, app topology facts, schemas, and focused tests.

### Out Of Scope

This slice did not rewrite the Markdown renderer, did not make quality reports pass, did not rerun the Arena CRM pilot, did not mutate Arena CRM, did not change apply authority, and did not edit root instructions, package scripts, CI, dependencies, or provider setup.

## Plan of Work

The implementation added an `InstructionClassification` model to the scanner inventory. It classifies explicit `AGENTS.md` files, root shims, assistant instruction files, ignored hidden instruction noise, and local skill refs. `buildRepoFacts()`, `buildSourceTruthMap()`, and `buildInstructionSurfaceMap()` now use that classification instead of broad path substring checks.

The tracked-ref list now sorts by source-truth priority before applying `MAX_REPO_REFS`, then returns deterministic alphabetical output. This keeps high-value evidence in bounded artifacts.

The tests now create an Arena-style root shim, `.codex/AGENTS.md`, `.codex/skills/**`, `.agents/daily-audit/**`, `.ai/**`, and `.claude/**` to prove the scanner classifies them correctly.

## Milestones

The first milestone was instruction classification. It is complete because canonical instructions, shims, local skills, and ignored hidden refs are separate in repo facts and scanner artifacts.

The second milestone was source-truth priority. It is complete because tracked refs are priority-ranked before the cap.

The third milestone was focused proof. It is complete because the docs-spine adoption workflow test validates the new Arena-style scanner behavior.

## Concrete Steps

Work was performed from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

The main implementation files were:

    packages/local-runner/src/workflows/docs-spine-adoption/scanner.ts
    packages/local-runner/src/workflows/docs-spine-adoption/schemas.ts
    packages/local-runner/tests/docs-spine-adoption-workflow.test.ts

## Validation and Acceptance

Acceptance requires scanner facts to identify `.codex/AGENTS.md` as canonical, root `AGENTS.md` as a shim, `.codex/skills/**` as local skills, hidden audit/AI/Claude files as ignored or excluded noise, and native gates as discovered command names without storing script bodies. The implementation meets that bar in focused tests.

### Test Commands

    bun run --cwd packages/local-runner test -- docs-spine-adoption-workflow.test.ts docs-spine-apply-and-proof-workflow.test.ts
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner format:check
    bun run --cwd packages/local-runner build
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-05-docs-spine-source-truth-scanner-repair.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/completed/2026-05-05-docs-spine-adoption-quality-reset docs/exec-plans/completed/2026-05-05-docs-spine-source-truth-scanner-repair.md
    git diff --check

## Idempotence and Recovery

The scanner is read-only against the customer repo and writes only `.sbs` artifacts through the owning workflow. Rerunning the workflow overwrites the same workflow run's local artifacts. If classification is wrong, update scanner rules and rerun; do not patch generated docs by hand to hide bad facts.

## Artifacts and Notes

Important scanner facts added or repaired:

    instructionSurface.agentInstructionRefs
    instructionSurface.assistantShimRefs
    instructionSurface.secondaryInstructionRefs
    instructionSurface.ignoredInstructionRefs
    instructionSurface.skillRefs
    sourceTruthMap.instructionRouting
    instructionSurfaceMap.instructionRouting
    architectureSignals.appRootRefs
    commandProofMap.nativeGateScriptNames
    validationSurfaceMap.nativeGateScriptNames

## Interfaces and Dependencies

The scanner still depends only on Git tracked refs, root package metadata, package-manager lockfile detection, and bounded file reads for root instruction shim classification. It does not read raw source bodies into artifacts, store package script bodies, call providers, install dependencies, run model APIs, or mutate repo files.
