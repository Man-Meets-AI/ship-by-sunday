---
title: Harden Observability Data Contracts
status: active
created_at: 2026-04-23
completed_at: null
summary: Make observability storage, incident rollups, event occurrences, and engineering-intake exports intentionally owned and testable.
post_build_recap: null
read_when:
  - Resuming observability data-contract work.
  - Changing Convex observability schema, incident export, or engineering-intake contracts.
  - Validating the fifth Ship by Sunday recovery slice.
---

# Harden Observability Data Contracts

This is a living execution plan. Keep it current as implementation, proof, and discoveries change the observability data-contract hardening path.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Observability should preserve useful truth. Today the review found that incident records can mix rollup state with occurrence details, old and new observability shapes coexist, client error details can be lost, and engineering-intake contracts cross ownership boundaries. After this plan, the observability model should make it clear what is an event occurrence, what is a rollup, what is exported for engineering intake, and which module owns the shared contract.

This plan is the fifth child slice of the Program packet at `docs/programs/active/2026-04-23-sbs-codebase-recovery/`, written from `planning-brief-1.md`.

## Progress

- [x] 2026-04-23 EDT: Identified observability data-contract issues from the read-only review.
- [ ] Read Convex guidelines before touching Convex code.
- [ ] Characterize current incident rollup and export behavior with tests.
- [ ] Decide the occurrence-versus-rollup contract.
- [ ] Preserve client stack and request details through the ingestion path.
- [ ] Move shared engineering-intake contract code to an intentional boundary or document why the current boundary remains temporary.
- [ ] Run focused tests and repo closeout checks.

## Surprises & Discoveries

The immediate runtime transport fixes belong in the runtime-footgun plan. This plan starts after transport is safe and focuses on what data gets stored, rolled up, and exported.

The current `apps/web` to `qa/scripts` contract import is a planning smell even if it works locally. The repo should either make that a deliberate script-only boundary or move shared contract code to a more intentional location.

## Decision Log

Decision: Do not change observability storage shape without tests first.
Rationale: Observability is a debugging surface. Silent storage changes can make historical incidents harder to understand.
Date: 2026-04-23

Decision: Separate occurrence truth from rollup truth.
Rationale: A rollup answers how often a class of issue occurs. An occurrence answers what happened in one request or browser session. They should not overwrite each other.
Date: 2026-04-23

## Outcomes & Retrospective

This plan is active. Fill this section after implementation with the final observability data contract, migration or compatibility choices, and export validation evidence.

## Context and Orientation

The observability Convex model lives in `apps/web/convex/observability.ts`, `apps/web/convex/observability/model.ts`, and related schema definitions in `apps/web/convex/schema.ts`. Runtime export code lives under `apps/web/features/observability/export/`. Engineering-intake contract helpers currently live under `qa/scripts/lib/`. Documentation lives in `docs/internal/observability.md`.

### In Scope

In scope is clarifying incident rollup versus occurrence records, preserving client error stack and request details where the schema supports it, updating runtime intake export boundaries, moving or documenting shared intake contract ownership, and adding tests for legacy and current observability data shapes.

### Out Of Scope

Out of scope is changing client telemetry transport, changing release triage behavior, deleting historical observability data, adding a new external observability vendor, or creating a broad Convex schema migration without a compatibility plan.

## Plan of Work

Start by reading `apps/web/convex/_generated/ai/guidelines.md`. Then inspect the current schema and model code to identify which documents are rollups and which fields represent last occurrence details.

Add characterization tests around existing export behavior before changing shape. The tests should cover current incident export, legacy or partial incident data if supported, and the fields engineering intake depends on.

Then decide the contract. If the schema can preserve occurrence details without a migration, add fields or helper functions that keep stack, request id, user agent, URL, and occurrence time separate from aggregate count and first/last seen data. If a migration is needed, document it in this plan before editing schema.

Next clean the intake boundary. Either move shared engineering-intake contract code to a deliberate shared script/package location or make the script-only boundary explicit and keep imports one-way. Update docs so future agents know where the contract lives.

Finally run focused tests and docs validation. Do not mark the plan complete unless old or partial incident records still export safely or the plan explicitly records why they are unsupported.

## Milestones

Milestone 1 characterizes current observability data. At the end, tests prove the current export and rollup behavior before shape changes.

Milestone 2 defines the data contract. At the end, the plan records the occurrence and rollup fields and why the chosen storage shape is safe.

Milestone 3 preserves useful occurrence details. At the end, stack, request, URL, and related details are not lost during ingestion or export where available.

Milestone 4 fixes shared intake contract ownership. At the end, `apps/web` and `qa/scripts` no longer have an accidental dependency boundary.

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
       bun run --cwd apps/web test:unit -- tests/unit/runtime-intake-export.test.ts tests/unit/engineering-intake-contract.test.ts
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

       bun run --cwd apps/web test:unit -- tests/unit/runtime-intake-export.test.ts tests/unit/engineering-intake-contract.test.ts
       bun run plans:lint -- --plan docs/exec-plans/active/2026-04-23-harden-observability-data-contracts.md
       bun run markdown:lint -- --paths docs/exec-plans/active/2026-04-23-harden-observability-data-contracts.md
       git diff --check
       bun run format
       bun run lint
       bun run typecheck

Also run any Convex-specific tests or type generation required by the implementation and record exact commands in `Progress`.

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
       qa/scripts/lib/engineering-intake-contract.mjs
       docs/internal/observability.md

## Interfaces and Dependencies

This plan depends on hosted Convex dev conventions, current observability ingestion routes, runtime intake export scripts, and QA engineering-intake contract tests. Do not use Convex local mode in this repo.
