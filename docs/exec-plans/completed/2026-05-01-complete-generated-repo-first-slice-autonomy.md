---
title: Complete Generated Repo First Slice Autonomy
status: complete
created_at: 2026-05-01
completed_at: 2026-05-01
summary: Finish the generated-repo autonomy guarantee so a downloaded customer repo can guide a fresh coding agent through first-slice execution without chat history.
post_build_recap: Generated repos now include a structured first-slice plan, package-script-backed validation manifest, review and verification pack, broader weak-fact blocker detection, and clean-room replay tests that parse the materialized Build Pack without chat history.
program_id: generated-repo-first-slice-autonomy
planning_brief: docs/programs/completed/2026-05-01-generated-repo-first-slice-autonomy/planning-brief-3.md
read_when:
  - Resuming the generated-repo autonomy completion pass.
  - Validating generated Build Pack execution docs.
  - Checking clean-room replay and structural regression coverage.
---

# Complete Generated Repo First Slice Autonomy

This document is a living execution plan for finishing the generated-repo first-slice autonomy Program.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

After this plan is complete, every generated customer repo should contain a Build Pack that a fresh coding agent can use without chat history. The agent should know the first product slice, the files and boundaries to inspect, the typed validation commands or manual proof required, the review and verification path, and the exact customer questions that must be asked before guessing.

The user-visible result is a downloaded repo whose generated docs can be parsed and replayed in a clean-room test. The repo is not claimed to be production-ready, but it is self-contained enough for first-slice execution or a truthful blocked verdict.

## Progress

- [x] 2026-05-01 EDT: Created `planning-brief-3.md` and this active ExecPlan for the completion pass.
- [x] 2026-05-01 EDT: Derive a structured first-slice plan from existing Blueprint facts and starter file ownership.
- [x] 2026-05-01 EDT: Harden validation resolution against generated root `package.json` scripts.
- [x] 2026-05-01 EDT: Generate review and verification guidance under the Build Pack.
- [x] 2026-05-01 EDT: Expand weak-fact detection and customer-question gates.
- [x] 2026-05-01 EDT: Add clean-room replay and structural regression tests.
- [x] 2026-05-01 EDT: Run focused compiler validation, package typecheck, package format check, and package lint.
- [x] 2026-05-01 EDT: Run planning lint, Program lint, markdown lint, repo format, repo lint, repo typecheck, and diff whitespace checks after moving completed docs.

## Surprises & Discoveries

The generated root `package.json` previously did not expose a root script for compiler tests, while the Build Pack wanted to tell agents to run compiler validation. The completion pass extracted generated package scripts into `packages/blueprint-compiler/src/repo-generation/starter-root-package-json.ts` and added `test:compiler` so readiness commands can be verified against generated scripts.

## Decision Log

Decision: Complete the remaining roadmap in one focused compiler-owned pass.
Rationale: The remaining slices share the same readiness model and generated Build Pack renderer, so a single pass can avoid duplicated intermediate docs while staying inside the requested scope.
Date: 2026-05-01

Decision: Derive from existing canonical facts and generated starter ownership.
Rationale: The current schema already includes product flow, capabilities, scope, acceptance criteria, validation plan, demo flow, proof sources, risks, dependencies, open questions, and placeholder-friendly contact fields.
Date: 2026-05-01

## Outcomes & Retrospective

Completed. Generated repos now include a deterministic readiness manifest, structured first-slice plan, package-script-aware validation manifest, review and verification pack, weak-fact blocker list, and clean-room replay proof.

The generated Build Pack now emits `docs/build/docs/review.md` with a review prompt, verification lenses, expected demo proof, regression checks, and an evidence table. Detailed command, browser, log, or artifact proof belongs in `docs/testing/run-report.md`. The materialized snapshot test parses `docs/build/docs/readiness.md` and generated root `package.json` to prove runnable validation entries reference real package scripts.

## Context and Orientation

The owning package is `packages/blueprint-compiler`. The generated Build Pack is rendered by `packages/blueprint-compiler/src/blueprints/render-build-blueprint.ts`. The readiness model lives in `packages/blueprint-compiler/src/readiness/build-pack-readiness.ts`. The materialized customer repo is assembled by `packages/blueprint-compiler/src/repo-generation/materialize-repo-snapshot.ts`, with starter files from `packages/blueprint-compiler/src/repo-generation/render-generalized-starter-files.ts`, `packages/blueprint-compiler/src/repo-generation/render-template-overrides.ts`, and `packages/blueprint-compiler/src/repo-generation/render-starter-skills.ts`.

The generated customer-facing docs that matter for this plan are `docs/build/docs/readiness.md`, `docs/build/docs/agent-handoff.md`, `docs/build/docs/prompt.md`, `docs/build/docs/plans.md`, `docs/build/docs/implement.md`, `docs/build/docs/documentation.md`, the review and verification file generated by this plan, and `docs/testing/run-report.md`.

### In Scope

Extend the compiler-owned readiness model, generated Build Pack renderer, generated-doc path typing, and focused compiler tests. Add a generated review and verification pack that maps detailed evidence to `docs/testing/run-report.md`. Add clean-room replay proof that parses generated docs from a materialized repo snapshot and verifies the command manifest, first-slice plan, blocker visibility, and customer-safe output.

Update this Program and ExecPlan as the completion pass lands.

### Out Of Scope

Do not touch auth, billing, checkout, Convex runtime, app routes, provider setup, generated mirrors, production provider behavior, or unrelated docs. Do not add required schema fields unless derivation from existing facts is impossible. Do not claim the customer product is production-ready.

## Plan of Work

First, expand `build-pack-readiness.ts` so `BuildPackReadinessManifest` includes a structured `firstSlice.plan`, starter file ownership, validation command script verification, review and verification guidance, and broader weak-fact warnings.

Second, update `render-build-blueprint.ts` so every generated Build Pack doc consumes that shared model. Add `docs/build/docs/review.md`, link it from handoff and implementation docs, and keep readiness as the first source of truth before the copy-ready prompt.

Third, update structural tests in `blueprint-renderers.test.ts` and `repo-generation.test.ts`. The tests should parse generated markdown tables enough to prove command entries are typed, runnable commands exist in generated `package.json`, blocked commands are visible, first-slice plan sections exist, review and verification sections exist, placeholders and weak facts are visible, and the materialized snapshot can be replayed without chat history.

Fourth, update the Program and this ExecPlan to reflect completion and run validation.

## Milestones

Milestone 1 derives first-slice planning and package-aware validation. Success means the generated readiness file contains a structured first-slice plan and runnable validation commands that correspond to scripts in generated `package.json`.

Milestone 2 generates the review and verification pack. Success means `docs/build/docs/review.md` exists, is linked from handoff and implementation docs, and contains a review prompt, verification lenses, expected demo proof, regression checks, and an evidence table that points detailed proof to `docs/testing/run-report.md`.

Milestone 3 expands weak-fact detection. Success means placeholder-like links, missing proof sources, vague deliverables, broad acceptance criteria, vague next-slice labels, and open customer questions are visible as warnings, blockers, or ask-customer gates without blocking repo generation for placeholder-friendly fields.

Milestone 4 adds clean-room replay and structural regressions. Success means tests materialize a generated repo snapshot, parse the generated docs and package manifest, and assert the Build Pack is customer-safe and executable or truthfully blocked without chat history.

Milestone 5 validates and closes the Program. Success means focused compiler checks, planning lint, Program lint, markdown lint, and repo gates pass or any unrelated blocker is documented precisely.

## Concrete Steps

From `/Users/bazelrex/Developer/ship-by-sunday`, edit only compiler, Program, and ExecPlan files needed for this plan.

Run focused tests while implementing:

    bun run --cwd packages/blueprint-compiler test -- tests/blueprint-renderers.test.ts tests/repo-generation.test.ts tests/canonical-project-definition.test.ts

After implementation, run the full validation list in `Validation and Acceptance`.

If a generated validation command does not correspond to a generated root `package.json` script, the resolver classifies it as `blocked` and includes the customer or repo-owner question needed to resolve it.

If a fact is missing, placeholder-like, or too generic for first-slice autonomy, repo generation remains allowed but readiness surfaces the issue before any production claim.

## Validation and Acceptance

Acceptance requires generated repos to include deterministic readiness, derived first-slice planning, package-aware typed validation entries, review and verification proof, weak-fact blocker visibility, clean-room replay proof, and structural regression tests that parse generated docs rather than relying only on substring checks. This implementation satisfies those requirements in the generated Build Pack renderer and compiler tests.

The final Program state must truthfully say no required next slice remains inside this Program.

### Test Commands

Run these commands from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run --cwd packages/blueprint-compiler test -- tests/blueprint-renderers.test.ts tests/repo-generation.test.ts tests/canonical-project-definition.test.ts
    bun run --cwd packages/blueprint-compiler typecheck
    bun run --cwd packages/blueprint-compiler format:check
    bun run --cwd packages/blueprint-compiler lint
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-01-complete-generated-repo-first-slice-autonomy.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs docs/exec-plans/completed/2026-05-01-complete-generated-repo-first-slice-autonomy.md
    bun run format
    bun lint
    bun typecheck
    git diff --check

## Idempotence and Recovery

The implementation is source-only and safe to rerun. If generated docs drift, fix the compiler renderer and tests rather than editing generated mirrors.

If a validation command is misclassified, adjust the compiler-owned resolver and rerun focused tests before broad gates.

If Program or plan lint fails, repair the durable planning files instead of weakening the linter.

## Artifacts and Notes

The current Program planning brief for this completion pass is `docs/programs/completed/2026-05-01-generated-repo-first-slice-autonomy/planning-brief-3.md`.

Validation results recorded on 2026-05-01 EDT:

    bun run --cwd packages/blueprint-compiler test -- tests/blueprint-renderers.test.ts tests/repo-generation.test.ts tests/canonical-project-definition.test.ts
    3 files and 14 tests passed.

    bun run --cwd packages/blueprint-compiler test
    10 files and 35 tests passed.

    bun run --cwd packages/blueprint-compiler typecheck
    passed.

    bun run --cwd packages/blueprint-compiler format:check
    passed.

    bun run --cwd packages/blueprint-compiler lint
    passed with 0 warnings and 0 errors.

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-01-complete-generated-repo-first-slice-autonomy.md
    passed.

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-01-build-pack-readiness-manifest.md
    passed.

    bun run programs:lint
    passed.

    bun run markdown:lint -- --paths docs/programs docs/exec-plans/completed/2026-05-01-build-pack-readiness-manifest.md docs/exec-plans/completed/2026-05-01-complete-generated-repo-first-slice-autonomy.md
    passed.

    bun run format
    passed.

    bun lint
    passed with 0 warnings and 0 errors.

    bun typecheck
    passed and generated 71 static pages.

    git diff --check
    passed.

There are local package and lockfile changes in `apps/web/package.json` and `bun.lock` that are outside this compiler scope. They were preserved.

## Interfaces and Dependencies

This plan depends on root `AGENTS.md`, `docs/programs/PROGRAMS.md`, `docs/exec-plans/PLANS.md`, `packages/blueprint-compiler/AGENTS.md`, `packages/blueprint-compiler/src/canonical-project-definition/schema.ts`, generated Build Pack renderers, repo-generation materialization, and compiler tests.
