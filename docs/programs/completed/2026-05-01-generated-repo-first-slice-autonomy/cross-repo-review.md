# Generated Repo Autonomy Cross-Repo Review

## Review Scope

This review pressure-tests the Program against the repo contracts that govern generated customer repos. The relevant surfaces are root `AGENTS.md`, `docs/programs/PROGRAMS.md`, `docs/exec-plans/PLANS.md`, `packages/codebase-compiler/AGENTS.md`, `packages/codebase-compiler/src/codebases/render-build-codebase.ts`, repo-generation materialization, and compiler tests.

## Confirmed Fit

The Program belongs under `docs/programs/active/` because the roadmap spans several child ExecPlans and needs initiative-level truth between slices.

The first slice belongs in `packages/codebase-compiler` because the generated Build Pack is emitted from compiler renderers and materialized into the customer-safe repo snapshot.

The first slice can derive from existing facts. The canonical project definition already has next-slice, scope, acceptance, validation, demo, risks, dependencies, open questions, proof sources, and placeholder-friendly fields.

## Risks Caught

Do not make placeholder-friendly facts block generation. They should appear as readiness warnings or customer-input blockers for production claims.

Do not claim autonomous readiness after the first slice. The clean-room replay proof is a later Program slice.

Do not edit generated mirrors in the first slice. The change belongs to compiler source and compiler-owned tests.

Do not leave unknown validation steps as shell comments. Typed `blocked` entries are safer than a fake runnable code block.

## Review Verdict

The first child ExecPlan is correctly scoped if it only adds the readiness model, readiness document generation, handoff link, typed validation entries, and focused compiler tests.
