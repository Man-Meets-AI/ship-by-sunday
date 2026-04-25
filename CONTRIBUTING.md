# Contributing

Ship by Sunday ships through short-lived branches into `dev`, then promotes reviewed release candidates from `dev` into `main`.

Before changing files, read `AGENTS.md` and the nearest nested instruction file for the surface you are touching. For release, auth, checkout, entitlement, browser proof, or ship-readiness work, also read `docs/release-workflow.md`.

## Branches And Pull Requests

- Branch from the current `dev` for normal feature work.
- Keep the diff scoped to one reviewable change.
- Use conventional commit messages when committing.
- Open feature PRs into `dev`.
- Use the hotfix path from `main` only for P0 or P1 production incidents, then merge or cherry-pick the fix back into `dev`.

## Local Checks

Run the narrowest relevant checks first, then broaden when the change affects shared contracts.

Useful defaults:

- `bun run format`
- `bun lint`
- `bun typecheck`
- focused unit, integration, compiler, release, or markdown checks for the touched surface

Local git hooks are not repository enforcement. PR CI and the release proof workflows are the durable gates.

## Pull Request Notes

Include what changed, why it changed, and the exact validation you ran. If a check could not run, say why. Update docs, generated mirrors, ExecPlans, or release notes when the change affects durable behavior, commands, public docs, generated starter output, or operator workflow.
