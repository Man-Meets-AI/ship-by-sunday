---
title: Harden Observability Data Contracts
status: complete
created_at: 2026-04-23
completed_at: 2026-04-24
summary: Make observability storage, incident rollups, event occurrences, and engineering-intake exports intentionally owned and testable.
post_build_recap: Convex now stores incident rollups separately from per-event occurrence rows, runtime intake exports reference latest occurrences when available, and the shared engineering-intake contract boundary is documented under scripts/release/lib.
read_when:
  - Resuming observability data-contract work.
  - Changing Convex observability schema, incident export, or engineering-intake contracts.
  - Validating the fifth Ship by Sunday recovery slice.
program_id: sbs-codebase-recovery
planning_brief: docs/programs/active/2026-04-23-sbs-codebase-recovery/planning-brief-1.md
---

# Harden Observability Data Contracts

This is a living execution plan. Keep it current as implementation, proof, and discoveries change the observability data-contract hardening path.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Observability should preserve useful truth. Today the review found that incident records can mix rollup state with occurrence details, old and new observability shapes coexist, client error details can be lost, and engineering-intake contracts cross ownership boundaries. After this plan, the observability model should make it clear what is an event occurrence, what is a rollup, what is exported for engineering intake, and which module owns the shared contract.

This plan is the fifth child slice of the Program packet at `docs/programs/active/2026-04-23-sbs-codebase-recovery/`, written from `planning-brief-1.md`.

## Progress

- [x] 2026-04-23 EDT: Identified observability data-contract issues from the read-only review.
- [x] 2026-04-24 EDT: Read `apps/web/convex/_generated/ai/guidelines.md` before touching Convex code. Relevant constraints for this slice are: use validators for Convex functions, query through indexes or bounded pagination, avoid unbounded arrays on a rollup document, and keep schema changes additive unless a migration is documented.
- [x] 2026-04-24 EDT: Checked the completed `sbs-runtime-boundary-hardening` Program and confirmed it only completed runtime boundary work: client observability transport, bonus lesson server tracking, Codex route boundaries, and public metadata route hardening. This plan remains valid but must not redo transport work.
- [x] 2026-04-24 EDT: Mapped current observability surfaces. The active dirty work already added `apps/web/features/observability/export/runtime-intake.mjs`, `apps/web/scripts/export-runtime-intake.mjs`, `scripts/release/lib/engineering-intake-contract.mjs`, and tests for runtime intake and engineering intake contracts.
- [x] 2026-04-24 EDT: Baseline focused tests passed before data-contract edits: `PATH="$HOME/.bun/bin:$PATH" bun run --cwd apps/web test:unit -- tests/unit/observability-convex.test.ts tests/unit/runtime-intake-export.test.ts tests/unit/engineering-intake-contract.test.ts` (3 files, 15 tests passed, 279ms).
- [x] 2026-04-24 EDT: Added the occurrence-versus-rollup contract: `incidents` remains the lifecycle rollup table, and new `incidentOccurrences` rows capture per-event request id, path, stack, details, links, occurrence number, and timestamp.
- [x] 2026-04-24 EDT: Preserved request-specific details through ingestion by inserting an `incidentOccurrences` row for each new or repeated incident and storing `latestOccurrenceId` on the rollup row.
- [x] 2026-04-24 EDT: Updated runtime intake grouping to include `incidentOccurrences:<id>` source record refs when `latestOccurrenceId` exists while preserving legacy incident rows without that field.
- [x] 2026-04-24 EDT: Documented the intentional shared engineering-intake contract boundary at `scripts/release/lib/engineering-intake-contract.mjs` in `docs/internal/observability.md`.
- [x] 2026-04-24 EDT: Focused tests passed after occurrence contract edits: `PATH="$HOME/.bun/bin:$PATH" bun run --cwd apps/web test:unit -- tests/unit/observability-convex.test.ts tests/unit/runtime-intake-export.test.ts tests/unit/engineering-intake-contract.test.ts` (3 files, 16 tests passed, 239ms).
- [x] 2026-04-24 EDT: `PATH="$HOME/.bun/bin:$PATH" bunx convex codegen` passed from `apps/web` after the additive schema update.
- [x] 2026-04-24 EDT: Broader observability unit lane passed from `apps/web`: `PATH="$HOME/.bun/bin:$PATH" bun run test:unit -- tests/unit/observability-*.test.ts tests/unit/runtime-intake-export.test.ts tests/unit/engineering-intake-contract.test.ts` (12 files, 51 tests passed, 805ms).
- [x] 2026-04-24 EDT: `PATH="$HOME/.bun/bin:$PATH" bun run format` passed (`oxfmt`, 1008 files, 573ms).
- [x] 2026-04-24 EDT: `PATH="$HOME/.bun/bin:$PATH" bun run lint` passed (0 warnings, 0 errors, 947 files).
- [x] 2026-04-24 EDT: `PATH="$HOME/.bun/bin:$PATH" bun run typecheck` passed (`next build`/TypeScript route build completed).
- [x] 2026-04-24 EDT: `PATH="$HOME/.bun/bin:$PATH" bun run plans:lint -- --plan docs/exec-plans/active/2026-04-23-harden-observability-data-contracts.md` passed.
- [x] 2026-04-24 EDT: `PATH="$HOME/.bun/bin:$PATH" bun run markdown:lint -- --paths docs/exec-plans/active/2026-04-23-harden-observability-data-contracts.md docs/internal/observability.md` passed.
- [x] 2026-04-24 EDT: `git diff --check` passed.
- [x] Run focused tests and repo closeout checks.
- [x] 2026-04-24 EDT: Post-move validation passed with `PATH="$HOME/.bun/bin:$PATH" bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-23-harden-observability-data-contracts.md`, `PATH="$HOME/.bun/bin:$PATH" bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-23-harden-observability-data-contracts.md docs/internal/observability.md docs/programs/active/2026-04-23-sbs-codebase-recovery/program.md docs/programs/active/2026-04-23-sbs-codebase-recovery/dependency-graph.md`, `PATH="$HOME/.bun/bin:$PATH" bun run programs:lint`, and `git diff --check`.

## Surprises & Discoveries

The immediate runtime transport fixes belong in the runtime-footgun plan. This plan starts after transport is safe and focuses on what data gets stored, rolled up, and exported.

The current `apps/web` to `qa/scripts` contract import is a planning smell even if it works locally. The repo should either make that a deliberate script-only boundary or move shared contract code to a more intentional location.

The completed runtime-boundary Program did not take over this slice. Its completed client observability child plan explicitly kept storage, Convex models, and runtime intake exports out of scope. Therefore this plan should focus on the Convex incident ledger, occurrence-versus-rollup semantics, runtime intake grouping, and the shared engineering-intake contract boundary.

The repository has already drifted ahead of the original plan text: the engineering-intake contract helpers now live under `scripts/release/lib/engineering-intake-contract.mjs`, and app tests import that path. The old `qa/scripts/lib/engineering-intake-contract.mjs` reference is stale.

Convex codegen passed after adding `incidentOccurrences`; it did not produce generated-file diffs because the generated data model imports the live schema definition.

## Decision Log

Decision: Do not change observability storage shape without tests first.
Rationale: Observability is a debugging surface. Silent storage changes can make historical incidents harder to understand.
Date: 2026-04-23

Decision: Separate occurrence truth from rollup truth.
Rationale: A rollup answers how often a class of issue occurs. An occurrence answers what happened in one request or browser session. They should not overwrite each other.
Date: 2026-04-23

Decision: Keep runtime transport out of this plan and treat `sbs-runtime-boundary-hardening` as a completed prerequisite.
Rationale: That Program already landed best-effort client observability transport. Reopening transport here would blur Program boundaries. This plan owns the data contract after an event reaches Convex or the runtime intake exporter.
Date: 2026-04-24

Decision: Store per-event occurrence truth in a separate `incidentOccurrences` table instead of appending occurrences to `incidents`.
Rationale: Convex guidance warns against unbounded arrays on a document. A separate table lets the rollup row stay small and lifecycle-focused while preserving request-specific stack, request id, URL, and detail fields for each occurrence.
Date: 2026-04-24

## Outcomes & Retrospective

This plan is complete. The observability ledger now has an explicit two-table contract: `incidents` is the lifecycle rollup and `incidentOccurrences` stores per-event occurrence truth. The rollup still mirrors latest request-specific fields for compatibility, but `latestOccurrenceId` now points to the durable occurrence row.

Runtime intake export remains lifecycle-owned by `incidents`; it groups by canonical runtime identity and includes `incidentOccurrences:<id>` source record refs when available. Legacy incident rows without `latestOccurrenceId` remain exportable because the export only adds occurrence refs conditionally.

The shared engineering-intake contract boundary is now documented as `scripts/release/lib/engineering-intake-contract.mjs`, with QA fixtures under `qa/fixtures/engineering-intake/` serving as compatibility examples rather than implementation ownership. The focused and broader observability unit lanes passed, Convex codegen passed, and repo format, lint, typecheck, plan lint, markdown lint, and whitespace checks passed.

## Context and Orientation

The observability Convex model lives in `apps/web/convex/observability.ts`, `apps/web/convex/observability/model.ts`, and related schema definitions in `apps/web/convex/schema.ts`. Runtime export code lives under `apps/web/features/observability/export/`. The shared engineering-intake contract helpers now live under `scripts/release/lib/engineering-intake-contract.mjs`, which is an intentional repo-level script boundary shared by runtime and release exporters. Documentation lives in `docs/internal/observability.md`.

### In Scope

In scope is clarifying incident rollup versus occurrence records, preserving request-specific stack, request id, URL, and detail fields where the schema supports it, updating runtime intake export grouping, documenting the `scripts/release/lib/` engineering-intake contract ownership, and adding tests for current and supported legacy observability data shapes.

### Out Of Scope

Out of scope is changing client telemetry transport, changing release triage behavior, deleting historical observability data, adding a new external observability vendor, or creating a broad destructive Convex schema migration. The completed `sbs-runtime-boundary-hardening` Program owns transport behavior.

## Plan of Work

Start by reading `apps/web/convex/_generated/ai/guidelines.md`. Then inspect the current schema and model code to identify which documents are rollups and which fields represent last occurrence details.

Add characterization tests around existing export behavior before changing shape. The tests should cover current incident export, legacy or partial incident data if supported, and the fields engineering intake depends on.

Then decide the contract. If the schema can preserve occurrence details without a migration, add fields or helper functions that keep stack, request id, user agent, URL, and occurrence time separate from aggregate count and first/last seen data. If a migration is needed, document it in this plan before editing schema.

Next clean the intake boundary. The current dirty work already uses `scripts/release/lib/engineering-intake-contract.mjs`; this plan should make that boundary explicit in tests and docs, and keep imports one-way from app/export tests into the repo-level script contract.

Finally run focused tests and docs validation. Do not mark the plan complete unless old or partial incident records still export safely or the plan explicitly records why they are unsupported.

## Milestones

Milestone 1 characterizes current observability data. At the end, tests prove the current export and rollup behavior before shape changes.

Milestone 2 defines the data contract. At the end, the plan records the occurrence and rollup fields and why the chosen storage shape is safe.

Milestone 3 preserves useful occurrence details. At the end, stack, request, URL, and related details are not lost during ingestion or export where available.

Milestone 4 fixes shared intake contract ownership. At the end, `apps/web` and release/QA tests use `scripts/release/lib/engineering-intake-contract.mjs` as the deliberate script-owned contract boundary, and docs no longer point at stale `qa/scripts/lib/` ownership.

Milestone 5 validates the slice. At the end, focused tests, Convex type generation if needed, plan lint, markdown lint, and repo closeout checks have passed or blockers are recorded.

## Concrete Steps

1. Read Convex guidance:

       cd /Users/parkerrex/Developer/ship-by-sunday
       sed -n '1,220p' apps/web/convex/_generated/ai/guidelines.md

2. Map observability data and export references:

       cd /Users/parkerrex/Developer/ship-by-sunday
       rg -n 'observability|incidents|errorEvents|engineering-intake|runtime-intake' apps/web/convex apps/web/features/observability qa/scripts docs/internal

3. Add focused tests for current runtime intake export and model behavior before changing schema.

4. Update `apps/web/convex/observability/model.ts` and related functions to preserve occurrence details separately from rollup fields. If schema changes are needed, update `apps/web/convex/schema.ts` and generated types through the repo's normal Convex flow.

5. Move or clarify shared engineering-intake contract ownership. Keep imports one-way and script-safe.

6. Update `docs/internal/observability.md` with the final contract.

7. Run focused tests and validation:

       cd /Users/parkerrex/Developer/ship-by-sunday
       bun run --cwd apps/web test:unit -- tests/unit/observability-convex.test.ts tests/unit/runtime-intake-export.test.ts tests/unit/engineering-intake-contract.test.ts
       cd apps/web && bunx convex codegen
       cd apps/web && bun run test:unit -- tests/unit/observability-*.test.ts tests/unit/runtime-intake-export.test.ts tests/unit/engineering-intake-contract.test.ts
       bun run plans:lint -- --plan docs/exec-plans/active/2026-04-23-harden-observability-data-contracts.md
       bun run markdown:lint -- --paths docs/exec-plans/active/2026-04-23-harden-observability-data-contracts.md
       git diff --check
       bun run format
       bun run lint
       bun run typecheck

## Validation and Acceptance

This slice is complete when observability data has a documented rollup and occurrence contract, client error details survive ingestion and export where available, engineering-intake contract ownership is intentional, and focused tests prove current and supported legacy data shapes.

### Test Commands

Run these commands from `/Users/parkerrex/Developer/ship-by-sunday`:

       bun run --cwd apps/web test:unit -- tests/unit/observability-convex.test.ts tests/unit/runtime-intake-export.test.ts tests/unit/engineering-intake-contract.test.ts
       cd apps/web && bunx convex codegen
       cd apps/web && bun run test:unit -- tests/unit/observability-*.test.ts tests/unit/runtime-intake-export.test.ts tests/unit/engineering-intake-contract.test.ts
       bun run plans:lint -- --plan docs/exec-plans/active/2026-04-23-harden-observability-data-contracts.md
       bun run markdown:lint -- --paths docs/exec-plans/active/2026-04-23-harden-observability-data-contracts.md
       git diff --check
       bun run format
       bun run lint
       bun run typecheck

Final validation passed with the exact commands recorded in `Progress`. When running the broader observability glob from `zsh`, run it from `apps/web` or quote the glob; otherwise root-level `zsh` expands the path before `bun --cwd` changes directories.

## Idempotence and Recovery

Schema changes must be additive unless a migration plan is written into this plan first. Export tests should use fixtures rather than live hosted Convex data. If old incidents cannot be supported, the export should fail with a clear contract error rather than silently dropping fields.

## Artifacts and Notes

Program source for this plan:

       docs/programs/active/2026-04-23-sbs-codebase-recovery/planning-brief-1.md

High-signal files from the review:

       apps/web/convex/observability.ts
       apps/web/convex/observability/model.ts
       apps/web/convex/schema.ts
       apps/web/features/observability/export/
       scripts/release/lib/engineering-intake-contract.mjs
       docs/internal/observability.md

## Interfaces and Dependencies

This plan depends on hosted Convex dev conventions, current observability ingestion routes, runtime intake export scripts, and QA engineering-intake contract tests. Do not use Convex local mode in this repo.
