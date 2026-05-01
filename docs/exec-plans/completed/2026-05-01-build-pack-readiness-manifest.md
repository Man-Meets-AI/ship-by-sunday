---
title: Build Pack Readiness Manifest
status: complete
created_at: 2026-05-01
completed_at: 2026-05-01
summary: Generate a deterministic Build Pack readiness manifest from existing Blueprint facts so fresh agents can see first-slice confidence, typed validation, blockers, and customer-input work.
post_build_recap: Generated Build Pack readiness manifests now include first-slice confidence, typed runnable/manual/blocked validation entries, blockers, placeholder customer-input work, and weak-fact warnings, with handoff and compiler tests proving the file appears in rendered and materialized repos.
program_id: generated-repo-first-slice-autonomy
planning_brief: docs/programs/completed/2026-05-01-generated-repo-first-slice-autonomy/planning-brief-1.md
read_when:
  - Implementing the first generated-repo autonomy slice.
  - Validating generated Build Pack readiness output.
  - Checking typed validation entries for generated customer repos.
---

# Build Pack Readiness Manifest

This document is a living execution plan for generating a deterministic Build Pack readiness manifest.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

After this slice, every generated customer repo includes `docs/build/docs/readiness.md`. A fresh coding agent can open the handoff, read readiness before the copy-ready prompt, see whether the first slice has high, needs-customer-input, or blocked confidence, and distinguish runnable validation commands from manual or blocked proof.

This matters because the current Build Pack is structurally complete but can emit unknown validation steps as shell comments. The user-visible result is a generated repo that makes missing customer input and weak facts explicit instead of letting an agent guess.

## Progress

- [x] 2026-05-01 EDT: Read root and compiler instructions, Program and ExecPlan contracts, Build Pack renderers, repo-generation materialization, and existing compiler tests.
- [x] 2026-05-01 EDT: Created the Program packet and this child ExecPlan from `planning-brief-1.md`.
- [x] 2026-05-01 EDT: Added `packages/blueprint-compiler/src/readiness/build-pack-readiness.ts` with first-slice confidence, typed validation entries, blockers, placeholder customer-input work, weak-fact warnings, and readiness limits.
- [x] 2026-05-01 EDT: Generated `docs/build/docs/readiness.md` from `renderBuildBlueprint()` and linked it from `agent-handoff.md` before the copy-ready prompt.
- [x] 2026-05-01 EDT: Strengthened complete and reduced project-definition tests plus materialized repo snapshot assertions.
- [x] 2026-05-01 EDT: Focused compiler tests, package typecheck, package format check, package lint, planning lint, repo format, repo lint, repo typecheck, and diff whitespace checks passed.

## Surprises & Discoveries

The compiler already has a `readiness` folder for blueprint-stage readiness, but that model only answers whether the Blueprint and Review stages are ready. The generated Build Pack needs a separate model that speaks in first-slice confidence, typed validation entries, blockers, warnings, and customer-input gates.

Open questions in generated facts are currently treated as readiness blockers because a fresh agent should not change promise, scope, data model, provider behavior, credentials, or production claims while customer questions remain unresolved.

## Decision Log

Decision: Add a separate Build Pack readiness model instead of overloading blueprint-stage readiness.
Rationale: Blueprint-stage readiness and generated-repo execution readiness have different states and outputs.
Date: 2026-05-01

Decision: Use existing canonical facts first.
Rationale: The first slice can derive first-slice confidence, validation entries, placeholder work, and weak-fact warnings from existing facts without adding required intake fields.
Date: 2026-05-01

Decision: Treat unknown validation steps as blocked entries, not shell comments.
Rationale: A blocked typed entry is truthful and customer-safe; a shell comment inside a command block looks executable but does not prove anything.
Date: 2026-05-01

Decision: Keep the first-slice readiness manifest separate from the later clean-room replay guarantee.
Rationale: The manifest makes the handoff deterministic, but replay proof is a later Program slice and should not be implied by the first slice.
Date: 2026-05-01

## Outcomes & Retrospective

Completed. Generated repos now include `docs/build/docs/readiness.md` with a first-slice confidence state, typed validation table, runnable command block, blocker table, customer-input work table, weak-fact warnings, ask-customer gates, and explicit readiness limits.

The handoff now presents `## Readiness First` before `## Start Prompt`, so a fresh agent sees readiness before the copy-ready prompt. Existing Build Pack docs now reference the typed validation manifest instead of emitting unknown validation text as shell comments.

The main remaining Program work is the next child slice: derive a more structured first-slice plan from product flow, capabilities, scope, acceptance criteria, and starter files.

## Context and Orientation

The owning package is `packages/blueprint-compiler`. The generated Build Pack is rendered by `packages/blueprint-compiler/src/blueprints/render-build-blueprint.ts` and included in the full blueprint tree by `packages/blueprint-compiler/src/server/rendered-blueprint-tree.ts`. The materialized customer repo combines generated blueprint files, starter overrides, generated design files, and repo-safe source files through `packages/blueprint-compiler/src/repo-generation/materialize-repo-snapshot.ts`.

The relevant generated files are `docs/build/docs/agent-handoff.md`, `docs/build/docs/prompt.md`, `docs/build/docs/plans.md`, `docs/build/docs/implement.md`, and `docs/build/docs/documentation.md`. This slice adds `docs/build/docs/readiness.md` and makes the handoff point to it before the copy-ready prompt.

### In Scope

Add a Build Pack readiness model under `packages/blueprint-compiler/src`, update generated Build Pack rendering, update generated-doc path typing, and strengthen compiler tests for complete and reduced project definitions.

Represent validation entries as `runnable`, `manual`, or `blocked`. Surface placeholders and weak facts as readiness warnings or blockers without making domain, contact email, or support email block repo generation.

### Out Of Scope

Do not touch auth, billing, checkout, Convex runtime, app routes, provider setup, generated mirrors, unrelated docs, or production provider behavior.

Do not add canonical schema fields unless derivation from existing facts is impossible. Do not claim autonomous build readiness until a later clean-room replay proof exists.

## Plan of Work

First, add a small readiness model that derives a `BuildPackReadinessManifest` from `CanonicalProjectFacts`. It should include first-slice confidence, validation entries, warnings, blockers, customer-question gates, and enough labels for markdown rendering.

Second, update `render-build-blueprint.ts` to use the readiness model for validation output and to emit `docs/build/docs/readiness.md`. Replace the shell-comment fallback with typed validation entries in generated markdown.

Third, update `agent-handoff.md` so readiness appears before the copy-ready prompt. The handoff should tell the agent to read `docs/build/docs/readiness.md` before using the prompt.

Fourth, strengthen tests in `packages/blueprint-compiler/tests/blueprint-renderers.test.ts` and `packages/blueprint-compiler/tests/repo-generation.test.ts`. The tests should assert the readiness file exists, is customer-safe, includes typed validation entries, makes placeholders visible, names blockers, and covers complete plus reduced project definitions.

## Milestones

Milestone 1 adds the readiness model and renderer integration. Success means the full blueprint tree includes `docs/build/docs/readiness.md` and existing Build Pack docs use typed validation output.

Milestone 2 strengthens tests. Success means complete and reduced project-definition tests assert readiness behavior structurally enough to catch missing typed entries, blockers, placeholder work, and confidence state.

Milestone 3 runs validation. Success means focused compiler tests, package typecheck, package format check, package lint, and repo-level format, lint, and typecheck pass or any unrelated blockers are documented.

## Concrete Steps

From `/Users/bazelrex/Developer/ship-by-sunday`, inspect and edit the compiler files only.

Add the model under `packages/blueprint-compiler/src/readiness/` or another compiler-owned path with a domain-specific name. Keep function names specific, such as `buildBuildPackReadinessManifest`, rather than generic helpers.

Update `packages/blueprint-compiler/src/generated-docs/generated-doc-paths.ts` so `readiness.md` is a valid generated Build detail doc name.

Update `packages/blueprint-compiler/src/blueprints/render-build-blueprint.ts` to render the readiness file, link it from handoff before the copy-ready prompt, and use typed validation entries instead of `# ${validationStep}`.

Update focused tests and run:

    bun run --cwd packages/blueprint-compiler test -- tests/blueprint-renderers.test.ts tests/repo-generation.test.ts tests/canonical-project-definition.test.ts
    bun run --cwd packages/blueprint-compiler typecheck
    bun run --cwd packages/blueprint-compiler format:check
    bun run --cwd packages/blueprint-compiler lint
    bun run format
    bun lint
    bun typecheck

## Validation and Acceptance

The slice is accepted when generated repos include `docs/build/docs/readiness.md`, `agent-handoff.md` points to readiness before the copy-ready prompt, validation entries are typed as `runnable`, `manual`, or `blocked`, placeholder-friendly fields stay allowed but are named as customer-input work, tests cover complete and reduced project definitions, and the generated materialized repo snapshot includes a customer-safe readiness file.

### Test Commands

Run these commands from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run --cwd packages/blueprint-compiler test -- tests/blueprint-renderers.test.ts tests/repo-generation.test.ts tests/canonical-project-definition.test.ts
    bun run --cwd packages/blueprint-compiler typecheck
    bun run --cwd packages/blueprint-compiler format:check
    bun run --cwd packages/blueprint-compiler lint
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-01-build-pack-readiness-manifest.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs docs/exec-plans/completed/2026-05-01-build-pack-readiness-manifest.md
    bun run format
    bun lint
    bun typecheck
    git diff --check

## Idempotence and Recovery

The implementation is source-only and safe to rerun. If tests fail because the readiness manifest is missing from the materialized snapshot, verify that the full blueprint tree renders the new file and that materialization includes generated blueprint files.

If command typing misclassifies a validation entry, adjust the compiler-owned resolver and rerun the focused tests before broad gates.

If Program or plan lint fails, repair the durable planning files instead of weakening the linter or deleting packet artifacts.

## Artifacts and Notes

The first Program planning brief is `docs/programs/completed/2026-05-01-generated-repo-first-slice-autonomy/planning-brief-1.md`.

The generated readiness file path must be `docs/build/docs/readiness.md`.

The previous risky fallback was the shell-comment output for unknown validation steps in `buildValidationCommand()`. That behavior should not remain in generated command blocks.

Validation results recorded on 2026-05-01 EDT:

    bun run --cwd packages/blueprint-compiler test -- tests/blueprint-renderers.test.ts tests/repo-generation.test.ts tests/canonical-project-definition.test.ts
    3 files and 13 tests passed.

    bun run --cwd packages/blueprint-compiler typecheck
    passed.

    bun run --cwd packages/blueprint-compiler format:check
    passed.

    bun run --cwd packages/blueprint-compiler lint
    passed with 0 warnings and 0 errors.

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-01-build-pack-readiness-manifest.md
    passed before completion move.

    bun run programs:lint
    passed.

    bun run markdown:lint -- --paths docs/programs docs/exec-plans/active/2026-05-01-build-pack-readiness-manifest.md
    passed before completion move.

    bun run format
    passed.

    bun lint
    passed with 0 warnings and 0 errors.

    bun typecheck
    passed and generated 71 static pages.

    git diff --check
    passed.

## Interfaces and Dependencies

This plan depends on `CanonicalProjectFacts`, generated-doc path helpers, `renderBuildBlueprint()`, `renderFullBlueprintTree()`, `materializeRepoSnapshot()`, and tests under `packages/blueprint-compiler/tests`.

It intentionally does not depend on app runtime routes, Convex, auth, billing, checkout, provider setup, or generated mirrors.
