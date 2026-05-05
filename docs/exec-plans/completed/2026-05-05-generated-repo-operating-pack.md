---
title: Generated Repo Operating Pack
status: complete
created_at: 2026-05-05
completed_at: 2026-05-05
summary: Ship a customer-safe Program and ExecPlan operating pack inside generated repos so agents can plan, validate, and resume product work without internal Ship by Sunday archives.
post_build_recap: Generated repos now include customer-safe Program and ExecPlan contracts, an active Program packet, a first active ExecPlan, explicit operating-pack validation scripts, package-script wiring, onboarding references, and structural compiler proof.
program_id: customer-agentic-operating-system
planning_brief: docs/programs/active/2026-05-02-customer-agentic-operating-system/planning-brief-1.md
read_when:
  - Implementing generated-repo Program or ExecPlan output.
  - Validating generated customer operating-pack files and scripts.
  - Checking that generated repos do not ship internal Ship by Sunday planning history.
---

# Generated Repo Operating Pack

This document is a living execution plan for the generated-repo operating-pack slice.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Generated repos already include root agent guidance, Build Pack docs, prompt assets, setup skills, and validation notes. They still need a customer-safe operating pack: a small Program packet for the generated product, a first active ExecPlan, explicit validation scripts, and onboarding references that let agents plan and resume product work without copying Ship by Sunday's internal Program archives. After this slice, a downloaded repo can run `bun run agentic:check`, `bun run programs:lint`, and `bun run plans:lint` to prove its generated Program and ExecPlan files are structurally present and safe.

## Progress

- [x] 2026-05-05 EDT: Read root and package instructions, `docs/programs/PROGRAMS.md`, `docs/exec-plans/PLANS.md`, the active Program next-slice section, `planning-brief-1.md`, and the completed source-contract ExecPlan before implementation.
- [x] 2026-05-05 EDT: Confirmed this slice should build on the completed source-contract cleanup and must not copy internal active or completed Program or ExecPlan archives into customer repos.
- [x] 2026-05-05 EDT: Added generated operating-pack files for `docs/programs/`, `docs/exec-plans/`, and `scripts/agentic/`, wired `programs:lint`, `plans:lint`, and `agentic:check` into generated root package scripts, and updated generated README, START-HERE, root assistant guidance, and starter skills.
- [x] 2026-05-05 EDT: Added focused materialization tests for generated Program/ExecPlan output, script wiring, zip output, customer-safe exclusions, and START-HERE skill resolution.
- [x] 2026-05-05 EDT: Ran a temporary materialized generated repo through `bun run agentic:check`; the generated `programs:lint` and `plans:lint` scripts both passed.
- [x] 2026-05-05 EDT: Focused compiler tests, package checks, temporary generated-repo smoke, root format, root lint, root typecheck, plan lint, program lint, markdown metadata lint, and whitespace validation passed.

## Surprises & Discoveries

- 2026-05-05 EDT: The customer-safe exclusion helper previously treated all `docs/exec-plans/active/*.md` paths the same. The operating pack now allows only the generated `YYYY-MM-DD-first-product-slice.md` plan pattern while continuing to exclude arbitrary internal active or completed ExecPlan archives.

## Decision Log

Decision: Generate a minimal customer-safe operating pack instead of copying internal Program and ExecPlan files.
Rationale: The Program requires customer-safe Program and ExecPlan artifacts, but internal archives contain Ship by Sunday history, operator decisions, release evidence, and repo-specific assumptions. Generated repos need templates and validators derived from the customer's product facts.
Date: 2026-05-05

Decision: Make operating-pack validation explicit package scripts, not a hidden install hook.
Rationale: The Program explicitly says there must be no hidden `postinstall` mutation. Customers should opt into structural validation with visible commands such as `bun run agentic:check`.
Date: 2026-05-05

Decision: Ship a simple generated structural validator instead of copying the repo's internal lint scripts.
Rationale: The internal linters validate Ship by Sunday's full planning ecosystem and prompt inventory. Generated repos need a smaller customer-owned validator that checks the generated Program and ExecPlan shape without depending on internal archives.
Date: 2026-05-05

## Outcomes & Retrospective

This plan is complete. Generated repos now ship a customer-safe operating pack without copying internal Ship by Sunday Program or ExecPlan archives. The pack includes `docs/programs/PROGRAMS.md`, a generated active Program packet, `docs/exec-plans/PLANS.md`, a generated first active ExecPlan, `scripts/agentic/check-programs.mjs`, `scripts/agentic/check-exec-plans.mjs`, and root package scripts for `programs:lint`, `plans:lint`, and `agentic:check`.

The generated README, START-HERE, root assistant guides, and local wrapper skills now point customers toward the operating pack explicitly. A temporary materialized repo ran its generated `bun run agentic:check` successfully, proving the generated scripts work outside the source checkout.

## Context and Orientation

Generated customer repo output is owned by `packages/codebase-compiler`. The materialized snapshot is assembled by `packages/codebase-compiler/src/repo-generation/materialize-repo-snapshot.ts`, which copies a customer-safe subset of tracked files, then overlays rendered files from `render-template-overrides.ts`, `render-generated-design-system-files.ts`, `render-generalized-starter-files.ts`, and the generated docs tree from `renderFullCodebaseTree`.

The previous source-contract slice made `execplan-*` the generated prompt family and proved START-HERE skill triggers resolve to shipped wrapper skills or external manifest entries. This slice should add new generated files and package scripts that are directly proven by materialization tests.

### In Scope

This slice includes generated `docs/programs/PROGRAMS.md`, generated Program index files, one generated active Program packet for the product, generated `docs/exec-plans/PLANS.md`, generated ExecPlan index files, one generated first active ExecPlan for the product, generated structural validation scripts under `scripts/agentic/`, package scripts for `programs:lint`, `plans:lint`, and `agentic:check`, START-HERE and README references to the operating pack, and focused compiler tests that prove the files exist, the scripts are advertised, internal archives remain excluded, and the generated validators catch the intended structure.

### Out Of Scope

This slice does not change app runtime behavior, auth, billing, checkout, Convex, public homepage copy, provider setup, local runner code, managed GitHub, mature-repo adoption, or generated app routes. It does not copy internal `docs/programs/active/**`, internal `docs/programs/completed/**`, internal `docs/exec-plans/active/**`, internal `docs/exec-plans/completed/**`, release evidence, or Ship by Sunday operator history into customer repos.

## Plan of Work

First, add a generated operating-pack renderer under `packages/codebase-compiler/src/repo-generation/`. The renderer should derive product names, slugs, dates, and summaries from the canonical project definition and emit only customer-safe Markdown plus small Node scripts. The Program should be about building the customer's product, not Ship by Sunday's internal initiative.

Next, wire the renderer into `renderTemplateOverrides` so these files override the excluded internal planning paths. Update `starter-root-package-json.ts` with `programs:lint`, `plans:lint`, and `agentic:check` scripts that run generated scripts under `scripts/agentic/`.

Then update onboarding and root guidance. `README.md`, `START-HERE.md`, and root assistant guides should name the operating pack and validation scripts without claiming hidden setup or background mutation.

After that, add focused compiler tests. Materialized snapshots should contain the generated Program and ExecPlan contracts, active packet files, script files, and package scripts. Tests should also assert that internal Program and ExecPlan archives remain excluded and that the generated operating scripts are referenced by package scripts.

Finally, run focused compiler validation, planning validation, and the repo gates. Move this plan to `completed/`, update the owning Program progress, ledger, next slice, risks, and validation notes.

## Milestones

The first milestone is generated artifacts. It is complete when a materialized repo contains the operating-pack docs and scripts under `docs/programs/`, `docs/exec-plans/`, and `scripts/agentic/`.

The second milestone is script wiring and onboarding. It is complete when generated root package scripts run the generated structural validators and onboarding tells customers to use those commands explicitly.

The third milestone is customer-safety proof. It is complete when focused compiler tests prove no internal planning archives are shipped and every advertised operating-pack script exists.

The fourth milestone is Program writeback. It is complete when this ExecPlan is completed, the Program points to the next slice, and validation evidence is recorded.

## Concrete Steps

Work from the repo root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Inspect the generated repo surfaces before editing:

    rg -n "START-HERE|plans:lint|programs:lint|agentic:check|docs/programs|docs/exec-plans" packages/codebase-compiler/src packages/codebase-compiler/tests

Run focused tests after implementation:

    bun run --cwd packages/codebase-compiler test -- tests/repo-generation.test.ts tests/review-download-zip.test.ts tests/customer-safe-snapshot-contract.test.ts tests/codebase-renderers.test.ts

Run package checks:

    bun run --cwd packages/codebase-compiler typecheck
    bun run --cwd packages/codebase-compiler lint
    bun run --cwd packages/codebase-compiler format:check

Run planning and repo validation before completion:

    bun run format
    bun lint
    bun typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-05-generated-repo-operating-pack.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-05-generated-repo-operating-pack.md docs/programs/active/2026-05-02-customer-agentic-operating-system
    git diff --check

## Validation and Acceptance

Acceptance requires a generated customer repo to contain a customer-safe operating pack with a Program packet, a first active ExecPlan, explicit validation scripts, package-script wiring, and onboarding references. The generated pack must not contain internal Program archives, completed internal ExecPlans, release evidence, local paths, secrets, or hidden install hooks. The generated package scripts must point to files that exist in the materialized repo.

### Test Commands

Run these commands from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run --cwd packages/codebase-compiler test -- tests/repo-generation.test.ts tests/review-download-zip.test.ts tests/customer-safe-snapshot-contract.test.ts tests/codebase-renderers.test.ts
    Passed. Test Files 4 passed; Tests 16 passed.

    bun run --cwd packages/codebase-compiler typecheck
    Passed.

    bun run --cwd packages/codebase-compiler lint
    Passed.

    bun run --cwd packages/codebase-compiler format:check
    Passed.

    bun codex-scripts/check-generated-operating-pack.mjs
    Passed. The generated `bun run agentic:check` command reported `Program packet ok` and `ExecPlans ok`.

    bun run format
    Passed.

    bun lint
    Passed.

    bun typecheck
    Passed and built the Next.js route manifest.

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-05-generated-repo-operating-pack.md
    Passed.

    bun run programs:lint
    Passed.

    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-05-generated-repo-operating-pack.md docs/programs/active/2026-05-02-customer-agentic-operating-system
    Passed.

    git diff --check
    Passed.

## Idempotence and Recovery

Generated operating-pack files must be deterministic for the same project definition. If a generated script references a missing file, add the file or remove the script before continuing. If a test shows internal planning history leaking into the generated repo, remove the renderer or trace path that caused the leak and add a regression assertion for the forbidden path.

## Artifacts and Notes

The owning Program is `docs/programs/active/2026-05-02-customer-agentic-operating-system/program.md`.

The slice builds on `docs/exec-plans/completed/2026-05-02-reconcile-customer-agentic-source-contract.md`.

The generated repo output is checked through `packages/codebase-compiler/tests/repo-generation.test.ts`, `packages/codebase-compiler/tests/review-download-zip.test.ts`, and `packages/codebase-compiler/tests/customer-safe-snapshot-contract.test.ts`.

## Interfaces and Dependencies

This plan depends on `packages/codebase-compiler/AGENTS.md`, `docs/programs/PROGRAMS.md`, `docs/exec-plans/PLANS.md`, `packages/codebase-compiler/src/repo-generation/render-template-overrides.ts`, `packages/codebase-compiler/src/repo-generation/render-generalized-starter-files.ts`, `packages/codebase-compiler/src/repo-generation/render-starter-project-onboarding.ts`, `packages/codebase-compiler/src/repo-generation/render-starter-skills.ts`, `packages/codebase-compiler/src/repo-generation/starter-root-package-json.ts`, `packages/codebase-compiler/src/repo-generation/customer-safe-snapshot-contract.ts`, `packages/codebase-compiler/src/repo-generation/repo-download-source-contract.ts`, and materialized snapshot tests.
