# Cross-Repo Review

This Program is Ship by Sunday-local and now uses the repository's checked-in Program contract.

## Ship By Sunday Surfaces

The initiative touches Ship by Sunday application code, release scripts, QA evidence, docs, and ExecPlans. Primary surfaces include:

- `apps/web/`
- `apps/web/convex/`
- `apps/web/features/`
- `packages/blueprint-compiler/`
- `qa/`
- `docs/`
- `docs/exec-plans/`

## Program Contract Surfaces

The durable Program surfaces are `docs/programs/PROGRAMS.md`, `docs/programs/README.md`, this active Program packet, and Program-linked child ExecPlans.

Ship by Sunday now ships `bun run programs:lint` for Program packets. Child ExecPlans remain validated by this repository's `plans:lint` and focused implementation checks.

## Cross-Repo Risk

The biggest risk is treating Program validation as implementation proof. Program provenance belongs in paired `program_id` and `planning_brief` frontmatter, but every child ExecPlan still needs its own focused validation path.
