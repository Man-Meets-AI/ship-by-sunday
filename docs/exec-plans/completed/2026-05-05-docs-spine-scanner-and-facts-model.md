---
title: Docs Spine Scanner And Facts Model
status: complete
created_at: 2026-05-05
completed_at: 2026-05-05
summary: Expand docs-spine-adoption from a scaffold into deterministic scanner artifacts without applying customer docs.
post_build_recap: Added deterministic docs-spine scanner artifacts, schema refs, proof coverage, and sync-safe scanner tests.
program_id: docs-spine-adoption-operating-loop
planning_brief: docs/programs/completed/2026-05-05-docs-spine-adoption-operating-loop/planning-brief-2.md
read_when:
  - Implementing scanner artifacts for docs-spine adoption.
  - Updating docs-spine facts schemas or proof output.
---

# Docs Spine Scanner And Facts Model

This ExecPlan tracks the second Docs Spine Adoption Operating Loop slice: add deterministic scanner artifacts behind the completed `docs-spine-adoption` scaffold.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The first scaffold proves the workflow can be approved, run locally, write `.sbs` artifacts, and block safely. The next step is to make those artifacts useful enough for Codex synthesis by producing stable facts about the target repo without applying docs or widening permissions.

After this slice, `docs-spine-adoption` should still write only `.sbs/runs/<workflow-run-id>/**` and `.sbs/docs-spine-adoption/**`, but it should populate the scanner artifacts named by `planning-brief-2.md`.

## Progress

- [x] 2026-05-05: Created this ExecPlan from `planning-brief-2.md`.
- [x] 2026-05-05: Read the scaffold workflow, manifest, schemas, tests, and Program before editing.
- [x] 2026-05-05: Added deterministic scanner schemas and artifact refs.
- [x] 2026-05-05: Wrote scanner artifacts for source truth, commands, docs gaps, architecture, security, quality score, instructions, skills, generated surfaces, validation surfaces, and timings.
- [x] 2026-05-05: Added focused tests for every new artifact and preserved scaffold regression coverage.
- [x] 2026-05-05: Updated Program/docs with validation evidence.

## Surprises & Discoveries

The scanner can produce the whole first facts set without reading raw source file contents. `git ls-files` plus bounded `package.json` metadata is enough for source routing, package/workspace shape, validation command names, docs gaps, and blocked quality-score evidence.

Package script bodies are intentionally not stored. The regression fixture includes a secret-like script body and asserts the scanner artifacts only contain script names and proof kinds.

## Decision Log

Decision: Keep scanner output sync-safe by design.
Rationale: Scanner artifacts are local `.sbs` files, but the workflow may summarize refs and proof metadata upstream. Artifact contents should avoid raw source, raw logs, local absolute paths, package script bodies, secrets, and docs drafts.
Date: 2026-05-05

## Outcomes & Retrospective

Complete. `docs-spine-adoption` now writes the scanner artifacts required by `planning-brief-2.md` under `.sbs/docs-spine-adoption/facts/**`.

The scanner is implemented in `packages/local-runner/src/workflows/docs-spine-adoption/scanner.ts` and is wired through `packages/local-runner/src/core/docs-spine-adoption-workflow.ts`. It records repo-relative refs, package manager, script names, workspace globs, workspace package refs, dependency names, source-truth surfaces, docs gaps, architecture/security signals, instruction/skill/generated/validation surfaces, blocked quality-score baseline, and performance timing metadata.

The slice still does not apply Markdown docs, run Semgrep or AST scanners, call Codex, mutate package scripts, mutate CI, set up providers, push branches, open PRs, or touch Arena CRM.

Validation evidence:

    bun run --cwd packages/local-runner test -- docs-spine-adoption-workflow.test.ts workflow-run-api.test.ts cli-help.test.ts
    bun run --cwd apps/web test:unit -- workspace-findings-read-model.test.ts workspace-runner-events.test.ts
    bun run --cwd packages/local-runner test -- docs-spine-adoption-workflow.test.ts
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner format:check
    bunx oxlint -c .oxlintrc.json --deny-warnings apps/web/app/\(workspace\)/_lib/workspace-findings-read-model.ts apps/web/convex/workspace/model.ts apps/web/tests/unit/workspace-findings-read-model.test.ts apps/web/tests/unit/workspace-runner-events.test.ts
    bunx oxfmt -c .oxfmtrc.json --check packages/local-runner/src/core/docs-spine-adoption-workflow.ts packages/local-runner/src/workflows/docs-spine-adoption/manifest.ts packages/local-runner/src/workflows/docs-spine-adoption/schemas.ts packages/local-runner/src/workflows/docs-spine-adoption/scanner.ts packages/local-runner/tests/docs-spine-adoption-workflow.test.ts apps/web/app/\(workspace\)/_lib/workspace-findings-read-model.ts apps/web/convex/workspace/model.ts apps/web/tests/unit/workspace-findings-read-model.test.ts apps/web/tests/unit/workspace-runner-events.test.ts
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-05-docs-spine-scanner-and-facts-model.md
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-05-docs-spine-scanner-and-facts-model.md
    bun run --cwd packages/local-runner test
    bun run --cwd packages/local-runner build
    git diff --check

## Context and Orientation

The runner implementation is `packages/local-runner/src/core/docs-spine-adoption-workflow.ts`. The workflow constants and current schemas live in `packages/local-runner/src/workflows/docs-spine-adoption/`.

The owning Program is `docs/programs/completed/2026-05-05-docs-spine-adoption-operating-loop/program.md`; the current brief is `planning-brief-2.md`.

### In Scope

Add scanner artifacts under `.sbs/docs-spine-adoption/**`:

    .sbs/docs-spine-adoption/facts/source-truth-map.json
    .sbs/docs-spine-adoption/facts/command-proof-map.json
    .sbs/docs-spine-adoption/facts/docs-gap-report.json
    .sbs/docs-spine-adoption/facts/architecture-signals.json
    .sbs/docs-spine-adoption/facts/security-signals.json
    .sbs/docs-spine-adoption/facts/quality-score-baseline.json
    .sbs/docs-spine-adoption/facts/instruction-surface-map.json
    .sbs/docs-spine-adoption/facts/skill-trigger-map.json
    .sbs/docs-spine-adoption/facts/generated-surface-map.json
    .sbs/docs-spine-adoption/facts/validation-surface-map.json
    .sbs/docs-spine-adoption/facts/performance-timings.json

Use `git ls-files` as the primary inventory source. It is acceptable to parse `package.json` for package manager and script names, dependency names, and workspace declarations, but do not store script bodies or dependency versions in scanner artifacts.

### Out Of Scope

Do not apply Markdown docs. Do not add Codex synthesis prompts, Semgrep rule packs, AST scanners, package installs, CI changes, provider setup, branch pushes, pull requests, Arena CRM mutation, or quality-score numbers without evidence.

## Plan of Work

Add scanner schema types and artifact refs first. Then implement a scanner module that derives sync-safe facts from tracked repo refs and bounded manifest metadata.

Wire the scanner into `runDocsSpineAdoptionWorkflow` after branch creation and before proof. Include every scanner artifact in created artifact refs and proof JSON.

Update tests to assert the scanner artifacts exist, contain repo-relative refs only, avoid raw package script bodies, and write blocked score evidence instead of invented quality numbers.

## Milestones

The first milestone is scanner contracts. It is complete when manifest refs and schema types name every scanner artifact.

The second milestone is scanner execution. It is complete when the local runner writes every scanner artifact during the approved scaffold run and includes those refs in proof.

The third milestone is validation. It is complete when focused tests pass and planning docs record the evidence.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Inspect the current docs-spine scaffold before changing code:

    rg -n "docs-spine-adoption|DocsSpine" packages/local-runner apps/web/convex apps/web/app/\(workspace\)/_lib docs/programs/completed/2026-05-05-docs-spine-adoption-operating-loop

Implement the scanner as workflow-local code under `packages/local-runner/src/workflows/docs-spine-adoption/`, then wire it through `packages/local-runner/src/core/docs-spine-adoption-workflow.ts`.

Run focused tests and lint, then update this ExecPlan and the Program with validation evidence.

## Validation and Acceptance

Acceptance requires focused local-runner tests proving every scanner artifact is written and the workflow still fails proof for unexpected non-`.sbs` writes.

### Test Commands

    bun run --cwd packages/local-runner test -- docs-spine-adoption-workflow.test.ts workflow-run-api.test.ts cli-help.test.ts
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner format:check
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-05-docs-spine-scanner-and-facts-model.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/completed/2026-05-05-docs-spine-adoption-operating-loop docs/exec-plans/completed/2026-05-05-docs-spine-scanner-and-facts-model.md
    git diff --check

## Idempotence and Recovery

Scanner artifacts should be overwritten for the same workflow run. They must remain under `.sbs/docs-spine-adoption/**` and must use the existing artifact path guard.

If a scanner cannot establish a fact from metadata, write a blocked or missing-evidence entry rather than guessing.

## Artifacts and Notes

The primary implementation artifact is `packages/local-runner/src/workflows/docs-spine-adoption/scanner.ts`.

The workflow should write the scanner artifacts listed in the In Scope section plus existing scaffold artifacts:

    .sbs/runs/<workflow-run-id>/workflow-packet.json
    .sbs/runs/<workflow-run-id>/proof.json
    .sbs/runs/<workflow-run-id>/sync-preview.json
    .sbs/docs-spine-adoption/manifest.json
    .sbs/docs-spine-adoption/facts/repo-facts.json

Do not treat scanner artifacts as docs drafts. They are facts for later Codex synthesis and apply slices.

## Interfaces and Dependencies

This slice depends on local Git, `git ls-files`, bounded local process execution, local `.sbs` artifact writes, local-runner workflow approval packets, and the existing workflow proof path.

It does not depend on Semgrep, AST parsers, Codex synthesis, provider credentials, package installs, CI, branch remotes, pull requests, or Arena CRM.
