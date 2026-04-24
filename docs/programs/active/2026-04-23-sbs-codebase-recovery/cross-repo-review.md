# Cross-Repo Review

This Program is Ship by Sunday-local, but it borrows the Program packet syntax from the sibling Worker repository.

## Ship By Sunday Surfaces

The initiative touches Ship by Sunday application code, release scripts, QA evidence, docs, and ExecPlans. Primary surfaces include:

- `apps/web/`
- `apps/web/convex/`
- `apps/web/features/`
- `packages/blueprint-compiler/`
- `qa/`
- `docs/`
- `docs/exec-plans/`

## Worker Surfaces

Worker was used only as the syntax source for the Program packet model. The durable surfaces inspected were `docs/programs/PROGRAMS.md`, `docs/programs/README.md`, an active Program packet, and Program-linked child ExecPlans.

Ship by Sunday does not currently ship Worker's `bun run programs:lint` validator. This Program therefore follows the packet syntax, but only child ExecPlans are validated by this repository's `plans:lint` and `markdown:lint` commands.

## Cross-Repo Risk

The biggest risk is importing Worker process without respecting Ship by Sunday's stricter ExecPlan linter. Child ExecPlans in this repo must not add `program_id` or `planning_brief` frontmatter until the local linter allows those fields. Program provenance is recorded in the plan body instead.
