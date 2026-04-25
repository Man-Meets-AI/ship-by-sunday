# Codex Release Policy

Use this file before GitHub-facing work in this repository.

## Branch Targets

- Feature work targets `dev`.
- Normal production release PRs promote `dev` into `main`.
- P0 or P1 hotfixes branch from `main`, land on `main`, and then merge or cherry-pick back into `dev`.
- Stable release tags use `vMAJOR.MINOR.PATCH` and must match `release.json`.

## Proof

Use source-level proof first:

- `bun run lint`
- `bun run typecheck`
- focused unit, integration, or integration-ui tests for the touched surface

Local git hooks are not repository enforcement. Use focused local checks before pushing, but treat PR CI `static` and `integration` as the durable merge gates. Temporary `browser-smoke` and `cli` contexts are compatibility shims while branch protection catches up.

Use release-owned hosted proof when the change touches auth, entitlement, checkout, billing, deployment, release metadata, or production proof:

- `bun run release:proof -- --proof=default_ship`
- `QA_ALLOW_BILLING_INTEGRATION=1 bun run release:proof -- --proof=billing_integration`
- dry-run variants are acceptable for local planning and PR description evidence

Do not use retired commands from the old QA, helper, or shallow browser proof systems as current proof.

## Review

Before trusting a release PR into `main`, use the repo review prompt from `AGENTS.md` against the PR base branch. Findings should focus on real bugs, regressions, missing tests, security issues, and incorrect assumptions.

## Boundaries

Do not mutate live branch protection, tag rulesets, GitHub repository settings, or remote release policy unless Parker explicitly asks for that operation.

Do not invent a new release lane. Detailed release policy lives in `docs/release-workflow.md`.
