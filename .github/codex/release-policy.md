# Codex Release Policy

Use this file before GitHub-facing work in this repository.

## Branch Targets

- Feature work branches from `main` and opens pull requests into `main`.
- `main` is the single integration and production branch.
- The old shared `dev` release-candidate branch is retired. Do not open `dev -> main` release pull requests.
- Stable release tags use `vMAJOR.MINOR.PATCH` and must match `release.json`.

## Proof

Use source-level proof first:

- `bun run lint`
- `bun run typecheck`
- focused unit, contract, integration, or integration-ui tests for the touched surface

Local git hooks are not repository enforcement. Use focused local checks before pushing, but treat PR CI `static` and `integration` as the durable merge gates.

Use release-owned hosted proof when the change touches auth, entitlement, checkout, billing, deployment, release metadata, or production proof:

- `bun run release:proof -- --proof=default_ship`
- `QA_ALLOW_BILLING_INTEGRATION=1 bun run release:proof -- --proof=billing_integration`
- `QA_ALLOW_BILLING_INTEGRATION=1 bun run release:proof -- --proof=billing_integration --offer=workers` for Workers-specific billing proof
- dry-run variants are acceptable for local planning and PR description evidence

Use release identity proof before publishing or validating a tag:

- `bun run release:manifest:check`
- `bun run release:evidence:build`

Do not use retired `dev` release-candidate commands, snapshot fallback commands, or old release-intake exports as current proof.

## Review

Review normal pull requests against `main`. Findings should focus on real bugs, regressions, missing tests, security issues, and incorrect assumptions.

## Boundaries

Do not mutate live branch protection, tag rulesets, GitHub repository settings, Vercel aliases, or remote release policy unless Parker explicitly asks for that operation.

Do not invent a new release lane. Detailed release policy lives in `docs/release-workflow.md`.
